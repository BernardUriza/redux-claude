// src/services/decisionalMiddleware.ts
// Middleware para decisiones con Claude API - Bernard Orozco
// Separación de responsabilidades: Este servicio maneja solo las llamadas a Claude

import { 
  AgentType, 
  AgentDecision, 
  DiagnosticDecision, 
  ValidationDecision, 
  TreatmentDecision, 
  TriageDecision, 
  DocumentationDecision 
} from '@/types/agents'

// Tipos para el middleware
export type DecisionType = 'diagnosis' | 'validation' | 'treatment' | 'triage' | 'documentation'
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
 * Función principal para llamar a Claude con decisiones específicas del agente
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
    apiKey: process.env.NEXT_PUBLIC_CLAUDE_API_KEY!,
    dangerouslyAllowBrowser: true 
  })
  
  if (request.signal?.aborted) {
    throw new Error('Request aborted')
  }

  // Construir system prompt específico para el tipo de decisión
  const systemPrompt = buildSystemPrompt(request.type, request.previousDecisions, request.context)
  
  const response = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 1000,
    system: systemPrompt,
    messages: [{ role: 'user', content: request.input }],
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

    default:
      return 'Eres un asistente médico especializado. Proporciona respuestas precisas y profesionales.'
  }
}

/**
 * Requerimientos de formato JSON para cada tipo de agente
 */
function getJsonFormatRequirements(type: DecisionType): string {
  switch (type) {
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

    default:
      return '\n\nRETURN ONLY valid JSON format.'
  }
}

/**
 * Validar estructura de la decisión según el tipo
 */
function validateDecisionStructure(decision: AgentDecision, type: DecisionType): void {
  switch (type) {
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
  }
}

/**
 * Calcular confianza basada en la calidad de la respuesta
 */
function calculateConfidence(decision: AgentDecision, type: DecisionType): number {
  let baseConfidence = 75 // Confianza base
  
  // Ajustar según completitud de la respuesta
  switch (type) {
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
  }
  
  return Math.min(95, Math.max(60, baseConfidence))
}

/**
 * Crear decisión de fallback cuando falla la API
 */
function createFallbackDecision(type: DecisionType, input: string): AgentDecision {
  switch (type) {
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
    default: return 'diagnosis'
  }
}