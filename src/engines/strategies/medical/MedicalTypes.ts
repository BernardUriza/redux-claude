// src/engines/strategies/medical/MedicalTypes.ts
// Medical domain decision types
// Created by Bernard Orozco

import { BaseDecision } from '../../core/interfaces/IDecisionTypes'

export type MedicalDecisionType = 'diagnosis' | 'validation' | 'treatment' | 'triage' | 'documentation'

export interface MedicalDecision extends BaseDecision {
  domain: 'medical'
  decisionType: MedicalDecisionType
}

export interface DiagnosticDecision extends MedicalDecision {
  decisionType: 'diagnosis'
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

export interface ValidationDecision extends MedicalDecision {
  decisionType: 'validation'
  valid: boolean
  concerns: string[]
  risk_assessment: {
    level: 'low' | 'moderate' | 'high' | 'critical'
    factors: string[]
  }
  requires_human_review: boolean
  recommendations: string[]
}

export interface TreatmentDecision extends MedicalDecision {
  decisionType: 'treatment'
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

export interface TriageDecision extends MedicalDecision {
  decisionType: 'triage'
  acuity_level: 1 | 2 | 3 | 4 | 5 // ESI scale
  disposition: 'immediate' | 'urgent' | 'semi_urgent' | 'standard' | 'non_urgent'
  time_to_physician: string // "immediate", "15min", "1hour", etc
  required_resources: string[]
  warning_signs: string[]
}

export interface DocumentationDecision extends MedicalDecision {
  decisionType: 'documentation'
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

export type MedicalDecisionUnion = 
  | DiagnosticDecision 
  | ValidationDecision 
  | TreatmentDecision 
  | TriageDecision 
  | DocumentationDecision