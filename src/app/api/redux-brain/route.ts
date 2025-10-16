// 🧠 REDUX BRAIN API - Sistema completo con SOAP y trazabilidad Redux
// Bernard Orozco 2025 - ¡Demostrando el poder del paradigma!

import { NextRequest, NextResponse } from 'next/server'
import {
  SOAPProcessor,
  criticalPatternMiddleware,
  callClaudeForDecision,
  DefensiveMedicineValidator,
} from '@redux-claude/cognitive-core'
import { logger } from '@/lib/logger'
import { sanitizeInput, validateMedicalInput } from '@/lib/textUtils'

// 📊 CONSTANTS
const SOAP_SECTION_PROGRESS_PERCENT = 25 // Each SOAP section contributes 25% to total progress
const ADULT_AGE_THRESHOLD = 18 // Age threshold for pediatric vs adult
const RECENT_MESSAGES_COUNT = 3 // Number of recent messages to include in context
const RECENT_ACTIONS_COUNT = 5 // Number of recent Redux actions to return

// Tipos de acciones Redux (como en un store real)
enum ActionTypes {
  SESSION_INIT = 'SESSION_INIT',
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
  VALIDATION_COMPLETED = 'VALIDATION_COMPLETED',
  SOAP_S_UPDATED = 'SOAP_S_UPDATED',
  SOAP_O_UPDATED = 'SOAP_O_UPDATED',
  SOAP_A_UPDATED = 'SOAP_A_UPDATED',
  SOAP_P_UPDATED = 'SOAP_P_UPDATED',
  DIAGNOSIS_GENERATED = 'DIAGNOSIS_GENERATED',
  RESPONSE_GENERATED = 'RESPONSE_GENERATED',
  // 🚨 URGENCY DETECTION SYSTEM
  URGENCY_DETECTED = 'URGENCY_DETECTED',
  PROTOCOL_ACTIVATED = 'PROTOCOL_ACTIVATED',
  CRITICAL_FLAG = 'CRITICAL_FLAG',
  // 👶 PEDIATRIC PROTOCOLS
  PEDIATRIC_ALERT = 'PEDIATRIC_ALERT',
  WEIGHT_CALCULATION = 'WEIGHT_CALCULATION',
  // 📊 MICRO-REDUX ACTIONS
  ENTITY_EXTRACTED = 'ENTITY_EXTRACTED',
  SYMPTOM_PARSED = 'SYMPTOM_PARSED',
  VITAL_SIGN_DETECTED = 'VITAL_SIGN_DETECTED',
}

// 📊 TYPE DEFINITIONS for Redux Actions and Session Data

interface ActionPayload {
  [key: string]: unknown
}

interface SOAPState {
  subjetivo?: string
  objetivo?: string
  analisis?: string
  plan?: string
}

interface PatientInfo {
  age?: number | null
  gender?: string | null
  symptoms?: string[]
  duration?: string | null
  medicalHistory?: string[]
}

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: Date
  validated?: boolean
  category?: string
}

interface ExtractedInfo {
  age: number | null
  gender: string | null
  symptoms: string[]
  duration: string | null
  medicalHistory?: string[]
}

interface StateSnapshot {
  messageCount: number
  hasPatientInfo: boolean
  soapProgress: number
  currentPhase: string
}

interface ReduxAction {
  type: string
  payload: ActionPayload
  timestamp: Date
  stateSnapshot: StateSnapshot
}

interface UrgencyAssessment {
  level: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'
  protocol?: string
  actions: string[]
  pediatricFlag?: boolean
  reasoning?: string
}

interface SessionData {
  sessionId: string
  messages: ConversationMessage[]
  patientInfo: PatientInfo
  diagnosticState: {
    differentialDiagnosis?: string[]
    recommendedTests?: string[]
    treatmentPlan?: string[]
    urgencyLevel?: string
  }
  soapState: SOAPState
  urgencyAssessment?: UrgencyAssessment
  actionHistory: ReduxAction[]
}

// Store Redux con historial de acciones
const reduxStore = new Map<string, SessionData>()

// Función para despachar acciones (como en Redux real)
function dispatchAction(sessionId: string, action: { type: string; payload: ActionPayload }) {
  const session = reduxStore.get(sessionId)
  if (!session) return

  // Agregar acción al historial
  session.actionHistory.push({
    type: action.type,
    payload: action.payload,
    timestamp: new Date(),
    stateSnapshot: {
      messageCount: session.messages.length,
      hasPatientInfo: !!(session.patientInfo.age && session.patientInfo.symptoms?.length),
      soapProgress: calculateSOAPProgress(session.soapState),
      currentPhase: determineCurrentPhase(session),
    },
  })

  // Log structured action
  logger.reduxAction({
    type: action.type,
    payload: action.payload,
    sessionId,
  })
}

