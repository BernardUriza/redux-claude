# 🎯 DISEÑO DE SELECTORES MULTINÚCLEO - FASE 1.2

**Creado por Bernard Orozco + Gandalf el Blanco**  
**Fecha:** 2025-01-25  
**Estado:** 🔄 EN PROGRESO - Arquitectura de selectores médicos

---

## 🧠 FILOSOFÍA DE SELECTORES MULTINÚCLEO

### 🎭 **Principio de Transformación:**
> _"De mensajes dispersos en cores, extraemos sabiduría médica unificada"_

**Arquitectura:**
```
Estado Multinúcleo (Raw) → Selectores (Transforms) → Componentes (Wisdom)
     MedicalMessage[]          createSelector()         SOAPAnalysis
```

---

## 📋 SELECTORES FASE 1.2 - ESPECIFICACIONES

### 1. **🏥 selectCurrentSOAPAnalysis**

**Propósito:** Extraer análisis SOAP real de mensajes dashboard  
**Input:** `state.medicalChat.cores.dashboard.messages`  
**Output:** Análisis SOAP estructurado + confianza real  

```typescript
// 🎯 DESIGN SPECIFICATION
interface SOAPAnalysis {
  subjective: string | null      // Extraído de mensajes user
  objective: string | null       // Extraído de mensajes assistant con metadata
  assessment: string | null      // Diagnóstico inferido de confidence
  plan: string | null           // Treatment/followup extraído
  confidence: number            // Promedio real de message.confidence
  lastUpdated: number           // Timestamp del último mensaje médico
  sessionId: string             // Current session tracking
}

// 🔍 EXTRACTION LOGIC
const selectCurrentSOAPAnalysis = createSelector(
  (state: RootState) => state.medicalChat.cores.dashboard.messages,
  (state: RootState) => state.medicalChat.sharedState.currentSession,
  (messages, session) => {
    // 1. Filtrar mensajes médicos relevantes (no welcomes)
    const medicalMessages = messages.filter(msg => 
      msg.id !== 'welcome_multinucleus' && 
      msg.metadata?.sectionType
    )
    
    if (medicalMessages.length === 0) return null
    
    // 2. Extraer SOAP sections por metadata.sectionType
    const soapSections = {
      subjective: extractSubjectiveFromMessages(medicalMessages),
      objective: extractObjectiveFromMessages(medicalMessages), 
      assessment: extractAssessmentFromMessages(medicalMessages),
      plan: extractPlanFromMessages(medicalMessages)
    }
    
    // 3. Calcular confianza real (no mock)
    const confidenceScores = medicalMessages
      .filter(msg => msg.confidence)
      .map(msg => msg.confidence!)
    const avgConfidence = confidenceScores.length > 0 
      ? confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length 
      : 0
    
    // 4. Último análisis timestamp
    const lastMedicalMessage = medicalMessages[medicalMessages.length - 1]
    
    return {
      ...soapSections,
      confidence: avgConfidence,
      lastUpdated: lastMedicalMessage?.timestamp || Date.now(),
      sessionId: session.id
    }
  }
)
```

---

### 2. **📊 selectSystemMetrics**

**Propósito:** Calcular métricas reales del sistema multinúcleo  
**Input:** Todos los cores + actividad + mensajes  
**Output:** Métricas auténticas del sistema médico  

