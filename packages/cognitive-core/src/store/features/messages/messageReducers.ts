// 💬 Message Feature Reducers - Clean Architecture
// Creado por Bernard Orozco + Gandalf el Blanco

import type { MedicalChatState, AddMessagePayload } from '../../types/medicalChatTypes'
import { createMessage } from '../../utils/medicalChatUtils'

// 💬 Message management reducers
export const messageReducers = {
  addMessage: (state: MedicalChatState, action: { payload: AddMessagePayload & { coreId?: string } }) => {
    const { content, type, metadata, coreId = 'dashboard' } = action.payload
    
    // Create message with proper factory
    const message = createMessage(`${type}_${coreId}`, {
      content,
      type,
      metadata,
    })

    // Add to appropriate core
    if (state.cores[coreId]) {
      state.cores[coreId].messages.push(message)
    }

    // Update session stats
    state.sharedState.currentSession.messageCount += 1
    state.sharedState.lastActivity = Date.now()

    // Update core metrics
    if (state.cores[coreId]) {
      state.cores[coreId].lastActivity = Date.now()
      if (type === 'assistant') {
        state.cores[coreId].completedTasks += 1
      }
    }
  },

  updateMessage: (state: MedicalChatState, action: any) => {
    const { messageId, updates } = action.payload
    
    // Find message across all cores
    for (const core of Object.values(state.cores)) {
      const messageIndex = core.messages.findIndex(msg => msg.id === messageId)
      if (messageIndex !== -1) {
        core.messages[messageIndex] = { ...core.messages[messageIndex], ...updates }
        break
      }
    }
  },

  deleteMessage: (state: MedicalChatState, action: any) => {
    const { messageId } = action.payload
    
    // Remove from all cores
    for (const core of Object.values(state.cores)) {
      const messageIndex = core.messages.findIndex(msg => msg.id === messageId)
      if (messageIndex !== -1) {
        core.messages.splice(messageIndex, 1)
        state.sharedState.currentSession.messageCount -= 1
        break
      }
    }
  },

  clearMessages: (state: MedicalChatState, action: any) => {
    const { coreId } = action.payload
    
    if (coreId && state.cores[coreId]) {
      const messageCount = state.cores[coreId].messages.length
      state.cores[coreId].messages = []
      state.sharedState.currentSession.messageCount -= messageCount
    } else {
      // Clear all messages
      let totalCleared = 0
      for (const core of Object.values(state.cores)) {
        totalCleared += core.messages.length
        core.messages = []
      }
      state.sharedState.currentSession.messageCount -= totalCleared
    }
  },

  markMessageAsProcessed: (state: MedicalChatState, action: any) => {
    const { messageId, processingTime, confidence } = action.payload
    
    for (const core of Object.values(state.cores)) {
      const message = core.messages.find(msg => msg.id === messageId)
      if (message) {
        message.metadata = {
          ...message.metadata,
          processingTime,
          confidence,
          extractionAttempted: true,
        }
        break
      }
    }
  },
}

// 📊 Message selectors (simple, no memoization needed)
export const selectAllMessages = (state: MedicalChatState) => {
  return Object.values(state.cores)
    .flatMap(core => core.messages)
    .sort((a, b) => a.timestamp - b.timestamp)
}

export const selectMessagesByCore = (state: MedicalChatState, coreId: string) => {
  return state.cores[coreId]?.messages || []
}

export const selectLastMessage = (state: MedicalChatState) => {
  const allMessages = selectAllMessages(state)
  return allMessages[allMessages.length - 1] || null
}

export const selectMessageCount = (state: MedicalChatState) => {
  return state.sharedState.currentSession.messageCount
}

export const selectMessageById = (state: MedicalChatState, messageId: string) => {
  for (const core of Object.values(state.cores)) {
    const message = core.messages.find(msg => msg.id === messageId)
    if (message) return message
  }
  return null
}