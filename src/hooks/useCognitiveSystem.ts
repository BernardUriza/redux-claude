// src/hooks/useCognitiveSystem.ts
// Hook para Sistema Cognitivo Integrado - Bernard Orozco

import { useDispatch, useSelector } from 'react-redux'
import { useCallback, useEffect } from 'react'
import { RootState, AppDispatch } from '@/store/store'
import { 
  processCognitively,
  addCognitiveEvent,
  updateSystemHealth,
  updateCognitiveState
} from '@/store/cognitiveSlice'
import { cognitiveOrchestrator } from '@/services/cognitiveOrchestrator'
import { CognitiveEventType } from '@/types/cognitive'

export const useCognitiveSystem = () => {
  const dispatch = useDispatch<AppDispatch>()
  
  const cognitiveState = useSelector((state: RootState) => state.cognitive)
  const agentStatuses = useSelector((state: RootState) => state.agentCircuitBreakers.agentStatuses)
  const agentMetrics = useSelector((state: RootState) => state.agentCircuitBreakers.metrics)
  
  // Suscribirse a eventos cognitivos
  useEffect(() => {
    // Escuchar eventos de aprendizaje
    cognitiveOrchestrator.addEventListener(
      CognitiveEventType.LEARNING_MILESTONE,
      (event: any) => {
        dispatch(addCognitiveEvent(event))
      }
    )
    
    // Escuchar consenso alcanzado
    cognitiveOrchestrator.addEventListener(
      CognitiveEventType.CONSENSUS_ACHIEVED,
      (event: any) => {
        dispatch(addCognitiveEvent(event))
      }
    )
    
    // Escuchar adaptación de pipeline
    cognitiveOrchestrator.addEventListener(
      CognitiveEventType.PIPELINE_ADAPTED,
      (event: any) => {
        dispatch(addCognitiveEvent(event))
      }
    )
    
    // Escuchar anomalías
    cognitiveOrchestrator.addEventListener(
      CognitiveEventType.ANOMALY_DETECTED,
      (event: any) => {
        dispatch(addCognitiveEvent(event))
        console.warn('[COGNITIVE ANOMALY]:', event.data)
      }
    )
    
    // Actualizar salud del sistema periódicamente
    const healthInterval = setInterval(() => {
      const health = cognitiveOrchestrator.getSystemHealth()
      dispatch(updateSystemHealth(health))
      
      const state = cognitiveOrchestrator.getCognitiveState()
      dispatch(updateCognitiveState(state))
    }, 5000) // Cada 5 segundos
    
    return () => {
      clearInterval(healthInterval)
    }
  }, [dispatch])
  
  // Procesar input con cognición completa
  const processWithCognition = useCallback(async (input: string) => {
    try {
      const result = await dispatch(processCognitively(input)).unwrap()
      return result
    } catch (error) {
      console.error('Cognitive processing failed:', error)
      throw error
    }
  }, [dispatch])
  
  // Obtener métricas cognitivas formateadas
  const getCognitiveMetrics = useCallback(() => {
    return {
      // Métricas de confianza
      systemConfidence: Math.round(cognitiveState.systemConfidence * 100),
      uncertaintyLevel: Math.round(cognitiveState.uncertaintyLevel * 100),
      
      // Salud del sistema
      overallHealth: Math.round(cognitiveState.overallHealth * 100),
      memoryLoad: cognitiveState.memoryHealth.load || 0,
      learningProgress: cognitiveState.selfAssessment.learningProgress,
      
      // Consenso
      consensusRate: Math.round((cognitiveState.consensusHealth.consensusRate || 0) * 100),
      activeDebates: cognitiveState.consensusHealth.activeDebates || 0,
      
      // Pipeline
      pipelineSuccess: Math.round((cognitiveState.pipelineHealth.successRate || 0) * 100),
      avgLatency: Math.round(cognitiveState.pipelineHealth.avgLatency || 0),
      
      // Objetivos y gaps
      activeGoals: cognitiveState.activeGoals.length,
      knowledgeGaps: cognitiveState.knowledgeGaps.length,
      
      // Fortalezas y debilidades
      strengths: cognitiveState.selfAssessment.strengths.length,
      weaknesses: cognitiveState.selfAssessment.weaknesses.length
    }
  }, [cognitiveState])
  
  // Obtener insights del último procesamiento
  const getLastInsights = useCallback(() => {
    if (!cognitiveState.lastInsights) return null
    
    return {
      pattern: cognitiveState.lastInsights.pattern,
      recommendation: cognitiveState.lastInsights.recommendation,
      confidence: cognitiveState.lastInsights.confidence,
      learnings: cognitiveState.lastInsights.learnings || []
    }
  }, [cognitiveState.lastInsights])
  
  // Obtener eventos críticos
  const getCriticalEvents = useCallback(() => {
    return cognitiveState.recentEvents.filter(e => 
      e.impact === 'high' || e.requiresAttention
    )
  }, [cognitiveState.recentEvents])
  
  // Obtener estado de agentes mejorado con cognición
  const getEnhancedAgentStatus = useCallback(() => {
    const agentData = Object.entries(agentStatuses).map(([agentType, status]) => {
      const metrics = (agentMetrics as any)[agentType]
      const learningMetrics = (cognitiveState.learningHealth as any)[agentType] || {}
      
      return {
        agentType,
        status,
        successRate: metrics?.successRate || 0,
        avgLatency: metrics?.avgLatency || 0,
        trend: learningMetrics.trend || 'stable',
        adaptedPriority: learningMetrics.adaptedPriority || 5,
        isTopPerformer: cognitiveState.learningHealth.topPerformers?.includes(agentType) || false
      }
    })
    
    return agentData
  }, [agentStatuses, agentMetrics, cognitiveState.learningHealth])
  
  return {
    // Estado
    cognitiveState,
    isProcessing: cognitiveState.isProcessing,
    error: cognitiveState.error,
    
    // Acciones
    processWithCognition,
    
    // Métricas y análisis
    cognitiveMetrics: getCognitiveMetrics(),
    lastInsights: getLastInsights(),
    criticalEvents: getCriticalEvents(),
    enhancedAgentStatus: getEnhancedAgentStatus(),
    
    // Datos en bruto
    lastDecisions: cognitiveState.lastDecisions,
    lastConsensus: cognitiveState.lastConsensus,
    activeGoals: cognitiveState.activeGoals,
    knowledgeGaps: cognitiveState.knowledgeGaps,
    selfAssessment: cognitiveState.selfAssessment
  }
}