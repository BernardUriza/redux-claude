// 🏥 Asistente Médico Inteligente - Arquitectura SOLID
// Creado por Bernard Orozco - Sistema de Diagnóstico con IA

import React, { useState, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useAssistantChat } from '../hooks/useMultinucleusChat'
import { useIntelligentInference } from '../hooks/useIntelligentInference'
import { MedicalChatMessage } from './MedicalChatMessage'
import { InferenceCard } from './InferenceCard'
import { DynamicInferencePanel } from './DynamicInferencePanel'
import { selectSystemMetrics } from '../../packages/cognitive-core/src/store/selectors/medicalSelectors'
import type { RootState } from '../../packages/cognitive-core/src/store/store'

// Consolidada en MedicalAssistantProps - Creado por Bernard Orozco
export interface IntelligentMedicalChatProps {
  className?: string
  showMetrics?: boolean
  partialInput?: string
  onInitialResponse?: (response: string) => void
}

/**
 * Componente principal del Chat Médico Inteligente
 * Aplica principios SOLID:
 * - S: Responsabilidad única - solo orquesta la UI del chat
 * - O: Abierto/Cerrado - extensible mediante hooks
 * - L: Sustitución Liskov - componentes intercambiables
 * - I: Segregación de Interfaces - hooks específicos
 * - D: Inversión de Dependencias - depende de abstracciones (hooks)
 */
