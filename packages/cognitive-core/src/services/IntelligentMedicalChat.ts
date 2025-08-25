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
      // Detectar patrones médicos automáticamente
      const medicalContext = this.extractMedicalContext(request.user_input)

      // Usar DecisionalMiddleware para inferencia inteligente
      const response = await callClaudeForDecision(
        'intelligent_medical_chat',
        this.buildInferentialPrompt(request, medicalContext),
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
        return this.createFallbackResponse(request.user_input, medicalContext)
      }

      return response.decision as IntelligentChatResponse
    } catch (error) {
      console.error('Error en chat inteligente:', error)
      return this.createFallbackResponse(request.user_input)
    }
  }

  /**
   * Extrae contexto médico básico sin validación estricta
   */
  private extractMedicalContext(input: string): any {
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
  private buildInferentialPrompt(request: ChatAnalysisRequest, medicalContext: any): string {
    const hasHistory = request.conversation_history && request.conversation_history.length > 0
    const historyContext = hasHistory
      ? `\n\nCONTEXTO DE CONVERSACIÓN PREVIA:\n${request.conversation_history
          .slice(-3)
          .map(msg => `${msg.type}: ${msg.content}`)
          .join('\n')}`
      : ''

    return `Eres un ANIMAL PARLANTE MÉDICO INTELIGENTE que NUNCA rechaza pacientes por datos incompletos.

FILOSOFÍA: Como MAI-DxO de Microsoft, tu trabajo es INFERIR inteligentemente y AYUDAR inmediatamente, no pedir más datos.

INPUT DEL USUARIO: "${request.user_input}"
${historyContext}

CONTEXTO DETECTADO AUTOMÁTICAMENTE:
- Síntomas detectados: ${medicalContext.has_symptoms}
- Demografía presente: ${medicalContext.has_demographics}  
- Timeline presente: ${medicalContext.has_timeline}
- Indicadores de urgencia: ${medicalContext.urgency_indicators.join(', ') || 'ninguno'}
- Especialidad sugerida: ${medicalContext.specialty_indicators.join(', ') || 'medicina general'}

TU MISIÓN:
1. SALUDA al "Doctor Edmund" de forma cálida y profesional
2. RECONOCE lo que mencionó sin juzgar la completitud
3. INFIERE inteligentemente lo que más probablemente está ocurriendo
4. PROPORCIONA valor inmediato con tus inferencias
5. PREGUNTA confirmación simple (SÍ/NO) sobre tus inferencias
6. OFRECE próximos pasos útiles

FORMATO DE RESPUESTA OBLIGATORIO:
{
  "message": "🦁 Hola Doctor Edmund, [reconocimiento + inferencias + pregunta de confirmación]",
  "inferences": [
    {
      "id": "demographic_inference",
      "category": "demographic",
      "confidence": 0.75,
      "inference": "Paciente masculino adulto (35-55 años aproximadamente)",
      "evidence": ["patrón de síntomas", "contexto de presentación"],
      "needs_confirmation": true
    }
  ],
  "suggested_actions": ["Protocolo cardiovascular básico", "Evaluación de riesgo"],
  "confidence_level": "medium",
  "requires_user_input": true,
  "conversation_stage": "gathering"
}

REGLAS INQUEBRANTABLES:
- NUNCA digas "datos insuficientes" o "complete más información"
- SIEMPRE haz inferencias inteligentes basadas en patrones médicos
- SIEMPRE proporciona valor inmediato
- SIEMPRE pide confirmación simple de tus inferencias
- NUNCA hagas más de 3 inferencias por respuesta

RESPONDE SOLO CON EL JSON, SIN TEXTO ADICIONAL.`
  }

  /**
   * Crea respuesta de fallback que nunca falla
   */
  private createFallbackResponse(userInput: string, medicalContext?: any): IntelligentChatResponse {
    const hasSymptoms = medicalContext?.has_symptoms || /dolor|molestia|síntoma/i.test(userInput)
    const baseMessage = hasSymptoms
      ? '🦁 Hola Doctor Edmund, veo que mencionas síntomas médicos. Aunque mi sistema tuvo un pequeño problema, puedo ayudarte basándome en patrones comunes.'
      : '🦁 Hola Doctor Edmund, entiendo que tienes una consulta médica. Déjame ayudarte con lo que puedo inferir.'

    return {
      message: `${baseMessage} ¿Podrías confirmar si mis inferencias básicas van por buen camino?`,
      inferences: [
        {
          id: 'basic_medical_context',
          category: 'context',
          confidence: 0.6,
          inference: hasSymptoms
            ? 'Consulta médica con síntomas reportados'
            : 'Consulta médica general',
          evidence: ['patrón de entrada detectado'],
          needs_confirmation: true,
        },
      ],
      suggested_actions: ['Proporcionar más detalles específicos', 'Confirmar contexto inicial'],
      confidence_level: 'low',
      requires_user_input: true,
      conversation_stage: 'initial',
    }
  }
}
