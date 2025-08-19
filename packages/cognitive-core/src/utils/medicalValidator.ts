// Validador de Contenido Médico - Creado por Bernard Orozco
import { MedicalValidationResult, MedicalCase, SOAPAnalysis } from '../types/medical'

export interface BasicMedicalValidationResult {
  isValid: boolean
  confidence: number
  rejectionReason?: string
  suggestedFormat?: string
}

export class MedicalContentValidator {
  
  // Términos médicos y clínicos clave
  private readonly medicalTerms = [
    // Síntomas generales
    'dolor', 'fiebre', 'náuseas', 'vómitos', 'diarrea', 'estreñimiento', 'cefalea', 'mareo',
    'fatiga', 'astenia', 'anorexia', 'pérdida', 'peso', 'sudoración', 'escalofríos',
    
    // Términos clínicos
    'paciente', 'síntomas', 'diagnóstico', 'tratamiento', 'medicamento', 'dosis',
    'antecedentes', 'historia', 'clínica', 'examen', 'físico', 'laboratorios',
    
    // Especialidades médicas
    'cardiología', 'neurología', 'psiquiatría', 'dermatología', 'gastroenterología',
    'medicina', 'pediatría', 'ginecología', 'urología', 'oftalmología',
    
    // Términos anatómicos
    'corazón', 'pulmón', 'hígado', 'riñón', 'cerebro', 'estómago', 'intestino',
    'piel', 'hueso', 'músculo', 'sangre', 'presión', 'arterial',
    
    // Psicológicos/Psiquiátricos
    'depresión', 'ansiedad', 'estrés', 'insomnio', 'trastorno', 'estado', 'ánimo',
    'psicológico', 'emocional', 'mental', 'comportamiento', 'conducta',
    
    // Temporales médicos
    'años', 'meses', 'días', 'horas', 'crónico', 'agudo', 'recurrente', 'episodio',
    
    // Exámenes y procedimientos
    'rayos', 'tomografía', 'resonancia', 'ecografía', 'biopsia', 'análisis',
    'hemograma', 'glucosa', 'colesterol', 'presión', 'temperatura'
  ]

  // Patrones de casos clínicos válidos
  private readonly medicalPatterns = [
    /paciente\s+(masculino|femenino|de|con|presenta)/i,
    /años?\s+(presenta|refiere|acude|consulta)/i,
    /historia\s+de/i,
    /antecedentes?\s+(de|médicos?|familiares?)/i,
    /síntomas?\s+(de|como|incluyen?)/i,
    /dolor\s+(en|de|abdominal|torácico|cefálico)/i,
    /presenta?\s+(cuadro|sintomatología|clínica)/i,
    /diagnóstico\s+(de|diferencial|principal)/i,
    /tratamiento\s+(con|de|farmacológico)/i,
    /examen\s+físico/i,
    /signos?\s+vitales?/i,
    /laboratorios?\s+(muestran?|revelan?|reportan?)/i
  ]

  // Patrones que NO son médicos
  private readonly nonMedicalPatterns = [
    /hola|hello|buenos?\s+días?|buenas?\s+tardes?/i,
    /cómo\s+estás?|how\s+are\s+you/i,
    /qué\s+tal|what\'?s\s+up/i,
    /programación|código|software|javascript|python/i,
    /matemáticas?|cálculo|algebra|geometría/i,
    /recetas?\s+de\s+cocina|ingredientes?|comida/i,
    /deportes?|fútbol|básquet|tenis/i,
    /clima|tiempo|lluvia|sol/i,
    /política|gobierno|elecciones?/i,
    /entretenimiento|música|películas?|series?/i,
    /viajes?|turismo|vacaciones?/i,
    /tecnología\s+(no\s+médica)|gadgets?|teléfonos?/i
  ]

