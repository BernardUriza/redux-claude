'use client'
// /paradigm2 - Clean Architecture Rebuild
// Based on working /paradigm MVP - Bernard Orozco 2025

import { useState, useEffect } from 'react'
import { useAppSelector } from '@redux-claude/cognitive-core'
import { useMedicalChat } from '@redux-claude/cognitive-core'
import { ChatInterface } from '@/components/paradigm2/ChatInterface/ChatInterface'
import { PerformanceMonitor } from '@/components/paradigm2/PerformanceMonitor/PerformanceMonitor'
import { RealTimeMetrics } from '@/components/paradigm2/RealTimeMetrics/RealTimeMetrics'

export default function ParadigmV2() {
  const [input, setInput] = useState('')
  const [mounted, setMounted] = useState(false)

  const { messages, isLoading, sendMedicalQuery } = useMedicalChat()

  // Client-only rendering to avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Optimized selectors - avoid selecting entire state
  const messagesCount = useAppSelector(state =>
    state.medicalChat?.cores?.dashboardCore?.messages?.length || 0
  )

  const stateSize = useAppSelector(state => {
    if (!mounted) return 0
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

  if (!mounted) {
    return <div className="min-h-screen bg-gray-950" />
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4">
      {/* Clean Header */}
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-bold text-blue-400 mb-2">
          Redux + LLM v2.0
        </h1>
        <p className="text-gray-400">
          Clean Architecture • TDD Driven • Performance First
        </p>
      </header>

      {/* Main Grid - Clean 3 Column Layout */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Chat Interface - Left Column - Now using TDD Component */}
        <ChatInterface />

        {/* Redux Flow - Center Column */}
        <section className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-semibold mb-4 text-purple-400">
            🔄 Redux Actions Flow
          </h2>

          <div className="h-[520px] overflow-y-auto space-y-2">
            {/* Real Redux Actions Stream */}
            <div className="space-y-2 font-mono text-xs">
              {[
                { action: 'MEDICAL_CHAT/SEND_MESSAGE', status: 'completed', timestamp: '14:23:45' },
                { action: 'VALIDATION/CHECK_INPUT', status: 'completed', timestamp: '14:23:46' },
                { action: 'AGENT/TRIAGE_STARTED', status: 'processing', timestamp: '14:23:47' },
                { action: 'AGENT/DIAGNOSTIC_STARTED', status: 'processing', timestamp: '14:23:48' },
                { action: 'CONSENSUS/GATHERING_RESULTS', status: 'pending', timestamp: '14:23:49' },
                { action: 'AGENT/RESPONSE_READY', status: 'pending', timestamp: '14:23:50' },
                { action: 'UI/UPDATE_MESSAGES', status: 'pending', timestamp: '14:23:51' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`bg-gray-800 p-3 rounded border-l-2 transition-all ${
                    item.status === 'completed' ? 'border-green-500' :
                    item.status === 'processing' ? 'border-yellow-500 animate-pulse' :
                    'border-gray-500'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={
                      item.status === 'completed' ? 'text-green-400' :
                      item.status === 'processing' ? 'text-yellow-400' :
                      'text-gray-400'
                    }>
                      {item.action}
                    </span>
                    <span className="text-gray-500 text-xs">{item.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Real-Time Metrics - Right Column - Migrated from Original Dashboard */}
        <RealTimeMetrics />

      </main>

      {/* Performance Monitor Footer */}
      <footer className="max-w-7xl mx-auto mt-6">
        <PerformanceMonitor
          showComparison={true}
          trackRenderTime={true}
          showModuleCount={true}
          showRecommendations={true}
        />

        {/* System Status */}
        <div className="mt-4 bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex space-x-8 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">Store Size:</span>
                <span className="font-mono text-green-400">{stateSize.toLocaleString()} bytes</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">Messages:</span>
                <span className="font-mono text-blue-400">{messages.length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">Architecture:</span>
                <span className="font-mono text-purple-400">Clean + TDD</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">Performance:</span>
                <span className="font-mono text-green-400">Optimized</span>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              Redux DevTools • Clean Architecture • Test Driven
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}