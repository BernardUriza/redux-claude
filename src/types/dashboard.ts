// src/types/dashboard.ts
// TypeScript interfaces for dashboard components

export type ActiveMetricsTab =
  | 'overview'
  | 'clinical'
  | 'soap'
  | 'followup'
  | 'notes'
  | 'agents'
  | 'system'

export interface CognitiveMetrics {
  systemConfidence: number
  activeDebates: number
}

export interface MobileState {
  isMobile: boolean
  isTablet: boolean
  touchEnabled: boolean
  orientation: 'portrait' | 'landscape'
}

// Re-export UrgencyData from UrgencyIndicator
export type { UrgencyData } from '../components/UrgencyIndicator'
