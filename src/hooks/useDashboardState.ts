// Custom hook to manage dashboard state
import { useState } from 'react'

export type MetricsTabType =
  | 'overview'
  | 'clinical'
  | 'soap'
  | 'followup'
  | 'notes'
  | 'agents'
  | 'system'

export const useDashboardState = () => {
  const [input, setInput] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [activeMetricsTab, setActiveMetricsTab] = useState<MetricsTabType>('overview')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showMobileFab, setShowMobileFab] = useState(false)
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const [isAppLoading, setIsAppLoading] = useState(true)
  const [showMainApp, setShowMainApp] = useState(false)
  const [showMedicalAssistant, setShowMedicalAssistant] = useState(false)
  const [lastRejectedInput, setLastRejectedInput] = useState('')
  const [showDataRequiredAlert, setShowDataRequiredAlert] = useState(false)
  const [showAutoFillNotification, setShowAutoFillNotification] = useState(false)

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed)
  const toggleMobileMenu = () => setShowMobileMenu(!showMobileMenu)
  const closeMobileMenu = () => setShowMobileMenu(false)

  return {
    // State
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

    // Actions
    toggleSidebar,
    toggleMobileMenu,
    closeMobileMenu,
  }
}
