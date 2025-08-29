// 🧠 REDUX MULTINÚCLEO EVOLUCIONADO 2025 - Creado por Bernard Orozco + Gandalf el Blanco

import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit'
import { MedicalExtractionOutput, MedicalExtractionState, UpdateDemographicsPayload, UpdateSymptomsPayload, UpdateContextPayload } from '../types/medicalExtraction'
import { extractMedicalDataThunk, continueExtractionThunk } from './extractionThunks'

export interface MedicalMessage {
  id: string
  content: string
  type: 'user' | 'assistant'
  timestamp: number
  confidence?: number
  metadata?: {
    sessionId?: string
    isStreaming?: boolean
    sectionType?: 'diagnosis' | 'treatment' | 'education' | 'followup'
  }
}

export interface ChatCore {
  messages: MedicalMessage[]
  isLoading: boolean
  lastActivity: number
  sessionId: string
}

// 🏥 DATOS DEL PACIENTE CONFIRMADOS
export interface PatientData {
  // Datos básicos requeridos
  age?: number
  gender?: 'masculino' | 'femenino'
  primarySymptom?: string
  symptoms?: string[]
  
  // Detalles contextuales opcionales pero valiosos
  duration?: string // "2 días", "1 semana", "desde ayer"
  intensity?: number // Escala 1-10
  characteristics?: string[] // ["punzante", "constante", "pulsátil"]
  triggers?: string[] // ["movimiento", "luz", "estrés"]
  relievingFactors?: string[] // ["reposo", "medicamento", "calor"]
  associatedSymptoms?: string[] // ["náusea", "visión borrosa", "mareo"]
  timePattern?: string // "matutino", "nocturno", "todo el día"
  
  // Estado de completitud
  isComplete: boolean // Datos básicos completos
  isEnhanced: boolean // Datos básicos + al menos 2 detalles contextuales
  confirmedAt?: number
}

export interface MedicalChatState {
  // 🧠 NÚCLEOS DE CONVERSACIÓN DUALES (Gandalf decretó: DOS ES SUFICIENTE)
  cores: {
    dashboard: ChatCore // Chat principal del dashboard - NÚCLEO DASHBOARD
    assistant: ChatCore // Chat del asistente médico - NÚCLEO ASSISTANT
  }

  // 🏥 ESTADO COMPARTIDO MÉDICO
  sharedState: {
    currentSession: {
      id: string
      patientId?: string
      startedAt: number
    }
    isLoading: boolean
    error?: string
    // 📝 DATOS DEL PACIENTE CONFIRMADOS POR EL DOCTOR (Legacy - deprecated)
    patientData: PatientData
    // 🎯 ESTADO DE TRANSICIÓN A SOAP
    readyForSOAP: boolean
  }

  // 🧬 NUEVO ESTADO DE EXTRACCIÓN MÉDICA (2025 Architecture)
  medicalExtraction: MedicalExtractionState
}

// 🧠 ESTADO INICIAL DUAL-NÚCLEO (Sin el inútil inference)
const createInitialChatCore = (type: 'dashboard' | 'assistant'): ChatCore => ({
  messages:
    type === 'dashboard'
      ? [
          {
            id: 'welcome_dashboard',
            content: `## 🏥 [NÚCLEO DASHBOARD] - Chat Principal

**SISTEMA DUAL-NÚCLEO v3.1** 
✅ Dashboard Core: Chat médico principal activo
✅ Assistant Core: Autocompletado inteligente activo

🎯 Soy el NÚCLEO DASHBOARD - Manejo conversaciones médicas principales`,
            type: 'assistant',
            timestamp: Date.now(),
            confidence: 0.95,
            metadata: {
              sessionId: `${type}_session`,
              sectionType: 'education',
            },
          },
        ]
      : [],
  isLoading: false,
  lastActivity: Date.now(),
  sessionId: `${type}_session_${Date.now()}`,
})

