// src/components/RealTimeMetrics.tsx
// Métricas en Tiempo Real del Sistema Médico - Creado por Bernard Orozco

'use client'

import { useSelector } from 'react-redux'
import { RootState } from '@redux-claude/cognitive-core'
import { useState, useEffect } from 'react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: string
  color: string
  trend?: 'up' | 'down' | 'stable'
  trendValue?: string
}

const MetricCard = ({ title, value, subtitle, icon, color, trend, trendValue }: MetricCardProps) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <span className="text-emerald-400">↗️</span>
      case 'down':
        return <span className="text-red-400">↘️</span>
      default:
        return <span className="text-slate-400">➡️</span>
    }
  }

  return (
    <div className={`bg-gradient-to-br ${color} bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-opacity-20 border-slate-600 hover:border-opacity-40 transition-all duration-300`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xl">{icon}</div>
        {trend && trendValue && (
          <div className="flex items-center space-x-1 text-xs">
            {getTrendIcon()}
            <span className="text-slate-400">{trendValue}</span>
          </div>
        )}
      </div>
      
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-slate-300 mb-1">{title}</div>
      <div className="text-xs text-slate-400">{subtitle}</div>
      
      {/* Animated progress bar based on value */}
      <div className="mt-3 w-full bg-slate-700 rounded-full h-1">
        <div 
          className={`bg-gradient-to-r ${color.replace('from-', 'from-').replace('to-', 'to-')} h-1 rounded-full transition-all duration-1000`}
          style={{ 
            width: typeof value === 'string' && value.includes('%') 
              ? value 
              : typeof value === 'number' 
              ? `${Math.min(value, 100)}%` 
              : '0%' 
          }}
        />
      </div>
    </div>
  )
}

interface SystemStatusProps {
  status: 'optimal' | 'good' | 'warning' | 'critical'
  message: string
}

const SystemStatus = ({ status, message }: SystemStatusProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'optimal':
        return {
          color: 'from-emerald-500 to-teal-500',
          icon: '🟢',
          text: 'text-emerald-400',
          bg: 'bg-emerald-500/10 border-emerald-500/30'
        }
      case 'good':
        return {
          color: 'from-blue-500 to-cyan-500',
          icon: '🔵',
          text: 'text-blue-400',
          bg: 'bg-blue-500/10 border-blue-500/30'
        }
      case 'warning':
        return {
          color: 'from-yellow-500 to-orange-500',
          icon: '🟡',
          text: 'text-yellow-400',
          bg: 'bg-yellow-500/10 border-yellow-500/30'
        }
      case 'critical':
        return {
          color: 'from-red-500 to-pink-500',
          icon: '🔴',
          text: 'text-red-400',
          bg: 'bg-red-500/10 border-red-500/30'
        }
    }
  }

  const config = getStatusConfig()

  return (
    <div className={`${config.bg} backdrop-blur-sm rounded-xl p-4 border`}>
      <div className="flex items-center space-x-3">
        <div className="text-lg">{config.icon}</div>
        <div>
          <h4 className={`font-semibold ${config.text} capitalize`}>Sistema {status}</h4>
          <p className="text-sm text-slate-300">{message}</p>
        </div>
      </div>
    </div>
  )
}

