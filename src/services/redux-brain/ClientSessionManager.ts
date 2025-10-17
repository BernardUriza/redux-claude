// src/services/redux-brain/ClientSessionManager.ts
// Client-Side Session Manager - Serverless-Compatible Persistence
// Bernard Orozco 2025 - Stateless Serverless Architecture

import type {
  SessionData,
  ConversationMessage,
  PatientInfo,
  SOAPState,
  UrgencyAssessment,
} from './SessionManager'

/**
 * Client-side session manager using localStorage
 * Solves serverless stateless problem by storing session data in browser
 */
export class ClientSessionManager {
  private readonly SESSION_PREFIX = 'redux-brain-session-'
  private readonly TTL_MS = 3600000 // 1 hour

  /**
   * Save complete session to localStorage
   */
  saveSession(sessionId: string, data: Partial<SessionData>): void {
    try {
      const key = this.SESSION_PREFIX + sessionId
      const sessionData: StoredSessionData = {
        ...data,
        sessionId,
        lastAccess: Date.now(),
        createdAt: data.createdAt || Date.now(),
      }
      localStorage.setItem(key, JSON.stringify(sessionData))
    } catch (error) {
      console.error('Failed to save session to localStorage', error)
    }
  }

  /**
   * Get session from localStorage
   */
  getSession(sessionId: string): StoredSessionData | null {
    try {
      const key = this.SESSION_PREFIX + sessionId
      const data = localStorage.getItem(key)

      if (!data) return null

      const session = JSON.parse(data) as StoredSessionData

      // Check if session is expired
      if (Date.now() - session.lastAccess > this.TTL_MS) {
        this.deleteSession(sessionId)
        return null
      }

      // Update last access time
      session.lastAccess = Date.now()
      localStorage.setItem(key, JSON.stringify(session))

      return session
    } catch (error) {
      console.error('Failed to get session from localStorage', error)
      return null
    }
  }

  /**
   * Delete session from localStorage
   */
  deleteSession(sessionId: string): void {
    try {
      const key = this.SESSION_PREFIX + sessionId
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Failed to delete session from localStorage', error)
    }
  }

  /**
   * Update specific fields in session
   */
  updateSession(sessionId: string, updates: Partial<SessionData>): void {
    const existing = this.getSession(sessionId)
    if (existing) {
      this.saveSession(sessionId, { ...existing, ...updates })
    }
  }

  /**
   * Add message to session
   */
  addMessage(sessionId: string, message: ConversationMessage): void {
    const session = this.getSession(sessionId)
    if (session) {
      const messages = session.messages || []
      messages.push(message)
      this.updateSession(sessionId, { messages })
    }
  }

  /**
   * Update patient info
   */
  updatePatientInfo(sessionId: string, patientInfo: Partial<PatientInfo>): void {
    const session = this.getSession(sessionId)
    if (session) {
      this.updateSession(sessionId, {
        patientInfo: { ...session.patientInfo, ...patientInfo },
      })
    }
  }

  /**
   * Update SOAP state
   */
  updateSOAPState(sessionId: string, soapState: Partial<SOAPState>): void {
    const session = this.getSession(sessionId)
    if (session) {
      this.updateSession(sessionId, {
        soapState: { ...session.soapState, ...soapState },
      })
    }
  }

  /**
   * Update urgency assessment
   */
  updateUrgencyAssessment(sessionId: string, urgency: UrgencyAssessment): void {
    const session = this.getSession(sessionId)
    if (session) {
      this.updateSession(sessionId, { urgencyAssessment: urgency })
    }
  }

  /**
   * Get conversation history (messages only)
   */
  getConversationHistory(sessionId: string): ConversationMessage[] {
    const session = this.getSession(sessionId)
    return session?.messages || []
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions(): number {
    let cleaned = 0
    try {
      const keys = Object.keys(localStorage)
      const sessionKeys = keys.filter(k => k.startsWith(this.SESSION_PREFIX))

      sessionKeys.forEach(key => {
        const data = localStorage.getItem(key)
        if (data) {
          const session = JSON.parse(data) as StoredSessionData
          if (Date.now() - session.lastAccess > this.TTL_MS) {
            localStorage.removeItem(key)
            cleaned++
          }
        }
      })
    } catch (error) {
      console.error('Failed to cleanup expired sessions', error)
    }
    return cleaned
  }

  /**
   * Get all active session IDs
   */
  getActiveSessions(): string[] {
    try {
      const keys = Object.keys(localStorage)
      return keys
        .filter(k => k.startsWith(this.SESSION_PREFIX))
        .map(k => k.replace(this.SESSION_PREFIX, ''))
    } catch {
      return []
    }
  }

  /**
   * Get session statistics
   */
  getStats() {
    const sessions = this.getActiveSessions()
    const now = Date.now()
    let active = 0
    let idle = 0
    const IDLE_THRESHOLD = 600000 // 10 minutes

    sessions.forEach(sessionId => {
      const session = this.getSession(sessionId)
      if (session) {
        if (now - session.lastAccess < IDLE_THRESHOLD) {
          active++
        } else {
          idle++
        }
      }
    })

    return {
      total: sessions.length,
      active,
      idle,
      storageUsed: this.getStorageUsed(),
    }
  }

  /**
   * Get approximate storage used (in KB)
   */
  private getStorageUsed(): number {
    try {
      let total = 0
      const keys = Object.keys(localStorage)
      const sessionKeys = keys.filter(k => k.startsWith(this.SESSION_PREFIX))

      sessionKeys.forEach(key => {
        const data = localStorage.getItem(key)
        if (data) {
          total += new Blob([data]).size
        }
      })

      return Math.round(total / 1024) // Convert to KB
    } catch {
      return 0
    }
  }
}

// Type for stored session data
interface StoredSessionData extends Partial<SessionData> {
  sessionId: string
  lastAccess: number
  createdAt: number
}

// Export singleton instance
export const clientSessionManager = new ClientSessionManager()

// Auto-cleanup on page load
if (typeof window !== 'undefined') {
  // Cleanup expired sessions on load
  const cleaned = clientSessionManager.cleanupExpiredSessions()
  if (cleaned > 0) {
    console.log(`Cleaned up ${cleaned} expired sessions`)
  }
}
