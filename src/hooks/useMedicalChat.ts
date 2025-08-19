// Hook Médico con Streaming Real - Creado por Bernard Orozco

'use client'

import { useCallback, useState } from 'react'
import { ClaudeAdapter } from '@redux-claude/cognitive-core'

export interface MedicalMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: number
  isStreaming?: boolean
}

export const useMedicalChat = () => {
  const [messages, setMessages] = useState<MedicalMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [claudeAdapter] = useState(() => new ClaudeAdapter())

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: MedicalMessage = {
      id: `user_${Date.now()}`,
      content,
      role: 'user',
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    // Crear mensaje de respuesta para streaming
    const assistantId = `assistant_${Date.now()}`
    const assistantMessage: MedicalMessage = {
      id: assistantId,
      content: '',
      role: 'assistant',
      timestamp: Date.now(),
      isStreaming: true
    }

    setMessages(prev => [...prev, assistantMessage])

    try {
      const systemPrompt = `Eres un especialista médico. Proporciona análisis clínico profesional.
Estructura tu respuesta con:
- Diagnóstico principal
- Diagnósticos diferenciales
- Plan terapéutico
- Seguimiento requerido

Responde en español sin emojis ni metadatos del sistema.`

      // STREAMING REAL con Claude SDK
      await claudeAdapter.makeStreamingRequest(
        systemPrompt,
        content,
        undefined, // signal
        (chunk: string) => {
          // Actualizar mensaje en tiempo real
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantId 
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          )
        }
      )

      // Finalizar streaming
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantId 
            ? { ...msg, isStreaming: false }
            : msg
        )
      )

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      
      // Actualizar con error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantId 
            ? { 
                ...msg, 
                content: `Error: ${errorMessage}`, 
                isStreaming: false 
              }
            : msg
        )
      )
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, claudeAdapter])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    hasMessages: messages.length > 0,
    // Nuevo: estado de streaming
    isStreaming: messages.some(msg => msg.isStreaming)
  }
}