  /**
   * Valida si el texto ingresado corresponde a un caso clínico o consulta médica
   */
  public validateMedicalContent(text: string): BasicMedicalValidationResult {
    const cleanText = text.toLowerCase().trim()
    
    if (cleanText.length < 10) {
      return {
        isValid: false,
        confidence: 0.9,
        rejectionReason: 'input_too_short',
        suggestedFormat: 'Proporciona más detalles del caso clínico'
      }
    }

    // Verificar patrones explícitamente no médicos
    const nonMedicalMatches = this.nonMedicalPatterns.filter(pattern => pattern.test(cleanText))
    if (nonMedicalMatches.length > 0) {
      return {
        isValid: false,
        confidence: 0.95,
        rejectionReason: 'non_medical_content',
        suggestedFormat: 'Este sistema está diseñado exclusivamente para análisis de casos clínicos'
      }
    }

    // Verificar patrones médicos estructurados
    const medicalPatternMatches = this.medicalPatterns.filter(pattern => pattern.test(cleanText))
    const medicalTermMatches = this.medicalTerms.filter(term => cleanText.includes(term))

    // Calcular puntuación
    let score = 0
    
    // Peso alto para patrones médicos estructurados
    score += medicalPatternMatches.length * 25
    
    // Peso medio para términos médicos
    score += medicalTermMatches.length * 5
    
    // Bonificación por estructura de caso clínico
    if (this.hasClinicStructure(cleanText)) {
      score += 30
    }

    // Penalización por falta de contexto médico
    if (!this.hasAgeGenderContext(cleanText)) {
      score -= 15
    }

    const confidence = Math.min(score / 100, 0.98)

    if (confidence < 0.4) {
      return {
        isValid: false,
        confidence: 1 - confidence,
        rejectionReason: 'insufficient_medical_context',
        suggestedFormat: 'Incluye: edad, género, síntomas principales, duración, antecedentes relevantes'
      }
    }

    return {
      isValid: true,
      confidence
    }
  }

  /**
   * Verifica si el texto tiene estructura de caso clínico
   */
  private hasClinicStructure(text: string): boolean {
    const structureIndicators = [
      /(años?|edad)/i,
      /(presenta|refiere|acude|consulta)/i,
      /(síntomas?|dolor|molestias?)/i,
      /(desde|hace|durante)/i,
      /(antecedentes?|historia)/i
    ]

    return structureIndicators.filter(pattern => pattern.test(text)).length >= 3
  }

  /**
   * Verifica si incluye contexto de edad y género
   */
  private hasAgeGenderContext(text: string): boolean {
    const agePattern = /\d+\s*años?/i
    const genderPattern = /(masculino|femenino|hombre|mujer|varón|paciente\s+(de|con))/i
    
    return agePattern.test(text) || genderPattern.test(text)
  }

  /**
   * Genera mensaje de rechazo apropiado
   */
  public generateRejectionMessage(result: BasicMedicalValidationResult): string {
    const baseMessage = "## ⚠️ Consulta No Válida\n\n"
    
    switch (result.rejectionReason) {
      case 'input_too_short':
        return baseMessage + `**Información insuficiente**

Por favor, proporciona un caso clínico más detallado que incluya:

📋 **Formato recomendado:**
- **Paciente:** Edad, género
- **Motivo de consulta:** Síntoma principal
- **Historia actual:** Duración, características, evolución
- **Antecedentes:** Médicos, familiares, medicamentos
- **Examen físico:** Hallazgos relevantes (si disponible)

**Ejemplo:** *"Paciente masculino de 45 años presenta dolor torácico opresivo de 2 horas de evolución, irradiado a brazo izquierdo. Antecedente de hipertensión arterial..."*`

      case 'non_medical_content':
        return baseMessage + `**Fuera del dominio médico**

Este sistema está especializado exclusivamente en:
- 🏥 **Análisis de casos clínicos**
- 💊 **Consultas médicas y diagnósticos**
- 🧠 **Evaluaciones psicológicas y psiquiátricas**

No puedo ayudar con temas fuera del ámbito médico-psicológico.

Por favor, reformula tu consulta como un caso clínico específico.`

      case 'insufficient_medical_context':
        return baseMessage + `**Requiere más contexto médico**

Para realizar un análisis clínico apropiado, necesito información específica del paciente.

📝 **Incluye en tu consulta:**
1. **Datos demográficos:** Edad, género
2. **Síntomas principales:** Qué presenta el paciente
3. **Cronología:** Cuándo comenzó, evolución
4. **Antecedentes:** Médicos relevantes
5. **Contexto:** Circunstancias asociadas

**Reformula tu consulta con estos elementos para obtener un análisis médico completo.**`

      default:
        return baseMessage + `**Consulta no reconocida como caso clínico**

${result.suggestedFormat}

Por favor, estructura tu consulta como un caso médico específico.`
    }
  }
}

