// src/monitoring/MedicalSystemMonitor.ts
// Sistema de Monitoreo Médico Real-Time - FASE 6 - Creado por Bernard Orozco

'use client'

import { EventEmitter } from 'events'

// 📊 INTERFACES DE MONITOREO
export interface SystemHealthMetrics {
  timestamp: number
  cpu: number // % uso simulado
  memory: number // % uso simulado
  selectorPerformance: number // ms promedio de selectores
  cacheHitRate: number // % de cache hits
  componentsLoaded: number // Cantidad de componentes lazy cargados
  errorsCount: number // Errores en última hora
  warningsCount: number // Warnings en última hora
  medicalDataQuality: number // Calidad de datos médicos (0-100)
}

export interface PerformanceAlert {
  id: string
  type: 'error' | 'warning' | 'info'
  category: 'performance' | 'memory' | 'cache' | 'medical' | 'system'
  message: string
  timestamp: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  resolved: boolean
  metadata?: Record<string, unknown>
}

export interface MedicalDataMetrics {
  soapAnalysisLatency: number
  systemMetricsLatency: number
  diagnosticProgressLatency: number
  remindersLatency: number
  notesLatency: number
  totalSelectorsExecuted: number
  averageConfidence: number
  lastProcessingTime: number
}

// 🧠 MONITOR PRINCIPAL
export class MedicalSystemMonitor extends EventEmitter {
  private metrics: SystemHealthMetrics
  private medicalMetrics: MedicalDataMetrics
  private alerts: PerformanceAlert[] = []
  private intervalId: NodeJS.Timeout | null = null
  private startTime: number = Date.now()
  private isRunning = false

  // 📊 CONFIGURACIÓN
  private readonly config = {
    updateInterval: 5000, // 5 segundos
    maxAlerts: 100, // Máximo alertas almacenadas
    performanceThresholds: {
      selectorLatency: 50, // ms máximo por selector
      cacheHitRate: 80, // % mínimo de cache hits
      memoryUsage: 80, // % máximo memoria
      errorRate: 5, // máximo errores por hora
    },
    alertRetention: 24 * 60 * 60 * 1000, // 24 horas
  }

  constructor() {
    super()

    // Inicializar métricas
    this.metrics = this.getInitialMetrics()
    this.medicalMetrics = this.getInitialMedicalMetrics()

    // Auto-start en desarrollo
    if (process.env.NODE_ENV === 'development') {
      this.start()
    }
  }

  // 🚀 INICIAR MONITOREO
  start(): void {
    if (this.isRunning) return

    this.isRunning = true
    this.intervalId = setInterval(() => {
      this.updateMetrics()
      this.checkAlerts()
      this.cleanupOldAlerts()
      this.emit('metricsUpdated', this.getSystemSnapshot())
    }, this.config.updateInterval)

    console.log('🔍 Medical System Monitor STARTED')
    this.createAlert('info', 'system', 'Sistema de monitoreo médico iniciado', 'low')
  }

  // ⏹️ DETENER MONITOREO
  stop(): void {
    if (!this.isRunning) return

    this.isRunning = false
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }

