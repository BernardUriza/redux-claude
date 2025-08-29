// 🏥 Asistente Médico Inteligente - Solo hooks del package
// Creado por Bernard Orozco - Sin estado local, solo servicios

import { useMedicalChat, useAssistantChat } from '@redux-claude/cognitive-core'
import React, { useRef, useEffect, useState } from 'react'
import { DynamicInferencePanel } from './DynamicInferencePanel'
import { MedicalChatMessage } from './MedicalChatMessage'

export interface IntelligentMedicalChatProps {
  className?: string
  showMetrics?: boolean
  partialInput?: string
  onInitialResponse?: (response: string) => void
  coreType?: 'dashboard' | 'assistant'  // 🧠 Selector de núcleo
}

/**
 * Componente del Chat Médico Inteligente
 * Solo usa hooks del package - sin estado local
 */
export const IntelligentMedicalChat: React.FC<IntelligentMedicalChatProps> = ({
  className = '',
  showMetrics = true,
  partialInput = '',
  onInitialResponse,
  coreType = 'dashboard',  // Por defecto usa Dashboard
}) => {
  // 🧠 HOOKS DUALES - Ambos se llaman siempre (reglas de React)
  const dashboardChat = useMedicalChat({
    onValidationFailed: (input, result) => {
      console.warn('[DASHBOARD] Validación médica falló:', input, result)
    },
  })
  
  const assistantChat = useAssistantChat({
    onValidationFailed: (input, result) => {
      console.warn('[ASSISTANT] Validación médica falló:', input, result)
    },
  })
  
  // Selección del núcleo activo basado en prop
  const { messages, isLoading, sendMedicalQuery, error, coreName } = 
    coreType === 'assistant' ? assistantChat : dashboardChat

  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [autoSent, setAutoSent] = useState(false)
  const sentMessagesRef = useRef(new Set<string>())
  
  // 🚀 AUTO-ENVÍO: Enviar partialInput automáticamente cuando esté presente
  useEffect(() => {
    const messageKey = `${coreType}-${partialInput?.trim()}`
    
    if (partialInput && partialInput.trim() && !isLoading && !sentMessagesRef.current.has(messageKey)) {
      console.log(`🚀 [AUTO-SEND] [${coreType.toUpperCase()}] Enviando mensaje automáticamente:`, partialInput)
      sendMedicalQuery(partialInput)
      onInitialResponse?.(partialInput)
      sentMessagesRef.current.add(messageKey)
      setAutoSent(true)
    }
  }, [partialInput, isLoading, sendMedicalQuery, onInitialResponse, coreType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const message = formData.get('message') as string

    if (message?.trim() && !isLoading) {
      await sendMedicalQuery(message)
      form.reset()
      onInitialResponse?.(message)
    }
  }

  return (
    <div className={`h-full p-2 flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6 ${className}`}>
      {/* Chat Principal */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-600/50 overflow-hidden flex flex-col h-full">
          {/* Mensajes */}
          <div
            ref={chatContainerRef}
            className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600"
          >
            {messages.length === 0 && (
              <div className="text-center text-slate-400 py-8">
                <span className="text-4xl mb-4 block">🩺</span>
                <p>{coreName ? `[${coreName}] activo` : 'Inicie una conversación médica...'}</p>
              </div>
            )}

            {messages.map((message: any) => (
              <MedicalChatMessage key={message.id} message={message} />
            ))}

            {isLoading && (
              <div className="flex items-center gap-3 text-cyan-400">
                <div className="animate-spin w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full"></div>
                <span>Analizando...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-900/40 border border-red-600/40 rounded-lg p-3 text-red-300">
                <span className="text-sm">❌ {error}</span>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-slate-600/50">
            <div className="flex gap-2">
              <input
                type="text"
                name="message"
                placeholder="Describa los síntomas del paciente..."
                disabled={isLoading}
                defaultValue={partialInput}
                className="flex-1 px-4 py-2 bg-slate-700 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-lg font-medium transition-all duration-200"
              >
                {isLoading ? '...' : 'Enviar'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Panel de Inferencias Dinámicas */}
      {showMetrics && (
        <div className="w-full lg:w-80 xl:w-96">
          <DynamicInferencePanel
            currentMessage={messages[messages.length - 1]?.content || ''}
            className="h-full"
            onInferenceUpdate={(inferences: any) => {
              console.log('🔄 Inferencias actualizadas:', inferences)
            }}
          />
        </div>
      )}
    </div>
  )
}

export default IntelligentMedicalChat
