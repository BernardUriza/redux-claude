// src/components/CognitiveDashboard.tsx
// Sistema Cognitivo Médico Corporativo 2025 - Bernard Orozco (REFACTORED)
'use client'

import { useEffect } from 'react'
import { useMedicalChat, type RootState } from '@redux-claude/cognitive-core'
import { useSelector } from 'react-redux'

// Refactored Components
import { DashboardLayout } from './DashboardLayout'
import { MedicalChat } from './MedicalChat'
import { MedicalMetricsPanel } from './MedicalMetricsPanel'
import { MobileInteractionLayer } from './MobileInteractionLayer'
import { LoadingScreen } from './LoadingScreen'
import MedicalAssistant from './MedicalAssistant'

// Refactored Hooks
import { useMobileInteractions } from '../hooks/useMobileInteractions'
import { useDashboardState } from '../hooks/useDashboardState'
import { useMedicalDataOrchestrator } from '../hooks/useMedicalDataOrchestrator'
import { useUrgencyData } from '../hooks/useUrgencyData'

// Constants for cognitive metrics calculation
const PERCENTAGE_MULTIPLIER = 100
const DEFAULT_CONFIDENCE_FALLBACK = 0

// Main Cognitive Dashboard Component - REFACTORED ORCHESTRATOR
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

  // Cognitive metrics from Redux store
  const medicalState = useSelector((state: RootState) => state.medicalChat)
  const currentExtraction = medicalState.medicalExtraction?.currentExtraction
  const hasActiveSOAP = false // TODO: Replace with actual SOAP check when available

  // Only populate metrics if we have an active SOAP
  const cognitiveMetrics = hasActiveSOAP
    ? {
        systemConfidence: Math.round(
          (currentExtraction?.extraction_metadata?.overall_completeness_percentage ||
            DEFAULT_CONFIDENCE_FALLBACK) * PERCENTAGE_MULTIPLIER
        ),
        activeDebates: DEFAULT_CONFIDENCE_FALLBACK,
      }
    : null

  // Get last message for components
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : undefined

  // Loading completion handler
  const handleLoadingComplete = () => {
    setIsAppLoading(false)
    setTimeout(() => setShowMainApp(true), 100)
  }

  // Mobile keyboard detection
  useEffect(() => {
    if (!mobileState.isMobile) return

    const handleResize = () => {
      const windowHeight = window.innerHeight
      const screenHeight = window.screen.height
      const keyboardHeight = screenHeight - windowHeight
      setKeyboardVisible(keyboardHeight > 100)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [mobileState.isMobile, setKeyboardVisible])

  // Show/hide mobile FAB based on scroll and messages
  useEffect(() => {
    if (!mobileState.isMobile) {
      setShowMobileFab(false)
      return
    }
    setShowMobileFab(messages.length > 0 && !isLoading && !isStreaming)
  }, [mobileState.isMobile, messages.length, isLoading, isStreaming, setShowMobileFab])

  // Event handlers
  const handleChatSubmit = async (message: string) => {
    // Medical consultation interceptor
    const isMedical = isMedicalConsultation(message)
    const hasPatientData = hasMinimumPatientData()

    console.log('🛡️ INTERCEPTOR DEBUG:', {
      input: message.substring(0, 50) + '...',
      isMedical,
      hasPatientData,
      shouldBlock: isMedical && !hasPatientData,
    })

    if (isMedical) {
      console.log('🦁 ACTIVANDO CHAT MÉDICO INTELIGENTE')
      setLastRejectedInput(message)
      setShowMedicalAssistant(true)
      triggerHaptic?.('light')
      return
    }

    await sendMedicalQuery(message)
  }

  const handleMobileFab = () => {
    // Focus will be handled by MedicalChat component
  }

  const handleNewSession = () => {
    triggerHaptic?.('light')
    newSession()
  }

  const handleMobileMenuAction = (action: string) => {
    // Handle mobile menu actions
    console.log('Mobile menu action:', action)
  }

  // Show loading screen if app is loading
  if (isAppLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} duration={3000} />
  }

  return (
    <>
      <DashboardLayout
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        isMobile={mobileState.isMobile}
        keyboardVisible={keyboardVisible}
        showMainApp={showMainApp}
        cognitiveMetrics={cognitiveMetrics}
        urgencyData={urgencyData}
        messagesCount={messages.length}
        onNewConsultation={() => setInput('')}
        onMobileMenuAction={handleMobileMenuAction}
        triggerHaptic={triggerHaptic}
      >
        {/* Medical Metrics Panel */}
        <MedicalMetricsPanel
          sidebarCollapsed={sidebarCollapsed}
          activeMetricsTab={activeMetricsTab}
          setActiveMetricsTab={setActiveMetricsTab}
          isMobile={mobileState.isMobile}
          cognitiveMetrics={cognitiveMetrics}
          urgencyData={urgencyData}
          messagesCount={messages.length}
          lastMessage={lastMessage}
          isStreaming={isStreaming}
          triggerHaptic={triggerHaptic}
        />

        {/* Medical Chat */}
        <MedicalChat
          messages={messages}
          isLoading={isLoading}
          isStreaming={isStreaming}
          input={input}
          setInput={setInput}
          isMobile={mobileState.isMobile}
          keyboardVisible={keyboardVisible}
          showAutoFillNotification={showAutoFillNotification}
          setShowAutoFillNotification={setShowAutoFillNotification}
          showDataRequiredAlert={showDataRequiredAlert}
          setShowDataRequiredAlert={setShowDataRequiredAlert}
          completenessPercentage={completenessPercentage}
          isNOMCompliant={isNOMCompliant}
          canProceedToSOAP={canProceedToSOAP}
          onSubmit={handleChatSubmit}
          onNewSession={handleNewSession}
          onMobileInputFocus={handleMobileInputFocus}
          onQuickTest={handleAutoFillTest}
          onOpenAssistant={input => {
            setLastRejectedInput(input)
            setShowMedicalAssistant(true)
          }}
          triggerHaptic={triggerHaptic}
        />
      </DashboardLayout>

      {/* Mobile Interaction Layer */}
      <MobileInteractionLayer
        isMobile={mobileState.isMobile}
        showMobileFab={showMobileFab}
        onFabClick={handleMobileFab}
        triggerHaptic={triggerHaptic}
      />

      {/* Medical Assistant Modal */}
      <MedicalAssistant
        partialInput={lastRejectedInput || input}
        isVisible={showMedicalAssistant}
        onClose={() => {
          setShowMedicalAssistant(false)
          setLastRejectedInput('')
        }}
        onSelectTemplate={(template: string) => {
          setInput(template)
          setShowMedicalAssistant(false)
          setLastRejectedInput('')
        }}
      />
    </>
  )
}
