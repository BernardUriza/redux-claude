// 🔥 DECISIONAL MIDDLEWARE REFACTORIZADO - Bernard Orozco 2025
// Arquitectura limpia usando únicamente Claude y agent registry

import { AgentDecision, AgentType } from '../types/agents'
import { decisionEngineService } from '../decision-engine/DecisionEngineService'
import { getAgentDefinition } from '../services/agent-registry'

// 🎯 TIPOS SIMPLIFICADOS
export type DecisionType =
  | 'diagnosis'
  | 'validation'
  | 'treatment'
  | 'triage'
  | 'documentation'
  | 'clinical_pharmacology'
  | 'pediatric_specialist'
  | 'hospitalization_criteria'
  | 'family_education'
  | 'objective_validation'
  | 'defensive_differential'
  | 'medical_autocompletion'
  | 'critical_data_validation'
  | 'specialty_detection'
  | 'intelligent_medical_chat'
  | 'medical_data_extractor'
  | 'medical_input_validator'

export type ProviderType = 'claude'

export interface DecisionResponse {
  decision: any // Flexible type para manejar diferentes tipos de decisiones
  confidence: number
  latency: number
  success: boolean
  error?: string
}

// 🎯 MAPEO AGENTTYPE ↔ DECISIONTYPE
const AGENT_TYPE_MAP: Record<DecisionType, AgentType> = {
  diagnosis: AgentType.DIAGNOSTIC,
  validation: AgentType.VALIDATION,
  treatment: AgentType.TREATMENT,
  triage: AgentType.TRIAGE,
  documentation: AgentType.DOCUMENTATION,
  clinical_pharmacology: AgentType.CLINICAL_PHARMACOLOGY,
  pediatric_specialist: AgentType.PEDIATRIC_SPECIALIST,
  hospitalization_criteria: AgentType.HOSPITALIZATION_CRITERIA,
  family_education: AgentType.FAMILY_EDUCATION,
  objective_validation: AgentType.OBJECTIVE_VALIDATION,
  defensive_differential: AgentType.DEFENSIVE_DIFFERENTIAL,
  medical_autocompletion: AgentType.MEDICAL_AUTOCOMPLETION,
  critical_data_validation: AgentType.CRITICAL_DATA_VALIDATION,
  specialty_detection: AgentType.SPECIALTY_DETECTION,
  intelligent_medical_chat: AgentType.INTELLIGENT_MEDICAL_CHAT,
  medical_data_extractor: AgentType.MEDICAL_DATA_EXTRACTOR,
  medical_input_validator: AgentType.MEDICAL_INPUT_VALIDATOR,
}

/**
 * 🧠 CON CONTEXTO/STORE - Para decisiones con continuidad (2+x=Y)
 * Mantiene historial de conversación por núcleo
 */
