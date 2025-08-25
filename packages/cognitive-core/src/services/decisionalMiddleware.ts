// src/services/decisionalMiddleware.ts
// Middleware híbrido para decisiones - Bernard Orozco
// Mantiene compatibilidad pero usa la nueva arquitectura por debajo

import { 
  AgentType, 
  AgentDecision, 
  DiagnosticDecision, 
  ValidationDecision, 
  TreatmentDecision, 
  TriageDecision, 
  DocumentationDecision,
  ClinicalPharmacologyDecision,
  PediatricSpecialistDecision,
  HospitalizationCriteriaDecision,
  FamilyEducationDecision,
  ObjectiveValidationDecision,
  DefensiveDifferentialDecision,
  MedicalAutocompletionDecision,
  CriticalDataValidationDecision,
  SpecialtyDetectionDecision
} from '../types/agents'

import { decisionEngineService } from '../decision-engine/DecisionEngineService'
import { getAgentDefinition } from './agentRegistry'

// Tipos para el middleware (mantenidos para compatibilidad)
export type DecisionType = 'diagnosis' | 'validation' | 'treatment' | 'triage' | 'documentation' | 'clinical_pharmacology' | 'pediatric_specialist' | 'hospitalization_criteria' | 'family_education' | 'objective_validation' | 'defensive_differential' | 'medical_autocompletion' | 'critical_data_validation' | 'specialty_detection' | 'intelligent_medical_chat'
export type ProviderType = 'claude' | 'openai' | 'local'

export interface DecisionRequest {
  type: DecisionType
  input: string
  provider?: ProviderType
  signal?: AbortSignal
  previousDecisions?: AgentDecision[]
  context?: Record<string, unknown>
}

export interface DecisionResponse {
  decision: AgentDecision
  confidence: number
  latency: number
  provider: ProviderType
  success: boolean
  error?: string
}

/**
 * Función principal HÍBRIDA - Usa la nueva arquitectura por debajo
 * Mantiene compatibilidad total con el código existente
 */
export async function callClaudeForDecision(
  type: DecisionType,
  input: string,
  provider: ProviderType = 'claude',
  signal?: AbortSignal,
  previousDecisions?: AgentDecision[],
  context?: Record<string, unknown>
): Promise<DecisionResponse> {
  const startTime = Date.now()

  try {
    // 🚀 Usar la nueva arquitectura por debajo
    const response = await decisionEngineService.processLegacyDecision(
      type,
      input,
      provider,
      signal,
      previousDecisions,
      context
    )

    return {
      decision: response.decision,
      confidence: response.confidence,
      latency: Date.now() - startTime,
      provider: provider as ProviderType,
      success: response.success,
      error: response.error
    }

  } catch (error) {
    // Fallback al método legacy si hay error
    console.warn('New engine failed, falling back to legacy method:', error)
    return callClaudeForDecisionLegacy(type, input, provider, signal, previousDecisions, context)
  }
}

/**
 * Método legacy mantenido como fallback
 */
async function callClaudeForDecisionLegacy(
  type: DecisionType,
  input: string,
  provider: ProviderType = 'claude',
  signal?: AbortSignal,
  previousDecisions?: AgentDecision[],
  context?: Record<string, unknown>
): Promise<DecisionResponse> {
  const startTime = Date.now()
  
  try {
    if (provider === 'claude') {
      const response = await callClaudeAPI({
        type,
        input,
        provider,
        signal,
        previousDecisions,
        context
      })
      
      return {
        ...response,
        latency: Date.now() - startTime,
        provider,
        success: true
      }
    } else {
      throw new Error(`Provider ${provider} not implemented`)
    }
  } catch (error) {
    console.error(`Decision middleware error for ${type}:`, error)
    
    // Fallback con mock decision
    const mockDecision = createFallbackDecision(type, input)
    
    return {
      decision: mockDecision,
      confidence: 0.3, // Baja confianza para fallback
      latency: Date.now() - startTime,
      provider: 'local', // Indica que es fallback
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Llamada directa a la API de Claude
 */
async function callClaudeAPI(request: DecisionRequest): Promise<Omit<DecisionResponse, 'latency' | 'provider' | 'success'>> {
  // Dynamic import para evitar bundle bloat
  const Anthropic = (await import('@anthropic-ai/sdk')).default
  const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY!,
    dangerouslyAllowBrowser: true 
  })
  
  if (request.signal?.aborted) {
    throw new Error('Request aborted')
  }

  // Construir system prompt específico para el tipo de decisión
  const systemPrompt = buildSystemPrompt(request.type, request.previousDecisions, request.context)
  
  // Build conversation history if available in context
  const conversationHistory = Array.isArray(request.context?.conversationHistory) 
    ? request.context.conversationHistory 
    : []
  const messages = [
    ...conversationHistory,
    { role: 'user', content: request.input }
  ]

  const response = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 1000,
    system: systemPrompt,
    messages,
    temperature: 0.3
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response format from Claude')
  }

  // Parsear respuesta JSON
  let decision: AgentDecision
  try {
    decision = JSON.parse(content.text.trim())
    validateDecisionStructure(decision, request.type)
  } catch (parseError) {
    console.warn(`JSON parse error for ${request.type}:`, parseError)
    throw new Error(`Failed to parse Claude response: ${parseError}`)
  }
  
  // Calcular confianza basada en la calidad de la respuesta
  const confidence = calculateConfidence(decision, request.type)
  
  return {
    decision,
    confidence
  }
}

