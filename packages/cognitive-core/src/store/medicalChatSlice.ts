// 🧠 Redux Slice para Chat Médico
// Creado por Bernard Orozco

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface MedicalMessage {
  id: string
  content: string
  type: 'user' | 'assistant'
  timestamp: number
  confidence?: number
  metadata?: {
    patientId?: string
    sessionId?: string
    isStreaming?: boolean
    sectionType?: 'diagnosis' | 'treatment' | 'education' | 'followup'
  }
}

export interface StreamingState {
  isActive: boolean
  currentMessageId?: string
  progress: number
  error?: string
}

export interface MedicalChatState {
  messages: MedicalMessage[]
  streaming: StreamingState
  currentSession: {
    id: string
    patientId?: string
    startedAt: number
  }
  isLoading: boolean
  error?: string
}

const initialState: MedicalChatState = {
  messages: [
    {
      id: 'welcome_msg',
      content: `## 🏥 Sistema Cognitivo Médico AI - Streaming Real Activado

¡Bienvenido, doctor! Soy su asistente de IA médica avanzada con **streaming en tiempo real** y capacidades cognitivas multi-agente.

### 🎯 **Funcionalidades Activadas:**
- **Análisis Diagnóstico**: Evaluaciones diferenciales con streaming progresivo
- **Clasificación de Urgencia**: Triage ESI automatizado  
- **Validación Clínica**: Revisión de seguridad y calidad en tiempo real
- **Planes de Tratamiento**: Recomendaciones terapéuticas generándose dinámicamente
- **Documentación SOAP**: Notas médicas estructuradas con streaming

### 💬 **Para comenzar:**
Describa el caso clínico completo: síntomas, antecedentes, examen físico, y cualquier información relevante del paciente.

**Ejemplo**: *"Paciente femenina de 32 años presenta cefalea pulsátil de 2 días de duración, asociada a náuseas y fotofobia. Sin fiebre. Antecedente de migrañas ocasionales..."*

### ⚡ **NUEVAS CARACTERÍSTICAS:**
- ✅ **Streaming Real**: Ve las respuestas generándose palabra por palabra
- ✅ **Claude SDK**: Conexión directa sin simulación 
- ✅ **SOLID Architecture**: Código refactorizado para máximo rendimiento
- ✅ **Monorepo**: Arquitectura modular y escalable

🚀 **Sistema listo para análisis médico con streaming progresivo activado.**`,
      type: 'assistant',
      timestamp: Date.now(),
      confidence: 0.95,
      metadata: {
        sectionType: 'education',
        isStreaming: false
      }
    }
  ],
  streaming: {
    isActive: false,
    progress: 0
  },
  currentSession: {
    id: `session_${Date.now()}`,
    startedAt: Date.now()
  },
  isLoading: false
}

const medicalChatSlice = createSlice({
  name: 'medicalChat',
  initialState,
  reducers: {
    // === MANEJO DE MENSAJES ===
    addMessage: (state, action: PayloadAction<Omit<MedicalMessage, 'id' | 'timestamp'> & { id?: string }>) => {
      const { id, ...messageData } = action.payload
      const message: MedicalMessage = {
        id: id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        ...messageData
      }
      state.messages.push(message)
    },

    updateMessage: (state, action: PayloadAction<{ id: string; updates: Partial<MedicalMessage> }>) => {
      const { id, updates } = action.payload
      const messageIndex = state.messages.findIndex(msg => msg.id === id)
      if (messageIndex !== -1) {
        state.messages[messageIndex] = { ...state.messages[messageIndex], ...updates }
      }
    },

    clearMessages: (state) => {
      state.messages = []
      state.currentSession = {
        id: `session_${Date.now()}`,
        startedAt: Date.now()
      }
    },

    // === MANEJO DE STREAMING ===
    startStreaming: (state, action: PayloadAction<{ messageId: string }>) => {
      state.streaming = {
        isActive: true,
        currentMessageId: action.payload.messageId,
        progress: 0
      }
      state.isLoading = true
    },

    updateStreamingProgress: (state, action: PayloadAction<{ progress: number; content?: string }>) => {
      if (state.streaming.isActive && state.streaming.currentMessageId) {
        state.streaming.progress = action.payload.progress
        
        // Actualizar contenido del mensaje si se proporciona
        if (action.payload.content) {
          const messageIndex = state.messages.findIndex(msg => msg.id === state.streaming.currentMessageId)
          if (messageIndex !== -1) {
            state.messages[messageIndex].content = action.payload.content
            state.messages[messageIndex].metadata = {
              ...state.messages[messageIndex].metadata,
              isStreaming: true
            }
          }
        }
      }
    },

    completeStreaming: (state, action: PayloadAction<{ finalContent: string; confidence?: number }>) => {
      if (state.streaming.isActive && state.streaming.currentMessageId) {
        const messageIndex = state.messages.findIndex(msg => msg.id === state.streaming.currentMessageId)
        if (messageIndex !== -1) {
          state.messages[messageIndex].content = action.payload.finalContent
          state.messages[messageIndex].confidence = action.payload.confidence
          state.messages[messageIndex].metadata = {
            ...state.messages[messageIndex].metadata,
            isStreaming: false
          }
        }
      }

      state.streaming = {
        isActive: false,
        progress: 100
      }
      state.isLoading = false
    },

    stopStreaming: (state, action: PayloadAction<{ error?: string }>) => {
      if (action.payload.error) {
        state.streaming.error = action.payload.error
        state.error = action.payload.error
      }
      
      state.streaming.isActive = false
      state.isLoading = false
    },

    // === MANEJO DE SESIÓN ===
    startNewSession: (state, action: PayloadAction<{ patientId?: string }>) => {
      state.currentSession = {
        id: `session_${Date.now()}`,
        patientId: action.payload.patientId,
        startedAt: Date.now()
      }
      state.messages = []
      state.streaming = {
        isActive: false,
        progress: 0
      }
      state.error = undefined
    },

    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.isLoading = false
      state.streaming.isActive = false
    },

    clearError: (state) => {
      state.error = undefined
      state.streaming.error = undefined
    }
  }
})

export const {
  addMessage,
  updateMessage,
  clearMessages,
  startStreaming,
  updateStreamingProgress,
  completeStreaming,
  stopStreaming,
  startNewSession,
  setError,
  clearError
} = medicalChatSlice.actions

export default medicalChatSlice.reducer