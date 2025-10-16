// packages/cognitive-core/src/middleware/CriticalPatternMiddleware.ts
// CRITICAL PATTERN MIDDLEWARE - Refactored for Maintainability
// Created by Bernard Orozco - 2025

import { normalizeText, containsAllPatterns, containsAnyPattern } from '../utils/textNormalization'
import { getLogger } from '../utils/logger'
import { CRITICAL_PATTERNS } from '../config/criticalPatterns'

export interface CriticalPattern {
  id: string
  name: string
  confidence: number // 0-100
  triggerConditions: string[]
  excludeConditions: string[]
  mandatoryConsideration: string
  urgencyOverride: 'critical' | null
  widowMakerRisk: boolean
  interventionWindow: string
}

export interface CriticalPatternResult {
  triggered: boolean
  patterns: CriticalPattern[]
  mandatoryPrompt: string
  urgencyOverride: 'critical' | null
  widowMakerAlert: boolean
}

/**
 * 🚨 CRITICAL PATTERN MIDDLEWARE (Refactored)
 *
 * Dedicated middleware for detecting life-threatening conditions with <80% baseline recognition.
 * When any condition shows <80% confidence in testing, it gets its own dedicated middleware.
 *
 * IMPROVEMENTS:
 * - Uses shared text normalization utilities
 * - Pattern definitions externalized to config
 * - Proper structured logging
 * - Better separation of concerns
 * - Easier to test and maintain
 */
export class CriticalPatternMiddleware {
  private criticalPatterns: Map<string, CriticalPattern>
  private logger = getLogger()
  private debugMode: boolean

  constructor(patterns?: Map<string, CriticalPattern>, debugMode: boolean = false) {
    this.criticalPatterns = patterns || CRITICAL_PATTERNS
    this.debugMode = debugMode
  }

  /**
   * Analiza el input clínico para detectar patrones críticos
   */
  analyzeCriticalPatterns(clinicalInput: string): CriticalPatternResult {
    const normalizedInput = normalizeText(clinicalInput)

    const triggeredPatterns: CriticalPattern[] = []
    const mandatoryPrompts: string[] = []
    let urgencyOverride: 'critical' | null = null
    let widowMakerAlert = false

    // Evaluar cada patrón crítico
    this.criticalPatterns.forEach(pattern => {
      const isTriggered = this.evaluatePattern(normalizedInput, pattern)

      if (isTriggered) {
        triggeredPatterns.push(pattern)
        mandatoryPrompts.push(pattern.mandatoryConsideration)

        if (pattern.urgencyOverride === 'critical') {
          urgencyOverride = 'critical'
        }

        if (pattern.widowMakerRisk) {
          widowMakerAlert = true
        }

        this.logger.warn(`Critical pattern triggered: ${pattern.name}`, {
          patternId: pattern.id,
          widowMaker: pattern.widowMakerRisk,
          interventionWindow: pattern.interventionWindow
        })
      }
    })

    const result: CriticalPatternResult = {
      triggered: triggeredPatterns.length > 0,
      patterns: triggeredPatterns,
      mandatoryPrompt: mandatoryPrompts.join('\n\n'),
      urgencyOverride,
      widowMakerAlert
    }

    if (result.triggered) {
      this.logger.error('WIDOW MAKER ALERT', {
        patterns: triggeredPatterns.map(p => p.name),
        urgencyOverride,
        widowMakerAlert
      })
    }

    return result
  }

  /**
   * Evalúa si un patrón específico se dispara
   */
  private evaluatePattern(normalizedInput: string, pattern: CriticalPattern): boolean {
    if (this.debugMode) {
      this.logger.debug(`Evaluating pattern: ${pattern.name}`, {
        inputLength: normalizedInput.length
      })
    }

    // Check trigger conditions (ALL must be present - AND logic)
    const triggerResults = pattern.triggerConditions.map((condition, idx) => {
      const regex = new RegExp(condition, 'i')
      const matches = regex.test(normalizedInput)

      if (this.debugMode) {
        this.logger.debug(`  Condition ${idx + 1}: ${matches ? 'MATCH' : 'NO MATCH'}`, {
          pattern: condition,
          matched: matches
        })
      }

      return matches
    })

    const hasAllTriggers = triggerResults.every(result => result)

    if (!hasAllTriggers) {
      if (this.debugMode) {
        this.logger.debug(`Pattern not triggered: ${pattern.name}`, {
          missingConditions: triggerResults.filter(r => !r).length,
          totalConditions: triggerResults.length
        })
      }
      return false
    }

    // Check exclusion conditions (NONE should be present - NOT logic)
    const exclusionResults = pattern.excludeConditions.map(exclusion => {
      const regex = new RegExp(exclusion, 'i')
      return regex.test(normalizedInput)
    })

    const hasExclusions = exclusionResults.some(result => result)

    if (hasExclusions) {
      if (this.debugMode) {
        this.logger.debug(`Pattern excluded: ${pattern.name}`, {
          reason: 'Exclusion condition found'
        })
      }
      return false
    }

    // Pattern triggered!
    this.logger.info(`✅ PATTERN TRIGGERED: ${pattern.name}`, {
      patternId: pattern.id,
      widowMaker: pattern.widowMakerRisk
    })

    return true
  }

  /**
   * Genera prompt hardcodeado para casos críticos
   */
  generateMandatoryPrompt(result: CriticalPatternResult): string {
    if (!result.triggered) return ''

    const prompt = `
🚨🚨🚨 CRITICAL PATTERN MIDDLEWARE ALERT 🚨🚨🚨

${result.mandatoryPrompt}

${result.widowMakerAlert ? '💀 WIDOW MAKER RISK - POTENTIAL FATAL OUTCOME IF MISSED' : ''}

INSTRUCCIONES OBLIGATORIAS:
• DEBES mencionar explícitamente estos diagnósticos diferenciales
• DEBES explicar por qué consideras o descartas cada uno
• DEBES ordenar los estudios específicos mencionados
• DEBES clasificar como CRÍTICO si hay widow maker risk

No es opcional - es obligatorio considerar estos diagnósticos.
`

    return prompt
  }

  /**
   * Obtiene estadísticas de patrones críticos
   */
  getPatternStats(): Record<string, any> {
    const stats: Record<string, any> = {}

    this.criticalPatterns.forEach((pattern, id) => {
      stats[id] = {
        name: pattern.name,
        confidence: pattern.confidence,
        widowMaker: pattern.widowMakerRisk,
        interventionWindow: pattern.interventionWindow
      }
    })

    return stats
  }

  /**
   * Agrega nuevo patrón crítico para condiciones con <80% confianza
   */
  addCriticalPattern(pattern: CriticalPattern): void {
    this.criticalPatterns.set(pattern.id, pattern)
    this.logger.info(`New critical pattern registered: ${pattern.name}`, {
      patternId: pattern.id
    })
  }

  /**
   * Actualiza confianza de patrón basado en resultados de testing
   */
  updatePatternConfidence(patternId: string, newConfidence: number): void {
    const pattern = this.criticalPatterns.get(patternId)
    if (pattern) {
      const oldConfidence = pattern.confidence
      pattern.confidence = newConfidence
      this.logger.info(`Pattern confidence updated: ${pattern.name}`, {
        patternId,
        oldConfidence,
        newConfidence
      })
    }
  }

  /**
   * Enables or disables debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled
  }
}

/**
 * Instancia singleton para uso global
 */
export const criticalPatternMiddleware = new CriticalPatternMiddleware(CRITICAL_PATTERNS, false)
