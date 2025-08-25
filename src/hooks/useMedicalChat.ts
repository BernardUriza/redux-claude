// 🧠 Hook personalizado para lógica del Chat Médico - Principio de Responsabilidad Única
// Creado por Bernard Orozco - Separación de concerns Redux

import { useDispatch, useSelector } from 'react-redux'
import { useCallback, useMemo } from 'react'
import type { RootState } from '../../packages/cognitive-core/src/store/store'
import { 
  addMessage, 
  addInference, 
  updateUrgencyLevel, 
  addSpecialtyIdentified, 
  updateConversationStage, 
  updateIntelligentChatMetrics 
} from '../../packages/cognitive-core/src/store/medicalChatSlice'
import type { MedicalMessage, UrgencyLevel } from '../../packages/cognitive-core/src/store/medicalChatSlice'

export interface UseMedicalChatReturn {
  // Estado
  messages: MedicalMessage[]
  isLoading: boolean
  intelligentChatMetrics: any
  currentCase: any
  
  // Acciones
  addUserMessage: (content: string) => void
  addAssistantMessage: (content: string) => void
  confirmInference: (confirmed: boolean) => void
  setUrgencyLevel: (level: UrgencyLevel) => void
  addSpecialty: (specialty: string) => void
  setConversationStage: (stage: 'initial' | 'gathering' | 'analyzing' | 'concluding') => void
  updateMetrics: (metrics: Partial<any>) => void
}

/**
 * Hook para manejo del estado y acciones del Chat Médico
 * Aplica el Principio de Responsabilidad Única - solo maneja Redux
 */
export const useMedicalChat = (): UseMedicalChatReturn => {
  const dispatch = useDispatch()
  
  // Selectores memoizados para evitar re-renders innecesarios
  const { messages, isLoading, intelligentChatMetrics, currentCase } = useSelector(
    (state: RootState) => ({
      messages: state.medicalChat.messages,
      isLoading: state.medicalChat.isLoading,
      intelligentChatMetrics: state.medicalChat.intelligentChatMetrics,
      currentCase: state.medicalChat.currentCase
    })
  )
  
  // Acciones memoizadas para evitar recrear funciones en cada render
  const addUserMessage = useCallback((content: string) => {
    dispatch(addMessage({
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: Date.now()
    }))
  }, [dispatch])
  
  const addAssistantMessage = useCallback((content: string) => {
    dispatch(addMessage({
      id: Date.now().toString(),
      type: 'assistant',
      content,
      timestamp: Date.now()
    }))
  }, [dispatch])
  
  const confirmInference = useCallback((confirmed: boolean) => {
    dispatch(addInference({ confirmed }))
  }, [dispatch])
  
  const setUrgencyLevel = useCallback((level: UrgencyLevel) => {
    dispatch(updateUrgencyLevel(level))
  }, [dispatch])
  
  const addSpecialty = useCallback((specialty: string) => {
    dispatch(addSpecialtyIdentified(specialty))
  }, [dispatch])
  
  const setConversationStage = useCallback((stage: 'initial' | 'gathering' | 'analyzing' | 'concluding') => {
    dispatch(updateConversationStage(stage))
  }, [dispatch])
  
  const updateMetrics = useCallback((metrics: Partial<any>) => {
    dispatch(updateIntelligentChatMetrics(metrics))
  }, [dispatch])
  
  // Retorno memoizado
  return useMemo(() => ({
    messages,
    isLoading,
    intelligentChatMetrics,
    currentCase,
    addUserMessage,
    addAssistantMessage,
    confirmInference,
    setUrgencyLevel,
    addSpecialty,
    setConversationStage,
    updateMetrics
  }), [
    messages,
    isLoading, 
    intelligentChatMetrics,
    currentCase,
    addUserMessage,
    addAssistantMessage,
    confirmInference,
    setUrgencyLevel,
    addSpecialty,
    setConversationStage,
    updateMetrics
  ])
}