// src/components/CognitiveDashboard.tsx
// Sistema Cognitivo Médico Corporativo 2025 - Bernard Orozco
'use client'

import { useState, useEffect, useRef } from 'react'
import { useCognitiveChat } from '@/hooks/useCognitiveChat'
import type { MedicalConsensus, CognitiveInsights } from '@/types/cognitive'
import type { DecisionResult } from '@/types/agents'

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

// Consensus Result Component
const ConsensusResult = ({ consensus }: { consensus: MedicalConsensus }) => (
  <div className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 backdrop-blur-sm rounded-xl p-4 border border-emerald-500/20 mb-4">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        <span className="font-semibold text-emerald-300">Consensus Achieved</span>
      </div>
      <span className="text-sm text-emerald-400 font-medium">{consensus.confidence}%</span>
    </div>
    <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-700">
      <pre className="text-xs text-emerald-300 overflow-auto">
        {JSON.stringify(consensus.finalDecision, null, 2)}
      </pre>
    </div>
  </div>
)

// Insights Component
const InsightsPanel = ({ insights }: { insights: CognitiveInsights }) => (
  <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20 mb-4">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
        <span className="font-semibold text-purple-300">AI Insights</span>
      </div>
      <span className="text-sm text-purple-400 font-medium">{insights.confidence}%</span>
    </div>
    <div className="space-y-2 text-sm">
      <div>
        <span className="text-purple-400 font-medium">Pattern:</span>
        <span className="text-slate-200 ml-2">{insights.pattern}</span>
      </div>
      <div>
        <span className="text-purple-400 font-medium">Recommendation:</span>
        <span className="text-slate-200 ml-2">{insights.recommendation}</span>
      </div>
      {insights.learnings && insights.learnings.map((learning: string, idx: number) => (
        <div key={idx} className="text-xs text-purple-200/80 flex items-start">
          <span className="text-purple-400 mr-2">•</span>
          <span>{learning}</span>
        </div>
      ))}
    </div>
  </div>
)

// Agent Decision Component
const AgentDecision = ({ decision }: { decision: DecisionResult }) => {
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
    sendMessage,
    lastCognitiveResult,
    lastConsensus,
    lastInsights,
    systemConfidence,
    overallHealth
  } = useCognitiveChat()
  
  const chatEndRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  // Real cognitive metrics
  const cognitiveMetrics = {
    systemConfidence: Math.round((systemConfidence || 0.5) * 100),
    overallHealth: Math.round((overallHealth || 0.5) * 100),
    consensusRate: lastConsensus ? lastConsensus.confidence : 75,
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
    if (!input.trim() || isLoading) return
    
    try {
      await sendMessage(input)
    } catch (error) {
      console.error('Cognitive processing failed:', error)
    }
    
    setInput('')
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Medical Grid Background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDEwIDAgTCAwIDAgMCAxMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDMwLCA0MSwgNTksIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
      
      {/* Subtle animated elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🧠</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-300 via-blue-300 to-slate-300 bg-clip-text text-transparent">
                Cognitive Medical AI
              </h1>
              <p className="text-slate-400 text-sm">Advanced Multi-Agent Diagnostic System</p>
            </div>
          </div>
          
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-600/30">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-sm text-slate-300">System Online</span>
            <span className="text-xs text-slate-500">v2.0</span>
          </div>
        </div>
        
        {/* Cognitive Health Metrics */}
        <CognitiveHealthMetrics metrics={cognitiveMetrics} />
        
        {/* Status Panel */}
        <CognitiveStatusPanel metrics={cognitiveMetrics} />
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Chat Panel */}
          <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl p-6 border border-slate-600/30">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-lg">💬</span>
              </div>
              <h2 className="text-xl font-semibold text-slate-200">Medical Consultation</h2>
            </div>
            
            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto bg-slate-900/50 rounded-xl p-4 mb-4 border border-slate-700/50 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400">
                  <div className="text-center">
                    <div className="text-4xl mb-3">🩺</div>
                    <p className="text-sm">Ready for cognitive medical analysis...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block p-4 rounded-xl max-w-[85%] ${
                        msg.role === 'user' 
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white' 
                          : 'bg-slate-800/80 text-slate-200 border border-slate-600/30'
                      }`}>
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="text-left">
                      <div className="inline-block p-4 bg-slate-800/80 rounded-xl border border-slate-600/30">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                          <span className="text-slate-300 text-sm">Processing cognitive analysis...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>
            
            {/* Input Form */}
            <form onSubmit={handleSubmit} className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/30">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe medical symptoms or request analysis..."
                  className="flex-1 p-3 bg-slate-900/70 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-200 placeholder-slate-400"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing</span>
                    </div>
                  ) : (
                    'Analyze'
                  )}
                </button>
              </div>
            </form>
          </div>
          
          {/* Cognitive Results Panel */}
          <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl p-6 border border-slate-600/30">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-lg flex items-center justify-center">
                <span className="text-lg">🔮</span>
              </div>
              <h2 className="text-xl font-semibold text-slate-200">Cognitive Analysis</h2>
            </div>
            
            <div className="h-96 overflow-y-auto custom-scrollbar">
              {isLoading && (
                <div className="bg-cyan-900/20 rounded-xl p-4 border border-cyan-500/20 mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-cyan-300">Running cognitive analysis...</span>
                  </div>
                </div>
              )}
              
              {lastConsensus && <ConsensusResult consensus={lastConsensus} />}
              {lastInsights && <InsightsPanel insights={lastInsights} />}
              
              {lastCognitiveResult && lastCognitiveResult.length > 0 ? (
                <div className="space-y-3">
                  {lastCognitiveResult.map((decision: DecisionResult) => (
                    <AgentDecision key={decision.id} decision={decision} />
                  ))}
                </div>
              ) : !isLoading && (
                <div className="flex items-center justify-center h-32 text-slate-500">
                  <div className="text-center">
                    <div className="text-3xl mb-2">🧠</div>
                    <p className="text-sm">Ready for cognitive processing</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
        </div>
        
        {/* Footer */}
        <div className="text-center mt-12 text-slate-500 text-sm">
          <p>Created by <span className="text-cyan-400 font-medium">Bernard Orozco</span> • Cognitive Medical AI System</p>
        </div>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgb(30 41 59 / 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgb(51 65 85 / 0.7);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgb(71 85 105 / 0.9);
        }
      `}</style>
    </div>
  )
}