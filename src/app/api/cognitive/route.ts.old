// 🚀 COGNITIVE AI BACKEND API - Bernard Orozco 2025
// API simplificada para probar el validador médico y la arquitectura cognitiva

import { NextRequest, NextResponse } from 'next/server'
import {
  validateMedicalInput,
  generateRejectionMessage,
  decisionEngineService,
  ClaudeAdapter
} from '@redux-claude/cognitive-core'

// Store de sesiones (en producción usarías Redis o similar)
const sessions = new Map<string, {
  id: string
  messages: Array<{ role: 'user' | 'assistant', content: string }>
  createdAt: Date
  lastActivity: Date
}>()

// 🎯 POST /api/cognitive - Endpoint principal
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      action,
      input,
      sessionId,
      options = {}
    } = body

    console.log('🧠 Cognitive API Request:', { action, sessionId })

    switch (action) {
      // 🔍 VALIDACIÓN MÉDICA
      case 'validate': {
        const validationResult = await validateMedicalInput(input)
        const message = !validationResult.isValid
          ? generateRejectionMessage(validationResult)
          : 'Valid medical input'

        return NextResponse.json({
          action: 'validate',
          input,
          result: validationResult,
          message,
          timestamp: new Date().toISOString()
        })
      }

      // 💬 CHAT MÉDICO SIMPLIFICADO
      case 'chat': {
        // 1. Validar input primero
        const validationResult = await validateMedicalInput(input)

        if (!validationResult.isValid) {
          return NextResponse.json({
            action: 'chat',
            input,
            validation: validationResult,
            message: generateRejectionMessage(validationResult),
            needsMoreInfo: true,
            timestamp: new Date().toISOString()
          })
        }

        // 2. Usar Claude directamente para procesar el chat médico
        const claudeAdapter = new ClaudeAdapter()
        const systemPrompt = `You are an intelligent medical assistant specialized in providing comprehensive medical consultation.

Analyze the medical input and provide a helpful, professional response in Spanish.

Focus on:
- Differential diagnosis
- Clinical recommendations
- Important considerations
- When to seek immediate medical attention if applicable

Be thorough but concise. Always maintain a professional medical tone.`

        const response = await claudeAdapter.callClaude(
          systemPrompt,
          input
        )

        // 3. Actualizar sesión si existe
        if (sessionId && sessions.has(sessionId)) {
          const session = sessions.get(sessionId)!
          session.messages.push({ role: 'user', content: input })
          if (response.success && response.content) {
            session.messages.push({ role: 'assistant', content: response.content })
          }
          session.lastActivity = new Date()
        }

        return NextResponse.json({
          action: 'chat',
          input,
          response: response.content,
          success: response.success,
          sessionId,
          timestamp: new Date().toISOString()
        })
      }

      // 🔄 CREAR/OBTENER SESIÓN
      case 'session': {
        const newSessionId = sessionId || `session-${Date.now()}`

        if (!sessions.has(newSessionId)) {
          sessions.set(newSessionId, {
            id: newSessionId,
            messages: [],
            createdAt: new Date(),
            lastActivity: new Date()
          })
        }

        const session = sessions.get(newSessionId)!

        return NextResponse.json({
          action: 'session',
          sessionId: newSessionId,
          session: {
            ...session,
            messageCount: session.messages.length
          },
          timestamp: new Date().toISOString()
        })
      }

      // 🧪 TEST RÁPIDO DEL VALIDADOR
      case 'test-validator': {
        const testInputs = [
          'hola',
          'buenos días',
          'tengo dolor',
          'me duele la cabeza',
          'hola, mi hijo tiene fiebre',
          'mujer de 45 años con dolor torácico'
        ]

        const results = []

        for (const testInput of testInputs) {
          const validation = await validateMedicalInput(testInput)
          results.push({
            input: testInput,
            valid: validation.isValid,
            category: validation.validationCategory,
            message: !validation.isValid ? generateRejectionMessage(validation) : 'Valid'
          })
        }

        return NextResponse.json({
          action: 'test-validator',
          results,
          timestamp: new Date().toISOString()
        })
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('❌ Cognitive API error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// 🔍 GET /api/cognitive - Información del API
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const info = searchParams.get('info')

  if (info === 'sessions') {
    return NextResponse.json({
      activeSessions: sessions.size,
      sessions: Array.from(sessions.entries()).map(([id, session]) => ({
        id,
        messageCount: session.messages.length,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity
      }))
    })
  }

  return NextResponse.json({
    service: '🧠 Cognitive AI Backend API',
    version: '2025.1.0',
    status: 'operational',
    author: 'Bernard Orozco',
    endpoints: {
      'POST /api/cognitive': {
        actions: {
          validate: 'Validate medical input with personalized responses',
          chat: 'Full medical chat with validation',
          session: 'Create or get session',
          'test-validator': 'Test validator with multiple inputs'
        },
        examples: {
          validate: {
            action: 'validate',
            input: 'hola'
          },
          chat: {
            action: 'chat',
            input: 'mujer de 45 años con dolor torácico',
            sessionId: 'optional-session-id'
          },
          testValidator: {
            action: 'test-validator'
          }
        }
      },
      'GET /api/cognitive': {
        params: {
          info: 'sessions'
        }
      }
    },
    architecture: 'Redux + LLM Paradigm'
  })
}