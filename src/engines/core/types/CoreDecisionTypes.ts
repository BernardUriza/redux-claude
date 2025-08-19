// src/engines/core/types/CoreDecisionTypes.ts
// Core decision types for the domain-agnostic engine
// Created by Bernard Orozco

import { BaseDecision, BaseDecisionRequest, BaseDecisionResponse } from '../interfaces/IDecisionTypes'

export type DecisionDomain = 'medical' | 'legal' | 'financial' | 'technical' | 'business'

export type ProviderType = 'claude' | 'openai' | 'local' | 'azure' | 'gemini'

export interface CoreDecisionRequest extends BaseDecisionRequest {
  domain: DecisionDomain
  decisionType: string
  provider?: ProviderType
  priority?: number
  retryCount?: number
  parentRequestId?: string
}

export interface CoreDecision extends BaseDecision {
  domain: DecisionDomain
  decisionType: string
  validationResults?: {
    structureValid: boolean
    contentValid: boolean
    errors: string[]
    warnings: string[]
  }
}

export interface CoreDecisionResponse extends BaseDecisionResponse {
  decision: CoreDecision
  provider: ProviderType
  retryCount: number
  validationResults?: {
    structureValid: boolean
    contentValid: boolean
    errors: string[]
    warnings: string[]
  }
}

export interface DecisionEngineConfig {
  defaultProvider: ProviderType
  fallbackProviders: ProviderType[]
  enableValidation: boolean
  enableFallback: boolean
  enableRetry: boolean
  maxRetries: number
  timeout: number
  confidenceThreshold: number
  enableCaching: boolean
  cacheConfig?: {
    ttl: number
    maxSize: number
  }
}

export interface EngineMetrics {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageLatency: number
  averageConfidence: number
  providerUsage: Record<ProviderType, number>
  domainUsage: Record<DecisionDomain, number>
  errorsByType: Record<string, number>
}

export interface StrategyRegistry {
  [domain: string]: {
    strategy: any // Will be typed properly when strategies are implemented
    config: {
      enabled: boolean
      priority: number
      supportedTypes: string[]
    }
  }
}

export interface ProviderRegistry {
  [provider: string]: {
    adapter: any // Will be typed properly when adapters are implemented
    config: {
      enabled: boolean
      priority: number
      healthStatus: 'healthy' | 'degraded' | 'unhealthy'
      lastHealthCheck: number
    }
  }
}