/**
 * Validador Médico Avanzado para Sistema Iterativo
 * Evaluación profunda de casos clínicos y análisis SOAP
 */
export class MedicalQualityValidator {
  private contentValidator: MedicalContentValidator

  constructor() {
    this.contentValidator = new MedicalContentValidator()
  }

  /**
   * Validación completa para casos médicos iterativos
   */
  public validateMedicalCase(text: string): MedicalValidationResult {
    // Validación básica primero
    const basicValidation = this.contentValidator.validateMedicalContent(text)
    
    if (!basicValidation.isValid) {
      return {
        isValid: false,
        confidence: basicValidation.confidence,
        medicalTermsFound: [],
        missingCriticalData: [],
        structureScore: 0,
        clinicalCoherence: 0,
        rejectionReason: basicValidation.rejectionReason,
        suggestedImprovements: [basicValidation.suggestedFormat || 'Mejora la estructura del caso']
      }
    }

    // Validación avanzada
    const medicalTerms = this.extractMedicalTerms(text)
    const missingData = this.identifyMissingCriticalData(text)
    const structureScore = this.evaluateStructure(text)
    const clinicalCoherence = this.evaluateClinicalCoherence(text)

    const confidence = this.calculateAdvancedConfidence(
      basicValidation.confidence,
      structureScore,
      clinicalCoherence,
      medicalTerms.length,
      missingData.length
    )

    return {
      isValid: confidence > 0.6,
      confidence,
      medicalTermsFound: medicalTerms,
      missingCriticalData: missingData,
      structureScore,
      clinicalCoherence,
      suggestedImprovements: this.generateImprovementSuggestions(missingData, structureScore)
    }
  }

  /**
   * Valida análisis SOAP generado
   */
  public validateSOAPAnalysis(analysis: SOAPAnalysis): MedicalValidationResult {
    const issues: string[] = []
    let totalScore = 0

    // Evaluar sección Subjetivo
    const subjectivoScore = this.evaluateSubjectivoSection(analysis.subjetivo || '')
    totalScore += subjectivoScore * 0.25

    if (subjectivoScore < 0.6) {
      issues.push('Sección Subjetivo incompleta o poco clara')
    }

    // Evaluar sección Objetivo
    const objetivoScore = this.evaluateObjetivoSection(analysis.objetivo || '')
    totalScore += objetivoScore * 0.25

    if (objetivoScore < 0.6) {
      issues.push('Sección Objetivo carece de datos físicos/vitales específicos')
    }

    // Evaluar Análisis diagnóstico
    const analisisScore = this.evaluateAnalysisSection(
      analysis.diagnostico_principal || '',
      analysis.diagnosticos_diferenciales || []
    )
    totalScore += analisisScore * 0.3

    if (analisisScore < 0.6) {
      issues.push('Análisis diagnóstico insuficiente o poco estructurado')
    }

    // Evaluar Plan
    const planScore = this.evaluatePlanSection(analysis.plan_tratamiento || '')
    totalScore += planScore * 0.2

    if (planScore < 0.6) {
      issues.push('Plan de tratamiento incompleto o vago')
    }

    return {
      isValid: totalScore > 0.65,
      confidence: totalScore,
      medicalTermsFound: this.extractMedicalTermsFromSOAP(analysis),
      missingCriticalData: issues,
      structureScore: totalScore,
      clinicalCoherence: this.evaluateSOAPCoherence(analysis),
      suggestedImprovements: this.generateSOAPImprovements(analysis, issues)
    }
  }

  private extractMedicalTerms(text: string): string[] {
    const terms = this.contentValidator['medicalTerms'] // Acceso al array privado
    const cleanText = text.toLowerCase()
    return terms.filter(term => cleanText.includes(term))
  }

