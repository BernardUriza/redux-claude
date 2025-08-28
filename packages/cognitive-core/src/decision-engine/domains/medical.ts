// src/decision-engine/domains/medical.ts
// Estrategia del dominio médico - Bernard Orozco

import type { DomainStrategy, BaseDecisionRequest, ValidationResult } from '../core/types'
import { getAgentDefinition } from '../../services/agentRegistry'
import {
  AgentType,
  MedicalAutocompletionDecision,
  CriticalDataValidationDecision,
  SpecialtyDetectionDecision,
} from '../../types/agents'
import { 
  MedicalExtractionOutput, 
  MedicalExtractionInput, 
  MedicalExtractionDecision,
  calculateCompleteness,
  isNOMCompliant
} from '../../types/medicalExtraction'

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
  | MedicalAutocompletionDecision
  | CriticalDataValidationDecision
  | SpecialtyDetectionDecision

export class MedicalStrategy implements DomainStrategy<MedicalDecision> {
  readonly domain = 'medical' as const
  readonly supportedTypes = [
    'diagnosis',
    'triage',
    'validation',
    'treatment',
    'documentation',
    'clinical_pharmacology',
    'pediatric_specialist',
    'hospitalization_criteria',
    'family_education',
    'objective_validation',
    'defensive_differential',
    'medical_autocompletion',
    'critical_data_validation',
    'specialty_detection',
    'intelligent_medical_chat',
    'medical_data_extractor', // 🧠 2025 Single-Purpose AI Middleware
  ]