// Calcular progreso SOAP (0-100%)
function calculateSOAPProgress(soapState: SOAPState): number {
  let progress = 0
  if (soapState.subjetivo) progress += SOAP_SECTION_PROGRESS_PERCENT
  if (soapState.objetivo) progress += SOAP_SECTION_PROGRESS_PERCENT
  if (soapState.analisis) progress += SOAP_SECTION_PROGRESS_PERCENT
  if (soapState.plan) progress += SOAP_SECTION_PROGRESS_PERCENT
  return progress
}

// Determinar fase actual del proceso médico
function determineCurrentPhase(session: SessionData): string {
  if (!session.messages.length) return 'INICIO'
  if (!session.patientInfo.age) return 'ANAMNESIS'
  if (!session.soapState.objetivo) return 'EXPLORACIÓN'
  if (!session.soapState.analisis) return 'ANÁLISIS'
  if (!session.soapState.plan) return 'PLANIFICACIÓN'
  return 'SEGUIMIENTO'
}

async function callClaude(
  systemPrompt: string,
  userMessage: string,
  conversationHistory: ConversationMessage[] = []
) {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY

  if (!apiKey) {
    throw new Error('API key not configured')
  }

  const messages = [...conversationHistory, { role: 'user', content: userMessage }]

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1500,
      temperature: 0.3,
      system: systemPrompt,
      messages,
    }),
  })

  const result = await response.json()

  if (result.content && result.content[0]?.text) {
    return result.content[0].text
  }

  throw new Error('Invalid Claude response')
}

// 🔧 URGENCY DETECTION HELPERS

// Build contextual prompt for urgency analysis
function buildUrgencyPrompt(
  input: string,
  sessionStore: SessionData,
  extractedInfo: ExtractedInfo
): string {
  return `You are an expert emergency medicine physician analyzing a patient interaction for urgency levels.

CRITICAL CONTEXT - USE THIS TO MAKE DECISIONS:
- Current conversation: ${JSON.stringify(sessionStore.messages?.slice(-RECENT_MESSAGES_COUNT) || [])}
- Patient data extracted: ${JSON.stringify(extractedInfo)}
- SOAP progress: ${sessionStore.soapState ? JSON.stringify(sessionStore.soapState) : 'None'}
- Previous urgency assessments: ${sessionStore.urgencyAssessment?.level || 'None'}

NEW INPUT TO ANALYZE: "${input}"

ANTI-TELENOVELA RULES - CRITICAL FOR ACCURACY:
1. WHO IS THE PATIENT?
   - "ME duele" / "TENGO dolor" / "SIENTO" = PATIENT SYMPTOMS → Assess urgency normally
   - "Mi vecina/amigo dice que LE duele" = THIRD PARTY STORY → LOW/MODERATE (not patient)
   - "Mi hijo/bebé que está aquí tiene..." = PATIENT PRESENT → Assess urgency normally
   - "¿Qué opina de...?" = MEDICAL QUESTION → MODERATE

2. TEMPORAL CONTEXT - CRITICAL:
   - "hace X tiempo" / "el mes pasado" / "ayer tuve" = PAST → Context only, NOT current urgency
   - "ahora" / "actualmente" / "tengo" / "me duele" = CURRENT → Assess urgency
   - Example: "El mes pasado tuve dolor de pecho, pero ahora me duele la espalda" = CURRENT: back pain

3. PEDIATRIC CRITICAL RULES:
   - Age < 0.25 years (3 months) with fever = CRITICAL (neonatal sepsis risk)
   - Age 0.167 years = 2 months (NOT 2 years!)
   - Infant + fever + lethargy = CRITICAL

4. FAMILY HISTORY vs CURRENT SYMPTOMS:
   - "Mi papá murió de infarto" = FAMILY HISTORY → Context only
   - "Tengo dolor como el que tuvo mi papá" = CURRENT SYMPTOMS + context → Assess urgency

Return JSON:
{
  "level": "CRITICAL|HIGH|MODERATE|LOW",
  "protocol": "specific protocol name or null",
  "actions": ["array of immediate actions"],
  "pediatricFlag": boolean (true if age < 18 years),
  "reasoning": "detailed contextual analysis explaining WHY this urgency level, who is the patient, and temporal context"
}

URGENCY LEVELS:
- CRITICAL: Life-threatening, immediate action (<15 min) - MI, stroke, sepsis, anaphylaxis, neonatal fever
- HIGH: Urgent but stable (<2 hours) - severe pain, adult fever >39°C, respiratory distress
- MODERATE: Important but can wait (<24 hours) - medication questions, non-urgent symptoms
- LOW: Information, family history, casual conversation, third-party stories`
}

