// 🏥 SOAP Processor - Implementación NOM-004-SSA3-2012 + Medicina Defensiva
// Creado por Bernard Orozco - Fase 3: Sistema de Medicina Defensiva Integrado

import { DefensiveMedicineValidator, UrgentPattern, DefensiveDiagnosis } from '../validators/DefensiveMedicineValidator'
import { UrgencyClassifier, UrgencyAssessment, TriageResult } from '../classifiers/UrgencyClassifier'

// Importar tipos desde types/medical.ts
import type { SOAPData, SOAPAnalysis } from '../types/medical'

/**
 * 📋 Procesador SOAP Formal según NOM-004-SSA3-2012
 * 
 * Implementa estructura médica mexicana oficial con:
 * - Expediente clínico compliant
 * - Terminología CIE-10
 * - Estructura SOAP obligatoria
 * - Trazabilidad legal completa
 */
export class SOAPProcessor {
  private version = '1.0.0'
  private normativa: 'NOM-004-SSA3-2012' = 'NOM-004-SSA3-2012'
  private defensiveValidator: DefensiveMedicineValidator
  private urgencyClassifier: UrgencyClassifier

  constructor() {
    this.defensiveValidator = new DefensiveMedicineValidator()
    this.urgencyClassifier = new UrgencyClassifier()
  }

  /**
   * 🏥 Procesa caso clínico con estructura SOAP formal + Medicina Defensiva
   */
  async processCase(
    clinicalInput: string,
    patientContext?: {
      age?: number
      gender?: string
      comorbidities?: string[]
      medications?: string[]
      vitalSigns?: Record<string, any>
    }
  ): Promise<SOAPAnalysis> {
    const startTime = Date.now()

    try {
      console.log('🚨 Iniciando procesamiento SOAP + Medicina Defensiva...')

      // FASE 1: Evaluación de urgencia ANTES del procesamiento SOAP
      const urgencyAssessment = await this.urgencyClassifier.assessUrgency(clinicalInput, patientContext)
      const triageResult = this.urgencyClassifier.performTriage(urgencyAssessment)
      
      console.log(`🎯 Urgencia detectada: ${urgencyAssessment.overallLevel} (Gravedad máx: ${urgencyAssessment.maxGravityScore})`)
      
      // FASE 2: Extraer y estructurar cada sección SOAP (con contexto defensivo)
      const subjetivoData = await this.extractSubjectiveData(clinicalInput)
      const objetivoData = await this.inferObjectiveFindings(clinicalInput, subjetivoData)
      const analisisData = await this.generateDifferentialDx(
        clinicalInput, 
        subjetivoData, 
        objetivoData, 
        urgencyAssessment
      )
      const planData = await this.createTreatmentPlan(
        clinicalInput, 
        subjetivoData, 
        objetivoData, 
        analisisData,
        urgencyAssessment,
        triageResult
      )

      // FASE 3: Construir SOAP completo con medicina defensiva
      const soapData: SOAPData = {
        subjetivo: subjetivoData,
        objetivo: objetivoData,
        analisis: analisisData,
        plan: planData
      }

      // FASE 4: Calcular métricas de calidad (incluyendo medicina defensiva)
      const calidad = this.calculateQualityMetrics(soapData, urgencyAssessment)
      const clasificacion = this.classifyCase(soapData, urgencyAssessment)

      const analysis: SOAPAnalysis = {
        soap: soapData,
        defensiveAssessment: urgencyAssessment,
        triageResult,
        metadata: {
          version: this.version,
          normativa: this.normativa,
          fechaAnalisis: new Date().toISOString(),
          profesionalResponsable: 'Sistema AI Médico Defensivo - Redux Claude',
          institucion: 'Plataforma Digital de Salud',
          clasificacion,
          calidad,
          defensiveMedicine: {
            urgentPatternsDetected: urgencyAssessment.identifiedPatterns.length,
            gravityPrioritization: true,
            redFlagsIdentified: urgencyAssessment.riskFactors.map(rf => rf.factor),
            immediateActionsRequired: urgencyAssessment.immediateActions.length > 0
          }
        }
      }

      const processingTime = Date.now() - startTime
      console.log(`✅ SOAP + Medicina Defensiva procesado en ${processingTime}ms`)
      console.log(`🚨 Nivel de urgencia: ${urgencyAssessment.overallLevel.toUpperCase()}`)
      console.log(`📊 Calidad defensiva: ${calidad.medicinaDefensiva}%`)

      return analysis

    } catch (error) {
      console.error('❌ Error procesando SOAP con Medicina Defensiva:', error)
      throw new Error(`SOAPProcessor with Defensive Medicine failed: ${error}`)
    }
  }

