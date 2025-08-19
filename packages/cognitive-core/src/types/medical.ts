// packages/cognitive-core/src/types/medical.ts
// Tipos para Sistema Médico Iterativo - Creado por Bernard Orozco

export interface MedicalCase {
  id?: string
  presentation: string // Presentación inicial del caso
  history?: string // Historia clínica disponible
  context?: string // Contexto adicional
  demographics?: {
    age?: number
    gender?: string
    occupation?: string
  }
  vitalSigns?: {
    temperature?: number
    bloodPressure?: string
    heartRate?: number
    respiratoryRate?: number
    oxygenSaturation?: number
  }
}

export interface SOAPAnalysis {
  // Secciones SOAP principales
  subjetivo: string // Lo que dice el paciente
  objetivo: string // Signos vitales, exploración física
  diagnostico_principal: string // Diagnóstico más probable
  diagnosticos_diferenciales: string[] // Lista de diagnósticos alternativos
  plan_tratamiento: string // Plan terapéutico completo
  
  // Métricas de confianza y calidad
  confianza_global?: number // 0-1
  datos_adicionales_necesarios?: string[] // Lista de información faltante
  
  // Datos del proceso iterativo
  ciclos_diagnosticos?: number
  tiempo_total_analisis?: number
  evolucion_diagnostica?: DiagnosticEvolution[]
  
  // Análisis cognitivo del orquestador
  analisis_cognitivo?: {
    agentes_consultados: number
    consenso_alcanzado: boolean
    insights_memoria: string
    validacion_especializada: boolean
  }
}

export interface DiagnosticEvolution {
  ciclo: number
  diagnostico: string
  confianza: number
}

export interface DiagnosticCycle {
  id: string
  cycleNumber: number
  timestamp: number
  latency: number
  caseData: MedicalCase
  analysis: SOAPAnalysis
  confidence: number
  qualityScore: number
  insights: string[]
  nextSteps: string[]
}

export interface AdditionalInfoRequest {
  type: 'additional_info_needed'
  currentCycle: number
  confidence: number
  questions: string[] // Preguntas específicas para el médico
  partialAnalysis: SOAPAnalysis // Análisis parcial hasta el momento
  nextActions: string[] // Acciones recomendadas
}

export interface DiagnosticResult {
  success: boolean
  result: SOAPAnalysis | AdditionalInfoRequest
  totalCycles: number
  finalConfidence: number
  processingTimeMs: number
  qualityScore: number
}

// Tipos para validación médica mejorada
export interface MedicalValidationResult {
  isValid: boolean
  confidence: number
  medicalTermsFound: string[]
  missingCriticalData: string[]
  structureScore: number
  clinicalCoherence: number
  rejectionReason?: string
  suggestedImprovements?: string[]
}

// Tipos para métricas del sistema
export interface SystemMetrics {
  totalCases: number
  averageCycles: number
  averageConfidence: number
  averageProcessingTime: number
  successRate: number
  qualityScores: {
    excellent: number // > 0.9
    good: number // 0.7-0.9
    fair: number // 0.5-0.7
    poor: number // < 0.5
  }
}

// Enums para clasificación
export enum DiagnosticConfidenceLevel {
  LOW = 'low', // < 0.6
  MEDIUM = 'medium', // 0.6-0.8
  HIGH = 'high', // 0.8-0.95
  VERY_HIGH = 'very_high' // > 0.95
}

export enum UrgencyLevel {
  LOW = 'low',
  MEDIUM = 'medium', 
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ClinicalSpecialty {
  GENERAL_MEDICINE = 'general_medicine',
  CARDIOLOGY = 'cardiology',
  NEUROLOGY = 'neurology',
  GASTROENTEROLOGY = 'gastroenterology',
  ENDOCRINOLOGY = 'endocrinology',
  PSYCHIATRY = 'psychiatry',
  EMERGENCY_MEDICINE = 'emergency_medicine',
  PEDIATRICS = 'pediatrics'
}

// Tipos para análisis defensivo
export interface DefensiveMedicineAnalysis {
  urgencyLevel: UrgencyLevel
  redFlags: string[] // Señales de alarma identificadas
  ruleOutDiagnoses: string[] // Diagnósticos que hay que descartar urgentemente
  timeToAction: string // Tiempo crítico para actuar
  criticalStudies: string[] // Estudios urgentes requeridos
  specialistReferral: {
    required: boolean
    specialty: ClinicalSpecialty
    urgency: UrgencyLevel
    reason: string
  }
}

// Tipos para el engine mejorado
export interface EnhancedDiagnosticEngine {
  processCase(medicalCase: MedicalCase): Promise<DiagnosticResult>
  getCurrentMetrics(): SystemMetrics
  getDefensiveAnalysis(analysis: SOAPAnalysis): DefensiveMedicineAnalysis
  reset(): void
}