// src/components/CognitiveAgentsPanel.tsx
// Panel de Agentes Cognitivos Especializados - Creado por Bernard Orozco

'use client'

import { useState, useEffect } from 'react'
import type { MedicalMessage } from '@redux-claude/cognitive-core'

// Constantes de configuración
const DEFAULT_CONFIDENCE = 0.5
const MIN_CONFIDENCE = 0.1
const HIGH_CONFIDENCE = 0.95
const LOW_CONFIDENCE = 0.05
const MEDIUM_CONFIDENCE = 0.9
const CONSULTATION_TIME_BASE = 400
const CONFIDENCE_INCREMENT = 0.08
const MAX_CONFIDENCE = 0.92
const DERMATOLOGY_CONFIDENCE = 0.8
const CARDIOLOGY_CONFIDENCE = 0.7
const AGENT_CONFIDENCE_INCREMENT = 0.02

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

// Specialty mapping with both Spanish and English keys - BRUTAL OPTIMIZATION
const SPECIALTY_CONFIG = {
  // Cardiology
  cardiologia: { icon: '❤️', color: 'from-red-500 to-pink-500' },
  cardiology: { icon: '❤️', color: 'from-red-500 to-pink-500' },
  // Neurology
  neurologia: { icon: '🧠', color: 'from-purple-500 to-indigo-500' },
  neurology: { icon: '🧠', color: 'from-purple-500 to-indigo-500' },
  // Pediatrics
  pediatria: { icon: '👶', color: 'from-blue-500 to-cyan-500' },
  pediatrics: { icon: '👶', color: 'from-blue-500 to-cyan-500' },
  // Endocrinology
  endocrinologia: { icon: '🔬', color: 'from-green-500 to-teal-500' },
  endocrinology: { icon: '🔬', color: 'from-green-500 to-teal-500' },
  // Infectious Disease
  infectologia: { icon: '🦠', color: 'from-orange-500 to-yellow-500' },
  infectious_disease: { icon: '🦠', color: 'from-orange-500 to-yellow-500' },
  // General Medicine
  medicina_general: { icon: '🩺', color: 'from-slate-500 to-gray-500' },
  general_medicine: { icon: '🩺', color: 'from-slate-500 to-gray-500' },
  // Psychiatry
  psiquiatria: { icon: '🧘', color: 'from-violet-500 to-purple-500' },
  psychiatry: { icon: '🧘', color: 'from-violet-500 to-purple-500' },
  // Emergency Medicine
  medicina_emergencia: { icon: '🚑', color: 'from-red-600 to-orange-600' },
  emergency_medicine: { icon: '🚑', color: 'from-red-600 to-orange-600' },
  // Dermatology
  dermatologia: { icon: '🩻', color: 'from-amber-500 to-orange-500' },
  dermatology: { icon: '🩻', color: 'from-amber-500 to-orange-500' },
  // Allergology
  alergologia: { icon: '🌿', color: 'from-green-400 to-lime-400' },
  allergology: { icon: '🌿', color: 'from-green-400 to-lime-400' },
} as const

const DEFAULT_SPECIALTY = { icon: '👨‍⚕️', color: 'from-gray-500 to-slate-500' }

const getAgentIcon = (specialty: string): string => {
  const config = SPECIALTY_CONFIG[specialty.toLowerCase() as keyof typeof SPECIALTY_CONFIG]
  return config?.icon ?? DEFAULT_SPECIALTY.icon
}

const getSpecialtyColor = (specialty: string): string => {
  const config = SPECIALTY_CONFIG[specialty.toLowerCase() as keyof typeof SPECIALTY_CONFIG]
  return config?.color ?? DEFAULT_SPECIALTY.color
}

// Status color mapping - BRUTAL OPTIMIZATION
const STATUS_COLORS = {
  active: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
  consulting: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
  completed: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
  idle: 'text-slate-400 bg-slate-500/20 border-slate-500/30',
} as const

const getStatusColor = (status: string): string => {
  return STATUS_COLORS[status as keyof typeof STATUS_COLORS] ?? STATUS_COLORS.idle
}

// Constants for calculations - NO MORE MAGIC NUMBERS
const PERCENTAGE_MULTIPLIER = 100

interface AgentCardProps {
  agent: SpecializedAgent
  isHighlighted?: boolean
}

