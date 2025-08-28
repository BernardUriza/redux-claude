// 🧠 Cognitive Core MULTINÚCLEO - API Pública
// Creado por Bernard Orozco + Gandalf el Blanco

// === DECISION ENGINE (CORE) ===
import { decisionEngineService } from './decision-engine/DecisionEngineService'
export { decisionEngineService }

// === STORE & STATE MULTINÚCLEO ===
export { store, persistor, setupStore } from './store/store'
export type { RootState, AppDispatch, AppThunk, AppStore, AppState } from './store/store'
export { useAppDispatch, useAppSelector, useTypedSelector, useTypedDispatch } from './store/hooks'

// === ADAPTERS ===
export { ClaudeAdapter } from './decision-engine/providers/claude'

// === VALIDATORS ===
export { validateMedicalInput, validateMedicalCase, generateRejectionMessage } from './utils/aiMedicalValidator'
export type { AIValidationResult, LegacyMedicalValidationResult } from './utils/aiMedicalValidator'
export type { MedicalValidationResult } from './types/medical'

// === MEDICINA DEFENSIVA (FASE 3) ===
export {
  DefensiveMedicineValidator,
  type UrgentPattern,
  type DefensiveDiagnosis,
} from './validators'
export {
  UrgencyClassifier,
  type UrgencyAssessment,
  type TriageResult,
  type RiskFactor,
} from './classifiers'

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
export type { MedicalMessage, ChatCore, MedicalChatState } from './store/medicalChatSlice'
export type { 
  MedicalExtractionOutput, 
  MedicalExtractionState, 
  UpdateDemographicsPayload, 
  UpdateSymptomsPayload, 
  UpdateContextPayload 
} from './types/medicalExtraction'

export type {
  MedicalCase,
  SOAPData,
  SOAPAnalysis,
  DiagnosticCycle,
  AdditionalInfoRequest,
  DiagnosticResult,
} from './types/medical'

// === ACCIONES MULTINÚCLEO + EXTRACCIÓN MÉDICA ===
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
  clearError,
  // 🧬 Nuevas acciones de extracción médica (2025)
  updateDemographics,
  updateSymptoms,
  updateContext,
  updateCompleteness,
  startExtractionProcess,
  completeExtraction,
  incrementIteration,
  setExtractionError,
  clearExtractionData,
  resetExtractionForNewSession,
} from './store/medicalChatSlice'

// === SELECTORS MEMOIZADOS ===
export {
  selectExtractedData,
  selectExtractionProcess,
  selectWipData,
  selectCompletenessPercentage,
  selectMissingCriticalFields,
  selectNOMCompliance,
  selectReadyForSOAP,
  selectExtractionSummary,
  selectExtractionHistory,
  selectFieldCompleteness,
  selectExtractionProgress,
  selectFocusAreas,
} from './store/medicalChatSlice'

// === ASYNC THUNKS ===
export {
  extractMedicalDataThunk,
  continueExtractionThunk,
} from './store/medicalChatSlice'

// === HOOKS ===
export { useIterativeMedicalExtraction } from './hooks/useIterativeMedicalExtraction'

// === UTILITIES ===
export {
  checkCompleteness,
  getCompletenessDetails,
  shouldContinueExtraction,
  generateFollowUpQuestions,
} from './utils/completenessChecker'

export {
  validateExtraction,
  checkStopConditions,
  type ValidationResult,
  type ValidationIssue,
  type StopCondition,
  type ValidationRecommendation,
} from './utils/extractionValidation'

export {
  calculateCompleteness,
  isNOMCompliant,
  MEDICAL_CONFIDENCE_THRESHOLDS,
  NOM_REQUIRED_FIELDS,
} from './types/medicalExtraction'

// === PROMPT GENERATOR ===
export {
  generateMedicalPrompt,
  generateStomachPainPrompt,
  autoFillInput,
  type GeneratedPrompt,
} from './utils/promptGenerator'

// === STREAMING ===
export { StreamingService } from './streaming'
export type { StreamingChunk } from './streaming'

// === COGNITIVE SERVICES ===
export { AGENT_REGISTRY } from './services/agentRegistry'

// === INTELLIGENT CHAT SERVICE ===
export { IntelligentMedicalChat } from './services/IntelligentMedicalChat'
export type { IntelligentChatResponse } from './services/IntelligentMedicalChat'

// === DECISIONAL MIDDLEWARE ===
export { callClaudeForDecision } from './services/decisionalMiddleware'
export type { DecisionType } from './services/decisionalMiddleware'

// === ADDITIONAL INFO SERVICE ===
export type { InfoRequestMessage } from './services/AdditionalInfoService'
