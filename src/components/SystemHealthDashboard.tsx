// src/components/SystemHealthDashboard.tsx
// Dashboard de Salud del Sistema Médico - FASE 6 - Creado por Bernard Orozco

'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  medicalSystemMonitor,
  SystemHealthMetrics,
  PerformanceAlert,
} from '../monitoring/MedicalSystemMonitor'

interface HealthIndicatorProps {
  title: string
  value: number
  unit?: string
  threshold?: number
  invertThreshold?: boolean
  icon?: string
  color?: string
}

const HealthIndicator: React.FC<HealthIndicatorProps> = ({
  title,
  value,
  unit = '',
  threshold = 80,
  invertThreshold = false,
  icon = '📊',
  color,
}) => {
  const getHealthColor = () => {
    if (color) return color

    const isHealthy = invertThreshold ? value >= threshold : value <= threshold

    if (isHealthy) return 'from-emerald-500 to-green-500'
    if (value > threshold * 0.9) return 'from-yellow-500 to-orange-500'
    return 'from-red-500 to-pink-500'
  }

  const getHealthStatus = () => {
    const isHealthy = invertThreshold ? value >= threshold : value <= threshold

    if (isHealthy) return '✅'
    if (value > threshold * 0.9) return '⚠️'
    return '🚨'
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-xl p-4 border border-slate-600/40 hover:border-slate-500/60 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{icon}</span>
          <h4 className="text-sm font-medium text-slate-200">{title}</h4>
        </div>
        <span className="text-lg">{getHealthStatus()}</span>
      </div>

      <div className="mb-3">
        <div className="text-2xl font-bold text-white">
          {typeof value === 'number' ? Math.round(value * 10) / 10 : value}
          {unit}
        </div>
        <div className="text-xs text-slate-400">
          Umbral: {threshold}
          {unit}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
        <div
          className={`bg-gradient-to-r ${getHealthColor()} h-2 rounded-full transition-all duration-1000 relative`}
          style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        </div>
      </div>
    </div>
  )
}

interface AlertSummaryProps {
  alerts: PerformanceAlert[]
}

const AlertSummary: React.FC<AlertSummaryProps> = ({ alerts }) => {
  const alertStats = useMemo(() => {
    const stats = {
      total: alerts.length,
      error: 0,
      warning: 0,
      info: 0,
      resolved: 0,
      unresolved: 0,
    }

    alerts.forEach(alert => {
      stats[alert.type]++
      if (alert.resolved) {
        stats.resolved++
      } else {
        stats.unresolved++
      }
    })

    return stats
  }, [alerts])

  return (
    <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-xl p-4 border border-slate-600/40">
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-lg">🚨</span>
        <h3 className="text-lg font-semibold text-white">Resumen de Alertas</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-400">{alertStats.error}</div>
          <div className="text-xs text-slate-400">Errores</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">{alertStats.warning}</div>
          <div className="text-xs text-slate-400">Warnings</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">{alertStats.info}</div>
          <div className="text-xs text-slate-400">Info</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-400">{alertStats.total}</div>
          <div className="text-xs text-slate-400">Total</div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-700">
        <div className="flex justify-between text-sm">
          <span className="text-green-400">✅ Resueltas: {alertStats.resolved}</span>
          <span className="text-orange-400">⏳ Pendientes: {alertStats.unresolved}</span>
        </div>
      </div>
    </div>
  )
}

interface SystemUptimeProps {
  startTime: number
}

const SystemUptime: React.FC<SystemUptimeProps> = ({ startTime }) => {
  const [uptime, setUptime] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setUptime(Date.now() - startTime)
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime])

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-xl p-4 border border-slate-600/40">
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-lg">⏱️</span>
        <h3 className="text-lg font-semibold text-white">Sistema Activo</h3>
      </div>

      <div className="text-center">
        <div className="text-3xl font-bold text-emerald-400 mb-2">{formatUptime(uptime)}</div>
        <div className="text-sm text-slate-400">Desde: {new Date(startTime).toLocaleString()}</div>
      </div>

      <div className="mt-4 flex items-center justify-center space-x-2">
        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
        <span className="text-sm text-emerald-400">Sistema Operativo</span>
      </div>
    </div>
  )
}

