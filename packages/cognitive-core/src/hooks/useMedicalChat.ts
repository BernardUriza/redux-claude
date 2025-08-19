// 🧠 Hook Médico con Streaming Real Claude SDK - Creado por Bernard Orozco

import { useCallback, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { ClaudeAdapter } from '../decision-engine/providers/claude'
import { MedicalContentValidator } from '../utils/medicalValidator'
import { SOAPResolver } from '../soap/SOAPResolver'
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
  const [soapResolver] = useState(() => new SOAPResolver())
  
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

      // 🧠 PROCESAMIENTO SOAP MULTI-AGENTE
      console.log('🧠 Iniciando análisis SOAP multi-agente...')
      
      // Stream del proceso completo
      let soapContent = ''
      let progressStep = 0
      const totalSteps = 4 // S, O, A, P
      
      // Función para streamear progreso del SOAP
      const streamSOAPProgress = (section: string, content: string) => {
        progressStep++
        soapContent += `\n\n## ${section}\n\n${content}`
        
        dispatch(updateStreamingProgress({
          progress: Math.min(95, (progressStep / totalSteps) * 100),
          content: soapContent
        }))
      }

      // Resolver SOAP con agentes multi-máscara
      const soapResult = await soapResolver.resolveSOAP(message)
      
      // Streamear cada sección SOAP progresivamente
      streamSOAPProgress('S - SUBJETIVO', soapResult.soap.subjetivo)
      await new Promise(resolve => setTimeout(resolve, 500)) // Simular tiempo de procesamiento
      
      streamSOAPProgress('O - OBJETIVO', soapResult.soap.objetivo)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      streamSOAPProgress('A - ANÁLISIS', soapResult.soap.analisis)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      streamSOAPProgress('P - PLAN', soapResult.soap.plan)
      
      // Agregar información NOM-004 formal
      soapContent += `\n\n---\n\n## 📋 EXPEDIENTE CLÍNICO NOM-004-SSA3-2012\n\n`
      soapContent += `**🏥 Diagnóstico principal:** ${soapResult.soapFormal.soap.analisis.diagnosticoPrincipal.condicion}\n`
      soapContent += `**📊 CIE-10:** ${soapResult.soapFormal.soap.analisis.diagnosticoPrincipal.cie10}\n`
      soapContent += `**⚡ Urgencia ESI:** ${soapResult.soapFormal.metadata.clasificacion.urgencia}/5\n`
      soapContent += `**📈 Calidad normativa:** ${soapResult.soapFormal.metadata.calidad.cumplimientoNormativo}%\n\n`
      
      // Agregar metadata de agentes
      soapContent += `## 🧠 ANÁLISIS MULTI-AGENTE\n\n`
      soapContent += `**Versión:** ${soapResult.metadata.version}\n`
      soapContent += `**Normativa compliant:** ${soapResult.metadata.normativaCompliant ? '✅ SÍ' : '❌ NO'}\n`
      soapContent += `**Agentes participantes:** ${soapResult.metadata.agentsUsed.join(', ')}\n\n`
      soapContent += `**Nivel de consenso:** ${Math.round(soapResult.metadata.consensusLevel * 100)}%\n\n`
      soapContent += `**Tiempo de procesamiento:** ${soapResult.metadata.processingTime}ms\n\n`
      
      if (soapResult.metadata.warningFlags.length > 0) {
        soapContent += `**⚠️ Alertas clínicas:**\n`
        soapResult.metadata.warningFlags.forEach(flag => {
          soapContent += `- ${flag}\n`
        })
        soapContent += '\n'
      }
      
      // Agregar detalles de cada agente
      soapContent += `### Contribuciones por Especialidad:\n\n`
      soapResult.agentDecisions.forEach(agent => {
        soapContent += `**${agent.agentName}** (${agent.sectionContribution.toUpperCase()})\n`
        soapContent += `- Confianza: ${Math.round(agent.confidence * 100)}%\n`
        soapContent += `- Enfoque: ${agent.reasoning}\n\n`
      })

      console.log('✅ SOAP completado. Resultado:', soapResult.metadata)
      console.log('📄 Contenido SOAP final:', soapContent)

      // Completar streaming
      dispatch(completeStreaming({
        finalContent: soapContent,
        confidence: soapResult.confidence
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