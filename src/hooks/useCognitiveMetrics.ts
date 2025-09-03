// src/hooks/useCognitiveMetrics.ts
// Cognitive Metrics Computing Hook - BRUTAL EXTRACTION
'use client'

import { useSelector } from 'react-redux'
import type { RootState } from '@redux-claude/cognitive-core'

// Constants for cognitive metrics calculation
const PERCENTAGE_MULTIPLIER = 100
const DEFAULT_CONFIDENCE_FALLBACK = 0

interface MedicalMessage {
  id: string
  content: string
  type: 'user' | 'assistant'
  timestamp: number
  confidence?: number
  metadata?: {
    sessionId?: string
    isStreaming?: boolean
    sectionType?: 'diagnosis' | 'treatment' | 'education' | 'followup'
  }
}

export const useCognitiveMetrics = (messages: MedicalMessage[]) => {
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

  return {
    cognitiveMetrics,
    lastMessage,
    currentExtraction,
    hasActiveSOAP,
  }
}
