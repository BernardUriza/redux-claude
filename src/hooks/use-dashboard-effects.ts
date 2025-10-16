// src/hooks/useDashboardEffects.ts
// Dashboard Side Effects Hook - BRUTAL EXTRACTION
'use client'

import { useEffect } from 'react'

interface DashboardEffectsProps {
  isMobile: boolean
  messages: unknown[]
  isLoading: boolean
  isStreaming: boolean
  setKeyboardVisible: (visible: boolean) => void
  setShowMobileFab: (show: boolean) => void
}

export const useDashboardEffects = ({
  isMobile,
  messages,
  isLoading,
  isStreaming,
  setKeyboardVisible,
  setShowMobileFab,
}: DashboardEffectsProps) => {
  // Mobile keyboard detection effect
  useEffect(() => {
    if (!isMobile) return

    const handleResize = () => {
      const windowHeight = window.innerHeight
      const screenHeight = window.screen.height
      const keyboardHeight = screenHeight - windowHeight
      setKeyboardVisible(keyboardHeight > 100)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isMobile, setKeyboardVisible])

  // Mobile FAB visibility effect
  useEffect(() => {
    if (!isMobile) {
      setShowMobileFab(false)
      return
    }
    setShowMobileFab(messages.length > 0 && !isLoading && !isStreaming)
  }, [isMobile, messages.length, isLoading, isStreaming, setShowMobileFab])
}
