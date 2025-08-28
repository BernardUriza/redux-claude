// 🛡️ Extraction Validation - Stop Conditions with Validation Layers
// Creado por Bernard Orozco - Phase 3: Iterative Logic (Progressive Data Accumulation)

import { MedicalExtractionOutput } from '../types/medicalExtraction'
import { CompletenessBreakdown, checkCompleteness } from './completenessChecker'

// Validation layers types
export interface ValidationResult {
  isValid: boolean
  confidence: number
  issues: ValidationIssue[]
  recommendation: ValidationRecommendation
}

export interface ValidationIssue {
  severity: 'critical' | 'warning' | 'info'
  field: string
  message: string
  suggestedAction: string
}

export type ValidationRecommendation = 
  | 'proceed_to_soap'     // ≥80% + NOM compliant
  | 'continue_extraction' // Missing critical data
  | 'manual_review'       // Max iterations reached or edge cases
  | 'user_confirmation'   // Borderline cases need user input

export interface StopCondition {
  met: boolean
  reason: string
  priority: number // 1 = highest priority
  action: ValidationRecommendation
}

/**
 * Comprehensive validation with multiple layers
 */
export function validateExtraction(
  data: MedicalExtractionOutput,
  currentIteration: number,
  maxIterations: number = 5
): ValidationResult {
  const completeness = checkCompleteness(data)
  const issues: ValidationIssue[] = []
  
  // Layer 1: Critical NOM validation
  const criticalIssues = validateCriticalRequirements(data, completeness)
  issues.push(...criticalIssues)
  
  // Layer 2: Data quality validation
  const qualityIssues = validateDataQuality(data)
  issues.push(...qualityIssues)
  
  // Layer 3: Completeness validation
  const completenessIssues = validateCompleteness(data, completeness)
  issues.push(...completenessIssues)
  
  // Layer 4: Iteration limits validation
  const iterationIssues = validateIterationLimits(currentIteration, maxIterations, completeness)
  issues.push(...iterationIssues)
  
  // Determine overall validation result
  const criticalCount = issues.filter(i => i.severity === 'critical').length
  const confidence = calculateValidationConfidence(data, completeness, issues)
  const recommendation = determineRecommendation(completeness, currentIteration, maxIterations, issues)
  
  return {
    isValid: criticalCount === 0,
    confidence,
    issues,
    recommendation
  }
}

/**
 * Check stop conditions in priority order
 */
export function checkStopConditions(
  data: MedicalExtractionOutput,
  currentIteration: number,
  maxIterations: number = 5
): StopCondition[] {
  const completeness = checkCompleteness(data)
  const conditions: StopCondition[] = []
  
  // Priority 1: Maximum iterations reached
  conditions.push({
    met: currentIteration >= maxIterations,
    reason: `Maximum iterations reached (${currentIteration}/${maxIterations})`,
    priority: 1,
    action: 'manual_review'
  })
  
  // Priority 2: Ready for SOAP (≥80% + NOM compliant)
  conditions.push({
    met: completeness.readyForSOAP,
    reason: `SOAP ready: ${completeness.totalScore}% complete and NOM compliant`,
    priority: 2,
    action: 'proceed_to_soap'
  })
  
  // Priority 3: NOM compliant with reasonable completeness (≥60%)
  conditions.push({
    met: completeness.nomCompliant && completeness.totalScore >= 60,
    reason: `NOM compliant with ${completeness.totalScore}% completeness`,
    priority: 3,
    action: 'user_confirmation'
  })
  
  // Priority 4: Missing critical NOM data
  const criticalMissing = completeness.missingFields.filter(field => 
    ['patient_age_years', 'patient_gender', 'chief_complaint'].includes(field)
  )
  conditions.push({
    met: criticalMissing.length > 0 && currentIteration < maxIterations,
    reason: `Missing critical NOM fields: ${criticalMissing.join(', ')}`,
    priority: 4,
    action: 'continue_extraction'
  })
  
  // Priority 5: Low completeness but iteration limit approaching
  conditions.push({
    met: completeness.totalScore < 50 && currentIteration >= maxIterations - 1,
    reason: `Low completeness (${completeness.totalScore}%) with iterations nearly exhausted`,
    priority: 5,
    action: 'manual_review'
  })
  
  return conditions.filter(c => c.met).sort((a, b) => a.priority - b.priority)
}

/**
 * Layer 1: Critical requirements validation (NOM Mexican standards)
 */
function validateCriticalRequirements(
  data: MedicalExtractionOutput, 
  completeness: CompletenessBreakdown
): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  
  if (!completeness.nomCompliant) {
    if (data.demographics.patient_age_years === "unknown") {
      issues.push({
        severity: 'critical',
        field: 'patient_age_years',
        message: 'Edad del paciente es requerida por normas NOM',
        suggestedAction: 'Preguntar directamente la edad del paciente'
      })
    }
    
    if (data.demographics.patient_gender === "unknown") {
      issues.push({
        severity: 'critical',
        field: 'patient_gender',
        message: 'Género del paciente es requerido por normas NOM',
        suggestedAction: 'Confirmar si el paciente es masculino o femenino'
      })
    }
    
    if (data.clinical_presentation.chief_complaint === "unknown") {
      issues.push({
        severity: 'critical',
        field: 'chief_complaint',
        message: 'Motivo principal de consulta es requerido',
        suggestedAction: 'Identificar claramente el síntoma o problema principal'
      })
    }
  }
  
  return issues
}

/**
 * Layer 2: Data quality validation
 */
