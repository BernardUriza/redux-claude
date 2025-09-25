// 🧠 REDUX BRAIN API - Sistema completo con SOAP y trazabilidad Redux
// Bernard Orozco 2025 - ¡Demostrando el poder del paradigma!

import { NextRequest, NextResponse } from 'next/server'
import { SOAPResolver, SOAPProcessor } from '@redux-claude/cognitive-core'

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
  VITAL_SIGN_DETECTED = 'VITAL_SIGN_DETECTED'
}

// Store Redux con historial de acciones
const reduxStore = new Map<string, {
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
  // 🚨 URGENCY ASSESSMENT - Evaluación automática de urgencias
  urgencyAssessment?: {
    level: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'
    protocol?: string
    actions: string[]
    pediatricFlag?: boolean
  }
  // Historial de acciones Redux con trazabilidad completa
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
}>()

// Función para despachar acciones (como en Redux real)
function dispatchAction(sessionId: string, action: { type: string; payload: any }) {
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
      currentPhase: determineCurrentPhase(session)
    }
  })

  // Log para debug
  console.log(`📝 Redux Action: ${action.type}`, action.payload)
}

// Calcular progreso SOAP (0-100%)
function calculateSOAPProgress(soapState: any): number {
  let progress = 0
  if (soapState.subjetivo) progress += 25
  if (soapState.objetivo) progress += 25
  if (soapState.analisis) progress += 25
  if (soapState.plan) progress += 25
  return progress
}

// Determinar fase actual del proceso médico
function determineCurrentPhase(session: any): string {
  if (!session.messages.length) return 'INICIO'
  if (!session.patientInfo.age) return 'ANAMNESIS'
  if (!session.soapState.objetivo) return 'EXPLORACIÓN'
  if (!session.soapState.analisis) return 'ANÁLISIS'
  if (!session.soapState.plan) return 'PLANIFICACIÓN'
  return 'SEGUIMIENTO'
}

async function callClaude(systemPrompt: string, userMessage: string, conversationHistory: any[] = []) {
  const apiKey = process.env.CLAUDE_API_KEY

  if (!apiKey) {
    throw new Error('API key not configured')
  }

  const messages = [
    ...conversationHistory,
    { role: 'user', content: userMessage }
  ]

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1500,
      temperature: 0.3,
      system: systemPrompt,
      messages
    })
  })

  const result = await response.json()

  if (result.content && result.content[0]?.text) {
    return result.content[0].text
  }

  throw new Error('Invalid Claude response')
}

// 🧠 CONTEXT-AWARE URGENCY ENGINE - LLM-based contextual analysis
async function detectUrgencyWithContext(
  input: string,
  sessionStore: any,
  extractedInfo: any
): Promise<{
  level: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'
  protocol?: string
  actions: string[]
  pediatricFlag?: boolean
  reasoning: string
}> {

  const contextualPrompt = `You are an expert emergency medicine physician analyzing a patient interaction for urgency levels.

CRITICAL CONTEXT - USE THIS TO MAKE DECISIONS:
- Current conversation: ${JSON.stringify(sessionStore.messages?.slice(-3) || [])}
- Patient data extracted: ${JSON.stringify(extractedInfo)}
- SOAP progress: ${sessionStore.soapState ? JSON.stringify(sessionStore.soapState) : 'None'}
- Previous urgency assessments: ${sessionStore.urgencyAssessment?.level || 'None'}

NEW INPUT TO ANALYZE: "${input}"

CONTEXTUAL REASONING RULES - CRITICAL FOR ACCURACY:
1. "Mi papá murió de infarto" = FAMILY HISTORY (not current emergency)
2. "Me duele el pecho ahora" = CURRENT SYMPTOM (potential emergency)
3. "El doctor dijo que era infarto" = PAST DIAGNOSIS (not current emergency)
4. "Mi vecina dice que le duele el pecho" = THIRD PARTY STORY (not current emergency)
5. "Cuando a ella le da dolor..." = SOMEONE ELSE'S SYMPTOMS (not patient)
6. Multiple symptoms in SAME PATIENT = SYNDROME CLUSTER (higher urgency)
7. Age + symptom severity = RISK STRATIFICATION

WHO IS THE PATIENT? CRITICAL DISTINCTION:
- "ME duele" / "TENGO dolor" = PATIENT SYMPTOMS → Assess urgency
- "Mi vecina/mamá/amigo tiene..." = OTHER PERSON → Usually LOW urgency (unless asking for someone present)
- "¿Qué opina de...?" = MEDICAL QUESTION → Usually LOW urgency

Return JSON:
{
  "level": "CRITICAL|HIGH|MODERATE|LOW",
  "protocol": "specific protocol name or null",
  "actions": ["array of immediate actions"],
  "pediatricFlag": boolean,
  "reasoning": "detailed contextual analysis explaining WHY this urgency level"
}

PROTOCOLS:
- CRITICAL: Life-threatening (MI, stroke, sepsis, respiratory failure)
- HIGH: Urgent but stable (hypertensive crisis, severe pain, pediatric fever >39°C)
- MODERATE: Important but can wait (chronic pain flare, medication questions)
- LOW: Information, family history, casual conversation`

  try {
    const response = await callClaude(contextualPrompt, input)

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
      reasoning: result.reasoning || 'No reasoning provided'
    }
  } catch (error) {
    console.error('Context-aware urgency detection failed:', error)
    // Fallback to basic assessment
    return {
      level: extractedInfo.symptoms?.length > 0 ? 'MODERATE' : 'LOW',
      actions: [],
      reasoning: `LLM context analysis failed: ${error.message}. Using basic fallback.`
    }
  }
}

