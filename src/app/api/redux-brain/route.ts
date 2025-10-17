// 🧠 REDUX BRAIN API - Demo/Example Implementation
// Bernard Orozco 2025 - Shows how to use the NPM package
// This is JUST AN EXAMPLE - devs can implement their own storage

import { NextRequest, NextResponse } from 'next/server'
import { MedicalProcessor } from '@redux-claude/cognitive-core'
import type { MedicalContext } from '@redux-claude/cognitive-core'
import { logger } from '@/lib/logger'
import { sanitizeInput, validateMedicalInput } from '@/lib/textUtils'
import {
  sessionManager,
  type SessionData,
} from '@/services/redux-brain/SessionManager'

// 📊 CONSTANTS
const ADULT_AGE_THRESHOLD = 18
const RECENT_ACTIONS_COUNT = 5

// Tipos de acciones Redux (como en un store real)
enum ActionTypes {
  SESSION_INIT = 'SESSION_INIT',
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
  RESPONSE_GENERATED = 'RESPONSE_GENERATED',
  URGENCY_DETECTED = 'URGENCY_DETECTED',
  PROTOCOL_ACTIVATED = 'PROTOCOL_ACTIVATED',
}

// Initialize the medical processor (from NPM package)
const processor = new MedicalProcessor({
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: 'claude-3-haiku-20240307',
  debugMode: false,
})

// Helper function to track Redux actions (demo purposes)
function dispatchAction(
  sessionId: string,
  action: { type: string; payload: Record<string, unknown> }
) {
  const session = sessionManager.get(sessionId)
  if (!session) return

  session.actionHistory.push({
    type: action.type,
    payload: action.payload,
    timestamp: new Date(),
    stateSnapshot: {
      messageCount: session.messages.length,
      hasPatientInfo: !!(session.patientInfo.age && session.patientInfo.symptoms?.length),
      soapProgress: calculateSOAPProgress(session.soapState),
      currentPhase: 'PROCESSING',
    },
  })

  sessionManager.update(sessionId, session)

  logger.reduxAction({
    type: action.type,
    payload: action.payload,
    sessionId,
  })
}

// Calculate SOAP progress (simple version for demo)
function calculateSOAPProgress(soapState: any): number {
  let score = 0
  if (soapState?.subjetivo && !soapState.subjetivo.includes('Pendiente')) score += 25
  if (soapState?.objetivo && !soapState.objetivo.includes('Pendiente')) score += 25
  if (soapState?.analisis && !soapState.analisis.includes('Pendiente')) score += 25
  if (soapState?.plan && !soapState.plan.includes('Pendiente')) score += 25
  return score
}

/**
 * POST /api/redux-brain/
 *
 * This is a DEMO IMPLEMENTATION showing how to use the MedicalProcessor package.
 * Devs can implement their own storage (Redux, Zustand, MongoDB, etc.)
 */
