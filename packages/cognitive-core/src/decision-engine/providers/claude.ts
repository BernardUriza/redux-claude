// src/decision-engine/providers/claude.ts
// Adaptador Claude usando SDK oficial - Bernard Orozco

import type { ProviderAdapter } from '../core/types'

export class ClaudeAdapter implements ProviderAdapter {
  readonly name = 'claude' as const
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_CLAUDE_API_KEY || ''
  }

  get isAvailable(): boolean {
    return Boolean(this.apiKey)
  }

  async makeRequest(
    systemPrompt: string, 
    userPrompt: string, 
    signal?: AbortSignal
  ): Promise<{ content: string; success: boolean; error?: string }> {
    return this.makeStreamingRequest(systemPrompt, userPrompt, signal)
  }

  async makeStreamingRequest(
    systemPrompt: string, 
    userPrompt: string, 
    signal?: AbortSignal,
    onChunk?: (chunk: string) => void
  ): Promise<{ content: string; success: boolean; error?: string }> {
    if (!this.isAvailable) {
      return {
        content: '',
        success: false,
        error: 'Claude API key not available'
      }
    }

    try {
      // Dynamic import del SDK de Anthropic (igual que el middleware original)
      const Anthropic = (await import('@anthropic-ai/sdk')).default
      const anthropic = new Anthropic({
        apiKey: this.apiKey,
        dangerouslyAllowBrowser: true // Permite uso desde browser
      })

      if (signal?.aborted) {
        throw new Error('Request aborted')
      }

      if (onChunk) {
        // Streaming mode
        const stream = await anthropic.messages.create({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1000,
          temperature: 0.3,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
          stream: true
        })

        let fullContent = ''
        for await (const chunk of stream) {
          if (signal?.aborted) throw new Error('Request aborted')
          
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            const text = chunk.delta.text
            fullContent += text
            onChunk(text)
          }
        }

        return { content: fullContent, success: true }
      } else {
        // Non-streaming mode
        const response = await anthropic.messages.create({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1000,
          temperature: 0.3,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }]
        })

        const content = response.content[0]
        if (content.type !== 'text') {
          return { content: '', success: false, error: 'Unexpected response format' }
        }

        return { content: content.text, success: true }
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
        error: `Claude SDK error: ${errorMessage}`
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