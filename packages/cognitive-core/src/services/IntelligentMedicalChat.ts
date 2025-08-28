// 🦁 Chat de Inferencia Médica Inteligente - Creado por Bernard Orozco
// Inspirado en MAI-DxO y la sabiduría de Aslan para salvar al Doctor Edmund

import { callClaudeForDecision } from './decisionalMiddleware'
import type { MedicalMessage } from '../store/medicalChatSlice'

export interface MedicalInference {
  id: string
  category: 'demographic' | 'symptom' | 'specialty' | 'urgency' | 'context'
  confidence: number
  inference: string
  evidence: string[]
  needs_confirmation: boolean
}

export interface IntelligentChatResponse {
  message: string
  inferences: MedicalInference[]
  suggested_actions: string[]
  confidence_level: 'low' | 'medium' | 'high'
  requires_user_input: boolean
  conversation_stage: 'initial' | 'gathering' | 'analyzing' | 'concluding'
}

export interface ChatAnalysisRequest {
  user_input: string
  conversation_history: MedicalMessage[]
  previous_inferences?: MedicalInference[]
}

export class IntelligentMedicalChat {
  /**
   * Procesa input del usuario con inferencia inteligente tipo MAI-DxO
   * Nunca rechaza - siempre ayuda con lo que tiene
   */
  async processUserInput(request: ChatAnalysisRequest): Promise<IntelligentChatResponse> {
    try {
      // 🛡️ VALIDACIÓN DE REQUEST - Prevenir errores undefined
      const userInput = request?.user_input || ''
      
      if (!userInput || typeof userInput !== 'string') {
        console.warn('⚠️ Input inválido en processUserInput:', request)
        return this.createFallbackResponse('Sin input válido')
      }

      // Detectar patrones médicos automáticamente
      const medicalContext = this.extractMedicalContext(userInput)

      // Usar DecisionalMiddleware para inferencia inteligente
      const response = await callClaudeForDecision(
        'intelligent_medical_chat',
        this.buildInferentialPrompt(request, medicalContext, userInput),
        'claude',
        undefined,
        undefined,
        {
          conversation_history: request.conversation_history,
          previous_inferences: request.previous_inferences,
          medical_context: medicalContext,
        }
      )

      if (!response.success) {
        // Fallback: Nunca fallar completamente
        console.warn('⚠️ Claude decision failed:', response.error || 'No error details')
        return this.createFallbackResponse(userInput, medicalContext)
      }

      return response.decision as IntelligentChatResponse
    } catch (error) {
      console.error('💥 Error en chat inteligente (cayendo a fallback):', error)
      const userInput = request?.user_input || ''
      return this.createFallbackResponse(userInput)
    }
  }

  /**
   * Extrae contexto médico básico sin validación estricta
   */
  private extractMedicalContext(input: string): any {
    // 🛡️ VALIDACIÓN DE PARÁMETROS - Prevenir errores undefined
    if (!input || typeof input !== 'string') {
      return {
        has_symptoms: false,
        has_demographics: false,
        has_timeline: false,
        has_medical_terms: false,
        urgency_indicators: [],
        specialty_indicators: [],
      }
    }

    const context: any = {
      has_symptoms: false,
      has_demographics: false,
      has_timeline: false,
      has_medical_terms: false,
      urgency_indicators: [],
      specialty_indicators: [],
    }

    const cleanInput = input.toLowerCase()

    // Detectar síntomas (no exigir formato perfecto)
    const symptomPatterns = [
      /dolor|molestia|ache|pain/i,
      /fiebre|fever|calentura/i,
      /náusea|vómito|nausea/i,
      /mareo|dizzy|vertigo/i,
      /cansancio|fatiga|tired/i,
    ]
    context.has_symptoms = symptomPatterns.some(pattern => pattern.test(cleanInput))

    // Detectar demografía (inferir si no está explícita)
    context.has_demographics =
      /\d+\s*(años?|year|age)|masculino|femenino|male|female|hombre|mujer/i.test(cleanInput)

    // Detectar timeline
    context.has_timeline = /desde|hace|during|for|yesterday|hoy|ayer|semana|week/i.test(cleanInput)

    // Detectar términos médicos
    context.has_medical_terms =
      /paciente|patient|síntoma|symptom|diagnóstico|diagnosis|medicamento|medication/i.test(
        cleanInput
      )

    // Detectar urgencia
    if (
      /severo|severe|intenso|intense|insoportable|unbearable|emergencia|emergency/i.test(cleanInput)
    ) {
      context.urgency_indicators.push('high_intensity')
    }
    if (/pecho|chest|corazón|heart|respirar|breathe/i.test(cleanInput)) {
      context.urgency_indicators.push('cardiovascular')
    }

    // Detectar especialidad probable
    if (/pecho|corazón|presión|chest|heart|pressure/i.test(cleanInput)) {
      context.specialty_indicators.push('cardiology')
    }
    if (/cabeza|dolor de cabeza|migraine|headache/i.test(cleanInput)) {
      context.specialty_indicators.push('neurology')
    }
    if (/estómago|abdominal|digestive|gastro/i.test(cleanInput)) {
      context.specialty_indicators.push('gastroenterology')
    }

    return context
  }

