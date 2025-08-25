// 🏥 Asistente Médico IA - Componente Contenedor con Métricas
// Creado por Bernard Orozco - Sistema de Diagnóstico Inteligente

'use client'

import { IntelligentMedicalChat } from './IntelligentMedicalChat'
import { MedicalSummaryPanel } from './MedicalSummaryPanel'
import { DynamicInferencePanel } from './DynamicInferencePanel'
import { useMedicalChat } from '../hooks/useMedicalChat'

interface MedicalAutocompletionProps {
  partialInput: string
  onSelectTemplate: (template: string) => void
  isVisible: boolean
  onClose: () => void
}

export const MedicalAutocompletion = ({ 
  partialInput, 
  onSelectTemplate, 
  isVisible, 
  onClose 
}: MedicalAutocompletionProps) => {
  
  // Hook para obtener las métricas desde el estado global
  const { intelligentChatMetrics, currentCase, messages } = useMedicalChat()
  
  // Obtener el último mensaje para las inferencias
  const lastUserMessage = messages.filter(m => m.type === 'user').pop()?.content || ''
  
  if (!isVisible) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl h-[85vh] bg-slate-900 rounded-2xl shadow-2xl border border-cyan-500/20 overflow-hidden flex flex-col">
        {/* Header con botón de cierre y título */}
        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏥</span>
            <div>
              <h3 className="font-bold text-lg">Asistente de Diagnóstico IA</h3>
              <p className="text-xs opacity-90">Sistema inteligente de inferencias médicas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Chat inteligente */}
        <div className="flex-1 overflow-hidden">
          <IntelligentMedicalChat className="h-full" showMetrics={false} />
        </div>
        
        {/* Panel de inferencias dinámicas y resumen médico */}
        <div className="p-4 bg-gray-900 border-t border-gray-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DynamicInferencePanel 
              currentMessage={lastUserMessage}
              className="text-gray-300"
            />
            <MedicalSummaryPanel 
              currentCase={currentCase}
              className="text-gray-300"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default MedicalAutocompletion