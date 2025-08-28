// 🧠 Componente de Tarjeta de Inferencia - Principio de Responsabilidad Única
// Creado por Bernard Orozco - Solo maneja renderizado de inferencias

import React from 'react'
import { MedicalInference } from '../../packages/cognitive-core/src/services/IntelligentMedicalChat'

interface InferenceCardProps {
  inference: MedicalInference
  onConfirm: (inference: MedicalInference, confirmed: boolean) => void
  className?: string
}

/**
 * Componente de presentación para mostrar inferencias médicas
 * Aplica Principio de Responsabilidad Única - solo UI de inferencias
 */
export const InferenceCard: React.FC<InferenceCardProps> = ({
  inference,
  onConfirm,
  className = '',
}) => {
  return (
    <div className={`bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600/50 rounded-2xl p-5 mb-4 shadow-xl backdrop-blur-sm ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-bold text-cyan-300 uppercase tracking-wider px-3 py-1 bg-cyan-900/30 border border-cyan-600/50 rounded-full">
              {inference.category}
            </span>
            <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-1 rounded-full">
              <div className={`w-2 h-2 rounded-full ${inference.confidence >= 0.8 ? 'bg-green-400' : inference.confidence >= 0.6 ? 'bg-yellow-400' : 'bg-orange-400'}`}></div>
              <span className="text-sm font-bold text-slate-200">
                {Math.round(inference.confidence * 100)}%
              </span>
            </div>
          </div>

          <p className="text-base text-slate-100 mb-3 font-medium leading-relaxed">{inference.inference}</p>

          {inference.evidence.length > 0 && (
            <div className="bg-slate-700/30 rounded-lg p-3 mt-3">
              <div className="text-xs font-medium text-slate-400 uppercase mb-1 flex items-center gap-1">
                <span>📊</span> Evidencia
              </div>
              <p className="text-sm text-slate-300 font-medium">{inference.evidence.join(', ')}</p>
            </div>
          )}
        </div>

        {inference.needs_confirmation && (
          <div className="flex flex-col gap-3 min-w-[120px]">
            <button
              onClick={() => onConfirm(inference, true)}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-green-500/25 hover:scale-105"
            >
              <span>✓</span>
              <span>SÍ</span>
            </button>
            <button
              onClick={() => onConfirm(inference, false)}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-red-500/25 hover:scale-105"
            >
              <span>✗</span>
              <span>NO</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default InferenceCard
