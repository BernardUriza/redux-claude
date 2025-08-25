// packages/cognitive-core/src/classifiers/UrgencyClassifier.ts
// Clasificador de Urgencia Médica - Creado por Bernard Orozco

import {
  DefensiveMedicineValidator,
  UrgentPattern,
  DefensiveDiagnosis,
} from '../validators/DefensiveMedicineValidator'

export interface UrgencyAssessment {
  overallLevel: 'critical' | 'high' | 'medium' | 'low'
  maxGravityScore: number
  identifiedPatterns: UrgentPattern[]
  immediateActions: string[]
  timeToAction: string
  defensivePrompt: string
  riskFactors: RiskFactor[]
  escalationCriteria: string[]
}

export interface RiskFactor {
  factor: string
  riskLevel: 'high' | 'medium' | 'low'
  impact: string
  monitoring: string
}

export interface TriageResult {
  urgencyLevel: 'critical' | 'high' | 'medium' | 'low'
  triageCategory: 'resuscitation' | 'emergency' | 'urgent' | 'semi-urgent' | 'non-urgent'
  waitTime: string
  resources: string[]
  specialistRequired: boolean
  diagnosticPriority: 'stat' | 'urgent' | 'routine'
}

export class UrgencyClassifier {
  private defensiveValidator: DefensiveMedicineValidator

  // Patrones de riesgo específicos por edad/género/comorbilidades
  private riskModifiers = {
    age: {
      pediatric: {
        modifier: 1.2,
        patterns: ['fiebre', 'deshidratación', 'dificultad respiratoria'],
      },
      geriatric: { modifier: 1.3, patterns: ['caídas', 'confusión', 'polifarmacia'] },
      adult: { modifier: 1.0, patterns: [] },
    },
    comorbidities: {
      diabetes: { modifier: 1.2, patterns: ['hipoglucemia', 'cetoacidosis', 'infecciones'] },
      cardiopatia: { modifier: 1.4, patterns: ['dolor torácico', 'disnea', 'síncope'] },
      hipertension: { modifier: 1.1, patterns: ['cefalea', 'epistaxis', 'visión borrosa'] },
      inmunodepresion: { modifier: 1.5, patterns: ['fiebre', 'infecciones oportunistas'] },
    },
  }

  constructor() {
    this.defensiveValidator = new DefensiveMedicineValidator()
  }

  /**
   * Realiza evaluación completa de urgencia médica
   */
  async assessUrgency(
    clinicalCase: string,
    patientContext?: {
      age?: number
      gender?: string
      comorbidities?: string[]
      medications?: string[]
      vitalSigns?: Record<string, any>
    }
  ): Promise<UrgencyAssessment> {
    // Paso 1: Identificar patrones urgentes
    const identifiedPatterns = this.defensiveValidator.identifyUrgentPatterns(clinicalCase)

    // Paso 2: Evaluar urgencia base
    const baseUrgency = this.defensiveValidator.calculateOverallUrgency(identifiedPatterns)

    // Paso 3: Aplicar modificadores de riesgo
    const riskFactors = this.assessRiskFactors(clinicalCase, patientContext)
    const adjustedUrgency = this.applyRiskModifiers(baseUrgency, riskFactors, patientContext)

    // Paso 4: Generar criterios de escalación
    const escalationCriteria = this.generateEscalationCriteria(
      adjustedUrgency.level,
      identifiedPatterns
    )

    // Paso 5: Crear prompt defensivo
    const defensivePrompt = this.defensiveValidator.generateDefensivePrompt(
      identifiedPatterns,
      adjustedUrgency
    )

    return {
      overallLevel: adjustedUrgency.level,
      maxGravityScore: adjustedUrgency.maxGravity,
      identifiedPatterns,
      immediateActions: adjustedUrgency.immediateActions,
      timeToAction: this.mapUrgencyToTime(adjustedUrgency.level),
      defensivePrompt,
      riskFactors,
      escalationCriteria,
    }
  }

