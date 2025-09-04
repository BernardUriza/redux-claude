// 💊 Componente de Tarjeta de Medicamento
// Para mostrar información de medicamentos de forma consistente

import React from 'react'

interface MedicationCardProps {
  medicamento: string
  dosis: string
  frecuencia: string
}

export const MedicationCard: React.FC<MedicationCardProps> = ({
  medicamento,
  dosis,
  frecuencia,
}) => (
  <div className="bg-green-900/20 border border-green-700/50 rounded-xl p-2.5 sm:p-3">
    <div className="font-bold text-green-300 mb-1 text-sm sm:text-base break-words">
      {medicamento}
    </div>
    <div className="text-xs sm:text-sm text-slate-300 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
      <span className="bg-slate-700/50 px-2 py-1 rounded text-xs break-words flex-shrink-0">
        {dosis}
      </span>
      <span className="bg-slate-700/50 px-2 py-1 rounded text-xs break-words flex-shrink-0">
        {frecuencia}
      </span>
    </div>
  </div>
)
