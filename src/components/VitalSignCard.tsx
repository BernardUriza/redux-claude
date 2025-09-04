// 🩺 Componente de Signo Vital Individual
// Extraído de MedicalSummaryPanel para reducir complejidad

import React from 'react'

interface VitalSignCardProps {
  icon: string
  label: string
  value: string
  iconColor: string
}

export const VitalSignCard: React.FC<VitalSignCardProps> = ({ icon, label, value, iconColor }) => (
  <div className="bg-slate-700/50 rounded-lg p-2.5 sm:p-3 flex items-center gap-2 sm:gap-3 min-w-0">
    <span className={`${iconColor} text-sm sm:text-lg flex-shrink-0`}>{icon}</span>
    <div className="min-w-0 flex-1">
      <div className="text-xs font-medium text-slate-400 uppercase truncate">{label}</div>
      <div className="text-white font-bold text-sm sm:text-base">{value}</div>
    </div>
  </div>
)
