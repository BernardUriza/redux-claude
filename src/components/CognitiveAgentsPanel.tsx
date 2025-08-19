// src/components/CognitiveAgentsPanel.tsx
// Panel de Agentes Cognitivos Especializados - Creado por Bernard Orozco

'use client'

import { useState, useEffect } from 'react'

interface SpecializedAgent {
  id: string
  name: string
  specialty: string
  confidence: number
  status: 'idle' | 'active' | 'completed' | 'consulting'
  insights: string[]
  recommendation?: string
  consultationTime?: number
}

const getAgentIcon = (specialty: string) => {
  switch (specialty.toLowerCase()) {
    case 'cardiologia':
    case 'cardiology':
      return '❤️'
    case 'neurologia':
    case 'neurology':
      return '🧠'
    case 'pediatria':
    case 'pediatrics':
      return '👶'
    case 'endocrinologia':
    case 'endocrinology':
      return '🔬'
    case 'infectologia':
    case 'infectious_disease':
      return '🦠'
    case 'medicina_general':
    case 'general_medicine':
      return '🩺'
    case 'psiquiatria':
    case 'psychiatry':
      return '🧘'
    case 'medicina_emergencia':
    case 'emergency_medicine':
      return '🚑'
    default:
      return '👨‍⚕️'
  }
}

const getSpecialtyColor = (specialty: string) => {
  switch (specialty.toLowerCase()) {
    case 'cardiologia':
    case 'cardiology':
      return 'from-red-500 to-pink-500'
    case 'neurologia':
    case 'neurology':
      return 'from-purple-500 to-indigo-500'
    case 'pediatria':
    case 'pediatrics':
      return 'from-blue-500 to-cyan-500'
    case 'endocrinologia':
    case 'endocrinology':
      return 'from-green-500 to-teal-500'
    case 'infectologia':
    case 'infectious_disease':
      return 'from-orange-500 to-yellow-500'
    case 'medicina_general':
    case 'general_medicine':
      return 'from-slate-500 to-gray-500'
    case 'psiquiatria':
    case 'psychiatry':
      return 'from-violet-500 to-purple-500'
    case 'medicina_emergencia':
    case 'emergency_medicine':
      return 'from-red-600 to-orange-600'
    default:
      return 'from-blue-500 to-cyan-500'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
    case 'consulting':
      return 'text-purple-400 bg-purple-500/20 border-purple-500/30'
    case 'completed':
      return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30'
    default:
      return 'text-slate-400 bg-slate-500/20 border-slate-500/30'
  }
}

interface AgentCardProps {
  agent: SpecializedAgent
  isHighlighted?: boolean
}

const AgentCard = ({ agent, isHighlighted }: AgentCardProps) => {
  const colorGradient = getSpecialtyColor(agent.specialty)
  const statusColor = getStatusColor(agent.status)

  return (
    <div className={`relative bg-gradient-to-br ${colorGradient} bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border transition-all duration-300 ${
      isHighlighted 
        ? 'border-blue-400 shadow-lg shadow-blue-500/20 scale-105' 
        : 'border-slate-600/30 hover:border-slate-500/50'
    }`}>
      
      {/* Agent Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 bg-gradient-to-br ${colorGradient} rounded-xl flex items-center justify-center text-lg`}>
            {getAgentIcon(agent.specialty)}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">{agent.name}</h4>
            <p className="text-xs text-slate-400 capitalize">{agent.specialty.replace('_', ' ')}</p>
          </div>
        </div>
        
        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
          {agent.status === 'consulting' && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 border border-purple-400 border-t-transparent rounded-full animate-spin" />
              <span>Consultando</span>
            </div>
          )}
          {agent.status === 'active' && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span>Activo</span>
            </div>
          )}
          {agent.status === 'completed' && <span>Completado</span>}
          {agent.status === 'idle' && <span>En espera</span>}
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-slate-400">Confianza</span>
          <span className="text-xs text-white font-medium">{Math.round(agent.confidence * 100)}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-1.5">
          <div 
            className={`bg-gradient-to-r ${colorGradient} h-1.5 rounded-full transition-all duration-500`}
            style={{ width: `${Math.round(agent.confidence * 100)}%` }}
          />
        </div>
      </div>

      {/* Insights */}
      {agent.insights.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-slate-400 mb-2">Insights:</p>
          <div className="space-y-1">
            {agent.insights.slice(0, 2).map((insight, idx) => (
              <p key={idx} className="text-xs text-slate-300 bg-slate-800/30 rounded px-2 py-1">
                • {insight}
              </p>
            ))}
            {agent.insights.length > 2 && (
              <p className="text-xs text-slate-500 px-2">+{agent.insights.length - 2} insights más</p>
            )}
          </div>
        </div>
      )}

      {/* Recommendation */}
      {agent.recommendation && (
        <div className="bg-slate-900/50 rounded-lg p-2">
          <p className="text-xs text-slate-400 mb-1">Recomendación:</p>
          <p className="text-xs text-white">{agent.recommendation}</p>
        </div>
      )}

      {/* Consultation Time */}
      {agent.consultationTime && (
        <div className="mt-2 pt-2 border-t border-slate-700">
          <p className="text-xs text-slate-500">Tiempo: {agent.consultationTime}ms</p>
        </div>
      )}
    </div>
  )
}

