// 🧠 Panel de Inferencias Médicas - SOLO datos del extractor profesional
// Creado por Bernard Orozco - Sin hardcode, solo Redux store

import React, { useCallback } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../../packages/cognitive-core/src/store/store'
import { CONFIDENCE_THRESHOLDS, MEDICAL_CONSTANTS } from '../constants/magicNumbers'

// Constants for inference confidence - NO MORE MAGIC NUMBERS
const HIGH_CONFIDENCE = CONFIDENCE_THRESHOLDS.CRITICAL
const GOOD_CONFIDENCE = CONFIDENCE_THRESHOLDS.HIGH
const MEDIUM_CONFIDENCE = MEDICAL_CONSTANTS.DIAGNOSTIC_CONFIDENCE_MIN
const NO_CONFIDENCE = 0

// Helper: Format gender display
const getGenderDisplay = (gender?: string): string => {
  if (gender === 'masculino') return 'Masculino'
  if (gender === 'femenino') return 'Femenino'
  return 'No especificado'
}

// Helper component: Inference card
const InferenceCard: React.FC<{ inference: PatientInference }> = ({ inference }) => {
  const confidenceColor =
    inference.confidence >= CONFIDENCE_THRESHOLDS.GOOD
      ? 'text-green-400'
      : inference.confidence >= CONFIDENCE_THRESHOLDS.MINIMUM
        ? 'text-yellow-400'
        : 'text-red-400'

  const statusIcon =
    inference.confidence >= CONFIDENCE_THRESHOLDS.GOOD
      ? '✅'
      : inference.confidence >= CONFIDENCE_THRESHOLDS.MINIMUM
        ? '⚠️'
        : '🔄'

  return (
    <div className="bg-slate-700/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-slate-200">{inference.label}</h4>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold ${confidenceColor}`}>
            {Math.round(inference.confidence * 100)}%
          </span>
          <span className="text-sm">{statusIcon}</span>
        </div>
      </div>
      <div className="text-white font-semibold">{inference.value}</div>
      <div className="text-xs text-slate-400 mt-1">
        Confianza: {Math.round(inference.confidence * 100)}%
      </div>
    </div>
  )
}

interface PatientInference {
  id: string
  type: string
  label: string
  value: string | number
  confidence: number
  isEditable: boolean
}

export interface DynamicInferencePanelProps {
  currentMessage?: string // No usado - solo para compatibilidad
  className?: string
  onInferenceUpdate?: (inferences: PatientInference[]) => void
  systemMetrics?: Record<string, unknown>
}

/**
 * Panel que muestra las inferencias médicas extraídas por el motor profesional
 * SIN lógica hardcodeada - solo datos reales del store
 */
export const DynamicInferencePanel: React.FC<DynamicInferencePanelProps> = ({
  className = '',
  onInferenceUpdate,
}) => {
  // 🎯 SOLO datos del extractor médico profesional
  const extractedData = useSelector(
    (state: RootState) => state.medicalChat.medicalExtraction.currentExtraction
  )

  const patientData = useSelector((state: RootState) => state.medicalChat.sharedState.patientData)

  // 🧠 Helper: Build patient demographics inferences
  const buildPatientDemographics = (): PatientInference[] => {
    const inferences: PatientInference[] = []

    // Edad desde patientData
    inferences.push({
      id: 'age',
      type: 'age',
      label: 'Edad del Paciente',
      value: patientData?.age || 'No especificada',
      confidence: patientData?.age ? HIGH_CONFIDENCE : NO_CONFIDENCE,
      isEditable: false,
    })

    // Género desde patientData
    const genderDisplay = getGenderDisplay(patientData?.gender)
    inferences.push({
      id: 'gender',
      type: 'gender',
      label: 'Género',
      value: genderDisplay,
      confidence: patientData?.gender ? HIGH_CONFIDENCE : NO_CONFIDENCE,
      isEditable: false,
    })

    return inferences
  }

  // 🧠 Helper: Build symptom inferences
  const buildSymptomInferences = (): PatientInference[] => {
    const inferences: PatientInference[] = []

    // Síntoma principal desde patientData (ya acumulado)
    inferences.push({
      id: 'symptom',
      type: 'symptom',
      label: 'Síntoma Principal',
      value: patientData?.primarySymptom || 'No identificado',
      confidence: patientData?.primarySymptom ? GOOD_CONFIDENCE : NO_CONFIDENCE,
      isEditable: false,
    })

    // Intensidad desde extractedData
    const intensity = extractedData?.symptom_characteristics?.pain_intensity_scale
    inferences.push({
      id: 'intensity',
      type: 'intensity',
      label: 'Intensidad (1-10)',
      value: intensity ? `${intensity}/10` : 'No especificada',
      confidence: intensity ? HIGH_CONFIDENCE : NO_CONFIDENCE,
      isEditable: false,
    })

    return inferences
  }

  // 🧠 Helper: Build medical characteristics inferences
  const buildMedicalCharacteristics = (): PatientInference[] => {
    const inferences: PatientInference[] = []

    // Duración desde extractedData
    const duration = extractedData?.symptom_characteristics?.duration_description
    inferences.push({
      id: 'duration',
      type: 'duration',
      label: 'Duración',
      value: duration && duration !== 'unknown' ? duration : 'No especificada',
      confidence: duration && duration !== 'unknown' ? MEDIUM_CONFIDENCE : NO_CONFIDENCE,
      isEditable: false,
    })

    // Síntomas asociados desde extractedData
    const associatedSymptoms = extractedData?.symptom_characteristics?.associated_symptoms
    const associatedDisplay = associatedSymptoms?.length
      ? associatedSymptoms.join(', ')
      : 'Ninguno identificado'

    inferences.push({
      id: 'associated',
      type: 'associated',
      label: 'Síntomas Asociados',
      value: associatedDisplay,
      confidence: associatedSymptoms?.length ? GOOD_CONFIDENCE : NO_CONFIDENCE,
      isEditable: false,
    })

    return inferences
  }

  // 🧠 Main function: Build all inferences from store data
  const buildInferencesFromStore = (): PatientInference[] => {
    console.log('🔍 [PANEL] Building inferences from store:', {
      patientData,
      extractedData,
      patientData_age: patientData?.age,
      patientData_gender: patientData?.gender,
      patientData_primarySymptom: patientData?.primarySymptom,
    })

    return [
      ...buildPatientDemographics(),
      ...buildSymptomInferences(),
      ...buildMedicalCharacteristics(),
    ]
  }

  const inferences = buildInferencesFromStore()

  // Wrap callback to avoid dependency issues
  const handleInferenceUpdate = useCallback(
    (inferences: PatientInference[]) => {
      onInferenceUpdate?.(inferences)
    },
    [onInferenceUpdate]
  )

  // Notificar cambios a componente padre
  React.useEffect(() => {
    handleInferenceUpdate(inferences)
  }, [inferences, handleInferenceUpdate])

  return (
    <div className={`bg-slate-800 rounded-xl border border-slate-600 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-600">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-lg">
            <span className="text-lg">🧠</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Inferencias en Tiempo Real</h3>
            <p className="text-sm text-slate-300">
              Datos del paciente se actualizan automáticamente
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-green-300">ACTIVO</span>
        </div>
      </div>

      {/* Inferencias */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {inferences.map(inference => (
          <InferenceCard key={inference.id} inference={inference} />
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-600 bg-slate-800/80">
        <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
          <span className="text-blue-400">💡</span>
          <span>Se actualiza automáticamente con cada mensaje</span>
        </div>
      </div>
    </div>
  )
}

export default DynamicInferencePanel
