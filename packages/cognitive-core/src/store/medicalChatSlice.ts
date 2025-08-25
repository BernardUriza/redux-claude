// 🧠 Redux Slice para Chat Médico Iterativo
// Creado por Bernard Orozco

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { DiagnosticCycle, SOAPAnalysis } from '../types/medical'

// === FASE 4: Nuevas Interfaces para Redux Médico Completo ===

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical'

// Métricas del Chat Inteligente
export interface IntelligentChatMetrics {
  confidenceLevel: number
  inferenceAccuracy: number
  responseTime: number
  totalInferences: number
  confirmedInferences: number
  urgencyDetected: UrgencyLevel
  specialtyIdentified: string[]
  conversationStage: 'initial' | 'gathering' | 'analyzing' | 'concluding'
}

export interface SubjectiveData {
  chiefComplaint: string
  presentIllness: string
  medicalHistory: string[]
  familyHistory: string[]
  socialHistory: string
  allergies: string[]
  medications: string[]
}

export interface ObjectiveFindings {
  vitalSigns: {
    temperature?: string
    bloodPressure?: string
    heartRate?: string
    respiratoryRate?: string
    oxygenSaturation?: string
  }
  physicalExam: {
    general?: string
    head?: string
    cardiovascular?: string
    respiratory?: string
    abdominal?: string
    neurological?: string
    dermatological?: string
  }
  diagnosticStudies: string[]
}

export interface DifferentialDiagnosis {
  primaryDiagnosis: string
  differentials: Array<{
    diagnosis: string
    probability: number
    gravityScore: number
    reasoning: string
  }>
  reasoning: string
  confidence: number
}

export interface TreatmentPlan {
  immediate: string[]
  medications: Array<{
    name: string
    dose: string
    frequency: string
    duration: string
  }>
  followUp: {
    timeframe: string
    instructions: string[]
  }
  referrals: string[]
  studies: string[]
  patientEducation: string[]
  redFlags: string[]
}

export interface SOAPStructure {
  subjetivo: SubjectiveData
  objetivo: ObjectiveFindings
  analisis: DifferentialDiagnosis
  plan: TreatmentPlan
  timestamp: number
  confidence: number
}

export interface PhysicianNote {
  id: string
  timestamp: number
  content: string
  type: 'clinical' | 'administrative' | 'legal' | 'observation'
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  physicianId: string
  physicianName: string
}

export interface Reminder {
  id: string
  type: 'followup' | 'medication' | 'study' | 'referral'
  description: string
  dueDate: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  completed: boolean
}

export interface AuditLog {
  id: string
  timestamp: number
  action: string
  userId: string
  details: Record<string, any>
  sessionId: string
}

export interface MedicalSession {
  physicianNotes: PhysicianNote[]
  followUpReminders: Reminder[]
  legalTraceability: AuditLog[]
  startTime: number
  lastActivity: number
}

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

// === FASE 4: Estado Redux Médico Completo ===
export interface MedicalChatState {
  messages: MedicalMessage[]
  streaming: StreamingState
  currentSession: {
    id: string
    patientId?: string
    startedAt: number
  }
  iterativeState: IterativeState
  
  // NUEVO: Estructura SOAP Completa
  currentCase: {
    soap: SOAPStructure | null
    cycles: DiagnosticCycle[]
    confidence: number
    urgencyLevel: UrgencyLevel
    lastUpdated: number
  }
  
  // Métricas del Chat Inteligente
  intelligentChatMetrics: IntelligentChatMetrics
  
  // NUEVO: Sesión Médica
  session: MedicalSession
  
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
  
  // NUEVO: Estructura SOAP Completa
  currentCase: {
    soap: null,
    cycles: [],
    confidence: 0,
    urgencyLevel: 'low',
    lastUpdated: 0
  },
  
  // Métricas del Chat Inteligente
  intelligentChatMetrics: {
    confidenceLevel: 0,
    inferenceAccuracy: 0,
    responseTime: 0,
    totalInferences: 0,
    confirmedInferences: 0,
    urgencyDetected: 'low',
    specialtyIdentified: [],
    conversationStage: 'initial'
  },
  
  // NUEVO: Sesión Médica
  session: {
    physicianNotes: [],
    followUpReminders: [],
    legalTraceability: [],
    startTime: Date.now(),
    lastActivity: Date.now()
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
    },

    // === FASE 4: NUEVAS ACCIONES REDUX MÉDICO COMPLETO ===
    
    // Manejo de estructura SOAP completa
    updateSOAPStructure: (state, action: PayloadAction<SOAPStructure>) => {
      state.currentCase.soap = action.payload
      state.currentCase.confidence = action.payload.confidence
      state.currentCase.lastUpdated = Date.now()
      
      // Actualizar actividad de sesión
      state.session.lastActivity = Date.now()
      
      // Agregar log de auditoría
      state.session.legalTraceability.push({
        id: `audit_${Date.now()}`,
        timestamp: Date.now(),
        action: 'UPDATE_SOAP',
        userId: 'system',
        details: { 
          confidence: action.payload.confidence,
          primaryDiagnosis: action.payload.analisis.primaryDiagnosis
        },
        sessionId: state.currentSession.id
      })
    },

