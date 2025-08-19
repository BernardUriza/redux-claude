// src/engines/providers/OpenAIAdapter.ts
// OpenAI API provider adapter
// Created by Bernard Orozco

import { IProviderAdapter, ProviderConfig, ProviderResponse, ProviderMetadata, ProviderError } from '../core/interfaces/IProviderAdapter'
import { BaseDecisionRequest } from '../core/interfaces/IDecisionTypes'

export class OpenAIAdapter implements IProviderAdapter {
  readonly name = 'openai'
  private _config: ProviderConfig
  private _isAvailable: boolean = false

  constructor(config: Partial<ProviderConfig> = {}) {
    this._config = {
      model: 'gpt-3.5-turbo',
      maxTokens: 1000,
      temperature: 0.3,
      timeout: 30000,
      retryAttempts: 2,
      baseUrl: 'https://api.openai.com/v1',
      rateLimitConfig: {
        requestsPerSecond: 3,
        requestsPerMinute: 100
      },
      ...config
    }
    
    this._isAvailable = Boolean(this._config.apiKey || process.env.NEXT_PUBLIC_OPENAI_API_KEY)
  }

  get isAvailable(): boolean {
    return this._isAvailable
  }

  get config(): ProviderConfig {
    return { ...this._config }
  }

  async makeDecisionRequest(
    systemPrompt: string,
    userPrompt: string,
    request: BaseDecisionRequest
  ): Promise<ProviderResponse> {
    if (!this.isAvailable) {
      throw this.createProviderError('NO_API_KEY', 'OpenAI API key not configured', 401, false)
    }

    if (request.signal?.aborted) {
      throw this.createProviderError('REQUEST_ABORTED', 'Request was aborted', 499, false)
    }

    try {
      // Dynamic import to avoid bundle bloat (temporarily disabled until OpenAI dependency added)
      // const { Configuration, OpenAIApi } = await import('openai')
      throw new Error('OpenAI provider not available - install openai package')
      
      /*
      const configuration = new Configuration({
        apiKey: this._config.apiKey || process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
        basePath: this._config.baseUrl
      })
      
      const openai = new OpenAIApi(configuration)
      */

      /*
      const startTime = Date.now()
      
      // Create request with timeout
      const timeoutController = new AbortController()
      const timeout = setTimeout(() => timeoutController.abort(), this._config.timeout || 30000)

      try {
        const response = await openai.createChatCompletion({
          model: this._config.model || 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: this._config.maxTokens || 1000,
          temperature: this._config.temperature || 0.3,
          response_format: { type: 'text' }
        }, {
          signal: request.signal || timeoutController.signal
        })

        clearTimeout(timeout)

        const choice = response.data.choices[0]
        if (!choice || !choice.message) {
          throw this.createProviderError(
            'INVALID_RESPONSE_FORMAT', 
            'No valid response from OpenAI', 
            422, 
            false
          )
        }

        return {
          content: choice.message.content || '',
          usage: {
            promptTokens: response.data.usage?.prompt_tokens || 0,
            completionTokens: response.data.usage?.completion_tokens || 0,
            totalTokens: response.data.usage?.total_tokens || 0
          },
          model: response.data.model,
          finishReason: choice.finish_reason || 'complete',
          metadata: {
            latency: Date.now() - startTime,
            provider: this.name,
            model: response.data.model,
            timestamp: Date.now()
          }
        }

      } catch (error) {
        clearTimeout(timeout)
        throw error
      }

    } catch (error: any) {
      // Handle specific OpenAI errors
      if (error.response) {
        const status = error.response.status
        const data = error.response.data

        switch (status) {
          case 401:
            throw this.createProviderError('AUTHENTICATION_ERROR', 'Invalid OpenAI API key', 401, false)
          case 402:
            throw this.createProviderError('INSUFFICIENT_FUNDS', 'Insufficient OpenAI credits', 402, false)
          case 429:
            throw this.createProviderError('RATE_LIMIT', 'OpenAI rate limit exceeded', 429, true)
          case 503:
            throw this.createProviderError('SERVICE_OVERLOADED', 'OpenAI service is overloaded', 503, true)
          default:
            throw this.createProviderError(
              'API_ERROR',
              data?.error?.message || `API error: ${status}`,
              status,
              status >= 500
            )
        }
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.message.includes('aborted')) {
          throw this.createProviderError('REQUEST_TIMEOUT', 'Request timed out', 408, true)
        }
      }

      // Generic error
      throw this.createProviderError(
        'UNKNOWN_ERROR',
        error instanceof Error ? error.message : 'Unknown error occurred',
        500,
        true
      )
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.isAvailable) {
        return false
      }

      // Simple health check with minimal token usage
      const response = await this.makeDecisionRequest(
        'You are a health check assistant. Respond with exactly: OK',
        'Health check',
        {
          id: 'health-check',
          input: 'Health check',
          signal: AbortSignal.timeout(5000) // 5 second timeout for health check
        }
      )

      return response.content.trim().toLowerCase() === 'ok'
    } catch {
      return false
    }
  }

  getProviderMetadata(): ProviderMetadata {
    return {
      name: this.name,
      version: '2024-01-01',
      models: [
        'gpt-3.5-turbo',
        'gpt-3.5-turbo-16k',
        'gpt-4',
        'gpt-4-32k',
        'gpt-4-turbo-preview'
      ],
      capabilities: [
        'text-generation',
        'json-responses',
        'structured-output',
        'system-prompts',
        'conversation',
        'analysis',
        'reasoning',
        'function-calling'
      ],
      limitations: [
        'context-window-limit',
        'rate-limited',
        'cost-per-token'
      ],
      costPerToken: {
        input: 0.0005,  // $0.50 per 1K tokens for GPT-3.5-turbo
        output: 0.0015  // $1.50 per 1K tokens for GPT-3.5-turbo
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

  // Update configuration
  updateConfig(newConfig: Partial<ProviderConfig>): void {
    this._config = { ...this._config, ...newConfig }
    this._isAvailable = Boolean(this._config.apiKey || process.env.NEXT_PUBLIC_OPENAI_API_KEY)
  }

  // Get current usage statistics (if available)
  async getUsageStats(): Promise<{
    tokensUsed: number
    requestsToday: number
    creditsRemaining?: number
  } | null> {
    // OpenAI doesn't provide direct usage API in client-side SDK
    // This would need to be implemented server-side or tracked locally
    return null
  }

  // OpenAI-specific method for function calling
  async makeFunctionCall(
    systemPrompt: string,
    userPrompt: string,
    functions: any[],
    request: BaseDecisionRequest
  ): Promise<ProviderResponse & { functionCall?: any }> {
    // Implementation for OpenAI function calling
    // This is a placeholder for future OpenAI-specific functionality
    throw new Error('Function calling not yet implemented')
  }
}

// Export singleton instance
export const openAIAdapter = new OpenAIAdapter()