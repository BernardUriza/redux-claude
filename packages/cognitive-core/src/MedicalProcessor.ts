// packages/cognitive-core/src/MedicalProcessor.ts
// 🧠 Core Medical Processing Engine - Stateless & Reusable
// Bernard Orozco 2025 - NPM Package Architecture

import { SOAPProcessor } from './soap/SOAPProcessor'
import { DefensiveMedicineValidator } from './validators/DefensiveMedicineValidator'
import { criticalPatternMiddleware } from './middleware/CriticalPatternMiddleware'

// ============================================================================
// PUBLIC TYPES - Exported for consumers
// ============================================================================

export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: Date | string
  validated?: boolean
  category?: string
}

export interface PatientInfo {
  age?: number | null
  gender?: string | null
  symptoms?: string[]
  duration?: string | null
  medicalHistory?: string[]
}

export interface SOAPState {
  subjetivo?: string
  objetivo?: string
  analisis?: string
  plan?: string
}

export interface UrgencyAssessment {
  level: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'
  protocol?: string
  actions: string[]
  pediatricFlag?: boolean
  reasoning: string
}

export interface ExtractedInfo {
  age: number | null
  gender: string | null
  symptoms: string[]
  duration: string | null
  medicalHistory?: string[]
}

export interface ValidationResult {
  isValid: boolean
  category: string
  message: string
  extractedInfo?: ExtractedInfo
}

export interface MedicalContext {
  messages: ConversationMessage[]
  patientInfo?: PatientInfo
  soapState?: SOAPState
  urgencyAssessment?: UrgencyAssessment
}

export interface MedicalResult {
  success: boolean
  response: string
  extracted: ExtractedInfo
  urgency: UrgencyAssessment
  soap: SOAPState
  validation: ValidationResult
  // Metadata for debugging
  metadata?: {
    processingTime?: number
    modelUsed?: string
    confidenceScore?: number
  }
}

export interface MedicalConfig {
  apiKey?: string
  model?: 'claude-3-haiku-20240307' | 'claude-3-5-sonnet-20241022'
  maxTokens?: number
  temperature?: number
  debugMode?: boolean
}

// ============================================================================
// MEDICAL PROCESSOR - Main Class
// ============================================================================

export class MedicalProcessor {
  private config: Required<MedicalConfig>
  private soapProcessor: SOAPProcessor
  private urgencyValidator: DefensiveMedicineValidator

  constructor(config: MedicalConfig = {}) {
    this.config = {
      apiKey: config.apiKey || process.env.ANTHROPIC_API_KEY || '',
      model: config.model || 'claude-3-haiku-20240307',
      maxTokens: config.maxTokens || 1500,
      temperature: config.temperature || 0.3,
      debugMode: config.debugMode || false,
    }

    if (!this.config.apiKey) {
      throw new Error(
        'ANTHROPIC_API_KEY is required. Pass it in config or set environment variable.'
      )
    }

    this.soapProcessor = new SOAPProcessor()
    this.urgencyValidator = new DefensiveMedicineValidator()
  }

  /**
   * 🎯 MAIN PUBLIC METHOD - Process medical message
   * This is a PURE FUNCTION - no side effects, no storage
   *
   * @param message - User input (raw text)
   * @param context - Current session context (conversation history, patient info)
   * @returns Medical analysis result - consumer decides how to store it
   */
  async processMessage(
    message: string,
    context: MedicalContext = { messages: [] }
  ): Promise<MedicalResult> {
    const startTime = Date.now()

    try {
      // 1. Input validation and entity extraction
      const validation = await this.validateInput(message)

      if (!validation.isValid) {
        return {
          success: false,
          response: validation.message,
          extracted: validation.extractedInfo || this.emptyExtractedInfo(),
          urgency: this.defaultUrgency(),
          soap: context.soapState || {},
          validation,
          metadata: {
            processingTime: Date.now() - startTime,
            modelUsed: this.config.model,
          },
        }
      }

      const extracted = validation.extractedInfo || this.emptyExtractedInfo()

      // 2. Merge extracted info with context
      const updatedPatientInfo: PatientInfo = {
        ...context.patientInfo,
        ...extracted,
      }

      // 3. Urgency assessment (uses full context)
      const urgency = await this.assessUrgency(message, {
        ...context,
        patientInfo: updatedPatientInfo,
      })

      // 4. SOAP processing
      const soap = await this.processSOAP(message, updatedPatientInfo)

      // 5. Generate medical response
      const response = await this.generateResponse(message, {
        ...context,
        patientInfo: updatedPatientInfo,
        soapState: soap,
        urgencyAssessment: urgency,
      })

      return {
        success: true,
        response,
        extracted,
        urgency,
        soap,
        validation,
        metadata: {
          processingTime: Date.now() - startTime,
          modelUsed: this.config.model,
          confidenceScore: this.calculateConfidence(soap),
        },
      }
    } catch (error) {
      return {
        success: false,
        response: 'Error processing medical query. Please try again.',
        extracted: this.emptyExtractedInfo(),
        urgency: this.defaultUrgency(),
        soap: context.soapState || {},
        validation: {
          isValid: false,
          category: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        metadata: {
          processingTime: Date.now() - startTime,
        },
      }
    }
  }

  // ============================================================================
  // PRIVATE METHODS - Internal processing
  // ============================================================================

  private async callClaude(
    systemPrompt: string,
    userMessage: string,
    conversationHistory: ConversationMessage[] = []
  ): Promise<string> {
    const messages = [
      ...conversationHistory.map(m => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user' as const, content: userMessage },
    ]

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        system: systemPrompt,
        messages,
      }),
    })

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`)
    }

    const result = await response.json()

    if (result.content && result.content[0]?.text) {
      return result.content[0].text
    }

    throw new Error('Invalid Claude response')
  }

  private async validateInput(input: string): Promise<ValidationResult> {
    const systemPrompt = `You are a medical input validator. Analyze the input and respond in Spanish.

