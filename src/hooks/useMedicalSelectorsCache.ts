// src/hooks/useMedicalSelectorsCache.ts
// Sistema de Cache Inteligente para Selectores Médicos - FASE 5 - Creado por Bernard Orozco

'use client'

import { useMemo, useRef, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { 
  selectCurrentSOAPAnalysis,
  selectSystemMetrics,
  selectDiagnosticProgress,
  selectPatientReminders,
  selectPhysicianNotes,
  type SOAPAnalysis,
  type SystemMetrics,
  type DiagnosticProgress,
  type PatientReminder,
  type PhysicianNote
} from '@redux-claude/cognitive-core/src/store/selectors'
import type { RootState } from '@redux-claude/cognitive-core'

// 🧠 CONFIGURACIÓN DEL CACHE
interface CacheConfig {
  ttl: number           // Time To Live en milisegundos
  maxSize: number       // Máximo número de entradas
  enableDebug: boolean  // Debug logs
}

const DEFAULT_CACHE_CONFIG: CacheConfig = {
  ttl: 5 * 60 * 1000,      // 5 minutos
  maxSize: 100,             // 100 entradas máximo
  enableDebug: false
}

// 📊 ENTRADA DEL CACHE
interface CacheEntry<T> {
  data: T
  timestamp: number
  hits: number
  lastAccess: number
}

// 🎯 CACHE MANAGER CLASS
class MedicalSelectorsCache {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private config: CacheConfig
  
  constructor(config: CacheConfig = DEFAULT_CACHE_CONFIG) {
    this.config = config
  }
  
  // ⚡ GET CON INVALIDACIÓN AUTOMÁTICA
  get<T>(key: string, fallback: () => T): T {
    const entry = this.cache.get(key)
    const now = Date.now()
    
    // Cache hit válido
    if (entry && (now - entry.timestamp) < this.config.ttl) {
      entry.hits++
      entry.lastAccess = now
      
      if (this.config.enableDebug) {
        console.log(`🎯 Cache HIT: ${key} (${entry.hits} hits)`)
      }
      
      return entry.data
    }
    
    // Cache miss - calcular nuevo valor
    const data = fallback()
    
    // Almacenar en cache
    this.set(key, data)
    
    if (this.config.enableDebug) {
      console.log(`⚡ Cache MISS: ${key} - Computed new value`)
    }
    
    return data
  }
  
  // 💾 SET CON GESTIÓN DE TAMAÑO
  private set<T>(key: string, data: T): void {
    const now = Date.now()
    
    // Limpiar cache si está lleno
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest()
    }
    
    this.cache.set(key, {
      data,
      timestamp: now,
      hits: 1,
      lastAccess: now
    })
  }
  
  // 🧹 EVITAR ENTRADAS MÁS ANTIGUAS
  private evictOldest(): void {
    let oldestKey = ''
    let oldestTime = Date.now()
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccess < oldestTime) {
        oldestTime = entry.lastAccess
        oldestKey = key
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey)
      if (this.config.enableDebug) {
        console.log(`🗑️ Cache EVICT: ${oldestKey}`)
      }
    }
  }
  
  // 📈 ESTADÍSTICAS DEL CACHE
  getStats() {
    const entries = Array.from(this.cache.values())
    const totalHits = entries.reduce((sum, entry) => sum + entry.hits, 0)
    const avgHits = entries.length > 0 ? totalHits / entries.length : 0
    
    return {
      size: this.cache.size,
      totalHits,
      avgHits,
      oldestEntry: Math.min(...entries.map(e => e.timestamp)),
      newestEntry: Math.max(...entries.map(e => e.timestamp))
    }
  }
  
  // 🧹 LIMPIAR CACHE
  clear(): void {
    this.cache.clear()
    if (this.config.enableDebug) {
      console.log('🧹 Cache CLEARED')
    }
  }
}

