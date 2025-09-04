// ⚠️ Componente de Badge de Urgencia
// Estilos dinámicos según nivel de urgencia

import React from 'react'

interface UrgencyBadgeProps {
  urgencyLevel: string
}

const getUrgencyStyles = (level: string): string => {
  switch (level) {
    case 'critical':
      return 'bg-gradient-to-r from-red-900/50 to-red-800/50 border border-red-600/50 text-red-300'
    case 'high':
      return 'bg-gradient-to-r from-orange-900/50 to-orange-800/50 border border-orange-600/50 text-orange-300'
    default:
      return 'bg-gradient-to-r from-yellow-900/50 to-yellow-800/50 border border-yellow-600/50 text-yellow-300'
  }
}

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({ urgencyLevel }) => (
  <div className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-4 rounded-2xl text-xs sm:text-sm font-bold shadow-lg ${getUrgencyStyles(urgencyLevel)}`}>
    <span className="text-lg sm:text-xl flex-shrink-0">⚠️</span>
    <span className="truncate">URGENCIA: {urgencyLevel.toUpperCase()}</span>
  </div>
)