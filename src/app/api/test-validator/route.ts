// 🧪 TEST VALIDATOR API - Backend del Frontend para probar con curl
// Bernard Orozco 2025

import { NextRequest, NextResponse } from 'next/server'

// Simulación del validador para pruebas rápidas
async function testValidator(input: string) {
  const apiKey = process.env.CLAUDE_API_KEY

  if (!apiKey) {
    return {
      isValid: false,
      confidence: 0,
      rejectionReason: 'API key not configured',
      suggestedFormat: 'Configure CLAUDE_API_KEY in .env.local',
    }
  }

  try {
    // Llamada directa a Anthropic API
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        temperature: 0.3,
        system: `You are a friendly medical assistant validator. ALWAYS respond in Spanish.

Analyze the input "${input}" and return ONLY a JSON object:
{
  "is_valid": false for greetings or true for valid medical info,
  "confidence": 0.95,
  "validation_category": "greeting|partial_medical|valid_medical|mixed_greeting_medical",
  "rejection_reason": "Mensaje personalizado en ESPAÑOL basado en el input exacto",
  "suggested_format": "Guía específica en ESPAÑOL"
}

RULES:
- "hola", "buenos días", etc = greeting category, is_valid: FALSE
- "tengo dolor", "me duele" = partial_medical, is_valid: FALSE, ask for more details
- Complete medical info with age + symptoms = valid_medical, is_valid: TRUE
- Mixed greeting + medical = mixed_greeting_medical, is_valid: FALSE

For greeting "hola":
{
  "is_valid": false,
  "validation_category": "greeting",
  "rejection_reason": "¡Hola! 👋 Soy tu asistente médico virtual. Estoy aquí para ayudarte con consultas médicas.",
  "suggested_format": "Para comenzar, cuéntame sobre el paciente. Por ejemplo: 'Tengo un paciente de 45 años con dolor torácico'"
}`,
        messages: [
          {
            role: 'user',
            content: input,
          },
        ],
      }),
    })

    const result = await anthropicResponse.json()

    if (result.content && result.content[0]?.text) {
      try {
        return JSON.parse(result.content[0].text)
      } catch {
        return {
          isValid: false,
          confidence: 0.5,
          rejectionReason: 'Could not parse validation response',
          suggestedFormat: 'Please try again',
        }
      }
    }

    console.error('API response error:', result)
    return {
      isValid: false,
      confidence: 0,
      rejectionReason: result.error?.message || 'API call failed',
      suggestedFormat: 'Check API configuration',
    }
  } catch (error) {
    console.error('Fetch error:', error)
    // Fallback validation sin API
    const lowerInput = input.toLowerCase()

    // Saludos
    if (lowerInput.match(/^(hola|buenos días|buenas|hello|hi)$/)) {
      return {
        isValid: false,
        confidence: 0.95,
        validationCategory: 'greeting',
        rejectionReason:
          '¡Hola! 👋 Soy tu asistente médico virtual. Estoy aquí para ayudarte con consultas médicas.',
        suggestedFormat: `Para comenzar, cuéntame sobre el paciente. Por ejemplo:

• "Tengo un paciente de 45 años con dolor torácico"
• "Mi hijo de 5 años tiene fiebre desde ayer"
• "Soy mujer de 30 años con migraña frecuente"

¿Sobre quién necesitas consultar hoy?`,
      }
    }

    // Info médica parcial
    if (lowerInput.includes('dolor') || lowerInput.includes('duele')) {
      return {
        isValid: false,
        confidence: 0.85,
        validationCategory: 'partial_medical',
        rejectionReason: `Veo que mencionas "${input}". Para ayudarte mejor, necesito más detalles.`,
        suggestedFormat: `Por favor, comparte:
• ¿Qué edad tienes?
• ¿Dónde específicamente sientes el dolor?
• ¿Hace cuánto comenzó?
• ¿Hay otros síntomas?

Ejemplo: "Soy hombre de 40 años con dolor de espalda desde hace 3 días"`,
      }
    }

    // Mixed greeting + medical
    if (
      lowerInput.includes('hola') &&
      (lowerInput.includes('hijo') || lowerInput.includes('paciente'))
    ) {
      return {
        isValid: false,
        confidence: 0.9,
        validationCategory: 'mixed_greeting_medical',
        rejectionReason: `¡Hola! Veo que mencionas a alguien que necesita atención médica.`,
        suggestedFormat: `Para ayudarte mejor, necesito saber:
• Edad y género
• Síntomas principales
• Duración de los síntomas
• Antecedentes relevantes

Comparte los detalles disponibles y te orientaré.`,
      }
    }

    // Valid medical (simple check)
    if (
      lowerInput.match(/\d+\s*(años|meses)/) &&
      (lowerInput.includes('dolor') || lowerInput.includes('fiebre'))
    ) {
      return {
        isValid: true,
        confidence: 0.95,
        validationCategory: 'valid_medical',
      }
    }

    // Default
    return {
      isValid: false,
      confidence: 0.7,
      validationCategory: 'unclear',
      rejectionReason: 'No pude entender tu consulta.',
      suggestedFormat: 'Por favor, describe el caso médico con más detalle.',
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { input } = await req.json()

    if (!input) {
      return NextResponse.json({ error: 'Input required' }, { status: 400 })
    }

    console.log(`🧪 Testing validator with: "${input}"`)

    const result = await testValidator(input)

    return NextResponse.json({
      input,
      validation: result,
      message:
        result.rejection_reason && result.suggested_format
          ? `${result.rejection_reason}\n\n${result.suggested_format}`
          : result.is_valid
            ? '✅ Valid medical input'
            : result.rejection_reason || result.rejectionReason || 'Invalid input',
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/test-validator',
    method: 'POST',
    description: 'Test medical input validator',
    example: {
      input: 'hola',
    },
    testCurl: `curl -X POST http://localhost:3002/api/test-validator -H "Content-Type: application/json" -d '{"input":"hola"}'`,
  })
}
