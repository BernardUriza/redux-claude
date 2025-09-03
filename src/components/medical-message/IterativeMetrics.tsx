// src/components/medical-message/IterativeMetrics.tsx
// Iterative Processing Metrics - Extracted from EnhancedMedicalMessage

'use client'

interface IterativeMetricsProps {
  content: string
}

export const IterativeMetrics = ({ content }: IterativeMetricsProps) => {
  // Extract iterative metrics
  const cyclesMatch = content.match(/\*\*🔄 Ciclos Diagnósticos:\*\* (\d+)/)?.[1]
  const timeMatch = content.match(/\*\*⏱️ Tiempo Total:\*\* (\d+)ms/)?.[1]
  const confidenceMatch = content.match(/\*\*🎯 Confianza Global:\*\* (\d+)%/)?.[1]

  if (!cyclesMatch && !timeMatch && !confidenceMatch) return null

  return (
    <div className="mt-4 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20">
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-lg">📊</span>
        <h4 className="text-sm font-semibold text-blue-300">Métricas Iterativas</h4>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        {cyclesMatch && (
          <div>
            <div className="text-lg font-bold text-white">{cyclesMatch}</div>
            <div className="text-xs text-blue-300">Ciclos</div>
          </div>
        )}

        {confidenceMatch && (
          <div>
            <div className="text-lg font-bold text-white">{confidenceMatch}%</div>
            <div className="text-xs text-blue-300">Confianza</div>
          </div>
        )}

        {timeMatch && (
          <div>
            <div className="text-lg font-bold text-white">{timeMatch}ms</div>
            <div className="text-xs text-blue-300">Tiempo</div>
          </div>
        )}
      </div>
    </div>
  )
}
