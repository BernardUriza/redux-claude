// src/components/AlertSystem.tsx
// Sistema de Alertas de Performance Médico - FASE 6 - Creado por Bernard Orozco

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { medicalSystemMonitor, PerformanceAlert } from '../monitoring/MedicalSystemMonitor'
import { CALCULATION_FACTORS } from '../constants/magicNumbers'

interface AlertSystemProps {
  maxVisible?: number
  autoHide?: boolean
  hideDelay?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

export const AlertSystem: React.FC<AlertSystemProps> = ({
  maxVisible = 5,
  autoHide = true,
  hideDelay = 5000,
  position = 'top-right',
}) => {
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([])
  const [visibleAlerts, setVisibleAlerts] = useState<Set<string>>(new Set())

  // 🎨 CONFIGURACIÓN DE ESTILOS POR POSICIÓN
  const getPositionClasses = () => {
    const base = 'fixed z-50 flex flex-col space-y-3 p-4'
    switch (position) {
      case 'top-right':
        return `${base} top-4 right-4`
      case 'top-left':
        return `${base} top-4 left-4`
      case 'bottom-right':
        return `${base} bottom-4 right-4`
      case 'bottom-left':
        return `${base} bottom-4 left-4`
      default:
        return `${base} top-4 right-4`
    }
  }

  // 🎨 ESTILOS POR TIPO DE ALERTA
  const getAlertStyles = (alert: PerformanceAlert) => {
    const baseClasses =
      'rounded-lg p-4 shadow-lg backdrop-blur-sm border transition-all duration-300 transform'

    switch (alert.type) {
      case 'error':
        return `${baseClasses} bg-red-900/90 border-red-500/50 text-red-100`
      case 'warning':
        return `${baseClasses} bg-yellow-900/90 border-yellow-500/50 text-yellow-100`
      case 'info':
        return `${baseClasses} bg-blue-900/90 border-blue-500/50 text-blue-100`
      default:
        return `${baseClasses} bg-gray-900/90 border-gray-500/50 text-gray-100`
    }
  }

  // 🎯 ICONOS POR CATEGORÍA
  const getAlertIcon = (alert: PerformanceAlert) => {
    const iconClasses = 'w-5 h-5 flex-shrink-0'

    switch (alert.category) {
      case 'performance':
        return <span className={`${iconClasses} text-yellow-400`}>⚡</span>
      case 'memory':
        return <span className={`${iconClasses} text-red-400`}>💾</span>
      case 'cache':
        return <span className={`${iconClasses} text-blue-400`}>🧠</span>
      case 'medical':
        return <span className={`${iconClasses} text-green-400`}>🏥</span>
      case 'system':
        return <span className={`${iconClasses} text-purple-400`}>⚙️</span>
      default:
        return <span className={`${iconClasses} text-gray-400`}>ℹ️</span>
    }
  }

  // 🚨 MANEJAR NUEVAS ALERTAS
  const handleNewAlert = useCallback(
    (alert: PerformanceAlert) => {
      setAlerts(prev => {
        const updated = [alert, ...prev.filter(a => a.id !== alert.id)]
        return updated.slice(0, maxVisible * 2) // Mantener buffer para rotación
      })

      setVisibleAlerts(prev => new Set([...prev, alert.id]))

      // Auto-hide si está habilitado
      if (autoHide && alert.type !== 'error') {
        setTimeout(() => {
          hideAlert(alert.id)
        }, hideDelay)
      }

      // Sonido de notificación (opcional)
      if (alert.severity === 'high' || alert.severity === 'critical') {
        playNotificationSound(alert.type)
      }
    },
    [maxVisible, autoHide, hideDelay]
  )

  // 🔇 OCULTAR ALERTA
  const hideAlert = useCallback((alertId: string) => {
    setVisibleAlerts(prev => {
      const updated = new Set(prev)
      updated.delete(alertId)
      return updated
    })

    // Remover después de la animación
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== alertId))
    }, 300)
  }, [])

  // 🎵 SONIDO DE NOTIFICACIÓN
  const playNotificationSound = (type: PerformanceAlert['type']) => {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      try {
        const audioContext = new AudioContext()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        // Frecuencias por tipo
        const frequencies = {
          error: 440, // A4 - Serio
          warning: 660, // E5 - Atención
          info: 880, // A5 - Suave
        }

        oscillator.frequency.value = frequencies[type]
        oscillator.type = 'sine'
        gainNode.gain.value = 0.1

        oscillator.start()
        oscillator.stop(audioContext.currentTime + CALCULATION_FACTORS.FADE_OPACITY)
      } catch (error) {
        // Silenciar errores de audio
      }
    }
  }

  // ✅ RESOLVER ALERTA
  const resolveAlert = useCallback(
    (alertId: string) => {
      medicalSystemMonitor.resolveAlert(alertId)
      hideAlert(alertId)
    },
    [hideAlert]
  )

  // 🎭 EFECTOS
  useEffect(() => {
    // Suscribirse a nuevas alertas
    medicalSystemMonitor.on('alert', handleNewAlert)

    // Cargar alertas existentes
    const existingAlerts = medicalSystemMonitor.getAlerts().slice(0, maxVisible)
    setAlerts(existingAlerts)
    setVisibleAlerts(new Set(existingAlerts.map(a => a.id)))

    return () => {
      medicalSystemMonitor.off('alert', handleNewAlert)
    }
  }, [handleNewAlert, maxVisible])

  // 📊 FORMATEAR TIMESTAMP
  const formatTimestamp = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp

    if (diff < 60000) return 'Ahora'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
    return `${Math.floor(diff / 86400000)}d`
  }

  // 🎨 RENDERIZADO
  const visibleAlertsList = alerts.filter(alert => visibleAlerts.has(alert.id)).slice(0, maxVisible)

  if (visibleAlertsList.length === 0) return null

  return (
    <div className={getPositionClasses()}>
      {visibleAlertsList.map(alert => (
        <div
          key={alert.id}
          className={`${getAlertStyles(alert)} ${
            visibleAlerts.has(alert.id) ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {getAlertIcon(alert)}
              <span className="font-semibold text-sm capitalize">{alert.category}</span>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  alert.severity === 'critical'
                    ? 'bg-red-600 text-white'
                    : alert.severity === 'high'
                      ? 'bg-orange-600 text-white'
                      : alert.severity === 'medium'
                        ? 'bg-yellow-600 text-black'
                        : 'bg-green-600 text-white'
                }`}
              >
                {alert.severity}
              </span>
            </div>

            <div className="flex items-center space-x-1">
              <span className="text-xs opacity-60">{formatTimestamp(alert.timestamp)}</span>
              <button
                onClick={() => hideAlert(alert.id)}
                className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Mensaje */}
          <p className="text-sm leading-relaxed mb-3">{alert.message}</p>

          {/* Metadata (si existe) */}
          {alert.metadata && (
            <div className="text-xs opacity-80 bg-black/20 rounded p-2 mb-3">
              {Object.entries(alert.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="capitalize">{key}:</span>
                  <span className="font-mono">{String(value)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Acciones */}
          <div className="flex space-x-2">
            {alert.type === 'error' && (
              <button
                onClick={() => resolveAlert(alert.id)}
                className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition-colors"
              >
                Resolver
              </button>
            )}
            <button
              onClick={() => hideAlert(alert.id)}
              className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded transition-colors"
            >
              Ocultar
            </button>
          </div>
        </div>
      ))}

      {/* Indicador de más alertas */}
      {alerts.length > maxVisible && (
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-gray-900/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-gray-300 border border-gray-600/50">
            <span>+{alerts.length - maxVisible} más alertas</span>
            <button
              onClick={() => {
                // Mostrar todas las alertas (expandir)
                setVisibleAlerts(new Set(alerts.slice(0, alerts.length).map(a => a.id)))
              }}
              className="text-blue-400 hover:text-blue-300"
            >
              Ver todas
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// 🎯 HOOK PARA USAR EL SISTEMA DE ALERTAS
export const useAlertSystem = () => {
  const [alertCount, setAlertCount] = useState(0)
  const [lastAlert, setLastAlert] = useState<PerformanceAlert | null>(null)

  useEffect(() => {
    const handleAlert = (alert: PerformanceAlert) => {
      setLastAlert(alert)
      setAlertCount(prev => prev + 1)
    }

    medicalSystemMonitor.on('alert', handleAlert)

    return () => {
      medicalSystemMonitor.off('alert', handleAlert)
    }
  }, [])

  return {
    alertCount,
    lastAlert,
    createManualAlert: (message: string, type: PerformanceAlert['type'] = 'info') => {
      medicalSystemMonitor.emit('alert', {
        id: `manual_${Date.now()}`,
        type,
        category: 'system',
        message,
        timestamp: Date.now(),
        severity: 'low',
        resolved: false,
      } as PerformanceAlert)
    },
  }
}

export default AlertSystem
