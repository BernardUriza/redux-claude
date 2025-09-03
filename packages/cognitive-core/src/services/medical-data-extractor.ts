// 🧠 Medical Data Extractor - Single-Purpose AI Middleware 2025
// Creado por Bernard Orozco - Especializado en extracción médica estructurada

import { callClaudeForDecision } from './decisional-middleware'
import {
  MedicalExtractionOutput,
  MedicalExtractionInput,
  MedicalExtractionDecision,
  calculateCompleteness,
  isNOMCompliant,
  MEDICAL_CONFIDENCE_THRESHOLDS,
} from '../types/medicalExtraction'

/**
 * Single-Purpose AI Middleware para extracción de datos médicos
 * Arquitectura 2025: Enfocado, no multi-agente, usa Claude Sonnet 4
 */
export class MedicalDataExtractor {
  /**
   * Extrae datos médicos estructurados de texto natural
   * Implementa prompt engineering 2025 best practices
   */
  async extractMedicalData(input: MedicalExtractionInput): Promise<MedicalExtractionDecision> {
    const startTime = Date.now()

    try {
      // Construir el prompt con datos existentes para iteración
      let contextualInput = input.patient_input

      if (input.existing_data && input.conversation_context) {
        contextualInput = this.buildIterativePrompt(input)
      }

      // Usar el decisional middleware con el tipo especializado
      const response = await callClaudeForDecision(
        'medical_data_extractor',
        contextualInput,
        'claude', // Claude Sonnet 4 optimizado para healthcare
        undefined, // No AbortSignal por ahora
        undefined, // No previousDecisions (este es el extractor, no toma decisiones)
        {
          iteration_number: input.iteration_number || 1,
          max_iterations: input.max_iterations || 5,
          existing_data: input.existing_data || null,
        }
      )

      if (!response.success) {
        throw new Error(response.error || 'Medical extraction failed')
      }

      const extractedData = response.decision as unknown as MedicalExtractionOutput

      // Post-process: Calcular metadata automáticamente
      const processedData = this.postProcessExtraction(extractedData)

      // Determinar si necesita más input
      const requiresMoreInput = this.determineIfMoreInputNeeded(processedData, input)

      // Generar preguntas de seguimiento si es necesario
      const suggestedQuestions = requiresMoreInput
        ? this.generateFollowupQuestions(processedData)
        : []

      return {
        extracted_data: processedData,
        requires_more_input: requiresMoreInput,
        suggested_followup_questions: suggestedQuestions,
        extraction_confidence: this.calculateOverallConfidence(processedData),
        processing_time_ms: Date.now() - startTime,
      }
    } catch (error) {
      console.error('Medical Data Extractor Error:', error)

      // Fallback graceful - nunca fallar completamente
      return this.createFallbackResponse(input, startTime, error as Error)
    }
  }

