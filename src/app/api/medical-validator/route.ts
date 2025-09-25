// 🧪 API Endpoint para probar el validador médico
// Backend del frontend para testing - Bernard Orozco

import { NextRequest, NextResponse } from 'next/server'
import { callClaudeForDecision } from '@redux-claude/cognitive-core/src/services/decisional-middleware'
import { validateMedicalInput, generateRejectionMessage } from '@redux-claude/cognitive-core/src/utils/aiMedicalValidator'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { input } = body

    if (!input) {
      return NextResponse.json(
        { error: 'Input is required' },
        { status: 400 }
      )
    }

    console.log('🧪 Testing validator with:', input)

    // Usar el validador médico actual
    const validationResult = await validateMedicalInput(input)

    console.log('📊 Validation result:', validationResult)

    // Si no es válido, generar mensaje amigable
    let responseMessage = ''
    if (!validationResult.isValid) {
      responseMessage = generateRejectionMessage(validationResult)
    }

    return NextResponse.json({
      input,
      validation: validationResult,
      message: responseMessage,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Medical validator API error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// GET endpoint para verificar que el API está funcionando
export async function GET() {
  return NextResponse.json({
    service: 'Medical Validator API',
    status: 'operational',
    endpoints: {
      POST: '/api/medical-validator',
      description: 'Validates medical input and returns personalized responses',
      example: {
        input: 'hola'
      }
    }
  })
}