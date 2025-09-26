'use client'
// Redux Brain Medical System - Main Interface
// Uses REST API instead of direct hooks - Bernard Orozco 2025

import { useState, useEffect } from 'react'
import { ChatInterfaceAPI } from '@/components/paradigm2/ChatInterface/ChatInterface.api'

export default function ParadigmV2() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🧠</div>
          <p className="text-gray-400">Loading Redux Brain Medical System...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Minimal Header */}
      <header className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-400">
              Redux Brain Medical System
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              REST API • SOAP Generation • Urgency Detection • Redux Actions
            </p>
          </div>
          <div className="text-xs text-gray-500">
            <p>Backend: /api/redux-brain/</p>
            <p>Version: 2.0 Production</p>
          </div>
        </div>
      </header>

      {/* Main Chat Interface */}
      <main className="max-w-7xl mx-auto p-4">
        <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 h-[calc(100vh-180px)]">
          <ChatInterfaceAPI />
        </div>
      </main>

      {/* Status Bar */}
      <footer className="bg-gray-900 border-t border-gray-800 p-3 fixed bottom-0 left-0 right-0">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-xs">
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              System Online
            </span>
            <span className="text-gray-400">
              Urgency Detection: Active
            </span>
            <span className="text-gray-400">
              SOAP Generation: Active
            </span>
            <span className="text-gray-400">
              Anti-Telenovela: Enabled
            </span>
          </div>
          <div className="text-gray-500">
            Redux+LLM Architecture • Defensive Medicine Active
          </div>
        </div>
      </footer>
    </div>
  )
}
