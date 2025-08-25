// 🤖 Redux Slice para Chat Inteligente Separado - Multinúcleo
// Creado por Bernard Orozco - Estado independiente del chat principal

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface IntelligentMessage {
  id: string
  content: string
  type: 'user' | 'assistant'
  timestamp: number
  confidence?: number
  metadata?: {
    sessionId?: string
    isStreaming?: boolean
    inferenceType?: 'diagnosis' | 'treatment' | 'education' | 'followup'
  }
}

export interface PatientInference {
  id: string
  type: 'age' | 'gender' | 'diagnosis' | 'urgency' | 'specialty'
  label: string
  value: string | number
  confidence: number
  isEditable: boolean
  options?: string[]
  min?: number
  max?: number
  timestamp: number
}

export interface IntelligentChatState {
  // Núcleo de mensajes separado
  messages: IntelligentMessage[]
  isLoading: boolean
  
  // Inferencias dinámicas
  currentInferences: PatientInference[]
  
  // Estado de sesión del chat inteligente
  sessionId: string
  startedAt: number
  lastActivity: number
  
  // Configuración
  settings: {
    autoInference: boolean
    realTimeUpdates: boolean
    confidenceThreshold: number
  }
  
  error?: string
}

const initialInferences: PatientInference[] = [
  {
    id: 'age',
    type: 'age',
    label: 'Edad del Paciente',
    value: 0,
    confidence: 0,
    isEditable: true,
    min: 0,
    max: 120,
    timestamp: Date.now()
  },
  {
    id: 'gender',
    type: 'gender',
    label: 'Género',
    value: 'No especificado',
    confidence: 0,
    isEditable: true,
    options: ['Masculino', 'Femenino', 'No especificado'],
    timestamp: Date.now()
  },
  {
    id: 'diagnosis',
    type: 'diagnosis',
    label: 'Diagnóstico Probable',
    value: 'Evaluando...',
    confidence: 0,
    isEditable: false,
    timestamp: Date.now()
  },
  {
    id: 'urgency',
    type: 'urgency',
    label: 'Nivel de Urgencia',
    value: 'Bajo',
    confidence: 0,
    isEditable: false,
    options: ['Crítico', 'Alto', 'Medio', 'Bajo'],
    timestamp: Date.now()
  }
]

const initialState: IntelligentChatState = {
  messages: [],
  isLoading: false,
  currentInferences: initialInferences,
  sessionId: `intelligent_${Date.now()}`,
  startedAt: Date.now(),
  lastActivity: Date.now(),
  settings: {
    autoInference: true,
    realTimeUpdates: true,
    confidenceThreshold: 0.3
  }
}

