// src/services/contextualMemory.ts
// Sistema de Memoria Contextual - Bernard Orozco

import {
  ContextualMemory,
  ShortTermMemory,
  WorkingMemory,
  EpisodicMemory,
  SemanticInsight,
  PatientContext,
  Hypothesis,
} from '../types/cognitive'
import { DecisionResult, AgentType } from '../types/agents'
import { nanoid } from '@reduxjs/toolkit'

export class ContextualMemorySystem {
  private memory: ContextualMemory
  private readonly MAX_SHORT_TERM_ITEMS = 10
  private readonly MAX_EPISODIC_MEMORIES = 50
  private readonly PATTERN_THRESHOLD = 3

  constructor() {
    this.memory = this.initializeMemory()
  }

  private initializeMemory(): ContextualMemory {
    return {
      sessionId: nanoid(),
      shortTermMemory: {
        recentInputs: [],
        recentDecisions: [],
        activeSymptoms: [],
        currentContext: 'routine',
        patientProfile: undefined,
      },
      workingMemory: {
        currentGoal: '',
        activeHypotheses: [],
        pendingValidations: [],
        confidenceThreshold: 0.7,
      },
      episodicMemory: [],
      semanticInsights: [],
      lastUpdated: Date.now(),
    }
  }

  // ============= ACTUALIZACIÓN DE MEMORIA =============
  updateWithInput(input: string): void {
    const stm = this.memory.shortTermMemory

    // Actualizar inputs recientes (FIFO)
    stm.recentInputs.unshift(input)
    if (stm.recentInputs.length > this.MAX_SHORT_TERM_ITEMS) {
      stm.recentInputs.pop()
    }

    // Extraer síntomas del input
    const symptoms = this.extractSymptoms(input)
    stm.activeSymptoms = [...new Set([...stm.activeSymptoms, ...symptoms])]

    // Detectar contexto
    stm.currentContext = this.detectContext(input, stm.activeSymptoms)

    // Actualizar objetivo actual
    this.memory.workingMemory.currentGoal = this.inferGoal(input, stm.currentContext)

    this.memory.lastUpdated = Date.now()
  }

  updateWithDecision(decision: DecisionResult): void {
    const stm = this.memory.shortTermMemory

    // Agregar a decisiones recientes
    stm.recentDecisions.unshift(decision)
    if (stm.recentDecisions.length > this.MAX_SHORT_TERM_ITEMS) {
      stm.recentDecisions.pop()
    }

    // Crear memoria episódica
    this.createEpisodicMemory(decision)

    // Actualizar insights semánticos
    this.updateSemanticInsights(decision)

    // Actualizar hipótesis activas
    this.updateHypotheses(decision)

    this.memory.lastUpdated = Date.now()
  }

  // ============= EXTRACCIÓN DE INFORMACIÓN =============
  private extractSymptoms(input: string): string[] {
    const symptoms: string[] = []
    const symptomKeywords = [
      'dolor',
      'pain',
      'headache',
      'fever',
      'cough',
      'fatigue',
      'nausea',
      'vomiting',
      'dizziness',
      'weakness',
      'chest',
      'breathing',
      'heart',
      'pressure',
      'burning',
      'sharp',
    ]

    const words = input.toLowerCase().split(/\s+/)
    for (const word of words) {
      if (symptomKeywords.some(keyword => word.includes(keyword))) {
        symptoms.push(word)
      }
    }

    return symptoms
  }

  private detectContext(
    input: string,
    symptoms: string[]
  ): 'diagnostic' | 'treatment' | 'emergency' | 'routine' {
    const inputLower = input.toLowerCase()

    // Detectar emergencia
    const emergencyKeywords = [
      'emergency',
      'urgent',
      'severe',
      'chest pain',
      "can't breathe",
      'unconscious',
      'bleeding',
    ]
    if (emergencyKeywords.some(kw => inputLower.includes(kw))) {
      return 'emergency'
    }

    // Detectar tratamiento
    if (
      inputLower.includes('treatment') ||
      inputLower.includes('medication') ||
      inputLower.includes('prescribe')
    ) {
      return 'treatment'
    }

    // Detectar diagnóstico
    if (symptoms.length > 0 || inputLower.includes('diagnos') || inputLower.includes('what is')) {
      return 'diagnostic'
    }

    return 'routine'
  }

