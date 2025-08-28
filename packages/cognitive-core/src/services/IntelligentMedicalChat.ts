// 🦁 Chat de Inferencia Médica Inteligente - Creado por Bernard Orozco
// Inspirado en MAI-DxO y la sabiduría de Aslan para salvar al Doctor Edmund

import { callDecisionEngine, callIndividualDecision } from './decisionalMiddleware'
import type { MedicalMessage } from '../store/medicalChatSlice'
import type { AppDispatch } from '../store/store'
import { 
  addDashboardMessage, 
  completeExtraction, 
  setExtractionError,
  setDashboardLoading 
} from '../store/medicalChatSlice'

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
  // 🧬 Metadata enriquecida desde extractor (arquitectura complementaria)
  extraction_metadata?: {
    completeness_percentage: number
    nom_compliant: boolean
    ready_for_soap: boolean
    extracted_data: any
  }
}

export interface ChatAnalysisRequest {
  user_input: string
  conversation_history: MedicalMessage[]
  previous_inferences?: MedicalInference[]
}

export class IntelligentMedicalChat {
  private dispatch: AppDispatch

  constructor(dispatch: AppDispatch) {
    this.dispatch = dispatch
  }

  /**
   * Procesa input del usuario usando Redux store - sin returns innecesarios
   * Toda la data va al store, no devuelve nada
   */
  async processUserInput(userInput: string): Promise<void> {
    try {
      this.dispatch(setDashboardLoading(true))
      
      if (!userInput || typeof userInput !== 'string') {
        console.warn('⚠️ Input inválido en processUserInput:', userInput)
        this.dispatch(addDashboardMessage({
          content: '🦁 Hola Doctor Edmund, ¿podría proporcionarme datos del paciente?',
          type: 'assistant'
        }))
        this.dispatch(setDashboardLoading(false))
        return
      }

      // 🎯 ARQUITECTURA SECUENCIAL INTELIGENTE: Extractor → Chat solo lo faltante
      console.log('🔄 PASO 1: Ejecutando extractor para analizar datos disponibles...')
      
      // PASO 1: 🧬 Extractor analiza QUÉ datos tenemos y cuáles faltan (SIN CONTEXTO - función pura)
      const extractorResponse = await callIndividualDecision('medical_data_extractor', userInput)

      if (!extractorResponse.success) {
        console.warn('💥 Extractor falló, usando fallback básico')
        this.dispatch(addAssistantMessage({
          content: '🦁 Error temporal. ¿Podría repetir su consulta médica?',
          type: 'assistant'
        }))
        this.dispatch(setAssistantLoading(false))
        return
      }

      const extractedData = extractorResponse.decision
      const completenessPercentage = extractedData.extraction_metadata?.overall_completeness_percentage || 0
      const missingCriticalFields = extractedData.extraction_metadata?.missing_critical_fields || []
      const isNOMCompliant = extractedData.extraction_metadata?.nom_compliant || false

      console.log('📊 Análisis de completitud:', {
        completeness: completenessPercentage,
        missing_fields: missingCriticalFields,
        nom_compliant: isNOMCompliant
      })

      // PASO 2: Guardar datos extraídos en store
      this.dispatch(completeExtraction(extractedData))
      
      // PASO 3: 🦁 Doctor Edmund CON CONTINUIDAD - Usa DASHBOARD core (no assistant)
      console.log('🔄 PASO 3: Doctor Edmund preguntando con contexto...')
      
      const chatResponse = await callDecisionEngine('dashboard', 'intelligent_medical_chat', userInput, {
        persistContext: true,
        // Claude recibirá el contexto automáticamente del núcleo dashboard
      })

      if (chatResponse.success) {
        // Extraer mensaje de la respuesta de Claude
        const decision = chatResponse.decision as any
        const message = decision?.message || 
                       decision?.question || 
                       decision?.response || 
                       await this.generateQuestionBasedOnMissingFields(missingCriticalFields, extractedData)
        
        // Agregar respuesta del chat al store - NÚCLEO DASHBOARD (correcto)
        // NOTA: No duplicamos en store porque callDecisionEngine ya maneja contexto internamente
        this.dispatch(addDashboardMessage({
          content: message,
          type: 'assistant',
          metadata: {
            sectionType: completenessPercentage >= 80 ? 'diagnosis' : 'education'
          }
        }))
        
        console.log('✅ Respuesta contextual guardada en núcleo assistant')
      } else {
        // Fallback: Generar pregunta contextual con Claude (SIN CONTEXTO - función pura)
        console.warn('⚠️ Chat falló, generando pregunta contextual desde extractor')
        const contextualQuestion = await this.generateQuestionBasedOnMissingFields(missingCriticalFields, extractedData)
        this.dispatch(addAssistantMessage({
          content: contextualQuestion,
          type: 'assistant'
        }))
      }

    } catch (error) {
      console.error('💥 Error en chat inteligente:', error)
      this.dispatch(setExtractionError(error instanceof Error ? error.message : 'Error desconocido'))
      this.dispatch(addAssistantMessage({
        content: '🦁 Error procesando consulta. ¿Podría intentar de nuevo?',
        type: 'assistant'
      }))
    } finally {
      this.dispatch(setAssistantLoading(false))
    }
  }


