// src/hooks/useSOAPData.ts
// SOAP Data Management Hook - Clean Architecture
// EXTRACTED from SOAPDisplay monolith - Bernard Orozco

import { useSelector, useDispatch } from 'react-redux'
import { useMemo } from 'react'

// 💀 CONSTANTES ESTÁTICAS BRUTALES - No más referencias frescas
const EMPTY_MEDICAL_HISTORY: string[] = []
const EMPTY_FAMILY_HISTORY: string[] = []
const EMPTY_LAB_RESULTS: any[] = []
const EMPTY_DIFFERENTIAL_DX: string[] = []
const EMPTY_MEDICATIONS: any[] = []
const EMPTY_PATIENT_EDUCATION: string[] = []

// 🧠 CACHE INTELIGENTE para operaciones string-to-array que causan re-renders
const STRING_ARRAY_CACHE = new Map<string, { immediate: string[], followUp: string[] }>()
import type { RootState } from '@redux-claude/cognitive-core'
import {
  selectCurrentSOAPAnalysis,
  updateSOAPSection,
} from '@redux-claude/cognitive-core/src/store/selectors'
import type {
  SubjectiveData,
  ObjectiveData,
  AnalysisData,
  PlanData,
  SOAPSectionData,
} from '../components/SOAPSectionRenderer'

// Complete SOAP structure interface
export interface CompleteSOAP {
  subjetivo: SubjectiveData | null
  objetivo: ObjectiveData | null
  analisis: AnalysisData | null
  plan: PlanData | null
}

export type SOAPEditSection = 'subjetivo' | 'objetivo' | 'analisis' | 'plan'

export interface SOAPDataState {
  soapAnalysis: ReturnType<typeof selectCurrentSOAPAnalysis>
  isLoading: boolean
  error: string | null
  transformedData: CompleteSOAP
}

export interface SOAPDataActions {
  handleSectionEdit: (section: SOAPEditSection, data: SOAPSectionData) => void
}

/**
 * Custom hook for SOAP data management
 * Encapsulates Redux logic and data transformation
 * SINGLE RESPONSIBILITY: Data layer management
 */
export const useSOAPData = (): SOAPDataState & SOAPDataActions => {
  const dispatch = useDispatch()

  // Redux selectors
  const soapAnalysis = useSelector((state: RootState) => selectCurrentSOAPAnalysis(state))
  const isLoading = useSelector((state: RootState) => state.medicalChat.cores.dashboard.isLoading)
  const error = useSelector((state: RootState) => state.medicalChat.sharedState.error) || null

  // Transform raw SOAP data to structured format
  const transformedData: CompleteSOAP = useMemo(() => {
    if (!soapAnalysis) {
      return {
        subjetivo: null,
        objetivo: null,
        analisis: null,
        plan: null,
      }
    }

    return {
      subjetivo: soapAnalysis.subjective
        ? {
            chiefComplaint: soapAnalysis.subjective.split('\n')[0] || '',
            presentIllness: soapAnalysis.subjective || '',
            medicalHistory: EMPTY_MEDICAL_HISTORY,
            familyHistory: EMPTY_FAMILY_HISTORY,
          }
        : null,
      objetivo: soapAnalysis.objective
        ? {
            vitalSigns: {},
            physicalExam: { general: soapAnalysis.objective },
            labResults: EMPTY_LAB_RESULTS,
          }
        : null,
      analisis: soapAnalysis.assessment
        ? {
            primaryDx: soapAnalysis.assessment,
            confidence: soapAnalysis.confidence,
            differentialDx: EMPTY_DIFFERENTIAL_DX,
            reasoning: soapAnalysis.assessment,
          }
        : null,
      plan: soapAnalysis.plan
        ? (() => {
            // 🧠 CACHE BRUTAL: evita crear arrays frescos en cada render
            const cacheKey = soapAnalysis.plan
            let cachedResult = STRING_ARRAY_CACHE.get(cacheKey)
            
            if (!cachedResult) {
              const lines = soapAnalysis.plan.split('\n').filter(line => line.trim())
              cachedResult = {
                immediate: lines.slice(0, 3),
                followUp: lines.slice(3)
              }
              STRING_ARRAY_CACHE.set(cacheKey, cachedResult)
            }

            return {
              immediateActions: cachedResult.immediate,
              medications: EMPTY_MEDICATIONS,
              followUp: cachedResult.followUp,
              patientEducation: EMPTY_PATIENT_EDUCATION,
            }
          })()
        : null,
    }
  }, [soapAnalysis])

  // Section edit handler
  const handleSectionEdit = (section: SOAPEditSection, data: SOAPSectionData) => {
    // Map Spanish section names to English for Redux
    const sectionMap = {
      subjetivo: 'subjective' as const,
      objetivo: 'objective' as const,
      analisis: 'assessment' as const,
      plan: 'plan' as const,
    }

    const englishSection = sectionMap[section]
    dispatch(
      updateSOAPSection({
        section: englishSection,
        content: JSON.stringify(data),
        confidence: 0.8,
      })
    )
  }

  return {
    soapAnalysis,
    isLoading,
    error,
    transformedData,
    handleSectionEdit,
  }
}
