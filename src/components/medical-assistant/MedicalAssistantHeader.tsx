// src/components/medical-assistant/MedicalAssistantHeader.tsx
// Medical Assistant Header Component - Extracted from MedicalAssistant.tsx

'use client'

interface PatientData {
  age?: number
  gender?: string
  primarySymptom?: string
  isComplete?: boolean
}

interface SystemSession {
  id: string
  startedAt: number
}

interface MedicalAssistantHeaderProps {
  systemMetrics: { systemHealth: string }
  messageCount: number
  currentSession: SystemSession
  patientData: PatientData
  readyForSOAP: boolean
  canGeneratePrompt: boolean
  onGeneratePrompt: () => void
  onClose: () => void
}

const getHealthStatusClass = (health: string) => {
  switch (health) {
    case 'optimal':
      return 'status-active'
    case 'good':
      return 'status-warning'
    default:
      return 'status-error'
  }
}

const getPatientDisplayData = (patientData: PatientData) => {
  const parts = []

  if (patientData.age) parts.push(`${patientData.age}a`)
  if (patientData.gender) {
    parts.push(patientData.gender === 'masculino' ? 'M' : 'F')
  }

  return parts.join(' • ')
}

export const MedicalAssistantHeader = ({
  systemMetrics,
  messageCount,
  currentSession,
  patientData,
  readyForSOAP,
  canGeneratePrompt,
  onGeneratePrompt,
  onClose,
}: MedicalAssistantHeaderProps) => {
  const sessionDuration = Math.round((Date.now() - currentSession.startedAt) / 1000)
  const sessionId = currentSession.id.slice(0, 8)
  const hasPatientData = patientData.age || patientData.gender || patientData.primarySymptom
  const patientDisplay = getPatientDisplayData(patientData)

  return (
    <div className="flex justify-between items-center px-8 py-6 medical-header">
      <div className="flex items-center gap-4">
        <div className="medical-icon">
          <span className="text-2xl">🏥</span>
        </div>
        <div>
          <h3 className="medical-title">Asistente de Diagnóstico IA</h3>
          <p className="medical-subtitle mt-1">Sistema inteligente • Diagnóstico avanzado</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 bg-slate-700/50 px-4 py-2 rounded-full">
          <div className="status-indicator status-active"></div>
          <span className="text-sm font-bold text-slate-200">ACTIVO</span>
        </div>

        <div className="hidden lg:flex items-center gap-4 text-sm text-slate-300">
          <div className="flex items-center gap-3">
            <div
              className={`status-indicator ${getHealthStatusClass(systemMetrics.systemHealth)}`}
            />
            <span className="font-semibold">{systemMetrics.systemHealth.toUpperCase()}</span>
          </div>
          <span>💬 {messageCount} mensajes</span>
          <span>⏱ {sessionDuration}s</span>
          <span>🔗 {sessionId}...</span>

          {hasPatientData && (
            <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-1 rounded-full">
              <span
                className={`w-2 h-2 rounded-full shadow-lg ${patientData.isComplete ? 'status-active' : 'bg-amber-400'}`}
              />
              <span className="font-medium">
                {patientDisplay}
                {readyForSOAP && ' • ✓SOAP'}
              </span>
            </div>
          )}
        </div>

        {canGeneratePrompt && (
          <button
            onClick={onGeneratePrompt}
            className="btn-medical-primary flex items-center gap-2"
            title="Generar prompt SOAP con los datos recopilados"
          >
            <span className="text-sm">📋</span>
            <span className="hidden xl:inline">Generar Prompt SOAP</span>
            <span className="xl:hidden">SOAP</span>
          </button>
        )}

        <button onClick={onClose} className="btn-medical-close">
          <svg
            className="w-6 h-6 text-slate-300 hover:text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
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
  )
}
