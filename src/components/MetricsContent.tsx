// src/components/MetricsContent.tsx
// Metrics panel content display - extracted from MedicalMetricsPanel.tsx
'use client'

import { UrgencyIndicator, CompactUrgencyIndicator, type UrgencyData } from './UrgencyIndicator'
import { RealTimeMetrics } from './RealTimeMetrics'
import { IterativeDiagnosticProgress } from './IterativeDiagnosticProgress'
import { SOAPDisplay } from './SOAPDisplay'
import { FollowUpTracker } from './FollowUpTracker'
import { MedicalNotes } from './MedicalNotes'
import { CognitiveAgentsPanel } from './CognitiveAgentsPanel'
import type { MedicalMessage } from '@redux-claude/cognitive-core'
import type { ActiveMetricsTab } from '../types/dashboard'

interface MetricsContentProps {
  activeTab: ActiveMetricsTab
  urgencyData: UrgencyData
  messagesCount: number
  lastMessage?: MedicalMessage
  isStreaming: boolean
}

const renderUrgencySection = (urgencyData: UrgencyData, messagesCount: number, showHeader?: boolean) => {
  if (urgencyData.level === 'low' && messagesCount === 0) {
    return showHeader ? (
      <div className="bg-gradient-to-r from-emerald-950/40 to-teal-950/40 backdrop-blur-xl rounded-xl p-4 border border-emerald-500/30">
        <div className="text-center">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-lg">🩺</span>
          </div>
          <h3 className="text-sm font-semibold text-emerald-300 mb-2">
            Sistema Médico Estable
          </h3>
          <p className="text-xs text-slate-400">No hay alertas médicas activas.</p>
        </div>
      </div>
    ) : null;
  }

  return (
    <section>
      {showHeader && (
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
          <h3 className="text-xs font-semibold text-red-300 uppercase tracking-wider">
            Estado Médico Crítico
          </h3>
        </div>
      )}
      {urgencyData.level === 'critical' || urgencyData.level === 'high' ? (
        <UrgencyIndicator
          urgencyData={urgencyData}
          className="rounded-xl border border-red-500/20 shadow-lg shadow-red-500/10"
        />
      ) : (
        <CompactUrgencyIndicator
          urgencyData={urgencyData}
          className="rounded-xl border border-slate-600/30 shadow-lg shadow-slate-950/20"
        />
      )}
    </section>
  );
};

export const MetricsContent: React.FC<MetricsContentProps> = ({
  activeTab,
  urgencyData,
  messagesCount,
  lastMessage,
  isStreaming,
}) => {
  return (
    <div className="flex-1 overflow-y-auto overscroll-contain min-h-0 pr-1 px-4">
      {/* RESUMEN - Vista General */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Estado Crítico - Siempre visible en resumen */}
          {renderUrgencySection(urgencyData, messagesCount)}

          {/* Métricas Clave */}
          <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/60 backdrop-blur-xl rounded-xl border border-slate-600/30 p-4 shadow-xl shadow-slate-950/30">
            <RealTimeMetrics />
          </div>
        </div>
      )}

      {/* CLÍNICO - Información Médica */}
      {activeTab === 'clinical' && (
        <div className="space-y-4">
          {renderUrgencySection(urgencyData, messagesCount, true)}

          <div className="bg-gradient-to-br from-blue-950/20 to-indigo-950/30 backdrop-blur-xl rounded-xl border border-blue-700/20 p-4 shadow-xl shadow-blue-950/20">
            <IterativeDiagnosticProgress />
          </div>
        </div>
      )}

      {/* SOAP - Análisis Estructurado */}
      {activeTab === 'soap' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-950/20 to-indigo-950/30 backdrop-blur-xl rounded-xl border border-blue-700/20 p-4 shadow-xl shadow-blue-950/20">
            <SOAPDisplay />
          </div>
        </div>
      )}

      {/* SEGUIMIENTO - Recordatorios y Notas */}
      {activeTab === 'followup' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-green-950/20 to-emerald-950/30 backdrop-blur-xl rounded-xl border border-green-700/20 p-4 shadow-xl shadow-green-950/20">
            <FollowUpTracker />
          </div>
        </div>
      )}

      {/* NOTAS - Notas Médicas con Trazabilidad */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-amber-950/20 to-orange-950/30 backdrop-blur-xl rounded-xl border border-amber-700/20 p-4 shadow-xl shadow-amber-950/20">
            <MedicalNotes />
          </div>
        </div>
      )}

      {/* AGENTES - Orquestador Cognitivo */}
      {activeTab === 'agents' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-purple-950/20 to-violet-950/30 backdrop-blur-xl rounded-xl border border-purple-700/20 p-4 shadow-xl shadow-purple-950/20">
            <CognitiveAgentsPanel lastMessage={lastMessage} isActive={isStreaming} />
          </div>
        </div>
      )}

      {/* SISTEMA - Métricas Técnicas */}
      {activeTab === 'system' && (
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
              <span className="text-xs text-slate-300">
                Motor Iterativo + Orquestador Cognitivo v2.0
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
