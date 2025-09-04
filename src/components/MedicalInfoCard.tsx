// 📋 Componente de Información Médica
// Para datos del paciente con estilos consistentes

import React from 'react'

interface MedicalInfoCardProps {
  label: string
  value: string
  variant?: 'default' | 'warning'
}

export const MedicalInfoCard: React.FC<MedicalInfoCardProps> = ({
  label,
  value,
  variant = 'default',
}) => {
  const cardStyles =
    variant === 'warning' ? 'bg-amber-900/20 border border-amber-600/50' : 'bg-slate-700/50'

  const labelStyles =
    variant === 'warning' ? 'text-amber-400 flex items-center gap-1' : 'text-slate-400'

  const valueStyles = variant === 'warning' ? 'text-amber-200' : 'text-white'

  return (
    <div className={`${cardStyles} rounded-lg p-2.5 sm:p-3`}>
      <div className={`text-xs font-medium uppercase mb-1 truncate ${labelStyles}`}>
        {variant === 'warning' && <span className="text-sm">⚠️</span>}
        {label}
      </div>
      <div className={`${valueStyles} font-medium text-sm sm:text-base break-words`}>{value}</div>
    </div>
  )
}