  private identifyMissingCriticalData(text: string): string[] {
    const missing: string[] = []
    const cleanText = text.toLowerCase()

    if (!cleanText.match(/\d+\s*años?/)) {
      missing.push('Edad del paciente')
    }

    if (!cleanText.match(/(masculino|femenino|hombre|mujer)/i)) {
      missing.push('Género del paciente')
    }

    if (!cleanText.match(/(desde|hace|durante|\d+\s*(días?|meses|horas?|semanas?))/i)) {
      missing.push('Cronología/duración de síntomas')
    }

    if (!cleanText.match(/(antecedentes?|historia\s+(de|médica|familiar))/i)) {
      missing.push('Antecedentes médicos')
    }

    if (!cleanText.match(/(síntomas?|dolor|presenta|refiere|molestias?)/i)) {
      missing.push('Sintomatología clara')
    }

    return missing
  }

  private evaluateStructure(text: string): number {
    const cleanText = text.toLowerCase()
    let score = 0

    // Estructura demográfica (30%)
    if (cleanText.match(/paciente\s+(masculino|femenino|\d+\s*años?)/i)) score += 0.3
    
    // Presentación de síntomas (25%)  
    if (cleanText.match(/(presenta|refiere|acude\s+por|consulta\s+por)/i)) score += 0.25
    
    // Cronología (20%)
    if (cleanText.match(/(desde|hace|durante|\d+\s*(días?|meses|horas?))/i)) score += 0.2
    
    // Contexto médico (15%)
    if (cleanText.match(/(antecedentes?|historia|medicamentos?)/i)) score += 0.15
    
    // Detalles específicos (10%)
    if (cleanText.match(/(localizado|irradiado|asociado|acompañado)/i)) score += 0.1

    return Math.min(score, 1.0)
  }

  private evaluateClinicalCoherence(text: string): number {
    const cleanText = text.toLowerCase()
    let coherenceScore = 0.5 // Base

    // Coherencia sintomática
    const cardiacTerms = ['dolor', 'torácico', 'pecho', 'corazón', 'palpitaciones']
    const giTerms = ['abdominal', 'náuseas', 'vómitos', 'diarrea', 'estómago']
    const neuroTerms = ['cefalea', 'mareo', 'neurológico', 'cabeza', 'confusión']

    const cardiacCount = cardiacTerms.filter(term => cleanText.includes(term)).length
    const giCount = giTerms.filter(term => cleanText.includes(term)).length
    const neuroCount = neuroTerms.filter(term => cleanText.includes(term)).length

    // Si hay clustering de síntomas por sistema, aumenta coherencia
    if (cardiacCount >= 2 || giCount >= 2 || neuroCount >= 2) {
      coherenceScore += 0.3
    }

    return Math.min(coherenceScore, 1.0)
  }

  private calculateAdvancedConfidence(
    basicConfidence: number,
    structureScore: number,
    clinicalCoherence: number,
    medicalTermCount: number,
    missingDataCount: number
  ): number {
    
    const termBonus = Math.min(medicalTermCount * 0.02, 0.2)
    const missingPenalty = missingDataCount * 0.1
    
    return Math.min(Math.max(
      basicConfidence * 0.4 +
      structureScore * 0.3 +
      clinicalCoherence * 0.2 +
      termBonus * 0.1 -
      missingPenalty,
      0
    ), 1.0)
  }

  private generateImprovementSuggestions(missingData: string[], structureScore: number): string[] {
    const suggestions: string[] = []

    if (missingData.length > 0) {
      suggestions.push(`Incluir: ${missingData.join(', ')}`)
    }

    if (structureScore < 0.6) {
      suggestions.push('Usar formato: Paciente [edad] [género] presenta [síntomas] desde [tiempo]')
    }

    if (structureScore < 0.8) {
      suggestions.push('Agregar antecedentes médicos y medicamentos actuales')
    }

    return suggestions
  }

  // Métodos para validación SOAP
  private evaluateSubjectivoSection(subjetivo: string): number {
    if (!subjetivo || subjetivo.length < 20) return 0.2
    
    let score = 0.4 // Base
    const cleanText = subjetivo.toLowerCase()

    if (cleanText.includes('dolor') || cleanText.includes('molestia')) score += 0.2
    if (cleanText.match(/(desde|hace|durante)/)) score += 0.2
    if (cleanText.match(/(describe|refiere|menciona)/)) score += 0.2

    return Math.min(score, 1.0)
  }

