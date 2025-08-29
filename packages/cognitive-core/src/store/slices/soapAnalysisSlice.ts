// 🏥 SOAP ANALYSIS SLICE REAL - Creado por Bernard Orozco + Gandalf el Blanco
// Destructor definitivo de mockCurrentCase

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { SOAPAnalysis, DiagnosticPhase } from '../../types/medicalInterfaces'

// 🏥 ESTADO SOAP REAL - NO MORE MOCKS
export interface SOAPAnalysisState {
  // === ANÁLISIS SOAP ACTUAL ===
  currentAnalysis: SOAPAnalysis | null

  // === HISTORIAL DE ANÁLISIS ===
  analysisHistory: SOAPAnalysis[]

  // === ESTADOS DE PROCESAMIENTO ===
  isExtracting: boolean // ¿Extrayendo análisis de mensajes?
  isUpdating: boolean // ¿Actualizando análisis existente?
  lastProcessed: number // Timestamp último procesamiento

  // === CALIDAD Y VALIDACIÓN ===
  extractionQuality: number // Calidad de extracción (0-1)
  validationErrors: string[] // Errores de validación

  // === CONFIGURACIÓN ===
  autoUpdate: boolean // Auto-actualizar cuando cambien mensajes
  confidenceThreshold: number // Umbral mínimo de confianza
}

// 🧠 ESTADO INICIAL - LIMPIO Y REAL
const initialState: SOAPAnalysisState = {
  currentAnalysis: null,
  analysisHistory: [],
  isExtracting: false,
  isUpdating: false,
  lastProcessed: 0,
  extractionQuality: 0,
  validationErrors: [],
  autoUpdate: true,
  confidenceThreshold: 0.7,
}

// 🔥 SLICE SOAP REAL - ELIMINADOR DE MOCKS
const soapAnalysisSlice = createSlice({
  name: 'soapAnalysisReal',
  initialState,
  reducers: {
    // === INICIAR EXTRACCIÓN SOAP ===
    startSOAPExtraction: state => {
      state.isExtracting = true
      state.validationErrors = []
    },

    // === SOAP EXTRAÍDO EXITOSAMENTE ===
    extractionSuccess: (
      state,
      action: PayloadAction<{
        analysis: SOAPAnalysis
        quality: number
      }>
    ) => {
      const { analysis, quality } = action.payload

      // Guardar análisis actual
      if (state.currentAnalysis) {
        state.analysisHistory.unshift(state.currentAnalysis)
        // Mantener solo últimos 10 análisis
        state.analysisHistory = state.analysisHistory.slice(0, 10)
      }

      state.currentAnalysis = analysis
      state.extractionQuality = quality
      state.isExtracting = false
      state.lastProcessed = Date.now()
    },

    // === ERROR EN EXTRACCIÓN ===
    extractionError: (state, action: PayloadAction<string>) => {
      state.isExtracting = false
      state.validationErrors.push(action.payload)
    },

    // === ACTUALIZAR ANÁLISIS PARCIALMENTE ===
    updateSOAPSection: (
      state,
      action: PayloadAction<{
        section: keyof Pick<SOAPAnalysis, 'subjective' | 'objective' | 'assessment' | 'plan'>
        content: string
        confidence: number
      }>
    ) => {
      if (!state.currentAnalysis) return

      const { section, content, confidence } = action.payload
      state.isUpdating = true

      state.currentAnalysis[section] = content

      // Recalcular confianza general
      const sections = [
        state.currentAnalysis.subjective,
        state.currentAnalysis.objective,
        state.currentAnalysis.assessment,
        state.currentAnalysis.plan,
      ]
      const validSections = sections.filter(s => s !== null).length
      const totalSections = 4

      // Actualizar completitud
      state.currentAnalysis.completionPercentage = (validSections / totalSections) * 100
      state.currentAnalysis.isComplete = validSections === totalSections

      // Actualizar confianza promedio ponderada
      const currentConfidence = state.currentAnalysis.confidence
      state.currentAnalysis.confidence = (currentConfidence + confidence) / 2

      state.currentAnalysis.lastUpdated = Date.now()
      state.isUpdating = false
    },

    // === MARCAR ANÁLISIS COMO COMPLETO ===
    completeAnalysis: state => {
      if (!state.currentAnalysis) return

      state.currentAnalysis.isComplete = true
      state.currentAnalysis.completionPercentage = 100
      state.currentAnalysis.lastUpdated = Date.now()
    },

    // === ACTUALIZAR CALIDAD DE ANÁLISIS ===
    updateAnalysisQuality: (
      state,
      action: PayloadAction<{
        qualityScore: number
        totalMessages: number
      }>
    ) => {
      if (!state.currentAnalysis) return

      const { qualityScore, totalMessages } = action.payload
      state.currentAnalysis.qualityScore = qualityScore
      state.currentAnalysis.totalMessages = totalMessages
      state.extractionQuality = qualityScore
    },

    // === LIMPIAR ANÁLISIS ACTUAL ===
    clearCurrentAnalysis: state => {
      if (state.currentAnalysis) {
        state.analysisHistory.unshift(state.currentAnalysis)
        state.analysisHistory = state.analysisHistory.slice(0, 10)
      }

      state.currentAnalysis = null
      state.extractionQuality = 0
      state.validationErrors = []
    },

    // === CONFIGURAR AUTO-UPDATE ===
    setAutoUpdate: (state, action: PayloadAction<boolean>) => {
      state.autoUpdate = action.payload
    },

    // === CONFIGURAR UMBRAL DE CONFIANZA ===
    setConfidenceThreshold: (state, action: PayloadAction<number>) => {
      state.confidenceThreshold = Math.max(0, Math.min(1, action.payload))
    },

    // === LIMPIAR ERRORES ===
    clearValidationErrors: state => {
      state.validationErrors = []
    },

    // === RESET COMPLETO DEL SLICE ===
    resetSOAPAnalysis: () => initialState,
  },
})

// 🚀 EXPORTAR ACCIONES PARA DESTRUIR MOCKS
export const {
  startSOAPExtraction,
  extractionSuccess,
  extractionError,
  updateSOAPSection,
  completeAnalysis,
  updateAnalysisQuality,
  clearCurrentAnalysis,
  setAutoUpdate,
  setConfidenceThreshold,
  clearValidationErrors,
  resetSOAPAnalysis,
} = soapAnalysisSlice.actions

// 🎯 SELECTORES BÁSICOS DEL SLICE
export const selectSOAPAnalysisState = (state: { soapAnalysis: SOAPAnalysisState }) =>
  state.soapAnalysis

export const selectCurrentSOAPAnalysis = (state: { soapAnalysis: SOAPAnalysisState }) =>
  state.soapAnalysis.currentAnalysis

export const selectSOAPExtractionStatus = (state: { soapAnalysis: SOAPAnalysisState }) => ({
  isExtracting: state.soapAnalysis.isExtracting,
  isUpdating: state.soapAnalysis.isUpdating,
  quality: state.soapAnalysis.extractionQuality,
  errors: state.soapAnalysis.validationErrors,
})

export const selectSOAPHistory = (state: { soapAnalysis: SOAPAnalysisState }) =>
  state.soapAnalysis.analysisHistory

// 🏥 REDUCER PARA INTEGRAR EN STORE
export default soapAnalysisSlice.reducer
