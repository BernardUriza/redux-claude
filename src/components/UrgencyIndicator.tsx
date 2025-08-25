// src/components/UrgencyIndicator.tsx
// Indicador de Urgencia Médica Defensiva - Creado por Bernard Orozco

'use client'

import { useState } from 'react'

export interface UrgencyData {
  level: 'critical' | 'high' | 'medium' | 'low'
  gravityScore: number
  urgentPatterns: string[]
  immediateActions: string[]
  riskFactors: string[]
  timeToAction: string
  triageCategory: string
  specialistRequired: boolean
}

interface UrgencyIndicatorProps {
  urgencyData: UrgencyData
  className?: string
}

const UrgencyLevelConfig = {
  critical: {
    color: 'from-red-600 to-red-500',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-300',
    icon: '🚨',
    label: 'CRÍTICO',
    description: 'Requiere atención inmediata',
  },
  high: {
    color: 'from-orange-600 to-orange-500',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/30',
    textColor: 'text-orange-300',
    icon: '⚠️',
    label: 'ALTO',
    description: 'Urgente - Atender en < 1 hora',
  },
  medium: {
    color: 'from-yellow-600 to-yellow-500',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/30',
    textColor: 'text-yellow-300',
    icon: '🟡',
    label: 'MEDIO',
    description: 'Prioritario - Atender en < 4 horas',
  },
  low: {
    color: 'from-green-600 to-green-500',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/30',
    textColor: 'text-green-300',
    icon: '🟢',
    label: 'BAJO',
    description: 'Rutinario - Atender en < 24 horas',
  },
}

const ActionCard = ({
  title,
  actions,
  color,
}: {
  title: string
  actions: string[]
  color: string
}) => (
  <div
    className={`bg-gradient-to-br ${color} bg-opacity-10 backdrop-blur-sm rounded-lg p-3 border border-opacity-20`}
  >
    <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
      <span className="text-xs">🎯</span>
      {title}
    </h4>
    <div className="space-y-1">
      {actions.slice(0, 3).map((action, idx) => (
        <p key={idx} className="text-xs text-slate-300 bg-slate-900/30 rounded px-2 py-1">
          • {action}
        </p>
      ))}
      {actions.length > 3 && (
        <p className="text-xs text-slate-500 px-2">+{actions.length - 3} acciones más</p>
      )}
    </div>
  </div>
)

const GravityMeter = ({ score }: { score: number }) => {
  const getGravityColor = (score: number) => {
    if (score >= 9) return 'from-red-500 to-red-600'
    if (score >= 7) return 'from-orange-500 to-orange-600'
    if (score >= 5) return 'from-yellow-500 to-yellow-600'
    return 'from-green-500 to-green-600'
  }

  const getGravityLabel = (score: number) => {
    if (score >= 9) return 'Crítica'
    if (score >= 7) return 'Alta'
    if (score >= 5) return 'Media'
    return 'Baja'
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-slate-400">Gravedad Clínica</span>
        <span className="text-lg font-bold text-white">{score}/10</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-3">
        <div
          className={`bg-gradient-to-r ${getGravityColor(score)} h-3 rounded-full transition-all duration-500 relative`}
          style={{ width: `${(score / 10) * 100}%` }}
        >
          <div className="absolute right-1 top-0 h-3 flex items-center">
            <span className="text-xs font-bold text-white drop-shadow">
              {getGravityLabel(score)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

const PatternCard = ({ patterns, title }: { patterns: string[]; title: string }) => (
  <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 border border-slate-600/30">
    <div className="flex items-center space-x-2 mb-2">
      <span className="text-red-400 text-sm">🔍</span>
      <h4 className="text-sm font-semibold text-white">{title}</h4>
      <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full">
        {patterns.length}
      </span>
    </div>
    <div className="space-y-1">
      {patterns.slice(0, 2).map((pattern, idx) => (
        <p key={idx} className="text-xs text-slate-300">
          • {pattern}
        </p>
      ))}
      {patterns.length > 2 && (
        <p className="text-xs text-slate-500">+{patterns.length - 2} patrones más</p>
      )}
    </div>
  </div>
)

export const UrgencyIndicator = ({ urgencyData, className = '' }: UrgencyIndicatorProps) => {
  const [expanded, setExpanded] = useState(false)
  const config = UrgencyLevelConfig[urgencyData.level]

  return (
    <div
      className={`${className} bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-600/30 overflow-hidden`}
    >
      {/* Header - Nivel de Urgencia */}
      <div className={`${config.bgColor} border-b ${config.borderColor} p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{config.icon}</div>
            <div>
              <h3 className={`text-lg font-bold ${config.textColor}`}>URGENCIA {config.label}</h3>
              <p className="text-sm text-slate-400">{config.description}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-center">
              <div className={`text-2xl font-bold ${config.textColor}`}>
                {urgencyData.gravityScore}
              </div>
              <div className="text-xs text-slate-400">Score</div>
            </div>

            <button
              onClick={() => setExpanded(!expanded)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${config.bgColor} ${config.textColor} border ${config.borderColor} hover:opacity-80`}
            >
              {expanded ? 'Menos' : 'Detalles'}
            </button>
          </div>
        </div>

        {/* Time to Action */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-slate-400">⏱️ Tiempo máximo:</span>
            <span className={`font-semibold ${config.textColor}`}>{urgencyData.timeToAction}</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded-full">
              Triage: {urgencyData.triageCategory}
            </span>
            {urgencyData.specialistRequired && (
              <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full border border-purple-500/30">
                👨‍⚕️ Especialista
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Gravity Meter - Siempre visible */}
      <div className="p-4 border-b border-slate-700">
        <GravityMeter score={urgencyData.gravityScore} />
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="p-4 space-y-4 border-t border-slate-700 bg-slate-900/20">
          {/* Patrones Urgentes */}
          {urgencyData.urgentPatterns.length > 0 && (
            <PatternCard
              patterns={urgencyData.urgentPatterns}
              title="Patrones Críticos Detectados"
            />
          )}

          {/* Risk Factors */}
          {urgencyData.riskFactors.length > 0 && (
            <PatternCard patterns={urgencyData.riskFactors} title="Factores de Riesgo" />
          )}

          {/* Acciones Inmediatas */}
          {urgencyData.immediateActions.length > 0 && (
            <ActionCard
              title="Acciones Inmediatas Requeridas"
              actions={urgencyData.immediateActions}
              color={config.color}
            />
          )}

          {/* Medicina Defensiva Badge */}
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-3 border border-blue-500/20">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">🛡️</span>
              <h4 className="text-sm font-semibold text-blue-300">Medicina Defensiva</h4>
            </div>
            <p className="text-xs text-slate-300">
              Diagnósticos priorizados por <strong>gravedad</strong> sobre probabilidad. Sistema
              diseñado para minimizar riesgos vitales no detectados.
            </p>
            <div className="mt-2 flex items-center space-x-2 text-xs">
              <span className="text-slate-400">Principio:</span>
              <span className="text-blue-300 font-medium">
                "Mejor sobrediagnosticar que subdiagnosticar"
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Componente simplificado para casos de baja urgencia
export const CompactUrgencyIndicator = ({ urgencyData }: UrgencyIndicatorProps) => {
  const config = UrgencyLevelConfig[urgencyData.level]

  return (
    <div
      className={`${config.bgColor} backdrop-blur-sm rounded-lg p-3 border ${config.borderColor} flex items-center space-x-3`}
    >
      <div className="text-lg">{config.icon}</div>
      <div className="flex-1">
        <div className={`text-sm font-semibold ${config.textColor}`}>{config.label}</div>
        <div className="text-xs text-slate-400">{urgencyData.timeToAction}</div>
      </div>
      <div className={`text-lg font-bold ${config.textColor}`}>{urgencyData.gravityScore}</div>
    </div>
  )
}