const initialState: MedicalChatState = {
  cores: {
    dashboard: createInitialChatCore('dashboard'),
    assistant: {
      ...createInitialChatCore('assistant'),
      messages: [{
        id: 'welcome_assistant',
        content: `## 🤖 [NÚCLEO ASSISTANT] - Autocompletado Inteligente\n\n**SISTEMA DUAL-NÚCLEO v3.1**\n✅ Assistant Core activo para sugerencias\n✅ Dashboard Core disponible para chat principal\n\n🎯 Soy el NÚCLEO ASSISTANT - Proporciono autocompletado y sugerencias`,
        type: 'assistant' as const,
        timestamp: Date.now(),
        confidence: 0.95,
        metadata: {
          sessionId: 'assistant_session',
          sectionType: 'education' as const,
        },
      }]
    },
  },
  sharedState: {
    currentSession: {
      id: 'multinucleus_session',
      startedAt: Date.now(),
    },
    isLoading: false,
    patientData: {
      isComplete: false,
      isEnhanced: false,
    },
    readyForSOAP: false,
  },
  medicalExtraction: {
    currentExtraction: null,
    extractionHistory: {},
    extractionProcess: {
      isExtracting: false,
      currentIteration: 0,
      maxIterations: 5,
      lastExtractedAt: null,
      error: null,
    },
    wipData: {
      demographics: {},
      clinical_presentation: {},
      symptom_characteristics: {},
    },
  },
}

