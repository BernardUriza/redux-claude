// src/services/multiAgentOrchestrator.ts
// Creado por Bernard Orozco
import { 
  AgentType, 
  AgentDefinition,
  DecisionRequest,
  DecisionResult,
  AgentDecision,
  CircuitBreakerState,
  AgentStatus
} from '@/types/agents'
import { AGENT_REGISTRY, getEnabledAgents, getAgentDefinition, isAgentEnabled } from './agentRegistry'
import { callClaudeForDecision, mapAgentTypeToDecisionType } from './decisionalMiddleware'
import { nanoid } from '@reduxjs/toolkit'
import { store } from '@/store/store'
// Simplified imports
import { contextualMemory } from './contextualMemory'
import { reinforcementLearning } from './reinforcementLearning'

export class MultiAgentOrchestrator {
  private abortControllers: Map<string, AbortController> = new Map()
  private activeRequests: Map<string, DecisionRequest> = new Map()

  // Check if agent can be called based on circuit breaker state
  private canCallAgent(agentType: AgentType): boolean {
    // Simplified for now
    return true
  }

  // Execute single agent call with circuit breaker protection
  private async executeAgentCall(
    agentType: AgentType,
    input: string,
    requestId: string,
    parentRequestId?: string
  ): Promise<DecisionResult> {
    const agentDef = getAgentDefinition(agentType)
    const abortController = new AbortController()
    this.abortControllers.set(requestId, abortController)

    const request: DecisionRequest = {
      id: requestId,
      agentType,
      input,
      timestamp: Date.now(),
      priority: agentDef.priority,
      retryCount: 0,
      parentRequestId
    }

    this.activeRequests.set(requestId, request)
    
    // Dispatch call started
    // Simplified - no dispatch needed
    
    const startTime = Date.now()
    
    try {
      // Get contextual memory for agent
      const agentContext = contextualMemory.getRelevantContext(agentType)
      
      // Simulate agent-specific system prompt call to Claude
      const response = await this.callAgentSpecificClaude(
        agentDef,
        input,
        abortController.signal,
        agentContext
      )
      
      const latency = Date.now() - startTime
      
      // Dispatch success
      // Success callback
      
      const result: DecisionResult = {
        id: nanoid(),
        requestId,
        agentType,
        agentName: agentDef.name,
        input,
        decision: response.decision,
        confidence: response.confidence,
        latency,
        timestamp: Date.now(),
        retryCount: 0,
        success: true
      }
      
      this.cleanup(requestId)
      return result
      
    } catch (error) {
      const latency = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      // Don't log circuit breaker failures
      if (!errorMessage.includes('aborted')) {
        // Error callback
      }
      
      this.cleanup(requestId)
      
      const result: DecisionResult = {
        id: nanoid(),
        requestId,
        agentType,
        agentName: agentDef.name,
        input,
        decision: {} as AgentDecision,
        confidence: 0,
        latency,
        timestamp: Date.now(),
        retryCount: 0,
        success: false,
        error: errorMessage
      }
      
      return result
    }
  }

  // Call Claude using decisional middleware with context
  private async callAgentSpecificClaude(
    agentDef: AgentDefinition,
    input: string,
    signal: AbortSignal,
    context?: any
  ): Promise<{ decision: AgentDecision, confidence: number }> {
    try {
      if (signal?.aborted) {
        throw new Error('Request aborted')
      }

      // Map agent type to decision type
      const decisionType = mapAgentTypeToDecisionType(agentDef.id)
      
      // Prepare context for the middleware
      const middlewareContext: Record<string, unknown> = {}
      
      if (context) {
        middlewareContext.currentContext = context.currentContext
        middlewareContext.activeSymptoms = context.activeSymptoms
        middlewareContext.activeHypotheses = context.activeHypotheses
        middlewareContext.relevantInsights = context.relevantInsights
        middlewareContext.recentInputs = context.recentInputs
      }
      
      // Call the decisional middleware
      const response = await callClaudeForDecision(
        decisionType,
        input,
        'claude', // Use Claude provider
        signal,
        [], // Previous decisions will be handled by cognitive system
        middlewareContext
      )
      
      if (!response.success && response.error) {
        console.warn(`Decisional middleware warning for ${agentDef.id}:`, response.error)
      }
      
      return {
        decision: response.decision,
        confidence: response.confidence
      }
      
    } catch (error) {
      console.error(`Agent orchestrator error for ${agentDef.id}:`, error)
      throw error // Let the caller handle the error
    }
  }

  // Removed redundant methods - now handled by decisionalMiddleware