export const SystemHealthDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemHealthMetrics | null>(null)
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [systemHealth, setSystemHealth] = useState<'excellent' | 'good' | 'warning' | 'critical'>(
    'good'
  )

  // 📊 Actualizar métricas
  useEffect(() => {
    const updateMetrics = () => {
      const snapshot = medicalSystemMonitor.getSystemSnapshot()
      setMetrics(snapshot.metrics)
      setAlerts(snapshot.alerts)
      setSystemHealth(medicalSystemMonitor.getSystemHealth())
    }

    // Actualización inicial
    updateMetrics()

    // Suscribirse a actualizaciones
    medicalSystemMonitor.on('metricsUpdated', updateMetrics)

    // Intervalo de respaldo
    const interval = setInterval(updateMetrics, 5000)

    return () => {
      medicalSystemMonitor.off('metricsUpdated', updateMetrics)
      clearInterval(interval)
    }
  }, [])

  // 🎨 Color del sistema según salud
  const getSystemHealthColor = () => {
    switch (systemHealth) {
      case 'excellent':
        return 'from-emerald-500 to-green-500'
      case 'good':
        return 'from-blue-500 to-cyan-500'
      case 'warning':
        return 'from-yellow-500 to-orange-500'
      case 'critical':
        return 'from-red-500 to-pink-500'
      default:
        return 'from-gray-500 to-slate-500'
    }
  }

  const getSystemHealthIcon = () => {
    switch (systemHealth) {
      case 'excellent':
        return '🟢'
      case 'good':
        return '🔵'
      case 'warning':
        return '🟡'
      case 'critical':
        return '🔴'
      default:
        return '⚪'
    }
  }

  if (!metrics) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-600/30">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-slate-400">Cargando métricas del sistema...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header del Dashboard */}
      <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-xl p-6 border border-slate-600/40">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 bg-gradient-to-br ${getSystemHealthColor()} rounded-xl flex items-center justify-center text-xl shadow-lg`}
            >
              {getSystemHealthIcon()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Sistema Médico Multinúcleo</h2>
              <p className="text-slate-400 text-sm capitalize">Estado: {systemHealth}</p>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <span>{isExpanded ? 'Contraer' : 'Expandir'}</span>
            <span
              className="transform transition-transform duration-200"
              style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              ↓
            </span>
          </button>
        </div>

        <div className="text-sm text-slate-300">
          Última actualización: {new Date(metrics.timestamp).toLocaleTimeString()}
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <HealthIndicator title="Uso CPU" value={metrics.cpu} unit="%" threshold={80} icon="🖥️" />

        <HealthIndicator title="Memoria" value={metrics.memory} unit="%" threshold={85} icon="💾" />

        <HealthIndicator
          title="Cache Hit Rate"
          value={metrics.cacheHitRate}
          unit="%"
          threshold={80}
          invertThreshold={true}
          icon="🧠"
        />

        <HealthIndicator
          title="Latencia Selectores"
          value={metrics.selectorPerformance}
          unit="ms"
          threshold={50}
          icon="⚡"
        />
      </div>

      {/* Información Expandida */}
      {isExpanded && (
        <>
          {/* Métricas Médicas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <HealthIndicator
              title="Calidad Datos"
              value={metrics.medicalDataQuality}
              unit="%"
              threshold={70}
              invertThreshold={true}
              icon="🏥"
            />

            <HealthIndicator
              title="Componentes Cargados"
              value={metrics.componentsLoaded}
              unit=""
              threshold={5}
              icon="🧩"
            />

            <HealthIndicator
              title="Errores (1h)"
              value={metrics.errorsCount}
              unit=""
              threshold={3}
              icon="❌"
            />
          </div>

          {/* Dashboard Inferior */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <AlertSummary alerts={alerts} />
            <SystemUptime startTime={Date.now() - 3600000} /> {/* 1 hora simulada */}
            {/* Controles del Sistema */}
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-xl p-4 border border-slate-600/40">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-lg">⚙️</span>
                <h3 className="text-lg font-semibold text-white">Controles</h3>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => medicalSystemMonitor.start()}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                >
                  🟢 Iniciar Monitor
                </button>

                <button
                  onClick={() => medicalSystemMonitor.stop()}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                >
                  🔴 Detener Monitor
                </button>

                <button
                  onClick={() => {
                    const stats = medicalSystemMonitor.getSystemSnapshot()
                    console.log('📊 System Stats:', stats)
                    alert('Stats enviados a consola')
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                >
                  📊 Ver Stats
                </button>
              </div>
            </div>
          </div>

          {/* Alertas Recientes */}
          {alerts.length > 0 && (
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-xl p-6 border border-slate-600/40">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="mr-2">🚨</span>
                Alertas Recientes ({alerts.length})
              </h3>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {alerts.slice(0, 10).map(alert => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          alert.type === 'error'
                            ? 'bg-red-400'
                            : alert.type === 'warning'
                              ? 'bg-yellow-400'
                              : 'bg-blue-400'
                        }`}
                      ></span>
                      <span className="text-sm text-white">{alert.message}</span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default SystemHealthDashboard