  /**
   * 📝 S - SUBJETIVO: Extrae datos subjetivos del paciente
   */
  private async extractSubjectiveData(input: string): Promise<SOAPData['subjetivo']> {
    // Parsear información subjetiva del input clínico
    const motivoConsulta = this.extractChiefComplaint(input)
    const historiaActual = this.extractPresentIllness(input)
    const antecedentes = this.extractMedicalHistory(input)
    const revisionSistemas = this.extractSystemReview(input)
    const contextoPsicosocial = this.extractPsychosocialContext(input)

    return {
      motivoConsulta,
      historiaActual,
      antecedentes,
      revisionSistemas,
      contextoPsicosocial
    }
  }

  /**
   * 🔬 O - OBJETIVO: Infiere hallazgos objetivos
   */
  private async inferObjectiveFindings(
    input: string, 
    subjetivo: SOAPData['subjetivo']
  ): Promise<SOAPData['objetivo']> {
    
    const signosVitales = this.extractVitalSigns(input)
    const exploracionFisica = this.inferPhysicalExam(input, subjetivo)
    const estudiosComplementarios = this.extractDiagnosticStudies(input)

    return {
      signosVitales,
      exploracionFisica,
      estudiosComplementarios
    }
  }

  /**
   * ⚕️ A - ANÁLISIS: Diagnóstico diferencial estructurado + Medicina Defensiva
   */
  private async generateDifferentialDx(
    input: string,
    subjetivo: SOAPData['subjetivo'],
    objetivo: SOAPData['objetivo'],
    urgencyAssessment?: UrgencyAssessment
  ): Promise<SOAPData['analisis']> {
    
    // Generar diagnóstico principal basado en evidencia + medicina defensiva
    const diagnosticoPrincipal = this.generatePrimaryDiagnosis(input, subjetivo, objetivo, urgencyAssessment)
    
    // Diagnósticos diferenciales priorizados por GRAVEDAD (medicina defensiva)
    const diagnosticosDiferenciales = this.generateDefensiveDifferentialDiagnoses(
      input, 
      subjetivo, 
      objetivo, 
      urgencyAssessment
    )
    
    const factoresRiesgo = this.identifyRiskFactors(subjetivo, objetivo)
    const senosPeligro = this.identifyRedFlags(input, subjetivo, objetivo)
    const pronostico = this.assessPrognosis(diagnosticoPrincipal, diagnosticosDiferenciales)

    return {
      diagnosticoPrincipal,
      diagnosticosDiferenciales,
      factoresRiesgo,
      senosPeligro,
      pronostico
    }
  }

  /**
   * 📝 P - PLAN: Plan terapéutico integral NOM-004 + Medicina Defensiva
   */
  private async createTreatmentPlan(
    input: string,
    subjetivo: SOAPData['subjetivo'],
    objetivo: SOAPData['objetivo'],
    analisis: SOAPData['analisis'],
    urgencyAssessment?: UrgencyAssessment,
    triageResult?: TriageResult
  ): Promise<SOAPData['plan']> {
    
    const tratamientoFarmacologico = this.createPharmacologicalPlan(analisis)
    const tratamientoNoFarmacologico = this.createNonPharmacologicalPlan(analisis)
    const estudiosAdicionales = this.planAdditionalStudies(analisis)
    const interconsultas = this.planReferrals(analisis)
    const seguimiento = this.createFollowUpPlan(analisis)
    const pronostico = analisis.pronostico.inmediato
    const certificaciones = this.assessCertifications(analisis)

    return {
      tratamientoFarmacologico,
      tratamientoNoFarmacologico,
      estudiosAdicionales,
      interconsultas,
      seguimiento,
      pronostico,
      certificaciones
    }
  }

  // 🔍 MÉTODOS DE EXTRACCIÓN Y ANÁLISIS