export async function POST(req: NextRequest) {
  try {
    const { sessionId, message, clientSessionData } = await req.json()

    // 🔒 SANITIZE INPUT
    const sanitizedMessage = sanitizeInput(message?.trim() || '')

    if (sanitizedMessage.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Empty message',
          message: 'Por favor, escribe un mensaje',
        },
        { status: 400 }
      )
    }

    // 📋 BASIC VALIDATION (text utils)
    const inputValidation = validateMedicalInput(sanitizedMessage)
    if (!inputValidation.isValid && inputValidation.issues.length > 1) {
      logger.warn('Invalid input received', {
        sessionId,
        issues: inputValidation.issues,
      })
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          issues: inputValidation.issues,
        },
        { status: 400 }
      )
    }

    // 🔄 GET OR CREATE SESSION
    // Priority: clientSessionData (localStorage) > server memory (demo fallback)
    let session: SessionData
    const isClientSideSession = !!clientSessionData

    if (isClientSideSession) {
      // 🌐 SERVERLESS MODE: Use client-provided session data
      session = {
        sessionId,
        messages: clientSessionData.messages || [],
        patientInfo: clientSessionData.patientInfo || {},
        diagnosticState: clientSessionData.diagnosticState || {},
        soapState: clientSessionData.soapState || {},
        urgencyAssessment: clientSessionData.urgencyAssessment,
        actionHistory: clientSessionData.actionHistory || [],
        lastAccess: Date.now(),
        createdAt: clientSessionData.createdAt || Date.now(),
      }
      logger.info('Using client-side session (serverless mode)', { sessionId })
    } else {
      // 🖥️ TRADITIONAL MODE: Use server memory (demo only)
      session = sessionManager.getOrCreate(sessionId)
      logger.info('Using server-side session (demo mode)', { sessionId })
    }

    logger.info('Redux Brain session started', {
      sessionId,
      messageLength: sanitizedMessage.length,
      wasSanitized: sanitizedMessage !== message,
      isClientSideSession,
    })

    // Track action
    dispatchAction(sessionId, {
      type: ActionTypes.MESSAGE_RECEIVED,
      payload: { message: sanitizedMessage, role: 'user' },
    })

    // ⭐ USE THE NPM PACKAGE - This is the main call
    const context: MedicalContext = {
      messages: session.messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      })),
      patientInfo: session.patientInfo,
      soapState: session.soapState,
      urgencyAssessment: session.urgencyAssessment,
    }

    const result = await processor.processMessage(sanitizedMessage, context)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Processing failed',
          message: result.response,
        },
        { status: 500 }
      )
    }

    // 💬 UPDATE SESSION (demo storage)
    session.messages.push({
      role: 'user',
      content: sanitizedMessage,
      timestamp: new Date(),
      validated: true,
      category: result.validation.category,
    })

    session.messages.push({
      role: 'assistant',
      content: result.response,
      timestamp: new Date(),
      validated: true,
      category: 'response',
    })

    // Update patient info with extracted data
    session.patientInfo = {
      ...session.patientInfo,
      age: result.extracted.age ?? session.patientInfo.age,
      gender: result.extracted.gender ?? session.patientInfo.gender,
      symptoms: [...(session.patientInfo.symptoms || []), ...result.extracted.symptoms],
      duration: result.extracted.duration ?? session.patientInfo.duration,
    }

    // Update SOAP state
    session.soapState = result.soap

    // Update urgency
    session.urgencyAssessment = result.urgency

    // Track response action
    dispatchAction(sessionId, {
      type: ActionTypes.RESPONSE_GENERATED,
      payload: { messageLength: result.response.length },
    })

    // Track urgency if critical/high
    if (result.urgency.level === 'CRITICAL' || result.urgency.level === 'HIGH') {
      dispatchAction(sessionId, {
        type: ActionTypes.URGENCY_DETECTED,
        payload: {
          level: result.urgency.level,
          protocol: result.urgency.protocol,
        },
      })
    }

    // Save to demo storage
    sessionManager.update(sessionId, session)

    // 📤 RESPONSE - Return everything so client can store it
    return NextResponse.json({
      success: true,
      sessionId,
      message: result.response,
      validation: result.validation,
      soapState: result.soap,
      // Full session data for client-side persistence
      sessionData: {
        messages: session.messages,
        patientInfo: session.patientInfo,
        diagnosticState: session.diagnosticState,
        soapState: session.soapState,
        urgencyAssessment: session.urgencyAssessment,
        actionHistory: session.actionHistory,
        messageCount: session.messages.length,
        hasCompleteInfo: !!(
          session.patientInfo.age &&
          session.patientInfo.gender &&
          session.patientInfo.symptoms?.length
        ),
        currentPhase: 'PROCESSING',
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
      },
      urgencyAssessment: result.urgency,
      metadata: result.metadata,
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

/**
 * GET /api/redux-brain/
 * Health check and API info
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('sessionId')

  if (sessionId && sessionManager.has(sessionId)) {
    const session = sessionManager.get(sessionId)!
    return NextResponse.json({
      sessionId,
      messageCount: session.messages.length,
      patientInfo: session.patientInfo,
      lastMessage: session.messages[session.messages.length - 1],
    })
  }

  return NextResponse.json({
    service: '🧠 Redux Brain API - Demo Implementation',
    description:
      'Example of how to use redux-brain-medical-ai NPM package',
    package: 'redux-brain-medical-ai',
    version: '1.0.1',
    activeSessions: sessionManager.size(),
    usage: {
      endpoint: 'POST /api/redux-brain',
      payload: {
        sessionId: 'unique-session-id',
        message: 'your medical query',
        clientSessionData: {
          messages: [],
          patientInfo: {},
          soapState: {},
        },
      },
    },
    note: 'This API is just an example. Devs can implement their own storage.',
  })
}
