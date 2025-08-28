// 🏥 Asistente Médico Inteligente - Solo hooks del package
// Creado por Bernard Orozco - Sin estado local, solo servicios

import React, { useRef } from 'react'
import { useMedicalChat } from '@redux-claude/cognitive-core'
import { DynamicInferencePanel } from './DynamicInferencePanel'
import { MedicalChatMessage } from './MedicalChatMessage'

export interface IntelligentMedicalChatProps {
  className?: string
  showMetrics?: boolean
  partialInput?: string
  onInitialResponse?: (response: string) => void
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
}) => {
  // 🧠 SOLO HOOK DEL PACKAGE - Sin estado local
  const {
    messages,
    isLoading,
    sendMedicalQuery,
    error,
  } = useMedicalChat({
    onValidationFailed: (input, result) => {
      console.warn('Validación médica falló:', input, result)
    }
  })

  const chatContainerRef = useRef<HTMLDivElement>(null)

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
    <div className={`h-full flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6 ${className}`}>
      {/* Chat Principal */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-600/50 overflow-hidden flex flex-col h-full">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-4 border-b border-slate-600/50">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-xl">
                <span className="text-xl">🦁</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-cyan-300">Chat Médico IA</h3>
                <p className="text-slate-300 text-sm">Asistente inteligente - Solo hooks del package</p>
              </div>
            </div>
          </div>

          {/* Mensajes */}
          <div 
            ref={chatContainerRef}
            className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600"
          >
            {messages.length === 0 && (
              <div className="text-center text-slate-400 py-8">
                <span className="text-4xl mb-4 block">🩺</span>
                <p>Inicie una conversación médica...</p>
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