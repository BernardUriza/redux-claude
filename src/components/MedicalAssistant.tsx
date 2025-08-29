// 🏥 Asistente Médico IA Completo - Modal de Diagnóstico Inteligente
// Creado por Bernard Orozco - Sistema de Diagnóstico Moderno y Elegante

'use client'

import { useSelector } from 'react-redux'
import { selectSystemMetrics } from '../../packages/cognitive-core/src/store/selectors/medicalSelectors'
import type { RootState } from '../../packages/cognitive-core/src/store/store'
// import { useAssistantChat } from '../hooks/useMultinucleusChat' // Hook no disponible
import { generateMedicalPrompt, type MedicalExtractionOutput } from '@redux-claude/cognitive-core'
import { IntelligentMedicalChat } from './IntelligentMedicalChat'

interface MedicalAssistantProps {
  partialInput: string
  onSelectTemplate: (template: string) => void
  isVisible: boolean
  onClose: () => void
  className?: string
  showMetrics?: boolean
}

export const MedicalAssistant = ({
  partialInput,
  onSelectTemplate,
  isVisible,
  onClose,
  className = '',
  showMetrics = false,
}: MedicalAssistantProps) => {
  // 🧠 MULTINÚCLEO: Usando Assistant Core para el asistente - Mock por falta de hook
  const messages: any[] = []
  const messageCount = 0
  const currentSession = { id: 'mock-session', startedAt: Date.now() }

  // 🎯 SELECTORES REDUX para métricas y datos del paciente
  const systemMetrics = useSelector(selectSystemMetrics)
  const patientData = useSelector((state: RootState) => state.medicalChat.sharedState.patientData)
  const readyForSOAP = useSelector((state: RootState) => state.medicalChat.sharedState.readyForSOAP)

  // 🎯 GENERAR PROMPT MÉDICO CUANDO HAYA DATOS SUFICIENTES
  const canGeneratePrompt = patientData.age && patientData.gender && patientData.primarySymptom

  const handleGeneratePrompt = () => {
    if (canGeneratePrompt) {
      // Crear datos estructurados según MedicalExtractionOutput
      const extractedData = {
        demographics: {
          patient_age_years:
            typeof patientData.age === 'number'
              ? patientData.age
              : typeof patientData.age === 'string' && !isNaN(Number(patientData.age))
                ? Number(patientData.age)
                : 'unknown',
          patient_gender: patientData.gender || 'unknown',
          confidence_demographic: patientData.age && patientData.gender ? 0.9 : 0.5,
        },
        clinical_presentation: {
          chief_complaint: patientData.primarySymptom || 'unknown',
          primary_symptoms: patientData.primarySymptom ? [patientData.primarySymptom] : null,
          anatomical_location: 'unknown',
          confidence_symptoms: patientData.primarySymptom ? 0.8 : 0.0,
        },
        symptom_characteristics: {
          duration_description: patientData.duration || 'unknown',
          pain_intensity_scale: patientData.intensity || null,
          pain_characteristics: patientData.characteristics || null,
          aggravating_factors: patientData.triggers || null,
          relieving_factors: patientData.relievingFactors || null,
          associated_symptoms: patientData.associatedSymptoms || null,
          temporal_pattern: patientData.timePattern || 'unknown',
          confidence_context: patientData.duration || patientData.intensity ? 0.7 : 0.3,
        },
        medical_validation: {
          anatomical_contradictions: [],
          logical_inconsistencies: [],
          requires_clarification: [],
          medical_alerts: [],
        },
        extraction_metadata: {
          overall_completeness_percentage: patientData.isComplete ? 90 : 60,
          demographic_complete: !!(patientData.age && patientData.gender),
          clinical_complete: !!patientData.primarySymptom,
          context_complete: !!(patientData.duration || patientData.intensity),
          nom_compliant: !!(patientData.age && patientData.gender && patientData.primarySymptom),
          ready_for_soap_generation: !!(
            patientData.age &&
            patientData.gender &&
            patientData.primarySymptom
          ),
          missing_critical_fields: [
            !patientData.age && 'patient_age_years',
            !patientData.gender && 'patient_gender',
            !patientData.primarySymptom && 'chief_complaint',
          ].filter(Boolean) as string[],
          data_points_extracted_this_iteration: 0,
          extraction_timestamp: new Date().toISOString(),
          claude_model_used: 'claude-sonnet-4',
        },
      }

      const { prompt } = generateMedicalPrompt(extractedData as MedicalExtractionOutput)
      if (prompt) {
        onSelectTemplate(prompt)
        // Feedback visual
        const autoCloseElement = document.querySelector('[data-autoclose-indicator]')
        if (autoCloseElement) {
          autoCloseElement.textContent = '✅ Prompt SOAP generado exitosamente'
          autoCloseElement.classList.add('animate-pulse', 'text-green-400')
        }

        // Auto-cerrar después de generar el prompt
        setTimeout(() => {
          onClose()
        }, 1500)
      }
    }
  }

  // 🔥 ANILLO ÚNICO: Callback para detectar cuando las inferencias están completas
  const handleInferenceUpdate = (inferences: any[]) => {
    const ageInference = inferences.find(i => i.id === 'age')
    const genderInference = inferences.find(i => i.id === 'gender')

    // Verificar si ambos tienen confianza alta (>= 0.8)
    const ageComplete = ageInference && ageInference.confidence >= 0.8 && ageInference.value > 0
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
      <div className="relative w-full max-w-[65vw] h-[95vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl border border-slate-600/50 overflow-hidden flex flex-col backdrop-blur-sm">
        {/* Header Moderno y Elegante - Creado por Bernard Orozco */}
        <div className="flex justify-between items-center px-8 py-6 bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600/50">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-2xl shadow-lg">
              <span className="text-2xl">🏥</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                Asistente de Diagnóstico IA
              </h3>
              <p className="text-slate-300 text-base font-medium mt-1">
                Sistema inteligente • Diagnóstico avanzado • Creado por Bernard Orozco
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Indicador de Estado */}
            <div className="flex items-center gap-3 bg-slate-700/50 px-4 py-2 rounded-full">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
              <span className="text-sm font-bold text-slate-200">ACTIVO</span>
            </div>

            {/* Métricas del Sistema y Estado del Paciente */}
            <div className="hidden lg:flex items-center gap-4 text-sm text-slate-300">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full shadow-lg ${
                    systemMetrics.systemHealth === 'optimal'
                      ? 'bg-green-400'
                      : systemMetrics.systemHealth === 'good'
                        ? 'bg-yellow-400'
                        : 'bg-red-400'
                  } animate-pulse`}
                ></div>
                <span className="font-semibold">{systemMetrics.systemHealth.toUpperCase()}</span>
              </div>
              <span>💬 {messageCount} mensajes</span>
              <span>⏱ {Math.round((Date.now() - currentSession.startedAt) / 1000)}s</span>
              <span>🔗 {currentSession.id.slice(0, 8)}...</span>

              {/* Estado del Paciente Compacto */}
              {(patientData.age || patientData.gender || patientData.primarySymptom) && (
                <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-1 rounded-full">
                  <span
                    className={`w-2 h-2 rounded-full shadow-lg ${patientData.isComplete ? 'bg-green-400' : 'bg-amber-400'}`}
                  ></span>
                  <span className="font-medium">
                    {patientData.age && `${patientData.age}a`}
                    {patientData.age && patientData.gender && ' • '}
                    {patientData.gender && (patientData.gender === 'masculino' ? 'M' : 'F')}
                    {readyForSOAP && ' • ✓SOAP'}
                  </span>
                </div>
              )}
            </div>

            {/* Botón Generar y Usar Prompt SOAP */}
            {canGeneratePrompt && (
              <button
                onClick={handleGeneratePrompt}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/25 flex items-center gap-2"
                title="Generar prompt SOAP con los datos recopilados"
              >
                <span className="text-sm">📋</span>
                <span className="hidden xl:inline">Generar Prompt SOAP</span>
                <span className="xl:hidden">SOAP</span>
              </button>
            )}

            {/* Botón de Cerrar */}
            <button
              onClick={onClose}
              className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg"
            >
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

        {/* Contenido Principal: Chat Completo - Creado por Bernard Orozco */}
        <div className="flex-1 overflow-hidden">
          <IntelligentMedicalChat
            className="h-full"
            showMetrics={true}
            partialInput={partialInput}
            coreType="assistant" // 🤖 USA EL NÚCLEO ASSISTANT, NO DASHBOARD
            onInitialResponse={response => {
              // Cuando el asistente responde automáticamente
              console.log('🎯 [ASSISTANT CORE] Respuesta inicial generada:', response)
            }}
          />
        </div>

        {/* Footer Informativo */}
        <div className="bg-slate-800/60 border-t border-slate-600/50 px-8 py-4 backdrop-blur-sm overflow-hidden">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-1.5 rounded-lg">
                <span className="text-sm">💡</span>
              </div>
              <span className="font-medium">Sistema de diagnóstico inteligente en tiempo real</span>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div
                data-autoclose-indicator
                className="text-cyan-400 font-medium transition-all duration-300"
              >
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
                    ]
                      .filter(Boolean)
                      .join(', ')}{' '}
                    | Debug: age={patientData.age}, gender={patientData.gender}, symptom=
                    {patientData.primarySymptom}
                  </span>
                )}
              </div>
              <div className="text-slate-400">
                Creado por <span className="text-cyan-400 font-semibold">Bernard Orozco</span> 💍
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MedicalAssistant
