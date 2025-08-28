// 🏥 Asistente Médico Inteligente - Arquitectura SOLID
// Creado por Bernard Orozco - Sistema de Diagnóstico con IA

import React, { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useAssistantChat } from '../hooks/useMultinucleusChat'
import { useIntelligentInference } from '../hooks/useIntelligentInference'
import { MedicalChatMessage } from './MedicalChatMessage'
import { InferenceCard } from './InferenceCard'
import { DynamicInferencePanel } from './DynamicInferencePanel'
import { selectSystemMetrics } from '../../packages/cognitive-core/src/store/selectors/medicalSelectors'
import { confirmPatientInference, confirmReadyForSOAP } from '../../packages/cognitive-core/src/store/medicalChatSlice'
import type { RootState } from '../../packages/cognitive-core/src/store/store'
import type { ChatAnalysisRequest } from '../../packages/cognitive-core/src/services/IntelligentMedicalChat'

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

  // 🏥 REDUX DISPATCH Y SELECTORES
  const dispatch = useDispatch()
  const systemMetrics = useSelector(selectSystemMetrics)
  const assistantCore = useSelector((state: RootState) => state.medicalChat.cores.assistant)
  const patientData = useSelector((state: RootState) => state.medicalChat.sharedState.patientData)
  const readyForSOAP = useSelector((state: RootState) => state.medicalChat.sharedState.readyForSOAP)

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
  
  // 🧠 SISTEMA INTELIGENTE DE RESPUESTA INICIAL (USA CLAUDE)
  const handleInitialInput = async () => {
    if (!partialInput.trim()) return
    addUserMessage(partialInput)
    
    setLoading(true)
    
    try {
      // Usar CLAUDE para la respuesta inicial también
      const analysisRequest: ChatAnalysisRequest = {
        user_input: partialInput,
        conversation_history: [],
        previous_inferences: [],
      }

      const response = await processUserInput(analysisRequest)
      const intelligentResponse = response.message
      addAssistantMessage(intelligentResponse)
      onInitialResponse?.(intelligentResponse)
    } catch (error) {
      // Solo fallback básico en caso de error
      const fallbackResponse = `🏥 Sistema Médico IA | He registrado: "${partialInput}". ¿Podrías proporcionar más detalles del paciente?`
      addAssistantMessage(fallbackResponse)
      onInitialResponse?.(fallbackResponse)
    } finally {
      setLoading(false)
    }
  }

  // 🎯 FUNCIÓN ELIMINADA - AHORA CLAUDE SE ENCARGA DE TODO EL ANÁLISIS CONTEXTUAL

  // Auto scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages, currentResponse])

  // 🎯 EFECTO PARA TRANSICIÓN AUTOMÁTICA A SOAP
  useEffect(() => {
    if (readyForSOAP && patientData.isComplete) {
      // Delay para que el usuario vea la confirmación antes de la transición
      const transitionTimer = setTimeout(() => {
        // Construir detalles contextuales si están disponibles
        let contextualDetails = ''
        if (patientData.isEnhanced) {
          const details = []
          if (patientData.duration) details.push(`⏱ Duración: ${patientData.duration}`)
          if (patientData.intensity) details.push(`💊 Intensidad: ${patientData.intensity}/10`)
          if (patientData.characteristics?.length) details.push(`📝 Características: ${patientData.characteristics.join(', ')}`)
          if (patientData.triggers?.length) details.push(`⚠️ Desencadenantes: ${patientData.triggers.join(', ')}`)
          if (patientData.relievingFactors?.length) details.push(`✅ Alivio: ${patientData.relievingFactors.join(', ')}`)
          if (patientData.associatedSymptoms?.length) details.push(`🔗 Síntomas asociados: ${patientData.associatedSymptoms.join(', ')}`)
          if (patientData.timePattern) details.push(`⏰ Patrón: ${patientData.timePattern}`)
          
          if (details.length > 0) {
            contextualDetails = `\n**Detalles Contextuales:**\n${details.join('\n')}\n`
          }
        }

        addAssistantMessage(
          `🏥 **ANÁLISIS SOAP INICIADO**\n\n` +
          `**Paciente:** ${patientData.gender} de ${patientData.age} años\n` +
          `**Síntoma Principal:** ${patientData.primarySymptom}` +
          contextualDetails +
          `\nProcediendo con análisis médico estructurado SOAP...\n\n` +
          `*Sistema multinúcleo optimizado - ${patientData.isEnhanced ? 'Datos completos + contexto médico' : 'Datos básicos'} - Transición automática activada*`
        )

        // Aquí se podría disparar la navegación a la página SOAP
        // navigate('/soap-analysis') o similar
        console.log('🚀 TRANSICIÓN A SOAP - Datos del paciente:', patientData)
      }, 2000)

      return () => clearTimeout(transitionTimer)
    }
  }, [readyForSOAP, patientData])

  // 🧠 LÓGICA CONVERSACIONAL INTELIGENTE - Integración Multinúcleo CON CLAUDE
  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading || processingInferences) return

    const trimmedInput = userInput.trim()
    setUserInput('')
    addUserMessage(trimmedInput)

    try {
      setLoading(true)
      
      // 🎯 ANÁLISIS CONTEXTUAL USANDO CLAUDE DIRECTAMENTE
      const analysisRequest: ChatAnalysisRequest = {
        user_input: trimmedInput,
        conversation_history: messages,
        previous_inferences: currentResponse?.inferences || [],
      }

      // USAR SIEMPRE EL SERVICIO INTELIGENTE DE CLAUDE
      const response = await processUserInput(analysisRequest)
      
      // Usar SOLO la respuesta inteligente de Claude, no hardcoded
      const finalResponse = response.message
      addAssistantMessage(finalResponse)
      
    } catch (error) {
      console.error('Error en análisis:', error)
      
      // Solo en caso de error extremo, fallback simple
      const fallbackResponse = '🦁 Doctor Edmund, tuve un problema técnico. ¿Podrías repetir la información del paciente?'
      addAssistantMessage(fallbackResponse)
    } finally {
      setLoading(false)
    }
  }

  // 🎯 HANDLER INTELIGENTE DE INFERENCIAS CON REDUX INTEGRATION
  const handleInferenceConfirm = (inference: any, confirmed: boolean) => {
    const result = handleInferenceConfirmation(inference, confirmed)
    
    if (confirmed) {
      // 🏥 DISPATCH ACCIÓN REDUX PARA GUARDAR DATOS CONFIRMADOS
      
      // EXTRACCIÓN INTELIGENTE DE DATOS DEMOGRÁFICOS
      if (inference.category === 'demographic' && inference.inference.includes('años')) {
        // Extraer edad y género de la inferencia
        const ageMatch = inference.inference.match(/(\d+)\s*años/)
        const age = ageMatch ? parseInt(ageMatch[1]) : undefined
        
        const genderMatch = inference.inference.match(/(femenina|masculino|femenino|masculina)/i)
        const gender = genderMatch ? 
          (genderMatch[1].toLowerCase().includes('femeni') ? 'femenino' : 'masculino') 
          : undefined

        if (age) {
          dispatch(confirmPatientInference({
            type: 'age',
            value: age,
            confidence: inference.confidence
          }))
        }

        if (gender) {
          dispatch(confirmPatientInference({
            type: 'gender',
            value: gender,
            confidence: inference.confidence
          }))
        }

        // También extraer síntoma si está en la inferencia
        const symptomMatch = inference.inference.match(/dolor\s+(\w+)/i)
        if (symptomMatch) {
          dispatch(confirmPatientInference({
            type: 'symptom',
            value: `dolor ${symptomMatch[1]}`,
            confidence: inference.confidence
          }))
        }
      }

      // EXTRACCIÓN INTELIGENTE DE DETALLES CONTEXTUALES
      const inferenceText = inference.inference.toLowerCase()
      
      // Duración
      const durationMatch = inferenceText.match(/(?:desde\s+hace\s+|desde\s+|hace\s+)([^,\.]+)/i) ||
                           inferenceText.match(/(\d+\s+(?:días?|horas?|semanas?|meses?))/i) ||
                           inferenceText.match(/(ayer|anteayer|esta\s+mañana|anoche)/i)
      if (durationMatch) {
        dispatch(confirmPatientInference({
          type: 'duration',
          value: durationMatch[1].trim(),
          confidence: inference.confidence
        }))
      }

      // Intensidad (escala 1-10)
      const intensityMatch = inferenceText.match(/(?:intensidad\s+|dolor\s+)(\d+)(?:\/10|\s+de\s+10)/i) ||
                            inferenceText.match(/(\d+)\/10/i)
      if (intensityMatch) {
        const intensity = parseInt(intensityMatch[1])
        if (intensity >= 1 && intensity <= 10) {
          dispatch(confirmPatientInference({
            type: 'intensity',
            value: intensity,
            confidence: inference.confidence
          }))
        }
      }

      // Características del dolor
      const characteristics = []
      if (/punzante/i.test(inferenceText)) characteristics.push('punzante')
      if (/sordo|opaco/i.test(inferenceText)) characteristics.push('sordo')
      if (/pulsátil|pulsante/i.test(inferenceText)) characteristics.push('pulsátil')
      if (/constante|continuo/i.test(inferenceText)) characteristics.push('constante')
      if (/ardor|quemante/i.test(inferenceText)) characteristics.push('ardor')
      if (/cólico/i.test(inferenceText)) characteristics.push('cólico')
      
      if (characteristics.length > 0) {
        dispatch(confirmPatientInference({
          type: 'characteristics',
          value: characteristics,
          confidence: inference.confidence
        }))
      }

      // Factores desencadenantes
      const triggers = []
      if (/movimiento/i.test(inferenceText)) triggers.push('movimiento')
      if (/luz|fotofobia/i.test(inferenceText)) triggers.push('luz')
      if (/estrés|tensión/i.test(inferenceText)) triggers.push('estrés')
      if (/comida|alimento/i.test(inferenceText)) triggers.push('comida')
      if (/ejercicio/i.test(inferenceText)) triggers.push('ejercicio')
      
      if (triggers.length > 0) {
        dispatch(confirmPatientInference({
          type: 'triggers',
          value: triggers,
          confidence: inference.confidence
        }))
      }

      // Factores que alivian
      const relievers = []
      if (/reposo|descanso/i.test(inferenceText)) relievers.push('reposo')
      if (/medicamento|analgésico/i.test(inferenceText)) relievers.push('medicamento')
      if (/calor/i.test(inferenceText)) relievers.push('calor')
      if (/frío/i.test(inferenceText)) relievers.push('frío')
      if (/masaje/i.test(inferenceText)) relievers.push('masaje')
      
      if (relievers.length > 0) {
        dispatch(confirmPatientInference({
          type: 'relievingFactors',
          value: relievers,
          confidence: inference.confidence
        }))
      }

      // Síntomas asociados
      const associated = []
      if (/náusea|nausea/i.test(inferenceText)) associated.push('náusea')
      if (/vómito/i.test(inferenceText)) associated.push('vómito')
      if (/visión\s+borrosa|borrosidad/i.test(inferenceText)) associated.push('visión borrosa')
      if (/mareo|vértigo/i.test(inferenceText)) associated.push('mareo')
      if (/sensibilidad\s+a\s+la\s+luz|fotofobia/i.test(inferenceText)) associated.push('fotofobia')
      if (/fiebre/i.test(inferenceText)) associated.push('fiebre')
      
      if (associated.length > 0) {
        dispatch(confirmPatientInference({
          type: 'associatedSymptoms',
          value: associated,
          confidence: inference.confidence
        }))
      }

      // Patrón temporal
      if (/matutino|mañana/i.test(inferenceText)) {
        dispatch(confirmPatientInference({
          type: 'timePattern',
          value: 'matutino',
          confidence: inference.confidence
        }))
      } else if (/nocturno|noche/i.test(inferenceText)) {
        dispatch(confirmPatientInference({
          type: 'timePattern',
          value: 'nocturno',
          confidence: inference.confidence
        }))
      } else if (/todo\s+el\s+día|constante/i.test(inferenceText)) {
        dispatch(confirmPatientInference({
          type: 'timePattern',
          value: 'todo el día',
          confidence: inference.confidence
        }))
      }

      // Generar mensaje de confirmación
      const contextualResponse = confirmed
        ? `✅ Confirmado: ${inference.inference}. ${patientData.isComplete ? '¡Datos completos! Listo para análisis SOAP.' : 'Continuando recolección de datos.'}`
        : `📝 Corrigiendo: ${inference.inference}. ¿Podrías proporcionar más detalles?`
      
      addAssistantMessage(contextualResponse)

      // 🎯 VERIFICAR SI ESTÁ LISTO PARA SOAP
      if (patientData.isComplete && !readyForSOAP) {
        setTimeout(() => {
          addAssistantMessage('🚀 **Datos del paciente completos**. Iniciando transición al análisis SOAP...')
        }, 1000)
      }
    } else {
      // Mensaje de corrección
      addAssistantMessage(`📝 Entendido, corrigiendo inferencia. ¿Podrías proporcionar los datos correctos?`)
    }
    
    // Log para debugging
    console.log('🎯 Inferencia confirmada:', {inference, confirmed, result, patientData})
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
              {/* 🏥 INDICADOR DE ESTADO DEL PACIENTE */}
              {(patientData.age || patientData.gender || patientData.primarySymptom) && (
                <div className="text-xs mt-1 p-2 bg-white/10 rounded">
                  <div className="flex items-center gap-1 mb-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${patientData.isComplete ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                    <span className="font-semibold">Paciente</span>
                    {patientData.isEnhanced && <span className="text-green-300 text-[10px]">ENHANCED</span>}
                  </div>
                  
                  {/* Datos básicos */}
                  <div className="space-y-0.5 mb-2">
                    {patientData.age && <div>• Edad: {patientData.age} años</div>}
                    {patientData.gender && <div>• Género: {patientData.gender}</div>}
                    {patientData.primarySymptom && <div>• Síntoma: {patientData.primarySymptom}</div>}
                  </div>

                  {/* Detalles contextuales */}
                  {(patientData.duration || patientData.intensity || patientData.characteristics || 
                    patientData.triggers || patientData.relievingFactors || patientData.associatedSymptoms || 
                    patientData.timePattern) && (
                    <div className="border-t border-white/20 pt-1 mt-1 space-y-0.5">
                      {patientData.duration && (
                        <div className="text-blue-200">⏱ Duración: {patientData.duration}</div>
                      )}
                      {patientData.intensity && (
                        <div className="text-orange-200">💊 Intensidad: {patientData.intensity}/10</div>
                      )}
                      {patientData.characteristics && patientData.characteristics.length > 0 && (
                        <div className="text-purple-200">📝 Tipo: {patientData.characteristics.join(', ')}</div>
                      )}
                      {patientData.triggers && patientData.triggers.length > 0 && (
                        <div className="text-red-200">⚠️ Desencadenantes: {patientData.triggers.join(', ')}</div>
                      )}
                      {patientData.relievingFactors && patientData.relievingFactors.length > 0 && (
                        <div className="text-green-200">✅ Mejora con: {patientData.relievingFactors.join(', ')}</div>
                      )}
                      {patientData.associatedSymptoms && patientData.associatedSymptoms.length > 0 && (
                        <div className="text-yellow-200">🔗 Asociados: {patientData.associatedSymptoms.join(', ')}</div>
                      )}
                      {patientData.timePattern && (
                        <div className="text-cyan-200">⏰ Patrón: {patientData.timePattern}</div>
                      )}
                    </div>
                  )}

                  {readyForSOAP && (
                    <div className="text-green-300 font-semibold mt-1 border-t border-white/20 pt-1">
                      ✓ Listo para SOAP {patientData.isEnhanced && '(Datos completos + contexto)'}
                    </div>
                  )}
                </div>
              )}
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
        <div className="w-full xl:w-80 2xl:w-96 xl:flex-shrink-0 flex flex-col min-w-0">
          <DynamicInferencePanel
            currentMessage={messages.length > 0 ? messages[messages.length - 1]?.content || '' : partialInput}
            className="h-full flex-1 min-h-0 max-w-full"
            onInferenceUpdate={inferences => {
              // 🧠 CALLBACK INTELIGENTE - Solo log para debugging, no generar mensajes automáticos
              console.log('🎯 Inferencias actualizadas desde core:', inferences)
              
              // No generar mensajes automáticos para evitar spam
              // Las inferencias se muestran en el panel lateral, no necesitan mensajes de chat
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
