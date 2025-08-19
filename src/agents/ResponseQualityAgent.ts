// src/agents/ResponseQualityAgent.ts
// Agente de Calidad y Mejora de Respuestas Médicas - Bernard Orozco

import { BaseAgent, SimpleDecisionRequest } from './BaseAgent'

interface QualityAssessment {
  language_consistency: {
    score: number
    issues: string[]
    doctor_language: string
    ai_language: string
  }
  medical_professionalism: {
    score: number
    emoji_count: number
    technical_language_appropriate: boolean
    structure_professional: boolean
  }
  clinical_completeness: {
    score: number
    missing_elements: string[]
    differential_diagnosis: boolean
    treatment_plan: boolean
    follow_up: boolean
  }
  cultural_context: {
    score: number
    terminology_appropriate: boolean
    regional_considerations: boolean
    communication_style: string
  }
}

interface ImprovedResponse {
  original_response: string
  improved_response: string
  improvements_made: string[]
  quality_score: number
  assessment: QualityAssessment
}

export interface ResponseQualityDecision {
  should_improve: boolean
  quality_assessment: QualityAssessment
  improved_response?: ImprovedResponse
  recommendation: string
  confidence: number
}

export class ResponseQualityAgent extends BaseAgent<ResponseQualityDecision> {
  constructor() {
    super('response_quality', 'ResponseQualityAgent v2.0')
  }

  async makeDecision(request: SimpleDecisionRequest) {
    try {
      // Extraer contexto de la conversación
      const context = this.extractConversationContext(request)
      
      // Evaluar calidad de la respuesta
      const qualityAssessment = this.assessResponseQuality(context)
      
      // Determinar si necesita mejora
      const needsImprovement = this.shouldImproveResponse(qualityAssessment)
      
      let improvedResponse: ImprovedResponse | undefined
      
      if (needsImprovement) {
        improvedResponse = await this.generateImprovedResponse(context, qualityAssessment)
      }

      const decision: ResponseQualityDecision = {
        should_improve: needsImprovement,
        quality_assessment: qualityAssessment,
        improved_response: improvedResponse,
        recommendation: this.generateRecommendation(qualityAssessment, needsImprovement),
        confidence: this.calculateConfidence(qualityAssessment)
      }

      return this.createSuccessResponse(
        decision,
        decision.confidence,
        request.timestamp,
        this.generateReasoning(qualityAssessment, needsImprovement)
      )

    } catch (error) {
      return this.createErrorResponse(
        `Error en agente de calidad: ${error}`,
        request.timestamp
      )
    }
  }

  private extractConversationContext(request: SimpleDecisionRequest) {
    // Simular extracción del contexto - en implementación real usaría el request
    return {
      doctor_message: request.context?.user_input || '',
      ai_response: request.context?.current_response || '',
      conversation_history: request.context?.conversation_history || [],
      medical_specialty: this.detectMedicalSpecialty(request.context?.user_input || ''),
      language: this.detectLanguage(request.context?.user_input || '')
    }
  }

  private assessResponseQuality(context: any): QualityAssessment {
    return {
      language_consistency: this.assessLanguageConsistency(context),
      medical_professionalism: this.assessMedicalProfessionalism(context),
      clinical_completeness: this.assessClinicalCompleteness(context),
      cultural_context: this.assessCulturalContext(context)
    }
  }

  private assessLanguageConsistency(context: any) {
    const doctorLang = this.detectLanguage(context.doctor_message)
    const aiLang = this.detectLanguage(context.ai_response)
    
    const issues: string[] = []
    let score = 100
    
    // Detectar mezcla de idiomas
    if (this.hasLanguageMixing(context.ai_response)) {
      issues.push('Mezcla inconsistente de idiomas')
      score -= 30
    }
    
    // Verificar consistencia
    if (doctorLang !== aiLang) {
      issues.push(`Doctor escribió en ${doctorLang}, AI respondió en ${aiLang}`)
      score -= 40
    }
    
    // Verificar términos médicos en idioma correcto
    if (!this.hasCorrectMedicalTerminology(context.ai_response, doctorLang)) {
      issues.push('Terminología médica en idioma incorrecto')
      score -= 20
    }

    return {
      score: Math.max(0, score),
      issues,
      doctor_language: doctorLang,
      ai_language: aiLang
    }
  }

  private assessMedicalProfessionalism(context: any) {
    const response = context.ai_response
    
    // Usar versión simplificada para compatibilidad
    const emojiCount = (response.match(/[\u2600-\u27BF]|[\uD800-\uDBFF][\uDC00-\uDFFF]/g) || []).length
    
    let score = 100
    
    // Penalizar emojis en contexto médico profesional
    if (emojiCount > 0) {
      score -= emojiCount * 15
    }
    
    // Verificar estructura profesional
    const hasSystemMetadata = /procesamiento cognitivo|agentes exitosos|confianza del sistema/i.test(response)
    const hasProfessionalStructure = this.hasMedicalStructure(response)
    
    if (hasSystemMetadata) {
      score -= 25
    }
    
    if (!hasProfessionalStructure) {
      score -= 30
    }

    return {
      score: Math.max(0, score),
      emoji_count: emojiCount,
      technical_language_appropriate: !hasSystemMetadata,
      structure_professional: hasProfessionalStructure
    }
  }

