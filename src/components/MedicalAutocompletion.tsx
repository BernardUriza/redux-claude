// 🤖 Componente de Autocompletado Médico Inteligente UNIFICADO
// Creado por Bernard Orozco - Integra datos del paciente + sugerencias

'use client'

import { useState, useEffect } from 'react'
import { MedicalAutocompletionService, type AutocompletionSuggestion } from '@redux-claude/cognitive-core'
import { medicalOrchestrator, PatientFormData, OrchestrationResult } from '@redux-claude/cognitive-core'

interface MedicalAutocompletionProps {
  partialInput: string
  onSelectTemplate: (template: string) => void
  isVisible: boolean
  onClose: () => void
}

type TabType = 'patient_data' | 'specialty_forms' | 'suggestions'

const STORAGE_KEY = 'medical_patient_data'

const getSuggestionIcon = (category: string) => {
  switch (category) {
    case 'basic':
      return '📋'
    case 'detailed':
      return '🩺'
    case 'specialized':
      return '⚕️'
    default:
      return '💡'
  }
}

const getSuggestionColor = (category: string) => {
  switch (category) {
    case 'basic':
      return 'from-blue-500 to-cyan-500'
    case 'detailed':
      return 'from-purple-500 to-indigo-500'
    case 'specialized':
      return 'from-emerald-500 to-teal-500'
    default:
      return 'from-slate-500 to-gray-500'
  }
}

