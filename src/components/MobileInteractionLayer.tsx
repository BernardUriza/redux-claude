// src/components/MobileInteractionLayer.tsx
// Mobile-specific interactions: FAB + gestures + keyboard handling
'use client'

import styles from '../styles/components/CognitiveDashboard.module.css'

interface MobileInteractionLayerProps {
  // Mobile state
  isMobile: boolean
  showMobileFab: boolean
  // Event handlers
  onFabClick: () => void
  triggerHaptic?: (intensity: 'light' | 'medium' | 'heavy') => void
}

export const MobileInteractionLayer: React.FC<MobileInteractionLayerProps> = ({
  isMobile,
  showMobileFab,
  onFabClick,
  triggerHaptic,
}) => {
  if (!isMobile) {
    return null
  }

  return (
    <>
      {/* Mobile Floating Action Button */}
      {showMobileFab && (
        <button
          onClick={() => {
            triggerHaptic?.('medium')
            onFabClick()
          }}
          className={`${styles.mobileFab} ${styles.touchFeedback}`}
          title="Quick Input"
          aria-label="Quick input for medical case"
        >
          ✍️
        </button>
      )}
    </>
  )
}
