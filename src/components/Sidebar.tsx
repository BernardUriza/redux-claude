// src/components/Sidebar.tsx
// Sidebar navigation component - extracted from DashboardLayout.tsx
'use client'

import styles from '../styles/components/CognitiveDashboard.module.css'

interface SidebarProps {
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  cognitiveMetrics?: {
    systemConfidence: number
    activeDebates: number
  } | null
  onNewConsultation: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  sidebarCollapsed,
  setSidebarCollapsed,
  cognitiveMetrics,
  onNewConsultation,
}) => {
  return (
    <div className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : styles.expanded}`}>
      {/* Enhanced Sidebar Header */}
      <div className={styles.sidebarHeader}>
        <div className={styles.sidebarHeaderContent}>
          <div
            className={`flex items-center space-x-3 ${sidebarCollapsed ? 'justify-center' : ''}`}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <span className="text-white text-sm font-bold">🏥</span>
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className={styles.sidebarTitle}>Medical AI</h1>
                <p className={styles.sidebarSubtitle}>Cognitive Assistant</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors duration-200 text-slate-400 hover:text-white"
            title={sidebarCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${sidebarCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Enhanced New Chat Button */}
      <div className="p-4">
        <button
          onClick={onNewConsultation}
          className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl border border-emerald-500/30 transition-all duration-300 shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40`}
          title={sidebarCollapsed ? 'Nueva consulta' : ''}
        >
          <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center">
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          {!sidebarCollapsed && (
            <span className="text-sm font-medium text-white">New consultation</span>
          )}
        </button>
      </div>

      {/* Enhanced System Status */}
      <div className="px-4 py-2">
        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/80 backdrop-blur-xl rounded-xl p-3 border border-slate-600/30">
          {!sidebarCollapsed ? (
            <>
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs text-slate-300 font-medium">System Online</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Confidence:</span>
                  <span className="text-emerald-400 font-medium">
                    {cognitiveMetrics?.systemConfidence || 0}%
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Agents:</span>
                  <span className="text-blue-400 font-medium">5/5 active</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs text-emerald-400 font-bold">
                {cognitiveMetrics?.systemConfidence || 0}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Navigation */}
      <div className="flex-1 p-4">
        <nav className="space-y-2">
          {[
            { icon: '💊', label: 'Treatment Plans' },
            { icon: '🔍', label: 'Diagnostics' },
            { icon: '📊', label: 'Analytics' },
          ].map((item, index) => (
            <button
              key={index}
              className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-3 text-slate-300 hover:bg-slate-800/50 rounded-xl transition-all duration-200 hover:text-white group w-full`}
              title={sidebarCollapsed ? item.label : ''}
            >
              <span className="text-lg">{item.icon}</span>
              {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Enhanced Bottom Info */}
      <div className="p-4 border-t border-slate-700/50">
        {!sidebarCollapsed ? (
          <div className="text-xs text-slate-500 space-y-1">
            <p className="font-medium text-slate-400">Built by Bernard Orozco</p>
            <p>Powered by Claude AI</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-xs">🤖</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
