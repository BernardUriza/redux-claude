// src/services/cognitiveOrchestrator.ts
// Orquestador Cognitivo Integrado - Bernard Orozco

import { 
  CognitiveSystem,
  Metacognition,
  Goal,
  SelfAssessment,
  CognitiveEvent,
  CognitiveEventType,
  CognitiveConfig
} from '../types/cognitive'
import { AgentType, DecisionResult } from '../types/agents'
import { nanoid } from '@reduxjs/toolkit'
import { contextualMemory } from './contextualMemory'
import { reinforcementLearning } from './reinforcementLearning'
import { consensusSystem } from './consensusSystem'
import { adaptivePipeline } from './adaptivePipeline'
import { multiAgentOrchestrator } from './multiAgentOrchestrator'

export class CognitiveOrchestrator {
  private cognitiveSystem: CognitiveSystem
  private eventListeners: Map<CognitiveEventType, Function[]> = new Map()
  private metacognitionInterval: NodeJS.Timeout | null = null
  
  private readonly config: CognitiveConfig = {
    memoryRetentionMs: 3600000, // 1 hour
    learningRate: 0.1,
    explorationVsExploitation: 0.15,
    consensusThreshold: 0.7,
    adaptationSensitivity: 0.2,
    metacognitionInterval: 30000, // 30 seconds
    maxDebateRounds: 5,
    confidenceDecayRate: 0.95
  }

  constructor() {
    this.cognitiveSystem = this.initializeCognitiveSystem()
    this.startMetacognition()
  }

  private initializeCognitiveSystem(): CognitiveSystem {
    return {
      memory: contextualMemory.getMemoryContext(),
      learning: {
        agentPerformance: {} as any,
        dynamicPriorities: {} as any,
        learningRate: this.config.learningRate,
        explorationRate: this.config.explorationVsExploitation,
        rewards: []
      },
      consensus: {
        votingRounds: [],
        consensusThreshold: this.config.consensusThreshold,
        conflictResolution: 'weighted',
        activeDebates: []
      },
      pipeline: {
        currentPipeline: [],
        pipelineTemplates: {},
        contextAnalyzer: adaptivePipeline,
        performanceOptimizer: adaptivePipeline
      },
      metacognition: this.initializeMetacognition()
    }
  }

  private initializeMetacognition(): Metacognition {
    return {
      systemConfidence: 0.5,
      uncertaintyLevel: 0.5,
      knowledgeGaps: [],
      activeGoals: [],
      selfAssessment: {
        strengths: [],
        weaknesses: [],
        improvementAreas: [],
        learningProgress: 0,
        adaptationRate: 0
      }
    }
  }

  // ============= PROCESAMIENTO COGNITIVO PRINCIPAL =============
  async processWithCognition(input: string): Promise<{
    decisions: DecisionResult[]
    consensus: any
    memory: any
    insights: any
  }> {
    // 1. Actualizar memoria con input
    contextualMemory.updateWithInput(input)
    const memory = contextualMemory.getMemoryContext()
    
    // 2. Analizar contexto y recomendar pipeline
    const pipelineRecommendation = adaptivePipeline.analyze(input, memory)
    this.emitEvent({
      type: CognitiveEventType.PIPELINE_ADAPTED,
      timestamp: Date.now(),
      data: { recommendation: pipelineRecommendation.recommendedTemplate, confidence: pipelineRecommendation.confidence },
      impact: 'medium',
      requiresAttention: false
    })
    
    // 3. Seleccionar agentes óptimos basado en aprendizaje
    const context = memory.shortTermMemory.currentContext
    const optimalAgents = reinforcementLearning.getOptimalAgentsForContext(context)
    
    // 4. Ejecutar pipeline adaptativo
    let decisions: DecisionResult[]
    if (pipelineRecommendation.customStages) {
      // Usar pipeline personalizado
      decisions = await this.executeCustomPipeline(
        input,
        pipelineRecommendation.customStages,
        optimalAgents
      )
    } else {
      // Usar agentes óptimos con el orquestador
      decisions = await multiAgentOrchestrator.executeSequentialAgents(input)
    }
    
    // 5. Actualizar memoria con decisiones
    for (const decision of decisions) {
      contextualMemory.updateWithDecision(decision)
      
      // Aplicar aprendizaje por refuerzo
      const learningUpdate = reinforcementLearning.processDecisionResult(decision, context)
      if (learningUpdate) {
        this.emitEvent({
          type: CognitiveEventType.LEARNING_MILESTONE,
          timestamp: Date.now(),
          data: { agentType: learningUpdate.agentType, newPriority: learningUpdate.newPriority },
          impact: 'low',
          requiresAttention: false
        })
      }
    }
    
    // 6. Buscar consenso si hay múltiples decisiones
    let consensusResult = null
    if (decisions.length > 1) {
      consensusResult = await consensusSystem.conductVoting(
        input,
        decisions,
        context
      )
      
      if (consensusResult.consensusReached) {
        this.emitEvent({
          type: CognitiveEventType.CONSENSUS_ACHIEVED,
          timestamp: Date.now(),
          data: { consensus: consensusResult.consensusReached, confidence: consensusResult.confidence },
          impact: 'medium',
          requiresAttention: false
        })
      }
    }
    
    // 7. Actualizar metacognición
    this.updateMetacognition(decisions, consensusResult)
    
    // 8. Generar insights
    const insights = this.generateInsights(decisions, memory)
    
    return {
      decisions,
      consensus: consensusResult,
      memory: {
        context: memory.shortTermMemory.currentContext,
        symptoms: memory.shortTermMemory.activeSymptoms,
        hypotheses: memory.workingMemory.activeHypotheses,
        insights: memory.semanticInsights
      },
      insights
    }
  }

