// src/components/DashboardContainer.tsx
// Dashboard UI Container - BRUTAL JSX EXTRACTION
'use client'

import { DashboardLayout } from './DashboardLayout'
import { MedicalMetricsPanel } from './MedicalMetricsPanel'
import { MobileInteractionLayer } from './MobileInteractionLayer'
import MedicalAssistant from './MedicalAssistant'
import type { ActiveMetricsTab } from '../types/dashboard'

// Wrapper para MedicalChat con props agrupadas
const MedicalChatWrapper = ({
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
}: {
  messages: unknown[]
  isLoading: boolean
  isStreaming: boolean
  onQuickTest: () => void
  onOpenAssistant: (input: string) => void
  triggerHaptic?: (type: 'light' | 'medium' | 'heavy') => void
}) => {
  const { MedicalChat } = require('./MedicalChat')
  return (
    <MedicalChat
      messages={messages}
      isLoading={isLoading}
      isStreaming={isStreaming}
      input={input}
      setInput={setInput}
      isMobile={isMobile}
      keyboardVisible={keyboardVisible}
      showAutoFillNotification={showAutoFillNotification}
      setShowAutoFillNotification={setShowAutoFillNotification}
      showDataRequiredAlert={showDataRequiredAlert}
      setShowDataRequiredAlert={setShowDataRequiredAlert}
      completenessPercentage={completenessPercentage}
      isNOMCompliant={isNOMCompliant}
      canProceedToSOAP={canProceedToSOAP}
      onSubmit={onSubmit}
      onNewSession={onNewSession}
      onMobileInputFocus={onMobileInputFocus}
      onQuickTest={onQuickTest}
      onOpenAssistant={onOpenAssistant}
      triggerHaptic={triggerHaptic}
    />
  )
}

// Componente para el Modal de Asistente Médico
const MedicalAssistantModal = ({
  isVisible,
  partialInput: _partialInput,
  input,
  lastRejectedInput,
  onClose,
  onSelectTemplate,
}: {
  isVisible: boolean
  partialInput: string
  input: string
  lastRejectedInput: string | null
  onClose: () => void
  onSelectTemplate: (template: string) => void
}) => (
  <MedicalAssistant
    partialInput={lastRejectedInput || input}
    isVisible={isVisible}
    onClose={onClose}
    onSelectTemplate={onSelectTemplate}
  />
)

interface DashboardContainerProps {
  // Layout props
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  showMobileMenu: boolean
  setShowMobileMenu: (show: boolean) => void
  isMobile: boolean
  keyboardVisible: boolean
  showMainApp: boolean

  // Data props
  cognitiveMetrics: unknown
  urgencyData: unknown
  messages: unknown[]
  lastMessage: unknown
  isStreaming: boolean
  isLoading: boolean

  // Input props
  input: string
  setInput: (input: string) => void

  // Metrics panel props
  activeMetricsTab: ActiveMetricsTab
  setActiveMetricsTab: (tab: ActiveMetricsTab) => void

  // Medical chat props
  showAutoFillNotification: boolean
  setShowAutoFillNotification: (show: boolean) => void
  showDataRequiredAlert: boolean
  setShowDataRequiredAlert: (show: boolean) => void
  completenessPercentage: number
  isNOMCompliant: boolean
  canProceedToSOAP: boolean

  // Mobile props
  showMobileFab: boolean
  showMedicalAssistant: boolean
  lastRejectedInput: string | null

  // Handlers
  onMobileMenuAction: (action: string) => void
  onChatSubmit: (message: string) => Promise<void>
  onNewSession: () => void
  onMobileInputFocus: () => void
  onQuickTest: () => void
  onOpenAssistant: (input: string) => void
  onMobileFab: () => void
  onAssistantClose: () => void
  onAssistantTemplate: (template: string) => void
  triggerHaptic?: (type: 'light' | 'medium' | 'heavy') => void
}

