// 🚨 CRITICAL PATTERNS CONFIGURATION
// Life-threatening conditions with <80% baseline recognition
// Bernard Orozco 2025

import { CriticalPattern } from '../middleware/CriticalPatternMiddleware'

/**
 * Pattern definitions for widow maker conditions
 *
 * Each pattern represents a life-threatening condition that:
 * 1. Has shown <80% recognition in testing
 * 2. Requires immediate intervention
 * 3. Has high mortality if missed
 *
 * IMPORTANT: These patterns use normalized text (no accents, lowercase)
 * The normalization is handled by textUtils.normalizeText()
 */

export const CRITICAL_PATTERNS: Map<string, CriticalPattern> = new Map([
  // 🩸 AORTIC DISSECTION - The Ultimate Widow Maker
  [
    'aortic_dissection_sepsis_mimic',
    {
      id: 'aortic_dissection_sepsis_mimic',
      name: 'Disección Aórtica Mimificando Sepsis',
      confidence: 0, // Previously 0% recognition - CRITICAL GAP

      // ALL conditions must be present (AND logic)
      triggerConditions: [
        // Condition 1: Sepsis-like presentation
        // Handles: sepsis, septico, septica, cuadro septico, infeccion grave
        // Note: "sptic" handles encoding corruption of "séptico" → "s�ptico" → "sptico"
        'sepsis|septic|sptic|sirs|shock|cuadro.*(septic|sptic)|infeccion.*grave|infeccion',

        // Condition 2: Abdominal pain
        // Handles: dolor abdominal, dolor de estomago, dolor epigastrico
        'dolor.*(abdominal|estomago|vientre|epigastric)',

        // Condition 3: Hypertension history
        // Handles: hipertension, HTA, presion alta, historia de hipertension
        'hipertension|hta|presion.*alta|antecedente.*hipertens|historia.*hipertens'
      ],

      // NONE of these should be present (NOT logic)
      excludeConditions: [
        'foco infeccioso claro',
        'cultivos positivos confirmados',
        'respuesta clara a antibioticos'
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

  // 🫀 MASSIVE PULMONARY EMBOLISM
  [
    'massive_pe_mimic',
    {
      id: 'massive_pe_mimic',
      name: 'Embolia Pulmonar Masiva',
      confidence: 85, // Above threshold, but keeping for completeness

      triggerConditions: [
        'disnea.*subita|falta.*aire|ahogo',
        'dolor.*toracic.*pleuritic',
        'factor.*riesgo.*trombot|cirugia.*reciente|inmovilizacion'
      ],

      excludeConditions: [
        'infiltrados pulmonares claros'
      ],

      mandatoryConsideration: 'Considerar embolia pulmonar masiva en contexto post-quirúrgico',
      urgencyOverride: 'critical',
      widowMakerRisk: true,
      interventionWindow: '< 1 hora'
    }
  ]
])

/**
 * Adds a new critical pattern to the registry
 * Use this when a new condition shows <80% recognition in testing
 */
export function registerCriticalPattern(pattern: CriticalPattern): void {
  CRITICAL_PATTERNS.set(pattern.id, pattern)
}

/**
 * Updates the confidence score of a pattern based on testing results
 */
export function updatePatternConfidence(patternId: string, newConfidence: number): void {
  const pattern = CRITICAL_PATTERNS.get(patternId)
  if (pattern) {
    pattern.confidence = newConfidence
  }
}

/**
 * Gets all patterns that require critical override
 */
export function getCriticalPatterns(): CriticalPattern[] {
  return Array.from(CRITICAL_PATTERNS.values()).filter(p => p.urgencyOverride === 'critical')
}

/**
 * Gets all widow maker patterns
 */
export function getWidowMakerPatterns(): CriticalPattern[] {
  return Array.from(CRITICAL_PATTERNS.values()).filter(p => p.widowMakerRisk)
}