  /**
   * Construye prompt iterativo combinando nueva entrada con datos existentes
   */
  private buildIterativePrompt(input: MedicalExtractionInput): string {
    let prompt = `INPUT NUEVA: "${input.patient_input}"\n\n`

    if (input.existing_data) {
      prompt += `DATOS YA EXTRAÍDOS (MANTÉN Y ACUMULA TODA ESTA INFORMACIÓN):\n`
      prompt += `- Edad: ${input.existing_data.demographics?.patient_age_years || 'unknown'}\n`
      prompt += `- Género: ${input.existing_data.demographics?.patient_gender || 'unknown'}\n`
      prompt += `- Queja principal: ${input.existing_data.clinical_presentation?.chief_complaint || 'unknown'}\n`

      // Incluir TODOS los síntomas primarios existentes
      if (
        input.existing_data.clinical_presentation?.primary_symptoms &&
        input.existing_data.clinical_presentation.primary_symptoms.length > 0
      ) {
        prompt += `- Síntomas primarios acumulados: ${input.existing_data.clinical_presentation.primary_symptoms.join(', ')}\n`
      }

      prompt += `- Localización anatómica: ${input.existing_data.clinical_presentation?.anatomical_location || 'unknown'}\n`
      prompt += `- Duración: ${input.existing_data.symptom_characteristics?.duration_description || 'unknown'}\n`
      prompt += `- Intensidad: ${input.existing_data.symptom_characteristics?.pain_intensity_scale || 'unknown'}\n`

      // Incluir características del dolor existentes
      if (
        input.existing_data.symptom_characteristics?.pain_characteristics &&
        input.existing_data.symptom_characteristics.pain_characteristics.length > 0
      ) {
        prompt += `- Características del dolor: ${input.existing_data.symptom_characteristics.pain_characteristics.join(', ')}\n`
      }

      // Incluir síntomas asociados existentes
      if (
        input.existing_data.symptom_characteristics?.associated_symptoms &&
        input.existing_data.symptom_characteristics.associated_symptoms.length > 0
      ) {
        prompt += `- Síntomas asociados: ${input.existing_data.symptom_characteristics.associated_symptoms.join(', ')}\n`
      }

      prompt += `\n`
    }

    if (input.conversation_context && input.conversation_context.length > 0) {
      prompt += `CONTEXTO DE CONVERSACIÓN:\n`
      prompt += input.conversation_context.slice(-3).join('\n') + '\n\n'
    }

    prompt += `INSTRUCCIÓN CRÍTICA: 
1. MANTÉN todos los síntomas previos y AGREGA los nuevos (no reemplaces)
2. USA terminología médica profesional para traducir síntomas coloquiales
3. Si el síntoma principal ya existe, ACUMULA detalles adicionales
4. Ejemplo: Si ya tienes "dolor abdominal epigástrico" y el nuevo input dice "hinchazón", 
   el resultado debe incluir AMBOS: ["dolor abdominal epigástrico", "distensión abdominal"]`

    return prompt
  }

  /**
   * Post-procesa la extracción para calcular metadata automáticamente
   */
  private postProcessExtraction(data: MedicalExtractionOutput): MedicalExtractionOutput {
    // Calcular completeness usando la función helper
    const completeness = calculateCompleteness(data)

    // Verificar NOM compliance
    const nomCompliant = isNOMCompliant(data)

    // Identificar campos faltantes críticos
    const missingFields = this.identifyMissingFields(data)

    // Determinar si está listo para SOAP
    const readyForSOAP = completeness >= 80 && nomCompliant

    // Actualizar metadata
    return {
      ...data,
      extraction_metadata: {
        ...data.extraction_metadata,
        overall_completeness_percentage: completeness,
        demographic_complete:
          data.demographics.patient_age_years !== 'unknown' &&
          data.demographics.patient_gender !== 'unknown',
        clinical_complete: data.clinical_presentation.chief_complaint !== 'unknown',
        context_complete: this.hasMinimumContextData(data),
        nom_compliant: nomCompliant,
        ready_for_soap_generation: readyForSOAP,
        missing_critical_fields: missingFields,
        extraction_timestamp: new Date().toISOString(),
        claude_model_used: 'claude-sonnet-4',
      },
    }
  }

  /**
   * Determina si se necesita más input del usuario
   */
  private determineIfMoreInputNeeded(
    data: MedicalExtractionOutput,
    input: MedicalExtractionInput
  ): boolean {
    // Si ya está listo para SOAP, no necesita más input
    if (data.extraction_metadata.ready_for_soap_generation) {
      return false
    }

    // Si llegamos al máximo de iteraciones, no pedimos más
    const currentIteration = input.iteration_number || 1
    const maxIterations = input.max_iterations || 5
    if (currentIteration >= maxIterations) {
      return false
    }

    // Si falta información crítica NOM, sí necesita más
    if (!data.extraction_metadata.nom_compliant) {
      return true
    }

    // Si la completeness es muy baja, necesita más
    if (data.extraction_metadata.overall_completeness_percentage < 60) {
      return true
    }

    return false
  }

  /**
   * Genera preguntas de seguimiento inteligentes
   */
  private generateFollowupQuestions(data: MedicalExtractionOutput): string[] {
    const questions: string[] = []

    // Preguntas NOM críticas primero
    if (data.demographics.patient_age_years === 'unknown') {
      questions.push('¿Cuál es la edad del paciente?')
    }

    if (data.demographics.patient_gender === 'unknown') {
      questions.push('¿Cuál es el género del paciente (masculino/femenino)?')
    }

    // Preguntas clínicas
    if (data.clinical_presentation.chief_complaint === 'unknown') {
      questions.push('¿Cuál es el motivo principal de consulta?')
    }

    // Preguntas contextuales
    if (data.symptom_characteristics.duration_description === 'unknown') {
      questions.push('¿Desde cuándo presenta estos síntomas?')
    }

    if (data.symptom_characteristics.pain_intensity_scale === null) {
      questions.push('¿Qué intensidad tiene el dolor en una escala del 1 al 10?')
    }

    // Máximo 3 preguntas para no abrumar
    return questions.slice(0, 3)
  }

