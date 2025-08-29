// tests/selectors/medicalSelectors.test.ts
// Unit Tests para Selectores Médicos - FASE 7 - Creado por Bernard Orozco

import {
  selectCurrentSOAPAnalysis,
  selectSystemMetrics,
  selectDiagnosticProgress,
  selectPatientReminders,
  selectPhysicianNotes,
} from '../../packages/cognitive-core/src/store/selectors/medicalSelectors'

import type { RootState } from '../../packages/cognitive-core/src/store/store'
import type { MedicalMessage } from '../../packages/cognitive-core/src/store/medicalChatSlice'

// 🧪 MOCK STATE BUILDER
const createMockRootState = (overrides?: Partial<RootState>): RootState => ({
  medicalChat: {
    cores: {
      dashboard: {
        messages: [],
        isLoading: false,
        lastActivity: Date.now(),
        sessionId: 'test-session-123',
      },
      assistant: {
        messages: [],
        isLoading: false,
        lastActivity: Date.now(),
        sessionId: 'test-session-123',
      },
      inference: {
        messages: [],
        isLoading: false,
        lastActivity: Date.now(),
        sessionId: 'test-session-123',
      },
    },
    sharedState: {
      currentSession: {
        id: 'test-session-123',
        startedAt: Date.now() - 300000, // 5 minutes ago
      },
      isLoading: false,
      error: undefined,
    },
  },
  ...overrides,
})

// 🧪 MOCK MESSAGE BUILDER
const createMockMessage = (overrides?: Partial<MedicalMessage>): MedicalMessage => ({
  id: `msg-${Math.random().toString(36).substr(2, 9)}`,
  type: 'assistant',
  content: 'Test medical content',
  timestamp: Date.now(),
  confidence: 0.85,
  metadata: {
    sectionType: 'diagnosis',
  },
  ...overrides,
})

