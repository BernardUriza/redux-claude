// src/hooks/useDecisionalGateway.ts
// Creado por Bernard Orozco
import { useDispatch, useSelector } from 'react-redux'
import { useCallback, useRef, useEffect, useMemo } from 'react'
import { RootState, AppDispatch } from '@/store/store'
import { 
  startDecision, 
  completeDecision, 
  failDecision, 
  retryDecision,
  pruneDecisions,
  addAuditEntries 
} from '@/store/decisionsSlice'
import { 
  ProviderType, 
  DecisionType, 
  DecisionItem, 
  DecisionStatus,
  DiagnosisDecision,
  ValidationDecision 
} from '@/types/decisional'
import { nanoid } from '@reduxjs/toolkit'

import { callClaudeForDecision, getAvailableProvider } from '@/services/decisionalMiddleware'
import { auditEngine } from '@/services/auditEngine'

// Circuit breaker utility
const isCircuitOpen = (provider: ProviderType, state: RootState): boolean => {
  const breaker = state.decisions.circuitBreaker[provider]
  if (!breaker.isOpen) return false
  
  // Check if retry time has passed
  if (Date.now() > breaker.nextRetryTime) {
    return false // Circuit can be tried again
  }
  
  return true
}

export const useDecisionalGateway = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { 
    items, 
    activeProvider, 
    loading, 
    error,
    totalProcessed,
    averageConfidence,
    averageLatency,
    circuitBreaker,
    auditEntries,
    sessionQuality
  } = useSelector((state: RootState) => state.decisions)
  
  const requestAbortControllerRef = useRef<AbortController | null>(null)
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (requestAbortControllerRef.current) {
        requestAbortControllerRef.current.abort()
      }
    }
  }, [])

  const detectDecisionType = (query: string): DecisionType => {
    const lowerQuery = query.toLowerCase()
    const validationKeywords = ['validar', 'aprobar', 'revisar', 'confirmar', 'verificar', 'revisar plan', 'verificar tratamiento']
    
    return validationKeywords.some(keyword => lowerQuery.includes(keyword))
      ? DecisionType.VALIDATION
      : DecisionType.DIAGNOSIS
  }

  const shouldTriggerMultipleDecisions = (query: string): boolean => {
    const lowerQuery = query.toLowerCase()
    const multiTriggers = [
      'síntomas', 'análisis completo', 'evaluación', 'historia clínica',
      'seguimiento', 'plan de tratamiento', 'diagnóstico diferencial'
    ]
    
    return multiTriggers.some(trigger => lowerQuery.includes(trigger)) || query.length > 100
  }


  const processDecision = useCallback(async (query: string): Promise<string> => {
    // Cancel any ongoing request
    if (requestAbortControllerRef.current) {
      requestAbortControllerRef.current.abort()
    }
    
    requestAbortControllerRef.current = new AbortController()
    const decisionId = nanoid()
    const decisionType = detectDecisionType(query)
    
    // Check circuit breaker and select provider using Redux selector
    let selectedProvider = activeProvider
    
    if (isCircuitOpen(selectedProvider, { decisions: { circuitBreaker } } as RootState)) {
      selectedProvider = getAvailableProvider(selectedProvider)
      
      if (isCircuitOpen(selectedProvider, { decisions: { circuitBreaker } } as RootState)) {
        throw new Error('All providers are unavailable')
      }
    }
    
    // Start optimistic decision
    dispatch(startDecision({
      id: decisionId,
      provider: selectedProvider,
      query
    }))
    
    try {
      // Get previous decisions for context
      const previousDecisions = items.slice(-3).map(item => ({
        type: item.type,
        decision: item.decision,
        confidence: item.confidence
      }))

      const response = await callClaudeForDecision(
        decisionType,
        query,
        selectedProvider,
        requestAbortControllerRef.current.signal,
        previousDecisions
      )
      
      const completedDecision: DecisionItem = {
        id: decisionId,
        provider: response.provider, // Use actual provider used (might be fallback)
        type: decisionType,
        decision: response.decision,
        confidence: response.confidence,
        latency: response.latency,
        timestamp: Date.now(),
        status: DecisionStatus.SUCCESS,
        retryCount: 0,
        originalQuery: query
      }
      
      dispatch(completeDecision(completedDecision))
      
      // Perform audit analysis
      const auditEntries = auditEngine.auditDecision(completedDecision, items)
      if (auditEntries.length > 0) {
        dispatch(addAuditEntries(auditEntries))
      }
      
      dispatch(pruneDecisions()) // Keep only last 50
      
      // Trigger additional decisions for complex cases
      if (shouldTriggerMultipleDecisions(query)) {
        setTimeout(async () => {
          // Trigger validation decision if we just made a diagnosis
          if (decisionType === DecisionType.DIAGNOSIS) {
            const validationQuery = `Validar el plan de diagnóstico propuesto para: ${query}`
            try {
              await processDecision(validationQuery)
            } catch (error) {
              console.warn('Auto-validation failed:', error)
            }
          }
        }, 2000) // 2 second delay
      }
      
      return decisionId
      
    } catch (error) {
      if (error instanceof Error && error.message !== 'Request aborted') {
        dispatch(failDecision({
          id: decisionId,
          provider: selectedProvider,
          error: error.message
        }))
        
        // Auto-retry once with exponential backoff
        setTimeout(() => {
          if (requestAbortControllerRef.current?.signal.aborted) return
          dispatch(retryDecision(decisionId))
        }, 2000)
      }
      
      throw error
    }
  }, [activeProvider, dispatch])

  const retryFailedDecision = useCallback(async (decisionId: string) => {
    const decision = items.find(item => item.id === decisionId)
    if (!decision) return
    
    dispatch(retryDecision(decisionId))
    
    try {
      await processDecision(decision.originalQuery)
    } catch (error) {
      console.error('Retry failed:', error)
    }
  }, [items, processDecision, dispatch])

  // Memoized stats calculation
  const stats = useMemo(() => {
    const successCount = items.filter(d => d.status === DecisionStatus.SUCCESS).length
    const successRate = items.length > 0 ? Math.round((successCount / items.length) * 100) : 0
    
    return {
      totalProcessed,
      averageConfidence,
      averageLatency,
      successRate
    }
  }, [items, totalProcessed, averageConfidence, averageLatency])

  return {
    // State
    decisions: items,
    activeProvider,
    loading,
    error,
    stats,
    circuitBreaker,
    auditEntries,
    sessionQuality,
    
    // Actions
    processDecision,
    retryFailedDecision,
    
    // Utils
    detectDecisionType,
    getAuditReport: () => auditEngine.generateAuditReport()
  }
}