  private async executeCustomPipeline(
    input: string,
    stages: any[],
    preferredAgents: AgentType[]
  ): Promise<DecisionResult[]> {
    const allResults: DecisionResult[] = []
    
    for (const stage of stages) {
      // Filtrar agentes basado en preferencias y disponibilidad
      const stageAgents = stage.agents.filter((agent: AgentType) => 
        preferredAgents.includes(agent)
      )
      
      if (stageAgents.length === 0) continue
      
      // Ejecutar según modo
      let stageResults: DecisionResult[]
      if (stage.executionMode === 'parallel') {
        stageResults = await multiAgentOrchestrator.executeParallelAgents(
          input,
          stageAgents
        )
      } else {
        // Sequential
        stageResults = []
        for (const agent of stageAgents) {
          const result = await multiAgentOrchestrator.executeSingleAgent(agent, input)
          stageResults.push(result)
        }
      }
      
      allResults.push(...stageResults)
    }
    
    return allResults
  }

  // ============= METACOGNICIÓN =============
  private startMetacognition(): void {
    this.metacognitionInterval = setInterval(() => {
      this.performMetacognitiveCycle()
    }, this.config.metacognitionInterval)
  }

  private performMetacognitiveCycle(): void {
    const meta = this.cognitiveSystem.metacognition
    
    // Evaluar confianza del sistema
    const stats = reinforcementLearning.getSystemLearningStats()
    meta.systemConfidence = stats.overallSuccessRate
    
    // Calcular incertidumbre
    const consensusStats = consensusSystem.getConsensusStats()
    meta.uncertaintyLevel = 1 - consensusStats.consensusRate
    
    // Identificar gaps de conocimiento
    meta.knowledgeGaps = this.identifyKnowledgeGaps()
    
    // Actualizar auto-evaluación
    meta.selfAssessment = this.performSelfAssessment()
    
    // Evaluar y actualizar objetivos
    this.updateGoals()
    
    // Calibrar sistema si es necesario
    if (meta.systemConfidence < 0.4 || meta.uncertaintyLevel > 0.7) {
      this.recalibrateSystem()
    }
  }

  private identifyKnowledgeGaps(): string[] {
    const gaps: string[] = []
    const learningStats = reinforcementLearning.getSystemLearningStats()
    
    // Agentes con bajo rendimiento
    for (const agent of learningStats.strugglingAgents) {
      gaps.push(`${agent} agent needs improvement`)
    }
    
    // Contextos con poca experiencia
    const memory = contextualMemory.getMemoryContext()
    const contexts = ['emergency', 'diagnostic', 'treatment', 'routine']
    for (const context of contexts) {
      const episodicMemories = memory.episodicMemory.filter(e => 
        e.event.includes(context)
      )
      if (episodicMemories.length < 5) {
        gaps.push(`Limited experience in ${context} context`)
      }
    }
    
    // Baja confianza en consenso
    const consensusStats = consensusSystem.getConsensusStats()
    if (consensusStats.avgConfidence < 60) {
      gaps.push('Low consensus confidence - agents disagree frequently')
    }
    
    return gaps
  }

