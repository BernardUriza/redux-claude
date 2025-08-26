// src/components/IterativeDiagnosticProgress.tsx
// Componente de Progreso Diagnóstico Iterativo - Creado por Bernard Orozco

'use client'

import { useSelector } from 'react-redux'
import { RootState } from '@redux-claude/cognitive-core'
import { selectDiagnosticProgress } from '@redux-claude/cognitive-core/src/store/selectors'

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
    if (isActive)
      return (
        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      )
    if (isCompleted) return '✅'
    return '⏳'
  }

  return (
    <div
      className={`relative bg-gradient-to-r ${getStatusColor()} bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-opacity-20 ${
        isActive
          ? 'border-blue-500 shadow-lg shadow-blue-500/20'
          : isCompleted
            ? 'border-emerald-500'
            : 'border-slate-600'
      } transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              isActive
                ? 'bg-blue-500 text-white'
                : isCompleted
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-600 text-slate-300'
            }`}
          >
            {cycle.cycleNumber}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Ciclo {cycle.cycleNumber}</h4>
            <p className="text-xs text-slate-400">{cycle.latency}ms</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span
            className={`text-xs font-medium ${
              isActive ? 'text-blue-400' : isCompleted ? 'text-emerald-400' : 'text-slate-400'
            }`}
          >
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
            <p key={idx} className="text-xs text-slate-300 truncate">
              • {insight}
            </p>
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
            isActive
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
              : isCompleted
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                : 'bg-slate-600'
          }`}
          style={{ width: `${Math.round(cycle.confidence * 100)}%` }}
        />
      </div>
    </div>
  )
}

export const IterativeDiagnosticProgress = () => {
  // ⚡ ESTADO REAL MULTINÚCLEO - Mock Data COMPLETAMENTE ELIMINADO
  const diagnosticProgress = useSelector(selectDiagnosticProgress)
  const isLoading = useSelector((state: RootState) =>
    Object.values(state.medicalChat.cores).some(core => core.isLoading)
  )
  const error = useSelector((state: RootState) => state.medicalChat.sharedState.error)

  // Estados de error reales
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gradient-to-br from-red-700 to-red-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">❌</span>
        </div>
        <h3 className="text-red-400 font-semibold mb-2">Error en progreso diagnóstico</h3>
        <p className="text-slate-400 text-sm">{error}</p>
      </div>
    )
  }

  // No mostrar si no hay progreso diagnóstico
  if (!diagnosticProgress || diagnosticProgress.totalCycles === 0) {
    return null
  }

  // Debug real progress (no fake data)
  console.log('🔬 IterativeDiagnosticProgress DEBUG - Real Progress:', diagnosticProgress)
  console.log(
    '🔬 IterativeDiagnosticProgress DEBUG - Current Phase:',
    diagnosticProgress.currentPhase
  )
  console.log(
    '🔬 IterativeDiagnosticProgress DEBUG - Phases Completed:',
    diagnosticProgress.phasesCompleted
  )

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
            Ciclo {diagnosticProgress.currentCycle}/{diagnosticProgress.totalCycles}
          </span>
          {isLoading && <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />}
        </div>
      </div>

      {/* Overall Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-slate-400">Confianza Global</span>
          <span className="text-sm font-semibold text-white">
            {Math.round(diagnosticProgress.completionPercentage)}%
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.round(diagnosticProgress.completionPercentage)}%` }}
          />
        </div>
      </div>

      {/* Cycles Grid - Progreso Real Multinúcleo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Mostrar fases completadas como ciclos */}
        {diagnosticProgress.phasesCompleted.map((phase: string, index: number) => {
          const cycleData = {
            id: `cycle_${phase}_${index}`,
            cycleNumber: index + 1,
            timestamp: diagnosticProgress.lastPhaseChange,
            latency: diagnosticProgress.estimatedTimeRemaining || 0,
            confidence: diagnosticProgress.completionPercentage / 100,
            qualityScore: diagnosticProgress.completionPercentage,
            analysis: {
              diagnostico_principal: `Fase ${phase} completada`,
              subjetivo: `Progreso en ${diagnosticProgress.currentPhase}`,
            },
            insights: [
              `Fase ${phase} procesada con éxito`,
              `Avanzando hacia ${diagnosticProgress.currentPhase}`,
            ],
          }

          return (
            <DiagnosticCycleDisplay
              key={cycleData.id}
              cycle={cycleData}
              isActive={false}
              isCompleted={true}
            />
          )
        })}

        {/* Ciclo actual si está en progreso */}
        {isLoading && diagnosticProgress.currentPhase && (
          <DiagnosticCycleDisplay
            key={`current_${diagnosticProgress.currentPhase}`}
            cycle={{
              id: `current_${diagnosticProgress.currentPhase}`,
              cycleNumber: diagnosticProgress.currentCycle,
              timestamp: Date.now(),
              latency: diagnosticProgress.estimatedTimeRemaining || 0,
              confidence: diagnosticProgress.completionPercentage / 100,
              qualityScore: diagnosticProgress.completionPercentage,
              analysis: {
                diagnostico_principal: `Procesando ${diagnosticProgress.currentPhase}`,
                subjetivo: diagnosticProgress.isStalled
                  ? 'Proceso estancado'
                  : 'En progreso activo',
              },
              insights: [
                `Fase actual: ${diagnosticProgress.currentPhase}`,
                `Tiempo estimado: ${Math.round(diagnosticProgress.estimatedTimeRemaining / 1000)}s`,
              ],
            }}
            isActive={true}
            isCompleted={false}
          />
        )}

        {/* Future cycles placeholder */}
        {Array.from({
          length: Math.max(0, diagnosticProgress.totalCycles - diagnosticProgress.currentCycle),
        }).map((_, index) => (
          <div
            key={`future-${index}`}
            className="bg-slate-800/20 border border-slate-700/50 rounded-xl p-4 border-dashed"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-500 flex items-center justify-center text-sm">
                {diagnosticProgress.currentCycle + index + 1}
              </div>
              <div>
                <h4 className="text-sm text-slate-500">Ciclo Pendiente</h4>
                <p className="text-xs text-slate-600">Esperando...</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Processing Time - Métricas Reales */}
      {diagnosticProgress.estimatedTimeRemaining > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-700">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Tiempo estimado restante:</span>
            <span>{Math.round(diagnosticProgress.estimatedTimeRemaining / 1000)}s</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>Fase actual:</span>
            <span className="capitalize">{diagnosticProgress.currentPhase}</span>
          </div>
        </div>
      )}

      {/* Stalled Warning */}
      {diagnosticProgress.isStalled && (
        <div className="mt-3 bg-yellow-950/30 border border-yellow-600/30 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-400">⚠️</span>
            <p className="text-xs text-yellow-300">
              El progreso diagnóstico parece haberse estancado
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
