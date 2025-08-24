// 🏥 Medical Prompt Tabs Component - BRUTAL Next.js Implementation
// Creado por Bernard Orozco - Sistema de tabs con persistencia LocalStorage

import React, { useState, useEffect } from 'react'
import { medicalOrchestrator, PatientFormData, OrchestrationResult } from '@redux-claude/cognitive-core'

interface MedicalPromptTabsProps {
  isOpen: boolean
  onClose: () => void
  onPromptSelected: (prompt: string) => void
}

type TabType = 'prompts' | 'patient_data' | 'specialty_forms'

const STORAGE_KEY = 'medical_patient_data'

export const MedicalPromptTabs: React.FC<MedicalPromptTabsProps> = ({
  isOpen,
  onClose,
  onPromptSelected
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('patient_data')
  const [patientData, setPatientData] = useState<Partial<PatientFormData>>({})
  const [orchestrationResult, setOrchestrationResult] = useState<OrchestrationResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [promptText, setPromptText] = useState('')

  // Load patient data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setPatientData(parsed)
        
        // Auto-update sidebar menu here if needed
        // updateSidebarPatientInfo(parsed)
        
      } catch (error) {
        console.error('Error loading patient data:', error)
      }
    }
  }, [])

  // Save to localStorage whenever patient data changes
  useEffect(() => {
    if (Object.keys(patientData).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(patientData))
      
      // Update sidebar menu automatically
      // updateSidebarPatientInfo(patientData)
    }
  }, [patientData])

  // Process with orchestrator when data or prompt changes
  const processWithOrchestrator = async () => {
    if (!promptText.trim() && Object.keys(patientData).length === 0) return

    setIsProcessing(true)
    try {
      const result = await medicalOrchestrator.processPatientInput(patientData, promptText)
      setOrchestrationResult(result)
      
      // Auto-switch tabs based on result
      if (result.action === 'request_data') {
        setActiveTab('patient_data')
      } else if (result.action === 'suggest_specialty') {
        setActiveTab('specialty_forms')
      } else if (result.action === 'generate_prompts') {
        setActiveTab('prompts')
      }
      
    } catch (error) {
      console.error('Error processing with orchestrator:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const updatePatientData = (field: keyof PatientFormData, value: any) => {
    setPatientData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePromptSelect = (template: string) => {
    // Replace template variables with actual patient data
    let filledPrompt = template
    
    if (patientData.age) {
      filledPrompt = filledPrompt.replace(/\[edad\]/g, patientData.age.toString())
    }
    if (patientData.gender) {
      const genderText = patientData.gender === 'M' ? 'masculino' : 'femenino'
      filledPrompt = filledPrompt.replace(/\[género\]/g, genderText)
    }
    if (patientData.chiefComplaint) {
      filledPrompt = filledPrompt.replace(/\[síntoma principal\]/g, patientData.chiefComplaint)
    }
    
    onPromptSelected(filledPrompt)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-slate-700/50 w-full max-w-4xl h-5/6 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/80 to-slate-900/60">
          <h2 className="text-xl font-bold text-white">
            🏥 Asistente Médico Inteligente
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-bold transition-colors"
          >
            ×
          </button>
        </div>

        {/* Orchestration Status */}
        {orchestrationResult && (
          <div className={`p-3 border-b border-slate-700/50 ${
            orchestrationResult.canProceed ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-amber-900/20 border-amber-500/30'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${
                orchestrationResult.canProceed ? 'text-emerald-300' : 'text-amber-300'
              }`}>
                {orchestrationResult.canProceed ? '✅ Listo para generar' : '⚠️ Datos incompletos'}
              </span>
              <span className="text-sm text-slate-400">
                Completitud: {Math.round(orchestrationResult.confidence * 100)}%
              </span>
            </div>
            {orchestrationResult.data.nextSteps && (
              <div className="mt-2 text-xs text-slate-400">
                Próximos pasos: {orchestrationResult.data.nextSteps.join(' • ')}
              </div>
            )}
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="flex border-b border-slate-700/50 bg-slate-800/30">
          <button
            onClick={() => setActiveTab('patient_data')}
            className={`px-6 py-3 font-medium text-sm transition-all ${
              activeTab === 'patient_data'
                ? 'border-b-2 border-blue-400 text-blue-300 bg-slate-700/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
            }`}
          >
            👤 Datos del Paciente
          </button>
          <button
            onClick={() => setActiveTab('specialty_forms')}
            className={`px-6 py-3 font-medium text-sm transition-all ${
              activeTab === 'specialty_forms'
                ? 'border-b-2 border-emerald-400 text-emerald-300 bg-slate-700/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
            }`}
          >
            🎯 {orchestrationResult?.data.specialtyDetection?.detected_specialty || 'Especialidad'}
          </button>
          <button
            onClick={() => setActiveTab('prompts')}
            className={`px-6 py-3 font-medium text-sm transition-all ${
              activeTab === 'prompts'
                ? 'border-b-2 border-purple-400 text-purple-300 bg-slate-700/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
            } ${!orchestrationResult?.canProceed ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!orchestrationResult?.canProceed}
          >
            📝 Prompts Disponibles
            {orchestrationResult?.data.prompts && (
              <span className="ml-1 bg-blue-900/40 text-blue-300 text-xs rounded-full px-2">
                {orchestrationResult.data.prompts.suggestions.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-900/50">
          
          {/* Patient Data Tab */}
          {activeTab === 'patient_data' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Basic Info */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Edad *
                  </label>
                  <input
                    type="number"
                    value={patientData.age || ''}
                    onChange={(e) => updatePatientData('age', parseInt(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Años"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Género *
                  </label>
                  <select
                    value={patientData.gender || ''}
                    onChange={(e) => updatePatientData('gender', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="Other">Otro</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Motivo de consulta *
                  </label>
                  <textarea
                    value={patientData.chiefComplaint || ''}
                    onChange={(e) => updatePatientData('chiefComplaint', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                    placeholder="Síntoma principal o motivo de la consulta..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Alergias conocidas
                  </label>
                  <input
                    type="text"
                    value={patientData.allergies?.join(', ') || ''}
                    onChange={(e) => updatePatientData('allergies', e.target.value.split(',').map(s => s.trim()))}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Separar por comas"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Medicación actual
                  </label>
                  <textarea
                    value={patientData.currentMedications?.join(', ') || ''}
                    onChange={(e) => updatePatientData('currentMedications', e.target.value.split(',').map(s => s.trim()))}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={2}
                    placeholder="Medicamentos actuales"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={processWithOrchestrator}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40"
                >
                  {isProcessing ? '🔄 Procesando...' : '🔍 Analizar Datos'}
                </button>
              </div>
            </div>
          )}

          {/* Specialty Forms Tab */}
          {activeTab === 'specialty_forms' && orchestrationResult?.data.specialtyDetection && (
            <div className="space-y-4">
              <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4">
                <h3 className="font-medium text-emerald-300">
                  🎯 Especialidad detectada: {orchestrationResult.data.specialtyDetection.detected_specialty}
                </h3>
                <p className="text-sm text-emerald-400 mt-1">
                  Confianza: {Math.round(orchestrationResult.data.specialtyDetection.confidence * 100)}%
                </p>
                <div className="mt-2 text-xs text-emerald-400">
                  Indicadores: {orchestrationResult.data.specialtyDetection.indicators.join(' • ')}
                </div>
              </div>

              {orchestrationResult.data.specialtyDetection.recommended_tabs.map((tab, index) => (
                <div key={index} className="bg-slate-800/50 border border-slate-600/50 rounded-lg p-4">
                  <h4 className="font-medium text-slate-200 mb-2">
                    {tab.tab_name} (Prioridad: {tab.priority})
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {tab.fields.map((field, fieldIndex) => (
                      <div key={fieldIndex}>
                        <label className="block text-sm text-slate-300 mb-1">
                          {field}
                        </label>
                        <input
                          type="text"
                          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder={`Ingrese ${field}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Prompts Selection Tab */}
          {activeTab === 'prompts' && orchestrationResult?.data.prompts && (
            <div className="space-y-4">
              {orchestrationResult.data.prompts.suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="bg-slate-800/50 border border-slate-600/50 rounded-lg p-4 hover:bg-slate-700/50 cursor-pointer transition-all duration-200"
                  onClick={() => handlePromptSelect(suggestion.template)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-slate-200">
                      {suggestion.title}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      suggestion.category === 'basic' ? 'bg-blue-900/40 text-blue-300' :
                      suggestion.category === 'detailed' ? 'bg-emerald-900/40 text-emerald-300' :
                      'bg-purple-900/40 text-purple-300'
                    }`}>
                      {suggestion.category}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">
                    {suggestion.description}
                  </p>
                  <div className="bg-slate-900/50 rounded-lg p-3 text-xs font-mono text-slate-300 border border-slate-700/50">
                    {suggestion.template}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-slate-500">
                      Confianza: {Math.round(suggestion.confidence * 100)}%
                    </span>
                    <button className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                      Seleccionar →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MedicalPromptTabs