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

// Enhanced system prompts with doctor context and feedback
const getSystemPrompt = (type: DecisionType, previousDecisions?: any[]): string => {
  const doctorContext = `You are an AI assistant helping a licensed medical doctor. The doctor is using this system to get structured clinical decision support. You should provide professional-grade medical insights suitable for a practicing physician.`
  
  const feedbackContext = previousDecisions && previousDecisions.length > 0 
    ? `\n\nPrevious decisions in this session: ${JSON.stringify(previousDecisions.slice(-3), null, 2)}\nUse this context to provide more targeted analysis.`
    : ''

  switch (type) {
    case DecisionType.DIAGNOSIS:
      return `${doctorContext}

Based on the patient information provided, return ONLY a JSON object with this exact structure:
{
  "differentials": ["most_likely_condition", "alternative_diagnosis", "rule_out_condition"],
  "priority": "low|medium|high|critical",
  "tests_needed": ["diagnostic_test1", "diagnostic_test2"],
  "confidence_factors": ["supporting_evidence1", "supporting_evidence2"],
  "clinical_notes": "brief_clinical_reasoning",
  "red_flags": ["warning_sign1", "warning_sign2"] or [],
  "follow_up_timeframe": "immediate|24hours|48hours|1week|routine"
}

Priority guidelines:
- critical: Life-threatening, needs immediate intervention
- high: Urgent medical attention required within hours
- medium: Should be seen within days, monitor closely  
- low: Routine follow-up appropriate${feedbackContext}`

    case DecisionType.VALIDATION:
      return `${doctorContext}

For the medical decision or treatment plan presented, return ONLY a JSON object with this exact structure:
{
  "approved": true|false,
  "flags": ["safety_concern1", "contraindication1"] or [],
  "urgency": 1-5,
  "risk_score": 0-100,
  "recommendations": ["modify_dose", "add_monitoring", "consider_alternative"],
  "contraindications": ["condition1", "drug_interaction1"] or [],
  "monitoring_required": ["lab_test1", "vital_signs", "symptom_watch"]
}

Risk score: 0-25 (low), 26-50 (moderate), 51-75 (high), 76-100 (critical)${feedbackContext}`

    default:
      throw new Error(`Unsupported decision type: ${type}`)
  }
}

// Claude API call with structured prompts and feedback
export const callClaudeForDecision = async (
  type: DecisionType,
  query: string,
  provider: ProviderType = ProviderType.CLAUDE,
  signal?: AbortSignal,
  previousDecisions?: any[]
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
      max_tokens: 800, // Increased for richer responses
      system: getSystemPrompt(type, previousDecisions),
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