// 🧠 Medical Prompt Orchestrator - Middleware Pipeline
// Creado por Bernard Orozco - Sistema de validación y detección en cadena

import { callClaudeForDecision } from './decisionalMiddleware'
import type {
  CriticalDataValidationDecision,
  SpecialtyDetectionDecision,
  MedicalAutocompletionDecision,
} from '../types/agents'

export interface PatientFormData {
  // Datos básicos
  age?: number
  gender?: 'M' | 'F' | 'Other'
  weight?: number

  // Información clínica crítica
  allergies?: string[]
  currentMedications?: string[]
  medicalHistory?: string[]
  familyHistory?: string[]

  // Contexto de la consulta
  chiefComplaint?: string
  symptomDuration?: string
  specialty?: string

  // Datos adicionales opcionales
  vitalSigns?: {
    temperature?: number
    bloodPressure?: string
    heartRate?: number
    respiratoryRate?: number
    oxygenSaturation?: number
  }

  // Metadata del formulario
  completionPercentage?: number
  lastUpdated?: Date
}

export interface OrchestrationResult {
  action: 'request_data' | 'suggest_specialty' | 'generate_prompts'
  data: {
    validation?: CriticalDataValidationDecision
    specialtyDetection?: SpecialtyDetectionDecision
    prompts?: MedicalAutocompletionDecision
    nextSteps?: string[]
  }
  canProceed: boolean
  confidence: number
}

export class MedicalPromptOrchestrator {
  /**
   * Pipeline principal: Validación → Detección → Generación
   */
  async processPatientInput(
    partialData: Partial<PatientFormData>,
    promptText: string
  ): Promise<OrchestrationResult> {
    console.log('🚀 Iniciando pipeline de middleware médico...')

    try {
      // PASO 1: Validación de datos críticos
      const validationResult = await this.validateCriticalData(partialData, promptText)

      if (!validationResult.can_proceed) {
        return {
          action: 'request_data',
          data: {
            validation: validationResult,
            nextSteps: validationResult.missing_fields.map(f => f.suggested_prompt),
          },
          canProceed: false,
          confidence: validationResult.completion_percentage,
        }
      }

      // PASO 2: Detección de especialidad
      const specialtyResult = await this.detectSpecialty(partialData, promptText)

      // PASO 3: Generación de prompts dinámicos
      const promptsResult = await this.generateDynamicPrompts(
        partialData,
        promptText,
        specialtyResult
      )

      return {
        action: 'generate_prompts',
        data: {
          validation: validationResult,
          specialtyDetection: specialtyResult,
          prompts: promptsResult,
          nextSteps: ['Seleccionar template médico', 'Completar formulario según especialidad'],
        },
        canProceed: true,
        confidence: Math.min(validationResult.completion_percentage, specialtyResult.confidence),
      }
    } catch (error) {
      console.error('💀 Error en pipeline de middleware:', error)
      return this.createFallbackResult()
    }
  }

  /**
   * MIDDLEWARE 1: Validación de datos críticos faltantes
   */
  private async validateCriticalData(
    patientData: Partial<PatientFormData>,
    promptText: string
  ): Promise<CriticalDataValidationDecision> {
    const contextData = {
      patientData: JSON.stringify(patientData),
      promptText,
      currentFields: Object.keys(patientData).filter(
        key => patientData[key as keyof PatientFormData] !== undefined
      ),
    }

    const response = await callClaudeForDecision(
      'critical_data_validation',
      `Analiza estos datos del paciente para determinar si faltan datos críticos:
      
      DATOS ACTUALES: ${JSON.stringify(patientData)}
      PROMPT MÉDICO: "${promptText}"
      
      ¿Qué información crítica falta para proceder con análisis médico completo?`,
      'claude',
      undefined,
      undefined,
      contextData
    )

    if (!response.success) {
      throw new Error(`Error en validación de datos: ${response.error}`)
    }

    return response.decision as CriticalDataValidationDecision
  }

  /**
   * MIDDLEWARE 2: Detección automática de especialidad médica
   */
  private async detectSpecialty(
    patientData: Partial<PatientFormData>,
    promptText: string
  ): Promise<SpecialtyDetectionDecision> {
    const contextData = {
      patientAge: patientData.age,
      patientGender: patientData.gender,
      chiefComplaint: patientData.chiefComplaint,
      symptoms: promptText,
    }

    const response = await callClaudeForDecision(
      'specialty_detection',
      `Basado en estos datos, detecta la especialidad médica más relevante:
      
      DATOS DEL PACIENTE: ${JSON.stringify(patientData)}
      SÍNTOMAS/CONSULTA: "${promptText}"
      
      ¿Qué especialidad médica se infiere y qué formularios específicos se necesitan?`,
      'claude',
      undefined,
      undefined,
      contextData
    )

    if (!response.success) {
      throw new Error(`Error en detección de especialidad: ${response.error}`)
    }

    return response.decision as SpecialtyDetectionDecision
  }

  /**
   * MIDDLEWARE 3: Generación de prompts dinámicos enriquecidos
   */
  private async generateDynamicPrompts(
    patientData: Partial<PatientFormData>,
    promptText: string,
    specialtyInfo: SpecialtyDetectionDecision
  ): Promise<MedicalAutocompletionDecision> {
    const enrichedContext = {
      patientData,
      detectedSpecialty: specialtyInfo.detected_specialty,
      specialtyIndicators: specialtyInfo.indicators,
      suggestedFields: specialtyInfo.suggested_form_fields,
      originalPrompt: promptText,
    }

    const response = await callClaudeForDecision(
      'medical_autocompletion',
      `Genera prompts médicos especializados basados en:
      
      CONTEXTO ENRIQUECIDO: ${JSON.stringify(enrichedContext)}
      
      Genera 3 templates personalizados para especialidad: ${specialtyInfo.detected_specialty}
      Nivel de confianza especialidad: ${specialtyInfo.confidence}`,
      'claude',
      undefined,
      undefined,
      enrichedContext
    )

    if (!response.success) {
      throw new Error(`Error en generación de prompts: ${response.error}`)
    }

    return response.decision as MedicalAutocompletionDecision
  }

  /**
   * Resultado de fallback en caso de error
   */
  private createFallbackResult(): OrchestrationResult {
    return {
      action: 'request_data',
      data: {
        nextSteps: [
          'Complete los datos básicos del paciente',
          'Proporcione síntoma principal',
          'Intente nuevamente',
        ],
      },
      canProceed: false,
      confidence: 0.1,
    }
  }

  /**
   * Método helper para verificar si los datos están completos
   */
  calculateCompletionPercentage(patientData: Partial<PatientFormData>): number {
    const criticalFields = ['age', 'gender', 'chiefComplaint']
    const importantFields = ['allergies', 'currentMedications', 'medicalHistory']
    const optionalFields = ['weight', 'familyHistory', 'vitalSigns']

    let score = 0
    let totalWeight = 10 // Total weight for 100%

    // Critical fields (5 points total)
    criticalFields.forEach(field => {
      if (patientData[field as keyof PatientFormData]) {
        score += 5 / criticalFields.length
      }
    })

    // Important fields (3 points total)
    importantFields.forEach(field => {
      if (patientData[field as keyof PatientFormData]) {
        score += 3 / importantFields.length
      }
    })

    // Optional fields (2 points total)
    optionalFields.forEach(field => {
      if (patientData[field as keyof PatientFormData]) {
        score += 2 / optionalFields.length
      }
    })

    return Math.min(1.0, score / totalWeight)
  }
}

// Export singleton instance
export const medicalOrchestrator = new MedicalPromptOrchestrator()