export const CognitiveAgentsPanel = () => {
  const [agents, setAgents] = useState<SpecializedAgent[]>([
    {
      id: 'general',
      name: 'Dr. Médico General',
      specialty: 'medicina_general',
      confidence: 0.85,
      status: 'completed',
      insights: [
        'Cuadro clínico compatible con síndrome metabólico',
        'Factores de riesgo cardiovascular presentes'
      ],
      recommendation: 'Evaluación cardiovascular integral y seguimiento endocrinológico',
      consultationTime: 1240
    },
    {
      id: 'cardio',
      name: 'Dr. Cardiólogo',
      specialty: 'cardiologia',
      confidence: 0.92,
      status: 'consulting',
      insights: [
        'Perfil lipídico alterado sugiere dislipidemia mixta',
        'Presión arterial borderline requiere monitoreo'
      ],
      consultationTime: 890
    },
    {
      id: 'endo',
      name: 'Dr. Endocrinólogo',
      specialty: 'endocrinologia',
      confidence: 0.78,
      status: 'active',
      insights: [
        'HbA1c elevada indica pre-diabetes',
        'IMC sugiere obesidad grado I'
      ]
    }
  ])

  const [consensusData, setConsensusData] = useState({
    achieved: false,
    percentage: 72,
    conflictingPoints: ['Prioridad de tratamiento', 'Necesidad de estudios adicionales'],
    agreements: ['Diagnóstico de síndrome metabólico', 'Necesidad de cambios de estilo de vida']
  })

  // Simular progreso de consulta
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => {
        if (agent.status === 'consulting') {
          return {
            ...agent,
            confidence: Math.min(agent.confidence + 0.02, 0.95),
            consultationTime: (agent.consultationTime || 0) + 100
          }
        }
        return agent
      }))

      setConsensusData(prev => ({
        ...prev,
        percentage: Math.min(prev.percentage + 1, 85)
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const activeAgents = agents.filter(agent => agent.status !== 'idle')
  const completedAgents = agents.filter(agent => agent.status === 'completed')

  return (
    <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30 mb-4">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs">🧠</span>
          </div>
          <h3 className="text-lg font-semibold text-white">Orquestador Cognitivo</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-400">
            {activeAgents.length} agentes activos
          </span>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Consensus Meter */}
      <div className="mb-4 bg-slate-900/30 rounded-lg p-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-slate-400">Consenso Médico</span>
          <span className="text-sm font-semibold text-white">{consensusData.percentage}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              consensusData.percentage > 80 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                : consensusData.percentage > 60
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                : 'bg-gradient-to-r from-red-500 to-pink-500'
            }`}
            style={{ width: `${consensusData.percentage}%` }}
          />
        </div>
        
        {consensusData.agreements.length > 0 && (
          <div className="text-xs text-emerald-400">
            ✅ Acuerdos: {consensusData.agreements.join(', ')}
          </div>
        )}
        
        {consensusData.conflictingPoints.length > 0 && (
          <div className="text-xs text-yellow-400 mt-1">
            ⚠️ En discusión: {consensusData.conflictingPoints.join(', ')}
          </div>
        )}
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {agents.map((agent, index) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            isHighlighted={agent.status === 'consulting'}
          />
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-4 pt-3 border-t border-slate-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-white">{completedAgents.length}</p>
            <p className="text-xs text-slate-400">Consultados</p>
          </div>
          <div>
            <p className="text-lg font-bold text-white">
              {Math.round(agents.reduce((sum, agent) => sum + agent.confidence, 0) / agents.length * 100)}%
            </p>
            <p className="text-xs text-slate-400">Confianza Promedio</p>
          </div>
          <div>
            <p className="text-lg font-bold text-white">
              {Math.round(agents.reduce((sum, agent) => sum + (agent.consultationTime || 0), 0) / 1000)}s
            </p>
            <p className="text-xs text-slate-400">Tiempo Total</p>
          </div>
        </div>
      </div>
    </div>
  )
}