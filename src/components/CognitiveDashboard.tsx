// src/components/CognitiveDashboard.tsx
// Sistema Cognitivo Médico Corporativo 2025 - Bernard Orozco
'use client'

import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { useMedicalChat } from '@redux-claude/cognitive-core'
import { MedicalMessageComponent } from './MedicalMessage'

// Medical Corporate Color Palette 2025
const theme = {
  // Primary Medical Colors
  primary: {
    blue: '#0A4B78',      // Deep medical blue
    cyan: '#1B9AAA',      // Healthcare cyan
    teal: '#06A77D',      // Medical teal
    white: '#FFFFFF',     // Pure white
  },
  // Secondary Support Colors
  secondary: {
    slate: '#1E293B',     // Dark professional
    gray: '#374151',      // Medium gray
    lightGray: '#6B7280', // Light gray
    accent: '#F1F5F9',    // Light accent
  },
  // Status Colors
  status: {
    success: '#059669',   // Medical green
    warning: '#D97706',   // Amber warning
    error: '#DC2626',     // Medical red
    info: '#0369A1',      // Information blue
  },
  // Background & Surface
  surface: {
    dark: '#0F172A',      // Deep dark
    card: '#1E293B',      // Card background
    elevated: '#334155',  // Elevated surface
    glass: 'rgba(30, 41, 59, 0.8)', // Glass effect
  }
}

interface CognitiveMetrics {
  systemConfidence: number
  overallHealth: number
  consensusRate: number
  memoryLoad: number
  learningProgress: number
  activeDebates: number
  pipelineSuccess: number
  avgLatency: number
  activeGoals: number
  knowledgeGaps: number
}

// Cognitive Health Metrics Component
const CognitiveHealthMetrics = ({ metrics }: { metrics: CognitiveMetrics }) => (
  <div className="grid grid-cols-4 gap-4 mb-6">
    <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-sm rounded-2xl p-4 border border-cyan-500/20">
      <div className="text-3xl font-bold text-cyan-400 mb-1">{metrics.systemConfidence}%</div>
      <div className="text-sm text-cyan-300/80">System Confidence</div>
      <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
        <div 
          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${metrics.systemConfidence}%` }}
        />
      </div>
    </div>
    
    <div className="bg-gradient-to-br from-teal-500/10 to-emerald-500/10 backdrop-blur-sm rounded-2xl p-4 border border-teal-500/20">
      <div className="text-3xl font-bold text-teal-400 mb-1">{metrics.overallHealth}%</div>
      <div className="text-sm text-teal-300/80">System Health</div>
      <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
        <div 
          className="bg-gradient-to-r from-teal-500 to-emerald-500 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${metrics.overallHealth}%` }}
        />
      </div>
    </div>
    
    <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 backdrop-blur-sm rounded-2xl p-4 border border-blue-500/20">
      <div className="text-3xl font-bold text-blue-400 mb-1">{metrics.consensusRate}%</div>
      <div className="text-sm text-blue-300/80">Consensus Rate</div>
      <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
        <div 
          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${metrics.consensusRate}%` }}
        />
      </div>
    </div>
    
    <div className="bg-gradient-to-br from-slate-500/10 to-gray-500/10 backdrop-blur-sm rounded-2xl p-4 border border-slate-500/20">
      <div className="text-3xl font-bold text-slate-300 mb-1">{metrics.avgLatency}ms</div>
      <div className="text-sm text-slate-400/80">Response Time</div>
      <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
        <div 
          className="bg-gradient-to-r from-slate-500 to-gray-500 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${Math.max(10, 100 - (metrics.avgLatency / 20))}%` }}
        />
      </div>
    </div>
  </div>
)

