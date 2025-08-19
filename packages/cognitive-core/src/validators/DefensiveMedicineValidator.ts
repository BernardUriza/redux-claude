// packages/cognitive-core/src/validators/DefensiveMedicineValidator.ts
// Sistema de Medicina Defensiva AI - Creado por Bernard Orozco

export interface UrgentPattern {
  symptoms: string[]
  criticalDifferentials: string[]
  redFlags: string[]
  timeToAction: 'immediate' | 'urgent' | 'priority' | 'routine'
  gravityScore: number
}

export interface DefensiveDiagnosis {
  diagnosis: string
  gravityScore: number // 1-10 (10 = life threatening)
  probabilityScore: number // 0-1 (probability based on symptoms)
  defensiveScore: number // Combined weighted score
  urgencyLevel: 'critical' | 'high' | 'medium' | 'low'
  actionRequired: string[]
  redFlags: string[]
  timeToTreatment?: string
}

export class DefensiveMedicineValidator {
  private urgentPatterns: Map<string, UrgentPattern> = new Map([
    ['dolor_toracico', {
      symptoms: ['dolor torácico', 'dolor pecho', 'opresión torácica', 'angina'],
      criticalDifferentials: [
        'Infarto Agudo del Miocardio',
        'Embolia Pulmonar',
        'Disección Aórtica',
        'Neumotórax a tensión',
        'Taponamiento cardíaco'
      ],
      redFlags: ['dolor irradiado a brazo izquierdo', 'disnea súbita', 'síncope', 'diaforesis', 'náusea'],
      timeToAction: 'immediate',
      gravityScore: 10
    }],
    
    ['cefalea_severa', {
      symptoms: ['cefalea intensa', 'dolor cabeza severo', 'cefalea súbita'],
      criticalDifferentials: [
        'Hemorragia Subaracnoidea',
        'Meningitis',
        'Hipertensión Intracraneal',
        'Arteritis Temporal',
        'Hipertensión Maligna'
      ],
      redFlags: ['rigidez nucal', 'fotofobia', 'alteración conciencia', 'fiebre', 'petequias'],
      timeToAction: 'immediate',
      gravityScore: 9
    }],
    
    ['dolor_abdominal', {
      symptoms: ['dolor abdominal', 'dolor estómago', 'dolor vientre'],
      criticalDifferentials: [
        'Apendicitis',
        'Obstrucción Intestinal',
        'Isquemia Mesentérica',
        'Perforación Visceral',
        'Embarazo Ectópico',
        'Aneurisma Aórtico Roto'
      ],
      redFlags: ['dolor migratorio', 'vómito bilioso', 'ausencia ruidos intestinales', 'rigidez abdominal', 'hipotensión'],
      timeToAction: 'urgent',
      gravityScore: 8
    }],
    
    ['dificultad_respiratoria', {
      symptoms: ['disnea', 'dificultad respirar', 'ahogo', 'falta aire'],
      criticalDifferentials: [
        'Edema Agudo de Pulmón',
        'Embolia Pulmonar',
        'Neumotórax',
        'Asma Severo',
        'EPOC Exacerbado'
      ],
      redFlags: ['cianosis', 'uso músculos accesorios', 'orthopnea', 'hemoptisis', 'dolor torácico'],
      timeToAction: 'immediate',
      gravityScore: 9
    }],
    
    ['alteracion_conciencia', {
      symptoms: ['confusión', 'somnolencia', 'alteración mental', 'desorientación'],
      criticalDifferentials: [
        'Accidente Cerebrovascular',
        'Hipoglucemia Severa',
        'Intoxicación',
        'Encefalopatía',
        'Convulsiones'
      ],
      redFlags: ['Glasgow < 13', 'déficit neurológico focal', 'pupilas asimétricas', 'hipotermia', 'bradicardia'],
      timeToAction: 'immediate',
      gravityScore: 9
    }],
    
    ['fiebre_alta', {
      symptoms: ['fiebre > 38.5°C', 'hipertermia', 'escalofríos'],
      criticalDifferentials: [
        'Sepsis',
        'Meningitis',
        'Endocarditis',
        'Pielonefritis',
        'Neumonía Severa'
      ],
      redFlags: ['hipotensión', 'taquicardia', 'alteración mental', 'petequias', 'rigidez nucal'],
      timeToAction: 'urgent',
      gravityScore: 8
    }]
  ])

