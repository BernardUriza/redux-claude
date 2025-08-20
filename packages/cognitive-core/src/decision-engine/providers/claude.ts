// src/decision-engine/providers/claude.ts
// Adaptador Claude usando SDK oficial - Bernard Orozco

import type { ProviderAdapter } from '../core/types'

export class ClaudeAdapter implements ProviderAdapter {
  readonly name = 'claude' as const
  private useServerAPI: boolean

  constructor(apiKey?: string) {
    this.useServerAPI = typeof window !== 'undefined'
  }

  get isAvailable(): boolean {
    // En el browser, siempre disponible (usa API route)
    // En servidor, verificar API key
    if (this.useServerAPI) {
      return true
    } else {
      return Boolean(process.env.CLAUDE_API_KEY)
    }
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
    try {
      if (this.useServerAPI) {
        // Use server-side API route when in browser
        if (onChunk) {
          // Streaming mode via SSE
          const response = await fetch('/api/claude', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ systemPrompt, userPrompt, stream: true }),
            signal
          })

          if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`)
          }

          const reader = response.body?.getReader()
          const decoder = new TextDecoder()
          let fullContent = ''

          if (reader) {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              const chunk = decoder.decode(value)
              const lines = chunk.split('\n')

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6)
                  if (data === '[DONE]') continue
                  
                  try {
                    const parsed = JSON.parse(data)
                    if (parsed.text) {
                      fullContent += parsed.text
                      onChunk(parsed.text)
                    }
                  } catch {
                    // Ignore parsing errors
                  }
                }
              }
            }
          }

          return { content: fullContent, success: true }
        } else {
          // Non-streaming mode
          const response = await fetch('/api/claude', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ systemPrompt, userPrompt, stream: false }),
            signal
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'API request failed')
          }

          const result = await response.json()
          return { content: result.content, success: true }
        }
      } else {
        // Server-side: direct SDK usage (for SSR if needed)
        const apiKey = process.env.CLAUDE_API_KEY
        if (!apiKey) {
          return {
            content: '',
            success: false,
            error: 'Server API key not configured'
          }
        }

        const Anthropic = (await import('@anthropic-ai/sdk')).default
        const anthropic = new Anthropic({ apiKey })

        if (signal?.aborted) {
          throw new Error('Request aborted')
        }

        if (onChunk) {
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
        error: `Claude API error: ${errorMessage}`
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