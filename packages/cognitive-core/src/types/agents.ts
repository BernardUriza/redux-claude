// src/types/agents.ts
// Creado por Bernard Orozco
export enum AgentType {
  DIAGNOSTIC = 'diagnostic',
  VALIDATION = 'validation', 
  DOCUMENTATION = 'documentation',
  TREATMENT = 'treatment',
  TRIAGE = 'triage',
  RESPONSE_QUALITY = 'response_quality',
  THERAPEUTIC_SPECIFICITY = 'therapeutic_specificity',
  OBJECTIVE_VALIDATION = 'objective_validation',
  DEFENSIVE_DIFFERENTIAL = 'defensive_differential'
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

export type TherapeuticSpecificityDecision = {
  specific_medications: Array<{
    generic_name: string
    brand_names: string[]
    exact_dose: string // e.g., "80-90 mg/kg/día"
    route: 'oral' | 'iv' | 'im' | 'topical' | 'inhaled' | 'sublingual'
    frequency: string // e.g., "cada 8 horas"
    duration: string // e.g., "7 días"
    pediatric_dose?: string
    geriatric_considerations?: string[]
    contraindications: string[]
    monitoring_required: string[]
  }>
  hospitalization_criteria: string[]
  ambulatory_management: string[]
  warning_signs_for_parents: string[]
  symptomatic_management: Array<{
    symptom: string
    medication: string
    dose: string
  }>
}

export type ObjectiveValidationDecision = {
  missing_critical_data: string[]
  vital_signs_assessment: {
    saturation_required: boolean
    respiratory_rate_needed: boolean
    blood_pressure_concern: boolean
    temperature_monitoring: boolean
  }
  physical_exam_gaps: string[]
  recommended_studies: Array<{
    study: string
    urgency: 'immediate' | '24h' | '48h' | 'routine'
    justification: string
  }>
  confidence_impact: number // 0-1, how missing data affects confidence
}

export type DefensiveDifferentialDecision = {
  must_exclude_diagnoses: Array<{
    condition: string
    gravity_score: number // 1-10
    exclusion_criteria: string[]
    required_tests: string[]
    time_sensitivity: 'immediate' | 'urgent' | 'semi-urgent'
  }>
  gravity_vs_probability: Array<{
    diagnosis: string
    probability: number
    gravity: number
    defensive_priority: number // calculated priority for defensive medicine
  }>
  red_flags_analysis: {
    critical_signs: string[]
    concerning_patterns: string[]
    age_specific_concerns: string[]
  }
  disposition_recommendation: 'emergency' | 'urgent_clinic' | 'routine_followup' | 'home_care'
}

export type AgentDecision = 
  | DiagnosticDecision 
  | ValidationDecision 
  | DocumentationDecision 
  | TreatmentDecision 
  | TriageDecision
  | TherapeuticSpecificityDecision
  | ObjectiveValidationDecision
  | DefensiveDifferentialDecision

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