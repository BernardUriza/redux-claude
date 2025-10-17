// src/services/redux-brain/SOAPOrchestrator.ts
// SOAP Orchestrator - Unified SOAP State Management with Strategy Pattern

import type { SOAPState, PatientInfo } from './SessionManager'
import type { SOAPProcessor } from '@redux-claude/cognitive-core'
import { logger } from '@/lib/logger'

// Constants
const MAX_SECTION_LENGTH = 5000 // Prevent infinite accumulation
const UPDATE_MARKERS = {
  subjetivo: '📝 ACTUALIZACIÓN',
  objetivo: '📊 ACTUALIZACIÓN',
  analisis: '🧠 ACTUALIZACIÓN DDx',
  plan: '📋 ACTUALIZACIÓN PLAN',
} as const

// Types
type SOAPSection = keyof SOAPState
type SOAPAnalysisResult = Awaited<ReturnType<SOAPProcessor['processCase']>>

interface SOAPUpdateContext {
  sessionId: string
  sanitizedMessage: string
  soapAnalysis: SOAPAnalysisResult
  dispatchAction: (action: { type: string; payload: Record<string, unknown> }) => void
}

// Strategy interface for SOAP updates
interface SOAPUpdateStrategy {
  canUpdate(newData: string, currentData?: string): boolean
  update(newData: string, currentData?: string): string
}

// Base strategy with common logic
abstract class BaseSOAPStrategy implements SOAPUpdateStrategy {
  constructor(
    protected section: SOAPSection,
    protected placeholders: string[] = ['pendiente', 'por definir', 'por completar']
  ) {}

  canUpdate(newData: string, currentData?: string): boolean {
    // Don't update if new data is placeholder
    if (this.isPlaceholder(newData)) {
      return !currentData // Only create if nothing exists
    }
    return true
  }

  update(newData: string, currentData?: string): string {
    // First data - initialize
    if (!currentData) {
      return this.truncate(newData)
    }

    // Check if data already exists (avoid duplicates)
    if (currentData.includes(newData)) {
      return currentData
    }

    // Accumulate with marker
    const marker = UPDATE_MARKERS[this.section]
    const updated = `${currentData}\n\n${marker}: ${newData}`
    return this.truncate(updated)
  }

  protected isPlaceholder(text: string): boolean {
    return this.placeholders.some(p => text.toLowerCase().includes(p))
  }

  protected truncate(text: string): string {
    if (text.length > MAX_SECTION_LENGTH) {
      logger.warn('SOAP section truncated due to length', {
        section: this.section,
        originalLength: text.length,
        maxLength: MAX_SECTION_LENGTH,
      })
      return text.substring(0, MAX_SECTION_LENGTH) + '\n\n[...truncado por longitud]'
    }
    return text
  }
}

// Specific strategies for each section
class SubjetivoStrategy extends BaseSOAPStrategy {
  constructor() {
    super('subjetivo')
  }
}

class ObjetivoStrategy extends BaseSOAPStrategy {
  constructor() {
    super('objetivo', ['pendiente', 'por definir', 'por evaluar', 'se requiere'])
  }

  canUpdate(newData: string, currentData?: string): boolean {
    // For objetivo, replace placeholder with real data
    if (this.isPlaceholder(newData)) {
      return !currentData
    }

    if (currentData && this.isPlaceholder(currentData)) {
      return true // Replace placeholder
    }

    return super.canUpdate(newData, currentData)
  }

  update(newData: string, currentData?: string): string {
    // If current is placeholder and new is real, replace
    if (currentData && this.isPlaceholder(currentData) && !this.isPlaceholder(newData)) {
      return this.truncate(newData)
    }

    return super.update(newData, currentData)
  }
}

class AnalisisStrategy extends BaseSOAPStrategy {
  constructor() {
    super('analisis', ['pendiente', 'por definir', 'síndrome clínico'])
  }

  canUpdate(newData: string, currentData?: string): boolean {
    if (this.isPlaceholder(newData)) {
      return !currentData
    }

    if (currentData && this.isPlaceholder(currentData)) {
      return true
    }

    return super.canUpdate(newData, currentData)
  }

