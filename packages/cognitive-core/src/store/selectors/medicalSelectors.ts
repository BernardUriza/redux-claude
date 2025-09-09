// 🎯 SELECTORES MÉDICOS MULTINÚCLEO - Creado por Bernard Orozco + Gandalf el Blanco
// Los 5 Selectores Magistrales que DESTRUYEN el Mock Data para siempre

import { createSelector } from '@reduxjs/toolkit'

import type {
  SOAPAnalysis,
  SystemMetrics,
  DiagnosticProgress,
  PatientReminder,
  PhysicianNote,
  DiagnosticPhase,
  ReminderType,
  ReminderPriority,
  NoteCategory,
  CoreMetrics,
} from '../../types/medicalInterfaces'
import {
  createEmptySOAPAnalysis,
  createEmptySystemMetrics,
  createEmptyDiagnosticProgress,
} from '../../types/medicalInterfaces'
import type { RootState } from '../store'
import type { MedicalMessage } from '../medicalChatSlice'

// 🧙‍♂️ Gandalf's Stable References - NO MORE RE-RENDERS! - Creado por Bernard Orozco
const EMPTY_REMINDERS: PatientReminder[] = []
const EMPTY_NOTES: PhysicianNote[] = []

// === UTILITY FUNCTIONS FOR EXTRACTION ===

// 🔍 Extraer contenido SOAP de mensajes
const extractSubjectiveFromMessages = (messages: MedicalMessage[]): string | null => {
  const userMessages = messages.filter(
    msg => msg.type === 'user' && msg.content.length > 20 && msg.id !== 'welcome_multinucleus'
  )

  if (userMessages.length === 0) return null

  // Combinar síntomas y quejas del usuario
  const subjectiveContent = userMessages.map(msg => msg.content).join('\n\n')

  return subjectiveContent.trim() || null
}

const extractObjectiveFromMessages = (messages: MedicalMessage[]): string | null => {
  const assistantMessages = messages.filter(
    msg =>
      (msg.type === 'assistant' &&
        msg.metadata?.sectionType === 'diagnosis' &&
        msg.content.includes('observ')) ||
      msg.content.includes('exam') ||
      msg.content.includes('sign')
  )

  if (assistantMessages.length === 0) return null

  const objectiveContent = assistantMessages.map(msg => msg.content).join('\n\n')

  return objectiveContent.trim() || null
}

const extractAssessmentFromMessages = (messages: MedicalMessage[]): string | null => {
  const diagnosticMessages = messages.filter(
    msg =>
      msg.type === 'assistant' &&
      (msg.metadata?.sectionType === 'diagnosis' ||
        msg.content.toLowerCase().includes('diagnos') ||
        msg.content.toLowerCase().includes('assess'))
  )

  if (diagnosticMessages.length === 0) return null

  const assessmentContent = diagnosticMessages.map(msg => msg.content).join('\n\n')

  return assessmentContent.trim() || null
}

const extractPlanFromMessages = (messages: MedicalMessage[]): string | null => {
  const planMessages = messages.filter(
    msg =>
      msg.type === 'assistant' &&
      (msg.metadata?.sectionType === 'treatment' ||
        msg.metadata?.sectionType === 'followup' ||
        msg.content.toLowerCase().includes('plan') ||
        msg.content.toLowerCase().includes('treat') ||
        msg.content.toLowerCase().includes('recommend'))
  )

  if (planMessages.length === 0) return null

  const planContent = planMessages.map(msg => msg.content).join('\n\n')

  return planContent.trim() || null
}

// 📊 Calcular métricas del sistema
const calculateConfidenceFromMessages = (messages: MedicalMessage[]): number => {
  const confidenceScores = messages
    .filter(msg => msg.metadata?.confidence && msg.metadata.confidence > 0)
    .map(msg => msg.metadata!.confidence!)

  if (confidenceScores.length === 0) return 0

  const avgConfidence = confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length
  return Math.round(avgConfidence * 100) // Convertir a 0-100
}

const countDiagnosticCycles = (messages: MedicalMessage[]): number => {
  let cycles = 0
  let lastType: 'user' | 'assistant' | null = null

  for (const msg of messages) {
    if (msg.id === 'welcome_multinucleus') continue

    if (msg.type === 'user' && lastType === 'assistant') {
      cycles++
    }
    lastType = msg.type
  }

  return cycles
}

