// src/app/page.tsx
// Creado por Bernard Orozco
'use client'

import { useState, useEffect, useRef } from 'react'
import { useClaudeChat } from '@/hooks/useClaudeChat'

// Componente Avatar
const Avatar = ({ type, className }: { type: 'user' | 'assistant'; className?: string }) => {
  const avatarContent = type === 'user' ? '🧙‍♂️' : '🤖'
  const bgColor = type === 'user' ? 'bg-blue-500' : 'bg-purple-500'
  
  return (
    <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center text-white text-sm font-bold shadow-lg ${className || ''}`}>
      {avatarContent}
    </div>
  )
}

// Componente Indicador de Escritura
const TypingIndicator = () => (
  <div className="flex items-center space-x-2 p-3">
    <Avatar type="assistant" />
    <div className="chat-bubble-assistant rounded-lg px-4 py-2">
      <div className="typing-indicator">
        <div className="typing-dot" style={{ animationDelay: '0ms' }}></div>
        <div className="typing-dot" style={{ animationDelay: '150ms' }}></div>
        <div className="typing-dot" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  </div>
)

export default function Home() {
  const [input, setInput] = useState('')
  const { messages, isLoading, error, sendMessage } = useClaudeChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      sendMessage(input)
      setInput('')
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header mejorado */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Chat con Claude ✨
          </h1>
          <p className="text-gray-600 text-lg">
            Creado por <span className="font-semibold text-blue-600">Bernard Orozco</span>
          </p>
          <div className="flex justify-center items-center mt-4 space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-500">Conectado a Claude API</span>
          </div>
        </div>
        
        {/* Contenedor del Chat mejorado */}
        <div className="chat-container rounded-2xl p-6 h-[600px] overflow-y-auto mb-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-6xl mb-4">🌟</div>
              <p className="text-gray-500 text-lg mb-2">¡Bienvenido al Chat con Claude!</p>
              <p className="text-gray-400">Escribe algo para comenzar la conversación...</p>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`mb-4 flex items-start space-x-3 fade-in-up ${
                    msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <Avatar type={msg.role} />
                  <div className={`max-w-[70%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                    <div className={`p-4 rounded-2xl ${
                      msg.role === 'user' 
                        ? 'chat-bubble-user rounded-br-md' 
                        : 'chat-bubble-assistant rounded-bl-md'
                    }`}>
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </p>
                    </div>
                    <div className={`text-xs text-gray-400 mt-1 ${
                      msg.role === 'user' ? 'text-right' : 'text-left'
                    }`}>
                      {msg.role === 'user' ? 'Tú' : 'Claude'} • ahora
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && <TypingIndicator />}
            </>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 fade-in-up">
              <div className="flex items-center space-x-2">
                <div className="text-red-500">⚠️</div>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input mejorado */}
        <form onSubmit={handleSubmit} className="input-container rounded-2xl p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu mensaje mágico aquí... ✨"
                className="w-full p-4 pr-12 bg-transparent border-0 outline-none text-gray-800 placeholder-gray-400 text-lg"
                disabled={isLoading}
              />
              {input && (
                <button
                  type="button"
                  onClick={() => setInput('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`send-button px-6 py-4 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${
                isLoading ? 'pulse-gentle' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <span>Enviar</span>
                  <div className="text-lg">🚀</div>
                </>
              )}
            </button>
          </div>
        </form>
        
        {/* Footer elegante */}
        <div className="text-center mt-6 text-gray-400 text-sm">
          <p>Powered by Claude API • Desarrollado con 💙 por Bernard Orozco</p>
        </div>
      </div>
    </div>
  )
}