// src/services/consensusSystem.ts
// Sistema de Consenso Multi-Agente - Bernard Orozco

import {
  ConsensusSystem,
  VotingRound,
  AgentVote,
  Debate,
  Argument
} from '../types/cognitive'
import { AgentType, DecisionResult } from '../types/agents'
import { nanoid } from '@reduxjs/toolkit'
import { reinforcementLearning } from './reinforcementLearning'

export class MultiAgentConsensusSystem {
  private consensus: ConsensusSystem
  private readonly DEFAULT_CONSENSUS_THRESHOLD = 0.7
  private readonly MAX_DEBATE_ROUNDS = 5

  constructor() {
    this.consensus = this.initializeConsensus()
  }

  private initializeConsensus(): ConsensusSystem {
    return {
      votingRounds: [],
      consensusThreshold: this.DEFAULT_CONSENSUS_THRESHOLD,
      conflictResolution: 'weighted',
      activeDebates: []
    }
  }

  // ============= VOTACIÓN Y CONSENSO =============
  async conductVoting(
    question: string,
    decisions: DecisionResult[],
    context: string
  ): Promise<VotingRound> {
    const votingRound: VotingRound = {
      id: nanoid(),
      question,
      participants: [],
      consensusReached: false,
      confidence: 0,
      timestamp: Date.now()
    }

    // Convertir decisiones en votos
    for (const decision of decisions) {
      const vote = this.createVote(decision, context)
      votingRound.participants.push(vote)
    }

    // Calcular consenso
    const consensusResult = this.calculateConsensus(votingRound.participants)
    votingRound.consensusReached = consensusResult.reached
    votingRound.confidence = consensusResult.confidence
    votingRound.finalDecision = consensusResult.decision

    // Si no hay consenso, iniciar debate
    if (!votingRound.consensusReached && decisions.length > 1) {
      const debate = this.initiateDebate(question, decisions)
      this.consensus.activeDebates.push(debate)
      
      // Resolver debate
      const resolution = await this.resolveDebate(debate, decisions)
      if (resolution) {
        votingRound.finalDecision = resolution.decision
        votingRound.confidence = resolution.confidence
        votingRound.consensusReached = true
      }
    }

    // Registrar ronda de votación
    this.consensus.votingRounds.push(votingRound)

    return votingRound
  }

  private createVote(decision: DecisionResult, context: string): AgentVote {
    // Obtener peso basado en rendimiento del agente
    const performance = reinforcementLearning.getPerformanceMetrics(decision.agentType)
    const contextualSuccess = performance.contextualSuccess[context] || performance.successRate
    
    // Calcular peso del voto
    const weight = this.calculateVoteWeight(
      decision.confidence,
      contextualSuccess,
      performance.trend
    )

    return {
      agentType: decision.agentType,
      vote: decision, // Pass the full DecisionResult as vote
      confidence: decision.confidence,
      reasoning: this.extractReasoning(decision),
      weight
    }
  }

  private calculateVoteWeight(
    confidence: number,
    historicalSuccess: number,
    trend: 'improving' | 'stable' | 'declining'
  ): number {
    let weight = 1.0

    // Factor de confianza (0.3 - 1.5)
    weight *= (confidence / 100) * 1.5

    // Factor de éxito histórico (0.5 - 1.5)
    weight *= 0.5 + historicalSuccess

    // Factor de tendencia
    if (trend === 'improving') {
      weight *= 1.2
    } else if (trend === 'declining') {
      weight *= 0.8
    }

    return Math.min(3.0, Math.max(0.1, weight))
  }

  private extractReasoning(decision: DecisionResult): string {
    // Extraer razonamiento basado en el tipo de decisión
    const decisionData = decision.decision as any
    
    if (decision.agentType === AgentType.DIAGNOSTIC && decisionData.differentials) {
      return `Primary diagnosis: ${decisionData.differentials[0]?.condition || 'Unknown'} ` +
             `with ${decisionData.differentials[0]?.probability * 100 || 0}% probability`
    }
    
    if (decision.agentType === AgentType.TRIAGE && decisionData.acuity_level) {
      return `Acuity level ${decisionData.acuity_level} - ${decisionData.disposition}`
    }
    
    if (decision.agentType === AgentType.VALIDATION) {
      return decisionData.valid ? 
        'Decision validated - safe to proceed' : 
        `Concerns identified: ${decisionData.concerns?.join(', ') || 'Unknown'}`
    }

    return 'Decision based on clinical analysis'
  }

