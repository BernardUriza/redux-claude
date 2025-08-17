// src/store/chatSlice.ts
// Creado por Bernard Orozco
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ChatState {
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
  isLoading: boolean
  error: string | null
}

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  error: null
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addUserMessage: (state, action: PayloadAction<string>) => {
      state.messages.push({
        role: 'user',
        content: action.payload
      })
      state.isLoading = true
      state.error = null
    },
    addAssistantMessage: (state, action: PayloadAction<string>) => {
      state.messages.push({
        role: 'assistant',
        content: action.payload
      })
      state.isLoading = false
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.isLoading = false
    },
    clearChat: (state) => {
      state.messages = []
      state.error = null
    }
  }
})

export const { addUserMessage, addAssistantMessage, setError, clearChat } = chatSlice.actions
export default chatSlice.reducer