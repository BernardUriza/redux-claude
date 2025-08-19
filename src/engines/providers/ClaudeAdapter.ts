// src/engines/providers/ClaudeAdapter.ts
// Claude API provider adapter
// Created by Bernard Orozco

import { IProviderAdapter, ProviderConfig, ProviderResponse, ProviderMetadata, ProviderError } from '../core/interfaces/IProviderAdapter'
import { BaseDecisionRequest } from '../core/interfaces/IDecisionTypes'

export class ClaudeAdapter implements IProviderAdapter {
  readonly name = 'claude'
  private _config: ProviderConfig
  private _isAvailable: boolean = false

  constructor(config: Partial<ProviderConfig> = {}) {
    this._config = {
      model: 'claude-3-haiku-20240307',
      maxTokens: 1000,
      temperature: 0.3,
      timeout: 30000,
      retryAttempts: 2,
      rateLimitConfig: {
        requestsPerSecond: 5,
        requestsPerMinute: 100
      },
      ...config
    }
    
    this._isAvailable = Boolean(this._config.apiKey || process.env.NEXT_PUBLIC_CLAUDE_API_KEY)
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
      throw this.createProviderError('NO_API_KEY', 'Claude API key not configured', 401, false)
    }

    if (request.signal?.aborted) {
      throw this.createProviderError('REQUEST_ABORTED', 'Request was aborted', 499, false)
    }

    try {
      // Dynamic import to avoid bundle bloat
      const Anthropic = (await import('@anthropic-ai/sdk')).default
      const anthropic = new Anthropic({
        apiKey: this._config.apiKey || process.env.NEXT_PUBLIC_CLAUDE_API_KEY!,
        dangerouslyAllowBrowser: true // Note: In production, this should be server-side
      })

      const startTime = Date.now()
      
      // Create request with timeout
      const timeoutController = new AbortController()
      const timeout = setTimeout(() => timeoutController.abort(), this._config.timeout || 30000)

      try {
        const response = await anthropic.messages.create({
          model: this._config.model || 'claude-3-haiku-20240307',
          max_tokens: this._config.maxTokens || 1000,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
          temperature: this._config.temperature || 0.3
        }, {
          signal: request.signal || timeoutController.signal
        })

        clearTimeout(timeout)

        const content = response.content[0]
        if (content.type !== 'text') {
          throw this.createProviderError(
            'INVALID_RESPONSE_FORMAT', 
            'Unexpected response format from Claude', 
            422, 
            false
          )
        }

        return {
          content: content.text,
          usage: {
            promptTokens: response.usage.input_tokens,
            completionTokens: response.usage.output_tokens,
            totalTokens: response.usage.input_tokens + response.usage.output_tokens
          },
          model: this._config.model,
          finishReason: response.stop_reason || 'complete',
          metadata: {
            latency: Date.now() - startTime,
            provider: this.name,
            model: this._config.model,
            timestamp: Date.now()
          }
        }

      } catch (error) {
        clearTimeout(timeout)
        throw error
      }

    } catch (error) {
      // Handle specific Anthropic errors
      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.message.includes('aborted')) {
          throw this.createProviderError('REQUEST_TIMEOUT', 'Request timed out', 408, true)
        }

        if (error.message.includes('rate limit') || error.message.includes('429')) {
          throw this.createProviderError('RATE_LIMIT', 'Rate limit exceeded', 429, true)
        }

        if (error.message.includes('authentication') || error.message.includes('401')) {
          throw this.createProviderError('AUTHENTICATION_ERROR', 'Invalid API key', 401, false)
        }

        if (error.message.includes('insufficient funds') || error.message.includes('402')) {
          throw this.createProviderError('INSUFFICIENT_FUNDS', 'Insufficient API credits', 402, false)
        }

        if (error.message.includes('overloaded') || error.message.includes('503')) {
          throw this.createProviderError('SERVICE_OVERLOADED', 'Claude service is overloaded', 503, true)
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
      version: '2024-03-07',
      models: [
        'claude-3-haiku-20240307',
        'claude-3-sonnet-20240229',
        'claude-3-opus-20240229'
      ],
      capabilities: [
        'text-generation',
        'json-responses',
        'structured-output',
        'system-prompts',
        'conversation',
        'analysis',
        'reasoning'
      ],
      limitations: [
        'no-image-generation',
        'no-function-calling',
        'context-window-limit',
        'rate-limited'
      ],
      costPerToken: {
        input: 0.00025, // $0.25 per 1K tokens for Haiku
        output: 0.00125  // $1.25 per 1K tokens for Haiku
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
    this._isAvailable = Boolean(this._config.apiKey || process.env.NEXT_PUBLIC_CLAUDE_API_KEY)
  }

  // Get current usage statistics (if available)
  async getUsageStats(): Promise<{
    tokensUsed: number
    requestsToday: number
    creditsRemaining?: number
  } | null> {
    // Claude doesn't provide direct usage API in client-side SDK
    // This would need to be implemented server-side or tracked locally
    return null
  }
}

// Export singleton instance
export const claudeAdapter = new ClaudeAdapter()