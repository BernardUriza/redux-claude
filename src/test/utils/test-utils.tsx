import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { MedicalMessage } from '@redux-claude/cognitive-core'

// Define the state shape
interface DashboardCore {
  messages: MedicalMessage[]
  isLoading: boolean
  lastActivity: number
  sessionId: string
  completedTasks: number
}

interface MedicalChatState {
  cores: {
    dashboard: DashboardCore
  }
}

// Mock medical chat slice for testing
const mockMedicalChatSlice = createSlice({
  name: 'medicalChat',
  initialState: {
    cores: {
      dashboard: {
        messages: [],
        isLoading: false,
        lastActivity: Date.now(),
        sessionId: 'test-session',
        completedTasks: 0,
      },
    },
  } as MedicalChatState,
  reducers: {
    addMessage: (state, action: PayloadAction<MedicalMessage>) => {
      state.cores.dashboard.messages.push(action.payload)
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.cores.dashboard.isLoading = action.payload
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
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  })
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Record<string, unknown>
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
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  }
}

export * from '@testing-library/react'
export { customRender as render }
export { createTestStore }
