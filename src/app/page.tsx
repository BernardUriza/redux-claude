// src/app/page.tsx
// Creado por Bernard Orozco
'use client'

import { useState, useEffect, useRef } from 'react'
import { useClaudeChat } from '@/hooks/useClaudeChat'

// Componente Avatar
const Avatar = ({ type, className }: { type: 'user' | 'assistant'; className?: string }) => {
  const avatarContent = type === 'user' ? '🧙‍♂️' : '🤖'
  const bgColor = type === 'user' ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-purple-500 to-purple-600'
  
  return (
    <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center text-white text-lg font-bold shadow-lg ${className || ''}`}>
      {avatarContent}
    </div>
  )
}

// Componente Indicador de Escritura
const TypingIndicator = () => (
  <div className="flex items-center space-x-3 p-3">
    <Avatar type="assistant" />
    <div className="bg-white border border-gray-200 shadow-lg rounded-2xl px-4 py-3">
      <div className="flex space-x-1">
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
      </div>
    </div>
  </div>
)

export default function Home() {
  const [input, setInput] = useState('')
  const { messages, isLoading, error, sendMessage, clearChatHistory } = useClaudeChat()
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
    <div className="min-h-screen p-6" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #dbeafe 50%, #e0e7ff 100%)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2" style={{ 
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Chat con Claude ✨
          </h1>
          <p className="text-gray-600 text-xl">
            Creado por <span className="font-bold text-blue-600">Bernard Orozco</span>
          </p>
          <div className="flex justify-center items-center mt-4 space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500 font-medium">Conectado a Claude API</span>
            </div>
            {messages.length > 0 && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  <div className="text-amber-500">🩺</div>
                  <span className="text-xs text-amber-700 font-medium">Conversación Demo Médica</span>
                </div>
                <button
                  onClick={clearChatHistory}
                  className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 transition-colors flex items-center space-x-2"
                >
                  <span>🗑️</span>
                  <span>Nueva Conversación</span>
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Chat Container */}
        <div className="bg-white bg-opacity-80 backdrop-blur-sm border border-gray-200 border-opacity-50 shadow-2xl rounded-3xl p-8 h-[650px] overflow-y-auto mb-6" style={{ 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
        }}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-8xl mb-6">🌟</div>
              <h2 className="text-gray-600 text-2xl mb-3 font-semibold">¡Bienvenido al Chat con Claude!</h2>
              <p className="text-gray-400 text-lg">Escribe algo para comenzar la conversación mágica...</p>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`mb-6 flex items-start space-x-4 fade-in-up ${
                    msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <Avatar type={msg.role} />
                  <div className={`max-w-[75%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                    <div className={`p-5 rounded-3xl shadow-lg transform hover:scale-105 transition-all duration-200 ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md shadow-blue-200' 
                        : 'bg-white border border-gray-200 rounded-bl-md shadow-gray-200'
                    }`}>
                      <p className="whitespace-pre-wrap leading-relaxed text-base">
                        {msg.content}
                      </p>
                    </div>
                    <div className={`text-xs text-gray-400 mt-2 font-medium ${
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
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-4 fade-in-up shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="text-red-500 text-xl">⚠️</div>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="bg-white bg-opacity-90 backdrop-blur-sm shadow-2xl border border-gray-200 border-opacity-50 rounded-3xl p-6" style={{ 
          boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.2)' 
        }}>
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu mensaje mágico aquí... ✨"
                className="w-full p-5 pr-14 bg-transparent border-0 outline-none text-gray-800 placeholder-gray-400 text-lg font-medium"
                disabled={isLoading}
              />
              {input && (
                <button
                  type="button"
                  onClick={() => setInput('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-lg font-bold"
                >
                  ✕
                </button>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg px-8 py-5 text-white rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${
                isLoading ? 'animate-pulse' : ''
              }`}
              style={{ boxShadow: '0 10px 20px rgba(59, 130, 246, 0.3)' }}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <span>Enviar</span>
                  <div className="text-xl">🚀</div>
                </>
              )}
            </button>
          </div>
        </form>
        
        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p className="font-medium">Powered by Claude API • Desarrollado con 💙 por Bernard Orozco</p>
        </div>
      </div>
    </div>
  )
}