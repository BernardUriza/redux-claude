// 🧠 REDUX MULTINÚCLEO EVOLUCIONADO 2025 - Creado por Bernard Orozco + Gandalf el Blanco

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

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
  // 🧠 NÚCLEOS DE CONVERSACIÓN SEPARADOS
  cores: {
    dashboard: ChatCore // Chat principal del dashboard
    assistant: ChatCore // Chat del asistente médico
    inference: ChatCore // Chat de inferencias (futuro)
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
    // 📝 DATOS DEL PACIENTE CONFIRMADOS POR EL DOCTOR
    patientData: PatientData
    // 🎯 ESTADO DE TRANSICIÓN A SOAP
    readyForSOAP: boolean
  }
}

// 🧠 ESTADO INICIAL MULTINÚCLEO EVOLUCIONADO
const createInitialChatCore = (type: 'dashboard' | 'assistant' | 'inference'): ChatCore => ({
  messages:
    type === 'dashboard'
      ? [
          {
            id: 'welcome_multinucleus',
            content: `## 🧠 Sistema Médico Multinúcleo v3.0

**ARQUITECTURA EVOLUCIONADA 2025**
- Dashboard Core: Chat principal
- Assistant Core: Autocompletado  
- Inference Core: Análisis contextual

🚀 Multinúcleo activado - Conversaciones separadas`,
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
    assistant: createInitialChatCore('assistant'),
    inference: createInitialChatCore('inference'),
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

    addInferenceMessage: (
      state,
      action: PayloadAction<Omit<MedicalMessage, 'id' | 'timestamp'>>
    ) => {
      const message: MedicalMessage = {
        id: `inference_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        ...action.payload,
      }
      state.cores.inference.messages.push(message)
      state.cores.inference.lastActivity = Date.now()
    },

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
      state.cores.inference.messages = []
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
  },
})

export const {
  addDashboardMessage,
  addAssistantMessage,
  addInferenceMessage,
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
} = medicalChatSlice.actions

export default medicalChatSlice.reducer
