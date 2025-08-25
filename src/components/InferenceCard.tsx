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
    <div className={`bg-amber-50 border border-amber-200 rounded-lg p-3 mb-2 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-amber-700 uppercase">
              {inference.category}
            </span>
            <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded">
              {Math.round(inference.confidence * 100)}% confianza
            </span>
          </div>

          <p className="text-sm text-gray-800 mb-1">{inference.inference}</p>

          {inference.evidence.length > 0 && (
            <p className="text-xs text-gray-600">Basado en: {inference.evidence.join(', ')}</p>
          )}
        </div>

        {inference.needs_confirmation && (
          <div className="flex gap-1 ml-3">
            <button
              onClick={() => onConfirm(inference, true)}
              className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              SÍ
            </button>
            <button
              onClick={() => onConfirm(inference, false)}
              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              NO
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default InferenceCard