  update(newData: string, currentData?: string): string {
    if (currentData && this.isPlaceholder(currentData) && !this.isPlaceholder(newData)) {
      return this.truncate(newData)
    }

    return super.update(newData, currentData)
  }
}

class PlanStrategy extends BaseSOAPStrategy {
  constructor() {
    super('plan', ['pendiente', 'por completar', 'requiere completar'])
  }

  canUpdate(newData: string, currentData?: string): boolean {
    if (this.isPlaceholder(newData)) {
      return !currentData
    }

    if (currentData && this.isPlaceholder(currentData)) {
      return true
    }

    return super.canUpdate(newData, currentData)
  }

  update(newData: string, currentData?: string): string {
    if (currentData && this.isPlaceholder(currentData) && !this.isPlaceholder(newData)) {
      return this.truncate(newData)
    }

    return super.update(newData, currentData)
  }
}

// SOAP Orchestrator
export class SOAPOrchestrator {
  private strategies: Record<SOAPSection, SOAPUpdateStrategy> = {
    subjetivo: new SubjetivoStrategy(),
    objetivo: new ObjetivoStrategy(),
    analisis: new AnalisisStrategy(),
    plan: new PlanStrategy(),
  }

  /**
   * Update all SOAP sections from analysis
   */
  updateAllSections(soapState: SOAPState, context: SOAPUpdateContext): SOAPState {
    // Update Subjective
    this.updateSubjective(soapState, context)

    // Update Objective
    this.updateObjective(soapState, context)

    // Update Analysis
    this.updateAnalysis(soapState, context)

    // Update Plan
    this.updatePlan(soapState, context)

    return soapState
  }

  /**
   * Update Subjective section
   */
  private updateSubjective(soapState: SOAPState, context: SOAPUpdateContext): void {
    const { soapAnalysis, sanitizedMessage, dispatchAction } = context
    const strategy = this.strategies.subjetivo

    let newData = sanitizedMessage

    // Try to extract from SOAP analysis
    if (soapAnalysis.soap?.subjetivo) {
      const subjetivoValue =
        typeof soapAnalysis.soap.subjetivo === 'string'
          ? soapAnalysis.soap.subjetivo
          : soapAnalysis.soap.subjetivo.motivoConsulta || sanitizedMessage

      if (
        subjetivoValue !== 'Paciente acude por evaluación médica' &&
        subjetivoValue.trim().length > 10
      ) {
        newData = subjetivoValue
      }
    }

    if (strategy.canUpdate(newData, soapState.subjetivo)) {
      soapState.subjetivo = strategy.update(newData, soapState.subjetivo)

      dispatchAction({
        type: 'SOAP_S_UPDATED',
        payload: { subjetivo: soapState.subjetivo },
      })
    }
  }

  /**
   * Update Objective section
   */
  private updateObjective(soapState: SOAPState, context: SOAPUpdateContext): void {
    const { soapAnalysis, dispatchAction } = context
    const strategy = this.strategies.objetivo

    if (!soapAnalysis.soap?.objetivo) return

    const hasVitalSigns =
      soapAnalysis.soap.objetivo.signosVitales &&
      Object.keys(soapAnalysis.soap.objetivo.signosVitales).length > 0

    const newData =
      typeof soapAnalysis.soap.objetivo === 'string'
        ? soapAnalysis.soap.objetivo
        : hasVitalSigns
          ? `Signos vitales: ${JSON.stringify(soapAnalysis.soap.objetivo.signosVitales, null, 2)}. Exploración: ${
              typeof soapAnalysis.soap.objetivo.exploracionFisica === 'object'
                ? JSON.stringify(soapAnalysis.soap.objetivo.exploracionFisica, null, 2)
                : soapAnalysis.soap.objetivo.exploracionFisica || 'Pendiente'
            }`
          : 'Pendiente - Se requiere evaluación física y signos vitales'

    if (strategy.canUpdate(newData, soapState.objetivo)) {
      soapState.objetivo = strategy.update(newData, soapState.objetivo)

      dispatchAction({
        type: 'SOAP_O_UPDATED',
        payload: { objetivo: soapState.objetivo },
      })
    }
  }

