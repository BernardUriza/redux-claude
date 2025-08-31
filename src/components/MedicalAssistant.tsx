'use client'

import { useSelector } from 'react-redux'
import { selectSystemMetrics } from '../../packages/cognitive-core/src/store/selectors/medicalSelectors'
import type { RootState } from '../../packages/cognitive-core/src/store/store'
import { generateMedicalPrompt, type MedicalExtractionOutput } from '@redux-claude/cognitive-core'
import IntelligentMedicalChat from './IntelligentMedicalChat'
import '../styles/medical-components.css'

interface PatientData {
  age?: number
  gender?: string
  primarySymptom?: string
  symptoms?: string[]
  duration?: string
  intensity?: number
  characteristics?: string[]
  triggers?: string[]
  relievingFactors?: string[]
  associatedSymptoms?: string[]
  timePattern?: string
  isComplete?: boolean
}

interface SystemSession {
  id: string
  startedAt: number
}

interface MedicalAssistantProps {
  partialInput: string
  onSelectTemplate: (template: string) => void
  isVisible: boolean
  onClose: () => void
  className?: string
  showMetrics?: boolean
}

const MedicalAssistant = ({
  partialInput,
  onSelectTemplate,
  isVisible,
  onClose,
  className = '',
  showMetrics = false,
}: MedicalAssistantProps) => {
  const messageCount = 0
  const currentSession: SystemSession = { id: 'mock-session', startedAt: Date.now() }

  const systemMetrics = useSelector(selectSystemMetrics)
  const patientData = useSelector((state: RootState) => state.medicalChat.sharedState.patientData) as PatientData
  const readyForSOAP = useSelector((state: RootState) => state.medicalChat.sharedState.readyForSOAP) as boolean
  const currentExtraction = useSelector((state: RootState) => state.medicalChat.medicalExtraction.currentExtraction) as MedicalExtractionOutput | null

  const canGeneratePrompt = Boolean(patientData.age && patientData.gender && patientData.primarySymptom)

  const handleGeneratePrompt = () => {
    if (!canGeneratePrompt) return

    // Usar datos ya extraídos del slice O crear mínimo viable
    const extractedData = currentExtraction || createMinimalExtraction(patientData)

    const { prompt } = generateMedicalPrompt(extractedData)
    if (prompt) {
      // Preview inteligente: inyectar en input sin auto-envío
      onSelectTemplate(prompt)
      
      // Clipboard para desktop
      navigator.clipboard?.writeText(prompt).catch(() => {})
      
      // Feedback visual sin auto-close
      const indicator = document.querySelector('[data-autoclose-indicator]')
      if (indicator) {
        indicator.textContent = '✅ Prompt listo - Revisa y envía cuando gustes'
        indicator.classList.add('text-green-400')
      }
    }
  }

  const createMinimalExtraction = (data: PatientData): MedicalExtractionOutput => ({
    demographics: {
      patient_age_years: typeof data.age === 'number' ? data.age : 'unknown',
      patient_gender: (data.gender === 'masculino' || data.gender === 'femenino' ? data.gender : 'unknown') as 'masculino' | 'femenino' | 'unknown',
      confidence_demographic: !!(data.age && data.gender) ? 0.9 : 0.5,
    },
    clinical_presentation: {
      chief_complaint: data.primarySymptom || 'unknown',
      primary_symptoms: data.symptoms || null,
      anatomical_location: 'unknown',
      confidence_symptoms: !!data.primarySymptom ? 0.8 : 0.0,
    },
    symptom_characteristics: {
      duration_description: data.duration || 'unknown',
      pain_intensity_scale: data.intensity || null,
      pain_characteristics: data.characteristics || null,
      aggravating_factors: data.triggers || null,
      relieving_factors: data.relievingFactors || null,
      associated_symptoms: data.associatedSymptoms || null,
      temporal_pattern: data.timePattern || 'unknown',
      confidence_context: !!(data.duration || data.intensity) ? 0.7 : 0.3,
    },
    medical_validation: {
      anatomical_contradictions: [],
      logical_inconsistencies: [],
      requires_clarification: [],
      medical_alerts: [],
    },
    extraction_metadata: {
      overall_completeness_percentage: data.isComplete ? 90 : 60,
      demographic_complete: !!(data.age && data.gender),
      clinical_complete: !!data.primarySymptom,
      context_complete: !!(data.duration || data.intensity),
      nom_compliant: !!(data.age && data.gender && data.primarySymptom),
      ready_for_soap_generation: !!(data.age && data.gender && data.primarySymptom),
      missing_critical_fields: [
        !data.age && 'patient_age_years',
        !data.gender && 'patient_gender',
        !data.primarySymptom && 'chief_complaint',
      ].filter(Boolean) as string[],
      data_points_extracted_this_iteration: 0,
      extraction_timestamp: new Date().toISOString(),
      claude_model_used: 'claude-sonnet-4',
    },
  })

  const handleInferenceUpdate = (inferences: Array<{ id: string; confidence: number; value: string | number }>) => {
    const ageInference = inferences.find(i => i.id === 'age')
    const genderInference = inferences.find(i => i.id === 'gender')

    // Verificar si ambos tienen confianza alta (>= 0.8)
    const ageComplete = ageInference && ageInference.confidence >= 0.8 && typeof ageInference.value === 'number' && ageInference.value > 0
    const genderComplete =
      genderInference &&
      genderInference.confidence >= 0.8 &&
      genderInference.value !== 'No especificado'

    // 🎯 AUTOCLOSE Y PROMPT INJECTION
    if (ageComplete && genderComplete) {
      const age = ageInference.value
      const gender = genderInference.value === 'Masculino' ? 'masculino' : 'femenina'

      // Generar prompt médico completo usando los datos originales + inferencias
      const enhancedPrompt = `Paciente ${gender} de ${age} años ${partialInput.toLowerCase().includes('años') ? '' : 'presenta '}${partialInput
        .replace(/^\w/, c => c.toLowerCase())
        .replace(/años?\s*/i, '')
        .trim()}`

      // 🧝‍♂️ SABIDURÍA ÉLFICA: Feedback inmediato + timing perfecto
      console.log('🔥 ANILLO ÚNICO ACTIVADO:', enhancedPrompt)

      // Mostrar feedback visual inmediato (< 0.1s)
      const autoCloseElement = document.querySelector('[data-autoclose-indicator]')
      if (autoCloseElement) {
        autoCloseElement.textContent = '✅ Prompt completado automáticamente'
        autoCloseElement.classList.add('animate-pulse', 'text-green-400')
      }

      // Inyección inmediata del prompt (Human-AI Collaboration)
      setTimeout(() => {
        onSelectTemplate(enhancedPrompt)
      }, 100) // 0.1 segundos = reacción inmediata

      // Auto-cierre con timing élfico (< 1 segundo total)
      setTimeout(() => {
        onClose()
      }, 800) // 0.8 segundos = mantiene flujo mental
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-[65vw] h-[95vh] medical-card overflow-hidden flex flex-col backdrop-blur-sm">
        <MedicalAssistantHeader
          systemMetrics={systemMetrics}
          messageCount={messageCount}
          currentSession={currentSession}
          patientData={patientData}
          readyForSOAP={readyForSOAP}
          canGeneratePrompt={canGeneratePrompt}
          onGeneratePrompt={handleGeneratePrompt}
          onClose={onClose}
        />

        {/* Chat Container */}
        <div className="flex-1 overflow-hidden">
          <IntelligentMedicalChat
            className="h-full"
            showMetrics={true}
            partialInput={partialInput}
            coreType="assistant" // 🤖 USA EL NÚCLEO ASSISTANT, NO DASHBOARD
            onInitialResponse={(response: string) => {
              console.log('🎯 Respuesta inicial generada:', response)
            }}
          />
        </div>

        <MedicalAssistantFooter
          canGeneratePrompt={canGeneratePrompt}
          patientData={patientData}
        />
      </div>
    </div>
  )
}

// Header Component
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

const MedicalAssistantHeader = ({
  systemMetrics,
  messageCount,
  currentSession,
  patientData,
  readyForSOAP,
  canGeneratePrompt,
  onGeneratePrompt,
  onClose,
}: MedicalAssistantHeaderProps) => (
  <div className="flex justify-between items-center px-8 py-6 medical-header">
    <div className="flex items-center gap-4">
      <div className="medical-icon">
        <span className="text-2xl">🏥</span>
      </div>
      <div>
        <h3 className="medical-title">
          Asistente de Diagnóstico IA
        </h3>
        <p className="medical-subtitle mt-1">
          Sistema inteligente • Diagnóstico avanzado
        </p>
      </div>
    </div>

    <div className="flex items-center gap-4">
      <div className="flex items-center gap-3 bg-slate-700/50 px-4 py-2 rounded-full">
        <div className="status-indicator status-active"></div>
        <span className="text-sm font-bold text-slate-200">ACTIVO</span>
      </div>

      <div className="hidden lg:flex items-center gap-4 text-sm text-slate-300">
        <div className="flex items-center gap-3">
          <div className={`status-indicator ${
            systemMetrics.systemHealth === 'optimal' ? 'status-active' :
            systemMetrics.systemHealth === 'good' ? 'status-warning' : 'status-error'
          }`} />
          <span className="font-semibold">{systemMetrics.systemHealth.toUpperCase()}</span>
        </div>
        <span>💬 {messageCount} mensajes</span>
        <span>⏱ {Math.round((Date.now() - currentSession.startedAt) / 1000)}s</span>
        <span>🔗 {currentSession.id.slice(0, 8)}...</span>

        {(patientData.age || patientData.gender || patientData.primarySymptom) && (
          <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-1 rounded-full">
            <span className={`w-2 h-2 rounded-full shadow-lg ${patientData.isComplete ? 'status-active' : 'bg-amber-400'}`} />
            <span className="font-medium">
              {patientData.age && `${patientData.age}a`}
              {patientData.age && patientData.gender && ' • '}
              {patientData.gender && (patientData.gender === 'masculino' ? 'M' : 'F')}
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

      <button
        onClick={onClose}
        className="btn-medical-close"
      >
        <svg className="w-6 h-6 text-slate-300 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
)

// Footer Component
interface MedicalAssistantFooterProps {
  canGeneratePrompt: boolean
  patientData: PatientData
}

const MedicalAssistantFooter = ({ canGeneratePrompt, patientData }: MedicalAssistantFooterProps) => (
  <div className="medical-footer px-8 py-4 overflow-hidden">
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-3 text-sm medical-text">
        <div className="medical-icon p-1.5">
          <span className="text-sm">💡</span>
        </div>
        <span className="font-medium">Sistema de diagnóstico inteligente en tiempo real</span>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div data-autoclose-indicator className="text-cyan-400 font-medium transition-all duration-300">
          {canGeneratePrompt ? (
            <span className="text-green-400">
              ✅ Datos suficientes recopilados - Listo para generar SOAP
            </span>
          ) : (
            <span>
              🚀 Recopilando datos - Falta:{' '}
              {[
                !patientData.age && 'Edad',
                !patientData.gender && 'Género',
                !patientData.primarySymptom && 'Síntoma principal',
              ].filter(Boolean).join(', ')}
            </span>
          )}
        </div>
      </div>
    </div>
  </div>
)

export default MedicalAssistant
