// 🦁 Chat de Inferencia Médica Inteligente - Creado por Bernard Orozco
// Inspirado en MAI-DxO y la sabiduría de Aslan para salvar al Doctor Edmund

import { callDecisionEngine, callIndividualDecision } from './decisionalMiddleware'
import type { MedicalMessage } from '../store/medicalChatSlice'
import type { AppDispatch } from '../store/store'
import {
  addDashboardMessage,
  addAssistantMessage,
  completeExtraction,
  setExtractionError,
  setDashboardLoading,
  setAssistantLoading,
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
  private coreType: 'dashboard' | 'assistant'

  constructor(dispatch: AppDispatch, coreType: 'dashboard' | 'assistant' = 'dashboard') {
    this.dispatch = dispatch
    this.coreType = coreType
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
        this.dispatch(
          addDashboardMessage({
            content: '🦁 Hola Doctor Edmund, ¿podría proporcionarme datos del paciente?',
            type: 'assistant',
          })
        )
        this.dispatch(setDashboardLoading(false))
        return
      }

      // 🎯 ARQUITECTURA SECUENCIAL INTELIGENTE: Extractor → Chat solo lo faltante
      console.log('🔄 PASO 1: Ejecutando extractor para analizar datos disponibles...')

      // PASO 1: 🧬 Extractor analiza QUÉ datos tenemos y cuáles faltan (SIN CONTEXTO - función pura)
      const extractorResponse = await callIndividualDecision('medical_data_extractor', userInput)

      if (!extractorResponse.success) {
        console.warn('💥 Extractor falló, usando fallback básico')
        this.dispatch(
          addAssistantMessage({
            content: '🦁 Error temporal. ¿Podría repetir su consulta médica?',
            type: 'assistant',
          })
        )
        this.dispatch(setAssistantLoading(false))
        return
      }

      // 🔥 CRITICAL: Parse the extracted data correctly
      let extractedData = extractorResponse.decision
      
      console.log('🔍 [RAW EXTRACTOR] Raw decision type:', typeof extractedData)
      console.log('🔍 [RAW EXTRACTOR] Raw decision keys:', Object.keys(extractedData || {}))
      
      // If the decision has a 'content' field with JSON string, parse it
      if (extractedData && typeof extractedData === 'object' && extractedData.content) {
        console.log('🔍 [CONTENT FIELD] Raw content length:', extractedData.content?.length)
        console.log('🔍 [CONTENT FIELD] Content preview (first 200 chars):', extractedData.content?.substring(0, 200))
        console.log('🔍 [CONTENT FIELD] Content preview (last 200 chars):', extractedData.content?.substring(-200))
        
        try {
          // BRUTAL JSON CLEANING: Remove any non-JSON content
          let cleanContent = extractedData.content.trim()
          
          // Find JSON boundaries - look for first { and last }
          const firstBrace = cleanContent.indexOf('{')
          const lastBrace = cleanContent.lastIndexOf('}')
          
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            cleanContent = cleanContent.substring(firstBrace, lastBrace + 1)
            console.log('🔧 [CLEANING] Extracted pure JSON boundaries')
            console.log('🔧 [CLEANING] Clean content preview:', cleanContent.substring(0, 100) + '...')
          }
          
          extractedData = JSON.parse(cleanContent)
          console.log('🔧 [PARSED] Successfully parsed JSON from content field')
        } catch (error) {
          console.error('💥 [PARSE ERROR] Could not parse JSON from content:', error)
          console.error('💥 [PARSE ERROR] Failed content:', extractedData.content?.substring(0, 500))
          // Keep original data as fallback
        }
      }
      
      const completenessPercentage =
        extractedData.extraction_metadata?.overall_completeness_percentage || 0
      const missingCriticalFields = extractedData.extraction_metadata?.missing_critical_fields || []
      const isNOMCompliant = extractedData.extraction_metadata?.nom_compliant || false

      console.log('📊 Análisis de completitud:', {
        completeness: completenessPercentage,
        missing_fields: missingCriticalFields,
        nom_compliant: isNOMCompliant,
      })

      // PASO 2: Guardar datos extraídos en store
      console.log('🔍 [INTELLIGENT CHAT] About to dispatch completeExtraction with:', {
        demographics: extractedData.demographics,
        chief_complaint: extractedData.clinical_presentation?.chief_complaint,
        primary_symptoms: extractedData.clinical_presentation?.primary_symptoms,
        age_raw: extractedData.demographics?.patient_age_years,
        gender_raw: extractedData.demographics?.patient_gender,
        full_object_keys: Object.keys(extractedData),
        is_object: typeof extractedData === 'object'
      })
      this.dispatch(completeExtraction(extractedData))

      // PASO 3: 🦁 Doctor Edmund CON CONTINUIDAD - Usa el núcleo especificado
      console.log(`🔄 PASO 3: Doctor Edmund en núcleo ${this.coreType.toUpperCase()}...`)

      // 🧠 CONTEXTO ENRIQUECIDO: Pasar datos extraídos al chat
      const contextualInput = this.buildContextualPrompt(userInput, extractedData)

      const chatResponse = await callDecisionEngine(
        this.coreType,
        'intelligent_medical_chat',
        contextualInput,
        {
          persistContext: true,
          // Claude recibirá el contexto automáticamente del núcleo especificado + datos extraídos
        }
      )

      console.log(
        `🧠 [CONTEXTO] Núcleo: ${this.coreType}, Input: "${userInput.substring(0, 50)}..."`
      )

      if (chatResponse.success) {
        // 🛡️ EXTRACCIÓN BRUTAL DEL JSON ANIDADO
        const decision = chatResponse.decision as any
        let message: string = ''

        console.log('🔍 DEBUG decision type:', typeof decision)
        console.log('🔍 DEBUG decision sample:', JSON.stringify(decision).substring(0, 200) + '...')

        try {
          // El decision puede ser:
          // 1. Object con campo content: {content: "JSON_STRING", success: true}
          // 2. String JSON directo: "{"message": "...", ...}"
          // 3. Object ya parseado: {message: "...", ...}

          let jsonContent = ''

          if (typeof decision === 'object' && decision.content) {
            // Caso 1: Object con campo content
            jsonContent = decision.content
          } else if (typeof decision === 'string') {
            // Caso 2: String JSON directo
            jsonContent = decision
          } else if (typeof decision === 'object' && decision.message) {
            // Caso 3: Ya es el objeto final
            message = decision.message
            console.log('🎯 [DIRECT] Extracted message:', message)
          }

          // Si tenemos JSON string, parsearlo
          if (
            jsonContent &&
            typeof jsonContent === 'string' &&
            jsonContent.includes('"message":')
          ) {
            const parsed = JSON.parse(jsonContent)
            message = parsed.message || jsonContent
            console.log('🎯 [PARSED] Extracted message:', message)
          } else if (jsonContent && !message) {
            // Fallback: usar el contenido directo
            message = jsonContent
          }
        } catch (error) {
          console.warn('⚠️ Error parseando JSON anidado:', error)
          message = typeof decision === 'string' ? decision : JSON.stringify(decision)
        }

        // Fallback final
        if (!message || message.trim() === '') {
          message = await this.generateQuestionBasedOnMissingFields(
            missingCriticalFields,
            extractedData
          )
        }

        // Agregar respuesta del chat al store - NÚCLEO SEGÚN CONFIGURACIÓN
        // NOTA: No duplicamos en store porque callDecisionEngine ya maneja contexto internamente
        const addMessage = this.coreType === 'assistant' ? addAssistantMessage : addDashboardMessage
        this.dispatch(
          addMessage({
            content: message,
            type: 'assistant',
            metadata: {
              sectionType: completenessPercentage >= 80 ? 'diagnosis' : 'education',
            },
          })
        )

        console.log(`✅ Respuesta contextual guardada en núcleo ${this.coreType.toUpperCase()}`)
      } else {
        // Fallback: Generar pregunta contextual con Claude (SIN CONTEXTO - función pura)
        console.warn('⚠️ Chat falló, generando pregunta contextual desde extractor')
        const contextualQuestion = await this.generateQuestionBasedOnMissingFields(
          missingCriticalFields,
          extractedData
        )
        const addMessage = this.coreType === 'assistant' ? addAssistantMessage : addDashboardMessage
        this.dispatch(
          addMessage({
            content: contextualQuestion,
            type: 'assistant',
          })
        )
      }
    } catch (error) {
      console.error('💥 Error en chat inteligente:', error)
      this.dispatch(
        setExtractionError(error instanceof Error ? error.message : 'Error desconocido')
      )
      const addMessage = this.coreType === 'assistant' ? addAssistantMessage : addDashboardMessage
      this.dispatch(
        addMessage({
          content: '🦁 Error procesando consulta. ¿Podría intentar de nuevo?',
          type: 'assistant',
        })
      )
    } finally {
      const setLoading = this.coreType === 'assistant' ? setAssistantLoading : setDashboardLoading
      this.dispatch(setLoading(false))
    }
  }

  /**
   * 🧠 Construye prompt contextual con datos extraídos previamente
   */
  private buildContextualPrompt(userInput: string, extractedData: any): string {
    if (!extractedData) return userInput

    const context: string[] = []

    // Agregar datos demográficos conocidos
    if (
      extractedData.demographics?.patient_age_years &&
      extractedData.demographics.patient_age_years !== 'unknown'
    ) {
      context.push(`Edad: ${extractedData.demographics.patient_age_years} años`)
    }
    if (
      extractedData.demographics?.patient_gender &&
      extractedData.demographics.patient_gender !== 'unknown'
    ) {
      context.push(`Género: ${extractedData.demographics.patient_gender}`)
    }

    // Agregar síntomas conocidos
    if (
      extractedData.clinical_presentation?.chief_complaint &&
      extractedData.clinical_presentation.chief_complaint !== 'unknown'
    ) {
      context.push(`Síntoma principal: ${extractedData.clinical_presentation.chief_complaint}`)
    }

    // Agregar intensidad si está disponible
    if (
      extractedData.symptom_characteristics?.pain_intensity_scale &&
      extractedData.symptom_characteristics.pain_intensity_scale !== null
    ) {
      context.push(
        `Intensidad del dolor: ${extractedData.symptom_characteristics.pain_intensity_scale}/10`
      )
    }

    if (context.length === 0) return userInput

    return `DATOS EXTRAÍDOS PREVIAMENTE: ${context.join(', ')}\n\nNUEVO INPUT DEL USUARIO: ${userInput}\n\n[Usa la información previa para hacer preguntas inteligentes sin repetir datos ya conocidos]`
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
          instruction:
            'Genera UNA pregunta específica y directa para obtener los datos médicos faltantes más críticos. Máximo 25 palabras.',
          expected_response: 'Solo la pregunta, sin explicaciones adicionales',
        }
      )

      // Claude puede devolver la pregunta en varios formatos
      if (claudeResponse?.success && claudeResponse?.decision) {
        const decision = claudeResponse.decision as any
        return (
          decision.question ||
          decision.message ||
          decision.response ||
          decision.text_response ||
          JSON.stringify(decision)
        )
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
    if (
      extractedData.demographics?.patient_age_years &&
      extractedData.demographics.patient_age_years !== 'unknown'
    ) {
      context.push(`Edad: ${extractedData.demographics.patient_age_years} años`)
    }
    if (
      extractedData.demographics?.patient_gender &&
      extractedData.demographics.patient_gender !== 'unknown'
    ) {
      context.push(`Género: ${extractedData.demographics.patient_gender}`)
    }
    if (
      extractedData.clinical_presentation?.chief_complaint &&
      extractedData.clinical_presentation.chief_complaint !== 'unknown'
    ) {
      context.push(`Síntoma: ${extractedData.clinical_presentation.chief_complaint}`)
    }

    const contextStr =
      context.length > 0 ? `Datos confirmados: ${context.join(', ')}` : 'Caso inicial'
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
