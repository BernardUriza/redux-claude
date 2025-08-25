// 🧠 Hook Multinúcleo Evolucionado - Creado por Bernard Orozco
// Acceso inteligente a los diferentes núcleos del chat médico

import { useDispatch, useSelector } from 'react-redux'
import { useCallback } from 'react'
import type { RootState } from '../../packages/cognitive-core/src/store/store'
import {
  addDashboardMessage,
  addAssistantMessage,
  addInferenceMessage,
  setDashboardLoading,
  setAssistantLoading,
  clearDashboardMessages,
  clearAssistantMessages,
  startNewSession,
  setError,
  clearError
} from '../../packages/cognitive-core/src/store/medicalChatSlice'

export type CoreType = 'dashboard' | 'assistant' | 'inference'

interface UseMultinucleusChatOptions {
  core: CoreType
}

/**
 * 🧠 Hook Multinúcleo para acceder a diferentes núcleos de chat
 * Cada componente especifica qué núcleo necesita
 */
export const useMultinucleusChat = ({ core }: UseMultinucleusChatOptions) => {
  const dispatch = useDispatch()
  
  // Selector específico por núcleo
  const coreState = useSelector((state: RootState) => 
    state.medicalChat.cores[core]
  )
  
  const sharedState = useSelector((state: RootState) => 
    state.medicalChat.sharedState
  )
  
  // Acciones específicas por núcleo
  const addMessage = useCallback((content: string, type: 'user' | 'assistant') => {
    const messagePayload = { content, type }
    
    switch(core) {
      case 'dashboard':
        dispatch(addDashboardMessage(messagePayload))
        break
      case 'assistant':
        dispatch(addAssistantMessage(messagePayload))
        break
      case 'inference':
        dispatch(addInferenceMessage(messagePayload))
        break
    }
  }, [dispatch, core])
  
  const setLoading = useCallback((loading: boolean) => {
    switch(core) {
      case 'dashboard':
        dispatch(setDashboardLoading(loading))
        break
      case 'assistant':
        dispatch(setAssistantLoading(loading))
        break
      // inference no tiene setLoading específico por ahora
    }
  }, [dispatch, core])
  
  const clearMessages = useCallback(() => {
    switch(core) {
      case 'dashboard':
        dispatch(clearDashboardMessages())
        break
      case 'assistant':
        dispatch(clearAssistantMessages())
        break
      // inference no tiene clear específico por ahora
    }
  }, [dispatch, core])
  
  const addUserMessage = useCallback((content: string) => {
    addMessage(content, 'user')
  }, [addMessage])
  
  const addAssistantMessageToCore = useCallback((content: string) => {
    addMessage(content, 'assistant')
  }, [addMessage])
  
  return {
    // Estado del núcleo específico
    messages: coreState.messages,
    isLoading: coreState.isLoading,
    lastActivity: coreState.lastActivity,
    sessionId: coreState.sessionId,
    
    // Estado compartido
    currentSession: sharedState.currentSession,
    error: sharedState.error,
    
    // Acciones del núcleo
    addUserMessage,
    addAssistantMessage: addAssistantMessageToCore,
    setLoading,
    clearMessages,
    
    // Acciones globales
    startNewSession: (patientId?: string) => dispatch(startNewSession({ patientId })),
    setError: (error: string) => dispatch(setError(error)),
    clearError: () => dispatch(clearError()),
    
    // Metadatos
    coreName: core,
    messageCount: coreState.messages.length
  }
}

// 🔥 EXPORTS ESPECÍFICOS PARA CADA NÚCLEO (conveniencia)
export const useDashboardChat = () => useMultinucleusChat({ core: 'dashboard' })
export const useAssistantChat = () => useMultinucleusChat({ core: 'assistant' })
export const useInferenceChat = () => useMultinucleusChat({ core: 'inference' })

export default useMultinucleusChat