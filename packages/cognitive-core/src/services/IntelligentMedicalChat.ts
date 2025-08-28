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

      // 🧠 DECISIÓN DINÁMICA: Si hay suficiente contexto, usar chat directo, sino extractor
      const hasContext = request.conversation_history && request.conversation_history.length > 0
      const hasPreviousInferences = request.previous_inferences && request.previous_inferences.length > 0
      
      // Usar intelligent_medical_chat si ya tenemos contexto médico previo
      if (hasContext && hasPreviousInferences) {
        const chatResponse = await this.callDecisionEngine('intelligent_medical_chat', userInput, request, {
          context: 'follow_up_conversation'
        })
        if (chatResponse) return chatResponse as IntelligentChatResponse
      }

      // Usar medical_data_extractor como fallback o primera extracción
      const extractorResponse = await this.callDecisionEngine('medical_data_extractor', userInput, request, {
        extractionMode: 'intelligent_medical_chat_context'
      })

      if (!extractorResponse) {
        return this.createFallbackResponse(userInput)
      }

      // Extraer datos y generar respuesta inteligente basada en los datos extraídos
      const extractedData = extractorResponse.data || {}
      return this.generateIntelligentResponse(userInput, extractedData, request)

    } catch (error) {
      console.error('💥 Error en chat inteligente (cayendo a fallback):', error)
      const userInput = request?.user_input || ''
      return this.createFallbackResponse(userInput)
    }
  }

  /**
   * DRY: Wrapper único para todas las llamadas a callClaudeForDecision
   */
  private async callDecisionEngine(
    decisionType: 'intelligent_medical_chat' | 'medical_data_extractor',
    userInput: string,
    request: ChatAnalysisRequest,
    additionalContext: Record<string, any> = {}
  ): Promise<any> {
    try {
      const response = await callClaudeForDecision(
        decisionType,
        userInput,
        'claude',
        undefined,
        undefined,
        {
          conversation_history: request.conversation_history,
          previous_inferences: request.previous_inferences,
          ...additionalContext
        }
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
   * Genera respuesta inteligente basada en datos médicos extraídos
   */
  private generateIntelligentResponse(userInput: string, extractedData: any, request: ChatAnalysisRequest): IntelligentChatResponse {
    const hasSymptoms = !!extractedData.clinical_presentation?.chief_complaint && extractedData.clinical_presentation.chief_complaint !== 'unknown'
    const hasDemographics = !!extractedData.demographics && (
      (extractedData.demographics.patient_age_years && extractedData.demographics.patient_age_years !== 'unknown') ||
      (extractedData.demographics.patient_gender && extractedData.demographics.patient_gender !== 'unknown')
    )
    const hasTimeline = !!extractedData.symptom_characteristics?.duration_description && extractedData.symptom_characteristics.duration_description !== 'unknown'

    // Crear inferencias basadas en datos extraídos
    const inferences: MedicalInference[] = []
    
    if (hasDemographics) {
      const age = extractedData.demographics.patient_age_years
      const gender = extractedData.demographics.patient_gender
      
      if (age && age !== 'unknown') {
        inferences.push({
          id: `demographic_age_${Date.now()}`,
          category: 'demographic',
          confidence: extractedData.demographics.confidence_demographic || 0.8,
          inference: `Paciente de ${age} años`,
          evidence: [`Edad mencionada: ${age}`],
          needs_confirmation: false
        })
      }
      
      if (gender && gender !== 'unknown') {
        inferences.push({
          id: `demographic_gender_${Date.now()}`,
          category: 'demographic', 
          confidence: extractedData.demographics.confidence_demographic || 0.8,
          inference: `Paciente ${gender}`,
          evidence: [`Género identificado: ${gender}`],
          needs_confirmation: false
        })
      }
    }

    if (hasSymptoms) {
      const chiefComplaint = extractedData.clinical_presentation.chief_complaint
      inferences.push({
        id: `symptom_primary_${Date.now()}`,
        category: 'symptom',
        confidence: extractedData.clinical_presentation.confidence_symptoms || 0.7,
        inference: `Síntoma principal: ${chiefComplaint}`,
        evidence: [`Síntoma reportado: ${chiefComplaint}`],
        needs_confirmation: false
      })
    }

    // Determinar etapa de conversación y acciones sugeridas
    const completenessPercentage = extractedData.extraction_metadata?.overall_completeness_percentage || 0
    const isReadyForSOAP = extractedData.extraction_metadata?.ready_for_soap_generation || false
    
    let conversationStage: 'initial' | 'gathering' | 'analyzing' | 'concluding'
    let suggestedActions: string[]
    let message: string

    if (completenessPercentage >= 80 && isReadyForSOAP) {
      conversationStage = 'concluding'
      suggestedActions = ['Generar prompt SOAP', 'Revisar datos recopilados']
      message = '🦁 Doctor Edmund, tengo información suficiente. Los datos están completos para generar un análisis SOAP.'
    } else if (completenessPercentage >= 50) {
      conversationStage = 'analyzing'
      suggestedActions = ['Solicitar detalles faltantes', 'Profundizar en síntomas']
      message = '🦁 Doctor Edmund, he registrado información importante. ¿Podría proporcionar más detalles específicos?'
    } else {
      conversationStage = 'gathering'
      suggestedActions = ['Solicitar edad y género', 'Identificar síntoma principal']
      message = '🦁 Doctor Edmund, entiendo su consulta médica. Para ayudarle mejor, ¿podría confirmarme la edad y género del paciente?'
    }

    return {
      message,
      inferences,
      suggested_actions: suggestedActions,
      confidence_level: completenessPercentage >= 80 ? 'high' : completenessPercentage >= 50 ? 'medium' : 'low',
      requires_user_input: !isReadyForSOAP,
      conversation_stage: conversationStage
    }
  }




  /**
   * Crea respuesta de fallback que nunca falla
   */
  private createFallbackResponse(userInput: string): IntelligentChatResponse {
    const safeUserInput = userInput || ''
    
    return {
      message: '🦁 Hola Doctor Edmund, entiendo que tienes una consulta médica. Para ayudarle mejor, ¿podría confirmarme la edad y género del paciente?',
      inferences: [],
      suggested_actions: ['Proporcionar edad del paciente', 'Especificar género', 'Describir síntoma principal'],
      confidence_level: 'low',
      requires_user_input: true,
      conversation_stage: 'initial',
    }
  }
}
