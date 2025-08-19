// src/components/CognitiveStreaming.tsx
// Streaming Visual del Proceso Cognitivo - Bernard Orozco

import React, { useState, useEffect, useRef } from 'react'

interface StreamingStep {
  id: string
  type: 'diagnostic' | 'triage' | 'validation' | 'treatment' | 'memory' | 'consensus'
  title: string
  description: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  confidence?: number
  metadata?: Record<string, any>
}

interface CognitiveStreamingProps {
  isActive: boolean
  userMessage?: string
  onComplete?: () => void
}

export const CognitiveStreaming: React.FC<CognitiveStreamingProps> = ({
  isActive,
  userMessage = '',
  onComplete
}) => {
  const [steps, setSteps] = useState<StreamingStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined)

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

  // Inicializar pasos cuando se activa
  useEffect(() => {
    if (isActive) {
      const contextualSteps = generateContextualSteps(userMessage)
      setSteps(contextualSteps)
      setCurrentStep(0)
      
      // Iniciar procesamiento
      startStreaming(contextualSteps)
    } else {
      // Limpiar cuando se desactiva
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      setSteps([])
      setCurrentStep(0)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, userMessage])

  const startStreaming = (steps: StreamingStep[]) => {
    let stepIndex = 0
    
    const processStep = () => {
      if (stepIndex >= steps.length) {
        // Completar streaming
        setTimeout(() => {
          onComplete?.()
        }, 500)
        return
      }

      // Marcar paso actual como procesando
      setSteps(prev => prev.map((step, idx) => 
        idx === stepIndex 
          ? { ...step, status: 'processing' }
          : step
      ))
      setCurrentStep(stepIndex)

      // Simular tiempo de procesamiento variable según el tipo
      const processingTime = getProcessingTime(steps[stepIndex].type)
      
      setTimeout(() => {
        // Marcar paso como completado
        setSteps(prev => prev.map((step, idx) => 
          idx === stepIndex 
            ? { 
                ...step, 
                status: 'completed',
                confidence: Math.random() * 30 + 70 // 70-100%
              }
            : step
        ))

        // Continuar con el siguiente paso
        stepIndex++
        processStep()
      }, processingTime)
    }

    processStep()
  }

  const getProcessingTime = (type: string): number => {
    const times = {
      memory: 800,
      triage: 1200,
      diagnostic: 2000,
      treatment: 1500,
      validation: 1000,
      consensus: 1300
    }
    return times[type as keyof typeof times] || 1000
  }

  const getStepIcon = (type: string, status: string) => {
    const baseClasses = "w-5 h-5 transition-all duration-300"
    
    if (status === 'processing') {
      return <div className={`${baseClasses} animate-spin border-2 border-cyan-400 border-t-transparent rounded-full`} />
    }
    
    if (status === 'completed') {
      return (
        <svg className={`${baseClasses} text-emerald-400`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )
    }

    // Iconos por tipo
    const icons = {
      memory: (
        <svg className={baseClasses} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      triage: (
        <svg className={baseClasses} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
      diagnostic: (
        <svg className={baseClasses} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      treatment: (
        <svg className={baseClasses} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V8z" clipRule="evenodd" />
        </svg>
      ),
      validation: (
        <svg className={baseClasses} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      consensus: (
        <svg className={baseClasses} fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
        </svg>
      )
    }

    return icons[type as keyof typeof icons] || icons.memory
  }

  const getStepColor = (type: string, status: string) => {
    if (status === 'completed') return 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5'
    if (status === 'processing') return 'text-cyan-400 border-cyan-400/50 bg-cyan-400/10'
    
    const colors = {
      memory: 'text-purple-400 border-purple-400/20 bg-purple-400/5',
      triage: 'text-red-400 border-red-400/20 bg-red-400/5',
      diagnostic: 'text-blue-400 border-blue-400/20 bg-blue-400/5',
      treatment: 'text-green-400 border-green-400/20 bg-green-400/5',
      validation: 'text-amber-400 border-amber-400/20 bg-amber-400/5',
      consensus: 'text-indigo-400 border-indigo-400/20 bg-indigo-400/5'
    }
    
    return colors[type as keyof typeof colors] || 'text-slate-400 border-slate-400/20 bg-slate-400/5'
  }

  if (!isActive || steps.length === 0) {
    return null
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30 mb-4">
      <div className="flex items-center mb-3">
        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse mr-3" />
        <span className="text-slate-300 text-sm font-medium">Procesamiento Cognitivo</span>
      </div>
      
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`
              flex items-center p-3 rounded-lg border transition-all duration-500
              ${getStepColor(step.type, step.status)}
              ${index <= currentStep ? 'opacity-100 transform translate-x-0' : 'opacity-50 transform translate-x-2'}
            `}
          >
            <div className="flex-shrink-0 mr-3">
              {getStepIcon(step.type, step.status)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-200">
                  {step.title}
                </p>
                {step.confidence && (
                  <span className="text-xs text-slate-400">
                    {Math.round(step.confidence)}%
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {step.description}
              </p>
            </div>
            
            {step.status === 'processing' && (
              <div className="flex-shrink-0 ml-3">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Barra de progreso */}
      <div className="mt-4">
        <div className="w-full bg-slate-700 rounded-full h-1">
          <div 
            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1 rounded-full transition-all duration-500"
            style={{ 
              width: `${((currentStep + 1) / steps.length) * 100}%` 
            }}
          />
        </div>
      </div>
    </div>
  )
}