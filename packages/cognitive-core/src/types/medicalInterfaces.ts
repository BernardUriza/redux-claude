// 🎭 INTERFACES MÉDICAS MULTINÚCLEO - Creado por Bernard Orozco + Gandalf el Blanco
// Contratos sagrados para la migración MOCK → REAL

// === SOAP ANALYSIS INTERFACE ===
export interface SOAPAnalysis {
  // === SECCIONES SOAP MÉDICAS ===
  subjective: string | null          // Síntomas reportados por paciente
  objective: string | null           // Observaciones médicas objetivas  
  assessment: string | null          // Evaluación diagnóstica
  plan: string | null               // Plan de tratamiento/seguimiento
  
  // === METADATOS DEL ANÁLISIS ===
  confidence: number                 // Confianza diagnóstica real (0-1)
  lastUpdated: number               // Timestamp última actualización
  sessionId: string                 // ID de sesión del paciente
  
  // === ESTADO DEL ANÁLISIS ===
  isComplete: boolean               // ¿Análisis SOAP completo?
  completionPercentage: number      // % de completitud (0-100)
  
  // === INFORMACIÓN CONTEXTUAL ===
  totalMessages: number             // Mensajes procesados para análisis
  qualityScore: number              // Score de calidad de datos (0-1)
  extractionMethod: 'automatic' | 'manual' | 'hybrid' // Método extracción
}

// === SYSTEM METRICS INTERFACE ===
export interface SystemMetrics {
  // === MÉTRICAS MÉDICAS PRINCIPALES ===
  confidence: number                // Confianza promedio del sistema (0-100)
  cycles: number                   // Ciclos diagnósticos completados
  agentsActive: number             // Cores multinúcleo activos
  processingTime: number           // Tiempo respuesta promedio (ms)
  
  // === MÉTRICAS DE ACTIVIDAD ===
  messagesCount: number            // Total mensajes procesados
  sessionsToday: number            // Sesiones únicas hoy
  lastActivity: number             // Timestamp última actividad
  
  // === SALUD DEL SISTEMA ===
  systemHealth: 'optimal' | 'good' | 'warning' | 'critical'
  healthScore: number              // Score numérico salud (0-100)
  
  // === MÉTRICAS POR NÚCLEO ===
  coreMetrics: {
    dashboard: CoreMetrics
    assistant: CoreMetrics  
    inference: CoreMetrics
  }
  
  // === MÉTRICAS TEMPORALES ===
  uptime: number                   // Tiempo funcionando (ms)
  avgSessionDuration: number       // Duración promedio sesión (ms)
  peakLoadTime: number             // Hora pico de carga
}

export interface CoreMetrics {
  messagesCount: number            // Mensajes en este core
  avgResponseTime: number          // Tiempo respuesta promedio
  isActive: boolean               // ¿Core activo actualmente?
  lastActivity: number            // Timestamp última actividad
  loadLevel: 'low' | 'medium' | 'high' | 'critical' // Nivel de carga
}

// === DIAGNOSTIC PROGRESS INTERFACE ===
export interface DiagnosticProgress {
  // === PROGRESO DIAGNÓSTICO ===
  currentCycle: number             // Ciclo diagnóstico actual (calculado)
  totalCycles: number              // Total ciclos en sesión
  
  // === FASES MÉDICAS ===
  currentPhase: DiagnosticPhase    // Fase actual del diagnóstico
  phasesCompleted: DiagnosticPhase[] // Fases ya completadas
  nextPhase: DiagnosticPhase | null  // Siguiente fase esperada
  
  // === PROGRESO CUANTIFICADO ===
  completionPercentage: number     // % progreso (0-100)
  estimatedTimeRemaining: number   // Tiempo estimado restante (ms)
  
  // === ESTADO DEL PROGRESO ===
  isStalled: boolean              // ¿Progreso estancado?
  lastPhaseChange: number         // Timestamp último cambio fase
  
  // === MÉTRICAS DE CALIDAD ===
  progressQuality: 'excellent' | 'good' | 'fair' | 'poor'
  confidenceTrend: 'increasing' | 'stable' | 'decreasing'
  
  // === INFORMACIÓN CONTEXTUAL ===
  totalMessagesProcessed: number   // Mensajes procesados
  phaseDurations: Record<DiagnosticPhase, number> // Tiempo por fase
}

export type DiagnosticPhase = 
  | 'intake'           // Recolección inicial síntomas
  | 'analysis'         // Análisis de información  
  | 'diagnosis'        // Formulación diagnóstica
  | 'treatment'        // Plan de tratamiento
  | 'followup'         // Seguimiento

// === PATIENT REMINDER INTERFACE ===
export interface PatientReminder {
  // === IDENTIFICACIÓN ===
  id: string                      // ID único del recordatorio
  relatedMessageId: string        // Mensaje que generó el recordatorio
  
  // === CONTENIDO DEL RECORDATORIO ===
  title: string                   // Título del recordatorio
  content: string                 // Descripción completa
  type: ReminderType              // Tipo de recordatorio
  
  // === PRIORIDAD Y TIMING ===
  priority: ReminderPriority      // Prioridad del recordatorio
  dueDate: number | null          // Fecha límite (timestamp)
  reminderDate: number | null     // Cuándo recordar (timestamp)
  
  // === ESTADO ===
  isCompleted: boolean            // ¿Recordatorio completado?
  isOverdue: boolean              // ¿Recordatorio vencido?
  completedAt: number | null      // Cuándo se completó
  
  // === METADATOS ===
  createdAt: number               // Cuándo se creó
  patientSessionId: string        // Sesión del paciente
  estimatedDuration: number       // Duración estimada (minutos)
  
