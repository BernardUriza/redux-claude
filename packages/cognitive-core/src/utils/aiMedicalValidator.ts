// 🤖 AI Medical Validator - Reemplazo inteligente del regex validator
// Creado por Bernard Orozco - Usa Claude Sonnet 4 para validación médica

import { callClaudeForDecision } from '../services/decisionalMiddleware'
import type { MedicalInputValidatorDecision } from '../types/agents'

export interface AIValidationResult {
  isValid: boolean
  confidence: number
  rejectionReason?: string
  suggestedFormat?: string
  medicalIndicators?: string[]
}

/**
 * Valida input médico usando IA en lugar de regex
 * Reemplaza a MedicalContentValidator.validateMedicalContent()
 */
export async function validateMedicalInput(input: string): Promise<AIValidationResult> {
  try {
    const response = await callClaudeForDecision(
      'medical_input_validator',
      input,
      'claude'
    )

    if (!response.success) {
      // Fallback: aceptar todo si la IA falla (mejor que rechazar incorrectamente)
      return {
        isValid: true,
        confidence: 0.5,
        rejectionReason: 'AI validation failed, allowing input',
        medicalIndicators: []
      }
    }

    const decision = response.decision as MedicalInputValidatorDecision
    
    return {
      isValid: decision.is_valid,
      confidence: decision.confidence,
      rejectionReason: decision.rejection_reason,
      suggestedFormat: decision.suggested_format,
      medicalIndicators: decision.medical_indicators
    }

  } catch (error) {
    console.warn('AI medical validation failed:', error)
    
    // Fallback: aceptar input si hay error
    return {
      isValid: true, 
      confidence: 0.5,
      rejectionReason: 'Validation service unavailable',
      medicalIndicators: []
    }
  }
}

/**
 * Genera mensaje de rechazo usando la información de la IA
 */
export function generateRejectionMessage(result: AIValidationResult): string {
  const baseMessage = '## ⚠️ Consulta No Válida\n\n'

  if (result.rejectionReason) {
    return baseMessage + `**${result.rejectionReason}**\n\n${result.suggestedFormat || 'Por favor, reformula tu consulta como un caso médico específico.'}`
  }

  return baseMessage + `**Consulta no reconocida como contenido médico**\n\n${result.suggestedFormat || 'Incluye información médica relevante: síntomas, paciente, contexto clínico.'}`
}

/**
 * Wrapper de compatibilidad para mantener la API existente
 * Simula la estructura de MedicalValidationResult
 */
export interface LegacyMedicalValidationResult {
  isValid: boolean
  confidence: number
  medicalTermsFound: string[]
  missingCriticalData: string[]
  structureScore: number
  clinicalCoherence: number
  rejectionReason?: string
  suggestedImprovements: string[]
}

/**
 * Convierte AIValidationResult a formato legacy para compatibilidad
 */
export async function validateMedicalCase(input: string): Promise<LegacyMedicalValidationResult> {
  const aiResult = await validateMedicalInput(input)
  
  return {
    isValid: aiResult.isValid,
    confidence: aiResult.confidence,
    medicalTermsFound: aiResult.medicalIndicators || [],
    missingCriticalData: [],
    structureScore: aiResult.confidence,
    clinicalCoherence: aiResult.confidence,
    rejectionReason: aiResult.rejectionReason,
    suggestedImprovements: aiResult.suggestedFormat ? [aiResult.suggestedFormat] : []
  }
}