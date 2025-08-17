// src/types/decisional.ts
// Creado por Bernard Orozco

export enum ProviderType {
  CLAUDE = 'claude',
  OPENAI = 'openai', 
  LOCAL = 'local'
}

export enum DecisionType {
  DIAGNOSIS = 'diagnosis',
  VALIDATION = 'validation'
}

export enum DecisionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  RETRYING = 'retrying'
}

export type DiagnosisDecision = {
  differentials: string[]
  priority: 'low' | 'medium' | 'high' | 'critical'
  tests_needed: string[]
  confidence_factors: string[]
}

export type ValidationDecision = {
  approved: boolean
  flags: string[]
  urgency: 1 | 2 | 3 | 4 | 5
  risk_score: number
}

export type DecisionData = DiagnosisDecision | ValidationDecision

export type DecisionItem = {
  id: string
  provider: ProviderType
  type: DecisionType
  decision: DecisionData
  confidence: number // 0-100
  latency: number // milliseconds
  timestamp: number
  status: DecisionStatus
  retryCount: number
  originalQuery: string
}

export type CircuitBreakerState = {
  isOpen: boolean
  failureCount: number
  lastFailureTime: number
  nextRetryTime: number
}

export type DecisionsState = {
  items: DecisionItem[]
  activeProvider: ProviderType
  loading: boolean
  error: string | null
  totalProcessed: number
  averageConfidence: number
  averageLatency: number
  circuitBreaker: Record<ProviderType, CircuitBreakerState>
}