// src/components/DashboardLayout.tsx
// Layout container - Sidebar + Header + Mobile Menu
'use client'

import styles from '../styles/components/CognitiveDashboard.module.css'
import type { UrgencyData } from './UrgencyIndicator'

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
  messagesCount,
  onNewConsultation,
  onMobileMenuAction,
  triggerHaptic,
}) => {
  return (
    <div
      className={`${styles.dashboard} ${showMainApp ? styles.visible : styles.hidden} ${isMobile ? styles.mobile : ''} ${keyboardVisible ? styles.keyboardVisible : ''}`}
    >
      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className={styles.mobileMenuOverlay} onClick={() => setShowMobileMenu(false)}>
          <div
            className={`${styles.mobileMenu} ${showMobileMenu ? styles.open : ''}`}
            onClick={e => e.stopPropagation()}
          >
            {/* Mobile Menu Header */}
            <div className="p-4 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <span className="text-white text-sm font-bold">🏥</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-white">Medical AI</h1>
                    <p className="text-xs text-slate-400">Cognitive Assistant</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors duration-200 text-slate-400 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobile Menu Content */}
            <div className="flex-1 p-4">
              <div className="space-y-3">
                {['treatment', 'diagnostics', 'analytics'].map(action => (
                  <button
                    key={action}
                    className="w-full flex items-center space-x-3 px-3 py-3 text-slate-300 hover:bg-slate-800/50 rounded-xl transition-all duration-200 hover:text-white touch-feedback touch-target"
                    onClick={() => {
                      triggerHaptic?.('light')
                      setShowMobileMenu(false)
                      onMobileMenuAction(action)
                    }}
                  >
                    <span className="text-lg">
                      {action === 'treatment' ? '💊' : action === 'diagnostics' ? '🔍' : '📊'}
                    </span>
                    <span className="text-sm font-medium">
                      {action === 'treatment'
                        ? 'Treatment Plans'
                        : action === 'diagnostics'
                          ? 'Diagnostics'
                          : 'Analytics'}
                    </span>
                  </button>
                ))}
              </div>

              {/* System Status in Mobile */}
              <div className="mt-6 bg-gradient-to-br from-slate-800/60 to-slate-900/80 backdrop-blur-xl rounded-xl p-4 border border-slate-600/30">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-sm text-slate-300 font-medium">System Online</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-400">
                    <span>Confidence:</span>
                    <span className="text-emerald-400 font-medium">
                      {cognitiveMetrics?.systemConfidence || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Agents:</span>
                    <span className="text-blue-400 font-medium">5/5 active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Collapsible Sidebar - Hidden on mobile */}
      <div className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : styles.expanded}`}>
        {/* Enhanced Sidebar Header */}
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarHeaderContent}>
            <div
              className={`flex items-center space-x-3 ${sidebarCollapsed ? 'justify-center' : ''}`}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <span className="text-white text-sm font-bold">🏥</span>
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h1 className={styles.sidebarTitle}>Medical AI</h1>
                  <p className={styles.sidebarSubtitle}>Cognitive Assistant</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors duration-200 text-slate-400 hover:text-white"
              title={sidebarCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
            >
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${sidebarCollapsed ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Enhanced New Chat Button */}
        <div className="p-4">
          <button
            onClick={onNewConsultation}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl border border-emerald-500/30 transition-all duration-300 shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40`}
            title={sidebarCollapsed ? 'Nueva consulta' : ''}
          >
            <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            {!sidebarCollapsed && (
              <span className="text-sm font-medium text-white">New consultation</span>
            )}
          </button>
        </div>

        {/* Enhanced System Status */}
        <div className="px-4 py-2">
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/80 backdrop-blur-xl rounded-xl p-3 border border-slate-600/30">
            {!sidebarCollapsed ? (
              <>
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-xs text-slate-300 font-medium">System Online</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Confidence:</span>
                    <span className="text-emerald-400 font-medium">
                      {cognitiveMetrics?.systemConfidence || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Agents:</span>
                    <span className="text-blue-400 font-medium">5/5 active</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs text-emerald-400 font-bold">
                  {cognitiveMetrics?.systemConfidence || 0}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Navigation */}
        <div className="flex-1 p-4">
          <nav className="space-y-2">
            {[
              { icon: '💊', label: 'Treatment Plans' },
              { icon: '🔍', label: 'Diagnostics' },
              { icon: '📊', label: 'Analytics' },
            ].map((item, index) => (
              <button
                key={index}
                className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-3 text-slate-300 hover:bg-slate-800/50 rounded-xl transition-all duration-200 hover:text-white group w-full`}
                title={sidebarCollapsed ? item.label : ''}
              >
                <span className="text-lg">{item.icon}</span>
                {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            ))}
          </nav>
        </div>

        {/* Enhanced Bottom Info */}
        <div className="p-4 border-t border-slate-700/50">
          {!sidebarCollapsed ? (
            <div className="text-xs text-slate-500 space-y-1">
              <p className="font-medium text-slate-400">Built by Bernard Orozco</p>
              <p>Powered by Claude AI</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-xs">🤖</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Header */}
      <div className={styles.mainContent}>
        <div className={styles.chatHeader}>
          <div className={styles.chatHeaderContent}>
            <div className={styles.chatHeaderLeft}>
              {/* Mobile Menu Button */}
              <button
                onClick={() => {
                  triggerHaptic?.('light')
                  setShowMobileMenu(!showMobileMenu)
                }}
                className="lg:hidden p-2 hover:bg-slate-800/50 rounded-lg transition-colors text-slate-400 hover:text-white touch-feedback touch-target"
                title="Menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              <div className={styles.headerIcon}>
                <span className="text-white text-base sm:text-lg">🧠</span>
              </div>
              <div>
                <h2 className={styles.headerTitle}>Medical AI</h2>
                <p className={`${styles.headerSubtitle} hidden sm:block`}>
                  Motor Iterativo + Orquestador Cognitivo v2.0
                </p>
                <p className={`${styles.headerSubtitle} sm:hidden`}>Sistema Cognitivo</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-3">
              <div className="px-2 sm:px-3 py-1 bg-emerald-900/30 border border-emerald-700 rounded-full hidden sm:block">
                <span className="text-xs text-emerald-400 font-medium">Sistema Optimizado</span>
              </div>
              <div className="px-2 sm:px-3 py-1 bg-purple-900/30 border border-purple-700 rounded-full">
                <span className="text-xs text-purple-400 font-medium">Fase 3</span>
              </div>
              {urgencyData.level !== 'low' && (
                <div
                  className={`px-2 sm:px-3 py-1 rounded-full border ${
                    urgencyData.level === 'critical'
                      ? 'bg-red-900/30 border-red-700 text-red-400'
                      : urgencyData.level === 'high'
                        ? 'bg-orange-900/30 border-orange-700 text-orange-400'
                        : 'bg-yellow-900/30 border-yellow-700 text-yellow-400'
                  }`}
                >
                  <span className="text-xs font-medium">🚨 {urgencyData.level.toUpperCase()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main content area */}
        {children}
      </div>
    </div>
  )
}