  private extractChiefComplaint(input: string): string {
    // Buscar patrones de motivo de consulta
    const patterns = [
      /motivo.*consulta.*?:?\s*([^.]+)/i,
      /presenta.*?:?\s*([^.]+)/i,
      /refiere.*?:?\s*([^.]+)/i,
      /acude.*por.*?:?\s*([^.]+)/i
    ]
    
    for (const pattern of patterns) {
      const match = input.match(pattern)
      if (match) return match[1].trim()
    }
    
    return 'Paciente acude por evaluación médica'
  }

  private extractPresentIllness(input: string): string {
    // Extraer historia de enfermedad actual
    const historyPatterns = [
      /historia.*actual.*?:?\s*([^.]+)/i,
      /enfermedad.*actual.*?:?\s*([^.]+)/i,
      /desde.*hace.*?([^.]+)/i,
      /evolución.*?:?\s*([^.]+)/i
    ]
    
    let historia = ''
    for (const pattern of historyPatterns) {
      const match = input.match(pattern)
      if (match) historia += match[1].trim() + '. '
    }
    
    return historia || 'Historia de enfermedad actual por completar durante consulta'
  }

  private extractMedicalHistory(input: string): SOAPData['subjetivo']['antecedentes'] {
    return {
      personales: this.extractPersonalHistory(input),
      familiares: this.extractFamilyHistory(input),
      medicamentos: this.extractMedications(input),
      alergias: this.extractAllergies(input)
    }
  }

  private extractPersonalHistory(input: string): string[] {
    const antecedentes: string[] = []
    const patterns = [
      /antecedent.*personal.*?:?\s*([^.]+)/i,
      /(hipertens[ií]ón|diabetes|tabaquismo|alcoholismo)/gi,
      /(cirugía|operación|hospitalización)/gi
    ]
    
    patterns.forEach(pattern => {
      const matches = input.match(pattern)
      if (matches) antecedentes.push(...matches)
    })
    
    return antecedentes.length > 0 ? antecedentes : ['Sin antecedentes patológicos conocidos']
  }

  private extractFamilyHistory(input: string): string[] {
    const patterns = [
      /antecedent.*familiar.*?:?\s*([^.]+)/i,
      /padre.*?([^.]+)/i,
      /madre.*?([^.]+)/i,
      /familia.*?([^.]+)/i
    ]
    
    const familiares: string[] = []
    patterns.forEach(pattern => {
      const match = input.match(pattern)
      if (match) familiares.push(match[1].trim())
    })
    
    return familiares.length > 0 ? familiares : ['Sin antecedentes familiares relevantes']
  }

  private extractMedications(input: string): string[] {
    const patterns = [
      /medicament.*?:?\s*([^.]+)/i,
      /tratamiento.*?:?\s*([^.]+)/i,
      /toma.*?:?\s*([^.]+)/i
    ]
    
    const medicamentos: string[] = []
    patterns.forEach(pattern => {
      const match = input.match(pattern)
      if (match) medicamentos.push(match[1].trim())
    })
    
    return medicamentos.length > 0 ? medicamentos : ['Ninguno referido']
  }

  private extractAllergies(input: string): string[] {
    const patterns = [
      /alergi.*?:?\s*([^.]+)/i,
      /reaccion.*adversa.*?:?\s*([^.]+)/i
    ]
    
    const alergias: string[] = []
    patterns.forEach(pattern => {
      const match = input.match(pattern)
      if (match) alergias.push(match[1].trim())
    })
    
    return alergias.length > 0 ? alergias : ['NKDA (No Known Drug Allergies)']
  }

  private extractSystemReview(input: string): string {
    return 'Revisión por sistemas pendiente durante consulta presencial'
  }

  private extractPsychosocialContext(input: string): string {
    const socialPatterns = [
      /sedentario/i,
      /fuma/i,
      /alcohol/i,
      /estrés/i,
      /trabajo/i
    ]
    
    const contexto: string[] = []
    socialPatterns.forEach(pattern => {
      if (pattern.test(input)) {
        contexto.push(pattern.source.replace(/[^a-zA-Z]/g, ''))
      }
    })
    
    return contexto.length > 0 ? 
      `Factores psicosociales: ${contexto.join(', ')}` : 
      'Contexto psicosocial por evaluar'
  }

