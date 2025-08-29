// 🚀 DECISION ENGINE SERVICE MODERNO - Bernard Orozco 2025
// Arquitectura limpia sin legacy, delegación inteligente

import { ClaudeAdapter } from './providers/claude'
import { MedicalDecisionProcessor } from './processors/MedicalDecisionProcessor'
import type { DecisionResponse } from './core/types'

export interface ModernDecisionRequest {
  type: string
  input: string
  context?: Record<string, unknown>
  signal?: AbortSignal
}

export interface ContextualDecisionRequest extends ModernDecisionRequest {
  coreId: string // 'dashboard', 'assistant', 'inference'
  persistContext?: boolean // Guardar contexto en store
  sessionId?: string // ID de sesión para agrupar contexto
  provider?: string
}

class DecisionEngineService {
  private claudeAdapter: ClaudeAdapter
  private medicalProcessor: MedicalDecisionProcessor
  private initialized = false

  // 🧠 CONTEXTO POR NÚCLEO - Memoria conversacional
  private coreContexts: Map<
    string,
    {
      messages: Array<{ role: 'user' | 'assistant'; content: string }>
      sessionId?: string
      lastActivity: number
      metadata?: Record<string, any>
    }
  > = new Map()

  constructor() {
    this.claudeAdapter = new ClaudeAdapter()
    this.medicalProcessor = new MedicalDecisionProcessor(this.claudeAdapter)
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return

    // ClaudeAdapter no necesita inicialización
    await this.medicalProcessor.initialize()

    this.initialized = true
    console.log('🚀 Modern Decision Engine initialized')
  }

  /**
   * ⚡ FUNCIÓN SIN CONTEXTO - Para funciones puras (2+2=4)
   */
  async processDecision(request: ModernDecisionRequest): Promise<DecisionResponse> {
    await this.initialize()

    try {
      // Todo va al procesador médico - lógica especializada
      return await this.medicalProcessor.process(request)
    } catch (error) {
      console.error(`🔥 Decision failed for ${request.type}:`, error)
      return {
        success: false,
        decision: { error: 'Processing failed', requires_human_review: true },
        confidence: 0,
        latency: 0,
        provider: 'claude',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * 🧠 FUNCIÓN CON CONTEXTO - Para continuidad conversacional (2+x=Y)
   */
  async processDecisionWithContext(request: ContextualDecisionRequest): Promise<DecisionResponse> {
    await this.initialize()

    try {
      // 1. Obtener o crear contexto del núcleo
      const context = this.getOrCreateCoreContext(request.coreId, request.sessionId)

      // 2. Agregar mensaje del usuario al contexto
      context.messages.push({
        role: 'user',
        content: request.input,
      })

      // 3. Crear request con contexto enriquecido
      const enrichedRequest: ModernDecisionRequest = {
        ...request,
        context: {
          ...request.context,
          conversationHistory: context.messages,
          coreId: request.coreId,
          sessionId: context.sessionId,
        },
      }

      // 4. Procesar decisión
      const response = await this.medicalProcessor.process(enrichedRequest)

      // 5. Si exitoso, agregar respuesta al contexto
      if (response.success && response.decision) {
        const assistantMessage = this.extractMessageFromDecision(response.decision)
        if (assistantMessage) {
          context.messages.push({
            role: 'assistant',
            content: assistantMessage,
          })
        }
      }

      // 6. Actualizar actividad del contexto
      context.lastActivity = Date.now()

      return response
    } catch (error) {
      console.error(`🔥 Contextual decision failed for ${request.coreId}/${request.type}:`, error)
      return {
        success: false,
        decision: { error: 'Contextual processing failed', requires_human_review: true },
        confidence: 0,
        latency: 0,
        provider: 'claude',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * 🔧 GESTIÓN DE CONTEXTO POR NÚCLEO
   */
  private getOrCreateCoreContext(coreId: string, sessionId?: string) {
    if (!this.coreContexts.has(coreId)) {
      this.coreContexts.set(coreId, {
        messages: [],
        sessionId: sessionId || `${coreId}_${Date.now()}`,
        lastActivity: Date.now(),
        metadata: {},
      })
    }
    return this.coreContexts.get(coreId)!
  }

  /**
   * 📤 EXTRAER MENSAJE DE RESPUESTA PARA CONTEXTO
   */
  private extractMessageFromDecision(decision: any): string | null {
    if (typeof decision === 'string') return decision
    if (decision.message) return decision.message
    if (decision.question) return decision.question
    if (decision.response) return decision.response
    if (decision.text_response) return decision.text_response
    return null
  }

  /**
   * 🚀 MÉTODOS CONVENIENTES - Wrappers simples para casos comunes
   */
  async makeDiagnosis(input: string, context?: Record<string, unknown>) {
    return this.processDecision({ type: 'diagnosis', input, context })
  }

  async makeTriage(input: string, context?: Record<string, unknown>) {
    return this.processDecision({ type: 'triage', input, context })
  }

  async validateDecision(input: string, context?: Record<string, unknown>) {
    return this.processDecision({ type: 'validation', input, context })
  }
}

// Export singleton instance
export const decisionEngineService = new DecisionEngineService()

// Export types for external use
export type { Domain, Provider, DecisionResponse, BaseDecisionRequest } from './core/types'

export type {
  DiagnosticDecision,
  TriageDecision,
  ValidationDecision,
  TreatmentDecision,
  DocumentationDecision,
  MedicalDecision,
} from './domains/medical'