// Parse and validate urgency response from LLM
function parseUrgencyResponse(response: string): {
  level: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'
  protocol?: string
  actions: string[]
  pediatricFlag?: boolean
  reasoning: string
} {
  // Clean response and try to parse JSON
  let cleanResponse = response.trim()
  if (cleanResponse.startsWith('```json')) {
    cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?$/g, '')
  }

  const result = JSON.parse(cleanResponse)

  // Validate required fields
  if (!result.level || !Array.isArray(result.actions)) {
    throw new Error('Invalid LLM response structure')
  }

  return {
    level: result.level,
    protocol: result.protocol || null,
    actions: result.actions || [],
    pediatricFlag: result.pediatricFlag || false,
    reasoning: result.reasoning || 'No reasoning provided',
  }
}

// 🧠 CONTEXT-AWARE URGENCY ENGINE - LLM-based contextual analysis
async function detectUrgencyWithContext(
  input: string,
  sessionStore: SessionData,
  extractedInfo: ExtractedInfo
): Promise<{
  level: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'
  protocol?: string
  actions: string[]
  pediatricFlag?: boolean
  reasoning: string
}> {
  try {
    const contextualPrompt = buildUrgencyPrompt(input, sessionStore, extractedInfo)
    const response = await callClaude(contextualPrompt, input)
    return parseUrgencyResponse(response)
  } catch (error) {
    logger.error(
      'Context-aware urgency detection failed',
      error instanceof Error ? error : { error }
    )
    // Fallback to basic assessment
    return {
      level: extractedInfo.symptoms?.length > 0 ? 'MODERATE' : 'LOW',
      actions: [],
      reasoning: `LLM context analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}. Using basic fallback.`,
    }
  }
}

// 📊 MICRO-PARSER de entidades médicas para Redux granular
function parseMedicalEntities(text: string): {
  vitalSigns: { type: string; value: string }[]
  symptoms: string[]
  duration: string | null
  severity: string | null
} {
  const entities = {
    vitalSigns: [] as { type: string; value: string }[],
    symptoms: [] as string[],
    duration: null as string | null,
    severity: null as string | null,
  }

  // Signos vitales
  const bpMatch = text.match(/(\d{2,3})[\/x](\d{2,3})/)
  if (bpMatch) entities.vitalSigns.push({ type: 'PA', value: `${bpMatch[1]}/${bpMatch[2]}` })

  const tempMatch = text.match(/(\d{2,3})[.,]?(\d)?.*°?[CF]?.*fiebre|fiebre.*(\d{2,3})[.,]?(\d)?/)
  if (tempMatch) entities.vitalSigns.push({ type: 'TEMP', value: tempMatch[1] || tempMatch[3] })

  const fcMatch = text.match(/(\d{2,3}).*latidos|frecuencia.*(\d{2,3})/)
  if (fcMatch) entities.vitalSigns.push({ type: 'FC', value: fcMatch[1] || fcMatch[2] })

  // Duración temporal
  const durationMatch = text.match(
    /desde hace (\d+.*?(?:día|hora|semana|mes))|hace (\d+.*?(?:día|hora|semana|mes))|desde.*?(\w+)\s+pasado/
  )
  if (durationMatch) entities.duration = durationMatch[1] || durationMatch[2] || durationMatch[3]

  return entities
}

// 🎯 VALIDADOR AMIGABLE
async function validateInput(input: string): Promise<{
  isValid: boolean
  category: string
  message: string
  extractedInfo?: ExtractedInfo
}> {
  const systemPrompt = `You are a medical input validator. Analyze the input and respond in Spanish.

CRITICAL AGE PARSING RULES - PEDIATRIC SAFETY:
- "X meses" = X/12 years (e.g., "2 meses" = 0.167 years, "6 meses" = 0.5 years)
- "X días" = X/365 years (e.g., "15 días" = 0.041 years)
- "X semanas" = X/52 years (e.g., "3 semanas" = 0.058 years)
- "X años" = X years (e.g., "5 años" = 5 years)
- If unclear, return null for age

TEMPORAL CONTEXT RULES:
- "hace X tiempo" / "el mes pasado" / "ayer" = HISTÓRICO (not current emergency)
- "ahora" / "actualmente" / "tengo" / "siento" = ACTUAL (current symptoms)

WHO IS THE PATIENT - CRITICAL:
- "Mi bebé/hijo/hija tiene..." = PATIENT (if present with parent)
- "Mi vecina/amigo dice..." = THIRD PARTY (not patient)
- "Tengo/siento/me duele" = PATIENT DIRECT

Return a JSON object:
{
  "isValid": true/false,
  "category": "greeting|partial_medical|valid_medical|mixed|follow_up",
  "message": "Personalized response in Spanish",
  "extractedInfo": {
    "age": number or null (CAREFUL WITH MONTHS/DAYS - USE DECIMAL YEARS),
    "gender": "string or null",
    "symptoms": ["array of symptoms"],
    "duration": "string or null"
  }
}

Be friendly and helpful. Extract any medical information present.`

  const response = await callClaude(systemPrompt, input)

  try {
    return JSON.parse(response)
  } catch {
    return {
      isValid: false,
      category: 'error',
      message: 'No pude procesar tu mensaje. ¿Podrías reformularlo?',
    }
  }
}