export async function callDecisionEngine(
  coreId: string, // 'dashboard', 'assistant', 'inference'
  type: DecisionType,
  input: string,
  options: {
    provider?: ProviderType
    signal?: AbortSignal
    persistContext?: boolean
    sessionId?: string
  } = {}
): Promise<DecisionResponse> {
  const startTime = Date.now()

  try {
    const response = await decisionEngineService.processDecisionWithContext({
      coreId,
      type,
      input,
      ...options,
    })

    return {
      decision: response.decision,
      confidence: response.confidence,
      latency: Date.now() - startTime,
      success: response.success,
      error: response.error,
    }
  } catch (error) {
    console.error(`🔥 Decision engine with context failed for ${coreId}/${type}:`, error)

    return {
      decision: createMinimalFallback(type),
      confidence: 0,
      latency: Date.now() - startTime,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * ⚡ SIN CONTEXTO - Para funciones puras (2+2=4)
 * Generadores, validadores, cálculos matemáticos
 */
export async function callIndividualDecision(
  type: DecisionType,
  input: string,
  context?: Record<string, unknown>,
  signal?: AbortSignal
): Promise<DecisionResponse> {
  const startTime = Date.now()

  try {
    const response = await decisionEngineService.processDecision({
      type,
      input,
      context,
      signal,
    })

    return {
      decision: response.decision,
      confidence: response.confidence,
      latency: Date.now() - startTime,
      success: response.success,
      error: response.error,
    }
  } catch (error) {
    console.error(`🔥 Individual decision failed for ${type}:`, error)

    return {
      decision: createMinimalFallback(type),
      confidence: 0,
      latency: Date.now() - startTime,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * 🔄 BACKWARD COMPATIBILITY - Legacy wrapper
 */
export async function callClaudeForDecision(
  type: DecisionType,
  input: string,
  provider: ProviderType = 'claude',
  signal?: AbortSignal,
  previousDecisions?: AgentDecision[],
  context?: Record<string, unknown>
): Promise<DecisionResponse> {
  // Redirigir a función individual (sin contexto) por defecto
  return callIndividualDecision(type, input, context, signal)
}

/**
 * 🚨 FALLBACK MÍNIMO - Solo casos críticos
 */
function createMinimalFallback(type: DecisionType): AgentDecision {
  return {
    error: `Failed to process ${type} decision`,
    requires_human_review: true,
    fallback_message: 'Consultar médico especialista',
  } as any
}

/**
 * 🗺️ UTILIDAD: AgentType ↔ DecisionType mapping
 */
export function mapAgentTypeToDecisionType(agentType: AgentType): DecisionType {
  const reverseMap = Object.entries(AGENT_TYPE_MAP).find(([_, value]) => value === agentType)
  return reverseMap ? (reverseMap[0] as DecisionType) : 'diagnosis'
}

export function mapDecisionTypeToAgentType(decisionType: DecisionType): AgentType {
  return AGENT_TYPE_MAP[decisionType] || AgentType.DIAGNOSTIC
}

// 🧠 REDUX BRAIN SERVICE - Complete medical consultation system
// All logic moved here for NPM package distribution

import { SOAPProcessor } from '../soap/SOAPProcessor'
import { DefensiveMedicineValidator } from '../validators/DefensiveMedicineValidator'
import { criticalPatternMiddleware } from '../middleware/CriticalPatternMiddleware'

// Redux Brain Session Type
export interface ReduxBrainSession {
  sessionId: string
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    validated: boolean
    category?: string
  }>
  patientInfo: {
    age?: number
    gender?: string
    symptoms?: string[]
    duration?: string
    medicalHistory?: string[]
  }
  diagnosticState: {
    differentialDiagnosis?: string[]
    recommendedTests?: string[]
    treatmentPlan?: string[]
    urgencyLevel?: string
  }
  soapState: {
    subjetivo?: string
    objetivo?: string
    analisis?: string
    plan?: string
  }
  urgencyAssessment?: {
    level: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'
    protocol?: string
    actions: string[]
    pediatricFlag?: boolean
    reasoning?: string
  }
  actionHistory: Array<{
    type: string
    payload: any
    timestamp: Date
    stateSnapshot: {
      messageCount: number
      hasPatientInfo: boolean
      soapProgress: number
      currentPhase: string
    }
  }>
}

// Redux Brain Store (singleton for all sessions)
const reduxBrainStore = new Map<string, ReduxBrainSession>()

// Helper functions
function calculateSOAPProgress(soapState: any): number {
  let progress = 0
  if (soapState?.subjetivo) progress += 25
  if (soapState?.objetivo) progress += 25
  if (soapState?.analisis) progress += 25
  if (soapState?.plan) progress += 25
  return progress
}

function determineCurrentPhase(session: ReduxBrainSession): string {
  if (!session.messages.length) return 'INICIO'
  if (!session.patientInfo.age) return 'ANAMNESIS'
  if (!session.soapState.objetivo) return 'EXPLORACIÓN'
  if (!session.soapState.analisis) return 'ANÁLISIS'
  if (!session.soapState.plan) return 'PLANIFICACIÓN'
  return 'SEGUIMIENTO'
}

// Main Redis Brain processor - can be called from any Next.js app
export async function processReduxBrainMessage(
  sessionId: string,
  message: string,
  apiKey?: string
): Promise<any> {
  // This will contain all the logic from route.ts
  // For now, return a basic response
  let session = reduxBrainStore.get(sessionId) || {
    sessionId,
    messages: [],
    patientInfo: {},
    diagnosticState: {},
    soapState: {},
    actionHistory: []
  }

  // Save session
  reduxBrainStore.set(sessionId, session)

  // Add message
  session.messages.push({
    role: 'user',
    content: message,
    timestamp: new Date(),
    validated: true,
    category: 'medical'
  })

  // Return response structure
  return {
    success: true,
    sessionId,
    message: 'Processed by Redux Brain Service',
    soapState: session.soapState,
    sessionData: {
      messageCount: session.messages.length,
      soapProgress: calculateSOAPProgress(session.soapState)
    }
  }
}
