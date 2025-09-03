// src/hooks/useSOAPData.ts
// SOAP Data Management Hook - Clean Architecture
// EXTRACTED from SOAPDisplay monolith - Bernard Orozco

import { useSelector, useDispatch } from 'react-redux'
import { useMemo } from 'react'
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
            medicalHistory: [],
            familyHistory: [],
          }
        : null,
      objetivo: soapAnalysis.objective
        ? {
            vitalSigns: {},
            physicalExam: { general: soapAnalysis.objective },
            labResults: [],
          }
        : null,
      analisis: soapAnalysis.assessment
        ? {
            primaryDx: soapAnalysis.assessment,
            confidence: soapAnalysis.confidence,
            differentialDx: [],
            reasoning: soapAnalysis.assessment,
          }
        : null,
      plan: soapAnalysis.plan
        ? {
            immediateActions: soapAnalysis.plan
              .split('\n')
              .filter(line => line.trim())
              .slice(0, 3), // Limit to first 3 actions
            medications: [],
            followUp: soapAnalysis.plan
              .split('\n')
              .filter(line => line.trim())
              .slice(3), // Remaining as follow-up
            patientEducation: [],
          }
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