  /**
   * Clasifica diagnósticos aplicando principios de medicina defensiva
   * Prioriza gravedad (70%) sobre probabilidad (30%)
   */
  prioritizeByGravity(differentials: any[]): DefensiveDiagnosis[] {
    return differentials.map(diff => {
      const defensiveDx = this.createDefensiveDiagnosis(diff)
      return defensiveDx
    }).sort((a, b) => b.defensiveScore - a.defensiveScore)
  }

  /**
   * Identifica patrones de urgencia en el input del paciente
   */
  identifyUrgentPatterns(input: string): UrgentPattern[] {
    const inputLower = input.toLowerCase()
    const identifiedPatterns: UrgentPattern[] = []

    this.urgentPatterns.forEach((pattern, key) => {
      const hasSymptoms = pattern.symptoms.some(symptom => 
        inputLower.includes(symptom.toLowerCase())
      )
      
      const hasRedFlags = pattern.redFlags.some(flag => 
        inputLower.includes(flag.toLowerCase())
      )

      if (hasSymptoms || hasRedFlags) {
        identifiedPatterns.push(pattern)
      }
    })

    return identifiedPatterns
  }

  /**
   * Calcula el nivel de urgencia general del caso
   */
  calculateOverallUrgency(patterns: UrgentPattern[]): {
    level: 'critical' | 'high' | 'medium' | 'low'
    maxGravity: number
    immediateActions: string[]
  } {
    if (patterns.length === 0) {
      return { level: 'low', maxGravity: 1, immediateActions: [] }
    }

    const maxGravity = Math.max(...patterns.map(p => p.gravityScore))
    const immediatePatterns = patterns.filter(p => p.timeToAction === 'immediate')
    
    let level: 'critical' | 'high' | 'medium' | 'low'
    if (maxGravity >= 9 || immediatePatterns.length > 0) {
      level = 'critical'
    } else if (maxGravity >= 7) {
      level = 'high'
    } else if (maxGravity >= 5) {
      level = 'medium'
    } else {
      level = 'low'
    }

    const immediateActions = this.generateImmediateActions(patterns, level)

    return { level, maxGravity, immediateActions }
  }

  private createDefensiveDiagnosis(differential: any): DefensiveDiagnosis {
    const gravityScore = this.assessGravityScore(differential.diagnosis || differential.name || '')
    const probabilityScore = differential.confidence || differential.probability || 0.5
    
    // Formula medicina defensiva: Gravedad 70% + Probabilidad 30%
    const defensiveScore = (gravityScore * 0.7) + (probabilityScore * 0.3)
    
    const urgencyLevel = this.mapGravityToUrgency(gravityScore)
    const actionRequired = this.generateActionPlan(gravityScore, differential.diagnosis || differential.name)
    const redFlags = this.identifyRedFlags(differential.diagnosis || differential.name)

    return {
      diagnosis: differential.diagnosis || differential.name || 'Diagnóstico no especificado',
      gravityScore,
      probabilityScore,
      defensiveScore,
      urgencyLevel,
      actionRequired,
      redFlags,
      timeToTreatment: this.estimateTimeToTreatment(gravityScore)
    }
  }

  private assessGravityScore(diagnosis: string): number {
    const diagnosisLower = diagnosis.toLowerCase()
    
    // Patologías críticas (9-10)
    if (diagnosisLower.includes('infarto') || diagnosisLower.includes('embolia') || 
        diagnosisLower.includes('disección') || diagnosisLower.includes('hemorragia') ||
        diagnosisLower.includes('meningitis') || diagnosisLower.includes('sepsis')) {
      return 10
    }
    
    // Patologías severas (7-8)
    if (diagnosisLower.includes('neumonía') || diagnosisLower.includes('apendicitis') ||
        diagnosisLower.includes('obstrucción') || diagnosisLower.includes('isquemia')) {
      return 8
    }
    
    // Patologías moderadas (4-6)
    if (diagnosisLower.includes('gastritis') || diagnosisLower.includes('migraña') ||
        diagnosisLower.includes('infección urinaria') || diagnosisLower.includes('bronquitis')) {
      return 5
    }
    
    // Por defecto: gravedad media
    return 6
  }

