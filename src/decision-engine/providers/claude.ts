// src/decision-engine/providers/claude.ts
// Adaptador Claude simplificado - Bernard Orozco

import type { ProviderAdapter } from '../core/types'

export class ClaudeAdapter implements ProviderAdapter {
  readonly name = 'claude' as const
  private apiKey: string
  private baseUrl: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_CLAUDE_API_KEY || ''
    this.baseUrl = 'https://api.anthropic.com'
  }

  get isAvailable(): boolean {
    return Boolean(this.apiKey)
  }

  async makeRequest(
    systemPrompt: string, 
    userPrompt: string, 
    signal?: AbortSignal
  ): Promise<{ content: string; success: boolean; error?: string }> {
    if (!this.isAvailable) {
      return {
        content: '',
        success: false,
        error: 'Claude API key not available'
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1000,
          temperature: 0.3,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: userPrompt
            }
          ]
        }),
        signal
      })

      if (!response.ok) {
        const errorText = await response.text()
        return {
          content: '',
          success: false,
          error: `Claude API error: ${response.status} - ${errorText}`
        }
      }

      const data = await response.json()
      
      if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
        return {
          content: '',
          success: false,
          error: 'Invalid response format from Claude'
        }
      }

      const content = data.content[0]?.text || ''
      
      return {
        content,
        success: true
      }

    } catch (error) {
      if (signal?.aborted) {
        return {
          content: '',
          success: false,
          error: 'Request aborted'
        }
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      return {
        content: '',
        success: false,
        error: `Claude request failed: ${errorMessage}`
      }
    }
  }

  async healthCheck(): Promise<boolean> {
    if (!this.isAvailable) {
      return false
    }

    try {
      const response = await this.makeRequest(
        'You are a health check assistant.',
        'Respond with exactly: {"status": "healthy"}'
      )

      if (!response.success) {
        return false
      }

      try {
        const parsed = JSON.parse(response.content)
        return parsed.status === 'healthy'
      } catch {
        return false
      }

    } catch (error) {
      console.warn('Claude health check failed:', error)
      return false
    }
  }
}