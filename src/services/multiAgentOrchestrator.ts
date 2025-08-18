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
import { callClaudeForDecision } from './decisionalMiddleware'
import { nanoid } from '@reduxjs/toolkit'
import { store } from '@/store/store'
import { 
  agentCallStarted, 
  agentCallSucceeded, 
  agentCallFailed,
  checkCircuitBreaker 
} from '@/store/agentCircuitBreakers'
import { contextualMemory } from './contextualMemory'
import { reinforcementLearning } from './reinforcementLearning'

export class MultiAgentOrchestrator {
  private abortControllers: Map<string, AbortController> = new Map()
  private activeRequests: Map<string, DecisionRequest> = new Map()

  // Check if agent can be called based on circuit breaker state
  private canCallAgent(agentType: AgentType): boolean {
    const state = store.getState()
    const circuitBreaker = state.agentCircuitBreakers.circuitBreakers[agentType]
    const agentStatus = state.agentCircuitBreakers.agentStatuses[agentType]
    
    // Check if agent is disabled
    if (agentStatus === AgentStatus.DISABLED) {
      return false
    }
    
    // Check circuit breaker state
    if (circuitBreaker.state === CircuitBreakerState.OPEN) {
      // Try to transition to half-open if cooldown period has passed
      store.dispatch(checkCircuitBreaker(agentType))
      
      // Re-check after potential state transition
      const updatedState = store.getState()
      const updatedBreaker = updatedState.agentCircuitBreakers.circuitBreakers[agentType]
      return updatedBreaker.state !== CircuitBreakerState.OPEN
    }
    
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
    store.dispatch(agentCallStarted({ agentType, requestId }))
    
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
      store.dispatch(agentCallSucceeded({ 
        agentType, 
        requestId, 
        latency,
        confidence: response.confidence 
      }))
      
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
        store.dispatch(agentCallFailed({ 
          agentType, 
          requestId, 
          error: errorMessage,
          latency 
        }))
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

  // Call Claude with agent-specific system prompt and context
  private async callAgentSpecificClaude(
    agentDef: AgentDefinition,
    input: string,
    signal: AbortSignal,
    context?: any
  ): Promise<{ decision: AgentDecision, confidence: number }> {
    // Enhanced system prompt with contextual information
    let enhancedPrompt = agentDef.systemPrompt
    
    if (context) {
      enhancedPrompt += `\n\n## CONTEXTUAL INFORMATION:\n`
      enhancedPrompt += `Current Context: ${context.currentContext}\n`
      
      if (context.activeSymptoms?.length > 0) {
        enhancedPrompt += `Active Symptoms: ${context.activeSymptoms.join(', ')}\n`
      }
      
      if (context.activeHypotheses?.length > 0) {
        enhancedPrompt += `Active Hypotheses: ${context.activeHypotheses.map((h: any) => 
          `${h.description} (${h.confidence}%)`
        ).join(', ')}\n`
      }
      
      if (context.relevantInsights?.length > 0) {
        enhancedPrompt += `Previous Insights: ${context.relevantInsights.map((i: any) => 
          i.pattern
        ).join(', ')}\n`
      }
      
      if (context.recentInputs?.length > 0) {
        enhancedPrompt += `Recent Context: ${context.recentInputs.slice(0, 2).join('; ')}\n`
      }
    }
    
    // Use existing Claude middleware but with enhanced prompt
    const response = await callClaudeForDecision(
      this.mapAgentTypeToDecisionType(agentDef.id) as any,
      input,
      'claude',
      signal,
      [] // Previous decisions handled via context
    )
    
    return {
      decision: response.decision as any,
      confidence: response.confidence
    }
  }

  private mapAgentTypeToDecisionType(agentType: AgentType): string {
    switch (agentType) {
      case AgentType.DIAGNOSTIC: return 'diagnosis'
      case AgentType.VALIDATION: return 'validation'
      case AgentType.TREATMENT: return 'treatment'
      case AgentType.TRIAGE: return 'triage'
      case AgentType.DOCUMENTATION: return 'documentation'
      default: return 'diagnosis'
    }
  }

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
    circuitBreakerStates: Record<AgentType, CircuitBreakerState>
    averageLatencies: Record<AgentType, number>
  } {
    const state = store.getState()
    const { circuitBreakers, metrics, agentStatuses } = state.agentCircuitBreakers
    
    const circuitBreakerStates: Record<AgentType, CircuitBreakerState> = {} as Record<AgentType, CircuitBreakerState>
    const averageLatencies: Record<AgentType, number> = {} as Record<AgentType, number>
    
    Object.entries(circuitBreakers).forEach(([agentType, breaker]) => {
      const type = agentType as AgentType
      circuitBreakerStates[type] = breaker.state
      averageLatencies[type] = metrics[type].avgLatency
    })
    
    return {
      totalAgents: Object.keys(AGENT_REGISTRY).length,
      activeAgents: Object.values(agentStatuses).filter(status => 
        status === AgentStatus.READY || status === AgentStatus.PROCESSING
      ).length,
      failedAgents: Object.values(agentStatuses).filter(status => status === AgentStatus.FAILED).length,
      circuitBreakerStates,
      averageLatencies
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