// src/decision-engine/domains/psychology.ts
// Estrategia del dominio psicológico - Bernard Orozco
// EJEMPLO PREPARADO PARA FUTURO

import type { 
  DomainStrategy, 
  BaseDecisionRequest, 
  ValidationResult 
} from '../core/types'

// Tipos específicos del dominio psicológico
export interface PsychologicalAssessment {
  primary_concerns: string[]
  mental_status: {
    mood: string
    affect: string
    thought_process: string
    risk_factors: string[]
  }
  recommended_interventions: string[]
  urgency_level: 1 | 2 | 3 | 4 | 5
  follow_up_plan: string[]
}

export interface TherapyPlan {
  therapy_type: string
  session_frequency: string
  estimated_duration: string
  therapeutic_goals: string[]
  coping_strategies: string[]
  homework_assignments: string[]
}

export interface CrisisAssessment {
  risk_level: 'low' | 'moderate' | 'high' | 'imminent'
  suicide_risk: boolean
  self_harm_risk: boolean
  harm_to_others_risk: boolean
  immediate_interventions: string[]
  safety_plan: string[]
}

export type PsychologyDecision = 
  | PsychologicalAssessment 
  | TherapyPlan 
  | CrisisAssessment

export class PsychologyStrategy implements DomainStrategy<PsychologyDecision> {
  readonly domain = 'psychology' as const
  readonly supportedTypes = ['assessment', 'therapy_plan', 'crisis_evaluation']

  buildSystemPrompt(decisionType: string, request: BaseDecisionRequest): string {
    const basePrompt = "You are a licensed clinical psychologist providing professional psychological assessment."
    
    switch (decisionType) {
      case 'assessment':
        return `${basePrompt}
        
Conduct a psychological assessment considering:
- Mental status examination
- Mood and affect evaluation
- Thought process and content
- Risk factor identification
- Intervention recommendations`

      case 'therapy_plan':
        return `${basePrompt}
        
Develop a comprehensive therapy plan including:
- Appropriate therapeutic modality
- Session structure and frequency
- Therapeutic goals and objectives
- Coping strategy development
- Progress monitoring`

      case 'crisis_evaluation':
        return `${basePrompt}
        
Evaluate crisis situation focusing on:
- Immediate risk assessment
- Suicide/self-harm evaluation
- Safety planning
- Emergency interventions
- Immediate support needs`

      default:
        return basePrompt
    }
  }

  buildJsonSchema(decisionType: string): string {
    switch (decisionType) {
      case 'assessment':
        return `{
  "primary_concerns": ["concern1", "concern2"],
  "mental_status": {
    "mood": "stable|depressed|elevated|anxious",
    "affect": "appropriate|flat|labile|restricted",
    "thought_process": "linear|tangential|circumstantial|flight_of_ideas",
    "risk_factors": ["factor1", "factor2"]
  },
  "recommended_interventions": ["intervention1"],
  "urgency_level": 1-5,
  "follow_up_plan": ["step1", "step2"]
}`

      case 'therapy_plan':
        return `{
  "therapy_type": "CBT|DBT|psychodynamic|humanistic|family",
  "session_frequency": "weekly|bi-weekly|monthly",
  "estimated_duration": "short-term|medium-term|long-term",
  "therapeutic_goals": ["goal1", "goal2"],
  "coping_strategies": ["strategy1"],
  "homework_assignments": ["assignment1"]
}`

      case 'crisis_evaluation':
        return `{
  "risk_level": "low|moderate|high|imminent",
  "suicide_risk": true|false,
  "self_harm_risk": true|false,
  "harm_to_others_risk": true|false,
  "immediate_interventions": ["intervention1"],
  "safety_plan": ["step1", "step2"]
}`

      default:
        return '{ "result": "unknown psychology decision type" }'
    }
  }

  validateDecision(decision: any, decisionType: string): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Psychology-specific validation would go here
    // This is a placeholder for future implementation

    return {
      valid: true,
      errors,
      warnings,
      confidence: 0.8
    }
  }

  calculateConfidence(decision: PsychologyDecision, request: BaseDecisionRequest): number {
    return 75 // Placeholder confidence
  }

  createFallbackDecision(decisionType: string, request: BaseDecisionRequest): PsychologyDecision {
    // Fallback decisions for psychology domain
    return {
      primary_concerns: ['Requires professional psychological evaluation'],
      mental_status: {
        mood: 'unable_to_assess',
        affect: 'unable_to_assess', 
        thought_process: 'unable_to_assess',
        risk_factors: ['Requires in-person assessment']
      },
      recommended_interventions: ['Schedule psychological consultation'],
      urgency_level: 3,
      follow_up_plan: ['Professional psychological evaluation required']
    } as PsychologicalAssessment
  }
}