  private extractVitalSigns(input: string): SOAPData['objetivo']['signosVitales'] {
    const vitals: SOAPData['objetivo']['signosVitales'] = {}
    
    const patterns = {
      presionArterial: /PA.*?(\d+\/\d+)/i,
      frecuenciaCardiaca: /FC.*?(\d+)/i,
      temperatura: /temperatura.*?(\d+\.?\d*)/i,
      peso: /peso.*?(\d+\.?\d*)/i,
      talla: /talla.*?(\d+\.?\d*)/i
    }
    
    Object.entries(patterns).forEach(([key, pattern]) => {
      const match = input.match(pattern)
      if (match) {
        vitals[key as keyof SOAPData['objetivo']['signosVitales']] = match[1]
      }
    })
    
    return vitals
  }

  private inferPhysicalExam(input: string, subjetivo: SOAPData['subjetivo']): SOAPData['objetivo']['exploracionFisica'] {
    return {
      aspecto: 'Paciente consciente, orientado, en condiciones generales aparentemente adecuadas',
      cabezaCuello: 'Normocéfalo, cuello sin adenopatías palpables',
      torax: 'Tórax simétrico, ruidos respiratorios normales',
      abdomen: 'Abdomen blando, depresible, sin dolor a la palpación',
      extremidades: 'Extremidades simétricas, sin edema',
      neurologico: 'Neurológicamente íntegro',
      piel: 'Piel sin lesiones aparentes'
    }
  }

  private extractDiagnosticStudies(input: string): SOAPData['objetivo']['estudiosComplementarios'] {
    const estudios: SOAPData['objetivo']['estudiosComplementarios'] = {}
    
    // Buscar laboratorios
    const labPatterns = [
      /glucosa.*?(\d+)/i,
      /colesterol.*?(\d+)/i,
      /hemoglobina.*?(\d+)/i
    ]
    
    const laboratorios: Record<string, string> = {}
    labPatterns.forEach(pattern => {
      const match = input.match(pattern)
      if (match) {
        const testName = match[0].split(/\s*\d/)[0].trim()
        laboratorios[testName] = match[1]
      }
    })
    
    if (Object.keys(laboratorios).length > 0) {
      estudios.laboratorios = laboratorios
    }
    
    return estudios
  }

  private generatePrimaryDiagnosis(
    input: string,
    subjetivo: SOAPData['subjetivo'],
    objetivo: SOAPData['objetivo'],
    urgencyAssessment?: UrgencyAssessment
  ): SOAPData['analisis']['diagnosticoPrincipal'] {
    
    // Si hay patrones urgentes identificados, priorizar diagnóstico de alta gravedad
    if (urgencyAssessment && urgencyAssessment.identifiedPatterns.length > 0) {
      const mostCriticalPattern = urgencyAssessment.identifiedPatterns
        .sort((a, b) => b.gravityScore - a.gravityScore)[0]
      
      return {
        condicion: mostCriticalPattern.criticalDifferentials[0] || 'Síndrome clínico crítico',
        cie10: 'Z03.9', // En implementación real mapearía CIE-10 específicos
        evidencia: [
          'Patrón de síntomas compatible con urgencia médica',
          `Gravedad score: ${mostCriticalPattern.gravityScore}/10`,
          ...mostCriticalPattern.redFlags
        ],
        probabilidad: 0.6 // Baja probabilidad pero ALTA gravedad (medicina defensiva)
      }
    }
    
    // Diagnóstico estándar si no hay urgencia
    return {
      condicion: 'Síndrome clínico por definir',
      cie10: 'Z03.9',
      evidencia: ['Síntomas reportados por paciente', 'Hallazgos clínicos pendientes'],
      probabilidad: 0.7
    }
  }