```typescript
// 🎯 DESIGN SPECIFICATION
interface SystemMetrics {
  confidence: number            // Promedio real de análisis médicos
  cycles: number               // Ciclos diagnósticos completados
  agentsActive: number         // Cores activos simultáneamente  
  processingTime: number       // Tiempo respuesta promedio
  messagesCount: number        // Total mensajes procesados
  sessionsToday: number        // Sesiones únicas hoy
  systemHealth: 'optimal' | 'good' | 'warning' | 'critical'
  lastActivity: number         // Última actividad global
}

// 🔍 CALCULATION LOGIC  
const selectSystemMetrics = createSelector(
  (state: RootState) => state.medicalChat.cores,
  (state: RootState) => state.medicalChat.sharedState,
  (cores, sharedState) => {
    const { dashboard, assistant, inference } = cores
    
    // 1. Métricas de confianza real
    const allMessages = [
      ...dashboard.messages,
      ...assistant.messages,
      ...inference.messages
    ]
    const confidenceScores = allMessages
      .filter(msg => msg.confidence)
      .map(msg => msg.confidence!)
    const avgConfidence = confidenceScores.length > 0
      ? confidenceScores.reduce((a, b) => a + b) / confidenceScores.length
      : 0
    
    // 2. Ciclos diagnósticos (secuencias user → assistant)
    const diagnosticCycles = countDiagnosticCycles(dashboard.messages)
    
    // 3. Cores activos (basado en lastActivity reciente)
    const now = Date.now()
    const activeThreshold = 5 * 60 * 1000 // 5 minutos
    const activeCores = [dashboard, assistant, inference]
      .filter(core => (now - core.lastActivity) < activeThreshold)
      .length
    
    // 4. Tiempo de procesamiento promedio
    const avgProcessingTime = calculateAverageResponseTime(dashboard.messages)
    
    // 5. Health del sistema
    const systemHealth = determineSystemHealth(avgConfidence, activeCores, avgProcessingTime)
    
    return {
      confidence: avgConfidence,
      cycles: diagnosticCycles,
      agentsActive: activeCores,
      processingTime: avgProcessingTime,
      messagesCount: allMessages.length,
      sessionsToday: 1,
      systemHealth,
      lastActivity: Math.max(dashboard.lastActivity, assistant.lastActivity, inference.lastActivity)
    }
  }
)
```

---

### 3. **🔄 selectDiagnosticProgress**

**Propósito:** Determinar progreso diagnóstico real basado en conversación  
**Input:** Dashboard messages + metadata  
**Output:** Progreso auténtico del análisis médico  

```typescript
// 🎯 DESIGN SPECIFICATION
interface DiagnosticProgress {
  currentCycle: number          // Ciclo diagnóstico actual (no mock)
  totalCycles: number          // Total de ciclos en sesión
  currentPhase: 'intake' | 'analysis' | 'diagnosis' | 'treatment' | 'followup'
  completionPercentage: number // % progreso real basado en sectionType
  lastPhaseChange: number      // Timestamp último cambio de fase
  estimatedTimeRemaining: number // Estimación basada en patrones
  phasesCompleted: string[]    // Fases médicas completadas
  isStalled: boolean          // Detectar si progreso se ha estancado
}

// 🔍 PROGRESS LOGIC
const selectDiagnosticProgress = createSelector(
  (state: RootState) => state.medicalChat.cores.dashboard.messages,
  (state: RootState) => state.medicalChat.cores.dashboard.lastActivity,
  (messages, lastActivity) => {
    const medicalMessages = messages.filter(msg => 
      msg.metadata?.sectionType && msg.id !== 'welcome_multinucleus'
    )
    
    if (medicalMessages.length === 0) {
      return createInitialProgress()
    }
    
    // 1. Identificar fases completadas por sectionType
    const phasesCompleted = extractCompletedPhases(medicalMessages)
    
    // 2. Determinar fase actual
    const currentPhase = determineCurrentPhase(medicalMessages, phasesCompleted)
    
    // 3. Calcular ciclos diagnósticos reales
    const cycles = countUserAssistantCycles(medicalMessages)
    
    // 4. Progreso basado en completitud de fases médicas
    const completionPercentage = calculateCompletionPercentage(phasesCompleted)
    
    // 5. Detectar estancamiento
    const isStalled = (Date.now() - lastActivity) > (10 * 60 * 1000) // 10 min
    
    return {
      currentCycle: cycles.current,
      totalCycles: cycles.total,
      currentPhase,
      completionPercentage,
      lastPhaseChange: getLastPhaseChangeTimestamp(medicalMessages),
      estimatedTimeRemaining: estimateTimeRemaining(currentPhase, completionPercentage),
      phasesCompleted,
      isStalled
    }
  }
)
```

---

### 4. **📋 selectPatientReminders**

**Propósito:** Extraer recordatorios reales de mensajes followup  
**Input:** Messages con `sectionType: 'followup'`  
**Output:** Sistema de recordatorios médicos auténtico  

