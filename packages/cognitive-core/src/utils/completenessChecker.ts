// 🎯 Completeness Checker - Weighted Scoring System 2025
// Creado por Bernard Orozco - Phase 3: Iterative Logic

import { MedicalExtractionOutput } from '../types/medicalExtraction'

// Pesos para scoring ponderado según normas mexicanas NOM
export interface CompletenessWeights {
  demographics: number // Default: 40% (NOM critical)
  clinical: number     // Default: 30% (Essential medical data)
  context: number      // Default: 30% (Clinical context)
}

export interface CompletenessBreakdown {
  demographicScore: number    // 0-40
  clinicalScore: number      // 0-30
  contextScore: number       // 0-30
  totalScore: number         // 0-100
  missingFields: string[]
  nomCompliant: boolean
  readyForSOAP: boolean
  // 🩺 NEW: Medical Intelligence Validation
  medicalValidation: {
    hasContradictions: boolean
    hasInconsistencies: boolean
    requiresClarification: boolean
    medicalAlerts: boolean
    extractionEfficiency: number // data points per iteration
  }
}

export interface CompletenessDetails {
  demographics: {
    age: { present: boolean; weight: number; score: number }
    gender: { present: boolean; weight: number; score: number }
  }
  clinical: {
    complaint: { present: boolean; weight: number; score: number }
    symptoms: { present: boolean; weight: number; score: number }
  }
  context: {
    duration: { present: boolean; weight: number; score: number }
    intensity: { present: boolean; weight: number; score: number }
    characteristics: { present: boolean; weight: number; score: number }
    aggravating: { present: boolean; weight: number; score: number }
    relieving: { present: boolean; weight: number; score: number }
    temporal: { present: boolean; weight: number; score: number }
  }
}

/**
 * Función principal para verificar completitud con scoring ponderado
 * Implementa las mejores prácticas 2025 para healthcare data validation
 */
export function checkCompleteness(
  data: MedicalExtractionOutput,
  weights: CompletenessWeights = { demographics: 40, clinical: 30, context: 30 }
): CompletenessBreakdown {
  
  // Demographics scoring (40% por defecto)
  let demographicScore = 0
  const agePresent = data.demographics.patient_age_years !== "unknown"
  const genderPresent = data.demographics.patient_gender !== "unknown"
  
  if (agePresent) demographicScore += weights.demographics * 0.5 // 50% del peso demographic
  if (genderPresent) demographicScore += weights.demographics * 0.5 // 50% del peso demographic
  
  // Clinical scoring (30% por defecto)  
  let clinicalScore = 0
  const complaintPresent = data.clinical_presentation.chief_complaint !== "unknown"
  const symptomsPresent = data.clinical_presentation.primary_symptoms && data.clinical_presentation.primary_symptoms.length > 0
  
  if (complaintPresent) clinicalScore += weights.clinical * 0.5 // 50% del peso clinical
  if (symptomsPresent) clinicalScore += weights.clinical * 0.5 // 50% del peso clinical
  
  // Context scoring (30% por defecto) - at least 2 fields needed for full score
  let contextScore = 0
  const contextFields = [
    data.symptom_characteristics.duration_description !== "unknown",
    data.symptom_characteristics.pain_intensity_scale !== null,
    data.symptom_characteristics.pain_characteristics && data.symptom_characteristics.pain_characteristics.length > 0,
    data.symptom_characteristics.aggravating_factors && data.symptom_characteristics.aggravating_factors.length > 0,
    data.symptom_characteristics.relieving_factors && data.symptom_characteristics.relieving_factors.length > 0,
    data.symptom_characteristics.temporal_pattern !== "unknown"
  ]
  
  const presentContextFields = contextFields.filter(Boolean).length
  const maxContextFields = 6
  contextScore = (presentContextFields / maxContextFields) * weights.context
  
  // Total score
  const totalScore = Math.round(demographicScore + clinicalScore + contextScore)
  
  // Missing fields identification
  const missingFields: string[] = []
  if (!agePresent) missingFields.push('patient_age_years')
  if (!genderPresent) missingFields.push('patient_gender')  
  if (!complaintPresent) missingFields.push('chief_complaint')
  if (!symptomsPresent) missingFields.push('primary_symptoms')
  if (data.symptom_characteristics.duration_description === "unknown") missingFields.push('duration_description')
  if (data.symptom_characteristics.pain_intensity_scale === null) missingFields.push('pain_intensity_scale')
  
  // NOM compliance check (Mexican healthcare standards)
  const nomCompliant = agePresent && genderPresent && complaintPresent
  
  // 🩺 Medical Intelligence Validation (NEW 2025)
  const medicalValidation = {
    hasContradictions: data.medical_validation?.anatomical_contradictions?.length > 0 || false,
    hasInconsistencies: data.medical_validation?.logical_inconsistencies?.length > 0 || false,  
    requiresClarification: data.medical_validation?.requires_clarification?.length > 0 || false,
    medicalAlerts: data.medical_validation?.medical_alerts?.length > 0 || false,
    extractionEfficiency: data.extraction_metadata?.data_points_extracted_this_iteration || 1
  }
  
  // SOAP readiness check (≥50% + NOM compliant + NO critical medical issues)
  const hasCriticalIssues = medicalValidation.hasContradictions || medicalValidation.hasInconsistencies
  const readyForSOAP = totalScore >= 50 && nomCompliant && !hasCriticalIssues
  
  return {
    demographicScore: Math.round(demographicScore),
    clinicalScore: Math.round(clinicalScore),
    contextScore: Math.round(contextScore),
    totalScore,
    missingFields,
    nomCompliant,
    readyForSOAP,
    medicalValidation
  }
}