// 🔄 SESSION INITIALIZATION HELPER
function getOrCreateSession(sessionId: string): SessionData {
  let session = reduxStore.get(sessionId)

  if (!session) {
    session = {
      sessionId,
      messages: [],
      patientInfo: {},
      diagnosticState: {},
      soapState: {},
      actionHistory: [],
    }
    reduxStore.set(sessionId, session)

    dispatchAction(sessionId, {
      type: ActionTypes.SESSION_INIT,
      payload: { sessionId, timestamp: new Date() },
    })
  }

  return session
}

// 📊 ENTITY PROCESSING HELPER
function processEntitiesAndDispatchActions(
  sessionId: string,
  message: string,
  extractedInfo: ExtractedInfo
): void {
  const entities = parseMedicalEntities(message)

  // Dispatch vital signs
  entities.vitalSigns.forEach(vital => {
    dispatchAction(sessionId, {
      type: ActionTypes.VITAL_SIGN_DETECTED,
      payload: { type: vital.type, value: vital.value },
    })
  })

  // Dispatch symptoms
  extractedInfo.symptoms?.forEach((symptom: string) => {
    dispatchAction(sessionId, {
      type: ActionTypes.SYMPTOM_PARSED,
      payload: { symptom, severity: entities.severity },
    })
  })
}

// 🚨 URGENCY DETECTION ORCHESTRATOR
async function detectAndAssessUrgency(
  sessionId: string,
  sanitizedMessage: string,
  session: SessionData,
  extractedInfo: ExtractedInfo
): Promise<UrgencyAssessment> {
  // Critical pattern detection
  const criticalPatternResult = criticalPatternMiddleware.analyzeCriticalPatterns(sanitizedMessage)
  logger.criticalPattern(sessionId, {
    triggered: criticalPatternResult.triggered,
    patterns: criticalPatternResult.patterns.map(p => p.name),
    urgencyOverride: criticalPatternResult.urgencyOverride || undefined,
    widowMaker: criticalPatternResult.widowMakerAlert,
  })

  // Defensive medicine validation
  const defensiveValidator = new DefensiveMedicineValidator()
  const urgentPatterns = defensiveValidator.identifyUrgentPatterns(sanitizedMessage)
  const overallUrgency = defensiveValidator.calculateOverallUrgency(urgentPatterns)
  logger.info('Defensive medicine validator completed', {
    sessionId,
    level: overallUrgency.level,
    maxGravity: overallUrgency.maxGravity,
    patternsDetected: urgentPatterns.map(p => p.symptoms[0]),
    category: 'defensive_medicine',
  })

  // Priority order: Critical Pattern > Defensive Medicine > LLM Contextual
  if (criticalPatternResult.urgencyOverride === 'critical') {
    return {
      level: 'CRITICAL',
      protocol: criticalPatternResult.patterns[0]?.name || 'Critical Pattern Protocol',
      actions: overallUrgency.immediateActions,
      pediatricFlag: extractedInfo?.age ? extractedInfo.age < ADULT_AGE_THRESHOLD : false,
      reasoning: `🚨 CRITICAL PATTERN OVERRIDE: ${criticalPatternResult.patterns.map(p => p.name).join(', ')}. ${criticalPatternResult.widowMakerAlert ? '💀 WIDOW MAKER RISK DETECTED' : ''}`,
    }
  }

  if (overallUrgency.level === 'critical' || overallUrgency.level === 'high') {
    return {
      level: overallUrgency.level === 'critical' ? 'CRITICAL' : 'HIGH',
      protocol:
        urgentPatterns.length > 0
          ? urgentPatterns[0].criticalDifferentials[0]
          : 'Emergency Protocol',
      actions: overallUrgency.immediateActions,
      pediatricFlag: extractedInfo?.age ? extractedInfo.age < ADULT_AGE_THRESHOLD : false,
      reasoning: `DefensiveMedicineValidator: Gravity Score ${overallUrgency.maxGravity}/10. Urgent patterns detected: ${urgentPatterns.map(p => p.symptoms[0]).join(', ')}`,
    }
  }

  return await detectUrgencyWithContext(sanitizedMessage, session, extractedInfo)
}