```typescript
// 🎯 DESIGN SPECIFICATION
interface PatientReminder {
  id: string                   // ID único del recordatorio
  content: string             // Contenido del recordatorio médico
  type: 'medication' | 'appointment' | 'test' | 'lifestyle' | 'general'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate: number | null      // Timestamp cuando aplica
  createdAt: number           // Cuando se generó el recordatorio
  isCompleted: boolean        // Estado de completitud
  relatedMessageId: string    // Mensaje que generó el recordatorio
}

// 🔍 REMINDER EXTRACTION LOGIC
const selectPatientReminders = createSelector(
  (state: RootState) => state.medicalChat.cores.dashboard.messages,
  (state: RootState) => state.medicalChat.cores.assistant.messages,
  (dashboardMessages, assistantMessages) => {
    // 1. Filtrar mensajes de followup
    const followupMessages = [
      ...dashboardMessages,
      ...assistantMessages
    ].filter(msg => msg.metadata?.sectionType === 'followup')
    
    if (followupMessages.length === 0) return []
    
    // 2. Extraer recordatorios de contenido de mensajes
    const reminders: PatientReminder[] = []
    
    followupMessages.forEach(message => {
      const extractedReminders = extractRemindersFromContent(message.content)
      
      extractedReminders.forEach(reminder => {
        reminders.push({
          id: `reminder_${message.id}_${reminder.index}`,
          content: reminder.text,
          type: classifyReminderType(reminder.text),
          priority: determinePriority(reminder.text, message.confidence),
          dueDate: extractDueDate(reminder.text),
          createdAt: message.timestamp,
          isCompleted: false,
          relatedMessageId: message.id
        })
      })
    })
    
    // 3. Ordenar por prioridad y fecha
    return reminders.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff
      
      return (a.dueDate || Infinity) - (b.dueDate || Infinity)
    })
  }
)
```

---

### 5. **📝 selectPhysicianNotes**

**Propósito:** Categorizar mensajes como notas médicas estructuradas  
**Input:** Todos los messages médicos  
**Output:** Sistema de notas del médico organizado  

```typescript
// 🎯 DESIGN SPECIFICATION
interface PhysicianNote {
  id: string                   // ID único de la nota
  title: string               // Título generado automáticamente
  content: string             // Contenido de la nota médica
  category: 'diagnosis' | 'treatment' | 'observation' | 'plan' | 'education'
  tags: string[]              // Tags extraídos del contenido
  confidence: number          // Confianza del análisis que generó la nota
  createdAt: number           // Timestamp de creación
  lastModified: number        // Última modificación
  relatedMessageIds: string[] // Mensajes relacionados
  patientSessionId: string    // Sesión del paciente
  isImportant: boolean        // Nota marcada como importante
}

// 🔍 NOTE EXTRACTION LOGIC
const selectPhysicianNotes = createSelector(
  (state: RootState) => state.medicalChat.cores.dashboard.messages,
  (state: RootState) => state.medicalChat.sharedState.currentSession,
  (messages, session) => {
    // 1. Filtrar mensajes que pueden convertirse en notas
    const noteWorthyMessages = messages.filter(msg => 
      msg.type === 'assistant' &&
      msg.metadata?.sectionType &&
      msg.content.length > 50 && // Filtrar respuestas muy cortas
      msg.id !== 'welcome_multinucleus'
    )
    
    if (noteWorthyMessages.length === 0) return []
    
    // 2. Convertir mensajes en notas estructuradas
    const notes: PhysicianNote[] = noteWorthyMessages.map(message => {
      const category = mapSectionTypeToNoteCategory(message.metadata!.sectionType!)
      const extractedTags = extractMedicalTags(message.content)
      const generatedTitle = generateNoteTitle(message.content, category)
      
      return {
        id: `note_${message.id}`,
        title: generatedTitle,
        content: message.content,
        category,
        tags: extractedTags,
        confidence: message.confidence || 0,
        createdAt: message.timestamp,
        lastModified: message.timestamp,
        relatedMessageIds: [message.id],
        patientSessionId: session.id,
        isImportant: determineImportance(message.confidence, extractedTags)
      }
    })
    
    // 3. Agrupar notas relacionadas y ordenar
    const groupedNotes = groupRelatedNotes(notes)
    
    return groupedNotes.sort((a, b) => {
      // Importantes primero, luego por fecha
      if (a.isImportant && !b.isImportant) return -1
      if (!a.isImportant && b.isImportant) return 1
      return b.createdAt - a.createdAt
    })
  }
)
```

