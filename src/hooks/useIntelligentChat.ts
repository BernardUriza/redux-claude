// 🤖 Hook para Chat Inteligente Multinúcleo
// Creado por Bernard Orozco - Usa store separado del chat principal

import { useDispatch, useSelector } from 'react-redux'
import { useCallback, useMemo } from 'react'
import type { RootState } from '../../packages/cognitive-core/src/store/store'
import {
  addIntelligentMessage,
  updateIntelligentMessage,
  clearIntelligentMessages,
  setIntelligentLoading,
  updatePatientInference,
  updateInferenceFromMessage,
  resetInferences,
  type IntelligentMessage,
  type PatientInference,
} from '../../packages/cognitive-core/src/store/intelligentChatSlice'

export interface UseIntelligentChatReturn {
  // Estado
  messages: IntelligentMessage[]
  isLoading: boolean
  currentInferences: PatientInference[]
  sessionId: string

  // Acciones
  addUserMessage: (content: string) => void
  addAssistantMessage: (content: string, confidence?: number) => void
  clearMessages: () => void
  updateInference: (id: string, value: string | number, confidence?: number) => void
  processMessageInferences: (message: string) => void
  setLoading: (loading: boolean) => void
}

/**
 * Hook para manejo del chat inteligente con store multinúcleo
 * Estado completamente separado del chat principal
 */
export const useIntelligentChat = (): UseIntelligentChatReturn => {
  const dispatch = useDispatch()

  // Selector para el núcleo de chat inteligente
  const { messages, isLoading, currentInferences, sessionId } = useSelector(
    (state: RootState) => state.intelligentChat
  )

  // Acciones memoizadas
  const addUserMessage = useCallback(
    (content: string) => {
      dispatch(
        addIntelligentMessage({
          type: 'user',
          content,
          metadata: {
            sessionId,
            inferenceType: 'diagnosis',
          },
        })
      )

      // Procesar inferencias automáticamente del mensaje del usuario
      dispatch(updateInferenceFromMessage(content))
    },
    [dispatch, sessionId]
  )

  const addAssistantMessage = useCallback(
    (content: string, confidence?: number) => {
      dispatch(
        addIntelligentMessage({
          type: 'assistant',
          content,
          confidence,
          metadata: {
            sessionId,
            inferenceType: 'diagnosis',
          },
        })
      )
    },
    [dispatch, sessionId]
  )

  const clearMessages = useCallback(() => {
    dispatch(clearIntelligentMessages())
  }, [dispatch])

  const updateInference = useCallback(
    (id: string, value: string | number, confidence?: number) => {
      dispatch(updatePatientInference({ id, value, confidence }))
    },
    [dispatch]
  )

  const processMessageInferences = useCallback(
    (message: string) => {
      dispatch(updateInferenceFromMessage(message))
    },
    [dispatch]
  )

  const setLoading = useCallback(
    (loading: boolean) => {
      dispatch(setIntelligentLoading(loading))
    },
    [dispatch]
  )

  // Retorno memoizado
  return useMemo(
    () => ({
      messages,
      isLoading,
      currentInferences,
      sessionId,
      addUserMessage,
      addAssistantMessage,
      clearMessages,
      updateInference,
      processMessageInferences,
      setLoading,
    }),
    [
      messages,
      isLoading,
      currentInferences,
      sessionId,
      addUserMessage,
      addAssistantMessage,
      clearMessages,
      updateInference,
      processMessageInferences,
      setLoading,
    ]
  )
}

export default useIntelligentChat