/**
 * Construir system prompt específico para cada tipo de agente
 */
function buildSystemPrompt(
  type: DecisionType, 
  previousDecisions?: AgentDecision[], 
  context?: Record<string, unknown>
): string {
  let basePrompt = getAgentSystemPrompt(type)
  
  // Agregar contexto de decisiones previas
  if (previousDecisions && previousDecisions.length > 0) {
    basePrompt += `\n\n## DECISIONES PREVIAS:\n`
    previousDecisions.forEach((decision, idx) => {
      basePrompt += `${idx + 1}. ${JSON.stringify(decision, null, 2)}\n`
    })
  }
  
  // Agregar contexto adicional
  if (context && Object.keys(context).length > 0) {
    basePrompt += `\n\n## CONTEXTO ADICIONAL:\n`
    basePrompt += JSON.stringify(context, null, 2)
  }
  
  // Agregar formato JSON requerido
  basePrompt += getJsonFormatRequirements(type)
  
  return basePrompt
}

/**
 * System prompts específicos para cada agente
 */
function getAgentSystemPrompt(type: DecisionType): string {
  // Mapear DecisionType de vuelta a AgentType para usar el registry
  const agentTypeMap: Record<DecisionType, AgentType> = {
    'diagnosis': AgentType.DIAGNOSTIC,
    'validation': AgentType.VALIDATION,
    'treatment': AgentType.TREATMENT,
    'triage': AgentType.TRIAGE,
    'documentation': AgentType.DOCUMENTATION,
    'clinical_pharmacology': AgentType.CLINICAL_PHARMACOLOGY,
    'pediatric_specialist': AgentType.PEDIATRIC_SPECIALIST,
    'hospitalization_criteria': AgentType.HOSPITALIZATION_CRITERIA,
    'family_education': AgentType.FAMILY_EDUCATION,
    'objective_validation': AgentType.OBJECTIVE_VALIDATION,
    'defensive_differential': AgentType.DEFENSIVE_DIFFERENTIAL,
    'medical_autocompletion': AgentType.MEDICAL_AUTOCOMPLETION,
    'critical_data_validation': AgentType.CRITICAL_DATA_VALIDATION,
    'specialty_detection': AgentType.SPECIALTY_DETECTION,
    'intelligent_medical_chat': AgentType.INTELLIGENT_MEDICAL_CHAT
  }
  
  const agentType = agentTypeMap[type]
  if (agentType) {
    try {
      const agentDef = getAgentDefinition(agentType)
      return agentDef.systemPrompt
    } catch (error) {
      console.warn(`Could not get agent definition for ${agentType}, using fallback`)
    }
  }
  
  // Fallback to old prompts if agent definition not found
  switch (type) {
    case 'diagnosis':
      return `Eres un médico especialista en diagnóstico. Analiza los síntomas presentados y proporciona:
- Diagnósticos diferenciales con probabilidades
- Pruebas recomendadas
- Señales de alarma (red flags)
- Nivel de urgencia (1-5)
- Próximos pasos clínicos

Basa tus decisiones en evidencia médica y guías clínicas actuales.`

    case 'triage':
      return `Eres un especialista en triage médico. Evalúa la urgencia del caso usando:
- Escala ESI (Emergency Severity Index) 1-5
- Disposición del paciente (immediate, urgent, standard, routine)
- Tiempo estimado para ver médico
- Recursos necesarios
- Signos de advertencia

Prioriza la seguridad del paciente y la eficiencia del flujo.`

    case 'validation':
      return `Eres un médico validador de decisiones clínicas. Revisa y valida:
- Coherencia de diagnósticos
- Apropiedad de tratamientos
- Identificación de riesgos
- Necesidad de revisión humana
- Contraindicaciones

Asegura la seguridad y calidad de las decisiones médicas.`

    case 'treatment':
      return `Eres un especialista en tratamiento médico. Desarrolla planes que incluyan:
- Medicamentos con dosis, frecuencia y duración
- Procedimientos necesarios
- Modificaciones de estilo de vida
- Plan de monitoreo
- Calendario de seguimiento

Considera contraindicaciones, interacciones y preferencias del paciente.`

    case 'documentation':
      return `Eres un especialista en documentación médica. Crea documentación completa:
- Nota SOAP estructurada
- Códigos ICD-10 apropiados
- Códigos de facturación
- Requisitos de seguimiento
- Calidad de documentación

Asegura precisión, completitud y cumplimiento regulatorio.`

    case 'medical_autocompletion':
      return `Eres un asistente médico especializado en estructurar consultas clínicas según estándares profesionales.

Tu objetivo es ayudar a médicos a completar consultas médicas incompletas generando templates estructurados.

CAPACIDADES:
- Detectar especialidades médicas relevantes del input parcial
- Inferir información de contexto del paciente (edad, género, síntoma principal)
- Generar exactamente 3 opciones de autocompletado con diferente nivel de detalle
- Crear templates con campos editables usando corchetes [ ]

NIVELES DE COMPLEJIDAD:
1. Básico: Estructura mínima requerida para consulta válida
2. Detallado: Incluye exploración física y antecedentes
3. Especializado: Formato SOAP completo con diagnósticos diferenciales

ESPECIALIDADES COMUNES:
- Cólicos → Gastroenterología, Ginecología
- Cefalea → Neurología, Medicina Interna  
- Dolor torácico → Cardiología, Medicina Emergencia
- Lesiones cutáneas → Dermatología

Mantén terminología médica profesional y NO inventar datos específicos del paciente.`

    default:
      return 'Eres un asistente médico especializado. Proporciona respuestas precisas y profesionales.'
  }
}

