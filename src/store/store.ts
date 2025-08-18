// src/store/store.ts
// Creado por Bernard Orozco
import { configureStore } from '@reduxjs/toolkit'
import chatReducer from './chatSlice'
import decisionsReducer from './decisionsSlice'
import agentCircuitBreakersReducer from './agentCircuitBreakers'
import cognitiveReducer from './cognitiveSlice'

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    decisions: decisionsReducer,
    agentCircuitBreakers: agentCircuitBreakersReducer,
    cognitive: cognitiveReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch