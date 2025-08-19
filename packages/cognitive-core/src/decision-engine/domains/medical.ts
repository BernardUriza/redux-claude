// src/decision-engine/domains/medical.ts
// Estrategia del dominio médico - Bernard Orozco

import type { 
  DomainStrategy, 
  BaseDecisionRequest, 
  ValidationResult 
} from '../core/types'

// Tipos específicos del dominio médico
export interface DiagnosticDecision {
  differentials: Array<{
    condition: string
    icd10?: string
    probability: number
    evidence: string[]
  }>
  tests_recommended: string[]
  red_flags: string[]
  urgency_level: 1 | 2 | 3 | 4 | 5
  next_steps: string[]
}

export interface TriageDecision {
  acuity_level: 1 | 2 | 3 | 4 | 5
  disposition: 'immediate' | 'urgent' | 'semi_urgent' | 'standard' | 'non_urgent'
  time_to_physician: 'immediate' | '15min' | '1hour' | '2hours' | 'routine'
  required_resources: string[]
  warning_signs: string[]
}

export interface ValidationDecision {
  valid: boolean
  concerns: string[]
  risk_assessment: {
    level: 'low' | 'moderate' | 'high' | 'critical'
    factors: string[]
  }
  requires_human_review: boolean
  recommendations: string[]
}

export interface TreatmentDecision {
  medications: Array<{
    drug: string
    dosage: string
    frequency: string
    duration: string
    contraindications: string[]
  }>
  procedures: string[]
  lifestyle_modifications: string[]
  monitoring_plan: string[]
}

export interface DocumentationDecision {
  soap: {
    subjective: string
    objective: string
    assessment: string
    plan: string
  }
  icd10_codes: string[]
  billing_codes: string[]
  follow_up_required: boolean
}

export type MedicalDecision = 
  | DiagnosticDecision 
  | TriageDecision 
  | ValidationDecision 
  | TreatmentDecision 
  | DocumentationDecision

export class MedicalStrategy implements DomainStrategy<MedicalDecision> {
  readonly domain = 'medical' as const
  readonly supportedTypes = ['diagnosis', 'triage', 'validation', 'treatment', 'documentation']

  buildSystemPrompt(decisionType: string, request: BaseDecisionRequest): string {
    const basePrompt = "You are a specialist medical AI assistant helping a licensed doctor."
    
    switch (decisionType) {
      case 'diagnosis':
        return `${basePrompt}
        
Analyze the patient presentation and provide diagnostic assessment.
Focus on differential diagnoses, evidence-based medicine, and clinical reasoning.
Consider red flags and urgency levels.`

      case 'triage':
        return `${basePrompt}
        
You are a triage specialist using Emergency Severity Index (ESI) assessment.
Evaluate patient acuity and prioritization based on:
- Life-threatening conditions (Level 1)
- High-risk situations (Level 2) 
- Stable patients needing multiple resources (Level 3)
- Stable patients needing one resource (Level 4)
- No resources needed (Level 5)`

      case 'validation':
        return `${basePrompt}
        
Review clinical decisions for safety and appropriateness.
Check for:
- Drug interactions and contraindications
- Dose appropriateness 
- Clinical guidelines compliance
- Missing critical assessments
- Safety considerations`

      case 'treatment':
        return `${basePrompt}
        
Develop evidence-based treatment plans considering:
- Patient safety and contraindications
- Drug interactions
- Monitoring requirements
- Follow-up needs
- Lifestyle modifications`

      case 'documentation':
        return `${basePrompt}
        
Generate structured medical documentation using SOAP format:
- Subjective: Patient's reported symptoms and history
- Objective: Observable findings and test results
- Assessment: Clinical impression and diagnosis
- Plan: Treatment plan and follow-up`

      default:
        return basePrompt
    }
  }