const AgentCard = ({ agent, isHighlighted }: AgentCardProps) => {
  const colorGradient = getSpecialtyColor(agent.specialty)
  const statusColor = getStatusColor(agent.status)

  return (
    <div
      className={`relative bg-gradient-to-br from-slate-900/80 to-slate-800/60 backdrop-blur-xl rounded-2xl p-5 border transition-all duration-300 ${
        isHighlighted
          ? 'border-blue-400/50 shadow-2xl shadow-blue-500/20 ring-1 ring-blue-400/30'
          : 'border-slate-600/40 hover:border-slate-500/60 hover:shadow-xl hover:shadow-slate-950/30'
      }`}
    >
      {/* Agent Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div
            className={`w-12 h-12 bg-gradient-to-br ${colorGradient} rounded-2xl flex items-center justify-center text-xl shadow-lg`}
          >
            {getAgentIcon(agent.specialty)}
          </div>
          <div className="flex-1">
            <h4 className="text-base font-semibold text-white mb-1">{agent.name}</h4>
            <p className="text-sm text-slate-400 capitalize font-medium">
              {agent.specialty.replace('_', ' ')}
            </p>
          </div>
        </div>

        <div
          className={`px-3 py-1.5 rounded-xl text-sm font-medium border ${statusColor} whitespace-nowrap`}
        >
          {agent.status === 'consulting' && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 border border-purple-400 border-t-transparent rounded-full animate-spin" />
              <span>Consultando</span>
            </div>
          )}
          {agent.status === 'active' && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span>Activo</span>
            </div>
          )}
          {agent.status === 'completed' && <span>Completado</span>}
          {agent.status === 'idle' && <span>En espera</span>}
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-slate-400 font-medium">Nivel de Confianza</span>
          <span className="text-sm text-white font-bold">
            {Math.round(agent.confidence * PERCENTAGE_MULTIPLIER)}%
          </span>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-2">
          <div
            className={`bg-gradient-to-r ${colorGradient} h-2 rounded-full transition-all duration-500 shadow-sm`}
            style={{ width: `${Math.round(agent.confidence * PERCENTAGE_MULTIPLIER)}%` }}
          />
        </div>
      </div>

      {/* Insights */}
      {agent.insights.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-slate-400 mb-3 font-medium">Insights Clínicos:</p>
          <div className="space-y-2">
            {agent.insights.slice(0, 2).map((insight, idx) => (
              <div
                key={idx}
                className="bg-slate-800/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-700/30"
              >
                <p className="text-sm text-slate-200 leading-relaxed">• {insight}</p>
              </div>
            ))}
            {agent.insights.length > 2 && (
              <div className="text-center">
                <span className="text-sm text-slate-500 bg-slate-800/30 px-3 py-1 rounded-full">
                  +{agent.insights.length - 2} insights adicionales
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recommendation */}
      {agent.recommendation && (
        <div className="bg-gradient-to-r from-blue-950/30 to-purple-950/30 backdrop-blur-sm rounded-xl p-4 border border-blue-700/20 mb-3">
          <p className="text-sm text-blue-300 mb-2 font-medium">💡 Recomendación:</p>
          <p className="text-sm text-slate-200 leading-relaxed">{agent.recommendation}</p>
        </div>
      )}

      {/* Consultation Time */}
      {agent.consultationTime && (
        <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
          <span className="text-sm text-slate-500">Tiempo de consulta:</span>
          <span className="text-sm text-slate-300 font-medium">{agent.consultationTime}ms</span>
        </div>
      )}
    </div>
  )
}

interface CognitiveAgentsPanelProps {
  lastMessage?: MedicalMessage
  isActive?: boolean
}

// Componente para el estado vacío
const EmptyAgentsState = () => (
  <div className="space-y-6">
    <div className="flex items-center space-x-4">
      <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center shadow-lg">
        <span className="text-white text-lg">🧠</span>
      </div>
      <div>
        <h3 className="text-xl font-bold text-white">Orquestador Cognitivo</h3>
        <p className="text-sm text-slate-400">Sistema de Consulta Multi-Especialista</p>
      </div>
    </div>
    <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/60 backdrop-blur-xl rounded-2xl p-8 border border-slate-600/30 text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
        <span className="text-2xl">👨‍⚕️</span>
      </div>
      <h3 className="text-slate-200 text-lg font-semibold mb-2">Sistema de Agentes en Espera</h3>
      <p className="text-slate-400 text-sm mb-4 max-w-md mx-auto leading-relaxed">
        Los especialistas médicos se activarán automáticamente cuando realices una consulta SOAP
      </p>
      <div className="bg-gradient-to-r from-blue-950/30 to-purple-950/30 backdrop-blur-sm rounded-xl p-3 border border-blue-700/20 max-w-sm mx-auto">
        <p className="text-slate-300 text-xs">
          💡 Describe un caso clínico para activar el orquestador cognitivo
        </p>
      </div>
    </div>
  </div>
)

// Helpers para detectar especialidades
const hasDermatologyKeywords = (content: string) =>
  content.includes('dermatitis') ||
  content.includes('lesion') ||
  content.includes('piel') ||
  content.includes('eritema')

const hasAllergyKeywords = (content: string) =>
  content.includes('alergia') || content.includes('rinitis') || content.includes('atópica')

const hasCardiologyKeywords = (content: string) =>
  content.includes('cardio') || content.includes('presión') || content.includes('corazón')

const createGeneralAgent = (confidence: number): SpecializedAgent => ({
  id: 'general',
  name: 'Dr. Medicina General',
  specialty: 'medicina_general',
  confidence,
  status: 'completed',
  insights: ['Análisis SOAP completo realizado', 'Evaluación clínica estructurada según NOM-004'],
  recommendation: 'Seguimiento según plan establecido',
  consultationTime: Math.round(Math.random() * 1000 + 800),
})

const createDermatologyAgent = (confidence: number): SpecializedAgent => ({
  id: 'dermato',
  name: 'Dr. Dermatólogo',
  specialty: 'dermatologia',
  confidence: Math.min(confidence + MIN_CONFIDENCE, HIGH_CONFIDENCE),
  status: 'completed',
  insights: ['Patrón dermatológico identificado', 'Tratamiento tópico recomendado'],
  recommendation: 'Manejo dermatológico especializado',
  consultationTime: Math.round(Math.random() * 800 + 600),
})

const createAllergyAgent = (confidence: number): SpecializedAgent => ({
  id: 'alergologia',
  name: 'Dr. Alergólogo',
  specialty: 'alergologia',
  confidence: Math.min(confidence + LOW_CONFIDENCE, MEDIUM_CONFIDENCE),
  status: 'consulting',
  insights: ['Componente alérgico presente', 'Pruebas alérgicas recomendadas'],
  consultationTime: Math.round(Math.random() * 600 + CONSULTATION_TIME_BASE),
})

const createCardiologyAgent = (confidence: number): SpecializedAgent => ({
  id: 'cardio',
  name: 'Dr. Cardiólogo',
  specialty: 'cardiologia',
  confidence: Math.min(confidence + CONFIDENCE_INCREMENT, MAX_CONFIDENCE),
  status: 'active',
  insights: ['Evaluación cardiovascular indicada', 'Factores de riesgo presentes'],
  consultationTime: Math.round(Math.random() * 900 + 700),
})

// Función para generar agentes basados en el análisis SOAP real
const generateAgentsFromSOAP = (message?: MedicalMessage): SpecializedAgent[] => {
  if (
    !message ||
    message.type !== 'assistant' ||
    !message.content.includes('SOAP') ||
    !message.content.includes('SUBJETIVO')
  ) {
    return []
  }

  const content = message.content.toLowerCase()
  const confidence = message.confidence || DEFAULT_CONFIDENCE
  const agents: SpecializedAgent[] = []

  // Agente general siempre presente
  agents.push(createGeneralAgent(confidence))

  // Agregar especialistas según contenido
  if (hasDermatologyKeywords(content)) {
    agents.push(createDermatologyAgent(confidence))
  }

  if (hasAllergyKeywords(content)) {
    agents.push(createAllergyAgent(confidence))
  }

  if (hasCardiologyKeywords(content)) {
    agents.push(createCardiologyAgent(confidence))
  }

  return agents
}

// Función para generar consenso basado en agentes
const generateConsensusFromAgents = (agents: SpecializedAgent[]) => {
  if (agents.length === 0) {
    return {
      achieved: false,
      percentage: 0,
      conflictingPoints: ['No hay análisis disponible'],
      agreements: [],
    }
  }

  const avgConfidence = agents.reduce((sum, agent) => sum + agent.confidence, 0) / agents.length
  const completedAgents = agents.filter(a => a.status === 'completed')

  return {
    achieved: avgConfidence > DERMATOLOGY_CONFIDENCE && completedAgents.length >= 2,
    percentage: Math.round(avgConfidence * 100),
    conflictingPoints:
      avgConfidence < CARDIOLOGY_CONFIDENCE
        ? ['Requiere más evaluación', 'Diagnóstico por confirmar']
        : [],
    agreements:
      completedAgents.length > 0
        ? ['Análisis clínico completo', 'Plan de tratamiento establecido']
        : [],
  }
}

export const CognitiveAgentsPanel = ({
  lastMessage,
  isActive: _isActive = false,
}: CognitiveAgentsPanelProps) => {
  const [agents, setAgents] = useState<SpecializedAgent[]>([])
  const [consensusData, setConsensusData] = useState({
    achieved: false,
    percentage: 0,
    conflictingPoints: [] as string[],
    agreements: [] as string[],
  })

  // Actualizar agentes cuando cambie el mensaje
  useEffect(() => {
    const newAgents = generateAgentsFromSOAP(lastMessage)
    setAgents(newAgents)
    setConsensusData(generateConsensusFromAgents(newAgents))
  }, [lastMessage])

  // Simular progreso de consulta solo cuando hay agentes activos
  useEffect(() => {
    if (agents.length === 0) return

    const interval = setInterval(() => {
      setAgents(prev =>
        prev.map(agent => {
          if (agent.status === 'consulting') {
            return {
              ...agent,
              confidence: Math.min(agent.confidence + AGENT_CONFIDENCE_INCREMENT, HIGH_CONFIDENCE),
              consultationTime: (agent.consultationTime || 0) + 100,
            }
          }
          return agent
        })
      )

      setConsensusData(prev => ({
        ...prev,
        percentage: Math.min(prev.percentage + 1, 95),
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [agents.length])

  // 🧙‍♂️ Gandalf's Agent Filter Cache - NO MORE RE-RENDERS! - Creado por Bernard Orozco
  const activeAgents = useMemo(() => agents.filter(agent => agent.status !== 'idle'), [agents])
  const completedAgents = useMemo(() => agents.filter(agent => agent.status === 'completed'), [agents])

  if (agents.length === 0) {
    return <EmptyAgentsState />
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
            <span className="text-white text-lg">🧠</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Orquestador Cognitivo</h3>
            <p className="text-sm text-slate-400">Sistema de Consulta Multi-Especialista</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur-sm rounded-xl px-4 py-2 border border-purple-700/20">
            <span className="text-sm text-purple-300 font-medium">
              {activeAgents.length} agentes activos
            </span>
          </div>
          <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse shadow-lg shadow-purple-400/50" />
        </div>
      </div>

      {/* Enhanced Consensus Meter */}
      <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-600/40">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold text-white">Consenso Médico</h4>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-white">{consensusData.percentage}%</span>
            <div
              className={`w-3 h-3 rounded-full ${
                consensusData.percentage > 80
                  ? 'bg-emerald-400'
                  : consensusData.percentage > 60
                    ? 'bg-yellow-400'
                    : 'bg-red-400'
              } animate-pulse`}
            />
          </div>
        </div>

        <div className="w-full bg-slate-700/50 rounded-full h-3 mb-4">
          <div
            className={`h-3 rounded-full transition-all duration-500 shadow-lg ${
              consensusData.percentage > 80
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/30'
                : consensusData.percentage > 60
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 shadow-yellow-500/30'
                  : 'bg-gradient-to-r from-red-500 to-pink-500 shadow-red-500/30'
            }`}
            style={{ width: `${consensusData.percentage}%` }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {consensusData.agreements.length > 0 && (
            <div className="bg-emerald-950/30 rounded-xl p-4 border border-emerald-700/20">
              <h5 className="text-sm font-medium text-emerald-300 mb-2">✅ Puntos de Acuerdo</h5>
              <ul className="space-y-1">
                {consensusData.agreements.map((agreement, idx) => (
                  <li key={idx} className="text-sm text-emerald-200 leading-relaxed">
                    • {agreement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {consensusData.conflictingPoints.length > 0 && (
            <div className="bg-yellow-950/30 rounded-xl p-4 border border-yellow-700/20">
              <h5 className="text-sm font-medium text-yellow-300 mb-2">⚠️ En Discusión</h5>
              <ul className="space-y-1">
                {consensusData.conflictingPoints.map((point, idx) => (
                  <li key={idx} className="text-sm text-yellow-200 leading-relaxed">
                    • {point}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Agents Layout - Single Column for Better Readability */}
      <div className="space-y-4">
        {agents.map((agent, _index) => (
          <AgentCard key={agent.id} agent={agent} isHighlighted={agent.status === 'consulting'} />
        ))}
      </div>

      {/* Enhanced Summary Stats */}
      <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-600/40">
        <h4 className="text-lg font-semibold text-white mb-4">Resumen de Consulta</h4>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg shadow-emerald-500/25">
              <span className="text-white text-xl font-bold">{completedAgents.length}</span>
            </div>
            <p className="text-sm text-slate-400 font-medium">Especialistas Consultados</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg shadow-blue-500/25">
              <span className="text-white text-xl font-bold">
                {Math.round(
                  (agents.reduce((sum, agent) => sum + agent.confidence, 0) / agents.length) * 100
                )}
                %
              </span>
            </div>
            <p className="text-sm text-slate-400 font-medium">Confianza Promedio</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg shadow-orange-500/25">
              <span className="text-white text-xl font-bold">
                {Math.round(
                  agents.reduce((sum, agent) => sum + (agent.consultationTime || 0), 0) / 1000
                )}
                s
              </span>
            </div>
            <p className="text-sm text-slate-400 font-medium">Tiempo Total</p>
          </div>
        </div>
      </div>
    </div>
  )
}
