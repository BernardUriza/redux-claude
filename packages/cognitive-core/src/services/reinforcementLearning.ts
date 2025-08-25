// src/services/reinforcementLearning.ts
// Sistema de Aprendizaje por Refuerzo - Bernard Orozco

import {
  ReinforcementLearning,
  PerformanceMetrics,
  RewardHistory,
  LearningUpdate,
} from '../types/cognitive'
import { AgentType, DecisionResult } from '../types/agents'
import { store } from '../store/store'

export class ReinforcementLearningSystem {
  private learning: ReinforcementLearning
  private readonly LEARNING_RATE = 0.1
  private readonly EXPLORATION_RATE = 0.15
  private readonly DECAY_FACTOR = 0.95
  private readonly MAX_PRIORITY = 10
  private readonly MIN_PRIORITY = 1
  private readonly REWARD_HISTORY_LIMIT = 100

  constructor() {
    this.learning = this.initializeLearning()
  }

  private initializeLearning(): ReinforcementLearning {
    const agentTypes = Object.values(AgentType)
    const performance: Record<AgentType, PerformanceMetrics> = {} as any
    const priorities: Record<AgentType, number> = {} as any

    for (const agentType of agentTypes) {
      performance[agentType] = {
        successRate: 0.5,
        avgConfidence: 0.5,
        avgLatency: 1000,
        contextualSuccess: {},
        trend: 'stable',
        adaptedPriority: 5,
        lastCalibration: Date.now(),
      }
      priorities[agentType] = 5 // Start with neutral priority
    }

    return {
      agentPerformance: performance,
      dynamicPriorities: priorities,
      learningRate: this.LEARNING_RATE,
      explorationRate: this.EXPLORATION_RATE,
      rewards: [],
    }
  }

  // ============= PROCESAMIENTO DE RESULTADOS =============
  processDecisionResult(result: DecisionResult, context: string): LearningUpdate | null {
    // Calcular recompensa
    const reward = this.calculateReward(result, context)

    // Registrar en historial
    this.recordReward(result.agentType, result.input, reward, context)

    // Actualizar métricas de rendimiento
    this.updatePerformanceMetrics(result, context)

    // Detectar tendencia
    this.detectTrend(result.agentType)

    // Ajustar prioridad si es necesario
    const update = this.adjustPriority(result.agentType, context)

    // Aplicar decay a exploration rate
    this.learning.explorationRate *= this.DECAY_FACTOR
    this.learning.explorationRate = Math.max(0.05, this.learning.explorationRate)

    return update
  }

  private calculateReward(result: DecisionResult, context: string): number {
    let reward = 0

    // Recompensa base por éxito
    if (result.success) {
      reward = 1.0

      // Bonus por alta confianza
      if (result.confidence > 90) {
        reward += 0.5
      } else if (result.confidence > 80) {
        reward += 0.25
      }

      // Bonus por baja latencia
      if (result.latency < 500) {
        reward += 0.3
      } else if (result.latency < 1000) {
        reward += 0.15
      }

      // Ajuste por contexto
      if (context === 'emergency' && result.agentType === AgentType.TRIAGE) {
        reward *= 1.5 // Triage es crítico en emergencias
      } else if (context === 'diagnostic' && result.agentType === AgentType.DIAGNOSTIC) {
        reward *= 1.3
      }
    } else {
      // Penalización por fallo
      reward = -0.5

      // Penalización adicional en contextos críticos
      if (context === 'emergency') {
        reward *= 2
      }
    }

    return reward
  }

  private recordReward(
    agentType: AgentType,
    action: string,
    reward: number,
    context: string
  ): void {
    const history: RewardHistory = {
      timestamp: Date.now(),
      agentType,
      action,
      reward,
      context,
    }

    this.learning.rewards.unshift(history)

    // Mantener límite de historial
    if (this.learning.rewards.length > this.REWARD_HISTORY_LIMIT) {
      this.learning.rewards.pop()
    }
  }

