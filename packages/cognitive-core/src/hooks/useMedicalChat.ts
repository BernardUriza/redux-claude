// 🧠 Hook Médico con Streaming Real Claude SDK - Creado por Bernard Orozco

import { useCallback, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { ClaudeAdapter } from '../decision-engine/providers/claude'
import { MedicalContentValidator } from '../utils/medicalValidator'
import { 
  addMessage, 
  startStreaming, 
  updateStreamingProgress, 
  completeStreaming, 
  stopStreaming,
  startNewSession,
  setError,
  clearError
} from '../store/medicalChatSlice'
import type { RootState, AppDispatch } from '../store/store'

export const useMedicalChat = () => {
  const dispatch = useDispatch<AppDispatch>()
  const [claudeAdapter] = useState(() => new ClaudeAdapter())
  const [medicalValidator] = useState(() => new MedicalContentValidator())
  
  const { 
    messages, 
    streaming, 
    currentSession, 
    isLoading, 
    error 
  } = useSelector((state: RootState) => state.medicalChat)

  const sendMedicalQuery = useCallback(async (message: string) => {
    if (!message.trim() || streaming.isActive) return

    try {
      // Limpiar errores previos
      dispatch(clearError())

      // VALIDACIÓN MÉDICA - Verificar que sea un caso clínico válido
      const validationResult = medicalValidator.validateMedicalContent(message)
      
      if (!validationResult.isValid) {
        console.log('❌ Consulta rechazada:', validationResult.rejectionReason)
        
        // Agregar mensaje del usuario (para contexto)
        dispatch(addMessage({
          content: message,
          type: 'user'
        }))

        // Agregar mensaje de rechazo del sistema
        const rejectionMessage = medicalValidator.generateRejectionMessage(validationResult)
        dispatch(addMessage({
          content: rejectionMessage,
          type: 'assistant',
          confidence: validationResult.confidence,
          metadata: {
            sessionId: currentSession.id,
            isStreaming: false,
            sectionType: 'education'
          }
        }))

        return // Salir sin procesar la consulta
      }

      console.log('✅ Consulta médica válida. Confianza:', validationResult.confidence)

      // Agregar mensaje del usuario
      dispatch(addMessage({
        content: message,
        type: 'user'
      }))

      // Crear mensaje del asistente vacío para streaming
      const assistantMessageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Agregar mensaje con ID específico
      dispatch(addMessage({
        id: assistantMessageId,
        content: '',
        type: 'assistant',
        confidence: 0,
        metadata: {
          sessionId: currentSession.id,
          isStreaming: true,
          sectionType: 'diagnosis'
        }
      }))

      // Iniciar streaming en Redux
      dispatch(startStreaming({ messageId: assistantMessageId }))

      // Prompt médico profesional
      const systemPrompt = `Eres un especialista médico AI. Proporciona análisis clínico profesional estructurado.

Estructura tu respuesta así:
## 🏥 EVALUACIÓN CLÍNICA

**Diagnóstico Principal:**
[Diagnóstico más probable]

**Diagnósticos Diferenciales:**
- [Opción 1]
- [Opción 2] 
- [Opción 3]

**Plan Terapéutico:**
*Tratamiento inmediato:*
- [Medicación específica con dosis]
- [Medidas de soporte]

*Seguimiento:*
- [Plan de seguimiento]
- [Criterios de derivación]

**Estudios Complementarios:**
- [Estudios necesarios]

Responde en español, sin emojis adicionales, formato profesional médico.`

      // STREAMING REAL con Claude SDK
      let fullContent = ''
      console.log('🚀 Iniciando streaming con prompt:', systemPrompt.substring(0, 100))
      
      const result = await claudeAdapter.makeStreamingRequest(
        systemPrompt,
        message,
        undefined, // signal
        (chunk: string) => {
          console.log('📝 Chunk recibido:', chunk)
          fullContent += chunk
          // Actualizar contenido en tiempo real
          dispatch(updateStreamingProgress({
            progress: Math.min(95, (fullContent.length / 1000) * 100),
            content: fullContent
          }))
        }
      )
      
      console.log('✅ Streaming completado. Resultado:', result)
      console.log('📄 Contenido final:', fullContent)

      // Completar streaming
      dispatch(completeStreaming({
        finalContent: fullContent,
        confidence: 0.85
      }))

    } catch (error) {
      console.error('Error en medical chat:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      
      dispatch(stopStreaming({ error: errorMessage }))
      dispatch(setError(errorMessage))
    }
  }, [dispatch, streaming.isActive, currentSession.id, claudeAdapter, medicalValidator])

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