// 🚨 PROTOCOL ACTIVATION HELPER
function activateProtocols(
  sessionId: string,
  urgency: UrgencyAssessment,
  extractedInfo: ExtractedInfo
): void {
  // Dispatch urgency alerts
  if (urgency.level === 'CRITICAL' || urgency.level === 'HIGH') {
    dispatchAction(sessionId, {
      type: ActionTypes.URGENCY_DETECTED,
      payload: {
        level: urgency.level,
        protocol: urgency.protocol,
        actions: urgency.actions,
        isPediatric: urgency.pediatricFlag,
      },
    })

    if (urgency.protocol) {
      dispatchAction(sessionId, {
        type: ActionTypes.PROTOCOL_ACTIVATED,
        payload: { protocol: urgency.protocol, actions: urgency.actions },
      })
    }

    if (urgency.level === 'CRITICAL') {
      dispatchAction(sessionId, {
        type: ActionTypes.CRITICAL_FLAG,
        payload: { protocol: urgency.protocol, reason: 'VIDA_EN_RIESGO' },
      })
    }
  }

  // Pediatric protocols
  if (extractedInfo.age && extractedInfo.age < ADULT_AGE_THRESHOLD) {
    dispatchAction(sessionId, {
      type: ActionTypes.PEDIATRIC_ALERT,
      payload: {
        age: extractedInfo.age,
        pesoEstimado: extractedInfo.age * 3 + 7,
        requiereAdultoResponsable: true,
      },
    })

    if (urgency.pediatricFlag) {
      dispatchAction(sessionId, {
        type: ActionTypes.WEIGHT_CALCULATION,
        payload: {
          pesoEstimado: extractedInfo.age * 3 + 7,
          formula: 'PEDIATRICA_STANDAR',
        },
      })
    }
  }
}

// 📝 SOAP SECTION UPDATE HELPERS

// Update Subjective (S) section
function updateSOAPSubjective(
  sessionId: string,
  session: SessionData,
  sanitizedMessage: string,
  soapAnalysis: Awaited<ReturnType<SOAPProcessor['processCase']>>
): void {
  if (!session.soapState.subjetivo || session.messages.length <= 2) {
    session.soapState.subjetivo = sanitizedMessage
  } else if (soapAnalysis.soap?.subjetivo) {
    const subjetivoValue =
      typeof soapAnalysis.soap.subjetivo === 'string'
        ? soapAnalysis.soap.subjetivo
        : soapAnalysis.soap.subjetivo.motivoConsulta || sanitizedMessage

    if (subjetivoValue !== 'Paciente acude por evaluación médica') {
      session.soapState.subjetivo = subjetivoValue
    }
  }

  dispatchAction(sessionId, {
    type: ActionTypes.SOAP_S_UPDATED,
    payload: { subjetivo: session.soapState.subjetivo },
  })
}

// Update Objective (O) section
function updateSOAPObjective(
  sessionId: string,
  session: SessionData,
  soapAnalysis: Awaited<ReturnType<SOAPProcessor['processCase']>>
): void {
  if (soapAnalysis.soap?.objetivo) {
    const hasVitalSigns =
      soapAnalysis.soap.objetivo.signosVitales &&
      Object.keys(soapAnalysis.soap.objetivo.signosVitales).length > 0

    session.soapState.objetivo =
      typeof soapAnalysis.soap.objetivo === 'string'
        ? soapAnalysis.soap.objetivo
        : hasVitalSigns
          ? `Signos vitales: ${JSON.stringify(soapAnalysis.soap.objetivo.signosVitales, null, 2)}. Exploración: ${
              typeof soapAnalysis.soap.objetivo.exploracionFisica === 'object'
                ? JSON.stringify(soapAnalysis.soap.objetivo.exploracionFisica, null, 2)
                : soapAnalysis.soap.objetivo.exploracionFisica || 'Pendiente'
            }`
          : 'Pendiente - Se requiere evaluación física y signos vitales'

    dispatchAction(sessionId, {
      type: ActionTypes.SOAP_O_UPDATED,
      payload: { objetivo: session.soapState.objetivo },
    })
  }
}

