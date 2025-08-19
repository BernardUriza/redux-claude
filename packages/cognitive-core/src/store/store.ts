// Store básico - Bernard Orozco
import { configureStore } from '@reduxjs/toolkit'

const basicSlice = {
  name: 'basic',
  initialState: { value: 0 },
  reducers: {}
}

export const store = configureStore({
  reducer: {
    basic: (state = basicSlice.initialState) => state
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch