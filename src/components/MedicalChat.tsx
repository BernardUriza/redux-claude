// src/components/MedicalChat.tsx
// Chat messages display + input handling + streaming
'use client'

import styles from '../styles/components/CognitiveDashboard.module.css'
import { UI_DIMENSIONS } from '../constants/magicNumbers'
import { useRef, useEffect } from 'react'
import { EnhancedMedicalMessage } from './EnhancedMedicalMessage'
import type { MedicalMessage } from '@redux-claude/cognitive-core'

interface MedicalChatProps {
  // Chat data
  messages: MedicalMessage[]
  isLoading: boolean
  isStreaming: boolean
  // Input state
  input: string
  setInput: (value: string) => void
  // Mobile state
  isMobile: boolean
  keyboardVisible: boolean
  // Notifications
  showAutoFillNotification: boolean
  setShowAutoFillNotification: (show: boolean) => void
  showDataRequiredAlert: boolean
  setShowDataRequiredAlert: (show: boolean) => void
  // Medical extraction data
  completenessPercentage: number
  isNOMCompliant: boolean
  canProceedToSOAP: boolean
  // Event handlers
  onSubmit: (message: string) => Promise<void>
  onNewSession: () => void
  onMobileInputFocus: () => void
  onQuickTest: () => void
  onOpenAssistant: (input: string) => void
  triggerHaptic?: (intensity: 'light' | 'medium' | 'heavy') => void
}

