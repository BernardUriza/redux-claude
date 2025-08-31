// 🧠 Panel de Inferencias Médicas - SOLO datos del extractor profesional
// Creado por Bernard Orozco - Sin hardcode, solo Redux store

import React from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../../packages/cognitive-core/src/store/store'

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
  systemMetrics?: any
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
  const extractedData = useSelector((state: RootState) => 
    state.medicalChat.medicalExtraction.currentExtraction
  )
  
  const patientData = useSelector((state: RootState) => 
    state.medicalChat.sharedState.patientData
  )

  // 🧠 Construir inferencias desde datos REALES
  const buildInferencesFromStore = (): PatientInference[] => {
    console.log('🔍 [PANEL] Building inferences from store:', {
      patientData,
      extractedData,
      patientData_age: patientData?.age,
      patientData_gender: patientData?.gender,
      patientData_primarySymptom: patientData?.primarySymptom
    })
    
    const inferences: PatientInference[] = []

    // Edad desde patientData
    inferences.push({
      id: 'age',
      type: 'age',
      label: 'Edad del Paciente',
      value: patientData?.age || 'No especificada',
      confidence: patientData?.age ? 0.95 : 0,
      isEditable: false,
    })

    // Género desde patientData
    const genderDisplay = patientData?.gender === 'masculino' ? 'Masculino' 
                        : patientData?.gender === 'femenino' ? 'Femenino' 
                        : 'No especificado'
    
    inferences.push({
      id: 'gender',
      type: 'gender',
      label: 'Género',
      value: genderDisplay,
      confidence: patientData?.gender ? 0.95 : 0,
      isEditable: false,
    })

    // Síntoma principal desde patientData (ya acumulado)
    inferences.push({
      id: 'symptom',
      type: 'symptom',
      label: 'Síntoma Principal',
      value: patientData?.primarySymptom || 'No identificado',
      confidence: patientData?.primarySymptom ? 0.90 : 0,
      isEditable: false,
    })

    // Intensidad desde extractedData
    const intensity = extractedData?.symptom_characteristics?.pain_intensity_scale
    inferences.push({
      id: 'intensity',
      type: 'intensity',
      label: 'Intensidad (1-10)',
      value: intensity ? `${intensity}/10` : 'No especificada',
      confidence: intensity ? 0.95 : 0,
      isEditable: false,
    })

    // Duración desde extractedData
    const duration = extractedData?.symptom_characteristics?.duration_description
    inferences.push({
      id: 'duration',
      type: 'duration',
      label: 'Duración',
      value: (duration && duration !== 'unknown') ? duration : 'No especificada',
      confidence: (duration && duration !== 'unknown') ? 0.85 : 0,
      isEditable: false,
    })

    // Síntomas asociados desde extractedData
    const associatedSymptoms = extractedData?.symptom_characteristics?.associated_symptoms
    const associatedDisplay = associatedSymptoms?.length ? associatedSymptoms.join(', ') : 'Ninguno identificado'
    
    inferences.push({
      id: 'associated',
      type: 'associated',
      label: 'Síntomas Asociados',
      value: associatedDisplay,
      confidence: associatedSymptoms?.length ? 0.90 : 0,
      isEditable: false,
    })

    return inferences
  }

  const inferences = buildInferencesFromStore()

  // Notificar cambios a componente padre
  React.useEffect(() => {
    onInferenceUpdate?.(inferences)
  }, [extractedData, patientData])

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
            <p className="text-sm text-slate-300">Datos del paciente se actualizan automáticamente</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-green-300">ACTIVO</span>
        </div>
      </div>

      {/* Inferencias */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {inferences.map((inference) => {
          const confidenceColor = 
            inference.confidence >= 0.8 ? 'text-green-400' :
            inference.confidence >= 0.5 ? 'text-yellow-400' : 'text-red-400'
          
          const statusIcon = 
            inference.confidence >= 0.8 ? '✅' :
            inference.confidence >= 0.5 ? '⚠️' : '🔄'

          return (
            <div key={inference.id} className="bg-slate-700/50 rounded-lg p-4">
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
        })}
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