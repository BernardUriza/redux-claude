// src/hooks/useAlertManager.ts
// Alert state management hook - extracted from AlertSystem.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { medicalSystemMonitor, PerformanceAlert } from '../monitoring/MedicalSystemMonitor'
import { CALCULATION_FACTORS } from '../constants/magicNumbers'

interface UseAlertManagerProps {
  maxVisible: number
  autoHide: boolean
  hideDelay: number
}

export const useAlertManager = ({ maxVisible, autoHide, hideDelay }: UseAlertManagerProps) => {
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([])
  const [visibleAlerts, setVisibleAlerts] = useState<Set<string>>(new Set())

  // 🌵 SONIDO DE NOTIFICACIÓN
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

  // ✅ RESOLVER ALERTA
  const resolveAlert = useCallback(
    (alertId: string) => {
      medicalSystemMonitor.resolveAlert(alertId)
      hideAlert(alertId)
    },
    [hideAlert]
  )

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
    [maxVisible, autoHide, hideDelay, hideAlert]
  )

  // Mostrar todas las alertas
  const showAllAlerts = useCallback(() => {
    setVisibleAlerts(new Set(alerts.slice(0, alerts.length).map(a => a.id)))
  }, [alerts])

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

  // Filtrar alertas visibles
  const visibleAlertsList = alerts.filter(alert => visibleAlerts.has(alert.id)).slice(0, maxVisible)

  return {
    alerts,
    visibleAlerts,
    visibleAlertsList,
    hideAlert,
    resolveAlert,
    showAllAlerts,
  }
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
