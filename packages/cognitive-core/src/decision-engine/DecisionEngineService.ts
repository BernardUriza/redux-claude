// src/decision-engine/DecisionEngineService.ts
// Servicio central del Decision Engine híbrido - Bernard Orozco

import { DecisionEngine } from './core/DecisionEngine'
import { MedicalStrategy } from './domains/medical'
import { ClaudeAdapter } from './providers/claude'
import { LocalAdapter } from './providers/local'
import type { Domain, Provider, DecisionResponse } from './core/types'

class DecisionEngineService {
  public engine: DecisionEngine
  public initialized = false

  constructor() {
    this.engine = new DecisionEngine({
      defaultProvider: 'claude', // Use Claude SDK with dangerouslyAllowBrowser
      fallbackProviders: ['local'],
      timeout: 30000,
      maxRetries: 2,
      enableValidation: true
    })
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      // Register medical domain strategy
      const medicalStrategy = new MedicalStrategy()
      this.engine.registerStrategy('medical', medicalStrategy as any)

      // Register Claude adapter
      const claudeAdapter = new ClaudeAdapter()
      this.engine.registerProvider('claude', claudeAdapter)

      // Register local/mock adapter
      const localAdapter = new LocalAdapter()
      this.engine.registerProvider('local', localAdapter)

      this.initialized = true
      console.log('✅ Decision Engine initialized successfully')

      // Log available capabilities
      const health = await this.engine.getSystemHealth()
      console.log('📊 Available domains:', health.strategies)
      console.log('🔌 Available providers:', health.providers.map(p => `${p.name} (${p.available ? 'online' : 'offline'})`))

    } catch (error) {
      console.error('❌ Failed to initialize Decision Engine:', error)
      throw error
    }
  }

  // Main decision making method
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
    await this.initialize()

    try {
      return await this.engine.makeDecision<TDecision>(
        domain,
        decisionType,
        input,
        options
      )
    } catch (error) {
      console.error(`Decision Engine error for ${domain}/${decisionType}:`, error)
      throw error
    }
  }

  // Medical domain convenience methods
  async makeMedicalDiagnosis(
    input: string, 
    options: { context?: Record<string, unknown>; signal?: AbortSignal } = {}
  ) {
    return this.makeDecision('medical', 'diagnosis', input, options)
  }

  async makeMedicalTriage(
    input: string,
    options: { context?: Record<string, unknown>; signal?: AbortSignal } = {}
  ) {
    return this.makeDecision('medical', 'triage', input, options)
  }

  async validateMedicalDecision(
    input: string,
    options: { context?: Record<string, unknown>; signal?: AbortSignal } = {}
  ) {
    return this.makeDecision('medical', 'validation', input, options)
  }

  async createTreatmentPlan(
    input: string,
    options: { context?: Record<string, unknown>; signal?: AbortSignal } = {}
  ) {
    return this.makeDecision('medical', 'treatment', input, options)
  }

  async generateDocumentation(
    input: string,
    options: { context?: Record<string, unknown>; signal?: AbortSignal } = {}
  ) {
    return this.makeDecision('medical', 'documentation', input, options)
  }

  // System health and capabilities
  async getSystemHealth() {
    await this.initialize()
    return this.engine.getSystemHealth()
  }

  getAvailableDomains(): Domain[] {
    if (!this.initialized) return []
    return this.engine.getRegisteredDomains()
  }

  getSupportedDecisionTypes(domain: Domain): string[] {
    if (!this.initialized) return []
    return this.engine.getSupportedTypes(domain)
  }

  // Backward compatibility method for existing middleware
  async processLegacyDecision(
    decisionType: string,
    input: string,
    provider: string = 'claude',
    signal?: AbortSignal,
    previousDecisions: any[] = [],
    context: Record<string, unknown> = {}
  ): Promise<{
    success: boolean
    decision: any
    confidence: number
    error?: string
  }> {
    try {
      // Map legacy decision types to new format
      const mappedType = this.mapLegacyDecisionType(decisionType)
      
      const response = await this.makeDecision(
        'medical', // Assume medical domain for legacy calls
        mappedType,
        input,
        {
          provider: provider as Provider,
          context,
          previousDecisions,
          signal
        }
      )

      return {
        success: response.success,
        decision: response.decision,
        confidence: response.confidence,
        error: response.error
      }

    } catch (error) {
      return {
        success: false,
        decision: {},
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  public mapLegacyDecisionType(legacyType: string): string {
    // Map old decision types to new ones
    const typeMap: Record<string, string> = {
      'diagnosis': 'diagnosis',
      'triage': 'triage', 
      'validation': 'validation',
      'treatment': 'treatment',
      'documentation': 'documentation'
    }

    return typeMap[legacyType] || legacyType
  }

  // Future domain registration (for extensibility)
  async registerNewDomain(domain: Domain, strategy: any): Promise<void> {
    await this.initialize()
    this.engine.registerStrategy(domain, strategy)
    console.log(`✅ Registered new domain: ${domain}`)
  }

  async registerNewProvider(provider: Provider, adapter: any): Promise<void> {
    await this.initialize()
    this.engine.registerProvider(provider, adapter)
    console.log(`✅ Registered new provider: ${provider}`)
  }

  // Development and testing utilities
  async runHealthCheck(): Promise<{
    overall: boolean
    domains: Domain[]
    providers: Array<{ name: Provider; available: boolean }>
    errors: string[]
  }> {
    const errors: string[] = []
    
    try {
      await this.initialize()
      const health = await this.engine.getSystemHealth()
      
      return {
        overall: health.overallHealth,
        domains: health.strategies,
        providers: health.providers,
        errors
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown error')
      
      return {
        overall: false,
        domains: [],
        providers: [],
        errors
      }
    }
  }

  // Reset for testing
  reset(): void {
    this.initialized = false
    this.engine = new DecisionEngine({
      defaultProvider: 'claude', // Use Claude SDK with dangerouslyAllowBrowser
      fallbackProviders: ['local'],
      timeout: 30000,
      maxRetries: 2,
      enableValidation: true
    })
  }
}

// Export singleton instance
export const decisionEngineService = new DecisionEngineService()

// Export types for external use
export type { 
  Domain, 
  Provider, 
  DecisionResponse,
  BaseDecisionRequest 
} from './core/types'

export type {
  DiagnosticDecision,
  TriageDecision,
  ValidationDecision,
  TreatmentDecision,
  DocumentationDecision,
  MedicalDecision
} from './domains/medical'