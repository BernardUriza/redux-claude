// src/services/DecisionEngineService.ts
// Service layer for the new decision engine architecture
// Created by Bernard Orozco

import { DecisionEngine } from '../engines/core/DecisionEngine'
import { medicalDecisionStrategy } from '../engines/strategies/medical/MedicalDecisionStrategy'
import { claudeAdapter } from '../engines/providers/ClaudeAdapter'
import { openAIAdapter } from '../engines/providers/OpenAIAdapter'
import { localAdapter } from '../engines/providers/LocalAdapter'
import { 
  CoreDecisionRequest, 
  CoreDecisionResponse, 
  DecisionDomain, 
  ProviderType 
} from '../engines/core/types/CoreDecisionTypes'
import { nanoid } from '@reduxjs/toolkit'

export class DecisionEngineService {
  private engine: DecisionEngine
  private initialized = false

  constructor() {
    this.engine = new DecisionEngine({
      defaultProvider: 'claude',
      fallbackProviders: ['openai', 'local'],
      enableValidation: true,
      enableFallback: true,
      enableRetry: true,
      maxRetries: 2,
      timeout: 30000,
      confidenceThreshold: 0.6,
      enableCaching: false
    })
  }

  /**
   * Initialize the decision engine with strategies and providers
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }

    try {
      // Register medical strategy
      this.engine.registerStrategy('medical', medicalDecisionStrategy, {
        enabled: true,
        priority: 1,
        supportedTypes: ['diagnosis', 'validation', 'treatment', 'triage', 'documentation']
      })

      // Register providers
      this.engine.registerProvider('claude', claudeAdapter, {
        enabled: true,
        priority: 1
      })

      this.engine.registerProvider('openai', openAIAdapter, {
        enabled: true,
        priority: 2
      })

      this.engine.registerProvider('local', localAdapter, {
        enabled: true,
        priority: 3
      })

      // Perform health checks
      await this.engine.healthCheck()

      this.initialized = true
      console.log('Decision Engine Service initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Decision Engine Service:', error)
      throw error
    }
  }

  /**
   * Make a decision using the new architecture
   */
  async makeDecision(
    domain: DecisionDomain,
    decisionType: string,
    input: string,
    options: {
      provider?: ProviderType
      context?: Record<string, unknown>
      previousDecisions?: any[]
      signal?: AbortSignal
      priority?: number
    } = {}
  ): Promise<CoreDecisionResponse> {
    await this.ensureInitialized()

    const request: CoreDecisionRequest = {
      id: nanoid(),
      domain,
      decisionType,
      input,
      provider: options.provider,
      context: options.context,
      previousDecisions: options.previousDecisions,
      signal: options.signal,
      priority: options.priority || 1,
      retryCount: 0
    }

    return this.engine.makeDecision(request)
  }

  /**
   * Get engine metrics
   */
  getMetrics() {
    return this.engine.getMetrics()
  }

  /**
   * Get engine configuration
   */
  getConfig() {
    return this.engine.getConfig()
  }

  /**
   * Update engine configuration
   */
  updateConfig(config: any): void {
    this.engine.updateConfig(config)
  }

  /**
   * Perform health check on all providers
   */
  async healthCheck() {
    await this.ensureInitialized()
    return this.engine.healthCheck()
  }

  /**
   * Clear decision cache
   */
  clearCache(): void {
    this.engine.clearCache()
  }

  /**
   * Register a new strategy (for future domains)
   */
  registerStrategy(domain: DecisionDomain, strategy: any, config: any = {}): void {
    this.engine.registerStrategy(domain, strategy, config)
  }

  /**
   * Register a new provider
   */
  registerProvider(providerType: ProviderType, adapter: any, config: any = {}): void {
    this.engine.registerProvider(providerType, adapter, config)
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize()
    }
  }
}

// Export singleton instance
export const decisionEngineService = new DecisionEngineService()