CRITICAL AGE PARSING RULES - PEDIATRIC SAFETY:
- "X meses" = X/12 years (e.g., "2 meses" = 0.167 years, "6 meses" = 0.5 years)
- "X días" = X/365 years (e.g., "15 días" = 0.041 years)
- "X semanas" = X/52 years (e.g., "3 semanas" = 0.058 years)
- "X años" = X years (e.g., "5 años" = 5 years)
- If unclear, return null for age

Return a JSON object:
{
  "isValid": true/false,
  "category": "valid_medical|greeting|partial_medical|error",
  "message": "Personalized response in Spanish",
  "extractedInfo": {
    "age": number or null,
    "gender": "string or null",
    "symptoms": ["array of symptoms"],
    "duration": "string or null"
  }
}`

    try {
      const response = await this.callClaude(systemPrompt, input)
      return JSON.parse(response)
    } catch (error) {
      return {
        isValid: false,
        category: 'error',
        message: 'No pude procesar tu mensaje. ¿Podrías reformularlo?',
      }
    }
  }

  private async assessUrgency(
    input: string,
    context: MedicalContext
  ): Promise<UrgencyAssessment> {
    // 1. Critical pattern detection (hardcoded rules)
    const criticalPatternResult = criticalPatternMiddleware.analyzeCriticalPatterns(input)

    if (criticalPatternResult.urgencyOverride === 'critical') {
      return {
        level: 'CRITICAL',
        protocol: criticalPatternResult.patterns[0]?.name || 'Critical Pattern Protocol',
        actions: [
          '🚨 ACTIVAR CÓDIGO ROJO',
          '📞 Llamar ambulancia/911 AHORA',
          '💊 NO administrar medicamentos orales',
          '🫁 Mantener vía aérea permeable',
        ],
        pediatricFlag: context.patientInfo?.age
          ? context.patientInfo.age < 18
          : false,
        reasoning: `🚨 CRITICAL PATTERN OVERRIDE: ${criticalPatternResult.patterns.map(p => p.name).join(', ')}. ${criticalPatternResult.widowMakerAlert ? '💀 WIDOW MAKER RISK DETECTED' : ''}`,
      }
    }

    // 2. Defensive medicine validation
    const urgentPatterns = this.urgencyValidator.identifyUrgentPatterns(input)
    const overallUrgency = this.urgencyValidator.calculateOverallUrgency(urgentPatterns)

    if (overallUrgency.level === 'critical' || overallUrgency.level === 'high') {
      return {
        level: overallUrgency.level === 'critical' ? 'CRITICAL' : 'HIGH',
        protocol:
          urgentPatterns.length > 0
            ? urgentPatterns[0].criticalDifferentials[0]
            : 'Emergency Protocol',
        actions: overallUrgency.immediateActions,
        pediatricFlag: context.patientInfo?.age ? context.patientInfo.age < 18 : false,
        reasoning: `DefensiveMedicineValidator: Gravity Score ${overallUrgency.maxGravity}/10. Urgent patterns detected: ${urgentPatterns.map(p => p.symptoms[0]).join(', ')}`,
      }
    }

    // 3. LLM-based contextual analysis
    return await this.detectUrgencyWithContext(input, context)
  }

  private async detectUrgencyWithContext(
    input: string,
    context: MedicalContext
  ): Promise<UrgencyAssessment> {
    const systemPrompt = `You are an expert emergency medicine physician analyzing a patient interaction for urgency levels.

