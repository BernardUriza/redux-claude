// 🎯 Componente de Diagnóstico con barra de probabilidad
// Muestra diagnóstico y su nivel de certeza

import React from 'react'

interface DiagnosisCardProps {
  condition: string
  probability?: number
}

export const DiagnosisCard: React.FC<DiagnosisCardProps> = ({
  condition,
  probability,
}) => (
  <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-600/50 rounded-xl p-3 sm:p-4">
    <div className="text-base sm:text-lg font-bold text-cyan-300 mb-2 break-words">
      {condition}
    </div>
    {probability && (
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex-1 bg-slate-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.round(probability * 100)}%` }}
          />
        </div>
        <span className="text-xs sm:text-sm font-bold text-slate-300 flex-shrink-0">
          {Math.round(probability * 100)}%
        </span>
      </div>
    )}
  </div>
)