// src/components/CognitiveDashboard.tsx
// Sistema Cognitivo Médico Corporativo 2025 - Bernard Orozco (REFACTORED)
'use client'

import { useMedicalChat } from '@redux-claude/cognitive-core'

// Extracted Components
import { LoadingScreen } from './LoadingScreen'
import { DashboardContainer } from './DashboardContainer'

// Extracted Hooks
import { useMobileInteractions } from '../hooks/useMobileInteractions'
import { useDashboardState } from '../hooks/useDashboardState'
import { useMedicalDataOrchestrator } from '../hooks/useMedicalDataOrchestrator'
import { useUrgencyData } from '../hooks/useUrgencyData'
import { useDashboardHandlers } from '../hooks/useDashboardHandlers'
import { useDashboardEffects } from '../hooks/useDashboardEffects'
import { useCognitiveMetrics } from '../hooks/useCognitiveMetrics'

// Main Cognitive Dashboard Component - BRUTAL ORCHESTRATOR

export const CognitiveDashboard = () => {
  // Dashboard state management
  const dashboardState = useDashboardState()
  const {
    input,
    setInput,
    sidebarCollapsed,
    setSidebarCollapsed,
    activeMetricsTab,
    setActiveMetricsTab,
    showMobileMenu,
    setShowMobileMenu,
    showMobileFab,
    setShowMobileFab,
    keyboardVisible,
    setKeyboardVisible,
    isAppLoading,
    setIsAppLoading,
    showMainApp,
    setShowMainApp,
    showMedicalAssistant,
    setShowMedicalAssistant,
    lastRejectedInput,
    setLastRejectedInput,
    showDataRequiredAlert,
    setShowDataRequiredAlert,
    showAutoFillNotification,
    setShowAutoFillNotification,
  } = dashboardState

  // Mobile interactions hook
  const { state: mobileState, triggerHaptic, handleMobileInputFocus } = useMobileInteractions()

  // Medical chat hook
  const { messages, isLoading, isStreaming, sendMedicalQuery, newSession } = useMedicalChat({
    onValidationFailed: (input, _validationResult) => {
      setLastRejectedInput(input)
      setTimeout(() => setShowMedicalAssistant(true), 1500)
    },
  })

  // Medical data orchestrator hook
  const {
    completenessPercentage,
    isNOMCompliant,
    canProceedToSOAP,
    isMedicalConsultation,
    hasMinimumPatientData,
    handleAutoFillTest,
  } = useMedicalDataOrchestrator({
    input,
    setInput,
    onAutoFillComplete: () => {
      setShowAutoFillNotification(true)
      setTimeout(() => setShowAutoFillNotification(false), 5000)
    },
  })

  // Urgency data hook
  const { urgencyData } = useUrgencyData(messages)

  // Cognitive metrics hook
  const { cognitiveMetrics, lastMessage } = useCognitiveMetrics(messages)

  // Dashboard effects hook
  useDashboardEffects({
    isMobile: mobileState.isMobile,
    messages,
    isLoading,
    isStreaming,
    setKeyboardVisible,
    setShowMobileFab,
  })

  // Dashboard handlers hook
  const {
    handleChatSubmit,
    handleMobileFab,
    handleNewSession,
    handleMobileMenuAction,
    handleAssistantClose,
    handleAssistantTemplate,
    handleOpenAssistant,
  } = useDashboardHandlers({
    isMedicalConsultation,
    hasMinimumPatientData,
    setLastRejectedInput,
    setShowMedicalAssistant,
    triggerHaptic,
    sendMedicalQuery,
    newSession,
    setInput,
  })

  // Loading completion handler
  const handleLoadingComplete = () => {
    setIsAppLoading(false)
    setTimeout(() => setShowMainApp(true), 100)
  }

  // Show loading screen if app is loading
  if (isAppLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} duration={3000} />
  }

  return (
    <DashboardContainer
      // Layout props
      sidebarCollapsed={sidebarCollapsed}
      setSidebarCollapsed={setSidebarCollapsed}
      showMobileMenu={showMobileMenu}
      setShowMobileMenu={setShowMobileMenu}
      isMobile={mobileState.isMobile}
      keyboardVisible={keyboardVisible}
      showMainApp={showMainApp}
      // Data props
      cognitiveMetrics={cognitiveMetrics}
      urgencyData={urgencyData}
      messages={messages}
      lastMessage={lastMessage}
      isStreaming={isStreaming}
      isLoading={isLoading}
      // Input props
      input={input}
      setInput={setInput}
      // Metrics panel props
      activeMetricsTab={activeMetricsTab}
      setActiveMetricsTab={setActiveMetricsTab}
      // Medical chat props
      showAutoFillNotification={showAutoFillNotification}
      setShowAutoFillNotification={setShowAutoFillNotification}
      showDataRequiredAlert={showDataRequiredAlert}
      setShowDataRequiredAlert={setShowDataRequiredAlert}
      completenessPercentage={completenessPercentage}
      isNOMCompliant={isNOMCompliant}
      canProceedToSOAP={canProceedToSOAP}
      // Mobile props
      showMobileFab={showMobileFab}
      showMedicalAssistant={showMedicalAssistant}
      lastRejectedInput={lastRejectedInput}
      // Handlers
      onMobileMenuAction={handleMobileMenuAction}
      onChatSubmit={handleChatSubmit}
      onNewSession={handleNewSession}
      onMobileInputFocus={handleMobileInputFocus}
      onQuickTest={handleAutoFillTest}
      onOpenAssistant={handleOpenAssistant}
      onMobileFab={handleMobileFab}
      onAssistantClose={handleAssistantClose}
      onAssistantTemplate={handleAssistantTemplate}
      triggerHaptic={triggerHaptic}
    />
  )
}