describe('Medical Selectors', () => {
  // 🏥 SOAP ANALYSIS TESTS
  describe('selectCurrentSOAPAnalysis', () => {
    it('should return null when no medical messages exist', () => {
      const state = createMockRootState()
      const result = selectCurrentSOAPAnalysis(state)

      expect(result).toBeNull()
    })

    it('should extract SOAP sections from medical messages', () => {
      const messages: MedicalMessage[] = [
        createMockMessage({
          type: 'user',
          content: 'Patient complains of headache and nausea',
          metadata: { sectionType: 'diagnosis' },
        }),
        createMockMessage({
          type: 'assistant',
          content: 'Physical examination reveals elevated blood pressure',
          metadata: { sectionType: 'diagnosis' },
        }),
        createMockMessage({
          type: 'assistant',
          content: 'Diagnosis: Hypertensive crisis',
          confidence: 0.92,
          metadata: { sectionType: 'diagnosis' },
        }),
        createMockMessage({
          type: 'assistant',
          content: 'Prescribe ACE inhibitor and schedule follow-up',
          metadata: { sectionType: 'treatment' },
        }),
      ]

      const state = createMockRootState({
        medicalChat: {
          ...createMockRootState().medicalChat,
          cores: {
            ...createMockRootState().medicalChat.cores,
            dashboard: {
              messages,
              isLoading: false,
              lastActivity: Date.now(),
              sessionId: 'test-session-123',
            },
          },
        },
      })

      const result = selectCurrentSOAPAnalysis(state)

      expect(result).not.toBeNull()
      expect(result!.subjective).toContain('headache')
      expect(result!.objective).toContain('blood pressure')
      expect(result!.assessment).toContain('Hypertensive')
      expect(result!.plan).toContain('ACE inhibitor')
      expect(result!.confidence).toBeCloseTo(0.85, 1)
      expect(result!.sessionId).toBe('test-session-123')
    })

    it('should calculate average confidence correctly', () => {
      const messages: MedicalMessage[] = [
        createMockMessage({ confidence: 0.9 }),
        createMockMessage({ confidence: 0.8 }),
        createMockMessage({ confidence: 0.7 }),
      ]

      const state = createMockRootState({
        medicalChat: {
          ...createMockRootState().medicalChat,
          cores: {
            ...createMockRootState().medicalChat.cores,
            dashboard: {
              messages,
              isLoading: false,
              lastActivity: Date.now(),
              sessionId: 'test-session-123',
            },
          },
        },
      })

      const result = selectCurrentSOAPAnalysis(state)

      expect(result!.confidence).toBeCloseTo(0.8, 1)
    })

    it('should filter out welcome messages', () => {
      const messages: MedicalMessage[] = [
        createMockMessage({
          id: 'welcome_multinucleus',
          content: 'Welcome to medical system',
        }),
        createMockMessage({
          content: 'Actual medical content',
          confidence: 0.9,
        }),
      ]

      const state = createMockRootState({
        medicalChat: {
          ...createMockRootState().medicalChat,
          cores: {
            ...createMockRootState().medicalChat.cores,
            dashboard: {
              messages,
              isLoading: false,
              lastActivity: Date.now(),
              sessionId: 'test-session-123',
            },
          },
        },
      })

      const result = selectCurrentSOAPAnalysis(state)

      expect(result!.confidence).toBe(0.9)
    })
  })

  // 📊 SYSTEM METRICS TESTS
  describe('selectSystemMetrics', () => {
    it('should return empty metrics when no messages exist', () => {
      const state = createMockRootState()
      const result = selectSystemMetrics(state)

      expect(result.confidence).toBe(0)
      expect(result.cycles).toBe(0)
      expect(result.agentsActive).toBe(0)
      expect(result.messagesCount).toBe(0)
      expect(result.systemHealth).toBe('good')
    })

    it('should calculate system metrics from multiple cores', () => {
      const dashboardMessages = [
        createMockMessage({ confidence: 0.9 }),
        createMockMessage({ confidence: 0.8 }),
      ]

      const assistantMessages = [createMockMessage({ confidence: 0.85 })]

      const state = createMockRootState({
        medicalChat: {
          ...createMockRootState().medicalChat,
          cores: {
            dashboard: {
              messages: dashboardMessages,
              isLoading: false,
              lastActivity: Date.now() - 1000,
              sessionId: 'test-session-123',
            },
            assistant: {
              messages: assistantMessages,
              isLoading: false,
              lastActivity: Date.now() - 2000,
              sessionId: 'test-session-123',
            },
            inference: {
              messages: [],
              isLoading: false,
              lastActivity: Date.now() - 10000, // Old activity
              sessionId: 'test-session-123',
            },
          },
        },
      })

      const result = selectSystemMetrics(state)

      expect(result.confidence).toBeCloseTo(0.85, 1)
      expect(result.messagesCount).toBe(3)
      expect(result.agentsActive).toBe(2) // Only dashboard and assistant active
    })

    it('should determine system health correctly', () => {
      const highConfidenceMessages = Array(10)
        .fill(null)
        .map(() => createMockMessage({ confidence: 0.95 }))

      const state = createMockRootState({
        medicalChat: {
          ...createMockRootState().medicalChat,
          cores: {
            ...createMockRootState().medicalChat.cores,
            dashboard: {
              messages: highConfidenceMessages,
              isLoading: false,
              lastActivity: Date.now(),
              sessionId: 'test-session-123',
            },
          },
        },
      })

      const result = selectSystemMetrics(state)

      expect(result.systemHealth).toBe('optimal')
    })
  })

  // 🔄 DIAGNOSTIC PROGRESS TESTS
  describe('selectDiagnosticProgress', () => {
    it('should return initial progress when no messages exist', () => {
      const state = createMockRootState()
      const result = selectDiagnosticProgress(state)

      expect(result.currentCycle).toBe(0)
      expect(result.totalCycles).toBe(0)
      expect(result.currentPhase).toBe('intake')
      expect(result.completionPercentage).toBe(0)
      expect(result.isStalled).toBe(false)
    })

    it('should track diagnostic cycles correctly', () => {
      const messages: MedicalMessage[] = [
        createMockMessage({
          type: 'user',
          content: 'Patient symptoms...',
          metadata: { sectionType: 'diagnosis' },
        }),
        createMockMessage({
          type: 'assistant',
          content: 'Analysis response...',
          metadata: { sectionType: 'diagnosis' },
        }),
        createMockMessage({
          type: 'user',
          content: 'Follow-up question...',
        }),
        createMockMessage({
          type: 'assistant',
          content: 'Treatment plan...',
          metadata: { sectionType: 'treatment' },
        }),
      ]

      const state = createMockRootState({
        medicalChat: {
          ...createMockRootState().medicalChat,
          cores: {
            ...createMockRootState().medicalChat.cores,
            dashboard: {
              messages,
              isLoading: false,
              lastActivity: Date.now(),
              sessionId: 'test-session-123',
            },
          },
        },
      })

      const result = selectDiagnosticProgress(state)

      expect(result.currentCycle).toBeGreaterThan(0)
      expect(result.totalCycles).toBeGreaterThan(0)
      expect(result.completionPercentage).toBeGreaterThan(0)
    })

    it('should detect stalled progress', () => {
      const oldTimestamp = Date.now() - 15 * 60 * 1000 // 15 minutes ago

      const state = createMockRootState({
        medicalChat: {
          ...createMockRootState().medicalChat,
          cores: {
            ...createMockRootState().medicalChat.cores,
            dashboard: {
              messages: [createMockMessage()],
              isLoading: false,
              lastActivity: oldTimestamp,
              sessionId: 'test-session-123',
            },
          },
        },
      })

      const result = selectDiagnosticProgress(state)

      expect(result.isStalled).toBe(true)
    })
  })

  // 📋 PATIENT REMINDERS TESTS
  describe('selectPatientReminders', () => {
    it('should return empty array when no followup messages exist', () => {
      const state = createMockRootState()
      const result = selectPatientReminders(state)

      expect(result).toEqual([])
    })

    it('should extract reminders from followup messages', () => {
      const messages: MedicalMessage[] = [
        createMockMessage({
          content: 'Take medication twice daily and schedule follow-up appointment in 2 weeks',
          metadata: { sectionType: 'treatment' },
        }),
        createMockMessage({
          content: 'Monitor blood pressure daily and avoid high sodium foods',
          metadata: { sectionType: 'treatment' },
        }),
      ]

      const state = createMockRootState({
        medicalChat: {
          ...createMockRootState().medicalChat,
          cores: {
            ...createMockRootState().medicalChat.cores,
            dashboard: {
              messages,
              isLoading: false,
              lastActivity: Date.now(),
              sessionId: 'test-session-123',
            },
          },
        },
      })

      const result = selectPatientReminders(state)

      expect(result).toHaveLength(2)
      expect(result[0].type).toMatch(/medication|appointment|monitoring/)
      expect(result[0].priority).toMatch(/low|medium|high|urgent/)
      expect(result[0].content).toBeTruthy()
    })

    it('should classify reminder types correctly', () => {
      const medicationMessage = createMockMessage({
        content: 'Take prescribed medication with meals',
        metadata: { sectionType: 'treatment' },
      })

      const appointmentMessage = createMockMessage({
        content: 'Schedule appointment with cardiologist',
        metadata: { sectionType: 'treatment' },
      })

      const state = createMockRootState({
        medicalChat: {
          ...createMockRootState().medicalChat,
          cores: {
            ...createMockRootState().medicalChat.cores,
            dashboard: {
              messages: [medicationMessage, appointmentMessage],
              isLoading: false,
              lastActivity: Date.now(),
              sessionId: 'test-session-123',
            },
          },
        },
      })

      const result = selectPatientReminders(state)

      const medicationReminder = result.find(r => r.content.includes('medication'))
      const appointmentReminder = result.find(r => r.content.includes('appointment'))

      expect(medicationReminder?.type).toBe('medication')
      expect(appointmentReminder?.type).toBe('appointment')
    })
  })

  // 📝 PHYSICIAN NOTES TESTS
  describe('selectPhysicianNotes', () => {
    it('should return empty array when no relevant messages exist', () => {
      const state = createMockRootState()
      const result = selectPhysicianNotes(state)

      expect(result).toEqual([])
    })

    it('should convert medical messages to physician notes', () => {
      const messages: MedicalMessage[] = [
        createMockMessage({
          type: 'assistant',
          content:
            'Patient presents with classic symptoms of hypertension. Recommending lifestyle changes and medication.',
          confidence: 0.9,
          metadata: { sectionType: 'diagnosis' },
        }),
        createMockMessage({
          type: 'assistant',
          content: 'Treatment plan includes ACE inhibitor and dietary modifications.',
          confidence: 0.85,
          metadata: { sectionType: 'treatment' },
        }),
      ]

      const state = createMockRootState({
        medicalChat: {
          ...createMockRootState().medicalChat,
          cores: {
            ...createMockRootState().medicalChat.cores,
            dashboard: {
              messages,
              isLoading: false,
              lastActivity: Date.now(),
              sessionId: 'test-session-123',
            },
          },
        },
      })

      const result = selectPhysicianNotes(state)

      expect(result).toHaveLength(2)
      expect(result[0].category).toMatch(/diagnosis|treatment|observation|plan|education/)
      expect(result[0].confidence).toBeGreaterThan(0)
      expect(result[0].content).toBeTruthy()
      expect(result[0].patientSessionId).toBe('test-session-123')
    })

    it('should filter out short messages', () => {
      const messages: MedicalMessage[] = [
        createMockMessage({
          type: 'assistant',
          content: 'Yes', // Too short
          metadata: { sectionType: 'diagnosis' },
        }),
        createMockMessage({
          type: 'assistant',
          content:
            'This is a proper medical note with sufficient detail for documentation purposes.',
          metadata: { sectionType: 'diagnosis' },
        }),
      ]

      const state = createMockRootState({
        medicalChat: {
          ...createMockRootState().medicalChat,
          cores: {
            ...createMockRootState().medicalChat.cores,
            dashboard: {
              messages,
              isLoading: false,
              lastActivity: Date.now(),
              sessionId: 'test-session-123',
            },
          },
        },
      })

      const result = selectPhysicianNotes(state)

      expect(result).toHaveLength(1)
      expect(result[0].content).toContain('sufficient detail')
    })

    it('should sort notes by importance and date', () => {
      const messages: MedicalMessage[] = [
        createMockMessage({
          type: 'assistant',
          content: 'Regular observation with moderate confidence level.',
          confidence: 0.6,
          timestamp: Date.now() - 1000,
          metadata: { sectionType: 'diagnosis' },
        }),
        createMockMessage({
          type: 'assistant',
          content: 'Critical diagnosis requiring immediate attention and high confidence.',
          confidence: 0.95,
          timestamp: Date.now(),
          metadata: { sectionType: 'diagnosis' },
        }),
      ]

      const state = createMockRootState({
        medicalChat: {
          ...createMockRootState().medicalChat,
          cores: {
            ...createMockRootState().medicalChat.cores,
            dashboard: {
              messages,
              isLoading: false,
              lastActivity: Date.now(),
              sessionId: 'test-session-123',
            },
          },
        },
      })

      const result = selectPhysicianNotes(state)

      // Higher confidence note should be marked as important and come first
      expect(result[0].isImportant).toBe(true)
      expect(result[0].confidence).toBe(0.95)
    })
  })

  // 🔄 SELECTOR MEMOIZATION TESTS
  describe('Selector Memoization', () => {
    it('should return same reference when state does not change', () => {
      const state = createMockRootState({
        medicalChat: {
          ...createMockRootState().medicalChat,
          cores: {
            ...createMockRootState().medicalChat.cores,
            dashboard: {
              messages: [createMockMessage()],
              isLoading: false,
              lastActivity: Date.now(),
              sessionId: 'test-session-123',
            },
          },
        },
      })

      const result1 = selectSystemMetrics(state)
      const result2 = selectSystemMetrics(state)

      expect(result1).toBe(result2) // Same reference due to memoization
    })

    it('should return new reference when relevant state changes', () => {
      const baseState = createMockRootState({
        medicalChat: {
          ...createMockRootState().medicalChat,
          cores: {
            ...createMockRootState().medicalChat.cores,
            dashboard: {
              messages: [createMockMessage()],
              isLoading: false,
              lastActivity: Date.now(),
              sessionId: 'test-session-123',
            },
          },
        },
      })

      const result1 = selectSystemMetrics(baseState)

      const updatedState = {
        ...baseState,
        medicalChat: {
          ...baseState.medicalChat,
          cores: {
            ...baseState.medicalChat.cores,
            dashboard: {
              ...baseState.medicalChat.cores.dashboard,
              messages: [...baseState.medicalChat.cores.dashboard.messages, createMockMessage()],
            },
          },
        },
      }

      const result2 = selectSystemMetrics(updatedState)

      expect(result1).not.toBe(result2) // Different reference due to state change
      expect(result2.messagesCount).toBe(result1.messagesCount + 1)
    })
  })
})
