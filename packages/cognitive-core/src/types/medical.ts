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

// Importar tipos de medicina defensiva
import type { UrgencyAssessment, TriageResult } from '../classifiers/UrgencyClassifier'

// === DEFINICIONES SOAP COMPLETAS CON MEDICINA DEFENSIVA ===

export interface SOAPData {
  subjetivo: {
    motivoConsulta: string
    historiaActual: string
    antecedentes: {
      personales: string[]
      familiares: string[]
      medicamentos: string[]
      alergias: string[]
    }
    revisionSistemas: string
    contextoPsicosocial: string
  }
  objetivo: {
    signosVitales: {
      presionArterial?: string
      frecuenciaCardiaca?: string
      frecuenciaRespiratoria?: string
      temperatura?: string
      saturacionOxigeno?: string
      peso?: string
      talla?: string
      imc?: string
    }
    exploracionFisica: {
      aspecto: string
      cabezaCuello: string
      torax: string
      abdomen: string
      extremidades: string
      neurologico: string
      piel: string
    }
    estudiosComplementarios: {
      laboratorios?: Record<string, string>
      imagenes?: string[]
      otros?: string[]
    }
  }
  analisis: {
    diagnosticoPrincipal: {
      condicion: string
      cie10: string
      evidencia: string[]
      probabilidad: number
    }
    diagnosticosDiferenciales: Array<{
      condicion: string
      cie10: string
      evidencia: string[]
      probabilidad: number
      gravedad: 'baja' | 'moderada' | 'alta' | 'critica'
      urgencia: 'no_urgente' | 'semi_urgente' | 'urgente' | 'emergencia'
    }>
    factoresRiesgo: string[]
    senosPeligro: string[]
    pronostico: {
      inmediato: string
      cortoplazo: string
      largoplazo: string
    }
  }
  plan: {
    tratamientoFarmacologico: Array<{
      medicamento: string
      dosis: string
      via: string
      frecuencia: string
      duracion: string
      indicaciones: string
      contraindicaciones: string[]
    }>
    tratamientoNoFarmacologico: string[]
    estudiosAdicionales: Array<{
      estudio: string
      justificacion: string
      urgencia: 'inmediato' | '24h' | '48h' | '1semana' | 'rutina'
    }>
    interconsultas: Array<{
      especialidad: string
      motivo: string
      urgencia: 'inmediato' | 'urgente' | 'programado'
    }>
    seguimiento: {
      proximaCita: string
      criteriosAlarma: string[]
      educacionPaciente: string[]
      modificacionesEstiloVida: string[]
    }
    pronostico: string
    certificaciones: {
      incapacidad?: {
        dias: number
        tipo: 'temporal' | 'permanente'
        actividades: string[]
      }
      defuncion?: boolean
    }
  }
}

/**
 * 🏥 SOAP ANALYSIS COMPLETO - UNIFICADO Y PODEROSO
 * 
 * Versión única que incluye:
 * - Estructura SOAP formal NOM-004-SSA3-2012
 * - Sistema de Medicina Defensiva (Fase 3)
 * - Métricas avanzadas de calidad
 * - Compatibilidad hacia atrás con campos legacy
 */
export interface SOAPAnalysis {
  // === NUEVO: ESTRUCTURA SOAP COMPLETA ===
  soap?: SOAPData
  
  // === NUEVO: MEDICINA DEFENSIVA ===
  defensiveAssessment?: UrgencyAssessment
  triageResult?: TriageResult
  
  // === METADATOS AVANZADOS ===
  metadata?: {
    version: string
    normativa: 'NOM-004-SSA3-2012'
    fechaAnalisis: string
    profesionalResponsable: string
    institucion: string
    clasificacion: {
      complejidad: 'baja' | 'media' | 'alta' | 'critica'
      especialidad: string[]
      urgencia: 1 | 2 | 3 | 4 | 5
      riesgoVital: boolean
    }
    calidad: {
      completitud: number // 0-100%
      coherencia: number // 0-100%
      seguridadClinica: number // 0-100%
      cumplimientoNormativo: number // 0-100%
      medicinaDefensiva: number // 0-100% - Medicina defensiva score
    }
    defensiveMedicine: {
      urgentPatternsDetected: number
      gravityPrioritization: boolean
      redFlagsIdentified: string[]
      immediateActionsRequired: boolean
    }
  }
  
  // === COMPATIBILIDAD LEGACY ===
  // Campos para retrocompatibilidad con código existente
  subjetivo?: string // Mapea a soap.subjetivo.motivoConsulta + soap.subjetivo.historiaActual
  objetivo?: string // Versión simplificada de soap.objetivo
  diagnostico_principal?: string // Mapea a soap.analisis.diagnosticoPrincipal.condicion
  diagnosticos_diferenciales?: string[] // Versión simplificada de soap.analisis.diagnosticosDiferenciales
  plan_tratamiento?: string // Versión simplificada del plan
  confianza_global?: number // Mapea a metadata.calidad
  datos_adicionales_necesarios?: string[] // Lista de información faltante
  ciclos_diagnosticos?: number
  tiempo_total_analisis?: number
  evolucion_diagnostica?: DiagnosticEvolution[]
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