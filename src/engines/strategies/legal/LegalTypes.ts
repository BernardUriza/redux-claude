// src/engines/strategies/legal/LegalTypes.ts
// Legal domain decision types - EXAMPLE for future expansion
// Created by Bernard Orozco

import { BaseDecision } from '../../core/interfaces/IDecisionTypes'

export type LegalDecisionType = 'contract_review' | 'compliance_check' | 'risk_assessment' | 'document_analysis' | 'legal_research'

export interface LegalDecision extends BaseDecision {
  domain: 'legal'
  decisionType: LegalDecisionType
}

export interface ContractReviewDecision extends LegalDecision {
  decisionType: 'contract_review'
  key_terms: Array<{
    term: string
    description: string
    risk_level: 'low' | 'medium' | 'high'
    recommendation: string
  }>
  risk_factors: string[]
  compliance_issues: string[]
  recommendations: string[]
  requires_attorney_review: boolean
}

export interface ComplianceCheckDecision extends LegalDecision {
  decisionType: 'compliance_check'
  regulations: Array<{
    regulation: string
    status: 'compliant' | 'non_compliant' | 'needs_review'
    issues: string[]
    recommendations: string[]
  }>
  overall_compliance: 'compliant' | 'partial' | 'non_compliant'
  priority_actions: string[]
}

export interface RiskAssessmentDecision extends LegalDecision {
  decisionType: 'risk_assessment'
  risk_categories: Array<{
    category: string
    level: 'low' | 'medium' | 'high' | 'critical'
    description: string
    mitigation_strategies: string[]
  }>
  overall_risk: 'low' | 'medium' | 'high' | 'critical'
  immediate_actions: string[]
}

export interface DocumentAnalysisDecision extends LegalDecision {
  decisionType: 'document_analysis'
  document_type: string
  key_findings: string[]
  legal_issues: string[]
  recommendations: string[]
  confidence_level: number
}

export interface LegalResearchDecision extends LegalDecision {
  decisionType: 'legal_research'
  research_findings: Array<{
    topic: string
    summary: string
    relevant_cases: string[]
    statutes: string[]
    implications: string[]
  }>
  conclusion: string
  further_research_needed: boolean
}

export type LegalDecisionUnion = 
  | ContractReviewDecision 
  | ComplianceCheckDecision 
  | RiskAssessmentDecision 
  | DocumentAnalysisDecision 
  | LegalResearchDecision