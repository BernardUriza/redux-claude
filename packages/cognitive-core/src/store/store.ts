// 🧠 Store Médico Multinúcleo - Creado por Bernard Orozco
import { configureStore } from '@reduxjs/toolkit'
import medicalChatReducer from './medicalChatSlice'
import intelligentChatReducer from './intelligentChatSlice'

export const store = configureStore({
  reducer: {
    medicalChat: medicalChatReducer,
    intelligentChat: intelligentChatReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['medicalChat/startStreaming', 'medicalChat/updateStreamingProgress']
      }
    })
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch