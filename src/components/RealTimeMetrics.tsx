// src/components/RealTimeMetrics.tsx
// Métricas Modernas 2025 - Creado por Bernard Orozco con la magia de Gandalf el Blanco

'use client'

import { useSelector } from 'react-redux'
import { RootState } from '@redux-claude/cognitive-core'
import { memo } from 'react'
import { selectSystemMetrics } from '@redux-claude/cognitive-core/src/store/selectors'
import { CALCULATION_FACTORS } from '../constants/magicNumbers'

// 📊 METRICS TYPES
interface RealMetrics {
  confidence: number
  cycles: number
  processingTime: number
  agentsActive: number
  healthScore: number
  systemHealth: string
  messagesCount: number
}

// 🧮 SYSTEM METRICS CALCULATOR - Compacto y eficiente
const calculateSystemMetrics = (realMetrics: RealMetrics, isLoading: boolean) => {
  const systemMetrics = {
    confidence: realMetrics.confidence,
    cycles: realMetrics.cycles,
    processingTime: realMetrics.processingTime,
    agentsActive: realMetrics.agentsActive,
    consensusRate: Math.round(realMetrics.confidence * CALCULATION_FACTORS.CONSENSUS_RATE_FACTOR),
    systemHealth: realMetrics.healthScore,
    responseTime: realMetrics.processingTime,
    qualityScore: Math.round(realMetrics.confidence * CALCULATION_FACTORS.QUALITY_SCORE_FACTOR),
  }

  const streamingProgress = isLoading ? Math.min(realMetrics.confidence + 10, 95) : 0
  return { systemMetrics, streamingProgress }
}

// 📊 METRIC CARD - Compacto y moderno
interface MetricCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: string
  color: string
  trend?: 'up' | 'down' | 'stable'
  size?: 'sm' | 'lg'
}

const MetricCard = memo(function MetricCard({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
  size = 'sm',
}: MetricCardProps) {
  const isLarge = size === 'lg'

  const getTrendIcon = () => {
    if (!trend) return null
    const iconClass =
      trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400'
    const arrow = trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'

    return <span className={`text-xs ${iconClass} font-mono`}>{arrow}</span>
  }

  return (
    <div
      className={`
      bg-slate-800/60 backdrop-blur-sm rounded-lg border border-slate-700/50 
      hover:border-slate-600/70 transition-all duration-200 hover:shadow-lg
      ${isLarge ? 'p-6' : 'p-4'}
    `}
    >
      <div className="flex items-start justify-between mb-2">
        <div
          className={`
          ${isLarge ? 'w-12 h-12' : 'w-8 h-8'} 
          bg-gradient-to-br ${color} rounded-lg flex items-center justify-center
          ${isLarge ? 'text-xl' : 'text-base'}
        `}
        >
          {icon}
        </div>
        {getTrendIcon()}
      </div>

      <div className={`${isLarge ? 'text-3xl' : 'text-2xl'} font-bold text-white mb-1`}>
        {value}
      </div>
      <div className={`${isLarge ? 'text-base' : 'text-sm'} font-medium text-slate-200 mb-1`}>
        {title}
      </div>
      <div className={`${isLarge ? 'text-sm' : 'text-xs'} text-slate-400 leading-tight`}>
        {subtitle}
      </div>

      {/* Progress bar minimalista */}
      <div className="mt-3">
        <div className="w-full bg-slate-700/30 rounded-full h-1 overflow-hidden">
          <div
            className={`bg-gradient-to-r ${color} h-1 rounded-full transition-all duration-500`}
            style={{
              width:
                typeof value === 'string' && value.includes('%')
                  ? value
                  : `${Math.min(Number(String(value).replace(/\D/g, '')), 100)}%`,
            }}
          />
        </div>
      </div>
    </div>
  )
})

