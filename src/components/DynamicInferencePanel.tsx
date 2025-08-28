// 🧠 Panel de Inferencias Dinámicas - Tiempo Real
// Creado por Bernard Orozco - Inferencias que cambian con cada mensaje

import React, { useState, useEffect } from 'react'

interface PatientInference {
  id: string
  type: 'age' | 'gender' | 'diagnosis' | 'urgency' | 'specialty'
  label: string
  value: string | number
  confidence: number
  isEditable: boolean
  options?: string[]
  min?: number
  max?: number
}

export interface DynamicInferencePanelProps {
  currentMessage?: string
  className?: string
  onInferenceUpdate?: (inferences: PatientInference[]) => void
  systemMetrics?: any
  currentSession?: any
}

/**
 * Panel que muestra y actualiza inferencias médicas en tiempo real
 * Permite editar edad (numeric) y género (selector)
 */
export const DynamicInferencePanel: React.FC<DynamicInferencePanelProps> = ({
  currentMessage = '',
  className = '',
  onInferenceUpdate,
  systemMetrics,
  currentSession,
}) => {
  const [inferences, setInferences] = useState<PatientInference[]>([
    {
      id: 'age',
      type: 'age',
      label: 'Edad del Paciente',
      value: 0,
      confidence: 0,
      isEditable: true,
      min: 0,
      max: 120,
    },
    {
      id: 'gender',
      type: 'gender',
      label: 'Género',
      value: 'No especificado',
      confidence: 0,
      isEditable: true,
      options: ['Masculino', 'Femenino', 'No especificado'],
    },
    {
      id: 'diagnosis',
      type: 'diagnosis',
      label: 'Diagnóstico Probable',
      value: 'Evaluando...',
      confidence: 0,
      isEditable: false,
    },
    {
      id: 'urgency',
      type: 'urgency',
      label: 'Nivel de Urgencia',
      value: 'Bajo',
      confidence: 0,
      isEditable: false,
      options: ['Crítico', 'Alto', 'Medio', 'Bajo'],
    },
  ])

  // Actualizar inferencias basadas en el mensaje actual con debounce
  useEffect(() => {
    if (!currentMessage) return

    // Debounce: esperar a que el usuario termine de escribir
    const debounceTimer = setTimeout(() => {
      const message = currentMessage.toLowerCase()
      const updatedInferences = [...inferences]

    // Inferencia de edad
    const ageMatch = message.match(/(\d+)\s*(años?|year|old|age)/i)
    if (ageMatch) {
      const ageIndex = updatedInferences.findIndex(i => i.id === 'age')
      if (ageIndex !== -1) {
        updatedInferences[ageIndex] = {
          ...updatedInferences[ageIndex],
          value: parseInt(ageMatch[1]),
          confidence: 0.9,
        }
      }
    }

    // Inferencia de género
    if (message.includes('masculino') || message.includes('hombre') || message.includes('male')) {
      const genderIndex = updatedInferences.findIndex(i => i.id === 'gender')
      if (genderIndex !== -1) {
        updatedInferences[genderIndex] = {
          ...updatedInferences[genderIndex],
          value: 'Masculino',
          confidence: 0.85,
        }
      }
    } else if (
      message.includes('femenino') ||
      message.includes('mujer') ||
      message.includes('female')
    ) {
      const genderIndex = updatedInferences.findIndex(i => i.id === 'gender')
      if (genderIndex !== -1) {
        updatedInferences[genderIndex] = {
          ...updatedInferences[genderIndex],
          value: 'Femenino',
          confidence: 0.85,
        }
      }
    }

    // Inferencia de diagnóstico
    let diagnosisValue = 'Evaluando...'
    let diagnosisConfidence = 0.3

    if (message.includes('dolor') && message.includes('pecho')) {
      diagnosisValue = 'Posible síndrome coronario'
      diagnosisConfidence = 0.7
    } else if (
      message.includes('cefalea') ||
      (message.includes('dolor') && message.includes('cabeza'))
    ) {
      diagnosisValue = 'Cefalea primaria/secundaria'
      diagnosisConfidence = 0.65
    } else if (message.includes('fiebre')) {
      diagnosisValue = 'Proceso infeccioso'
      diagnosisConfidence = 0.6
    } else if (message.includes('diabetes') || message.includes('glucosa')) {
      diagnosisValue = 'Trastorno metabólico'
      diagnosisConfidence = 0.8
    }

    const diagnosisIndex = updatedInferences.findIndex(i => i.id === 'diagnosis')
    if (diagnosisIndex !== -1) {
      updatedInferences[diagnosisIndex] = {
        ...updatedInferences[diagnosisIndex],
        value: diagnosisValue,
        confidence: diagnosisConfidence,
      }
    }

    // Inferencia de urgencia
    let urgencyValue = 'Bajo'
    let urgencyConfidence = 0.5

    if (
      (message.includes('dolor') && message.includes('pecho')) ||
      (message.includes('dificultad') && message.includes('respirar'))
    ) {
      urgencyValue = 'Alto'
      urgencyConfidence = 0.8
    } else if (message.includes('cefalea') && message.includes('intens')) {
      urgencyValue = 'Medio'
      urgencyConfidence = 0.7
    } else if (message.includes('fiebre') && message.includes('alto')) {
      urgencyValue = 'Medio'
      urgencyConfidence = 0.6
    }

    const urgencyIndex = updatedInferences.findIndex(i => i.id === 'urgency')
    if (urgencyIndex !== -1) {
      updatedInferences[urgencyIndex] = {
        ...updatedInferences[urgencyIndex],
        value: urgencyValue,
        confidence: urgencyConfidence,
      }
    }

      setInferences(updatedInferences)
      onInferenceUpdate?.(updatedInferences)
    }, 1500) // Esperar 1.5 segundos después de que el usuario deje de escribir

    return () => clearTimeout(debounceTimer)
  }, [currentMessage])

  const handleInferenceChange = (id: string, newValue: string | number) => {
    const updated = inferences.map(inf =>
      inf.id === id ? { ...inf, value: newValue, confidence: 1.0, timestamp: Date.now() } : inf
    )
    setInferences(updated)

    // 🔥 ANILLO ÚNICO: También llamar callback cuando el usuario edita manualmente
    onInferenceUpdate?.(updated)
  }

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'text-green-400 bg-green-900/20 border-green-700/30'
    if (confidence >= 0.6) return 'text-yellow-400 bg-yellow-900/20 border-yellow-700/30'
    if (confidence >= 0.3) return 'text-orange-400 bg-orange-900/20 border-orange-700/30'
    return 'text-gray-400 bg-gray-900/20 border-gray-700/30'
  }

  const getUrgencyColor = (urgency: string): string => {
    switch (urgency.toLowerCase()) {
      case 'crítico':
        return 'text-red-500 bg-red-900/30 border-red-700/50'
      case 'alto':
        return 'text-orange-500 bg-orange-900/30 border-orange-700/50'
      case 'medio':
        return 'text-yellow-500 bg-yellow-900/30 border-yellow-700/50'
      default:
        return 'text-gray-400 bg-gray-900/20 border-gray-700/30'
    }
  }

  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden flex flex-col ${className}`}>
      {/* Header con indicador de estado */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <span className="text-lg">🧠</span>
            </div>
            <div>
              <h4 className="font-bold text-white">Inferencias en Tiempo Real</h4>
              <p className="text-indigo-200 text-xs">
                Datos del paciente se actualizan automáticamente
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-indigo-200">ACTIVO</span>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="p-5 space-y-4 overflow-y-auto flex-1">
        {inferences.map(inference => (
          <div
            key={inference.id}
            className="bg-gray-800 rounded-lg p-3 border border-gray-600 hover:border-gray-500 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${inference.confidence > 0.7 ? 'bg-green-400' : inference.confidence > 0.4 ? 'bg-yellow-400' : 'bg-gray-400'}`}
                ></div>
                <span className="font-medium text-gray-200">{inference.label}</span>
              </div>
              <span
                className={`text-xs px-3 py-1 rounded-full border font-semibold ${getConfidenceColor(inference.confidence)}`}
              >
                {Math.round(inference.confidence * 100)}%
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {inference.isEditable && inference.type === 'age' ? (
                  <input
                    type="number"
                    min={inference.min}
                    max={inference.max}
                    value={inference.value as number}
                    onChange={e =>
                      handleInferenceChange(inference.id, parseInt(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-500 rounded-lg text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Edad del paciente"
                  />
                ) : inference.isEditable && inference.options ? (
                  <select
                    value={inference.value as string}
                    onChange={e => handleInferenceChange(inference.id, e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-500 rounded-lg text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {inference.options.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div
                    className={`w-full px-3 py-2 rounded-lg border text-sm font-medium ${
                      inference.type === 'urgency'
                        ? getUrgencyColor(inference.value as string)
                        : 'bg-gray-700 border-gray-600 text-gray-200'
                    }`}
                  >
                    {inference.value}
                  </div>
                )}
              </div>

              {/* Barra de confianza con mejor visual */}
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Confianza</span>
                  <span>
                    {Math.round(inference.confidence * 100)}%
                    {inference.confidence > 0.8 ? '✅' : inference.confidence > 0.6 ? '⚠️' : '🔄'}
                  </span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-700 ${
                      inference.confidence > 0.8
                        ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                        : inference.confidence > 0.6
                          ? 'bg-gradient-to-r from-yellow-500 to-amber-400'
                          : 'bg-gradient-to-r from-gray-500 to-gray-400'
                    }`}
                    style={{ width: `${inference.confidence * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer informativo */}
      <div className="bg-gray-800/50 px-5 py-3 rounded-b-lg border-t border-gray-700">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <span>💡</span>
          <span>Se actualiza automáticamente con cada mensaje</span>
        </div>
      </div>
    </div>
  )
}

export default DynamicInferencePanel
