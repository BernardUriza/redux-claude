// 🔬 Medical Chat Types - Clean Architecture Type System
// Creado por Bernard Orozco + Gandalf el Blanco

// 💬 Core Message System
export interface MedicalMessage {
  id: string
  content: string
  type: 'user' | 'assistant'
  timestamp: number
  metadata?: {
    confidence?: number
    tokens?: number
    processingTime?: number
    extractionAttempted?: boolean
    sessionId?: string
    isStreaming?: boolean
    sectionType?: 'diagnosis' | 'treatment' | 'education' | 'followup'
  }
}

// 🧠 Chat Core Structure
export interface ChatCore {
  messages: MedicalMessage[]
  isLoading: boolean
  lastActivity: number
  sessionId: string
}

// 👤 Patient Data Domain
export interface PatientData {
  // Datos básicos requeridos
  age?: number | string
  gender?: 'masculino' | 'femenino' | string
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
  isEnhanced?: boolean // Datos básicos + al menos 2 detalles contextuales
  confirmedAt?: number
  completenessPercentage?: number
}

// 🧠 Core System State
export interface CoreState {
  id: string
  name: string
  isLoading: boolean
  isActive: boolean
  lastActivity: number
  error: string | null
  processingQueue: string[]
  completedTasks: number
  metrics: {
    responseTime: number
    successRate: number
    errorCount: number
  }
}

// 🌐 Shared Application State  
export interface SharedState {
  currentSession: {
    id: string
    startTime: number
    messageCount: number
    patientId?: string
  }
  patientData: PatientData
  appMode: 'chat' | 'extraction' | 'analysis'
  isInitialized: boolean
  error: string | null
  lastActivity: number
  systemHealth: 'optimal' | 'good' | 'warning' | 'critical'
}

// 🧠 Complete Medical Chat State
export interface MedicalChatState {
  // Núcleos de conversación duales
  cores: {
    dashboard: ChatCore
    assistant: ChatCore
  }
  
  // Estado compartido médico
  sharedState: SharedState
  
  // Estado de extracción médica  
  medicalExtraction: any // Import from medicalExtraction types
}

// 📊 System Metrics
export interface SystemMetrics {
  confidence: number
  cycles: number
  processingTime: number
  agentsActive: number
  healthScore: string
  messagesCount: number
  qualityScore: number
}

// 🔄 WIP Data Structure
export interface WipData {
  demographics: Record<string, any>
  clinical_presentation: Record<string, any>
  symptom_characteristics: Record<string, any>
}

// 🎯 Action Payload Types
export interface AddMessagePayload {
  content: string
  type: 'user' | 'assistant'
  metadata?: MedicalMessage['metadata']
}

export interface UpdatePatientDataPayload extends Partial<PatientData> {}

export interface UpdateCoreStatePayload {
  coreId: string
  updates: Partial<Omit<CoreState, 'id'>>
}

export interface SetAppModePayload {
  mode: SharedState['appMode']
  preserveData?: boolean
}

// 🏥 Medical Domain Events
export interface MedicalEvent {
  id: string
  type: 'extraction' | 'analysis' | 'validation' | 'completion'
  timestamp: number
  payload: any
  source: string
  confidence?: number
}

// 🔍 Selection Types
export interface ExtractionProgress {
  isActive: boolean
  iteration: number
  maxIterations: number
  progressPercentage: number
  shouldContinue: boolean
}

export interface FieldCompleteness {
  demographics: {
    age: boolean
    gender: boolean
    confidence: number
  }
  clinical: {
    complaint: boolean
    symptoms: boolean
    location: boolean
    confidence: number
  }
  context: {
    duration: boolean
    intensity: boolean
    characteristics: boolean
    aggravating: boolean
    relieving: boolean
    associated: boolean
    temporal: boolean
    confidence: number
  }
}

// 🎛️ UI State Types
export interface UIPreferences {
  theme: 'dark' | 'light'
  compactMode: boolean
  autoScroll: boolean
  showMetrics: boolean
  showDebugInfo: boolean
}

// 🚨 Error Types
export interface MedicalError {
  id: string
  type: 'validation' | 'extraction' | 'network' | 'system'
  message: string
  timestamp: number
  context?: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
  resolved: boolean
}