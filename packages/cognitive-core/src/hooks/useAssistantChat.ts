// 🤖 Hook para el Assistant Core - Autocompletado inteligente
// Creado por Bernard Orozco + Gandalf el Gris
// Núcleo ASSISTANT para el Asistente de Diagnóstico IA

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
  addAssistantMessage,
  setAssistantLoading,
  clearAssistantMessages,
  startNewSession,
  setError,
  clearError,
} from '../store/medicalChatSlice'

interface UseAssistantChatOptions {
  onValidationFailed?: (input: string, validationResult: any) => void
}

/**
 * 🤖 Hook para el Assistant Core - Autocompletado y sugerencias
 * Usa específicamente el núcleo del assistant (NO dashboard)
 * ESTE ES EL NÚCLEO CORRECTO PARA EL ASISTENTE DE DIAGNÓSTICO IA
 */
export const useAssistantChat = (options: UseAssistantChatOptions = {}) => {
  const dispatch = useDispatch<AppDispatch>()
  const [claudeAdapter] = useState(() => new ClaudeAdapter())
  const [diagnosticEngine] = useState(() => new IterativeDiagnosticEngine(new ClaudeAdapter()))

  // 🤖 NÚCLEO ASSISTANT: Acceder al Assistant Core específicamente
  const assistantCore = useSelector((state: RootState) => state.medicalChat.cores.assistant)
  const sharedState = useSelector((state: RootState) => state.medicalChat.sharedState)

  // Actualizar adaptador con mensajes del assistant
  useEffect(() => {
    const conversationHistory = convertReduxMessagesToClaudeFormat(assistantCore.messages)
    claudeAdapter.updateConversationHistory(conversationHistory)
  }, [assistantCore.messages, claudeAdapter])

  const sendAssistantQuery = useCallback(
    async (message: string) => {
      if (!message.trim() || assistantCore.isLoading) return

      try {
        dispatch(clearError())
        dispatch(setAssistantLoading(true))

        // Validación médica con IA
        const validationResult = await validateMedicalInput(message)

        if (!validationResult.isValid) {
          console.log(
            '❌ [ASSISTANT] Consulta rechazada:',
            validationResult.rejectionReason || 'Sin razón especificada'
          )

          // Agregar mensaje del usuario al assistant
          dispatch(addAssistantMessage({ content: message, type: 'user' }))

          // Mensaje de rechazo generado por IA
          const rejectionMessage = generateRejectionMessage({
            isValid: validationResult.isValid,
            confidence: validationResult.confidence,
            rejectionReason: validationResult.rejectionReason,
            suggestedFormat: validationResult.suggestedFormat,
          })

          dispatch(
            addAssistantMessage({
              content: rejectionMessage,
              type: 'assistant',
              metadata: { confidence: validationResult.confidence },
            })
          )

          // Trigger callback si existe
          if (options.onValidationFailed) {
            options.onValidationFailed(message, validationResult)
          }

          dispatch(setAssistantLoading(false))
          return
        }

        // Agregar mensaje válido y procesar
        dispatch(addAssistantMessage({ content: message, type: 'user' }))

        // 🚀 Llamar directamente a Claude
        const { callClaudeForDecision } = await import('../services/decisional-middleware')
        const response = await callClaudeForDecision('intelligent_medical_chat', message)

        if (response.decision) {
          dispatch(addAssistantMessage({
            content: response.decision,
            type: 'assistant'
          }))
        }

        dispatch(setAssistantLoading(false))
      } catch (error) {
        console.error('💥 [ASSISTANT] Error en chat:', error)
        dispatch(
          setError(error instanceof Error ? error.message : 'Error desconocido en Assistant Core')
        )
        dispatch(setAssistantLoading(false))
      }
    },
    [assistantCore.isLoading, dispatch, options]
  )

  const clearAssistant = useCallback(() => {
    dispatch(clearAssistantMessages())
  }, [dispatch])

  const startNewAssistantSession = useCallback(
    (patientId?: string) => {
      dispatch(startNewSession({ patientId }))
      // PatientId logic can be handled at component level if needed
    },
    [dispatch]
  )

  return {
    // Estado del Assistant Core
    messages: assistantCore.messages,
    isLoading: assistantCore.isLoading,
    error: sharedState.error,
    sessionId: assistantCore.sessionId,

    // Acciones
    sendMedicalQuery: sendAssistantQuery, // Mantener nombre para compatibilidad
    clearMessages: clearAssistant,
    startNewSession: startNewAssistantSession,

    // Metadata
    coreType: 'assistant' as const,
    coreName: '🤖 NÚCLEO ASSISTANT',
    lastActivity: assistantCore.lastActivity,
  }
}

// Creado por Bernard Orozco
