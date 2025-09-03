// src/components/medical-message/StreamingIndicator.tsx
// Streaming Status Indicator - Extracted from EnhancedMedicalMessage

'use client'

interface StreamingIndicatorProps {
  isSOAPAnalysis: boolean
}

export const StreamingIndicator = ({ isSOAPAnalysis }: StreamingIndicatorProps) => {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <div
          className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"
          style={{ animationDelay: '0.2s' }}
        ></div>
        <div
          className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"
          style={{ animationDelay: '0.4s' }}
        ></div>
      </div>
      <span className="text-blue-400 font-medium">
        {isSOAPAnalysis ? 'Generando análisis SOAP...' : 'Procesando consulta...'}
      </span>
    </div>
  )
}
