// src/hooks/useMedicalDataOrchestrator.ts
// Medical data validation + auto-fill + interceptor logic
'use client'

import { useEffect, useRef } from 'react'
import {
  useIterativeMedicalExtraction,
  generateMedicalPrompt,
  generateStomachPainPrompt,
  autoFillInput,
} from '@redux-claude/cognitive-core'

interface MedicalDataOrchestratorProps {
  input: string
  setInput: (value: string) => void
  onValidationFailed?: (input: string, reason: string) => void
  onAutoFillComplete?: () => void
}

interface MedicalDataOrchestratorReturn {
  // Medical extraction data
  completenessPercentage: number
  isNOMCompliant: boolean
  extractedData: unknown
  canProceedToSOAP: boolean
  // Medical validation
  isMedicalConsultation: (text: string) => boolean
  hasMinimumPatientData: () => boolean
  // Auto-fill functionality
  handleAutoFillTest: () => void
  // Extraction methods
  startExtraction: (input: string, sessionId: string) => Promise<void>
  continueExtraction: (input: string) => Promise<void>
  shouldContinue: boolean
}

export const useMedicalDataOrchestrator = ({
  setInput,
  onAutoFillComplete,
}: MedicalDataOrchestratorProps): MedicalDataOrchestratorReturn => {
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Medical data extraction system
  const {
    completenessPercentage,
    isNOMCompliant,
    extractedData,
    startExtraction,
    continueExtraction,
    shouldContinue,
    canProceedToSOAP,
  } = useIterativeMedicalExtraction()

  // Auto-fill medical prompt when extraction reaches threshold
  useEffect(() => {
    if (!extractedData || !inputRef.current) return

    const {
      prompt,
      shouldAutoFill,
      completenessPercentage: completeness,
    } = generateMedicalPrompt(extractedData)

    if (shouldAutoFill && prompt && completeness >= 50) {
      // Auto-fill the input using utility function
      setInput(prompt)
      autoFillInput(inputRef.current, prompt)
      onAutoFillComplete?.()

      console.log('🎯 Auto-filled medical prompt (50% completeness reached)', {
        completeness,
        promptLength: prompt.length,
        nomCompliant: isNOMCompliant,
      })
    }
  }, [extractedData, isNOMCompliant, setInput, onAutoFillComplete])

  // Medical consultation detector - brutal filter
  const isMedicalConsultation = (text: string): boolean => {
    const medicalKeywords = [
      // Términos médicos básicos
      'paciente',
      'doctor',
      'síntoma',
      'dolor',
      'fiebre',
      'diagnóstico',
      'tratamiento',
      'medicamento',
      'consulta',
      'control',
      'laboratorio',
      'examen',
      'análisis',
      'radiografía',
      'ecografía',
      'biopsia',
      // Valores de laboratorio
      'glucosa',
      'colesterol',
      'triglicéridos',
      'hba1c',
      'creatinina',
      'urea',
      'hemoglobina',
      'plaquetas',
      'leucocitos',
      // Signos vitales
      'presión arterial',
      'frecuencia cardíaca',
      'temperatura',
      'peso',
      'saturación',
      'signos vitales',
      'ritmo cardíaco',
      'tensión arterial',
      // Especialidades
      'cardiología',
      'neurología',
      'gastroenterología',
      'dermatología',
      'ginecología',
      'pediatría',
      'traumatología',
      'oftalmología',
      // Patrones médicos
      'mg/dl',
      'mmhg',
      'bpm',
      'años',
      'presenta',
      'refiere',
      'acude',
    ]

    const lowerText = text.toLowerCase()

    // 💀 OPTIMIZATION BRUTAL: evita crear array con filter, solo cuenta matches
    let keywordMatchCount = 0
    for (const keyword of medicalKeywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        keywordMatchCount++
        // Early exit optimization: si ya tenemos 2+ matches, no seguir buscando
        if (keywordMatchCount >= 2) break
      }
    }

    // Si tiene 2+ keywords médicos Y más de 20 caracteres = consulta médica
    return keywordMatchCount >= 2 && text.trim().length > 20
  }

  const hasMinimumPatientData = (): boolean => {
    const savedData = localStorage.getItem('medical_patient_data')
    console.log('📋 PATIENT DATA CHECK:', { savedData: !!savedData })

    if (!savedData) return false

    try {
      const patientData = JSON.parse(savedData)
      console.log('📋 PARSED DATA:', patientData)

      // Datos mínimos requeridos: edad, género, motivo consulta
      const hasMinData = Boolean(
        patientData.age &&
          patientData.gender &&
          patientData.chiefComplaint &&
          patientData.chiefComplaint.trim().length > 5
      )

      console.log('📋 HAS MIN DATA:', hasMinData, {
        age: !!patientData.age,
        gender: !!patientData.gender,
        chiefComplaint: !!patientData.chiefComplaint,
        ccLength: patientData.chiefComplaint?.length || 0,
      })

      return hasMinData
    } catch (error) {
      console.log('📋 PARSE ERROR:', error)
      return false
    }
  }

  // Quick test button for demonstration
  const handleAutoFillTest = () => {
    const testPrompt = generateStomachPainPrompt()
    setInput(testPrompt)
    if (inputRef.current) {
      inputRef.current.value = testPrompt
      inputRef.current.focus()
    }
    onAutoFillComplete?.()
    console.log('🧪 Quick test: Generated stomach pain prompt')
  }

  return {
    // Medical extraction data
    completenessPercentage,
    isNOMCompliant,
    extractedData,
    canProceedToSOAP,
    // Medical validation
    isMedicalConsultation,
    hasMinimumPatientData,
    // Auto-fill functionality
    handleAutoFillTest,
    // Extraction methods
    startExtraction,
    continueExtraction,
    shouldContinue,
  }
}
