// 🧠 Hook Médico Multinúcleo Evolucionado - Creado por Bernard Orozco
// Compatible con arquitectura multinúcleo 2025

import { useCallback, useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  ClaudeAdapter,
  convertReduxMessagesToClaudeFormat,
} from '../decision-engine/providers/claude'
import { validateMedicalCase, generateRejectionMessage } from '../utils/aiMedicalValidator'
import { IterativeDiagnosticEngine } from '../engine/IterativeDiagnosticEngine'
import type { RootState, AppDispatch } from '../store/store'
import {
  addDashboardMessage,
  setDashboardLoading,
  clearDashboardMessages,
  startNewSession,
  setError,
  clearError,
} from '../store/medicalChatSlice'

interface UseMedicalChatOptions {
  onValidationFailed?: (input: string, validationResult: any) => void
}

/**
 * 🧠 Hook para el Dashboard Core - Chat médico principal
 * Usa específicamente el núcleo del dashboard
 */
export const useMedicalChat = (options: UseMedicalChatOptions = {}) => {
  const dispatch = useDispatch<AppDispatch>()
  const [claudeAdapter] = useState(() => new ClaudeAdapter())
  // AI validator replaced the regex-based MedicalQualityValidator
  const [diagnosticEngine] = useState(() => new IterativeDiagnosticEngine(new ClaudeAdapter()))

  // 🧠 MULTINÚCLEO: Acceder al Dashboard Core específicamente
  const dashboardCore = useSelector((state: RootState) => state.medicalChat.cores.dashboard)

  const sharedState = useSelector((state: RootState) => state.medicalChat.sharedState)

  // Actualizar adaptador con mensajes del dashboard
  useEffect(() => {
    const conversationHistory = convertReduxMessagesToClaudeFormat(dashboardCore.messages)
    claudeAdapter.updateConversationHistory(conversationHistory)
  }, [dashboardCore.messages, claudeAdapter])

  const sendMedicalQuery = useCallback(
    async (message: string) => {
      if (!message.trim() || dashboardCore.isLoading) return

      try {
        dispatch(clearError())
        dispatch(setDashboardLoading(true))

        // Validación médica con IA
        const validationResult = await validateMedicalCase(message)

        if (!validationResult.isValid) {
          console.log('❌ Consulta rechazada:', validationResult.rejectionReason)

          // Agregar mensaje del usuario al dashboard
          dispatch(addDashboardMessage({ content: message, type: 'user' }))

          // Mensaje de rechazo generado por IA
          const rejectionMessage = generateRejectionMessage({
            isValid: validationResult.isValid,
            confidence: validationResult.confidence,
            rejectionReason: validationResult.rejectionReason,
            suggestedFormat: validationResult.suggestedImprovements?.[0]
          })

          dispatch(
            addDashboardMessage({
              content: rejectionMessage,
              type: 'assistant',
              confidence: validationResult.confidence,
            })
          )

          // Trigger callback si existe
          if (options.onValidationFailed) {
            options.onValidationFailed(message, validationResult)
          }

          dispatch(setDashboardLoading(false))
          return
        }

        // Agregar mensaje válido y procesar
        dispatch(addDashboardMessage({ content: message, type: 'user' }))

        // 🚀 USAR LA NUEVA ARQUITECTURA COMPLEMENTARIA
        const intelligentService = new (await import('../services/IntelligentMedicalChat')).IntelligentMedicalChat()
        
        const chatRequest = {
          user_input: message,
          conversation_history: dashboardCore.messages.map(msg => ({
            id: Date.now().toString(),
            content: msg.content,
            type: msg.type,
            timestamp: Date.now(),
            confidence: msg.confidence || 0.8
          })),
          previous_inferences: [] // TODO: Extraer inferencias previas del estado
        }

        try {
          const response = await intelligentService.processUserInput(chatRequest)
          
          dispatch(
            addDashboardMessage({
              content: response.message,
              type: 'assistant',
              confidence: response.confidence_level === 'high' ? 0.9 : 
                         response.confidence_level === 'medium' ? 0.7 : 0.5,
            })
          )
          
          console.log('🚀 Respuesta enriquecida:', response.extraction_metadata)
          
        } catch (error) {
          console.error('💥 Error en arquitectura complementaria:', error)
          // Fallback a respuesta básica
          dispatch(
            addDashboardMessage({
              content: '🦁 Doctor Edmund, necesito más información del paciente para ayudarle mejor. ¿Podría confirmarme la edad y género del paciente?',
              type: 'assistant',
              confidence: 0.6,
            })
          )
        }
        
        dispatch(setDashboardLoading(false))
      } catch (error) {
        console.error('Error en dashboard core:', error)
        dispatch(setError(error instanceof Error ? error.message : 'Error en análisis'))
        dispatch(setDashboardLoading(false))
      }
    },
    [dispatch, dashboardCore.isLoading, options]
  )

  const newSession = useCallback(
    (patientId?: string) => {
      dispatch(startNewSession({ patientId }))
    },
    [dispatch]
  )

  return {
    // Estado del Dashboard Core
    messages: dashboardCore.messages,
    isLoading: dashboardCore.isLoading,
    isStreaming: false, // Compatibilidad
    currentSession: sharedState.currentSession,
    error: sharedState.error,

    // Acciones
    sendMedicalQuery,
    newSession,
    clearError: () => dispatch(clearError()),

    // Metadatos
    messagesCount: dashboardCore.messages.length,
    lastMessage: dashboardCore.messages[dashboardCore.messages.length - 1] || null,
    hasMessages: dashboardCore.messages.length > 0,
  }
}
