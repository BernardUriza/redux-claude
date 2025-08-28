// 🦁 Chat de Inferencia Médica Inteligente - Creado por Bernard Orozco
// Inspirado en MAI-DxO y la sabiduría de Aslan para salvar al Doctor Edmund

import { callClaudeForDecision } from './decisionalMiddleware'
import type { MedicalMessage } from '../store/medicalChatSlice'
import type { AppDispatch } from '../store/store'
import { 
  addAssistantMessage, 
  completeExtraction, 
  setExtractionError,
  setAssistantLoading 
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
      this.dispatch(setAssistantLoading(true))
      
      if (!userInput || typeof userInput !== 'string') {
        console.warn('⚠️ Input inválido en processUserInput:', userInput)
        this.dispatch(addAssistantMessage({
          content: '🦁 Hola Doctor Edmund, ¿podría proporcionarme datos del paciente?',
          type: 'assistant'
        }))
        this.dispatch(setAssistantLoading(false))
        return
      }

      // 🎯 ARQUITECTURA SECUENCIAL INTELIGENTE: Extractor → Chat solo lo faltante
      console.log('🔄 PASO 1: Ejecutando extractor para analizar datos disponibles...')
      
      // PASO 1: 🧬 Extractor analiza QUÉ datos tenemos y cuáles faltan
      const extractorResponse = await this.callDecisionEngine('medical_data_extractor', userInput)

      if (!extractorResponse) {
        console.warn('💥 Extractor falló, usando fallback básico')
        this.dispatch(addAssistantMessage({
          content: '🦁 Error temporal. ¿Podría repetir su consulta médica?',
          type: 'assistant'
        }))
        this.dispatch(setAssistantLoading(false))
        return
      }

      const extractedData = extractorResponse.data || extractorResponse
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
      
      // PASO 3: 🦁 Doctor Edmund solo pregunta por lo que FALTA
      console.log('🔄 PASO 3: Doctor Edmund preguntando solo lo faltante...')
      
      const chatResponse = await this.callDecisionEngine('intelligent_medical_chat', userInput, {
        extracted_data: extractedData,
        missing_critical_fields: missingCriticalFields,
        completeness_percentage: completenessPercentage,
        instruction: 'Solo preguntar por campos faltantes específicos'
      })

      if (chatResponse) {
        // Agregar respuesta del chat al store - NÚCLEO ASSISTANT
        this.dispatch(addAssistantMessage({
          content: chatResponse.message || this.generateQuestionBasedOnMissingFields(missingCriticalFields),
          type: 'assistant',
          metadata: {
            sectionType: completenessPercentage >= 80 ? 'diagnosis' : 'education'
          }
        }))
        
        console.log('✅ Respuesta secuencial guardada en núcleo assistant')
      } else {
        // Fallback: Generar pregunta basada en campos faltantes
        console.warn('⚠️ Chat falló, generando pregunta desde análisis de extractor')
        this.dispatch(addAssistantMessage({
          content: this.generateQuestionBasedOnMissingFields(missingCriticalFields),
          type: 'assistant'
        }))
      }

    } catch (error) {
      console.error('💥 Error en chat inteligente:', error)
      this.dispatch(setExtractionError(error?.message || 'Error desconocido'))
      this.dispatch(addAssistantMessage({
        content: '🦁 Error procesando consulta. ¿Podría intentar de nuevo?',
        type: 'assistant'
      }))
    } finally {
      this.dispatch(setAssistantLoading(false))
    }
  }

  /**
   * DRY: Wrapper único para llamadas a Claude
   */
  private async callDecisionEngine(
    decisionType: 'intelligent_medical_chat' | 'medical_data_extractor',
    userInput: string,
    additionalContext: Record<string, any> = {}
  ): Promise<any> {
    try {
      const response = await callClaudeForDecision(
        decisionType,
        userInput,
        'claude',
        undefined,
        undefined,
        additionalContext
      )

      if (response.success) {
        return response.decision
      }
      
      console.warn(`⚠️ ${decisionType} failed:`, response.error || 'No error details')
      return null

    } catch (error) {
      console.error(`💥 Error en ${decisionType}:`, error)
      return null
    }
  }

  /**
   * Genera pregunta inteligente basada en campos faltantes
   */
  private generateQuestionBasedOnMissingFields(missingFields: string[]): string {
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
