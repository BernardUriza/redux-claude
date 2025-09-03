// src/components/ChatNotifications.tsx
// Notification system - extracted from MedicalChat.tsx
'use client'

interface ChatNotificationsProps {
  showAutoFillNotification: boolean
  setShowAutoFillNotification: (show: boolean) => void
  showDataRequiredAlert: boolean
  setShowDataRequiredAlert: (show: boolean) => void
  completenessPercentage: number
  isNOMCompliant: boolean
  canProceedToSOAP: boolean
}

export const ChatNotifications: React.FC<ChatNotificationsProps> = ({
  showAutoFillNotification,
  setShowAutoFillNotification,
  showDataRequiredAlert,
  setShowDataRequiredAlert,
  completenessPercentage,
  isNOMCompliant,
  canProceedToSOAP,
}) => {
  return (
    <>
      {/* Auto-fill notification */}
      {showAutoFillNotification && (
        <div className="bg-gradient-to-r from-green-900/80 to-emerald-900/60 border-t border-green-500/30 px-4 sm:px-6 lg:px-8 py-4 backdrop-blur-xl">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-green-400 animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-green-200 font-medium text-sm">
                <span className="font-bold">🎯 Auto-fill activado!</span> Prompt médico generado
                automáticamente
              </p>
              <p className="text-green-300/80 text-xs mt-1">
                Completeness: {completenessPercentage}% • NOM Compliant:{' '}
                {isNOMCompliant ? '✅' : '❌'} •{' '}
                {canProceedToSOAP ? 'Listo para SOAP' : 'Procesando...'}
              </p>
            </div>
            <button
              onClick={() => setShowAutoFillNotification(false)}
              className="flex-shrink-0 text-green-400 hover:text-green-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Data Required Alert */}
      {showDataRequiredAlert && (
        <div className="bg-gradient-to-r from-orange-900/80 to-red-900/60 border-t border-orange-500/30 px-4 sm:px-6 lg:px-8 py-4 backdrop-blur-xl">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-orange-400 animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-orange-200 font-medium text-sm">
                <span className="font-bold">Consulta médica detectada:</span> Se requieren datos
                del paciente para proceder con análisis seguro.
              </p>
              <p className="text-orange-300/80 text-xs mt-1">
                Complete edad, género y motivo de consulta en el asistente avanzado que se ha
                abierto.
              </p>
            </div>
            <button
              onClick={() => setShowDataRequiredAlert(false)}
              className="flex-shrink-0 text-orange-400 hover:text-orange-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