  private performSelfAssessment(): SelfAssessment {
    const learningStats = reinforcementLearning.getSystemLearningStats()
    const consensusStats = consensusSystem.getConsensusStats()
    const pipelineStats = adaptivePipeline.getPipelineStats()
    const memoryStats = contextualMemory.getMemoryStats()
    
    const strengths: string[] = []
    const weaknesses: string[] = []
    const improvements: string[] = []
    
    // Evaluar fortalezas
    if (learningStats.overallSuccessRate > 0.8) {
      strengths.push('High overall success rate')
    }
    if (learningStats.avgSystemLatency < 1000) {
      strengths.push('Fast response times')
    }
    if (consensusStats.consensusRate > 0.7) {
      strengths.push('Strong inter-agent agreement')
    }
    if (learningStats.topPerformers.length > 2) {
      strengths.push(`Strong performance from ${learningStats.topPerformers.join(', ')}`)
    }
    
    // Evaluar debilidades
    if (learningStats.strugglingAgents.length > 0) {
      weaknesses.push(`Underperforming agents: ${learningStats.strugglingAgents.join(', ')}`)
    }
    if (pipelineStats.successRate < 0.6) {
      weaknesses.push('Pipeline optimization needed')
    }
    if (memoryStats.hypothesisCount === 0) {
      weaknesses.push('Limited hypothesis generation')
    }
    
    // Identificar áreas de mejora
    if (learningStats.explorationRate < 0.1) {
      improvements.push('Increase exploration for better learning')
    }
    if (consensusStats.activeDebates > 2) {
      improvements.push('Resolve ongoing debates for clarity')
    }
    if (memoryStats.insightCount < 5) {
      improvements.push('Generate more semantic insights')
    }
    
    // Calcular progreso de aprendizaje
    const learningProgress = Math.min(100, 
      (learningStats.totalRewards / 100) * 100
    )
    
    // Calcular tasa de adaptación
    const adaptationRate = 
      (1 - learningStats.explorationRate) * 
      consensusStats.consensusRate
    
    return {
      strengths,
      weaknesses,
      improvementAreas: improvements,
      learningProgress,
      adaptationRate
    }
  }

  private updateGoals(): void {
    const meta = this.cognitiveSystem.metacognition
    
    // Limpiar objetivos completados
    meta.activeGoals = meta.activeGoals.filter(g => g.progress < 100)
    
    // Agregar nuevos objetivos basados en gaps
    for (const gap of meta.knowledgeGaps) {
      const existingGoal = meta.activeGoals.find(g => 
        g.description.includes(gap)
      )
      
      if (!existingGoal) {
        meta.activeGoals.push({
          id: nanoid(),
          description: `Address knowledge gap: ${gap}`,
          priority: gap.includes('emergency') ? 1 : 2,
          progress: 0,
          deadline: Date.now() + 3600000, // 1 hour
          subgoals: []
        })
      }
    }
    
    // Ordenar por prioridad
    meta.activeGoals.sort((a, b) => a.priority - b.priority)
  }

  private recalibrateSystem(): void {
    // Recalibrar aprendizaje
    reinforcementLearning.calibrateSystem()
    
    // Ajustar threshold de consenso si hay mucho desacuerdo
    const consensusStats = consensusSystem.getConsensusStats()
    if (consensusStats.consensusRate < 0.5) {
      consensusSystem.setConsensusThreshold(0.6)
    }
    
    // Optimizar pipeline
    const currentPipeline = adaptivePipeline.getCurrentPipeline()
    const performance: any[] = [] // Would get actual performance metrics
    const optimization = adaptivePipeline.optimizePipeline(currentPipeline, performance)
    
    if (optimization.improvements.length > 0) {
      adaptivePipeline.setCurrentPipeline(optimization.optimizedPipeline)
      
      this.emitEvent({
        type: CognitiveEventType.PIPELINE_ADAPTED,
        timestamp: Date.now(),
        data: { 
          improvementsCount: optimization.improvements.length,
          expectedLatencyGain: optimization.expectedGains.latency
        },
        impact: 'high',
        requiresAttention: true
      })
    }
  }

  private updateMetacognition(
    decisions: DecisionResult[],
    consensusResult: any
  ): void {
    const meta = this.cognitiveSystem.metacognition
    
    // Actualizar confianza basada en resultados recientes
    const avgConfidence = decisions.reduce((sum, d) => 
      sum + (d.success ? d.confidence : 0), 0
    ) / decisions.length
    
    meta.systemConfidence = 
      meta.systemConfidence * 0.7 + (avgConfidence / 100) * 0.3
    
    // Actualizar incertidumbre
    if (consensusResult && !consensusResult.consensusReached) {
      meta.uncertaintyLevel = Math.min(1.0, meta.uncertaintyLevel * 1.1)
    } else {
      meta.uncertaintyLevel = Math.max(0.1, meta.uncertaintyLevel * 0.9)
    }
    
    // Detectar anomalías
    if (avgConfidence < 30 || decisions.every(d => !d.success)) {
      this.emitEvent({
        type: CognitiveEventType.ANOMALY_DETECTED,
        timestamp: Date.now(),
        data: { decisions, reason: 'Low confidence or all failures' },
        impact: 'high',
        requiresAttention: true
      })
    }
  }