  private assessClinicalCompleteness(context: any) {
    const response = context.ai_response
    const missingElements: string[] = []
    let score = 100
    
    // Verificar elementos clínicos esenciales
    if (!this.hasDifferentialDiagnosis(response)) {
      missingElements.push('Diagnósticos diferenciales')
      score -= 20
    }
    
    if (!this.hasTreatmentPlan(response)) {
      missingElements.push('Plan terapéutico detallado')
      score -= 25
    }
    
    if (!this.hasFollowUpPlan(response)) {
      missingElements.push('Plan de seguimiento')
      score -= 15
    }
    
    if (!this.hasPatientEducation(response)) {
      missingElements.push('Educación al paciente')
      score -= 15
    }
    
    if (!this.hasPrognosticInformation(response)) {
      missingElements.push('Información pronóstica')
      score -= 10
    }

    return {
      score: Math.max(0, score),
      missing_elements: missingElements,
      differential_diagnosis: this.hasDifferentialDiagnosis(response),
      treatment_plan: this.hasTreatmentPlan(response),
      follow_up: this.hasFollowUpPlan(response)
    }
  }

  private assessCulturalContext(context: any) {
    const response = context.ai_response
    const language = context.language
    
    let score = 100
    
    const terminologyAppropriate = this.hasAppropriateTerminology(response, language)
    const communicationStyle = this.detectCommunicationStyle(response)
    
    if (!terminologyAppropriate) {
      score -= 30
    }
    
    if (communicationStyle !== 'formal_medical') {
      score -= 20
    }

    return {
      score: Math.max(0, score),
      terminology_appropriate: terminologyAppropriate,
      regional_considerations: true,
      communication_style: communicationStyle
    }
  }

  private shouldImproveResponse(assessment: QualityAssessment): boolean {
    const overallScore = (
      assessment.language_consistency.score +
      assessment.medical_professionalism.score +
      assessment.clinical_completeness.score +
      assessment.cultural_context.score
    ) / 4
    
    return overallScore < 80 || 
           assessment.language_consistency.score < 70 ||
           assessment.medical_professionalism.score < 70
  }

  private async generateImprovedResponse(context: any, assessment: QualityAssessment): Promise<ImprovedResponse> {
    const improvements: string[] = []
    let improvedResponse = context.ai_response
    
    // Aplicar mejoras específicas
    if (assessment.language_consistency.score < 80) {
      improvedResponse = this.fixLanguageConsistency(improvedResponse, context.language)
      improvements.push('Corregida consistencia de idioma')
    }
    
    if (assessment.medical_professionalism.score < 80) {
      improvedResponse = this.improveProfessionalism(improvedResponse)
      improvements.push('Mejorado profesionalismo médico')
    }
    
    if (assessment.clinical_completeness.score < 80) {
      improvedResponse = this.enhanceClinicalContent(improvedResponse, context)
      improvements.push('Completado contenido clínico')
    }
    
    // Generar respuesta completamente nueva si es necesario
    if (this.needsCompleteRewrite(assessment)) {
      improvedResponse = this.generateProfessionalMedicalResponse(context)
      improvements.push('Respuesta completamente reformulada')
    }

    const finalScore = this.calculateOverallScore(assessment) + 20 // Mejora estimada
    
    return {
      original_response: context.ai_response,
      improved_response: improvedResponse,
      improvements_made: improvements,
      quality_score: Math.min(100, finalScore),
      assessment
    }
  }

  private generateProfessionalMedicalResponse(context: any): string {
    const doctorInput = context.doctor_message
    const language = context.language
    
    if (language === 'spanish') {
      return this.generateSpanishMedicalResponse(doctorInput)
    } else {
      return this.generateEnglishMedicalResponse(doctorInput)
    }
  }

  private generateSpanishMedicalResponse(doctorInput: string): string {
    // Template para respuesta médica profesional en español
    return `**EVALUACIÓN CLÍNICA**

**Diagnóstico Principal:** [Diagnóstico basado en presentación clínica]

**Diagnósticos Diferenciales:**
- [Diagnóstico diferencial 1]
- [Diagnóstico diferencial 2]
- [Diagnóstico diferencial 3]

**Fundamentación Diagnóstica:**
[Análisis clínico detallado basado en síntomas, antecedentes y exploración]

**Plan Terapéutico:**

*Tratamiento agudo:*
- [Medicación específica con dosis]
- [Medidas de soporte]

*Mantenimiento:*
- [Tratamiento a largo plazo]
- [Medidas preventivas]

**Estudios Complementarios:**
- [Estudios necesarios para confirmar diagnóstico]
- [Seguimiento requerido]

**Educación al Paciente:**
- [Información importante sobre la condición]
- [Medidas de autocuidado]

**Seguimiento:** [Plan de seguimiento específico]

**Criterios de Derivación:** [Cuándo derivar a especialista]`
  }

