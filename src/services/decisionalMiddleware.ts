// src/services/decisionalMiddleware.ts
// BACKWARD COMPATIBILITY WRAPPER for the new Decision Engine Architecture
// This file maintains the original API while using the new architecture underneath
// Created by Bernard Orozco - Refactored 2024-08-18

import { 
  AgentType, 
  AgentDecision, 
  DiagnosticDecision, 
  ValidationDecision, 
  TreatmentDecision, 
  TriageDecision, 
  DocumentationDecision 
} from '@/types/agents'
import { decisionEngineService } from './DecisionEngineService'
import { MedicalDecisionUnion } from '../engines/strategies/medical/MedicalTypes'

// ORIGINAL TYPES - Maintained for backward compatibility
export type DecisionType = 'diagnosis' | 'validation' | 'treatment' | 'triage' | 'documentation'
export type ProviderType = 'claude' | 'openai' | 'local'

export interface DecisionRequest {
  type: DecisionType
  input: string
  provider?: ProviderType
  signal?: AbortSignal
  previousDecisions?: AgentDecision[]
  context?: Record<string, unknown>
}

export interface DecisionResponse {
  decision: AgentDecision
  confidence: number
  latency: number
  provider: ProviderType
  success: boolean
  error?: string
}

/**
 * BACKWARD COMPATIBILITY WRAPPER
 * Función principal para llamar a Claude con decisiones específicas del agente
 * Now uses the new Decision Engine architecture underneath
 */
export async function callClaudeForDecision(
  type: DecisionType,
  input: string,
  provider: ProviderType = 'claude',
  signal?: AbortSignal,
  previousDecisions?: AgentDecision[],
  context?: Record<string, unknown>
): Promise<DecisionResponse> {
  try {
    // Use the new Decision Engine Service
    const response = await decisionEngineService.makeDecision(
      'medical', // All current decisions are medical domain
      type,
      input,
      {
        provider,
        signal,
        previousDecisions,
        context
      }
    )

    // Convert new response format to legacy format
    return {
      decision: convertToLegacyDecision(response.decision, type),
      confidence: response.confidence,
      latency: response.latency,
      provider: response.provider as ProviderType,
      success: response.success,
      error: response.error
    }

  } catch (error) {
    console.error(`Decision middleware error for ${type}:`, error)
    
    // Fallback to legacy behavior
    const mockDecision = createFallbackDecision(type, input)
    
    return {
      decision: mockDecision,
      confidence: 0.3,
      latency: 0,
      provider: 'local',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * LEGACY SUPPORT FUNCTIONS
 * These functions maintain backward compatibility with the old agent types
 */

/**
 * Convert new decision format to legacy AgentDecision format
 */
function convertToLegacyDecision(newDecision: any, type: DecisionType): AgentDecision {
  // The new decision format already matches the legacy format for medical decisions
  // We just need to remove the new fields that weren't in the original types
  const legacyDecision = { ...newDecision }
  
  // Remove new fields that don't exist in legacy types
  delete legacyDecision.id
  delete legacyDecision.domain
  delete legacyDecision.decisionType
  delete legacyDecision.timestamp
  delete legacyDecision.validationResults
  delete legacyDecision.metadata
  delete legacyDecision.reasoning
  
  return legacyDecision as AgentDecision
}

/**
 * LEGACY FALLBACK FUNCTION - Maintained for backward compatibility
 * This function is now only used when the new engine fails
 */

function createFallbackDecision(type: DecisionType, input: string): AgentDecision {
  // This fallback now delegates to the medical strategy's fallback logic
  // if the new engine is available, otherwise uses simple defaults
  switch (type) {
    case 'diagnosis':
      return {
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
        acuity_level: 3,
        disposition: 'standard',
        time_to_physician: '1 hour',
        required_resources: ['Evaluación médica estándar'],
        warning_signs: []
      } as TriageDecision

    case 'validation':
      return {
        valid: false,
        concerns: ['Requiere revisión médica humana'],
        risk_assessment: { level: 'moderate', factors: ['Evaluación automática limitada'] },
        requires_human_review: true,
        recommendations: ['Consulta con médico especialista']
      } as ValidationDecision

    case 'treatment':
      return {
        medications: [],
        procedures: ['Evaluación médica presencial'],
        lifestyle_modifications: ['Seguir indicaciones médicas'],
        monitoring_plan: ['Seguimiento médico regular']
      } as TreatmentDecision

    case 'documentation':
      return {
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
      return {} as AgentDecision
  }
}

/**
 * LEGACY MAPPING FUNCTION - Still needed for backward compatibility
 * Mapear AgentType a DecisionType
 */
export function mapAgentTypeToDecisionType(agentType: AgentType): DecisionType {
  switch (agentType) {
    case AgentType.DIAGNOSTIC: return 'diagnosis'
    case AgentType.VALIDATION: return 'validation' 
    case AgentType.TREATMENT: return 'treatment'
    case AgentType.TRIAGE: return 'triage'
    case AgentType.DOCUMENTATION: return 'documentation'
    default: return 'diagnosis'
  }
}

// ==========================================
// NEW ARCHITECTURE EXPORTS
// ==========================================

/**
 * Access to the new Decision Engine Service for direct use
 * This allows gradual migration to the new architecture
 */
export { decisionEngineService } from './DecisionEngineService'

/**
 * Re-export new types for those who want to migrate
 */
export type { 
  CoreDecisionRequest, 
  CoreDecisionResponse, 
  DecisionDomain 
} from '../engines/core/types/CoreDecisionTypes'

/**
 * Migration helper function for new architecture
 */
export async function makeDecisionWithNewEngine(
  domain: 'medical' | 'legal' | 'financial' | 'technical' | 'business',
  decisionType: string,
  input: string,
  options?: {
    provider?: ProviderType
    context?: Record<string, unknown>
    signal?: AbortSignal
  }
) {
  return decisionEngineService.makeDecision(domain, decisionType, input, options)
}