  /**
   * Construye prompt para inferencia inteligente estilo MAI-DxO
   */
  private buildInferentialPrompt(request: ChatAnalysisRequest, medicalContext: any, userInput: string): string {
    const hasHistory = request.conversation_history && request.conversation_history.length > 0
    const historyContext = hasHistory
      ? `\n\nCONTEXTO DE CONVERSACIÓN PREVIA:\n${request.conversation_history
          .slice(-3)
          .map(msg => `${msg.type}: ${msg.content}`)
          .join('\n')}`
      : ''

    return `Eres un ASISTENTE MÉDICO INTELIGENTE como MAI-DxO que ANALIZA CONTEXTO COMPLETO y GUÍA al Doctor Edmund hacia el diagnóstico SOAP.

FILOSOFÍA CLAVE: Tu trabajo es COMBINAR toda la información de la conversación para hacer inferencias inteligentes y detectar cuándo tienes DATOS SUFICIENTES para proceder al SOAP.

INPUT ACTUAL: "${userInput}"
${historyContext}

CONTEXTO DETECTADO AUTOMÁTICAMENTE:
- Síntomas detectados: ${medicalContext.has_symptoms}
- Demografía presente: ${medicalContext.has_demographics}  
- Timeline presente: ${medicalContext.has_timeline}
- Indicadores de urgencia: ${medicalContext.urgency_indicators.join(', ') || 'ninguno'}
- Especialidad sugerida: ${medicalContext.specialty_indicators.join(', ') || 'medicina general'}

TU MISIÓN ESPECÍFICA:
1. ANALIZA TODA la conversación previa + input actual
2. COMBINA información dispersa (ej: "dolor en ojos" + "mujer 16 años" = paciente femenina adolescente con dolor ocular)
3. USA TERMINOLOGÍA MÉDICA apropiada (3 lustros = 15 años, ocular, torácico, etc.)
4. DETECTA cuando tienes: EDAD + GÉNERO + SÍNTOMA PRINCIPAL = ¡BÁSICO COMPLETO!
5. SOLICITA DETALLES CONTEXTUALES MÉDICOS IMPORTANTES:
   • Duración: ¿desde cuándo? (horas, días, semanas)
   • Intensidad: escala del 1-10
   • Características: punzante, sordo, pulsátil, constante
   • Factores: qué lo mejora/empeora, horarios
   • Síntomas asociados: náusea, visión borrosa, etc.
6. GUÍA al doctor hacia SOAP cuando tengas datos básicos + al menos 2 detalles contextuales

EJEMPLOS DE RESPUESTAS INTELIGENTES:
- Si tienes datos básicos completos: "🦁 Doctor Edmund, ¿le parece bien inferir que es una paciente femenina de 3 lustros (16 años) con dolor ocular? Para el análisis SOAP completo, sería útil conocer: ¿desde cuándo presenta el dolor? ¿intensidad del 1-10? ¿factores que lo agravan o alivian?"
- Si falta información básica: "🦁 Doctor Edmund, veo dolor ocular reportado. Necesito confirmar: edad, género del paciente, y sería valioso saber la duración y características del dolor."
- Si hay datos completos: "🦁 Doctor Edmund, tengo paciente femenina, 25 años, dolor ocular desde hace 2 días, intensidad 7/10. ¿Confirma estos datos para proceder al análisis SOAP?"

FORMATO DE RESPUESTA OBLIGATORIO:
{
  "message": "🦁 Doctor Edmund, [análisis inteligente del contexto completo + pregunta específica]",
  "inferences": [
    {
      "id": "demographic_complete",
      "category": "demographic",
      "confidence": 0.85,
      "inference": "Paciente femenina de 16 años con dolor ocular",
      "evidence": ["dolor en ojos mencionado previamente", "mujer 16 años confirmado"],
      "needs_confirmation": true
    },
    {
      "id": "contextual_details",
      "category": "context",
      "confidence": 0.70,
      "inference": "Se requieren detalles: duración, intensidad y características del dolor",
      "evidence": ["información básica completa", "faltan detalles contextuales"],
      "needs_confirmation": false
    }
  ],
  "suggested_actions": ["Solicitar duración del síntoma", "Preguntar intensidad 1-10", "Investigar factores agravantes/aliviantes"],
  "confidence_level": "high",
  "requires_user_input": true,
  "conversation_stage": "ready_for_soap"
}

REGLAS INQUEBRANTABLES:
- SIEMPRE combina información de TODA la conversación
- USA terminología médica profesional
- DETECTA cuándo tienes datos completos para SOAP
- NUNCA ignores información previa
- MÁXIMO 2 inferencias por respuesta

RESPONDE SOLO CON EL JSON, SIN TEXTO ADICIONAL.`
  }

  /**
   * Crea respuesta de fallback que nunca falla
   */
  private createFallbackResponse(userInput: string, medicalContext?: any): IntelligentChatResponse {
    // 🛡️ VALIDACIÓN ADICIONAL para fallback
    const safeUserInput = userInput || ''
    const hasSymptoms = medicalContext?.has_symptoms || /dolor|molestia|síntoma/i.test(safeUserInput)
    const baseMessage = hasSymptoms
      ? '🦁 Hola Doctor Edmund, veo que mencionas síntomas médicos. Aunque mi sistema tuvo un pequeño problema, puedo ayudarte basándome en patrones comunes.'
      : '🦁 Hola Doctor Edmund, entiendo que tienes una consulta médica. Déjame ayudarte con lo que puedo inferir.'

    return {
      message: `${baseMessage} ¿Podrías proporcionar más detalles específicos?`,
      inferences: [], // No generar inferencias genéricas de bajo valor
      suggested_actions: ['Proporcionar más detalles específicos', 'Incluir edad y género del paciente'],
      confidence_level: 'low',
      requires_user_input: true,
      conversation_stage: 'initial',
    }
  }
}
