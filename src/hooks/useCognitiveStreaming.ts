// src/hooks/useCognitiveStreaming.ts
// Hook para streaming del proceso cognitivo - Bernard Orozco

import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/store/store'
import { emitProcessingStep } from '@/store/cognitiveSlice'
import { CognitiveEventType } from '@/types/cognitive'

interface StreamingStep {
  id: string
  type: 'diagnostic' | 'triage' | 'validation' | 'treatment' | 'memory' | 'consensus'
  title: string
  description: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  confidence?: number
  metadata?: Record<string, any>
}

export const useCognitiveStreaming = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { recentEvents, isProcessing } = useSelector((state: RootState) => state.cognitive)
  
  const [steps, setSteps] = useState<StreamingStep[]>([])
  const [isStreaming, setIsStreaming] = useState(false)

  // Generar pasos contextuales basados en el mensaje del usuario
  const generateContextualSteps = (message: string): StreamingStep[] => {
    const keywords = message.toLowerCase()
    const isSymptomQuery = /dolor|duele|molesta|síntoma|siento|tengo/.test(keywords)
    const isUrgent = /urgente|grave|severo|intenso|emergencia/.test(keywords)
    const isMedication = /medicamento|medicina|droga|pastilla|tratamiento/.test(keywords)
    const isDiagnostic = /diagnóstico|qué|causa|enfermedad/.test(keywords)

    const baseSteps: StreamingStep[] = [
      {
        id: 'memory',
        type: 'memory',
        title: 'Contextualizando',
        description: 'Recuperando historial y patrones relevantes...',
        status: 'pending'
      }
    ]

    if (isUrgent) {
      baseSteps.push({
        id: 'triage',
        type: 'triage',
        title: 'Evaluando Urgencia',
        description: 'Clasificando nivel de acuidad y prioridad...',
        status: 'pending'
      })
    }

    if (isSymptomQuery || isDiagnostic) {
      baseSteps.push({
        id: 'diagnostic',
        type: 'diagnostic',
        title: 'Análisis Diagnóstico',
        description: 'Evaluando síntomas y generando hipótesis...',
        status: 'pending'
      })
    }

    if (isMedication) {
      baseSteps.push({
        id: 'treatment',
        type: 'treatment',
        title: 'Plan Terapéutico',
        description: 'Diseñando estrategia de tratamiento...',
        status: 'pending'
      })
    }

    baseSteps.push(
      {
        id: 'validation',
        type: 'validation',
        title: 'Validación Cruzada',
        description: 'Verificando coherencia y seguridad...',
        status: 'pending'
      },
      {
        id: 'consensus',
        type: 'consensus',
        title: 'Consenso Multi-Agente',
        description: 'Integrando perspectivas y generando respuesta...',
        status: 'pending'
      }
    )

    return baseSteps
  }

  // Iniciar streaming
  const startStreaming = (userMessage: string) => {
    const contextualSteps = generateContextualSteps(userMessage)
    setSteps(contextualSteps)
    setIsStreaming(true)
    
    // Emitir evento de inicio
    dispatch(emitProcessingStep({
      step: 'initialization',
      type: 'memory',
      status: 'started'
    }))
  }

  // Detener streaming
  const stopStreaming = () => {
    setIsStreaming(false)
    setSteps([])
  }

  // Escuchar eventos de progreso del sistema cognitivo
  useEffect(() => {
    if (!isStreaming) return

    const processingEvents = recentEvents.filter(
      event => event.type === CognitiveEventType.PROCESSING_STEP && 
      event.timestamp > Date.now() - 30000 // Solo eventos recientes
    )

    if (processingEvents.length === 0) return

    const latestEvent = processingEvents[0]
    const eventData = latestEvent.data as any

    setSteps(prevSteps => {
      return prevSteps.map(step => {
        if (step.type === eventData.type) {
          const newStatus = eventData.status === 'started' ? 'processing' : 
                          eventData.status === 'completed' ? 'completed' : 'error'
          
          return {
            ...step,
            status: newStatus,
            confidence: eventData.confidence
          }
        }
        return step
      })
    })
  }, [recentEvents, isStreaming])

  // Auto-stop cuando termina el procesamiento
  useEffect(() => {
    if (isStreaming && !isProcessing) {
      // Marcar último paso como completado después de un breve retraso
      setTimeout(() => {
        setSteps(prevSteps => 
          prevSteps.map(step => 
            step.status === 'processing' ? { ...step, status: 'completed' } : step
          )
        )
        
        // Detener streaming después de mostrar completado
        setTimeout(() => {
          stopStreaming()
        }, 1000)
      }, 500)
    }
  }, [isProcessing, isStreaming])

  return {
    steps,
    isStreaming,
    startStreaming,
    stopStreaming,
    // Utilidades para componentes
    currentStep: steps.findIndex(step => step.status === 'processing'),
    completedSteps: steps.filter(step => step.status === 'completed').length,
    totalSteps: steps.length,
    progressPercentage: steps.length > 0 ? (steps.filter(step => step.status === 'completed').length / steps.length) * 100 : 0
  }
}