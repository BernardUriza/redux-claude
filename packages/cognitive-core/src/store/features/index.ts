// 🏗️ Features Barrel Export - Clean Architecture Entry Point  
// Creado por Bernard Orozco + Gandalf el Blanco

// 🔬 Extraction Domain
export * from './extraction/extractionReducers'

// 💬 Messages Domain  
export * from './messages/messageReducers'

// 📊 Selectors organized by domain
export * from '../selectors/extractionSelectors'

// 🔧 Utilities
export * from '../utils/medicalChatUtils'

// 🏷️ Types
export * from '../types/medicalChatTypes'