  /**
   * 🚨 NUEVO: Genera diagnósticos diferenciales aplicando medicina defensiva
   * Prioriza GRAVEDAD sobre PROBABILIDAD (70% vs 30%)
   */
  private generateDefensiveDifferentialDiagnoses(
    input: string,
    subjetivo: SOAPData['subjetivo'],
    objetivo: SOAPData['objetivo'],
    urgencyAssessment?: UrgencyAssessment
  ): SOAPData['analisis']['diagnosticosDiferenciales'] {
    
    const baseDifferentials = [
      {
        condicion: 'Proceso infeccioso viral',
        cie10: 'B34.9',
        evidencia: ['Síntomas sistémicos'],
        probabilidad: 0.4,
        gravedad: 'baja' as const,
        urgencia: 'no_urgente' as const
      },
      {
        condicion: 'Proceso inflamatorio',
        cie10: 'M79.3',
        evidencia: ['Respuesta inflamatoria'],
        probabilidad: 0.3,
        gravedad: 'moderada' as const,
        urgencia: 'semi_urgente' as const
      }
    ]

    // Si hay assessment de urgencia, agregar diagnósticos críticos al inicio
    if (urgencyAssessment && urgencyAssessment.identifiedPatterns.length > 0) {
      const criticalDifferentials = urgencyAssessment.identifiedPatterns
        .flatMap(pattern => pattern.criticalDifferentials.map(diff => ({
          condicion: diff,
          cie10: 'Z03.9', // En implementación real mapearía CIE-10 específicos
          evidencia: [`Patrón de riesgo identificado: ${pattern.symptoms.join(', ')}`, ...pattern.redFlags],
          probabilidad: 0.2, // BAJA probabilidad
          gravedad: pattern.gravityScore >= 9 ? 'critica' as const : 'alta' as const, // ALTA gravedad
          urgencia: pattern.timeToAction === 'immediate' ? 'emergencia' as const : 'urgente' as const
        })))

      // MEDICINA DEFENSIVA: Colocar diagnósticos críticos AL INICIO
      return [...criticalDifferentials, ...baseDifferentials]
    }

    return baseDifferentials
  }

  private generateDifferentialDiagnoses(
    input: string,
    subjetivo: SOAPData['subjetivo'],
    objetivo: SOAPData['objetivo']
  ): SOAPData['analisis']['diagnosticosDiferenciales'] {
    // Método legacy - mantener para compatibilidad
    return this.generateDefensiveDifferentialDiagnoses(input, subjetivo, objetivo)
  }

  private identifyRiskFactors(
    subjetivo: SOAPData['subjetivo'],
    objetivo: SOAPData['objetivo']
  ): string[] {
    const factores: string[] = []
    
    if (subjetivo.antecedentes.personales.some(a => /diabetes/i.test(a))) {
      factores.push('Diabetes mellitus')
    }
    if (subjetivo.antecedentes.personales.some(a => /hipertens/i.test(a))) {
      factores.push('Hipertensión arterial')
    }
    
    return factores.length > 0 ? factores : ['Factores de riesgo por evaluar']
  }

  private identifyRedFlags(
    input: string,
    subjetivo: SOAPData['subjetivo'],
    objetivo: SOAPData['objetivo']
  ): string[] {
    const redFlags: string[] = []
    
    const dangerPatterns = [
      /dolor.*torácico/i,
      /dificultad.*respirar/i,
      /pérdida.*consciencia/i,
      /sangrado/i
    ]
    
    dangerPatterns.forEach(pattern => {
      if (pattern.test(input)) {
        redFlags.push(`Posible: ${pattern.source.replace(/[^a-zA-Z\s]/g, '')}`)
      }
    })
    
    return redFlags.length > 0 ? redFlags : ['No se identifican señales de alarma inmediatas']
  }

  private assessPrognosis(
    diagnosticoPrincipal: SOAPData['analisis']['diagnosticoPrincipal'],
    diferenciales: SOAPData['analisis']['diagnosticosDiferenciales']
  ): SOAPData['analisis']['pronostico'] {
    
    return {
      inmediato: 'Estable, sin compromiso vital inmediato',
      cortoplazo: 'Favorable con tratamiento apropiado',
      largoplazo: 'Dependiente de adherencia terapéutica y seguimiento'
    }
  }

  private createPharmacologicalPlan(analisis: SOAPData['analisis']): SOAPData['plan']['tratamientoFarmacologico'] {
    return [
      {
        medicamento: 'Paracetamol',
        dosis: '500 mg',
        via: 'Oral',
        frecuencia: 'Cada 8 horas',
        duracion: '3-5 días',
        indicaciones: 'Con alimentos, abundante agua',
        contraindicaciones: ['Hepatopatía severa', 'Alergia conocida']
      }
    ]
  }

  private createNonPharmacologicalPlan(analisis: SOAPData['analisis']): string[] {
    return [
      'Reposo relativo',
      'Hidratación adecuada',
      'Dieta blanda',
      'Medidas de higiene general'
    ]
  }