  /**
   * Calcula confianza general de la extracción
   */
  private calculateOverallConfidence(data: MedicalExtractionOutput): number {
    const weights = {
      demographic: 0.4,
      symptoms: 0.3,
      context: 0.3,
    }

    const weightedScore =
      data.demographics.confidence_demographic * weights.demographic +
      data.clinical_presentation.confidence_symptoms * weights.symptoms +
      data.symptom_characteristics.confidence_context * weights.context

    return Math.round(weightedScore * 100) / 100 // Redondear a 2 decimales
  }

  /**
   * Verifica si tiene datos contextuales mínimos
   */
  private hasMinimumContextData(data: MedicalExtractionOutput): boolean {
    let contextFieldCount = 0

    if (data.symptom_characteristics.duration_description !== 'unknown') contextFieldCount++
    if (data.symptom_characteristics.pain_intensity_scale !== null) contextFieldCount++
    if (
      data.symptom_characteristics.pain_characteristics &&
      data.symptom_characteristics.pain_characteristics.length > 0
    )
      contextFieldCount++
    if (data.symptom_characteristics.temporal_pattern !== 'unknown') contextFieldCount++

    return contextFieldCount >= 2 // Mínimo 2 campos contextuales
  }

  /**
   * Identifica campos faltantes críticos
   */
  private identifyMissingFields(data: MedicalExtractionOutput): string[] {
    const missing: string[] = []

    if (data.demographics.patient_age_years === 'unknown') {
      missing.push('patient_age_years')
    }

    if (data.demographics.patient_gender === 'unknown') {
      missing.push('patient_gender')
    }

    if (data.clinical_presentation.chief_complaint === 'unknown') {
      missing.push('chief_complaint')
    }

    if (data.symptom_characteristics.duration_description === 'unknown') {
      missing.push('duration_description')
    }

    if (data.symptom_characteristics.pain_intensity_scale === null) {
      missing.push('pain_intensity_scale')
    }

    return missing
  }

  /**
   * Crea respuesta de fallback en caso de error
   */
  private createFallbackResponse(
    input: MedicalExtractionInput,
    startTime: number,
    error: Error
  ): MedicalExtractionDecision {
    const fallbackData: MedicalExtractionOutput = {
      demographics: {
        patient_age_years: 'unknown',
        patient_gender: 'unknown',
        confidence_demographic: 0.0,
      },
      clinical_presentation: {
        chief_complaint: 'unknown',
        primary_symptoms: null,
        anatomical_location: 'unknown',
        confidence_symptoms: 0.0,
      },
      symptom_characteristics: {
        duration_description: 'unknown',
        pain_intensity_scale: null,
        pain_characteristics: null,
        aggravating_factors: null,
        relieving_factors: null,
        associated_symptoms: null,
        temporal_pattern: 'unknown',
        confidence_context: 0.0,
      },
      medical_validation: {
        anatomical_contradictions: [],
        logical_inconsistencies: [],
        requires_clarification: [],
        medical_alerts: [],
      },
      extraction_metadata: {
        overall_completeness_percentage: 0,
        demographic_complete: false,
        clinical_complete: false,
        context_complete: false,
        nom_compliant: false,
        ready_for_soap_generation: false,
        missing_critical_fields: ['patient_age_years', 'patient_gender', 'chief_complaint'],
        data_points_extracted_this_iteration: 0,
        extraction_timestamp: new Date().toISOString(),
        claude_model_used: 'claude-sonnet-4',
      },
    }

    return {
      extracted_data: fallbackData,
      requires_more_input: true,
      suggested_followup_questions: [
        'Por favor, proporcione la edad del paciente',
        '¿Cuál es el género del paciente?',
        '¿Cuál es el motivo principal de la consulta?',
      ],
      extraction_confidence: 0.0,
      processing_time_ms: Date.now() - startTime,
    }
  }
}

// Export singleton instance
export const medicalDataExtractor = new MedicalDataExtractor()
