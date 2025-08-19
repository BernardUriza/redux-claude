// src/agents/BaseAgent.ts
// Clase base para todos los agentes - Bernard Orozco

import { DecisionResult, AgentType } from '../types/agents'

// Interface simplificada para requests básicos
export interface SimpleDecisionRequest {
  timestamp: number
  context?: Record<string, any>
}

export abstract class BaseAgent<TDecision = any> {
  protected agentType: string
  protected version: string
  protected lastExecutionTime?: number

  constructor(agentType: string, version: string = '1.0.0') {
    this.agentType = agentType
    this.version = version
  }

  /**
   * Método principal que debe implementar cada agente
   */
  abstract makeDecision(request: SimpleDecisionRequest): Promise<{
    agentType: string
    success: boolean
    decision?: TDecision
    error?: string
    confidence: number
    processingTimeMs: number
    reasoning?: string
  }>

  /**
   * Información del agente
   */
  getAgentInfo() {
    return {
      type: this.agentType,
      version: this.version,
      lastExecutionTime: this.lastExecutionTime
    }
  }

  /**
   * Actualizar tiempo de última ejecución
   */
  protected updateExecutionTime() {
    this.lastExecutionTime = Date.now()
  }

  /**
   * Validar request básico
   */
  protected validateRequest(request: SimpleDecisionRequest): boolean {
    return !!(request && request.timestamp && typeof request.timestamp === 'number')
  }

  /**
   * Calcular tiempo de procesamiento
   */
  protected calculateProcessingTime(startTime: number): number {
    return Date.now() - startTime
  }

  /**
   * Crear respuesta de error estándar
   */
  protected createErrorResponse(error: string, startTime: number) {
    return {
      agentType: this.agentType,
      success: false,
      error,
      confidence: 0,
      processingTimeMs: this.calculateProcessingTime(startTime)
    }
  }

  /**
   * Crear respuesta exitosa estándar
   */
  protected createSuccessResponse(
    decision: TDecision, 
    confidence: number, 
    startTime: number,
    reasoning?: string
  ) {
    return {
      agentType: this.agentType,
      success: true,
      decision,
      confidence,
      processingTimeMs: this.calculateProcessingTime(startTime),
      reasoning
    }
  }
}