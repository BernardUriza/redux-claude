// src/decision-engine/domains/financial.ts
// Estrategia del dominio financiero - Bernard Orozco
// EJEMPLO PREPARADO PARA FUTURO

import type { DomainStrategy, BaseDecisionRequest, ValidationResult } from '../core/types'

// Tipos específicos del dominio financiero
export interface InvestmentAnalysis {
  recommendation: 'buy' | 'sell' | 'hold' | 'avoid'
  risk_level: 'low' | 'moderate' | 'high' | 'very_high'
  potential_return: number
  time_horizon: 'short' | 'medium' | 'long'
  key_factors: string[]
  warnings: string[]
}

export interface RiskAssessment {
  overall_risk_score: number // 1-100
  risk_categories: {
    market_risk: number
    credit_risk: number
    liquidity_risk: number
    operational_risk: number
  }
  mitigation_strategies: string[]
  monitoring_requirements: string[]
}

export interface PortfolioRecommendation {
  asset_allocation: {
    stocks: number
    bonds: number
    cash: number
    alternatives: number
  }
  diversification_score: number
  rebalancing_frequency: string
  expected_return: number
  volatility_estimate: number
}

export type FinancialDecision = InvestmentAnalysis | RiskAssessment | PortfolioRecommendation

export class FinancialStrategy implements DomainStrategy<FinancialDecision> {
  readonly domain = 'financial' as const
  readonly supportedTypes = ['investment_analysis', 'risk_assessment', 'portfolio_recommendation']

  buildSystemPrompt(decisionType: string, request: BaseDecisionRequest): string {
    const basePrompt =
      'You are a qualified financial analyst providing professional investment guidance.'

    switch (decisionType) {
      case 'investment_analysis':
        return `${basePrompt}
        
Analyze investment opportunities considering:
- Risk-return profile
- Market conditions
- Financial fundamentals
- Technical indicators
- Regulatory environment`

      case 'risk_assessment':
        return `${basePrompt}
        
Conduct comprehensive risk assessment including:
- Market risk analysis
- Credit risk evaluation
- Liquidity considerations
- Operational risks
- Risk mitigation strategies`

      case 'portfolio_recommendation':
        return `${basePrompt}
        
Develop portfolio recommendations considering:
- Client risk tolerance
- Investment objectives
- Time horizon
- Asset allocation principles
- Diversification strategies`

      default:
        return basePrompt
    }
  }

  buildJsonSchema(decisionType: string): string {
    switch (decisionType) {
      case 'investment_analysis':
        return `{
  "recommendation": "buy|sell|hold|avoid",
  "risk_level": "low|moderate|high|very_high",
  "potential_return": 0.0,
  "time_horizon": "short|medium|long",
  "key_factors": ["factor1", "factor2"],
  "warnings": ["warning1"] or []
}`

      case 'risk_assessment':
        return `{
  "overall_risk_score": 1-100,
  "risk_categories": {
    "market_risk": 1-100,
    "credit_risk": 1-100,
    "liquidity_risk": 1-100,
    "operational_risk": 1-100
  },
  "mitigation_strategies": ["strategy1"],
  "monitoring_requirements": ["requirement1"]
}`

      case 'portfolio_recommendation':
        return `{
  "asset_allocation": {
    "stocks": 0-100,
    "bonds": 0-100,
    "cash": 0-100,
    "alternatives": 0-100
  },
  "diversification_score": 1-100,
  "rebalancing_frequency": "monthly|quarterly|annually",
  "expected_return": 0.0,
  "volatility_estimate": 0.0
}`

      default:
        return '{ "result": "unknown financial decision type" }'
    }
  }

  validateDecision(decision: any, decisionType: string): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Financial-specific validation would go here
    if (decisionType === 'portfolio_recommendation' && decision.asset_allocation) {
      const total = Object.values(decision.asset_allocation).reduce(
        (sum: number, val: any) => sum + val,
        0
      )
      if (Math.abs(total - 100) > 1) {
        warnings.push('Asset allocation should sum to 100%')
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      confidence: 0.8,
    }
  }

  calculateConfidence(decision: FinancialDecision, request: BaseDecisionRequest): number {
    return 75 // Placeholder confidence
  }

  createFallbackDecision(decisionType: string, request: BaseDecisionRequest): FinancialDecision {
    return {
      recommendation: 'hold',
      risk_level: 'moderate',
      potential_return: 0,
      time_horizon: 'medium',
      key_factors: ['Requires detailed financial analysis'],
      warnings: ['Consult with qualified financial advisor'],
    } as InvestmentAnalysis
  }
}
