// src/components/AlertSystem.tsx
// Alert container orchestrator - refactored for single responsibility
'use client'

import React from 'react'
import { AlertCard } from '../presentation/components/ui/AlertCard'
import { useAlertManager } from '../hooks/useAlertManager'

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
  const { alerts, visibleAlerts, visibleAlertsList, hideAlert, resolveAlert, showAllAlerts } =
    useAlertManager({
      maxVisible,
      autoHide,
      hideDelay,
    })

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

  if (visibleAlertsList.length === 0) return null

  return (
    <div className={getPositionClasses()}>
      {visibleAlertsList.map(alert => (
        <AlertCard
          key={alert.id}
          alert={alert}
          isVisible={visibleAlerts.has(alert.id)}
          onHide={hideAlert}
          onResolve={resolveAlert}
        />
      ))}

      {/* Indicador de más alertas */}
      {alerts.length > maxVisible && (
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-gray-900/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-gray-300 border border-gray-600/50">
            <span>+{alerts.length - maxVisible} más alertas</span>
            <button onClick={showAllAlerts} className="text-blue-400 hover:text-blue-300">
              Ver todas
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AlertSystem
