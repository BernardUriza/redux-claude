// src/store/agentCircuitBreakers.ts
// Creado por Bernard Orozco
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  AgentType,
  AgentStatus,
  CircuitBreakerState,
  AgentMetrics,
  AgentCircuitBreaker,
  CircuitBreakerConfig,
} from '../types/agents'

const defaultCircuitBreakerConfig: CircuitBreakerConfig = {
  maxFailures: 3,
  cooldownMs: 60000, // 1 minute
  halfOpenTests: 2,
  resetTimeoutMs: 300000, // 5 minutes
}

const createInitialCircuitBreaker = (
  config?: Partial<CircuitBreakerConfig>
): AgentCircuitBreaker => ({
  state: CircuitBreakerState.CLOSED,
  failures: 0,
  lastFailure: undefined,
  nextRetry: undefined,
  halfOpenAttempts: 0,
  config: { ...defaultCircuitBreakerConfig, ...config },
})

const createInitialMetrics = (): AgentMetrics => ({
  totalCalls: 0,
  successfulCalls: 0,
  failedCalls: 0,
  avgLatency: 0,
  lastCall: undefined,
  successRate: 0,
  currentStreak: 0,
})

interface AgentCircuitBreakersState {
  circuitBreakers: Record<AgentType, AgentCircuitBreaker>
  metrics: Record<AgentType, AgentMetrics>
  agentStatuses: Record<AgentType, AgentStatus>
  globalState: {
    totalAgents: number
    activeAgents: number
    failedAgents: number
    avgSystemLatency: number
    lastHealthCheck: number
  }
}

const initialState: AgentCircuitBreakersState = {
  circuitBreakers: {
    [AgentType.DIAGNOSTIC]: createInitialCircuitBreaker({ maxFailures: 3, cooldownMs: 30000 }),
    [AgentType.TRIAGE]: createInitialCircuitBreaker({ maxFailures: 2, cooldownMs: 15000 }), // More strict for triage
    [AgentType.VALIDATION]: createInitialCircuitBreaker({ maxFailures: 4, cooldownMs: 45000 }),
    [AgentType.TREATMENT]: createInitialCircuitBreaker({ maxFailures: 3, cooldownMs: 60000 }),
    [AgentType.DOCUMENTATION]: createInitialCircuitBreaker({ maxFailures: 5, cooldownMs: 90000 }), // More lenient
    [AgentType.RESPONSE_QUALITY]: createInitialCircuitBreaker({
      maxFailures: 3,
      cooldownMs: 20000,
    }),
    [AgentType.CLINICAL_PHARMACOLOGY]: createInitialCircuitBreaker({
      maxFailures: 3,
      cooldownMs: 30000,
    }),
    [AgentType.PEDIATRIC_SPECIALIST]: createInitialCircuitBreaker({
      maxFailures: 3,
      cooldownMs: 30000,
    }),
    [AgentType.HOSPITALIZATION_CRITERIA]: createInitialCircuitBreaker({
      maxFailures: 3,
      cooldownMs: 30000,
    }),
    [AgentType.FAMILY_EDUCATION]: createInitialCircuitBreaker({
      maxFailures: 3,
      cooldownMs: 30000,
    }),
    [AgentType.OBJECTIVE_VALIDATION]: createInitialCircuitBreaker({
      maxFailures: 4,
      cooldownMs: 45000,
    }),
    [AgentType.DEFENSIVE_DIFFERENTIAL]: createInitialCircuitBreaker({
      maxFailures: 2,
      cooldownMs: 15000,
    }),
    [AgentType.MEDICAL_AUTOCOMPLETION]: createInitialCircuitBreaker({
      maxFailures: 3,
      cooldownMs: 30000,
    }),
    [AgentType.CRITICAL_DATA_VALIDATION]: createInitialCircuitBreaker({
      maxFailures: 2,
      cooldownMs: 15000,
    }),
    [AgentType.SPECIALTY_DETECTION]: createInitialCircuitBreaker({
      maxFailures: 3,
      cooldownMs: 30000,
    }),
    [AgentType.INTELLIGENT_MEDICAL_CHAT]: createInitialCircuitBreaker({
      maxFailures: 3,
      cooldownMs: 30000,
    }),
  },
  metrics: {
    [AgentType.DIAGNOSTIC]: createInitialMetrics(),
    [AgentType.TRIAGE]: createInitialMetrics(),
    [AgentType.VALIDATION]: createInitialMetrics(),
    [AgentType.TREATMENT]: createInitialMetrics(),
    [AgentType.DOCUMENTATION]: createInitialMetrics(),
    [AgentType.RESPONSE_QUALITY]: createInitialMetrics(),
    [AgentType.CLINICAL_PHARMACOLOGY]: createInitialMetrics(),
    [AgentType.PEDIATRIC_SPECIALIST]: createInitialMetrics(),
    [AgentType.HOSPITALIZATION_CRITERIA]: createInitialMetrics(),
    [AgentType.FAMILY_EDUCATION]: createInitialMetrics(),
    [AgentType.OBJECTIVE_VALIDATION]: createInitialMetrics(),
    [AgentType.DEFENSIVE_DIFFERENTIAL]: createInitialMetrics(),
    [AgentType.MEDICAL_AUTOCOMPLETION]: createInitialMetrics(),
    [AgentType.CRITICAL_DATA_VALIDATION]: createInitialMetrics(),
    [AgentType.SPECIALTY_DETECTION]: createInitialMetrics(),
    [AgentType.INTELLIGENT_MEDICAL_CHAT]: createInitialMetrics(),
  },
  agentStatuses: {
    [AgentType.DIAGNOSTIC]: AgentStatus.READY,
    [AgentType.TRIAGE]: AgentStatus.READY,
    [AgentType.VALIDATION]: AgentStatus.READY,
    [AgentType.TREATMENT]: AgentStatus.READY,
    [AgentType.DOCUMENTATION]: AgentStatus.READY, // Enabled for cognitive system
    [AgentType.RESPONSE_QUALITY]: AgentStatus.READY,
    [AgentType.CLINICAL_PHARMACOLOGY]: AgentStatus.READY,
    [AgentType.PEDIATRIC_SPECIALIST]: AgentStatus.READY,
    [AgentType.HOSPITALIZATION_CRITERIA]: AgentStatus.READY,
    [AgentType.FAMILY_EDUCATION]: AgentStatus.READY,
    [AgentType.OBJECTIVE_VALIDATION]: AgentStatus.READY,
    [AgentType.DEFENSIVE_DIFFERENTIAL]: AgentStatus.READY,
    [AgentType.MEDICAL_AUTOCOMPLETION]: AgentStatus.READY,
    [AgentType.CRITICAL_DATA_VALIDATION]: AgentStatus.READY,
    [AgentType.SPECIALTY_DETECTION]: AgentStatus.READY,
    [AgentType.INTELLIGENT_MEDICAL_CHAT]: AgentStatus.READY,
  },
  globalState: {
    totalAgents: 16,
    activeAgents: 16, // All 16 agents enabled
    failedAgents: 0,
    avgSystemLatency: 0,
    lastHealthCheck: Date.now(),
  },
}

