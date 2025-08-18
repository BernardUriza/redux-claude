// src/services/adaptivePipeline.ts
// Sistema de Pipeline Adaptativo - Bernard Orozco

import {
  AdaptivePipeline,
  PipelineStage,
  PipelineTemplate,
  PipelineRecommendation,
  ContextAnalyzer,
  PerformanceOptimizer,
  OptimizationResult,
  ExecutionCondition,
  ContextualMemory,
  PerformanceMetrics
} from '@/types/cognitive'
import { AgentType, DecisionResult } from '@/types/agents'
import { nanoid } from '@reduxjs/toolkit'
import { reinforcementLearning } from './reinforcementLearning'
import { contextualMemory } from './contextualMemory'

export class AdaptivePipelineSystem implements ContextAnalyzer, PerformanceOptimizer {
  private pipeline: AdaptivePipeline
  private executionHistory: Map<string, DecisionResult[]> = new Map()

  constructor() {
    this.pipeline = this.initializePipeline()
  }

  private initializePipeline(): AdaptivePipeline {
    return {
      currentPipeline: this.createDefaultPipeline(),
      pipelineTemplates: this.createPipelineTemplates(),
      contextAnalyzer: this,
      performanceOptimizer: this
    }
  }

  private createDefaultPipeline(): PipelineStage[] {
    return [
      {
        stageId: 'triage',
        agents: [AgentType.TRIAGE],
        executionMode: 'parallel',
        timeout: 5000,
        required: true
      },
      {
        stageId: 'diagnosis',
        agents: [AgentType.DIAGNOSTIC],
        executionMode: 'parallel',
        timeout: 8000,
        required: true
      },
      {
        stageId: 'validation',
        agents: [AgentType.VALIDATION],
        executionMode: 'parallel',
        conditions: [
          {
            type: 'confidence',
            operator: 'lt',
            value: 80,
            action: 'include'
          }
        ],
        timeout: 6000,
        required: false
      }
    ]
  }