  private mapGravityToUrgency(gravityScore: number): 'critical' | 'high' | 'medium' | 'low' {
    if (gravityScore >= 9) return 'critical'
    if (gravityScore >= 7) return 'high'
    if (gravityScore >= 5) return 'medium'
    return 'low'
  }

  private generateActionPlan(gravityScore: number, diagnosis: string): string[] {
    const actions: string[] = []
    
    if (gravityScore >= 9) {
      actions.push('🚨 ACTIVAR PROTOCOLO DE EMERGENCIA')
      actions.push('📞 Contactar servicios de emergencia inmediatamente')
      actions.push('💉 Acceso IV + monitoreo vital continuo')
    }
    
    if (gravityScore >= 7) {
      actions.push('🏥 Referir a urgencias hospitalarias')
      actions.push('📋 Estudios complementarios STAT')
      actions.push('👨‍⚕️ Interconsulta especializada urgente')
    }
    
    if (gravityScore >= 5) {
      actions.push('📅 Control médico en 24-48 horas')
      actions.push('🔬 Laboratorios y estudios dirigidos')
      actions.push('💊 Tratamiento sintomático inmediato')
    }
    
    actions.push('📚 Educación al paciente sobre signos de alarma')
    
    return actions
  }

  private identifyRedFlags(diagnosis: string): string[] {
    const diagnosisLower = diagnosis.toLowerCase()
    const redFlags: string[] = []
    
    if (diagnosisLower.includes('infarto')) {
      redFlags.push('Dolor irradiado a brazo izquierdo/mandíbula')
      redFlags.push('Disnea súbita o progresiva')
      redFlags.push('Diaforesis profusa')
      redFlags.push('Náusea/vómito asociado')
    }
    
    if (diagnosisLower.includes('hemorragia')) {
      redFlags.push('Cefalea súbita "peor de mi vida"')
      redFlags.push('Alteración del estado de conciencia')
      redFlags.push('Rigidez nucal')
      redFlags.push('Déficit neurológico focal')
    }
    
    return redFlags
  }

  private estimateTimeToTreatment(gravityScore: number): string {
    if (gravityScore >= 9) return 'Inmediato (< 15 min)'
    if (gravityScore >= 7) return 'Urgente (< 1 hora)'
    if (gravityScore >= 5) return 'Prioritario (< 4 horas)'
    return 'Rutinario (< 24 horas)'
  }

  private generateImmediateActions(patterns: UrgentPattern[], urgencyLevel: string): string[] {
    const actions: string[] = []
    
    if (urgencyLevel === 'critical') {
      actions.push('🚨 ACTIVAR CÓDIGO ROJO')
      actions.push('📞 Llamar ambulancia/911 AHORA')
      actions.push('💊 NO administrar medicamentos orales')
      actions.push('🫁 Mantener vía aérea permeable')
    }
    
    if (patterns.some(p => p.symptoms.includes('dolor torácico'))) {
      actions.push('💊 Considerar aspirina 300mg (si no contraindicado)')
      actions.push('📋 ECG de 12 derivaciones STAT')
      actions.push('🩺 Monitoreo cardíaco continuo')
    }
    
    return actions
  }

  /**
   * Genera prompt de medicina defensiva para Claude
   */
  generateDefensivePrompt(urgentPatterns: UrgentPattern[], overallUrgency: any): string {
    const patternsText = urgentPatterns.map(p => 
      `- ${p.criticalDifferentials.join(', ')}`
    ).join('\n')

    return `
🚨 MEDICINA DEFENSIVA ACTIVADA - Nivel: ${overallUrgency.level.toUpperCase()}

INSTRUCCIONES CRÍTICAS:
1. DESCARTAR PRIMERO patologías de alta gravedad antes que alta probabilidad
2. Priorizar diagnósticos con GravityScore ≥ 8
3. Aplicar regla "No harm principle" - mejor sobrediagnosticar que subdiagnosticar

PATRONES URGENTES IDENTIFICADOS:
${patternsText}

ACCIONES INMEDIATAS REQUERIDAS:
${overallUrgency.immediateActions.map((action: string) => `• ${action}`).join('\n')}

En tu análisis SOAP, DEBES:
- Colocar diagnósticos de alta gravedad al inicio de diferenciales
- Explicar por qué se descartan patologías críticas
- Incluir tiempo estimado para intervención
- Especificar signos de alarma para seguimiento
`
  }
}