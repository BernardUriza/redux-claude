// 🧠 Store Médico Multinúcleo EVOLUCIONADO - Creado por Bernard Orozco + Gandalf el Blanco
import { configureStore } from '@reduxjs/toolkit'
import medicalChatReducer from './medicalChatSlice'

export const store = configureStore({
  reducer: {
    medicalChat: medicalChatReducer,
    // 🔥 ELIMINADO: intelligentChat (ahora es cores.assistant)
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['medicalChat/startStreaming', 'medicalChat/updateStreamingProgress'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
