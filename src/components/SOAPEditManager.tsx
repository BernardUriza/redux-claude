// src/components/SOAPEditManager.tsx
// SOAP Edit Management Component - Clean Architecture
// EXTRACTED from SOAPDisplay monolith - Bernard Orozco

'use client'

import { useState } from 'react'
import type { SOAPSectionData } from './SOAPSectionRenderer'

// Constants for content limits
const CONTENT_WARNING_THRESHOLD = 4500
const CONTENT_MAX_LENGTH = 5000

interface SOAPEditManagerProps {
  section: 'S' | 'O' | 'A' | 'P'
  initialData?: SOAPSectionData | null
  onSave: (data: SOAPSectionData) => void
  onCancel: () => void
}

/**
 * SOAPEditManager Component
 * SINGLE RESPONSIBILITY: Handle section editing functionality
 * Manages form state and validation for SOAP section editing
 */
export const SOAPEditManager = ({
  section,
  initialData,
  onSave,
  onCancel,
}: SOAPEditManagerProps) => {
  const [editContent, setEditContent] = useState(() => {
    if (!initialData) return ''

    // Convert structured data to editable text format
    try {
      if (typeof initialData === 'string') return initialData
      return JSON.stringify(initialData, null, 2)
    } catch {
      return String(initialData)
    }
  })

  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const getSectionPlaceholder = (section: string): string => {
    const placeholders = {
      S: 'Información subjetiva del paciente:\n- Motivo de consulta\n- Síntomas principales\n- Historia actual',
      O: 'Datos objetivos del examen:\n- Signos vitales\n- Examen físico\n- Resultados de laboratorio',
      A: 'Análisis clínico:\n- Diagnóstico principal\n- Diagnósticos diferenciales\n- Razonamiento clínico',
      P: 'Plan de tratamiento:\n- Manejo inmediato\n- Medicamentos\n- Seguimiento',
    } as const

    return placeholders[section as keyof typeof placeholders] || 'Contenido de la sección...'
  }

  const validateContent = (content: string): string | null => {
    if (!content.trim()) {
      return 'El contenido no puede estar vacío'
    }

    if (content.length < 10) {
      return 'El contenido debe tener al menos 10 caracteres'
    }

    if (content.length > 5000) {
      return 'El contenido no puede exceder 5000 caracteres'
    }

    return null
  }

  const handleSave = async () => {
    const error = validateContent(editContent)
    if (error) {
      setValidationError(error)
      return
    }

    setIsValidating(true)
    setValidationError(null)

    try {
      // Attempt to parse as JSON first, fallback to plain text
      let parsedData: SOAPSectionData
      try {
        parsedData = JSON.parse(editContent)
      } catch {
        // If JSON parsing fails, treat as plain text
        parsedData = editContent as unknown as SOAPSectionData
      }

      onSave(parsedData)
    } catch {
      setValidationError('Error al procesar el contenido')
    } finally {
      setIsValidating(false)
    }
  }

  const handleCancel = () => {
    setEditContent('')
    setValidationError(null)
    onCancel()
  }

  const getSectionIcon = (section: string) => {
    const icons = { S: '🗣️', O: '🔍', A: '🧠', P: '📋' } as const
    return icons[section as keyof typeof icons] || '📄'
  }

  return (
    <div className="space-y-4">
      {/* Edit Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl">{getSectionIcon(section)}</span>
          <h4 className="text-slate-200 font-semibold">Editando Sección {section}</h4>
        </div>
        <div className="text-sm text-slate-400">{editContent.length}/5000 caracteres</div>
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <span className="text-red-400">⚠️</span>
            <span className="text-red-300 text-sm">{validationError}</span>
          </div>
        </div>
      )}

      {/* Edit Textarea */}
      <div className="relative">
        <textarea
          value={editContent}
          onChange={e => {
            setEditContent(e.target.value)
            if (validationError) setValidationError(null)
          }}
          className={`w-full h-64 bg-slate-800 border rounded-lg p-4 text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 transition-colors ${
            validationError
              ? 'border-red-600 focus:ring-red-500'
              : 'border-slate-600 focus:ring-blue-500'
          }`}
          placeholder={getSectionPlaceholder(section)}
          disabled={isValidating}
        />

        {/* Character count indicator */}
        <div className="absolute bottom-2 right-2 text-xs text-slate-500">
          {editContent.length > CONTENT_WARNING_THRESHOLD && (
            <span className="text-orange-400">
              {CONTENT_MAX_LENGTH - editContent.length} restantes
            </span>
          )}
        </div>
      </div>

      {/* Edit Instructions */}
      <div className="bg-slate-800/50 rounded-lg p-3">
        <h5 className="text-slate-300 font-medium text-sm mb-2">Instrucciones de edición:</h5>
        <ul className="text-slate-400 text-xs space-y-1">
          <li>• Use formato JSON para datos estructurados</li>
          <li>• Use texto plano para contenido narrativo</li>
          <li>• Mantenga la información médica precisa y profesional</li>
          <li>• Mínimo 10 caracteres, máximo 5000</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={handleSave}
          disabled={isValidating || !!validationError}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isValidating || validationError
              ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isValidating ? 'Validando...' : 'Guardar Cambios'}
        </button>

        <button
          onClick={handleCancel}
          disabled={isValidating}
          className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
      </div>

      {/* Preview Toggle - Future Enhancement */}
      <div className="text-center">
        <button className="text-xs text-slate-500 hover:text-slate-400 transition-colors">
          💡 Vista previa disponible próximamente
        </button>
      </div>
    </div>
  )
}
