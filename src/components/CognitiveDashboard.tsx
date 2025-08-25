// src/components/CognitiveDashboard.tsx
// Sistema Cognitivo Médico Corporativo 2025 - Bernard Orozco
'use client'

import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { useMedicalChat } from '@redux-claude/cognitive-core'
import { EnhancedMedicalMessage } from './EnhancedMedicalMessage'
import { IterativeDiagnosticProgress } from './IterativeDiagnosticProgress'
import { CognitiveAgentsPanel } from './CognitiveAgentsPanel'
import { RealTimeMetrics } from './RealTimeMetrics'
import { UrgencyIndicator, CompactUrgencyIndicator, type UrgencyData } from './UrgencyIndicator'
import { SOAPDisplay } from './SOAPDisplay'
import { FollowUpTracker } from './FollowUpTracker'
import { MedicalNotes } from './MedicalNotes'
import { LoadingScreen } from './LoadingScreen'
import { MedicalAutocompletion } from './MedicalAutocompletion'
import { useMobileInteractions } from '../hooks/useMobileInteractions'
import { useSelector } from 'react-redux'

// Medical Corporate Color Palette 2025
const theme = {
  // Primary Medical Colors
  primary: {
    blue: '#0A4B78',      // Deep medical blue
    cyan: '#1B9AAA',      // Healthcare cyan
    teal: '#06A77D',      // Medical teal
    white: '#FFFFFF',     // Pure white
  },
  // Secondary Support Colors
  secondary: {
    slate: '#1E293B',     // Dark professional
    gray: '#374151',      // Medium gray
    lightGray: '#6B7280', // Light gray
    accent: '#F1F5F9',    // Light accent
  },
  // Status Colors
  status: {
    success: '#059669',   // Medical green
    warning: '#D97706',   // Amber warning
    error: '#DC2626',     // Medical red
    info: '#0369A1',      // Information blue
  },
  // Background & Surface
  surface: {
    dark: '#0F172A',      // Deep dark
    card: '#1E293B',      // Card background
    elevated: '#334155',  // Elevated surface
    glass: 'rgba(30, 41, 59, 0.8)', // Glass effect
  }
}

interface CognitiveMetrics {
  systemConfidence: number
  overallHealth: number
  consensusRate: number
  memoryLoad: number
  learningProgress: number
  activeDebates: number
  pipelineSuccess: number
  avgLatency: number
  activeGoals: number
  knowledgeGaps: number
}

// Cognitive Health Metrics Component
const CognitiveHealthMetrics = ({ metrics }: { metrics: CognitiveMetrics | null }) => {
  if (!metrics) {
    return (
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/30 text-center">
        <div className="text-slate-400 mb-2">
          <span className="text-4xl">🔬</span>
        </div>
        <p className="text-slate-300 font-medium">Sin análisis activo</p>
        <p className="text-slate-500 text-sm mt-1">Realice una consulta médica para ver las métricas</p>
      </div>
    )
  }
  
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-sm rounded-2xl p-4 border border-cyan-500/20">
        <div className="text-3xl font-bold text-cyan-400 mb-1">{metrics.systemConfidence}%</div>
        <div className="text-sm text-cyan-300/80">System Confidence</div>
        <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
          <div 
            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${metrics.systemConfidence}%` }}
          />
        </div>
      </div>
    
    <div className="bg-gradient-to-br from-teal-500/10 to-emerald-500/10 backdrop-blur-sm rounded-2xl p-4 border border-teal-500/20">
      <div className="text-3xl font-bold text-teal-400 mb-1">{metrics.overallHealth}%</div>
      <div className="text-sm text-teal-300/80">System Health</div>
      <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
        <div 
          className="bg-gradient-to-r from-teal-500 to-emerald-500 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${metrics.overallHealth}%` }}
        />
      </div>
    </div>
    
    <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 backdrop-blur-sm rounded-2xl p-4 border border-blue-500/20">
      <div className="text-3xl font-bold text-blue-400 mb-1">{metrics.consensusRate}%</div>
      <div className="text-sm text-blue-300/80">Consensus Rate</div>
      <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
        <div 
          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${metrics.consensusRate}%` }}
        />
      </div>
    </div>
    
    <div className="bg-gradient-to-br from-slate-500/10 to-gray-500/10 backdrop-blur-sm rounded-2xl p-4 border border-slate-500/20">
      <div className="text-3xl font-bold text-slate-300 mb-1">{metrics.avgLatency}ms</div>
      <div className="text-sm text-slate-400/80">Response Time</div>
      <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
        <div 
          className="bg-gradient-to-r from-slate-500 to-gray-500 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${Math.max(10, 100 - (metrics.avgLatency / 20))}%` }}
        />
      </div>
    </div>
  </div>
)

// Cognitive Status Panel Component
const CognitiveStatusPanel = ({ metrics }: { metrics: CognitiveMetrics }) => (
  <div className="grid grid-cols-2 gap-4 mb-6">
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30">
      <div className="flex items-center space-x-2 mb-3">
        <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
        <span className="text-sm font-semibold text-cyan-300">Memory System</span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-400">Load:</span>
          <span className="text-slate-200">{Math.round(metrics.memoryLoad * 100)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Goals:</span>
          <span className="text-slate-200">{metrics.activeGoals}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Gaps:</span>
          <span className="text-slate-200">{metrics.knowledgeGaps}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Insights:</span>
          <span className="text-slate-200">24</span>
        </div>
      </div>
    </div>
    
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30">
      <div className="flex items-center space-x-2 mb-3">
        <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
        <span className="text-sm font-semibold text-blue-300">Pipeline Status</span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-400">Success:</span>
          <span className="text-slate-200">{metrics.pipelineSuccess}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Debates:</span>
          <span className="text-slate-200">{metrics.activeDebates}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Mode:</span>
          <span className="text-slate-200">Adaptive</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Learning:</span>
          <span className="text-slate-200">{metrics.learningProgress}%</span>
        </div>
      </div>
    </div>
  </div>
  )
}

