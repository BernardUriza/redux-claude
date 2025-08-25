# 🎭 ESPECIFICACIÓN DE INTERFACES - FASE 1.3

**Creado por Bernard Orozco + Gandalf el Blanco**  
**Fecha:** 2025-01-25  
**Estado:** 🔄 EN PROGRESO - Contratos de datos mock → real

---

## 🎯 FILOSOFÍA DE INTERFACES DE MIGRACIÓN

### 🎭 **Principio de Contratos Claros:**
> _"Entre mock y realidad, la interface es el puente sagrado"_

**Arquitectura de Transición:**
```
Mock Data (Legacy) ←→ Interface Contract ←→ Real Data (Multinucleo)
   { soap: null }          SOAPAnalysis           selectCurrentSOAPAnalysis()
   confidence: 85          SystemMetrics         selectSystemMetrics()
```

---

## 🏗️ INTERFACES PRINCIPALES - DATOS REALES

### 1. **🏥 SOAPAnalysis Interface**

**Propósito:** Reemplazar `mockCurrentCase` con datos médicos reales  
**Usado por:** `SOAPDisplay.tsx`  

```typescript
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

// === BACKWARD COMPATIBILITY ===
// Para mantener compatibilidad durante migración
export interface LegacyMockCase {
  soap: SOAPAnalysis | null
  confidence: number
}

// === TRANSFORMATION HELPERS ===
export const transformToLegacyFormat = (analysis: SOAPAnalysis | null): LegacyMockCase => ({
  soap: analysis,
  confidence: analysis?.confidence ? Math.round(analysis.confidence * 100) : 0
})

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
```

---

### 2. **📊 SystemMetrics Interface**

**Propósito:** Reemplazar métricas hardcodeadas con cálculos reales  
**Usado por:** `RealTimeMetrics.tsx`  

```typescript
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

// === LEGACY COMPATIBILITY ===
export interface LegacyMetrics {
  confidence: number               // Solo el número hardcodeado
}

export const transformToLegacyMetrics = (metrics: SystemMetrics): LegacyMetrics => ({
  confidence: Math.round(metrics.confidence)
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
```

---

### 3. **🔄 DiagnosticProgress Interface**

**Propósito:** Reemplazar `mockIterativeState` con progreso real  
**Usado por:** `IterativeDiagnosticProgress.tsx`  

```typescript
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

// === LEGACY COMPATIBILITY ===
export interface LegacyIterativeState {
  currentCycle: number
}

export const transformToLegacyIterative = (progress: DiagnosticProgress): LegacyIterativeState => ({
  currentCycle: progress.currentCycle
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
```

---

### 4. **📋 PatientReminder Interface**

**Propósito:** Reemplazar `mockReminders: []` con recordatorios reales  
**Usado por:** `FollowUpTracker.tsx`  

```typescript
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

// === LEGACY COMPATIBILITY ===
export type LegacyMockReminders = PatientReminder[]

export const transformToLegacyReminders = (reminders: PatientReminder[]): LegacyMockReminders => 
  reminders

export const createEmptyReminders = (): PatientReminder[] => []
```

---

### 5. **📝 PhysicianNote Interface**

**Propósito:** Reemplazar `mockNotes: []` con notas médicas reales  
**Usado por:** `MedicalNotes.tsx`  

```typescript
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

// === LEGACY COMPATIBILITY ===
export type LegacyMockNotes = PhysicianNote[]

export const transformToLegacyNotes = (notes: PhysicianNote[]): LegacyMockNotes => 
  notes

export const createEmptyNotes = (): PhysicianNote[] => []

export const createEmptyPhysicianNote = (): Omit<PhysicianNote, 'id' | 'createdAt'> => ({
  relatedMessageIds: [],
  title: '',
  content: '',
  summary: '',
  category: 'observation',
  tags: [],
  specialtyRelevant: ['general_medicine'],
  confidence: 0,
  qualityScore: 0,
  isImportant: false,
  lastModified: Date.now(),
  patientSessionId: '',
  clinicalContext: '',
  extractionSource: 'conversation',
  searchableContent: '',
  keyPhrases: [],
  linkedReminders: [],
  linkedAnalysis: []
})
```

