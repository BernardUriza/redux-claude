// src/components/StreamingProgress.tsx
// Componente de progreso para streaming cognitivo - Bernard Orozco

import React from 'react'

interface StreamingStep {
  id: string
  type: 'diagnostic' | 'triage' | 'validation' | 'treatment' | 'memory' | 'consensus'
  title: string
  description: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  confidence?: number
  metadata?: Record<string, any>
}

interface StreamingProgressProps {
  steps: StreamingStep[]
  progressPercentage: number
}

export const StreamingProgress: React.FC<StreamingProgressProps> = ({
  steps,
  progressPercentage
}) => {
  const getStepIcon = (type: string, status: string) => {
    const baseClasses = "w-4 h-4 transition-all duration-300"
    
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
      memory: '🧠',
      triage: '🚨',
      diagnostic: '🔍',
      treatment: '💊',
      validation: '✓',
      consensus: '🤝'
    }

    return (
      <span className={`${baseClasses} flex items-center justify-center text-xs`}>
        {icons[type as keyof typeof icons] || '•'}
      </span>
    )
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

  if (steps.length === 0) {
    return null
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-3 border border-slate-600/20">
      <div className="flex items-center mb-3">
        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse mr-2" />
        <span className="text-slate-300 text-xs font-medium">Procesamiento Cognitivo</span>
        <span className="text-slate-400 text-xs ml-2">
          {Math.round(progressPercentage)}%
        </span>
      </div>
      
      <div className="space-y-2">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`
              flex items-center p-2 rounded-md border transition-all duration-300
              ${getStepColor(step.type, step.status)}
            `}
          >
            <div className="flex-shrink-0 mr-2">
              {getStepIcon(step.type, step.status)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-200">
                  {step.title}
                </p>
                {step.confidence && (
                  <span className="text-xs text-slate-400">
                    {Math.round(step.confidence)}%
                  </span>
                )}
              </div>
              {step.status === 'processing' && (
                <p className="text-xs text-slate-400 mt-1">
                  {step.description}
                </p>
              )}
            </div>
            
            {step.status === 'processing' && (
              <div className="flex-shrink-0 ml-2">
                <div className="flex space-x-0.5">
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
      <div className="mt-3">
        <div className="w-full bg-slate-700 rounded-full h-1">
          <div 
            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1 rounded-full transition-all duration-500"
            style={{ 
              width: `${progressPercentage}%` 
            }}
          />
        </div>
      </div>
    </div>
  )
}