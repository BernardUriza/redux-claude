// src/store/store.ts
// Sistema Cognitivo Médico - Bernard Orozco
import { configureStore } from '@reduxjs/toolkit'
import chatReducer from './chatSlice'
import cognitiveReducer from './cognitiveSlice'
import agentCircuitBreakersReducer from './agentCircuitBreakers'

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    cognitive: cognitiveReducer,
    agentCircuitBreakers: agentCircuitBreakersReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch