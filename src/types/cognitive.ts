// src/types/cognitive.ts
// Sistema Cognitivo Avanzado - Bernard Orozco

import { AgentType, AgentDecision, DecisionResult } from './agents'

// ============= MEMORIA CONTEXTUAL =============
export interface ContextualMemory {
  sessionId: string
  shortTermMemory: ShortTermMemory
  workingMemory: WorkingMemory
  episodicMemory: EpisodicMemory[]
  semanticInsights: SemanticInsight[]
  lastUpdated: number
}

export interface ShortTermMemory {
  recentInputs: string[]
  recentDecisions: DecisionResult[]
  activeSymptoms: string[]
  currentContext: 'diagnostic' | 'treatment' | 'emergency' | 'routine'
  patientProfile?: PatientContext
}

export interface WorkingMemory {
  currentGoal: string
  activeHypotheses: Hypothesis[]
  pendingValidations: string[]
  confidenceThreshold: number
}

export interface EpisodicMemory {
  timestamp: number
  event: string
  agentsInvolved: AgentType[]
  outcome: 'success' | 'failure' | 'partial'
  learnings: string[]
}

export interface SemanticInsight {
  pattern: string
  frequency: number
  reliability: number
  associatedAgents: AgentType[]
}

export interface PatientContext {
  age?: number
  gender?: string
  allergies: string[]
  medications: string[]
  history: string[]
  vitals?: VitalSigns
}

export interface VitalSigns {
  heartRate?: number
  bloodPressure?: string
  temperature?: number
  respiratoryRate?: number
  oxygenSaturation?: number
}

export interface Hypothesis {
  id: string
  description: string
  confidence: number
  supportingEvidence: string[]
  contradictingEvidence: string[]
  suggestedAgents: AgentType[]
}

// ============= APRENDIZAJE POR REFUERZO =============
export interface ReinforcementLearning {
  agentPerformance: Record<AgentType, PerformanceMetrics>
  dynamicPriorities: Record<AgentType, number>
  learningRate: number
  explorationRate: number
  rewards: RewardHistory[]
}

export interface PerformanceMetrics {
  successRate: number
  avgConfidence: number
  avgLatency: number
  contextualSuccess: Record<string, number> // success rate by context type
  trend: 'improving' | 'stable' | 'declining'
  adaptedPriority: number
  lastCalibration: number
}

export interface RewardHistory {
  timestamp: number
  agentType: AgentType
  action: string
  reward: number
  context: string
}

export interface LearningUpdate {
  agentType: AgentType
  oldPriority: number
  newPriority: number
  reason: string
  confidence: number
}

// ============= CONSENSO MULTI-AGENTE =============
export interface ConsensusSystem {
  votingRounds: VotingRound[]
  consensusThreshold: number
  conflictResolution: 'majority' | 'weighted' | 'expert' | 'hierarchical'
  activeDebates: Debate[]
}

export interface VotingRound {
  id: string
  question: string
  participants: AgentVote[]
  consensusReached: boolean
  finalDecision?: DecisionResult
  confidence: number
  timestamp: number
}

export interface AgentVote {
  agentType: AgentType
  vote: DecisionResult
  confidence: number
  reasoning: string
  weight: number // based on agent expertise and past performance
}

export interface Debate {
  id: string
  topic: string
  initiator: AgentType
  participants: AgentType[]
  arguments: Argument[]
  status: 'open' | 'resolved' | 'escalated'
  resolution?: string
}

export interface Argument {
  agentType: AgentType
  position: 'support' | 'oppose' | 'neutral'
  statement: string
  evidence: string[]
  strength: number
}

// ============= PIPELINE ADAPTATIVO =============
export interface AdaptivePipeline {
  currentPipeline: PipelineStage[]
  pipelineTemplates: Record<string, PipelineTemplate>
  contextAnalyzer: ContextAnalyzer
  performanceOptimizer: PerformanceOptimizer
}

export interface PipelineStage {
  stageId: string
  agents: AgentType[]
  executionMode: 'parallel' | 'sequential' | 'conditional'
  conditions?: ExecutionCondition[]
  timeout: number
  required: boolean
  fallbackAgents?: AgentType[]
}

export interface PipelineTemplate {
  name: string
  description: string
  context: string[]
  stages: PipelineStage[]
  expectedLatency: number
  successRate: number
}

export interface ContextAnalyzer {
  analyze(input: string, memory: ContextualMemory): PipelineRecommendation
}

