// 🏥 Medical Data Extraction Types - 2025 Healthcare Standards
// Creado por Bernard Orozco - HIPAA-Compliant TypeScript Interfaces

/**
 * HIPAA-Compliant JSON Schema con validación TypeScript
 * Basado en mejores prácticas de prompt engineering 2025 para Claude Sonnet 4
 */
export interface MedicalExtractionOutput {
  // 40% Weight - NOM Critical Demographics  
  demographics: {
    patient_age_years: number | "unknown"
    patient_gender: "masculino" | "femenino" | "unknown"
    confidence_demographic: number // 0.0-1.0
  }
  
  // 30% Weight - Primary Medical Data
  clinical_presentation: {
    chief_complaint: string | "unknown"
    primary_symptoms: string[] | null
    anatomical_location: string | "unknown" 
    confidence_symptoms: number // 0.0-1.0
  }
  
  // 30% Weight - Contextual Clinical Data
  symptom_characteristics: {
    duration_description: string | "unknown" // "2 días", "1 semana" 
    pain_intensity_scale: number | null // 1-10 NRS scale
    pain_characteristics: string[] | null // ["punzante", "constante"]
    aggravating_factors: string[] | null
    relieving_factors: string[] | null
    associated_symptoms: string[] | null
    temporal_pattern: string | "unknown" // "matutino", "nocturno"
    confidence_context: number // 0.0-1.0
  }
  
  // 🩺 Medical Intelligence & Validation (NEW 2025)
  medical_validation: {
    anatomical_contradictions: string[] // ["dolor de mano reportado pero paciente sin brazos"]
    logical_inconsistencies: string[] // ["edad pediátrica con síntomas de adulto mayor"]
    requires_clarification: string[] // ["confirmar presencia de extremidades superiores"]
    medical_alerts: string[] // ["revisar anatomía antes de continuar evaluación"]
  }
  
  // Completeness Metrics (Automated Calculation)
  extraction_metadata: {
    overall_completeness_percentage: number // 0-100
    demographic_complete: boolean // age + gender present
    clinical_complete: boolean // chief complaint + symptoms present  
    context_complete: boolean // ≥2 contextual fields present
    nom_compliant: boolean // Ready for Mexican healthcare standards
    ready_for_soap_generation: boolean // ≥80% + NOM compliant
    missing_critical_fields: string[] // ["patient_age_years", "duration"]
    data_points_extracted_this_iteration: number // Efficiency metric
    extraction_timestamp: string // ISO 8601
    claude_model_used: "claude-sonnet-4" | string
  }
}

/**
 * Input structure for the medical data extractor
 */
export interface MedicalExtractionInput {
  patient_input: string // Raw text from doctor/patient
  existing_data?: Partial<MedicalExtractionOutput> // Previous extraction data for iteration
  conversation_context?: string[] // Previous conversation messages
  iteration_number?: number // Which iteration is this (1, 2, 3...)
  max_iterations?: number // Stop condition (default: 5)
}

/**
 * Decision response specific to medical extraction
 */
export interface MedicalExtractionDecision {
  extracted_data: MedicalExtractionOutput
  requires_more_input: boolean
  suggested_followup_questions: string[]
  extraction_confidence: number // Overall confidence 0.0-1.0
  processing_time_ms: number
}

/**
 * Field-specific confidence thresholds for medical data
 */
export const MEDICAL_CONFIDENCE_THRESHOLDS = {
  DEMOGRAPHIC: 0.9, // High confidence needed for age/gender
  SYMPTOMS: 0.8,    // Medium-high confidence for clinical data  
  CONTEXT: 0.7,     // Medium confidence for contextual details
  OVERALL_MIN: 0.8  // Minimum overall confidence for SOAP readiness
} as const

/**
 * NOM (Mexican Healthcare Standards) required fields
 */
export const NOM_REQUIRED_FIELDS = [
  'demographics.patient_age_years',
  'demographics.patient_gender',
  'clinical_presentation.chief_complaint'
] as const

/**
 * Utility type for field validation
 */
export type RequiredMedicalField = typeof NOM_REQUIRED_FIELDS[number]

/**
 * Helper function to calculate completeness percentage
 */
export function calculateCompleteness(data: MedicalExtractionOutput): number {
  const weights = {
    demographics: 40,
    clinical: 30, 
    context: 30
  }
  
  let score = 0
  
  // Demographics scoring (40%)
  if (data.demographics.patient_age_years !== "unknown") score += 20
  if (data.demographics.patient_gender !== "unknown") score += 20
  
  // Clinical scoring (30%) 
  if (data.clinical_presentation.chief_complaint !== "unknown") score += 15
  if (data.clinical_presentation.primary_symptoms && data.clinical_presentation.primary_symptoms.length > 0) score += 15
  
  // Context scoring (30%) - at least 2 fields needed
  let contextFieldCount = 0
  if (data.symptom_characteristics.duration_description !== "unknown") contextFieldCount++
  if (data.symptom_characteristics.pain_intensity_scale !== null) contextFieldCount++
  if (data.symptom_characteristics.pain_characteristics && data.symptom_characteristics.pain_characteristics.length > 0) contextFieldCount++
  if (data.symptom_characteristics.aggravating_factors && data.symptom_characteristics.aggravating_factors.length > 0) contextFieldCount++
  if (data.symptom_characteristics.relieving_factors && data.symptom_characteristics.relieving_factors.length > 0) contextFieldCount++
  if (data.symptom_characteristics.temporal_pattern !== "unknown") contextFieldCount++
  
  // Award context points proportionally (max 30%)
  score += Math.min(30, (contextFieldCount / 6) * 30)
  
  return Math.round(score)
}

/**
 * Helper function to check NOM compliance
 */
export function isNOMCompliant(data: MedicalExtractionOutput): boolean {
  return (
    data.demographics.patient_age_years !== "unknown" &&
    data.demographics.patient_gender !== "unknown" &&
    data.clinical_presentation.chief_complaint !== "unknown"
  )
}

// State structure for Redux store - normalized entity pattern
export interface MedicalExtractionState {
  // Current extraction in progress
  currentExtraction: MedicalExtractionOutput | null;
  
  // Extraction history by session ID
  extractionHistory: Record<string, MedicalExtractionOutput[]>;
  
  // Extraction process state
  extractionProcess: {
    isExtracting: boolean;
    currentIteration: number;
    maxIterations: number;
    lastExtractedAt: string | null;
    error: string | null;
  };
  
  // Work-in-progress data (partial extractions)
  wipData: {
    demographics: Partial<MedicalExtractionOutput['demographics']>;
    clinical_presentation: Partial<MedicalExtractionOutput['clinical_presentation']>;
    symptom_characteristics: Partial<MedicalExtractionOutput['symptom_characteristics']>;
  };
}

// Action payloads for incremental updates
export interface UpdateDemographicsPayload {
  patient_age_years?: number | "unknown";
  patient_gender?: "masculino" | "femenino" | "unknown";
  confidence_demographic?: number;
}

export interface UpdateSymptomsPayload {
  chief_complaint?: string | "unknown";
  primary_symptoms?: string[] | null;
  anatomical_location?: string | "unknown";
  confidence_symptoms?: number;
}

export interface UpdateContextPayload {
  duration_description?: string | "unknown";
  pain_intensity_scale?: number | null;
  pain_characteristics?: string[] | null;
  aggravating_factors?: string[] | null;
  relieving_factors?: string[] | null;
  associated_symptoms?: string[] | null;
  temporal_pattern?: string | "unknown";
  confidence_context?: number;
}