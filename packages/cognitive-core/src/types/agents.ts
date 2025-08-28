// src/types/agents.ts
// Creado por Bernard Orozco
export enum AgentType {
  DIAGNOSTIC = 'diagnostic',
  VALIDATION = 'validation',
  DOCUMENTATION = 'documentation',
  TREATMENT = 'treatment',
  TRIAGE = 'triage',
  RESPONSE_QUALITY = 'response_quality',
  CLINICAL_PHARMACOLOGY = 'clinical_pharmacology',
  PEDIATRIC_SPECIALIST = 'pediatric_specialist',
  HOSPITALIZATION_CRITERIA = 'hospitalization_criteria',
  FAMILY_EDUCATION = 'family_education',
  OBJECTIVE_VALIDATION = 'objective_validation',
  DEFENSIVE_DIFFERENTIAL = 'defensive_differential',
  MEDICAL_AUTOCOMPLETION = 'medical_autocompletion',
  CRITICAL_DATA_VALIDATION = 'critical_data_validation',
  SPECIALTY_DETECTION = 'specialty_detection',
  INTELLIGENT_MEDICAL_CHAT = 'intelligent_medical_chat',
  MEDICAL_DATA_EXTRACTOR = 'medical_data_extractor',
  MEDICAL_INPUT_VALIDATOR = 'medical_input_validator',
}

export enum AgentStatus {
  READY = 'ready',
  PROCESSING = 'processing',
  FAILED = 'failed',
  DISABLED = 'disabled',
}

export enum CircuitBreakerState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open',
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

export type ClinicalPharmacologyDecision = {
  primary_medication: {
    generic_name: string
    brand_names: string[]
    exact_dose: string
    route: 'oral' | 'iv' | 'im' | 'topical' | 'inhaled' | 'sublingual'
    frequency: string
    duration: string
    line_of_treatment: 'first' | 'second' | 'third'
    evidence_level: 'A' | 'B' | 'C' | 'D'
  }
  alternative_medications: Array<{
    generic_name: string
    exact_dose: string
    indication: string // cuando usar esta alternativa
    line_of_treatment: 'first' | 'second' | 'third'
  }>
  contraindications: string[]
  drug_interactions: string[]
  monitoring_parameters: string[]
  dose_adjustments: {
    renal_impairment?: string
    hepatic_impairment?: string
    elderly?: string
    pediatric_specific?: string
  }
}

export type PediatricSpecialistDecision = {
  age_specific_considerations: string[]
  weight_based_calculations: {
    estimated_weight_kg?: number
    dose_per_kg: string
    max_dose?: string
  }
  developmental_factors: string[]
  pediatric_red_flags: string[]
  growth_development_impact: string[]
}

export type HospitalizationCriteriaDecision = {
  admission_criteria: string[]
  discharge_criteria: string[]
  observation_criteria: string[]
  icu_criteria: string[]
  risk_stratification: {
    low_risk: string[]
    moderate_risk: string[]
    high_risk: string[]
  }
  disposition_recommendation: 'home' | 'observation' | 'admission' | 'icu'
}

export type FamilyEducationDecision = {
  warning_signs: string[]
  when_to_return: string[]
  home_care_instructions: string[]
  medication_education: string[]
  follow_up_instructions: string[]
  emergency_contacts: string[]
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

export type MedicalAutocompletionDecision = {
  suggestions: Array<{
    id: string
    title: string
    description: string
    template: string
    confidence: number
    category: 'basic' | 'detailed' | 'specialized'
  }>
  enhanced_template: string
  detected_specialty?: string
  patient_context: {
    age_inferred?: string
    gender_inferred?: string
    main_complaint?: string
    specialty_indicators?: string[]
  }
}

export type CriticalDataValidationDecision = {
  missing_fields: Array<{
    field: string
    reason: string
    criticality: 'high' | 'medium' | 'low'
    suggested_prompt: string
  }>
  can_proceed: boolean
  completion_percentage: number
  next_required_action: string
  required_form_fields: string[]
}

export type SpecialtyDetectionDecision = {
  detected_specialty: string
  confidence: number
  indicators: string[]
  suggested_form_fields: string[]
  specialized_prompts: string[]
  recommended_tabs: Array<{
    tab_name: string
    priority: number
    fields: string[]
  }>
}

export type IntelligentMedicalChatDecision = {
  message: string
  inferences: Array<{
    id: string
    category: 'demographic' | 'symptom' | 'specialty' | 'urgency' | 'context'
    confidence: number
    inference: string
    evidence: string[]
    needs_confirmation: boolean
  }>
  suggested_actions: string[]
  confidence_level: 'low' | 'medium' | 'high'
  requires_user_input: boolean
  conversation_stage: 'initial' | 'gathering' | 'analyzing' | 'concluding'
}

export type MedicalInputValidatorDecision = {
  is_valid: boolean
  confidence: number
  validation_category: 'valid_medical' | 'invalid_non_medical' | 'unclear_needs_context'
  medical_indicators: string[]
  rejection_reason?: string
  suggested_format?: string
}

export type AgentDecision =
  | DiagnosticDecision
  | ValidationDecision
  | DocumentationDecision
  | TreatmentDecision
  | TriageDecision
  | ClinicalPharmacologyDecision
  | PediatricSpecialistDecision
  | HospitalizationCriteriaDecision
  | FamilyEducationDecision
  | ObjectiveValidationDecision
  | DefensiveDifferentialDecision
  | MedicalAutocompletionDecision
  | CriticalDataValidationDecision
  | SpecialtyDetectionDecision
  | IntelligentMedicalChatDecision
  | MedicalInputValidatorDecision

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
