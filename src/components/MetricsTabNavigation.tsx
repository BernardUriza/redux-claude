// src/components/MetricsTabNavigation.tsx
// Tab navigation component - extracted from MedicalMetricsPanel.tsx
'use client'

import { useRef } from 'react'
import type { ActiveMetricsTab } from '../types/dashboard'

interface MetricsTabNavigationProps {
  activeTab: ActiveMetricsTab
  setActiveTab: (tab: ActiveMetricsTab) => void
  isMobile: boolean
  triggerHaptic?: (intensity: 'light' | 'medium' | 'heavy') => void
}

const TABS_CONFIG = [
  { id: 'overview' as const, label: 'Info', icon: '📋' },
  { id: 'clinical' as const, label: 'Med', icon: '🩺' },
  { id: 'soap' as const, label: 'SOAP', icon: '📄' },
  { id: 'agents' as const, label: 'AI', icon: '🤖' },
] as const

export const MetricsTabNavigation: React.FC<MetricsTabNavigationProps> = ({
  activeTab,
  setActiveTab,
  isMobile,
  triggerHaptic,
}) => {
  const tabsRef = useRef<HTMLDivElement>(null)

  return (
    <>
      {/* Navigation Tabs - Ultra Compact */}
      <div
        ref={tabsRef}
        className={`grid grid-cols-4 gap-1 bg-slate-800/30 rounded p-1 ${isMobile ? 'swipe-indicator' : ''}`}
      >
        {TABS_CONFIG.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              triggerHaptic?.('light')
              setActiveTab(tab.id)
            }}
            className={`flex flex-col items-center px-1 py-1 rounded text-xs transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            <span className="text-xs">{tab.icon}</span>
            <span className="text-xs">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Mobile Swipe Hint */}
      {isMobile && (
        <div className="text-center mt-2">
          <span className="text-xs text-slate-500">← Swipe to navigate tabs →</span>
        </div>
      )}
    </>
  )
}
