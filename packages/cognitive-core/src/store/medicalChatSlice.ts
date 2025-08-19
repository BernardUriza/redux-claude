// 🧠 Redux Slice para Chat Médico Iterativo
// Creado por Bernard Orozco

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { DiagnosticCycle } from '../types/medical'

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

export interface IterativeState {
  diagnosticCycles: DiagnosticCycle[]
  currentCycle: number
  totalCycles: number
  finalConfidence: number
  processingTimeMs: number
  pendingInfoRequestId?: string
  awaitingAdditionalInfo: boolean
}

export interface MedicalChatState {
  messages: MedicalMessage[]
  streaming: StreamingState
  currentSession: {
    id: string
    patientId?: string
    startedAt: number
  }
  iterativeState: IterativeState
  isLoading: boolean
  error?: string
}

const initialState: MedicalChatState = {
  messages: [
    {
      id: 'welcome_msg',
      content: `## 🏥 Sistema Médico AI - Motor Iterativo v2.0 Activado

¡Bienvenido, doctor! Soy su asistente médico con **análisis iterativo** y diagnósticos progresivos.

### 🔬 **FUNCIONALIDADES ITERATIVAS:**
- **Diagnóstico Iterativo**: Análisis médico en múltiples ciclos de validación
- **Validación Inteligente**: Sistema SOAP con validación de calidad progresiva
- **Información Adicional**: Solicita datos específicos cuando sea necesario
- **Confianza Progresiva**: Confianza que aumenta con cada ciclo de análisis
- **Medicina Defensiva**: Priorización por gravedad, no solo probabilidad

### 💬 **Para comenzar:**
Describa el caso clínico. El sistema analizará iterativamente hasta alcanzar alta confianza diagnóstica.

**Ejemplo**: *"Paciente masculino 52 años, asintomático, acude para control. Laboratorios: glucosa 118 mg/dL, HbA1c 6.8%, colesterol total 245 mg/dL..."*

### ⚡ **FASE 2 IMPLEMENTADA:**
- ✅ **Motor Iterativo**: Análisis médico en ciclos progresivos
- ✅ **Validación Avanzada**: Evaluación de calidad SOAP automática
- ✅ **Información Adicional**: Solicita datos faltantes automáticamente
- ✅ **Confianza Dinámica**: Métricas de confianza en tiempo real

🚀 **Sistema listo para diagnósticos iterativos con validación progresiva.**`,
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
  iterativeState: {
    diagnosticCycles: [],
    currentCycle: 0,
    totalCycles: 0,
    finalConfidence: 0,
    processingTimeMs: 0,
    awaitingAdditionalInfo: false
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
    },

    // === MANEJO DE ESTADO ITERATIVO ===
    addDiagnosticCycle: (state, action: PayloadAction<DiagnosticCycle>) => {
      state.iterativeState.diagnosticCycles.push(action.payload)
      state.iterativeState.currentCycle = action.payload.cycleNumber
    },

    updateIterativeState: (state, action: PayloadAction<Partial<IterativeState>>) => {
      state.iterativeState = { ...state.iterativeState, ...action.payload }
    },

    resetIterativeState: (state) => {
      state.iterativeState = {
        diagnosticCycles: [],
        currentCycle: 0,
        totalCycles: 0,
        finalConfidence: 0,
        processingTimeMs: 0,
        awaitingAdditionalInfo: false
      }
    },

    setAwaitingAdditionalInfo: (state, action: PayloadAction<{ requestId: string; awaiting: boolean }>) => {
      state.iterativeState.awaitingAdditionalInfo = action.payload.awaiting
      state.iterativeState.pendingInfoRequestId = action.payload.awaiting ? action.payload.requestId : undefined
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
  clearError,
  addDiagnosticCycle,
  updateIterativeState,
  resetIterativeState,
  setAwaitingAdditionalInfo
} = medicalChatSlice.actions

export default medicalChatSlice.reducer