// src/components/AlertCard.tsx
// Individual alert card component - extracted from AlertSystem.tsx
'use client'

import React from 'react'
import { PerformanceAlert } from '../monitoring/MedicalSystemMonitor'

interface AlertCardProps {
  alert: PerformanceAlert
  isVisible: boolean
  onHide: (alertId: string) => void
  onResolve: (alertId: string) => void
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, isVisible, onHide, onResolve }) => {
  // 🎨 ESTILOS POR TIPO DE ALERTA
  const getAlertStyles = () => {
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
  const getAlertIcon = () => {
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

  // 📊 FORMATEAR TIMESTAMP
  const formatTimestamp = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp

    if (diff < 60000) return 'Ahora'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
    return `${Math.floor(diff / 86400000)}d`
  }

  return (
    <div
      className={`${getAlertStyles()} ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getAlertIcon()}
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
            onClick={() => onHide(alert.id)}
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
            onClick={() => onResolve(alert.id)}
            className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition-colors"
          >
            Resolver
          </button>
        )}
        <button
          onClick={() => onHide(alert.id)}
          className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded transition-colors"
        >
          Ocultar
        </button>
      </div>
    </div>
  )
}
