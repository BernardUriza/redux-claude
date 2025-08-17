// src/hooks/useMultiAgentGateway.ts
// Creado por Bernard Orozco
import { useSelector, useDispatch } from 'react-redux'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { RootState, AppDispatch } from '@/store/store'
import { 
  AgentType, 
  DecisionResult, 
  AgentStatus,
  CircuitBreakerState,
  MultiAgentSession
} from '@/types/agents'
import { 
  performHealthCheck,
  setAgentEnabled,
  resetAgentCircuitBreaker,
  clearAgentMetrics
} from '@/store/agentCircuitBreakers'
import { multiAgentOrchestrator } from '@/services/multiAgentOrchestrator'
import { nanoid } from '@reduxjs/toolkit'

export const useMultiAgentGateway = () => {
  const dispatch = useDispatch<AppDispatch>()
  const sessionIdRef = useRef<string>(nanoid())
  
  const {
    circuitBreakers,
    metrics,
    agentStatuses,
    globalState
  } = useSelector((state: RootState) => state.agentCircuitBreakers)

  // Auto health check every 30 seconds
  useEffect(() => {
    const healthCheckInterval = setInterval(() => {
      dispatch(performHealthCheck())
    }, 30000)

    // Initial health check
    dispatch(performHealthCheck())

    return () => clearInterval(healthCheckInterval)
  }, [dispatch])

  // Process multiple agents in parallel
  const processWithAllAgents = useCallback(async (
    input: string,
    agentTypes?: AgentType[]
  ): Promise<DecisionResult[]> => {
    try {
      const results = await multiAgentOrchestrator.executeParallelAgents(
        input,
        agentTypes,
        sessionIdRef.current
      )
      return results
    } catch (error) {
      console.error('Multi-agent processing failed:', error)
      throw error
    }
  }, [])

  // Process agents in dependency order (sequential phases)
  const processWithSequentialAgents = useCallback(async (
    input: string,
    maxConcurrent: number = 3
  ): Promise<DecisionResult[]> => {
    try {
      const results = await multiAgentOrchestrator.executeSequentialAgents(
        input,
        maxConcurrent
      )
      return results
    } catch (error) {
      console.error('Sequential agent processing failed:', error)
      throw error
    }
  }, [])

  // Process with single agent
  const processWithSingleAgent = useCallback(async (
    agentType: AgentType,
    input: string,
    maxRetries?: number
  ): Promise<DecisionResult> => {
    try {
      const result = await multiAgentOrchestrator.executeSingleAgent(
        agentType,
        input,
        maxRetries
      )
      return result
    } catch (error) {
      console.error(`Single agent ${agentType} processing failed:`, error)
      throw error
    }
  }, [])

  // Get available agents (not disabled, circuit breaker not open)
  const getAvailableAgents = useCallback((): AgentType[] => {
    return Object.entries(agentStatuses)
      .filter(([agentType, status]) => {
        if (status === AgentStatus.DISABLED) return false
        
        const circuitBreaker = circuitBreakers[agentType as AgentType]
        return circuitBreaker.state !== CircuitBreakerState.OPEN
      })
      .map(([agentType]) => agentType as AgentType)
  }, [agentStatuses, circuitBreakers])

  // Get failed agents
  const getFailedAgents = useCallback((): AgentType[] => {
    return Object.entries(agentStatuses)
      .filter(([, status]) => status === AgentStatus.FAILED)
      .map(([agentType]) => agentType as AgentType)
  }, [agentStatuses])

  // Enable/disable agent
  const toggleAgent = useCallback((agentType: AgentType, enabled: boolean) => {
    dispatch(setAgentEnabled({ agentType, enabled }))
  }, [dispatch])

  // Reset agent circuit breaker
  const resetAgent = useCallback((agentType: AgentType) => {
    dispatch(resetAgentCircuitBreaker(agentType))
  }, [dispatch])

  // Get agent health status
  const getAgentHealth = useCallback((agentType: AgentType) => {
    const status = agentStatuses[agentType]
    const circuitBreaker = circuitBreakers[agentType]
    const metric = metrics[agentType]
    
    return {
      status,
      circuitBreakerState: circuitBreaker.state,
      failures: circuitBreaker.failures,
      successRate: metric.successRate,
      avgLatency: metric.avgLatency,
      totalCalls: metric.totalCalls,
      currentStreak: metric.currentStreak,
      lastCall: metric.lastCall,
      canRetry: circuitBreaker.state !== CircuitBreakerState.OPEN
    }
  }, [agentStatuses, circuitBreakers, metrics])

  // Get system overview
  const getSystemOverview = useCallback(() => {
    const systemHealth = multiAgentOrchestrator.getSystemHealth()
    const activeRequests = multiAgentOrchestrator.getActiveRequests()
    
    return {
      ...systemHealth,
      activeRequests: activeRequests.length,
      lastHealthCheck: globalState.lastHealthCheck,
      systemLatency: globalState.avgSystemLatency
    }
  }, [globalState])

  // Cancel all ongoing requests
  const cancelAllRequests = useCallback(() => {
    multiAgentOrchestrator.cancelAllRequests()
  }, [])

  // Reset all metrics
  const resetAllMetrics = useCallback(() => {
    dispatch(clearAgentMetrics())
  }, [dispatch])

  // Get session information
  const getSessionInfo = useCallback((): MultiAgentSession => {
    const totalRequests = Object.values(metrics).reduce((sum, m) => sum + m.totalCalls, 0)
    const completedRequests = Object.values(metrics).reduce((sum, m) => sum + m.successfulCalls, 0)
    const failedRequests = Object.values(metrics).reduce((sum, m) => sum + m.failedCalls, 0)

    return {
      sessionId: sessionIdRef.current,
      activeAgents: getAvailableAgents(),
      totalRequests,
      completedRequests,
      failedRequests,
      startTime: Date.now() - (globalState.lastHealthCheck || 0), // Approximation
      lastActivity: globalState.lastHealthCheck
    }
  }, [metrics, getAvailableAgents, globalState])

  // Memoized agent summaries for UI
  const agentSummaries = useMemo(() => {
    return Object.entries(agentStatuses).map(([agentTypeKey, status]) => {
      const agentType = agentTypeKey as AgentType
      const health = getAgentHealth(agentType)
      
      return {
        agentType,
        status,
        health,
        isProcessing: status === AgentStatus.PROCESSING,
        isAvailable: status === AgentStatus.READY && 
                    health.circuitBreakerState !== CircuitBreakerState.OPEN
      }
    })
  }, [agentStatuses, getAgentHealth])

  // Smart agent selection based on input
  const selectOptimalAgents = useCallback((input: string): AgentType[] => {
    const lowerInput = input.toLowerCase()
    const availableAgents = getAvailableAgents()
    
    // Always include triage for medical inputs
    const selectedAgents = new Set<AgentType>()
    
    if (availableAgents.includes(AgentType.TRIAGE)) {
      selectedAgents.add(AgentType.TRIAGE)
    }
    
    // Add diagnostic for symptom analysis
    if (lowerInput.includes('síntom') || lowerInput.includes('dolor') || 
        lowerInput.includes('diagnóstic') || lowerInput.includes('enfermedad')) {
      if (availableAgents.includes(AgentType.DIAGNOSTIC)) {
        selectedAgents.add(AgentType.DIAGNOSTIC)
      }
    }
    
    // Add treatment for therapy/medication requests
    if (lowerInput.includes('tratamiento') || lowerInput.includes('medicament') || 
        lowerInput.includes('terapia') || lowerInput.includes('prescrib')) {
      if (availableAgents.includes(AgentType.TREATMENT)) {
        selectedAgents.add(AgentType.TREATMENT)
      }
    }
    
    // Add validation for review requests
    if (lowerInput.includes('validar') || lowerInput.includes('revisar') || 
        lowerInput.includes('confirmar') || lowerInput.includes('verificar')) {
      if (availableAgents.includes(AgentType.VALIDATION)) {
        selectedAgents.add(AgentType.VALIDATION)
      }
    }
    
    // If nothing specific, use all available (fallback)
    if (selectedAgents.size === 0) {
      return availableAgents.slice(0, 3) // Limit to 3 for performance
    }
    
    return Array.from(selectedAgents)
  }, [getAvailableAgents])

  return {
    // State
    agentStatuses,
    circuitBreakers,
    metrics,
    globalState,
    agentSummaries,
    
    // Actions
    processWithAllAgents,
    processWithSequentialAgents,
    processWithSingleAgent,
    selectOptimalAgents,
    
    // Management
    toggleAgent,
    resetAgent,
    cancelAllRequests,
    resetAllMetrics,
    
    // Utilities
    getAvailableAgents,
    getFailedAgents,
    getAgentHealth,
    getSystemOverview,
    getSessionInfo
  }
}