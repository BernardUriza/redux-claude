// 💬 Componente de Mensaje Médico - Principio de Responsabilidad Única
// Creado por Bernard Orozco - Solo renderiza mensajes, sin lógica de negocio

import React from 'react'
import type { MedicalMessage } from '../../packages/cognitive-core/src/store/medicalChatSlice'

interface MedicalChatMessageProps {
  message: MedicalMessage
  className?: string
}

// Simple markdown parser for medical messages
const parseMarkdown = (text: string) => {
  const lines = text.split('\n')
  const elements: JSX.Element[] = []
  let key = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Skip empty lines
    if (!line.trim()) {
      elements.push(<div key={key++} className="h-2" />)
      continue
    }

    // Bold sections (**text**)
    if (line.includes('**')) {
      const parts = line.split('**')
      const rendered = parts.map((part, idx) => {
        if (idx % 2 === 1) {
          return <strong key={idx} className="font-bold text-white">{part}</strong>
        }
        return <span key={idx}>{part}</span>
      })
      elements.push(<p key={key++} className="mb-1">{rendered}</p>)
      continue
    }

    // Bullets (• or - at start)
    if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
      const content = line.trim().substring(1).trim()
      elements.push(
        <div key={key++} className="flex gap-2 ml-2 mb-1">
          <span className="text-cyan-400">•</span>
          <span className="flex-1">{content}</span>
        </div>
      )
      continue
    }

    // Regular paragraph
    elements.push(<p key={key++} className="mb-1">{line}</p>)
  }

  return elements
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

        <div className="text-sm max-w-none">
          {parseMarkdown(message.content)}
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