  /**
   * Update Analysis section
   */
  private updateAnalysis(soapState: SOAPState, context: SOAPUpdateContext): void {
    const { soapAnalysis, dispatchAction } = context
    const strategy = this.strategies.analisis

    let newData: string

    if (soapAnalysis.soap?.analisis) {
      newData =
        typeof soapAnalysis.soap.analisis === 'string'
          ? soapAnalysis.soap.analisis
          : soapAnalysis.soap.analisis.diagnosticoPrincipal?.condicion ||
            'Análisis pendiente - Se requiere más información clínica'
    } else {
      newData = 'Análisis pendiente - Se requiere más información clínica'
    }

    if (strategy.canUpdate(newData, soapState.analisis)) {
      soapState.analisis = strategy.update(newData, soapState.analisis)

      dispatchAction({
        type: 'SOAP_A_UPDATED',
        payload: { analisis: soapState.analisis },
      })
    }
  }

  /**
   * Update Plan section
   */
  private updatePlan(soapState: SOAPState, context: SOAPUpdateContext): void {
    const { soapAnalysis, dispatchAction } = context
    const strategy = this.strategies.plan

    let newData: string

    if (soapAnalysis.soap?.plan) {
      if (typeof soapAnalysis.soap.plan === 'string') {
        newData = soapAnalysis.soap.plan
      } else {
        const hasTreatment =
          (Array.isArray(soapAnalysis.soap.plan.tratamientoFarmacologico) &&
            soapAnalysis.soap.plan.tratamientoFarmacologico.length > 0) ||
          (Array.isArray(soapAnalysis.soap.plan.tratamientoNoFarmacologico) &&
            soapAnalysis.soap.plan.tratamientoNoFarmacologico.length > 0)

        newData = hasTreatment
          ? JSON.stringify(soapAnalysis.soap.plan, null, 2)
          : 'Plan pendiente - Requiere completar anamnesis y evaluación'
      }
    } else {
      newData = 'Plan pendiente - Requiere completar anamnesis y evaluación'
    }

    if (strategy.canUpdate(newData, soapState.plan)) {
      soapState.plan = strategy.update(newData, soapState.plan)

      dispatchAction({
        type: 'SOAP_P_UPDATED',
        payload: { plan: soapState.plan },
      })
    }
  }

  /**
   * Identify missing SOAP data
   */
  identifyGaps(soapState: SOAPState, patientInfo: PatientInfo): string[] {
    const gaps: string[] = []

    // S - SUBJETIVO gaps
    if (!soapState.subjetivo || soapState.subjetivo.length < 30) {
      gaps.push('Motivo de consulta detallado')
      gaps.push('Historia de enfermedad actual (inicio, evolución, factores agravantes/aliviantes)')
    }
    if (!patientInfo.medicalHistory || patientInfo.medicalHistory.length === 0) {
      gaps.push('Antecedentes médicos personales')
    }
    if (!patientInfo.duration) {
      gaps.push('Tiempo de evolución de síntomas')
    }

    // O - OBJETIVO gaps
    if (
      !soapState.objetivo ||
      this.strategies.objetivo.canUpdate('Pendiente', soapState.objetivo)
    ) {
      gaps.push('Signos vitales completos (PA, FC, FR, Temp, SatO2)')
      gaps.push('Examen físico dirigido por sistemas')
    }

    // A - ANÁLISIS gaps
    if (
      !soapState.analisis ||
      this.strategies.analisis.canUpdate('pendiente', soapState.analisis)
    ) {
      if (gaps.length === 0) {
        gaps.push('Análisis clínico y diagnósticos diferenciales')
      }
    }

    // P - PLAN gaps
    if (!soapState.plan || this.strategies.plan.canUpdate('pendiente', soapState.plan)) {
      if (
        soapState.analisis &&
        !this.strategies.analisis.canUpdate('pendiente', soapState.analisis)
      ) {
        gaps.push('Plan terapéutico y seguimiento')
      }
    }

    // Patient demographics
    if (!patientInfo.age) {
      gaps.push('Edad del paciente')
    }
    if (!patientInfo.gender) {
      gaps.push('Sexo del paciente')
    }

    return gaps
  }
}

// Export singleton instance
export const soapOrchestrator = new SOAPOrchestrator()