const calculateGlobalMetrics = (state: AgentCircuitBreakersState) => {
  const activeMetrics = Object.entries(state.metrics)
    .filter(([agentType]) => state.agentStatuses[agentType as AgentType] !== AgentStatus.DISABLED)
    .map(([, metrics]) => metrics)

  const totalCalls = activeMetrics.reduce((sum, m) => sum + m.totalCalls, 0)
  const totalLatency = activeMetrics.reduce((sum, m) => sum + m.avgLatency * m.totalCalls, 0)
  const failedAgents = Object.values(state.agentStatuses).filter(
    status => status === AgentStatus.FAILED
  ).length
  const activeAgents = Object.values(state.agentStatuses).filter(
    status => status === AgentStatus.READY || status === AgentStatus.PROCESSING
  ).length

  state.globalState.activeAgents = activeAgents
  state.globalState.failedAgents = failedAgents
  state.globalState.avgSystemLatency = totalCalls > 0 ? Math.round(totalLatency / totalCalls) : 0
  state.globalState.lastHealthCheck = Date.now()
}

const agentCircuitBreakersSlice = createSlice({
  name: 'agentCircuitBreakers',
  initialState,
  reducers: {
    // Agent call started
    agentCallStarted: (
      state,
      action: PayloadAction<{ agentType: AgentType; requestId: string }>
    ) => {
      const { agentType } = action.payload

      state.agentStatuses[agentType] = AgentStatus.PROCESSING
      state.metrics[agentType].totalCalls += 1
      state.metrics[agentType].lastCall = Date.now()
    },

    // Agent call succeeded
    agentCallSucceeded: (
      state,
      action: PayloadAction<{
        agentType: AgentType
        requestId: string
        latency: number
        confidence: number
      }>
    ) => {
      const { agentType, latency } = action.payload

      // Update circuit breaker - success resets failures in HALF_OPEN
      const breaker = state.circuitBreakers[agentType]
      if (breaker.state === CircuitBreakerState.HALF_OPEN) {
        breaker.halfOpenAttempts += 1
        if (breaker.halfOpenAttempts >= breaker.config.halfOpenTests) {
          // Circuit back to CLOSED
          breaker.state = CircuitBreakerState.CLOSED
          breaker.failures = 0
          breaker.halfOpenAttempts = 0
          breaker.lastFailure = undefined
          breaker.nextRetry = undefined
        }
      }

      // Update metrics
      const metrics = state.metrics[agentType]
      metrics.successfulCalls += 1
      metrics.currentStreak += 1
      metrics.successRate = Math.round((metrics.successfulCalls / metrics.totalCalls) * 100)

      // Update average latency
      const totalLatency = metrics.avgLatency * (metrics.totalCalls - 1) + latency
      metrics.avgLatency = Math.round(totalLatency / metrics.totalCalls)

      // Update status
      state.agentStatuses[agentType] = AgentStatus.READY

      calculateGlobalMetrics(state)
    },

    // Agent call failed
    agentCallFailed: (
      state,
      action: PayloadAction<{
        agentType: AgentType
        requestId: string
        error: string
        latency?: number
      }>
    ) => {
      const { agentType, latency } = action.payload

      // Update circuit breaker
      const breaker = state.circuitBreakers[agentType]
      breaker.failures += 1
      breaker.lastFailure = Date.now()

      // Open circuit if max failures reached
      if (breaker.failures >= breaker.config.maxFailures) {
        breaker.state = CircuitBreakerState.OPEN
        breaker.nextRetry = Date.now() + breaker.config.cooldownMs
      }

      // Update metrics
      const metrics = state.metrics[agentType]
      metrics.failedCalls += 1
      metrics.currentStreak = 0 // Reset streak on failure
      metrics.successRate = Math.round((metrics.successfulCalls / metrics.totalCalls) * 100)

      if (latency) {
        const totalLatency = metrics.avgLatency * (metrics.totalCalls - 1) + latency
        metrics.avgLatency = Math.round(totalLatency / metrics.totalCalls)
      }

      // Update status
      state.agentStatuses[agentType] =
        breaker.state === CircuitBreakerState.OPEN ? AgentStatus.FAILED : AgentStatus.READY

      calculateGlobalMetrics(state)
    },

    // Check circuit breaker state (for automatic recovery)
    checkCircuitBreaker: (state, action: PayloadAction<AgentType>) => {
      const agentType = action.payload
      const breaker = state.circuitBreakers[agentType]
      const now = Date.now()

      // Check if OPEN circuit can transition to HALF_OPEN
      if (
        breaker.state === CircuitBreakerState.OPEN &&
        breaker.nextRetry &&
        now >= breaker.nextRetry
      ) {
        breaker.state = CircuitBreakerState.HALF_OPEN
        breaker.halfOpenAttempts = 0
        state.agentStatuses[agentType] = AgentStatus.READY
      }
    },

    // Manually reset circuit breaker
    resetAgentCircuitBreaker: (state, action: PayloadAction<AgentType>) => {
      const agentType = action.payload
      state.circuitBreakers[agentType] = createInitialCircuitBreaker(
        state.circuitBreakers[agentType].config
      )
      state.agentStatuses[agentType] = AgentStatus.READY
      calculateGlobalMetrics(state)
    },

    // Enable/disable agent
    setAgentEnabled: (state, action: PayloadAction<{ agentType: AgentType; enabled: boolean }>) => {
      const { agentType, enabled } = action.payload

      if (enabled) {
        state.agentStatuses[agentType] = AgentStatus.READY
        // Reset circuit breaker when re-enabling
        state.circuitBreakers[agentType] = createInitialCircuitBreaker(
          state.circuitBreakers[agentType].config
        )
      } else {
        state.agentStatuses[agentType] = AgentStatus.DISABLED
      }

      calculateGlobalMetrics(state)
    },

    // Update circuit breaker config
    updateAgentConfig: (
      state,
      action: PayloadAction<{
        agentType: AgentType
        config: Partial<CircuitBreakerConfig>
      }>
    ) => {
      const { agentType, config } = action.payload
      state.circuitBreakers[agentType].config = {
        ...state.circuitBreakers[agentType].config,
        ...config,
      }
    },

    // Health check all agents
    performHealthCheck: state => {
      const now = Date.now()

      Object.keys(state.circuitBreakers).forEach(agentTypeKey => {
        const agentType = agentTypeKey as AgentType
        const breaker = state.circuitBreakers[agentType]

        // Auto-transition OPEN -> HALF_OPEN if cooldown expired
        if (
          breaker.state === CircuitBreakerState.OPEN &&
          breaker.nextRetry &&
          now >= breaker.nextRetry
        ) {
          breaker.state = CircuitBreakerState.HALF_OPEN
          breaker.halfOpenAttempts = 0
          if (state.agentStatuses[agentType] !== AgentStatus.DISABLED) {
            state.agentStatuses[agentType] = AgentStatus.READY
          }
        }

        // Reset very old failure states (auto-healing)
        if (breaker.lastFailure && now - breaker.lastFailure > breaker.config.resetTimeoutMs) {
          state.circuitBreakers[agentType] = createInitialCircuitBreaker(breaker.config)
          if (state.agentStatuses[agentType] !== AgentStatus.DISABLED) {
            state.agentStatuses[agentType] = AgentStatus.READY
          }
        }
      })

      calculateGlobalMetrics(state)
    },

    // Clear all metrics
    clearAgentMetrics: state => {
      Object.keys(state.metrics).forEach(agentTypeKey => {
        const agentType = agentTypeKey as AgentType
        state.metrics[agentType] = createInitialMetrics()
      })
      calculateGlobalMetrics(state)
    },
  },
})

export const {
  agentCallStarted,
  agentCallSucceeded,
  agentCallFailed,
  checkCircuitBreaker,
  resetAgentCircuitBreaker,
  setAgentEnabled,
  updateAgentConfig,
  performHealthCheck,
  clearAgentMetrics,
} = agentCircuitBreakersSlice.actions

export default agentCircuitBreakersSlice.reducer
