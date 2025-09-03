// src/components/DashboardLayout.tsx
// Layout orchestrator - refactored for single responsibility
'use client'

import styles from '../styles/components/CognitiveDashboard.module.css'
import type { UrgencyData } from './UrgencyIndicator'
import { MobileMenu } from './MobileMenu'
import { Sidebar } from './Sidebar'
import { AppHeader } from './AppHeader'

interface DashboardLayoutProps {
  children: React.ReactNode
  // Sidebar state
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  // Mobile menu state
  showMobileMenu: boolean
  setShowMobileMenu: (show: boolean) => void
  // Mobile state
  isMobile: boolean
  keyboardVisible: boolean
  showMainApp: boolean
  // Cognitive metrics
  cognitiveMetrics?: {
    systemConfidence: number
    activeDebates: number
  } | null
  // Urgency data for header badges
  urgencyData: UrgencyData
  messagesCount: number
  // Event handlers
  onNewConsultation: () => void
  onMobileMenuAction: (action: string) => void
  triggerHaptic?: (intensity: 'light' | 'medium' | 'heavy') => void
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  sidebarCollapsed,
  setSidebarCollapsed,
  showMobileMenu,
  setShowMobileMenu,
  isMobile,
  keyboardVisible,
  showMainApp,
  cognitiveMetrics,
  urgencyData,
  messagesCount: _messagesCount,
  onNewConsultation,
  onMobileMenuAction,
  triggerHaptic,
}) => {
  return (
    <div
      className={`${styles.dashboard} ${showMainApp ? styles.visible : styles.hidden} ${isMobile ? styles.mobile : ''} ${keyboardVisible ? styles.keyboardVisible : ''}`}
    >
      <MobileMenu
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        cognitiveMetrics={cognitiveMetrics}
        onMobileMenuAction={onMobileMenuAction}
        triggerHaptic={triggerHaptic}
      />

      <Sidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        cognitiveMetrics={cognitiveMetrics}
        onNewConsultation={onNewConsultation}
      />

      <div className={styles.mainContent}>
        <AppHeader
          showMobileMenu={showMobileMenu}
          setShowMobileMenu={setShowMobileMenu}
          urgencyData={urgencyData}
          triggerHaptic={triggerHaptic}
        />

        {/* Main content area */}
        {children}
      </div>
    </div>
  )
}