  private updatePerformanceMetrics(result: DecisionResult, context: string): void {
    const metrics = this.learning.agentPerformance[result.agentType]

    // Actualizar tasa de éxito con media móvil exponencial
    const alpha = 0.2 // Factor de suavizado
    const successValue = result.success ? 1 : 0
    metrics.successRate = alpha * successValue + (1 - alpha) * metrics.successRate

    // Actualizar confianza promedio
    if (result.success) {
      metrics.avgConfidence =
        alpha * (result.confidence / 100) + (1 - alpha) * metrics.avgConfidence
    }

    // Actualizar latencia promedio
    metrics.avgLatency = alpha * result.latency + (1 - alpha) * metrics.avgLatency

    // Actualizar éxito contextual
    if (!metrics.contextualSuccess[context]) {
      metrics.contextualSuccess[context] = 0.5
    }
    metrics.contextualSuccess[context] =
      alpha * successValue + (1 - alpha) * metrics.contextualSuccess[context]

    metrics.lastCalibration = Date.now()
  }

  private detectTrend(agentType: AgentType): void {
    const recentRewards = this.learning.rewards.filter(r => r.agentType === agentType).slice(0, 10)

    if (recentRewards.length < 5) return

    const avgRecent = recentRewards.slice(0, 5).reduce((sum, r) => sum + r.reward, 0) / 5
    const avgPrevious =
      recentRewards.slice(5, 10).reduce((sum, r) => sum + r.reward, 0) /
      Math.min(5, recentRewards.length - 5)

    const metrics = this.learning.agentPerformance[agentType]

    if (avgRecent > avgPrevious * 1.1) {
      metrics.trend = 'improving'
    } else if (avgRecent < avgPrevious * 0.9) {
      metrics.trend = 'declining'
    } else {
      metrics.trend = 'stable'
    }
  }

  private adjustPriority(agentType: AgentType, context: string): LearningUpdate | null {
    const metrics = this.learning.agentPerformance[agentType]
    const currentPriority = this.learning.dynamicPriorities[agentType]

    // Calcular nueva prioridad basada en rendimiento
    let newPriority = currentPriority

    // Factor de éxito
    const successFactor = metrics.successRate

    // Factor de confianza
    const confidenceFactor = metrics.avgConfidence

    // Factor de latencia (invertido - menor latencia = mayor factor)
    const latencyFactor = Math.max(0, 1 - metrics.avgLatency / 5000)

    // Factor contextual
    const contextFactor = metrics.contextualSuccess[context] || 0.5

    // Factor de tendencia
    let trendFactor = 1.0
    if (metrics.trend === 'improving') {
      trendFactor = 1.2
    } else if (metrics.trend === 'declining') {
      trendFactor = 0.8
    }

    // Calcular score compuesto
    const performanceScore =
      successFactor * 0.35 + confidenceFactor * 0.25 + latencyFactor * 0.2 + contextFactor * 0.2

    // Aplicar aprendizaje con exploración
    if (Math.random() < this.learning.explorationRate) {
      // Exploración: ajuste aleatorio
      newPriority += (Math.random() - 0.5) * 2
    } else {
      // Explotación: ajuste basado en rendimiento
      const adjustment = this.learning.learningRate * (performanceScore - 0.5) * trendFactor * 10 // Escalar a rango de prioridad

      newPriority = currentPriority + adjustment
    }

    // Limitar rango
    newPriority = Math.max(this.MIN_PRIORITY, Math.min(this.MAX_PRIORITY, newPriority))

    // Actualizar métricas
    metrics.adaptedPriority = newPriority

    // Solo actualizar si hay cambio significativo
    if (Math.abs(newPriority - currentPriority) > 0.5) {
      this.learning.dynamicPriorities[agentType] = Math.round(newPriority)

      return {
        agentType,
        oldPriority: currentPriority,
        newPriority: Math.round(newPriority),
        reason: this.explainAdjustment(metrics, context),
        confidence: performanceScore,
      }
    }

    return null
  }

