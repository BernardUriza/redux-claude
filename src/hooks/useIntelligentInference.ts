// 🤖 Hook para lógica de inferencias inteligentes - Principio de Abierto/Cerrado
// Creado por Bernard Orozco - Extensible para nuevos tipos de inferencia

import { useState, useCallback, useRef } from 'react'
import {
  IntelligentMedicalChat as IntelligentChatService,
  IntelligentChatResponse,
  MedicalInference,
  ChatAnalysisRequest,
} from '../../packages/cognitive-core/src/services/IntelligentMedicalChat'
import type {
  MedicalMessage,
  UrgencyLevel,
} from '../../packages/cognitive-core/src/store/medicalChatSlice'

export interface UseIntelligentInferenceReturn {
  // Estado
  currentResponse: IntelligentChatResponse | null
  processingInferences: boolean

  // Acciones
  processUserInput: (request: ChatAnalysisRequest) => Promise<IntelligentChatResponse>
  handleInferenceConfirmation: (inference: MedicalInference, confirmed: boolean) => InferenceResult
}

export interface InferenceResult {
  responseText: string
  urgencyLevel?: UrgencyLevel
  specialty?: string
  shouldUpdateMetrics: boolean
}

/**
 * Hook para manejo de inferencias médicas inteligentes
 * Aplica Principio de Abierto/Cerrado - extensible para nuevos tipos de inferencia
 */
export const useIntelligentInference = (): UseIntelligentInferenceReturn => {
  const [currentResponse, setCurrentResponse] = useState<IntelligentChatResponse | null>(null)
  const [processingInferences, setProcessingInferences] = useState(false)
  const intelligentChatService = useRef(new IntelligentChatService())

  const processUserInput = useCallback(
    async (request: ChatAnalysisRequest): Promise<IntelligentChatResponse> => {
      setProcessingInferences(true)

      try {
        const startTime = Date.now()

        const response = await intelligentChatService.current.processUserInput(request)
        const responseTime = Date.now() - startTime

        // Enriquecer respuesta con métricas de tiempo
        const enrichedResponse = {
          ...response,
          responseTime,
        }

        setCurrentResponse(enrichedResponse)
        return enrichedResponse
      } catch (error) {
        console.error('Error en inferencia:', error)

        // Fallback response - nunca fallar completamente
        const fallbackResponse: IntelligentChatResponse = {
          message:
            '🦁 He tenido un problema técnico, pero puedo ayudarte. ¿Podrías darme más detalles?',
          inferences: [
            {
              id: 'fallback_inference',
              category: 'context',
              confidence: 0.6,
              inference: 'Consulta médica con problema técnico',
              evidence: ['error de sistema'],
              needs_confirmation: false,
            },
          ],
          suggested_actions: ['Reintentar consulta', 'Proporcionar más detalles'],
          confidence_level: 'low',
          requires_user_input: true,
          conversation_stage: 'initial',
        }

        setCurrentResponse(fallbackResponse)
        return fallbackResponse
      } finally {
        setProcessingInferences(false)
      }
    },
    []
  )

  const handleInferenceConfirmation = useCallback(
    (inference: MedicalInference, confirmed: boolean): InferenceResult => {
      const result: InferenceResult = {
        responseText: confirmed
          ? `✅ Perfecto, mi inferencia sobre ${inference.category} era correcta. Continuemos con el análisis médico.`
          : `📝 Entiendo, me ayudas a aprender. ¿Podrías darme más detalles sobre ${inference.inference}?`,
        shouldUpdateMetrics: true,
      }

      // Detectar urgencia basada en la inferencia
      if (inference.category === 'urgency') {
        result.urgencyLevel =
          inference.confidence > 0.8 ? 'high' : inference.confidence > 0.6 ? 'medium' : 'low'
      }

      // Detectar especialidad
      if (inference.category === 'specialty' && confirmed) {
        result.specialty = inference.inference
      }

      return result
    },
    []
  )

  return {
    currentResponse,
    processingInferences,
    processUserInput,
    handleInferenceConfirmation,
  }
}