  private inferGoal(input: string, context: string): string {
    switch (context) {
      case 'emergency':
        return 'Stabilize patient and identify critical conditions'
      case 'diagnostic':
        return 'Identify most likely diagnosis with supporting evidence'
      case 'treatment':
        return 'Develop safe and effective treatment plan'
      default:
        return 'Provide appropriate medical guidance'
    }
  }

  // ============= MEMORIA EPISÓDICA =============
  private createEpisodicMemory(decision: DecisionResult): void {
    const episode: EpisodicMemory = {
      timestamp: Date.now(),
      event: `${decision.agentType} decision with ${decision.confidence}% confidence`,
      agentsInvolved: [decision.agentType],
      outcome: decision.success ? (decision.confidence > 80 ? 'success' : 'partial') : 'failure',
      learnings: this.extractLearnings(decision),
    }

    this.memory.episodicMemory.unshift(episode)
    if (this.memory.episodicMemory.length > this.MAX_EPISODIC_MEMORIES) {
      this.memory.episodicMemory.pop()
    }
  }

  private extractLearnings(decision: DecisionResult): string[] {
    const learnings: string[] = []

    if (decision.success && decision.confidence > 90) {
      learnings.push(`High confidence ${decision.agentType} decisions are reliable`)
    }

    if (!decision.success) {
      learnings.push(`${decision.agentType} may need reinforcement for this context`)
    }

    if (decision.latency > 2000) {
      learnings.push(`Consider optimizing ${decision.agentType} for faster responses`)
    }

    return learnings
  }

  // ============= INSIGHTS SEMÁNTICOS =============
  private updateSemanticInsights(decision: DecisionResult): void {
    const pattern = this.identifyPattern(decision)

    const existingInsight = this.memory.semanticInsights.find(i => i.pattern === pattern)

    if (existingInsight) {
      existingInsight.frequency++
      existingInsight.reliability =
        (existingInsight.reliability * (existingInsight.frequency - 1) + decision.confidence) /
        existingInsight.frequency

      if (!existingInsight.associatedAgents.includes(decision.agentType)) {
        existingInsight.associatedAgents.push(decision.agentType)
      }
    } else if (this.shouldCreateInsight(pattern)) {
      this.memory.semanticInsights.push({
        pattern,
        frequency: 1,
        reliability: decision.confidence,
        associatedAgents: [decision.agentType],
      })
    }
  }

  private identifyPattern(decision: DecisionResult): string {
    // Simplified pattern identification
    const context = this.memory.shortTermMemory.currentContext
    const agentType = decision.agentType
    return `${context}-${agentType}-${decision.success ? 'success' : 'failure'}`
  }

  private shouldCreateInsight(pattern: string): boolean {
    // Create insight if pattern appears frequently enough
    const relatedEpisodes = this.memory.episodicMemory.filter(e =>
      e.event.includes(pattern.split('-')[1])
    )
    return relatedEpisodes.length >= this.PATTERN_THRESHOLD
  }

  // ============= HIPÓTESIS Y RAZONAMIENTO =============
  private updateHypotheses(decision: DecisionResult): void {
    const wm = this.memory.workingMemory

    // Crear nueva hipótesis basada en la decisión
    if (decision.agentType === AgentType.DIAGNOSTIC && decision.success) {
      const diagnosticDecision = decision.decision as any
      if (diagnosticDecision.differentials) {
        for (const differential of diagnosticDecision.differentials) {
          const hypothesis: Hypothesis = {
            id: nanoid(),
            description: differential.condition,
            confidence: differential.probability * 100,
            supportingEvidence: differential.evidence || [],
            contradictingEvidence: [],
            suggestedAgents: [AgentType.VALIDATION, AgentType.TREATMENT],
          }

          // Reemplazar o agregar hipótesis
          const existingIndex = wm.activeHypotheses.findIndex(
            h => h.description === hypothesis.description
          )

          if (existingIndex >= 0) {
            wm.activeHypotheses[existingIndex] = hypothesis
          } else {
            wm.activeHypotheses.push(hypothesis)
          }
        }
      }
    }

    // Validar hipótesis existentes
    if (decision.agentType === AgentType.VALIDATION && decision.success) {
      const validationDecision = decision.decision as any
      if (validationDecision.concerns) {
        for (const hypothesis of wm.activeHypotheses) {
          for (const concern of validationDecision.concerns) {
            if (concern.toLowerCase().includes(hypothesis.description.toLowerCase())) {
              hypothesis.contradictingEvidence.push(concern)
              hypothesis.confidence *= 0.8 // Reducir confianza
            }
          }
        }
      }
    }

    // Ordenar hipótesis por confianza
    wm.activeHypotheses.sort((a, b) => b.confidence - a.confidence)

    // Mantener solo top 5 hipótesis
    wm.activeHypotheses = wm.activeHypotheses.slice(0, 5)
  }

