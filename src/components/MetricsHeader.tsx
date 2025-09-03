// src/components/MetricsHeader.tsx
// Metrics panel header with stats - extracted from MedicalMetricsPanel.tsx
'use client'

interface MetricsHeaderProps {
  cognitiveMetrics?: {
    systemConfidence: number
    activeDebates: number
  } | null
  messagesCount: number
}

export const MetricsHeader: React.FC<MetricsHeaderProps> = ({
  cognitiveMetrics,
  messagesCount,
}) => {
  return (
    <div className="mb-6 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25">
            <span className="text-white text-xs">📊</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Panel Médico</h2>
            <p className="text-xs text-slate-400">Sistema Cognitivo v2.0</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-1">
          <button
            className="p-1.5 hover:bg-slate-700/50 rounded-lg transition-colors"
            title="Actualizar métricas"
          >
            <svg
              className="w-3.5 h-3.5 text-slate-400 hover:text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
          <button
            className="p-1.5 hover:bg-slate-700/50 rounded-lg transition-colors"
            title="Configurar panel"
          >
            <svg
              className="w-3.5 h-3.5 text-slate-400 hover:text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Quick Stats Overview - Ultra Compact */}
      {cognitiveMetrics ? (
        <div className="flex gap-1 mb-2">
          <div className="bg-emerald-500/20 rounded p-1 flex-1 border border-emerald-500/30">
            <div className="text-xs font-bold text-emerald-400">
              {cognitiveMetrics?.systemConfidence || 0}%
            </div>
          </div>
          <div className="bg-blue-500/20 rounded p-1 flex-1 border border-blue-500/30">
            <div className="text-xs font-bold text-blue-400">
              {cognitiveMetrics?.activeDebates || 0}
            </div>
          </div>
          <div className="bg-orange-500/20 rounded p-1 flex-1 border border-orange-500/30">
            <div className="text-xs font-bold text-orange-400">{messagesCount}</div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-700/30 rounded p-2 border border-slate-600/30 text-center mb-2">
          <div className="text-slate-400 text-xs">Sin análisis</div>
        </div>
      )}
    </div>
  )
}
