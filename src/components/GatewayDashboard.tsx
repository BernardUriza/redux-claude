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
    <div className={`rounded-lg p-4 border-2 ${getStatusColor(summary.status, summary.health.circuitBreakerState)}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{agent.icon}</span>
          <div>
            <div className="font-bold text-sm">{agent.name}</div>
            <div className="text-xs text-gray-500">{agentType.toUpperCase()}</div>
          </div>
        </div>
        <div className="text-xl">
          {getStatusIcon(summary.status, summary.health.circuitBreakerState)}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <div className="font-bold">{summary.health.successRate}%</div>
          <div className="text-gray-500">Success</div>
        </div>
        <div>
          <div className="font-bold">{summary.health.avgLatency}ms</div>
          <div className="text-gray-500">Latency</div>
        </div>
        <div>
          <div className="font-bold">{summary.health.totalCalls}</div>
          <div className="text-gray-500">Calls</div>
        </div>
      </div>

      {summary.health.circuitBreakerState === CircuitBreakerState.OPEN && (
        <div className="mt-2 text-xs text-red-600">
          Circuit Open - Failures: {summary.health.failures}
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
  <div className="grid grid-cols-4 gap-3 mb-4">
    <div className="bg-white rounded-lg p-3 shadow border">
      <div className="text-2xl font-bold text-blue-600">{systemHealth.availableAgents}</div>
      <div className="text-xs text-gray-500">Available Agents</div>
    </div>
    
    <div className="bg-white rounded-lg p-3 shadow border">
      <div className="text-2xl font-bold text-green-600">{systemHealth.avgSuccessRate}%</div>
      <div className="text-xs text-gray-500">System Success</div>
    </div>
    
    <div className="bg-white rounded-lg p-3 shadow border">
      <div className="text-2xl font-bold text-purple-600">{systemHealth.avgLatency}ms</div>
      <div className="text-xs text-gray-500">System Latency</div>
    </div>
    
    <div className="bg-white rounded-lg p-3 shadow border">
      <div className={`text-2xl font-bold ${systemHealth.isHealthy ? 'text-green-600' : 'text-red-600'}`}>
        {systemHealth.isHealthy ? '✅' : '❌'}
      </div>
      <div className="text-xs text-gray-500">System Health</div>
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
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Multi-Agent Gateway PoC
          </h1>
          <p className="text-gray-600">Creado por <span className="font-bold">Bernard Orozco</span></p>
          
          {/* Tab Selector */}
          <div className="flex justify-center mt-4">
            <div className="bg-white rounded-lg p-1 shadow">
              <button
                onClick={() => setActiveTab('multi')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'multi' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                🤖 Multi-Agent System
              </button>
              <button
                onClick={() => setActiveTab('single')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'single' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                ⚡ Single Agent (Legacy)
              </button>
            </div>
          </div>
        </div>
        
        {/* Split Screen Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ height: 'calc(100vh - 200px)' }}>
          
          {/* Left Panel - Chat */}
          <div className="bg-gray-50 rounded-lg p-6 flex flex-col h-full">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 flex-shrink-0">Chat Médico</h2>
            
            {/* Chat Messages Container with Proper Scroll */}
            <div className="flex-1 overflow-y-auto bg-white rounded-lg p-4 mb-4 min-h-0">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🩺</div>
                    <p>Inicia la conversación médica...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block p-3 rounded-lg max-w-[85%] break-words ${
                        msg.role === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-800'
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
            
            {/* Input Form - Fixed at Bottom */}
            <div className="flex-shrink-0">
              <form onSubmit={handleSubmit} className="bg-white rounded-lg p-4 shadow-lg border">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Describe síntomas médicos o solicita validación..."
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                    disabled={chatLoading || decisionLoading}
                  />
                  <button
                    type="submit"
                    disabled={chatLoading || decisionLoading || !input.trim()}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
                  >
                    {chatLoading || decisionLoading ? 'Procesando...' : 'Enviar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Right Panel - Multi-Agent or Single Agent */}
          <div className="bg-white rounded-lg p-6 flex flex-col h-full">
            {activeTab === 'multi' ? (
              <>
                <h2 className="text-2xl font-bold mb-4 text-gray-800 flex-shrink-0">🤖 Multi-Agent System</h2>
                
                {/* System Health Panel */}
                <div className="flex-shrink-0 mb-4">
                  <SystemHealthPanel systemHealth={systemHealth} />
                </div>
                
                {/* Agent Status Grid */}
                <div className="flex-shrink-0 mb-4">
                  <div className="font-bold text-lg text-gray-700 mb-3">Agent Status</div>
                  <div className="grid grid-cols-2 gap-3">
                    {(agentSummaries || []).map((summary) => (
                      <AgentStatusCard 
                        key={summary.agentType} 
                        agentType={summary.agentType}
                        summary={summary}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Multi-Agent Results Timeline */}
                <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
                  <div className="font-bold text-lg text-gray-700 sticky top-0 bg-white pb-2">Agent Decisions</div>
                  
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