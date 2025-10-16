// src/services/redux-brain/SessionManager.ts
// Session Manager with TTL and Memory Limits - Clean Architecture

import { logger } from '@/lib/logger'

// Types
export interface SessionData {
  sessionId: string
  messages: ConversationMessage[]
  patientInfo: PatientInfo
  diagnosticState: DiagnosticState
  soapState: SOAPState
  urgencyAssessment?: UrgencyAssessment
  actionHistory: ReduxAction[]
  lastAccess: number // Timestamp for TTL
  createdAt: number
}

export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: Date
  validated?: boolean
  category?: string
}

export interface PatientInfo {
  age?: number | null
  gender?: string | null
  symptoms?: string[]
  duration?: string | null
  medicalHistory?: string[]
}

export interface DiagnosticState {
  differentialDiagnosis?: string[]
  recommendedTests?: string[]
  treatmentPlan?: string[]
  urgencyLevel?: string
}

export interface SOAPState {
  subjetivo?: string
  objetivo?: string
  analisis?: string
  plan?: string
}

export interface UrgencyAssessment {
  level: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'
  protocol?: string
  actions: string[]
  pediatricFlag?: boolean
  reasoning?: string
}

export interface ReduxAction {
  type: string
  payload: Record<string, unknown>
  timestamp: Date
  stateSnapshot: StateSnapshot
}

export interface StateSnapshot {
  messageCount: number
  hasPatientInfo: boolean
  soapProgress: number
  currentPhase: string
}

// Session Manager with TTL and Limits
export class SessionManager {
  private sessions = new Map<string, SessionData>()
  private readonly MAX_SESSIONS = 1000
  private readonly TTL_MS = 3600000 // 1 hour
  private readonly CLEANUP_INTERVAL_MS = 300000 // 5 minutes
  private cleanupTimer?: NodeJS.Timeout

  constructor() {
    // Start automatic cleanup
    this.startAutoCleanup()
  }

  /**
   * Get or create a session
   */
  getOrCreate(sessionId: string): SessionData {
    this.cleanup() // Cleanup on every access

    let session = this.sessions.get(sessionId)

    if (session) {
      // Update last access time
      session.lastAccess = Date.now()
      return session
    }

    // Check if we need to evict sessions
    if (this.sessions.size >= this.MAX_SESSIONS) {
      this.evictOldest()
    }

    // Create new session
    const now = Date.now()
    session = {
      sessionId,
      messages: [],
      patientInfo: {},
      diagnosticState: {},
      soapState: {},
      actionHistory: [],
      lastAccess: now,
      createdAt: now,
    }

    this.sessions.set(sessionId, session)
    logger.info('Session created', { sessionId, totalSessions: this.sessions.size })

    return session
  }

  /**
   * Get session without creating
   */
  get(sessionId: string): SessionData | null {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.lastAccess = Date.now()
      return session
    }
    return null
  }

  /**
   * Update session
   */
  update(sessionId: string, session: SessionData): void {
    session.lastAccess = Date.now()
    this.sessions.set(sessionId, session)
  }

  /**
   * Delete session
   */
  delete(sessionId: string): boolean {
    const deleted = this.sessions.delete(sessionId)
    if (deleted) {
      logger.info('Session deleted', { sessionId, totalSessions: this.sessions.size })
    }
    return deleted
  }

  /**
   * Get session count
   */
  size(): number {
    return this.sessions.size
  }

  /**
   * Check if session exists
   */
  has(sessionId: string): boolean {
    return this.sessions.has(sessionId)
  }

  /**
   * Cleanup expired sessions
   */
  private cleanup(): void {
    const now = Date.now()
    let expiredCount = 0

    for (const [id, session] of this.sessions) {
      if (now - session.lastAccess > this.TTL_MS) {
        this.sessions.delete(id)
        expiredCount++
      }
    }

    if (expiredCount > 0) {
      logger.info('Sessions expired and cleaned up', {
        expiredCount,
        remainingSessions: this.sessions.size,
      })
    }
  }

  /**
   * Evict oldest session when limit reached
   */
  private evictOldest(): void {
    let oldest: { id: string; lastAccess: number } | null = null

    for (const [id, session] of this.sessions) {
      if (!oldest || session.lastAccess < oldest.lastAccess) {
        oldest = { id, lastAccess: session.lastAccess }
      }
    }

    if (oldest) {
      this.sessions.delete(oldest.id)
      logger.warn('Session evicted due to limit', {
        sessionId: oldest.id,
        totalSessions: this.sessions.size,
      })
    }
  }

  /**
   * Start automatic cleanup timer
   */
  private startAutoCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.CLEANUP_INTERVAL_MS)

    logger.info('SessionManager auto-cleanup started', {
      intervalMs: this.CLEANUP_INTERVAL_MS,
      ttlMs: this.TTL_MS,
      maxSessions: this.MAX_SESSIONS,
    })
  }

  /**
   * Stop automatic cleanup (for graceful shutdown)
   */
  stopAutoCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      logger.info('SessionManager auto-cleanup stopped')
    }
  }

  /**
   * Get session statistics
   */
  getStats() {
    const now = Date.now()
    let activeSessions = 0
    let idleSessions = 0
    const IDLE_THRESHOLD = 600000 // 10 minutes

    for (const session of this.sessions.values()) {
      if (now - session.lastAccess < IDLE_THRESHOLD) {
        activeSessions++
      } else {
        idleSessions++
      }
    }

    return {
      total: this.sessions.size,
      active: activeSessions,
      idle: idleSessions,
      maxSessions: this.MAX_SESSIONS,
      utilizationPercent: Math.round((this.sessions.size / this.MAX_SESSIONS) * 100),
    }
  }
}

// Export singleton instance
export const sessionManager = new SessionManager()
