// 🧠 Hook Médico Multinúcleo Evolucionado - Creado por Bernard Orozco
// Compatible con arquitectura multinúcleo 2025

import { useCallback, useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  ClaudeAdapter,
  convertReduxMessagesToClaudeFormat,
} from '../decision-engine/providers/claude'
import { validateMedicalInput, generateRejectionMessage } from '../utils/aiMedicalValidator'
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
        const validationResult = await validateMedicalInput(message)

        if (!validationResult.isValid) {
          console.log(
            '❌ Consulta rechazada:',
            validationResult.rejectionReason || 'Sin razón especificada'
          )

          // Agregar mensaje del usuario al dashboard
          dispatch(addDashboardMessage({ content: message, type: 'user' }))

          // Mensaje de rechazo generado por IA
          const rejectionMessage = generateRejectionMessage({
            isValid: validationResult.isValid,
            confidence: validationResult.confidence,
            rejectionReason: validationResult.rejectionReason,
            suggestedFormat: validationResult.suggestedFormat,
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

        // 🚀 USAR CHAT INTELIGENTE EN NÚCLEO DASHBOARD
        const { IntelligentMedicalChat } = await import('../services/intelligent-medical-chat')
        const intelligentService = new IntelligentMedicalChat(dispatch, 'dashboard')

        // El chat inteligente maneja todo internamente y actualiza el store
        await intelligentService.processUserInput(message)

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

    // Compatibilidad con useAssistantChat
    coreType: 'dashboard' as const,
    coreName: '🏥 NÚCLEO DASHBOARD',
    lastActivity: dashboardCore.lastActivity,
  }
}
