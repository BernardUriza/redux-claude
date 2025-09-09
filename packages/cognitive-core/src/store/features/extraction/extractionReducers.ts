// 🔬 Extraction Feature Reducers - Clean Architecture
// Creado por Bernard Orozco + Gandalf el Blanco

import { PayloadAction } from '@reduxjs/toolkit'
import type { MedicalChatState } from '../../types/medicalChatTypes'
import { createEmptyWipData, updatePatientDataFromExtraction } from '../../utils/medicalChatUtils'

// 🏭 Extraction thunk handlers factory - DRY principle
export const createExtractionThunkHandlers = (thunk: any, failureMessage: string) => ({
  pending: (state: MedicalChatState, action: any) => {
    state.medicalExtraction.extractionProcess.isExtracting = true
    state.medicalExtraction.extractionProcess.error = null
    
    // Set iteration logic for initial vs continue
    if (action.meta.arg.isInitial !== false) {
      state.medicalExtraction.extractionProcess.currentIteration = 1
    } else {
      state.medicalExtraction.extractionProcess.currentIteration += 1
    }
  },

  fulfilled: (state: MedicalChatState, action: any) => {
    const { extractedData, completeness, iteration, isComplete } = action.payload
    const sessionId = action.meta.arg.sessionId

    // Update current extraction and process state
    state.medicalExtraction.currentExtraction = extractedData
    state.medicalExtraction.extractionProcess.isExtracting = false
    state.medicalExtraction.extractionProcess.currentIteration = iteration
    state.medicalExtraction.extractionProcess.lastExtractedAt = new Date().toISOString()
    state.medicalExtraction.extractionProcess.error = null

    // Add to history
    if (!state.medicalExtraction.extractionHistory[sessionId]) {
      state.medicalExtraction.extractionHistory[sessionId] = []
    }
    state.medicalExtraction.extractionHistory[sessionId].push(extractedData)

    // Clear WIP data and update shared state
    state.medicalExtraction.wipData = createEmptyWipData()
    // Note: readyForSOAP logic can be handled at component level

    // Update patient data using pure function
    state.sharedState.patientData = updatePatientDataFromExtraction(
      state.sharedState.patientData,
      extractedData
    )
  },

  rejected: (state: MedicalChatState, action: any) => {
    state.medicalExtraction.extractionProcess.isExtracting = false
    state.medicalExtraction.extractionProcess.error = (action.payload as string) || failureMessage
    
    // Handle iteration rollback for continue extraction failures
    if (failureMessage.includes('Continue')) {
      state.medicalExtraction.extractionProcess.currentIteration = Math.max(
        1,
        state.medicalExtraction.extractionProcess.currentIteration - 1
      )
    }
  },
})

// 🔄 Extraction process actions
export const extractionProcessReducers = {
  startExtractionProcess: (state: MedicalChatState, action: PayloadAction<{ sessionId: string; maxIterations?: number }>) => {
    const { sessionId, maxIterations = 5 } = action.payload
    state.medicalExtraction.extractionProcess = {
      isExtracting: false,
      currentIteration: 0,
      maxIterations,
      lastExtractedAt: null,
      error: null,
    }
    // Ensure session exists in history
    if (!state.medicalExtraction.extractionHistory[sessionId]) {
      state.medicalExtraction.extractionHistory[sessionId] = []
    }
  },

  completeExtraction: (state: MedicalChatState, action: PayloadAction<any>) => {
    const extractedData = action.payload
    state.medicalExtraction.currentExtraction = extractedData
    state.medicalExtraction.extractionProcess.isExtracting = false
    state.medicalExtraction.extractionProcess.lastExtractedAt = new Date().toISOString()
    
    // Update patient data
    state.sharedState.patientData = updatePatientDataFromExtraction(
      state.sharedState.patientData,
      extractedData
    )
  },

  incrementIteration: (state: MedicalChatState) => {
    state.medicalExtraction.extractionProcess.currentIteration += 1
  },

  setExtractionError: (state: MedicalChatState, action: PayloadAction<string>) => {
    state.medicalExtraction.extractionProcess.error = action.payload
    state.medicalExtraction.extractionProcess.isExtracting = false
  },

  clearExtractionData: (state: MedicalChatState) => {
    state.medicalExtraction = {
      currentExtraction: null,
      extractionProcess: {
        isExtracting: false,
        currentIteration: 0,
        maxIterations: 5,
        lastExtractedAt: null,
        error: null,
      },
      extractionHistory: {},
      wipData: createEmptyWipData(),
    }
  },
}

// 🔄 WIP data management
export const wipDataReducers = {
  updateDemographics: (state: MedicalChatState, action: PayloadAction<{ field: string; value: any }>) => {
    const { field, value } = action.payload
    state.medicalExtraction.wipData.demographics[field] = value
  },

  updateSymptoms: (state: MedicalChatState, action: PayloadAction<{ field: string; value: any }>) => {
    const { field, value } = action.payload
    state.medicalExtraction.wipData.clinical_presentation[field] = value
  },

  updateContext: (state: MedicalChatState, action: PayloadAction<{ field: string; value: any }>) => {
    const { field, value } = action.payload
    state.medicalExtraction.wipData.symptom_characteristics[field] = value
  },

  updateCompleteness: (state: MedicalChatState, action: PayloadAction<any>) => {
    // This could trigger completeness recalculation if needed
    // Currently handled by extraction metadata
  },

  resetWipData: (state: MedicalChatState) => {
    state.medicalExtraction.wipData = createEmptyWipData()
  },
}