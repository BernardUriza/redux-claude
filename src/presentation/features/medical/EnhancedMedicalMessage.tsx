// src/components/EnhancedMedicalMessage.tsx
// Simplified Medical Message Component - Refactored by Bernard Orozco

'use client'

import ReactMarkdown from 'react-markdown'
import type { MedicalMessage } from '@redux-claude/cognitive-core'

import { MessageAvatar } from '../../../components/medical-message/MessageAvatar'
import { StreamingIndicator } from '../../../components/medical-message/StreamingIndicator'
import { SOAPBadge } from '../../../components/medical-message/SOAPBadge'
import { IterativeMetrics } from '../../../components/medical-message/IterativeMetrics'
import { AgentInsights } from '../../../components/medical-message/AgentInsights'
import { useMessageContent } from '../../../hooks'

interface MedicalMessageProps {
  message: MedicalMessage
  isStreaming?: boolean
}

const getAssistantTitle = (isSOAPAnalysis: boolean, isRejection: boolean) => {
  if (isSOAPAnalysis) return 'Sistema Médico Iterativo'
  if (isRejection) return 'Validador Médico'
  return 'Asistente Médico AI'
}

export const EnhancedMedicalMessage = ({ message, isStreaming = false }: MedicalMessageProps) => {
  const { clientTimeString, copied, copyToClipboard, isSOAPAnalysis, isRejection } =
    useMessageContent(message)

  const isAssistant = message.type === 'assistant'

  return (
    <div
      className={`flex gap-4 p-6 ${isAssistant ? 'bg-gray-800/30' : 'bg-gray-900'} border-b border-gray-800 transition-all duration-300`}
    >
      <div className="flex-shrink-0">
        <MessageAvatar
          isAssistant={isAssistant}
          isSOAPAnalysis={isSOAPAnalysis}
          isRejection={isRejection}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <h4 className="font-semibold text-white text-lg">
            {isAssistant ? getAssistantTitle(isSOAPAnalysis, isRejection) : 'Doctor'}
          </h4>

          {isStreaming && <StreamingIndicator isSOAPAnalysis={isSOAPAnalysis} />}
          {/* Confidence property removed from MedicalMessage type */}
          {/* {message.confidence && <ConfidenceIndicator confidence={message.confidence} />} */}

          {isSOAPAnalysis && (
            <div className="flex items-center space-x-1">
              <SOAPBadge section="S" />
              <SOAPBadge section="O" />
              <SOAPBadge section="A" />
              <SOAPBadge section="P" />
            </div>
          )}

          <span className="text-sm text-gray-500 ml-auto">{clientTimeString || '--:--:--'}</span>
        </div>

        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold mb-4 text-white border-b-2 border-blue-500 pb-3">
                  {children}
                </h1>
              ),
              h2: ({ children }) => {
                const text = String(children)
                if (text.includes('EXPEDIENTE CLÍNICO')) {
                  return (
                    <h2 className="text-xl font-bold mb-4 text-blue-300 bg-blue-900/20 p-3 rounded-lg border border-blue-500/30">
                      {children}
                    </h2>
                  )
                }
                if (text.includes('S - SUBJETIVO')) {
                  return (
                    <h2 className="text-lg font-bold mb-3 text-blue-300 flex items-center gap-2">
                      <SOAPBadge section="S" />
                      {children}
                    </h2>
                  )
                }
                if (text.includes('O - OBJETIVO')) {
                  return (
                    <h2 className="text-lg font-bold mb-3 text-emerald-300 flex items-center gap-2">
                      <SOAPBadge section="O" />
                      {children}
                    </h2>
                  )
                }
                if (text.includes('A - ANÁLISIS')) {
                  return (
                    <h2 className="text-lg font-bold mb-3 text-purple-300 flex items-center gap-2">
                      <SOAPBadge section="A" />
                      {children}
                    </h2>
                  )
                }
                if (text.includes('P - PLAN')) {
                  return (
                    <h2 className="text-lg font-bold mb-3 text-orange-300 flex items-center gap-2">
                      <SOAPBadge section="P" />
                      {children}
                    </h2>
                  )
                }
                return <h2 className="text-lg font-bold mb-3 text-white">{children}</h2>
              },
              h3: ({ children }) => (
                <h3 className="text-base font-semibold mb-2 text-cyan-200">{children}</h3>
              ),
              p: ({ children }) => <p className="mb-3 text-gray-300 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="mb-3 ml-6 space-y-2">{children}</ul>,
              li: ({ children }) => (
                <li className="text-gray-300 list-disc marker:text-blue-400">{children}</li>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-white bg-slate-800/50 px-1 rounded">
                  {children}
                </strong>
              ),
              em: ({ children }) => <em className="italic text-blue-300">{children}</em>,
              code: ({ children }) => (
                <code className="bg-slate-800 px-2 py-1 rounded text-sm font-mono text-cyan-300 border border-slate-600">
                  {children}
                </code>
              ),
              hr: () => <hr className="my-6 border-gray-700" />,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-blue-500 pl-6 my-4 text-gray-400 italic bg-blue-900/10 py-2 rounded-r">
                  {children}
                </blockquote>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {isSOAPAnalysis && (
          <>
            <IterativeMetrics content={message.content} />
            <AgentInsights content={message.content} />
          </>
        )}

        {isAssistant && !isStreaming && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <button
              onClick={copyToClipboard}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
              }`}
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Copiar {isSOAPAnalysis ? 'análisis SOAP' : 'mensaje'}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
