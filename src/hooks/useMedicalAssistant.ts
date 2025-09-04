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

// Helper functions for demographic processing
const processDemographics = (data: PatientData) => {
  const hasValidGender = data.gender === 'masculino' || data.gender === 'femenino'
  const hasCompleteDemo = Boolean(data.age && data.gender)

  return {
    patient_age_years: typeof data.age === 'number' ? data.age : 'unknown',
    patient_gender: (hasValidGender ? data.gender : 'unknown') as
      | 'masculino'
      | 'femenino'
      | 'unknown',
    confidence_demographic: hasCompleteDemo
      ? CONFIDENCE_THRESHOLDS.HIGH
      : CONFIDENCE_THRESHOLDS.MINIMUM,
  }
}

// Helper functions for clinical presentation
const processClinicalPresentation = (data: PatientData) => ({
  chief_complaint: data.primarySymptom || 'unknown',
  primary_symptoms: data.symptoms || null,
  anatomical_location: 'unknown',
  confidence_symptoms: data.primarySymptom ? CONFIDENCE_THRESHOLDS.GOOD : MIN_SYMPTOMS_CONFIDENCE,
})

// Helper functions for symptom characteristics
const processSymptomCharacteristics = (data: PatientData) => {
  const hasContext = Boolean(data.duration || data.intensity)

  return {
    duration_description: data.duration || 'unknown',
    pain_intensity_scale: data.intensity || null,
    pain_characteristics: data.characteristics || null,
    aggravating_factors: data.triggers || null,
    relieving_factors: data.relievingFactors || null,
    associated_symptoms: data.associatedSymptoms || null,
    temporal_pattern: data.timePattern || 'unknown',
    confidence_context: hasContext ? CONFIDENCE_THRESHOLDS.MEDIUM : DEFAULT_CONTEXT_CONFIDENCE,
  }
}

// Helper functions for metadata calculation
const calculateMissingFields = (data: PatientData): string[] => {
  const missing: string[] = []
  if (!data.age) missing.push('patient_age_years')
  if (!data.gender) missing.push('patient_gender')
  if (!data.primarySymptom) missing.push('chief_complaint')
  return missing
}

const calculateMetadata = (data: PatientData) => {
  const demographicComplete = Boolean(data.age && data.gender)
  const clinicalComplete = Boolean(data.primarySymptom)
  const contextComplete = Boolean(data.duration || data.intensity)
  const nomCompliant = Boolean(data.age && data.gender && data.primarySymptom)

  return {
    overall_completeness_percentage: data.isComplete ? 90 : 60,
    demographic_complete: demographicComplete,
    clinical_complete: clinicalComplete,
    context_complete: contextComplete,
    nom_compliant: nomCompliant,
    ready_for_soap_generation: nomCompliant,
    missing_critical_fields: calculateMissingFields(data),
    data_points_extracted_this_iteration: 0,
    extraction_timestamp: new Date().toISOString(),
    claude_model_used: 'claude-sonnet-4',
  }
}

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
    demographics: processDemographics(data),
    clinical_presentation: processClinicalPresentation(data),
    symptom_characteristics: processSymptomCharacteristics(data),
    medical_validation: {
      anatomical_contradictions: [],
      logical_inconsistencies: [],
      requires_clarification: [],
      medical_alerts: [],
    },
    extraction_metadata: calculateMetadata(data),
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
