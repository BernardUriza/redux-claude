# API Documentation - Redux Brain Medical AI

> **Version**: 1.0.1 | **Last Updated**: 2025-01-16 | **Auto-generated**

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Main Endpoints](#main-endpoints)
4. [Request/Response Examples](#requestresponse-examples)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [WebSocket Support](#websocket-support)

---

## Overview

The Redux Brain Medical AI API provides intelligent medical decision support through a RESTful interface. All endpoints follow REST conventions and return JSON responses.

### Base URL

```
Development: http://localhost:3100/api
Production: https://your-domain.com/api
```

### Content Type

All requests must include:
```
Content-Type: application/json
```

---

## Authentication

Currently, the API uses environment-based authentication via the `ANTHROPIC_API_KEY`. Client authentication is planned for v2.0.

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | Claude API key from Anthropic | Yes |
| `CLAUDE_API_KEY` | Alternative key name (fallback) | No |

---

## Main Endpoints

### 1. Redux Brain - Complete Medical AI System

**Endpoint**: `POST /api/redux-brain`

The main medical AI endpoint with complete Redux-like state management, SOAP generation, and urgency detection.

#### Request

```typescript
interface ReduxBrainRequest {
  sessionId: string  // Unique session identifier
  message: string    // User medical query
}
```

#### Response

```typescript
interface ReduxBrainResponse {
  success: boolean
  sessionId: string
  message: string  // AI response
  validation: {
    isValid: boolean
    category: 'greeting' | 'partial_medical' | 'valid_medical' | 'mixed' | 'follow_up'
    message: string
    extractedInfo?: {
      age: number | null
      gender: string | null
      symptoms: string[]
      duration: string | null
      medicalHistory?: string[]
    }
  }
  soapState: {
    subjetivo?: string
    objetivo?: string
    analisis?: string
    plan?: string
  }
  sessionData: {
    messageCount: number
    patientInfo: PatientInfo
    soapState: SOAPState
    hasCompleteInfo: boolean
    currentPhase: string
    soapProgress: number  // 0-100%
  }
  urgencyAssessment: {
    level: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'
    protocol?: string
    actions: string[]
    pediatricFlag?: boolean
    reasoning: string
  }
  reduxFlow: {
    totalActions: number
    recentActions: Array<{
      type: string
      timestamp: Date
      phase: string
      soapProgress: number
    }>
    stateEvolution: {
      initialState: StateSnapshot
      currentState: StateSnapshot
    }
  }
  reduxState: {
    storeSize: number
    activeSession: string
    totalMessages: number
    actionCount: number
    hasCriticalUrgency: boolean
    pediatricCase: boolean
    protocolsActivated: number
  }
}
```

#### Example Request

```bash
curl -X POST http://localhost:3100/api/redux-brain \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "patient-123",
    "message": "Tengo dolor de pecho y dificultad para respirar"
  }'
```

---

### 2. Medical Validator

**Endpoint**: `POST /api/medical-validator`

Validates and extracts medical information from user input.

#### Request

```typescript
interface MedicalValidatorRequest {
  message: string  // Input to validate
}
```

#### Response

```typescript
interface MedicalValidatorResponse {
  isValid: boolean
  category: string
  extractedData?: {
    age?: number
    gender?: string
    symptoms?: string[]
    duration?: string
    medicalHistory?: string[]
  }
  suggestions?: string[]
}
```

---

### 3. Claude Direct Integration

**Endpoint**: `POST /api/claude`

Direct access to Claude AI for general queries (not medical-specific).

#### Request

```typescript
interface ClaudeRequest {
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
  stream?: boolean  // Enable streaming responses
}
```

#### Response (Non-streaming)

```typescript
interface ClaudeResponse {
  content: string
  usage?: {
    input_tokens: number
    output_tokens: number
  }
}
```

---

### 4. Cognitive Engine

**Endpoint**: `POST /api/cognitive`

Access to the cognitive processing engine with agent orchestration.

#### Request

```typescript
interface CognitiveRequest {
  query: string
  context?: {
    sessionId?: string
    agentPreferences?: string[]
    urgencyOverride?: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'
  }
}
```

#### Response

```typescript
interface CognitiveResponse {
  result: string
  agents: Array<{
    name: string
    confidence: number
    contribution: string
  }>
  processingTime: number
}
```

---

### 5. Debug Endpoint

**Endpoint**: `POST /api/debug`

Development endpoint for testing and debugging.

#### Request

```typescript
interface DebugRequest {
  action: 'clear_sessions' | 'get_metrics' | 'test_agents'
  params?: any
}
```

#### Response

```typescript
interface DebugResponse {
  success: boolean
  data: any
  timestamp: Date
}
```

---

### 6. Test Validator

**Endpoint**: `POST /api/test-validator`

Test endpoint for validation logic testing.

#### Request

```typescript
interface TestValidatorRequest {
  testCase: string
  expectedResult?: any
}
```

---

## Request/Response Examples

### Complete Medical Consultation Flow

#### 1. Initial Greeting

```bash
curl -X POST http://localhost:3100/api/redux-brain \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test-1","message":"hola"}'
```

Response:
```json
{
  "success": true,
  "message": "¡Hola! Soy tu asistente médico virtual...",
  "validation": {
    "isValid": false,
    "category": "greeting"
  },
  "soapProgress": 0
}
```

#### 2. Symptom Description

```bash
curl -X POST http://localhost:3100/api/redux-brain \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test-1","message":"tengo fiebre de 39 grados desde ayer"}'
```

Response:
```json
{
  "success": true,
  "message": "Entiendo que tienes fiebre alta...",
  "validation": {
    "isValid": true,
    "category": "valid_medical",
    "extractedInfo": {
      "symptoms": ["fever"],
      "duration": "since yesterday"
    }
  },
  "urgencyAssessment": {
    "level": "HIGH",
    "actions": ["Monitor temperature", "Hydration"]
  },
  "soapProgress": 25
}
```

#### 3. Patient Information

```bash
curl -X POST http://localhost:3100/api/redux-brain \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test-1","message":"tengo 35 años, soy mujer, sin antecedentes"}'
```

Response:
```json
{
  "success": true,
  "message": "Gracias por la información...",
  "validation": {
    "extractedInfo": {
      "age": 35,
      "gender": "female",
      "medicalHistory": []
    }
  },
  "soapState": {
    "subjetivo": "Paciente de 35 años con fiebre...",
    "objetivo": "Pending examination"
  },
  "soapProgress": 50
}
```

---

## Error Handling

### Error Response Format

```typescript
interface ErrorResponse {
  success: false
  error: string
  code?: string
  details?: any
  suggestions?: string[]
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `INVALID_INPUT` | Malformed request data | 400 |
| `VALIDATION_FAILED` | Input validation failed | 400 |
| `API_KEY_MISSING` | No API key configured | 401 |
| `RATE_LIMITED` | Too many requests | 429 |
| `INTERNAL_ERROR` | Server error | 500 |
| `CLAUDE_ERROR` | Claude API error | 502 |

### Example Error Response

```json
{
  "success": false,
  "error": "API key not configured",
  "code": "API_KEY_MISSING",
  "suggestions": [
    "Configure ANTHROPIC_API_KEY in environment variables"
  ]
}
```

---

## Rate Limiting

### Current Limits

- **Development**: No rate limiting
- **Production**: 100 requests per minute per IP
- **Claude API**: Subject to Anthropic's rate limits

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1673884800
```

---

## WebSocket Support

### Coming in v2.0

WebSocket support for real-time streaming is planned:

```javascript
// Future implementation
const ws = new WebSocket('wss://api.example.com/medical-stream')

ws.on('message', (data) => {
  const { type, content } = JSON.parse(data)
  if (type === 'soap_update') {
    // Handle progressive SOAP updates
  }
})
```

---

## Testing the API

### Using the Test Suite

```bash
# Run API tests
npm run test:api

# Test specific endpoint
npm run test:api -- --grep "redux-brain"
```

### Postman Collection

Import the Postman collection from:
```
/documentation/postman/Redux_Brain_Medical_AI.postman_collection.json
```

### Health Check

```bash
# Check API status
curl http://localhost:3100/api/redux-brain
```

Response:
```json
{
  "service": "Redux Brain API",
  "description": "Complete medical consultation system",
  "activeSessions": 5,
  "usage": {
    "endpoint": "POST /api/redux-brain",
    "payload": {
      "sessionId": "unique-session-id",
      "message": "your medical query"
    }
  }
}
```

---

## Best Practices

### 1. Session Management

- Use consistent `sessionId` for conversation continuity
- Sessions persist for 24 hours
- Maximum 100 messages per session

### 2. Input Sanitization

- API automatically sanitizes input
- HTML tags are stripped
- Unicode is normalized

### 3. Error Handling

```javascript
try {
  const response = await fetch('/api/redux-brain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, message })
  })

  if (!response.ok) {
    const error = await response.json()
    console.error('API Error:', error)
  }

  const data = await response.json()
  // Process response
} catch (error) {
  console.error('Network error:', error)
}
```

### 4. Streaming Responses

For long responses, consider implementing client-side streaming:

```javascript
const response = await fetch('/api/claude', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages, stream: true })
})

const reader = response.body.getReader()
const decoder = new TextDecoder()

while (true) {
  const { done, value } = await reader.read()
  if (done) break

  const chunk = decoder.decode(value)
  // Process streaming chunk
}
```

---

## Changelog

### v1.0.1 (Current)
- Redux Brain endpoint with complete state management
- SOAP generation and urgency detection
- 13 medical agents integration
- Anti-telenovela context detection

### v1.0.0
- Initial release
- Basic medical validation
- Claude integration

---

**Generated**: 2025-01-16
**Maintained by**: Bernard Orozco
**License**: ISC