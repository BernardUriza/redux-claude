// src/services/decisionalMiddleware.ts
// Creado por Bernard Orozco
import { 
  DecisionType, 
  DiagnosisDecision, 
  ValidationDecision,
  ProviderType 
} from '@/types/decisional'

export type DecisionResponse = {
  decision: DiagnosisDecision | ValidationDecision
  latency: number
  provider: ProviderType
  confidence: number
}

// Emergency fallback with Claude (simpler model/prompt)
const getFallbackDecision = async (
  type: DecisionType,
  query: string
): Promise<DiagnosisDecision | ValidationDecision> => {
  try {
    // Try with simpler, more permissive prompt for fallback
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const anthropic = new Anthropic({
      apiKey: process.env.NEXT_PUBLIC_CLAUDE_API_KEY!,
      dangerouslyAllowBrowser: true 
    })

    const fallbackPrompt = type === DecisionType.DIAGNOSIS 
      ? `Based on: "${query}"
         
         Give me a simple medical assessment as JSON:
         {
           "differentials": ["most likely condition", "alternative"],
           "priority": "low/medium/high/critical", 
           "tests_needed": ["basic test"],
           "confidence_factors": ["main factor"]
         }`
      : `Validate this medical request: "${query}"
         
         Return simple JSON:
         {
           "approved": true/false,
           "flags": ["concern if any"],
           "urgency": 1-5,
           "risk_score": 0-100
         }`

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 300, // Lower token limit for fallback
      messages: [{ role: 'user', content: fallbackPrompt }],
      temperature: 0.3 // Lower temperature for more consistent fallback
    })

    const content = response.content[0]
    if (content.type === 'text') {
      return JSON.parse(content.text.trim())
    }
    
    throw new Error('Fallback API failed')
    
  } catch (error) {
    console.error('Even fallback Claude failed:', error)
    
    // LAST RESORT: Minimal static fallback (generic, not hardcoded conditions)
    if (type === DecisionType.DIAGNOSIS) {
      return {
        differentials: ['Requires clinical evaluation'],
        priority: 'medium',
        tests_needed: ['Clinical assessment'],
        confidence_factors: ['insufficient_data']
      }
    } else {
      return {
        approved: false,
        flags: ['system_unavailable', 'manual_review_required'],
        urgency: 3,
        risk_score: 50
      }
    }
  }
}

// System prompts for different decision types
const getSystemPrompt = (type: DecisionType): string => {
  switch (type) {
    case DecisionType.DIAGNOSIS:
      return `You are a medical diagnostic AI. Return ONLY a JSON object with this exact structure:
{
  "differentials": ["condition1", "condition2"],
  "priority": "low|medium|high|critical",
  "tests_needed": ["test1", "test2"],
  "confidence_factors": ["factor1", "factor2"]
}`

    case DecisionType.VALIDATION:
      return `You are a medical validation AI. Return ONLY a JSON object with this exact structure:
{
  "approved": true|false,
  "flags": ["flag1", "flag2"],
  "urgency": 1-5,
  "risk_score": 0-100
}`

    default:
      throw new Error(`Unsupported decision type: ${type}`)
  }
}

// Claude API call with structured prompts
export const callClaudeForDecision = async (
  type: DecisionType,
  query: string,
  provider: ProviderType = ProviderType.CLAUDE,
  signal?: AbortSignal
): Promise<DecisionResponse> => {
  const startTime = Date.now()
  
  try {
    // Dynamic import to avoid bundle bloat
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const anthropic = new Anthropic({
      apiKey: process.env.NEXT_PUBLIC_CLAUDE_API_KEY!,
      dangerouslyAllowBrowser: true 
    })
    
    if (signal?.aborted) {
      throw new Error('Request aborted')
    }
    
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      system: getSystemPrompt(type),
      messages: [{ role: 'user', content: query }]
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Claude')
    }

    // Parse and validate JSON response
    let decision: DiagnosisDecision | ValidationDecision
    try {
      decision = JSON.parse(content.text.trim())
    } catch (parseError) {
      throw new Error(`Invalid JSON response from Claude: ${parseError}`)
    }
    
    const latency = Date.now() - startTime
    
    return {
      decision,
      latency,
      provider,
      confidence: Math.min(95, Math.max(70, 100 - (latency / 50))) // Confidence based on latency
    }
    
  } catch (error) {
    console.warn(`Claude API failed for ${type}:`, error)
    
    // Try intelligent fallback with simpler Claude prompt
    const decision = await getFallbackDecision(type, query)
    
    return {
      decision,
      latency: Date.now() - startTime,
      provider: ProviderType.LOCAL, // Mark as fallback
      confidence: 30 // Much lower confidence for fallback
    }
  }
}

// Provider fallback chain
export const getAvailableProvider = (preferredProvider: ProviderType): ProviderType => {
  // In a real system, this would check health endpoints
  // For now, fallback chain: Claude -> OpenAI -> Local
  switch (preferredProvider) {
    case ProviderType.CLAUDE:
      return ProviderType.CLAUDE
    case ProviderType.OPENAI:
      return ProviderType.LOCAL // OpenAI not implemented yet
    case ProviderType.LOCAL:
      return ProviderType.LOCAL
    default:
      return ProviderType.CLAUDE
  }
}