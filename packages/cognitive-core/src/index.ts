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
export {
  validateMedicalInput,
  generateRejectionMessage,
} from './utils/aiMedicalValidator'
export type { AIValidationResult } from './utils/aiMedicalValidator'
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

// === CRITICAL PATTERN MIDDLEWARE (WIDOW MAKER DETECTION) ===
export {
  criticalPatternMiddleware,
  CriticalPatternMiddleware,
  type CriticalPattern,
  type CriticalPatternResult,
} from './middleware/CriticalPatternMiddleware'

// === HOOKS MULTINÚCLEO ===
// NOTE: Hooks only work in client components. Import directly when needed:
// import { useMedicalChat } from '@redux-claude/cognitive-core/dist/hooks/useMedicalChatEvolved'
// import { useAssistantChat } from '@redux-claude/cognitive-core/dist/hooks/useAssistantChat'
// export { useMedicalChat } from './hooks/useMedicalChatEvolved'
// export { useAssistantChat } from './hooks/useAssistantChat'

// === SOAP PROCESSING ===
export { SOAPResolver } from './soap/SOAPResolver'
export { SOAPProcessor } from './soap/SOAPProcessor'
export type { SOAPResult, SOAPSection, AgentPersonalityResult } from './soap/SOAPResolver'

// === ITERATIVE ENGINE ===
export { IterativeDiagnosticEngine } from './engine/IterativeDiagnosticEngine'

// === MEDICAL TYPES ===
export type { MedicalMessage, ChatCore, MedicalChatState } from './store/medicalChatSlice'
export type {
  MedicalExtractionOutput,
  MedicalExtractionState,
  UpdateDemographicsPayload,
  UpdateSymptomsPayload,
  UpdateContextPayload,
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
  // addInferenceMessage eliminado - ya no existe inference core
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
  resetSession,
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
export { extractMedicalDataThunk, continueExtractionThunk } from './store/extractionThunks'

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
export { AGENT_REGISTRY } from './services/agent-registry'

// === INTELLIGENT CHAT SERVICE ===

// === DECISIONAL MIDDLEWARE ===
export { callClaudeForDecision, processReduxBrainMessage } from './services/decisional-middleware'
export type { DecisionType, ReduxBrainSession } from './services/decisional-middleware'

// === REDUX BRAIN HOOK (NPM READY) ===
export { useReduxBrain } from './hooks/useReduxBrain'
export type { ReduxBrainMessage, UseReduxBrainOptions } from './hooks/useReduxBrain'

// === ADDITIONAL INFO SERVICE ===