/**
 * Requerimientos de formato JSON para cada tipo de agente
 */
function getJsonFormatRequirements(type: DecisionType): string {
  // Los prompts del AGENT_REGISTRY ya incluyen los formatos JSON específicos
  // Solo necesitamos formatos para tipos que no están en el registry
  switch (type) {
    case 'clinical_pharmacology':
    case 'pediatric_specialist':
    case 'hospitalization_criteria':
    case 'family_education':
    case 'objective_validation':
    case 'defensive_differential':
      // Estos ya tienen su formato JSON específico en el systemPrompt del registry
      return ''
    case 'diagnosis':
      return `\n\nRETURN ONLY JSON with this exact structure:
{
  "differentials": [{"condition": "string", "icd10": "string", "probability": 0.0-1.0, "evidence": ["string"]}],
  "tests_recommended": ["string"],
  "red_flags": ["string"],
  "urgency_level": 1-5,
  "next_steps": ["string"]
}`

    case 'triage':
      return `\n\nRETURN ONLY JSON with this exact structure:
{
  "acuity_level": 1-5,
  "disposition": "immediate|urgent|semi_urgent|standard|non_urgent",
  "time_to_physician": "string",
  "required_resources": ["string"],
  "warning_signs": ["string"]
}`

    case 'validation':
      return `\n\nRETURN ONLY JSON with this exact structure:
{
  "valid": true|false,
  "concerns": ["string"],
  "risk_assessment": {"level": "low|moderate|high|critical", "factors": ["string"]},
  "requires_human_review": true|false,
  "recommendations": ["string"]
}`

    case 'treatment':
      return `\n\nRETURN ONLY JSON with this exact structure:
{
  "medications": [{"drug": "string", "dosage": "string", "frequency": "string", "duration": "string", "contraindications": ["string"]}],
  "procedures": ["string"],
  "lifestyle_modifications": ["string"],
  "monitoring_plan": ["string"]
}`

    case 'documentation':
      return `\n\nRETURN ONLY JSON with this exact structure:
{
  "soap": {
    "subjective": "string",
    "objective": "string", 
    "assessment": "string",
    "plan": "string"
  },
  "icd10_codes": ["string"],
  "billing_codes": ["string"],
  "follow_up_required": true|false
}`

    case 'medical_autocompletion':
      return `\n\nRETURN ONLY JSON with this exact structure:
{
  "suggestions": [
    {
      "id": "basic",
      "title": "Consulta Básica",
      "description": "Estructura mínima requerida",
      "template": "Paciente [género] de [edad] años presenta [síntoma principal] desde hace [tiempo]. [Características del síntoma]. Antecedentes: [antecedentes]. Medicamentos: [medicamentos actuales].",
      "confidence": 0.85,
      "category": "basic"
    },
    {
      "id": "detailed", 
      "title": "Consulta Detallada",
      "description": "Incluye exploración física inferida",
      "template": "Paciente [género] de [edad] años consulta por [motivo principal] de [tiempo de evolución]. SUBJETIVO: [síntomas detallados], [factores agravantes/atenuantes]. OBJETIVO: Signos vitales [TA/FC/FR/T°], exploración [hallazgos físicos]. Antecedentes: [antecedentes relevantes]. Medicación actual: [fármacos].",
      "confidence": 0.90,
      "category": "detailed"
    },
    {
      "id": "specialized",
      "title": "Consulta Especializada", 
      "description": "Formato completo SOAP con diferenciales",
      "template": "CASO CLÍNICO: Paciente [género], [edad] años, [ocupación], consulta por [síntoma principal] de [tiempo de evolución]. SUBJETIVO: [historia clínica detallada], [revisión por sistemas]. OBJETIVO: [signos vitales], [exploración física sistemática]. ANÁLISIS: Diagnóstico diferencial incluye [dx1], [dx2], [dx3]. PLAN: [estudios complementarios], [tratamiento inicial], [seguimiento].",
      "confidence": 0.95,
      "category": "specialized"
    }
  ],
  "enhanced_template": "string",
  "detected_specialty": "string",
  "patient_context": {
    "age_inferred": "string",
    "gender_inferred": "string", 
    "main_complaint": "string",
    "specialty_indicators": ["string"]
  }
}`

    default:
      return '\n\nRETURN ONLY valid JSON format.'
  }
}