const getActiveAgentCount = (cores: any): number => {
  const now = Date.now()
  const activeThreshold = 5 * 60 * 1000 // 5 minutos

  let activeCount = 0
  if (now - cores.dashboard.lastActivity < activeThreshold) activeCount++
  if (now - cores.assistant.lastActivity < activeThreshold) activeCount++
  // 🪦 inference core eliminado - solo dashboard y assistant ahora

  return activeCount
}

const calculateAverageResponseTime = (messages: MedicalMessage[]): number => {
  const pairs: { user: number; assistant: number }[] = []
  let lastUserTime: number | null = null

  for (const msg of messages) {
    if (msg.id === 'welcome_multinucleus') continue

    if (msg.type === 'user') {
      lastUserTime = msg.timestamp
    } else if (msg.type === 'assistant' && lastUserTime) {
      pairs.push({ user: lastUserTime, assistant: msg.timestamp })
      lastUserTime = null
    }
  }

  if (pairs.length === 0) return 0

  const responseTimes = pairs.map(p => p.assistant - p.user)
  return responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
}

const determineSystemHealth = (
  confidence: number,
  activeCores: number,
  responseTime: number
): SystemMetrics['systemHealth'] => {
  if (confidence > 85 && activeCores >= 2 && responseTime < 2000) return 'optimal'
  if (confidence > 70 && activeCores >= 1 && responseTime < 5000) return 'good'
  if (confidence > 50 && responseTime < 10000) return 'warning'
  return 'critical'
}

// 🔄 Funciones de progreso diagnóstico
const extractCompletedPhases = (messages: MedicalMessage[]): DiagnosticPhase[] => {
  const phases: DiagnosticPhase[] = []

  if (messages.some(m => m.type === 'user')) phases.push('intake')
  if (messages.some(m => m.type === 'assistant' && m.metadata?.sectionType === 'diagnosis'))
    phases.push('analysis')
  if (
    messages.some(
      m => m.metadata?.sectionType === 'diagnosis' && m.metadata?.confidence && m.metadata?.confidence > 0.7
    )
  )
    phases.push('diagnosis')
  if (messages.some(m => m.metadata?.sectionType === 'treatment')) phases.push('treatment')
  if (messages.some(m => m.metadata?.sectionType === 'followup')) phases.push('followup')

  return phases
}

const determineCurrentPhase = (
  messages: MedicalMessage[],
  completed: DiagnosticPhase[]
): DiagnosticPhase => {
  if (!completed.includes('intake')) return 'intake'
  if (!completed.includes('analysis')) return 'analysis'
  if (!completed.includes('diagnosis')) return 'diagnosis'
  if (!completed.includes('treatment')) return 'treatment'
  return 'followup'
}

// === SELECTOR 1: SOAP ANALYSIS SELECTOR ===
// 🏥 Destructor definitivo de mockCurrentCase
export const selectCurrentSOAPAnalysis = createSelector(
  [
    (state: RootState) => state.medicalChat.cores.dashboard.messages,
    (state: RootState) => state.medicalChat.sharedState.currentSession,
  ],
  (messages, session): SOAPAnalysis | null => {
    // Filtrar mensajes médicos relevantes
    const medicalMessages = messages.filter(msg => msg.id !== 'welcome_multinucleus')

    if (medicalMessages.length === 0) return null

    // Extraer secciones SOAP
    const subjective = extractSubjectiveFromMessages(medicalMessages)
    const objective = extractObjectiveFromMessages(medicalMessages)
    const assessment = extractAssessmentFromMessages(medicalMessages)
    const plan = extractPlanFromMessages(medicalMessages)

    // Calcular confianza real (no mock)
    const confidenceScores = medicalMessages
      .filter(msg => msg.metadata?.confidence)
      .map(msg => msg.metadata?.confidence || 0)
    const avgConfidence =
      confidenceScores.length > 0
        ? confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length
        : 0

    // Calcular completitud
    const sections = [subjective, objective, assessment, plan]
    const validSections = sections.filter(s => s !== null).length
    const completionPercentage = (validSections / 4) * 100

    // Último mensaje médico timestamp
    const lastMedicalMessage = medicalMessages[medicalMessages.length - 1]

    return {
      subjective,
      objective,
      assessment,
      plan,
      confidence: avgConfidence,
      lastUpdated: lastMedicalMessage?.timestamp || Date.now(),
      sessionId: session.id,
      isComplete: validSections === 4,
      completionPercentage,
      totalMessages: medicalMessages.length,
      qualityScore: Math.min(avgConfidence * 1.2, 1), // Boost quality with confidence
      extractionMethod: 'automatic',
    }
  }
)

