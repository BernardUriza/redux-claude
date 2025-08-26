// 🤖 Hook para Chat Inteligente Multinúcleo
// Creado por Bernard Orozco - Usa store separado del chat principal

import { useDispatch, useSelector } from 'react-redux'
import { useCallback, useMemo } from 'react'
import type { RootState } from '../../packages/cognitive-core/src/store/store'
import {
  addAssistantMessage,
  setAssistantLoading,
  type MedicalMessage,
} from '../../packages/cognitive-core/src/store/medicalChatSlice'

export interface UseIntelligentChatReturn {
  // Estado
  messages: MedicalMessage[]
  isLoading: boolean
  sessionId: string

  // Acciones
  addUserMessage: (content: string) => void
  addAssistantMessage: (content: string, confidence?: number) => void
  setLoading: (loading: boolean) => void
}

/**
 * Hook para manejo del chat inteligente con store multinúcleo
 * Estado completamente separado del chat principal
 */
export const useIntelligentChat = (): UseIntelligentChatReturn => {
  const dispatch = useDispatch()

  // Selector para el núcleo de chat asistente
  const { messages, isLoading, sessionId } = useSelector(
    (state: RootState) => state.medicalChat.cores.assistant
  )

  // Acciones memoizadas
  const addUserMessage = useCallback(
    (content: string) => {
      dispatch(
        addAssistantMessage({
          type: 'user',
          content,
          metadata: {
            sessionId,
            sectionType: 'diagnosis',
          },
        })
      )
    },
    [dispatch, sessionId]
  )

  const addAssistantMessageAction = useCallback(
    (content: string, confidence?: number) => {
      dispatch(
        addAssistantMessage({
          type: 'assistant',
          content,
          confidence,
          metadata: {
            sessionId,
            sectionType: 'diagnosis',
          },
        })
      )
    },
    [dispatch, sessionId]
  )

  const setLoadingAction = useCallback(
    (loading: boolean) => {
      dispatch(setAssistantLoading(loading))
    },
    [dispatch]
  )

  // Retorno memoizado
  return useMemo(
    () => ({
      messages,
      isLoading,
      sessionId,
      addUserMessage,
      addAssistantMessage: addAssistantMessageAction,
      setLoading: setLoadingAction,
    }),
    [messages, isLoading, sessionId, addUserMessage, addAssistantMessageAction, setLoadingAction]
  )
}

export default useIntelligentChat