    updateSOAPSection: (state, action: PayloadAction<{ 
      section: 'subjetivo' | 'objetivo' | 'analisis' | 'plan'; 
      data: any 
    }>) => {
      if (state.currentCase.soap) {
        state.currentCase.soap[action.payload.section] = action.payload.data
        state.currentCase.lastUpdated = Date.now()
      }
    },

    // Manejo de urgencia
    updateUrgencyLevel: (state, action: PayloadAction<UrgencyLevel>) => {
      state.currentCase.urgencyLevel = action.payload
      state.intelligentChatMetrics.urgencyDetected = action.payload
      
      // Agregar log crítico si es urgencia alta
      if (action.payload === 'critical' || action.payload === 'high') {
        state.session.legalTraceability.push({
          id: `urgent_${Date.now()}`,
          timestamp: Date.now(),
          action: 'URGENCY_ESCALATED',
          userId: 'system',
          details: { urgencyLevel: action.payload },
          sessionId: state.currentSession.id
        })
      }
    },

    // Manejo de notas médicas
    addPhysicianNote: (state, action: PayloadAction<Omit<PhysicianNote, 'id' | 'timestamp'>>) => {
      const note: PhysicianNote = {
        id: `note_${Date.now()}`,
        timestamp: Date.now(),
        ...action.payload
      }
      state.session.physicianNotes.push(note)
      state.session.lastActivity = Date.now()
    },

    updatePhysicianNote: (state, action: PayloadAction<{ id: string; updates: Partial<PhysicianNote> }>) => {
      const noteIndex = state.session.physicianNotes.findIndex(note => note.id === action.payload.id)
      if (noteIndex !== -1) {
        state.session.physicianNotes[noteIndex] = {
          ...state.session.physicianNotes[noteIndex],
          ...action.payload.updates
        }
      }
    },

    // Manejo de recordatorios
    addReminder: (state, action: PayloadAction<Omit<Reminder, 'id'>>) => {
      const reminder: Reminder = {
        id: `reminder_${Date.now()}`,
        ...action.payload
      }
      state.session.followUpReminders.push(reminder)
    },

    updateReminder: (state, action: PayloadAction<{ id: string; updates: Partial<Reminder> }>) => {
      const reminderIndex = state.session.followUpReminders.findIndex(r => r.id === action.payload.id)
      if (reminderIndex !== -1) {
        state.session.followUpReminders[reminderIndex] = {
          ...state.session.followUpReminders[reminderIndex],
          ...action.payload.updates
        }
      }
    },

    completeReminder: (state, action: PayloadAction<string>) => {
      const reminderIndex = state.session.followUpReminders.findIndex(r => r.id === action.payload)
      if (reminderIndex !== -1) {
        state.session.followUpReminders[reminderIndex].completed = true
        
        // Agregar log de auditoría
        state.session.legalTraceability.push({
          id: `reminder_completed_${Date.now()}`,
          timestamp: Date.now(),
          action: 'REMINDER_COMPLETED',
          userId: 'system',
          details: { reminderId: action.payload },
          sessionId: state.currentSession.id
        })
      }
    },

    // Reset de caso médico
    resetCurrentCase: (state) => {
      state.currentCase = {
        soap: null,
        cycles: [],
        confidence: 0,
        urgencyLevel: 'low',
        lastUpdated: 0
      }
    },

    // Reset de sesión médica
    resetMedicalSession: (state) => {
      state.session = {
        physicianNotes: [],
        followUpReminders: [],
        legalTraceability: [],
        startTime: Date.now(),
        lastActivity: Date.now()
      }
    },

    // === MANEJO DE MÉTRICAS DEL CHAT INTELIGENTE ===
    updateIntelligentChatMetrics: (state, action: PayloadAction<Partial<IntelligentChatMetrics>>) => {
      state.intelligentChatMetrics = {
        ...state.intelligentChatMetrics,
        ...action.payload
      }
    },

    addInference: (state, action: PayloadAction<{ confirmed: boolean }>) => {
      state.intelligentChatMetrics.totalInferences += 1
      if (action.payload.confirmed) {
        state.intelligentChatMetrics.confirmedInferences += 1
      }
      // Actualizar precisión
      state.intelligentChatMetrics.inferenceAccuracy = 
        state.intelligentChatMetrics.totalInferences > 0 
          ? state.intelligentChatMetrics.confirmedInferences / state.intelligentChatMetrics.totalInferences 
          : 0
    },


    addSpecialtyIdentified: (state, action: PayloadAction<string>) => {
      if (!state.intelligentChatMetrics.specialtyIdentified.includes(action.payload)) {
        state.intelligentChatMetrics.specialtyIdentified.push(action.payload)
      }
    },

    updateConversationStage: (state, action: PayloadAction<'initial' | 'gathering' | 'analyzing' | 'concluding'>) => {
      state.intelligentChatMetrics.conversationStage = action.payload
    }
  }
})

export const {
  // Acciones existentes
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
  setAwaitingAdditionalInfo,
  
  // FASE 4: Nuevas acciones Redux médico completo
  updateSOAPStructure,
  updateSOAPSection,
  updateUrgencyLevel,
  addPhysicianNote,
  updatePhysicianNote,
  addReminder,
  updateReminder,
  completeReminder,
  resetCurrentCase,
  resetMedicalSession,
  
  // Nuevas acciones del chat inteligente
  updateIntelligentChatMetrics,
  addInference,
  addSpecialtyIdentified,
  updateConversationStage
} = medicalChatSlice.actions

export default medicalChatSlice.reducer