// === SELECTOR 2: SYSTEM METRICS SELECTOR ===
// 📊 Aniquilador de confidence = 85 hardcodeado
export const selectSystemMetrics = createSelector(
  [
    (state: RootState) => state.medicalChat.cores,
    (state: RootState) => state.medicalChat.sharedState,
  ],
  (cores, sharedState): SystemMetrics => {
    const { dashboard, assistant } = cores

    // Métricas de confianza real
    const allMessages = [...dashboard.messages, ...assistant.messages]

    const confidence = calculateConfidenceFromMessages(dashboard.messages)
    const cycles = countDiagnosticCycles(dashboard.messages)
    const agentsActive = getActiveAgentCount(cores)
    const processingTime = calculateAverageResponseTime(dashboard.messages)

    // Métricas por core
    const createCoreMetrics = (core: any): CoreMetrics => ({
      messagesCount: core.messages.length,
      avgResponseTime: calculateAverageResponseTime(core.messages),
      isActive: Date.now() - core.lastActivity < 300000, // 5 min
      lastActivity: core.lastActivity,
      loadLevel: core.isLoading ? 'high' : core.messages.length > 10 ? 'medium' : 'low',
    })

    // Salud del sistema
    const systemHealth = determineSystemHealth(confidence, agentsActive, processingTime)
    const healthScore =
      systemHealth === 'optimal'
        ? 95
        : systemHealth === 'good'
          ? 80
          : systemHealth === 'warning'
            ? 60
            : 30

    return {
      confidence,
      cycles,
      agentsActive,
      processingTime,
      messagesCount: allMessages.length,
      sessionsToday: 1,
      lastActivity: Math.max(dashboard.lastActivity, assistant.lastActivity),
      systemHealth,
      healthScore,
      coreMetrics: {
        dashboard: createCoreMetrics(dashboard),
        assistant: createCoreMetrics(assistant),
        // 🪦 inference eliminado por decreto de Gandalf
      },
      uptime: Date.now() - sharedState.currentSession.startTime,
      avgSessionDuration: Date.now() - sharedState.currentSession.startTime, // Simplified
      peakLoadTime: Date.now(), // Simplified
    }
  }
)