// 🎯 HOOK PRINCIPAL DE CACHE INTELIGENTE
export const useMedicalSelectorsCache = (config?: Partial<CacheConfig>) => {
  const fullConfig = useMemo(() => ({ ...DEFAULT_CACHE_CONFIG, ...config }), [config])
  const cacheRef = useRef<MedicalSelectorsCache>(new MedicalSelectorsCache(fullConfig))
  
  // 🏥 SOAP ANALYSIS CON CACHE
  const soapAnalysis = useSelector((state: RootState) => {
    const cacheKey = `soap_${state.medicalChat.sharedState.currentSession.id}`
    return cacheRef.current.get(cacheKey, () => selectCurrentSOAPAnalysis(state))
  })
  
  // 📊 SYSTEM METRICS CON CACHE
  const systemMetrics = useSelector((state: RootState) => {
    const cacheKey = `metrics_${Date.now()}`  // Se actualiza frecuentemente
    return cacheRef.current.get(cacheKey, () => selectSystemMetrics(state))
  })
  
  // 🔄 DIAGNOSTIC PROGRESS CON CACHE
  const diagnosticProgress = useSelector((state: RootState) => {
    const messageCount = state.medicalChat.cores.dashboard.messages.length
    const cacheKey = `progress_${messageCount}_${state.medicalChat.cores.dashboard.lastActivity}`
    return cacheRef.current.get(cacheKey, () => selectDiagnosticProgress(state))
  })
  
  // 📋 PATIENT REMINDERS CON CACHE
  const patientReminders = useSelector((state: RootState) => {
    const messageCount = state.medicalChat.cores.dashboard.messages.length
    const cacheKey = `reminders_${messageCount}`
    return cacheRef.current.get(cacheKey, () => selectPatientReminders(state))
  })
  
  // 📝 PHYSICIAN NOTES CON CACHE
  const physicianNotes = useSelector((state: RootState) => {
    const messageCount = state.medicalChat.cores.dashboard.messages.length
    const cacheKey = `notes_${messageCount}`
    return cacheRef.current.get(cacheKey, () => selectPhysicianNotes(state))
  })
  
  // 🔧 UTILIDADES DEL CACHE
  const clearCache = useCallback(() => {
    cacheRef.current.clear()
  }, [])
  
  const getCacheStats = useCallback(() => {
    return cacheRef.current.getStats()
  }, [])
  
  return {
    // 📊 Datos cached
    soapAnalysis,
    systemMetrics,
    diagnosticProgress,
    patientReminders,
    physicianNotes,
    
    // 🔧 Utilidades
    clearCache,
    getCacheStats,
    
    // 📈 Configuración
    config: fullConfig
  }
}

// 🎯 HOOK ESPECIALIZADO PARA CADA SELECTOR
export const useSOAPAnalysisCache = () => {
  const { soapAnalysis, clearCache, getCacheStats } = useMedicalSelectorsCache()
  return { soapAnalysis, clearCache, getCacheStats }
}

export const useSystemMetricsCache = () => {
  const { systemMetrics, clearCache, getCacheStats } = useMedicalSelectorsCache()
  return { systemMetrics, clearCache, getCacheStats }
}

export const useDiagnosticProgressCache = () => {
  const { diagnosticProgress, clearCache, getCacheStats } = useMedicalSelectorsCache()
  return { diagnosticProgress, clearCache, getCacheStats }
}

export const usePatientRemindersCache = () => {
  const { patientReminders, clearCache, getCacheStats } = useMedicalSelectorsCache()
  return { patientReminders, clearCache, getCacheStats }
}

export const usePhysicianNotesCache = () => {
  const { physicianNotes, clearCache, getCacheStats } = useMedicalSelectorsCache()
  return { physicianNotes, clearCache, getCacheStats }
}

// 🚀 HOOK PARA DEBUG Y MONITOREO
export const useCacheMonitor = (intervalMs: number = 10000) => {
  const { getCacheStats } = useMedicalSelectorsCache()
  
  const logStats = useCallback(() => {
    const stats = getCacheStats()
    console.log('📊 Medical Selectors Cache Stats:', {
      size: stats.size,
      totalHits: stats.totalHits,
      avgHits: stats.avgHits.toFixed(2),
      oldestEntry: new Date(stats.oldestEntry).toISOString(),
      newestEntry: new Date(stats.newestEntry).toISOString()
    })
  }, [getCacheStats])
  
  // Auto-logging en desarrollo
  useMemo(() => {
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(logStats, intervalMs)
      return () => clearInterval(interval)
    }
  }, [logStats, intervalMs])
  
  return { logStats, getCacheStats }
}