  // ============= GENERACIÓN DE INSIGHTS =============
  private generateInsights(decisions: DecisionResult[], memory: any): any {
    const insights = {
      pattern: '',
      recommendation: '',
      confidence: 0,
      learnings: [] as string[]
    }
    
    // Identificar patrones en decisiones
    const successfulAgents = decisions
      .filter(d => d.success)
      .map(d => d.agentType)
    
    if (successfulAgents.length > 0) {
      insights.pattern = `${successfulAgents.join(', ')} agents performed well`
    }
    
    // Generar recomendación basada en contexto
    const context = memory.shortTermMemory.currentContext
    const hypotheses = memory.workingMemory.activeHypotheses
    
    if (hypotheses.length > 0 && hypotheses[0].confidence > 70) {
      insights.recommendation = `Focus on ${hypotheses[0].description} ` +
                                `(${hypotheses[0].confidence}% confidence)`
      insights.confidence = hypotheses[0].confidence
    }
    
    // Extraer aprendizajes
    const recentEpisodes = memory.episodicMemory.slice(0, 5)
    for (const episode of recentEpisodes) {
      insights.learnings.push(...episode.learnings)
    }
    
    // Agregar insights semánticos relevantes
    const semanticInsights = memory.semanticInsights
      .filter((i: any) => i.reliability > 70)
      .map((i: any) => `Pattern: ${i.pattern} (${i.frequency} occurrences)`)
    
    insights.learnings.push(...semanticInsights)
    
    return insights
  }

  // ============= GESTIÓN DE EVENTOS =============
  private emitEvent(event: CognitiveEvent): void {
    const listeners = this.eventListeners.get(event.type) || []
    for (const listener of listeners) {
      listener(event)
    }
    
    // Log eventos de alto impacto
    if (event.impact === 'high' || event.requiresAttention) {
      console.log(`[COGNITIVE EVENT] ${event.type}:`, event.data)
    }
  }

  addEventListener(type: CognitiveEventType, callback: Function): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, [])
    }
    this.eventListeners.get(type)!.push(callback)
  }

  // ============= MÉTODOS DE CONSULTA =============
  getCognitiveState(): {
    confidence: number
    uncertainty: number
    activeGoals: Goal[]
    knowledgeGaps: string[]
    selfAssessment: SelfAssessment
  } {
    const meta = this.cognitiveSystem.metacognition
    return {
      confidence: meta.systemConfidence,
      uncertainty: meta.uncertaintyLevel,
      activeGoals: meta.activeGoals,
      knowledgeGaps: meta.knowledgeGaps,
      selfAssessment: meta.selfAssessment
    }
  }

  getSystemHealth(): {
    memoryHealth: any
    learningHealth: any
    consensusHealth: any
    pipelineHealth: any
    overallHealth: number
  } {
    const memoryStats = contextualMemory.getMemoryStats()
    const learningStats = reinforcementLearning.getSystemLearningStats()
    const consensusStats = consensusSystem.getConsensusStats()
    const pipelineStats = adaptivePipeline.getPipelineStats()
    
    const memoryHealth = {
      load: memoryStats.shortTermLoad,
      insights: memoryStats.insightCount,
      hypotheses: memoryStats.hypothesisCount
    }
    
    const learningHealth = {
      successRate: learningStats.overallSuccessRate,
      exploration: learningStats.explorationRate,
      topPerformers: learningStats.topPerformers.length
    }
    
    const consensusHealth = {
      consensusRate: consensusStats.consensusRate,
      avgConfidence: consensusStats.avgConfidence,
      activeDebates: consensusStats.activeDebates
    }
    
    const pipelineHealth = {
      successRate: pipelineStats.successRate,
      avgLatency: pipelineStats.avgLatency,
      activeAgents: pipelineStats.activeAgents.length
    }
    
    // Calcular salud general
    const overallHealth = (
      learningStats.overallSuccessRate * 0.3 +
      consensusStats.consensusRate * 0.2 +
      pipelineStats.successRate * 0.2 +
      (1 - memoryStats.shortTermLoad) * 0.15 +
      (memoryStats.insightCount > 0 ? 0.15 : 0)
    )
    
    return {
      memoryHealth,
      learningHealth,
      consensusHealth,
      pipelineHealth,
      overallHealth
    }
  }

  // ============= CLEANUP =============
  destroy(): void {
    if (this.metacognitionInterval) {
      clearInterval(this.metacognitionInterval)
    }
    this.eventListeners.clear()
  }
}

// Singleton instance
export const cognitiveOrchestrator = new CognitiveOrchestrator()