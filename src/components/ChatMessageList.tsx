// src/components/ChatMessageList.tsx
// Pure message display component - extracted from MedicalChat.tsx
'use client'

import styles from '../styles/components/CognitiveDashboard.module.css'
import { useRef, useEffect } from 'react'
import { EnhancedMedicalMessage } from './EnhancedMedicalMessage'
import type { MedicalMessage } from '@redux-claude/cognitive-core'

interface ChatMessageListProps {
  messages: MedicalMessage[]
  isLoading: boolean
  isStreaming: boolean
  isMobile: boolean
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  isLoading,
  isStreaming,
  isMobile,
}) => {
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
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
    )
  }

  return (
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
  )
}