// Update Analysis (A) section
function updateSOAPAnalysis(
  sessionId: string,
  session: SessionData,
  soapAnalysis: Awaited<ReturnType<SOAPProcessor['processCase']>>
): void {
  if (soapAnalysis.soap?.analisis) {
    session.soapState.analisis =
      typeof soapAnalysis.soap.analisis === 'string'
        ? soapAnalysis.soap.analisis
        : soapAnalysis.soap.analisis.diagnosticoPrincipal?.condicion ||
          'Análisis pendiente - Se requiere más información clínica'
  } else {
    session.soapState.analisis = 'Análisis pendiente - Se requiere más información clínica'
  }

  dispatchAction(sessionId, {
    type: ActionTypes.SOAP_A_UPDATED,
    payload: { analisis: session.soapState.analisis },
  })
}

// Update Plan (P) section
function updateSOAPPlan(
  sessionId: string,
  session: SessionData,
  soapAnalysis: Awaited<ReturnType<SOAPProcessor['processCase']>>
): void {
  if (soapAnalysis.soap?.plan) {
    if (typeof soapAnalysis.soap.plan === 'string') {
      session.soapState.plan = soapAnalysis.soap.plan
    } else {
      const hasTreatment =
        (Array.isArray(soapAnalysis.soap.plan.tratamientoFarmacologico) &&
          soapAnalysis.soap.plan.tratamientoFarmacologico.length > 0) ||
        (Array.isArray(soapAnalysis.soap.plan.tratamientoNoFarmacologico) &&
          soapAnalysis.soap.plan.tratamientoNoFarmacologico.length > 0)

      session.soapState.plan = hasTreatment
        ? JSON.stringify(soapAnalysis.soap.plan, null, 2)
        : 'Plan pendiente - Requiere completar anamnesis y evaluación'
    }
  } else {
    session.soapState.plan = 'Plan pendiente - Requiere completar anamnesis y evaluación'
  }

  dispatchAction(sessionId, {
    type: ActionTypes.SOAP_P_UPDATED,
    payload: { plan: session.soapState.plan },
  })
}

// 🧠 SOAP PROCESSING ORCHESTRATOR
async function processSOAPAnalysis(
  sessionId: string,
  session: SessionData,
  sanitizedMessage: string,
  extractedInfo: ExtractedInfo
): Promise<void> {
  try {
    const soapProcessor = new SOAPProcessor()
    const soapAnalysis = await soapProcessor.processCase(sanitizedMessage, {
      age: extractedInfo.age ?? undefined,
      gender: extractedInfo.gender ?? undefined,
      comorbidities: extractedInfo.medicalHistory,
      medications: [],
      vitalSigns: {},
    })

    // Update all SOAP sections using helper functions
    updateSOAPSubjective(sessionId, session, sanitizedMessage, soapAnalysis)
    updateSOAPObjective(sessionId, session, soapAnalysis)
    updateSOAPAnalysis(sessionId, session, soapAnalysis)
    updateSOAPPlan(sessionId, session, soapAnalysis)
  } catch (soapError) {
    logger.error(
      'SOAP processing failed',
      soapError instanceof Error ? soapError : { error: soapError, sessionId }
    )
  }
}

// 💬 RESPONSE GENERATION HELPER
async function generateMedicalResponse(
  sessionId: string,
  session: SessionData,
  sanitizedMessage: string,
  validation: Awaited<ReturnType<typeof validateInput>>
): Promise<string> {
  if (!validation.isValid) {
    return validation.message
  }

  const responseMessage = await processMedicalQuery(sanitizedMessage, session)

  // Use Decisional Middleware for SOAP completion detection
  const fullConversation = session.messages.map(m => m.content).join(' ')
  const extractionDecision = await callClaudeForDecision('medical_data_extractor', fullConversation)

  if (extractionDecision.decision?.treatmentExecuted) {
    if (!session.soapState.analisis) {
      session.soapState.analisis = extractionDecision.decision.diagnosis || 'Diagnóstico procesado'
      dispatchAction(sessionId, {
        type: ActionTypes.SOAP_A_UPDATED,
        payload: { analisis: session.soapState.analisis },
      })
    }

    if (!session.soapState.plan || !session.soapState.plan.includes('ejecutado')) {
      session.soapState.plan =
        'Plan terapéutico ejecutado y documentado. ' +
        (extractionDecision.decision.treatmentDetails || '')
      dispatchAction(sessionId, {
        type: ActionTypes.SOAP_P_UPDATED,
        payload: { plan: session.soapState.plan },
      })
    }
  }

  return responseMessage
}

