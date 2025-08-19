// 🧠 Hook que conecta Streaming con Redux
// Creado por Bernard Orozco

import { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { StreamingService } from '../streaming'
import { 
  addMessage, 
  startStreaming, 
  updateStreamingProgress, 
  completeStreaming, 
  stopStreaming,
  startNewSession,
  setError,
  clearError,
  type RootState,
  type AppDispatch
} from '../store'

export const useMedicalChat = () => {
  const dispatch = useDispatch<AppDispatch>()
  
  const { 
    messages, 
    streaming, 
    currentSession, 
    isLoading, 
    error 
  } = useSelector((state: RootState) => state.medicalChat)

  const sendMedicalQuery = useCallback(async (message: string, apiKey?: string) => {
    if (!message.trim() || streaming.isActive) return

    try {
      // Limpiar errores previos
      dispatch(clearError())

      // Agregar mensaje del usuario
      dispatch(addMessage({
        content: message,
        type: 'user'
      }))

      // Crear mensaje del asistente vacío
      dispatch(addMessage({
        content: '',
        type: 'assistant',
        confidence: 0,
        metadata: {
          sessionId: currentSession.id,
          isStreaming: true,
          sectionType: 'diagnosis'
        }
      }))

      // Obtener el ID del último mensaje (el del asistente)
      const assistantMessageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Iniciar streaming en Redux
      dispatch(startStreaming({ messageId: assistantMessageId }))

      // Configurar streaming service
      if (!apiKey) {
        throw new Error('API key de Claude no configurada')
      }

      const streamingService = new StreamingService({
        apiKey,
        model: 'claude-3-haiku-20240307',
        maxTokens: 2000,
        temperature: 0.3
      })

      // Procesar stream
      for await (const chunk of streamingService.streamMedicalEvaluation(message)) {
        if (chunk.isComplete) {
          // Stream completado
          dispatch(completeStreaming({
            finalContent: chunk.content,
            confidence: chunk.confidence
          }))
        } else {
          // Actualizar progreso
          dispatch(updateStreamingProgress({
            progress: (chunk.confidence || 0) * 100,
            content: chunk.content
          }))
        }
      }

    } catch (error) {
      console.error('Error en medical chat:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      
      dispatch(stopStreaming({ error: errorMessage }))
      dispatch(setError(errorMessage))
    }
  }, [dispatch, streaming.isActive, currentSession.id])

  const newSession = useCallback((patientId?: string) => {
    dispatch(startNewSession({ patientId }))
  }, [dispatch])

  const cancelStreaming = useCallback(() => {
    dispatch(stopStreaming({}))
  }, [dispatch])

  return {
    // Estado
    messages,
    isStreaming: streaming.isActive,
    streamingProgress: streaming.progress,
    currentSession,
    isLoading,
    error,
    
    // Acciones
    sendMedicalQuery,
    newSession,
    cancelStreaming,
    clearError: () => dispatch(clearError()),
    
    // Utilidades
    messagesCount: messages.length,
    lastMessage: messages[messages.length - 1] || null,
    hasMessages: messages.length > 0
  }
}