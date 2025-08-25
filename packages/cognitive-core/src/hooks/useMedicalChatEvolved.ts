// 🧠 Hook Médico Multinúcleo Evolucionado - Creado por Bernard Orozco
// Compatible con arquitectura multinúcleo 2025

import { useCallback, useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { ClaudeAdapter, convertReduxMessagesToClaudeFormat } from '../decision-engine/providers/claude'
import { MedicalQualityValidator } from '../utils/medicalValidator'
import { IterativeDiagnosticEngine } from '../engine/IterativeDiagnosticEngine'
import type { RootState, AppDispatch } from '../store/store'
import {
  addDashboardMessage,
  setDashboardLoading,
  clearDashboardMessages,
  startNewSession,
  setError,
  clearError
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
  const [medicalValidator] = useState(() => new MedicalQualityValidator())
  const [diagnosticEngine] = useState(() => new IterativeDiagnosticEngine(new ClaudeAdapter()))
  
  // 🧠 MULTINÚCLEO: Acceder al Dashboard Core específicamente
  const dashboardCore = useSelector((state: RootState) => 
    state.medicalChat.cores.dashboard
  )
  
  const sharedState = useSelector((state: RootState) => 
    state.medicalChat.sharedState
  )
  
  // Actualizar adaptador con mensajes del dashboard
  useEffect(() => {
    const conversationHistory = convertReduxMessagesToClaudeFormat(dashboardCore.messages)
    claudeAdapter.updateConversationHistory(conversationHistory)
  }, [dashboardCore.messages, claudeAdapter])
  
  const sendMedicalQuery = useCallback(async (message: string) => {
    if (!message.trim() || dashboardCore.isLoading) return
    
    try {
      dispatch(clearError())
      dispatch(setDashboardLoading(true))
      
      // Validación médica
      const validationResult = medicalValidator.validateMedicalCase(message)
      
      if (!validationResult.isValid) {
        console.log('❌ Consulta rechazada:', validationResult.rejectionReason)
        
        // Agregar mensaje del usuario al dashboard
        dispatch(addDashboardMessage({ content: message, type: 'user' }))
        
        // Mensaje de rechazo
        const rejectionMessage = `## ⚠️ Consulta No Válida

**Razón:** ${validationResult.rejectionReason}
**Confianza:** ${Math.round(validationResult.confidence * 100)}%

💡 **Usa el asistente médico** para estructurar mejor tu consulta.`
        
        dispatch(addDashboardMessage({
          content: rejectionMessage,
          type: 'assistant',
          confidence: validationResult.confidence
        }))
        
        // Trigger callback si existe
        if (options.onValidationFailed) {
          options.onValidationFailed(message, validationResult)
        }
        
        dispatch(setDashboardLoading(false))
        return
      }
      
      // Agregar mensaje válido y procesar
      dispatch(addDashboardMessage({ content: message, type: 'user' }))
      
      // Simulación de respuesta (aquí iría la lógica del motor iterativo)
      setTimeout(() => {
        dispatch(addDashboardMessage({
          content: `✅ Análisis médico procesado en núcleo Dashboard.
          
**Sistema Multinúcleo Activo:**
- Dashboard Core: Chat principal ✅
- Assistant Core: Autocompletado separado
- Inference Core: Análisis contextual`,
          type: 'assistant',
          confidence: 0.85
        }))
        dispatch(setDashboardLoading(false))
      }, 1500)
      
    } catch (error) {
      console.error('Error en dashboard core:', error)
      dispatch(setError(error instanceof Error ? error.message : 'Error en análisis'))
      dispatch(setDashboardLoading(false))
    }
  }, [dispatch, dashboardCore.isLoading, medicalValidator, options])
  
  const newSession = useCallback((patientId?: string) => {
    dispatch(startNewSession({ patientId }))
  }, [dispatch])
  
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
    hasMessages: dashboardCore.messages.length > 0
  }
}