  /**
   * Realiza triage médico formal
   */
  performTriage(urgencyAssessment: UrgencyAssessment): TriageResult {
    const { overallLevel, maxGravityScore } = urgencyAssessment

    let triageCategory: TriageResult['triageCategory']
    let waitTime: string
    let resources: string[]
    let diagnosticPriority: TriageResult['diagnosticPriority']

    switch (overallLevel) {
      case 'critical':
        triageCategory = maxGravityScore >= 9.5 ? 'resuscitation' : 'emergency'
        waitTime = 'Inmediato (0 min)'
        resources = ['Médico especialista', 'Enfermería especializada', 'Equipo resuscitación']
        diagnosticPriority = 'stat'
        break

      case 'high':
        triageCategory = 'urgent'
        waitTime = '< 30 minutos'
        resources = ['Médico urgencias', 'Enfermería', 'Laboratorio STAT']
        diagnosticPriority = 'urgent'
        break

      case 'medium':
        triageCategory = 'semi-urgent'
        waitTime = '< 2 horas'
        resources = ['Médico general', 'Enfermería básica']
        diagnosticPriority = 'routine'
        break

      default:
        triageCategory = 'non-urgent'
        waitTime = '< 4 horas'
        resources = ['Médico general']
        diagnosticPriority = 'routine'
    }

    const specialistRequired = this.requiresSpecialist(urgencyAssessment)

    return {
      urgencyLevel: overallLevel,
      triageCategory,
      waitTime,
      resources,
      specialistRequired,
      diagnosticPriority,
    }
  }

  /**
   * Clasifica lista de diagnósticos diferenciales
   */
  classifyDifferentials(differentials: any[], clinicalContext: string): DefensiveDiagnosis[] {
    return this.defensiveValidator.prioritizeByGravity(differentials)
  }

  /**
   * Evalúa factores de riesgo específicos del paciente
   */
  private assessRiskFactors(clinicalCase: string, patientContext?: any): RiskFactor[] {
    const riskFactors: RiskFactor[] = []
    const caseText = clinicalCase.toLowerCase()

    // Factores de edad
    if (patientContext?.age) {
      if (patientContext.age < 18) {
        riskFactors.push({
          factor: 'Edad pediátrica',
          riskLevel: 'high',
          impact:
            'Presentación atípica de patologías, compensación rápida seguida de descompensación súbita',
          monitoring: 'Signos vitales cada 15 minutos, estado neurológico',
        })
      } else if (patientContext.age > 65) {
        riskFactors.push({
          factor: 'Edad geriátrica',
          riskLevel: 'medium',
          impact: 'Mayor riesgo de complicaciones, polifarmacia, comorbilidades múltiples',
          monitoring: 'Función cognitiva, riesgo de caídas, interacciones medicamentosas',
        })
      }
    }

    // Factores de comorbilidad
    if (patientContext?.comorbidities?.includes('diabetes')) {
      riskFactors.push({
        factor: 'Diabetes mellitus',
        riskLevel: 'high',
        impact: 'Riesgo de hipoglucemia, cetoacidosis, infecciones complicadas',
        monitoring: 'Glucemia, cetonas, signos de infección',
      })
    }

    // Factores sintomáticos críticos
    if (caseText.includes('dolor torácico')) {
      riskFactors.push({
        factor: 'Síndrome coronario agudo potencial',
        riskLevel: 'high',
        impact: 'Riesgo vital inmediato si IAM, pueden presentarse atípicamente',
        monitoring: 'ECG seriados, troponinas, signos de insuficiencia cardíaca',
      })
    }

    return riskFactors
  }

  /**
   * Aplica modificadores de riesgo a la evaluación base
   */
  private applyRiskModifiers(
    baseUrgency: any,
    riskFactors: RiskFactor[],
    patientContext?: any
  ): any {
    let adjustedLevel = baseUrgency.level
    let adjustedGravity = baseUrgency.maxGravity

    // Aplicar modificadores por factores de riesgo alto
    const highRiskFactors = riskFactors.filter(rf => rf.riskLevel === 'high')

    if (highRiskFactors.length > 0) {
      // Incrementar un nivel si hay factores de alto riesgo
      if (adjustedLevel === 'low') adjustedLevel = 'medium'
      else if (adjustedLevel === 'medium') adjustedLevel = 'high'
      else if (adjustedLevel === 'high') adjustedLevel = 'critical'

      adjustedGravity = Math.min(adjustedGravity + 1, 10)
    }

    return {
      ...baseUrgency,
      level: adjustedLevel,
      maxGravity: adjustedGravity,
    }
  }

