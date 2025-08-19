// src/engines/providers/LocalAdapter.ts
// Local/mock provider adapter for testing and fallback
// Created by Bernard Orozco

import { IProviderAdapter, ProviderConfig, ProviderResponse, ProviderMetadata, ProviderError } from '../core/interfaces/IProviderAdapter'
import { BaseDecisionRequest } from '../core/interfaces/IDecisionTypes'

export class LocalAdapter implements IProviderAdapter {
  readonly name = 'local'
  private _config: ProviderConfig
  readonly isAvailable = true // Local adapter is always available

  constructor(config: Partial<ProviderConfig> = {}) {
    this._config = {
      model: 'local-mock-v1',
      maxTokens: 1000,
      temperature: 0.5,
      timeout: 1000, // Fast response for local
      retryAttempts: 1,
      ...config
    }
  }

  get config(): ProviderConfig {
    return { ...this._config }
  }

  async makeDecisionRequest(
    systemPrompt: string,
    userPrompt: string,
    request: BaseDecisionRequest
  ): Promise<ProviderResponse> {
    if (request.signal?.aborted) {
      throw this.createProviderError('REQUEST_ABORTED', 'Request was aborted', 499, false)
    }

    const startTime = Date.now()

    try {
      // Simulate processing delay
      await this.delay(Math.random() * 500 + 200) // 200-700ms delay

      // Parse decision type from system prompt or context
      const decisionType = this.extractDecisionType(systemPrompt, request)
      
      // Generate mock response based on decision type
      const mockResponse = this.generateMockResponse(decisionType, userPrompt, request)

      return {
        content: JSON.stringify(mockResponse, null, 2),
        usage: {
          promptTokens: Math.floor(systemPrompt.length / 4), // Rough token estimation
          completionTokens: Math.floor(JSON.stringify(mockResponse).length / 4),
          totalTokens: Math.floor((systemPrompt.length + JSON.stringify(mockResponse).length) / 4)
        },
        model: this._config.model || 'local-mock-v1',
        finishReason: 'complete',
        metadata: {
          latency: Date.now() - startTime,
          provider: this.name,
          model: this._config.model,
          timestamp: Date.now(),
          mockGenerated: true
        }
      }

    } catch (error) {
      throw this.createProviderError(
        'LOCAL_ERROR',
        error instanceof Error ? error.message : 'Local processing error',
        500,
        false
      )
    }
  }

  async healthCheck(): Promise<boolean> {
    // Local adapter is always healthy
    return true
  }

  getProviderMetadata(): ProviderMetadata {
    return {
      name: this.name,
      version: '1.0.0',
      models: ['local-mock-v1'],
      capabilities: [
        'mock-responses',
        'fast-response',
        'offline-operation',
        'testing-support'
      ],
      limitations: [
        'mock-data-only',
        'limited-intelligence',
        'no-real-ai'
      ],
      costPerToken: {
        input: 0,  // Free
        output: 0  // Free
      }
    }
  }

  private extractDecisionType(systemPrompt: string, request: BaseDecisionRequest): string {
    // Try to extract decision type from context or system prompt
    if (request.context?.decisionType) {
      return request.context.decisionType as string
    }

    // Pattern matching in system prompt
    const lowerPrompt = systemPrompt.toLowerCase()
    
    if (lowerPrompt.includes('diagnóstico') || lowerPrompt.includes('diagnosis')) {
      return 'diagnosis'
    }
    if (lowerPrompt.includes('triage')) {
      return 'triage'
    }
    if (lowerPrompt.includes('validación') || lowerPrompt.includes('validation')) {
      return 'validation'
    }
    if (lowerPrompt.includes('tratamiento') || lowerPrompt.includes('treatment')) {
      return 'treatment'
    }
    if (lowerPrompt.includes('documentación') || lowerPrompt.includes('documentation')) {
      return 'documentation'
    }

    return 'generic'
  }

  private generateMockResponse(decisionType: string, userPrompt: string, request: BaseDecisionRequest): any {
    switch (decisionType) {
      case 'diagnosis':
        return {
          differentials: [
            {
              condition: 'Síndrome viral común',
              icd10: 'J06.9',
              probability: 0.7,
              evidence: ['Síntomas reportados', 'Patrón estacional']
            },
            {
              condition: 'Resfriado común',
              icd10: 'J00',
              probability: 0.3,
              evidence: ['Síntomas leves']
            }
          ],
          tests_recommended: ['Evaluación clínica básica'],
          red_flags: [],
          urgency_level: 3,
          next_steps: ['Reposo y hidratación', 'Seguimiento si empeoran síntomas']
        }

      case 'triage':
        return {
          acuity_level: 4,
          disposition: 'standard',
          time_to_physician: '2 hours',
          required_resources: ['Evaluación básica'],
          warning_signs: []
        }

      case 'validation':
        return {
          valid: true,
          concerns: [],
          risk_assessment: {
            level: 'low',
            factors: ['Síntomas leves', 'Sin complicaciones aparentes']
          },
          requires_human_review: false,
          recommendations: ['Continuar con plan propuesto']
        }

      case 'treatment':
        return {
          medications: [
            {
              drug: 'Paracetamol',
              dosage: '500mg',
              frequency: 'cada 6 horas',
              duration: '3-5 días',
              contraindications: ['Alergia conocida']
            }
          ],
          procedures: [],
          lifestyle_modifications: ['Reposo', 'Hidratación abundante'],
          monitoring_plan: ['Seguimiento en 48-72 horas si no mejora']
        }

      case 'documentation':
        return {
          soap: {
            subjective: 'Paciente refiere síntomas compatibles con proceso viral',
            objective: 'Evaluación pendiente - datos simulados',
            assessment: 'Probable síndrome viral común',
            plan: 'Tratamiento sintomático y seguimiento'
          },
          icd10_codes: ['J06.9'],
          billing_codes: ['99213'],
          follow_up_required: true
        }

      default:
        return {
          response: 'Respuesta genérica simulada para pruebas',
          confidence: 0.5,
          note: 'Esta es una respuesta mock del adaptador local'
        }
    }
  }

  private createProviderError(
    code: string,
    message: string,
    statusCode: number,
    retryable: boolean
  ): ProviderError {
    const error = new Error(message) as ProviderError
    error.name = 'ProviderError'
    error.code = code
    error.statusCode = statusCode
    error.retryable = retryable
    error.provider = this.name
    return error
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Update configuration
  updateConfig(newConfig: Partial<ProviderConfig>): void {
    this._config = { ...this._config, ...newConfig }
  }

  // Get mock usage statistics
  async getUsageStats(): Promise<{
    tokensUsed: number
    requestsToday: number
    creditsRemaining?: number
  }> {
    return {
      tokensUsed: Math.floor(Math.random() * 10000),
      requestsToday: Math.floor(Math.random() * 100),
      creditsRemaining: Infinity // Unlimited for local
    }
  }

  // Add methods for testing
  setMockResponse(decisionType: string, mockData: any): void {
    // Allow setting custom mock responses for testing
    // Implementation would store these in a private map
  }

  enableLatencySimulation(min: number, max: number): void {
    // Allow configuring response latency for testing
    this._config.customSettings = {
      ...this._config.customSettings,
      latencyMin: min,
      latencyMax: max
    }
  }
}

// Export singleton instance
export const localAdapter = new LocalAdapter()