function validateDataQuality(data: MedicalExtractionOutput): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  
  // Age validation
  if (data.demographics.patient_age_years !== "unknown" && 
      (data.demographics.patient_age_years < 0 || data.demographics.patient_age_years > 150)) {
    issues.push({
      severity: 'warning',
      field: 'patient_age_years',
      message: `Edad fuera de rango normal: ${data.demographics.patient_age_years}`,
      suggestedAction: 'Verificar la edad del paciente'
    })
  }
  
  // Pain scale validation
  if (data.symptom_characteristics.pain_intensity_scale !== null && 
      (data.symptom_characteristics.pain_intensity_scale < 1 || data.symptom_characteristics.pain_intensity_scale > 10)) {
    issues.push({
      severity: 'warning',
      field: 'pain_intensity_scale',
      message: `Escala de dolor fuera de rango (1-10): ${data.symptom_characteristics.pain_intensity_scale}`,
      suggestedAction: 'Verificar la intensidad del dolor en escala 1-10'
    })
  }
  
  // Low confidence warnings
  if (data.demographics.confidence_demographic < 0.7) {
    issues.push({
      severity: 'warning',
      field: 'demographics',
      message: `Baja confianza en datos demográficos: ${Math.round(data.demographics.confidence_demographic * 100)}%`,
      suggestedAction: 'Confirmar edad y género del paciente'
    })
  }
  
  return issues
}

/**
 * Layer 3: Completeness validation
 */
function validateCompleteness(
  data: MedicalExtractionOutput,
  completeness: CompletenessBreakdown
): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  
  if (completeness.totalScore < 30) {
    issues.push({
      severity: 'critical',
      field: 'overall_completeness',
      message: `Completitud muy baja: ${completeness.totalScore}%`,
      suggestedAction: 'Obtener más información del paciente'
    })
  } else if (completeness.totalScore < 60) {
    issues.push({
      severity: 'warning',
      field: 'overall_completeness',
      message: `Completitud insuficiente: ${completeness.totalScore}%`,
      suggestedAction: 'Preguntar por síntomas adicionales y contexto'
    })
  }
  
  // Specific completeness issues
  if (completeness.demographicScore < 20) {
    issues.push({
      severity: 'warning',
      field: 'demographics',
      message: 'Datos demográficos incompletos',
      suggestedAction: 'Confirmar edad y género'
    })
  }
  
  if (completeness.clinicalScore < 15) {
    issues.push({
      severity: 'warning',
      field: 'clinical_presentation',
      message: 'Presentación clínica incompleta',
      suggestedAction: 'Obtener más detalles sobre síntomas'
    })
  }
  
  return issues
}

/**
 * Layer 4: Iteration limits validation
 */
function validateIterationLimits(
  currentIteration: number,
  maxIterations: number,
  completeness: CompletenessBreakdown
): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  
  if (currentIteration >= maxIterations) {
    if (completeness.totalScore < 50) {
      issues.push({
        severity: 'critical',
        field: 'iteration_limit',
        message: `Límite de iteraciones alcanzado con baja completitud: ${completeness.totalScore}%`,
        suggestedAction: 'Revisar manualmente y completar información faltante'
      })
    } else {
      issues.push({
        severity: 'info',
        field: 'iteration_limit',
        message: `Límite de iteraciones alcanzado. Completitud: ${completeness.totalScore}%`,
        suggestedAction: 'Proceder con los datos disponibles'
      })
    }
  } else if (currentIteration >= maxIterations - 1) {
    issues.push({
      severity: 'warning',
      field: 'iteration_limit',
      message: `Última iteración disponible. Completitud actual: ${completeness.totalScore}%`,
      suggestedAction: 'Enfocar en datos críticos faltantes'
    })
  }
  
  return issues
}

/**
 * Calculate overall validation confidence
 */
function calculateValidationConfidence(
  data: MedicalExtractionOutput,
  completeness: CompletenessBreakdown,
  issues: ValidationIssue[]
): number {
  let baseConfidence = completeness.totalScore / 100
  
  // Reduce confidence based on issues
  const criticalPenalty = issues.filter(i => i.severity === 'critical').length * 0.3
  const warningPenalty = issues.filter(i => i.severity === 'warning').length * 0.1
  
  // Factor in individual field confidences
  const avgFieldConfidence = (
    data.demographics.confidence_demographic +
    data.clinical_presentation.confidence_symptoms +
    data.symptom_characteristics.confidence_context
  ) / 3
  
  const finalConfidence = Math.max(0.1, Math.min(1.0, 
    (baseConfidence + avgFieldConfidence) / 2 - criticalPenalty - warningPenalty
  ))
  
  return Math.round(finalConfidence * 100) / 100
}

/**
 * Determine final recommendation based on validation
 */
function determineRecommendation(
  completeness: CompletenessBreakdown,
  currentIteration: number,
  maxIterations: number,
  issues: ValidationIssue[]
): ValidationRecommendation {
  const criticalIssues = issues.filter(i => i.severity === 'critical').length
  
  // Critical issues = must continue or manual review
  if (criticalIssues > 0) {
    return currentIteration >= maxIterations ? 'manual_review' : 'continue_extraction'
  }
  
  // Ready for SOAP
  if (completeness.readyForSOAP) {
    return 'proceed_to_soap'
  }
  
  // NOM compliant with reasonable completeness
  if (completeness.nomCompliant && completeness.totalScore >= 60) {
    return 'user_confirmation'
  }
  
  // Max iterations reached
  if (currentIteration >= maxIterations) {
    return 'manual_review'
  }
  
  // Default: continue if possible
  return 'continue_extraction'
}