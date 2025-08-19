// src/engines/strategies/financial/FinancialTypes.ts
// Financial domain decision types - EXAMPLE for future expansion
// Created by Bernard Orozco

import { BaseDecision } from '../../core/interfaces/IDecisionTypes'

export type FinancialDecisionType = 'investment_analysis' | 'risk_assessment' | 'portfolio_review' | 'credit_evaluation' | 'fraud_detection'

export interface FinancialDecision extends BaseDecision {
  domain: 'financial'
  decisionType: FinancialDecisionType
}

export interface InvestmentAnalysisDecision extends FinancialDecision {
  decisionType: 'investment_analysis'
  investment_recommendation: 'buy' | 'sell' | 'hold' | 'avoid'
  target_price: number
  risk_rating: 'conservative' | 'moderate' | 'aggressive' | 'speculative'
  key_metrics: {
    pe_ratio?: number
    debt_to_equity?: number
    return_on_equity?: number
    profit_margin?: number
  }
  pros: string[]
  cons: string[]
  time_horizon: 'short' | 'medium' | 'long'
}

export interface RiskAssessmentDecision extends FinancialDecision {
  decisionType: 'risk_assessment'
  risk_score: number // 1-100
  risk_factors: Array<{
    factor: string
    impact: 'low' | 'medium' | 'high'
    probability: number // 0-1
    mitigation: string
  }>
  overall_risk: 'low' | 'medium' | 'high' | 'critical'
  recommended_actions: string[]
}

export interface PortfolioReviewDecision extends FinancialDecision {
  decisionType: 'portfolio_review'
  current_allocation: Record<string, number>
  recommended_allocation: Record<string, number>
  rebalancing_actions: Array<{
    action: 'buy' | 'sell' | 'hold'
    asset: string
    amount: number
    reason: string
  }>
  expected_return: number
  risk_level: number
}

export interface CreditEvaluationDecision extends FinancialDecision {
  decisionType: 'credit_evaluation'
  credit_decision: 'approve' | 'deny' | 'conditional'
  credit_score: number
  risk_factors: string[]
  conditions: string[]
  recommended_terms: {
    interest_rate?: number
    loan_amount?: number
    term_length?: number
    collateral_required?: boolean
  }
}

export interface FraudDetectionDecision extends FinancialDecision {
  decisionType: 'fraud_detection'
  fraud_probability: number // 0-1
  risk_indicators: Array<{
    indicator: string
    severity: 'low' | 'medium' | 'high'
    description: string
  }>
  recommended_action: 'approve' | 'review' | 'block' | 'investigate'
  confidence_level: number
}

export type FinancialDecisionUnion = 
  | InvestmentAnalysisDecision 
  | RiskAssessmentDecision 
  | PortfolioReviewDecision 
  | CreditEvaluationDecision 
  | FraudDetectionDecision