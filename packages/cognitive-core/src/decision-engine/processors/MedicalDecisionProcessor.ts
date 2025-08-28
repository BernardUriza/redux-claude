// 🏥 PROCESADOR DE DECISIONES MÉDICAS - Bernard Orozco 2025
// Lógica especializada separada del engine principal

import { getAgentDefinition } from '../../services/agentRegistry'
import { AgentType } from '../../types/agents'
import type { ClaudeAdapter } from '../providers/claude'
import type { DecisionResponse } from '../core/types'
import type { ModernDecisionRequest } from '../DecisionEngineService'

export class MedicalDecisionProcessor {
  private claudeAdapter: ClaudeAdapter
  private initialized = false

  // 🗺️ MAPEO TIPOS DE DECISIÓN → AGENTTYPE
  private readonly TYPE_TO_AGENT_MAP: Record<string, AgentType> = {
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

  constructor(claudeAdapter: ClaudeAdapter) {
    this.claudeAdapter = claudeAdapter
  }

  async initialize(): Promise<void> {
    if (this.initialized) return
    this.initialized = true
    console.log('🏥 Medical Decision Processor initialized')
  }

  /**
   * 🎯 PROCESAMIENTO PRINCIPAL - Lógica médica especializada
   */
  async process(request: ModernDecisionRequest): Promise<DecisionResponse> {
    await this.initialize()
    const startTime = Date.now()

    try {
      // 1. Obtener definición del agente desde registry
      const agentType = this.TYPE_TO_AGENT_MAP[request.type]
      if (!agentType) {
        throw new Error(`Unknown decision type: ${request.type}`)
      }

      const agentDef = getAgentDefinition(agentType)
      
      // 2. Construir prompt especializado
      const systemPrompt = this.buildSystemPrompt(agentDef.systemPrompt, request.context)
      
      // 3. Llamar a Claude con prompt especializado
      const response = await this.claudeAdapter.makeRequest(
        systemPrompt,
        request.input,
        request.signal
      )

      // 4. Procesar y validar respuesta
      const processedDecision = this.processResponse(response, request.type)
      const confidence = this.calculateConfidence(processedDecision, request.type)

      return {
        success: true,
        decision: processedDecision,
        confidence,
        latency: Date.now() - startTime,
        provider: 'claude'
      }

    } catch (error) {
      console.error(`🔥 Medical processor failed for ${request.type}:`, error)
      
      return {
        success: false,
        decision: { 
          error: `Failed to process ${request.type}`,
          requires_human_review: true,
          fallback_message: 'Consultar médico especialista'
        },
        confidence: 0,
        latency: Date.now() - startTime,
        provider: 'claude',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * 🔧 CONSTRUCCIÓN DE PROMPTS - Contextualización inteligente
   */
  private buildSystemPrompt(basePrompt: string, context?: Record<string, unknown>): string {
    let prompt = basePrompt

    // Agregar contexto si existe
    if (context && Object.keys(context).length > 0) {
      prompt += `\n\n## CONTEXTO ADICIONAL:\n${JSON.stringify(context, null, 2)}`
    }

    return prompt
  }

  /**
   * 🧠 PROCESAMIENTO DE RESPUESTAS - Parsing inteligente
   */
  private processResponse(response: any, decisionType: string): any {
    // Si Claude devuelve JSON directo
    if (typeof response === 'object' && response !== null) {
      return response
    }

    // Si Claude devuelve string, intentar parsear JSON
    if (typeof response === 'string') {
      try {
        return JSON.parse(response.trim())
      } catch {
        // Si no es JSON, devolver como respuesta de texto
        return { message: response, text_response: true }
      }
    }

    return response
  }

  /**
   * 📊 CÁLCULO DE CONFIANZA - Basado en completitud de respuesta
   */
  private calculateConfidence(decision: any, decisionType: string): number {
    if (!decision || typeof decision !== 'object') return 0.5

    let baseConfidence = 0.75

    // Bonificaciones por campos específicos según tipo
    switch (decisionType) {
      case 'diagnosis':
        if (decision.differentials?.length > 0) baseConfidence += 0.15
        if (decision.tests_recommended?.length > 0) baseConfidence += 0.05
        if (decision.red_flags?.length > 0) baseConfidence += 0.05
        break
      case 'treatment':
        if (decision.medications?.length > 0) baseConfidence += 0.15
        if (decision.monitoring_plan?.length > 0) baseConfidence += 0.05
        break
      case 'intelligent_medical_chat':
        if (decision.message && decision.message.length > 10) baseConfidence += 0.15
        if (decision.question && decision.question.length > 5) baseConfidence += 0.10
        break
      default:
        // Confianza base para otros tipos
        baseConfidence += 0.10
    }

    return Math.min(0.95, Math.max(0.4, baseConfidence))
  }
}