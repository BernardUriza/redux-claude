// src/hooks/useClaudeChat.ts
// Creado por Bernard Orozco
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/store/store'
import { addUserMessage, addAssistantMessage, setError } from '@/store/chatSlice'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_CLAUDE_API_KEY!,
  // IMPORTANTE: En producción, usar route handler para no exponer API key
  dangerouslyAllowBrowser: true 
})

export const useClaudeChat = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { messages, isLoading, error } = useSelector((state: RootState) => state.chat)

  const sendMessage = async (message: string) => {
    // 1. Agregar mensaje del usuario al store
    dispatch(addUserMessage(message))

    try {
      // 2. Llamar a Claude API
      const response = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307', // Modelo más económico
        max_tokens: 1024,
        messages: [
          ...messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          { role: 'user', content: message }
        ]
      })

      // 3. Agregar respuesta al store
      const assistantMessage = response.content[0].type === 'text' 
        ? response.content[0].text 
        : 'No se pudo procesar la respuesta'
      
      dispatch(addAssistantMessage(assistantMessage))
    } catch (error) {
      dispatch(setError('Error al conectar con Claude'))
      console.error(error)
    }
  }

  return {
    messages,
    isLoading,
    error,
    sendMessage
  }
}