export const MedicalChat: React.FC<MedicalChatProps> = ({
  messages,
  isLoading,
  isStreaming,
  input,
  setInput,
  isMobile,
  keyboardVisible,
  showAutoFillNotification,
  setShowAutoFillNotification,
  showDataRequiredAlert,
  setShowDataRequiredAlert,
  completenessPercentage,
  isNOMCompliant,
  canProceedToSOAP,
  onSubmit,
  onNewSession,
  onMobileInputFocus,
  onQuickTest,
  onOpenAssistant,
  triggerHaptic,
}) => {
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || isStreaming) return

    const messageToSend = input
    setInput('')
    await onSubmit(messageToSend)
  }

  return (
    <div className={styles.contentWrapper}>
      <div className={styles.chatArea}>
        {/* Chat Messages Area */}
        <div className={`${styles.messagesContainer} ${isMobile ? styles.mobile : ''}`}>
          {messages.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateContent}>
                <div className={styles.emptyStateIcon}>
                  <span className="text-2xl sm:text-3xl">🛡️</span>
                </div>
                <h3 className={styles.emptyStateTitle}>Sistema de Medicina Defensiva Activado</h3>
                <p className={styles.emptyStateDescription}>
                  Diagnósticos priorizados por <strong>gravedad</strong> sobre probabilidad
                </p>
                <div className="bg-gradient-to-r from-blue-950/30 to-purple-950/30 backdrop-blur-xl rounded-xl p-3 sm:p-4 border border-blue-700/20 shadow-xl shadow-blue-950/20 max-w-sm sm:max-w-lg mx-auto">
                  <p className="text-slate-300 text-xs leading-relaxed">
                    💡 Describe tu caso médico para análisis SOAP completo con validación defensiva
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              {messages.map((message, idx) => {
                const isLastMessage = idx === messages.length - 1
                const messageIsStreaming =
                  isLastMessage && isStreaming && message.type === 'assistant'

                return (
                  <div
                    key={message.id || idx}
                    className={`${isMobile ? 'mobile-padding mobile-spacing' : ''}`}
                  >
                    <EnhancedMedicalMessage message={message} isStreaming={messageIsStreaming} />
                  </div>
                )
              })}

              {(isLoading || isStreaming) && (
                <div className="border-b border-slate-700/50 bg-gradient-to-r from-slate-800/20 to-slate-900/30 backdrop-blur-md">
                  <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
                    <div className="flex space-x-4 sm:space-x-6">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-600 to-violet-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-600/25 border border-purple-500/30">
                          <span className="text-base sm:text-lg font-medium">🤖</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm sm:text-base font-semibold text-slate-100 mb-3 sm:mb-4">
                          Medical AI
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs sm:text-sm text-slate-300 font-medium">
                            Analyzing medical case...
                          </span>
                          <div className="flex space-x-1">
                            {[0, 150, 300].map((delay, i) => (
                              <div
                                key={i}
                                className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"
                                style={{ animationDelay: `${delay}ms` }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Fixed Bottom Section */}
        <div className={styles.inputSection}>
          {/* Nueva Sesión */}
          {messages.length > 1 && (
            <div className="border-t border-slate-700/50 px-8 py-4 bg-gradient-to-r from-slate-800/30 to-slate-900/40 backdrop-blur-md">
              <button
                onClick={() => {
                  triggerHaptic?.('light')
                  onNewSession()
                }}
                className={`text-sm text-slate-400 hover:text-slate-100 flex items-center gap-3 transition-all duration-300 group hover:bg-slate-700/30 px-4 py-2 rounded-xl border border-transparent hover:border-slate-600/30 ${isMobile ? 'touch-feedback touch-target' : ''}`}
              >
                <div className="w-5 h-5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-all duration-300">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <span className="font-medium">Nueva consulta médica</span>
              </button>
            </div>
          )}

          {/* Auto-fill notification */}
          {showAutoFillNotification && (
            <div className="bg-gradient-to-r from-green-900/80 to-emerald-900/60 border-t border-green-500/30 px-4 sm:px-6 lg:px-8 py-4 backdrop-blur-xl">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-green-400 animate-pulse"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-green-200 font-medium text-sm">
                    <span className="font-bold">🎯 Auto-fill activado!</span> Prompt médico generado
                    automáticamente
                  </p>
                  <p className="text-green-300/80 text-xs mt-1">
                    Completeness: {completenessPercentage}% • NOM Compliant:{' '}
                    {isNOMCompliant ? '✅' : '❌'} •{' '}
                    {canProceedToSOAP ? 'Listo para SOAP' : 'Procesando...'}
                  </p>
                </div>
                <button
                  onClick={() => setShowAutoFillNotification(false)}
                  className="flex-shrink-0 text-green-400 hover:text-green-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Data Required Alert */}
          {showDataRequiredAlert && (
            <div className="bg-gradient-to-r from-orange-900/80 to-red-900/60 border-t border-orange-500/30 px-4 sm:px-6 lg:px-8 py-4 backdrop-blur-xl">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-orange-400 animate-pulse"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-orange-200 font-medium text-sm">
                    <span className="font-bold">Consulta médica detectada:</span> Se requieren datos
                    del paciente para proceder con análisis seguro.
                  </p>
                  <p className="text-orange-300/80 text-xs mt-1">
                    Complete edad, género y motivo de consulta en el asistente avanzado que se ha
                    abierto.
                  </p>
                </div>
                <button
                  onClick={() => setShowDataRequiredAlert(false)}
                  className="flex-shrink-0 text-orange-400 hover:text-orange-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Input Form */}
          <div
            className={`${styles.inputContainer} ${keyboardVisible ? styles.keyboardPadding : ''}`}
          >
            <form onSubmit={handleSubmit} className={styles.inputForm}>
              <div className={styles.inputWrapper}>
                <div className="relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onFocus={onMobileInputFocus}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        e.preventDefault()
                        handleSubmit(e as any)
                      }
                    }}
                    placeholder={
                      isMobile
                        ? 'Describe tu caso médico...'
                        : 'Describe el caso clínico... Ej: Paciente 45 años, dolor torácico...'
                    }
                    className={styles.inputField}
                    disabled={isLoading || isStreaming}
                    autoComplete="off"
                    autoCapitalize="sentences"
                    autoCorrect="on"
                    rows={Math.min(Math.max(1, input.split('\n').length), 5)}
                    style={{
                      height:
                        Math.min(
                          Math.max(
                            UI_DIMENSIONS.INPUT_MIN_HEIGHT,
                            input.split('\n').length * 20 + 24
                          ),
                          UI_DIMENSIONS.INPUT_MAX_HEIGHT
                        ) + 'px',
                    }}
                  />

                  {/* Compact Action Buttons */}
                  <div className={styles.inputActions}>
                    {!isLoading && !isStreaming && (
                      <button
                        type="button"
                        onClick={onQuickTest}
                        className={`${styles.actionButton} ${styles.test}`}
                        title="Test case"
                      >
                        <span className="text-xs">🧪</span>
                      </button>
                    )}

                    {input.trim().length > 10 && !isLoading && !isStreaming && (
                      <button
                        type="button"
                        onClick={() => onOpenAssistant(input)}
                        className={`${styles.actionButton} ${styles.assistant}`}
                        title="Asistente IA"
                      >
                        <span className="text-xs">🤖</span>
                      </button>
                    )}
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl pointer-events-none opacity-0 transition-opacity duration-300 peer-focus:opacity-100" />
                </div>
              </div>
              <button
                type="submit"
                data-send-button
                disabled={isLoading || !input.trim()}
                className={`${styles.submitButton} ${isMobile ? styles.mobile : ''}`}
                onClick={() => isMobile && triggerHaptic?.('light')}
              >
                {isLoading ? (
                  <>
                    <div className={`${styles.loadingSpinner} ${isMobile ? styles.mobile : ''}`} />
                    <span>Analyzing</span>
                  </>
                ) : (
                  <>
                    <span>Send</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
