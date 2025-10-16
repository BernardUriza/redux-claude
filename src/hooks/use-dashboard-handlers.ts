// src/hooks/useDashboardHandlers.ts
// Dashboard Event Handlers Hook - BRUTAL EXTRACTION
'use client'

import { useCallback } from 'react'

interface DashboardHandlersProps {
  isMedicalConsultation: (message: string) => boolean
  hasMinimumPatientData: () => boolean
  setLastRejectedInput: (input: string) => void
  setShowMedicalAssistant: (show: boolean) => void
  triggerHaptic?: (type: 'light' | 'medium' | 'heavy') => void
  sendMedicalQuery: (message: string) => Promise<void>
  newSession: () => void
  setInput: (input: string) => void
}

export const useDashboardHandlers = ({
  isMedicalConsultation,
  hasMinimumPatientData,
  setLastRejectedInput,
  setShowMedicalAssistant,
  triggerHaptic,
  sendMedicalQuery,
  newSession,
  setInput,
}: DashboardHandlersProps) => {
  // Chat submit handler with medical consultation interceptor
  const handleChatSubmit = useCallback(
    async (message: string) => {
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
    },
    [
      isMedicalConsultation,
      hasMinimumPatientData,
      setLastRejectedInput,
      setShowMedicalAssistant,
      triggerHaptic,
      sendMedicalQuery,
    ]
  )

  // Mobile FAB handler (placeholder for focus handling in MedicalChat)
  const handleMobileFab = useCallback(() => {
    // Focus will be handled by MedicalChat component
  }, [])

  // New session handler
  const handleNewSession = useCallback(() => {
    triggerHaptic?.('light')
    newSession()
  }, [triggerHaptic, newSession])

  // Mobile menu action handler
  const handleMobileMenuAction = useCallback((action: string) => {
    console.log('Mobile menu action:', action)
  }, [])

  // Medical assistant handlers
  const handleAssistantClose = useCallback(() => {
    setShowMedicalAssistant(false)
    setLastRejectedInput('')
  }, [setShowMedicalAssistant, setLastRejectedInput])

  const handleAssistantTemplate = useCallback(
    (template: string) => {
      setInput(template)
      setShowMedicalAssistant(false)
      setLastRejectedInput('')
    },
    [setInput, setShowMedicalAssistant, setLastRejectedInput]
  )

  const handleOpenAssistant = useCallback(
    (input: string) => {
      setLastRejectedInput(input)
      setShowMedicalAssistant(true)
    },
    [setLastRejectedInput, setShowMedicalAssistant]
  )

  return {
    handleChatSubmit,
    handleMobileFab,
    handleNewSession,
    handleMobileMenuAction,
    handleAssistantClose,
    handleAssistantTemplate,
    handleOpenAssistant,
  }
}
