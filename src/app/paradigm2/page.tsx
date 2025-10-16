'use client'
// Redux Brain Medical System - Main Interface
// Uses REST API instead of direct hooks - Bernard Orozco 2025

import { useState, useEffect } from 'react'
import { ChatInterfaceAPI } from '@/presentation/features/chat/chat-interface'

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
    <div className="min-h-screen h-screen bg-gray-950 text-gray-100 flex flex-col overflow-hidden">
      {/* Mobile-Optimized Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 md:py-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-400">
              🧠 Redux Brain
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 hidden sm:block">
              REST API • SOAP Generation • Urgency Detection
            </p>
          </div>
          <div className="text-xs text-gray-500 hidden md:block">
            <p>Backend: /api/redux-brain/</p>
            <p>Version: 2.0 Production</p>
          </div>
        </div>
      </header>

      {/* Main Chat Interface - Full Height */}
      <main className="flex-1 overflow-hidden">
        <ChatInterfaceAPI />
      </main>

      {/* Mobile-Friendly Status Bar (Hidden on Mobile) */}
      <footer className="hidden sm:block bg-gray-900 border-t border-gray-800 p-2 md:p-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-xs gap-2">
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              System Online
            </span>
            <span className="text-gray-400 hidden sm:inline">Urgency: Active</span>
            <span className="text-gray-400 hidden md:inline">SOAP: Active</span>
            <span className="text-gray-400 hidden lg:inline">Anti-Telenovela: On</span>
          </div>
          <div className="text-gray-500 hidden lg:block">Redux+LLM • Defensive Medicine</div>
        </div>
      </footer>
    </div>
  )
}
