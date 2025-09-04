// src/components/RealTimeMetrics.tsx
// Métricas en Tiempo Real del Sistema Médico - Creado por Bernard Orozco

'use client'

import { useSelector } from 'react-redux'
import { RootState } from '@redux-claude/cognitive-core'
import { memo } from 'react' // { useState, useEffect } removed
import {
  selectSystemMetrics,
  // type SystemMetrics,
} from '@redux-claude/cognitive-core/src/store/selectors'
import { CALCULATION_FACTORS } from '../constants/magicNumbers'
import type { SystemMetrics } from '@redux-claude/cognitive-core/src/types/medicalTypes'

// 🧮 SYSTEM METRICS CALCULATOR - Extraído para reducir complejidad
const calculateSystemMetrics = (realMetrics: any, isLoading: boolean) => {
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

// 🔍 SYSTEM STATUS CALCULATOR - Extraído para reducir complejidad
const calculateSystemStatus = (realMetrics: any): SystemStatusProps => {
  const healthStatus = realMetrics.systemHealth
  const hasActivity = realMetrics.messagesCount > 1

  if (!hasActivity) {
    return {
      status: 'good',
      message: 'Sistema multinúcleo listo para análisis médico',
    }
  }

  // Mapear salud real del sistema a estados visuales
  if (healthStatus === 'optimal') {
    return {
      status: 'optimal',
      message: `Sistema óptimo - ${realMetrics.agentsActive} cores activos, ${realMetrics.cycles} ciclos completados`,
    }
  } else if (healthStatus === 'good') {
    return {
      status: 'good',
      message: `Sistema operativo - Confianza ${realMetrics.confidence}%, ${realMetrics.messagesCount} mensajes procesados`,
    }
  } else if (healthStatus === 'warning') {
    return {
      status: 'warning',
      message: `Alerta - Performance degradado, tiempo respuesta ${realMetrics.processingTime}ms`,
    }
  } else {
    return {
      status: 'critical',
      message: 'Sistema crítico - Intervención requerida en cores multinúcleo',
    }
  }
}

// 🔄 STREAMING PROGRESS COMPONENT - Extraído para reducir líneas del componente principal
const StreamingProgressCard = memo(function StreamingProgressCard({ 
  streamingProgress 
}: { 
  streamingProgress: number 
}) {
  const getProgressMessage = (progress: number) => {
    if (progress < 30) return '🔍 Validando información clínica del paciente...'
    if (progress < 60) return '⚙️ Ejecutando ciclos de análisis diagnóstico...'
    if (progress < 90) return '👥 Consultando especialistas del panel médico...'
    return '✅ Finalizando validación SOAP y consenso médico...'
  }

  return (
    <div className="bg-gradient-to-r from-blue-950/40 to-purple-950/40 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30 shadow-xl shadow-blue-500/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white">Análisis en Progreso</h4>
            <p className="text-sm text-blue-300">Motor iterativo procesando caso médico</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-white">{Math.round(streamingProgress)}%</span>
          <p className="text-xs text-slate-400">Completado</p>
        </div>
      </div>

      <div className="w-full bg-slate-700/50 rounded-full h-3 mb-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300 shadow-lg relative overflow-hidden"
          style={{ width: `${streamingProgress}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-pulse" />
        </div>
      </div>

      <p className="text-sm text-slate-300 leading-relaxed">{getProgressMessage(streamingProgress)}</p>
    </div>
  )
})

// 📊 METRICS GRID COMPONENT - Extraído para reducir complejidad del main
const MetricsGrid = memo(function MetricsGrid({ 
  systemMetrics, 
  realMetrics 
}: { 
  systemMetrics: any
  realMetrics: any 
}) {
  return (
    <>
      {/* Key Performance Metrics - Single Column Layout for Better Readability */}
      <div className="space-y-4">
        <MetricCard
          title="Confianza Diagnóstica"
          value={`${Math.round(systemMetrics.confidence)}%`}
          subtitle="Nivel de certeza del análisis médico actual"
          icon="🎯"
          color="from-blue-500 to-cyan-500"
          trend={
            systemMetrics.confidence > 80
              ? 'up'
              : systemMetrics.confidence > 0
                ? 'stable'
                : undefined
          }
          trendValue={
            systemMetrics.confidence > 0 ? `${Math.round(systemMetrics.confidence)}%` : undefined
          }
        />

        <MetricCard
          title="Progreso Iterativo"
          value={`${systemMetrics.cycles}/${Math.max(systemMetrics.cycles + 1, 3)}`}
          subtitle={`Ciclos de análisis completados - ${realMetrics.messagesCount} mensajes`}
          icon="🔄"
          color="from-purple-500 to-indigo-500"
          trend={systemMetrics.cycles > 0 ? 'up' : undefined}
          trendValue={systemMetrics.cycles > 0 ? `Ciclo ${systemMetrics.cycles}` : 'Sin actividad'}
        />
      </div>

      {/* System Performance Metrics - Compact Grid */}
      <div className="grid grid-cols-1 gap-3">
        <MetricCard
          title="Consenso Médico"
          value={`${systemMetrics.consensusRate}%`}
          subtitle="Acuerdo entre especialistas"
          icon="🤝"
          color="from-emerald-500 to-teal-500"
          trend={
            systemMetrics.consensusRate > 0
              ? systemMetrics.consensusRate > 80
                ? 'up'
                : 'stable'
              : undefined
          }
          trendValue={
            systemMetrics.consensusRate > 0 ? `${systemMetrics.consensusRate}%` : undefined
          }
        />

        <MetricCard
          title="Agentes Activos"
          value={`${systemMetrics.agentsActive}/5`}
          subtitle="Especialistas consultando"
          icon="👨‍⚕️"
          color="from-orange-500 to-yellow-500"
          trend={systemMetrics.agentsActive > 0 ? 'stable' : undefined}
          trendValue={
            systemMetrics.agentsActive > 0 ? `${systemMetrics.agentsActive} activos` : '0 activos'
          }
        />

        <MetricCard
          title="Tiempo Respuesta"
          value={
            systemMetrics.responseTime > 0 ? `${Math.round(systemMetrics.responseTime)}ms` : '0ms'
          }
          subtitle="Latencia del sistema"
          icon="⚡"
          color="from-slate-500 to-gray-500"
          trend={
            systemMetrics.responseTime > 0
              ? systemMetrics.responseTime < 1500
                ? 'up'
                : 'down'
              : undefined
          }
          trendValue={
            systemMetrics.responseTime > 0 ? `${Math.round(systemMetrics.responseTime)}ms` : '0ms'
          }
        />
      </div>
    </>
  )
})

interface MetricCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: string
  color: string
  trend?: 'up' | 'down' | 'stable'
  trendValue?: string
}

const MetricCard = memo(function MetricCard({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
  trendValue,
}: MetricCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return (
          <div className="flex items-center space-x-1 text-emerald-400">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs font-medium">{trendValue}</span>
          </div>
        )
      case 'down':
        return (
          <div className="flex items-center space-x-1 text-red-400">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs font-medium">{trendValue}</span>
          </div>
        )
      default:
        return (
          <div className="flex items-center space-x-1 text-slate-400">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs font-medium">{trendValue}</span>
          </div>
        )
    }
  }

  return (
    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 backdrop-blur-xl rounded-xl p-4 border border-slate-600/40 hover:border-slate-500/60 transition-all duration-300 hover:shadow-lg hover:shadow-slate-950/20 group">
      {/* Compact Header with Icon and Trend */}
      <div className="flex items-center justify-between mb-3">
        <div
          className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center text-lg shadow-md transition-transform duration-300 group-hover:scale-105`}
        >
          {icon}
        </div>
        {trend && trendValue && <div className="flex items-center">{getTrendIcon()}</div>}
      </div>

      {/* Compact Main Metric */}
      <div className="mb-3">
        <div className="text-2xl font-bold text-white mb-1 tracking-tight">{value}</div>
        <h4 className="text-sm font-semibold text-slate-200 mb-1 line-clamp-1">{title}</h4>
        <p className="text-xs text-slate-400 leading-tight line-clamp-2">{subtitle}</p>
      </div>

      {/* Compact Progress Bar */}
      <div className="mt-3">
        <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
          <div
            className={`bg-gradient-to-r ${color} h-1.5 rounded-full transition-all duration-1000 shadow-sm relative overflow-hidden`}
            style={{
              width:
                typeof value === 'string' && value.includes('%')
                  ? value
                  : typeof value === 'number'
                    ? `${Math.min(value, 100)}%`
                    : '0%',
            }}
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
})

interface SystemStatusProps {
  status: 'optimal' | 'good' | 'warning' | 'critical'
  message: string
}

const SystemStatus = memo(function SystemStatus({ status, message }: SystemStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'optimal':
        return {
          color: 'from-emerald-500 to-teal-500',
          icon: '✅',
          text: 'text-emerald-300',
          bg: 'from-emerald-950/40 to-teal-950/40',
          border: 'border-emerald-500/30',
          pulse: 'shadow-emerald-500/20',
        }
      case 'good':
        return {
          color: 'from-blue-500 to-cyan-500',
          icon: '🔵',
          text: 'text-blue-300',
          bg: 'from-blue-950/40 to-cyan-950/40',
          border: 'border-blue-500/30',
          pulse: 'shadow-blue-500/20',
        }
      case 'warning':
        return {
          color: 'from-yellow-500 to-orange-500',
          icon: '⚠️',
          text: 'text-yellow-300',
          bg: 'from-yellow-950/40 to-orange-950/40',
          border: 'border-yellow-500/30',
          pulse: 'shadow-yellow-500/20',
        }
      case 'critical':
        return {
          color: 'from-red-500 to-pink-500',
          icon: '🚨',
          text: 'text-red-300',
          bg: 'from-red-950/40 to-pink-950/40',
          border: 'border-red-500/30',
          pulse: 'shadow-red-500/20',
        }
    }
  }

  const config = getStatusConfig()

  return (
    <div
      className={`bg-gradient-to-r ${config.bg} backdrop-blur-xl rounded-2xl p-5 border ${config.border} shadow-xl ${config.pulse}`}
    >
      <div className="flex items-center space-x-4">
        <div
          className={`w-12 h-12 bg-gradient-to-br ${config.color} rounded-2xl flex items-center justify-center text-xl shadow-lg`}
        >
          {config.icon}
        </div>
        <div className="flex-1">
          <h4 className={`text-lg font-bold ${config.text} capitalize mb-1`}>
            Sistema{' '}
            {status === 'optimal'
              ? 'Óptimo'
              : status === 'good'
                ? 'Operativo'
                : status === 'warning'
                  ? 'Alerta'
                  : 'Crítico'}
          </h4>
          <p className="text-sm text-slate-300 leading-relaxed">{message}</p>
        </div>
        {status === 'optimal' && (
          <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
        )}
        {status === 'critical' && (
          <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse shadow-lg shadow-red-400/50" />
        )}
      </div>
    </div>
  )
})

export const RealTimeMetrics = () => {
  // ⚡ ESTADO REAL MULTINÚCLEO - Mock Data COMPLETAMENTE ELIMINADO
  const realMetrics = useSelector((state: RootState) => selectSystemMetrics(state))
  const isLoading = useSelector((state: RootState) =>
    Object.values(state.medicalChat.cores).some(core => core.isLoading)
  )
  const error = useSelector((state: RootState) => state.medicalChat.sharedState.error)

  // 🧮 Métricas calculadas (lógica extraída para reducir complejidad)
  const { systemMetrics, streamingProgress } = calculateSystemMetrics(realMetrics, isLoading)

  // Debug real metrics (no fake data) - COMENTADO PARA EVITAR SPAM
  // console.log('🔬 RealTimeMetrics DEBUG - Real Metrics:', realMetrics)
  // console.log('🔬 RealTimeMetrics DEBUG - System Health:', realMetrics.systemHealth)
  // console.log('🔬 RealTimeMetrics DEBUG - Cores Activity:', realMetrics.coreMetrics)

  // Estados de error reales
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gradient-to-br from-red-700 to-red-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">❌</span>
        </div>
        <h3 className="text-red-400 font-semibold mb-2">Error en métricas del sistema</h3>
        <p className="text-slate-400 text-sm">{error}</p>
      </div>
    )
  }

  // 🔍 Sistema status calculado (lógica extraída para reducir complejidad)
  const systemStatus = calculateSystemStatus(realMetrics)

  return (
    <div className="space-y-6">
      {/* System Status Banner */}
      <SystemStatus {...systemStatus} />

      {/* Metrics Grid - Componente extraído para reducir complejidad */}
      <MetricsGrid systemMetrics={systemMetrics} realMetrics={realMetrics} />

      {/* Streaming Progress */}
      {isLoading && <StreamingProgressCard streamingProgress={streamingProgress} />}
    </div>
  )
}