// === SELECTOR 3: DIAGNOSTIC PROGRESS SELECTOR ===
// 🔄 Elimina mockIterativeState para siempre
export const selectDiagnosticProgress = createSelector(
  [
    (state: RootState) => state.medicalChat.cores.dashboard.messages,
    (state: RootState) => state.medicalChat.cores.dashboard.lastActivity,
  ],
  (messages, lastActivity): DiagnosticProgress => {
    const medicalMessages = messages.filter(msg => msg.id !== 'welcome_multinucleus')

    if (medicalMessages.length === 0) {
      return {
        ...createEmptyDiagnosticProgress(),
        lastPhaseChange: lastActivity,
      }
    }

    // Identificar fases completadas
    const phasesCompleted = extractCompletedPhases(medicalMessages)

    // Determinar fase actual
    const currentPhase = determineCurrentPhase(medicalMessages, phasesCompleted)

    // Calcular ciclos diagnósticos reales
    const totalCycles = countDiagnosticCycles(medicalMessages)
    const currentCycle = Math.max(1, totalCycles)

    // Progreso basado en fases completadas
    const completionPercentage = (phasesCompleted.length / 5) * 100

    // Detectar estancamiento
    const isStalled = Date.now() - lastActivity > 10 * 60 * 1000 // 10 min

    // Tendencia de confianza
    const recentMessages = medicalMessages.slice(-5)
    const recentConfidences = recentMessages.filter(m => m.metadata?.confidence).map(m => m.metadata?.confidence || 0)
    let confidenceTrend: DiagnosticProgress['confidenceTrend'] = 'stable'
    if (recentConfidences.length > 2) {
      const first = recentConfidences[0]
      const last = recentConfidences[recentConfidences.length - 1]
      if (last > first + 0.1) confidenceTrend = 'increasing'
      if (last < first - 0.1) confidenceTrend = 'decreasing'
    }

    return {
      currentCycle,
      totalCycles,
      currentPhase,
      phasesCompleted,
      nextPhase:
        currentPhase === 'followup'
          ? null
          : currentPhase === 'treatment'
            ? 'followup'
            : currentPhase === 'diagnosis'
              ? 'treatment'
              : currentPhase === 'analysis'
                ? 'diagnosis'
                : 'analysis',
      completionPercentage,
      estimatedTimeRemaining: Math.max(0, (5 - phasesCompleted.length) * 5 * 60 * 1000), // 5 min per phase
      isStalled,
      lastPhaseChange: lastActivity, // Simplified
      progressQuality:
        completionPercentage > 80
          ? 'excellent'
          : completionPercentage > 60
            ? 'good'
            : completionPercentage > 40
              ? 'fair'
              : 'poor',
      confidenceTrend,
      totalMessagesProcessed: medicalMessages.length,
      phaseDurations: {
        // Simplified - equal distribution
        intake: 2 * 60 * 1000,
        analysis: 3 * 60 * 1000,
        diagnosis: 5 * 60 * 1000,
        treatment: 4 * 60 * 1000,
        followup: 2 * 60 * 1000,
      },
    }
  }
)