export const MedicalAutocompletion = ({ 
  partialInput, 
  onSelectTemplate, 
  isVisible, 
  onClose 
}: MedicalAutocompletionProps) => {
  // Estados originales de sugerencias
  const [suggestions, setSuggestions] = useState<AutocompletionSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autocompletionService] = useState(() => new MedicalAutocompletionService())
  
  // Estados nuevos para datos del paciente
  const [activeTab, setActiveTab] = useState<TabType>('patient_data')
  const [patientData, setPatientData] = useState<Partial<PatientFormData>>({})
  const [orchestrationResult, setOrchestrationResult] = useState<OrchestrationResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Cargar sugerencias cuando sea visible
  useEffect(() => {
    if (isVisible && partialInput.trim().length > 10) {
      generateSuggestions()
    }
  }, [isVisible, partialInput])

  // Cargar datos del paciente desde localStorage
  useEffect(() => {
    if (isVisible) {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setPatientData(parsed)
        } catch (error) {
          console.error('Error loading patient data:', error)
        }
      }
    }
  }, [isVisible])

  // Guardar datos del paciente en localStorage
  useEffect(() => {
    if (Object.keys(patientData).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(patientData))
    }
  }, [patientData])

  const generateSuggestions = async () => {
    if (!partialInput.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await autocompletionService.generateCompletionSuggestions({
        partialInput: partialInput.trim(),
        medicalSpecialty: 'Medicina General'
      })

      if (result.success) {
        setSuggestions(result.suggestions)
      } else {
        setError(result.error || 'Error generando sugerencias')
      }
    } catch (err) {
      console.error('Error en autocompletado:', err)
      setError('Error de conexión con el servicio de IA')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectSuggestion = (suggestion: AutocompletionSuggestion) => {
    onSelectTemplate(suggestion.template)
    onClose()
  }

  const handleManualRefresh = () => {
    generateSuggestions()
  }

  // Funciones para datos del paciente
  const updatePatientData = (field: keyof PatientFormData, value: any) => {
    setPatientData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const processWithOrchestrator = async () => {
    if (Object.keys(patientData).length === 0) return

    setIsProcessing(true)
    try {
      const result = await medicalOrchestrator.processPatientInput(patientData, partialInput)
      setOrchestrationResult(result)
      
      // Auto-switch tabs basado en el resultado
      if (result.action === 'request_data') {
        setActiveTab('patient_data')
      } else if (result.action === 'suggest_specialty') {
        setActiveTab('specialty_forms')
      } else if (result.action === 'generate_prompts') {
        setActiveTab('suggestions')
        // También generar sugerencias de autocompletado
        generateSuggestions()
      }
      
    } catch (error) {
      console.error('Error processing with orchestrator:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePromptSelect = (template: string) => {
    // Reemplazar variables del template con datos del paciente
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
    
    onSelectTemplate(filledPrompt)
    onClose()
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-600/50 shadow-2xl w-full max-w-4xl h-5/6 flex flex-col">
        
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
            onClick={() => setActiveTab('suggestions')}
            className={`px-6 py-3 font-medium text-sm transition-all ${
              activeTab === 'suggestions'
                ? 'border-b-2 border-purple-400 text-purple-300 bg-slate-700/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
            } ${!orchestrationResult?.canProceed && suggestions.length === 0 ? 'opacity-50' : ''}`}
          >
            📝 Sugerencias
            {(orchestrationResult?.data.prompts?.suggestions?.length || suggestions.length) > 0 && (
              <span className="ml-1 bg-blue-900/40 text-blue-300 text-xs rounded-full px-2">
                {orchestrationResult?.data.prompts?.suggestions?.length || suggestions.length}
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

          {/* Suggestions Tab */}
          {activeTab === 'suggestions' && (
            <div className="space-y-4">
              
              {/* Input Preview */}
              <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-600/30">
                <h3 className="text-sm font-semibold text-slate-300 mb-2">📝 Tu consulta actual:</h3>
                <p className="text-slate-100 bg-slate-900/50 rounded-lg p-3 border border-slate-700/50 italic">
                  "{partialInput}"
                </p>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-slate-300">Generando sugerencias médicas...</p>
                  <p className="text-slate-500 text-sm">Analizando con Claude AI</p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="bg-red-950/30 border border-red-600/30 rounded-xl p-6 text-center">
                  <div className="text-red-400 text-4xl mb-3">⚠️</div>
                  <h3 className="text-red-300 font-semibold mb-2">Error de Autocompletado</h3>
                  <p className="text-red-200 text-sm mb-4">{error}</p>
                  <button
                    onClick={handleManualRefresh}
                    className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg text-red-300 text-sm transition-colors"
                  >
                    🔄 Reintentar
                  </button>
                </div>
              )}

              {/* Orchestrator Prompts */}
              {orchestrationResult?.data.prompts && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">💡 Prompts Generados por Orquestador</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
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
                </div>
              )}

              {/* Autocompletion Suggestions */}
              {suggestions.length > 0 && !isLoading && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">🤖 Sugerencias de Autocompletado</h3>
                    <button
                      onClick={handleManualRefresh}
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Regenerar</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {suggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className="group bg-gradient-to-br from-slate-800/60 to-slate-900/80 hover:from-slate-700/60 hover:to-slate-800/80 rounded-xl border border-slate-600/40 hover:border-slate-500/60 transition-all duration-300 cursor-pointer overflow-hidden"
                        onClick={() => handleSelectSuggestion(suggestion)}
                      >
                        
                        {/* Suggestion Header */}
                        <div className="p-5 border-b border-slate-700/30">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`w-12 h-12 bg-gradient-to-br ${getSuggestionColor(suggestion.category)} rounded-xl flex items-center justify-center text-xl shadow-lg group-hover:scale-105 transition-transform`}>
                                {getSuggestionIcon(suggestion.category)}
                              </div>
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold text-white mb-1">{suggestion.title}</h4>
                                <p className="text-sm text-slate-400">{suggestion.description}</p>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end space-y-2">
                              <div className="bg-green-900/30 px-3 py-1 rounded-full border border-green-700/30">
                                <span className="text-green-300 text-sm font-medium">
                                  {Math.round(suggestion.confidence * 100)}% confianza
                                </span>
                              </div>
                              <div className="text-slate-400 group-hover:text-slate-300 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Template Preview */}
                        <div className="p-5">
                          <h5 className="text-sm font-medium text-slate-300 mb-3">📋 Preview del template:</h5>
                          <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-700/50 font-mono text-sm text-slate-200 leading-relaxed">
                            <div className="max-h-24 overflow-hidden">
                              {suggestion.template.length > 200 
                                ? `${suggestion.template.substring(0, 200)}...`
                                : suggestion.template
                              }
                            </div>
                            {suggestion.template.length > 200 && (
                              <div className="text-slate-500 text-xs mt-2">
                                Haz clic para ver el template completo
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Hover Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
        </div>
      </div>
    </div>
  )
}