// 🔥 SLICE MULTINÚCLEO CON ACCIONES ESPECÍFICAS POR NÚCLEO
const medicalChatSlice = createSlice({
  name: 'medicalChatEvolved',
  initialState,
  reducers: {
    // 💬 ACCIONES ESPECÍFICAS POR NÚCLEO
    addDashboardMessage: (
      state,
      action: PayloadAction<Omit<MedicalMessage, 'id' | 'timestamp'>>
    ) => {
      const message: MedicalMessage = {
        id: `dashboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        ...action.payload,
      }
      state.cores.dashboard.messages.push(message)
      state.cores.dashboard.lastActivity = Date.now()
    },

    addAssistantMessage: (
      state,
      action: PayloadAction<Omit<MedicalMessage, 'id' | 'timestamp'>>
    ) => {
      const message: MedicalMessage = {
        id: `assistant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        ...action.payload,
      }
      state.cores.assistant.messages.push(message)
      state.cores.assistant.lastActivity = Date.now()
    },

    // 🪦 RIP Inference Core - Gandalf lo mató por inútil

    // 🔄 ACCIONES DE CARGA POR NÚCLEO
    setDashboardLoading: (state, action: PayloadAction<boolean>) => {
      state.cores.dashboard.isLoading = action.payload
    },

    setAssistantLoading: (state, action: PayloadAction<boolean>) => {
      state.cores.assistant.isLoading = action.payload
    },

    // 🗑️ LIMPIAR NÚCLEOS ESPECÍFICOS
    clearDashboardMessages: state => {
      state.cores.dashboard.messages = []
    },

    clearAssistantMessages: state => {
      state.cores.assistant.messages = []
    },

    // 🔄 NUEVA SESIÓN (AFECTA TODOS LOS NÚCLEOS)
    startNewSession: (state, action: PayloadAction<{ patientId?: string }>) => {
      const sessionId = `session_${Date.now()}`
      state.sharedState.currentSession = {
        id: sessionId,
        patientId: action.payload.patientId,
        startedAt: Date.now(),
      }

      // Limpiar todos los núcleos excepto mensajes de bienvenida del dashboard
      state.cores.assistant.messages = []
      // 🪦 inference.messages eliminado - Gandalf lo mató
    },

    // 🚫 MANEJO DE ERRORES GLOBAL
    setError: (state, action: PayloadAction<string>) => {
      state.sharedState.error = action.payload
      state.sharedState.isLoading = false
    },

    clearError: state => {
      state.sharedState.error = undefined
    },

    // 🏥 ACCIONES PARA DATOS DEL PACIENTE Y CONFIRMACIÓN DE INFERENCIAS
    confirmPatientInference: (state, action: PayloadAction<{
      type: 'age' | 'gender' | 'symptom' | 'duration' | 'intensity' | 'characteristics' | 'triggers' | 'relievingFactors' | 'associatedSymptoms' | 'timePattern'
      value: string | number | string[]
      confidence: number
    }>) => {
      const { type, value, confidence } = action.payload
      
      switch (type) {
        case 'age':
          state.sharedState.patientData.age = typeof value === 'number' ? value : parseInt(value as string)
          break
        case 'gender':
          state.sharedState.patientData.gender = value as 'masculino' | 'femenino'
          break
        case 'symptom':
          state.sharedState.patientData.primarySymptom = value as string
          if (!state.sharedState.patientData.symptoms) {
            state.sharedState.patientData.symptoms = []
          }
          if (!state.sharedState.patientData.symptoms.includes(value as string)) {
            state.sharedState.patientData.symptoms.push(value as string)
          }
          break
        case 'duration':
          state.sharedState.patientData.duration = value as string
          break
        case 'intensity':
          state.sharedState.patientData.intensity = typeof value === 'number' ? value : parseInt(value as string)
          break
        case 'characteristics':
          const charArray = Array.isArray(value) ? value : [value as string]
          state.sharedState.patientData.characteristics = charArray
          break
        case 'triggers':
          const triggerArray = Array.isArray(value) ? value : [value as string]
          state.sharedState.patientData.triggers = triggerArray
          break
        case 'relievingFactors':
          const reliefArray = Array.isArray(value) ? value : [value as string]
          state.sharedState.patientData.relievingFactors = reliefArray
          break
        case 'associatedSymptoms':
          const assocArray = Array.isArray(value) ? value : [value as string]
          state.sharedState.patientData.associatedSymptoms = assocArray
          break
        case 'timePattern':
          state.sharedState.patientData.timePattern = value as string
          break
      }
      
      state.sharedState.patientData.confirmedAt = Date.now()
      
      // Verificar si los datos básicos están completos
      const { age, gender, primarySymptom } = state.sharedState.patientData
      state.sharedState.patientData.isComplete = !!(age && gender && primarySymptom)
      
      // Verificar si tiene detalles contextuales (enhanced)
      const contextualDetails = [
        state.sharedState.patientData.duration,
        state.sharedState.patientData.intensity,
        state.sharedState.patientData.characteristics?.length,
        state.sharedState.patientData.triggers?.length,
        state.sharedState.patientData.relievingFactors?.length,
        state.sharedState.patientData.associatedSymptoms?.length,
        state.sharedState.patientData.timePattern
      ].filter(detail => detail).length
      
      state.sharedState.patientData.isEnhanced = contextualDetails >= 2
      
      // Marcar listo para SOAP si datos completos (básicos suficientes, enhanced es bonus)
      if (state.sharedState.patientData.isComplete) {
        state.sharedState.readyForSOAP = true
      }
    },

    // 🎯 CONFIRMAR ANÁLISIS COMPLETO Y PROCEDER A SOAP
    confirmReadyForSOAP: (state, action: PayloadAction<{
      age: number
      gender: 'masculino' | 'femenino'
      primarySymptom: string
    }>) => {
      const { age, gender, primarySymptom } = action.payload
      
      state.sharedState.patientData = {
        age,
        gender,
        primarySymptom,
        symptoms: [primarySymptom],
        isComplete: true,
        isEnhanced: false,
        confirmedAt: Date.now(),
      }
      
      state.sharedState.readyForSOAP = true
    },

    // 🔄 RESET DATOS DEL PACIENTE (Nueva sesión)
    resetPatientData: (state) => {
      state.sharedState.patientData = {
        isComplete: false,
        isEnhanced: false,
      }
      state.sharedState.readyForSOAP = false
    },

    // 🎯 MARCAR NO LISTO PARA SOAP (Si doctor corrige datos)
    setNotReadyForSOAP: (state) => {
      state.sharedState.readyForSOAP = false
    },

    // 🧬 NUEVAS ACCIONES DE EXTRACCIÓN MÉDICA (2025 Architecture)
    
    // 📊 Actualizar demografía usando Immer draft patterns
    updateDemographics: (state, action: PayloadAction<UpdateDemographicsPayload>) => {
      Object.assign(state.medicalExtraction.wipData.demographics, action.payload)
    },

    // 🩺 Actualizar síntomas primarios/secundarios con acumulación
    updateSymptoms: (state, action: PayloadAction<UpdateSymptomsPayload>) => {
      Object.assign(state.medicalExtraction.wipData.clinical_presentation, action.payload)
    },

    // 📝 Actualizar contexto (duración, intensidad, factores) progressive build
    updateContext: (state, action: PayloadAction<UpdateContextPayload>) => {
      Object.assign(state.medicalExtraction.wipData.symptom_characteristics, action.payload)
    },

    // 📈 Actualizar porcentaje de completitud
    updateCompleteness: (state, action: PayloadAction<{ percentage: number; missingFields: string[] }>) => {
      if (state.medicalExtraction.currentExtraction) {
        state.medicalExtraction.currentExtraction.extraction_metadata.overall_completeness_percentage = action.payload.percentage
        state.medicalExtraction.currentExtraction.extraction_metadata.missing_critical_fields = action.payload.missingFields
      }
    },

    // 🚀 Iniciar proceso de extracción
    startExtractionProcess: (state, action: PayloadAction<{ sessionId: string; maxIterations?: number }>) => {
      state.medicalExtraction.extractionProcess.isExtracting = true
      state.medicalExtraction.extractionProcess.currentIteration = 1
      state.medicalExtraction.extractionProcess.maxIterations = action.payload.maxIterations || 5
      state.medicalExtraction.extractionProcess.error = null
      
      // Initialize history for this session if it doesn't exist
      if (!state.medicalExtraction.extractionHistory[action.payload.sessionId]) {
        state.medicalExtraction.extractionHistory[action.payload.sessionId] = []
      }
    },

    // 📥 Finalizar extracción con datos completos
    completeExtraction: (state, action: PayloadAction<MedicalExtractionOutput>) => {
      const sessionId = state.sharedState.currentSession.id
      
      state.medicalExtraction.currentExtraction = action.payload
      state.medicalExtraction.extractionProcess.isExtracting = false
      state.medicalExtraction.extractionProcess.lastExtractedAt = new Date().toISOString()
      
      // Add to history (initialize if needed)
      if (!state.medicalExtraction.extractionHistory[sessionId]) {
        state.medicalExtraction.extractionHistory[sessionId] = []
      }
      state.medicalExtraction.extractionHistory[sessionId].push(action.payload)
      
      // Clear WIP data
      state.medicalExtraction.wipData = {
        demographics: {},
        clinical_presentation: {},
        symptom_characteristics: {},
      }
      
      // Update shared state if extraction is complete enough
      if (action.payload.extraction_metadata?.ready_for_soap_generation) {
        state.sharedState.readyForSOAP = true
      }
    },

    // 🔄 Incrementar iteración
    incrementIteration: (state) => {
      state.medicalExtraction.extractionProcess.currentIteration += 1
    },

    // ❌ Error en extracción
    setExtractionError: (state, action: PayloadAction<string>) => {
      state.medicalExtraction.extractionProcess.error = action.payload
      state.medicalExtraction.extractionProcess.isExtracting = false
    },

    // 🧹 Limpiar datos de extracción
    clearExtractionData: (state) => {
      state.medicalExtraction.currentExtraction = null
      state.medicalExtraction.extractionProcess = {
        isExtracting: false,
        currentIteration: 0,
        maxIterations: 5,
        lastExtractedAt: null,
        error: null,
      }
      state.medicalExtraction.wipData = {
        demographics: {},
        clinical_presentation: {},
        symptom_characteristics: {},
      }
    },

    // 🔄 Reset extracción para nueva sesión
    resetExtractionForNewSession: (state, action: PayloadAction<string>) => {
      const sessionId = action.payload
      state.medicalExtraction.currentExtraction = null
      state.medicalExtraction.extractionProcess = {
        isExtracting: false,
        currentIteration: 0,
        maxIterations: 5,
        lastExtractedAt: null,
        error: null,
      }
      state.medicalExtraction.wipData = {
        demographics: {},
        clinical_presentation: {},
        symptom_characteristics: {},
      }
      
      // Initialize history for new session
      if (!state.medicalExtraction.extractionHistory[sessionId]) {
        state.medicalExtraction.extractionHistory[sessionId] = []
      }
    },
  },
  
  // 🔄 EXTRA REDUCERS - Builder Callback Pattern para Async Thunks
  extraReducers: (builder) => {
    // === Extract Medical Data Thunk ===
    builder
      .addCase(extractMedicalDataThunk.pending, (state, action) => {
        state.medicalExtraction.extractionProcess.isExtracting = true
        state.medicalExtraction.extractionProcess.error = null
        // Set iteration to 1 if this is initial extraction
        if (action.meta.arg.isInitial !== false) {
          state.medicalExtraction.extractionProcess.currentIteration = 1
        }
      })
      .addCase(extractMedicalDataThunk.fulfilled, (state, action) => {
        const { extractedData, completeness, shouldContinue, iteration, isComplete } = action.payload
        
        // Update current extraction
        state.medicalExtraction.currentExtraction = extractedData
        
        // Update process state
        state.medicalExtraction.extractionProcess.isExtracting = false
        state.medicalExtraction.extractionProcess.currentIteration = iteration
        state.medicalExtraction.extractionProcess.lastExtractedAt = new Date().toISOString()
        state.medicalExtraction.extractionProcess.error = null
        
        // Add to history
        const sessionId = action.meta.arg.sessionId
        if (!state.medicalExtraction.extractionHistory[sessionId]) {
          state.medicalExtraction.extractionHistory[sessionId] = []
        }
        state.medicalExtraction.extractionHistory[sessionId].push(extractedData)
        
        // Clear WIP data since we have a complete extraction
        state.medicalExtraction.wipData = {
          demographics: {},
          clinical_presentation: {},
          symptom_characteristics: {},
        }
        
        // Update shared state if ready for SOAP
        if (isComplete && completeness.readyForSOAP) {
          state.sharedState.readyForSOAP = true
        }
      })
      .addCase(extractMedicalDataThunk.rejected, (state, action) => {
        state.medicalExtraction.extractionProcess.isExtracting = false
        state.medicalExtraction.extractionProcess.error = action.payload as string || 'Extraction failed'
      })

    // === Continue Extraction Thunk ===
    builder
      .addCase(continueExtractionThunk.pending, (state, action) => {
        state.medicalExtraction.extractionProcess.isExtracting = true
        state.medicalExtraction.extractionProcess.error = null
        // Increment iteration
        state.medicalExtraction.extractionProcess.currentIteration += 1
      })
      .addCase(continueExtractionThunk.fulfilled, (state, action) => {
        const { extractedData, completeness, shouldContinue, iteration, isComplete } = action.payload
        
        // Update current extraction with merged data
        state.medicalExtraction.currentExtraction = extractedData
        
        // Update process state
        state.medicalExtraction.extractionProcess.isExtracting = false
        state.medicalExtraction.extractionProcess.currentIteration = iteration
        state.medicalExtraction.extractionProcess.lastExtractedAt = new Date().toISOString()
        state.medicalExtraction.extractionProcess.error = null
        
        // Add to history
        const sessionId = action.meta.arg.sessionId
        if (!state.medicalExtraction.extractionHistory[sessionId]) {
          state.medicalExtraction.extractionHistory[sessionId] = []
        }
        state.medicalExtraction.extractionHistory[sessionId].push(extractedData)
        
        // Clear WIP data since we have updated extraction
        state.medicalExtraction.wipData = {
          demographics: {},
          clinical_presentation: {},
          symptom_characteristics: {},
        }
        
        // Update shared state if ready for SOAP
        if (isComplete && completeness.readyForSOAP) {
          state.sharedState.readyForSOAP = true
        }
      })
      .addCase(continueExtractionThunk.rejected, (state, action) => {
        state.medicalExtraction.extractionProcess.isExtracting = false
        state.medicalExtraction.extractionProcess.error = action.payload as string || 'Continue extraction failed'
        // Don't increment iteration on failure
        state.medicalExtraction.extractionProcess.currentIteration = Math.max(1, state.medicalExtraction.extractionProcess.currentIteration - 1)
      })
  }
})