/**
 * Validar estructura de la decisión según el tipo
 */
function validateDecisionStructure(decision: AgentDecision, type: DecisionType): void {
  switch (type) {
    case 'clinical_pharmacology':
    case 'pediatric_specialist':
    case 'hospitalization_criteria':
    case 'family_education':
    case 'objective_validation':
    case 'defensive_differential':
      // Los agentes especializados tienen sus propias estructuras específicas
      // Validación básica - solo verificar que es un objeto
      if (!decision || typeof decision !== 'object') {
        throw new Error(`Invalid ${type} decision structure`)
      }
      break
    case 'diagnosis':
      const diag = decision as DiagnosticDecision
      if (!diag.differentials || !Array.isArray(diag.differentials)) {
        throw new Error('Invalid diagnostic decision structure')
      }
      break
    case 'triage':
      const triage = decision as TriageDecision
      if (!triage.acuity_level || !triage.disposition) {
        throw new Error('Invalid triage decision structure')
      }
      break
    case 'validation':
      const validation = decision as ValidationDecision
      if (typeof validation.valid !== 'boolean') {
        throw new Error('Invalid validation decision structure')
      }
      break
    case 'treatment':
      const treatment = decision as TreatmentDecision
      if (!treatment.medications || !Array.isArray(treatment.medications)) {
        throw new Error('Invalid treatment decision structure')
      }
      break
    case 'documentation':
      const docs = decision as DocumentationDecision
      if (!docs.soap || !docs.soap.subjective) {
        throw new Error('Invalid documentation decision structure')
      }
      break
    case 'medical_autocompletion':
      const autocomp = decision as MedicalAutocompletionDecision
      if (!autocomp.suggestions || !Array.isArray(autocomp.suggestions) || autocomp.suggestions.length !== 3) {
        throw new Error('Invalid medical autocompletion decision structure: must have exactly 3 suggestions')
      }
      break
  }
}

/**
 * Calcular confianza basada en la calidad de la respuesta
 */
