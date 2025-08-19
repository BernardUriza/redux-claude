// src/engines/core/interfaces/IDecisionStrategy.ts
// Strategy interface for domain-specific decision logic
// Created by Bernard Orozco

import { BaseDecisionRequest, BaseDecision, ValidationResult, ConfidenceMetrics } from './IDecisionTypes'

export interface IDecisionStrategy<TDecision extends BaseDecision = BaseDecision> {
  /**
   * The domain this strategy handles (e.g., 'medical', 'legal', 'financial')
   */
  readonly domain: string

  /**
   * The decision types this strategy can handle
   */
  readonly supportedDecisionTypes: string[]

  /**
   * Build the system prompt for a specific decision type
   */
  buildSystemPrompt(
    decisionType: string,
    request: BaseDecisionRequest
  ): string

  /**
   * Build the JSON format requirements for the response
   */
  buildJsonFormatRequirements(decisionType: string): string

  /**
   * Validate the structure of a decision response
   */
  validateDecisionStructure(
    decision: any,
    decisionType: string
  ): ValidationResult

  /**
   * Calculate confidence based on the quality of the response
   */
  calculateConfidence(
    decision: TDecision,
    decisionType: string,
    request: BaseDecisionRequest
  ): ConfidenceMetrics

  /**
   * Create a fallback decision when the API fails
   */
  createFallbackDecision(
    decisionType: string,
    request: BaseDecisionRequest
  ): TDecision

  /**
   * Post-process the decision after receiving from provider
   */
  postProcessDecision?(
    decision: TDecision,
    decisionType: string,
    request: BaseDecisionRequest
  ): TDecision

  /**
   * Pre-process the request before sending to provider
   */
  preProcessRequest?(
    request: BaseDecisionRequest,
    decisionType: string
  ): BaseDecisionRequest
}

export interface StrategyConfig {
  enabled: boolean
  maxRetries: number
  timeout: number
  fallbackEnabled: boolean
  confidenceThreshold: number
  customSettings?: Record<string, unknown>
}