  private evaluateObjetivoSection(objetivo: string): number {
    if (!objetivo || objetivo.length < 15) return 0.2

    let score = 0.3 // Base
    const cleanText = objetivo.toLowerCase()

    if (cleanText.match(/(presión|temperatura|fc|frecuencia)/)) score += 0.3
    if (cleanText.match(/(inspección|palpación|auscultación)/)) score += 0.2
    if (cleanText.match(/(\d+\/\d+|\d+\s*°c|\d+\s*bpm)/)) score += 0.2

    return Math.min(score, 1.0)
  }

  private evaluateAnalysisSection(principal: string, diferenciales: string[]): number {
    let score = 0.2 // Base

    if (principal && principal !== 'No especificado') score += 0.4
    if (diferenciales && diferenciales.length >= 2) score += 0.3
    if (diferenciales && diferenciales.length >= 3) score += 0.1

    return Math.min(score, 1.0)
  }

  private evaluatePlanSection(plan: string): number {
    if (!plan || plan.length < 30) return 0.2

    let score = 0.3 // Base  
    const cleanText = plan.toLowerCase()

    if (cleanText.match(/(medicamento|tratamiento|terapia)/)) score += 0.3
    if (cleanText.match(/(seguimiento|control|revisión)/)) score += 0.2
    if (cleanText.match(/(estudios?|exámenes?|laboratorios?)/)) score += 0.2

    return Math.min(score, 1.0)
  }

  private extractMedicalTermsFromSOAP(analysis: SOAPAnalysis): string[] {
    const allText = `${analysis.subjetivo || ''} ${analysis.objetivo || ''} ${analysis.diagnostico_principal || ''} ${analysis.plan_tratamiento || ''}`.toLowerCase()
    const terms = this.contentValidator['medicalTerms']
    return terms.filter(term => allText.includes(term))
  }

  private evaluateSOAPCoherence(analysis: SOAPAnalysis): number {
    // Evaluar coherencia entre secciones SOAP
    let coherence = 0.5

    // El diagnóstico principal debería estar relacionado con síntomas subjetivos
    if (this.checkDiagnosisSymptomCoherence(analysis.diagnostico_principal || '', analysis.subjetivo || '')) {
      coherence += 0.25
    }

    // El plan debería estar alineado con el diagnóstico
    if (this.checkPlanDiagnosisAlignment(analysis.plan_tratamiento || '', analysis.diagnostico_principal || '')) {
      coherence += 0.25
    }

    return Math.min(coherence, 1.0)
  }

  private checkDiagnosisSymptomCoherence(diagnosis: string, symptoms: string): boolean {
    // Lógica simplificada para verificar coherencia
    const diagnosisLower = diagnosis.toLowerCase()
    const symptomsLower = symptoms.toLowerCase()

    // Ejemplos de coherencia
    if (diagnosisLower.includes('gastritis') && symptomsLower.includes('dolor abdominal')) return true
    if (diagnosisLower.includes('hipertensión') && symptomsLower.includes('cefalea')) return true
    if (diagnosisLower.includes('ansiedad') && symptomsLower.includes('nerviosismo')) return true

    return false
  }

  private checkPlanDiagnosisAlignment(plan: string, diagnosis: string): boolean {
    // Verificar si el plan es apropiado para el diagnóstico
    const planLower = plan.toLowerCase()
    const diagnosisLower = diagnosis.toLowerCase()

    if (diagnosisLower.includes('infección') && planLower.includes('antibiótico')) return true
    if (diagnosisLower.includes('hipertensión') && planLower.includes('antihipertensivo')) return true
    if (diagnosisLower.includes('diabetes') && planLower.includes('glucosa')) return true

    return planLower.includes('tratamiento') || planLower.includes('medicamento')
  }

  private generateSOAPImprovements(analysis: SOAPAnalysis, issues: string[]): string[] {
    const improvements: string[] = []

    if (issues.includes('Sección Subjetivo incompleta')) {
      improvements.push('Expandir descripción de síntomas del paciente')
    }

    if (issues.includes('Sección Objetivo carece de datos')) {
      improvements.push('Incluir signos vitales y hallazgos de exploración física')
    }

    if (issues.includes('Análisis diagnóstico insuficiente')) {
      improvements.push('Agregar más diagnósticos diferenciales y justificación')
    }

    if (issues.includes('Plan de tratamiento incompleto')) {
      improvements.push('Especificar medicamentos, dosis, seguimiento y estudios')
    }

    return improvements
  }
}