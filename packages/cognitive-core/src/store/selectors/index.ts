// 🎯 BARREL EXPORTS - SELECTORES MÉDICOS MULTINÚCLEO
// Creado por Bernard Orozco + Gandalf el Blanco

// === SELECTORES PRINCIPALES ===
export {
  selectCurrentSOAPAnalysis,     // 🏥 Destructor de mockCurrentCase
  selectSystemMetrics,          // 📊 Aniquilador de confidence = 85
  selectDiagnosticProgress,     // 🔄 Eliminador de mockIterativeState  
  selectPatientReminders,       // 📋 Destructor de mockReminders: []
  selectPhysicianNotes         // 📝 Aniquilador de mockNotes: []
} from './medicalSelectors'

// === TIPOS MÉDICOS ===
export type {
  SOAPAnalysis,
  SystemMetrics,
  DiagnosticProgress,
  PatientReminder,
  PhysicianNote,
  CoreMetrics,
  DiagnosticPhase,
  ReminderType,
  ReminderPriority,
  NoteCategory,
  MedicalSpecialty,
  LegacyMockCase,
  LegacyMetrics,
  LegacyIterativeState
} from '../../types/medicalInterfaces'

// === FUNCIONES DE UTILIDAD ===
export {
  createEmptySOAPAnalysis,
  createEmptySystemMetrics,
  createEmptyDiagnosticProgress,
  createEmptyReminders,
  createEmptyNotes,
  transformToLegacyFormat,
  transformToLegacyMetrics,
  transformToLegacyIterative
} from '../../types/medicalInterfaces'

// === SLICE SOAP ===
export {
  default as soapAnalysisReducer,
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
  selectSOAPAnalysisState,
  selectSOAPExtractionStatus,
  selectSOAPHistory
} from '../slices/soapAnalysisSlice'

export type { SOAPAnalysisState } from '../slices/soapAnalysisSlice'