function calculateConfidence(decision: AgentDecision, type: DecisionType): number {
  let baseConfidence = 75 // Confianza base
  
  // Ajustar según completitud de la respuesta
  switch (type) {
    case 'clinical_pharmacology':
    case 'pediatric_specialist':
    case 'hospitalization_criteria':
    case 'family_education':
    case 'objective_validation':
    case 'defensive_differential':
      // Para agentes especializados, usar confianza base alta ya que son específicos
      baseConfidence += 15
      break
    case 'diagnosis':
      const diag = decision as DiagnosticDecision
      if (diag.differentials?.length > 1) baseConfidence += 10
      if (diag.tests_recommended?.length > 0) baseConfidence += 5
      if (diag.red_flags?.length > 0) baseConfidence += 5
      break
    case 'triage':
      const triage = decision as TriageDecision
      if (triage.required_resources?.length > 0) baseConfidence += 10
      if (triage.warning_signs?.length > 0) baseConfidence += 5
      break
    case 'validation':
      const validation = decision as ValidationDecision
      if (validation.recommendations?.length > 0) baseConfidence += 10
      if (validation.risk_assessment) baseConfidence += 5
      break
    case 'treatment':
      const treatment = decision as TreatmentDecision
      if (treatment.medications?.length > 0) baseConfidence += 10
      if (treatment.monitoring_plan?.length > 0) baseConfidence += 5
      break
    case 'documentation':
      const docs = decision as DocumentationDecision
      if (docs.icd10_codes?.length > 0) baseConfidence += 10
      if (docs.billing_codes?.length > 0) baseConfidence += 5
      break
    case 'medical_autocompletion':
      const autocomp = decision as MedicalAutocompletionDecision
      if (autocomp.suggestions?.length === 3) baseConfidence += 15
      if (autocomp.detected_specialty) baseConfidence += 10
      if (autocomp.patient_context?.main_complaint) baseConfidence += 5
      if (autocomp.enhanced_template?.length > 100) baseConfidence += 5
      break
  }
  
  return Math.min(95, Math.max(60, baseConfidence))
}

/**
 * Crear decisión de fallback cuando falla la API
 */