  buildJsonSchema(decisionType: string): string {
    switch (decisionType) {
      case 'diagnosis':
        return `{
  "differentials": [
    {
      "condition": "Most likely diagnosis",
      "icd10": "ICD-10 code if known",
      "probability": 0.85,
      "evidence": ["supporting evidence 1", "supporting evidence 2"]
    }
  ],
  "tests_recommended": ["diagnostic test 1", "diagnostic test 2"],
  "red_flags": ["warning sign 1"] or [],
  "urgency_level": 1-5,
  "next_steps": ["immediate action", "follow up plan"]
}`

      case 'triage':
        return `{
  "acuity_level": 1-5,
  "disposition": "immediate|urgent|semi_urgent|standard|non_urgent",
  "time_to_physician": "immediate|15min|1hour|2hours|routine",
  "required_resources": ["resource1", "resource2"],
  "warning_signs": ["sign1"] or []
}`

      case 'validation':
        return `{
  "valid": true|false,
  "concerns": ["concern1"] or [],
  "risk_assessment": {
    "level": "low|moderate|high|critical",
    "factors": ["risk factor1"]
  },
  "requires_human_review": true|false,
  "recommendations": ["recommendation1"]
}`

      case 'treatment':
        return `{
  "medications": [
    {
      "drug": "medication name",
      "dosage": "dose amount",
      "frequency": "frequency",
      "duration": "treatment duration",
      "contraindications": ["contraindication1"] or []
    }
  ],
  "procedures": ["procedure1"] or [],
  "lifestyle_modifications": ["modification1"],
  "monitoring_plan": ["monitoring requirement1"]
}`

      case 'documentation':
        return `{
  "soap": {
    "subjective": "Patient's reported symptoms and history",
    "objective": "Objective findings and examination results",
    "assessment": "Clinical impression and diagnosis", 
    "plan": "Treatment plan and follow-up"
  },
  "icd10_codes": ["Z00.00"] or [],
  "billing_codes": ["99213"] or [],
  "follow_up_required": true|false
}`

      default:
        return '{ "result": "unknown decision type" }'
    }
  }

