// src/components/MedicalChat.tsx
// Orchestration component - refactored for single responsibility
'use client'

import styles from '../styles/components/CognitiveDashboard.module.css'
import type { MedicalMessage } from '@redux-claude/cognitive-core'
import { ChatMessageList } from './ChatMessageList'
import { ChatNotifications } from './ChatNotifications'
import { ChatInput } from './ChatInput'
import { NewSessionButton } from './NewSessionButton'

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
  return (
    <div className={styles.contentWrapper}>
      <div className={styles.chatArea}>
        {/* Chat Messages Area */}
        <div className={`${styles.messagesContainer} ${isMobile ? styles.mobile : ''}`}>
          <ChatMessageList
            messages={messages}
            isLoading={isLoading}
            isStreaming={isStreaming}
            isMobile={isMobile}
          />
        </div>

        {/* Fixed Bottom Section */}
        <div className={styles.inputSection}>
          <NewSessionButton
            messagesCount={messages.length}
            isMobile={isMobile}
            onNewSession={onNewSession}
            triggerHaptic={triggerHaptic}
          />

          <ChatNotifications
            showAutoFillNotification={showAutoFillNotification}
            setShowAutoFillNotification={setShowAutoFillNotification}
            showDataRequiredAlert={showDataRequiredAlert}
            setShowDataRequiredAlert={setShowDataRequiredAlert}
            completenessPercentage={completenessPercentage}
            isNOMCompliant={isNOMCompliant}
            canProceedToSOAP={canProceedToSOAP}
          />

          <ChatInput
            input={input}
            setInput={setInput}
            isMobile={isMobile}
            keyboardVisible={keyboardVisible}
            isLoading={isLoading}
            isStreaming={isStreaming}
            onSubmit={onSubmit}
            onMobileInputFocus={onMobileInputFocus}
            onQuickTest={onQuickTest}
            onOpenAssistant={onOpenAssistant}
            triggerHaptic={triggerHaptic}
          />
        </div>
      </div>
    </div>
  )
}