export const DashboardContainer = ({
  // Layout props
  sidebarCollapsed,
  setSidebarCollapsed,
  showMobileMenu,
  setShowMobileMenu,
  isMobile,
  keyboardVisible,
  showMainApp,

  // Data props
  cognitiveMetrics,
  urgencyData,
  messages,
  lastMessage,
  isStreaming,
  isLoading,

  // Input props
  input,
  setInput,

  // Metrics panel props
  activeMetricsTab,
  setActiveMetricsTab,

  // Medical chat props
  showAutoFillNotification,
  setShowAutoFillNotification,
  showDataRequiredAlert,
  setShowDataRequiredAlert,
  completenessPercentage,
  isNOMCompliant,
  canProceedToSOAP,

  // Mobile props
  showMobileFab,
  showMedicalAssistant,
  lastRejectedInput,

  // Handlers
  onMobileMenuAction,
  onChatSubmit,
  onNewSession,
  onMobileInputFocus,
  onQuickTest,
  onOpenAssistant,
  onMobileFab,
  onAssistantClose,
  onAssistantTemplate,
  triggerHaptic,
}: DashboardContainerProps) => (
  <>
    <DashboardLayout
      sidebarCollapsed={sidebarCollapsed}
      setSidebarCollapsed={setSidebarCollapsed}
      showMobileMenu={showMobileMenu}
      setShowMobileMenu={setShowMobileMenu}
      isMobile={isMobile}
      keyboardVisible={keyboardVisible}
      showMainApp={showMainApp}
      cognitiveMetrics={cognitiveMetrics}
      urgencyData={urgencyData}
      messagesCount={messages.length}
      onNewConsultation={() => setInput('')}
      onMobileMenuAction={onMobileMenuAction}
      triggerHaptic={triggerHaptic}
    >
      {/* Medical Metrics Panel */}
      <MedicalMetricsPanel
        sidebarCollapsed={sidebarCollapsed}
        activeMetricsTab={activeMetricsTab}
        setActiveMetricsTab={setActiveMetricsTab}
        isMobile={isMobile}
        cognitiveMetrics={cognitiveMetrics}
        urgencyData={urgencyData}
        messagesCount={messages.length}
        lastMessage={lastMessage}
        isStreaming={isStreaming}
        triggerHaptic={triggerHaptic}
      />

      {/* Medical Chat */}
      <MedicalChatWrapper
        messages={messages}
        isLoading={isLoading}
        isStreaming={isStreaming}
        input={input}
        setInput={setInput}
        isMobile={isMobile}
        keyboardVisible={keyboardVisible}
        showAutoFillNotification={showAutoFillNotification}
        setShowAutoFillNotification={setShowAutoFillNotification}
        showDataRequiredAlert={showDataRequiredAlert}
        setShowDataRequiredAlert={setShowDataRequiredAlert}
        completenessPercentage={completenessPercentage}
        isNOMCompliant={isNOMCompliant}
        canProceedToSOAP={canProceedToSOAP}
        onSubmit={onChatSubmit}
        onNewSession={onNewSession}
        onMobileInputFocus={onMobileInputFocus}
        onQuickTest={onQuickTest}
        onOpenAssistant={onOpenAssistant}
        triggerHaptic={triggerHaptic}
      />
    </DashboardLayout>

    {/* Mobile Interaction Layer */}
    <MobileInteractionLayer
      isMobile={isMobile}
      showMobileFab={showMobileFab}
      onFabClick={onMobileFab}
      triggerHaptic={triggerHaptic}
    />

    {/* Medical Assistant Modal */}
    <MedicalAssistantModal
      isVisible={showMedicalAssistant}
      partialInput={lastRejectedInput || input}
      input={input}
      lastRejectedInput={lastRejectedInput}
      onClose={onAssistantClose}
      onSelectTemplate={onAssistantTemplate}
    />
  </>
)
