// src/components/ChatInput.tsx
// Input handling component - extracted from MedicalChat.tsx
'use client'

import styles from '../styles/components/CognitiveDashboard.module.css'
import { UI_DIMENSIONS } from '../constants/magicNumbers'
import { useRef } from 'react'

interface ChatInputProps {
  input: string
  setInput: (value: string) => void
  isMobile: boolean
  keyboardVisible: boolean
  isLoading: boolean
  isStreaming: boolean
  onSubmit: (message: string) => Promise<void>
  onMobileInputFocus: () => void
  onQuickTest: () => void
  onOpenAssistant: (input: string) => void
  triggerHaptic?: (intensity: 'light' | 'medium' | 'heavy') => void
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  isMobile,
  keyboardVisible,
  isLoading,
  isStreaming,
  onSubmit,
  onMobileInputFocus,
  onQuickTest,
  onOpenAssistant,
  triggerHaptic,
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || isStreaming) return

    const messageToSend = input
    setInput('')
    await onSubmit(messageToSend)
  }

  return (
    <div className={`${styles.inputContainer} ${keyboardVisible ? styles.keyboardPadding : ''}`}>
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
                  handleSubmit(e as React.FormEvent)
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
                    Math.max(UI_DIMENSIONS.INPUT_MIN_HEIGHT, input.split('\n').length * 20 + 24),
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
  )
}
