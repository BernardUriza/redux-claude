'use client'

import { useMedicalChat, useAssistantChat } from '@redux-claude/cognitive-core'
import React, { useRef, useEffect, useState } from 'react'
import { DynamicInferencePanel } from './DynamicInferencePanel'
import { MedicalChatMessage } from './MedicalChatMessage'
import styles from '../styles/components/IntelligentMedicalChat.module.css'

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
    <div className={`${styles.intelligentChat} ${className}`}>
      {/* Chat Principal */}
      <div className={styles.chatMain}>
        <div className={styles.chatCard}>
          {/* Mensajes */}
          <div
            ref={chatContainerRef}
            className={styles.messagesArea}
          >
            {messages.length === 0 && (
              <div className={styles.emptyState}>
                <span className={styles.emptyStateIcon}>🩺</span>
                <p className={styles.emptyStateText}>
                  {coreName ? (
                    <><span className={styles.coreNameBadge}>{coreName}</span> activo</>
                  ) : (
                    'Inicie una conversación médica...'
                  )}
                </p>
              </div>
            )}

            <div className={styles.messageWrapper}>
              {messages.map((message, index: number) => (
                <div 
                  key={message.id} 
                  className={styles.messageItem} 
                  style={{ '--message-index': index } as React.CSSProperties}
                >
                  <MedicalChatMessage message={message} />
                </div>
              ))}
            </div>

            {isLoading && (
              <div className={`${styles.statusBadge} ${styles.loading}`}>
                <div className={`${styles.statusIndicator} ${styles.loading}`}></div>
                <span>Analizando...</span>
              </div>
            )}

            {error && (
              <div className={styles.errorContainer}>
                <span className={styles.errorText}>
                  <span className={styles.errorIcon}>❌</span>
                  {error}
                </span>
              </div>
            )}
          </div>

          {/* Textarea Inteligente */}
          <div className={styles.inputArea}>
            <form onSubmit={handleSubmit} className={styles.inputForm}>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  name="message"
                  placeholder="Describa los síntomas del paciente..."
                  disabled={isLoading}
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  className={styles.chatInput}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className={styles.sendButton}
              >
                {isLoading ? (
                  <div className={styles.loadingSpinner}></div>
                ) : (
                  'Enviar'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Panel de Inferencias Dinámicas */}
      {showMetrics && (
        <div className={styles.sidePanel}>
          <div className={styles.sidePanelHeader}>
            <h3 className={styles.sidePanelTitle}>
              <span>📊</span>
              Panel de Inferencias
            </h3>
          </div>
          <div className={styles.sidePanelContent}>
            <DynamicInferencePanel
              currentMessage={messages[messages.length - 1]?.content || ''}
              className="h-full"
              onInferenceUpdate={(inferences: unknown) => {
                console.log('🔄 Inferencias actualizadas:', inferences)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default IntelligentMedicalChat