---

## 🔄 ESTRATEGIA DE MIGRACIÓN POR COMPONENTE

### **🏥 SOAPDisplay.tsx Migration Contract**

```typescript
// === BEFORE (Mock Data) ===
interface MockCurrentCase {
  soap: null
  confidence: number
}

// === AFTER (Real Data) ===
interface RealSOAPData {
  analysis: SOAPAnalysis | null
  isLoading: boolean
  error: string | null
}

// === MIGRATION BRIDGE ===
export const useMigratedSOAPData = (): RealSOAPData => {
  const analysis = useSelector(selectCurrentSOAPAnalysis)
  const isLoading = useSelector(state => 
    state.medicalChat.cores.dashboard.isLoading
  )
  const error = useSelector(state => 
    state.medicalChat.sharedState.error
  )
  
  return { analysis, isLoading, error: error || null }
}

// === COMPONENT USAGE ===
// BEFORE: const mockCurrentCase = { soap: null, confidence: 0.8 }
// AFTER:  const { analysis, isLoading, error } = useMigratedSOAPData()
```

---

### **📊 RealTimeMetrics.tsx Migration Contract**

```typescript
// === BEFORE (Mock Data) ===
const confidence = 85

// === AFTER (Real Data) ===
interface RealMetricsData {
  metrics: SystemMetrics
  isLoading: boolean
  lastUpdate: number
}

// === MIGRATION BRIDGE ===
export const useMigratedMetrics = (): RealMetricsData => {
  const metrics = useSelector(selectSystemMetrics)
  const isLoading = useSelector(state => 
    Object.values(state.medicalChat.cores).some(core => core.isLoading)
  )
  
  return { 
    metrics, 
    isLoading, 
    lastUpdate: metrics.lastActivity 
  }
}

// === COMPONENT USAGE ===  
// BEFORE: const confidence = 85
// AFTER:  const { metrics } = useMigratedMetrics()
//         const confidence = metrics.confidence
```

---

### **🔄 IterativeDiagnosticProgress.tsx Migration Contract**

```typescript
// === BEFORE (Mock Data) ===
const mockIterativeState = { currentCycle: 1 }

// === AFTER (Real Data) ===
interface RealProgressData {
  progress: DiagnosticProgress
  isCalculating: boolean
  hasProgressed: boolean
}

// === MIGRATION BRIDGE ===
export const useMigratedProgress = (): RealProgressData => {
  const progress = useSelector(selectDiagnosticProgress)
  const isCalculating = useSelector(state => 
    state.medicalChat.cores.dashboard.isLoading
  )
  
  return { 
    progress, 
    isCalculating,
    hasProgressed: progress.currentCycle > 0
  }
}

// === COMPONENT USAGE ===
// BEFORE: const mockIterativeState = { currentCycle: 1 }  
// AFTER:  const { progress } = useMigratedProgress()
//         const currentCycle = progress.currentCycle
```

---

### **📋 FollowUpTracker.tsx Migration Contract**

```typescript
// === BEFORE (Mock Data) ===
const mockReminders: [] = []

// === AFTER (Real Data) ===
interface RealRemindersData {
  reminders: PatientReminder[]
  isExtracting: boolean
  totalReminders: number
}

// === MIGRATION BRIDGE ===
export const useMigratedReminders = (): RealRemindersData => {
  const reminders = useSelector(selectPatientReminders)
  const isExtracting = useSelector(state => 
    state.medicalChat.cores.dashboard.isLoading
  )
  
  return { 
    reminders, 
    isExtracting,
    totalReminders: reminders.length
  }
}

// === COMPONENT USAGE ===
// BEFORE: const mockReminders: [] = []
// AFTER:  const { reminders } = useMigratedReminders()
```