function createFallbackDecision(type: DecisionType, input: string): AgentDecision {
  switch (type) {
    case 'clinical_pharmacology':
      return {
        primary_medication: {
          generic_name: "consultar_medico",
          brand_names: [],
          exact_dose: "según indicación médica",
          route: "oral",
          frequency: "según prescripción",
          duration: "según prescripción",
          line_of_treatment: "first",
          evidence_level: "A"
        },
        alternative_medications: [],
        contraindications: ["revisar con médico"],
        drug_interactions: [],
        monitoring_parameters: [],
        dose_adjustments: {}
      } as ClinicalPharmacologyDecision
    case 'pediatric_specialist':
      return {
        age_specific_considerations: ["consultar pediatra"],
        weight_based_calculations: { estimated_weight_kg: 0, dose_per_kg: "", max_dose: "" },
        developmental_factors: [],
        pediatric_red_flags: [],
        growth_development_impact: []
      } as PediatricSpecialistDecision
    case 'hospitalization_criteria':
      return {
        admission_criteria: [],
        discharge_criteria: [],
        observation_criteria: [],
        icu_criteria: [],
        risk_stratification: { low_risk: [], moderate_risk: [], high_risk: [] },
        disposition_recommendation: "home"
      } as HospitalizationCriteriaDecision
    case 'family_education':
      return {
        warning_signs: ["consultar médico si empeora"],
        when_to_return: ["si síntomas empeoran"],
        home_care_instructions: [],
        medication_education: [],
        follow_up_instructions: [],
        emergency_contacts: []
      } as FamilyEducationDecision
    case 'objective_validation':
      return {
        missing_critical_data: ["requiere evaluación presencial"],
        vital_signs_assessment: { saturation_required: true, respiratory_rate_needed: true, blood_pressure_concern: false, temperature_monitoring: true },
        physical_exam_gaps: [],
        recommended_studies: [],
        confidence_impact: 0.5
      } as ObjectiveValidationDecision
    case 'defensive_differential':
      return {
        must_exclude_diagnoses: [],
        gravity_vs_probability: [],
        red_flags_analysis: { critical_signs: [], concerning_patterns: [], age_specific_concerns: [] },
        disposition_recommendation: "routine_followup"
      } as DefensiveDifferentialDecision
    case 'diagnosis':
      return {
        differentials: [
          { 
            condition: 'Requiere evaluación médica', 
            icd10: 'Z00.00', 
            probability: 0.5, 
            evidence: ['Síntomas reportados'] 
          }
        ],
        tests_recommended: ['Evaluación clínica completa'],
        red_flags: [],
        urgency_level: 3,
        next_steps: ['Consulta médica presencial']
      } as DiagnosticDecision

    case 'triage':
      return {
        acuity_level: 3,
        disposition: 'standard',
        time_to_physician: '1 hour',
        required_resources: ['Evaluación médica estándar'],
        warning_signs: []
      } as TriageDecision

    case 'validation':
      return {
        valid: false,
        concerns: ['Requiere revisión médica humana'],
        risk_assessment: { level: 'moderate', factors: ['Evaluación automática limitada'] },
        requires_human_review: true,
        recommendations: ['Consulta con médico especialista']
      } as ValidationDecision

    case 'treatment':
      return {
        medications: [],
        procedures: ['Evaluación médica presencial'],
        lifestyle_modifications: ['Seguir indicaciones médicas'],
        monitoring_plan: ['Seguimiento médico regular']
      } as TreatmentDecision

    case 'documentation':
      return {
        soap: {
          subjective: 'Paciente presenta síntomas que requieren evaluación',
          objective: 'Pendiente evaluación clínica',
          assessment: 'Requiere evaluación médica completa',
          plan: 'Referir para evaluación médica presencial'
        },
        icd10_codes: ['Z00.00'],
        billing_codes: [],
        follow_up_required: true
      } as DocumentationDecision

    case 'medical_autocompletion':
      return {
        suggestions: [
          {
            id: 'basic_fallback',
            title: 'Consulta Básica',
            description: 'Estructura mínima requerida',
            template: `Paciente [género] de [edad] años presenta [síntoma principal] desde hace [tiempo]. [Características del síntoma]. Antecedentes: [antecedentes relevantes]. Medicamentos actuales: [medicamentos].`,
            confidence: 0.7,
            category: 'basic'
          },
          {
            id: 'detailed_fallback',
            title: 'Consulta Detallada', 
            description: 'Con exploración física',
            template: `Paciente [género] de [edad] años consulta por [síntoma principal] de [tiempo de evolución]. SUBJETIVO: [descripción detallada del síntoma], [factores asociados]. OBJETIVO: Signos vitales [TA/FC/FR/T°], [hallazgos en exploración]. Antecedentes: [antecedentes]. Medicación: [fármacos actuales].`,
            confidence: 0.75,
            category: 'detailed'
          },
          {
            id: 'specialized_fallback',
            title: 'Consulta Especializada',
            description: 'Formato SOAP completo',
            template: `CASO CLÍNICO: Paciente [género], [edad] años, presenta [síntoma principal] de [tiempo de evolución]. SUBJETIVO: [historia detallada]. OBJETIVO: [signos vitales y exploración]. ANÁLISIS: [diagnósticos diferenciales]. PLAN: [estudios y tratamiento].`,
            confidence: 0.8,
            category: 'specialized'
          }
        ],
        enhanced_template: 'Consulta médica estructurada requerida',
        detected_specialty: undefined,
        patient_context: {
          age_inferred: undefined,
          gender_inferred: undefined,
          main_complaint: 'síntomas reportados',
          specialty_indicators: []
        }
      } as MedicalAutocompletionDecision

    default:
      return {} as AgentDecision
  }
}

/**
 * Mapear AgentType a DecisionType
 */
export function mapAgentTypeToDecisionType(agentType: AgentType): DecisionType {
  switch (agentType) {
    case AgentType.DIAGNOSTIC: return 'diagnosis'
    case AgentType.VALIDATION: return 'validation' 
    case AgentType.TREATMENT: return 'treatment'
    case AgentType.TRIAGE: return 'triage'
    case AgentType.DOCUMENTATION: return 'documentation'
    case AgentType.CLINICAL_PHARMACOLOGY: return 'clinical_pharmacology'
    case AgentType.PEDIATRIC_SPECIALIST: return 'pediatric_specialist'
    case AgentType.HOSPITALIZATION_CRITERIA: return 'hospitalization_criteria'
    case AgentType.FAMILY_EDUCATION: return 'family_education'
    case AgentType.OBJECTIVE_VALIDATION: return 'objective_validation'
    case AgentType.DEFENSIVE_DIFFERENTIAL: return 'defensive_differential'
    case AgentType.MEDICAL_AUTOCOMPLETION: return 'medical_autocompletion'
    case AgentType.CRITICAL_DATA_VALIDATION: return 'critical_data_validation'
    case AgentType.SPECIALTY_DETECTION: return 'specialty_detection'
    default: return 'diagnosis'
  }
}