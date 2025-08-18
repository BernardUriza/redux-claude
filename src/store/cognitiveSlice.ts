// src/store/cognitiveSlice.ts
// Redux Slice para Sistema Cognitivo - Bernard Orozco

import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { DecisionResult } from '@/types/agents'
import { 
  CognitiveEvent, 
  Goal, 
  SelfAssessment,
  VotingRound,
  LearningUpdate
} from '@/types/cognitive'
import { cognitiveOrchestrator } from '@/services/cognitiveOrchestrator'

interface CognitiveState {
  // Estado cognitivo
  systemConfidence: number
  uncertaintyLevel: number
  activeGoals: Goal[]
  knowledgeGaps: string[]
  selfAssessment: SelfAssessment
  
  // Resultados de procesamiento
  lastDecisions: DecisionResult[]
  lastConsensus: VotingRound | null
  lastInsights: any
  
  // Métricas de salud
  overallHealth: number
  memoryHealth: any
  learningHealth: any
  consensusHealth: any
  pipelineHealth: any
  
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
    adaptationRate: 0
  },
  lastDecisions: [],
  lastConsensus: null,
  lastInsights: null,
  overallHealth: 0.5,
  memoryHealth: {},
  learningHealth: {},
  consensusHealth: {},
  pipelineHealth: {},
  recentEvents: [],
  isProcessing: false,
  error: null
}

// Async thunk para procesamiento cognitivo
export const processCognitively = createAsyncThunk(
  'cognitive/process',
  async (input: string) => {
    const result = await cognitiveOrchestrator.processWithCognition(input)
    const cognitiveState = cognitiveOrchestrator.getCognitiveState()
    const systemHealth = cognitiveOrchestrator.getSystemHealth()
    
    return {
      ...result,
      cognitiveState,
      systemHealth
    }
  }
)

const cognitiveSlice = createSlice({
  name: 'cognitive',
  initialState,
  reducers: {
    updateCognitiveState: (state, action: PayloadAction<{
      confidence: number
      uncertainty: number
      activeGoals: Goal[]
      knowledgeGaps: string[]
      selfAssessment: SelfAssessment
    }>) => {
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
    
    updateSystemHealth: (state, action: PayloadAction<{
      overallHealth: number
      memoryHealth: any
      learningHealth: any
      consensusHealth: any
      pipelineHealth: any
    }>) => {
      state.overallHealth = action.payload.overallHealth
      state.memoryHealth = action.payload.memoryHealth
      state.learningHealth = action.payload.learningHealth
      state.consensusHealth = action.payload.consensusHealth
      state.pipelineHealth = action.payload.pipelineHealth
    },
    
    updateGoalProgress: (state, action: PayloadAction<{
      goalId: string
      progress: number
    }>) => {
      const goal = state.activeGoals.find(g => g.id === action.payload.goalId)
      if (goal) {
        goal.progress = action.payload.progress
      }
    },
    
    clearCognitiveEvents: (state) => {
      state.recentEvents = []
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(processCognitively.pending, (state) => {
        state.isProcessing = true
        state.error = null
      })
      .addCase(processCognitively.fulfilled, (state, action) => {
        state.isProcessing = false
        state.lastDecisions = action.payload.decisions
        state.lastConsensus = action.payload.consensus
        state.lastInsights = action.payload.insights
        
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
  }
})

export const {
  updateCognitiveState,
  addCognitiveEvent,
  updateSystemHealth,
  updateGoalProgress,
  clearCognitiveEvents
} = cognitiveSlice.actions

export default cognitiveSlice.reducer