// 🔄 STREAMING PROGRESS - Compacto y elegante
const StreamingProgress = memo(function StreamingProgress({ progress }: { progress: number }) {
  const getMessage = (p: number) => {
    if (p < 30) return 'Validando información clínica...'
    if (p < 60) return 'Ejecutando análisis diagnóstico...'
    if (p < 90) return 'Consultando especialistas...'
    return 'Finalizando consenso médico...'
  }

  return (
    <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-lg p-4 border border-blue-600/30">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <div>
            <div className="text-sm font-semibold text-white">Análisis en Progreso</div>
            <div className="text-xs text-blue-300">{getMessage(progress)}</div>
          </div>
        </div>
        <div className="text-lg font-bold text-white">{Math.round(progress)}%</div>
      </div>

      <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
})

// 🚨 SYSTEM STATUS - Compacto con estados visuales claros
interface SystemStatusProps {
  status: 'optimal' | 'good' | 'warning' | 'critical'
  message: string
}

const SystemStatus = memo(function SystemStatus({ status, message }: SystemStatusProps) {
  const configs = {
    optimal: { color: 'from-emerald-500 to-green-500', icon: '✅', text: 'text-emerald-300' },
    good: { color: 'from-blue-500 to-cyan-500', icon: '🔵', text: 'text-blue-300' },
    warning: { color: 'from-yellow-500 to-orange-500', icon: '⚠️', text: 'text-yellow-300' },
    critical: { color: 'from-red-500 to-pink-500', icon: '🚨', text: 'text-red-300' },
  }

  const config = configs[status]
  const statusText = {
    optimal: 'Óptimo',
    good: 'Operativo',
    warning: 'Alerta',
    critical: 'Crítico',
  }

  return (
    <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-700/50 mb-6">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 bg-gradient-to-br ${config.color} rounded-lg flex items-center justify-center text-lg`}
        >
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-base font-semibold ${config.text}`}>
            Sistema {statusText[status]}
          </div>
          <div className="text-sm text-slate-400 truncate">{message}</div>
        </div>
        {(status === 'optimal' || status === 'critical') && (
          <div
            className={`w-2 h-2 rounded-full animate-pulse ${
              status === 'optimal' ? 'bg-emerald-400' : 'bg-red-400'
            }`}
          />
        )}
      </div>
    </div>
  )
})

// 🔍 SYSTEM STATUS CALCULATOR
const calculateSystemStatus = (realMetrics: RealMetrics): SystemStatusProps => {
  const healthStatus = realMetrics.systemHealth
  const hasActivity = realMetrics.messagesCount > 1

  if (!hasActivity) {
    return { status: 'good', message: 'Sistema multinúcleo listo para análisis médico' }
  }

  const statusMap: Record<string, SystemStatusProps> = {
    optimal: {
      status: 'optimal',
      message: `Sistema óptimo - ${realMetrics.agentsActive} cores activos, ${realMetrics.cycles} ciclos`,
    },
    good: {
      status: 'good',
      message: `Sistema operativo - Confianza ${realMetrics.confidence}%, ${realMetrics.messagesCount} mensajes`,
    },
    warning: {
      status: 'warning',
      message: `Alerta - Performance degradado, tiempo respuesta ${realMetrics.processingTime}ms`,
    },
    critical: {
      status: 'critical',
      message: 'Sistema crítico - Intervención requerida en cores multinúcleo',
    },
  }

  return statusMap[healthStatus] || statusMap.good
}

// 🎯 COMPONENTE PRINCIPAL - Layout moderno y responsivo
export const RealTimeMetrics = () => {
  const realMetrics = useSelector((state: RootState) => selectSystemMetrics(state))
  const isLoading = useSelector((state: RootState) =>
    Object.values(state.medicalChat.cores).some(core => core.isLoading)
  )
  const error = useSelector((state: RootState) => state.medicalChat.sharedState.error)

  const { systemMetrics, streamingProgress } = calculateSystemMetrics(realMetrics, isLoading)
  const systemStatus = calculateSystemStatus(realMetrics)

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 bg-red-800 rounded-lg flex items-center justify-center mx-auto mb-3 text-lg">
          ❌
        </div>
        <h3 className="text-red-400 font-semibold mb-2">Error en métricas</h3>
        <p className="text-slate-400 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-hide">
      <div className="space-y-4 p-4">
        {/* System Status */}
        <SystemStatus {...systemStatus} />

        {/* Métricas Principales - Grid Responsivo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MetricCard
            title="Confianza Diagnóstica"
            value={`${Math.round(systemMetrics.confidence)}%`}
            subtitle="Nivel de certeza del análisis actual"
            icon="🎯"
            color="from-blue-500 to-cyan-500"
            trend={
              systemMetrics.confidence > 80
                ? 'up'
                : systemMetrics.confidence > 0
                  ? 'stable'
                  : undefined
            }
            size="lg"
          />

          <MetricCard
            title="Progreso Iterativo"
            value={`${systemMetrics.cycles}/3`}
            subtitle="Ciclos completados - 2 mensajes"
            icon="🔄"
            color="from-purple-500 to-indigo-500"
            trend={systemMetrics.cycles > 0 ? 'up' : undefined}
            size="lg"
          />
        </div>

        {/* Métricas Secundarias - Grid Compacto */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            title="Consenso Médico"
            value={`${systemMetrics.consensusRate}%`}
            subtitle="Acuerdo especialistas"
            icon="🤝"
            color="from-emerald-500 to-teal-500"
            trend={systemMetrics.consensusRate > 80 ? 'up' : 'stable'}
          />

          <MetricCard
            title="Agentes Activos"
            value={`${systemMetrics.agentsActive}/5`}
            subtitle="Especialistas consultando"
            icon="👥"
            color="from-orange-500 to-yellow-500"
            trend="stable"
          />

          <MetricCard
            title="Tiempo Respuesta"
            value={`${Math.round(systemMetrics.responseTime)}ms`}
            subtitle="Latencia del sistema"
            icon="⚡"
            color="from-slate-500 to-gray-500"
            trend={systemMetrics.responseTime < 1500 ? 'up' : 'down'}
          />

          <MetricCard
            title="Calidad Sistema"
            value={`${systemMetrics.qualityScore}%`}
            subtitle="Score de rendimiento"
            icon="🏆"
            color="from-violet-500 to-purple-500"
            trend={systemMetrics.qualityScore > 85 ? 'up' : 'stable'}
          />
        </div>

        {/* Streaming Progress */}
        {isLoading && <StreamingProgress progress={streamingProgress} />}

        {/* Espacio inferior para scroll */}
        <div className="h-4" />
      </div>
    </div>
  )
}
