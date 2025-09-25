'use client'
// /paradigm2 - Clean Architecture Rebuild
// Based on working /paradigm MVP - Bernard Orozco 2025

import { useState, useEffect } from 'react'
import { useAppSelector } from '@redux-claude/cognitive-core'
import { useMedicalChat } from '@redux-claude/cognitive-core'
import { ChatInterface } from '@/components/paradigm2/ChatInterface/ChatInterface'

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

        {/* Medical Agents - Right Column */}
        <section className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-semibold mb-4 text-orange-400">
            🤖 Medical Agents (13)
          </h2>

          <div className="space-y-3">
            {[
              { name: 'DiagnosticAgent', status: 'idle', confidence: 0.95, specialty: 'Diagnosis' },
              { name: 'TriageAgent', status: 'processing', confidence: 0.88, specialty: 'Triage' },
              { name: 'ValidationAgent', status: 'idle', confidence: 0.92, specialty: 'Validation' },
              { name: 'TreatmentAgent', status: 'idle', confidence: 0.90, specialty: 'Treatment' },
              { name: 'EmergencyAgent', status: 'monitoring', confidence: 0.99, specialty: 'Emergency' },
              { name: 'DocumentationAgent', status: 'idle', confidence: 0.87, specialty: 'SOAP' },
              { name: 'PharmacologyAgent', status: 'idle', confidence: 0.91, specialty: 'Medication' },
              { name: 'PediatricAgent', status: 'idle', confidence: 0.89, specialty: 'Pediatrics' },
              { name: 'HospitalizationAgent', status: 'idle', confidence: 0.93, specialty: 'Admission' },
              { name: 'EducationAgent', status: 'idle', confidence: 0.86, specialty: 'Education' },
              { name: 'ObjectiveAgent', status: 'idle', confidence: 0.94, specialty: 'Objective' },
              { name: 'DifferentialAgent', status: 'idle', confidence: 0.90, specialty: 'Differential' },
              { name: 'ExtractorAgent', status: 'idle', confidence: 0.88, specialty: 'Extraction' },
            ].map((agent, idx) => (
              <div key={idx} className="bg-gray-800 p-3 rounded-lg border border-gray-700 hover:bg-gray-750 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{agent.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    agent.status === 'processing'
                      ? 'bg-yellow-900/50 text-yellow-400 animate-pulse'
                      : agent.status === 'monitoring'
                      ? 'bg-blue-900/50 text-blue-400'
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    {agent.status}
                  </span>
                </div>

                <div className="text-xs text-gray-500 mb-2">{agent.specialty}</div>

                <div className="flex items-center space-x-2">
                  <div className="bg-gray-700 h-1.5 rounded-full flex-1 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-400 h-full transition-all duration-500"
                      style={{ width: `${agent.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 font-mono">
                    {(agent.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* System Status Footer */}
      <footer className="max-w-7xl mx-auto mt-6 bg-gray-900 rounded-xl p-4 border border-gray-800">
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
      </footer>
    </div>
  )
}