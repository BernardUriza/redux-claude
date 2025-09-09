// 🔄 useIterativeMedicalExtraction - Hook personalizado para extracción médica iterativa
// Creado por Bernard Orozco - Phase 3: Iterative Logic

import { useCallback, useMemo, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  startExtractionProcess,
  completeExtraction,
  incrementIteration,
  setExtractionError,
  updateDemographics,
  updateSymptoms,
  updateContext,
  updateCompleteness,
  clearExtractionData,
  selectExtractionProcess,
  selectExtractedData,
  selectCompletenessPercentage,
  selectNOMCompliance,
  selectFocusAreas,
  selectExtractionProgress,
} from '../store/medicalChatSlice'
import { MedicalDataExtractor } from '../services/medical-data-extractor'
import {
  MedicalExtractionInput,
  MedicalExtractionOutput,
  calculateCompleteness,
  isNOMCompliant,
} from '../types/medicalExtraction'

// State machine types
export type ExtractionState = 'idle' | 'extracting' | 'validating' | 'complete' | 'error'

export interface UseIterativeMedicalExtractionReturn {
  // State
  extractionState: ExtractionState
  currentIteration: number
  maxIterations: number
  completenessPercentage: number
  isNOMCompliant: boolean
  focusAreas: string[]
  extractedData: MedicalExtractionOutput | null
  error: string | null

  // Actions
  startExtraction: (patientInput: string, sessionId: string) => Promise<void>
  continueExtraction: (additionalInput: string) => Promise<void>
  completeExtractionManually: () => void
  resetExtraction: () => void

  // Computed state
  shouldContinue: boolean
  canProceedToSOAP: boolean
}

export const useIterativeMedicalExtraction = (): UseIterativeMedicalExtractionReturn => {
  const dispatch = useAppDispatch()

  // Selectors
  const extractionProcess = useAppSelector(selectExtractionProcess)
  const extractedData = useAppSelector(selectExtractedData)
  const completenessPercentage = useAppSelector(selectCompletenessPercentage)
  const nomCompliant = useAppSelector(selectNOMCompliance)
  const focusAreas = useAppSelector(selectFocusAreas)
  // const extractionProgress = useAppSelector(selectExtractionProgress)
  const extractionProgress = { isActive: false, iteration: 0, maxIterations: 3, progressPercentage: 0, shouldContinue: false }

  // Service instance
  const extractor = new MedicalDataExtractor()

  // Determine current state machine state (Creado por Bernard Orozco)
  const extractionState: ExtractionState = useMemo(() => {
    if (extractionProcess.error) return 'error'
    if (extractionProcess.isExtracting) return 'extracting'
    if (extractedData && completenessPercentage >= 80 && nomCompliant) return 'complete'
    if (extractedData && completenessPercentage > 0) return 'validating'
    return 'idle'
  }, [
    extractionProcess.error,
    extractionProcess.isExtracting,
    extractedData,
    completenessPercentage,
    nomCompliant,
  ])

  // Start extraction process
  const startExtraction = useCallback(
    async (patientInput: string, sessionId: string) => {
      try {
        dispatch(startExtractionProcess({ sessionId, maxIterations: 5 }))

        const input: MedicalExtractionInput = {
          patient_input: patientInput,
          iteration_number: 1,
          max_iterations: 5,
        }

        const result = await extractor.extractMedicalData(input)

        if (result.extracted_data) {
          // Update completeness and metadata
          const processedData = {
            ...result.extracted_data,
            extraction_metadata: {
              ...result.extracted_data.extraction_metadata,
              overall_completeness_percentage: calculateCompleteness(result.extracted_data),
              nom_compliant: isNOMCompliant(result.extracted_data),
              ready_for_soap_generation:
                calculateCompleteness(result.extracted_data) >= 80 &&
                isNOMCompliant(result.extracted_data),
            },
          }

          dispatch(completeExtraction(processedData))
        }
      } catch (error) {
        dispatch(
          setExtractionError(error instanceof Error ? error.message : 'Unknown extraction error')
        )
      }
    },
    [dispatch, extractor]
  )

  // Continue extraction with additional input
  const continueExtraction = useCallback(
    async (additionalInput: string) => {
      if (!extractedData) return

      try {
        dispatch(incrementIteration())

        const input: MedicalExtractionInput = {
          patient_input: additionalInput,
          existing_data: extractedData,
          iteration_number: extractionProcess.currentIteration + 1,
          max_iterations: extractionProcess.maxIterations,
        }

        const result = await extractor.extractMedicalData(input)

        if (result.extracted_data) {
          // Merge with existing data (accumulation logic)
          const mergedData = mergeExtractionData(extractedData, result.extracted_data)

          // Update completeness and metadata
          const processedData = {
            ...mergedData,
            extraction_metadata: {
              ...mergedData.extraction_metadata,
              overall_completeness_percentage: calculateCompleteness(mergedData),
              nom_compliant: isNOMCompliant(mergedData),
              ready_for_soap_generation:
                calculateCompleteness(mergedData) >= 80 && isNOMCompliant(mergedData),
            },
          }

          dispatch(completeExtraction(processedData))
        }
      } catch (error) {
        dispatch(
          setExtractionError(error instanceof Error ? error.message : 'Unknown extraction error')
        )
      }
    },
    [
      dispatch,
      extractor,
      extractedData,
      extractionProcess.currentIteration,
      extractionProcess.maxIterations,
    ]
  )

  // Complete extraction manually (user override)
  const completeExtractionManually = useCallback(() => {
    if (extractedData && nomCompliant) {
      const processedData = {
        ...extractedData,
        extraction_metadata: {
          ...extractedData.extraction_metadata,
          ready_for_soap_generation: true,
        },
      }
      dispatch(completeExtraction(processedData))
    }
  }, [dispatch, extractedData, nomCompliant])

  // Reset extraction
  const resetExtraction = useCallback(() => {
    dispatch(clearExtractionData())
  }, [dispatch])

  // Computed properties
  const shouldContinue = extractionProgress.shouldContinue && extractionState === 'validating'
  const canProceedToSOAP =
    extractionState === 'complete' || (nomCompliant && completenessPercentage >= 60)

  return {
    // State
    extractionState,
    currentIteration: extractionProcess.currentIteration,
    maxIterations: extractionProcess.maxIterations,
    completenessPercentage,
    isNOMCompliant: nomCompliant,
    focusAreas,
    extractedData,
    error: extractionProcess.error,

    // Actions
    startExtraction,
    continueExtraction,
    completeExtractionManually,
    resetExtraction,

    // Computed state
    shouldContinue,
    canProceedToSOAP,
  }
}