  buildSystemPrompt(decisionType: string, request: BaseDecisionRequest): string {
    // Para los nuevos tipos especializados, usar prompts del AGENT_REGISTRY
    const agentTypeMap: Record<string, AgentType> = {
      clinical_pharmacology: AgentType.CLINICAL_PHARMACOLOGY,
      pediatric_specialist: AgentType.PEDIATRIC_SPECIALIST,
      hospitalization_criteria: AgentType.HOSPITALIZATION_CRITERIA,
      family_education: AgentType.FAMILY_EDUCATION,
      objective_validation: AgentType.OBJECTIVE_VALIDATION,
      defensive_differential: AgentType.DEFENSIVE_DIFFERENTIAL,
      medical_autocompletion: AgentType.MEDICAL_AUTOCOMPLETION,
      critical_data_validation: AgentType.CRITICAL_DATA_VALIDATION,
      specialty_detection: AgentType.SPECIALTY_DETECTION,
      intelligent_medical_chat: AgentType.INTELLIGENT_MEDICAL_CHAT,
    }

    const agentType = agentTypeMap[decisionType]
    if (agentType) {
      try {
        const agentDef = getAgentDefinition(agentType)
        return agentDef.systemPrompt
      } catch (error) {
        console.warn(`Could not get agent definition for ${agentType}, using fallback`)
      }
    }

    // Fallback para tipos existentes
    const basePrompt = 'You are a specialist medical AI assistant helping a licensed doctor.'

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

      case 'medical_data_extractor':
        return `You are a Medical Data Extraction Specialist using 2025 healthcare standards. Your role is to extract structured medical data from natural language input with HIPAA compliance.

<thinking>
Analyze the input step-by-step:
1. Demographics: Extract age and gender information
2. Clinical presentation: Identify chief complaint and symptoms  
3. Contextual data: Duration, intensity, characteristics, factors
4. Calculate completeness percentage and NOM compliance
</thinking>

CRITICAL RULES:
- Use "unknown" for missing fields, never guess or infer beyond what's explicitly stated
- Age/gender are NOM-required fields - prioritize these always
- Return structured JSON only, no explanatory text
- Apply weighted scoring: Demographics(40%) + Clinical(30%) + Context(30%)
- Mexican healthcare compliance: Age + gender required before SOAP generation

<answer>
Return only this JSON structure:
{
  "demographics": {
    "patient_age_years": number | "unknown",
    "patient_gender": "masculino" | "femenino" | "unknown", 
    "confidence_demographic": 0.0-1.0
  },
  "clinical_presentation": {
    "chief_complaint": "extracted complaint" | "unknown",
    "primary_symptoms": ["symptom1", "symptom2"] | null,
    "anatomical_location": "location" | "unknown",
    "confidence_symptoms": 0.0-1.0
  },
  "symptom_characteristics": {
    "duration_description": "extracted duration" | "unknown",
    "pain_intensity_scale": 1-10 | null,
    "pain_characteristics": ["extracted characteristics"] | null,
    "aggravating_factors": ["factors"] | null,
    "relieving_factors": ["factors"] | null,
    "associated_symptoms": ["symptoms"] | null,
    "temporal_pattern": "pattern" | "unknown",
    "confidence_context": 0.0-1.0
  },
  "extraction_metadata": {
    "overall_completeness_percentage": 0-100,
    "demographic_complete": boolean,
    "clinical_complete": boolean, 
    "context_complete": boolean,
    "nom_compliant": boolean,
    "ready_for_soap_generation": boolean,
    "missing_critical_fields": ["field names"],
    "extraction_timestamp": "ISO 8601",
    "claude_model_used": "claude-sonnet-4"
  }
}
</answer>`

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

      case 'medical_autocompletion':
        return `{
  "suggestions": [
    {
      "id": "basic",
      "title": "Consulta Básica",
      "description": "Estructura mínima requerida",
      "template": "Paciente [género] de [edad] años presenta [síntoma principal] desde hace [tiempo]. [Características del síntoma]. Antecedentes: [antecedentes].",
      "confidence": 0.85,
      "category": "basic"
    },
    {
      "id": "detailed", 
      "title": "Consulta Detallada",
      "description": "Incluye exploración física",
      "template": "Paciente [género] de [edad] años consulta por [motivo principal] de [tiempo]. SUBJETIVO: [síntomas]. OBJETIVO: [exploración].",
      "confidence": 0.90,
      "category": "detailed"
    },
    {
      "id": "specialized",
      "title": "Consulta Especializada", 
      "description": "Formato SOAP completo",
      "template": "CASO CLÍNICO: [descripción completa con formato SOAP].",
      "confidence": 0.95,
      "category": "specialized"
    }
  ],
  "enhanced_template": "template mejorado basado en input",
  "detected_specialty": "especialidad médica inferida",
  "patient_context": {
    "age_inferred": "edad inferida",
    "gender_inferred": "género inferido", 
    "main_complaint": "queja principal",
    "specialty_indicators": ["indicadores de especialidad"]
  }
}`

      case 'critical_data_validation':
        return `{
  "missing_fields": [
    {
      "field": "edad",
      "reason": "Necesaria para dosificación y diagnósticos diferenciales",
      "criticality": "high",
      "suggested_prompt": "¿Qué edad tiene el paciente?"
    }
  ],
  "can_proceed": false,
  "completion_percentage": 0.65,
  "next_required_action": "Completar datos básicos del paciente",
  "required_form_fields": ["age", "gender", "chief_complaint", "allergies"]
}`

      case 'specialty_detection':
        return `{
  "detected_specialty": "cardiología",
  "confidence": 0.85,
  "indicators": ["dolor torácico", "disnea de esfuerzo", "historia de HTA"],
  "suggested_form_fields": ["chest_pain_characteristics", "dyspnea_scale", "cardiovascular_history"],
  "specialized_prompts": ["Dolor torácico - Estudio completo", "Síndrome coronario agudo"],
  "recommended_tabs": [
    {
      "tab_name": "cardiovascular_exam",
      "priority": 1,
      "fields": ["blood_pressure", "heart_rate", "cardiac_auscultation"]
    }
  ]
}`

      case 'medical_data_extractor':
        return `{
  "demographics": {
    "patient_age_years": 25,
    "patient_gender": "masculino",
    "confidence_demographic": 0.95
  },
  "clinical_presentation": {
    "chief_complaint": "dolor torácico",
    "primary_symptoms": ["dolor", "disnea"],
    "anatomical_location": "tórax",
    "confidence_symptoms": 0.90
  },
  "symptom_characteristics": {
    "duration_description": "2 días",
    "pain_intensity_scale": 7,
    "pain_characteristics": ["punzante", "constante"],
    "aggravating_factors": ["ejercicio"],
    "relieving_factors": ["reposo"],
    "associated_symptoms": ["náusea"],
    "temporal_pattern": "continuo",
    "confidence_context": 0.80
  },
  "extraction_metadata": {
    "overall_completeness_percentage": 85,
    "demographic_complete": true,
    "clinical_complete": true,
    "context_complete": true,
    "nom_compliant": true,
    "ready_for_soap_generation": true,
    "missing_critical_fields": [],
    "extraction_timestamp": "2025-01-08T10:30:00Z",
    "claude_model_used": "claude-sonnet-4"
  }
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
        case 'medical_autocompletion':
          this.validateMedicalAutocompletionDecision(decision, errors, warnings)
          break
        case 'critical_data_validation':
          this.validateCriticalDataValidationDecision(decision, errors, warnings)
          break
        case 'specialty_detection':
          this.validateSpecialtyDetectionDecision(decision, errors, warnings)
          break
        case 'intelligent_medical_chat':
          this.validateIntelligentMedicalChatDecision(decision, errors, warnings)
          break
        case 'medical_data_extractor':
          this.validateMedicalDataExtractorDecision(decision, errors, warnings)
          break
      }
    } catch (error) {
      errors.push(`Validation error: ${error}`)
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      confidence: errors.length === 0 ? (warnings.length === 0 ? 1.0 : 0.8) : 0.3,
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
          differentials: [
            {
              condition: 'Unable to determine - requires human evaluation',
              probability: 1.0,
              evidence: ['System error - fallback response'],
            },
          ],
          tests_recommended: ['Complete clinical evaluation'],
          red_flags: ['System unable to process - immediate human review required'],
          urgency_level: 2,
          next_steps: ['Immediate physician consultation required'],
        } as DiagnosticDecision

      case 'triage':
        return {
          acuity_level: 2,
          disposition: 'urgent',
          time_to_physician: '15min',
          required_resources: ['physician evaluation'],
          warning_signs: ['System error - requires immediate human assessment'],
        } as TriageDecision

      case 'validation':
        return {
          valid: false,
          concerns: ['System unable to validate - requires human review'],
          risk_assessment: {
            level: 'high',
            factors: ['System error', 'Unable to process decision'],
          },
          requires_human_review: true,
          recommendations: ['Immediate human validation required'],
        } as ValidationDecision

      case 'treatment':
        return {
          medications: [],
          procedures: [],
          lifestyle_modifications: ['Consult with physician for treatment plan'],
          monitoring_plan: ['Immediate physician consultation required'],
        } as TreatmentDecision

      case 'documentation':
        return {
          soap: {
            subjective: 'System error - unable to process',
            objective: 'Documentation requires human input',
            assessment: 'System fallback - physician review needed',
            plan: 'Complete documentation with physician oversight',
          },
          icd10_codes: [],
          billing_codes: [],
          follow_up_required: true,
        } as DocumentationDecision

      case 'medical_autocompletion':
        return {
          suggestions: [
            {
              id: 'basic_fallback',
              title: 'Consulta Básica',
              description: 'Estructura mínima requerida',
              template:
                'Paciente [género] de [edad] años presenta [síntoma principal] desde hace [tiempo]. [Características del síntoma]. Antecedentes: [antecedentes].',
              confidence: 0.7,
              category: 'basic',
            },
            {
              id: 'detailed_fallback',
              title: 'Consulta Detallada',
              description: 'Con exploración física',
              template:
                'Paciente [género] de [edad] años consulta por [síntoma principal] de [tiempo]. SUBJETIVO: [síntomas]. OBJETIVO: [exploración]. Antecedentes: [antecedentes].',
              confidence: 0.75,
              category: 'detailed',
            },
            {
              id: 'specialized_fallback',
              title: 'Consulta Especializada',
              description: 'Formato SOAP completo',
              template:
                'CASO CLÍNICO: Paciente [género], [edad] años, presenta [síntoma principal]. SUBJETIVO: [historia]. OBJETIVO: [exploración]. ANÁLISIS: [diagnósticos]. PLAN: [tratamiento].',
              confidence: 0.8,
              category: 'specialized',
            },
          ],
          enhanced_template: 'Consulta médica estructurada requerida',
          detected_specialty: undefined,
          patient_context: {
            age_inferred: undefined,
            gender_inferred: undefined,
            main_complaint: 'síntomas reportados',
            specialty_indicators: [],
          },
        } as MedicalAutocompletionDecision

      case 'critical_data_validation':
        return {
          missing_fields: [
            {
              field: 'datos_básicos',
              reason: 'Error del sistema - información crítica no disponible',
              criticality: 'high',
              suggested_prompt: 'Complete los datos básicos del paciente',
            },
          ],
          can_proceed: false,
          completion_percentage: 0.1,
          next_required_action: 'Sistema en fallback - completar información manualmente',
          required_form_fields: ['age', 'gender', 'chief_complaint'],
        } as CriticalDataValidationDecision

      case 'specialty_detection':
        return {
          detected_specialty: 'medicina_general',
          confidence: 0.5,
          indicators: ['fallback del sistema'],
          suggested_form_fields: ['basic_symptoms', 'general_examination'],
          specialized_prompts: ['Consulta general'],
          recommended_tabs: [
            {
              tab_name: 'general_form',
              priority: 1,
              fields: ['age', 'gender', 'symptoms'],
            },
          ],
        } as SpecialtyDetectionDecision

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

  private validateMedicalAutocompletionDecision(
    decision: any,
    errors: string[],
    warnings: string[]
  ): void {
    if (!decision.suggestions || !Array.isArray(decision.suggestions)) {
      errors.push('Missing or invalid suggestions array')
    } else {
      if (decision.suggestions.length !== 3) {
        errors.push('Must have exactly 3 suggestions')
      }

      decision.suggestions.forEach((suggestion: any, index: number) => {
        if (!suggestion.id || !suggestion.title || !suggestion.template) {
          errors.push(`Suggestion ${index + 1} missing required fields (id, title, template)`)
        }
        if (
          !suggestion.category ||
          !['basic', 'detailed', 'specialized'].includes(suggestion.category)
        ) {
          errors.push(`Suggestion ${index + 1} has invalid category`)
        }
      })
    }

    if (!decision.patient_context) {
      warnings.push('Missing patient context inference')
    }
  }

  private validateCriticalDataValidationDecision(
    decision: any,
    errors: string[],
    warnings: string[]
  ): void {
    if (typeof decision.can_proceed !== 'boolean') {
      errors.push('Missing or invalid can_proceed field')
    }

    if (!decision.missing_fields || !Array.isArray(decision.missing_fields)) {
      errors.push('Missing or invalid missing_fields array')
    } else {
      decision.missing_fields.forEach((field: any, index: number) => {
        if (!field.field || !field.reason || !field.criticality || !field.suggested_prompt) {
          errors.push(`Missing field ${index + 1} missing required properties`)
        }
        if (!['high', 'medium', 'low'].includes(field.criticality)) {
          errors.push(`Missing field ${index + 1} has invalid criticality`)
        }
      })
    }

    if (
      typeof decision.completion_percentage !== 'number' ||
      decision.completion_percentage < 0 ||
      decision.completion_percentage > 1
    ) {
      errors.push('Invalid completion_percentage (must be number between 0-1)')
    }
  }

  private validateSpecialtyDetectionDecision(
    decision: any,
    errors: string[],
    warnings: string[]
  ): void {
    if (!decision.detected_specialty || typeof decision.detected_specialty !== 'string') {
      errors.push('Missing or invalid detected_specialty')
    }

    if (
      typeof decision.confidence !== 'number' ||
      decision.confidence < 0 ||
      decision.confidence > 1
    ) {
      errors.push('Invalid confidence (must be number between 0-1)')
    }

    if (!decision.indicators || !Array.isArray(decision.indicators)) {
      warnings.push('Missing indicators array')
    }

    if (!decision.recommended_tabs || !Array.isArray(decision.recommended_tabs)) {
      warnings.push('Missing recommended_tabs array')
    } else {
      decision.recommended_tabs.forEach((tab: any, index: number) => {
        if (!tab.tab_name || typeof tab.priority !== 'number' || !Array.isArray(tab.fields)) {
          errors.push(`Recommended tab ${index + 1} missing required properties`)
        }
      })
    }
  }

  private inferDecisionType(decision: any): string {
    if ('differentials' in decision) return 'diagnosis'
    if ('acuity_level' in decision) return 'triage'
    if ('valid' in decision && 'risk_assessment' in decision) return 'validation'
    if ('medications' in decision) return 'treatment'
    if ('soap' in decision) return 'documentation'
    if ('suggestions' in decision && Array.isArray(decision.suggestions))
      return 'medical_autocompletion'
    if ('can_proceed' in decision && 'missing_fields' in decision) return 'critical_data_validation'
    if ('detected_specialty' in decision && 'confidence' in decision) return 'specialty_detection'
    return 'unknown'
  }

  private validateIntelligentMedicalChatDecision(
    decision: any,
    errors: string[],
    warnings: string[]
  ): void {
    if (!decision.message || typeof decision.message !== 'string') {
      errors.push('Missing or invalid message field')
    }

    if (!decision.inferences || !Array.isArray(decision.inferences)) {
      warnings.push('Missing or invalid inferences array')
    } else {
      decision.inferences.forEach((inference: any, index: number) => {
        if (!inference.id || !inference.category || !inference.inference) {
          errors.push(`Inference ${index + 1} missing required fields (id, category, inference)`)
        }
        if (typeof inference.confidence !== 'number' || inference.confidence < 0 || inference.confidence > 1) {
          errors.push(`Inference ${index + 1} has invalid confidence value`)
        }
      })
    }

    if (!decision.suggested_actions || !Array.isArray(decision.suggested_actions)) {
      warnings.push('Missing suggested_actions array')
    }

    const validConfidenceLevels = ['low', 'medium', 'high']
    if (!decision.confidence_level || !validConfidenceLevels.includes(decision.confidence_level)) {
      errors.push('Invalid confidence_level')
    }

    const validStages = ['initial', 'gathering', 'analyzing', 'concluding']
    if (!decision.conversation_stage || !validStages.includes(decision.conversation_stage)) {
      errors.push('Invalid conversation_stage')
    }

    if (typeof decision.requires_user_input !== 'boolean') {
      errors.push('Missing or invalid requires_user_input field')
    }
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
      case 'medical_autocompletion':
        return (
          'suggestions' in decision &&
          Array.isArray(decision.suggestions) &&
          decision.suggestions.length === 3
        )
      case 'critical_data_validation':
        return (
          'can_proceed' in decision &&
          'missing_fields' in decision &&
          'completion_percentage' in decision
        )
      case 'specialty_detection':
        return (
          'detected_specialty' in decision && 'confidence' in decision && 'indicators' in decision
        )
      case 'intelligent_medical_chat':
        return (
          'message' in decision && 
          'confidence_level' in decision &&
          'conversation_stage' in decision &&
          'requires_user_input' in decision
        )
      case 'medical_data_extractor':
        return (
          'demographics' in decision &&
          'clinical_presentation' in decision &&
          'symptom_characteristics' in decision &&
          'extraction_metadata' in decision
        )
      default:
        return false
    }
  }

  // 🧠 2025 Medical Data Extractor Validation - Creado por Bernard Orozco
  private validateMedicalDataExtractorDecision(
    decision: any,
    errors: string[],
    warnings: string[]
  ): void {
    // Validate demographics section
    if (!decision.demographics) {
      errors.push('Missing demographics section')
    } else {
      const demo = decision.demographics
      if (!demo.patient_age_years && demo.patient_age_years !== 0) {
        warnings.push('Missing patient age (required for NOM compliance)')
      }
      if (!demo.patient_gender || !['masculino', 'femenino', 'unknown'].includes(demo.patient_gender)) {
        warnings.push('Missing or invalid patient gender (required for NOM compliance)')
      }
      if (typeof demo.confidence_demographic !== 'number' || demo.confidence_demographic < 0 || demo.confidence_demographic > 1) {
        errors.push('Invalid demographic confidence score (must be 0.0-1.0)')
      }
    }

    // Validate clinical presentation section
    if (!decision.clinical_presentation) {
      errors.push('Missing clinical_presentation section')
    } else {
      const clinical = decision.clinical_presentation
      if (!clinical.chief_complaint) {
        warnings.push('Missing chief complaint (critical medical data)')
      }
      if (typeof clinical.confidence_symptoms !== 'number' || clinical.confidence_symptoms < 0 || clinical.confidence_symptoms > 1) {
        errors.push('Invalid symptom confidence score (must be 0.0-1.0)')
      }
    }

    // Validate symptom characteristics section
    if (!decision.symptom_characteristics) {
      errors.push('Missing symptom_characteristics section')
    } else {
      const symptoms = decision.symptom_characteristics
      if (symptoms.pain_intensity_scale && (symptoms.pain_intensity_scale < 1 || symptoms.pain_intensity_scale > 10)) {
        errors.push('Invalid pain intensity scale (must be 1-10)')
      }
      if (typeof symptoms.confidence_context !== 'number' || symptoms.confidence_context < 0 || symptoms.confidence_context > 1) {
        errors.push('Invalid context confidence score (must be 0.0-1.0)')
      }
    }

    // Validate extraction metadata section
    if (!decision.extraction_metadata) {
      errors.push('Missing extraction_metadata section')
    } else {
      const metadata = decision.extraction_metadata
      if (typeof metadata.overall_completeness_percentage !== 'number' || 
          metadata.overall_completeness_percentage < 0 || 
          metadata.overall_completeness_percentage > 100) {
        errors.push('Invalid completeness percentage (must be 0-100)')
      }
      if (typeof metadata.demographic_complete !== 'boolean') {
        errors.push('demographic_complete must be boolean')
      }
      if (typeof metadata.clinical_complete !== 'boolean') {
        errors.push('clinical_complete must be boolean')
      }
      if (typeof metadata.context_complete !== 'boolean') {
        errors.push('context_complete must be boolean')
      }
      if (typeof metadata.nom_compliant !== 'boolean') {
        errors.push('nom_compliant must be boolean')
      }
      if (typeof metadata.ready_for_soap_generation !== 'boolean') {
        errors.push('ready_for_soap_generation must be boolean')
      }
      if (!Array.isArray(metadata.missing_critical_fields)) {
        warnings.push('missing_critical_fields should be an array')
      }
      if (!metadata.extraction_timestamp) {
        warnings.push('Missing extraction timestamp')
      }
      if (!metadata.claude_model_used) {
        warnings.push('Missing Claude model information')
      }
    }

    // Cross-validation rules
    if (decision.demographics && decision.extraction_metadata) {
      // Check NOM compliance consistency
      const hasAge = decision.demographics.patient_age_years !== "unknown" && decision.demographics.patient_age_years !== null
      const hasGender = decision.demographics.patient_gender !== "unknown" && decision.demographics.patient_gender !== null
      const nomCompliant = hasAge && hasGender
      
      if (decision.extraction_metadata.nom_compliant !== nomCompliant) {
        warnings.push('NOM compliance flag inconsistent with actual age/gender data')
      }
    }
  }
}
