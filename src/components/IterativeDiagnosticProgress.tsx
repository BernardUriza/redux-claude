// src/components/IterativeDiagnosticProgress.tsx
// Componente de Progreso Diagnóstico Iterativo - Creado por Bernard Orozco

'use client'

import { useSelector } from 'react-redux'
import { RootState } from '@redux-claude/cognitive-core'

interface DiagnosticCycleDisplayProps {
  cycle: {
    id: string
    cycleNumber: number
    timestamp: number
    latency: number
    confidence: number
    qualityScore: number
    analysis: {
      diagnostico_principal?: string
      subjetivo?: string
    }
    insights: string[]
  }
  isActive: boolean
  isCompleted: boolean
}

const DiagnosticCycleDisplay = ({ cycle, isActive, isCompleted }: DiagnosticCycleDisplayProps) => {
  const getStatusColor = () => {
    if (isActive) return 'from-blue-500 to-cyan-500'
    if (isCompleted) return 'from-emerald-500 to-teal-500'
    return 'from-slate-600 to-slate-700'
  }

  const getStatusIcon = () => {
    if (isActive) return (
      <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
    )
    if (isCompleted) return '✅'
    return '⏳'
  }

  return (
    <div className={`relative bg-gradient-to-r ${getStatusColor()} bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-opacity-20 ${
      isActive ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 
      isCompleted ? 'border-emerald-500' : 'border-slate-600'
    } transition-all duration-300`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            isActive ? 'bg-blue-500 text-white' :
            isCompleted ? 'bg-emerald-500 text-white' :
            'bg-slate-600 text-slate-300'
          }`}>
            {cycle.cycleNumber}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Ciclo {cycle.cycleNumber}</h4>
            <p className="text-xs text-slate-400">{cycle.latency}ms</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className={`text-xs font-medium ${
            isActive ? 'text-blue-400' :
            isCompleted ? 'text-emerald-400' :
            'text-slate-400'
          }`}>
            {Math.round(cycle.confidence * 100)}%
          </span>
        </div>
      </div>

      {cycle.analysis.diagnostico_principal && (
        <div className="bg-slate-900/50 rounded-lg p-3 mb-3">
          <p className="text-xs text-slate-400 mb-1">Diagnóstico Principal:</p>
          <p className="text-sm text-white truncate">{cycle.analysis.diagnostico_principal}</p>
        </div>
      )}

      {cycle.insights.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-slate-400">Insights:</p>
          {cycle.insights.slice(0, 2).map((insight, idx) => (
            <p key={idx} className="text-xs text-slate-300 truncate">• {insight}</p>
          ))}
          {cycle.insights.length > 2 && (
            <p className="text-xs text-slate-500">+{cycle.insights.length - 2} more insights</p>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div className="mt-3 w-full bg-slate-700 rounded-full h-1">
        <div 
          className={`h-1 rounded-full transition-all duration-500 ${
            isActive ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
            isCompleted ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
            'bg-slate-600'
          }`}
          style={{ width: `${Math.round(cycle.confidence * 100)}%` }}
        />
      </div>
    </div>
  )
}

export const IterativeDiagnosticProgress = () => {
  // 🧠 MULTINÚCLEO: Mock data temporal para mantener funcionalidad
  const mockIterativeState = {
    diagnosticCycles: [],
    currentCycle: 0,
    confidence: 0.8,
    isComplete: false
  }
  const mockIsStreaming = false

  if (mockIterativeState.diagnosticCycles.length === 0) {
    return null
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs">🔬</span>
          </div>
          <h3 className="text-lg font-semibold text-white">Diagnóstico Iterativo</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-400">
            Ciclo {mockIterativeState.currentCycle}/{3}
          </span>
          {mockIsStreaming && (
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          )}
        </div>
      </div>

      {/* Overall Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-slate-400">Confianza Global</span>
          <span className="text-sm font-semibold text-white">
            {Math.round(mockIterativeState.confidence * 100)}%
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.round(mockIterativeState.confidence * 100)}%` }}
          />
        </div>
      </div>

      {/* Cycles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {mockIterativeState.diagnosticCycles.map((cycle: any, index: number) => (
          <DiagnosticCycleDisplay
            key={cycle.id}
            cycle={cycle}
            isActive={mockIsStreaming && index === mockIterativeState.diagnosticCycles.length - 1}
            isCompleted={index < mockIterativeState.diagnosticCycles.length - 1 || !mockIsStreaming}
          />
        ))}
        
        {/* Future cycles placeholder */}
        {Array.from({ length: Math.max(0, 3 - mockIterativeState.diagnosticCycles.length) }).map((_, index) => (
          <div 
            key={`future-${index}`}
            className="bg-slate-800/20 border border-slate-700/50 rounded-xl p-4 border-dashed"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-500 flex items-center justify-center text-sm">
                {mockIterativeState.diagnosticCycles.length + index + 1}
              </div>
              <div>
                <h4 className="text-sm text-slate-500">Ciclo Pendiente</h4>
                <p className="text-xs text-slate-600">Esperando...</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Processing Time */}
      {false && (
        <div className="mt-4 pt-3 border-t border-slate-700">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Tiempo de procesamiento:</span>
            <span>{Math.round(0)}ms</span>
          </div>
        </div>
      )}
    </div>
  )
}