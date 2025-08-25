// 📋 Panel de Resumen Médico - Muestra datos clínicos recopilados
// Creado por Bernard Orozco - Información relevante para el doctor

import React from 'react'
import type { SOAPStructure } from '../../packages/cognitive-core/src/store/medicalChatSlice'

interface MedicalSummaryPanelProps {
  currentCase: {
    soap: SOAPStructure | null
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
  className = '' 
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
  const vitalSigns = soap.objetivo?.vitalSigns || {}
  const diagnosis = soap.analisis
  const medications = soap.plan?.medications || []
  
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
            
            {patientData.chiefComplaint && (
              <div className="text-sm">
                <span className="text-gray-500">Motivo consulta: </span>
                <span className="text-white">{patientData.chiefComplaint}</span>
              </div>
            )}
            
            {patientData.presentIllness && (
              <div className="text-sm">
                <span className="text-gray-500">Enfermedad actual: </span>
                <span className="text-white">{patientData.presentIllness}</span>
              </div>
            )}
            
            {patientData.allergies && patientData.allergies.length > 0 && (
              <div className="text-sm">
                <span className="text-gray-500">Alergias: </span>
                <span className="text-yellow-400">{patientData.allergies.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Signos Vitales */}
          {Object.keys(vitalSigns).length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-medium text-gray-400 uppercase">Signos Vitales</h5>
              
              {vitalSigns.temperature && (
                <div className="text-sm">
                  <span className="text-gray-500">Temperatura: </span>
                  <span className="text-white">{vitalSigns.temperature}</span>
                </div>
              )}
              
              {vitalSigns.bloodPressure && (
                <div className="text-sm">
                  <span className="text-gray-500">Presión arterial: </span>
                  <span className="text-white">{vitalSigns.bloodPressure}</span>
                </div>
              )}
              
              {vitalSigns.heartRate && (
                <div className="text-sm">
                  <span className="text-gray-500">Frecuencia cardíaca: </span>
                  <span className="text-white">{vitalSigns.heartRate}</span>
                </div>
              )}
              
              {vitalSigns.oxygenSaturation && (
                <div className="text-sm">
                  <span className="text-gray-500">Saturación O₂: </span>
                  <span className="text-white">{vitalSigns.oxygenSaturation}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Diagnóstico Preliminar */}
        {diagnosis && diagnosis.primaryDiagnosis && (
          <div className="mt-4 pt-3 border-t border-gray-700">
            <h5 className="text-xs font-medium text-gray-400 uppercase mb-2">Diagnóstico Preliminar</h5>
            <div className="bg-cyan-900/20 border border-cyan-700/30 rounded p-2">
              <span className="text-sm text-cyan-300">{diagnosis.primaryDiagnosis}</span>
              {diagnosis.confidence && (
                <span className="ml-2 text-xs text-gray-500">
                  (Confianza: {Math.round(diagnosis.confidence * 100)}%)
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
                  <span className="text-green-400">{med.name}</span>
                  <span className="text-gray-500 text-xs ml-2">
                    {med.dose} - {med.frequency}
                  </span>
                </div>
              ))}
              {medications.length > 3 && (
                <span className="text-xs text-gray-500">
                  ... y {medications.length - 3} más
                </span>
              )}
            </div>
          </div>
        )}

        {/* Nivel de Urgencia */}
        {currentCase.urgencyLevel !== 'low' && (
          <div className="mt-4 pt-3 border-t border-gray-700">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
              currentCase.urgencyLevel === 'critical' ? 'bg-red-900/30 border border-red-700/50 text-red-400' :
              currentCase.urgencyLevel === 'high' ? 'bg-orange-900/30 border border-orange-700/50 text-orange-400' :
              'bg-yellow-900/30 border border-yellow-700/50 text-yellow-400'
            }`}>
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