---

## 🔧 UTILITY FUNCTIONS NECESARIAS

### 🎯 **Funciones de Extracción:**
```typescript
// Helper functions para selectores
function extractSubjectiveFromMessages(messages: MedicalMessage[]): string | null
function extractObjectiveFromMessages(messages: MedicalMessage[]): string | null  
function extractAssessmentFromMessages(messages: MedicalMessage[]): string | null
function extractPlanFromMessages(messages: MedicalMessage[]): string | null

function countDiagnosticCycles(messages: MedicalMessage[]): number
function calculateAverageResponseTime(messages: MedicalMessage[]): number
function determineSystemHealth(confidence: number, activeCores: number, responseTime: number): string

function extractCompletedPhases(messages: MedicalMessage[]): string[]
function determineCurrentPhase(messages: MedicalMessage[], completed: string[]): string
function countUserAssistantCycles(messages: MedicalMessage[]): { current: number, total: number }

function extractRemindersFromContent(content: string): Array<{ text: string, index: number }>
function classifyReminderType(text: string): 'medication' | 'appointment' | 'test' | 'lifestyle' | 'general'
function extractDueDate(text: string): number | null

function extractMedicalTags(content: string): string[]
function generateNoteTitle(content: string, category: string): string
function groupRelatedNotes(notes: PhysicianNote[]): PhysicianNote[]
```

---

## 📁 ESTRUCTURA DE ARCHIVOS SUGERIDA

```
packages/cognitive-core/src/store/selectors/
├── medical/
│   ├── selectCurrentSOAPAnalysis.ts    # Selector principal SOAP
│   ├── selectSystemMetrics.ts          # Métricas del sistema
│   ├── selectDiagnosticProgress.ts     # Progreso diagnóstico
│   ├── selectPatientReminders.ts      # Sistema de recordatorios
│   ├── selectPhysicianNotes.ts        # Notas médicas
│   └── utils/
│       ├── soapExtraction.ts          # Utilidades extracción SOAP
│       ├── metricsCalculation.ts      # Cálculos de métricas
│       ├── progressTracking.ts        # Tracking de progreso
│       ├── reminderExtraction.ts      # Extracción recordatorios
│       └── noteProcessing.ts          # Procesamiento de notas
└── index.ts                           # Barrel exports
```

---

## 🎯 TRANSFORMACIÓN MOCK → REAL

### **Antes (Mock Data):**
```typescript
// Component usando datos falsos
const mockCurrentCase = { soap: null, confidence: 0.8 }
const confidence = 85
const mockIterativeState = { currentCycle: 1 }
const mockReminders: [] = []
const mockNotes: [] = []
```

### **Después (Selectores Reales):**
```typescript
// Component conectado al estado real
const soapAnalysis = useSelector(selectCurrentSOAPAnalysis)
const systemMetrics = useSelector(selectSystemMetrics) 
const diagnosticProgress = useSelector(selectDiagnosticProgress)
const patientReminders = useSelector(selectPatientReminders)
const physicianNotes = useSelector(selectPhysicianNotes)
```

---

## ✅ **VALIDACIÓN DE FASE 1.2**

### **Criterios de Éxito:**
- ✅ 5 selectores médicos especializados diseñados
- ✅ Interfaces TypeScript definidas  
- ✅ Lógica de extracción especificada
- ✅ Utility functions identificadas
- ✅ Estructura de archivos planificada
- ✅ Transformación mock→real documentada

### **Estado:** READY FOR PHASE 1.3 🎯

---

**Siguiente:** FASE 1.3 - Especificar Interfaces para datos reales vs mocks

---

*Diseñado por Gandalf el Blanco - "Del caos de mensajes, nace la sabiduría médica"*