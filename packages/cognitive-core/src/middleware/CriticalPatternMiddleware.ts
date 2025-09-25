// packages/cognitive-core/src/middleware/CriticalPatternMiddleware.ts
// CRITICAL PATTERN MIDDLEWARE - Dedicated to Life-Threatening Missed Diagnoses
// Created by Bernard Orozco - 2025

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
 * 🚨 CRITICAL PATTERN MIDDLEWARE
 *
 * Dedicated middleware for detecting life-threatening conditions with <80% baseline recognition.
 * When any condition shows <80% confidence in testing, it gets its own dedicated middleware.
 *
 * CURRENT FOCUS: AORTIC DISSECTION - The "Widow Maker" of Emergency Medicine
 */
export class CriticalPatternMiddleware {
  private criticalPatterns: Map<string, CriticalPattern> = new Map([
    // 🩸 AORTIC DISSECTION - WIDOW MAKER PATTERN
    [
      'aortic_dissection_sepsis_mimic',
      {
        id: 'aortic_dissection_sepsis_mimic',
        name: 'Disección Aórtica Mimificando Sepsis',
        confidence: 0, // Previously 0% recognition - CRITICAL GAP
        triggerConditions: [
          'sepsis|sirs|shock séptico|infección grave',
          'dolor abdominal|dolor estomago|dolor vientre|dolor epigástrico',
          'hipertensión|hta|presión alta|antecedente hipertensivo'
        ],
        excludeConditions: [
          'foco infeccioso claro',
          'cultivos positivos confirmados',
          'respuesta clara a antibióticos'
        ],
        mandatoryConsideration: `
🚨 WIDOW MAKER ALERT: DISECCIÓN AÓRTICA CON TRANSLOCACIÓN BACTERIANA

PATRÓN CRÍTICO DETECTADO:
• Presentación tipo sepsis (fiebre, hipotensión, alteración mental)
• Dolor abdominal severo
• Historia de hipertensión arterial

⚠️ MECANISMO FISIOPATOLÓGICO:
La disección aórtica puede causar isquemia intestinal → translocación bacteriana →
síndrome séptico SIN infección primaria.

🔍 DIAGNÓSTICOS DIFERENCIALES OBLIGATORIOS:
1. Disección Aórtica Tipo A o B con translocación bacteriana
2. Sepsis intraabdominal verdadera
3. Aneurisma aórtico roto
4. Isquemia mesentérica

📋 ESTUDIOS URGENTES REQUERIDOS:
• AngioTC de aorta torácica y abdominal
• Diferencias de pulsos entre extremidades
• Radiografía de tórax (mediastino ensanchado)
• Eco transesofágico si disponible

⏱️ VENTANA DE INTERVENCIÓN: < 6 HORAS PARA TIPO A
        `,
        urgencyOverride: 'critical',
        widowMakerRisk: true,
        interventionWindow: '< 6 horas'
      }
    ],

    // 🫀 FUTURE PATTERNS - Template for other <80% conditions
    [
      'massive_pe_mimic',
      {
        id: 'massive_pe_mimic',
        name: 'Embolia Pulmonar Masiva',
        confidence: 85, // Above threshold, but keeping for completeness
        triggerConditions: [
          'disnea súbita|falta de aire|ahogo',
          'dolor torácico pleurítico',
          'factores de riesgo trombótico|cirugía reciente|inmovilización'
        ],
        excludeConditions: ['infiltrados pulmonares claros'],
        mandatoryConsideration: 'Considerar embolia pulmonar masiva en contexto post-quirúrgico',
        urgencyOverride: 'critical',
        widowMakerRisk: true,
        interventionWindow: '< 1 hora'
      }
    ]
  ])

  /**
   * Analiza el input clínico para detectar patrones críticos
   */
  analyzeCriticalPatterns(clinicalInput: string): CriticalPatternResult {
    const input = clinicalInput.toLowerCase()
    const triggeredPatterns: CriticalPattern[] = []
    let mandatoryPrompts: string[] = []
    let urgencyOverride: 'critical' | null = null
    let widowMakerAlert = false

    // Evaluar cada patrón crítico
    this.criticalPatterns.forEach(pattern => {
      const isTriggered = this.evaluatePattern(input, pattern)

      if (isTriggered) {
        triggeredPatterns.push(pattern)
        mandatoryPrompts.push(pattern.mandatoryConsideration)

        if (pattern.urgencyOverride === 'critical') {
          urgencyOverride = 'critical'
        }

        if (pattern.widowMakerRisk) {
          widowMakerAlert = true
        }
      }
    })

    return {
      triggered: triggeredPatterns.length > 0,
      patterns: triggeredPatterns,
      mandatoryPrompt: mandatoryPrompts.join('\n\n'),
      urgencyOverride,
      widowMakerAlert
    }
  }

  /**
   * Evalúa si un patrón específico se dispara
   */
  private evaluatePattern(input: string, pattern: CriticalPattern): boolean {
    // Verificar condiciones trigger (TODAS deben estar presentes)
    const hasAllTriggers = pattern.triggerConditions.every(condition => {
      const regex = new RegExp(condition, 'i')
      return regex.test(input)
    })

    if (!hasAllTriggers) return false

    // Verificar condiciones de exclusión (NINGUNA debe estar presente)
    const hasExclusions = pattern.excludeConditions.some(exclusion => {
      const regex = new RegExp(exclusion, 'i')
      return regex.test(input)
    })

    return !hasExclusions
  }

  /**
   * Genera prompt hardcodeado para casos críticos
   */
  generateMandatoryPrompt(result: CriticalPatternResult): string {
    if (!result.triggered) return ''

    let prompt = `
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
  }

  /**
   * Actualiza confianza de patrón basado en resultados de testing
   */
  updatePatternConfidence(patternId: string, newConfidence: number): void {
    const pattern = this.criticalPatterns.get(patternId)
    if (pattern) {
      pattern.confidence = newConfidence
    }
  }
}

/**
 * Instancia singleton para uso global
 */
export const criticalPatternMiddleware = new CriticalPatternMiddleware()