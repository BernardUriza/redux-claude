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

  // Si no hay datos SOAP, mostrar indicador de recopilación
  if (!soap) {
    return (
      <div className={`${className}`}>
        <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
          <h4 className="text-sm font-semibold mb-2 text-blue-400 flex items-center gap-2">
            <span>📝</span>
            Recopilando Información del Paciente...
          </h4>
          <p className="text-xs text-gray-400">
            Los datos del paciente aparecerán aquí conforme se vayan recopilando
          </p>
        </div>
      </div>
    )
  }

  // Extraer datos relevantes de la estructura SOAP
  const patientData = soap.subjetivo
  const vitalSigns = soap.objetivo?.signosVitales || {}
  const diagnosis = soap.analisis
  const medications = soap.plan?.tratamientoFarmacologico || []

  return (
    <div className={`${className}`}>
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
        <h4 className="text-sm font-semibold mb-3 text-cyan-400 flex items-center gap-2">
          <span>📋</span>
          Resumen Clínico del Paciente
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Información Básica del Paciente */}
          <div className="space-y-2">
            <h5 className="text-xs font-medium text-gray-400 uppercase">Datos del Paciente</h5>

            {patientData.motivoConsulta && (
              <div className="text-sm">
                <span className="text-gray-500">Motivo consulta: </span>
                <span className="text-white">{patientData.motivoConsulta}</span>
              </div>
            )}

            {patientData.historiaActual && (
              <div className="text-sm">
                <span className="text-gray-500">Historia actual: </span>
                <span className="text-white">{patientData.historiaActual}</span>
              </div>
            )}

            {patientData.antecedentes?.alergias && patientData.antecedentes.alergias.length > 0 && (
              <div className="text-sm">
                <span className="text-gray-500">Alergias: </span>
                <span className="text-yellow-400">
                  {patientData.antecedentes.alergias.join(', ')}
                </span>
              </div>
            )}
          </div>

          {/* Signos Vitales */}
          {Object.keys(vitalSigns).length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-medium text-gray-400 uppercase">Signos Vitales</h5>

              {vitalSigns.temperatura && (
                <div className="text-sm">
                  <span className="text-gray-500">Temperatura: </span>
                  <span className="text-white">{vitalSigns.temperatura}</span>
                </div>
              )}

              {vitalSigns.presionArterial && (
                <div className="text-sm">
                  <span className="text-gray-500">Presión arterial: </span>
                  <span className="text-white">{vitalSigns.presionArterial}</span>
                </div>
              )}

              {vitalSigns.frecuenciaCardiaca && (
                <div className="text-sm">
                  <span className="text-gray-500">Frecuencia cardíaca: </span>
                  <span className="text-white">{vitalSigns.frecuenciaCardiaca}</span>
                </div>
              )}

              {vitalSigns.saturacionOxigeno && (
                <div className="text-sm">
                  <span className="text-gray-500">Saturación O₂: </span>
                  <span className="text-white">{vitalSigns.saturacionOxigeno}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Diagnóstico Preliminar */}
        {diagnosis && diagnosis.diagnosticoPrincipal && (
          <div className="mt-4 pt-3 border-t border-gray-700">
            <h5 className="text-xs font-medium text-gray-400 uppercase mb-2">
              Diagnóstico Preliminar
            </h5>
            <div className="bg-cyan-900/20 border border-cyan-700/30 rounded p-2">
              <span className="text-sm text-cyan-300">
                {diagnosis.diagnosticoPrincipal.condicion}
              </span>
              {diagnosis.diagnosticoPrincipal.probabilidad && (
                <span className="ml-2 text-xs text-gray-500">
                  (Probabilidad: {Math.round(diagnosis.diagnosticoPrincipal.probabilidad * 100)}%)
                </span>
              )}
            </div>
          </div>
        )}

        {/* Medicamentos Actuales */}
        {medications.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-700">
            <h5 className="text-xs font-medium text-gray-400 uppercase mb-2">Medicamentos</h5>
            <div className="space-y-1">
              {medications.slice(0, 3).map((med, index) => (
                <div key={index} className="text-sm bg-gray-700/30 rounded px-2 py-1">
                  <span className="text-green-400">{med.medicamento}</span>
                  <span className="text-gray-500 text-xs ml-2">
                    {med.dosis} - {med.frecuencia}
                  </span>
                </div>
              ))}
              {medications.length > 3 && (
                <span className="text-xs text-gray-500">... y {medications.length - 3} más</span>
              )}
            </div>
          </div>
        )}

        {/* Nivel de Urgencia */}
        {currentCase.urgencyLevel !== 'low' && (
          <div className="mt-4 pt-3 border-t border-gray-700">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                currentCase.urgencyLevel === 'critical'
                  ? 'bg-red-900/30 border border-red-700/50 text-red-400'
                  : currentCase.urgencyLevel === 'high'
                    ? 'bg-orange-900/30 border border-orange-700/50 text-orange-400'
                    : 'bg-yellow-900/30 border border-yellow-700/50 text-yellow-400'
              }`}
            >
              <span>⚠️</span>
              <span>Urgencia: {currentCase.urgencyLevel.toUpperCase()}</span>
            </div>
          </div>
        )}

        {/* Botón para generar SOAP completo */}
        <div className="mt-4 pt-3 border-t border-gray-700">
          <button className="w-full py-2 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2">
            <span>🤖</span>
            <span>Generar Consulta Médica Completa con IA</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default MedicalSummaryPanel