  // ============= MÉTODOS DE CONSULTA =============
  getMemoryContext(): ContextualMemory {
    return { ...this.memory }
  }

  getRelevantContext(agentType: AgentType): any {
    const context: any = {
      currentContext: this.memory.shortTermMemory.currentContext,
      activeSymptoms: this.memory.shortTermMemory.activeSymptoms,
      recentInputs: this.memory.shortTermMemory.recentInputs.slice(0, 3),
      currentGoal: this.memory.workingMemory.currentGoal,
    }

    // Agregar información específica del agente
    switch (agentType) {
      case AgentType.DIAGNOSTIC:
        context.activeHypotheses = this.memory.workingMemory.activeHypotheses
        context.patientProfile = this.memory.shortTermMemory.patientProfile
        break

      case AgentType.VALIDATION:
        context.pendingValidations = this.memory.workingMemory.pendingValidations
        context.recentDecisions = this.memory.shortTermMemory.recentDecisions.filter(
          d => d.agentType === AgentType.DIAGNOSTIC
        )
        break

      case AgentType.TREATMENT:
        context.confirmedDiagnosis = this.memory.workingMemory.activeHypotheses[0]
        context.patientProfile = this.memory.shortTermMemory.patientProfile
        break

      case AgentType.TRIAGE:
        context.urgencyIndicators = this.extractUrgencyIndicators()
        break
    }

    // Agregar insights relevantes
    context.relevantInsights = this.memory.semanticInsights.filter(i =>
      i.associatedAgents.includes(agentType)
    )

    return context
  }

  private extractUrgencyIndicators(): string[] {
    const indicators: string[] = []
    const urgentSymptoms = [
      'chest pain',
      'difficulty breathing',
      'severe',
      'unconscious',
      'bleeding',
    ]

    for (const symptom of this.memory.shortTermMemory.activeSymptoms) {
      if (urgentSymptoms.some(u => symptom.includes(u))) {
        indicators.push(symptom)
      }
    }

    return indicators
  }

  // ============= GESTIÓN DE MEMORIA =============
  clearShortTermMemory(): void {
    this.memory.shortTermMemory = {
      recentInputs: [],
      recentDecisions: [],
      activeSymptoms: [],
      currentContext: 'routine',
      patientProfile: this.memory.shortTermMemory.patientProfile,
    }
  }

  updatePatientContext(context: Partial<PatientContext>): void {
    this.memory.shortTermMemory.patientProfile = {
      ...this.memory.shortTermMemory.patientProfile,
      ...context,
    } as PatientContext
  }

  getMemoryStats(): {
    shortTermLoad: number
    episodicCount: number
    insightCount: number
    hypothesisCount: number
    contextAge: number
  } {
    return {
      shortTermLoad: this.memory.shortTermMemory.recentInputs.length / this.MAX_SHORT_TERM_ITEMS,
      episodicCount: this.memory.episodicMemory.length,
      insightCount: this.memory.semanticInsights.length,
      hypothesisCount: this.memory.workingMemory.activeHypotheses.length,
      contextAge: Date.now() - this.memory.lastUpdated,
    }
  }
}

// Singleton instance
export const contextualMemory = new ContextualMemorySystem()