// === SELECTOR 4: PATIENT REMINDERS SELECTOR ===
// 📋 Destruye mockReminders: [] para siempre
export const selectPatientReminders = createSelector(
  [
    (state: RootState) => state.medicalChat.cores.dashboard.messages,
    (state: RootState) => state.medicalChat.cores.assistant.messages,
  ],
  (dashboardMessages, assistantMessages): PatientReminder[] => {
    // Filtrar mensajes de followup
    const followupMessages = [...dashboardMessages, ...assistantMessages].filter(
      msg => msg.metadata?.sectionType === 'followup' || msg.metadata?.sectionType === 'treatment'
    )

    if (followupMessages.length === 0) return EMPTY_REMINDERS

    const reminders: PatientReminder[] = []

    followupMessages.forEach((message, index) => {
      // Extraer recordatorios del contenido
      const content = message.content.toLowerCase()
      let type: ReminderType = 'followup'
      let priority: ReminderPriority = 'medium'

      // Clasificar tipo
      if (content.includes('medicament') || content.includes('pill') || content.includes('dose'))
        type = 'medication'
      if (content.includes('appointment') || content.includes('cita') || content.includes('visit'))
        type = 'appointment'
      if (content.includes('test') || content.includes('analysis') || content.includes('exam'))
        type = 'test'
      if (content.includes('exercise') || content.includes('diet') || content.includes('lifestyle'))
        type = 'lifestyle'
      if (content.includes('monitor') || content.includes('check') || content.includes('watch'))
        type = 'monitoring'

      // Determinar prioridad
      if (
        content.includes('urgent') ||
        content.includes('important') ||
        content.includes('critical')
      )
        priority = 'urgent'
      if (content.includes('high priority') || content.includes('asap')) priority = 'high'
      if (content.includes('low priority') || content.includes('when convenient')) priority = 'low'

      // Estimar fecha de vencimiento
      let dueDate: number | null = null
      if (content.includes('today')) dueDate = Date.now() + 24 * 60 * 60 * 1000
      if (content.includes('tomorrow')) dueDate = Date.now() + 2 * 24 * 60 * 60 * 1000
      if (content.includes('week')) dueDate = Date.now() + 7 * 24 * 60 * 60 * 1000
      if (content.includes('month')) dueDate = Date.now() + 30 * 24 * 60 * 60 * 1000

      reminders.push({
        id: `reminder_${message.id}_${index}`,
        relatedMessageId: message.id,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Reminder`,
        content: message.content,
        type,
        priority,
        dueDate,
        reminderDate: dueDate ? dueDate - 24 * 60 * 60 * 1000 : null, // 1 day before
        isCompleted: false,
        isOverdue: dueDate ? Date.now() > dueDate : false,
        completedAt: null,
        createdAt: message.timestamp,
        patientSessionId: message.metadata?.sessionId || 'unknown',
        estimatedDuration:
          type === 'medication' ? 5 : type === 'appointment' ? 60 : type === 'test' ? 120 : 30,
        medicalContext: message.content,
        extractedFromPhase:
          message.metadata?.sectionType === 'treatment' ? 'treatment' : 'followup',
      })
    })

    // Ordenar por prioridad y fecha
    return reminders.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff

      return (a.dueDate || Infinity) - (b.dueDate || Infinity)
    })
  }
)

// === SELECTOR 5: PHYSICIAN NOTES SELECTOR ===
// 📝 Aniquila mockNotes: [] definitivamente
export const selectPhysicianNotes = createSelector(
  [
    (state: RootState) => state.medicalChat.cores.dashboard.messages,
    (state: RootState) => state.medicalChat.sharedState.currentSession,
  ],
  (messages, session): PhysicianNote[] => {
    // Filtrar mensajes que pueden convertirse en notas
    const noteWorthyMessages = messages.filter(
      msg =>
        msg.type === 'assistant' &&
        msg.metadata?.sectionType &&
        msg.content.length > 50 && // Filtrar respuestas muy cortas
        msg.id !== 'welcome_multinucleus'
    )

    if (noteWorthyMessages.length === 0) return EMPTY_NOTES

    const notes: PhysicianNote[] = noteWorthyMessages.map((message, index) => {
      // Mapear sectionType a category
      const category: NoteCategory =
        message.metadata?.sectionType === 'diagnosis'
          ? 'diagnosis'
          : message.metadata?.sectionType === 'treatment'
            ? 'treatment'
            : message.metadata?.sectionType === 'followup'
              ? 'followup'
              : message.metadata?.sectionType === 'education'
                ? 'education'
                : 'observation'

      // Extraer tags médicos básicos
      const content = message.content.toLowerCase()
      const tags: string[] = []

      if (content.includes('symptom')) tags.push('symptoms')
      if (content.includes('diagnos')) tags.push('diagnosis')
      if (content.includes('treatment') || content.includes('medication')) tags.push('treatment')
      if (content.includes('follow') || content.includes('monitor')) tags.push('followup')
      if (content.includes('test') || content.includes('analysis')) tags.push('testing')
      if (content.includes('urgent') || content.includes('critical')) tags.push('urgent')

      // Generar título automático
      const title = `${category.charAt(0).toUpperCase() + category.slice(1)} Note - ${new Date(message.timestamp).toLocaleDateString()}`

      // Generar resumen (primeras 100 chars)
      const summary =
        message.content.substring(0, 100) + (message.content.length > 100 ? '...' : '')

      // Determinar importancia
      const isImportant =
        (message.metadata?.confidence || 0) > 0.8 || tags.includes('urgent') || category === 'diagnosis'

      return {
        id: `note_${message.id}_${index}`,
        relatedMessageIds: [message.id],
        title,
        content: message.content,
        summary,
        category,
        tags,
        specialtyRelevant: ['general_medicine'], // Simplified
        confidence: message.metadata?.confidence || 0,
        qualityScore: Math.min((message.metadata?.confidence || 0) + 0.2, 1),
        isImportant,
        createdAt: message.timestamp,
        lastModified: message.timestamp,
        patientSessionId: session.id,
        clinicalContext: `Session: ${session.id}`,
        extractionSource: 'conversation',
        searchableContent: message.content.toLowerCase(),
        keyPhrases: tags, // Simplified
        linkedReminders: [],
        linkedAnalysis: [],
      }
    })

    // Ordenar por importancia y fecha
    return notes.sort((a, b) => {
      if (a.isImportant && !b.isImportant) return -1
      if (!a.isImportant && b.isImportant) return 1
      return b.createdAt - a.createdAt
    })
  }
)