export interface PipelineRecommendation {
  recommendedTemplate: string
  confidence: number
  reasoning: string
  alternativeTemplates: string[]
  customStages?: PipelineStage[]
}

export interface PerformanceOptimizer {
  optimizePipeline(
    current: PipelineStage[], 
    performance: PerformanceMetrics[]
  ): OptimizationResult
}

export interface OptimizationResult {
  optimizedPipeline: PipelineStage[]
  improvements: string[]
  expectedGains: {
    latency: number
    accuracy: number
    cost: number
  }
}

export interface ExecutionCondition {
  type: 'confidence' | 'context' | 'previous_result' | 'time_constraint'
  operator: 'gt' | 'lt' | 'eq' | 'contains' | 'matches'
  value: string | number | boolean
  action: 'skip' | 'include' | 'replace'
}

// ============= SISTEMA COGNITIVO INTEGRADO =============
export interface CognitiveSystem {
  memory: ContextualMemory
  learning: ReinforcementLearning
  consensus: ConsensusSystem
  pipeline: AdaptivePipeline
  metacognition: Metacognition
}

export interface Metacognition {
  systemConfidence: number
  uncertaintyLevel: number
  knowledgeGaps: string[]
  activeGoals: Goal[]
  selfAssessment: SelfAssessment
}

export interface Goal {
  id: string
  description: string
  priority: number
  progress: number
  deadline?: number
  subgoals: Goal[]
}

export interface SelfAssessment {
  strengths: string[]
  weaknesses: string[]
  improvementAreas: string[]
  learningProgress: number
  adaptationRate: number
}

// ============= EVENTOS DEL SISTEMA =============
export interface CognitiveEvent {
  type: CognitiveEventType
  timestamp: number
  data: Record<string, unknown>
  impact: 'low' | 'medium' | 'high'
  requiresAttention: boolean
}

export enum CognitiveEventType {
  MEMORY_UPDATED = 'memory_updated',
  LEARNING_MILESTONE = 'learning_milestone',
  CONSENSUS_ACHIEVED = 'consensus_achieved',
  PIPELINE_ADAPTED = 'pipeline_adapted',
  ANOMALY_DETECTED = 'anomaly_detected',
  CONFIDENCE_THRESHOLD_CROSSED = 'confidence_threshold_crossed',
  KNOWLEDGE_GAP_IDENTIFIED = 'knowledge_gap_identified'
}

// ============= MEDICAL DECISION INTERFACES =============
export interface MedicalConsensus {
  finalDecision: MedicalDecision
  confidence: number
  agentsInvolved: AgentType[]
  votingHistory: AgentVote[]
  reasoning: string[]
}

export interface MedicalDecision {
  diagnosis?: DiagnosticDecision
  triage?: TriageDecision
  validation?: ValidationDecision
  treatment?: TreatmentDecision
  documentation?: DocumentationDecision
}

export interface DiagnosticDecision {
  primaryDiagnosis: string
  differentials: Differential[]
  confidence: number
  supportingEvidence: string[]
}

export interface Differential {
  diagnosis: string
  probability: number
  reasoning: string[]
}

export interface TriageDecision {
  priority: 'critical' | 'urgent' | 'standard' | 'low'
  recommendedTimeframe: string
  reasoningFactors: string[]
}

export interface ValidationDecision {
  validationResults: ValidationResult[]
  overallConfidence: number
  flaggedConcerns: string[]
}

export interface ValidationResult {
  aspect: string
  status: 'validated' | 'needs_review' | 'invalid'
  confidence: number
  reasoning: string
}

export interface TreatmentDecision {
  primaryTreatment: TreatmentPlan
  alternativePlans: TreatmentPlan[]
  contraindications: string[]
}

export interface TreatmentPlan {
  medications: Medication[]
  procedures: string[]
  followUpInstructions: string[]
  expectedOutcome: string
}

export interface Medication {
  name: string
  dosage: string
  frequency: string
  duration: string
  instructions: string[]
}

export interface DocumentationDecision {
  summary: string
  keyFindings: string[]
  recommendations: string[]
  followUpRequired: boolean
}

export interface CognitiveInsights {
  pattern: string
  recommendation: string
  confidence: number
  learnings: string[]
}

// ============= CONFIGURACIÓN COGNITIVA =============
export interface CognitiveConfig {
  memoryRetentionMs: number
  learningRate: number
  explorationVsExploitation: number
  consensusThreshold: number
  adaptationSensitivity: number
  metacognitionInterval: number
  maxDebateRounds: number
  confidenceDecayRate: number
}