// 🤖 Componente de Autocompletado Médico Inteligente
// Creado por Bernard Orozco

'use client'

import { useState, useEffect } from 'react'
import { MedicalAutocompletionService, type AutocompletionSuggestion } from '@redux-claude/cognitive-core'

interface MedicalAutocompletionProps {
  partialInput: string
  onSelectTemplate: (template: string) => void
  isVisible: boolean
  onClose: () => void
}

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
  const [suggestions, setSuggestions] = useState<AutocompletionSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autocompletionService] = useState(() => new MedicalAutocompletionService())

  useEffect(() => {
    if (isVisible && partialInput.trim().length > 10) {
      generateSuggestions()
    }
  }, [isVisible, partialInput])

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

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-600/50 shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-6 border-b border-slate-600/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl">🤖</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Asistente de Consulta Médica</h2>
                <p className="text-blue-300 text-sm">Autocompletado inteligente con Claude AI</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          
          {/* Input Preview */}
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-600/30 mb-6">
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

          {/* Suggestions Grid */}
          {suggestions.length > 0 && !isLoading && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">💡 Sugerencias de Estructura Médica</h3>
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

        {/* Footer */}
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-t border-slate-600/30 p-4">
          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-sm">
              💡 Selecciona una opción para autocompletar tu consulta médica
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/30 rounded-lg text-slate-300 text-sm transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}