  private createPipelineTemplates(): Record<string, PipelineTemplate> {
    return {
      emergency: {
        name: 'Emergency Response Pipeline',
        description: 'Optimized for critical, time-sensitive situations',
        context: ['emergency', 'critical', 'urgent'],
        stages: [
          {
            stageId: 'rapid-triage',
            agents: [AgentType.TRIAGE],
            executionMode: 'parallel',
            timeout: 2000,
            required: true
          },
          {
            stageId: 'parallel-assessment',
            agents: [AgentType.DIAGNOSTIC, AgentType.VALIDATION],
            executionMode: 'parallel',
            timeout: 5000,
            required: true
          },
          {
            stageId: 'immediate-treatment',
            agents: [AgentType.TREATMENT],
            executionMode: 'sequential',
            timeout: 3000,
            required: true
          }
        ],
        expectedLatency: 10000,
        successRate: 0.85
      },

      diagnostic: {
        name: 'Comprehensive Diagnostic Pipeline',
        description: 'Thorough analysis for complex cases',
        context: ['diagnostic', 'complex', 'differential'],
        stages: [
          {
            stageId: 'initial-assessment',
            agents: [AgentType.TRIAGE],
            executionMode: 'sequential',
            timeout: 5000,
            required: true
          },
          {
            stageId: 'deep-diagnosis',
            agents: [AgentType.DIAGNOSTIC],
            executionMode: 'sequential',
            timeout: 10000,
            required: true
          },
          {
            stageId: 'cross-validation',
            agents: [AgentType.VALIDATION],
            executionMode: 'sequential',
            timeout: 8000,
            required: true
          },
          {
            stageId: 'treatment-planning',
            agents: [AgentType.TREATMENT],
            executionMode: 'sequential',
            conditions: [
              {
                type: 'previous_result',
                operator: 'eq',
                value: 'validated',
                action: 'include'
              }
            ],
            timeout: 7000,
            required: false
          },
          {
            stageId: 'documentation',
            agents: [AgentType.DOCUMENTATION],
            executionMode: 'sequential',
            timeout: 10000,
            required: false,
            conditions: [
              {
                type: 'confidence',
                operator: 'gt',
                value: 70,
                action: 'include'
              }
            ]
          }
        ],
        expectedLatency: 40000,
        successRate: 0.92
      },

      routine: {
        name: 'Routine Check Pipeline',
        description: 'Efficient pipeline for standard consultations',
        context: ['routine', 'checkup', 'follow-up'],
        stages: [
          {
            stageId: 'basic-triage',
            agents: [AgentType.TRIAGE],
            executionMode: 'sequential',
            timeout: 5000,
            required: false
          },
          {
            stageId: 'standard-diagnosis',
            agents: [AgentType.DIAGNOSTIC],
            executionMode: 'sequential',
            timeout: 8000,
            required: true
          },
          {
            stageId: 'documentation',
            agents: [AgentType.DOCUMENTATION],
            executionMode: 'sequential',
            timeout: 10000,
            required: false
          }
        ],
        expectedLatency: 23000,
        successRate: 0.88
      },

      treatment: {
        name: 'Treatment Focus Pipeline',
        description: 'Optimized for treatment planning and validation',
        context: ['treatment', 'medication', 'therapy'],
        stages: [
          {
            stageId: 'treatment-planning',
            agents: [AgentType.TREATMENT],
            executionMode: 'sequential',
            timeout: 7000,
            required: true
          },
          {
            stageId: 'safety-validation',
            agents: [AgentType.VALIDATION],
            executionMode: 'sequential',
            timeout: 6000,
            required: true
          },
          {
            stageId: 'documentation',
            agents: [AgentType.DOCUMENTATION],
            executionMode: 'sequential',
            timeout: 10000,
            required: false
          }
        ],
        expectedLatency: 23000,
        successRate: 0.90
      },

      consensus: {
        name: 'Multi-Agent Consensus Pipeline',
        description: 'Complex cases requiring multiple opinions',
        context: ['complex', 'uncertain', 'second-opinion'],
        stages: [
          {
            stageId: 'initial-triage',
            agents: [AgentType.TRIAGE],
            executionMode: 'sequential',
            timeout: 5000,
            required: true
          },
          {
            stageId: 'parallel-diagnosis',
            agents: [AgentType.DIAGNOSTIC, AgentType.VALIDATION],
            executionMode: 'parallel',
            timeout: 10000,
            required: true
          },
          {
            stageId: 'consensus-treatment',
            agents: [AgentType.TREATMENT],
            executionMode: 'sequential',
            conditions: [
              {
                type: 'confidence',
                operator: 'gt',
                value: 60,
                action: 'include'
              }
            ],
            timeout: 8000,
            required: false
          }
        ],
        expectedLatency: 23000,
        successRate: 0.95
      }
    }
  }

  // ============= ANÁLISIS DE CONTEXTO =============
  analyze(input: string, memory: ContextualMemory): PipelineRecommendation {
    const context = memory.shortTermMemory.currentContext
    const symptoms = memory.shortTermMemory.activeSymptoms
    const hypotheses = memory.workingMemory.activeHypotheses

    // Analizar urgencia
    const urgencyScore = this.calculateUrgencyScore(input, symptoms)
    
    // Analizar complejidad
    const complexityScore = this.calculateComplexityScore(symptoms, hypotheses)
    
    // Analizar confianza necesaria
    const confidenceRequirement = this.calculateConfidenceRequirement(context, urgencyScore)

    // Seleccionar template más apropiado
    let recommendedTemplate = 'routine'
    let confidence = 0.5
    const reasoning: string[] = []

    if (urgencyScore > 0.8) {
      recommendedTemplate = 'emergency'
      confidence = 0.9
      reasoning.push('High urgency detected - emergency pipeline recommended')
    } else if (complexityScore > 0.7) {
      recommendedTemplate = hypotheses.length > 2 ? 'consensus' : 'diagnostic'
      confidence = 0.85
      reasoning.push('Complex case - comprehensive analysis needed')
    } else if (context === 'treatment') {
      recommendedTemplate = 'treatment'
      confidence = 0.8
      reasoning.push('Treatment focus detected')
    } else if (context === 'diagnostic' && symptoms.length > 3) {
      recommendedTemplate = 'diagnostic'
      confidence = 0.75
      reasoning.push('Multiple symptoms require thorough diagnosis')
    }

    // Considerar rendimiento histórico
    const performanceAdjustment = this.adjustForHistoricalPerformance(recommendedTemplate)
    if (performanceAdjustment.shouldChange) {
      reasoning.push(performanceAdjustment.reason)
      recommendedTemplate = performanceAdjustment.newTemplate
      confidence *= 0.9
    }

    // Generar stages personalizados si es necesario
    const customStages = this.generateCustomStages(
      recommendedTemplate,
      urgencyScore,
      complexityScore,
      confidenceRequirement
    )

    return {
      recommendedTemplate,
      confidence,
      reasoning: reasoning.join('. '),
      alternativeTemplates: this.getAlternativeTemplates(recommendedTemplate),
      customStages: customStages.length > 0 ? customStages : undefined
    }
  }

