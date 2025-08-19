// Componente de Mensaje Médico con Botón de Copiar - Creado por Bernard Orozco

'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import type { MedicalMessage } from '@redux-claude/cognitive-core'

interface MedicalMessageProps {
  message: MedicalMessage
  isStreaming?: boolean
}

export const MedicalMessageComponent = ({ message, isStreaming = false }: MedicalMessageProps) => {
  const [copied, setCopied] = useState(false)
  const [clientTimeString, setClientTimeString] = useState('')
  
  // Fix hydration mismatch by formatting timestamp only on client
  useEffect(() => {
    setClientTimeString(
      new Date(message.timestamp).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })
    )
  }, [message.timestamp])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Error copiando al portapapeles:', err)
    }
  }

  const isAssistant = message.type === 'assistant'

  return (
    <div className={`flex gap-4 p-6 ${isAssistant ? 'bg-gray-800/30' : 'bg-gray-900'} border-b border-gray-800`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isAssistant ? (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-md">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-md">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
      </div>

      {/* Contenido del mensaje */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-3">
          <h4 className="font-semibold text-white">
            {isAssistant ? 'Asistente Médico AI' : 'Doctor'}
          </h4>
          
          {/* Indicador de streaming */}
          {isStreaming && (
            <div className="flex items-center gap-2 text-sm text-blue-400">
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <span className="text-xs font-medium">Generando respuesta...</span>
            </div>
          )}

          {/* Metadata */}
          {message.confidence && (
            <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded-full">
              Confianza: {Math.round(message.confidence * 100)}%
            </span>
          )}

          {/* Timestamp */}
          <span className="text-xs text-gray-500">
            {clientTimeString || '--:--'}
          </span>
        </div>

        {/* Contenido del mensaje con Markdown */}
        <div className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white">
          <ReactMarkdown
            components={{
              h1: ({children}) => <h1 className="text-xl font-bold mb-4 text-white border-b border-gray-700 pb-2">{children}</h1>,
              h2: ({children}) => <h2 className="text-lg font-bold mb-3 text-blue-300">{children}</h2>,
              h3: ({children}) => <h3 className="text-base font-semibold mb-2 text-blue-200">{children}</h3>,
              p: ({children}) => <p className="mb-3 text-gray-300 leading-relaxed">{children}</p>,
              ul: ({children}) => <ul className="mb-3 ml-6 space-y-1">{children}</ul>,
              li: ({children}) => <li className="text-gray-300 list-disc">{children}</li>,
              strong: ({children}) => <strong className="font-semibold text-white">{children}</strong>,
              em: ({children}) => <em className="italic text-gray-400">{children}</em>,
              code: ({children}) => <code className="bg-gray-800 px-2 py-1 rounded text-sm font-mono text-blue-300">{children}</code>,
              hr: () => <hr className="my-4 border-gray-700" />,
              blockquote: ({children}) => <blockquote className="border-l-4 border-blue-500 pl-4 my-3 text-gray-400 italic">{children}</blockquote>
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Botón de copiar solo para asistente */}
        {isAssistant && message.content && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={copyToClipboard}
              className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                copied 
                  ? 'bg-green-900 text-green-300 border border-green-700' 
                  : 'bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700 hover:text-white hover:border-gray-500'
              }`}
              disabled={copied}
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  ¡Copiado!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copiar diagnóstico
                </>
              )}
            </button>
          </div>
        )}

        {/* Sección metadata expandida para mensajes del asistente */}
        {isAssistant && message.metadata && (
          <div className="mt-4 p-3 bg-gray-800 border border-gray-700 rounded-lg">
            <div className="text-xs text-blue-400 font-medium mb-2">Información del análisis:</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {message.metadata.sectionType && (
                <div>
                  <span className="font-medium text-gray-400">Tipo:</span>
                  <span className="ml-1 text-gray-300 capitalize">{message.metadata.sectionType}</span>
                </div>
              )}
              {message.metadata.sessionId && (
                <div>
                  <span className="font-medium text-gray-400">Sesión:</span>
                  <span className="ml-1 text-gray-300 font-mono text-xs">{message.metadata.sessionId.slice(-8)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}