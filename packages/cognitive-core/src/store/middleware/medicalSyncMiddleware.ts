// ⚡ MIDDLEWARE SINCRONIZACIÓN MÉDICA MULTINÚCLEO 
// Creado por Bernard Orozco + Gandalf el Blanco
// Sincronizador de datos entre cores + Auto-extracción SOAP

import { Middleware, MiddlewareAPI, Dispatch, AnyAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import { 
  startSOAPExtraction, 
  extractionSuccess, 
  extractionError,
  updateAnalysisQuality 
} from '../slices/soapAnalysisSlice'
import {
  addDashboardMessage,
  addAssistantMessage,
  addInferenceMessage
} from '../medicalChatSlice'
import type { SOAPAnalysis } from '../../types/medicalInterfaces'

// 🔧 CONFIGURACIÓN DEL MIDDLEWARE
interface MiddlewareConfig {
  autoSOAPExtraction: boolean      // ¿Auto-extraer SOAP cuando cambien mensajes?
  syncBetweenCores: boolean       // ¿Sincronizar entre cores?
  extractionThreshold: number     // Mínimo de mensajes para extraer SOAP
  syncDebounceMs: number          // Debounce para sincronización (ms)
}

const defaultConfig: MiddlewareConfig = {
  autoSOAPExtraction: true,
  syncBetweenCores: true,
  extractionThreshold: 3,
  syncDebounceMs: 1000
}

// 🎯 DETECTORES DE EVENTOS MÉDICOS
const isMedicalMessageAction = (action: AnyAction): boolean => {
  return [
    addDashboardMessage.type,
    addAssistantMessage.type,
    addInferenceMessage.type
  ].includes(action.type)
}

const isAssistantMedicalMessage = (action: AnyAction): boolean => {
  return action.type === addAssistantMessage.type ||
         action.type === addDashboardMessage.type && action.payload.type === 'assistant'
}

const hasSignificantMedicalContent = (content: string): boolean => {
  const medicalKeywords = [
    'symptom', 'diagnos', 'treatment', 'medication', 'pain', 
    'fever', 'headache', 'chest', 'abdomen', 'patient',
    'follow', 'recommend', 'prescrib', 'test', 'analysis'
  ]
  
  const contentLower = content.toLowerCase()
  return medicalKeywords.some(keyword => contentLower.includes(keyword)) &&
         content.length > 30
}

// 🧠 LÓGICA DE EXTRACCIÓN SOAP
const extractSOAPFromMessages = async (
  messages: any[],
  sessionId: string
): Promise<{ analysis: SOAPAnalysis; quality: number }> => {
  // Simular extracción SOAP real basada en mensajes
  
  const medicalMessages = messages.filter(msg => 
    msg.id !== 'welcome_multinucleus' &&
    hasSignificantMedicalContent(msg.content)
  )
  
  if (medicalMessages.length === 0) {
    throw new Error('No sufficient medical content for SOAP extraction')
  }
  
  // Extraer contenido por tipo de mensaje
  const userMessages = medicalMessages.filter(m => m.type === 'user')
  const assistantMessages = medicalMessages.filter(m => m.type === 'assistant')
  
  // Construir análisis SOAP
  const subjective = userMessages.length > 0 ? 
    userMessages.map(m => m.content).join('\n\n') : null
  
  const objective = assistantMessages
    .filter(m => m.metadata?.sectionType === 'diagnosis')
    .map(m => m.content).join('\n\n') || null
  
  const assessment = assistantMessages
    .filter(m => m.content.toLowerCase().includes('diagnos') || 
                 m.content.toLowerCase().includes('assess'))
    .map(m => m.content).join('\n\n') || null
  
  const plan = assistantMessages
    .filter(m => m.metadata?.sectionType === 'treatment' || 
                 m.metadata?.sectionType === 'followup')
    .map(m => m.content).join('\n\n') || null
  
  // Calcular confianza y calidad
  const confidenceScores = medicalMessages
    .filter(m => m.confidence)
    .map(m => m.confidence)
  
  const avgConfidence = confidenceScores.length > 0 ?
    confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length : 0
  
  // Calcular completitud
  const sections = [subjective, objective, assessment, plan]
  const validSections = sections.filter(s => s !== null).length
  const completionPercentage = (validSections / 4) * 100
  
  // Score de calidad basado en contenido y confianza
  const qualityScore = Math.min(
    (avgConfidence * 0.6) + 
    (completionPercentage / 100 * 0.3) + 
    (Math.min(medicalMessages.length / 10, 1) * 0.1),
    1
  )
  
  const analysis: SOAPAnalysis = {
    subjective,
    objective,
    assessment,
    plan,
    confidence: avgConfidence,
    lastUpdated: Date.now(),
    sessionId,
    isComplete: validSections === 4,
    completionPercentage,
    totalMessages: medicalMessages.length,
    qualityScore,
    extractionMethod: 'automatic'
  }
  
  return { analysis, quality: qualityScore }
}

// 🚀 MIDDLEWARE PRINCIPAL
export const createMedicalSyncMiddleware = (
  config: Partial<MiddlewareConfig> = {}
): Middleware => {
  const fullConfig = { ...defaultConfig, ...config }
  let lastSyncTime = 0
  let pendingExtraction = false
  
  return (store: MiddlewareAPI<Dispatch<AnyAction>, RootState>) => 
    (next: Dispatch<AnyAction>) => 
    async (action: AnyAction) => {
      // Ejecutar acción original primero
      const result = next(action)
      
      // === SINCRONIZACIÓN ENTRE CORES ===
      if (isMedicalMessageAction(action) && fullConfig.syncBetweenCores) {
        const now = Date.now()
        
        // Debounce para evitar sincronizaciones excesivas
        if (now - lastSyncTime < fullConfig.syncDebounceMs) {
          return result
        }
        lastSyncTime = now
        
        const state = store.getState()
        const { dashboard, assistant, inference } = state.medicalChat.cores
        
        console.log('🔄 [Medical Sync] Cores activity:', {
          dashboard: {
            messages: dashboard.messages.length,
            lastActivity: new Date(dashboard.lastActivity).toLocaleTimeString()
          },
          assistant: {
            messages: assistant.messages.length,
            lastActivity: new Date(assistant.lastActivity).toLocaleTimeString()
          },
          inference: {
            messages: inference.messages.length,
            lastActivity: new Date(inference.lastActivity).toLocaleTimeString()
          }
        })
      }
      
      // === AUTO-EXTRACCIÓN SOAP ===
      if (isAssistantMedicalMessage(action) && 
          fullConfig.autoSOAPExtraction && 
          !pendingExtraction) {
        
        const state = store.getState()
        const dashboardMessages = state.medicalChat.cores.dashboard.messages
        const sessionId = state.medicalChat.sharedState.currentSession.id
        
        // Verificar si hay suficientes mensajes médicos
        const medicalCount = dashboardMessages.filter(msg => 
          msg.id !== 'welcome_multinucleus' &&
          hasSignificantMedicalContent(msg.content)
        ).length
        
        if (medicalCount >= fullConfig.extractionThreshold) {
          pendingExtraction = true
          
          console.log('🏥 [SOAP Auto-Extraction] Starting with', medicalCount, 'medical messages')
          
          // Iniciar extracción
          store.dispatch(startSOAPExtraction())
          
          try {
            // Extraer SOAP análisis  
            const { analysis, quality } = await extractSOAPFromMessages(
              dashboardMessages,
              sessionId
            )
            
            // Guardar análisis exitoso
            store.dispatch(extractionSuccess({ analysis, quality }))
            
            // Actualizar calidad
            store.dispatch(updateAnalysisQuality({
              qualityScore: quality,
              totalMessages: medicalCount
            }))
            
            console.log('✅ [SOAP Auto-Extraction] Success:', {
              confidence: Math.round(analysis.confidence * 100) + '%',
              quality: Math.round(quality * 100) + '%',
              completion: analysis.completionPercentage + '%',
              sections: {
                subjective: !!analysis.subjective,
                objective: !!analysis.objective,
                assessment: !!analysis.assessment,
                plan: !!analysis.plan
              }
            })
            
          } catch (error) {
            console.error('❌ [SOAP Auto-Extraction] Failed:', error)
            store.dispatch(extractionError(error instanceof Error ? error.message : 'Unknown error'))
          } finally {
            pendingExtraction = false
          }
        }
      }
      
      return result
    }
}

// 🎯 MIDDLEWARE CON CONFIGURACIÓN DEFAULT
export const medicalSyncMiddleware = createMedicalSyncMiddleware()

// 🔧 CONFIGURACIONES PREDEFINIDAS
export const medicalSyncConfigs = {
  // Configuración para desarrollo - más logging
  development: {
    autoSOAPExtraction: true,
    syncBetweenCores: true,
    extractionThreshold: 2, // Menos mensajes para testing
    syncDebounceMs: 500
  },
  
  // Configuración para producción - optimizada
  production: {
    autoSOAPExtraction: true,
    syncBetweenCores: true,  
    extractionThreshold: 4, // Más mensajes para mayor calidad
    syncDebounceMs: 2000
  },
  
  // Configuración para testing - sin auto-extracción
  testing: {
    autoSOAPExtraction: false,
    syncBetweenCores: false,
    extractionThreshold: 10,
    syncDebounceMs: 0
  }
}

// 🚀 FACTORY FUNCTIONS
export const createDevelopmentMiddleware = () => 
  createMedicalSyncMiddleware(medicalSyncConfigs.development)

export const createProductionMiddleware = () =>
  createMedicalSyncMiddleware(medicalSyncConfigs.production)

export const createTestingMiddleware = () =>
  createMedicalSyncMiddleware(medicalSyncConfigs.testing)

