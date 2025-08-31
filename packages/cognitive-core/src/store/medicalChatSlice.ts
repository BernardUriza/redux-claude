// 🧠 REDUX MULTINÚCLEO EVOLUCIONADO 2025 - Creado por Bernard Orozco + Gandalf el Blanco

// 🔧 UTILITY FUNCTIONS - Single source of truth para mapping y factories

// 🏭 Message creation factory - NO MORE DUPLICATION
const createMessage = (prefix: string, payload: Omit<MedicalMessage, 'id' | 'timestamp'>): MedicalMessage => ({
  id: `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  timestamp: Date.now(),
  ...payload,
})

// 🧹 WIP Data reset utility - NO MORE 4x REPETITION
const createEmptyWipData = () => ({
  demographics: {},
  clinical_presentation: {},
  symptom_characteristics: {},
})

// 🔄 Array/Value processor - NO MORE SWITCH CASE REPETITION
const processPatientValue = (value: string | number | string[], type: 'array' | 'string' | 'number') => {
  switch (type) {
    case 'array':
      return Array.isArray(value) ? value : [value as string]
    case 'number':
      return typeof value === 'number' ? value : parseInt(value as string)
    default:
      return value as string
  }
}

const updatePatientDataFromExtraction = (
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
  
  // Symptoms - ACCUMULATE without duplicates
  if (extractedData.clinical_presentation?.chief_complaint && 
      extractedData.clinical_presentation.chief_complaint !== 'unknown') {
    
    const existingSymptoms = updated.symptoms || []
    const allSymptoms = new Set([
      ...(updated.primarySymptom ? [updated.primarySymptom] : []),
      ...existingSymptoms,
      extractedData.clinical_presentation.chief_complaint,
      ...(extractedData.clinical_presentation.primary_symptoms || [])
    ])
    
    const validSymptoms = Array.from(allSymptoms).filter(s => s && s !== 'unknown' && s.trim() !== '')
    updated.primarySymptom = validSymptoms.join(' + ')
    updated.symptoms = validSymptoms
  }
  
  // Context
  if (extractedData.symptom_characteristics) {
    const sc = extractedData.symptom_characteristics
    if (sc.duration_description !== 'unknown') updated.duration = sc.duration_description
    if (sc.pain_intensity_scale !== null) updated.intensity = sc.pain_intensity_scale
    if (sc.associated_symptoms) updated.associatedSymptoms = sc.associated_symptoms
  }
  
  // Completeness check
  updated.isComplete = !!(updated.age && updated.gender && updated.primarySymptom)
  
  return updated
}

import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit'
import {
  MedicalExtractionOutput,
  MedicalExtractionState,
  UpdateDemographicsPayload,
  UpdateSymptomsPayload,
  UpdateContextPayload,
} from '../types/medicalExtraction'
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
      messages: [
        {
          id: 'welcome_assistant',
          content: `## 🤖 [NÚCLEO ASSISTANT] - Autocompletado Inteligente\n\n**SISTEMA DUAL-NÚCLEO v3.1**\n✅ Assistant Core activo para sugerencias\n✅ Dashboard Core disponible para chat principal\n\n🎯 Soy el NÚCLEO ASSISTANT - Proporciono autocompletado y sugerencias`,
          type: 'assistant' as const,
          timestamp: Date.now(),
          confidence: 0.95,
          metadata: {
            sessionId: 'assistant_session',
            sectionType: 'education' as const,
          },
        },
      ],
    },
  },
  sharedState: {
    currentSession: {
      id: 'multinucleus_session',
      startedAt: Date.now(),
    },
    isLoading: false,
    patientData: {
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
    // 💬 ACCIONES ESPECÍFICAS POR NÚCLEO - USANDO FACTORY
    addDashboardMessage: (
      state,
      action: PayloadAction<Omit<MedicalMessage, 'id' | 'timestamp'>>
    ) => {
      const message = createMessage('dashboard', action.payload)
      state.cores.dashboard.messages.push(message)
      state.cores.dashboard.lastActivity = Date.now()
    },

    addAssistantMessage: (
      state,
      action: PayloadAction<Omit<MedicalMessage, 'id' | 'timestamp'>>
    ) => {
      const message = createMessage('assistant', action.payload)
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
    confirmPatientInference: (
      state,
      action: PayloadAction<{
        type:
          | 'age'
          | 'gender'
          | 'symptom'
          | 'duration'
          | 'intensity'
          | 'characteristics'
          | 'triggers'
          | 'relievingFactors'
          | 'associatedSymptoms'
          | 'timePattern'
        value: string | number | string[]
        confidence: number
      }>
    ) => {
      const { type, value, confidence } = action.payload

      switch (type) {
        case 'age':
          state.sharedState.patientData.age =
            typeof value === 'number' ? value : parseInt(value as string)
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
          state.sharedState.patientData.intensity =
            typeof value === 'number' ? value : parseInt(value as string)
          break
        case 'characteristics':
          state.sharedState.patientData.characteristics = processPatientValue(value, 'array') as string[]
          break
        case 'triggers':
          state.sharedState.patientData.triggers = processPatientValue(value, 'array') as string[]
          break
        case 'relievingFactors':
          state.sharedState.patientData.relievingFactors = processPatientValue(value, 'array') as string[]
          break
        case 'associatedSymptoms':
          state.sharedState.patientData.associatedSymptoms = processPatientValue(value, 'array') as string[]
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
        state.sharedState.patientData.timePattern,
      ].filter(detail => detail).length

      state.sharedState.patientData.isEnhanced = contextualDetails >= 2

      // Marcar listo para SOAP si datos completos (básicos suficientes, enhanced es bonus)
      if (state.sharedState.patientData.isComplete) {
        state.sharedState.readyForSOAP = true
      }
    },

    // 🎯 CONFIRMAR ANÁLISIS COMPLETO Y PROCEDER A SOAP
    confirmReadyForSOAP: (
      state,
      action: PayloadAction<{
        age: number
        gender: 'masculino' | 'femenino'
        primarySymptom: string
      }>
    ) => {
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
    resetPatientData: state => {
      state.sharedState.patientData = {
        isComplete: false,
        isEnhanced: false,
      }
      state.sharedState.readyForSOAP = false
    },

    // 🎯 MARCAR NO LISTO PARA SOAP (Si doctor corrige datos)
    setNotReadyForSOAP: state => {
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
    updateCompleteness: (
      state,
      action: PayloadAction<{ percentage: number; missingFields: string[] }>
    ) => {
      if (state.medicalExtraction.currentExtraction) {
        state.medicalExtraction.currentExtraction.extraction_metadata.overall_completeness_percentage =
          action.payload.percentage
        state.medicalExtraction.currentExtraction.extraction_metadata.missing_critical_fields =
          action.payload.missingFields
      }
    },

    // 🚀 Iniciar proceso de extracción
    startExtractionProcess: (
      state,
      action: PayloadAction<{ sessionId: string; maxIterations?: number }>
    ) => {
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
      const extractedData = action.payload

      state.medicalExtraction.currentExtraction = extractedData
      state.medicalExtraction.extractionProcess.isExtracting = false
      state.medicalExtraction.extractionProcess.lastExtractedAt = new Date().toISOString()

      // Add to history
      if (!state.medicalExtraction.extractionHistory[sessionId]) {
        state.medicalExtraction.extractionHistory[sessionId] = []
      }
      state.medicalExtraction.extractionHistory[sessionId].push(extractedData)

      // Clear WIP data
      state.medicalExtraction.wipData = createEmptyWipData()

      // Update shared state
      if (extractedData.extraction_metadata?.ready_for_soap_generation) {
        state.sharedState.readyForSOAP = true
      }
      
      // 🔥 USE PURE FUNCTION - No more duplicated logic
      state.sharedState.patientData = updatePatientDataFromExtraction(
        state.sharedState.patientData,
        extractedData
      )
    },

    // 🔄 Incrementar iteración
    incrementIteration: state => {
      state.medicalExtraction.extractionProcess.currentIteration += 1
    },

    // ❌ Error en extracción
    setExtractionError: (state, action: PayloadAction<string>) => {
      state.medicalExtraction.extractionProcess.error = action.payload
      state.medicalExtraction.extractionProcess.isExtracting = false
    },

    // 🧹 Limpiar datos de extracción
    clearExtractionData: state => {
      state.medicalExtraction.currentExtraction = null
      state.medicalExtraction.extractionProcess = {
        isExtracting: false,
        currentIteration: 0,
        maxIterations: 5,
        lastExtractedAt: null,
        error: null,
      }
      state.medicalExtraction.wipData = createEmptyWipData()
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
      state.medicalExtraction.wipData = createEmptyWipData()

      // Initialize history for new session
      if (!state.medicalExtraction.extractionHistory[sessionId]) {
        state.medicalExtraction.extractionHistory[sessionId] = []
      }
    },
  },

  // 🔥 EXTRA REDUCERS - FACTORY PATTERN ELIMINATES 90+ LINES OF BOILERPLATE
  extraReducers: builder => {
    const extractHandlers = createExtractionThunkHandlers(extractMedicalDataThunk, 'Extraction failed')
    const continueHandlers = createExtractionThunkHandlers(continueExtractionThunk, 'Continue extraction failed')

    builder
      .addCase(extractMedicalDataThunk.pending, extractHandlers.pending)
      .addCase(extractMedicalDataThunk.fulfilled, extractHandlers.fulfilled)
      .addCase(extractMedicalDataThunk.rejected, extractHandlers.rejected)
      .addCase(continueExtractionThunk.pending, continueHandlers.pending)
      .addCase(continueExtractionThunk.fulfilled, continueHandlers.fulfilled)
      .addCase(continueExtractionThunk.rejected, continueHandlers.rejected)
  },
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
  wipData => wipData
)

// 📈 Real-time completion tracking
export const selectCompletenessPercentage = createSelector([selectExtractedData], extractedData => {
  if (!extractedData?.extraction_metadata) return 0
  return extractedData.extraction_metadata.overall_completeness_percentage
})

// 🔥 DIRECT ACCESS - No memoization for simple property access
export const selectMissingCriticalFields = (state: RootState) => 
  state.medicalChat.medicalExtraction.currentExtraction?.extraction_metadata?.missing_critical_fields || []

export const selectNOMCompliance = (state: RootState) => 
  state.medicalChat.medicalExtraction.currentExtraction?.extraction_metadata?.nom_compliant || false

export const selectReadyForSOAP = (state: RootState) => 
  state.medicalChat.medicalExtraction.currentExtraction?.extraction_metadata?.ready_for_soap_generation || false

// 🔥 COMPUTED SUMMARY - Only use createSelector for expensive operations
export const selectExtractionSummary = createSelector(
  [selectExtractedData, selectExtractionProcess],
  (extractedData, process) => ({
    hasData: !!extractedData,
    isExtracting: process.isExtracting,
    currentIteration: process.currentIteration,
    maxIterations: process.maxIterations,
    completenessPercentage: extractedData?.extraction_metadata?.overall_completeness_percentage || 0,
    nomCompliant: extractedData?.extraction_metadata?.nom_compliant || false,
    error: process.error,
    lastExtractedAt: process.lastExtractedAt,
  })
)

// 🔥 EXTRACTION HISTORY - Direct access with fallback
export const selectExtractionHistory = (state: RootState) => {
  const sessionId = state.medicalChat.sharedState.currentSession.id
  return state.medicalChat.medicalExtraction.extractionHistory[sessionId] || []
}

// 🔥 FIELD COMPLETENESS - Complex computation, keepSelector justified
const hasArrayData = (arr?: unknown[] | null) => Array.isArray(arr) && arr.length > 0
const isNotUnknown = (value?: string | number) => value !== 'unknown' && value !== undefined && value !== null

export const selectFieldCompleteness = createSelector([selectExtractedData], extractedData => {
  if (!extractedData) return null
  const { demographics: demo, clinical_presentation: clinical, symptom_characteristics: symptoms } = extractedData
  
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

// 🔥 EXTRACTION PROGRESS - Simplified direct computation
export const selectExtractionProgress = (state: RootState) => {
  const process = selectExtractionProcess(state)
  const completeness = selectCompletenessPercentage(state)
  return {
    isActive: process.isExtracting,
    iteration: process.currentIteration,
    maxIterations: process.maxIterations,
    progressPercentage: Math.max((process.currentIteration / process.maxIterations) * 100, completeness),
    shouldContinue: process.currentIteration < process.maxIterations && completeness < 80,
  }
}

// 🔥 FOCUS AREAS - Direct computation without createSelector overhead
export const selectFocusAreas = (state: RootState) => {
  const fieldCompleteness = selectFieldCompleteness(state)
  const missingFields = selectMissingCriticalFields(state)
  
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

// 🏭 EXTRAREDUCER FACTORY - NO MORE 110 LINES OF BOILERPLATE
const createExtractionThunkHandlers = (thunk: any, failureMessage: string) => ({
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
    if (isComplete && completeness.readyForSOAP) {
      state.sharedState.readyForSOAP = true
    }
    
    // 🔥 USE PURE FUNCTION - Consistent across all handlers
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
  }
})