// Agent Decision Component  
const AgentDecision = ({ decision }: { decision: any }) => {
  const getAgentColor = (agentType: string) => {
    switch (agentType) {
      case 'diagnostic': return 'blue'
      case 'triage': return 'red'
      case 'validation': return 'emerald'
      case 'treatment': return 'purple'
      case 'documentation': return 'amber'
      default: return 'slate'
    }
  }
  
  const color = getAgentColor(decision.agentType)
  
  return (
    <div className={`bg-gradient-to-r from-${color}-900/20 to-${color}-800/20 backdrop-blur-sm rounded-xl p-4 border border-${color}-500/20 mb-3`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 bg-${color}-400 rounded-full`} />
          <span className={`font-semibold text-${color}-300`}>{decision.agentName}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-400">{decision.confidence}%</span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            decision.success 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
              : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}>
            {decision.success ? 'SUCCESS' : 'FAILED'}
          </span>
        </div>
      </div>
      <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-700">
        <pre className={`text-xs text-${color}-300 overflow-auto max-h-32`}>
          {JSON.stringify(decision.decision, null, 2)}
        </pre>
      </div>
    </div>
  )
}

// Main Cognitive Dashboard Component
export const CognitiveDashboard = () => {
  const [input, setInput] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true) // Colapsado por defecto
  const [activeMetricsTab, setActiveMetricsTab] = useState<'overview' | 'clinical' | 'soap' | 'followup' | 'notes' | 'agents' | 'system'>('overview')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showMobileFab, setShowMobileFab] = useState(false)
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const [isAppLoading, setIsAppLoading] = useState(true)
  const [showMainApp, setShowMainApp] = useState(false)
  const [showAutocompletion, setShowAutocompletion] = useState(false)
  const [showMedicalAssistant, setShowMedicalAssistant] = useState(false)
  const [lastRejectedInput, setLastRejectedInput] = useState('')
  const [showDataRequiredAlert, setShowDataRequiredAlert] = useState(false)
  
  // Mobile interactions hook
  const { state: mobileState, triggerHaptic, addTouchFeedback, setupGestureDetection } = useMobileInteractions()
  
  const { 
    messages, 
    isLoading, 
    isStreaming,
    sendMedicalQuery,
    newSession,
    error
  } = useMedicalChat({
    onValidationFailed: (input, validationResult) => {
      // Auto-open autocompletion modal when validation fails
      setLastRejectedInput(input)
      setTimeout(() => {
        setShowAutocompletion(true)
      }, 1500) // Delay to let user read the validation message first
    }
  })
  
  const chatEndRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  // Cognitive metrics from Redux store
  const { currentCase } = useSelector((state: any) => state.medicalChat)
  const hasActiveSOAP = currentCase?.soap !== null
  
  // Only populate metrics if we have an active SOAP
  const cognitiveMetrics = hasActiveSOAP ? {
    systemConfidence: Math.round((currentCase?.confidence || 0) * 100),
    overallHealth: Math.round((currentCase?.confidence || 0) * 100),
    consensusRate: Math.round((currentCase?.confidence || 0) * 100),
    memoryLoad: 0.3,
    learningProgress: Math.round((currentCase?.confidence || 0) * 100),
    activeDebates: currentCase?.cycles?.length || 0,
    pipelineSuccess: Math.round((currentCase?.confidence || 0) * 100),
    avgLatency: 850,
    activeGoals: 0,
    knowledgeGaps: 0,
  } : null

  // Sistema de Medicina Defensiva - Datos de urgencia desde el store
  const [urgencyData, setUrgencyData] = useState<UrgencyData>({
    level: currentCase?.urgencyLevel || 'low',
    gravityScore: currentCase?.urgencyLevel === 'critical' ? 10 : 
                  currentCase?.urgencyLevel === 'high' ? 8 :
                  currentCase?.urgencyLevel === 'medium' ? 5 : 3,
    urgentPatterns: [],
    immediateActions: [],
    riskFactors: [],
    timeToAction: currentCase?.urgencyLevel === 'critical' ? 'Inmediato (< 15 min)' :
                  currentCase?.urgencyLevel === 'high' ? 'Urgente (< 1 hora)' :
                  currentCase?.urgencyLevel === 'medium' ? 'Prioritario (< 4 horas)' :
                  'Rutinario (< 24 horas)',
    triageCategory: currentCase?.urgencyLevel === 'critical' ? 'resuscitation' :
                    currentCase?.urgencyLevel === 'high' ? 'emergency' :
                    currentCase?.urgencyLevel === 'medium' ? 'urgent' : 'non-urgent',
    specialistRequired: currentCase?.urgencyLevel === 'critical' || currentCase?.urgencyLevel === 'high'
  })

  // Actualizar urgencia basado en el estado del store
  useEffect(() => {
    if (currentCase?.soap) {
      // Extraer datos de urgencia del SOAP si está disponible
      const urgencyLevel = currentCase.urgencyLevel
      const analysis = currentCase.soap?.analisis
      
      setUrgencyData({
        level: urgencyLevel,
        gravityScore: urgencyLevel === 'critical' ? 10 : 
                      urgencyLevel === 'high' ? 8 :
                      urgencyLevel === 'medium' ? 5 : 3,
        urgentPatterns: analysis?.differentials
          ?.filter((d: any) => d.gravityScore >= 7)
          ?.map((d: any) => d.diagnosis) || [],
        immediateActions: currentCase.soap?.plan?.immediate || [],
        riskFactors: currentCase.soap?.plan?.redFlags || [],
        timeToAction: urgencyLevel === 'critical' ? 'Inmediato (< 15 min)' :
                      urgencyLevel === 'high' ? 'Urgente (< 1 hora)' :
                      urgencyLevel === 'medium' ? 'Prioritario (< 4 horas)' :
                      'Rutinario (< 24 horas)',
        triageCategory: urgencyLevel === 'critical' ? 'resuscitation' :
                        urgencyLevel === 'high' ? 'emergency' :
                        urgencyLevel === 'medium' ? 'urgent' : 'non-urgent',
        specialistRequired: urgencyLevel === 'critical' || urgencyLevel === 'high'
      })
    }
  }, [currentCase])
  
  // Solo detectar patrones de urgencia en mensajes nuevos si no hay SOAP activo
  useEffect(() => {
    if (!currentCase?.soap && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.type === 'user') {
        const input = lastMessage.content.toLowerCase()
        
        // Detectar patrones de alta urgencia para casos sin SOAP
        if (input.includes('dolor torácico') || input.includes('dolor pecho')) {
          setUrgencyData({
            level: 'critical',
            gravityScore: 10,
            urgentPatterns: [
              'Dolor torácico - Descartar síndrome coronario agudo',
              'Patrón compatible con emergencia cardiovascular'
            ],
            immediateActions: [
              '🚨 ACTIVAR PROTOCOLO DE EMERGENCIA',
              '📞 Contactar servicios de emergencia inmediatamente',
              '💊 Considerar aspirina 300mg (si no contraindicado)',
              '📋 ECG de 12 derivaciones STAT'
            ],
            riskFactors: [
              'Síndrome coronario agudo potencial',
              'Riesgo vital inmediato si IAM'
            ],
            timeToAction: 'Inmediato (< 15 min)',
            triageCategory: 'resuscitation',
            specialistRequired: true
          })
        } else if (input.includes('cefalea') || input.includes('dolor cabeza')) {
          setUrgencyData({
            level: 'high',
            gravityScore: 8,
            urgentPatterns: [
              'Cefalea severa - Descartar hemorragia subaracnoidea',
              'Patrón neurológico de riesgo'
            ],
            immediateActions: [
              '🏥 Referir a urgencias hospitalarias',
              '📋 Estudios complementarios STAT',
              '👨‍⚕️ Interconsulta neurológica urgente'
            ],
            riskFactors: [
              'Posible hemorragia intracraneal',
              'Riesgo de deterioro neurológico'
            ],
            timeToAction: 'Urgente (< 1 hora)',
            triageCategory: 'urgent',
            specialistRequired: true
          })
        } else if (input.includes('fiebre') || input.includes('temperatura')) {
          setUrgencyData({
            level: 'medium',
            gravityScore: 6,
            urgentPatterns: [
              'Síndrome febril - Evaluar sepsis'
            ],
            immediateActions: [
              '🔬 Laboratorios y estudios dirigidos',
              '💊 Tratamiento sintomático inmediato'
            ],
            riskFactors: [
              'Posible proceso infeccioso'
            ],
            timeToAction: 'Prioritario (< 4 horas)',
            triageCategory: 'semi-urgent',
            specialistRequired: false
          })
        } else {
          // Caso de baja urgencia
          setUrgencyData({
            level: 'low',
            gravityScore: 3,
            urgentPatterns: [],
            immediateActions: [
              '📅 Control médico en 24-48 horas',
              '📚 Educación al paciente sobre signos de alarma'
            ],
            riskFactors: [],
            timeToAction: 'Rutinario (< 24 horas)',
            triageCategory: 'non-urgent',
            specialistRequired: false
          })
        }
      }
    }
  }, [messages])

  // Get last message for components
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : undefined
  
  // Refs for mobile interactions
  const tabsRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Loading completion handler
  const handleLoadingComplete = () => {
    setIsAppLoading(false)
    setTimeout(() => {
      setShowMainApp(true)
    }, 100) // Small delay for smooth transition
  }
  
  // Mobile keyboard detection
  useEffect(() => {
    if (!mobileState.isMobile) return
    
    const handleResize = () => {
      const windowHeight = window.innerHeight
      const screenHeight = window.screen.height
      const keyboardHeight = screenHeight - windowHeight
      
      setKeyboardVisible(keyboardHeight > 100)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [mobileState.isMobile])
  
  // Show/hide mobile FAB based on scroll and messages
  useEffect(() => {
    if (!mobileState.isMobile) {
      setShowMobileFab(false)
      return
    }
    
    setShowMobileFab(messages.length > 0 && !isLoading && !isStreaming)
  }, [mobileState.isMobile, messages.length, isLoading, isStreaming])
  
  // Setup swipe gestures for tab navigation
  useEffect(() => {
    if (!tabsRef.current || !mobileState.isMobile) return
    
    const cleanup = setupGestureDetection(tabsRef.current, (gesture) => {
      if (gesture.type === 'swipe-left' || gesture.type === 'swipe-right') {
        triggerHaptic('light')
        
        const tabs = ['overview', 'clinical', 'soap', 'followup', 'notes', 'agents', 'system']
        const currentIndex = tabs.indexOf(activeMetricsTab)
        
        if (gesture.type === 'swipe-left' && currentIndex < tabs.length - 1) {
          setActiveMetricsTab(tabs[currentIndex + 1] as any)
        } else if (gesture.type === 'swipe-right' && currentIndex > 0) {
          setActiveMetricsTab(tabs[currentIndex - 1] as any)
        }
      }
    }, { enableSwipe: true, enableLongPress: false, enableDoubleTap: false })
    
    return cleanup
  }, [activeMetricsTab, mobileState.isMobile, setupGestureDetection, triggerHaptic])
  
  // Mobile-specific input handling
  const handleMobileInputFocus = () => {
    if (mobileState.isMobile) {
      triggerHaptic('light')
      // Scroll input into view after keyboard appears
      setTimeout(() => {
        inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 300)
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || isStreaming) return
    
    // 🛡️ INTERCEPTOR BRUTAL - MEDICAL CONSULTATION FILTER
    const isMedical = isMedicalConsultation(input)
    const hasPatientData = hasMinimumPatientData()
    
    console.log('🛡️ INTERCEPTOR DEBUG:', {
      input: input.substring(0, 50) + '...',
      isMedical,
      hasPatientData,
      shouldBlock: isMedical && !hasPatientData
    })
    
    if (isMedical) {
      // Usar el chat inteligente para consultas médicas
      console.log('🦁 ACTIVANDO CHAT MÉDICO INTELIGENTE')
      setLastRejectedInput(input)
      setShowMedicalAssistant(true) // Ahora MedicalAutocompletion muestra el chat inteligente
      setInput('') // Limpiar input ya que el chat tiene su propio input
      
      // Feedback háptico positivo
      triggerHaptic && triggerHaptic('light')
      
      return
    }
    
    const messageToSend = input
    setInput('')
    
    // Enviar consulta médica con streaming real
    await sendMedicalQuery(messageToSend)
  }
  
  // 🛡️ MEDICAL CONSULTATION DETECTOR - BRUTAL FILTER
  const isMedicalConsultation = (text: string): boolean => {
    const medicalKeywords = [
      // Términos médicos básicos
      'paciente', 'doctor', 'síntoma', 'dolor', 'fiebre', 'diagnóstico',
      'tratamiento', 'medicamento', 'consulta', 'control', 'laboratorio',
      'examen', 'análisis', 'radiografía', 'ecografía', 'biopsia',
      
      // Valores de laboratorio
      'glucosa', 'colesterol', 'triglicéridos', 'hba1c', 'creatinina',
      'urea', 'hemoglobina', 'plaquetas', 'leucocitos', 
      
      // Signos vitales
      'presión arterial', 'frecuencia cardíaca', 'temperatura', 'peso',
      'saturación', 'signos vitales', 'ritmo cardíaco', 'tensión arterial',
      
      // Especialidades
      'cardiología', 'neurología', 'gastroenterología', 'dermatología',
      'ginecología', 'pediatría', 'traumatología', 'oftalmología',
      
      // Patrones médicos
      'mg/dl', 'mmhg', 'bpm', 'años', 'presenta', 'refiere', 'acude'
    ]
    
    const lowerText = text.toLowerCase()
    const keywordMatches = medicalKeywords.filter(keyword => 
      lowerText.includes(keyword.toLowerCase())
    ).length
    
    // Si tiene 2+ keywords médicos Y más de 20 caracteres = consulta médica
    return keywordMatches >= 2 && text.trim().length > 20
  }

  const hasMinimumPatientData = (): boolean => {
    const savedData = localStorage.getItem('medical_patient_data')
    console.log('📋 PATIENT DATA CHECK:', { savedData: !!savedData })
    
    if (!savedData) return false
    
    try {
      const patientData = JSON.parse(savedData)
      console.log('📋 PARSED DATA:', patientData)
      
      // Datos mínimos requeridos: edad, género, motivo consulta
      const hasMinData = Boolean(
        patientData.age && 
        patientData.gender && 
        patientData.chiefComplaint &&
        patientData.chiefComplaint.trim().length > 5
      )
      
      console.log('📋 HAS MIN DATA:', hasMinData, {
        age: !!patientData.age,
        gender: !!patientData.gender,
        chiefComplaint: !!patientData.chiefComplaint,
        ccLength: patientData.chiefComplaint?.length || 0
      })
      
      return hasMinData
    } catch (error) {
      console.log('📋 PARSE ERROR:', error)
      return false
    }
  }

  // Handle mobile FAB actions
  const handleMobileFab = () => {
    triggerHaptic('medium')
    if (mobileState.isMobile) {
      inputRef.current?.focus()
      inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }
  
  const handleNewSession = () => {
    triggerHaptic('light')
    newSession()
  }
  
  // Show loading screen if app is loading
  if (isAppLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} duration={3000} />
  }

  return (
    <div className={`h-screen bg-gray-900 text-white flex overflow-hidden relative transition-opacity duration-500 ${showMainApp ? 'opacity-100' : 'opacity-0'} ${mobileState.isMobile ? 'safe-area-top safe-area-bottom' : ''} ${keyboardVisible ? 'keyboard-resize' : ''}`}>
      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileMenu(false)}>
          <div className="absolute top-0 left-0 w-80 h-full bg-gradient-to-b from-gray-950 to-slate-950 border-r border-slate-700/50 flex flex-col backdrop-blur-xl transform transition-transform duration-300" onClick={e => e.stopPropagation()}>
            {/* Mobile Menu Header */}
            <div className="p-4 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <span className="text-white text-sm font-bold">🏥</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-white">Medical AI</h1>
                    <p className="text-xs text-slate-400">Cognitive Assistant</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors duration-200 text-slate-400 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobile Menu Content */}
            <div className="flex-1 p-4">
              <div className="space-y-3">
                <button 
                  className="w-full flex items-center space-x-3 px-3 py-3 text-slate-300 hover:bg-slate-800/50 rounded-xl transition-all duration-200 hover:text-white touch-feedback touch-target"
                  onClick={() => {
                    triggerHaptic('light')
                    setShowMobileMenu(false)
                  }}
                >
                  <span className="text-lg">💊</span>
                  <span className="text-sm font-medium">Treatment Plans</span>
                </button>
                <button 
                  className="w-full flex items-center space-x-3 px-3 py-3 text-slate-300 hover:bg-slate-800/50 rounded-xl transition-all duration-200 hover:text-white touch-feedback touch-target"
                  onClick={() => {
                    triggerHaptic('light')
                    setShowMobileMenu(false)
                  }}
                >
                  <span className="text-lg">🔍</span>
                  <span className="text-sm font-medium">Diagnostics</span>
                </button>
                <button 
                  className="w-full flex items-center space-x-3 px-3 py-3 text-slate-300 hover:bg-slate-800/50 rounded-xl transition-all duration-200 hover:text-white touch-feedback touch-target"
                  onClick={() => {
                    triggerHaptic('light')
                    setShowMobileMenu(false)
                  }}
                >
                  <span className="text-lg">📊</span>
                  <span className="text-sm font-medium">Analytics</span>
                </button>
              </div>

              {/* System Status in Mobile */}
              <div className="mt-6 bg-gradient-to-br from-slate-800/60 to-slate-900/80 backdrop-blur-xl rounded-xl p-4 border border-slate-600/30">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-sm text-slate-300 font-medium">System Online</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-400">
                    <span>Confidence:</span>
                    <span className="text-emerald-400 font-medium">{cognitiveMetrics?.systemConfidence || 0}%</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Agents:</span>
                    <span className="text-blue-400 font-medium">5/5 active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Collapsible Sidebar - Hidden on mobile */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-gradient-to-b from-gray-950 to-slate-950 border-r border-slate-700/50 flex flex-col transition-all duration-300 ease-in-out backdrop-blur-xl hidden lg:flex`}>
        {/* Enhanced Sidebar Header */}
        <div className="p-4 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <span className="text-white text-sm font-bold">🏥</span>
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h1 className="text-lg font-semibold text-white">Medical AI</h1>
                  <p className="text-xs text-slate-400">Cognitive Assistant</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors duration-200 text-slate-400 hover:text-white"
              title={sidebarCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
            >
              <svg className={`w-4 h-4 transition-transform duration-200 ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Enhanced New Chat Button */}
        <div className="p-4">
          <button 
            onClick={() => setInput('')}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl border border-emerald-500/30 transition-all duration-300 shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40`}
            title={sidebarCollapsed ? "Nueva consulta" : ""}
          >
            <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            {!sidebarCollapsed && <span className="text-sm font-medium text-white">New consultation</span>}
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
                    <span className="text-emerald-400 font-medium">{cognitiveMetrics?.systemConfidence || 0}%</span>
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
                <span className="text-xs text-emerald-400 font-bold">{cognitiveMetrics?.systemConfidence || 0}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Navigation */}
        <div className="flex-1 p-4">
          <nav className="space-y-2">
            <a href="#" className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-3 text-slate-300 hover:bg-slate-800/50 rounded-xl transition-all duration-200 hover:text-white group`} title={sidebarCollapsed ? "Treatment Plans" : ""}>
              <span className="text-lg">💊</span>
              {!sidebarCollapsed && <span className="text-sm font-medium">Treatment Plans</span>}
            </a>
            <a href="#" className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-3 text-slate-300 hover:bg-slate-800/50 rounded-xl transition-all duration-200 hover:text-white group`} title={sidebarCollapsed ? "Diagnostics" : ""}>
              <span className="text-lg">🔍</span>
              {!sidebarCollapsed && <span className="text-sm font-medium">Diagnostics</span>}
            </a>
            <a href="#" className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-3 text-slate-300 hover:bg-slate-800/50 rounded-xl transition-all duration-200 hover:text-white group`} title={sidebarCollapsed ? "Analytics" : ""}>
              <span className="text-lg">📊</span>
              {!sidebarCollapsed && <span className="text-sm font-medium">Analytics</span>}
            </a>
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

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Enhanced Chat Header - Mobile Optimized */}
        <div className="bg-gradient-to-r from-gray-900 to-slate-900 border-b border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => {
                  triggerHaptic('light')
                  setShowMobileMenu(!showMobileMenu)
                }}
                className="lg:hidden p-2 hover:bg-slate-800/50 rounded-lg transition-colors text-slate-400 hover:text-white touch-feedback touch-target"
                title="Menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-base sm:text-lg">🧠</span>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Medical AI</h2>
                <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">Motor Iterativo + Orquestador Cognitivo v2.0</p>
                <p className="text-xs text-gray-400 sm:hidden">Sistema Cognitivo</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-3">
              <div className="px-2 sm:px-3 py-1 bg-emerald-900/30 border border-emerald-700 rounded-full hidden sm:block">
                <span className="text-xs text-emerald-400 font-medium">Sistema Optimizado</span>
              </div>
              <div className="px-2 sm:px-3 py-1 bg-purple-900/30 border border-purple-700 rounded-full">
                <span className="text-xs text-purple-400 font-medium">Fase 3</span>
              </div>
              {urgencyData.level !== 'low' && (
                <div className={`px-2 sm:px-3 py-1 rounded-full border ${
                  urgencyData.level === 'critical' ? 'bg-red-900/30 border-red-700 text-red-400' :
                  urgencyData.level === 'high' ? 'bg-orange-900/30 border-orange-700 text-orange-400' :
                  'bg-yellow-900/30 border-yellow-700 text-yellow-400'
                }`}>
                  <span className="text-xs font-medium">
                    🚨 {urgencyData.level.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content with Enhanced Panels - Mobile First Design */}
        <div className={`flex-1 grid grid-cols-1 lg:grid-cols-[35%_65%] min-h-0 transition-all duration-300`}>
          
          {/* Enhanced Right Panel - Hidden on mobile, visible on desktop */}
          <div className="bg-gradient-to-b from-slate-950/80 via-slate-900/60 to-slate-950/80 backdrop-blur-md border-r lg:border-r border-b lg:border-b-0 border-slate-700/50 p-4 shadow-2xl shadow-slate-950/50 order-2 lg:order-1 flex-col h-full overflow-hidden hidden lg:flex">
            
            {/* Medical Dashboard Header with Navigation */}
            <div className="mb-6">
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
                  <button className="p-1.5 hover:bg-slate-700/50 rounded-lg transition-colors" title="Actualizar métricas">
                    <svg className="w-3.5 h-3.5 text-slate-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <button className="p-1.5 hover:bg-slate-700/50 rounded-lg transition-colors" title="Configurar panel">
                    <svg className="w-3.5 h-3.5 text-slate-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Quick Stats Overview - More Compact */}
              {cognitiveMetrics ? (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-lg p-2 border border-emerald-500/20">
                    <div className="text-sm font-bold text-emerald-400">{cognitiveMetrics?.systemConfidence || 0}%</div>
                    <div className="text-xs text-emerald-300">Sistema</div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-2 border border-blue-500/20">
                    <div className="text-sm font-bold text-blue-400">{cognitiveMetrics?.activeDebates || 0}</div>
                    <div className="text-xs text-blue-300">Debates</div>
                  </div>
                  <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg p-2 border border-orange-500/20">
                    <div className="text-sm font-bold text-orange-400">{messages.length}</div>
                    <div className="text-xs text-orange-300">Consultas</div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-slate-700/30 to-slate-600/30 rounded-lg p-4 border border-slate-600/30 text-center mb-3">
                  <div className="text-slate-400 text-sm">Sin análisis activo</div>
                  <div className="text-slate-500 text-xs mt-1">Realice una consulta para ver métricas</div>
                </div>
              )}
              
              {/* Navigation Tabs - More Compact with Swipe Support */}
              <div ref={tabsRef} className={`flex space-x-1 bg-slate-800/30 rounded-lg p-1 ${mobileState.isMobile ? 'swipe-indicator' : ''}`}>
                {[
                  { id: 'overview', label: 'Resumen', icon: '📋' },
                  { id: 'clinical', label: 'Clínico', icon: '🩺' },
                  { id: 'soap', label: 'SOAP', icon: '📄' },
                  { id: 'followup', label: 'Seguimiento', icon: '📅' },
                  { id: 'notes', label: 'Notas', icon: '📝' },
                  { id: 'agents', label: 'Agentes', icon: '🤖' },
                  { id: 'system', label: 'Sistema', icon: '⚙️' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      triggerHaptic('light')
                      setActiveMetricsTab(tab.id as any)
                    }}
                    className={`flex-1 flex items-center justify-center space-x-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 touch-feedback touch-target ${
                      activeMetricsTab === tab.id
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                        : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
                    }`}
                  >
                    <span className="text-xs">{tab.icon}</span>
                    <span className="hidden sm:inline text-xs">{tab.label}</span>
                  </button>
                ))}
              </div>
              
              {/* Mobile Swipe Hint */}
              {mobileState.isMobile && (
                <div className="text-center mt-2">
                  <span className="text-xs text-slate-500">← Swipe to navigate tabs →</span>
                </div>
              )}
            </div>
            
            {/* Optimized Content Container with Tab-Based Navigation */}
            <div className="flex-1 overflow-y-auto overscroll-contain min-h-0 pr-2">
              
              {/* RESUMEN - Vista General */}
              {activeMetricsTab === 'overview' && (
                <div className="space-y-4">
                  {/* Estado Crítico - Siempre visible en resumen */}
                  {urgencyData.level !== 'low' || messages.length > 0 ? (
                    <section>
                      {urgencyData.level === 'critical' || urgencyData.level === 'high' ? (
                        <UrgencyIndicator urgencyData={urgencyData} className="rounded-xl border border-red-500/20 shadow-lg shadow-red-500/10" />
                      ) : (
                        <CompactUrgencyIndicator urgencyData={urgencyData} className="rounded-xl border border-slate-600/30 shadow-lg shadow-slate-950/20" />
                      )}
                    </section>
                  ) : null}
                  
                  {/* Métricas Clave */}
                  <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/60 backdrop-blur-xl rounded-xl border border-slate-600/30 p-4 shadow-xl shadow-slate-950/30">
                    <RealTimeMetrics />
                  </div>
                </div>
              )}
              
              {/* CLÍNICO - Información Médica */}
              {activeMetricsTab === 'clinical' && (
                <div className="space-y-4">
                  {urgencyData.level !== 'low' || messages.length > 0 ? (
                    <section>
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                        <h3 className="text-xs font-semibold text-red-300 uppercase tracking-wider">Estado Médico Crítico</h3>
                      </div>
                      {urgencyData.level === 'critical' || urgencyData.level === 'high' ? (
                        <UrgencyIndicator urgencyData={urgencyData} className="rounded-xl border border-red-500/20 shadow-lg shadow-red-500/10" />
                      ) : (
                        <CompactUrgencyIndicator urgencyData={urgencyData} className="rounded-xl border border-slate-600/30 shadow-lg shadow-slate-950/20" />
                      )}
                    </section>
                  ) : (
                    <div className="bg-gradient-to-r from-emerald-950/40 to-teal-950/40 backdrop-blur-xl rounded-xl p-4 border border-emerald-500/30">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-lg">🩺</span>
                        </div>
                        <h3 className="text-sm font-semibold text-emerald-300 mb-2">Sistema Médico Estable</h3>
                        <p className="text-xs text-slate-400">No hay alertas médicas activas.</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-gradient-to-br from-blue-950/20 to-indigo-950/30 backdrop-blur-xl rounded-xl border border-blue-700/20 p-4 shadow-xl shadow-blue-950/20">
                    <IterativeDiagnosticProgress />
                  </div>
                </div>
              )}
              
              {/* SOAP - Análisis Estructurado */}
              {activeMetricsTab === 'soap' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-blue-950/20 to-indigo-950/30 backdrop-blur-xl rounded-xl border border-blue-700/20 p-4 shadow-xl shadow-blue-950/20">
                    <SOAPDisplay />
                  </div>
                </div>
              )}
              
              {/* SEGUIMIENTO - Recordatorios y Notas */}
              {activeMetricsTab === 'followup' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-green-950/20 to-emerald-950/30 backdrop-blur-xl rounded-xl border border-green-700/20 p-4 shadow-xl shadow-green-950/20">
                    <FollowUpTracker />
                  </div>
                </div>
              )}
              
              {/* NOTAS - Notas Médicas con Trazabilidad */}
              {activeMetricsTab === 'notes' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-amber-950/20 to-orange-950/30 backdrop-blur-xl rounded-xl border border-amber-700/20 p-4 shadow-xl shadow-amber-950/20">
                    <MedicalNotes />
                  </div>
                </div>
              )}
              
              {/* AGENTES - Orquestador Cognitivo */}
              {activeMetricsTab === 'agents' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-purple-950/20 to-violet-950/30 backdrop-blur-xl rounded-xl border border-purple-700/20 p-4 shadow-xl shadow-purple-950/20">
                    <CognitiveAgentsPanel 
                      lastMessage={lastMessage} 
                      isActive={isStreaming}
                    />
                  </div>
                </div>
              )}
              
              {/* SISTEMA - Métricas Técnicas */}
              {activeMetricsTab === 'system' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/60 backdrop-blur-xl rounded-xl border border-slate-600/30 p-4 shadow-xl shadow-slate-950/30">
                    <RealTimeMetrics />
                  </div>
                  
                  {/* Información adicional del sistema */}
                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-gradient-to-r from-orange-950/40 to-red-950/40 backdrop-blur-xl rounded-lg p-3 border border-orange-500/30">
                      <h4 className="text-sm font-semibold text-orange-300 mb-2">Estado del Servidor</h4>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-xs text-slate-300">Conectado y operativo</span>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-950/40 to-purple-950/40 backdrop-blur-xl rounded-lg p-3 border border-blue-500/30">
                      <h4 className="text-sm font-semibold text-blue-300 mb-2">Versión del Sistema</h4>
                      <span className="text-xs text-slate-300">Motor Iterativo + Orquestador Cognitivo v2.0</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Center Chat Area - Full width on mobile */}
          <div className="flex flex-col h-full bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 order-1 lg:order-2 overflow-hidden col-span-1 lg:col-span-1">
            {/* Chat Messages Area */}
            <div className={`flex-1 overflow-y-auto overscroll-contain bg-gradient-to-b from-transparent via-gray-900/20 to-transparent min-h-0 ${mobileState.isMobile ? 'mobile-scroll' : ''}`}>
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center px-4 sm:px-8 py-8 sm:py-12">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-slate-700/80 to-slate-800/90 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl shadow-slate-950/50 border border-slate-600/30">
                    <span className="text-2xl sm:text-3xl">🛡️</span>
                  </div>
                  <h3 className="text-slate-200 text-base sm:text-lg font-semibold mb-2 sm:mb-3">
                    Sistema de Medicina Defensiva Activado
                  </h3>
                  <p className="text-slate-400 text-sm mb-3 sm:mb-4 max-w-md mx-auto leading-relaxed">
                    Diagnósticos priorizados por <strong className="text-slate-300">gravedad</strong> sobre probabilidad
                  </p>
                  <div className="bg-gradient-to-r from-blue-950/30 to-purple-950/30 backdrop-blur-xl rounded-xl p-3 sm:p-4 border border-blue-700/20 shadow-xl shadow-blue-950/20 max-w-sm sm:max-w-lg mx-auto">
                    <p className="text-slate-300 text-xs leading-relaxed">
                      💡 Describe tu caso médico para análisis SOAP completo con validación defensiva
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                {messages.map((message, idx) => {
                  const isLastMessage = idx === messages.length - 1
                  const messageIsStreaming = isLastMessage && isStreaming && message.type === 'assistant'
                  
                  return (
                    <div 
                      key={message.id || idx}
                      className={`${mobileState.isMobile ? 'mobile-padding mobile-spacing' : ''}`}
                    >
                      <EnhancedMedicalMessage
                        message={message}
                        isStreaming={messageIsStreaming}
                      />
                    </div>
                  )
                })}
                
                {(isLoading || isStreaming) && (
                  <div className="border-b border-slate-700/50 bg-gradient-to-r from-slate-800/20 to-slate-900/30 backdrop-blur-md">
                    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
                      <div className="flex space-x-4 sm:space-x-6">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-600 to-violet-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-600/25 border border-purple-500/30">
                            <span className="text-base sm:text-lg font-medium">🤖</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm sm:text-base font-semibold text-slate-100 mb-3 sm:mb-4">Medical AI</div>
                          {false ? (
                            <div className="text-slate-300">Streaming...</div>
                          ) : (
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                              <span className="text-xs sm:text-sm text-slate-300 font-medium">Analyzing medical case...</span>
                              <div className="flex space-x-1">
                                <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0ms'}} />
                                <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '150ms'}} />
                                <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '300ms'}} />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>
            )}
          </div>
          
          {/* Fixed Bottom Section */}
          <div className="flex-shrink-0">
            {/* Nueva Sesión */}
            {messages.length > 1 && (
              <div className="border-t border-slate-700/50 px-8 py-4 bg-gradient-to-r from-slate-800/30 to-slate-900/40 backdrop-blur-md">
                <button
                  onClick={handleNewSession}
                  className={`text-sm text-slate-400 hover:text-slate-100 flex items-center gap-3 transition-all duration-300 group hover:bg-slate-700/30 px-4 py-2 rounded-xl border border-transparent hover:border-slate-600/30 ${mobileState.isMobile ? 'touch-feedback touch-target' : ''}`}
                >
                  <div className="w-5 h-5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-all duration-300">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="font-medium">Nueva consulta médica</span>
                </button>
              </div>
            )}

            {/* 🚨 Data Required Alert */}
            {showDataRequiredAlert && (
              <div className="bg-gradient-to-r from-orange-900/80 to-red-900/60 border-t border-orange-500/30 px-4 sm:px-6 lg:px-8 py-4 backdrop-blur-xl">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-orange-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-orange-200 font-medium text-sm">
                      <span className="font-bold">Consulta médica detectada:</span> Se requieren datos del paciente para proceder con análisis seguro.
                    </p>
                    <p className="text-orange-300/80 text-xs mt-1">
                      Complete edad, género y motivo de consulta en el asistente avanzado que se ha abierto.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDataRequiredAlert(false)}
                    className="flex-shrink-0 text-orange-400 hover:text-orange-200 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Input Form */}
            <div className={`border-t border-slate-700/50 bg-gradient-to-r from-slate-950/80 to-slate-900/90 backdrop-blur-xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 ${mobileState.isMobile ? 'safe-area-bottom' : ''} ${keyboardVisible ? 'keyboard-padding' : ''}`}>
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-end">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onFocus={handleMobileInputFocus}
                      placeholder={mobileState.isMobile ? "Describe tu caso médico..." : "Describe el caso clínico aquí... Ej: Paciente de 45 años presenta dolor torácico..."}
                      className={`w-full px-4 sm:px-6 py-3 sm:py-4 pr-12 bg-gradient-to-r from-slate-800/60 to-slate-700/60 backdrop-blur-xl border border-slate-600/40 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 text-slate-100 placeholder-slate-400 shadow-xl shadow-slate-950/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base ${mobileState.isMobile ? 'touch-feedback' : ''}`}
                      disabled={isLoading || isStreaming}
                      autoComplete="off"
                      autoCapitalize="sentences"
                      autoCorrect="on"
                    />
                    
                    {/* Autocompletion Buttons */}
                    {input.trim().length > 10 && !isLoading && !isStreaming && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-1">
                        {/* Simple Autocompletion Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setLastRejectedInput(input)
                            setShowAutocompletion(true)
                          }}
                          className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 rounded-lg flex items-center justify-center text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-200 group"
                          title="Autocompletado Rápido"
                        >
                          <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </button>
                        
                        {/* Medical Assistant Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setLastRejectedInput(input)
                            setShowMedicalAssistant(true)
                          }}
                          className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-lg flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200 group"
                          title="Asistente Médico Inteligente"
                        >
                          <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
                          </svg>
                        </button>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl pointer-events-none opacity-0 transition-opacity duration-300 peer-focus:opacity-100" />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className={`bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-700 disabled:to-slate-800 disabled:cursor-not-allowed text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 shadow-xl shadow-blue-600/25 hover:shadow-blue-600/40 disabled:shadow-slate-800/25 border border-blue-500/30 disabled:border-slate-600/30 backdrop-blur-xl text-sm sm:text-base min-w-[100px] sm:min-w-[120px] ${mobileState.isMobile ? 'touch-feedback touch-target' : ''}`}
                  onClick={() => mobileState.isMobile && triggerHaptic('light')}
                >
                  {isLoading ? (
                    <>
                      <div className={`${mobileState.isMobile ? 'mobile-loading' : 'w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'}`} />
                      <span>Analyzing</span>
                    </>
                  ) : (
                    <>
                      <span>Send</span>
                      <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </div>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Floating Action Button */}
      {showMobileFab && mobileState.isMobile && (
        <button
          onClick={handleMobileFab}
          className="mobile-fab touch-feedback lg:hidden"
          title="Quick Input"
          aria-label="Quick input for medical case"
        >
          ✍️
        </button>
      )}

      {/* Medical Autocompletion Modal (Simple) */}
      <MedicalAutocompletion
        partialInput={lastRejectedInput}
        onSelectTemplate={(template) => {
          setInput(template)
          setShowAutocompletion(false)
          setLastRejectedInput('')
          // Focus input after template is applied
          setTimeout(() => {
            inputRef.current?.focus()
          }, 100)
        }}
        isVisible={showAutocompletion}
        onClose={() => {
          setShowAutocompletion(false)
          setLastRejectedInput('')
        }}
      />

      {/* Medical Assistant Modal (Unificado) */}
      <MedicalAutocompletion
        partialInput={lastRejectedInput || input}
        isVisible={showMedicalAssistant}
        onClose={() => {
          setShowMedicalAssistant(false)
          setLastRejectedInput('')
        }}
        onSelectTemplate={(template) => {
          setInput(template)
          setShowMedicalAssistant(false)
          setLastRejectedInput('')
          // Focus input after prompt is selected
          setTimeout(() => {
            inputRef.current?.focus()
          }, 100)
        }}
      />
      
    </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgb(31 41 55);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgb(75 85 99);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgb(107 114 128);
        }
        
        /* Claude.ai-style message animations */
        .message-appear {
          animation: messageSlideIn 0.3s ease-out;
        }
        
        @keyframes messageSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Better prose styling */
        .prose h1 {
          border-bottom: 2px solid #f97316;
        }
        
        .prose code {
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
        }
      `}</style>
    </div>
  )
}