  private calculateUrgencyScore(input: string, symptoms: string[]): number {
    let score = 0
    const urgentKeywords = [
      'emergency', 'urgent', 'severe', 'critical',
      'chest pain', 'difficulty breathing', 'unconscious',
      'bleeding', 'stroke', 'heart attack'
    ]

    const inputLower = input.toLowerCase()
    for (const keyword of urgentKeywords) {
      if (inputLower.includes(keyword)) {
        score += 0.3
      }
    }

    // Check symptoms
    for (const symptom of symptoms) {
      if (urgentKeywords.some(k => symptom.includes(k))) {
        score += 0.2
      }
    }

    return Math.min(1.0, score)
  }

  private calculateComplexityScore(symptoms: string[], hypotheses: any[]): number {
    let score = 0

    // More symptoms = more complex
    score += Math.min(0.4, symptoms.length * 0.1)

    // Multiple hypotheses = more complex
    score += Math.min(0.3, hypotheses.length * 0.15)

    // Low confidence hypotheses = more complex
    if (hypotheses.length > 0) {
      const avgConfidence = hypotheses.reduce((sum, h) => sum + h.confidence, 0) / hypotheses.length
      if (avgConfidence < 70) {
        score += 0.3
      }
    }

    return Math.min(1.0, score)
  }

  private calculateConfidenceRequirement(context: string, urgencyScore: number): number {
    if (context === 'emergency' || urgencyScore > 0.8) {
      return 0.6 // Lower confidence acceptable in emergencies
    }
    if (context === 'treatment') {
      return 0.8 // High confidence needed for treatment
    }
    return 0.7 // Default
  }

  private adjustForHistoricalPerformance(template: string): {
    shouldChange: boolean
    newTemplate: string
    reason: string
  } {
    const templatePerformance = this.getTemplatePerformance(template)
    
    if (templatePerformance.successRate < 0.5) {
      // Template performing poorly, suggest alternative
      const alternatives = this.getAlternativeTemplates(template)
      const bestAlternative = alternatives.find(alt => 
        this.getTemplatePerformance(alt).successRate > templatePerformance.successRate
      )

      if (bestAlternative) {
        return {
          shouldChange: true,
          newTemplate: bestAlternative,
          reason: `Historical performance suggests ${bestAlternative} pipeline is more effective`
        }
      }
    }

    return {
      shouldChange: false,
      newTemplate: template,
      reason: ''
    }
  }

  private getTemplatePerformance(templateName: string): {
    successRate: number
    avgLatency: number
  } {
    // In real implementation, would track actual performance
    const template = this.pipeline.pipelineTemplates[templateName]
    if (template) {
      return {
        successRate: template.successRate,
        avgLatency: template.expectedLatency
      }
    }
    return { successRate: 0.5, avgLatency: 10000 }
  }