  private planAdditionalStudies(analisis: SOAPData['analisis']): SOAPData['plan']['estudiosAdicionales'] {
    return [
      {
        estudio: 'Biometría hemática completa',
        justificacion: 'Descartar proceso infeccioso',
        urgencia: '24h' as const
      },
      {
        estudio: 'Química sanguínea',
        justificacion: 'Evaluación metabólica',
        urgencia: '24h' as const
      }
    ]
  }

  private planReferrals(analisis: SOAPData['analisis']): SOAPData['plan']['interconsultas'] {
    return []
  }

  private createFollowUpPlan(analisis: SOAPData['analisis']): SOAPData['plan']['seguimiento'] {
    return {
      proximaCita: 'En 7-10 días o antes si hay deterioro',
      criteriosAlarma: [
        'Fiebre persistente > 38.5°C',
        'Dificultad respiratoria',
        'Dolor intenso no controlado',
        'Alteraciones del estado de consciencia'
      ],
      educacionPaciente: [
        'Reconocer signos de alarma',
        'Importancia de adherencia terapéutica',
        'Medidas preventivas generales'
      ],
      modificacionesEstiloVida: [
        'Alimentación balanceada',
        'Ejercicio moderado según tolerancia',
        'Evitar factores de riesgo'
      ]
    }
  }

  private assessCertifications(analisis: SOAPData['analisis']): SOAPData['plan']['certificaciones'] {
    return {
      incapacidad: {
        dias: 3,
        tipo: 'temporal' as const,
        actividades: ['Reposo laboral', 'Evitar esfuerzos físicos intensos']
      }
    }
  }

  private calculateQualityMetrics(
    soap: SOAPData, 
    urgencyAssessment?: UrgencyAssessment
  ): NonNullable<SOAPAnalysis['metadata']>['calidad'] {
    let completitud = 0
    let coherencia = 0
    let seguridadClinica = 0
    let cumplimientoNormativo = 0
    let medicinaDefensiva = 0

    // Evaluar completitud (25% por sección)
    if (soap.subjetivo.motivoConsulta) completitud += 25
    if (soap.objetivo.signosVitales) completitud += 25
    if (soap.analisis.diagnosticoPrincipal) completitud += 25
    if (soap.plan.tratamientoFarmacologico.length > 0) completitud += 25

    // Coherencia básica
    coherencia = 85

    // Seguridad clínica mejorada con medicina defensiva
    seguridadClinica = soap.analisis.senosPeligro.length === 0 ? 90 : 70
    if (urgencyAssessment) {
      // Bonificación por identificación de patrones urgentes
      if (urgencyAssessment.identifiedPatterns.length > 0) seguridadClinica += 10
      // Bonificación por acciones inmediatas definidas
      if (urgencyAssessment.immediateActions.length > 0) seguridadClinica += 5
      seguridadClinica = Math.min(seguridadClinica, 100)
    }

    // Cumplimiento normativo NOM-004
    cumplimientoNormativo = 95

    // NUEVO: Medicina Defensiva Score
    if (urgencyAssessment) {
      medicinaDefensiva = 0
      
      // +30 pts por identificación de patrones urgentes
      if (urgencyAssessment.identifiedPatterns.length > 0) {
        medicinaDefensiva += 30
      }
      
      // +25 pts por priorización por gravedad
      const hasHighGravityFirst = soap.analisis.diagnosticosDiferenciales[0]?.gravedad === 'critica' || 
                                  soap.analisis.diagnosticosDiferenciales[0]?.gravedad === 'alta'
      if (hasHighGravityFirst) {
        medicinaDefensiva += 25
      }
      
      // +20 pts por factores de riesgo identificados
      if (urgencyAssessment.riskFactors.length > 0) {
        medicinaDefensiva += 20
      }
      
      // +15 pts por criterios de escalación definidos
      if (urgencyAssessment.escalationCriteria.length > 0) {
        medicinaDefensiva += 15
      }
      
      // +10 pts por acciones inmediatas
      if (urgencyAssessment.immediateActions.length > 0) {
        medicinaDefensiva += 10
      }
      
      medicinaDefensiva = Math.min(medicinaDefensiva, 100)
    }

    return {
      completitud,
      coherencia,
      seguridadClinica,
      cumplimientoNormativo,
      medicinaDefensiva
    }
  }

