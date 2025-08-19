// src/decision-engine/core/types.ts
// Tipos base para el Decision Engine híbrido - Bernard Orozco

export type Domain = 'medical' | 'legal' | 'financial' | 'psychology' | 'technical'
export type Provider = 'claude' | 'openai' | 'local'

export interface BaseDecisionRequest {
  id: string
  domain: Domain
  decisionType: string
  input: string
  context?: Record<string, unknown>
  previousDecisions?: any[]
}

export interface BaseDecision {
  [key: string]: unknown
}

export interface DecisionResponse<TDecision = BaseDecision> {
  success: boolean
  decision: TDecision
  confidence: number
  latency: number
  provider: Provider
  error?: string
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  confidence: number
}

export interface DomainStrategy<TDecision = BaseDecision> {
  readonly domain: Domain
  readonly supportedTypes: string[]
  
  buildSystemPrompt(decisionType: string, request: BaseDecisionRequest): string
  buildJsonSchema(decisionType: string): string
  validateDecision(decision: any, decisionType: string): ValidationResult
  calculateConfidence(decision: TDecision, request: BaseDecisionRequest): number
  createFallbackDecision(decisionType: string, request: BaseDecisionRequest): TDecision
}

export interface ProviderAdapter {
  readonly name: Provider
  readonly isAvailable: boolean
  
  makeRequest(systemPrompt: string, userPrompt: string, signal?: AbortSignal): Promise<{
    content: string
    success: boolean
    error?: string
  }>
  
  healthCheck(): Promise<boolean>
}

export interface DecisionEngineConfig {
  defaultProvider: Provider
  fallbackProviders: Provider[]
  timeout: number
  maxRetries: number
  enableValidation: boolean
}