  private generateCustomStages(
    baseTemplate: string,
    urgencyScore: number,
    complexityScore: number,
    confidenceRequirement: number
  ): PipelineStage[] {
    const customStages: PipelineStage[] = []
    const template = this.pipeline.pipelineTemplates[baseTemplate]
    
    if (!template) return []

    // Clone base stages
    const stages = [...template.stages]

    // Adjust based on urgency
    if (urgencyScore > 0.9) {
      // Reduce timeouts for emergency
      stages.forEach(stage => {
        stage.timeout = Math.floor(stage.timeout * 0.5)
        stage.executionMode = 'parallel' // Force parallel for speed
      })
    }

    // Add validation if complexity is high
    if (complexityScore > 0.8 && !stages.some(s => s.agents.includes(AgentType.VALIDATION))) {
      customStages.push({
        stageId: 'additional-validation',
        agents: [AgentType.VALIDATION],
        executionMode: 'sequential',
        timeout: 6000,
        required: true
      })
    }

    // Adjust confidence conditions
    stages.forEach(stage => {
      if (stage.conditions) {
        stage.conditions.forEach(condition => {
          if (condition.type === 'confidence') {
            condition.value = confidenceRequirement * 100
          }
        })
      }
    })

    return customStages.length > 0 ? customStages : stages
  }

  private getAlternativeTemplates(primary: string): string[] {
    const alternatives = Object.keys(this.pipeline.pipelineTemplates)
      .filter(t => t !== primary)
    
    // Sort by similarity to primary
    return alternatives.slice(0, 3)
  }

  // ============= OPTIMIZACIÓN DE RENDIMIENTO =============
  optimizePipeline(
    current: PipelineStage[],
    performance: PerformanceMetrics[]
  ): OptimizationResult {
    const optimized = [...current]
    const improvements: string[] = []
    let expectedLatencyGain = 0
    let expectedAccuracyGain = 0

    // Analizar rendimiento de cada agente
    for (const stage of optimized) {
      for (const agentType of stage.agents) {
        const agentPerf = reinforcementLearning.getPerformanceMetrics(agentType)
        
        // Remover agentes con bajo rendimiento
        if (agentPerf.successRate < 0.3 && !stage.required) {
          stage.agents = stage.agents.filter(a => a !== agentType)
          improvements.push(`Removed underperforming ${agentType} agent`)
          expectedAccuracyGain += 0.05
        }
        
        // Ajustar timeouts basado en latencia real
        if (agentPerf.avgLatency < stage.timeout * 0.5) {
          const oldTimeout = stage.timeout
          stage.timeout = Math.ceil(agentPerf.avgLatency * 1.5)
          expectedLatencyGain += oldTimeout - stage.timeout
          improvements.push(`Optimized ${agentType} timeout from ${oldTimeout}ms to ${stage.timeout}ms`)
        }
      }
    }

    // Cambiar modo de ejecución si es beneficioso
    for (const stage of optimized) {
      if (stage.agents.length > 1 && stage.executionMode === 'sequential') {
        const canParallelize = stage.agents.every(agent => {
          const perf = reinforcementLearning.getPerformanceMetrics(agent)
          return perf.successRate > 0.7
        })
        
        if (canParallelize) {
          stage.executionMode = 'parallel'
          improvements.push(`Changed ${stage.stageId} to parallel execution`)
          expectedLatencyGain += stage.timeout * 0.4
        }
      }
    }

    // Reordenar stages por prioridad adaptativa
    optimized.sort((a, b) => {
      const aPriority = a.agents.reduce((sum, agent) => 
        sum + reinforcementLearning.getDynamicPriority(agent), 0
      ) / a.agents.length
      
      const bPriority = b.agents.reduce((sum, agent) => 
        sum + reinforcementLearning.getDynamicPriority(agent), 0
      ) / b.agents.length
      
      return bPriority - aPriority
    })

    if (optimized[0].stageId !== current[0].stageId) {
      improvements.push('Reordered pipeline stages based on agent performance')
    }

    return {
      optimizedPipeline: optimized,
      improvements,
      expectedGains: {
        latency: expectedLatencyGain,
        accuracy: expectedAccuracyGain,
        cost: -expectedLatencyGain * 0.001 // Rough cost estimate
      }
    }
  }

