// src/components/GatewayDashboard.tsx
// Creado por Bernard Orozco
'use client'

import { useState, useEffect, useRef } from 'react'
import { useClaudeChat } from '@/hooks/useClaudeChat'
import { useDecisionalGateway } from '@/hooks/useDecisionalGateway'
import { ProviderType, DecisionStatus, DecisionItem } from '@/types/decisional'

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

// Stats Panel Component
const StatsPanel = ({ stats, activeProvider }: { 
  stats: any, 
  activeProvider: ProviderType 
}) => (
  <div className="grid grid-cols-2 gap-4 mb-6">
    <div className="bg-white rounded-lg p-4 shadow-lg border">
      <div className="text-3xl font-bold text-blue-600">{stats.totalProcessed}</div>
      <div className="text-sm text-gray-500">Total Decisions</div>
    </div>
    
    <div className="bg-white rounded-lg p-4 shadow-lg border">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-bold">Active</div>
          <div className="text-xs text-gray-500">Provider</div>
        </div>
        <ProviderBadge provider={activeProvider} />
      </div>
    </div>
    
    <div className="bg-white rounded-lg p-4 shadow-lg border">
      <div className="text-2xl font-bold text-green-600">{stats.averageConfidence}%</div>
      <div className="text-sm text-gray-500">Avg Confidence</div>
    </div>
    
    <div className="bg-white rounded-lg p-4 shadow-lg border">
      <div className="text-2xl font-bold text-purple-600">{stats.averageLatency}ms</div>
      <div className="text-sm text-gray-500">Avg Latency</div>
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

// Main Component
export const GatewayDashboard = () => {
  const [input, setInput] = useState('')
  const { messages, isLoading: chatLoading, sendMessage } = useClaudeChat()
  const { 
    decisions, 
    activeProvider, 
    loading: decisionLoading, 
    stats,
    processDecision 
  } = useDecisionalGateway()
  
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
      // Process both chat and decision in parallel
      const [, decisionId] = await Promise.all([
        sendMessage(input),
        processDecision(input)
      ])
      
      console.log('Decision processed:', decisionId)
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
            Gateway Decisional PoC
          </h1>
          <p className="text-gray-600">Creado por <span className="font-bold">Bernard Orozco</span></p>
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
          
          {/* Right Panel - Decisions */}
          <div className="bg-white rounded-lg p-6 flex flex-col h-full">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 flex-shrink-0">Decisiones Estructuradas</h2>
            
            <div className="flex-shrink-0 mb-4">
              <StatsPanel stats={stats} activeProvider={activeProvider} />
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
          </div>
        </div>
      </div>
    </div>
  )
}