// 🧠 useReduxBrain Hook - Simple interface for any Next.js app
// Install: npm install @redux-claude/cognitive-core
// Usage: const { sendMessage, messages, isLoading } = useReduxBrain()

import { useState, useCallback, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'

export interface ReduxBrainMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  urgencyLevel?: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'
  soapProgress?: number
  soapState?: {
    subjetivo?: string
    objetivo?: string
    analisis?: string
    plan?: string
  }
}

export interface UseReduxBrainOptions {
  apiEndpoint?: string
  sessionId?: string
  onError?: (error: Error) => void
}

export function useReduxBrain(options: UseReduxBrainOptions = {}) {
  const {
    apiEndpoint = '/api/redux-brain/',
    sessionId = useRef(`session-${uuidv4()}`).current,
    onError
  } = options

  const [messages, setMessages] = useState<ReduxBrainMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastResponse, setLastResponse] = useState<any>(null)

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    // Add user message
    const userMessage: ReduxBrainMessage = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          message: content
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setLastResponse(data)

      if (data.success) {
        // Add assistant message with all metadata
        const assistantMessage: ReduxBrainMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
          urgencyLevel: data.urgencyAssessment?.level,
          soapProgress: data.sessionData?.soapProgress,
          soapState: data.soapState
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        throw new Error(data.error || 'API response indicates failure')
      }
    } catch (error) {
      console.error('Redux Brain Error:', error)

      if (onError) {
        onError(error as Error)
      } else {
        // Default error message
        const errorMessage: ReduxBrainMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: 'Error: Unable to process your request. Please try again.',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } finally {
      setIsLoading(false)
    }
  }, [sessionId, apiEndpoint, isLoading, onError])

  const clearMessages = useCallback(() => {
    setMessages([])
    setLastResponse(null)
  }, [])

  const getSOAPProgress = useCallback(() => {
    return lastResponse?.sessionData?.soapProgress || 0
  }, [lastResponse])

  const getUrgencyLevel = useCallback(() => {
    return lastResponse?.urgencyAssessment?.level || 'LOW'
  }, [lastResponse])

  return {
    // Core functionality
    sendMessage,
    messages,
    isLoading,

    // Session info
    sessionId,

    // Utilities
    clearMessages,
    getSOAPProgress,
    getUrgencyLevel,

    // Full response for advanced usage
    lastResponse
  }
}

// Export types for external use
export type { ReduxBrainSession } from '../services/decisional-middleware'