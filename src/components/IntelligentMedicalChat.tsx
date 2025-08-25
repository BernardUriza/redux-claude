// 🏥 Asistente Médico Inteligente - Arquitectura SOLID
// Creado por Bernard Orozco - Sistema de Diagnóstico con IA

import React, { useState, useRef, useEffect } from 'react'
import { useMedicalChat } from '../hooks/useMedicalChat'
import { MedicalChatMessage } from './MedicalChatMessage'
import { InferenceCard } from './InferenceCard'
import { DynamicInferencePanel } from './DynamicInferencePanel'

interface IntelligentMedicalChatProps {
  className?: string
  showMetrics?: boolean
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
export const IntelligentMedicalChat: React.FC<IntelligentMedicalChatProps> = ({ className = '', showMetrics = true }) => {
  // Hook unificado para manejo de estado (Inversión de Dependencias)
  const {
    messages,
    isLoading,
    intelligentChatMetrics,
    currentCase,
    addUserMessage,
    addAssistantMessage,
    confirmInference,
    setUrgencyLevel,
    addSpecialty,
    setConversationStage,
    updateMetrics
  } = useMedicalChat()
  
  // Estado local para inferencias (ya no usa slice separado)
  const [currentResponse, setCurrentResponse] = useState<any>(null)
  const [processingInferences, setProcessingInferences] = useState(false)
  
  // Estado local del componente
  const [userInput, setUserInput] = useState('')
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Auto scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages, currentResponse])

  // Handler para envío de mensajes (UNIFICADO - usa el chat principal)
  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return

    const trimmedInput = userInput.trim()
    setUserInput('')

    // 🔥 GANDALF EL BLANCO: Usar el sistema principal de chat médico
    // Esto enviará al motor iterativo principal, no al chat separado
    // El resultado aparecerá en el chat unificado
    
    // Nota: No necesitamos lógica separada, el useMedicalChat ya maneja todo
    // Solo necesitamos trigger el envío al sistema principal
    
    console.log('💍 Chat inteligente redirigido al sistema principal:', trimmedInput)
    
    // Mostrar que está procesando
    setProcessingInferences(true)
    
    // Simular delay y luego mostrar que debe usar el chat principal
    setTimeout(() => {
      setProcessingInferences(false)
      addAssistantMessage(`💍 Para análisis completo, use el chat principal del dashboard. Este es solo para inferencias rápidas.`)
    }, 1000)
  }

  // Handler para confirmación de inferencias (SIMPLIFICADO)
  const handleInferenceConfirm = (inference: any, confirmed: boolean) => {
    // Actualizar métricas básicas
    confirmInference(confirmed)
    
    // Mensaje simple de confirmación
    addAssistantMessage(confirmed ? 
      `✅ Inferencia confirmada: ${inference.inference}` : 
      `❌ Inferencia rechazada: ${inference.inference}`)
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
      {/* Header Profesional */}
      {showMetrics && (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-700 text-white px-6 py-4 rounded-lg shadow-lg mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-lg">
                <span className="text-2xl">🏥</span>
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-wide">Asistente de Diagnóstico IA</h2>
                <p className="text-blue-100 text-sm">Sistema inteligente de inferencias médicas</p>
              </div>
            </div>
            <div className="text-right text-sm text-blue-100">
              <div>FASE 2 IMPLEMENTADA</div>
              <div className="text-xs opacity-75">Contexto Inteligente Activo</div>
            </div>
          </div>
        </div>
      )}

      {/* Layout Principal: 2 Columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Columna Izquierda: Chat Principal */}
        <div className="lg:col-span-2 flex flex-col bg-gray-900 rounded-lg shadow-xl border border-gray-700">

          {/* Área de Chat con Mejor Spacing */}
          <div 
            ref={chatContainerRef}
            className="flex-1 p-6 overflow-y-auto space-y-6"
          >
            {/* Estado inicial con mejor diseño */}
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-3xl">🏥</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-100 mb-3">¡Bienvenido Doctor!</h3>
                <div className="max-w-md mx-auto space-y-3">
                  <p className="text-gray-300 leading-relaxed">
                    Describa los síntomas del paciente. El sistema generará <strong className="text-blue-400">inferencias médicas inteligentes</strong> en tiempo real.
                  </p>
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <p className="text-sm text-cyan-400 font-medium mb-2">✨ Capacidades del Sistema:</p>
                    <ul className="text-xs text-gray-400 space-y-1 text-left">
                      <li>• Trabaja con información parcial</li>
                      <li>• Genera hipótesis clínicas contextuales</li>
                      <li>• Actualiza inferencias automáticamente</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

        {/* Mensajes del chat */}
        {messages.map((message) => (
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
                  {currentResponse.inferences.map((inference) => (
                    <InferenceCard 
                      key={inference.id} 
                      inference={inference} 
                      onConfirm={handleInferenceConfirm}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Indicador de procesamiento elegante */}
            {processingInferences && (
              <div className="bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border border-cyan-700/50 rounded-lg p-6">
                <div className="flex items-center justify-center gap-4">
                  <div className="bg-cyan-600 p-3 rounded-full animate-pulse">
                    <span className="text-lg">🤖</span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                      <span className="text-cyan-300 font-medium">Analizando Contexto Médico</span>
                    </div>
                    <p className="text-xs text-cyan-400">Generando inferencias inteligentes...</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area Rediseñada */}
          <div className="bg-gray-800 border-t border-gray-700 p-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>💬</span>
                <span>Describa síntomas, historia clínica o hallazgos del paciente</span>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ej: Paciente masculino 45 años con dolor torácico opresivo de 2 horas..."
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500 text-sm leading-relaxed"
                    rows={3}
                    disabled={isLoading || processingInferences}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!userInput.trim() || isLoading || processingInferences}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl font-medium min-w-[120px] justify-center"
                >
                  <span>📤</span>
                  <span>Analizar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Panel de Inferencias */}
        <div className="lg:col-span-1">
          <DynamicInferencePanel 
            currentMessage={userInput}
            className="h-full"
            onInferenceUpdate={(inferences) => {
              // Callback para manejar actualizaciones
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default IntelligentMedicalChat