CONTEXT:
- Current conversation: ${JSON.stringify(context.messages?.slice(-3) || [])}
- Patient data: ${JSON.stringify(context.patientInfo || {})}
- SOAP progress: ${JSON.stringify(context.soapState || {})}

NEW INPUT: "${input}"

Return JSON:
{
  "level": "CRITICAL|HIGH|MODERATE|LOW",
  "protocol": "specific protocol name or null",
  "actions": ["array of immediate actions"],
  "pediatricFlag": boolean,
  "reasoning": "detailed contextual analysis"
}

URGENCY LEVELS:
- CRITICAL: Life-threatening, immediate action (<15 min)
- HIGH: Urgent but stable (<2 hours)
- MODERATE: Important but can wait (<24 hours)
- LOW: Information, casual conversation`

    try {
      const response = await this.callClaude(systemPrompt, input)
      const cleanResponse = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?$/g, '')
        .trim()
      return JSON.parse(cleanResponse)
    } catch (error) {
      return this.defaultUrgency()
    }
  }

  private async processSOAP(
    message: string,
    patientInfo: PatientInfo
  ): Promise<SOAPState> {
    try {
      const soapAnalysis = await this.soapProcessor.processCase(message, {
        age: patientInfo.age ?? undefined,
        gender: patientInfo.gender ?? undefined,
        comorbidities: patientInfo.medicalHistory,
        medications: [],
        vitalSigns: {},
      })

      // Extract simple strings from complex SOAP structure
      const soap = soapAnalysis.soap

      if (!soap) {
        return {
          subjetivo: message,
          objetivo: 'Pendiente',
          analisis: 'Pendiente',
          plan: 'Pendiente',
        }
      }

      // Build objetivo string from vital signs
      const signosVitales = soap.objetivo?.signosVitales
      const objetivoText = signosVitales
        ? `PA: ${signosVitales.presionArterial || '?'}, FC: ${signosVitales.frecuenciaCardiaca || '?'}, FR: ${signosVitales.frecuenciaRespiratoria || '?'}, T: ${signosVitales.temperatura || '?'}`
        : 'Pendiente - Se requiere evaluación física'

      // Build analisis string from diagnostico
      const diagnostico = soap.analisis?.diagnosticoPrincipal
      const analisisText =
        typeof diagnostico === 'string'
          ? diagnostico
          : diagnostico
            ? `${diagnostico.condicion} (${diagnostico.cie10})`
            : 'Síndrome clínico por definir'

      return {
        subjetivo: soap.subjetivo?.motivoConsulta || message,
        objetivo: objetivoText,
        analisis: analisisText,
        plan: soap.plan ? JSON.stringify(soap.plan) : 'Plan terapéutico pendiente',
      }
    } catch (error) {
      return {
        subjetivo: message,
        objetivo: 'Pendiente',
        analisis: 'Pendiente',
        plan: 'Pendiente',
      }
    }
  }

  private async generateResponse(
    message: string,
    context: MedicalContext
  ): Promise<string> {
    const systemPrompt = `Asistente médico AI. Respuestas CONCISAS para profesionales médicos.

📊 ESTADO ACTUAL:
Paciente: ${context.patientInfo?.age ? `${context.patientInfo.age} años` : 'Edad no registrada'}, ${context.patientInfo?.gender || 'Sexo no registrado'}
Síntomas: ${context.patientInfo?.symptoms?.join(', ') || 'No registrados'}

📋 FORMATO OBLIGATORIO (Máximo 150 palabras):

**EVALUACIÓN:**
• [Punto clave 1]
• [Punto clave 2]

**DDx:** [Máx 3 diagnósticos]

**PLAN INMEDIATO:**
• [Acción 1]
• [Acción 2]

REGLAS:
✅ Bullets, NO narrativa
✅ Máx 150 palabras
✅ Directos y escaneables
❌ NO explicaciones largas`

    return await this.callClaude(systemPrompt, message, context.messages || [])
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private emptyExtractedInfo(): ExtractedInfo {
    return {
      age: null,
      gender: null,
      symptoms: [],
      duration: null,
    }
  }

  private defaultUrgency(): UrgencyAssessment {
    return {
      level: 'LOW',
      actions: [],
      reasoning: 'No urgent patterns detected',
    }
  }

  private calculateConfidence(soap: SOAPState): number {
    let score = 0
    if (soap.subjetivo && !soap.subjetivo.includes('Pendiente')) score += 25
    if (soap.objetivo && !soap.objetivo.includes('Pendiente')) score += 25
    if (soap.analisis && !soap.analisis.includes('Pendiente')) score += 25
    if (soap.plan && !soap.plan.includes('Pendiente')) score += 25
    return score
  }
}
