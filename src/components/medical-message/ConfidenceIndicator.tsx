// src/components/medical-message/ConfidenceIndicator.tsx
// Confidence Level Indicator - Extracted from EnhancedMedicalMessage

'use client'

import { CONFIDENCE_THRESHOLDS } from '../../constants/magicNumbers'

interface ConfidenceIndicatorProps {
  confidence: number
}

const getConfidenceColor = (conf: number) => {
  if (conf >= CONFIDENCE_THRESHOLDS.HIGH) return 'from-emerald-500 to-green-500'
  if (conf >= CONFIDENCE_THRESHOLDS.GOOD) return 'from-blue-500 to-cyan-500'
  if (conf >= CONFIDENCE_THRESHOLDS.MEDIUM) return 'from-yellow-500 to-orange-500'
  return 'from-red-500 to-pink-500'
}

const getConfidenceLabel = (conf: number) => {
  if (conf >= CONFIDENCE_THRESHOLDS.HIGH) return 'MUY ALTA'
  if (conf >= CONFIDENCE_THRESHOLDS.GOOD) return 'ALTA'
  if (conf >= CONFIDENCE_THRESHOLDS.MEDIUM) return 'MEDIA'
  return 'BAJA'
}

export const ConfidenceIndicator = ({ confidence }: ConfidenceIndicatorProps) => {
  return (
    <div
      className={`inline-flex items-center space-x-2 bg-gradient-to-r ${getConfidenceColor(confidence)} bg-opacity-20 px-3 py-1 rounded-full border border-opacity-30`}
    >
      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getConfidenceColor(confidence)}`} />
      <span className="text-xs font-semibold text-white">
        {getConfidenceLabel(confidence)} ({Math.round(confidence * 100)}%)
      </span>
    </div>
  )
}
