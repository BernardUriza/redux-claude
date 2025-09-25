// 🔧 Medical Chat Utilities - DRY Principles Applied
// Creado por Bernard Orozco + Gandalf el Blanco - Clean Architecture

import { MedicalMessage, PatientData } from '../types/medicalChatTypes'
import { MedicalExtractionOutput } from '../../types/medicalExtraction'

// 🏭 Message creation factory - Single responsibility
export const createMessage = (
  prefix: string,
  payload: Omit<MedicalMessage, 'id' | 'timestamp'>
): MedicalMessage => ({
  id: `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  timestamp: Date.now(),
  ...payload,
})

// 🧹 WIP Data reset utility - Immutable by default
export const createEmptyWipData = () => ({
  demographics: {},
  clinical_presentation: {},
  symptom_characteristics: {},
})

// 🔄 Type-safe value processor
export const processPatientValue = (
  value: string | number | string[],
  type: 'array' | 'string' | 'number'
) => {
  switch (type) {
    case 'array':
      return Array.isArray(value) ? value : [value as string]
    case 'number':
      return typeof value === 'number' ? value : parseInt(value as string)
    default:
      return value as string
  }
}

// 🔄 Patient data merger - Complex business logic isolated
export const updatePatientDataFromExtraction = (
  patientData: PatientData,
  extractedData: MedicalExtractionOutput
): PatientData => {
  const updated = { ...patientData }

  // Demographics
  if (extractedData.demographics.patient_age_years !== 'unknown') {
    const ageValue = extractedData.demographics.patient_age_years
    updated.age = typeof ageValue === 'number' ? ageValue : parseInt(String(ageValue)) || ageValue
  }
  if (extractedData.demographics.patient_gender !== 'unknown') {
    updated.gender = extractedData.demographics.patient_gender
  }

  // Symptoms - Accumulate without duplicates
  if (
    extractedData.clinical_presentation?.chief_complaint &&
    extractedData.clinical_presentation.chief_complaint !== 'unknown'
  ) {
    const existingSymptoms = updated.symptoms || []
    const allSymptoms = new Set([
      ...(updated.primarySymptom ? [updated.primarySymptom] : []),
      ...existingSymptoms,
      extractedData.clinical_presentation.chief_complaint,
      ...(extractedData.clinical_presentation.primary_symptoms || []),
    ])

    const validSymptoms = Array.from(allSymptoms).filter(
      s => s && s !== 'unknown' && s.trim() !== ''
    )
    updated.primarySymptom = validSymptoms.join(' + ')
    updated.symptoms = validSymptoms
  }

  // Context
  if (extractedData.symptom_characteristics) {
    const sc = extractedData.symptom_characteristics
    if (sc.duration_description !== 'unknown') updated.duration = sc.duration_description
    if (sc.pain_intensity_scale !== null) updated.intensity = sc.pain_intensity_scale
    if (sc.associated_symptoms) updated.associatedSymptoms = [...sc.associated_symptoms]
  }

  // Completeness check
  updated.isComplete = !!(updated.age && updated.gender && updated.primarySymptom)

  return updated
}

// 🏭 Core data factories - Reusable and testable
export const createEmptyPatientData = (): PatientData => ({
  age: undefined,
  gender: undefined,
  primarySymptom: undefined,
  symptoms: [],
  duration: undefined,
  intensity: undefined,
  characteristics: [],
  triggers: [],
  relievingFactors: [],
  associatedSymptoms: [],
  timePattern: undefined,
  isComplete: false,
  isEnhanced: false,
})

// 🔍 Validation utilities
export const isValidMessage = (message: any): message is MedicalMessage => {
  return message && 
    typeof message.id === 'string' && 
    typeof message.content === 'string' &&
    ['user', 'assistant'].includes(message.type) &&
    typeof message.timestamp === 'number'
}

export const isCompletePatientData = (data: PatientData): boolean => {
  return !!(data.age && data.gender && data.primarySymptom)
}

// 🔄 Array utilities for medical data
export const deduplicateSymptoms = (symptoms: string[]): string[] => {
  return Array.from(new Set(symptoms.filter(s => s && s !== 'unknown' && s.trim())))
}

export const mergeSymptoms = (...symptomArrays: (string[] | undefined)[]): string[] => {
  const allSymptoms = symptomArrays
    .filter(Boolean)
    .flat()
    .filter((s): s is string => s !== undefined && s !== 'unknown' && s.trim() !== '')
  
  return deduplicateSymptoms(allSymptoms)
}