---

### **📝 MedicalNotes.tsx Migration Contract**

```typescript
// === BEFORE (Mock Data) ===
const mockNotes: [] = []

// === AFTER (Real Data) ===
interface RealNotesData {
  notes: PhysicianNote[]
  isProcessing: boolean
  totalNotes: number
  importantNotes: PhysicianNote[]
}

// === MIGRATION BRIDGE ===
export const useMigratedNotes = (): RealNotesData => {
  const notes = useSelector(selectPhysicianNotes)
  const isProcessing = useSelector(state => 
    state.medicalChat.cores.dashboard.isLoading
  )
  
  const importantNotes = useMemo(() => 
    notes.filter(note => note.isImportant),
    [notes]
  )
  
  return { 
    notes, 
    isProcessing,
    totalNotes: notes.length,
    importantNotes
  }
}

// === COMPONENT USAGE ===
// BEFORE: const mockNotes: [] = []
// AFTER:  const { notes, importantNotes } = useMigratedNotes()
```

---

## 🛡️ TYPE SAFETY & ERROR HANDLING

### **Error Boundary Interfaces**

```typescript
export interface MedicalComponentError {
  component: string              // Nombre del componente
  errorType: 'selector' | 'rendering' | 'data' | 'network'
  message: string               // Mensaje de error
  timestamp: number             // Cuándo ocurrió
  context: Record<string, any>  // Contexto adicional
}

export interface ErrorState {
  hasError: boolean
  errors: MedicalComponentError[]
  lastError: MedicalComponentError | null
}
```

### **Loading State Interface**

```typescript
export interface LoadingState {
  isLoading: boolean            // Estado general
  loadingStates: Record<string, boolean> // Estados específicos
  progress?: number             // Progreso opcional (0-100)
  message?: string             // Mensaje de carga
}
```

---

## 📋 VALIDATION & TESTING INTERFACES

### **Test Data Interfaces**

```typescript
export interface TestMedicalMessage {
  id: string
  content: string
  type: 'user' | 'assistant'
  timestamp: number
  confidence?: number
  metadata?: {
    sectionType?: 'diagnosis' | 'treatment' | 'education' | 'followup'
  }
}

export interface TestScenario {
  name: string                  // Nombre del escenario
  mockMessages: TestMedicalMessage[] // Mensajes de prueba
  expectedSOAP: Partial<SOAPAnalysis> // SOAP esperado
  expectedMetrics: Partial<SystemMetrics> // Métricas esperadas
  expectedReminders: number     // Número de recordatorios esperados
  expectedNotes: number         // Número de notas esperadas
}
```

---

## ✅ **VALIDACIÓN FASE 1.3**

### **Criterios de Éxito:**
- ✅ Interfaces para todos los datos reales definidas
- ✅ Contratos de migración especificados por componente
- ✅ Backward compatibility garantizada
- ✅ Type safety completa con TypeScript
- ✅ Error handling interfaces definidas
- ✅ Testing interfaces preparadas

### **Transformaciones Mock → Real:**
1. `mockCurrentCase` → `SOAPAnalysis` ✅
2. `confidence: 85` → `SystemMetrics` ✅  
3. `mockIterativeState` → `DiagnosticProgress` ✅
4. `mockReminders: []` → `PatientReminder[]` ✅
5. `mockNotes: []` → `PhysicianNote[]` ✅

---

## 🚀 **ESTADO FASE 1 COMPLETA**

### ✅ **FASE 1.1:** Estado Multinúcleo Auditado
### ✅ **FASE 1.2:** Selectores Diseñados  
### ✅ **FASE 1.3:** Interfaces Especificadas

**RESULTADO:** FASE 1 - ANÁLISIS Y ARQUITECTURA **COMPLETADA** ✨

**Próximo paso:** FASE 2 - INFRAESTRUCTURA DE DATOS 🎯

---

*Especificado por Gandalf el Blanco - "Con interfaces claras, el caos se convierte en orden"*