  // ============= EJECUCIÓN Y EVALUACIÓN =============
  async executePipeline(
    input: string,
    pipelineOverride?: PipelineStage[]
  ): Promise<DecisionResult[]> {
    const pipeline = pipelineOverride || this.pipeline.currentPipeline
    const results: DecisionResult[] = []
    const sessionId = nanoid()

    for (const stage of pipeline) {
      // Evaluar condiciones
      if (stage.conditions && !this.evaluateConditions(stage.conditions, results)) {
        continue // Skip stage
      }

      // Ejecutar agentes del stage
      const stageResults = await this.executeStage(stage, input, sessionId)
      results.push(...stageResults)

      // Si es requerido y falló, detener pipeline
      if (stage.required && stageResults.every(r => !r.success)) {
        break
      }
    }

    // Guardar en historial
    this.executionHistory.set(sessionId, results)

    return results
  }

  private evaluateConditions(
    conditions: ExecutionCondition[],
    previousResults: DecisionResult[]
  ): boolean {
    for (const condition of conditions) {
      let conditionMet = false

      switch (condition.type) {
        case 'confidence':
          const avgConfidence = previousResults.reduce((sum, r) => 
            sum + r.confidence, 0
          ) / (previousResults.length || 1)
          
          conditionMet = this.compareValue(avgConfidence, condition.operator, condition.value)
          break

        case 'previous_result':
          // Check if previous results match condition
          conditionMet = previousResults.some(r => 
            this.compareValue(r.success, condition.operator, condition.value)
          )
          break

        case 'context':
          const context = contextualMemory.getMemoryContext().shortTermMemory.currentContext
          conditionMet = this.compareValue(context, condition.operator, condition.value)
          break

        case 'time_constraint':
          // Check if within time constraint
          conditionMet = true // Simplified
          break
      }

      // Apply action based on condition result
      if (condition.action === 'skip' && conditionMet) return false
      if (condition.action === 'include' && !conditionMet) return false
    }

    return true
  }

  private compareValue(actual: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'gt': return actual > expected
      case 'lt': return actual < expected
      case 'eq': return actual === expected
      case 'contains': return String(actual).includes(String(expected))
      case 'matches': return new RegExp(expected).test(String(actual))
      default: return false
    }
  }

  private async executeStage(
    stage: PipelineStage,
    input: string,
    sessionId: string
  ): Promise<DecisionResult[]> {
    // This would integrate with multiAgentOrchestrator
    // Simplified mock implementation
    const results: DecisionResult[] = []
    
    for (const agentType of stage.agents) {
      results.push({
        id: nanoid(),
        requestId: sessionId,
        agentType,
        agentName: agentType,
        input,
        decision: {} as any,
        confidence: Math.random() * 100,
        latency: Math.random() * stage.timeout,
        timestamp: Date.now(),
        retryCount: 0,
        success: Math.random() > 0.2
      })
    }

    return results
  }

  // ============= MÉTODOS DE CONSULTA =============
  getCurrentPipeline(): PipelineStage[] {
    return [...this.pipeline.currentPipeline]
  }

  setCurrentPipeline(pipeline: PipelineStage[]): void {
    this.pipeline.currentPipeline = pipeline
  }

  getAvailableTemplates(): string[] {
    return Object.keys(this.pipeline.pipelineTemplates)
  }

  getTemplate(name: string): PipelineTemplate | undefined {
    return this.pipeline.pipelineTemplates[name]
  }

  getPipelineStats(): {
    currentTemplate: string
    avgLatency: number
    successRate: number
    stageCount: number
    activeAgents: AgentType[]
  } {
    const currentStages = this.pipeline.currentPipeline
    const activeAgents = [...new Set(currentStages.flatMap(s => s.agents))]
    
    // Calculate average metrics
    let totalLatency = 0
    let totalSuccess = 0
    let count = 0

    for (const [, results] of this.executionHistory) {
      for (const result of results) {
        totalLatency += result.latency
        totalSuccess += result.success ? 1 : 0
        count++
      }
    }

    return {
      currentTemplate: 'custom', // Would track actual template
      avgLatency: count > 0 ? totalLatency / count : 0,
      successRate: count > 0 ? totalSuccess / count : 0,
      stageCount: currentStages.length,
      activeAgents
    }
  }

  reset(): void {
    this.pipeline = this.initializePipeline()
    this.executionHistory.clear()
  }
}

// Singleton instance
export const adaptivePipeline = new AdaptivePipelineSystem()