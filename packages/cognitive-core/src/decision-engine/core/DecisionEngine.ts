// src/decision-engine/core/DecisionEngine.ts
// Motor de decisiones híbrido - Bernard Orozco

import { nanoid } from '@reduxjs/toolkit'
import type {
  Domain,
  Provider,
  BaseDecisionRequest,
  DecisionResponse,
  DomainStrategy,
  ProviderAdapter,
  DecisionEngineConfig
} from './types'

export class DecisionEngine {
  private strategies = new Map<Domain, DomainStrategy>()
  private providers = new Map<Provider, ProviderAdapter>()
  private config: DecisionEngineConfig

  constructor(config: Partial<DecisionEngineConfig> = {}) {
    this.config = {
      defaultProvider: 'claude',
      fallbackProviders: ['claude'],
      timeout: 30000,
      maxRetries: 2,
      enableValidation: true,
      ...config
    }
  }

  registerStrategy(domain: Domain, strategy: DomainStrategy): void {
    this.strategies.set(domain, strategy)
  }

  registerProvider(provider: Provider, adapter: ProviderAdapter): void {
    this.providers.set(provider, adapter)
  }

  async makeDecision<TDecision = any>(
    domain: Domain,
    decisionType: string,
    input: string,
    options: {
      provider?: Provider
      context?: Record<string, unknown>
      previousDecisions?: any[]
      signal?: AbortSignal
    } = {}
  ): Promise<DecisionResponse<TDecision>> {
    const startTime = Date.now()
    const requestId = nanoid()

    const request: BaseDecisionRequest = {
      id: requestId,
      domain,
      decisionType,
      input,
      context: options.context,
      previousDecisions: options.previousDecisions
    }

    try {
      // 1. Get domain strategy
      const strategy = this.strategies.get(domain)
      if (!strategy) {
        throw new Error(`No strategy registered for domain: ${domain}`)
      }

      if (!strategy.supportedTypes.includes(decisionType)) {
        throw new Error(`Decision type '${decisionType}' not supported by ${domain} domain`)
      }

      // 2. Build prompts
      const systemPrompt = strategy.buildSystemPrompt(decisionType, request)
      const jsonSchema = strategy.buildJsonSchema(decisionType)
      const userPrompt = `${input}\n\nRespond with ONLY a JSON object following this schema:\n${jsonSchema}`

      // 3. Get provider (with fallback)
      const targetProvider = options.provider || this.config.defaultProvider
      const providersToTry = [targetProvider, ...this.config.fallbackProviders.filter(p => p !== targetProvider)]

      let lastError: Error | null = null

      for (const providerName of providersToTry) {
        const provider = this.providers.get(providerName)
        if (!provider || !provider.isAvailable) {
          continue
        }

        try {
          // 4. Make API call
          const response = await this.callProviderWithRetry(
            provider,
            systemPrompt,
            userPrompt,
            options.signal
          )

          if (!response.success) {
            throw new Error(response.error || 'Provider call failed')
          }

          // 5. Parse and validate response
          const decision = this.parseDecisionResponse(response.content)
          
          if (this.config.enableValidation) {
            const validation = strategy.validateDecision(decision, decisionType)
            if (!validation.valid && validation.errors.length > 0) {
              console.warn(`Validation warnings for ${domain}/${decisionType}:`, validation.warnings)
            }
          }

          // 6. Calculate confidence
          const confidence = strategy.calculateConfidence(decision, request)
          const latency = Date.now() - startTime

          return {
            success: true,
            decision,
            confidence,
            latency,
            provider: providerName,
          }

        } catch (error) {
          lastError = error instanceof Error ? error : new Error('Unknown provider error')
          console.warn(`Provider ${providerName} failed:`, lastError.message)
          continue
        }
      }

      // 7. All providers failed - return fallback
      console.error('All providers failed, using fallback decision')
      const fallbackDecision = strategy.createFallbackDecision(decisionType, request)
      
      return {
        success: false,
        decision: fallbackDecision as TDecision,
        confidence: 0,
        latency: Date.now() - startTime,
        provider: targetProvider,
        error: lastError?.message || 'All providers failed'
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      return {
        success: false,
        decision: {} as TDecision,
        confidence: 0,
        latency: Date.now() - startTime,
        provider: options.provider || this.config.defaultProvider,
        error: errorMessage
      }
    }
  }

  private async callProviderWithRetry(
    provider: ProviderAdapter,
    systemPrompt: string,
    userPrompt: string,
    signal?: AbortSignal
  ) {
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await provider.makeRequest(systemPrompt, userPrompt, signal)
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')
        
        if (signal?.aborted) {
          throw new Error('Request aborted')
        }

        if (attempt < this.config.maxRetries) {
          await this.delay(Math.pow(2, attempt) * 1000) // Exponential backoff
        }
      }
    }

    throw lastError || new Error('Max retries exceeded')
  }

  private parseDecisionResponse(content: string): any {
    try {
      // Try to extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      
      // If no JSON found, try parsing entire content
      return JSON.parse(content)
    } catch (error) {
      console.warn('Failed to parse decision response:', error)
      return { raw_response: content, parsing_error: true }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Health and status methods
  async getSystemHealth(): Promise<{
    strategies: Domain[]
    providers: { name: Provider; available: boolean }[]
    overallHealth: boolean
  }> {
    const strategies = Array.from(this.strategies.keys())
    
    const providers = await Promise.all(
      Array.from(this.providers.entries()).map(async ([name, adapter]) => ({
        name,
        available: adapter.isAvailable && await adapter.healthCheck()
      }))
    )

    const overallHealth = providers.some(p => p.available) && strategies.length > 0

    return { strategies, providers, overallHealth }
  }

  getRegisteredDomains(): Domain[] {
    return Array.from(this.strategies.keys())
  }

  getSupportedTypes(domain: Domain): string[] {
    const strategy = this.strategies.get(domain)
    return strategy ? strategy.supportedTypes : []
  }
}