  /**
   * Genera pregunta inteligente usando Claude - combinable y contextual
   */
  private async generateQuestionBasedOnMissingFields(
    missingFields: string[], 
    extractedData?: any
  ): Promise<string> {
    try {
      // 🧠 Contexto para Claude basado en datos ya extraídos
      const context = this.buildContextForQuestion(extractedData, missingFields)
      
      // 🧠 Usar callIndividualDecision para generar preguntas (función pura - 2+2=4)
      const claudeResponse = await callIndividualDecision(
        'intelligent_medical_chat',
        `Genera una pregunta médica contextual para: ${missingFields.join(', ')}`,
        {
          action: 'generate_contextual_question',
          missing_fields: missingFields,
          extracted_context: context,
          persona: 'Doctor Edmund (León de Narnia) - profesional pero cálido',
          instruction: 'Genera UNA pregunta específica y directa para obtener los datos médicos faltantes más críticos. Máximo 25 palabras.',
          expected_response: 'Solo la pregunta, sin explicaciones adicionales'
        }
      )

      // Claude puede devolver la pregunta en varios formatos
      if (claudeResponse?.success && claudeResponse?.decision) {
        const decision = claudeResponse.decision as any
        return decision.question || decision.message || decision.response || decision.text_response || JSON.stringify(decision)
      }
      
      // Fallback inteligente si Claude falla
      return this.generateFallbackQuestion(missingFields)
      
    } catch (error) {
      console.warn('⚠️ Error generando pregunta con Claude, usando fallback:', error)
      return this.generateFallbackQuestion(missingFields)
    }
  }

  /**
   * Construye contexto médico para la pregunta
   */
  private buildContextForQuestion(extractedData: any, missingFields: string[]): string {
    if (!extractedData) return 'Caso médico inicial'
    
    const context: string[] = []
    
    // Datos ya identificados
    if (extractedData.demographics?.patient_age_years !== 'unknown') {
      context.push(`Edad: ${extractedData.demographics.patient_age_years} años`)
    }
    if (extractedData.demographics?.patient_gender !== 'unknown') {
      context.push(`Género: ${extractedData.demographics.patient_gender}`)
    }
    if (extractedData.clinical_presentation?.chief_complaint !== 'unknown') {
      context.push(`Síntoma: ${extractedData.clinical_presentation.chief_complaint}`)
    }
    
    const contextStr = context.length > 0 ? `Datos confirmados: ${context.join(', ')}` : 'Caso inicial'
    return `${contextStr}. Faltan: ${missingFields.join(', ')}`
  }

  /**
   * Pregunta fallback rápida - no depende de Claude
   */
  private generateFallbackQuestion(missingFields: string[]): string {
    if (missingFields.includes('patient_age_years') && missingFields.includes('patient_gender')) {
      return '🦁 Doctor Edmund, para continuar necesito la edad y género del paciente.'
    }
    
    if (missingFields.includes('patient_age_years')) {
      return '🦁 Doctor Edmund, ¿qué edad tiene el paciente?'
    }
    
    if (missingFields.includes('patient_gender')) {
      return '🦁 Doctor Edmund, ¿cuál es el género del paciente?'
    }
    
    if (missingFields.includes('chief_complaint')) {
      return '🦁 Doctor Edmund, ¿cuál es el síntoma principal que presenta el paciente?'
    }
    
    return '🦁 Doctor Edmund, ¿podría proporcionarme más detalles del caso médico?'
  }

}
