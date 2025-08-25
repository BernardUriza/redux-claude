// src/components/MedicalComponentLazy.tsx
// Lazy Loading para Componentes Médicos - FASE 5 - Creado por Bernard Orozco

'use client'

import { lazy, Suspense } from 'react'

// 🚀 LAZY LOADING DE COMPONENTES MÉDICOS MULTINÚCLEO
const SOAPDisplay = lazy(() => import('./SOAPDisplay').then(m => ({ default: m.SOAPDisplay })))
const RealTimeMetrics = lazy(() => import('./RealTimeMetrics').then(m => ({ default: m.RealTimeMetrics })))
const IterativeDiagnosticProgress = lazy(() => import('./IterativeDiagnosticProgress').then(m => ({ default: m.IterativeDiagnosticProgress })))
const FollowUpTracker = lazy(() => import('./FollowUpTracker').then(m => ({ default: m.FollowUpTracker })))
const MedicalNotes = lazy(() => import('./MedicalNotes').then(m => ({ default: m.MedicalNotes })))

// 📊 LOADING SKELETON COMPONENTE
const MedicalComponentSkeleton = ({ height = "200px", title }: { height?: string, title?: string }) => (
  <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-600/30 animate-pulse" style={{ height }}>
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="w-6 h-6 bg-slate-600 rounded-lg" />
        <div className="h-6 bg-slate-600 rounded w-32" />
      </div>
      <div className="w-8 h-8 bg-slate-600 rounded-full" />
    </div>
    
    <div className="space-y-3">
      <div className="h-4 bg-slate-600 rounded w-3/4" />
      <div className="h-4 bg-slate-600 rounded w-1/2" />
      <div className="h-4 bg-slate-600 rounded w-2/3" />
    </div>
    
    {title && (
      <div className="mt-4">
        <p className="text-slate-400 text-sm">Cargando {title}...</p>
      </div>
    )}
  </div>
)

// 🎯 COMPONENTES MÉDICOS CON LAZY LOADING

export const LazySOAPDisplay = () => (
  <Suspense fallback={<MedicalComponentSkeleton height="400px" title="Análisis SOAP" />}>
    <SOAPDisplay />
  </Suspense>
)

export const LazyRealTimeMetrics = () => (
  <Suspense fallback={<MedicalComponentSkeleton height="600px" title="Métricas en Tiempo Real" />}>
    <RealTimeMetrics />
  </Suspense>
)

export const LazyIterativeDiagnosticProgress = () => (
  <Suspense fallback={<MedicalComponentSkeleton height="300px" title="Progreso Diagnóstico" />}>
    <IterativeDiagnosticProgress />
  </Suspense>
)

export const LazyFollowUpTracker = () => (
  <Suspense fallback={<MedicalComponentSkeleton height="500px" title="Seguimiento y Recordatorios" />}>
    <FollowUpTracker />
  </Suspense>
)

export const LazyMedicalNotes = () => (
  <Suspense fallback={<MedicalComponentSkeleton height="400px" title="Notas Médicas" />}>
    <MedicalNotes />
  </Suspense>
)

// 🌟 BARREL EXPORT DE COMPONENTES LAZY
export {
  LazySOAPDisplay as SOAPDisplay,
  LazyRealTimeMetrics as RealTimeMetrics,
  LazyIterativeDiagnosticProgress as IterativeDiagnosticProgress,
  LazyFollowUpTracker as FollowUpTracker,
  LazyMedicalNotes as MedicalNotes
}