// 📊 MICRO-PARSER de entidades médicas para Redux granular
function parseMedicalEntities(text: string): {
  vitalSigns: { type: string, value: string }[]
  symptoms: string[]
  duration: string | null
  severity: string | null
} {
  const entities = {
    vitalSigns: [] as { type: string, value: string }[],
    symptoms: [] as string[],
    duration: null as string | null,
    severity: null as string | null
  }

  // Signos vitales
  const bpMatch = text.match(/(\d{2,3})[\/x](\d{2,3})/)
  if (bpMatch) entities.vitalSigns.push({ type: 'PA', value: `${bpMatch[1]}/${bpMatch[2]}` })

  const tempMatch = text.match(/(\d{2,3})[.,]?(\d)?.*°?[CF]?.*fiebre|fiebre.*(\d{2,3})[.,]?(\d)?/)
  if (tempMatch) entities.vitalSigns.push({ type: 'TEMP', value: tempMatch[1] || tempMatch[3] })

  const fcMatch = text.match(/(\d{2,3}).*latidos|frecuencia.*(\d{2,3})/)
  if (fcMatch) entities.vitalSigns.push({ type: 'FC', value: fcMatch[1] || fcMatch[2] })

  // Duración temporal
  const durationMatch = text.match(/desde hace (\d+.*?(?:día|hora|semana|mes))|hace (\d+.*?(?:día|hora|semana|mes))|desde.*?(\w+)\s+pasado/)
  if (durationMatch) entities.duration = durationMatch[1] || durationMatch[2] || durationMatch[3]

  return entities
}

// 🎯 VALIDADOR AMIGABLE
async function validateInput(input: string): Promise<{
  isValid: boolean
  category: string
  message: string
  extractedInfo?: any
}> {
  const systemPrompt = `You are a medical input validator. Analyze the input and respond in Spanish.

Return a JSON object:
{
  "isValid": true/false,
  "category": "greeting|partial_medical|valid_medical|mixed|follow_up",
  "message": "Personalized response in Spanish",
  "extractedInfo": {
    "age": number or null,
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
      message: 'No pude procesar tu mensaje. ¿Podrías reformularlo?'
    }
  }
}

// 🏥 PROCESADOR MÉDICO PRINCIPAL
async function processMedicalQuery(
  input: string,
  sessionData: any
): Promise<string> {
  const systemPrompt = `You are an advanced medical AI assistant. You have access to the patient's conversation history and extracted information.

Patient Information:
${JSON.stringify(sessionData.patientInfo, null, 2)}

Previous Diagnostic State:
${JSON.stringify(sessionData.diagnosticState, null, 2)}

INSTRUCTIONS:
1. Provide a comprehensive medical response in Spanish
2. If information is complete, provide differential diagnosis
3. Suggest treatment plans when appropriate
4. Maintain context from previous messages
5. Be professional but empathetic
6. Ask for missing critical information when needed

Remember: You're helping a medical professional, so be thorough and precise.`

  const conversationHistory = sessionData.messages.map((m: any) => ({
    role: m.role,
    content: m.content
  }))

  return await callClaude(systemPrompt, input, conversationHistory)
}

