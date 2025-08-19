// src/engines/core/DecisionEngine.ts
// Core domain-agnostic decision engine
// Created by Bernard Orozco

import { nanoid } from '@reduxjs/toolkit'
import { IDecisionStrategy } from './interfaces/IDecisionStrategy'
import { IProviderAdapter, ProviderError } from './interfaces/IProviderAdapter'
import { BaseDecision, BaseDecisionRequest, ValidationResult } from './interfaces/IDecisionTypes'
import {
  CoreDecisionRequest,
  CoreDecision,
  CoreDecisionResponse,
  DecisionEngineConfig,
  EngineMetrics,
  StrategyRegistry,
  ProviderRegistry,
  ProviderType,
  DecisionDomain
} from './types/CoreDecisionTypes'

export class DecisionEngine {
  private strategies: StrategyRegistry = {}
  private providers: ProviderRegistry = {}
  private config: DecisionEngineConfig
  private metrics: EngineMetrics
  private cache: Map<string, CoreDecisionResponse> = new Map()

  constructor(config: Partial<DecisionEngineConfig> = {}) {
    this.config = {
      defaultProvider: 'claude',
      fallbackProviders: ['openai', 'local'],
      enableValidation: true,
      enableFallback: true,
      enableRetry: true,
      maxRetries: 2,
      timeout: 30000,
      confidenceThreshold: 0.6,
      enableCaching: false,
      ...config
    }

    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageLatency: 0,
      averageConfidence: 0,
      providerUsage: {} as Record<ProviderType, number>,
      domainUsage: {} as Record<DecisionDomain, number>,
      errorsByType: {}
    }
  }

  /**
   * Register a decision strategy for a specific domain
   */
  registerStrategy<T extends BaseDecision>(
    domain: DecisionDomain,
    strategy: IDecisionStrategy<T>,
    config: { enabled?: boolean; priority?: number; supportedTypes?: string[] } = {}
  ): void {
    this.strategies[domain] = {
      strategy,
      config: {
        enabled: true,
        priority: 1,
        supportedTypes: strategy.supportedDecisionTypes,
        ...config
      }
    }
  }

  /**
   * Register a provider adapter
   */
  registerProvider(
    providerType: ProviderType,
    adapter: IProviderAdapter,
    config: { enabled?: boolean; priority?: number } = {}
  ): void {
    this.providers[providerType] = {
      adapter,
      config: {
        enabled: true,
        priority: 1,
        healthStatus: 'healthy',
        lastHealthCheck: Date.now(),
        ...config
      }
    }
  }

  /**
   * Main method to make a decision
   */
  async makeDecision(request: CoreDecisionRequest): Promise<CoreDecisionResponse> {
    const startTime = Date.now()
    this.metrics.totalRequests++
    this.updateDomainUsage(request.domain)

    try {
      // Check cache first
      if (this.config.enableCaching) {
        const cacheKey = this.generateCacheKey(request)
        const cached = this.cache.get(cacheKey)
        if (cached) {
          return { ...cached, latency: Date.now() - startTime }
        }
      }

      // Get strategy for domain
      const strategyEntry = this.strategies[request.domain]
      if (!strategyEntry || !strategyEntry.config.enabled) {
        throw new Error(`No strategy available for domain: ${request.domain}`)
      }

      const strategy = strategyEntry.strategy

      // Validate decision type is supported
      if (!strategy.supportedDecisionTypes.includes(request.decisionType)) {
        throw new Error(
          `Decision type '${request.decisionType}' not supported by ${request.domain} strategy`
        )
      }

      // Pre-process request if strategy supports it
      const processedRequest = strategy.preProcessRequest
        ? strategy.preProcessRequest(request, request.decisionType)
        : request

      // Execute decision with retries
      const response = await this.executeWithRetries(processedRequest, strategy)

      this.metrics.successfulRequests++
      this.updateMetrics(response)

      // Cache result if enabled
      if (this.config.enableCaching && response.success) {
        const cacheKey = this.generateCacheKey(request)
        this.cache.set(cacheKey, response)
        this.cleanupCache()
      }

      return response

    } catch (error) {
      this.metrics.failedRequests++
      this.updateErrorMetrics(error)

      const errorResponse: CoreDecisionResponse = {
        decision: {} as CoreDecision,
        confidence: 0,
        latency: Date.now() - startTime,
        provider: request.provider || this.config.defaultProvider,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        retryCount: request.retryCount || 0
      }

      return errorResponse
    }
  }

  /**
   * Execute decision with retry logic
   */
  private async executeWithRetries(
    request: CoreDecisionRequest,
    strategy: IDecisionStrategy
  ): Promise<CoreDecisionResponse> {
    let lastError: Error | null = null
    const maxRetries = this.config.enableRetry ? this.config.maxRetries : 0

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const providers = this.getAvailableProviders(request.provider)
        
        for (const providerType of providers) {
          try {
            const response = await this.executeSingleDecision(request, strategy, providerType)
            
            // Check confidence threshold
            if (response.confidence >= this.config.confidenceThreshold) {
              response.retryCount = attempt
              return response
            }
            
            // If confidence is too low but no error, continue with next provider
            lastError = new Error(`Confidence ${response.confidence} below threshold ${this.config.confidenceThreshold}`)
            
          } catch (providerError) {
            lastError = providerError instanceof Error ? providerError : new Error('Provider error')
            // Try next provider
            continue
          }
        }

        // If we get here, all providers failed or didn't meet confidence threshold
        if (attempt < maxRetries) {
          await this.delay(Math.pow(2, attempt) * 1000) // Exponential backoff
        }

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')
      }
    }

    // All retries failed, try fallback if enabled
    if (this.config.enableFallback) {
      return this.createFallbackResponse(request, strategy, lastError)
    }

    throw lastError || new Error('All attempts failed')
  }

  /**
   * Execute a single decision attempt
   */
  private async executeSingleDecision(
    request: CoreDecisionRequest,
    strategy: IDecisionStrategy,
    providerType: ProviderType
  ): Promise<CoreDecisionResponse> {
    const startTime = Date.now()

    // Get provider
    const providerEntry = this.providers[providerType]
    if (!providerEntry || !providerEntry.config.enabled) {
      throw new Error(`Provider ${providerType} not available`)
    }

    const provider = providerEntry.adapter
    this.updateProviderUsage(providerType)

    // Build prompts
    const systemPrompt = strategy.buildSystemPrompt(request.decisionType, request)
    const jsonFormat = strategy.buildJsonFormatRequirements(request.decisionType)
    const fullSystemPrompt = `${systemPrompt}\n\n${jsonFormat}`

    // Make provider request
    const providerResponse = await provider.makeDecisionRequest(
      fullSystemPrompt,
      request.input,
      request
    )

    // Parse and validate response
    let decision: CoreDecision
    try {
      const parsedDecision = JSON.parse(providerResponse.content.trim())
      
      // Add core decision fields
      decision = {
        ...parsedDecision,
        id: nanoid(),
        type: request.decisionType,
        domain: request.domain,
        decisionType: request.decisionType,
        timestamp: Date.now()
      }

      // Validate structure if enabled
      if (this.config.enableValidation) {
        const validation = strategy.validateDecisionStructure(decision, request.decisionType)
        decision.validationResults = {
          structureValid: validation.valid,
          contentValid: validation.valid,
          errors: validation.errors,
          warnings: validation.warnings
        }

        if (!validation.valid && validation.errors.length > 0) {
          throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
        }
      }

    } catch (parseError) {
      throw new Error(`Failed to parse provider response: ${parseError}`)
    }

    // Calculate confidence
    const confidenceMetrics = strategy.calculateConfidence(decision, request.decisionType, request)
    decision.confidence = confidenceMetrics.finalConfidence

    // Post-process if strategy supports it
    if (strategy.postProcessDecision) {
      decision = strategy.postProcessDecision(decision, request.decisionType, request) as CoreDecision
    }

    const latency = Date.now() - startTime

    return {
      decision,
      confidence: decision.confidence,
      latency,
      provider: providerType,
      success: true,
      retryCount: 0,
      validationResults: decision.validationResults
    }
  }

  /**
   * Create fallback response when all attempts fail
   */
  private createFallbackResponse(
    request: CoreDecisionRequest,
    strategy: IDecisionStrategy,
    error: Error | null
  ): CoreDecisionResponse {
    const fallbackDecision = strategy.createFallbackDecision(request.decisionType, request)
    
    const coreDecision: CoreDecision = {
      ...fallbackDecision,
      id: nanoid(),
      domain: request.domain,
      decisionType: request.decisionType,
      timestamp: Date.now(),
      validationResults: {
        structureValid: true,
        contentValid: false,
        errors: ['Fallback decision used'],
        warnings: ['API failure, using fallback logic']
      }
    }

    return {
      decision: coreDecision,
      confidence: 0.3, // Low confidence for fallback
      latency: 0,
      provider: 'local',
      success: false,
      error: error?.message || 'All providers failed',
      retryCount: this.config.maxRetries,
      validationResults: coreDecision.validationResults
    }
  }

  /**
   * Get available providers in priority order
   */
  private getAvailableProviders(preferredProvider?: ProviderType): ProviderType[] {
    const providers: ProviderType[] = []

    // Add preferred provider first if specified and available
    if (preferredProvider && this.providers[preferredProvider]?.config.enabled) {
      providers.push(preferredProvider)
    }

    // Add default provider if not already added
    if (!providers.includes(this.config.defaultProvider) && 
        this.providers[this.config.defaultProvider]?.config.enabled) {
      providers.push(this.config.defaultProvider)
    }

    // Add fallback providers
    for (const fallbackProvider of this.config.fallbackProviders) {
      if (!providers.includes(fallbackProvider) && 
          this.providers[fallbackProvider]?.config.enabled) {
        providers.push(fallbackProvider)
      }
    }

    if (providers.length === 0) {
      throw new Error('No providers available')
    }

    return providers
  }

  /**
   * Utility methods
   */
  private generateCacheKey(request: CoreDecisionRequest): string {
    return `${request.domain}:${request.decisionType}:${JSON.stringify({
      input: request.input,
      context: request.context
    })}`
  }

  private cleanupCache(): void {
    if (!this.config.cacheConfig) return

    if (this.cache.size > this.config.cacheConfig.maxSize) {
      const entries = Array.from(this.cache.entries())
      const toDelete = entries.slice(0, entries.length - this.config.cacheConfig.maxSize)
      toDelete.forEach(([key]) => this.cache.delete(key))
    }
  }

  private updateDomainUsage(domain: DecisionDomain): void {
    this.metrics.domainUsage[domain] = (this.metrics.domainUsage[domain] || 0) + 1
  }

  private updateProviderUsage(provider: ProviderType): void {
    this.metrics.providerUsage[provider] = (this.metrics.providerUsage[provider] || 0) + 1
  }

  private updateMetrics(response: CoreDecisionResponse): void {
    const totalLatency = this.metrics.averageLatency * (this.metrics.successfulRequests - 1) + response.latency
    this.metrics.averageLatency = totalLatency / this.metrics.successfulRequests

    const totalConfidence = this.metrics.averageConfidence * (this.metrics.successfulRequests - 1) + response.confidence
    this.metrics.averageConfidence = totalConfidence / this.metrics.successfulRequests
  }

  private updateErrorMetrics(error: unknown): void {
    const errorType = error instanceof Error && 'code' in error ? (error as any).code : 'unknown'
    this.metrics.errorsByType[errorType] = (this.metrics.errorsByType[errorType] || 0) + 1
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Public API methods
   */
  getMetrics(): EngineMetrics {
    return { ...this.metrics }
  }

  getConfig(): DecisionEngineConfig {
    return { ...this.config }
  }

  updateConfig(newConfig: Partial<DecisionEngineConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  clearCache(): void {
    this.cache.clear()
  }

  async healthCheck(): Promise<Record<ProviderType, boolean>> {
    const results: Record<string, boolean> = {}

    for (const [providerType, providerEntry] of Object.entries(this.providers)) {
      try {
        results[providerType] = await providerEntry.adapter.healthCheck()
        providerEntry.config.healthStatus = results[providerType] ? 'healthy' : 'unhealthy'
      } catch {
        results[providerType] = false
        providerEntry.config.healthStatus = 'unhealthy'
      }
      providerEntry.config.lastHealthCheck = Date.now()
    }

    return results as Record<ProviderType, boolean>
  }
}