export const {
  addDashboardMessage,
  addAssistantMessage,
  // 🪦 addInferenceMessage eliminado - ya no existe
  setDashboardLoading,
  setAssistantLoading,
  clearDashboardMessages,
  clearAssistantMessages,
  startNewSession,
  setError,
  clearError,
  confirmPatientInference,
  confirmReadyForSOAP,
  resetPatientData,
  setNotReadyForSOAP,
  // 🧬 Nuevas acciones de extracción médica
  updateDemographics,
  updateSymptoms,
  updateContext,
  updateCompleteness,
  startExtractionProcess,
  completeExtraction,
  incrementIteration,
  setExtractionError,
  clearExtractionData,
  resetExtractionForNewSession,
} = medicalChatSlice.actions

export default medicalChatSlice.reducer

// 🔄 Export async thunks
export { extractMedicalDataThunk, continueExtractionThunk }

// 🎯 MEMOIZED SELECTORS USING CREATESELECTOR (2025 Best Practices)

// Root state type helper
type RootState = { medicalChat: MedicalChatState }

// 📊 Basic data access selectors
// Direct selectors without createSelector to avoid identity warnings
export const selectExtractedData = (state: RootState) => 
  state.medicalChat.medicalExtraction.currentExtraction

export const selectExtractionProcess = (state: RootState) => 
  state.medicalChat.medicalExtraction.extractionProcess

