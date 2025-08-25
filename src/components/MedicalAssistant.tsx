// 🏥 Asistente Médico IA Completo - Modal de Diagnóstico Inteligente
// Creado por Bernard Orozco - Sistema de Diagnóstico con Chat + Inferencias + Resumen

'use client'

import { IntelligentMedicalChat } from './IntelligentMedicalChat'
import { MedicalSummaryPanel } from './MedicalSummaryPanel'
import { DynamicInferencePanel } from './DynamicInferencePanel'
import { useAssistantChat } from '../hooks/useMultinucleusChat'

interface MedicalAssistantProps {
  partialInput: string
  onSelectTemplate: (template: string) => void
  isVisible: boolean
  onClose: () => void
}

export const MedicalAssistant = ({ 
  partialInput, 
  onSelectTemplate, 
  isVisible, 
  onClose 
}: MedicalAssistantProps) => {
  
  // 🧠 MULTINÚCLEO: Usando Assistant Core para el asistente
  const { messages, messageCount, currentSession } = useAssistantChat()
  
  // Obtener el último mensaje para las inferencias
  const lastUserMessage = messages.filter(m => m.type === 'user').pop()?.content || ''
  
  // 🔥 ANILLO ÚNICO: Callback para detectar cuando las inferencias están completas
  const handleInferenceUpdate = (inferences: any[]) => {
    const ageInference = inferences.find(i => i.id === 'age')
    const genderInference = inferences.find(i => i.id === 'gender')
    
    // Verificar si ambos tienen confianza alta (>= 0.8)
    const ageComplete = ageInference && ageInference.confidence >= 0.8 && ageInference.value > 0
    const genderComplete = genderInference && genderInference.confidence >= 0.8 && genderInference.value !== 'No especificado'
    
    // 🎯 AUTOCLOSE Y PROMPT INJECTION
    if (ageComplete && genderComplete) {
      const age = ageInference.value
      const gender = genderInference.value === 'Masculino' ? 'masculino' : 'femenina'
      
      // Generar prompt médico completo usando los datos originales + inferencias
      const enhancedPrompt = `Paciente ${gender} de ${age} años ${partialInput.toLowerCase().includes('años') ? '' : 'presenta '}${partialInput.replace(/^\w/, c => c.toLowerCase()).replace(/años?\s*/i, '').trim()}`
      
      // 🧝‍♂️ SABIDURÍA ÉLFICA: Feedback inmediato + timing perfecto
      console.log('🔥 ANILLO ÚNICO ACTIVADO:', enhancedPrompt)
      
      // Mostrar feedback visual inmediato (< 0.1s)
      const autoCloseElement = document.querySelector('[data-autoclose-indicator]')
      if (autoCloseElement) {
        autoCloseElement.textContent = '✅ Prompt completado automáticamente'
        autoCloseElement.classList.add('animate-pulse', 'text-green-400')
      }
      
      // Inyección inmediata del prompt (Human-AI Collaboration)
      setTimeout(() => {
        onSelectTemplate(enhancedPrompt)
      }, 100) // 0.1 segundos = reacción inmediata
      
      // Auto-cierre con timing élfico (< 1 segundo total)
      setTimeout(() => {
        onClose()
      }, 800) // 0.8 segundos = mantiene flujo mental
    }
  }
  
  if (!isVisible) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-7xl h-[95vh] bg-slate-900 rounded-xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col">
        
        {/* Header Compacto y Profesional */}
        <div className="flex justify-between items-center px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-700 text-white border-b border-indigo-500/30">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <span className="text-lg">🏥</span>
            </div>
            <div>
              <h3 className="font-bold">Asistente de Diagnóstico IA</h3>
              <p className="text-xs text-indigo-200">Sistema inteligente • Fase 2 Implementada</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium">ACTIVO</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Layout Principal: 3 Columnas Responsivas */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Columna Izquierda: Chat Principal (60%) */}
          <div className="flex-1 lg:w-3/5 flex flex-col border-r border-gray-700">
            <IntelligentMedicalChat className="h-full" showMetrics={false} />
          </div>
          
          {/* Columna Derecha: Panel de Resumen Médico Completo */}
          <div className="w-full lg:w-2/5 bg-gray-800/50">
            <MedicalSummaryPanel 
              currentCase={{ soap: null, confidence: 0.8, urgencyLevel: 'medium' }}
              className="h-full"
            />
          </div>
          
        </div>
        
        {/* Footer de Estado con Indicador del Anillo Único */}
        <div className="hidden lg:block bg-gray-800/30 px-6 py-2 border-t border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-4">
              <span>💡 Inferencias actualizándose automáticamente</span>
              <div className="flex items-center gap-2">
                <span>Mensajes: {messageCount}</span>
                <span>•</span>
                <span>Session: {currentSession.id.slice(0, 8)}</span>
              </div>
              <div 
                data-autoclose-indicator 
                className="text-cyan-400 font-medium transition-all duration-300"
              >
                🔮 Esperando edad y género para autocompletado...
              </div>
            </div>
            <div className="text-gray-500">
              Creado por Bernard Orozco • Anillo Único Activado 💍
            </div>
          </div>
        </div>
        
      </div>
    </div>
  )
}

export default MedicalAssistant