// 🔄 Extraction Thunks - Async actions with builder callback extraReducers
// Creado por Bernard Orozco - Phase 3: Iterative Logic (Progressive Data Accumulation)

import { createAsyncThunk } from '@reduxjs/toolkit'
import { MedicalDataExtractor } from '../services/medical-data-extractor'
import {
  MedicalExtractionInput,
  MedicalExtractionOutput,
  calculateCompleteness,
  isNOMCompliant,
} from '../types/medicalExtraction'
import { checkCompleteness, shouldContinueExtraction } from '../utils/completenessChecker'
import type { RootState } from './store'

// Thunk argument types
interface ExtractDataArgs {
  patientInput: string
  sessionId: string
  isInitial?: boolean
}

interface ContinueExtractionArgs {
  additionalInput: string
  sessionId: string
}

export interface ExtractionResult {
  extractedData: MedicalExtractionOutput
  completeness: ReturnType<typeof checkCompleteness>
  shouldContinue: boolean
  iteration: number
  isComplete: boolean
}

// Service instance
const extractor = new MedicalDataExtractor()

/**
 * Async thunk para extraer datos médicos (inicial)
 */
export const extractMedicalDataThunk = createAsyncThunk<
  ExtractionResult,
  ExtractDataArgs,
  { state: RootState }
>(
  'medicalExtraction/extractData',
  async ({ patientInput, sessionId, isInitial = true }, { getState, rejectWithValue }) => {
    try {
      const state = getState()
      const currentExtraction = state.medicalChat.medicalExtraction.currentExtraction
      const currentIteration =
        state.medicalChat.medicalExtraction.extractionProcess.currentIteration

      const input: MedicalExtractionInput = {
        patient_input: patientInput,
        existing_data: isInitial ? undefined : (currentExtraction ?? undefined),
        iteration_number: isInitial ? 1 : currentIteration + 1,
        max_iterations: 5,
        conversation_context: isInitial ? [] : [patientInput], // Simple context for now
      }

      const result = await extractor.extractMedicalData(input)

      if (!result.extracted_data) {
        throw new Error('No extraction data received')
      }

      // Merge with existing data if this is a continuation
      let finalData = result.extracted_data
      if (!isInitial && currentExtraction) {
        finalData = mergeExtractionData(currentExtraction, result.extracted_data)
      }

      // Calculate completeness with weighted scoring
      const completeness = checkCompleteness(finalData)

      // Update metadata based on completeness calculation
      finalData.extraction_metadata = {
        ...finalData.extraction_metadata,
        overall_completeness_percentage: completeness.totalScore,
        demographic_complete: completeness.demographicScore >= 40,
        clinical_complete: completeness.clinicalScore >= 30,
        context_complete: completeness.contextScore >= 15, // At least 50% of context
        nom_compliant: completeness.nomCompliant,
        ready_for_soap_generation: completeness.readyForSOAP,
        missing_critical_fields: completeness.missingFields,
        extraction_timestamp: new Date().toISOString(),
        claude_model_used: 'claude-sonnet-4',
      }

      // Determine if should continue
      const continuationDecision = shouldContinueExtraction(
        completeness,
        input.iteration_number || 1,
        5
      )

      return {
        extractedData: finalData,
        completeness,
        shouldContinue: continuationDecision.shouldContinue,
        iteration: input.iteration_number || 1,
        isComplete: completeness.readyForSOAP,
      }
    } catch (error) {
      console.error('Medical extraction failed:', error)
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown extraction error')
    }
  }
)

/**
 * Async thunk para continuar extracción iterativa
 */
export const continueExtractionThunk = createAsyncThunk<
  ExtractionResult,
  ContinueExtractionArgs,
  { state: RootState }
>(
  'medicalExtraction/continueExtraction',
  async ({ additionalInput, sessionId }, { getState, rejectWithValue }) => {
    try {
      const state = getState()
      const currentExtraction = state.medicalChat.medicalExtraction.currentExtraction
      const currentIteration =
        state.medicalChat.medicalExtraction.extractionProcess.currentIteration

      if (!currentExtraction) {
        throw new Error('No current extraction to continue')
      }

      const input: MedicalExtractionInput = {
        patient_input: additionalInput,
        existing_data: currentExtraction,
        iteration_number: currentIteration + 1,
        max_iterations: 5,
        conversation_context: [additionalInput], // Add to context
      }

      const result = await extractor.extractMedicalData(input)

      if (!result.extracted_data) {
        throw new Error('No extraction data received')
      }

      // Merge with existing data (accumulation logic)
      const mergedData = mergeExtractionData(currentExtraction, result.extracted_data)

      // Calculate completeness with weighted scoring
      const completeness = checkCompleteness(mergedData)

      // Update metadata
      mergedData.extraction_metadata = {
        ...mergedData.extraction_metadata,
        overall_completeness_percentage: completeness.totalScore,
        demographic_complete: completeness.demographicScore >= 40,
        clinical_complete: completeness.clinicalScore >= 30,
        context_complete: completeness.contextScore >= 15,
        nom_compliant: completeness.nomCompliant,
        ready_for_soap_generation: completeness.readyForSOAP,
        missing_critical_fields: completeness.missingFields,
        extraction_timestamp: new Date().toISOString(),
        claude_model_used: 'claude-sonnet-4',
      }

      // Determine if should continue
      const continuationDecision = shouldContinueExtraction(completeness, currentIteration + 1, 5)

      return {
        extractedData: mergedData,
        completeness,
        shouldContinue: continuationDecision.shouldContinue,
        iteration: currentIteration + 1,
        isComplete: completeness.readyForSOAP,
      }
    } catch (error) {
      console.error('Continue extraction failed:', error)
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown extraction error')
    }
  }
)

/**
 * Helper function to merge extraction data (deep merge with priority to new data)
 */
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
      primary_symptoms: mergeArrays(
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
      pain_characteristics: mergeArrays(
        existing.symptom_characteristics.pain_characteristics,
        newData.symptom_characteristics.pain_characteristics
      ),
      aggravating_factors: mergeArrays(
        existing.symptom_characteristics.aggravating_factors,
        newData.symptom_characteristics.aggravating_factors
      ),
      relieving_factors: mergeArrays(
        existing.symptom_characteristics.relieving_factors,
        newData.symptom_characteristics.relieving_factors
      ),
      associated_symptoms: mergeArrays(
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
      anatomical_contradictions:
        mergeArrays(
          existing.medical_validation?.anatomical_contradictions,
          newData.medical_validation?.anatomical_contradictions
        ) || [],
      logical_inconsistencies:
        mergeArrays(
          existing.medical_validation?.logical_inconsistencies,
          newData.medical_validation?.logical_inconsistencies
        ) || [],
      requires_clarification:
        mergeArrays(
          existing.medical_validation?.requires_clarification,
          newData.medical_validation?.requires_clarification
        ) || [],
      medical_alerts:
        mergeArrays(
          existing.medical_validation?.medical_alerts,
          newData.medical_validation?.medical_alerts
        ) || [],
    },

    extraction_metadata: {
      ...existing.extraction_metadata,
      ...newData.extraction_metadata,
      extraction_timestamp: new Date().toISOString(),
    },
  }
}

/**
 * Helper function to merge string arrays with deduplication
 */
function mergeArrays(existing: readonly string[] | null, newArray: readonly string[] | null): readonly string[] | null {
  if (!existing && !newArray) return null
  if (!existing) return newArray
  if (!newArray) return existing

  // Combine, deduplicate, and sort for consistency
  const combined = [...existing, ...newArray]
  const unique = Array.from(new Set(combined))
  return unique.sort()
}
