// 🧠 Hook Médico con Motor Iterativo SOAP - Creado por Bernard Orozco

import { useCallback, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { ClaudeAdapter } from '../decision-engine/providers/claude'
import { MedicalQualityValidator } from '../utils/medicalValidator'
import { IterativeDiagnosticEngine } from '../engine/IterativeDiagnosticEngine'
import { AdditionalInfoService, InfoRequestMessage } from '../services/AdditionalInfoService'
import { MedicalCase, DiagnosticCycle, SOAPAnalysis, AdditionalInfoRequest } from '../types/medical'
import { 
  addMessage, 
  startStreaming, 
  updateStreamingProgress, 
  completeStreaming, 
  stopStreaming,
  startNewSession,
  setError,
  clearError,
  addDiagnosticCycle,
  updateIterativeState
} from '../store/medicalChatSlice'
import type { RootState, AppDispatch } from '../store/store'

export const useMedicalChat = () => {
  const dispatch = useDispatch<AppDispatch>()
  const [claudeAdapter] = useState(() => new ClaudeAdapter())
  const [medicalValidator] = useState(() => new MedicalQualityValidator())
  const [diagnosticEngine] = useState(() => new IterativeDiagnosticEngine(new ClaudeAdapter()))
  const [infoService] = useState(() => new AdditionalInfoService())
  
  const { 
    messages, 
    streaming, 
    currentSession, 
    isLoading, 
    error 
  } = useSelector((state: RootState) => state.medicalChat)

  const sendMedicalQuery = useCallback(async (message: string, requestId?: string) => {
    if (!message.trim() || streaming.isActive) return

    try {
      dispatch(clearError())

      // Si es una respuesta a solicitud de información adicional, procesar diferente
      if (requestId) {
        return await handleAdditionalInfoResponse(requestId, message)
      }

      // VALIDACIÓN MÉDICA AVANZADA
      const validationResult = medicalValidator.validateMedicalCase(message)
      
      if (!validationResult.isValid) {
        console.log('❌ Consulta rechazada:', validationResult.rejectionReason)
        
        dispatch(addMessage({ content: message, type: 'user' }))

        const rejectionMessage = `## ⚠️ Consulta No Válida

**Razón:** ${validationResult.rejectionReason}
**Confianza de validación:** ${Math.round(validationResult.confidence * 100)}%

### 📋 Mejoras Sugeridas:
${validationResult.suggestedImprovements?.map(improvement => `- ${improvement}`).join('\n') || 'Estructura el caso clínico apropiadamente'}

### 🔍 Datos Críticos Faltantes:
${validationResult.missingCriticalData?.map(data => `- ${data}`).join('\n') || 'Ninguno identificado'}

**Por favor, reformula tu consulta con más contexto médico específico.**`

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

        return
      }

      console.log(`✅ Caso médico válido. Confianza: ${Math.round(validationResult.confidence * 100)}%`)
      console.log(`🔬 Términos médicos encontrados: ${validationResult.medicalTermsFound?.length || 0}`)

      // Agregar mensaje del usuario
      dispatch(addMessage({ content: message, type: 'user' }))

      // Crear caso médico estructurado
      const medicalCase: MedicalCase = {
        id: `case_${Date.now()}`,
        presentation: message,
        context: `Caso clínico analizado con confianza inicial del ${Math.round(validationResult.confidence * 100)}%`
      }

      // Crear mensaje del asistente para streaming
      const assistantMessageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      dispatch(addMessage({
        id: assistantMessageId,
        content: '## 🔬 Iniciando Análisis Médico Iterativo...\n\n*Procesando caso clínico con motor de diagnóstico avanzado*',
        type: 'assistant',
        confidence: 0,
        metadata: {
          sessionId: currentSession.id,
          isStreaming: true,
          sectionType: 'diagnosis'
        }
      }))

      dispatch(startStreaming({ messageId: assistantMessageId }))

      // 🔬 MOTOR ITERATIVO DE DIAGNÓSTICO
      console.log('🔬 Iniciando proceso iterativo de diagnóstico...')

      const result = await diagnosticEngine.processWithValidation(
        medicalCase,
        (cycle: DiagnosticCycle) => {
          // Callback para actualizaciones de progreso en tiempo real
          console.log(`📊 Ciclo ${cycle.cycleNumber} completado - Confianza: ${Math.round(cycle.confidence * 100)}%`)
          
          // Actualizar estado de Redux con el ciclo
          dispatch(addDiagnosticCycle(cycle))
          
          // Actualizar contenido del streaming
          const progressContent = buildProgressContent(cycle)
          dispatch(updateStreamingProgress({
            progress: Math.min(90, cycle.cycleNumber * 30),
            content: progressContent
          }))
        }
      )

      // Verificar si necesita información adicional
      if ('type' in result && result.type === 'additional_info_needed') {
        await handleAdditionalInfoRequest(result as AdditionalInfoRequest, assistantMessageId)
        return
      }

      // Es un análisis SOAP completo
      const soapAnalysis = result as SOAPAnalysis
      const finalContent = formatFinalSOAPAnalysis(soapAnalysis)

      // Validar la calidad del análisis SOAP generado
      const soapValidation = medicalValidator.validateSOAPAnalysis(soapAnalysis)
      console.log(`📊 Calidad SOAP: ${Math.round(soapValidation.confidence * 100)}%`)

      dispatch(completeStreaming({
        finalContent,
        confidence: soapAnalysis.confianza_global || 0.8
      }))

      // Actualizar estado iterativo
      dispatch(updateIterativeState({
        totalCycles: soapAnalysis.ciclos_diagnosticos || 1,
        finalConfidence: soapAnalysis.confianza_global || 0.8,
        processingTimeMs: soapAnalysis.tiempo_total_analisis || 0
      }))

    } catch (error) {
      console.error('Error en motor iterativo:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error en análisis médico'
      
      dispatch(stopStreaming({ error: errorMessage }))
      dispatch(setError(errorMessage))
    }
  }, [dispatch, streaming.isActive, currentSession.id, medicalValidator, diagnosticEngine, infoService])

  // Función auxiliar para manejar solicitudes de información adicional
  const handleAdditionalInfoRequest = async (request: AdditionalInfoRequest, messageId: string) => {
    console.log(`❓ Información adicional requerida - Ciclo ${request.currentCycle}`)
    
    const infoMessage = infoService.formatInfoRequestMessage(request)
    
    dispatch(completeStreaming({
      finalContent: infoMessage.content,
      confidence: request.confidence
    }))

    // Almacenar el ID de la solicitud para futuras respuestas
    dispatch(updateIterativeState({
      pendingInfoRequestId: infoMessage.id,
      awaitingAdditionalInfo: true
    }))
  }

  // Función auxiliar para manejar respuestas de información adicional
  const handleAdditionalInfoResponse = async (requestId: string, additionalData: string) => {
    console.log(`📝 Procesando información adicional para solicitud: ${requestId}`)
    
    const response = infoService.processInfoResponse(requestId, additionalData)
    
    if (!response.success) {
      dispatch(setError(response.error || 'Error procesando información adicional'))
      return
    }

    // Continuar con el análisis usando el caso mejorado
    const enhancedCase = response.enhancedCase!
    
    // Reiniciar el proceso iterativo con información adicional
    const result = await diagnosticEngine.processWithValidation(enhancedCase)
    
    if ('type' in result && result.type === 'additional_info_needed') {
      // Todavía necesita más información
      await handleAdditionalInfoRequest(result as AdditionalInfoRequest, `followup_${Date.now()}`)
      return
    }

    // Análisis completo
    const soapAnalysis = result as SOAPAnalysis
    const finalContent = formatFinalSOAPAnalysis(soapAnalysis, true) // Marcar como seguimiento

    dispatch(addMessage({
      content: finalContent,
      type: 'assistant',
      confidence: soapAnalysis.confianza_global || 0.8,
      metadata: {
        sessionId: currentSession.id,
        isStreaming: false,
        sectionType: 'diagnosis'
      }
    }))
  }

  // Función auxiliar para formatear progreso
  const buildProgressContent = (cycle: DiagnosticCycle): string => {
    return `## 🔬 Análisis Médico Iterativo - Ciclo ${cycle.cycleNumber}

**⏱️ Tiempo de procesamiento:** ${cycle.latency}ms  
**📊 Confianza del ciclo:** ${Math.round(cycle.confidence * 100)}%  
**📈 Puntuación de calidad:** ${Math.round(cycle.qualityScore * 100)}%

### Análisis Parcial:

**🩺 SUBJETIVO:**
${cycle.analysis.subjetivo || 'Procesando...'}

**📋 OBJETIVO:**
${cycle.analysis.objetivo || 'Procesando...'}

**🔍 ANÁLISIS:**
${cycle.analysis.diagnostico_principal ? `**Diagnóstico:** ${cycle.analysis.diagnostico_principal}` : 'Procesando...'}

**💡 Insights del Ciclo:**
${cycle.insights.map(insight => `- ${insight}`).join('\n')}

---

*Continuando análisis...*`
  }

  // Función auxiliar para formatear análisis SOAP final
  const formatFinalSOAPAnalysis = (analysis: SOAPAnalysis, isFollowUp: boolean = false): string => {
    const followUpText = isFollowUp ? '\n\n**📋 ANÁLISIS CON INFORMACIÓN ADICIONAL**\n' : ''
    
    return `${followUpText}
## 🏥 EXPEDIENTE CLÍNICO COMPLETO

### S - SUBJETIVO
${analysis.subjetivo}

### O - OBJETIVO  
${analysis.objetivo}

### A - ANÁLISIS
**🎯 Diagnóstico Principal:** ${analysis.diagnostico_principal}

**🔬 Diagnósticos Diferenciales:**
${analysis.diagnosticos_diferenciales?.map((dx, i) => `${i + 1}. ${dx}`).join('\n') || 'No especificados'}

### P - PLAN
${analysis.plan_tratamiento}

---

## 📊 MÉTRICAS DEL ANÁLISIS

**🎯 Confianza Global:** ${Math.round((analysis.confianza_global || 0.5) * 100)}%  
**🔄 Ciclos Diagnósticos:** ${analysis.ciclos_diagnosticos || 1}  
**⏱️ Tiempo Total:** ${analysis.tiempo_total_analisis || 0}ms

${analysis.evolucion_diagnostica ? `
**📈 Evolución Diagnóstica:**
${analysis.evolucion_diagnostica.map(evol => 
  `- Ciclo ${evol.ciclo}: ${evol.diagnostico} (${Math.round(evol.confianza * 100)}%)`
).join('\n')}
` : ''}

${analysis.datos_adicionales_necesarios && analysis.datos_adicionales_necesarios.length > 0 ? `
**📝 Información Adicional Considerada:**
${analysis.datos_adicionales_necesarios.map(dato => `- ${dato}`).join('\n')}
` : ''}

---

*🤖 Análisis generado por Motor Iterativo de Diagnóstico v2.0 - Creado por Bernard Orozco*`
  }

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