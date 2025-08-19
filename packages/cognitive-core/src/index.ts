// 🧠 Cognitive Core - API Pública Completa
// Creado por Bernard Orozco

// === DECISION ENGINE (CORE) ===
import { decisionEngineService } from './decision-engine/DecisionEngineService'
export { decisionEngineService }

// === STORE & STATE ===
export { store } from './store/store'
export type { RootState, AppDispatch } from './store/store'

// === ADAPTERS ===
export { ClaudeAdapter } from './decision-engine/providers/claude'

// === VALIDATORS ===
export { MedicalContentValidator } from './utils/medicalValidator'
export type { MedicalValidationResult } from './utils/medicalValidator'

// === HOOKS ===
export { useMedicalChat } from './hooks/useMedicalChat'

// === SOAP PROCESSING ===
export { SOAPResolver } from './soap/SOAPResolver'
export type { SOAPResult, SOAPSection, AgentPersonalityResult } from './soap/SOAPResolver'

// === MEDICAL TYPES ===
export type { MedicalMessage } from './store/medicalChatSlice'

// === STREAMING ===
export { StreamingService } from './streaming'
export type { StreamingChunk } from './streaming'

// === CONFIGURACIÓN RÁPIDA ===
export interface CognitiveCoreConfig {
  claudeApiKey?: string
  environment?: 'development' | 'production'
  locale?: 'es' | 'en'
  medicalDomain?: boolean
}

/**
 * Inicialización rápida del Cognitive Core
 */
export function initializeCognitiveCore(config: CognitiveCoreConfig = {}) {
  const {
    claudeApiKey = process.env.NEXT_PUBLIC_CLAUDE_API_KEY,
    environment = 'development',
    locale = 'es',
    medicalDomain = true
  } = config
  
  return {
    decisionEngine: decisionEngineService,
    config: {
      environment,
      locale,
      medicalDomain,
      hasClaudeApi: Boolean(claudeApiKey)
    }
  }
}