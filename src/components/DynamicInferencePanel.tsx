// 🧠 Panel de Inferencias Dinámicas - Tiempo Real
// Creado por Bernard Orozco - Inferencias que cambian con cada mensaje

import React, { useState, useEffect } from 'react'
import {
  useAppSelector,
  selectExtractedData,
  selectCompletenessPercentage,
  selectNOMCompliance,
} from '@redux-claude/cognitive-core'

interface PatientInference {
  id: string
  type: 'age' | 'gender' | 'symptom' | 'intensity' | 'duration' | 'associated'
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
  // 🧠 CONECTAR AL REDUX STORE - Data real del extractor
  const extractedData = useAppSelector(selectExtractedData)
  const completenessPercentage = useAppSelector(selectCompletenessPercentage)
  const isNOMCompliant = useAppSelector(selectNOMCompliance)

  // 🔥 DEBUGGING: Logear cambios en selector
  console.log('🧠 [SELECTOR] extractedData changed:', extractedData)
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
      id: 'symptom',
      type: 'symptom',
      label: 'Síntoma Principal',
      value: 'No identificado',
      confidence: 0,
      isEditable: false,
    },
    {
      id: 'intensity',
      type: 'intensity',
      label: 'Intensidad (1-10)',
      value: 'No especificada',
      confidence: 0,
      isEditable: false,
    },
    {
      id: 'duration',
      type: 'duration',
      label: 'Duración',
      value: 'No especificada',
      confidence: 0,
      isEditable: false,
    },
    {
      id: 'associated',
      type: 'associated',
      label: 'Síntomas Asociados',
      value: 'Ninguno identificado',
      confidence: 0,
      isEditable: false,
    },
  ])

  // 🚀 ACTUALIZAR DESDE STORE - Data real extraída por el motor médico
  useEffect(() => {
    if (!extractedData) return

    console.log('🔄 [PANEL] Actualizando inferencias desde store:', extractedData)
    console.log('🔍 [DEBUG] Tipo de extractedData:', typeof extractedData)
    console.log(
      '🔍 [DEBUG] Tiene content?:',
      extractedData && typeof extractedData === 'object' && 'content' in extractedData
    )

    // 🔥 FIX CRÍTICO: Los datos llegan como JSON string en campo 'content'
    let parsedData = extractedData
    if (
      typeof extractedData === 'object' &&
      extractedData &&
      'content' in extractedData &&
      typeof (extractedData as any).content === 'string'
    ) {
      console.log('🔧 [ATTEMPT] Intentando parsear JSON desde content...')
      try {
        parsedData = JSON.parse((extractedData as any).content)
        console.log('🔧 [SUCCESS] JSON parseado desde content:', parsedData)
      } catch (error) {
        console.warn('⚠️ Error parseando JSON desde content:', error)
        console.log('⚠️ Content raw:', (extractedData as any).content)
        return
      }
    } else {
      console.log('🔍 [NO PARSING] ExtractedData no tiene content string, usando directamente')
    }

    console.log(
      '🔍 [DEBUG] pain_intensity_scale:',
      parsedData.symptom_characteristics?.pain_intensity_scale
    )
    console.log(
      '🔍 [DEBUG] Tipo de pain_intensity_scale:',
      typeof parsedData.symptom_characteristics?.pain_intensity_scale
    )

    const updatedInferences = [...inferences]

    // Actualizar edad desde store
    if (
      parsedData.demographics?.patient_age_years !== 'unknown' &&
      parsedData.demographics?.patient_age_years
    ) {
      const ageIndex = updatedInferences.findIndex(i => i.id === 'age')
      if (ageIndex !== -1) {
        updatedInferences[ageIndex] = {
          ...updatedInferences[ageIndex],
          value: parsedData.demographics.patient_age_years,
          confidence: parsedData.demographics.confidence_demographic || 0.9,
        }
      }
    }

    // Actualizar género desde store
    if (
      parsedData.demographics?.patient_gender &&
      parsedData.demographics.patient_gender !== 'unknown'
    ) {
      const genderIndex = updatedInferences.findIndex(i => i.id === 'gender')
      if (genderIndex !== -1) {
        const genderValue =
          parsedData.demographics.patient_gender === 'masculino'
            ? 'Masculino'
            : parsedData.demographics.patient_gender === 'femenino'
              ? 'Femenino'
              : 'No especificado'
        updatedInferences[genderIndex] = {
          ...updatedInferences[genderIndex],
          value: genderValue,
          confidence: parsedData.demographics.confidence_demographic || 0.9,
        }
      }
    }

    // Actualizar síntoma principal desde store
    if (
      parsedData.clinical_presentation?.chief_complaint &&
      parsedData.clinical_presentation.chief_complaint !== 'unknown'
    ) {
      const symptomIndex = updatedInferences.findIndex(i => i.id === 'symptom')
      if (symptomIndex !== -1) {
        updatedInferences[symptomIndex] = {
          ...updatedInferences[symptomIndex],
          value: parsedData.clinical_presentation.chief_complaint,
          confidence: parsedData.clinical_presentation.confidence_symptoms || 0.9,
        }
      }
    }

    // Actualizar intensidad del dolor desde store
    const intensityValue = parsedData.symptom_characteristics?.pain_intensity_scale
    console.log('🔍 [DEBUG] Intensidad value raw:', intensityValue)

    if (
      intensityValue !== null &&
      intensityValue !== undefined &&
      typeof intensityValue === 'number' &&
      intensityValue > 0
    ) {
      const intensityIndex = updatedInferences.findIndex(i => i.id === 'intensity')
      if (intensityIndex !== -1) {
        const numericIntensity = intensityValue // Ya sabemos que es number
        console.log('🎯 [DEBUG] Aplicando intensidad:', numericIntensity)

        updatedInferences[intensityIndex] = {
          ...updatedInferences[intensityIndex],
          value: `${numericIntensity}/10`,
          confidence: 0.95,
        }
      }
    }

    // Actualizar duración desde store
    if (
      parsedData.symptom_characteristics?.duration_description &&
      parsedData.symptom_characteristics.duration_description !== 'unknown'
    ) {
      const durationIndex = updatedInferences.findIndex(i => i.id === 'duration')
      if (durationIndex !== -1) {
        updatedInferences[durationIndex] = {
          ...updatedInferences[durationIndex],
          value: parsedData.symptom_characteristics.duration_description,
          confidence: 0.9,
        }
      }
    }

    // Actualizar síntomas asociados desde store
    if (
      parsedData.clinical_presentation?.primary_symptoms &&
      parsedData.clinical_presentation.primary_symptoms.length > 0
    ) {
      const associatedIndex = updatedInferences.findIndex(i => i.id === 'associated')
      if (associatedIndex !== -1) {
        updatedInferences[associatedIndex] = {
          ...updatedInferences[associatedIndex],
          value: parsedData.clinical_presentation.primary_symptoms.join(', '),
          confidence: parsedData.clinical_presentation.confidence_symptoms || 0.8,
        }
      }
    }

    setInferences(updatedInferences)
    onInferenceUpdate?.(updatedInferences)
  }, [extractedData, completenessPercentage]) // Re-ejecutar cuando cambie extractedData o completeness

  // 🧠 Actualizar inferencias basadas en el mensaje actual con debounce (UI simple - FALLBACK)
  useEffect(() => {
    if (!currentMessage) return

    // Debounce: esperar a que el usuario termine de escribir
    const debounceTimer = setTimeout(() => {
      const message = currentMessage.toLowerCase()
      const updatedInferences = [...inferences]

      // Inferencia de edad (regex simple para UI)
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

      // Inferencia de género (regex simple para UI)
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

      // Inferencia básica de síntoma (solo patrones obvios para UI)
      let symptomValue = 'No identificado'
      let symptomConfidence = 0

      if (message.includes('dolor')) {
        if (message.includes('muela') || message.includes('diente')) {
          symptomValue = 'Dolor dental'
          symptomConfidence = 0.9
        } else if (message.includes('cabeza')) {
          symptomValue = 'Dolor de cabeza'
          symptomConfidence = 0.9
        } else if (message.includes('ojo')) {
          symptomValue = 'Dolor ocular'
          symptomConfidence = 0.9
        } else {
          symptomValue = 'Dolor (localización no especificada)'
          symptomConfidence = 0.7
        }
      }

      const symptomIndex = updatedInferences.findIndex(i => i.id === 'symptom')
      if (symptomIndex !== -1 && symptomConfidence > 0) {
        updatedInferences[symptomIndex] = {
          ...updatedInferences[symptomIndex],
          value: symptomValue,
          confidence: symptomConfidence,
        }
      }

      setInferences(updatedInferences)
      onInferenceUpdate?.(updatedInferences)
    }, 1500)

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

  const getSpecialValueColor = (type: string, value: string | number): string => {
    // Colores especiales para intensidad y duración
    if (type === 'intensity') {
      const intensity = parseInt(String(value))
      if (intensity >= 8) return 'text-red-400 bg-red-900/30 border-red-700/50'
      if (intensity >= 5) return 'text-orange-400 bg-orange-900/30 border-orange-700/50'
      if (intensity >= 1) return 'text-yellow-400 bg-yellow-900/30 border-yellow-700/50'
    }
    return 'bg-gray-700 border-gray-600 text-gray-200'
  }

  return (
    <div
      className={`bg-gray-900 border border-gray-700 rounded-lg sm:rounded-xl shadow-xl overflow-hidden flex flex-col ${className}`}
    >
      {/* Header con indicador de estado */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-3 sm:p-4 rounded-t-lg sm:rounded-t-xl">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="bg-white/20 p-1.5 rounded-lg flex-shrink-0">
              <span className="text-base sm:text-lg">🧠</span>
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-white text-sm sm:text-base truncate">
                Inferencias en Tiempo Real
              </h4>
              <p className="text-indigo-200 text-xs hidden sm:block">
                Datos del paciente se actualizan automáticamente
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-indigo-200 hidden sm:inline">ACTIVO</span>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div
        className="p-3 sm:p-4 lg:p-5 space-y-3 sm:space-y-4 overflow-y-auto flex-1 scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500 scroll-smooth"
        style={{
          scrollBehavior: 'smooth',
          scrollbarWidth: 'thin',
          scrollbarColor: '#4b5563 #1f2937',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {inferences.map(inference => (
          <div
            key={inference.id}
            className="bg-gray-800 rounded-lg p-2.5 sm:p-3 border border-gray-600 hover:border-gray-500 transition-colors"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${inference.confidence > 0.7 ? 'bg-green-400' : inference.confidence > 0.4 ? 'bg-yellow-400' : 'bg-gray-400'}`}
                ></div>
                <span className="font-medium text-gray-200 text-sm sm:text-base truncate">
                  {inference.label}
                </span>
              </div>
              <span
                className={`text-xs px-2 sm:px-3 py-1 rounded-full border font-semibold flex-shrink-0 ${getConfidenceColor(inference.confidence)}`}
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
                    className="w-full px-2.5 sm:px-3 py-2 bg-gray-700 border border-gray-500 rounded-lg text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Edad del paciente"
                  />
                ) : inference.isEditable && inference.options ? (
                  <select
                    value={inference.value as string}
                    onChange={e => handleInferenceChange(inference.id, e.target.value)}
                    className="w-full px-2.5 sm:px-3 py-2 bg-gray-700 border border-gray-500 rounded-lg text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {inference.options.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div
                    className={`w-full px-2.5 sm:px-3 py-2 rounded-lg border text-sm font-medium break-words ${getSpecialValueColor(inference.type, inference.value)}`}
                  >
                    {inference.value}
                  </div>
                )}
              </div>

              {/* Barra de confianza con mejor visual */}
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span className="truncate">Confianza</span>
                  <span className="flex items-center gap-1 flex-shrink-0">
                    <span>{Math.round(inference.confidence * 100)}%</span>
                    <span className="text-xs">
                      {inference.confidence > 0.8 ? '✅' : inference.confidence > 0.6 ? '⚠️' : '🔄'}
                    </span>
                  </span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-1.5 sm:h-2">
                  <div
                    className={`h-1.5 sm:h-2 rounded-full transition-all duration-700 ${
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
      <div className="bg-gray-800/50 px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 rounded-b-lg sm:rounded-b-xl border-t border-gray-700">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <span className="flex-shrink-0">💡</span>
          <span className="text-center leading-tight">
            Se actualiza automáticamente con cada mensaje
          </span>
        </div>
      </div>
    </div>
  )
}

export default DynamicInferencePanel
