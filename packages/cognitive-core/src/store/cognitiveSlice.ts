// src/store/cognitiveSlice.ts
// Redux Slice para Sistema Cognitivo - Bernard Orozco

import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { DecisionResult } from '../types/agents'
import {
  CognitiveEvent,
  CognitiveEventType,
  Goal,
  SelfAssessment,
  VotingRound,
  LearningUpdate,
  MedicalConsensus,
  CognitiveInsights,
} from '../types/cognitive'
// Dynamic import to avoid circular dependency

interface HealthMetrics {
  score: number
  status: 'excellent' | 'good' | 'fair' | 'poor'
  issues: string[]
  lastUpdated: number
}

interface CognitiveState {
  // Estado cognitivo
  systemConfidence: number
  uncertaintyLevel: number
  activeGoals: Goal[]
  knowledgeGaps: string[]
  selfAssessment: SelfAssessment | null

  // Resultados de procesamiento
  lastDecisions: DecisionResult[]
  lastConsensus: MedicalConsensus | null
  lastInsights: CognitiveInsights | null

  // Métricas de salud
  overallHealth: number
  memoryHealth: HealthMetrics | null
  learningHealth: HealthMetrics | null
  consensusHealth: HealthMetrics | null
  pipelineHealth: HealthMetrics | null

  // Eventos cognitivos
  recentEvents: CognitiveEvent[]

  // Estado de procesamiento
  isProcessing: boolean
  error: string | null
}

const initialState: CognitiveState = {
  systemConfidence: 0.5,
  uncertaintyLevel: 0.5,
  activeGoals: [],
  knowledgeGaps: [],
  selfAssessment: {
    strengths: [],
    weaknesses: [],
    improvementAreas: [],
    learningProgress: 0,
    adaptationRate: 0,
  },
  lastDecisions: [],
  lastConsensus: null,
  lastInsights: null,
  overallHealth: 0.5,
  memoryHealth: null,
  learningHealth: null,
  consensusHealth: null,
  pipelineHealth: null,
  recentEvents: [],
  isProcessing: false,
  error: null,
}

// Async thunk para procesamiento cognitivo
export const processCognitively = createAsyncThunk('cognitive/process', async (input: string) => {
  // Cognitive orchestrator has been removed - use decisional middleware instead
  const { callClaudeForDecision } = await import('../services/decisional-middleware')

  const result = await callClaudeForDecision('intelligent_medical_chat', input)

  // Return a simplified structure since cognitive orchestrator is no longer available
  return {
    decision: result.decision,
    confidence: result.confidence,
    cognitiveState: {
      confidence: result.confidence,
      uncertainty: 1 - result.confidence,
      activeGoals: [],
      knowledgeGaps: [],
      selfAssessment: null
    },
    systemHealth: {
      overallHealth: result.success ? 1 : 0,
      memoryHealth: null,
      learningHealth: null,
      consensusHealth: null,
      pipelineHealth: null
    }
  }
})

const cognitiveSlice = createSlice({
  name: 'cognitive',
  initialState,
  reducers: {
    updateCognitiveState: (
      state,
      action: PayloadAction<{
        confidence: number
        uncertainty: number
        activeGoals: Goal[]
        knowledgeGaps: string[]
        selfAssessment: SelfAssessment | null
      }>
    ) => {
      const { confidence, uncertainty, activeGoals, knowledgeGaps, selfAssessment } = action.payload
      state.systemConfidence = confidence
      state.uncertaintyLevel = uncertainty
      state.activeGoals = activeGoals
      state.knowledgeGaps = knowledgeGaps
      state.selfAssessment = selfAssessment
    },

    addCognitiveEvent: (state, action: PayloadAction<CognitiveEvent>) => {
      state.recentEvents.unshift(action.payload)
      if (state.recentEvents.length > 50) {
        state.recentEvents.pop()
      }
    },

    updateSystemHealth: (
      state,
      action: PayloadAction<{
        overallHealth: number
        memoryHealth: HealthMetrics
        learningHealth: HealthMetrics
        consensusHealth: HealthMetrics
        pipelineHealth: HealthMetrics
      }>
    ) => {
      state.overallHealth = action.payload.overallHealth
      state.memoryHealth = action.payload.memoryHealth
      state.learningHealth = action.payload.learningHealth
      state.consensusHealth = action.payload.consensusHealth
      state.pipelineHealth = action.payload.pipelineHealth
    },

    updateGoalProgress: (
      state,
      action: PayloadAction<{
        goalId: string
        progress: number
      }>
    ) => {
      const goal = state.activeGoals.find(g => g.id === action.payload.goalId)
      if (goal) {
        goal.progress = action.payload.progress
      }
    },

    clearCognitiveEvents: state => {
      state.recentEvents = []
    },

    emitProcessingStep: (
      state,
      action: PayloadAction<{
        step: string
        type: 'diagnostic' | 'triage' | 'validation' | 'treatment' | 'memory' | 'consensus'
        status: 'started' | 'completed' | 'error'
        confidence?: number
      }>
    ) => {
      const event: CognitiveEvent = {
        type: CognitiveEventType.PROCESSING_STEP,
        timestamp: Date.now(),
        data: action.payload,
        impact: 'low' as const,
        requiresAttention: false,
      }
      state.recentEvents.unshift(event)
      if (state.recentEvents.length > 50) {
        state.recentEvents.pop()
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(processCognitively.pending, state => {
        state.isProcessing = true
        state.error = null
      })
      .addCase(processCognitively.fulfilled, (state, action) => {
        state.isProcessing = false
        state.lastDecisions = action.payload.decision ? [action.payload.decision] : []
        state.lastConsensus = null
        state.lastInsights = null

        // Update cognitive state
        const { cognitiveState, systemHealth } = action.payload
        state.systemConfidence = cognitiveState.confidence
        state.uncertaintyLevel = cognitiveState.uncertainty
        state.activeGoals = cognitiveState.activeGoals
        state.knowledgeGaps = cognitiveState.knowledgeGaps
        state.selfAssessment = cognitiveState.selfAssessment

        // Update health metrics
        state.overallHealth = systemHealth.overallHealth
        state.memoryHealth = systemHealth.memoryHealth
        state.learningHealth = systemHealth.learningHealth
        state.consensusHealth = systemHealth.consensusHealth
        state.pipelineHealth = systemHealth.pipelineHealth
      })
      .addCase(processCognitively.rejected, (state, action) => {
        state.isProcessing = false
        state.error = action.error.message || 'Cognitive processing failed'
      })
  },
})

export const {
  updateCognitiveState,
  addCognitiveEvent,
  updateSystemHealth,
  updateGoalProgress,
  clearCognitiveEvents,
  emitProcessingStep,
} = cognitiveSlice.actions

export default cognitiveSlice.reducer