/**
 * Función detallada para obtener breakdown completo por campo
 */
export function getCompletenessDetails(
  data: MedicalExtractionOutput,
  weights: CompletenessWeights = { demographics: 40, clinical: 30, context: 30 }
): CompletenessDetails {
  
  const demographicWeight = weights.demographics * 0.5 // Split between age and gender
  const clinicalWeight = weights.clinical * 0.5 // Split between complaint and symptoms  
  const contextWeight = weights.context / 6 // Split between 6 context fields
  
  return {
    demographics: {
      age: {
        present: data.demographics.patient_age_years !== "unknown",
        weight: demographicWeight,
        score: data.demographics.patient_age_years !== "unknown" ? demographicWeight : 0
      },
      gender: {
        present: data.demographics.patient_gender !== "unknown", 
        weight: demographicWeight,
        score: data.demographics.patient_gender !== "unknown" ? demographicWeight : 0
      }
    },
    clinical: {
      complaint: {
        present: data.clinical_presentation.chief_complaint !== "unknown",
        weight: clinicalWeight,
        score: data.clinical_presentation.chief_complaint !== "unknown" ? clinicalWeight : 0
      },
      symptoms: {
        present: Boolean(data.clinical_presentation.primary_symptoms && data.clinical_presentation.primary_symptoms.length > 0),
        weight: clinicalWeight, 
        score: data.clinical_presentation.primary_symptoms && data.clinical_presentation.primary_symptoms.length > 0 ? clinicalWeight : 0
      }
    },
    context: {
      duration: {
        present: data.symptom_characteristics.duration_description !== "unknown",
        weight: contextWeight,
        score: data.symptom_characteristics.duration_description !== "unknown" ? contextWeight : 0
      },
      intensity: {
        present: data.symptom_characteristics.pain_intensity_scale !== null,
        weight: contextWeight,
        score: data.symptom_characteristics.pain_intensity_scale !== null ? contextWeight : 0
      },
      characteristics: {
        present: Boolean(data.symptom_characteristics.pain_characteristics && data.symptom_characteristics.pain_characteristics.length > 0),
        weight: contextWeight,
        score: data.symptom_characteristics.pain_characteristics && data.symptom_characteristics.pain_characteristics.length > 0 ? contextWeight : 0
      },
      aggravating: {
        present: Boolean(data.symptom_characteristics.aggravating_factors && data.symptom_characteristics.aggravating_factors.length > 0),
        weight: contextWeight,
        score: data.symptom_characteristics.aggravating_factors && data.symptom_characteristics.aggravating_factors.length > 0 ? contextWeight : 0
      },
      relieving: {
        present: Boolean(data.symptom_characteristics.relieving_factors && data.symptom_characteristics.relieving_factors.length > 0),
        weight: contextWeight,
        score: data.symptom_characteristics.relieving_factors && data.symptom_characteristics.relieving_factors.length > 0 ? contextWeight : 0
      },
      temporal: {
        present: data.symptom_characteristics.temporal_pattern !== "unknown",
        weight: contextWeight,
        score: data.symptom_characteristics.temporal_pattern !== "unknown" ? contextWeight : 0
      }
    }
  }
}

/**
 * Función para determinar si debe continuar la extracción iterativa
 */
export function shouldContinueExtraction(
  completeness: CompletenessBreakdown,
  currentIteration: number,
  maxIterations: number = 5
): {
  shouldContinue: boolean
  reason: string
  recommendedAction: 'continue' | 'complete' | 'manual_review'
} {
  // Stop conditions
  if (currentIteration >= maxIterations) {
    return {
      shouldContinue: false,
      reason: `Maximum iterations reached (${maxIterations})`,
      recommendedAction: 'manual_review'
    }
  }
  
  if (completeness.readyForSOAP) {
    return {
      shouldContinue: false,
      reason: `SOAP ready: ${completeness.totalScore}% complete and NOM compliant`,
      recommendedAction: 'complete'
    }
  }
  
  if (!completeness.nomCompliant) {
    return {
      shouldContinue: true,
      reason: `Missing critical NOM fields: ${completeness.missingFields.filter(f => ['patient_age_years', 'patient_gender', 'chief_complaint'].includes(f)).join(', ')}`,
      recommendedAction: 'continue'
    }
  }
  
  if (completeness.totalScore < 80) {
    return {
      shouldContinue: true,
      reason: `Completeness below threshold: ${completeness.totalScore}% < 80%`,
      recommendedAction: 'continue'
    }
  }
  
  return {
    shouldContinue: false,
    reason: `Extraction sufficient: ${completeness.totalScore}% complete`,
    recommendedAction: 'complete'
  }
}

/**
 * Función para generar preguntas de seguimiento específicas
 */
export function generateFollowUpQuestions(completeness: CompletenessBreakdown): string[] {
  const questions: string[] = []
  
  // Preguntas NOM críticas primero
  if (completeness.missingFields.includes('patient_age_years')) {
    questions.push("¿Cuál es la edad del paciente?")
  }
  
  if (completeness.missingFields.includes('patient_gender')) {
    questions.push("¿El paciente es masculino o femenino?")
  }
  
  if (completeness.missingFields.includes('chief_complaint')) {
    questions.push("¿Cuál es el motivo principal de consulta?")
  }
  
  // Preguntas contextuales específicas
  if (completeness.missingFields.includes('duration_description')) {
    questions.push("¿Desde cuándo presenta estos síntomas?")
  }
  
  if (completeness.missingFields.includes('pain_intensity_scale')) {
    questions.push("En una escala del 1 al 10, ¿qué intensidad tiene el dolor?")
  }
  
  // Maximum 3 questions to avoid overwhelming
  return questions.slice(0, 3)
}