  private calculateConsensus(votes: AgentVote[]): {
    reached: boolean
    confidence: number
    decision: any
  } {
    if (votes.length === 0) {
      return { reached: false, confidence: 0, decision: null }
    }

    if (votes.length === 1) {
      return { 
        reached: true, 
        confidence: votes[0].confidence, 
        decision: votes[0].vote 
      }
    }

    // Agrupar votos similares
    const voteGroups = this.groupSimilarVotes(votes)
    
    // Calcular peso total de cada grupo
    const groupWeights = voteGroups.map(group => ({
      group,
      totalWeight: group.reduce((sum, vote) => sum + vote.weight, 0),
      avgConfidence: group.reduce((sum, vote) => sum + vote.confidence, 0) / group.length
    }))

    // Ordenar por peso total
    groupWeights.sort((a, b) => b.totalWeight - a.totalWeight)

    // Verificar si el grupo dominante alcanza el threshold
    const totalWeight = groupWeights.reduce((sum, g) => sum + g.totalWeight, 0)
    const dominantGroup = groupWeights[0]
    const dominantRatio = dominantGroup.totalWeight / totalWeight

    if (dominantRatio >= this.consensus.consensusThreshold) {
      // Consenso alcanzado
      return {
        reached: true,
        confidence: Math.round(dominantGroup.avgConfidence * dominantRatio),
        decision: this.mergeVotes(dominantGroup.group)
      }
    }

    // No hay consenso claro
    return {
      reached: false,
      confidence: Math.round(dominantGroup.avgConfidence * dominantRatio),
      decision: this.mergeVotes(dominantGroup.group)
    }
  }

  private groupSimilarVotes(votes: AgentVote[]): AgentVote[][] {
    const groups: AgentVote[][] = []

    for (const vote of votes) {
      let addedToGroup = false

      for (const group of groups) {
        if (this.votesAreSimilar(vote, group[0])) {
          group.push(vote)
          addedToGroup = true
          break
        }
      }

      if (!addedToGroup) {
        groups.push([vote])
      }
    }

    return groups
  }

  private votesAreSimilar(vote1: AgentVote, vote2: AgentVote): boolean {
    // Comparación simplificada - en producción sería más sofisticada
    const v1 = vote1.vote as any
    const v2 = vote2.vote as any

    // Para diagnósticos
    if (v1.differentials && v2.differentials) {
      const primary1 = v1.differentials[0]?.condition
      const primary2 = v2.differentials[0]?.condition
      return primary1 === primary2
    }

    // Para triage
    if (v1.acuity_level !== undefined && v2.acuity_level !== undefined) {
      return Math.abs(v1.acuity_level - v2.acuity_level) <= 1
    }

    // Para validación
    if (v1.valid !== undefined && v2.valid !== undefined) {
      return v1.valid === v2.valid
    }

    return false
  }

  private mergeVotes(votes: AgentVote[]): any {
    if (votes.length === 0) return null
    if (votes.length === 1) return votes[0].vote

    // Fusionar decisiones del mismo tipo
    const primaryVote = votes[0].vote as any
    const mergedDecision = { ...primaryVote }

    // Ejemplo de fusión para diagnósticos
    if (primaryVote.differentials) {
      const allDifferentials = votes.flatMap((v: any) => 
        (v.vote.differentials || [])
      )
      
      // Agrupar y promediar probabilidades
      const differentialMap = new Map()
      for (const diff of allDifferentials) {
        if (differentialMap.has(diff.condition)) {
          const existing = differentialMap.get(diff.condition)
          existing.probability = (existing.probability + diff.probability) / 2
          existing.evidence = [...new Set([...existing.evidence, ...diff.evidence])]
        } else {
          differentialMap.set(diff.condition, { ...diff })
        }
      }

      mergedDecision.differentials = Array.from(differentialMap.values())
        .sort((a, b) => b.probability - a.probability)
        .slice(0, 5)
    }

    return mergedDecision
  }

  // ============= SISTEMA DE DEBATE =============
  private initiateDebate(question: string, decisions: DecisionResult[]): Debate {
    const participants = [...new Set(decisions.map(d => d.agentType))]
    
    return {
      id: nanoid(),
      topic: question,
      initiator: participants[0],
      participants,
      arguments: [],
      status: 'open',
      resolution: undefined
    }
  }

  private async resolveDebate(
    debate: Debate, 
    decisions: DecisionResult[]
  ): Promise<{ decision: any; confidence: number } | null> {
    let rounds = 0
    let resolution = null

    while (rounds < this.MAX_DEBATE_ROUNDS && debate.status === 'open') {
      rounds++

      // Generar argumentos para cada participante
      for (const decision of decisions) {
        const argument = this.generateArgument(decision, debate)
        debate.arguments.push(argument)
      }

      // Evaluar argumentos y buscar convergencia
      const evaluation = this.evaluateArguments(debate.arguments)
      
      if (evaluation.convergenceReached) {
        debate.status = 'resolved'
        debate.resolution = evaluation.resolution
        resolution = {
          decision: evaluation.finalDecision,
          confidence: evaluation.confidence
        }
        break
      }

      // Si no hay convergencia, refinar argumentos
      this.refineArguments(debate, decisions)
    }

    // Si se agotan las rondas sin consenso, usar resolución por defecto
    if (!resolution) {
      debate.status = 'escalated'
      resolution = this.defaultResolution(decisions)
    }

    return resolution
  }

  private generateArgument(decision: DecisionResult, debate: Debate): Argument {
    const strength = this.calculateArgumentStrength(decision)
    const position = this.determinePosition(decision, debate)

    return {
      agentType: decision.agentType,
      position,
      statement: this.formulateStatement(decision, position),
      evidence: this.extractEvidence(decision),
      strength
    }
  }

