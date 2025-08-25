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
} = medicalChatSlice.actions

export default medicalChatSlice.reducer
