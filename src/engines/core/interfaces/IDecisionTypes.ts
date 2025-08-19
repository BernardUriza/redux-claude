// src/engines/core/interfaces/IDecisionTypes.ts
// Base decision types for domain-agnostic decision engine
// Created by Bernard Orozco

export interface BaseDecisionRequest {
  id: string
  input: string
  context?: Record<string, unknown>
  previousDecisions?: BaseDecision[]
  signal?: AbortSignal
  metadata?: Record<string, unknown>
}

export interface BaseDecision {
  id: string
  type: string
  confidence: number
  timestamp: number
  reasoning?: string
  metadata?: Record<string, unknown>
}

export interface BaseDecisionResponse {
  decision: BaseDecision
  confidence: number
  latency: number
  provider: string
  success: boolean
  error?: string
  metadata?: Record<string, unknown>
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  confidence: number
}

export interface ConfidenceMetrics {
  baseConfidence: number
  adjustments: Array<{
    factor: string
    adjustment: number
    reason: string
  }>
  finalConfidence: number
}