  private calculateArgumentStrength(decision: DecisionResult): number {
    const performance = reinforcementLearning.getPerformanceMetrics(decision.agentType)
    
    return (
      (decision.confidence / 100) * 0.4 +
      performance.successRate * 0.3 +
      (1 - decision.latency / 5000) * 0.2 +
      (performance.trend === 'improving' ? 0.1 : 0)
    )
  }

  private determinePosition(
    decision: DecisionResult, 
    debate: Debate
  ): 'support' | 'oppose' | 'neutral' {
    // Simplificado - determinar posición basada en confianza
    if (decision.confidence > 80) return 'support'
    if (decision.confidence < 50) return 'oppose'
    return 'neutral'
  }

  private formulateStatement(
    decision: DecisionResult, 
    position: 'support' | 'oppose' | 'neutral'
  ): string {
    const agentName = decision.agentType.charAt(0).toUpperCase() + 
                     decision.agentType.slice(1)
    
    if (position === 'support') {
      return `${agentName} strongly supports this decision with ${decision.confidence}% confidence`
    } else if (position === 'oppose') {
      return `${agentName} has concerns about this approach (confidence: ${decision.confidence}%)`
    } else {
      return `${agentName} requires more information to form a definitive position`
    }
  }

  private extractEvidence(decision: DecisionResult): string[] {
    const evidence: string[] = []
    const data = decision.decision as any

    if (data.differentials) {
      evidence.push(`Differential diagnoses identified: ${data.differentials.length}`)
    }
    if (data.red_flags) {
      evidence.push(`Red flags: ${data.red_flags.join(', ')}`)
    }
    if (data.tests_recommended) {
      evidence.push(`Recommended tests: ${data.tests_recommended.join(', ')}`)
    }

    return evidence
  }

  private evaluateArguments(argumentsList: Argument[]): {
    convergenceReached: boolean
    resolution?: string
    finalDecision?: any
    confidence: number
  } {
    const supportCount = argumentsList.filter(a => a.position === 'support').length
    const totalCount = argumentsList.length
    const supportRatio = supportCount / totalCount

    const avgStrength = argumentsList.reduce((sum, a) => sum + a.strength, 0) / totalCount

    if (supportRatio >= this.consensus.consensusThreshold) {
      // Convergencia alcanzada
      const strongestSupporter = argumentsList
        .filter(a => a.position === 'support')
        .sort((a, b) => b.strength - a.strength)[0]

      return {
        convergenceReached: true,
        resolution: `Consensus reached through deliberation`,
        finalDecision: {}, // Would extract from strongest supporter
        confidence: Math.round(avgStrength * 100)
      }
    }

    return {
      convergenceReached: false,
      confidence: Math.round(avgStrength * 100)
    }
  }

  private refineArguments(debate: Debate, decisions: DecisionResult[]): void {
    // Refinar argumentos basándose en el debate actual
    // En una implementación real, esto involucraría re-consultar a los agentes
    // con el contexto del debate
  }

  private defaultResolution(decisions: DecisionResult[]): {
    decision: any
    confidence: number
  } {
    // Resolución por defecto: usar la decisión con mayor confianza ponderada
    const weightedDecisions = decisions.map(d => {
      const performance = reinforcementLearning.getPerformanceMetrics(d.agentType)
      return {
        decision: d,
        weightedConfidence: d.confidence * performance.successRate
      }
    })

    weightedDecisions.sort((a, b) => b.weightedConfidence - a.weightedConfidence)
    
    return {
      decision: weightedDecisions[0].decision.decision,
      confidence: Math.round(weightedDecisions[0].weightedConfidence)
    }
  }

  // ============= MÉTODOS DE CONSULTA =============
  getConsensusHistory(): VotingRound[] {
    return [...this.consensus.votingRounds]
  }

  getActiveDebates(): Debate[] {
    return this.consensus.activeDebates.filter(d => d.status === 'open')
  }

  getConsensusStats(): {
    totalVotingRounds: number
    consensusRate: number
    avgConfidence: number
    activeDebates: number
    conflictResolutionMethod: string
  } {
    const rounds = this.consensus.votingRounds
    const consensusReached = rounds.filter(r => r.consensusReached).length
    const avgConfidence = rounds.reduce((sum, r) => sum + r.confidence, 0) / 
                         (rounds.length || 1)

    return {
      totalVotingRounds: rounds.length,
      consensusRate: rounds.length > 0 ? consensusReached / rounds.length : 0,
      avgConfidence,
      activeDebates: this.getActiveDebates().length,
      conflictResolutionMethod: this.consensus.conflictResolution
    }
  }

  // ============= CONFIGURACIÓN =============
  setConsensusThreshold(threshold: number): void {
    this.consensus.consensusThreshold = Math.max(0.5, Math.min(1.0, threshold))
  }

  setConflictResolution(
    method: 'majority' | 'weighted' | 'expert' | 'hierarchical'
  ): void {
    this.consensus.conflictResolution = method
  }

  reset(): void {
    this.consensus = this.initializeConsensus()
  }
}

// Singleton instance
export const consensusSystem = new MultiAgentConsensusSystem()