// 🏥 PROCESADOR MÉDICO PRINCIPAL
async function processMedicalQuery(input: string, sessionData: SessionData): Promise<string> {
  // 🚨 CRITICAL PATTERN DETECTION - WIDOW MAKER ALERT
  const criticalPatternResult = criticalPatternMiddleware.analyzeCriticalPatterns(input)

  const systemPrompt = `You are an advanced medical AI assistant. You have access to the patient's conversation history and extracted information.

Patient Information:
${JSON.stringify(sessionData.patientInfo, null, 2)}

Previous Diagnostic State:
${JSON.stringify(sessionData.diagnosticState, null, 2)}

${criticalPatternResult.triggered ? criticalPatternMiddleware.generateMandatoryPrompt(criticalPatternResult) : ''}

🚨 HARDCODED WIDOW MAKER PATTERN - AORTIC DISSECTION DETECTION:
IF this case shows (sepsis + abdominal pain + HTN history), you MUST consider aortic dissection:

CRITICAL RULE: If patient has:
1. Sepsis-like presentation (fever, hypotension, altered mental status, leukocytosis)
2. AND abdominal pain (any type: colic, severe, epigastric)
3. AND history of hypertension (controlled or uncontrolled)

THEN you MUST include in your differential diagnosis:
• Disección Aórtica con translocación bacteriana (bacterial translocation from intestinal ischemia)
• Explain the pathophysiology: Aortic dissection → intestinal ischemia → bacterial translocation → sepsis-like syndrome
• Recommend: AngioTC of thoracic and abdominal aorta, pulse differences between extremities
• Mention this is a "widow maker" condition that mimics sepsis

This is NOT optional - patient safety requires this consideration.

INSTRUCTIONS:
1. Provide a comprehensive medical response in Spanish
2. If information is complete, provide differential diagnosis
3. Suggest treatment plans when appropriate
4. Maintain context from previous messages
5. Be professional but empathetic
6. Ask for missing critical information when needed

Remember: You're helping a medical professional, so be thorough and precise.`

  const conversationHistory = sessionData.messages.map((m: ConversationMessage) => ({
    role: m.role,
    content: m.content,
  }))

  return await callClaude(systemPrompt, input, conversationHistory)
}

