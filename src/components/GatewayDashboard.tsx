// src/components/GatewayDashboard.tsx
// Creado por Bernard Orozco
'use client'

import { useState, useEffect, useRef } from 'react'
import { useClaudeChat } from '@/hooks/useClaudeChat'
import { useDecisionalGateway } from '@/hooks/useDecisionalGateway'
import { useMultiAgentGateway } from '@/hooks/useMultiAgentGateway'
import { ProviderType, DecisionStatus, DecisionItem } from '@/types/decisional'
import { AgentType, AgentStatus, CircuitBreakerState, DecisionResult } from '@/types/agents'
import { AuditLevel } from '@/types/audit'
import { AGENT_REGISTRY } from '@/services/agentRegistry'

// Provider Badge Component
const ProviderBadge = ({ provider }: { provider: ProviderType }) => {
  const colors = {
    [ProviderType.CLAUDE]: 'bg-purple-500 text-white',
    [ProviderType.OPENAI]: 'bg-green-500 text-white',
    [ProviderType.LOCAL]: 'bg-gray-500 text-white'
  }
  
  return (
    <span className={`px-2 py-1 text-xs font-bold rounded-full ${colors[provider]}`}>
      {provider.toUpperCase()}
    </span>
  )
}

// Decision Card Component
const DecisionCard = ({ decision }: { decision: DecisionItem }) => {
  const statusColors = {
    [DecisionStatus.PENDING]: 'border-yellow-300 bg-yellow-50',
    [DecisionStatus.SUCCESS]: 'border-green-300 bg-green-50',
    [DecisionStatus.FAILED]: 'border-red-300 bg-red-50',
    [DecisionStatus.RETRYING]: 'border-blue-300 bg-blue-50'
  }
  
  return (
    <div className={`border-2 rounded-lg p-4 mb-3 ${statusColors[decision.status]}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
          <ProviderBadge provider={decision.provider} />
          <span className="text-xs text-gray-500">
            {new Date(decision.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <div className="text-right text-xs">
          <div className="font-bold">{decision.confidence}%</div>
          <div className="text-gray-500">{decision.latency}ms</div>
        </div>
      </div>
      
      <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs overflow-auto max-h-32">
        <pre>{JSON.stringify(decision.decision, null, 2)}</pre>
      </div>
      
      {decision.status === DecisionStatus.FAILED && (
        <div className="mt-2 text-xs text-red-600">
          Retry {decision.retryCount}/3
        </div>
      )}
    </div>
  )
}

// Audit Quality Panel Component
const AuditQualityPanel = ({ sessionQuality, auditEntries }: { 
  sessionQuality: any, 
  auditEntries: any[] 
}) => {
  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRecommendationColor = (level: string) => {
    switch (level) {
      case 'safe': return 'bg-green-100 text-green-800 border-green-200'
      case 'review_required': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'clinical_oversight_needed': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const criticalCount = auditEntries.filter(e => e.level === AuditLevel.CRITICAL).length
  const warningCount = auditEntries.filter(e => e.level === AuditLevel.WARNING).length

  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
      <div className="bg-white rounded-lg p-3 shadow border">
        <div className={`text-2xl font-bold ${getQualityColor(sessionQuality.clinicalCoherence)}`}>
          {sessionQuality.clinicalCoherence}%
        </div>
        <div className="text-xs text-gray-500">Clinical Coherence</div>
      </div>
      
      <div className="bg-white rounded-lg p-3 shadow border">
        <div className={`text-2xl font-bold ${getQualityColor(sessionQuality.safetyScore)}`}>
          {sessionQuality.safetyScore}%
        </div>
        <div className="text-xs text-gray-500">Safety Score</div>
      </div>
      
      <div className="bg-white rounded-lg p-3 shadow border">
        <div className="flex items-center space-x-2">
          <div className="text-red-600 font-bold">{criticalCount}</div>
          <div className="text-yellow-600 font-bold">{warningCount}</div>
        </div>
        <div className="text-xs text-gray-500">Critical/Warnings</div>
      </div>
      
      <div className="bg-white rounded-lg p-3 shadow border">
        <div className={`text-xs px-2 py-1 rounded border ${getRecommendationColor(sessionQuality.recommendationLevel)}`}>
          {sessionQuality.recommendationLevel.replace('_', ' ').toUpperCase()}
        </div>
        <div className="text-xs text-gray-500 mt-1">Status</div>
      </div>
    </div>
  )
}

// Stats Panel Component
const StatsPanel = ({ stats, activeProvider }: { 
  stats: any, 
  activeProvider: ProviderType 
}) => (
  <div className="grid grid-cols-2 gap-3 mb-4">
    <div className="bg-white rounded-lg p-3 shadow border">
      <div className="text-2xl font-bold text-blue-600">{stats.totalProcessed}</div>
      <div className="text-xs text-gray-500">Total Decisions</div>
    </div>
    
    <div className="bg-white rounded-lg p-3 shadow border">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-bold">Active</div>
          <div className="text-xs text-gray-500">Provider</div>
        </div>
        <ProviderBadge provider={activeProvider} />
      </div>
    </div>
    
    <div className="bg-white rounded-lg p-3 shadow border">
      <div className="text-xl font-bold text-green-600">{stats.averageConfidence}%</div>
      <div className="text-xs text-gray-500">Avg Confidence</div>
    </div>
    
    <div className="bg-white rounded-lg p-3 shadow border">
      <div className="text-xl font-bold text-purple-600">{stats.averageLatency}ms</div>
      <div className="text-xs text-gray-500">Avg Latency</div>
    </div>
  </div>
)

// Redux State Viewer (SSR-safe)
const ReduxStateViewer = ({ decisions }: { decisions: DecisionItem[] }) => {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    // Return static placeholder during SSR
    return (
      <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs">
        <div className="text-green-300 mb-2">Redux State (Loading...)</div>
        <pre className="overflow-auto max-h-40">
          {JSON.stringify({
            items: [],
            count: 0,
            status: 'hydrating'
          }, null, 2)}
        </pre>
      </div>
    )
  }
  
  const statePreview = {
    items: decisions.slice(0, 3),
    count: decisions.length,
    lastUpdate: new Date().toISOString()
  }
  
  return (
    <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs">
      <div className="text-green-300 mb-2">Redux State (Live)</div>
      <pre className="overflow-auto max-h-40">
        {JSON.stringify(statePreview, null, 2)}
      </pre>
    </div>
  )
}

// Multi-Agent Components
const AgentStatusCard = ({ agentType, summary }: { 
  agentType: AgentType, 
  summary: any 
}) => {
  const agent = AGENT_REGISTRY[agentType]
  
  const getStatusColor = (status: AgentStatus, circuitState: CircuitBreakerState) => {
    if (status === AgentStatus.DISABLED) return 'bg-gray-100 border-gray-300'
    if (circuitState === CircuitBreakerState.OPEN) return 'bg-red-100 border-red-300'
    if (status === AgentStatus.PROCESSING) return 'bg-blue-100 border-blue-300'
    if (status === AgentStatus.READY) return 'bg-green-100 border-green-300'
    return 'bg-yellow-100 border-yellow-300'
  }

  const getStatusIcon = (status: AgentStatus, circuitState: CircuitBreakerState) => {
    if (status === AgentStatus.DISABLED) return '⏸️'
    if (circuitState === CircuitBreakerState.OPEN) return '🔴'
    if (status === AgentStatus.PROCESSING) return '🔄'
    if (status === AgentStatus.READY) return '🟢'
    return '🟡'
  }

  return (
    <div className={`rounded-xl p-3 border transition-all duration-300 transform hover:scale-105 backdrop-blur-sm ${getStatusColor(summary.status, summary.health.circuitBreakerState)}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-1">
          <span className="text-lg">{agent.icon}</span>
          <div>
            <div className="font-bold text-xs text-white">{agent.name.split(' ')[0]}</div>
            <div className="text-xs text-gray-300">{agentType.toUpperCase()}</div>
          </div>
        </div>
        <div className="text-lg">
          {getStatusIcon(summary.status, summary.health.circuitBreakerState)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1 text-xs">
        <div className="text-center">
          <div className="font-bold text-cyan-400">{summary.health.successRate}%</div>
          <div className="text-gray-400">Success</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-purple-400">{summary.health.avgLatency}ms</div>
          <div className="text-gray-400">Latency</div>
        </div>
      </div>

      {summary.health.circuitBreakerState === CircuitBreakerState.OPEN && (
        <div className="mt-2 text-xs text-red-400 animate-pulse">
          🔴 Circuit Open
        </div>
      )}
    </div>
  )
}

const MultiAgentDecisionCard = ({ result }: { result: DecisionResult }) => {
  const agent = AGENT_REGISTRY[result.agentType]
  
  return (
    <div className={`border-2 rounded-lg p-4 mb-3 ${
      result.success ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
    }`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{agent.icon}</span>
          <div>
            <div className="font-bold text-sm" style={{color: agent.color}}>
              {agent.name}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(result.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
        <div className="text-right text-xs">
          <div className="font-bold">{result.confidence}%</div>
          <div className="text-gray-500">{result.latency}ms</div>
        </div>
      </div>
      
      {result.success ? (
        <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs overflow-auto max-h-32">
          <pre>{JSON.stringify(result.decision, null, 2)}</pre>
        </div>
      ) : (
        <div className="bg-red-900 text-red-300 p-3 rounded font-mono text-xs">
          <div className="text-red-200">ERROR: {result.error}</div>
        </div>
      )}
    </div>
  )
}

const SystemHealthPanel = ({ systemHealth }: { systemHealth: any }) => (
  <div className="grid grid-cols-4 gap-2 mb-4 flex-shrink-0">
    <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-white/20 transform transition-all duration-300 hover:scale-105">
      <div className="text-2xl font-black text-cyan-400">{systemHealth?.availableAgents || 0}</div>
      <div className="text-xs text-gray-300">Available</div>
    </div>
    
    <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-white/20 transform transition-all duration-300 hover:scale-105">
      <div className="text-2xl font-black text-emerald-400">{systemHealth?.avgSuccessRate || 0}%</div>
      <div className="text-xs text-gray-300">Success</div>
    </div>
    
    <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-white/20 transform transition-all duration-300 hover:scale-105">
      <div className="text-2xl font-black text-purple-400">{systemHealth?.avgLatency || 0}ms</div>
      <div className="text-xs text-gray-300">Latency</div>
    </div>
    
    <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-white/20 transform transition-all duration-300 hover:scale-105">
      <div className={`text-2xl font-bold ${systemHealth?.isHealthy ? 'text-green-400' : 'text-red-400'} animate-pulse`}>
        {systemHealth?.isHealthy ? '✅' : '❌'}
      </div>
      <div className="text-xs text-gray-300">Health</div>
    </div>
  </div>
)

// Enhanced Main Component with Multi-Agent Support
export const GatewayDashboard = () => {
  const [input, setInput] = useState('')
  const [activeTab, setActiveTab] = useState<'single' | 'multi'>('multi')
  const [multiAgentResults, setMultiAgentResults] = useState<DecisionResult[]>([])
  
  const { messages, isLoading: chatLoading, sendMessage } = useClaudeChat()
  
  // Single agent (legacy) hooks
  const { 
    decisions, 
    activeProvider, 
    loading: decisionLoading, 
    stats,
    auditEntries,
    sessionQuality,
    processDecision,
    getAuditReport 
  } = useDecisionalGateway()
  
  // Multi-agent hooks
  const {
    agentSummaries,
    systemHealth,
    processWithAllAgents,
    processWithSequentialAgents,
    processWithSingleAgent,
    selectOptimalAgents,
    resetAgent,
    toggleAgent
  } = useMultiAgentGateway()
  
  const chatEndRef = useRef<HTMLDivElement>(null)
  const decisionsEndRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    decisionsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, decisions])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || chatLoading) return
    
    try {
      if (activeTab === 'multi') {
        // Process with multi-agent system
        const [, agentResults] = await Promise.all([
          sendMessage(input),
          processWithSequentialAgents(input)
        ])
        
        setMultiAgentResults(prev => [...agentResults, ...prev])
        console.log('Multi-agent results:', agentResults)
      } else {
        // Process with single agent (legacy)
        const [, decisionId] = await Promise.all([
          sendMessage(input),
          processDecision(input)
        ])
        
        console.log('Decision processed:', decisionId)
      }
    } catch (error) {
      console.error('Processing failed:', error)
    }
    
    setInput('')
  }
  
  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden flex flex-col">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10 flex flex-col h-full p-4">
        {/* Header - FLEX SHRINK */}
        <div className="text-center mb-6 flex-shrink-0">
          {/* Main Title - COMPACT */}
          <div className="mb-4">
            <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Multi-Agent Gateway
            </h1>
            <div className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-1">
              PoC v2.0
            </div>
            <p className="text-sm text-gray-300">Creado por <span className="font-bold text-cyan-400">Bernard Orozco</span> 🚀</p>
          </div>
          
          {/* Tab Selector with Glassmorphism */}
          <div className="flex justify-center mt-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 shadow-2xl border border-white/20">
              <button
                onClick={() => setActiveTab('multi')}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 ${
                  activeTab === 'multi' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50' 
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                🤖 Multi-Agent System
              </button>
              <button
                onClick={() => setActiveTab('single')}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 ${
                  activeTab === 'single' 
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/50' 
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                ⚡ Single Agent (Legacy)
              </button>
            </div>
          </div>
        </div>
        
        {/* Split Screen Layout - FLEX GROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
          
          {/* Left Panel - Chat */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 flex flex-col shadow-2xl border border-white/20 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-cyan-500/20" style={{height: 'calc(100vh - 200px)'}}>
            <h2 className="text-3xl font-bold mb-4 text-white flex-shrink-0 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              💬 Chat Médico
            </h2>
            
            {/* Chat Messages Container - ALTURA FIJA BRUTAL */}
            <div className="overflow-y-auto bg-black/20 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-white/10 custom-scrollbar" style={{height: '400px'}}>
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-300">
                  <div className="text-center">
                    <div className="text-6xl mb-4 animate-bounce">🩺</div>
                    <p className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      Inicia la conversación médica...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`${msg.role === 'user' ? 'text-right' : 'text-left'} animate-fadeIn`}>
                      <div className={`inline-block p-4 rounded-2xl max-w-[85%] break-words transition-all duration-300 transform hover:scale-105 ${
                        msg.role === 'user' 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50' 
                          : 'bg-white/20 backdrop-blur-sm text-gray-100 border border-white/20 shadow-lg'
                      }`}>
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {chatLoading && (
                    <div className="text-left">
                      <div className="inline-block p-3 bg-gray-200 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>
            
            {/* Input Form - Enhanced with Glassmorphism */}
            <div className="flex-shrink-0">
              <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-white/20">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Describe síntomas médicos o solicita validación..."
                    className="flex-1 p-4 bg-black/20 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 text-white placeholder-gray-300 transition-all duration-300"
                    disabled={chatLoading || decisionLoading}
                  />
                  <button
                    type="submit"
                    disabled={chatLoading || decisionLoading || !input.trim()}
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-6 py-4 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/50 whitespace-nowrap"
                  >
                    {chatLoading || decisionLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Procesando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>Enviar</span>
                        <span>🚀</span>
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Right Panel - Multi-Agent or Single Agent */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 flex flex-col shadow-2xl border border-white/20 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-purple-500/20" style={{height: 'calc(100vh - 200px)'}}>
            {activeTab === 'multi' ? (
              <>
                <h2 className="text-3xl font-bold mb-4 text-white flex-shrink-0 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  🤖 Multi-Agent System
                </h2>
                
                {/* System Health Panel */}
                <div className="flex-shrink-0 mb-4">
                  <SystemHealthPanel systemHealth={systemHealth} />
                </div>
                
                {/* Agent Status Grid - COMPACT */}
                <div className="flex-shrink-0 mb-4">
                  <div className="font-bold text-lg text-white mb-3 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    🔧 Agent Status
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(agentSummaries || []).map((summary) => (
                      <AgentStatusCard 
                        key={summary.agentType} 
                        agentType={summary.agentType}
                        summary={summary}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Multi-Agent Results Timeline - ALTURA FIJA BRUTAL */}
                <div className="overflow-y-auto space-y-3 custom-scrollbar" style={{height: '300px'}}>
                  <div className="font-bold text-lg text-white sticky top-0 bg-gradient-to-r from-purple-900/90 to-slate-900/90 backdrop-blur-sm pb-2 rounded-lg mb-3 px-3 py-2 border border-white/20">
                    ⚡ Agent Decisions
                  </div>
                  
                  {systemHealth?.activeRequests > 0 && (
                    <div className="border-2 border-blue-300 bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-blue-700">Processing {systemHealth?.activeRequests || 0} agents...</span>
                      </div>
                    </div>
                  )}
                  
                  {multiAgentResults.length === 0 && (systemHealth?.activeRequests || 0) === 0 ? (
                    <div className="flex items-center justify-center h-32 text-gray-500">
                      <div className="text-center">
                        <div className="text-3xl mb-2">🚀</div>
                        <p>No agent decisions yet</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {multiAgentResults.map((result) => (
                        <MultiAgentDecisionCard key={result.id} result={result} />
                      ))}
                      <div ref={decisionsEndRef} />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-4 text-gray-800 flex-shrink-0">⚡ Single Agent (Legacy)</h2>
                
                <div className="flex-shrink-0 mb-4">
                  <StatsPanel stats={stats} activeProvider={activeProvider} />
                  <AuditQualityPanel sessionQuality={sessionQuality} auditEntries={auditEntries} />
                </div>
            
            {/* Decisions Timeline with Scroll */}
            <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
              <div className="font-bold text-lg text-gray-700 sticky top-0 bg-white pb-2">Timeline de Decisiones</div>
              
              {decisionLoading && (
                <div className="border-2 border-yellow-300 bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-yellow-700">Processing decision...</span>
                  </div>
                </div>
              )}
              
              {decisions.length === 0 && !decisionLoading ? (
                <div className="flex items-center justify-center h-32 text-gray-500">
                  <div className="text-center">
                    <div className="text-3xl mb-2">⚡</div>
                    <p>No hay decisiones aún</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {decisions.map((decision) => (
                    <DecisionCard key={decision.id} decision={decision} />
                  ))}
                  <div ref={decisionsEndRef} />
                </div>
              )}
            </div>
            
                {/* Redux State Viewer - Fixed at Bottom */}
                <div className="flex-shrink-0 mt-4">
                  <ReduxStateViewer decisions={decisions} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}