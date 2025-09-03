// src/components/medical-message/AgentInsights.tsx
// Agent Insights Panel - Extracted from EnhancedMedicalMessage

'use client'

interface AgentInsightsProps {
  content: string
}

export const AgentInsights = ({ content }: AgentInsightsProps) => {
  // Detect cognitive analysis section
  const cognitiveMatch = content.match(
    /## 🧠 ANÁLISIS MULTI-AGENTE COGNITIVO([\s\S]*?)(?=\n##|\n\*|$)/
  )

  if (!cognitiveMatch) return null

  const cognitiveContent = cognitiveMatch[1]
  const agentsConsulted = cognitiveContent.match(
    /\*\*🎯 Agentes Especializados Consultados:\*\* (\d+)/
  )?.[1]
  const consensus = cognitiveContent.match(/\*\*🤝 Consenso Alcanzado:\*\* (✅ SÍ|❌ NO)/)?.[1]
  const validation = cognitiveContent.match(
    /\*\*🧩 Validación Especializada:\*\* (✅ ACTIVADA|❌ NO APLICADA)/
  )?.[1]

  return (
    <div className="mt-4 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-lg">🧠</span>
        <h4 className="text-sm font-semibold text-purple-300">Orquestador Cognitivo</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {agentsConsulted && (
          <div className="text-center">
            <div className="text-lg font-bold text-white">{agentsConsulted}</div>
            <div className="text-xs text-purple-300">Agentes Consultados</div>
          </div>
        )}

        {consensus && (
          <div className="text-center">
            <div className="text-lg">{consensus.includes('SÍ') ? '✅' : '❌'}</div>
            <div className="text-xs text-purple-300">Consenso</div>
          </div>
        )}

        {validation && (
          <div className="text-center">
            <div className="text-lg">{validation.includes('ACTIVADA') ? '✅' : '❌'}</div>
            <div className="text-xs text-purple-300">Validación</div>
          </div>
        )}
      </div>
    </div>
  )
}
