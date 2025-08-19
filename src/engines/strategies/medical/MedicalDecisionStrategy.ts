// src/engines/strategies/medical/MedicalDecisionStrategy.ts
// Medical domain decision strategy implementation
// Created by Bernard Orozco

import { nanoid } from '@reduxjs/toolkit'
import { IDecisionStrategy } from '../../core/interfaces/IDecisionStrategy'
import { BaseDecisionRequest, ValidationResult, ConfidenceMetrics } from '../../core/interfaces/IDecisionTypes'
import { 
  MedicalDecisionType, 
  MedicalDecisionUnion,
  DiagnosticDecision,
  ValidationDecision,
  TreatmentDecision,
  TriageDecision,
  DocumentationDecision 
} from './MedicalTypes'
import { MedicalPrompts } from './MedicalPrompts'
import { MedicalValidation } from './MedicalValidation'

export class MedicalDecisionStrategy implements IDecisionStrategy<MedicalDecisionUnion> {
  readonly domain = 'medical'
  readonly supportedDecisionTypes = ['diagnosis', 'validation', 'treatment', 'triage', 'documentation']

  buildSystemPrompt(decisionType: string, request: BaseDecisionRequest): string {
    const medicalDecisionType = decisionType as MedicalDecisionType
    
    // Get base system prompt
    let systemPrompt = MedicalPrompts.getSystemPrompt(medicalDecisionType)
    
    // Add contextual information
    const contextualAdditions = MedicalPrompts.getContextualPromptAdditions(
      medicalDecisionType,
      request.previousDecisions,
      request.context
    )
    
    return systemPrompt + contextualAdditions
  }

  buildJsonFormatRequirements(decisionType: string): string {
    const medicalDecisionType = decisionType as MedicalDecisionType
    return MedicalPrompts.getJsonFormatRequirements(medicalDecisionType)
  }

  validateDecisionStructure(decision: any, decisionType: string): ValidationResult {
    const medicalDecisionType = decisionType as MedicalDecisionType
    return MedicalValidation.validateDecisionStructure(decision, medicalDecisionType)
  }

  calculateConfidence(
    decision: MedicalDecisionUnion,
    decisionType: string,
    request: BaseDecisionRequest
  ): ConfidenceMetrics {
    const medicalDecisionType = decisionType as MedicalDecisionType
    return MedicalValidation.calculateConfidence(decision, medicalDecisionType)
  }

  createFallbackDecision(decisionType: string, request: BaseDecisionRequest): MedicalDecisionUnion {
    const medicalDecisionType = decisionType as MedicalDecisionType
    const baseDecision = {
      id: nanoid(),
      type: decisionType,
      domain: 'medical' as const,
      decisionType: medicalDecisionType,
      confidence: 0.3,
      timestamp: Date.now(),
      reasoning: 'Fallback decision due to API failure'
    }

    switch (medicalDecisionType) {
      case 'diagnosis':
        return {
          ...baseDecision,
          decisionType: 'diagnosis',
          differentials: [
            { 
              condition: 'Requiere evaluación médica', 
              icd10: 'Z00.00', 
              probability: 0.5, 
              evidence: ['Síntomas reportados'] 
            }
          ],
          tests_recommended: ['Evaluación clínica completa'],
          red_flags: [],
          urgency_level: 3,
          next_steps: ['Consulta médica presencial']
        } as DiagnosticDecision

      case 'triage':
        return {
          ...baseDecision,
          decisionType: 'triage',
          acuity_level: 3,
          disposition: 'standard',
          time_to_physician: '1 hour',
          required_resources: ['Evaluación médica estándar'],
          warning_signs: []
        } as TriageDecision

      case 'validation':
        return {
          ...baseDecision,
          decisionType: 'validation',
          valid: false,
          concerns: ['Requiere revisión médica humana'],
          risk_assessment: { level: 'moderate', factors: ['Evaluación automática limitada'] },
          requires_human_review: true,
          recommendations: ['Consulta con médico especialista']
        } as ValidationDecision

      case 'treatment':
        return {
          ...baseDecision,
          decisionType: 'treatment',
          medications: [],
          procedures: ['Evaluación médica presencial'],
          lifestyle_modifications: ['Seguir indicaciones médicas'],
          monitoring_plan: ['Seguimiento médico regular']
        } as TreatmentDecision

      case 'documentation':
        return {
          ...baseDecision,
          decisionType: 'documentation',
          soap: {
            subjective: 'Paciente presenta síntomas que requieren evaluación',
            objective: 'Pendiente evaluación clínica',
            assessment: 'Requiere evaluación médica completa',
            plan: 'Referir para evaluación médica presencial'
          },
          icd10_codes: ['Z00.00'],
          billing_codes: [],
          follow_up_required: true
        } as DocumentationDecision

      default:
        throw new Error(`Unsupported medical decision type: ${medicalDecisionType}`)
    }
  }

  postProcessDecision(
    decision: MedicalDecisionUnion,
    decisionType: string,
    request: BaseDecisionRequest
  ): MedicalDecisionUnion {
    // Add any post-processing logic specific to medical decisions
    // For example, cross-validation, safety checks, etc.
    
    // Ensure critical decisions are flagged for human review
    if (decisionType === 'diagnosis') {
      const diag = decision as DiagnosticDecision
      if (diag.urgency_level === 1 || diag.red_flags.length > 2) {
        // Add metadata indicating need for urgent review
        decision.metadata = {
          ...decision.metadata,
          requiresUrgentReview: true,
          reviewReason: 'Critical diagnosis or multiple red flags'
        }
      }
    }

    if (decisionType === 'triage') {
      const triage = decision as TriageDecision
      if (triage.acuity_level === 1) {
        decision.metadata = {
          ...decision.metadata,
          requiresImmediateAction: true,
          reviewReason: 'Level 1 acuity requires immediate medical attention'
        }
      }
    }

    if (decisionType === 'validation') {
      const validation = decision as ValidationDecision
      if (validation.risk_assessment.level === 'critical') {
        decision.metadata = {
          ...decision.metadata,
          requiresUrgentReview: true,
          reviewReason: 'Critical risk level identified'
        }
      }
    }

    return decision
  }

  preProcessRequest(request: BaseDecisionRequest, decisionType: string): BaseDecisionRequest {
    // Add any pre-processing logic specific to medical requests
    // For example, sanitize input, add medical context, etc.
    
    const processedRequest = { ...request }
    
    // Ensure medical context structure
    if (!processedRequest.context) {
      processedRequest.context = {}
    }

    // Add medical-specific metadata
    processedRequest.metadata = {
      ...processedRequest.metadata,
      domain: 'medical',
      decisionType,
      processedAt: Date.now(),
      requiresComplianceCheck: true
    }

    // Sanitize medical input for privacy/security
    if (processedRequest.input) {
      // Remove any potential PII patterns (basic sanitization)
      // In a real implementation, this would be more sophisticated
      processedRequest.input = processedRequest.input.replace(
        /\b\d{3}-\d{2}-\d{4}\b/g, // SSN pattern
        '[SSN-REDACTED]'
      )
    }

    return processedRequest
  }
}

// Export singleton instance
export const medicalDecisionStrategy = new MedicalDecisionStrategy()