// src/engines/core/interfaces/IProviderAdapter.ts
// Provider adapter interface for different AI providers
// Created by Bernard Orozco

import { BaseDecisionRequest, BaseDecisionResponse } from './IDecisionTypes'

export interface IProviderAdapter {
  /**
   * The provider name (e.g., 'claude', 'openai', 'local')
   */
  readonly name: string

  /**
   * Whether this provider is available/configured
   */
  readonly isAvailable: boolean

  /**
   * Provider-specific configuration
   */
  readonly config: ProviderConfig

  /**
   * Make a decision request to the provider
   */
  makeDecisionRequest(
    systemPrompt: string,
    userPrompt: string,
    request: BaseDecisionRequest
  ): Promise<ProviderResponse>

  /**
   * Check if the provider is healthy/reachable
   */
  healthCheck(): Promise<boolean>

  /**
   * Get provider-specific metadata (model info, capabilities, etc.)
   */
  getProviderMetadata(): ProviderMetadata
}

export interface ProviderConfig {
  apiKey?: string
  baseUrl?: string
  model?: string
  maxTokens?: number
  temperature?: number
  timeout?: number
  retryAttempts?: number
  rateLimitConfig?: {
    requestsPerSecond: number
    requestsPerMinute: number
  }
  customSettings?: Record<string, unknown>
}

export interface ProviderResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  model?: string
  finishReason?: string
  metadata?: Record<string, unknown>
}

export interface ProviderMetadata {
  name: string
  version?: string
  models: string[]
  capabilities: string[]
  limitations: string[]
  costPerToken?: {
    input: number
    output: number
  }
}

export interface ProviderError extends Error {
  code: string
  statusCode?: number
  retryable: boolean
  provider: string
}