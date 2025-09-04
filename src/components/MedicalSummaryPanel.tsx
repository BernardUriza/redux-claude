// 📋 Panel de Resumen Médico - Muestra datos clínicos recopilados
// Refactorizado para reducir complejidad y mejorar mantenibilidad

import React from 'react'
import type { SOAPData } from '@redux-claude/cognitive-core'
import { VitalSignCard } from './VitalSignCard'
import { MedicalInfoCard } from './MedicalInfoCard'
import { UrgencyBadge } from './UrgencyBadge'
import { MedicationCard } from './MedicationCard'
import { DiagnosisCard } from './DiagnosisCard'
import {
  VITAL_SIGNS_CONFIG,
  hasVitalSigns,
  hasAllergies,
  formatAllergies,
  shouldShowUrgency,
} from '../utils/medicalSummaryUtils'

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

  if (!soap) return null

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
              <MedicalInfoCard 
                label="Motivo consulta" 
                value={patientData.motivoConsulta} 
              />
            )}

            {patientData.historiaActual && (
              <MedicalInfoCard 
                label="Historia actual" 
                value={patientData.historiaActual} 
              />
            )}

            {hasAllergies(patientData) && (
              <MedicalInfoCard 
                label="Alergias" 
                value={formatAllergies(patientData)} 
                variant="warning"
              />
            )}
          </div>

          {/* Signos Vitales */}
          {hasVitalSigns(vitalSigns) && (
            <div className="space-y-3 sm:space-y-4">
              <h5 className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <span className="text-red-400 text-sm">❤️</span>
                <span className="truncate">Signos Vitales</span>
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3">
                {VITAL_SIGNS_CONFIG.map(config => {
                  const value = vitalSigns[config.key] as string
                  return value ? (
                    <VitalSignCard
                      key={config.key}
                      icon={config.icon}
                      label={config.label}
                      value={value}
                      iconColor={config.iconColor}
                    />
                  ) : null
                })}
              </div>
            </div>
          )}
        </div>

        {/* Diagnóstico Preliminar */}
        {diagnosis?.diagnosticoPrincipal && (
          <div className="mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-slate-600">
            <h5 className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
              <span className="text-cyan-400 text-sm">🎯</span>
              <span className="truncate">Diagnóstico Preliminar</span>
            </h5>
            <DiagnosisCard
              condition={diagnosis.diagnosticoPrincipal.condicion}
              probability={diagnosis.diagnosticoPrincipal.probabilidad}
            />
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
                <MedicationCard
                  key={index}
                  medicamento={med.medicamento}
                  dosis={med.dosis}
                  frecuencia={med.frecuencia}
                />
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
        {shouldShowUrgency(currentCase.urgencyLevel) && (
          <div className="mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-slate-600">
            <UrgencyBadge urgencyLevel={currentCase.urgencyLevel} />
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
