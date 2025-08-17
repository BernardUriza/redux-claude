// src/types/audit.ts
// Creado por Bernard Orozco
export enum AuditLevel {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
  ERROR = 'error'
}

export enum AuditCategory {
  CLINICAL_REASONING = 'clinical_reasoning',
  SAFETY_CHECK = 'safety_check',
  DECISION_REVIEW = 'decision_review',
  CONTRADICTION = 'contradiction',
  QUALITY_ASSURANCE = 'quality_assurance'
}

export type AuditEntry = {
  id: string
  timestamp: number
  level: AuditLevel
  category: AuditCategory
  decisionId: string
  message: string
  details: {
    originalDecision?: any
    conflictingDecision?: any
    reasoning: string
    recommendations: string[]
    riskFactors: string[]
  }
  metaAnalysis: {
    consistencyScore: number // 0-100
    confidenceChange: number // -100 to +100
    clinicalSoundness: number // 0-100
    followUpRequired: boolean
  }
}

export type SessionAudit = {
  sessionId: string
  startTime: number
  totalDecisions: number
  auditEntries: AuditEntry[]
  overallAssessment: {
    clinicalCoherence: number // 0-100
    safetyScore: number // 0-100
    decisionQuality: number // 0-100
    recommendationLevel: 'safe' | 'review_required' | 'clinical_oversight_needed'
  }
}