  // === CONTEXTO MÉDICO ===
  medicalContext: string          // Contexto médico del recordatorio
  extractedFromPhase: DiagnosticPhase // De qué fase se extrajo
}

export type ReminderType = 
  | 'medication'      // Medicamentos
  | 'appointment'     // Citas médicas
  | 'test'           // Estudios/análisis
  | 'lifestyle'      // Cambios de estilo de vida
  | 'followup'       // Seguimiento general
  | 'monitoring'     // Monitoreo de síntomas

export type ReminderPriority = 
  | 'low'            // Baja prioridad
  | 'medium'         // Prioridad media  
  | 'high'           // Alta prioridad
  | 'urgent'         // Urgente

// === PHYSICIAN NOTE INTERFACE ===
export interface PhysicianNote {
  // === IDENTIFICACIÓN ===
  id: string                      // ID único de la nota
  relatedMessageIds: string[]     // Mensajes que generaron la nota
  
  // === CONTENIDO DE LA NOTA ===
  title: string                   // Título generado automáticamente
  content: string                 // Contenido completo de la nota
  summary: string                 // Resumen ejecutivo
  
  // === CATEGORIZACIÓN ===
  category: NoteCategory          // Categoría médica
  tags: string[]                  // Tags extraídos del contenido
  specialtyRelevant: MedicalSpecialty[] // Especialidades relevantes
  
  // === CALIDAD Y CONFIANZA ===
  confidence: number              // Confianza del análisis (0-1)
  qualityScore: number           // Score de calidad de la nota (0-1)
  isImportant: boolean           // ¿Nota marcada como importante?
  
  // === METADATOS TEMPORALES ===
  createdAt: number              // Cuándo se creó
  lastModified: number           // Última modificación
  patientSessionId: string       // Sesión del paciente
  
  // === CONTEXTO CLÍNICO ===
  clinicalContext: string         // Contexto clínico
  extractionSource: 'conversation' | 'analysis' | 'inference' // Fuente
  
  // === NAVEGACIÓN Y BÚSQUEDA ===
  searchableContent: string       // Contenido optimizado para búsqueda
  keyPhrases: string[]           // Frases clave extraídas
  
  // === ACCIONES RELACIONADAS ===
  linkedReminders: string[]       // IDs de recordatorios relacionados
  linkedAnalysis: string[]        // IDs de análisis SOAP relacionados
}

export type NoteCategory = 
  | 'diagnosis'       // Notas diagnósticas
  | 'treatment'       // Tratamiento y medicación
  | 'observation'     // Observaciones clínicas
  | 'plan'           // Planes de cuidado
  | 'education'      // Educación al paciente
  | 'followup'       // Seguimiento
  | 'differential'   // Diagnóstico diferencial

export type MedicalSpecialty = 
  | 'general_medicine'
  | 'cardiology'
  | 'dermatology'
  | 'neurology'
  | 'gastroenterology'
  | 'endocrinology'
  | 'psychiatry'
  | 'orthopedics'
  | 'emergency'

// === UTILITY CREATION FUNCTIONS ===
export const createEmptySOAPAnalysis = (): SOAPAnalysis => ({
  subjective: null,
  objective: null, 
  assessment: null,
  plan: null,
  confidence: 0,
  lastUpdated: Date.now(),
  sessionId: '',
  isComplete: false,
  completionPercentage: 0,
  totalMessages: 0,
  qualityScore: 0,
  extractionMethod: 'automatic'
})

export const createEmptySystemMetrics = (): SystemMetrics => ({
  confidence: 0,
  cycles: 0,
  agentsActive: 0,
  processingTime: 0,
  messagesCount: 0,
  sessionsToday: 0,
  lastActivity: Date.now(),
  systemHealth: 'warning',
  healthScore: 0,
  coreMetrics: {
    dashboard: createEmptyCoreMetrics(),
    assistant: createEmptyCoreMetrics(),
    inference: createEmptyCoreMetrics()
  },
  uptime: 0,
  avgSessionDuration: 0,
  peakLoadTime: Date.now()
})

export const createEmptyCoreMetrics = (): CoreMetrics => ({
  messagesCount: 0,
  avgResponseTime: 0,
  isActive: false,
  lastActivity: Date.now(),
  loadLevel: 'low'
})

export const createEmptyDiagnosticProgress = (): DiagnosticProgress => ({
  currentCycle: 0,
  totalCycles: 0,
  currentPhase: 'intake',
  phasesCompleted: [],
  nextPhase: 'analysis',
  completionPercentage: 0,
  estimatedTimeRemaining: 0,
  isStalled: false,
  lastPhaseChange: Date.now(),
  progressQuality: 'fair',
  confidenceTrend: 'stable',
  totalMessagesProcessed: 0,
  phaseDurations: {
    intake: 0,
    analysis: 0,
    diagnosis: 0,
    treatment: 0,
    followup: 0
  }
})

export const createEmptyReminders = (): PatientReminder[] => []

export const createEmptyNotes = (): PhysicianNote[] => []

// === LEGACY COMPATIBILITY INTERFACES ===
export interface LegacyMockCase {
  soap: SOAPAnalysis | null
  confidence: number
}

export interface LegacyMetrics {
  confidence: number
}

export interface LegacyIterativeState {
  currentCycle: number
}

// === TRANSFORMATION HELPERS ===
export const transformToLegacyFormat = (analysis: SOAPAnalysis | null): LegacyMockCase => ({
  soap: analysis,
  confidence: analysis?.confidence ? Math.round(analysis.confidence * 100) : 0
})

export const transformToLegacyMetrics = (metrics: SystemMetrics): LegacyMetrics => ({
  confidence: Math.round(metrics.confidence)
})

export const transformToLegacyIterative = (progress: DiagnosticProgress): LegacyIterativeState => ({
  currentCycle: progress.currentCycle
})