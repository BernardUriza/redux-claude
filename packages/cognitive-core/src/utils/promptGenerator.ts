// 🎯 Prompt Generator - Generador automático de prompts médicos estructurados
// Creado por Bernard Orozco - Auto-generate medical prompts when extraction reaches 90%

import { MedicalExtractionOutput } from '../types/medicalExtraction'
import { checkCompleteness } from './completenessChecker'

export interface GeneratedPrompt {
  prompt: string
  shouldAutoFill: boolean
  completenessPercentage: number
  readyForSOAP: boolean
}

/**
 * Genera prompt médico estructurado cuando la extracción alcanza 50% de completitud
 */
export function generateMedicalPrompt(extractedData: MedicalExtractionOutput): GeneratedPrompt {
  const completeness = checkCompleteness(extractedData)

  // Solo auto-generar si completeness >= 50% y es NOM compliant
  const shouldAutoFill = completeness.totalScore >= 50 && completeness.nomCompliant

  if (!shouldAutoFill) {
    return {
      prompt: '',
      shouldAutoFill: false,
      completenessPercentage: completeness.totalScore,
      readyForSOAP: completeness.readyForSOAP,
    }
  }

  // Construir prompt estructurado
  const prompt = buildStructuredMedicalPrompt(extractedData)

  return {
    prompt,
    shouldAutoFill: true,
    completenessPercentage: completeness.totalScore,
    readyForSOAP: completeness.readyForSOAP,
  }
}

/**
 * Construye el prompt médico estructurado para SOAP generation
 */
function buildStructuredMedicalPrompt(data: MedicalExtractionOutput): string {
  const sections: string[] = []

  // 📋 DATOS DEMOGRÁFICOS (NOM Compliant)
  sections.push('📋 DATOS DEL PACIENTE:')
  sections.push(`• Edad: ${data.demographics?.patient_age_years || 'No especificada'} años`)
  sections.push(`• Género: ${data.demographics?.patient_gender || 'No especificado'}`)

  // 🏥 PRESENTACIÓN CLÍNICA
  sections.push('\n🏥 PRESENTACIÓN CLÍNICA:')
  sections.push(
    `• Motivo de consulta: ${data.clinical_presentation?.chief_complaint || 'No especificado'}`
  )

  if (
    data.clinical_presentation?.primary_symptoms &&
    data.clinical_presentation.primary_symptoms.length > 0
  ) {
    sections.push(
      `• Síntomas principales: ${data.clinical_presentation?.primary_symptoms.join(', ')}`
    )
  }

  if (data.clinical_presentation?.anatomical_location !== 'unknown') {
    sections.push(`• Localización: ${data.clinical_presentation?.anatomical_location}`)
  }

  // ⏰ CARACTERÍSTICAS DEL SÍNTOMA
  sections.push('\n⏰ CARACTERÍSTICAS:')

  if (data.symptom_characteristics?.duration_description !== 'unknown') {
    sections.push(`• Duración: ${data.symptom_characteristics?.duration_description}`)
  }

  if (data.symptom_characteristics?.pain_intensity_scale !== null) {
    sections.push(`• Intensidad: ${data.symptom_characteristics?.pain_intensity_scale}/10`)
  }

  if (
    data.symptom_characteristics?.pain_characteristics &&
    data.symptom_characteristics?.pain_characteristics.length > 0
  ) {
    sections.push(
      `• Características del dolor: ${data.symptom_characteristics?.pain_characteristics.join(', ')}`
    )
  }

  if (
    data.symptom_characteristics?.aggravating_factors &&
    data.symptom_characteristics?.aggravating_factors.length > 0
  ) {
    sections.push(
      `• Factores agravantes: ${data.symptom_characteristics?.aggravating_factors.join(', ')}`
    )
  }

  if (
    data.symptom_characteristics?.relieving_factors &&
    data.symptom_characteristics?.relieving_factors.length > 0
  ) {
    sections.push(
      `• Factores que alivian: ${data.symptom_characteristics?.relieving_factors.join(', ')}`
    )
  }

  if (
    data.symptom_characteristics?.associated_symptoms &&
    data.symptom_characteristics?.associated_symptoms.length > 0
  ) {
    sections.push(
      `• Síntomas asociados: ${data.symptom_characteristics?.associated_symptoms.join(', ')}`
    )
  }

  if (data.symptom_characteristics?.temporal_pattern !== 'unknown') {
    sections.push(`• Patrón temporal: ${data.symptom_characteristics?.temporal_pattern}`)
  }

  // 📊 INSTRUCTION PARA CLAUDE
  sections.push('\n🎯 INSTRUCCIÓN:')
  sections.push(
    'Por favor genera un análisis médico SOAP completo basado en la información proporcionada, incluyendo diagnósticos diferenciales, plan de manejo y recomendaciones de seguimiento según las normas médicas mexicanas NOM.'
  )

  return sections.join('\n')
}

/**
 * Genera prompt específico para el caso de prueba "Hombre con dolor de estómago"
 */
export function generateStomachPainPrompt(): string {
  const testData: MedicalExtractionOutput = {
    demographics: {
      patient_age_years: 15,
      patient_gender: 'masculino',
      confidence_demographic: 0.95,
    },
    clinical_presentation: {
      chief_complaint: 'dolor de estómago',
      primary_symptoms: ['dolor abdominal', 'dolor de estómago'],
      anatomical_location: 'estómago/abdomen',
      confidence_symptoms: 0.9,
    },
    symptom_characteristics: {
      duration_description: 'desde la mañana',
      pain_intensity_scale: 7,
      pain_characteristics: ['dolor abdominal'],
      aggravating_factors: null,
      relieving_factors: ['dormir', 'descanso'],
      associated_symptoms: null,
      temporal_pattern: 'matutino',
      confidence_context: 0.85,
    },
    medical_validation: {
      anatomical_contradictions: [],
      logical_inconsistencies: [],
      requires_clarification: [],
      medical_alerts: [],
    },
    extraction_metadata: {
      overall_completeness_percentage: 90,
      demographic_complete: true,
      clinical_complete: true,
      context_complete: true,
      nom_compliant: true,
      ready_for_soap_generation: true,
      missing_critical_fields: [],
      data_points_extracted_this_iteration: 4,
      extraction_timestamp: new Date().toISOString(),
      claude_model_used: 'claude-sonnet-4',
    },
  }

  return buildStructuredMedicalPrompt(testData)
}

/**
 * Utility function para auto-fill de input field
 * Para usar en un hook personalizado en el componente
 */
export function autoFillInput(
  inputElement: HTMLTextAreaElement | HTMLInputElement | null,
  prompt: string
): void {
  if (!inputElement || !prompt) return

  // Auto-fill the input field with the generated prompt
  inputElement.value = prompt

  // Trigger input event to ensure React state updates
  const event = new Event('input', { bubbles: true })
  inputElement.dispatchEvent(event)

  // Optional: Focus and scroll to end
  inputElement.focus()
  inputElement.scrollTop = inputElement.scrollHeight

  console.log('🎯 Auto-filled medical prompt (90% completeness reached)')
}
