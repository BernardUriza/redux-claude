import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore, createSlice } from '@reduxjs/toolkit'

// Mock medical chat slice for testing
const mockMedicalChatSlice = createSlice({
  name: 'medicalChat',
  initialState: {
    cores: {
      dashboardCore: {
        messages: [],
        isLoading: false,
      },
    },
  },
  reducers: {
    addMessage: (state, action) => {
      state.cores.dashboardCore.messages.push(action.payload)
    },
    setLoading: (state, action) => {
      state.cores.dashboardCore.isLoading = action.payload
    },
  },
})

// Mock store for testing
const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      medicalChat: mockMedicalChatSlice.reducer,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  })
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: any
  store?: ReturnType<typeof createTestStore>
}

// Custom render function with Redux Provider
const customRender = (
  ui: ReactElement,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions })
  }
}

export * from '@testing-library/react'
export { customRender as render }
export { createTestStore }