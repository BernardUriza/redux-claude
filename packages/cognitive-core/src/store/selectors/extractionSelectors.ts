// 🔬 Extraction Domain Selectors - Clean Architecture
// Creado por Bernard Orozco + Gandalf el Blanco

import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../medicalChatSlice'

// 📊 Constants for stable references
const EMPTY_HISTORY: any[] = []
const EMPTY_FOCUS_AREAS: string[] = []

// 📊 Basic extraction data access
export const selectExtractedData = (state: RootState) =>
  state.medicalChat.medicalExtraction.currentExtraction

export const selectExtractionProcess = (state: RootState) =>
  state.medicalChat.medicalExtraction.extractionProcess

export const selectWipData = createSelector(
  [(state: RootState) => state.medicalChat.medicalExtraction.wipData],
  wipData => wipData
)

// 📈 Completion tracking
export const selectCompletenessPercentage = createSelector([selectExtractedData], extractedData => {
  if (!extractedData?.extraction_metadata) return 0
  return extractedData.extraction_metadata.overall_completeness_percentage
})

// 🔥 Simple property access - no memoization needed
export const selectMissingCriticalFields = (state: RootState) =>
  state.medicalChat.medicalExtraction.currentExtraction?.extraction_metadata
    ?.missing_critical_fields || []

export const selectNOMCompliance = (state: RootState) =>
  state.medicalChat.medicalExtraction.currentExtraction?.extraction_metadata?.nom_compliant || false

export const selectReadyForSOAP = (state: RootState) =>
  state.medicalChat.medicalExtraction.currentExtraction?.extraction_metadata
    ?.ready_for_soap_generation || false

// 🔥 Complex computations - memoized
export const selectExtractionSummary = createSelector(
  [selectExtractedData, selectExtractionProcess],
  (extractedData, process) => ({
    hasData: !!extractedData,
    isExtracting: process.isExtracting,
    currentIteration: process.currentIteration,
    maxIterations: process.maxIterations,
    completenessPercentage:
      extractedData?.extraction_metadata?.overall_completeness_percentage || 0,
    nomCompliant: extractedData?.extraction_metadata?.nom_compliant || false,
    error: process.error,
    lastExtractedAt: process.lastExtractedAt,
  })
)

// 🔥 Extraction history with stable reference
export const selectExtractionHistory = createSelector(
  [(state: RootState) => state.medicalChat.sharedState.currentSession.id,
   (state: RootState) => state.medicalChat.medicalExtraction.extractionHistory],
  (sessionId, history) => history[sessionId] || EMPTY_HISTORY
)

// 🔥 Field completeness analysis
const hasArrayData = (arr?: unknown[] | null) => Array.isArray(arr) && arr.length > 0
const isNotUnknown = (value?: string | number) =>
  value !== 'unknown' && value !== undefined && value !== null

export const selectFieldCompleteness = createSelector([selectExtractedData], extractedData => {
  if (!extractedData) return null
  const {
    demographics: demo,
    clinical_presentation: clinical,
    symptom_characteristics: symptoms,
  } = extractedData

  return {
    demographics: {
      age: isNotUnknown(demo?.patient_age_years),
      gender: isNotUnknown(demo?.patient_gender),
      confidence: demo?.confidence_demographic || 0,
    },
    clinical: {
      complaint: isNotUnknown(clinical?.chief_complaint),
      symptoms: hasArrayData(clinical?.primary_symptoms),
      location: isNotUnknown(clinical?.anatomical_location),
      confidence: clinical?.confidence_symptoms || 0,
    },
    context: {
      duration: isNotUnknown(symptoms?.duration_description),
      intensity: symptoms?.pain_intensity_scale !== null,
      characteristics: hasArrayData(symptoms?.pain_characteristics),
      aggravating: hasArrayData(symptoms?.aggravating_factors),
      relieving: hasArrayData(symptoms?.relieving_factors),
      associated: hasArrayData(symptoms?.associated_symptoms),
      temporal: isNotUnknown(symptoms?.temporal_pattern),
      confidence: symptoms?.confidence_context || 0,
    },
  }
})

// 🔥 Extraction progress tracking
export const selectExtractionProgress = createSelector(
  [selectExtractionProcess, selectCompletenessPercentage],
  (process, completeness) => ({
    isActive: process.isExtracting,
    iteration: process.currentIteration,
    maxIterations: process.maxIterations,
    progressPercentage: Math.max(
      (process.currentIteration / process.maxIterations) * 100,
      completeness
    ),
    shouldContinue: process.currentIteration < process.maxIterations && completeness < 80,
  })
)

// 🔥 Focus areas calculation
export const selectFocusAreas = createSelector(
  [selectFieldCompleteness, selectMissingCriticalFields],
  (fieldCompleteness, missingFields) => {
    if (!fieldCompleteness) return EMPTY_FOCUS_AREAS

    const focusAreas: string[] = []

    // Priority 1: Missing critical NOM fields
    if (missingFields.includes('demographics.patient_age_years')) focusAreas.push('age')
    if (missingFields.includes('demographics.patient_gender')) focusAreas.push('gender')
    if (missingFields.includes('clinical_presentation.chief_complaint'))
      focusAreas.push('chief_complaint')

    // Priority 2: Missing clinical details
    if (!fieldCompleteness.clinical.symptoms) focusAreas.push('symptoms')
    if (!fieldCompleteness.clinical.location) focusAreas.push('location')

    // Priority 3: Missing contextual information
    if (!fieldCompleteness.context.duration) focusAreas.push('duration')
    if (!fieldCompleteness.context.intensity) focusAreas.push('intensity')

    return focusAreas
  }
)