export async function POST(req: NextRequest) {
  try {
    const { sessionId, message } = await req.json()

    // 🔒 SANITIZE INPUT
    const sanitizedMessage = sanitizeInput(message)

    // 📋 VALIDATE INPUT - Basic sanity check
    const inputValidation = validateMedicalInput(sanitizedMessage)
    if (!inputValidation.isValid && inputValidation.issues.length > 1) {
      logger.warn('Invalid input received', {
        sessionId,
        issues: inputValidation.issues,
        category: 'validation',
      })
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          issues: inputValidation.issues,
          suggestions: inputValidation.suggestions,
        },
        { status: 400 }
      )
    }

    if (inputValidation.suggestions.length > 0) {
      logger.debug('Input has encoding issues (auto-normalized)', {
        sessionId,
        suggestions: inputValidation.suggestions,
      })
    }

    // 🔄 GET OR CREATE SESSION
    const session = getOrCreateSession(sessionId)

    logger.info('Redux Brain session started', {
      sessionId,
      messageLength: sanitizedMessage.length,
      originalLength: message.length,
      wasSanitized: sanitizedMessage !== message,
      category: 'session',
    })
    logger.debug(`User input received (sanitized): "${sanitizedMessage}"`, { sessionId })

    // Dispatch message received action
    dispatchAction(sessionId, {
      type: ActionTypes.MESSAGE_RECEIVED,
      payload: { message: sanitizedMessage, role: 'user' },
    })

    // 🎯 VALIDATE AND EXTRACT INFORMATION
    const validation = await validateInput(sanitizedMessage)
    logger.info('Input validation completed', {
      sessionId,
      isValid: validation.isValid,
      category: validation.category,
      hasExtractedInfo: !!validation.extractedInfo,
    })

    dispatchAction(sessionId, {
      type: ActionTypes.VALIDATION_COMPLETED,
      payload: { isValid: validation.isValid, category: validation.category },
    })

    // 📊 PROCESS MEDICAL DATA IF AVAILABLE
    if (validation.extractedInfo) {
      session.patientInfo = {
        ...session.patientInfo,
        ...validation.extractedInfo,
      }

      // Process entities and dispatch micro-actions
      processEntitiesAndDispatchActions(sessionId, message, validation.extractedInfo)

      // Detect and assess urgency
      const urgency = await detectAndAssessUrgency(
        sessionId,
        sanitizedMessage,
        session,
        validation.extractedInfo
      )

      // Activate protocols
      activateProtocols(sessionId, urgency, validation.extractedInfo)

      // Save urgency assessment
      session.urgencyAssessment = urgency

      // Process SOAP analysis
      await processSOAPAnalysis(sessionId, session, sanitizedMessage, validation.extractedInfo)
    }

    // 💬 ADD USER MESSAGE
    session.messages.push({
      role: 'user',
      content: sanitizedMessage,
      timestamp: new Date(),
      validated: validation.isValid,
      category: validation.category,
    })

    // 🎨 GENERATE MEDICAL RESPONSE
    const responseMessage = await generateMedicalResponse(
      sessionId,
      session,
      sanitizedMessage,
      validation
    )

    // 💬 ADD ASSISTANT MESSAGE
    session.messages.push({
      role: 'assistant',
      content: responseMessage,
      timestamp: new Date(),
      validated: true,
      category: 'response',
    })

    // Dispatch response generated action
    dispatchAction(sessionId, {
      type: ActionTypes.RESPONSE_GENERATED,
      payload: { messageLength: responseMessage.length },
    })

    // Guardar sesión actualizada
    reduxStore.set(sessionId, session)

    // Respuesta completa con metadatos y flujo Redux completo
    return NextResponse.json({
      success: true,
      sessionId,
      message: responseMessage,
      validation,
      soapState: session.soapState, // Add SOAP state at root level for UI
      sessionData: {
        messageCount: session.messages.length,
        patientInfo: session.patientInfo,
        soapState: session.soapState,
        hasCompleteInfo: !!(
          session.patientInfo.age &&
          session.patientInfo.gender &&
          session.patientInfo.symptoms?.length
        ),
        currentPhase: determineCurrentPhase(session),
        soapProgress: calculateSOAPProgress(session.soapState),
      },
      reduxFlow: {
        totalActions: session.actionHistory.length,
        recentActions: session.actionHistory.slice(-RECENT_ACTIONS_COUNT).map(a => ({
          type: a.type,
          timestamp: a.timestamp,
          phase: a.stateSnapshot.currentPhase,
          soapProgress: a.stateSnapshot.soapProgress,
        })),
        stateEvolution: {
          initialState: session.actionHistory[0]?.stateSnapshot,
          currentState: session.actionHistory[session.actionHistory.length - 1]?.stateSnapshot,
        },
      },
      // 🚨 URGENCY ASSESSMENT - Información crítica para decisiones médicas
      urgencyAssessment: {
        ...(session.urgencyAssessment || { level: 'LOW', actions: [] }),
        reasoning: session.urgencyAssessment?.reasoning || 'No contextual analysis performed',
      },
      reduxState: {
        storeSize: reduxStore.size,
        activeSession: sessionId,
        totalMessages: session.messages.length,
        actionCount: session.actionHistory.length,
        // Flags críticos para alertas
        hasCriticalUrgency: session.urgencyAssessment?.level === 'CRITICAL',
        pediatricCase: session.patientInfo.age
          ? session.patientInfo.age < ADULT_AGE_THRESHOLD
          : false,
        protocolsActivated: session.actionHistory.filter(
          a => a.type === ActionTypes.PROTOCOL_ACTIVATED
        ).length,
      },
    })
  } catch (error) {
    logger.fatal('Redux Brain fatal error', error instanceof Error ? error : { error })
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('sessionId')

  if (sessionId && reduxStore.has(sessionId)) {
    const session = reduxStore.get(sessionId)!
    return NextResponse.json({
      sessionId,
      messageCount: session.messages.length,
      patientInfo: session.patientInfo,
      diagnosticState: session.diagnosticState,
      lastMessage: session.messages[session.messages.length - 1],
    })
  }

  return NextResponse.json({
    service: '🧠 Redux Brain API',
    description: 'Complete medical consultation system with Redux-like state management',
    activeSessions: reduxStore.size,
    usage: {
      endpoint: 'POST /api/redux-brain',
      payload: {
        sessionId: 'unique-session-id',
        message: 'your medical query',
      },
    },
    testCommands: [
      `curl -X POST http://localhost:3002/api/redux-brain -H "Content-Type: application/json" -d '{"sessionId":"test-1","message":"hola"}'`,
      `curl -X POST http://localhost:3002/api/redux-brain -H "Content-Type: application/json" -d '{"sessionId":"test-1","message":"mi hijo tiene fiebre"}'`,
      `curl -X POST http://localhost:3002/api/redux-brain -H "Content-Type: application/json" -d '{"sessionId":"test-1","message":"tiene 5 años, la fiebre es de 39 grados desde ayer"}'`,
    ],
  })
}
