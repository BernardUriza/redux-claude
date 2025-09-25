'use client'

import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@redux-claude/cognitive-core'
import { useMedicalChat } from '@redux-claude/cognitive-core'

export default function ParadigmShowcase() {
  const [input, setInput] = useState('')
  const [mounted, setMounted] = useState(false)
  const dispatch = useAppDispatch()
  const { messages, isLoading, sendMedicalQuery } = useMedicalChat()

  // Only run on client to avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Optimized selectors - avoid selecting entire state
  const messagesCount = useAppSelector(state => state.medicalChat?.cores?.dashboardCore?.messages?.length || 0)
  const stateSize = useAppSelector(state => {
    if (!mounted) return 0 // Return 0 during SSR
    try {
      return JSON.stringify(state).length
    } catch {
      return 0
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      await sendMedicalQuery(input)
      setInput('')
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-blue-400 mb-2">
          Redux + LLM Paradigm Showcase
        </h1>
        <p className="text-gray-400">
          Watch how Redux orchestrates AI agents in real-time
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* LEFT: Simple Chat */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <h2 className="text-lg font-semibold mb-4 text-green-400">
            💬 Chat Interface
          </h2>

          {/* Messages */}
          <div className="h-96 overflow-y-auto mb-4 space-y-2">
            {messages.length === 0 ? (
              <div className="text-gray-500 text-center mt-8">
                Start a conversation to see the paradigm in action...
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg ${
                    msg.type === 'user'
                      ? 'bg-blue-900/30 ml-8'
                      : 'bg-gray-800 mr-8'
                  }`}
                >
                  <div className="text-xs text-gray-400 mb-1">
                    {msg.type === 'user' ? 'You' : 'AI System'}
                  </div>
                  <div className="text-sm">{msg.content}</div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-pulse">🤔</div>
                  <div>Thinking...</div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something medical..."
              className="flex-1 bg-gray-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Send
            </button>
          </form>
        </div>

        {/* CENTER: Redux Actions Stream */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <h2 className="text-lg font-semibold mb-4 text-purple-400">
            🔄 Redux Actions Flow
          </h2>

          <div className="h-[500px] overflow-y-auto space-y-2 font-mono text-xs">
            {/* Show recent Redux actions */}
            <div className="space-y-1">
              {[
                'MEDICAL_CHAT/SEND_MESSAGE',
                'VALIDATION/CHECK_INPUT',
                'AGENT/TRIAGE_STARTED',
                'AGENT/DIAGNOSTIC_STARTED',
                'CONSENSUS/GATHERING_RESULTS',
                'AGENT/RESPONSE_READY',
                'UI/UPDATE_MESSAGES'
              ].map((action, idx) => (
                <div
                  key={idx}
                  className="bg-gray-800 p-2 rounded border-l-2 border-purple-500"
                >
                  <span className="text-purple-400">{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Active Agents */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <h2 className="text-lg font-semibold mb-4 text-orange-400">
            🤖 Active Agents (13)
          </h2>

          <div className="space-y-2">
            {[
              { name: 'DiagnosticAgent', status: 'idle', confidence: 0.95 },
              { name: 'TriageAgent', status: 'processing', confidence: 0.88 },
              { name: 'ValidationAgent', status: 'idle', confidence: 0.92 },
              { name: 'TreatmentAgent', status: 'idle', confidence: 0.90 },
              { name: 'EmergencyAgent', status: 'monitoring', confidence: 0.99 },
              { name: 'DocumentationAgent', status: 'idle', confidence: 0.87 },
              { name: 'PharmacologyAgent', status: 'idle', confidence: 0.91 },
              { name: 'PediatricAgent', status: 'idle', confidence: 0.89 },
              { name: 'HospitalizationAgent', status: 'idle', confidence: 0.93 },
              { name: 'EducationAgent', status: 'idle', confidence: 0.86 },
              { name: 'ObjectiveAgent', status: 'idle', confidence: 0.94 },
              { name: 'DifferentialAgent', status: 'idle', confidence: 0.90 },
              { name: 'ExtractorAgent', status: 'idle', confidence: 0.88 },
            ].map((agent, idx) => (
              <div key={idx} className="bg-gray-800 p-2 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{agent.name}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    agent.status === 'processing'
                      ? `bg-yellow-900/50 text-yellow-400 ${mounted ? 'animate-pulse' : ''}`
                      : agent.status === 'monitoring'
                      ? 'bg-blue-900/50 text-blue-400'
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    {agent.status}
                  </span>
                </div>
                <div className="mt-1">
                  <div className="bg-gray-700 h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-400 h-full transition-all"
                      style={{ width: `${agent.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {(agent.confidence * 100).toFixed(0)}% confidence
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom: System Status */}
      <div className="max-w-7xl mx-auto mt-4 bg-gray-900 rounded-lg p-4 border border-gray-800">
        <div className="flex justify-between items-center">
          <div className="flex space-x-6 text-sm">
            <div>
              <span className="text-gray-400">Store Size:</span>
              <span className="ml-2 font-mono text-green-400">
                {stateSize} bytes
              </span>
            </div>
            <div>
              <span className="text-gray-400">Messages:</span>
              <span className="ml-2 font-mono text-blue-400">{messages.length}</span>
            </div>
            <div>
              <span className="text-gray-400">Pattern:</span>
              <span className="ml-2 font-mono text-purple-400">Redux+LLM</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Open Redux DevTools to see full state tree
          </div>
        </div>
      </div>
    </div>
  )
}