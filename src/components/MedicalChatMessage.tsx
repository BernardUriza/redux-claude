// 💬 Componente de Mensaje Médico - Principio de Responsabilidad Única
// Creado por Bernard Orozco - Solo renderiza mensajes, sin lógica de negocio

import React from 'react'
import ReactMarkdown from 'react-markdown'
import type { MedicalMessage } from '../../packages/cognitive-core/src/store/medicalChatSlice'

interface MedicalChatMessageProps {
  message: MedicalMessage
  className?: string
}

/**
 * Componente de presentación puro para mensajes del chat médico
 * Aplica Principio de Responsabilidad Única - solo renderiza UI
 */
export const MedicalChatMessage: React.FC<MedicalChatMessageProps> = ({
  message,
  className = '',
}) => {
  const isUser = message.type === 'user'
  const isAssistant = message.type === 'assistant'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${className}`}>
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          isUser
            ? 'bg-blue-600 text-white border border-blue-500'
            : 'bg-gray-800 text-gray-200 border border-gray-700'
        }`}
      >
        {isAssistant && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🏥</span>
            <span className="text-xs font-semibold text-gray-400">Asistente IA</span>
          </div>
        )}

        <div className="text-sm prose prose-invert prose-sm max-w-none">
          <ReactMarkdown
            components={{
              // Bullets
              ul: ({ children }) => <ul className="list-disc ml-4 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal ml-4 space-y-1">{children}</ol>,
              li: ({ children }) => <li className="text-gray-200">{children}</li>,
              // Bold
              strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
              // Headings
              h1: ({ children }) => <h1 className="text-lg font-bold text-white mb-2">{children}</h1>,
              h2: ({ children }) => <h2 className="text-base font-bold text-white mb-1">{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-bold text-white mb-1">{children}</h3>,
              // Paragraphs
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        <p className="text-xs opacity-70 mt-1">
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>

        {/* Confidence property removed from MedicalMessage type */}
        {/* {message.confidence && (
          <div className="mt-1">
            <span className="text-xs bg-gray-700 text-cyan-400 px-2 py-0.5 rounded">
              {Math.round(message.confidence * 100)}% confianza
            </span>
          </div>
        )} */}
      </div>
    </div>
  )
}

export default MedicalChatMessage