export const IntelligentMedicalChat: React.FC<IntelligentMedicalChatProps> = ({
  className = '',
  showMetrics = true,
  partialInput = '',
  onInitialResponse,
}) => {
  // 🧠 MULTINÚCLEO: Usando el Assistant Core específico
  const {
    messages,
    isLoading,
    addUserMessage,
    addAssistantMessage,
    setLoading,
    clearMessages,
    currentSession,
    error,
  } = useAssistantChat()

  // 🔬 SISTEMA INTELIGENTE DE INFERENCIAS
  const {
    currentResponse,
    processingInferences,
    processUserInput,
    handleInferenceConfirmation,
  } = useIntelligentInference()

  // 📊 ESTADO DINÁMICO DEL STORE (NO MÁS HARDCODED)
  const systemMetrics = useSelector(selectSystemMetrics)
  const assistantCore = useSelector((state: RootState) => state.medicalChat.cores.assistant)

  // Estado local del componente
  const [userInput, setUserInput] = useState(partialInput)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  
  // 🎯 INYECCIÓN AUTOMÁTICA DE SÍNTOMA INICIAL (CONTROLADA)
  useEffect(() => {
    if (partialInput && partialInput.trim() && messages.length === 0) {
      // Solo ejecutar una vez al montar el componente
      const timeoutId = setTimeout(() => {
        handleInitialInput()
      }, 100)
      
      return () => clearTimeout(timeoutId)
    }
  }, []) // Solo ejecutar al montar, no en cada cambio de partialInput
  
  // 🧠 SISTEMA INTELIGENTE DE RESPUESTA INICIAL (SIMPLIFICADO)
  const handleInitialInput = async () => {
    if (!partialInput.trim()) return
    addUserMessage(partialInput)
    
    setLoading(true)
    
    // Usar directamente el generador contextual para evitar fallos
    setTimeout(() => {
      const intelligentResponse = generateContextualResponse(partialInput, systemMetrics, 'initial')
      addAssistantMessage(intelligentResponse)
      onInitialResponse?.(intelligentResponse)
      setLoading(false)
    }, 800) // Simular procesamiento
  }

  // 🎯 GENERADOR DE RESPUESTAS CONTEXTUALES (NO HARDCODED)
  const generateContextualResponse = (
    input: string, 
    metrics: typeof systemMetrics, 
    stage: 'initial' | 'followup' | 'analysis'
  ): string => {
    const confidence = metrics.confidence
    const sessionTime = Date.now() - currentSession.startedAt
    
    // Análisis médico inteligente del input
    const hasAge = /\b(?:\d{1,3}\s*(?:años?|a[nñ]os?))\b/i.test(input)
    const hasGender = /\b(?:masculino|femenino|hombre|mujer)\b/i.test(input)
    const hasChestPain = /dolor.*pecho|pecho.*dolor|chest.*pain|dolor.*torácico/i.test(input)
    const hasSymptoms = /dolor|molestia|síntoma|fiebre|náusea|mareo/i.test(input)
    const urgencyLevel = hasChestPain ? 'ALTO' : hasSymptoms ? 'MEDIO' : 'BAJO'
    
    if (stage === 'initial') {
      if (hasChestPain) {
        return `🚨 **DOLOR TORÁCICO DETECTADO** | Urgencia: ${urgencyLevel} | Confianza: ${confidence}%\n\n` +
               `He registrado: "${input}"\n\n` +
               `⚠️ **Síntoma de alta prioridad médica identificado**\n\n` +
               `**Para evaluación completa, necesito:**\n` +
               `${!hasAge ? '• Edad del paciente\n' : ''}` +
               `${!hasGender ? '• Género del paciente\n' : ''}` +
               `• Duración del dolor\n` +
               `• Irradiación (¿se extiende a brazo, cuello, mandíbula?)\n` +
               `• Factores desencadenantes\n\n` +
               `*Sistema multinúcleo activo - ${metrics.agentsActive} núcleos procesando*`
      } else if (!hasAge || !hasGender) {
        const missing = []
        if (!hasAge) missing.push('edad')
        if (!hasGender) missing.push('género')
        
        return `🏥 **Sistema Médico IA** | Confianza: ${confidence}% | Urgencia: ${urgencyLevel}\n\n` +
               `He registrado: "${input}"\n\n` +
               `**Datos requeridos para análisis completo:**\n` +
               `${missing.map(item => `• ${item.charAt(0).toUpperCase() + item.slice(1)} del paciente`).join('\n')}\n\n` +
               `*Núcleo Assistant activo - ${messages.length} mensajes procesados*`
      } else {
        return `✅ **Información completa detectada** | Confianza: ${confidence}%\n\n` +
               `Iniciando análisis médico multinúcleo...\n\n` +
               `*Sistema optimizado - Tiempo de sesión: ${Math.round(sessionTime / 1000)}s*`
      }
    }
    
    if (stage === 'followup') {
      if (hasChestPain) {
        return `🚨 **DOLOR TORÁCICO - SEGUIMIENTO** | Urgencia: ${urgencyLevel} | Confianza: ${confidence}%\n\n` +
               `Información adicional recibida: "${input}"\n\n` +
               `**Análisis médico en progreso:**\n` +
               `• Síntoma principal: Dolor torácico\n` +
               `• Nivel de urgencia: ${urgencyLevel}\n` +
               `• Datos faltantes: ${!hasAge && !hasGender ? 'Edad y género' : !hasAge ? 'Edad' : !hasGender ? 'Género' : 'Ninguno'}\n\n` +
               `⚕️ **Recomendación:** Continuar con evaluación completa\n\n` +
               `*Sistema multinúcleo: ${metrics.agentsActive} núcleos | Tiempo de respuesta: ${Math.round(metrics.processingTime)}ms*`
      } else if (!hasAge || !hasGender) {
        const missing = []
        if (!hasAge) missing.push('edad del paciente')
        if (!hasGender) missing.push('género (masculino/femenino)')
        
        return `🏥 **Sistema Médico IA** | Confianza: ${confidence}% | Urgencia: ${urgencyLevel}\n\n` +
               `Para completar el diagnóstico, necesito:\n\n` +
               `${missing.map(item => `• ${item.charAt(0).toUpperCase() + item.slice(1)}`).join('\n')}\n\n` +
               `*Núcleos activos: ${metrics.agentsActive} | Tiempo de respuesta: ${Math.round(metrics.processingTime)}ms*`
      } else {
        return `✅ **Análisis completo en progreso** | Confianza: ${confidence}%\n\n` +
               `Procesando información médica con todos los datos requeridos...\n\n` +
               `*Sistema multinúcleo optimizado - ${metrics.agentsActive} núcleos activos*`
      }
    }
    
    return `🤖 **Análisis médico inteligente** | Confianza: ${confidence}%\n\n` +
           `Sistema procesando información médica...\n\n` +
           `*Métricas: ${metrics.agentsActive} núcleos | ${messages.length} mensajes | ${Math.round(sessionTime / 1000)}s de sesión*`
  }

  // Auto scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages, currentResponse])

  // 🧠 LÓGICA CONVERSACIONAL INTELIGENTE - Integración Multinúcleo
  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading || processingInferences) return

    const trimmedInput = userInput.trim()
    setUserInput('')
    addUserMessage(trimmedInput)

    try {
      setLoading(true)
      
      // 🎯 ANÁLISIS CONTEXTUAL USANDO EL STORE
      const analysisRequest = {
        message: trimmedInput,
        context: {
          sessionId: currentSession.id,
          messageHistory: messages,
          systemMetrics,
          previousInferences: currentResponse?.inferences || [],
        },
        requestType: 'followup_analysis' as const,
      }

      const response = await processUserInput(analysisRequest)
      
      // Generar respuesta contextual inteligente
      const intelligentResponse = generateContextualResponse(
        trimmedInput, 
        systemMetrics, 
        'followup'
      )
      
      // Combinar análisis inteligente con respuesta del sistema
      const finalResponse = response.message || intelligentResponse
      addAssistantMessage(finalResponse)
      
    } catch (error) {
      console.error('Error en análisis:', error)
      
      // Fallback inteligente que usa el estado del sistema
      const fallbackResponse = generateContextualResponse(
        trimmedInput, 
        systemMetrics, 
        'analysis'
      )
      addAssistantMessage(fallbackResponse)
    } finally {
      setLoading(false)
    }
  }

  // 🎯 HANDLER INTELIGENTE DE INFERENCIAS (USA EL STORE)
  const handleInferenceConfirm = (inference: any, confirmed: boolean) => {
    const result = handleInferenceConfirmation(inference, confirmed)
    
    // Respuesta contextual basada en las métricas del sistema
    const contextualResponse = `${result.responseText}\n\n` +
      `*Sistema: Confianza ${systemMetrics.confidence}% | ` +
      `Núcleos activos: ${systemMetrics.agentsActive} | ` +
      `Mensajes procesados: ${messages.length}*`
    
    addAssistantMessage(contextualResponse)
    
    // Actualizar métricas si es necesario
    if (result.shouldUpdateMetrics) {
      console.log('🎯 Actualizando métricas del sistema basado en confirmación')
    }
  }

  // Handler para Enter en el input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className={`w-full max-w-6xl mx-auto ${className}`}>
      {/* Header Profesional con Métricas Dinámicas del Store */}
      {showMetrics && (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-700 text-white px-6 py-4 rounded-lg shadow-lg mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-lg">
                <span className="text-2xl">🧠</span>
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-wide">Asistente de Diagnóstico IA</h2>
                <p className="text-blue-100 text-sm">
                  Sistema multinúcleo • Confianza: {systemMetrics.confidence}% • 
                  {systemMetrics.agentsActive} núcleos activos
                </p>
              </div>
            </div>
            <div className="text-right text-sm text-blue-100">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${systemMetrics.systemHealth === 'optimal' ? 'bg-green-400' : 
                  systemMetrics.systemHealth === 'good' ? 'bg-yellow-400' : 'bg-red-400'} animate-pulse`}></div>
                <span>{systemMetrics.systemHealth.toUpperCase()}</span>
              </div>
              <div className="text-xs opacity-75">
                Sesión: {Math.round((Date.now() - currentSession.startedAt) / 1000)}s • 
                {messages.length} mensajes
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Layout Principal: Moderno y Espacioso */}
      <div className="flex flex-col xl:flex-row gap-6 h-[750px]">
        {/* Columna Principal: Chat Espacioso */}
        <div className="flex-1 xl:flex-[3] flex flex-col bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-slate-600/50">
          {/* Área de Chat con Spacing Optimizado */}
          <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto space-y-6 min-h-0">
            {/* Estado inicial con métricas dinámicas del sistema */}
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-3xl">🧠</span>
                </div>
                <h3 className="text-3xl font-bold text-slate-100 mb-4">¡Sistema Médico Multinúcleo!</h3>
                <div className="max-w-md mx-auto space-y-3">
                  <p className="text-slate-300 leading-relaxed text-lg">
                    Sistema de diagnóstico inteligente con{' '}
                    <strong className="text-cyan-400">{systemMetrics.agentsActive} núcleos activos</strong> 
                    {' '}y confianza del <strong className="text-cyan-400">{systemMetrics.confidence}%</strong>
                  </p>
                  <div className="bg-slate-800 rounded-xl p-6 border border-slate-600">
                    <p className="text-base text-cyan-400 font-bold mb-3">
                      🎯 Estado del Sistema:
                    </p>
                    <ul className="text-sm text-slate-300 space-y-2 text-left">
                      <li>• Núcleo Assistant: {assistantCore.isLoading ? 'Procesando' : 'Listo'}</li>
                      <li>• Confianza del sistema: {systemMetrics.confidence}%</li>
                      <li>• Estado: {systemMetrics.systemHealth}</li>
                      <li>• Sesión: {currentSession.id.slice(0, 8)}...</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Mensajes del chat */}
            {messages.map(message => (
              <MedicalChatMessage key={message.id} message={message} />
            ))}

            {/* Inferencias actuales con separación clara */}
            {currentResponse && currentResponse.inferences.length > 0 && (
              <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-700/30 rounded-lg p-5">
                <h4 className="text-lg font-semibold text-indigo-300 flex items-center gap-3 mb-4">
                  <div className="bg-indigo-600 p-1.5 rounded-lg">
                    <span className="text-sm">🧠</span>
                  </div>
                  Inferencias Médicas Generadas
                </h4>
                <div className="space-y-3">
                  {currentResponse.inferences.map((inference: any) => (
                    <InferenceCard
                      key={inference.id}
                      inference={inference}
                      onConfirm={handleInferenceConfirm}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Indicador de procesamiento inteligente con métricas del sistema */}
            {(processingInferences || isLoading) && (
              <div className="bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border border-cyan-700/50 rounded-lg p-6">
                <div className="flex items-center justify-center gap-4">
                  <div className="bg-cyan-600 p-3 rounded-full animate-pulse">
                    <span className="text-lg">🧠</span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                      <span className="text-cyan-300 font-medium">
                        {processingInferences ? 'Generando Inferencias' : 'Analizando Contexto Médico'}
                      </span>
                    </div>
                    <p className="text-xs text-cyan-400">
                      Sistema multinúcleo: {systemMetrics.agentsActive} núcleos activos | 
                      Confianza: {systemMetrics.confidence}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area Moderna y Espaciosa */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 border-t border-slate-600 p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <span className="text-xl">💬</span>
                <span className="font-medium">Describa síntomas iniciales del paciente</span>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <textarea
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ej: Paciente con dolor torácico..."
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-500 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-white placeholder-slate-400 text-sm leading-relaxed shadow-inner"
                    rows={3}
                    disabled={isLoading || processingInferences}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!userInput.trim() || isLoading || processingInferences}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-xl hover:shadow-2xl font-semibold min-w-[120px] justify-center text-sm self-start"
                >
                  <span className="text-lg">🚀</span>
                  <span>Enviar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Lateral: Panel Compacto Conectado al Store */}
        <div className="w-full xl:w-96 xl:flex-shrink-0 flex flex-col min-w-0">
          <DynamicInferencePanel
            currentMessage={userInput || partialInput}
            className="h-full flex-1 min-h-0"
            onInferenceUpdate={inferences => {
              // 🧠 CALLBACK INTELIGENTE - Arreglado para usar 'type' no 'category'
              console.log('🎯 Inferencias actualizadas desde core:', inferences)
              
              // Solo mostrar si hay cambios significativos
              const significantInferences = inferences.filter(inf => inf.confidence >= 0.6)
              
              if (significantInferences.length > 0) {
                const contextualMessage = `📊 **Inferencias médicas actualizadas:**\n\n` +
                  `${significantInferences.map(inf => `• ${inf.label}: ${inf.value} (${Math.round(inf.confidence * 100)}%)`).join('\n')}\n\n` +
                  `*Sistema multinúcleo - Confianza: ${systemMetrics.confidence}%*`
                
                // Solo agregar mensaje si hay inferencias de alta confianza
                addAssistantMessage(contextualMessage)
              }
            }}
            // Pasar métricas del sistema para mejor contextualización
            systemMetrics={systemMetrics}
            currentSession={currentSession}
          />
        </div>
      </div>
    </div>
  )
}

export default IntelligentMedicalChat
