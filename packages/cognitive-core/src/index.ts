// 🧠 Cognitive Core MULTINÚCLEO - API Pública 
// Creado por Bernard Orozco + Gandalf el Blanco

// === DECISION ENGINE (CORE) ===
import { decisionEngineService } from './decision-engine/DecisionEngineService'
export { decisionEngineService }

// === STORE & STATE MULTINÚCLEO ===
export { store } from './store/store'
export type { RootState, AppDispatch } from './store/store'

// === ADAPTERS ===
export { ClaudeAdapter } from './decision-engine/providers/claude'

// === VALIDATORS ===
export { MedicalContentValidator, MedicalQualityValidator } from './utils/medicalValidator'
export type { BasicMedicalValidationResult } from './utils/medicalValidator'
export type { MedicalValidationResult } from './types/medical'

// === MEDICINA DEFENSIVA (FASE 3) ===
export { DefensiveMedicineValidator, type UrgentPattern, type DefensiveDiagnosis } from './validators'
export { UrgencyClassifier, type UrgencyAssessment, type TriageResult, type RiskFactor } from './classifiers'

// === HOOKS MULTINÚCLEO ===
export { useMedicalChat } from './hooks/useMedicalChatEvolved'

// === SOAP PROCESSING ===
export { SOAPResolver } from './soap/SOAPResolver'
export { SOAPProcessor } from './soap/SOAPProcessor'
export type { SOAPResult, SOAPSection, AgentPersonalityResult } from './soap/SOAPResolver'

// === ITERATIVE ENGINE ===
export { IterativeDiagnosticEngine } from './engine/IterativeDiagnosticEngine'
export { AdditionalInfoService } from './services/AdditionalInfoService'

// === MEDICAL TYPES ===
export type { 
  MedicalMessage,
  ChatCore,
  MedicalChatState
} from './store/medicalChatSlice'

export type { 
  MedicalCase, 
  SOAPData,
  SOAPAnalysis,
  DiagnosticCycle, 
  AdditionalInfoRequest, 
  DiagnosticResult 
} from './types/medical'

// === ACCIONES MULTINÚCLEO ===
export { 
  addDashboardMessage,
  addAssistantMessage,
  addInferenceMessage,
  setDashboardLoading,
  setAssistantLoading,
  clearDashboardMessages,
  clearAssistantMessages,
  startNewSession,
  setError,
  clearError
} from './store/medicalChatSlice'

// === STREAMING ===
export { StreamingService } from './streaming'
export type { StreamingChunk } from './streaming'

// === COGNITIVE SERVICES ===
export { AGENT_REGISTRY } from './services/agentRegistry'

// === INTELLIGENT CHAT SERVICE ===
export { IntelligentMedicalChat } from './services/IntelligentMedicalChat'
export type { IntelligentChatResponse } from './services/IntelligentMedicalChat'

// === ADDITIONAL INFO SERVICE ===
export type { InfoRequestMessage } from './services/AdditionalInfoService'