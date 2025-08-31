'use client'

import { useMedicalChat, useAssistantChat } from '@redux-claude/cognitive-core'
import React, { useRef, useEffect, useState } from 'react'
import { DynamicInferencePanel } from './DynamicInferencePanel'
import { MedicalChatMessage } from './MedicalChatMessage'
import '../styles/medical-components.css'

interface MedicalMessage {
  id: string
  content: string
  type: 'user' | 'assistant'
  role?: 'user' | 'assistant'
  timestamp?: number
  [key: string]: unknown
}

interface InferenceData {
  [key: string]: unknown
}

interface IntelligentMedicalChatProps {
  className?: string
  showMetrics?: boolean
  partialInput?: string
  onInitialResponse?: (response: string) => void
  coreType?: 'dashboard' | 'assistant'
}

const IntelligentMedicalChat: React.FC<IntelligentMedicalChatProps> = ({
  className = '',
  showMetrics = true,
  partialInput = '',
  onInitialResponse,
  coreType = 'dashboard',
}) => {
  const dashboardChat = useMedicalChat({
    onValidationFailed: (input: string, result: unknown) => {
      console.warn('[DASHBOARD] Validación médica falló:', input, result)
    },
  })

  const assistantChat = useAssistantChat({
    onValidationFailed: (input: string, result: unknown) => {
      console.warn('[ASSISTANT] Validación médica falló:', input, result)
    },
  })

  const { messages, isLoading, sendMedicalQuery, error, coreName } =
    coreType === 'assistant' ? assistantChat : dashboardChat

  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [inputValue, setInputValue] = useState('')
  const sentMessagesRef = useRef(new Set<string>())

  useEffect(() => {
    const messageKey = `${coreType}-${partialInput?.trim()}`

    if (
      partialInput &&
      partialInput.trim() &&
      !isLoading &&
      !sentMessagesRef.current.has(messageKey)
    ) {
      void sendMedicalQuery(partialInput)
      onInitialResponse?.(partialInput)
      sentMessagesRef.current.add(messageKey)
    }
  }, [partialInput, isLoading, sendMedicalQuery, onInitialResponse, coreType])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const message = inputValue.trim()

    if (message && !isLoading) {
      void sendMedicalQuery(message)
      setInputValue('')
      onInitialResponse?.(message)
    }
  }

  return (
    <div className={`h-full p-2 flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6 ${className}`}>
      {/* Chat Principal */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="medical-card overflow-hidden flex flex-col h-full">
          {/* Mensajes */}
          <div
            ref={chatContainerRef}
            className="flex-1 p-4 space-y-4 overflow-y-auto medical-scroll"
          >
            {messages.length === 0 && (
              <div className="text-center text-slate-400 py-8">
                <span className="text-4xl mb-4 block">🩺</span>
                <p>{coreName ? `[${coreName}] activo` : 'Inicie una conversación médica...'}</p>
              </div>
            )}

            {messages.map((message: MedicalMessage, index: number) => (
              <MedicalChatMessage key={message.id} message={message as any} />
            ))}

            {isLoading && (
              <div className="flex items-center gap-3 text-cyan-400">
                <div className="loading-spinner"></div>
                <span>Analizando...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-900/40 border border-red-600/40 rounded-lg p-3 text-red-300">
                <span className="text-sm">❌ {error}</span>
              </div>
            )}
          </div>

          {/* Textarea Inteligente */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-slate-600/50">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <textarea
                  name="message"
                  placeholder="Describa los síntomas del paciente..."
                  disabled={isLoading}
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e)
                    }
                  }}
                  rows={inputValue.split('\n').length || 1}
                  className="medical-textarea min-h-[44px] max-h-32"
                  style={{ 
                    minHeight: '44px',
                    height: Math.min(Math.max(44, (inputValue.split('\n').length) * 24 + 20), 128) + 'px'
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="px-6 py-3 btn-medical-secondary disabled:from-gray-500 disabled:to-gray-600 h-11 flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="loading-spinner-sm"></div>
                ) : (
                  'Enviar'
                )}
              </button>
            </div>
            <div className="mt-2 text-xs text-slate-400">
              Enter para enviar • Shift+Enter para nueva línea
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
            onInferenceUpdate={(inferences: unknown) => {
              console.log('🔄 Inferencias actualizadas:', inferences)
            }}
          />
        </div>
      )}
    </div>
  )
}

export default IntelligentMedicalChat