const intelligentChatSlice = createSlice({
  name: 'intelligentChat',
  initialState,
  reducers: {
    // === MANEJO DE MENSAJES INDEPENDIENTE ===
    addIntelligentMessage: (state, action: PayloadAction<Omit<IntelligentMessage, 'id' | 'timestamp'> & { id?: string }>) => {
      const { id, ...messageData } = action.payload
      const message: IntelligentMessage = {
        id: id || `intelligent_msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        ...messageData
      }
      state.messages.push(message)
      state.lastActivity = Date.now()
    },

    updateIntelligentMessage: (state, action: PayloadAction<{ id: string; updates: Partial<IntelligentMessage> }>) => {
      const { id, updates } = action.payload
      const messageIndex = state.messages.findIndex(msg => msg.id === id)
      if (messageIndex !== -1) {
        state.messages[messageIndex] = { ...state.messages[messageIndex], ...updates }
      }
    },

    clearIntelligentMessages: (state) => {
      state.messages = []
      state.sessionId = `intelligent_${Date.now()}`
      state.startedAt = Date.now()
      state.lastActivity = Date.now()
      // Reset inferencias
      state.currentInferences = initialInferences
    },

    setIntelligentLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },

    // === MANEJO DE INFERENCIAS DINÁMICAS ===
    updatePatientInference: (state, action: PayloadAction<{ id: string; value: string | number; confidence?: number }>) => {
      const { id, value, confidence = 1.0 } = action.payload
      const inferenceIndex = state.currentInferences.findIndex(inf => inf.id === id)
      if (inferenceIndex !== -1) {
        state.currentInferences[inferenceIndex] = {
          ...state.currentInferences[inferenceIndex],
          value,
          confidence,
          timestamp: Date.now()
        }
      }
      state.lastActivity = Date.now()
    },

    updateInferenceFromMessage: (state, action: PayloadAction<string>) => {
      const message = action.payload.toLowerCase()
      
      // Inferencia de edad
      const ageMatch = message.match(/(\d+)\s*(años?|year|old|age)/i)
      if (ageMatch) {
        const ageIndex = state.currentInferences.findIndex(i => i.id === 'age')
        if (ageIndex !== -1) {
          state.currentInferences[ageIndex] = {
            ...state.currentInferences[ageIndex],
            value: parseInt(ageMatch[1]),
            confidence: 0.9,
            timestamp: Date.now()
          }
        }
      }

      // Inferencia de género
      if (message.includes('masculino') || message.includes('hombre') || message.includes('male')) {
        const genderIndex = state.currentInferences.findIndex(i => i.id === 'gender')
        if (genderIndex !== -1) {
          state.currentInferences[genderIndex] = {
            ...state.currentInferences[genderIndex],
            value: 'Masculino',
            confidence: 0.85,
            timestamp: Date.now()
          }
        }
      } else if (message.includes('femenino') || message.includes('mujer') || message.includes('female')) {
        const genderIndex = state.currentInferences.findIndex(i => i.id === 'gender')
        if (genderIndex !== -1) {
          state.currentInferences[genderIndex] = {
            ...state.currentInferences[genderIndex],
            value: 'Femenino',
            confidence: 0.85,
            timestamp: Date.now()
          }
        }
      }

      // Inferencia de diagnóstico
      let diagnosisValue = 'Evaluando...'
      let diagnosisConfidence = 0.3
      
      if (message.includes('dolor') && message.includes('pecho')) {
        diagnosisValue = 'Posible síndrome coronario'
        diagnosisConfidence = 0.7
      } else if (message.includes('cefalea') || (message.includes('dolor') && message.includes('cabeza'))) {
        diagnosisValue = 'Cefalea primaria/secundaria'
        diagnosisConfidence = 0.65
      } else if (message.includes('fiebre')) {
        diagnosisValue = 'Proceso infeccioso'
        diagnosisConfidence = 0.6
      } else if (message.includes('diabetes') || message.includes('glucosa')) {
        diagnosisValue = 'Trastorno metabólico'
        diagnosisConfidence = 0.8
      }

      const diagnosisIndex = state.currentInferences.findIndex(i => i.id === 'diagnosis')
      if (diagnosisIndex !== -1) {
        state.currentInferences[diagnosisIndex] = {
          ...state.currentInferences[diagnosisIndex],
          value: diagnosisValue,
          confidence: diagnosisConfidence,
          timestamp: Date.now()
        }
      }

      // Inferencia de urgencia
      let urgencyValue = 'Bajo'
      let urgencyConfidence = 0.5

      if ((message.includes('dolor') && message.includes('pecho')) || 
          (message.includes('dificultad') && message.includes('respirar'))) {
        urgencyValue = 'Alto'
        urgencyConfidence = 0.8
      } else if (message.includes('cefalea') && message.includes('intens')) {
        urgencyValue = 'Medio'
        urgencyConfidence = 0.7
      } else if (message.includes('fiebre') && message.includes('alto')) {
        urgencyValue = 'Medio'
        urgencyConfidence = 0.6
      }

      const urgencyIndex = state.currentInferences.findIndex(i => i.id === 'urgency')
      if (urgencyIndex !== -1) {
        state.currentInferences[urgencyIndex] = {
          ...state.currentInferences[urgencyIndex],
          value: urgencyValue,
          confidence: urgencyConfidence,
          timestamp: Date.now()
        }
      }

      state.lastActivity = Date.now()
    },

    resetInferences: (state) => {
      state.currentInferences = initialInferences
    },

    // === CONFIGURACIÓN ===
    updateIntelligentSettings: (state, action: PayloadAction<Partial<typeof initialState.settings>>) => {
      state.settings = { ...state.settings, ...action.payload }
    },

    setIntelligentError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.isLoading = false
    },

    clearIntelligentError: (state) => {
      state.error = undefined
    }
  }
})

export const {
  addIntelligentMessage,
  updateIntelligentMessage,
  clearIntelligentMessages,
  setIntelligentLoading,
  updatePatientInference,
  updateInferenceFromMessage,
  resetInferences,
  updateIntelligentSettings,
  setIntelligentError,
  clearIntelligentError
} = intelligentChatSlice.actions

export default intelligentChatSlice.reducer