export const selectWipData = createSelector(
  [(state: RootState) => state.medicalChat.medicalExtraction.wipData],
  (wipData) => wipData
)

// 📈 Real-time completion tracking
export const selectCompletenessPercentage = createSelector(
  [selectExtractedData],
  (extractedData) => {
    if (!extractedData?.extraction_metadata) return 0
    return extractedData.extraction_metadata.overall_completeness_percentage
  }
)

// ❌ NOM validation gaps
export const selectMissingCriticalFields = createSelector(
  [selectExtractedData],
  (extractedData) => {
    if (!extractedData?.extraction_metadata) return []
    return extractedData.extraction_metadata.missing_critical_fields
  }
)

// 🏥 NOM compliance status
export const selectNOMCompliance = createSelector(
  [selectExtractedData],
  (extractedData) => {
    if (!extractedData?.extraction_metadata) return false
    return extractedData.extraction_metadata.nom_compliant
  }
)

// 📋 SOAP transition readiness
export const selectReadyForSOAP = createSelector(
  [selectExtractedData],
  (extractedData) => {
    if (!extractedData?.extraction_metadata) return false
    return extractedData.extraction_metadata.ready_for_soap_generation
  }
)

// 📊 Current extraction status summary
export const selectExtractionSummary = createSelector(
  [selectExtractedData, selectExtractionProcess, selectCompletenessPercentage, selectNOMCompliance],
  (extractedData, process, completeness, nomCompliant) => ({
    hasData: !!extractedData,
    isExtracting: process.isExtracting,
    currentIteration: process.currentIteration,
    maxIterations: process.maxIterations,
    completenessPercentage: completeness,
    nomCompliant,
    error: process.error,
    lastExtractedAt: process.lastExtractedAt,
  })
)

