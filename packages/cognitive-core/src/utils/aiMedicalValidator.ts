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
    console.log('🛡️ AI Validator: Starting validation for:', input)
    
    const response = await callClaudeForDecision(
      'medical_input_validator',
      input,
      'claude'
    )

    console.log('🛡️ AI Validator response:', response)

    if (!response.success) {
      console.warn('🛡️ AI Validator failed, using fallback')
      // Fallback: aceptar todo si la IA falla (mejor que rechazar incorrectamente)
      return {
        isValid: true,
        confidence: 0.5,
        rejectionReason: 'AI validation failed, allowing input',
        medicalIndicators: []
      }
    }

    let decision: MedicalInputValidatorDecision
    
    // 🧠 El agente devuelve {content: "JSON_STRING"} - extraer y parsear
    const decisionData = (response.decision as any)?.content || response.decision
    
    if (typeof decisionData === 'string') {
      try {
        decision = JSON.parse(decisionData)
        console.log('🛡️ AI Validator parsed JSON from content:', decision)
      } catch (error) {
        console.warn('🛡️ Failed to parse JSON response:', decisionData)
        // Fallback: aceptar si no podemos parsear
        return {
          isValid: true,
          confidence: 0.5,
          rejectionReason: 'JSON parse error, allowing input',
          medicalIndicators: []
        }
      }
    } else {
      decision = decisionData as MedicalInputValidatorDecision
      console.log('🛡️ AI Validator decision object:', decision)
    }
    
    const result = {
      isValid: decision.is_valid,
      confidence: decision.confidence,
      rejectionReason: decision.rejection_reason,
      suggestedFormat: decision.suggested_format,
      medicalIndicators: decision.medical_indicators
    }
    
    console.log('🛡️ AI Validator final result:', result)
    return result

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