  /**
   * Genera criterios específicos para escalación del caso
   */
  private generateEscalationCriteria(urgencyLevel: string, patterns: UrgentPattern[]): string[] {
    const criteria: string[] = []

    // Criterios generales por nivel
    switch (urgencyLevel) {
      case 'critical':
        criteria.push('Deterioro de signos vitales')
        criteria.push('Alteración del estado de conciencia')
        criteria.push('Falta de respuesta al tratamiento inicial')
        break

      case 'high':
        criteria.push('Persistencia o empeoramiento de síntomas en 1 hora')
        criteria.push('Aparición de nuevos síntomas neurológicos')
        criteria.push('Cambios en patrones respiratorios')
        break

      case 'medium':
        criteria.push('No mejoría en 4-6 horas')
        criteria.push('Aparición de fiebre > 38.5°C')
        criteria.push('Dolor no controlado con analgesia')
        break

      default:
        criteria.push('Empeoramiento progresivo en 24 horas')
        criteria.push('Preocupación persistente del paciente/familia')
    }

    // Criterios específicos por patrones identificados
    patterns.forEach(pattern => {
      pattern.redFlags.forEach(flag => {
        criteria.push(`Aparición de: ${flag}`)
      })
    })

    return criteria
  }

  /**
   * Determina si requiere interconsulta especializada
   */
  private requiresSpecialist(assessment: UrgencyAssessment): boolean {
    // Criterios automáticos para especialista
    if (assessment.overallLevel === 'critical') return true
    if (assessment.maxGravityScore >= 8) return true

    // Patrones específicos que requieren especialista
    const specialistPatterns = [
      'infarto',
      'embolia',
      'hemorragia',
      'disección',
      'meningitis',
      'sepsis',
      'ictus',
      'convulsiones',
    ]

    return assessment.identifiedPatterns.some(pattern =>
      pattern.criticalDifferentials.some(diff =>
        specialistPatterns.some(sp => diff.toLowerCase().includes(sp))
      )
    )
  }

  /**
   * Mapea nivel de urgencia a tiempo de acción
   */
  private mapUrgencyToTime(level: string): string {
    switch (level) {
      case 'critical':
        return 'Inmediato (< 15 min)'
      case 'high':
        return 'Urgente (< 1 hora)'
      case 'medium':
        return 'Prioritario (< 4 horas)'
      default:
        return 'Rutinario (< 24 horas)'
    }
  }

  /**
   * Genera resumen ejecutivo para documentación
   */
  generateExecutiveSummary(assessment: UrgencyAssessment, triage: TriageResult): string {
    return `
📋 RESUMEN EJECUTIVO - MEDICINA DEFENSIVA
═══════════════════════════════════════

🚨 NIVEL DE URGENCIA: ${assessment.overallLevel.toUpperCase()}
🎯 CATEGORÍA TRIAGE: ${triage.triageCategory.toUpperCase()}
⏱️ TIEMPO MÁXIMO ACCIÓN: ${assessment.timeToAction}
🏥 RECURSOS REQUERIDOS: ${triage.resources.join(', ')}

🔍 PATRONES CRÍTICOS IDENTIFICADOS (${assessment.identifiedPatterns.length}):
${assessment.identifiedPatterns.map(p => `• ${p.criticalDifferentials[0]} (Gravedad: ${p.gravityScore}/10)`).join('\n')}

⚠️ FACTORES DE RIESGO (${assessment.riskFactors.length}):
${assessment.riskFactors.map(rf => `• ${rf.factor} [${rf.riskLevel.toUpperCase()}]: ${rf.impact}`).join('\n')}

🚨 CRITERIOS DE ESCALACIÓN:
${assessment.escalationCriteria.map(c => `• ${c}`).join('\n')}

🎯 ACCIONES INMEDIATAS:
${assessment.immediateActions.map(a => `• ${a}`).join('\n')}

${triage.specialistRequired ? '👨‍⚕️ INTERCONSULTA ESPECIALIZADA REQUERIDA' : ''}
${triage.diagnosticPriority === 'stat' ? '🔬 ESTUDIOS DIAGNÓSTICOS STAT' : ''}
`
  }
}