  private explainAdjustment(metrics: PerformanceMetrics, context: string): string {
    const reasons: string[] = []

    if (metrics.successRate > 0.8) {
      reasons.push('high success rate')
    } else if (metrics.successRate < 0.3) {
      reasons.push('low success rate')
    }

    if (metrics.trend === 'improving') {
      reasons.push('improving performance')
    } else if (metrics.trend === 'declining') {
      reasons.push('declining performance')
    }

    if (metrics.avgLatency < 500) {
      reasons.push('excellent response time')
    } else if (metrics.avgLatency > 2000) {
      reasons.push('slow response time')
    }

    if (metrics.contextualSuccess[context] > 0.8) {
      reasons.push(`strong in ${context} context`)
    }

    return reasons.join(', ') || 'performance optimization'
  }

  // ============= CONSULTAS Y RECOMENDACIONES =============
  getOptimalAgentsForContext(context: string, maxAgents: number = 3): AgentType[] {
    const agentScores: Array<{ agent: AgentType; score: number }> = []

    for (const [agentType, metrics] of Object.entries(this.learning.agentPerformance)) {
      const agent = agentType as AgentType
      const contextSuccess = metrics.contextualSuccess[context] || metrics.successRate

      // Score compuesto considerando múltiples factores
      const score =
        contextSuccess * 0.4 +
        metrics.avgConfidence * 0.3 +
        (1 - metrics.avgLatency / 5000) * 0.2 +
        (this.learning.dynamicPriorities[agent] / 10) * 0.1

      agentScores.push({ agent, score })
    }

    // Ordenar por score y retornar top N
    return agentScores
      .sort((a, b) => b.score - a.score)
      .slice(0, maxAgents)
      .map(item => item.agent)
  }

  getDynamicPriority(agentType: AgentType): number {
    return this.learning.dynamicPriorities[agentType]
  }

  getPerformanceMetrics(agentType: AgentType): PerformanceMetrics {
    return { ...this.learning.agentPerformance[agentType] }
  }

  getSystemLearningStats(): {
    overallSuccessRate: number
    avgSystemLatency: number
    topPerformers: AgentType[]
    strugglingAgents: AgentType[]
    explorationRate: number
    totalRewards: number
  } {
    const allMetrics = Object.entries(this.learning.agentPerformance)

    const overallSuccess =
      allMetrics.reduce((sum, [, metrics]) => sum + metrics.successRate, 0) / allMetrics.length

    const avgLatency =
      allMetrics.reduce((sum, [, metrics]) => sum + metrics.avgLatency, 0) / allMetrics.length

    const topPerformers = allMetrics
      .filter(([, metrics]) => metrics.successRate > 0.7)
      .map(([agent]) => agent as AgentType)

    const strugglingAgents = allMetrics
      .filter(([, metrics]) => metrics.successRate < 0.3)
      .map(([agent]) => agent as AgentType)

    const totalRewards = this.learning.rewards.reduce((sum, r) => sum + Math.max(0, r.reward), 0)

    return {
      overallSuccessRate: overallSuccess,
      avgSystemLatency: avgLatency,
      topPerformers,
      strugglingAgents,
      explorationRate: this.learning.explorationRate,
      totalRewards,
    }
  }

  // ============= CALIBRACIÓN Y RESET =============
  calibrateSystem(): void {
    // Recalibrar basándose en rendimiento global
    const stats = this.getSystemLearningStats()

    // Si el sistema está funcionando muy bien, reducir exploración
    if (stats.overallSuccessRate > 0.8) {
      this.learning.explorationRate *= 0.5
    }
    // Si está funcionando mal, aumentar exploración
    else if (stats.overallSuccessRate < 0.4) {
      this.learning.explorationRate = Math.min(0.3, this.learning.explorationRate * 1.5)
    }

    // Ajustar learning rate basado en estabilidad
    const stableAgents = Object.values(this.learning.agentPerformance).filter(
      m => m.trend === 'stable'
    ).length
    const totalAgents = Object.keys(this.learning.agentPerformance).length

    if (stableAgents / totalAgents > 0.7) {
      // Sistema estable, reducir tasa de aprendizaje
      this.learning.learningRate *= 0.9
    } else {
      // Sistema inestable, mantener o aumentar ligeramente
      this.learning.learningRate = Math.min(0.2, this.learning.learningRate * 1.05)
    }
  }

  resetLearning(): void {
    this.learning = this.initializeLearning()
  }
}

// Singleton instance
export const reinforcementLearning = new ReinforcementLearningSystem()