export async function POST(req: NextRequest) {
  try {
    const { sessionId, message } = await req.json()

    // Obtener o crear sesión con estado SOAP y acciones Redux
    let session = reduxStore.get(sessionId)

    if (!session) {
      session = {
        sessionId,
        messages: [],
        patientInfo: {},
        diagnosticState: {},
        soapState: {},
        actionHistory: []
      }
      // Guardar la nueva sesión antes de despachar acciones
      reduxStore.set(sessionId, session)

      // Ahora sí despachar acción de inicio
      dispatchAction(sessionId, {
        type: ActionTypes.SESSION_INIT,
        payload: { sessionId, timestamp: new Date() }
      })
    }

    console.log(`🧠 Redux Brain - Session: ${sessionId}`)
    console.log(`📥 Input: "${message}"`)

    // Despachar acción de mensaje recibido
    dispatchAction(sessionId, {
      type: ActionTypes.MESSAGE_RECEIVED,
      payload: { message, role: 'user' }
    })

    // PASO 1: Validación con extracción de información
    const validation = await validateInput(message)
    console.log(`✅ Validation:`, validation)

    // Despachar acción de validación completada
    dispatchAction(sessionId, {
      type: ActionTypes.VALIDATION_COMPLETED,
      payload: { isValid: validation.isValid, category: validation.category }
    })

    // Actualizar información del paciente si hay nueva data
    if (validation.extractedInfo) {
      session.patientInfo = {
        ...session.patientInfo,
        ...validation.extractedInfo
      }

      // 📊 MICRO-REDUX: Parse entidades médicas granularmente
      const entities = parseMedicalEntities(message)

      // Despachar micro-acciones por cada entidad detectada
      entities.vitalSigns.forEach(vital => {
        dispatchAction(sessionId, {
          type: ActionTypes.VITAL_SIGN_DETECTED,
          payload: { type: vital.type, value: vital.value }
        })
      })

      validation.extractedInfo.symptoms?.forEach(symptom => {
        dispatchAction(sessionId, {
          type: ActionTypes.SYMPTOM_PARSED,
          payload: { symptom, severity: entities.severity }
        })
      })

      // 🚨 CONTEXT-AWARE URGENCY DETECTION - Análisis contextual con LLM
      const urgency = await detectUrgencyWithContext(
        message,
        session,
        validation.extractedInfo
      )

      // Despachar alerta de urgencia si es crítica
      if (urgency.level === 'CRITICAL' || urgency.level === 'HIGH') {
        dispatchAction(sessionId, {
          type: ActionTypes.URGENCY_DETECTED,
          payload: {
            level: urgency.level,
            protocol: urgency.protocol,
            actions: urgency.actions,
            isPediatric: urgency.pediatricFlag
          }
        })

        // Si hay protocolo específico, activarlo
        if (urgency.protocol) {
          dispatchAction(sessionId, {
            type: ActionTypes.PROTOCOL_ACTIVATED,
            payload: { protocol: urgency.protocol, actions: urgency.actions }
          })
        }

        // Flag crítico para casos que requieren intervención inmediata
        if (urgency.level === 'CRITICAL') {
          dispatchAction(sessionId, {
            type: ActionTypes.CRITICAL_FLAG,
            payload: { protocol: urgency.protocol, reason: 'VIDA_EN_RIESGO' }
          })
        }
      }

      // 👶 PEDIATRIC PROTOCOLS - Flags especiales para menores
      if (validation.extractedInfo.age && validation.extractedInfo.age < 18) {
        dispatchAction(sessionId, {
          type: ActionTypes.PEDIATRIC_ALERT,
          payload: {
            age: validation.extractedInfo.age,
            pesoEstimado: validation.extractedInfo.age * 3 + 7,
            requiereAdultoResponsable: true
          }
        })

        // Calcular peso estimado para dosificación
        if (urgency.pediatricFlag) {
          dispatchAction(sessionId, {
            type: ActionTypes.WEIGHT_CALCULATION,
            payload: {
              pesoEstimado: validation.extractedInfo.age * 3 + 7,
              formula: 'PEDIATRICA_STANDAR'
            }
          })
        }
      }

      // Guardar detección de urgencia en sesión
      session.urgencyAssessment = urgency

      // Actualizar SOAP Subjetivo con nueva información
      if (validation.extractedInfo.symptoms?.length) {
        session.soapState.subjetivo = `Paciente refiere: ${validation.extractedInfo.symptoms.join(', ')}`
        dispatchAction(sessionId, {
          type: ActionTypes.SOAP_S_UPDATED,
          payload: { subjetivo: session.soapState.subjetivo }
        })
      }

      // Actualizar SOAP Objetivo si hay datos objetivos
      if (validation.extractedInfo.age || validation.extractedInfo.gender) {
        session.soapState.objetivo = `${validation.extractedInfo.gender || 'Paciente'} de ${validation.extractedInfo.age || 'edad no especificada'} años`
        dispatchAction(sessionId, {
          type: ActionTypes.SOAP_O_UPDATED,
          payload: { objetivo: session.soapState.objetivo }
        })
      }
    }

    // Agregar mensaje del usuario
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
      validated: validation.isValid,
      category: validation.category
    })

    let responseMessage = ''

    // PASO 2: Procesar según categoría
    if (!validation.isValid) {
      // Respuesta amigable para saludos o info incompleta
      responseMessage = validation.message
    } else {
      // Procesar consulta médica completa
      responseMessage = await processMedicalQuery(message, session)

      // Actualizar SOAP Análisis si hay diagnóstico
      if (responseMessage.includes('diagnóstico')) {
        session.soapState.analisis = 'Diagnóstico diferencial procesado'
        session.diagnosticState.differentialDiagnosis = ['IAM', 'Angina inestable', 'Otros']

        dispatchAction(sessionId, {
          type: ActionTypes.SOAP_A_UPDATED,
          payload: { analisis: session.soapState.analisis }
        })

        dispatchAction(sessionId, {
          type: ActionTypes.DIAGNOSIS_GENERATED,
          payload: { differentialDiagnosis: session.diagnosticState.differentialDiagnosis }
        })
      }

      // Actualizar SOAP Plan si hay tratamiento
      if (responseMessage.includes('tratamiento') || responseMessage.includes('recomendar')) {
        session.soapState.plan = 'Plan terapéutico definido'

        dispatchAction(sessionId, {
          type: ActionTypes.SOAP_P_UPDATED,
          payload: { plan: session.soapState.plan }
        })
      }
    }

    // Agregar respuesta del asistente
    session.messages.push({
      role: 'assistant',
      content: responseMessage,
      timestamp: new Date(),
      validated: true,
      category: 'response'
    })

    // Despachar acción de respuesta generada
    dispatchAction(sessionId, {
      type: ActionTypes.RESPONSE_GENERATED,
      payload: { messageLength: responseMessage.length }
    })

    // Guardar sesión actualizada
    reduxStore.set(sessionId, session)

    // Respuesta completa con metadatos y flujo Redux completo
    return NextResponse.json({
      success: true,
      sessionId,
      message: responseMessage,
      validation,
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
        soapProgress: calculateSOAPProgress(session.soapState)
      },
      reduxFlow: {
        totalActions: session.actionHistory.length,
        recentActions: session.actionHistory.slice(-5).map(a => ({
          type: a.type,
          timestamp: a.timestamp,
          phase: a.stateSnapshot.currentPhase,
          soapProgress: a.stateSnapshot.soapProgress
        })),
        stateEvolution: {
          initialState: session.actionHistory[0]?.stateSnapshot,
          currentState: session.actionHistory[session.actionHistory.length - 1]?.stateSnapshot
        }
      },
      // 🚨 URGENCY ASSESSMENT - Información crítica para decisiones médicas
      urgencyAssessment: {
        ...session.urgencyAssessment || { level: 'LOW', actions: [] },
        reasoning: session.urgencyAssessment?.reasoning || 'No contextual analysis performed'
      },
      reduxState: {
        storeSize: reduxStore.size,
        activeSession: sessionId,
        totalMessages: session.messages.length,
        actionCount: session.actionHistory.length,
        // Flags críticos para alertas
        hasCriticalUrgency: session.urgencyAssessment?.level === 'CRITICAL',
        pediatricCase: session.patientInfo.age ? session.patientInfo.age < 18 : false,
        protocolsActivated: session.actionHistory.filter(a => a.type === ActionTypes.PROTOCOL_ACTIVATED).length
      }
    })

  } catch (error) {
    console.error('❌ Redux Brain Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
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
      lastMessage: session.messages[session.messages.length - 1]
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
        message: 'your medical query'
      }
    },
    testCommands: [
      `curl -X POST http://localhost:3002/api/redux-brain -H "Content-Type: application/json" -d '{"sessionId":"test-1","message":"hola"}'`,
      `curl -X POST http://localhost:3002/api/redux-brain -H "Content-Type: application/json" -d '{"sessionId":"test-1","message":"mi hijo tiene fiebre"}'`,
      `curl -X POST http://localhost:3002/api/redux-brain -H "Content-Type: application/json" -d '{"sessionId":"test-1","message":"tiene 5 años, la fiebre es de 39 grados desde ayer"}'`
    ]
  })
}