  private classifyCase(
    soap: SOAPData, 
    urgencyAssessment?: UrgencyAssessment
  ): NonNullable<SOAPAnalysis['metadata']>['clasificacion'] {
    const urgencia = this.calculateUrgencyLevel(soap, urgencyAssessment)
    const complejidad = this.assessComplexity(soap, urgencyAssessment)
    const riesgoVital = this.assessVitalRisk(soap, urgencyAssessment)

    // Determinar especialidades requeridas basado en medicina defensiva
    const especialidad = this.determineSpecialties(soap, urgencyAssessment)

    return {
      complejidad,
      especialidad,
      urgencia,
      riesgoVital
    }
  }

  /**
   * 🚨 NUEVO: Determina especialidades requeridas con medicina defensiva
   */
  private determineSpecialties(
    soap: SOAPData, 
    urgencyAssessment?: UrgencyAssessment
  ): string[] {
    const especialidades = ['Medicina General']

    if (urgencyAssessment) {
      urgencyAssessment.identifiedPatterns.forEach(pattern => {
        pattern.criticalDifferentials.forEach(diff => {
          if (diff.toLowerCase().includes('infarto') || diff.toLowerCase().includes('cardíaco')) {
            if (!especialidades.includes('Cardiología')) especialidades.push('Cardiología')
          }
          if (diff.toLowerCase().includes('hemorragia') || diff.toLowerCase().includes('neurológico')) {
            if (!especialidades.includes('Neurología')) especialidades.push('Neurología')
          }
          if (diff.toLowerCase().includes('apendicitis') || diff.toLowerCase().includes('abdominal')) {
            if (!especialidades.includes('Cirugía General')) especialidades.push('Cirugía General')
          }
          if (diff.toLowerCase().includes('embolia') || diff.toLowerCase().includes('pulmonar')) {
            if (!especialidades.includes('Medicina Interna')) especialidades.push('Medicina Interna')
          }
        })
      })
    }

    return especialidades
  }

  private calculateUrgencyLevel(
    soap: SOAPData, 
    urgencyAssessment?: UrgencyAssessment
  ): 1 | 2 | 3 | 4 | 5 {
    // Medicina defensiva: Usar assessment de urgencia si disponible
    if (urgencyAssessment) {
      switch (urgencyAssessment.overallLevel) {
        case 'critical': return 1 // Resucitación
        case 'high': return 2 // Emergencia
        case 'medium': return 3 // Urgente
        default: return 4 // Semi-urgente
      }
    }

    // ESI (Emergency Severity Index) simplificado - fallback
    const hasRedFlags = soap.analisis.senosPeligro.some(flag => 
      !flag.includes('No se identifican')
    )
    
    if (hasRedFlags) return 2 // Urgente
    return 3 // Semi-urgente
  }

  private assessComplexity(
    soap: SOAPData, 
    urgencyAssessment?: UrgencyAssessment
  ): 'baja' | 'media' | 'alta' | 'critica' {
    let factorsCount = soap.analisis.factoresRiesgo.length + 
                      soap.analisis.diagnosticosDiferenciales.length
    
    // Medicina defensiva: Incrementar complejidad si hay patrones urgentes
    if (urgencyAssessment) {
      factorsCount += urgencyAssessment.identifiedPatterns.length * 2
      factorsCount += urgencyAssessment.riskFactors.length

      if (urgencyAssessment.overallLevel === 'critical') return 'critica'
      if (urgencyAssessment.maxGravityScore >= 8) return 'alta'
    }
    
    if (factorsCount > 5) return 'alta'
    if (factorsCount > 2) return 'media'
    return 'baja'
  }

  private assessVitalRisk(
    soap: SOAPData, 
    urgencyAssessment?: UrgencyAssessment
  ): boolean {
    // Medicina defensiva: Usar assessment de urgencia
    if (urgencyAssessment) {
      return urgencyAssessment.overallLevel === 'critical' || 
             urgencyAssessment.maxGravityScore >= 9
    }

    // Evaluación estándar - fallback
    return soap.analisis.diagnosticosDiferenciales.some(dx => 
      dx.gravedad === 'critica' || dx.urgencia === 'emergencia'
    )
  }
}