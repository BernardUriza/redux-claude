// src/types/agents.ts
// Creado por Bernard Orozco
export enum AgentType {
  DIAGNOSTIC = 'diagnostic',
  VALIDATION = 'validation', 
  DOCUMENTATION = 'documentation',
  TREATMENT = 'treatment',
  TRIAGE = 'triage',
  RESPONSE_QUALITY = 'response_quality'
}

export enum AgentStatus {
  READY = 'ready',
  PROCESSING = 'processing',
  FAILED = 'failed',
  DISABLED = 'disabled'
}

export enum CircuitBreakerState {
  CLOSED = 'closed',
  OPEN = 'open', 
  HALF_OPEN = 'half_open'
}

// Agent-specific decision types
export type DiagnosticDecision = {
  differentials: Array<{
    condition: string
    icd10: string
    probability: number // 0-1
    evidence: string[]
  }>
  tests_recommended: string[]
  red_flags: string[]
  urgency_level: 1 | 2 | 3 | 4 | 5
  next_steps: string[]
}

export type ValidationDecision = {
  valid: boolean
  concerns: string[]
  risk_assessment: {
    level: 'low' | 'moderate' | 'high' | 'critical'
    factors: string[]
  }
  requires_human_review: boolean
  recommendations: string[]
}

export type DocumentationDecision = {
  soap: {
    subjective: string
    objective: string
    assessment: string
    plan: string
  }
  icd10_codes: string[]
  billing_codes: string[]
  follow_up_required: boolean
}

export type TreatmentDecision = {
  medications: Array<{
    drug: string
    dosage: string
    frequency: string
    duration: string
    contraindications: string[]
  }>
  procedures: string[]
  lifestyle_modifications: string[]
  monitoring_plan: string[]
}

export type TriageDecision = {
  acuity_level: 1 | 2 | 3 | 4 | 5 // ESI scale
  disposition: 'immediate' | 'urgent' | 'semi_urgent' | 'standard' | 'non_urgent'
  time_to_physician: string // "immediate", "15min", "1hour", etc
  required_resources: string[]
  warning_signs: string[]
}

export type AgentDecision = 
  | DiagnosticDecision 
  | ValidationDecision 
  | DocumentationDecision 
  | TreatmentDecision 
  | TriageDecision

// Agent registry definition
export type AgentDefinition = {
  id: AgentType
  name: string
  description: string
  systemPrompt: string
  enabled: boolean
  priority: number // 1-5, for execution order
  expectedLatency: number // ms
  timeout: number // ms
  retryCount: number
  color: string // UI color
  icon: string // UI icon
}

// Agent metrics
export type AgentMetrics = {
  totalCalls: number
  successfulCalls: number
  failedCalls: number
  avgLatency: number
  lastCall?: number
  successRate: number
  currentStreak: number // consecutive successes
}

// Circuit breaker config
export type CircuitBreakerConfig = {
  maxFailures: number
  cooldownMs: number
  halfOpenTests: number
  resetTimeoutMs: number
}

// Circuit breaker state
export type AgentCircuitBreaker = {
  state: CircuitBreakerState
  failures: number
  lastFailure?: number
  nextRetry?: number
  halfOpenAttempts: number
  config: CircuitBreakerConfig
}

// Decision request
export type DecisionRequest = {
  id: string
  agentType: AgentType
  input: string
  timestamp: number
  priority: number
  retryCount: number
  parentRequestId?: string // For grouped requests
}

// Decision result
export type DecisionResult = {
  id: string
  requestId: string
  agentType: AgentType
  agentName: string
  input: string
  decision: AgentDecision
  confidence: number
  latency: number
  timestamp: number
  retryCount: number
  success: boolean
  error?: string
}

// Multi-agent session
export type MultiAgentSession = {
  sessionId: string
  activeAgents: AgentType[]
  totalRequests: number
  completedRequests: number
  failedRequests: number
  startTime: number
  lastActivity: number
}