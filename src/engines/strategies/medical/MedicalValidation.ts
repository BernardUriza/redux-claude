// src/engines/strategies/medical/MedicalValidation.ts
// Medical domain validation logic
// Created by Bernard Orozco

import { ValidationResult, ConfidenceMetrics } from '../../core/interfaces/IDecisionTypes'
import { 
  MedicalDecisionType, 
  MedicalDecisionUnion,
  DiagnosticDecision,
  ValidationDecision,
  TreatmentDecision,
  TriageDecision,
  DocumentationDecision 
} from './MedicalTypes'

export class MedicalValidation {
  static validateDecisionStructure(
    decision: any,
    decisionType: MedicalDecisionType
  ): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      confidence: 1.0
    }

    try {
      switch (decisionType) {
        case 'diagnosis':
          this.validateDiagnosticDecision(decision, result)
          break
        case 'triage':
          this.validateTriageDecision(decision, result)
          break
        case 'validation':
          this.validateValidationDecision(decision, result)
          break
        case 'treatment':
          this.validateTreatmentDecision(decision, result)
          break
        case 'documentation':
          this.validateDocumentationDecision(decision, result)
          break
        default:
          result.errors.push(`Unknown decision type: ${decisionType}`)
          result.valid = false
      }
    } catch (error) {
      result.errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      result.valid = false
    }

    // Calculate confidence based on validation results
    if (result.errors.length > 0) {
      result.confidence = 0
      result.valid = false
    } else if (result.warnings.length > 0) {
      result.confidence = Math.max(0.5, 1 - (result.warnings.length * 0.1))
    }

    return result
  }

  private static validateDiagnosticDecision(decision: any, result: ValidationResult): void {
    if (!decision.differentials || !Array.isArray(decision.differentials)) {
      result.errors.push('Missing or invalid differentials array')
      return
    }

    if (decision.differentials.length === 0) {
      result.warnings.push('No differential diagnoses provided')
    }

    decision.differentials.forEach((diff: any, index: number) => {
      if (!diff.condition || typeof diff.condition !== 'string') {
        result.errors.push(`Differential ${index}: missing or invalid condition`)
      }
      if (!diff.icd10 || typeof diff.icd10 !== 'string') {
        result.errors.push(`Differential ${index}: missing or invalid ICD-10 code`)
      }
      if (typeof diff.probability !== 'number' || diff.probability < 0 || diff.probability > 1) {
        result.errors.push(`Differential ${index}: invalid probability (must be 0-1)`)
      }
      if (!Array.isArray(diff.evidence)) {
        result.errors.push(`Differential ${index}: missing or invalid evidence array`)
      }
    })

    if (!Array.isArray(decision.tests_recommended)) {
      result.errors.push('Missing or invalid tests_recommended array')
    }

    if (!Array.isArray(decision.red_flags)) {
      result.errors.push('Missing or invalid red_flags array')
    }

    if (typeof decision.urgency_level !== 'number' || 
        decision.urgency_level < 1 || 
        decision.urgency_level > 5) {
      result.errors.push('Invalid urgency_level (must be 1-5)')
    }

    if (!Array.isArray(decision.next_steps)) {
      result.errors.push('Missing or invalid next_steps array')
    }

    // Warnings for quality
    if (decision.red_flags.length === 0) {
      result.warnings.push('No red flags identified - consider patient safety')
    }

    if (decision.tests_recommended.length === 0) {
      result.warnings.push('No tests recommended - consider diagnostic workup')
    }
  }

  private static validateTriageDecision(decision: any, result: ValidationResult): void {
    if (typeof decision.acuity_level !== 'number' || 
        decision.acuity_level < 1 || 
        decision.acuity_level > 5) {
      result.errors.push('Invalid acuity_level (must be 1-5)')
    }

    const validDispositions = ['immediate', 'urgent', 'semi_urgent', 'standard', 'non_urgent']
    if (!decision.disposition || !validDispositions.includes(decision.disposition)) {
      result.errors.push('Invalid disposition')
    }

    if (!decision.time_to_physician || typeof decision.time_to_physician !== 'string') {
      result.errors.push('Missing or invalid time_to_physician')
    }

    if (!Array.isArray(decision.required_resources)) {
      result.errors.push('Missing or invalid required_resources array')
    }

    if (!Array.isArray(decision.warning_signs)) {
      result.errors.push('Missing or invalid warning_signs array')
    }

    // Validate consistency between acuity and disposition
    const acuityDispositionMap: Record<number, string[]> = {
      1: ['immediate'],
      2: ['urgent'],
      3: ['semi_urgent', 'urgent'],
      4: ['standard'],
      5: ['non_urgent', 'standard']
    }

    if (decision.acuity_level && decision.disposition) {
      const validDispositionsForAcuity = acuityDispositionMap[decision.acuity_level]
      if (!validDispositionsForAcuity?.includes(decision.disposition)) {
        result.warnings.push(`Disposition '${decision.disposition}' may not match acuity level ${decision.acuity_level}`)
      }
    }
  }

  private static validateValidationDecision(decision: any, result: ValidationResult): void {
    if (typeof decision.valid !== 'boolean') {
      result.errors.push('Missing or invalid valid field (must be boolean)')
    }

    if (!Array.isArray(decision.concerns)) {
      result.errors.push('Missing or invalid concerns array')
    }

    if (!decision.risk_assessment || typeof decision.risk_assessment !== 'object') {
      result.errors.push('Missing or invalid risk_assessment object')
    } else {
      const validRiskLevels = ['low', 'moderate', 'high', 'critical']
      if (!decision.risk_assessment.level || !validRiskLevels.includes(decision.risk_assessment.level)) {
        result.errors.push('Invalid risk assessment level')
      }

      if (!Array.isArray(decision.risk_assessment.factors)) {
        result.errors.push('Missing or invalid risk factors array')
      }
    }

    if (typeof decision.requires_human_review !== 'boolean') {
      result.errors.push('Missing or invalid requires_human_review field (must be boolean)')
    }

    if (!Array.isArray(decision.recommendations)) {
      result.errors.push('Missing or invalid recommendations array')
    }

    // Quality warnings
    if (decision.valid === false && decision.concerns.length === 0) {
      result.warnings.push('Decision marked invalid but no concerns listed')
    }

    if (decision.risk_assessment?.level === 'critical' && !decision.requires_human_review) {
      result.warnings.push('Critical risk level should require human review')
    }
  }

  private static validateTreatmentDecision(decision: any, result: ValidationResult): void {
    if (!Array.isArray(decision.medications)) {
      result.errors.push('Missing or invalid medications array')
    } else {
      decision.medications.forEach((med: any, index: number) => {
        if (!med.drug || typeof med.drug !== 'string') {
          result.errors.push(`Medication ${index}: missing or invalid drug name`)
        }
        if (!med.dosage || typeof med.dosage !== 'string') {
          result.errors.push(`Medication ${index}: missing or invalid dosage`)
        }
        if (!med.frequency || typeof med.frequency !== 'string') {
          result.errors.push(`Medication ${index}: missing or invalid frequency`)
        }
        if (!med.duration || typeof med.duration !== 'string') {
          result.errors.push(`Medication ${index}: missing or invalid duration`)
        }
        if (!Array.isArray(med.contraindications)) {
          result.errors.push(`Medication ${index}: missing or invalid contraindications array`)
        }
      })
    }

    if (!Array.isArray(decision.procedures)) {
      result.errors.push('Missing or invalid procedures array')
    }

    if (!Array.isArray(decision.lifestyle_modifications)) {
      result.errors.push('Missing or invalid lifestyle_modifications array')
    }

    if (!Array.isArray(decision.monitoring_plan)) {
      result.errors.push('Missing or invalid monitoring_plan array')
    }

    // Quality warnings
    if (decision.medications.length === 0 && decision.procedures.length === 0) {
      result.warnings.push('No medications or procedures specified in treatment plan')
    }

    if (decision.monitoring_plan.length === 0) {
      result.warnings.push('No monitoring plan specified - consider patient follow-up')
    }
  }

  private static validateDocumentationDecision(decision: any, result: ValidationResult): void {
    if (!decision.soap || typeof decision.soap !== 'object') {
      result.errors.push('Missing or invalid SOAP note object')
    } else {
      const soapSections = ['subjective', 'objective', 'assessment', 'plan']
      soapSections.forEach(section => {
        if (!decision.soap[section] || typeof decision.soap[section] !== 'string') {
          result.errors.push(`SOAP note missing or invalid ${section} section`)
        }
      })
    }

    if (!Array.isArray(decision.icd10_codes)) {
      result.errors.push('Missing or invalid icd10_codes array')
    }

    if (!Array.isArray(decision.billing_codes)) {
      result.errors.push('Missing or invalid billing_codes array')
    }

    if (typeof decision.follow_up_required !== 'boolean') {
      result.errors.push('Missing or invalid follow_up_required field (must be boolean)')
    }

    // Quality warnings
    if (decision.icd10_codes.length === 0) {
      result.warnings.push('No ICD-10 codes specified - may affect billing and reporting')
    }

    if (decision.billing_codes.length === 0) {
      result.warnings.push('No billing codes specified - may affect reimbursement')
    }
  }

  static calculateConfidence(
    decision: MedicalDecisionUnion,
    decisionType: MedicalDecisionType
  ): ConfidenceMetrics {
    let baseConfidence = 75 // Base confidence
    const adjustments: Array<{ factor: string; adjustment: number; reason: string }> = []

    switch (decisionType) {
      case 'diagnosis':
        const diag = decision as DiagnosticDecision
        if (diag.differentials?.length > 1) {
          adjustments.push({ factor: 'multiple_differentials', adjustment: 10, reason: 'Multiple differential diagnoses considered' })
        }
        if (diag.tests_recommended?.length > 0) {
          adjustments.push({ factor: 'tests_recommended', adjustment: 5, reason: 'Diagnostic tests recommended' })
        }
        if (diag.red_flags?.length > 0) {
          adjustments.push({ factor: 'red_flags_identified', adjustment: 5, reason: 'Red flags identified for safety' })
        }
        if (diag.urgency_level === 1) {
          adjustments.push({ factor: 'critical_urgency', adjustment: -5, reason: 'Critical cases require careful human review' })
        }
        break

      case 'triage':
        const triage = decision as TriageDecision
        if (triage.required_resources?.length > 0) {
          adjustments.push({ factor: 'resources_identified', adjustment: 10, reason: 'Required resources identified' })
        }
        if (triage.warning_signs?.length > 0) {
          adjustments.push({ factor: 'warning_signs', adjustment: 5, reason: 'Warning signs identified' })
        }
        if (triage.acuity_level === 1) {
          adjustments.push({ factor: 'immediate_acuity', adjustment: -5, reason: 'Immediate acuity requires human verification' })
        }
        break

      case 'validation':
        const validation = decision as ValidationDecision
        if (validation.recommendations?.length > 0) {
          adjustments.push({ factor: 'recommendations_provided', adjustment: 10, reason: 'Recommendations provided' })
        }
        if (validation.risk_assessment) {
          adjustments.push({ factor: 'risk_assessed', adjustment: 5, reason: 'Risk assessment completed' })
        }
        if (validation.risk_assessment?.level === 'critical') {
          adjustments.push({ factor: 'critical_risk', adjustment: -10, reason: 'Critical risk requires human review' })
        }
        break

      case 'treatment':
        const treatment = decision as TreatmentDecision
        if (treatment.medications?.length > 0) {
          adjustments.push({ factor: 'medications_prescribed', adjustment: 10, reason: 'Medications prescribed' })
        }
        if (treatment.monitoring_plan?.length > 0) {
          adjustments.push({ factor: 'monitoring_plan', adjustment: 5, reason: 'Monitoring plan included' })
        }
        if (treatment.medications?.some(med => med.contraindications?.length > 0)) {
          adjustments.push({ factor: 'contraindications_checked', adjustment: 5, reason: 'Contraindications considered' })
        }
        break

      case 'documentation':
        const docs = decision as DocumentationDecision
        if (docs.icd10_codes?.length > 0) {
          adjustments.push({ factor: 'icd10_codes', adjustment: 10, reason: 'ICD-10 codes provided' })
        }
        if (docs.billing_codes?.length > 0) {
          adjustments.push({ factor: 'billing_codes', adjustment: 5, reason: 'Billing codes provided' })
        }
        break
    }

    // Apply adjustments
    const totalAdjustment = adjustments.reduce((sum, adj) => sum + adj.adjustment, 0)
    const finalConfidence = Math.min(95, Math.max(60, baseConfidence + totalAdjustment))

    return {
      baseConfidence,
      adjustments,
      finalConfidence
    }
  }
}