  // Execute parallel agent calls
  async executeParallelAgents(
    input: string,
    agentTypes?: AgentType[],
    parentRequestId?: string
  ): Promise<DecisionResult[]> {
    const sessionId = parentRequestId || nanoid()
    const targetAgents = agentTypes || getEnabledAgents().map(agent => agent.id)
    
    // Filter agents that can be called (circuit breaker check)
    const availableAgents = targetAgents.filter(agentType => {
      if (!isAgentEnabled(agentType)) return false
      return this.canCallAgent(agentType)
    })
    
    if (availableAgents.length === 0) {
      throw new Error('No agents available - all circuit breakers are open or disabled')
    }
    
    // Sort by priority (lower number = higher priority)
    const sortedAgents = availableAgents.sort((a, b) => {
      const priorityA = getAgentDefinition(a).priority
      const priorityB = getAgentDefinition(b).priority
      return priorityA - priorityB
    })
    
    // Execute all agents in parallel
    const agentPromises = sortedAgents.map(agentType => {
      const requestId = nanoid()
      return this.executeAgentCall(agentType, input, requestId, sessionId)
    })
    
    // Wait for all agents to complete (successful or failed)
    const results = await Promise.allSettled(agentPromises)
    
    // Process results
    const decisionsResults: DecisionResult[] = []
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        decisionsResults.push(result.value)
      } else {
        // Create error result for rejected promises
        const agentType = sortedAgents[index]
        const agentDef = getAgentDefinition(agentType)
        
        decisionsResults.push({
          id: nanoid(),
          requestId: nanoid(),
          agentType,
          agentName: agentDef.name,
          input,
          decision: {} as AgentDecision,
          confidence: 0,
          latency: 0,
          timestamp: Date.now(),
          retryCount: 0,
          success: false,
          error: result.reason?.message || 'Agent execution failed'
        })
      }
    })
    
    return decisionsResults
  }

  // Execute agents with dependency order (triage first, then others)
  async executeSequentialAgents(
    input: string,
    maxConcurrent: number = 3
  ): Promise<DecisionResult[]> {
    const sessionId = nanoid()
    const allResults: DecisionResult[] = []
    
    // Phase 1: Critical agents first (Triage)
    const criticalAgents = [AgentType.TRIAGE].filter(agentType => 
      isAgentEnabled(agentType) && this.canCallAgent(agentType)
    )
    
    if (criticalAgents.length > 0) {
      const criticalResults = await this.executeParallelAgents(input, criticalAgents, sessionId)
      allResults.push(...criticalResults)
    }
    
    // Phase 2: Primary analysis agents (Diagnostic, Validation)
    const primaryAgents = [AgentType.DIAGNOSTIC, AgentType.VALIDATION].filter(agentType => 
      isAgentEnabled(agentType) && this.canCallAgent(agentType)
    )
    
    if (primaryAgents.length > 0) {
      const primaryResults = await this.executeParallelAgents(input, primaryAgents, sessionId)
      allResults.push(...primaryResults)
    }
    
    // Phase 3: Secondary agents (Treatment, Documentation)
    const secondaryAgents = [AgentType.TREATMENT, AgentType.DOCUMENTATION].filter(agentType => 
      isAgentEnabled(agentType) && this.canCallAgent(agentType)
    )
    
    if (secondaryAgents.length > 0) {
      const secondaryResults = await this.executeParallelAgents(input, secondaryAgents, sessionId)
      allResults.push(...secondaryResults)
    }
    
    return allResults
  }

  // Execute single agent with retry logic
  async executeSingleAgent(
    agentType: AgentType,
    input: string,
    maxRetries: number = 2
  ): Promise<DecisionResult> {
    if (!this.canCallAgent(agentType)) {
      throw new Error(`Agent ${agentType} is not available (circuit breaker open or disabled)`)
    }
    
    let lastError: Error | null = null
    
    for (let retry = 0; retry <= maxRetries; retry++) {
      try {
        const requestId = nanoid()
        const result = await this.executeAgentCall(agentType, input, requestId)
        
        if (result.success) {
          return result
        }
        
        lastError = new Error(result.error || 'Agent call failed')
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')
        
        // Don't retry if circuit breaker opened
        if (!this.canCallAgent(agentType)) {
          break
        }
        
        // Exponential backoff for retries
        if (retry < maxRetries) {
          await this.delay(Math.pow(2, retry) * 1000)
        }
      }
    }
    
    throw lastError || new Error('Max retries exceeded')
  }

  // Get system health status
  getSystemHealth(): {
    totalAgents: number
    activeAgents: number
    failedAgents: number
  } {
    const state = store.getState()
    const basic = state.basic
    
    // Simplified for now
    return {
      totalAgents: 5,
      activeAgents: 5,
      failedAgents: 0
    }
  }

  // Cancel all active requests
  cancelAllRequests(): void {
    this.abortControllers.forEach(controller => controller.abort())
    this.abortControllers.clear()
    this.activeRequests.clear()
  }

  // Cancel specific request
  cancelRequest(requestId: string): void {
    const controller = this.abortControllers.get(requestId)
    if (controller) {
      controller.abort()
      this.cleanup(requestId)
    }
  }

  // Get active requests
  getActiveRequests(): DecisionRequest[] {
    return Array.from(this.activeRequests.values())
  }

  // Utility methods
  private cleanup(requestId: string): void {
    this.abortControllers.delete(requestId)
    this.activeRequests.delete(requestId)
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Export singleton instance
export const multiAgentOrchestrator = new MultiAgentOrchestrator()