// ChatInterface with REST API Integration
// Redux Brain Medical System - Full SOAP & Urgency Display

import { useState, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  urgencyLevel?: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'
  soapProgress?: number
}

interface ApiResponse {
  success: boolean
  sessionId: string
  message: string
  urgencyAssessment?: {
    level: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'
    protocol?: string
    actions: string[]
    pediatricFlag?: boolean
    reasoning?: string
  }
  sessionData?: {
    soapProgress: number
    currentPhase: string
    hasCompleteInfo: boolean
  }
  soapState?: {
    subjetivo?: string
    objetivo?: string
    analisis?: string
    plan?: string
  }
  reduxFlow?: {
    totalActions: number
    recentActions: any[]
  }
}

export const ChatInterfaceAPI = () => {
  const [sessionId] = useState(() => `session-${uuidv4()}`)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showDebug, setShowDebug] = useState(false)
  const [lastResponse, setLastResponse] = useState<ApiResponse | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Auto-detect Netlify environment
      const isNetlify = typeof window !== 'undefined' && window.location.hostname.includes('netlify');
      const apiUrl = isNetlify
        ? '/.netlify/functions/redux-brain'
        : '/api/redux-brain/';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          message: input
        })
      })

      const data: ApiResponse = await response.json()
      setLastResponse(data)

      if (data.success) {
        const assistantMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
          urgencyLevel: data.urgencyAssessment?.level,
          soapProgress: data.sessionData?.soapProgress
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        throw new Error('API response indicates failure')
      }
    } catch (error) {
      console.error('Error calling API:', error)
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Error: Unable to process your request. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const getUrgencyColor = (level?: string) => {
    switch(level) {
      case 'CRITICAL': return 'border-red-500 bg-red-900/20'
      case 'HIGH': return 'border-orange-500 bg-orange-900/20'
      case 'MODERATE': return 'border-yellow-500 bg-yellow-900/20'
      case 'LOW': return 'border-green-500 bg-green-900/20'
      default: return 'border-gray-600 bg-gray-800'
    }
  }

  const getUrgencyBadge = (level?: string) => {
    if (!level) return null
    const colors = {
      CRITICAL: 'bg-red-600 text-white',
      HIGH: 'bg-orange-600 text-white',
      MODERATE: 'bg-yellow-600 text-black',
      LOW: 'bg-green-600 text-white'
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-bold ${colors[level as keyof typeof colors]}`}>
        {level}
      </span>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with Session Info */}
      <div className="bg-gray-800 p-4 rounded-t-xl border-b border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-green-400">Redux Brain Medical Chat</h2>
            <p className="text-xs text-gray-400 mt-1">Session: {sessionId.slice(0, 16)}...</p>
          </div>
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
          >
            {showDebug ? 'Hide' : 'Show'} Debug
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900">
            {messages.length === 0 ? (
              <div className="text-gray-500 text-center mt-16">
                <div className="text-6xl mb-4">🧠</div>
                <p className="text-lg">Redux Brain Medical AI</p>
                <p className="text-sm mt-2">Describe your symptoms or medical condition...</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-4 rounded-lg transition-all ${
                    msg.role === 'user'
                      ? 'bg-blue-900/30 ml-8 border-l-4 border-blue-400'
                      : `${getUrgencyColor(msg.urgencyLevel)} border-l-4`
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-mono">
                        {msg.role === 'user' ? 'YOU' : 'MEDICAL AI'}
                      </span>
                      {msg.urgencyLevel && getUrgencyBadge(msg.urgencyLevel)}
                    </div>
                    {msg.soapProgress !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">SOAP:</span>
                        <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                            style={{ width: `${msg.soapProgress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{msg.soapProgress}%</span>
                      </div>
                    )}
                  </div>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-yellow-400 animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="text-yellow-400 text-2xl animate-spin">⚕️</div>
                  <div>
                    <p className="font-semibold">Processing medical query...</p>
                    <p className="text-xs text-gray-400 mt-1">Analyzing symptoms and generating SOAP notes</p>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage() }}
            className="p-4 bg-gray-800 border-t border-gray-700"
          >
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe symptoms, medical history, or current condition..."
                className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 disabled:scale-100"
              >
                {isLoading ? '⚕️' : 'Send'}
              </button>
            </div>
          </form>
        </div>

        {/* Debug Panel */}
        {showDebug && lastResponse && (
          <div className="w-96 bg-gray-800 border-l border-gray-700 overflow-y-auto p-4">
            <h3 className="text-lg font-semibold mb-4 text-yellow-400">Debug Information</h3>

            {/* Urgency Assessment */}
            {lastResponse.urgencyAssessment && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-green-400 mb-2">Urgency Assessment</h4>
                <div className="bg-gray-900 p-3 rounded text-xs space-y-1">
                  <p><span className="text-gray-400">Level:</span> {lastResponse.urgencyAssessment.level}</p>
                  {lastResponse.urgencyAssessment.protocol && (
                    <p><span className="text-gray-400">Protocol:</span> {lastResponse.urgencyAssessment.protocol}</p>
                  )}
                  <p><span className="text-gray-400">Pediatric:</span> {lastResponse.urgencyAssessment.pediatricFlag ? 'Yes' : 'No'}</p>
                  {lastResponse.urgencyAssessment.actions.length > 0 && (
                    <div>
                      <span className="text-gray-400">Actions:</span>
                      <ul className="ml-2 mt-1">
                        {lastResponse.urgencyAssessment.actions.map((action, idx) => (
                          <li key={idx} className="text-gray-300">• {action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SOAP State */}
            {lastResponse.soapState && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-green-400 mb-2">SOAP Notes</h4>
                <div className="bg-gray-900 p-3 rounded text-xs space-y-2">
                  {lastResponse.soapState.subjetivo && (
                    <div>
                      <span className="text-yellow-400 font-semibold">S:</span>
                      <p className="text-gray-300 ml-4">{lastResponse.soapState.subjetivo}</p>
                    </div>
                  )}
                  {lastResponse.soapState.objetivo && (
                    <div>
                      <span className="text-yellow-400 font-semibold">O:</span>
                      <p className="text-gray-300 ml-4">{lastResponse.soapState.objetivo}</p>
                    </div>
                  )}
                  {lastResponse.soapState.analisis && (
                    <div>
                      <span className="text-yellow-400 font-semibold">A:</span>
                      <p className="text-gray-300 ml-4">{lastResponse.soapState.analisis}</p>
                    </div>
                  )}
                  {lastResponse.soapState.plan && (
                    <div>
                      <span className="text-yellow-400 font-semibold">P:</span>
                      <p className="text-gray-300 ml-4">{lastResponse.soapState.plan}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Redux Actions */}
            {lastResponse.reduxFlow && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-green-400 mb-2">
                  Redux Actions ({lastResponse.reduxFlow.totalActions} total)
                </h4>
                <div className="bg-gray-900 p-3 rounded text-xs space-y-1 max-h-64 overflow-y-auto">
                  {lastResponse.reduxFlow.recentActions.map((action, idx) => (
                    <div key={idx} className="border-b border-gray-800 pb-1 mb-1">
                      <p className="text-blue-400 font-semibold">{action.type}</p>
                      <p className="text-gray-400 text-xs">
                        Phase: {action.phase} | Progress: {action.soapProgress}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}