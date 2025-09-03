// src/hooks/useUrgencyData.ts
// Hook for managing medical urgency data and pattern detection
'use client'

import { useState, useEffect } from 'react'
import type { UrgencyData } from '../components/UrgencyIndicator'
import type { MedicalMessage } from '@redux-claude/cognitive-core'

interface UseUrgencyDataReturn {
  urgencyData: UrgencyData
  setUrgencyData: (data: UrgencyData) => void
}

export const useUrgencyData = (messages: MedicalMessage[]): UseUrgencyDataReturn => {
  // Sistema de Medicina Defensiva - Datos de urgencia inicial
  const [urgencyData, setUrgencyData] = useState<UrgencyData>({
    level: 'low',
    gravityScore: 3,
    urgentPatterns: [],
    immediateActions: [],
    riskFactors: [],
    timeToAction: 'Rutinario (< 24 horas)',
    triageCategory: 'non-urgent',
    specialistRequired: false,
  })

  // Solo detectar patrones de urgencia en mensajes nuevos si no hay SOAP activo
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.type === 'user') {
        const input = lastMessage.content.toLowerCase()

        // Detectar patrones de alta urgencia para casos sin SOAP
        if (input.includes('dolor torácico') || input.includes('dolor pecho')) {
          setUrgencyData({
            level: 'critical',
            gravityScore: 10,
            urgentPatterns: [
              'Dolor torácico - Descartar síndrome coronario agudo',
              'Patrón compatible con emergencia cardiovascular',
            ],
            immediateActions: [
              '🚨 ACTIVAR PROTOCOLO DE EMERGENCIA',
              '📞 Contactar servicios de emergencia inmediatamente',
              '💊 Considerar aspirina 300mg (si no contraindicado)',
              '📋 ECG de 12 derivaciones STAT',
            ],
            riskFactors: ['Síndrome coronario agudo potencial', 'Riesgo vital inmediato si IAM'],
            timeToAction: 'Inmediato (< 15 min)',
            triageCategory: 'resuscitation',
            specialistRequired: true,
          })
        } else if (input.includes('cefalea') || input.includes('dolor cabeza')) {
          setUrgencyData({
            level: 'high',
            gravityScore: 8,
            urgentPatterns: [
              'Cefalea severa - Descartar hemorragia subaracnoidea',
              'Patrón neurológico de riesgo',
            ],
            immediateActions: [
              '🏥 Referir a urgencias hospitalarias',
              '📋 Estudios complementarios STAT',
              '👨‍⚕️ Interconsulta neurológica urgente',
            ],
            riskFactors: ['Posible hemorragia intracraneal', 'Riesgo de deterioro neurológico'],
            timeToAction: 'Urgente (< 1 hora)',
            triageCategory: 'urgent',
            specialistRequired: true,
          })
        } else if (input.includes('fiebre') || input.includes('temperatura')) {
          setUrgencyData({
            level: 'medium',
            gravityScore: 6,
            urgentPatterns: ['Síndrome febril - Evaluar sepsis'],
            immediateActions: [
              '🔬 Laboratorios y estudios dirigidos',
              '💊 Tratamiento sintomático inmediato',
            ],
            riskFactors: ['Posible proceso infeccioso'],
            timeToAction: 'Prioritario (< 4 horas)',
            triageCategory: 'semi-urgent',
            specialistRequired: false,
          })
        } else {
          // Caso de baja urgencia
          setUrgencyData({
            level: 'low',
            gravityScore: 3,
            urgentPatterns: [],
            immediateActions: [
              '📅 Control médico en 24-48 horas',
              '📚 Educación al paciente sobre signos de alarma',
            ],
            riskFactors: [],
            timeToAction: 'Rutinario (< 24 horas)',
            triageCategory: 'non-urgent',
            specialistRequired: false,
          })
        }
      }
    }
  }, [messages])

  return {
    urgencyData,
    setUrgencyData,
  }
}
