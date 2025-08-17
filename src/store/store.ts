// src/store/store.ts
// Creado por Bernard Orozco
import { configureStore } from '@reduxjs/toolkit'
import chatReducer from './chatSlice'
import decisionsReducer from './decisionsSlice'
import agentCircuitBreakersReducer from './agentCircuitBreakers'

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    decisions: decisionsReducer,
    agentCircuitBreakers: agentCircuitBreakersReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch