// ChatInterface with REST API Integration
// Redux Brain Medical System - Full SOAP & Urgency Display

import { useState, useEffect, useRef } from 'react'

// 🔧 UI CONSTANTS
const ID_RANDOM_LENGTH = 11 // Length for random ID generation (substring end index)
const SESSION_ID_DISPLAY_LENGTH = 16 // Characters to show in UI for session ID

// Simple UUID generator - no external dependencies
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, ID_RANDOM_LENGTH)}`
}

// Redux action interface for debug panel
interface ReduxAction {
  type: string
  phase: string
  soapProgress: number
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  urgencyLevel?: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'
  soapProgress?: number
  soapState?: {
    subjetivo?: string
    objetivo?: string
    analisis?: string
    plan?: string
  }
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
    recentActions: ReduxAction[]
  }
}

export const ChatInterfaceAPI = () => {
  const [sessionId] = useState(() => `session-${generateId()}`)
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
      id: generateId(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Auto-detect Netlify environment
      const isNetlify =
        typeof window !== 'undefined' && window.location.hostname.includes('netlify')
      const apiUrl = isNetlify ? '/.netlify/functions/redux-brain' : '/api/redux-brain/'

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          message: input,
        }),
      })

      const data: ApiResponse = await response.json()
      setLastResponse(data)

      if (data.success) {
        const assistantMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
          urgencyLevel: data.urgencyAssessment?.level,
          soapProgress: data.sessionData?.soapProgress,
          soapState: data.soapState,
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        throw new Error('API response indicates failure')
      }
    } catch (error) {
      console.error('Error calling API:', error)
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: 'Error: Unable to process your request. Please try again.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const getUrgencyColor = (level?: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'border-red-500 bg-red-900/20'
      case 'HIGH':
        return 'border-orange-500 bg-orange-900/20'
      case 'MODERATE':
        return 'border-yellow-500 bg-yellow-900/20'
      case 'LOW':
        return 'border-green-500 bg-green-900/20'
      default:
        return 'border-gray-600 bg-gray-800'
    }
  }

  const getUrgencyBadge = (level?: string) => {
    if (!level) return null
    const colors = {
      CRITICAL: 'bg-red-600 text-white',
      HIGH: 'bg-orange-600 text-white',
      MODERATE: 'bg-yellow-600 text-black',
      LOW: 'bg-green-600 text-white',
    }
    return (
      <span
        className={`px-2 py-1 rounded text-xs font-bold ${colors[level as keyof typeof colors]}`}
      >
        {level}
      </span>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-950">
      {/* Mobile-Optimized Header with Session Info */}
      <div className="bg-gray-900 px-3 py-2 sm:p-4 border-b border-gray-800 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-green-400">
              Medical Assistant
            </h2>
            <p className="text-xs text-gray-400 mt-1 hidden sm:block">
              Session: {sessionId.slice(0, SESSION_ID_DISPLAY_LENGTH)}...
            </p>
          </div>
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="px-2 py-1 sm:px-3 sm:py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs sm:text-sm transition-colors"
          >
            {showDebug ? 'Hide' : 'Show'} Debug
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages Container with Better Mobile Padding */}
          <div className="flex-1 overflow-y-auto px-3 py-4 sm:p-4 space-y-3 sm:space-y-4 bg-gradient-to-b from-gray-950 to-gray-900">
            {messages.length === 0 ? (
              <div className="text-gray-500 text-center mt-8 sm:mt-16 px-4">
                <div className="text-5xl sm:text-6xl mb-4">🧠</div>
                <p className="text-base sm:text-lg">Redux Brain Medical AI</p>
                <p className="text-xs sm:text-sm mt-2">
                  Describe your symptoms or medical condition...
                </p>
              </div>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id}
                  className={`p-3 sm:p-4 rounded-lg transition-all max-w-full sm:max-w-[90%] ${
                    msg.role === 'user'
                      ? 'bg-blue-900/30 ml-auto sm:ml-8 border-l-4 border-blue-400'
                      : `${getUrgencyColor(msg.urgencyLevel)} border-l-4 mr-auto`
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-medium">
                        {msg.role === 'user' ? 'You' : 'Assistant'}
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
                  <div className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
                    {msg.content}
                  </div>

                  {/* SOAP Display when 100% complete */}
                  {msg.role === 'assistant' && msg.soapProgress === 100 && msg.soapState && (
                    <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
                      <h4 className="text-xs font-bold text-green-400 mb-2">
                        📋 SOAP NOTES COMPLETE
                      </h4>

                      {msg.soapState.subjetivo && (
                        <div className="mb-2">
                          <span className="text-yellow-400 font-bold text-xs">S (Subjetivo):</span>
                          <p className="text-xs text-gray-300 ml-4 mt-1">
                            {msg.soapState.subjetivo}
                          </p>
                        </div>
                      )}

                      {msg.soapState.objetivo && (
                        <div className="mb-2">
                          <span className="text-blue-400 font-bold text-xs">O (Objetivo):</span>
                          <p className="text-xs text-gray-300 ml-4 mt-1 whitespace-pre-wrap">
                            {msg.soapState.objetivo}
                          </p>
                        </div>
                      )}

                      {msg.soapState.analisis && (
                        <div className="mb-2">
                          <span className="text-purple-400 font-bold text-xs">A (Análisis):</span>
                          <p className="text-xs text-gray-300 ml-4 mt-1">
                            {msg.soapState.analisis}
                          </p>
                        </div>
                      )}

                      {msg.soapState.plan && (
                        <div className="mb-2">
                          <span className="text-orange-400 font-bold text-xs">P (Plan):</span>
                          <p className="text-xs text-gray-300 ml-4 mt-1 whitespace-pre-wrap">
                            {msg.soapState.plan}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="bg-gray-800/50 p-3 sm:p-4 rounded-lg border-l-4 border-yellow-400 animate-pulse max-w-full sm:max-w-[90%]">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="text-yellow-400 text-xl sm:text-2xl animate-spin">⚕️</div>
                  <div>
                    <p className="text-sm sm:text-base font-semibold">Processing...</p>
                    <p className="text-xs text-gray-400 mt-1 hidden sm:block">Analyzing symptoms</p>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ChatGPT-Style Input Form */}
          <form
            onSubmit={e => {
              e.preventDefault()
              sendMessage()
            }}
            className="px-3 py-3 sm:p-4 bg-gray-900 border-t border-gray-800 flex-shrink-0"
          >
            <div className="max-w-4xl mx-auto">
              <div className="relative flex items-end bg-gray-800 rounded-2xl border border-gray-700 focus-within:border-gray-600 transition-colors">
                <textarea
                  value={input}
                  onChange={e => {
                    setInput(e.target.value)
                    // Auto-resize textarea
                    e.target.style.height = 'auto'
                    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  placeholder="Message Medical Assistant..."
                  className="flex-1 bg-transparent px-4 py-3 text-sm sm:text-base resize-none focus:outline-none min-h-[44px] max-h-[200px] scrollbar-thin scrollbar-thumb-gray-600"
                  disabled={isLoading}
                  autoComplete="off"
                  rows={1}
                  style={{ height: 'auto' }}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="m-2 p-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0"
                >
                  {isLoading ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center sm:hidden">
                Press Enter to send • Shift+Enter for new line
              </p>
            </div>
          </form>
        </div>

        {/* Mobile-Optimized Debug Panel */}
        {showDebug && lastResponse && (
          <div className="absolute sm:relative top-0 right-0 w-full sm:w-80 md:w-96 h-full bg-gray-900 sm:border-l border-gray-800 overflow-y-auto p-3 sm:p-4 z-10 shadow-xl sm:shadow-none">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-yellow-400">Debug Info</h3>
              <button
                onClick={() => setShowDebug(false)}
                className="sm:hidden p-1 text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Urgency Assessment */}
            {lastResponse.urgencyAssessment && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-green-400 mb-2">Urgency Assessment</h4>
                <div className="bg-gray-900 p-3 rounded text-xs space-y-1">
                  <p>
                    <span className="text-gray-400">Level:</span>{' '}
                    {lastResponse.urgencyAssessment.level}
                  </p>
                  {lastResponse.urgencyAssessment.protocol && (
                    <p>
                      <span className="text-gray-400">Protocol:</span>{' '}
                      {lastResponse.urgencyAssessment.protocol}
                    </p>
                  )}
                  <p>
                    <span className="text-gray-400">Pediatric:</span>{' '}
                    {lastResponse.urgencyAssessment.pediatricFlag ? 'Yes' : 'No'}
                  </p>
                  {lastResponse.urgencyAssessment.actions.length > 0 && (
                    <div>
                      <span className="text-gray-400">Actions:</span>
                      <ul className="ml-2 mt-1">
                        {lastResponse.urgencyAssessment.actions.map((action, idx) => (
                          <li key={idx} className="text-gray-300">
                            • {action}
                          </li>
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
