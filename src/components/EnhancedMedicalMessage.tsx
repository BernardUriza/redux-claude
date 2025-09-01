// src/components/EnhancedMedicalMessage.tsx
// Componente Mejorado de Mensaje Médico con SOAP - Creado por Bernard Orozco

'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import type { MedicalMessage } from '@redux-claude/cognitive-core'
import { CONFIDENCE_THRESHOLDS, PERFORMANCE } from '../constants/magicNumbers'

interface MedicalMessageProps {
  message: MedicalMessage
  isStreaming?: boolean
}

const SOAPBadge = ({ section }: { section: string }) => {
  const getSectionConfig = (section: string) => {
    switch (section.toUpperCase()) {
      case 'S':
        return { color: 'from-blue-500 to-cyan-500', label: 'SUBJETIVO', icon: '🗣️' }
      case 'O':
        return { color: 'from-emerald-500 to-teal-500', label: 'OBJETIVO', icon: '🔍' }
      case 'A':
        return { color: 'from-purple-500 to-indigo-500', label: 'ANÁLISIS', icon: '🧠' }
      case 'P':
        return { color: 'from-orange-500 to-yellow-500', label: 'PLAN', icon: '📋' }
      default:
        return { color: 'from-slate-500 to-gray-500', label: section, icon: '📄' }
    }
  }

  const config = getSectionConfig(section)

  return (
    <div
      className={`inline-flex items-center space-x-2 bg-gradient-to-r ${config.color} bg-opacity-20 px-3 py-1 rounded-full border border-opacity-30 mb-2`}
    >
      <span className="text-sm">{config.icon}</span>
      <span className="text-xs font-semibold text-white">{config.label}</span>
    </div>
  )
}

const ConfidenceIndicator = ({ confidence }: { confidence: number }) => {
  const getConfidenceColor = (conf: number) => {
    if (conf >= CONFIDENCE_THRESHOLDS.HIGH) return 'from-emerald-500 to-green-500'
    if (conf >= CONFIDENCE_THRESHOLDS.GOOD) return 'from-blue-500 to-cyan-500'
    if (conf >= CONFIDENCE_THRESHOLDS.MEDIUM) return 'from-yellow-500 to-orange-500'
    return 'from-red-500 to-pink-500'
  }

  const getConfidenceLabel = (conf: number) => {
    if (conf >= CONFIDENCE_THRESHOLDS.HIGH) return 'MUY ALTA'
    if (conf >= CONFIDENCE_THRESHOLDS.GOOD) return 'ALTA'
    if (conf >= CONFIDENCE_THRESHOLDS.MEDIUM) return 'MEDIA'
    return 'BAJA'
  }

  return (
    <div
      className={`inline-flex items-center space-x-2 bg-gradient-to-r ${getConfidenceColor(confidence)} bg-opacity-20 px-3 py-1 rounded-full border border-opacity-30`}
    >
      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getConfidenceColor(confidence)}`} />
      <span className="text-xs font-semibold text-white">
        {getConfidenceLabel(confidence)} ({Math.round(confidence * 100)}%)
      </span>
    </div>
  )
}

const AgentInsights = ({ content }: { content: string }) => {
  // Detect cognitive analysis section
  const cognitiveMatch = content.match(
    /## 🧠 ANÁLISIS MULTI-AGENTE COGNITIVO([\s\S]*?)(?=\n##|\n\*|$)/
  )

  if (!cognitiveMatch) return null

  const cognitiveContent = cognitiveMatch[1]
  const agentsConsulted = cognitiveContent.match(
    /\*\*🎯 Agentes Especializados Consultados:\*\* (\d+)/
  )?.[1]
  const consensus = cognitiveContent.match(/\*\*🤝 Consenso Alcanzado:\*\* (✅ SÍ|❌ NO)/)?.[1]
  const validation = cognitiveContent.match(
    /\*\*🧩 Validación Especializada:\*\* (✅ ACTIVADA|❌ NO APLICADA)/
  )?.[1]

  return (
    <div className="mt-4 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-lg">🧠</span>
        <h4 className="text-sm font-semibold text-purple-300">Orquestador Cognitivo</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {agentsConsulted && (
          <div className="text-center">
            <div className="text-lg font-bold text-white">{agentsConsulted}</div>
            <div className="text-xs text-purple-300">Agentes Consultados</div>
          </div>
        )}

        {consensus && (
          <div className="text-center">
            <div className="text-lg">{consensus.includes('SÍ') ? '✅' : '❌'}</div>
            <div className="text-xs text-purple-300">Consenso</div>
          </div>
        )}

        {validation && (
          <div className="text-center">
            <div className="text-lg">{validation.includes('ACTIVADA') ? '✅' : '❌'}</div>
            <div className="text-xs text-purple-300">Validación</div>
          </div>
        )}
      </div>
    </div>
  )
}

const IterativeMetrics = ({ content }: { content: string }) => {
  // Extract iterative metrics
  const cyclesMatch = content.match(/\*\*🔄 Ciclos Diagnósticos:\*\* (\d+)/)?.[1]
  const timeMatch = content.match(/\*\*⏱️ Tiempo Total:\*\* (\d+)ms/)?.[1]
  const confidenceMatch = content.match(/\*\*🎯 Confianza Global:\*\* (\d+)%/)?.[1]

  if (!cyclesMatch && !timeMatch && !confidenceMatch) return null

  return (
    <div className="mt-4 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20">
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-lg">📊</span>
        <h4 className="text-sm font-semibold text-blue-300">Métricas Iterativas</h4>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        {cyclesMatch && (
          <div>
            <div className="text-lg font-bold text-white">{cyclesMatch}</div>
            <div className="text-xs text-blue-300">Ciclos</div>
          </div>
        )}

        {confidenceMatch && (
          <div>
            <div className="text-lg font-bold text-white">{confidenceMatch}%</div>
            <div className="text-xs text-blue-300">Confianza</div>
          </div>
        )}

        {timeMatch && (
          <div>
            <div className="text-lg font-bold text-white">{timeMatch}ms</div>
            <div className="text-xs text-blue-300">Tiempo</div>
          </div>
        )}
      </div>
    </div>
  )
}

export const EnhancedMedicalMessage = ({ message, isStreaming = false }: MedicalMessageProps) => {
  const [copied, setCopied] = useState(false)
  const [clientTimeString, setClientTimeString] = useState('')

  // Fix hydration mismatch by formatting timestamp only on client
  useEffect(() => {
    setClientTimeString(
      new Date(message.timestamp).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    )
  }, [message.timestamp])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), PERFORMANCE.ANIMATION_DELAY)
    } catch (err) {
      console.error('Error copiando al portapapeles:', err)
    }
  }

  const isAssistant = message.type === 'assistant'
  const isSOAPAnalysis =
    message.content.includes('EXPEDIENTE CLÍNICO') || message.content.includes('### S - SUBJETIVO')

  // Detect if it's a rejection message
  const isRejection = message.content.includes('⚠️ Consulta No Válida')

  return (
    <div
      className={`flex gap-4 p-6 ${isAssistant ? 'bg-gray-800/30' : 'bg-gray-900'} border-b border-gray-800 transition-all duration-300`}
    >
      {/* Enhanced Avatar */}
      <div className="flex-shrink-0">
        {isAssistant ? (
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 ${
              isSOAPAnalysis
                ? 'bg-gradient-to-br from-purple-600 to-indigo-600'
                : isRejection
                  ? 'bg-gradient-to-br from-red-600 to-pink-600'
                  : 'bg-gradient-to-br from-blue-600 to-cyan-600'
            }`}
          >
            <span className="text-lg">{isSOAPAnalysis ? '🏥' : isRejection ? '⚠️' : '🤖'}</span>
          </div>
        ) : (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg">
            <span className="text-lg">👨‍⚕️</span>
          </div>
        )}
      </div>

      {/* Enhanced Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <h4 className="font-semibold text-white text-lg">
            {isAssistant
              ? isSOAPAnalysis
                ? 'Sistema Médico Iterativo'
                : isRejection
                  ? 'Validador Médico'
                  : 'Asistente Médico AI'
              : 'Doctor'}
          </h4>

          {/* Enhanced streaming indicator */}
          {isStreaming && (
            <div className="flex items-center gap-3 text-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <div
                  className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"
                  style={{ animationDelay: '0.4s' }}
                ></div>
              </div>
              <span className="text-blue-400 font-medium">
                {isSOAPAnalysis ? 'Generando análisis SOAP...' : 'Procesando consulta...'}
              </span>
            </div>
          )}

          {/* Enhanced metadata */}
          {message.confidence && <ConfidenceIndicator confidence={message.confidence} />}

          {/* SOAP detection */}
          {isSOAPAnalysis && (
            <div className="flex items-center space-x-1">
              <SOAPBadge section="S" />
              <SOAPBadge section="O" />
              <SOAPBadge section="A" />
              <SOAPBadge section="P" />
            </div>
          )}

          {/* Timestamp */}
          <span className="text-sm text-gray-500 ml-auto">{clientTimeString || '--:--:--'}</span>
        </div>

        {/* Enhanced content with better SOAP formatting */}
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

        {/* Special sections for enhanced analysis */}
        {isSOAPAnalysis && (
          <>
            <IterativeMetrics content={message.content} />
            <AgentInsights content={message.content} />
          </>
        )}

        {/* Enhanced copy button */}
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