  validateDecision(decision: any, decisionType: string): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      switch (decisionType) {
        case 'diagnosis':
          this.validateDiagnosticDecision(decision, errors, warnings)
          break
        case 'triage':
          this.validateTriageDecision(decision, errors, warnings)
          break
        case 'validation':
          this.validateValidationDecision(decision, errors, warnings)
          break
        case 'treatment':
          this.validateTreatmentDecision(decision, errors, warnings)
          break
        case 'documentation':
          this.validateDocumentationDecision(decision, errors, warnings)
          break
      }
    } catch (error) {
      errors.push(`Validation error: ${error}`)
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      confidence: errors.length === 0 ? (warnings.length === 0 ? 1.0 : 0.8) : 0.3
    }
  }

  calculateConfidence(decision: MedicalDecision, request: BaseDecisionRequest): number {
    let confidence = 50 // Base confidence

    // Check completeness
    const decisionType = this.inferDecisionType(decision)
    if (decisionType === 'diagnosis' && 'differentials' in decision) {
      if (decision.differentials.length > 0) confidence += 20
      if (decision.tests_recommended.length > 0) confidence += 10
      if (decision.next_steps.length > 0) confidence += 10
    }

    // Check for required fields based on type
    if (this.hasRequiredFields(decision, decisionType)) {
      confidence += 10
    }

    return Math.min(100, Math.max(0, confidence))
  }

  createFallbackDecision(decisionType: string, request: BaseDecisionRequest): MedicalDecision {
    switch (decisionType) {
      case 'diagnosis':
        return {
          differentials: [{
            condition: 'Unable to determine - requires human evaluation',
            probability: 1.0,
            evidence: ['System error - fallback response']
          }],
          tests_recommended: ['Complete clinical evaluation'],
          red_flags: ['System unable to process - immediate human review required'],
          urgency_level: 2,
          next_steps: ['Immediate physician consultation required']
        } as DiagnosticDecision

      case 'triage':
        return {
          acuity_level: 2,
          disposition: 'urgent',
          time_to_physician: '15min',
          required_resources: ['physician evaluation'],
          warning_signs: ['System error - requires immediate human assessment']
        } as TriageDecision

      case 'validation':
        return {
          valid: false,
          concerns: ['System unable to validate - requires human review'],
          risk_assessment: {
            level: 'high',
            factors: ['System error', 'Unable to process decision']
          },
          requires_human_review: true,
          recommendations: ['Immediate human validation required']
        } as ValidationDecision

      case 'treatment':
        return {
          medications: [],
          procedures: [],
          lifestyle_modifications: ['Consult with physician for treatment plan'],
          monitoring_plan: ['Immediate physician consultation required']
        } as TreatmentDecision

      case 'documentation':
        return {
          soap: {
            subjective: 'System error - unable to process',
            objective: 'Documentation requires human input',
            assessment: 'System fallback - physician review needed',
            plan: 'Complete documentation with physician oversight'
          },
          icd10_codes: [],
          billing_codes: [],
          follow_up_required: true
        } as DocumentationDecision

      default:
        return {} as MedicalDecision
    }
  }

  // Helper validation methods
  private validateDiagnosticDecision(decision: any, errors: string[], warnings: string[]): void {
    if (!decision.differentials || !Array.isArray(decision.differentials)) {
      errors.push('Missing or invalid differentials array')
    } else if (decision.differentials.length === 0) {
      warnings.push('No differential diagnoses provided')
    }

    if (!decision.urgency_level || decision.urgency_level < 1 || decision.urgency_level > 5) {
      errors.push('Invalid urgency level (must be 1-5)')
    }
  }

  private validateTriageDecision(decision: any, errors: string[], warnings: string[]): void {
    if (!decision.acuity_level || decision.acuity_level < 1 || decision.acuity_level > 5) {
      errors.push('Invalid acuity level (must be 1-5)')
    }

    const validDispositions = ['immediate', 'urgent', 'semi_urgent', 'standard', 'non_urgent']
    if (!decision.disposition || !validDispositions.includes(decision.disposition)) {
      errors.push('Invalid disposition')
    }
  }

  private validateValidationDecision(decision: any, errors: string[], warnings: string[]): void {
    if (typeof decision.valid !== 'boolean') {
      errors.push('Missing or invalid valid field')
    }

    if (!decision.risk_assessment || !decision.risk_assessment.level) {
      errors.push('Missing risk assessment')
    }
  }

  private validateTreatmentDecision(decision: any, errors: string[], warnings: string[]): void {
    if (!Array.isArray(decision.medications)) {
      errors.push('Missing or invalid medications array')
    }

    if (!Array.isArray(decision.monitoring_plan)) {
      warnings.push('Missing monitoring plan')
    }
  }

  private validateDocumentationDecision(decision: any, errors: string[], warnings: string[]): void {
    if (!decision.soap || typeof decision.soap !== 'object') {
      errors.push('Missing or invalid SOAP notes')
    } else {
      const requiredSoapFields = ['subjective', 'objective', 'assessment', 'plan']
      for (const field of requiredSoapFields) {
        if (!decision.soap[field]) {
          errors.push(`Missing SOAP ${field}`)
        }
      }
    }
  }

  private inferDecisionType(decision: any): string {
    if ('differentials' in decision) return 'diagnosis'
    if ('acuity_level' in decision) return 'triage'
    if ('valid' in decision && 'risk_assessment' in decision) return 'validation'
    if ('medications' in decision) return 'treatment'
    if ('soap' in decision) return 'documentation'
    return 'unknown'
  }

  private hasRequiredFields(decision: any, decisionType: string): boolean {
    switch (decisionType) {
      case 'diagnosis':
        return 'differentials' in decision && 'urgency_level' in decision
      case 'triage':
        return 'acuity_level' in decision && 'disposition' in decision
      case 'validation':
        return 'valid' in decision && 'risk_assessment' in decision
      case 'treatment':
        return 'medications' in decision
      case 'documentation':
        return 'soap' in decision
      default:
        return false
    }
  }
}