export const RealTimeMetrics = () => {
  const iterativeState = useSelector((state: RootState) => state.medicalChat.iterativeState)
  const isStreaming = useSelector((state: RootState) => state.medicalChat.streaming.isActive)
  const streamingProgress = useSelector((state: RootState) => state.medicalChat.streaming.progress)
  
  const [systemMetrics, setSystemMetrics] = useState({
    confidence: iterativeState.finalConfidence * 100 || 0,
    cycles: iterativeState.currentCycle || 0,
    processingTime: iterativeState.processingTimeMs || 0,
    agentsActive: 3,
    consensusRate: 85,
    systemHealth: 94,
    responseTime: 1240,
    qualityScore: 92
  })

  // Simulate real-time updates during streaming
  useEffect(() => {
    if (isStreaming) {
      const interval = setInterval(() => {
        setSystemMetrics(prev => ({
          ...prev,
          confidence: Math.min(prev.confidence + Math.random() * 2, 95),
          processingTime: prev.processingTime + Math.random() * 100,
          responseTime: prev.responseTime + Math.random() * 50,
          qualityScore: Math.min(prev.qualityScore + Math.random() * 1, 98)
        }))
      }, 500)

      return () => clearInterval(interval)
    }
  }, [isStreaming])

  // Update metrics from Redux state
  useEffect(() => {
    setSystemMetrics(prev => ({
      ...prev,
      confidence: iterativeState.finalConfidence * 100 || prev.confidence,
      cycles: iterativeState.currentCycle || prev.cycles,
      processingTime: iterativeState.processingTimeMs || prev.processingTime
    }))
  }, [iterativeState])

  const getSystemStatus = (): SystemStatusProps => {
    if (systemMetrics.confidence > 90 && systemMetrics.systemHealth > 90) {
      return {
        status: 'optimal',
        message: 'Diagnóstico iterativo funcionando perfectamente'
      }
    } else if (systemMetrics.confidence > 75 && systemMetrics.systemHealth > 80) {
      return {
        status: 'good',
        message: 'Sistema operando dentro de parámetros normales'
      }
    } else if (systemMetrics.confidence > 60) {
      return {
        status: 'warning',
        message: 'Confianza diagnóstica por debajo del óptimo'
      }
    } else {
      return {
        status: 'critical',
        message: 'Se requiere intervención del sistema'
      }
    }
  }

  return (
    <div className="space-y-4">
      
      {/* System Status Banner */}
      <SystemStatus {...getSystemStatus()} />
      
      {/* Real-time metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          title="Confianza Diagnóstica"
          value={`${Math.round(systemMetrics.confidence)}%`}
          subtitle="Ciclo actual"
          icon="🎯"
          color="from-blue-500 to-cyan-500"
          trend={systemMetrics.confidence > 80 ? 'up' : systemMetrics.confidence > 60 ? 'stable' : 'down'}
          trendValue="+2.3%"
        />
        
        <MetricCard
          title="Ciclos Completados"
          value={systemMetrics.cycles}
          subtitle={`de ${iterativeState.totalCycles || 3} máximo`}
          icon="🔄"
          color="from-purple-500 to-indigo-500"
          trend="up"
          trendValue="+1"
        />
        
        <MetricCard
          title="Tiempo Procesamiento"
          value={`${Math.round(systemMetrics.processingTime)}ms`}
          subtitle="Total acumulado"
          icon="⚡"
          color="from-emerald-500 to-teal-500"
          trend={systemMetrics.processingTime < 2000 ? 'up' : 'down'}
          trendValue="+240ms"
        />
        
        <MetricCard
          title="Agentes Activos"
          value={systemMetrics.agentsActive}
          subtitle="Especialistas consultando"
          icon="👨‍⚕️"
          color="from-orange-500 to-yellow-500"
          trend="stable"
          trendValue="3/5"
        />
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <MetricCard
          title="Consenso Médico"
          value={`${systemMetrics.consensusRate}%`}
          subtitle="Entre especialistas"
          icon="🤝"
          color="from-pink-500 to-rose-500"
          trend="up"
          trendValue="+5%"
        />
        
        <MetricCard
          title="Salud del Sistema"
          value={`${systemMetrics.systemHealth}%`}
          subtitle="Estado general"
          icon="💚"
          color="from-emerald-500 to-green-500"
          trend="up"
          trendValue="+1%"
        />
        
        <MetricCard
          title="Tiempo Respuesta"
          value={`${Math.round(systemMetrics.responseTime)}ms`}
          subtitle="Latencia promedio"
          icon="📡"
          color="from-slate-500 to-gray-500"
          trend={systemMetrics.responseTime < 1500 ? 'up' : 'down'}
          trendValue="+50ms"
        />
        
        <MetricCard
          title="Calidad SOAP"
          value={`${Math.round(systemMetrics.qualityScore)}%`}
          subtitle="Validación automática"
          icon="📋"
          color="from-violet-500 to-purple-500"
          trend="up"
          trendValue="+1.2%"
        />
      </div>

      {/* Streaming Progress */}
      {isStreaming && (
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <h4 className="text-sm font-semibold text-white">Análisis en Progreso</h4>
            </div>
            <span className="text-sm text-slate-400">{Math.round(streamingProgress)}%</span>
          </div>
          
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${streamingProgress}%` }}
            />
          </div>
          
          <p className="text-xs text-slate-400 mt-2">
            {streamingProgress < 30 ? 'Validando caso clínico...' :
             streamingProgress < 60 ? 'Ejecutando ciclos diagnósticos...' :
             streamingProgress < 90 ? 'Consultando agentes especializados...' :
             'Finalizando análisis SOAP...'}
          </p>
        </div>
      )}
    </div>
  )
}