// src/store/decisionsSlice.ts
// Creado por Bernard Orozco
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { 
  DecisionsState, 
  DecisionItem, 
  ProviderType, 
  DecisionStatus,
  CircuitBreakerState 
} from '../types/decisional'
import { AuditEntry } from '../types/audit'

const initialCircuitBreaker: CircuitBreakerState = {
  isOpen: false,
  failureCount: 0,
  lastFailureTime: 0,
  nextRetryTime: 0
}

const initialState: DecisionsState = {
  items: [],
  activeProvider: ProviderType.CLAUDE,
  loading: false,
  error: null,
  totalProcessed: 0,
  averageConfidence: 0,
  averageLatency: 0,
  circuitBreaker: {
    [ProviderType.CLAUDE]: { ...initialCircuitBreaker },
    [ProviderType.OPENAI]: { ...initialCircuitBreaker },
    [ProviderType.LOCAL]: { ...initialCircuitBreaker }
  },
  auditEntries: [],
  sessionQuality: {
    clinicalCoherence: 100,
    safetyScore: 100,
    decisionQuality: 100,
    recommendationLevel: 'safe'
  }
}

const calculateAverages = (items: DecisionItem[]) => {
  if (items.length === 0) return { confidence: 0, latency: 0 }
  
  const successfulItems = items.filter(item => item.status === DecisionStatus.SUCCESS)
  if (successfulItems.length === 0) return { confidence: 0, latency: 0 }
  
  const totalConfidence = successfulItems.reduce((sum, item) => sum + item.confidence, 0)
  const totalLatency = successfulItems.reduce((sum, item) => sum + item.latency, 0)
  
  return {
    confidence: Math.round(totalConfidence / successfulItems.length),
    latency: Math.round(totalLatency / successfulItems.length)
  }
}

const decisionsSlice = createSlice({
  name: 'decisions',
  initialState,
  reducers: {
    // Optimistic decision start
    startDecision: (state, action: PayloadAction<{
      id: string
      provider: ProviderType
      query: string
    }>) => {
      const newDecision: Partial<DecisionItem> = {
        id: action.payload.id,
        provider: action.payload.provider,
        status: DecisionStatus.PENDING,
        timestamp: Date.now(),
        retryCount: 0,
        originalQuery: action.payload.query
      }
      
      state.items.unshift(newDecision as DecisionItem)
      state.loading = true
      state.error = null
    },

    // Complete decision with data
    completeDecision: (state, action: PayloadAction<DecisionItem>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id)
      if (index !== -1) {
        state.items[index] = action.payload
        state.totalProcessed += 1
        
        // Reset circuit breaker on success
        state.circuitBreaker[action.payload.provider] = { ...initialCircuitBreaker }
      }
      
      state.loading = false
      const averages = calculateAverages(state.items)
      state.averageConfidence = averages.confidence
      state.averageLatency = averages.latency
    },

    // Fail decision
    failDecision: (state, action: PayloadAction<{
      id: string
      provider: ProviderType
      error: string
    }>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id)
      if (index !== -1) {
        state.items[index].status = DecisionStatus.FAILED
        state.items[index].retryCount += 1
      }
      
      // Update circuit breaker
      const breaker = state.circuitBreaker[action.payload.provider]
      breaker.failureCount += 1
      breaker.lastFailureTime = Date.now()
      
      // Open circuit if too many failures
      if (breaker.failureCount >= 3) {
        breaker.isOpen = true
        breaker.nextRetryTime = Date.now() + (60000 * Math.pow(2, breaker.failureCount - 3)) // Exponential backoff
      }
      
      state.loading = false
      state.error = action.payload.error
    },

    // Retry decision
    retryDecision: (state, action: PayloadAction<string>) => {
      const index = state.items.findIndex(item => item.id === action.payload)
      if (index !== -1) {
        state.items[index].status = DecisionStatus.RETRYING
        state.items[index].retryCount += 1
      }
      state.loading = true
      state.error = null
    },

    // Switch provider
    setActiveProvider: (state, action: PayloadAction<ProviderType>) => {
      state.activeProvider = action.payload
    },

    // Clear old decisions (keep last 50)
    pruneDecisions: (state) => {
      if (state.items.length > 50) {
        state.items = state.items.slice(0, 50)
      }
    },

    // Reset circuit breaker manually
    resetCircuitBreaker: (state, action: PayloadAction<ProviderType>) => {
      state.circuitBreaker[action.payload] = { ...initialCircuitBreaker }
    },

    // Add audit entries
    addAuditEntries: (state, action: PayloadAction<AuditEntry[]>) => {
      state.auditEntries.push(...action.payload)
      
      // Update session quality based on audit entries
      const critical = state.auditEntries.filter(e => e.level === 'critical').length
      const warnings = state.auditEntries.filter(e => e.level === 'warning').length
      const total = Math.max(state.totalProcessed, 1)
      
      state.sessionQuality.clinicalCoherence = Math.max(0, 100 - (critical * 50 / total) - (warnings * 20 / total))
      state.sessionQuality.safetyScore = Math.max(0, 100 - (critical * 30) - (warnings * 10))
      state.sessionQuality.decisionQuality = Math.max(0, 100 - (critical * 40 / total) - (warnings * 15 / total))
      
      if (critical > 0) {
        state.sessionQuality.recommendationLevel = 'clinical_oversight_needed'
      } else if (warnings > 2) {
        state.sessionQuality.recommendationLevel = 'review_required'
      } else {
        state.sessionQuality.recommendationLevel = 'safe'
      }
    },

    // Clear all decisions
    clearDecisions: (state) => {
      state.items = []
      state.totalProcessed = 0
      state.averageConfidence = 0
      state.averageLatency = 0
      state.error = null
      state.auditEntries = []
      state.sessionQuality = {
        clinicalCoherence: 100,
        safetyScore: 100,
        decisionQuality: 100,
        recommendationLevel: 'safe'
      }
    }
  }
})

export const {
  startDecision,
  completeDecision,
  failDecision,
  retryDecision,
  setActiveProvider,
  pruneDecisions,
  resetCircuitBreaker,
  addAuditEntries,
  clearDecisions
} = decisionsSlice.actions

export default decisionsSlice.reducer