    console.log('🔍 Medical System Monitor STOPPED')
    this.createAlert('info', 'system', 'Sistema de monitoreo médico detenido', 'low')
  }

  // 📊 ACTUALIZAR MÉTRICAS
  private updateMetrics(): void {
    const now = Date.now()

    // Simular métricas del sistema
    this.metrics = {
      timestamp: now,
      cpu: this.simulateCPUUsage(),
      memory: this.simulateMemoryUsage(),
      selectorPerformance: this.calculateSelectorPerformance(),
      cacheHitRate: this.calculateCacheHitRate(),
      componentsLoaded: this.getLoadedComponentsCount(),
      errorsCount: this.getErrorsInLastHour(),
      warningsCount: this.getWarningsInLastHour(),
      medicalDataQuality: this.calculateMedicalDataQuality(),
    }

    // Actualizar métricas médicas
    this.medicalMetrics = {
      ...this.medicalMetrics,
      totalSelectorsExecuted:
        this.medicalMetrics.totalSelectorsExecuted + Math.floor(Math.random() * 5),
      lastProcessingTime: now,
    }
  }

  // 🚨 VERIFICAR ALERTAS
  private checkAlerts(): void {
    const { performanceThresholds } = this.config

    // Alerta de latencia de selectores
    if (this.metrics.selectorPerformance > performanceThresholds.selectorLatency) {
      this.createAlert(
        'warning',
        'performance',
        `Latencia de selectores alta: ${this.metrics.selectorPerformance}ms`,
        'medium',
        {
          latency: this.metrics.selectorPerformance,
          threshold: performanceThresholds.selectorLatency,
        }
      )
    }

    // Alerta de cache hit rate bajo
    if (this.metrics.cacheHitRate < performanceThresholds.cacheHitRate) {
      this.createAlert(
        'warning',
        'cache',
        `Cache hit rate bajo: ${this.metrics.cacheHitRate}%`,
        'medium',
        { hitRate: this.metrics.cacheHitRate, threshold: performanceThresholds.cacheHitRate }
      )
    }

    // Alerta de uso de memoria alto
    if (this.metrics.memory > performanceThresholds.memoryUsage) {
      this.createAlert('error', 'memory', `Uso de memoria alto: ${this.metrics.memory}%`, 'high', {
        memoryUsage: this.metrics.memory,
        threshold: performanceThresholds.memoryUsage,
      })
    }

    // Alerta de calidad de datos médicos baja
    const MEDICAL_DATA_QUALITY_THRESHOLD = 70
    if (this.metrics.medicalDataQuality < MEDICAL_DATA_QUALITY_THRESHOLD) {
      this.createAlert(
        'warning',
        'medical',
        `Calidad de datos médicos baja: ${this.metrics.medicalDataQuality}%`,
        'medium',
        { quality: this.metrics.medicalDataQuality }
      )
    }
  }

  // 🚨 CREAR ALERTA
  private createAlert(
    type: PerformanceAlert['type'],
    category: PerformanceAlert['category'],
    message: string,
    severity: PerformanceAlert['severity'],
    metadata?: Record<string, unknown>
  ): void {
    const alert: PerformanceAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      category,
      message,
      timestamp: Date.now(),
      severity,
      resolved: false,
      metadata,
    }

    this.alerts.unshift(alert) // Agregar al inicio

    // Mantener solo las últimas alertas
    if (this.alerts.length > this.config.maxAlerts) {
      this.alerts = this.alerts.slice(0, this.config.maxAlerts)
    }

    // Emitir evento
    this.emit('alert', alert)

    // Log en consola si es importante
    if (severity === 'high' || severity === 'critical') {
      console.warn(`🚨 [${category.toUpperCase()}] ${message}`, metadata)
    }
  }

  // 🧹 LIMPIAR ALERTAS ANTIGUAS
  private cleanupOldAlerts(): void {
    const cutoffTime = Date.now() - this.config.alertRetention
    const initialLength = this.alerts.length

    this.alerts = this.alerts.filter(alert => alert.timestamp > cutoffTime)

    if (this.alerts.length !== initialLength) {
      console.log(`🧹 Limpiadas ${initialLength - this.alerts.length} alertas antiguas`)
    }
  }

  // 📊 MÉTODOS DE CÁLCULO SIMULADO
  private simulateCPUUsage(): number {
    const base = 15 + Math.random() * 20 // 15-35% base
    const SPIKE_PROBABILITY = 0.1
    const SPIKE_MAXIMUM = 40
    const spike = Math.random() < SPIKE_PROBABILITY ? Math.random() * SPIKE_MAXIMUM : 0 // 10% chance de spike
    return Math.min(Math.round(base + spike), 100)
  }

  private simulateMemoryUsage(): number {
    const componentsLoaded = this.getLoadedComponentsCount()
    const base = 30 + componentsLoaded * 5 // Base + componentes
    const VARIANCE_RANGE = 15
    const VARIANCE_OFFSET = 7.5
    const variance = Math.random() * VARIANCE_RANGE - VARIANCE_OFFSET // ±7.5%
    return Math.min(Math.max(Math.round(base + variance), 0), 100)
  }

  private calculateSelectorPerformance(): number {
    // Simular latencia de selectores (normalmente 5-50ms)
    const base = 5 + Math.random() * 15
    const complexity = Math.random() * 30 // Complejidad variable
    return Math.round(base + complexity)
  }

  private calculateCacheHitRate(): number {
    // Simular hit rate (debería ser alto, 80-98%)
    const base = 80 + Math.random() * 15
    const EFFICIENCY_PROBABILITY = 0.9
    const EFFICIENCY_BONUS = 3
    const INEFFICIENCY_PENALTY = -10
    const efficiency =
      Math.random() < EFFICIENCY_PROBABILITY ? EFFICIENCY_BONUS : INEFFICIENCY_PENALTY // 90% chance de ser eficiente
    return Math.min(Math.round(base + efficiency), 100)
  }

  private getLoadedComponentsCount(): number {
    // Simular componentes lazy-loaded
    const MIN_COMPONENTS = 1
    const MAX_COMPONENTS_RANGE = 5
    return Math.floor(Math.random() * MAX_COMPONENTS_RANGE) + MIN_COMPONENTS // 1-5 componentes
  }

  private getErrorsInLastHour(): number {
    return Math.floor(Math.random() * 3) // 0-2 errores
  }

  private getWarningsInLastHour(): number {
    return Math.floor(Math.random() * 8) // 0-7 warnings
  }

  private calculateMedicalDataQuality(): number {
    // Calidad basada en completitud y confianza de datos
    const COMPLETENESS_BASE = 85
    const COMPLETENESS_RANGE = 12
    const completeness = COMPLETENESS_BASE + Math.random() * COMPLETENESS_RANGE // 85-97%
    const confidence = 80 + Math.random() * 15 // 80-95%
    return Math.round((completeness + confidence) / 2)
  }

  // 📊 MÉTODOS INICIALES
  private getInitialMetrics(): SystemHealthMetrics {
    return {
      timestamp: Date.now(),
      cpu: 0,
      memory: 0,
      selectorPerformance: 0,
      cacheHitRate: 0,
      componentsLoaded: 0,
      errorsCount: 0,
      warningsCount: 0,
      medicalDataQuality: 0,
    }
  }

  private getInitialMedicalMetrics(): MedicalDataMetrics {
    return {
      soapAnalysisLatency: 0,
      systemMetricsLatency: 0,
      diagnosticProgressLatency: 0,
      remindersLatency: 0,
      notesLatency: 0,
      totalSelectorsExecuted: 0,
      averageConfidence: 0,
      lastProcessingTime: Date.now(),
    }
  }

  // 📊 API PÚBLICA
  getSystemSnapshot() {
    return {
      metrics: this.metrics,
      medicalMetrics: this.medicalMetrics,
      alerts: this.alerts.slice(0, 20), // Últimas 20 alertas
      uptime: Date.now() - this.startTime,
      isRunning: this.isRunning,
    }
  }

  getAlerts(category?: PerformanceAlert['category']): PerformanceAlert[] {
    return category ? this.alerts.filter(alert => alert.category === category) : this.alerts
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.resolved = true
      this.emit('alertResolved', alert)
      return true
    }
    return false
  }

  // 📈 MÉTRICAS AVANZADAS
  getSystemHealth(): 'excellent' | 'good' | 'warning' | 'critical' {
    const { cpu, memory, selectorPerformance, cacheHitRate, medicalDataQuality } = this.metrics

    // Scoring system
    let score = 100
    const CPU_THRESHOLD = 80
    const MEMORY_THRESHOLD = 80
    const SELECTOR_THRESHOLD = 50
    const CACHE_THRESHOLD = 80
    const EXCELLENCE_THRESHOLD = 90
    const GOOD_THRESHOLD = 70
    const WARNING_THRESHOLD = 50
    const CPU_PENALTY = 20
    const MEMORY_PENALTY = 25
    const SELECTOR_PENALTY = 15
    const CACHE_PENALTY = 20
    const QUALITY_PENALTY = 20

    if (cpu > CPU_THRESHOLD) score -= CPU_PENALTY
    if (memory > MEMORY_THRESHOLD) score -= MEMORY_PENALTY
    if (selectorPerformance > SELECTOR_THRESHOLD) score -= SELECTOR_PENALTY
    if (cacheHitRate < CACHE_THRESHOLD) score -= CACHE_PENALTY
    if (medicalDataQuality < QUALITY_THRESHOLD) score -= QUALITY_PENALTY

    if (score >= EXCELLENCE_THRESHOLD) return 'excellent'
    if (score >= GOOD_THRESHOLD) return 'good'
    if (score >= WARNING_THRESHOLD) return 'warning'
    return 'critical'
  }

  // 🎯 MÉTRICAS DE SELECTORES ESPECÍFICOS
  recordSelectorLatency(selectorName: string, latency: number): void {
    const key = `${selectorName}Latency` as keyof MedicalDataMetrics
    if (key in this.medicalMetrics) {
      ;(this.medicalMetrics as unknown as Record<string, unknown>)[key] = latency
    }
  }

  updateAverageConfidence(confidence: number): void {
    this.medicalMetrics.averageConfidence = confidence
  }
}

// 🎯 INSTANCIA SINGLETON
export const medicalSystemMonitor = new MedicalSystemMonitor()

// 🎭 AUTO-START EN DESARROLLO
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Hacer disponible globalmente para debug
  ;(window as unknown as Record<string, unknown>).medicalMonitor = medicalSystemMonitor
  console.log('🔍 Medical Monitor disponible como window.medicalMonitor')
}