  private generateEnglishMedicalResponse(doctorInput: string): string {
    // Template para respuesta médica profesional en inglés
    return `**CLINICAL ASSESSMENT**

**Primary Diagnosis:** [Diagnosis based on clinical presentation]

**Differential Diagnoses:**
- [Differential diagnosis 1]
- [Differential diagnosis 2]
- [Differential diagnosis 3]

**Clinical Reasoning:**
[Detailed clinical analysis based on symptoms, history, and examination]

**Treatment Plan:**

*Acute management:*
- [Specific medication with dosing]
- [Supportive measures]

*Long-term management:*
- [Long-term treatment]
- [Preventive measures]

**Diagnostic Workup:**
- [Necessary studies to confirm diagnosis]
- [Required follow-up]

**Patient Education:**
- [Important information about condition]
- [Self-care measures]

**Follow-up:** [Specific follow-up plan]

**Referral Criteria:** [When to refer to specialist]`
  }

  // Métodos auxiliares de detección y mejora
  private detectLanguage(text: string): string {
    const spanishWords = /\b(paciente|presenta|síntomas|diagnóstico|tratamiento|años|desde|hace|con|por|para|que|del|una|las|los|muy|más|menos)\b/gi
    const englishWords = /\b(patient|presents|symptoms|diagnosis|treatment|years|since|with|for|that|the|and|very|more|less)\b/gi
    
    const spanishMatches = (text.match(spanishWords) || []).length
    const englishMatches = (text.match(englishWords) || []).length
    
    return spanishMatches > englishMatches ? 'spanish' : 'english'
  }

  private detectMedicalSpecialty(text: string): string {
    const specialties = {
      dermatology: /\b(piel|lesiones|eritema|prurito|dermatitis|psoriasis|eczema|rash)\b/gi,
      cardiology: /\b(corazón|cardíaco|hipertensión|angina|infarto|arritmia)\b/gi,
      neurology: /\b(neurológico|cefalea|migraña|convulsiones|epilepsia)\b/gi,
      gastroenterology: /\b(estómago|intestino|digestivo|náuseas|diarrea|estreñimiento)\b/gi
    }
    
    for (const [specialty, pattern] of Object.entries(specialties)) {
      if (pattern.test(text)) {
        return specialty
      }
    }
    
    return 'general'
  }

  private hasLanguageMixing(text: string): boolean {
    const spanishWords = (text.match(/\b(paciente|presenta|síntomas|diagnóstico|tratamiento)\b/gi) || []).length
    const englishWords = (text.match(/\b(patient|presents|symptoms|diagnosis|treatment)\b/gi) || []).length
    
    return spanishWords > 0 && englishWords > 0
  }

  private hasCorrectMedicalTerminology(text: string, language: string): boolean {
    if (language === 'spanish') {
      return !/\b(atopic dermatitis|allergy testing|skin biopsy)\b/gi.test(text)
    } else {
      return !/\b(dermatitis atópica|pruebas de alergia|biopsia cutánea)\b/gi.test(text)
    }
  }

  private hasMedicalStructure(text: string): boolean {
    const structureKeywords = /\b(diagnóstico|evaluación|plan|tratamiento|seguimiento|assessment|diagnosis|plan|treatment|follow.?up)\b/gi
    return (text.match(structureKeywords) || []).length >= 3
  }

  private hasDifferentialDiagnosis(text: string): boolean {
    return /\b(diferencial|differential|diagnósticos?\s+(alternativos?|posibles?))\b/gi.test(text)
  }

  private hasTreatmentPlan(text: string): boolean {
    return /\b(plan\s+terapéutico|tratamiento|medicamento|therapy|treatment|medication)\b/gi.test(text)
  }

  private hasFollowUpPlan(text: string): boolean {
    return /\b(seguimiento|control|follow.?up|revisión|cita)\b/gi.test(text)
  }

  private hasPatientEducation(text: string): boolean {
    return /\b(educación|información|recomendaciones|education|recommendations|advice)\b/gi.test(text)
  }

  private hasPrognosticInformation(text: string): boolean {
    return /\b(pronóstico|evolución|prognosis|outcome|course)\b/gi.test(text)
  }

