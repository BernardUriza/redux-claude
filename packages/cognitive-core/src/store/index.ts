// 🧠 Redux Store Médico
// Creado por Bernard Orozco

import { configureStore } from '@reduxjs/toolkit'
import medicalChatReducer from './medicalChatSlice'

export const createMedicalStore = () => {
  return configureStore({
    reducer: {
      medicalChat: medicalChatReducer,
    },
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignorar estos action types para optimizar performance
          ignoredActions: ['medicalChat/updateStreamingProgress'],
        },
      }),
    devTools: process.env.NODE_ENV !== 'production',
  })
}

export type MedicalStore = ReturnType<typeof createMedicalStore>
export type RootState = ReturnType<MedicalStore['getState']>
export type AppDispatch = MedicalStore['dispatch']

// Re-export del slice
export * from './medicalChatSlice'

// Store singleton para usar directamente
export const medicalStore = createMedicalStore()