// 🔍 Extraction history by session
export const selectExtractionHistory = createSelector(
  [(state: RootState) => state.medicalChat.medicalExtraction.extractionHistory,
   (state: RootState) => state.medicalChat.sharedState.currentSession.id],
  (history, sessionId) => history[sessionId] || []
)

// 📋 Detailed field completeness breakdown
export const selectFieldCompleteness = createSelector(
  [selectExtractedData],
  (extractedData) => {
    if (!extractedData) return null
    
    return {
      demographics: {
        age: extractedData.demographics?.patient_age_years !== "unknown",
        gender: extractedData.demographics?.patient_gender !== "unknown",
        confidence: extractedData.demographics?.confidence_demographic || 0,
      },
      clinical: {
        complaint: extractedData.clinical_presentation?.chief_complaint !== "unknown",
        symptoms: extractedData.clinical_presentation?.primary_symptoms?.length ? extractedData.clinical_presentation?.primary_symptoms.length > 0 : false,
        location: extractedData.clinical_presentation?.anatomical_location !== "unknown",
        confidence: extractedData.clinical_presentation?.confidence_symptoms || 0,
      },
      context: {
        duration: extractedData.symptom_characteristics?.duration_description !== "unknown",
        intensity: extractedData.symptom_characteristics?.pain_intensity_scale !== null,
        characteristics: extractedData.symptom_characteristics?.pain_characteristics?.length ? extractedData.symptom_characteristics?.pain_characteristics.length > 0 : false,
        aggravating: extractedData.symptom_characteristics?.aggravating_factors?.length ? extractedData.symptom_characteristics?.aggravating_factors.length > 0 : false,
        relieving: extractedData.symptom_characteristics?.relieving_factors?.length ? extractedData.symptom_characteristics?.relieving_factors.length > 0 : false,
        associated: extractedData.symptom_characteristics?.associated_symptoms?.length ? extractedData.symptom_characteristics?.associated_symptoms.length > 0 : false,
        temporal: extractedData.symptom_characteristics?.temporal_pattern !== "unknown",
        confidence: extractedData.symptom_characteristics?.confidence_context || 0,
      }
    }
  }
)

// 🎯 Extraction progress indicator
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

// 🚨 Areas needing more information
export const selectFocusAreas = createSelector(
  [selectFieldCompleteness, selectMissingCriticalFields],
  (fieldCompleteness, missingFields) => {
    if (!fieldCompleteness) return []
    
    const focusAreas: string[] = []
    
    // Priority 1: Missing critical NOM fields
    if (missingFields.includes('demographics.patient_age_years')) focusAreas.push('age')
    if (missingFields.includes('demographics.patient_gender')) focusAreas.push('gender')
    if (missingFields.includes('clinical_presentation.chief_complaint')) focusAreas.push('chief_complaint')
    
    // Priority 2: Missing clinical details
    if (!fieldCompleteness.clinical.symptoms) focusAreas.push('symptoms')
    if (!fieldCompleteness.clinical.location) focusAreas.push('location')
    
    // Priority 3: Missing contextual information
    if (!fieldCompleteness.context.duration) focusAreas.push('duration')
    if (!fieldCompleteness.context.intensity) focusAreas.push('intensity')
    
    return focusAreas
  }
)
