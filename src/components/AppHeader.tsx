// src/components/AppHeader.tsx
// Application header with badges - extracted from DashboardLayout.tsx
'use client'

import styles from '../styles/components/CognitiveDashboard.module.css'
import type { UrgencyData } from './UrgencyIndicator'

interface AppHeaderProps {
  showMobileMenu: boolean
  setShowMobileMenu: (show: boolean) => void
  urgencyData: UrgencyData
  triggerHaptic?: (intensity: 'light' | 'medium' | 'heavy') => void
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  showMobileMenu,
  setShowMobileMenu,
  urgencyData,
  triggerHaptic,
}) => {
  return (
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
  )
}
