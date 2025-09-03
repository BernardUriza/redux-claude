// src/hooks/useMedicalAssistant.ts
// Medical Assistant Business Logic Hook - Extracted from MedicalAssistant.tsx

'use client'

import { useSelector } from 'react-redux'
import type { RootState } from '../../packages/cognitive-core/src/store/store'
import { generateMedicalPrompt, type MedicalExtractionOutput } from '@redux-claude/cognitive-core'
import { CONFIDENCE_THRESHOLDS } from '../constants/magicNumbers'

interface PatientData {
  age?: number
  gender?: string
  primarySymptom?: string
  symptoms?: string[]
  duration?: string
  intensity?: number
  characteristics?: string[]
  triggers?: string[]
  relievingFactors?: string[]
  associatedSymptoms?: string[]
  timePattern?: string
  isComplete?: boolean
}

const DEFAULT_CONTEXT_CONFIDENCE = 0.3
const MIN_SYMPTOMS_CONFIDENCE = 0.0

export const useMedicalAssistant = () => {
  const patientData = useSelector(
    (state: RootState) => state.medicalChat.sharedState.patientData
  ) as PatientData

  const readyForSOAP = useSelector(
    (state: RootState) => state.medicalChat.sharedState.readyForSOAP
  ) as boolean

  const currentExtraction = useSelector(
    (state: RootState) => state.medicalChat.medicalExtraction.currentExtraction
  ) as MedicalExtractionOutput | null

  const canGeneratePrompt = Boolean(
    patientData.age && patientData.gender && patientData.primarySymptom
  )

  const createMinimalExtraction = (data: PatientData): MedicalExtractionOutput => ({
    demographics: {
      patient_age_years: typeof data.age === 'number' ? data.age : 'unknown',
      patient_gender: (data.gender === 'masculino' || data.gender === 'femenino'
        ? data.gender
        : 'unknown') as 'masculino' | 'femenino' | 'unknown',
      confidence_demographic: !!(data.age && data.gender)
        ? CONFIDENCE_THRESHOLDS.HIGH
        : CONFIDENCE_THRESHOLDS.MINIMUM,
    },
    clinical_presentation: {
      chief_complaint: data.primarySymptom || 'unknown',
      primary_symptoms: data.symptoms || null,
      anatomical_location: 'unknown',
      confidence_symptoms: !!data.primarySymptom
        ? CONFIDENCE_THRESHOLDS.GOOD
        : MIN_SYMPTOMS_CONFIDENCE,
    },
    symptom_characteristics: {
      duration_description: data.duration || 'unknown',
      pain_intensity_scale: data.intensity || null,
      pain_characteristics: data.characteristics || null,
      aggravating_factors: data.triggers || null,
      relieving_factors: data.relievingFactors || null,
      associated_symptoms: data.associatedSymptoms || null,
      temporal_pattern: data.timePattern || 'unknown',
      confidence_context: !!(data.duration || data.intensity)
        ? CONFIDENCE_THRESHOLDS.MEDIUM
        : DEFAULT_CONTEXT_CONFIDENCE,
    },
    medical_validation: {
      anatomical_contradictions: [],
      logical_inconsistencies: [],
      requires_clarification: [],
      medical_alerts: [],
    },
    extraction_metadata: {
      overall_completeness_percentage: data.isComplete ? 90 : 60,
      demographic_complete: !!(data.age && data.gender),
      clinical_complete: !!data.primarySymptom,
      context_complete: !!(data.duration || data.intensity),
      nom_compliant: !!(data.age && data.gender && data.primarySymptom),
      ready_for_soap_generation: !!(data.age && data.gender && data.primarySymptom),
      missing_critical_fields: [
        !data.age && 'patient_age_years',
        !data.gender && 'patient_gender',
        !data.primarySymptom && 'chief_complaint',
      ].filter(Boolean) as string[],
      data_points_extracted_this_iteration: 0,
      extraction_timestamp: new Date().toISOString(),
      claude_model_used: 'claude-sonnet-4',
    },
  })

  const handleGeneratePrompt = (onSelectTemplate: (template: string) => void) => {
    if (!canGeneratePrompt) return

    const extractedData = currentExtraction || createMinimalExtraction(patientData)
    const { prompt } = generateMedicalPrompt(extractedData)

    if (prompt) {
      onSelectTemplate(prompt)
      navigator.clipboard?.writeText(prompt).catch(() => {})

      const indicator = document.querySelector('[data-autoclose-indicator]')
      if (indicator) {
        indicator.textContent = '✅ Prompt listo - Revisa y envía cuando gustes'
        indicator.classList.add('text-green-400')
      }
    }
  }

  const getMissingFields = (): string[] => {
    return [
      !patientData.age && 'Edad',
      !patientData.gender && 'Género',
      !patientData.primarySymptom && 'Síntoma principal',
    ].filter(Boolean) as string[]
  }

  return {
    patientData,
    readyForSOAP,
    canGeneratePrompt,
    handleGeneratePrompt,
    getMissingFields,
  }
}