// Helper function to merge extraction data (accumulation logic)
function mergeExtractionData(
  existing: MedicalExtractionOutput,
  newData: MedicalExtractionOutput
): MedicalExtractionOutput {
  return {
    demographics: {
      patient_age_years:
        newData.demographics.patient_age_years !== 'unknown'
          ? newData.demographics.patient_age_years
          : existing.demographics.patient_age_years,
      patient_gender:
        newData.demographics.patient_gender !== 'unknown'
          ? newData.demographics.patient_gender
          : existing.demographics.patient_gender,
      confidence_demographic: Math.max(
        existing.demographics.confidence_demographic,
        newData.demographics.confidence_demographic
      ),
    },

    clinical_presentation: {
      chief_complaint:
        newData.clinical_presentation.chief_complaint !== 'unknown'
          ? newData.clinical_presentation.chief_complaint
          : existing.clinical_presentation.chief_complaint,
      primary_symptoms: mergeBestArray(
        existing.clinical_presentation.primary_symptoms,
        newData.clinical_presentation.primary_symptoms
      ),
      anatomical_location:
        newData.clinical_presentation.anatomical_location !== 'unknown'
          ? newData.clinical_presentation.anatomical_location
          : existing.clinical_presentation.anatomical_location,
      confidence_symptoms: Math.max(
        existing.clinical_presentation.confidence_symptoms,
        newData.clinical_presentation.confidence_symptoms
      ),
    },

    symptom_characteristics: {
      duration_description:
        newData.symptom_characteristics.duration_description !== 'unknown'
          ? newData.symptom_characteristics.duration_description
          : existing.symptom_characteristics.duration_description,
      pain_intensity_scale:
        newData.symptom_characteristics.pain_intensity_scale ??
        existing.symptom_characteristics.pain_intensity_scale,
      pain_characteristics: mergeBestArray(
        existing.symptom_characteristics.pain_characteristics,
        newData.symptom_characteristics.pain_characteristics
      ),
      aggravating_factors: mergeBestArray(
        existing.symptom_characteristics.aggravating_factors,
        newData.symptom_characteristics.aggravating_factors
      ),
      relieving_factors: mergeBestArray(
        existing.symptom_characteristics.relieving_factors,
        newData.symptom_characteristics.relieving_factors
      ),
      associated_symptoms: mergeBestArray(
        existing.symptom_characteristics.associated_symptoms,
        newData.symptom_characteristics.associated_symptoms
      ),
      temporal_pattern:
        newData.symptom_characteristics.temporal_pattern !== 'unknown'
          ? newData.symptom_characteristics.temporal_pattern
          : existing.symptom_characteristics.temporal_pattern,
      confidence_context: Math.max(
        existing.symptom_characteristics.confidence_context,
        newData.symptom_characteristics.confidence_context
      ),
    },

    medical_validation: {
      anatomical_contradictions: mergeBestArray(
        existing.medical_validation?.anatomical_contradictions || null,
        newData.medical_validation?.anatomical_contradictions || null
      ) || [],
      logical_inconsistencies: mergeBestArray(
        existing.medical_validation?.logical_inconsistencies || null,
        newData.medical_validation?.logical_inconsistencies || null
      ) || [],
      requires_clarification: mergeBestArray(
        existing.medical_validation?.requires_clarification || null,
        newData.medical_validation?.requires_clarification || null
      ) || [],
      medical_alerts: mergeBestArray(
        existing.medical_validation?.medical_alerts || null,
        newData.medical_validation?.medical_alerts || null
      ) || [],
    },

    extraction_metadata: {
      ...newData.extraction_metadata,
      extraction_timestamp: new Date().toISOString(),
    },
  }
}

// 🧙‍♂️ Gandalf's Array Cache - Creado por Bernard Orozco
const ARRAY_CACHE = new Map<string, string[]>()

// Helper to merge arrays, preferring the one with more content
function mergeBestArray(existing: string[] | null, newArray: string[] | null): string[] | null {
  if (!existing && !newArray) return null
  if (!existing) return newArray
  if (!newArray) return existing

  // 🔥 Stable reference caching for performance 
  const cacheKey = `${existing.join(',')}|${newArray.join(',')}`
  if (ARRAY_CACHE.has(cacheKey)) {
    return ARRAY_CACHE.get(cacheKey)!
  }

  // Combine and deduplicate
  const combined = [...existing, ...newArray]
  const result = Object.freeze(Array.from(new Set(combined)))
  ARRAY_CACHE.set(cacheKey, result)
  return result
}
