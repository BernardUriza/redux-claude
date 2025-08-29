// 📋 Panel de Resumen Médico - Muestra datos clínicos recopilados
// Creado por Bernard Orozco - Información relevante para el doctor

import React from 'react'
import type { SOAPData } from '@redux-claude/cognitive-core'

interface MedicalSummaryPanelProps {
  currentCase: {
    soap: SOAPData | null
    urgencyLevel: string
  }
  className?: string
}

/**
 * Componente que muestra el resumen de datos médicos recopilados
 * Solo muestra información que ya se ha obtenido del paciente
 */
export const MedicalSummaryPanel: React.FC<MedicalSummaryPanelProps> = ({
  currentCase,
  className = '',
}) => {
  const { soap } = currentCase

  // Si no hay datos SOAP, no mostrar nada
  if (!soap) {
    return null
  }

  // Extraer datos relevantes de la estructura SOAP
  const patientData = soap.subjetivo
  const vitalSigns = soap.objetivo?.signosVitales || {}
  const diagnosis = soap.analisis
  const medications = soap.plan?.tratamientoFarmacologico || []

  return (
    <div className={`${className}`}>
      <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600/50 rounded-2xl p-3 sm:p-4 lg:p-5 shadow-2xl backdrop-blur-sm overflow-hidden">
        <h4 className="text-lg sm:text-xl font-bold mb-4 sm:mb-5 text-cyan-300 flex items-center gap-2 sm:gap-3">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-1.5 sm:p-2 rounded-lg sm:rounded-xl flex-shrink-0">
            <span className="text-sm sm:text-lg">📋</span>
          </div>
          <span className="truncate">Resumen Clínico del Paciente</span>
        </h4>

        <div className="grid grid-cols-1 gap-4 sm:gap-5">
          {/* Información Básica del Paciente */}
          <div className="space-y-3 sm:space-y-4">
            <h5 className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span className="text-cyan-400 text-sm">👤</span>
              <span className="truncate">Datos del Paciente</span>
            </h5>

            {patientData.motivoConsulta && (
              <div className="bg-slate-700/50 rounded-lg p-2.5 sm:p-3">
                <div className="text-xs font-medium text-slate-400 uppercase mb-1 truncate">
                  Motivo consulta
                </div>
                <div className="text-white font-medium text-sm sm:text-base break-words">
                  {patientData.motivoConsulta}
                </div>
              </div>
            )}

            {patientData.historiaActual && (
              <div className="bg-slate-700/50 rounded-lg p-2.5 sm:p-3">
                <div className="text-xs font-medium text-slate-400 uppercase mb-1 truncate">
                  Historia actual
                </div>
                <div className="text-white font-medium text-sm sm:text-base break-words line-clamp-3 sm:line-clamp-none">
                  {patientData.historiaActual}
                </div>
              </div>
            )}

            {patientData.antecedentes?.alergias && patientData.antecedentes.alergias.length > 0 && (
              <div className="bg-amber-900/20 border border-amber-600/50 rounded-lg p-2.5 sm:p-3">
                <div className="text-xs font-medium text-amber-400 uppercase mb-1 flex items-center gap-1">
                  <span className="text-sm">⚠️</span>
                  <span className="truncate">Alergias</span>
                </div>
                <div className="text-amber-200 font-medium text-sm sm:text-base break-words">
                  {patientData.antecedentes.alergias.join(', ')}
                </div>
              </div>
            )}
          </div>

          {/* Signos Vitales */}
          {Object.keys(vitalSigns).length > 0 && (
            <div className="space-y-3 sm:space-y-4">
              <h5 className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <span className="text-red-400 text-sm">❤️</span>
                <span className="truncate">Signos Vitales</span>
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3">
                {vitalSigns.temperatura && (
                  <div className="bg-slate-700/50 rounded-lg p-2.5 sm:p-3 flex items-center gap-2 sm:gap-3 min-w-0">
                    <span className="text-orange-400 text-sm sm:text-lg flex-shrink-0">🌡️</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-slate-400 uppercase truncate">
                        Temperatura
                      </div>
                      <div className="text-white font-bold text-sm sm:text-base">
                        {vitalSigns.temperatura}
                      </div>
                    </div>
                  </div>
                )}

                {vitalSigns.presionArterial && (
                  <div className="bg-slate-700/50 rounded-lg p-2.5 sm:p-3 flex items-center gap-2 sm:gap-3 min-w-0">
                    <span className="text-red-400 text-sm sm:text-lg flex-shrink-0">💗</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-slate-400 uppercase truncate">
                        Presión arterial
                      </div>
                      <div className="text-white font-bold text-sm sm:text-base">
                        {vitalSigns.presionArterial}
                      </div>
                    </div>
                  </div>
                )}

                {vitalSigns.frecuenciaCardiaca && (
                  <div className="bg-slate-700/50 rounded-lg p-2.5 sm:p-3 flex items-center gap-2 sm:gap-3 min-w-0">
                    <span className="text-pink-400 text-sm sm:text-lg flex-shrink-0">💓</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-slate-400 uppercase truncate">
                        Frecuencia cardíaca
                      </div>
                      <div className="text-white font-bold text-sm sm:text-base">
                        {vitalSigns.frecuenciaCardiaca}
                      </div>
                    </div>
                  </div>
                )}

                {vitalSigns.saturacionOxigeno && (
                  <div className="bg-slate-700/50 rounded-lg p-2.5 sm:p-3 flex items-center gap-2 sm:gap-3 min-w-0">
                    <span className="text-blue-400 text-sm sm:text-lg flex-shrink-0">💨</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-slate-400 uppercase truncate">
                        Saturación O₂
                      </div>
                      <div className="text-white font-bold text-sm sm:text-base">
                        {vitalSigns.saturacionOxigeno}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Diagnóstico Preliminar */}
        {diagnosis && diagnosis.diagnosticoPrincipal && (
          <div className="mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-slate-600">
            <h5 className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
              <span className="text-cyan-400 text-sm">🎯</span>
              <span className="truncate">Diagnóstico Preliminar</span>
            </h5>
            <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-600/50 rounded-xl p-3 sm:p-4">
              <div className="text-base sm:text-lg font-bold text-cyan-300 mb-2 break-words">
                {diagnosis.diagnosticoPrincipal.condicion}
              </div>
              {diagnosis.diagnosticoPrincipal.probabilidad && (
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex-1 bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.round(diagnosis.diagnosticoPrincipal.probabilidad * 100)}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-300 flex-shrink-0">
                    {Math.round(diagnosis.diagnosticoPrincipal.probabilidad * 100)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Medicamentos Actuales */}
        {medications.length > 0 && (
          <div className="mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-slate-600">
            <h5 className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
              <span className="text-green-400 text-sm">💊</span>
              <span className="truncate">Medicamentos</span>
            </h5>
            <div className="space-y-2 sm:space-y-3">
              {medications.slice(0, 2).map((med, index) => (
                <div
                  key={index}
                  className="bg-green-900/20 border border-green-700/50 rounded-xl p-2.5 sm:p-3"
                >
                  <div className="font-bold text-green-300 mb-1 text-sm sm:text-base break-words">
                    {med.medicamento}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-300 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <span className="bg-slate-700/50 px-2 py-1 rounded text-xs break-words flex-shrink-0">
                      {med.dosis}
                    </span>
                    <span className="bg-slate-700/50 px-2 py-1 rounded text-xs break-words flex-shrink-0">
                      {med.frecuencia}
                    </span>
                  </div>
                </div>
              ))}
              {medications.length > 2 && (
                <div className="text-center text-xs sm:text-sm text-slate-400 font-medium">
                  ... y {medications.length - 2} medicamentos más
                </div>
              )}
            </div>
          </div>
        )}

        {/* Nivel de Urgencia */}
        {currentCase.urgencyLevel !== 'low' && (
          <div className="mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-slate-600">
            <div
              className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-4 rounded-2xl text-xs sm:text-sm font-bold shadow-lg ${
                currentCase.urgencyLevel === 'critical'
                  ? 'bg-gradient-to-r from-red-900/50 to-red-800/50 border border-red-600/50 text-red-300'
                  : currentCase.urgencyLevel === 'high'
                    ? 'bg-gradient-to-r from-orange-900/50 to-orange-800/50 border border-orange-600/50 text-orange-300'
                    : 'bg-gradient-to-r from-yellow-900/50 to-yellow-800/50 border border-yellow-600/50 text-yellow-300'
              }`}
            >
              <span className="text-lg sm:text-xl flex-shrink-0">⚠️</span>
              <span className="truncate">URGENCIA: {currentCase.urgencyLevel.toUpperCase()}</span>
            </div>
          </div>
        )}

        {/* Botón para generar SOAP completo - Creado por Bernard Orozco */}
        <div className="mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-slate-600">
          <button className="w-full py-3 sm:py-4 px-3 sm:px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-2xl text-sm sm:text-base font-bold transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 shadow-2xl hover:shadow-cyan-500/25 hover:scale-105">
            <span className="text-lg sm:text-xl flex-shrink-0">🤖</span>
            <span className="text-center leading-tight">
              Generar Consulta Médica Completa con IA
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default MedicalSummaryPanel