  private hasAppropriateTerminology(text: string, language: string): boolean {
    // Verificar que la terminología médica esté en el idioma correcto
    if (language === 'spanish') {
      const englishMedicalTerms = /\b(diagnosis|treatment|patient|symptoms|condition)\b/gi
      return !englishMedicalTerms.test(text)
    } else {
      const spanishMedicalTerms = /\b(diagnóstico|tratamiento|paciente|síntomas|condición)\b/gi
      return !spanishMedicalTerms.test(text)
    }
  }

  private detectCommunicationStyle(text: string): string {
    if (/[\u2600-\u27BF]|[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(text)) {
      return 'informal'
    }
    if (/\b(evaluación|diagnóstico|plan|assessment|diagnosis)\b/gi.test(text)) {
      return 'formal_medical'
    }
    return 'neutral'
  }

  private fixLanguageConsistency(response: string, targetLanguage: string): string {
    if (targetLanguage === 'spanish') {
      return response
        .replace(/atopic dermatitis/gi, 'dermatitis atópica')
        .replace(/allergy testing/gi, 'pruebas de alergia')
        .replace(/skin biopsy/gi, 'biopsia cutánea')
        .replace(/treatment/gi, 'tratamiento')
        .replace(/diagnosis/gi, 'diagnóstico')
    } else {
      return response
        .replace(/dermatitis atópica/gi, 'atopic dermatitis')
        .replace(/pruebas de alergia/gi, 'allergy testing')
        .replace(/biopsia cutánea/gi, 'skin biopsy')
        .replace(/tratamiento/gi, 'treatment')
        .replace(/diagnóstico/gi, 'diagnosis')
    }
  }

  private improveProfessionalism(response: string): string {
    // Remover emojis
    let improved = response.replace(/[\u2600-\u27BF]|[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')
    
    // Remover metadatos del sistema
    improved = improved.replace(/procesamiento cognitivo:.*$/gim, '')
    improved = improved.replace(/.*agentes exitosos.*$/gim, '')
    improved = improved.replace(/confianza del sistema:.*$/gim, '')
    
    return improved.trim()
  }

  private enhanceClinicalContent(response: string, context: any): string {
    // Añadir elementos clínicos faltantes (implementación simplificada)
    let enhanced = response
    
    if (!this.hasDifferentialDiagnosis(response)) {
      enhanced += '\n\n**Diagnósticos Diferenciales:**\n- Dermatitis de contacto\n- Dermatitis seborreica'
    }
    
    if (!this.hasFollowUpPlan(response)) {
      enhanced += '\n\n**Seguimiento:** Control en 2-4 semanas'
    }
    
    return enhanced
  }

  private needsCompleteRewrite(assessment: QualityAssessment): boolean {
    return assessment.medical_professionalism.score < 50 || 
           assessment.language_consistency.score < 50
  }

  private calculateOverallScore(assessment: QualityAssessment): number {
    return (
      assessment.language_consistency.score +
      assessment.medical_professionalism.score +
      assessment.clinical_completeness.score +
      assessment.cultural_context.score
    ) / 4
  }

  private generateRecommendation(assessment: QualityAssessment, needsImprovement: boolean): string {
    if (!needsImprovement) {
      return 'Respuesta médica de calidad apropiada. No requiere mejoras.'
    }
    
    const recommendations: string[] = []
    
    if (assessment.language_consistency.score < 80) {
      recommendations.push('Mantener consistencia de idioma')
    }
    
    if (assessment.medical_professionalism.score < 80) {
      recommendations.push('Mejorar profesionalismo médico')
    }
    
    if (assessment.clinical_completeness.score < 80) {
      recommendations.push('Completar información clínica')
    }
    
    return recommendations.join('; ')
  }

  private calculateConfidence(assessment: QualityAssessment): number {
    const overallScore = this.calculateOverallScore(assessment)
    return Math.max(0.7, Math.min(0.95, overallScore / 100))
  }

  private generateReasoning(assessment: QualityAssessment, needsImprovement: boolean): string {
    const overallScore = this.calculateOverallScore(assessment)
    
    if (needsImprovement) {
      return `Respuesta requiere mejora (puntuación: ${Math.round(overallScore)}%). Principales áreas: ${this.getMainIssues(assessment).join(', ')}`
    } else {
      return `Respuesta médica de calidad apropiada (puntuación: ${Math.round(overallScore)}%)`
    }
  }

  private getMainIssues(assessment: QualityAssessment): string[] {
    const issues: string[] = []
    
    if (assessment.language_consistency.score < 80) {
      issues.push('consistencia de idioma')
    }
    
    if (assessment.medical_professionalism.score < 80) {
      issues.push('profesionalismo')
    }
    
    if (assessment.clinical_completeness.score < 80) {
      issues.push('completitud clínica')
    }
    
    if (assessment.cultural_context.score < 80) {
      issues.push('contexto cultural')
    }
    
    return issues
  }
}