// Cognitive Status Panel Component
const CognitiveStatusPanel = ({ metrics }: { metrics: CognitiveMetrics }) => (
  <div className="grid grid-cols-2 gap-4 mb-6">
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30">
      <div className="flex items-center space-x-2 mb-3">
        <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
        <span className="text-sm font-semibold text-cyan-300">Memory System</span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-400">Load:</span>
          <span className="text-slate-200">{Math.round(metrics.memoryLoad * 100)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Goals:</span>
          <span className="text-slate-200">{metrics.activeGoals}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Gaps:</span>
          <span className="text-slate-200">{metrics.knowledgeGaps}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Insights:</span>
          <span className="text-slate-200">24</span>
        </div>
      </div>
    </div>
    
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30">
      <div className="flex items-center space-x-2 mb-3">
        <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
        <span className="text-sm font-semibold text-blue-300">Pipeline Status</span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-400">Success:</span>
          <span className="text-slate-200">{metrics.pipelineSuccess}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Debates:</span>
          <span className="text-slate-200">{metrics.activeDebates}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Mode:</span>
          <span className="text-slate-200">Adaptive</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Learning:</span>
          <span className="text-slate-200">{metrics.learningProgress}%</span>
        </div>
      </div>
    </div>
  </div>
)

// Agent Decision Component  
const AgentDecision = ({ decision }: { decision: any }) => {
  const getAgentColor = (agentType: string) => {
    switch (agentType) {
      case 'diagnostic': return 'blue'
      case 'triage': return 'red'
      case 'validation': return 'emerald'
      case 'treatment': return 'purple'
      case 'documentation': return 'amber'
      default: return 'slate'
    }
  }
  
  const color = getAgentColor(decision.agentType)
  
  return (
    <div className={`bg-gradient-to-r from-${color}-900/20 to-${color}-800/20 backdrop-blur-sm rounded-xl p-4 border border-${color}-500/20 mb-3`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 bg-${color}-400 rounded-full`} />
          <span className={`font-semibold text-${color}-300`}>{decision.agentName}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-400">{decision.confidence}%</span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            decision.success 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
              : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}>
            {decision.success ? 'SUCCESS' : 'FAILED'}
          </span>
        </div>
      </div>
      <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-700">
        <pre className={`text-xs text-${color}-300 overflow-auto max-h-32`}>
          {JSON.stringify(decision.decision, null, 2)}
        </pre>
      </div>
    </div>
  )
}

// Main Cognitive Dashboard Component
export const CognitiveDashboard = () => {
  const [input, setInput] = useState('')
  
  const { 
    messages, 
    isLoading, 
    isStreaming,
    sendMedicalQuery,
    newSession,
    error
  } = useMedicalChat()
  
  const chatEndRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  // Cognitive metrics (simulated for now)
  const cognitiveMetrics = {
    systemConfidence: 85,
    overallHealth: 92,
    consensusRate: 75,
    memoryLoad: 0.3,
    learningProgress: 85,
    activeDebates: 0,
    pipelineSuccess: 91,
    avgLatency: 850,
    activeGoals: 3,
    knowledgeGaps: 2,
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || isStreaming) return
    
    const messageToSend = input
    setInput('')
    
    // Enviar consulta médica con streaming real
    await sendMedicalQuery(messageToSend)
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">🏥</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">Medical AI</h1>
              <p className="text-xs text-gray-400">Cognitive Assistant</p>
            </div>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button 
            onClick={() => setInput('')}
            className="w-full flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm">New consultation</span>
          </button>
        </div>

        {/* System Status */}
        <div className="px-4 py-2">
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-gray-300">System Online</span>
            </div>
            <div className="space-y-1 text-xs text-gray-400">
              <div className="flex justify-between">
                <span>Confidence:</span>
                <span>{cognitiveMetrics.systemConfidence}%</span>
              </div>
              <div className="flex justify-between">
                <span>Agents:</span>
                <span>5/5 active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <nav className="space-y-1">
            <a href="#" className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg">
              <span className="text-sm">💊 Treatment Plans</span>
            </a>
            <a href="#" className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg">
              <span className="text-sm">🔍 Diagnostics</span>
            </a>
            <a href="#" className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg">
              <span className="text-sm">📊 Analytics</span>
            </a>
          </nav>
        </div>

        {/* Bottom Info */}
        <div className="p-4 border-t border-gray-800">
          <div className="text-xs text-gray-500">
            <p>Built by Bernard Orozco</p>
            <p>Powered by Claude AI</p>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">🤖</span>
              </div>
              <div>
                <h2 className="text-lg font-medium text-white">Medical AI Assistant</h2>
                <p className="text-sm text-gray-400">Multi-agent cognitive analysis system</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-green-900/30 border border-green-700 rounded-full">
                <span className="text-xs text-green-400">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Solo Chat */}
        <div className="flex-1 flex flex-col">
          
          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto bg-gray-900 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center px-6">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🩺</span>
                  </div>
                  <p className="text-gray-400 text-sm">Ready for medical consultation...</p>
                  <p className="text-gray-500 text-xs mt-2">Describe your medical case to get started</p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-900">
                {messages.map((message, idx) => {
                  const isLastMessage = idx === messages.length - 1
                  const messageIsStreaming = isLastMessage && isStreaming && message.type === 'assistant'
                  
                  return (
                    <MedicalMessageComponent
                      key={message.id || idx}
                      message={message}
                      isStreaming={messageIsStreaming}
                    />
                  )
                })}
                
                {(isLoading || isStreaming) && (
                  <div className="border-b border-gray-800 bg-gray-800/30">
                    <div className="max-w-4xl mx-auto px-6 py-6">
                      <div className="flex space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">🤖</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white mb-4">Medical AI</div>
                          {false ? (
                            <div>Streaming...</div>
                          ) : (
                            <div className="flex items-center space-x-2 text-gray-400">
                              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                              <span className="text-sm">Analyzing medical case...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>
            )}
          </div>
          
          {/* Nueva Sesión */}
          {messages.length > 1 && (
            <div className="border-t border-gray-800 px-6 py-3 bg-gray-800/50">
              <button
                onClick={() => newSession()}
                className="text-sm text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nueva consulta médica
              </button>
            </div>
          )}

          {/* Input Form */}
          <div className="border-t border-gray-800 bg-gray-900 px-6 py-4">
            <form onSubmit={handleSubmit} className="flex space-x-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe el caso clínico aquí... Ej: Paciente de 45 años presenta dolor torácico..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  disabled={isLoading || isStreaming}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing</span>
                  </>
                ) : (
                  <>
                    <span>Send</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgb(31 41 55);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgb(75 85 99);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgb(107 114 128);
        }
        
        /* Claude.ai-style message animations */
        .message-appear {
          animation: messageSlideIn 0.3s ease-out;
        }
        
        @keyframes messageSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Better prose styling */
        .prose h1 {
          border-bottom: 2px solid #f97316;
        }
        
        .prose code {
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
        }
      `}</style>
    </div>
  )
}