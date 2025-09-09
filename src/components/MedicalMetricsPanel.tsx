// src/components/MedicalMetricsPanel.tsx
// Metrics panel orchestrator - refactored for single responsibility
'use client'

import type { UrgencyData } from './UrgencyIndicator'
import type { MedicalMessage } from '@redux-claude/cognitive-core'
import type { ActiveMetricsTab } from '../types/dashboard'
import { MetricsHeader } from './MetricsHeader'
import { MetricsTabNavigation } from './MetricsTabNavigation'
import { MetricsContent } from './MetricsContent'

interface MedicalMetricsPanelProps {
  // Sidebar state
  sidebarCollapsed: boolean
  // Active tab
  activeMetricsTab: ActiveMetricsTab
  setActiveMetricsTab: (tab: ActiveMetricsTab) => void
  // Mobile state
  isMobile: boolean
  // Metrics data
  cognitiveMetrics?: {
    systemConfidence: number
    activeDebates: number
  } | null
  urgencyData: UrgencyData
  messagesCount: number
  // For CognitiveAgentsPanel
  lastMessage?: MedicalMessage
  isStreaming: boolean
  // Event handlers
  triggerHaptic?: (intensity: 'light' | 'medium' | 'heavy') => void
}

export const MedicalMetricsPanel: React.FC<MedicalMetricsPanelProps> = ({
  sidebarCollapsed,
  activeMetricsTab,
  setActiveMetricsTab,
  isMobile,
  cognitiveMetrics,
  urgencyData,
  messagesCount,
  lastMessage,
  isStreaming,
  triggerHaptic,
}) => {
  return (
    <div
      className={`${sidebarCollapsed ? 'collapsed' : 'expanded'} flex-shrink-0 w-64 lg:w-72 bg-gradient-to-b from-slate-800/30 to-slate-900/50 backdrop-blur-xl border-l border-slate-700/50`}
    >
      <MetricsHeader cognitiveMetrics={cognitiveMetrics} messagesCount={messagesCount} />

      <div className="px-4 mb-4">
        <MetricsTabNavigation
          activeTab={activeMetricsTab}
          setActiveTab={setActiveMetricsTab}
          isMobile={isMobile}
          triggerHaptic={triggerHaptic}
        />
      </div>

      <MetricsContent
        activeTab={activeMetricsTab}
        urgencyData={urgencyData}
        messagesCount={messagesCount}
        lastMessage={lastMessage}
        isStreaming={isStreaming}
      />
    </div>
  )
}
