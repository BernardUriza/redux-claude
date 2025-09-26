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

        // 🚀 Llamar directamente a Claude
        const { callClaudeForDecision } = await import('../services/decisional-middleware')
        const response = await callClaudeForDecision('intelligent_medical_chat', message)

        console.log('🔴 FULL RESPONSE:', response)
        console.log('🟡 RESPONSE.DECISION TYPE:', typeof response.decision)
        console.log('🟢 RESPONSE.DECISION VALUE:', response.decision)

        if (response.decision) {
          // Extract message from response.decision
          let messageContent: string
          let extractedData: any = {}

          // Handle different response formats
          if (typeof response.decision === 'string') {
            console.log('🔵 Decision is STRING, attempting JSON parse...')
            // Try to parse as JSON first
            try {
              const parsed = JSON.parse(response.decision)
              console.log('✅ JSON PARSED:', parsed)
              console.log('🔍 Has message field?', 'message' in parsed)
              console.log('🔍 Has content field?', 'content' in parsed)

              // Extract message from parsed JSON
              if (parsed.message) {
                messageContent = parsed.message
                extractedData = parsed
                console.log('✅ EXTRACTED MESSAGE:', messageContent)
              } else if (parsed.content) {
                messageContent = parsed.content
                extractedData = parsed
                console.log('✅ EXTRACTED CONTENT:', messageContent)
              } else {
                // If no message field, use the whole string
                messageContent = response.decision
                console.log('⚠️ NO MESSAGE/CONTENT FIELD, using full string')
              }
            } catch (e) {
              // Not JSON, use as plain text
              console.log('❌ NOT VALID JSON, using as plain text:', e)
              messageContent = response.decision
            }
          } else if (typeof response.decision === 'object' && response.decision !== null) {
            // Already an object, extract message
            const decision = response.decision as any
            console.log('🟣 Decision is OBJECT, checking fields...')

            // Check if decision.content is a JSON string
            if (decision.content && typeof decision.content === 'string') {
              console.log('🟠 Found content field with string, trying to parse...')

              // Check if content looks like JSON
              const trimmedContent = decision.content.trim()
              if (trimmedContent.startsWith('{') || trimmedContent.startsWith('[')) {
                try {
                  // Try to fix truncated JSON by finding the message field directly
                  const messageMatch = trimmedContent.match(/"message"\s*:\s*"([^"]+)"/);
                  if (messageMatch && messageMatch[1]) {
                    messageContent = messageMatch[1]
                    console.log('✅ EXTRACTED MESSAGE via regex from truncated JSON:', messageContent)

                    // Try to parse full JSON if possible
                    try {
                      const parsedContent = JSON.parse(trimmedContent)
                      extractedData = parsedContent
                      console.log('✅ Full JSON parsed successfully')
                    } catch {
                      // JSON is truncated, but we have the message
                      console.log('⚠️ JSON is truncated but message extracted')
                    }
                  } else {
                    // Try normal JSON parse
                    const parsedContent = JSON.parse(trimmedContent)
                    console.log('✅ Content JSON parsed:', parsedContent)
                    if (parsedContent.message) {
                      messageContent = parsedContent.message
                      extractedData = parsedContent
                      console.log('✅ EXTRACTED MESSAGE FROM PARSED JSON:', messageContent)
                    } else {
                      messageContent = trimmedContent
                      console.log('⚠️ No message in parsed content')
                    }
                  }
                } catch (e) {
                  console.log('❌ Failed to extract message from JSON-like content')
                  // Last resort: just use the content as is
                  messageContent = decision.content
                }
              } else {
                // Content doesn't look like JSON, use as plain text
                console.log('📝 Content is plain text, not JSON')
                messageContent = decision.content
              }
            } else if (decision.message) {
              messageContent = decision.message
              extractedData = decision
              console.log('✅ Found direct message field')
            } else if (decision.text_response) {
              messageContent = decision.text_response
              extractedData = decision
              console.log('✅ Found text_response field')
            } else {
              // Last resort: stringify
              console.log('❌ No usable field, stringifying')
              messageContent = JSON.stringify(decision)
            }
          } else {
            // Fallback for any other type
            messageContent = String(response.decision)
          }

          // Store the clean message in Redux
          console.log('📤 FINAL MESSAGE TO REDUX:', messageContent)
          console.log('📊 METADATA:', extractedData.inferences ? 'Has inferences' : 'No metadata')

          // Check for critical alerts
          if (extractedData.critical_alert) {
            console.log('🚨 CRITICAL ALERT:', extractedData.critical_alert)
          }
          if (extractedData.immediate_actions?.length > 0) {
            console.log('⚡ IMMEDIATE ACTIONS:', extractedData.immediate_actions)
          }

          dispatch(addDashboardMessage({
            content: messageContent,
            type: 'assistant',
            metadata: (extractedData.inferences || extractedData.critical_alert || extractedData.immediate_actions) ? {
              inferences: extractedData.inferences,
              confidence_level: extractedData.confidence_level,
              stage: extractedData.conversation_stage,
              critical_alert: extractedData.critical_alert,
              immediate_actions: extractedData.immediate_actions
            } : undefined
          }))
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

    // Compatibilidad con useAssistantChat
    coreType: 'dashboard' as const,
    coreName: '🏥 NÚCLEO DASHBOARD',
    lastActivity: dashboardCore.lastActivity,
  }
}
