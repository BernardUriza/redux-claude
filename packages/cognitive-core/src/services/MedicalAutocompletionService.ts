// 🤖 Servicio de Autocompletado Médico Inteligente - SOLID Architecture
// Creado por Bernard Orozco - Refactorizado con decisionalMiddleware

import { callClaudeForDecision } from './decisionalMiddleware'
import type { MedicalAutocompletionDecision } from '../types/agents'

export interface AutocompletionSuggestion {
  id: string
  title: string
  description: string
  template: string
  confidence: number
  category: 'basic' | 'detailed' | 'specialized'
}

export interface AutocompletionRequest {
  partialInput: string
  medicalSpecialty?: string
  patientContext?: {
    age?: number
    gender?: string
    previousSymptoms?: string[]
  }
}

export interface AutocompletionResult {
  success: boolean
  suggestions: AutocompletionSuggestion[]
  enhancedTemplate: string
  error?: string
}

export class MedicalAutocompletionService {
  /**
   * Detecta si el texto contiene artefactos de template que necesitan limpieza
   */
  private needsCleanup(text: string): boolean {
    return (
      text.includes('[') &&
      text.includes(']') &&
      (text.includes('[FEMENINO]') ||
        text.includes('[MASCULINO]') ||
        !!text.match(/\[\d+\]/) ||
        text.includes('[antecedentes]'))
    )
  }

  async generateCompletionSuggestions(
    request: AutocompletionRequest
  ): Promise<AutocompletionResult> {
    try {
      // Enhanced prompt context for cleanup detection
      const needsCleanup = this.needsCleanup(request.partialInput)
      const contextualInfo = needsCleanup
        ? 'ALERTA: Este texto contiene artefactos de template ([corchetes]) que necesitan limpieza antes del análisis.'
        : 'Texto normal que requiere análisis para autocompletado.'

      // Use SOLID decisionalMiddleware pattern
      const response = await callClaudeForDecision(
        'medical_autocompletion',
        `${contextualInfo}\n\nTEXTO A PROCESAR: ${request.partialInput}`,
        'claude',
        undefined,
        undefined,
        {
          medicalSpecialty: request.medicalSpecialty,
          patientContext: request.patientContext,
          needsCleanup,
        }
      )

      if (!response.success) {
        return {
          success: false,
          suggestions: [],
          enhancedTemplate: '',
          error: response.error || 'Error generando autocompletado',
        }
      }

      // Type assertion and conversion
      const decision = response.decision as MedicalAutocompletionDecision

      return {
        success: true,
        suggestions: decision.suggestions.map(s => ({
          id: s.id,
          title: s.title,
          description: s.description,
          template: s.template,
          confidence: s.confidence,
          category: s.category,
        })),
        enhancedTemplate: decision.enhanced_template,
        error: undefined,
      }
    } catch (error) {
      console.error('Error en autocompletado médico:', error)
      return {
        success: false,
        suggestions: [],
        enhancedTemplate: '',
        error: error instanceof Error ? error.message : 'Error desconocido',
      }
    }
  }
}
