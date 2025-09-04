// 🔧 Utilidades para MedicalSummaryPanel
// Funciones helper para reducir complejidad del componente principal

import type { SOAPData } from '@redux-claude/cognitive-core'

export interface VitalSignConfig {
  key: keyof NonNullable<SOAPData['objetivo']>['signosVitales']
  icon: string
  label: string
  iconColor: string
}

export const VITAL_SIGNS_CONFIG: VitalSignConfig[] = [
  {
    key: 'temperatura',
    icon: '🌡️',
    label: 'Temperatura',
    iconColor: 'text-orange-400',
  },
  {
    key: 'presionArterial',
    icon: '💗',
    label: 'Presión arterial',
    iconColor: 'text-red-400',
  },
  {
    key: 'frecuenciaCardiaca',
    icon: '💓',
    label: 'Frecuencia cardíaca',
    iconColor: 'text-pink-400',
  },
  {
    key: 'saturacionOxigeno',
    icon: '💨',
    label: 'Saturación O₂',
    iconColor: 'text-blue-400',
  },
]

export const hasVitalSigns = (vitalSigns: Record<string, unknown>): boolean =>
  Object.keys(vitalSigns).length > 0

export const hasAllergies = (patientData: SOAPData['subjetivo']): boolean =>
  Boolean(patientData.antecedentes?.alergias?.length)

export const formatAllergies = (patientData: SOAPData['subjetivo']): string =>
  patientData.antecedentes?.alergias?.join(', ') || ''

export const shouldShowUrgency = (urgencyLevel: string): boolean => urgencyLevel !== 'low'
