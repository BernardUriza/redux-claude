// src/components/SOAPDisplay.tsx
// SOAP Container - Clean Architecture Orchestrator
// REFACTORED from 674-line monolith - Bernard Orozco

'use client'

import { useState } from 'react'
import { SOAPSection } from './SOAPSectionRenderer'
import { SOAPMarkdownExporter } from './SOAPMarkdownExporter'
import { useSOAPData, type SOAPEditSection } from '../hooks/useSOAPData'
import type { SOAPSectionData } from './SOAPSectionRenderer'

/**
 * SOAPDisplay Container - CLEAN ARCHITECTURE
 * SINGLE RESPONSIBILITY: Orchestrate SOAP views and handle user interactions
 * Max 100 lines - Zero business logic - Pure UI coordination
 */
export const SOAPDisplay = () => {
  const [viewMode, setViewMode] = useState<'structured' | 'markdown'>('structured')
  const { soapAnalysis, isLoading, error, transformedData, handleSectionEdit } = useSOAPData()

  const handleSectionEditWrapper = (section: SOAPEditSection, data: SOAPSectionData) => {
    handleSectionEdit(section, data)
  }

  // Loading and error states - delegated from useSOAPData hook
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-700 to-purple-800 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-2xl">🧠</span>
        </div>
        <h3 className="text-slate-200 font-semibold mb-2">Extrayendo análisis SOAP...</h3>
        <p className="text-slate-400 text-sm">Procesando conversación médica con IA multinúcleo</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gradient-to-br from-red-700 to-red-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">❌</span>
        </div>
        <h3 className="text-red-400 font-semibold mb-2">Error al cargar análisis SOAP</h3>
        <p className="text-slate-400 text-sm">{error}</p>
      </div>
    )
  }

  if (!soapAnalysis) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📋</span>
        </div>
        <h3 className="text-slate-200 font-semibold mb-2">No hay análisis SOAP disponible</h3>
        <p className="text-slate-400 text-sm">
          Realiza una consulta médica para ver el análisis estructurado
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with case info and view toggle - ORCHESTRATION ONLY */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-600/40">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Análisis SOAP Completo</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-slate-800/50 rounded-lg p-1">
              <button
                onClick={() => setViewMode('structured')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                  viewMode === 'structured'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                📋 Estructurado
              </button>
              <button
                onClick={() => setViewMode('markdown')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                  viewMode === 'markdown'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                📝 Markdown
              </button>
            </div>
            <div className="text-sm text-slate-300">
              Confianza: <span className="font-semibold text-green-400">
                {Math.round((soapAnalysis.confidence || 0) * 100)}%
              </span>
            </div>
          </div>
        </div>
        <div className="text-sm text-slate-400">
          Actualizado: {new Date(soapAnalysis.lastUpdated).toLocaleString('es-ES')}
        </div>
      </div>

      {/* Content delegation to specialized components */}
      {viewMode === 'structured' ? (
        <>
          <SOAPSection
            section="S"
            title="SUBJETIVO"
            data={transformedData.subjetivo}
            editable={true}
            onEdit={data => handleSectionEditWrapper('subjetivo', data)}
          />
          <SOAPSection
            section="O"
            title="OBJETIVO"
            data={transformedData.objetivo}
            editable={true}
            onEdit={data => handleSectionEditWrapper('objetivo', data)}
          />
          <SOAPSection
            section="A"
            title="ANÁLISIS"
            data={transformedData.analisis}
            editable={true}
            onEdit={data => handleSectionEditWrapper('analisis', data)}
          />
          <SOAPSection
            section="P"
            title="PLAN"
            data={transformedData.plan}
            editable={true}
            onEdit={data => handleSectionEditWrapper('plan', data)}
          />
        </>
      ) : (
        <SOAPMarkdownExporter
          soap={transformedData}
          confidence={soapAnalysis.confidence}
          lastUpdated={soapAnalysis.lastUpdated}
        />
      )}
    </div>
  )
}
