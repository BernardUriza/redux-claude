// Netlify Function for Redux Brain API - Minimal size version
// No external dependencies to keep size under 250MB limit

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        service: '🧠 Redux Brain API',
        description: 'Complete medical consultation system with Redux-like state management',
        usage: {
          endpoint: 'POST /.netlify/functions/redux-brain',
          payload: {
            sessionId: 'unique-session-id',
            message: 'your medical query'
          }
        }
      })
    };
  }

  try {
    // Parse the request body
    const { sessionId, message } = JSON.parse(event.body);

    // Get API key from environment
    const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      console.error('No API key configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'API key not configured. Please set ANTHROPIC_API_KEY in Netlify environment variables.'
        })
      };
    }

    // Simple validation
    const validation = validateInput(message);

    // Call Claude API directly
    const claudeResponse = await callClaude(apiKey, message, validation);

    // Return response
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        sessionId,
        message: claudeResponse,
        validation,
        urgencyAssessment: {
          level: detectUrgencyLevel(message),
          actions: []
        },
        sessionData: {
          soapProgress: 25,
          currentPhase: 'ANAMNESIS',
          hasCompleteInfo: false
        }
      })
    };

  } catch (error) {
    console.error('Netlify Function Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};

// Helper function to validate input
function validateInput(input) {
  const medicalKeywords = [
    'dolor', 'fiebre', 'tos', 'mareo', 'náusea', 'vómito',
    'sangre', 'pecho', 'cabeza', 'abdomen', 'espalda',
    'medicamento', 'alergia', 'síntoma', 'enfermedad'
  ];

  const lowerInput = input.toLowerCase();
  const hasMedicalContent = medicalKeywords.some(keyword => lowerInput.includes(keyword));

  return {
    isValid: hasMedicalContent,
    category: hasMedicalContent ? 'valid_medical' : 'greeting',
    message: hasMedicalContent
      ? 'Procesando consulta médica...'
      : 'Hola! ¿En qué puedo ayudarte con tu consulta médica?'
  };
}

// Helper function to detect urgency level
function detectUrgencyLevel(input) {
  const lowerInput = input.toLowerCase();

  // Critical keywords
  if (lowerInput.includes('dolor') && lowerInput.includes('pecho')) return 'CRITICAL';
  if (lowerInput.includes('infarto') || lowerInput.includes('stroke')) return 'CRITICAL';
  if (lowerInput.includes('bebé') && lowerInput.includes('fiebre')) return 'CRITICAL';

  // High urgency
  if (lowerInput.includes('sangre') || lowerInput.includes('hemorragia')) return 'HIGH';
  if (lowerInput.includes('fractura') || lowerInput.includes('hueso')) return 'HIGH';

  // Moderate - third party reports
  if (lowerInput.includes('mi vecina') || lowerInput.includes('mi amigo')) return 'MODERATE';
  if (lowerInput.includes('dice que')) return 'MODERATE';

  // Default to LOW
  return 'LOW';
}

// Helper function to call Claude API using https module
async function callClaude(apiKey, message, validation) {
  const https = require('https');

  const systemPrompt = `Eres un asistente médico avanzado. Responde en español de manera profesional y empática.

  REGLAS IMPORTANTES:
  1. Si se menciona dolor de pecho con irradiación al brazo, considera INFARTO.
  2. Si se menciona sepsis + dolor abdominal + hipertensión, considera DISECCIÓN AÓRTICA.
  3. Si es un bebé menor de 3 meses con fiebre, es CRÍTICO.
  4. Diferencia entre paciente directo y terceros (vecina, amigo).

  Contexto de validación: ${JSON.stringify(validation)}
  `;

  const postData = JSON.stringify({
    model: 'claude-3-haiku-20240307',
    max_tokens: 1500,
    temperature: 0.3,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: message
      }
    ]
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.content && result.content[0]?.text) {
            resolve(result.content[0].text);
          } else {
            resolve('Entiendo tu consulta. Para brindarte una mejor asistencia médica, ¿podrías proporcionar más detalles sobre los síntomas?');
          }
        } catch (error) {
          console.error('Parse error:', error);
          resolve('Disculpa, hubo un problema al procesar tu consulta. Por favor, intenta nuevamente.');
        }
      });
    });

    req.on('error', (error) => {
      console.error('Request error:', error);
      resolve('Disculpa, hubo un problema al procesar tu consulta. Por favor, intenta nuevamente.');
    });

    req.write(postData);
    req.end();
  });
}