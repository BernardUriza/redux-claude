// tests/components/MedicalComponents.integration.test.tsx
// Integration Tests para Componentes Médicos - FASE 7 - Creado por Bernard Orozco

import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import '@testing-library/jest-dom'

// Components
import { SOAPDisplay } from '../../src/components/SOAPDisplay'
import { RealTimeMetrics } from '../../src/components/real-time-metrics'
import { IterativeDiagnosticProgress } from '../../src/components/IterativeDiagnosticProgress'
import { FollowUpTracker } from '../../src/components/FollowUpTracker'
import { MedicalNotes } from '../../src/components/MedicalNotes'
import AlertSystem from '../../src/components/AlertSystem'
import SystemHealthDashboard from '../../src/components/SystemHealthDashboard'

// Store
import medicalChatReducer from '../../packages/cognitive-core/src/store/medicalChatSlice'
import soapAnalysisReducer from '../../packages/cognitive-core/src/store/slices/soapAnalysisSlice'
import type { RootState } from '../../packages/cognitive-core/src/store/store'
import type { MedicalMessage } from '../../packages/cognitive-core/src/store/medicalChatSlice'

// 🧪 MOCK STORE SETUP
const createTestStore = (initialState?: Partial<RootState>) => {
  return configureStore({
    reducer: {
      medicalChat: medicalChatReducer,
      soapAnalysis: soapAnalysisReducer,
    },
    preloadedState: {
      medicalChat: {
        cores: {
          dashboard: {
            messages: [],
            isLoading: false,
            lastActivity: Date.now(),
            sessionId: 'test-session',
          },
          assistant: {
            messages: [],
            isLoading: false,
            lastActivity: Date.now(),
            sessionId: 'test-session',
          },
          inference: {
            messages: [],
            isLoading: false,
            lastActivity: Date.now(),
            sessionId: 'test-session',
          },
        },
        sharedState: {
          currentSession: {
            id: 'test-session-integration',
            startedAt: Date.now() - 600000, // 10 minutes ago
          },
          isLoading: false,
          error: undefined,
        },
      },
      soapAnalysis: {
        currentAnalysis: null,
        analysisHistory: [],
        isExtracting: false,
        isUpdating: false,
        lastProcessed: 0,
        extractionQuality: 0,
        validationErrors: [],
        autoUpdate: true,
        confidenceThreshold: 0.7,
      },
      ...initialState,
    },
  })
}

// 🧪 MOCK MESSAGES GENERATOR
const createMedicalMessageSet = (): MedicalMessage[] => [
  {
    id: 'msg-user-1',
    type: 'user',
    content:
      'Patient is experiencing severe headaches and nausea for the past 3 days. Blood pressure measured at 180/110.',
    timestamp: Date.now() - 300000,
    metadata: { sectionType: 'diagnosis' },
  },
  {
    id: 'msg-assistant-1',
    type: 'assistant',
    content:
      'Based on the symptoms and elevated blood pressure reading, this appears to be a hypertensive crisis. Physical examination shows signs of increased intracranial pressure.',
    timestamp: Date.now() - 240000,
    confidence: 0.92,
    metadata: { sectionType: 'diagnosis' },
  },
  {
    id: 'msg-assistant-2',
    type: 'assistant',
    content:
      'Diagnosis: Hypertensive emergency with possible secondary complications. Immediate intervention required.',
    timestamp: Date.now() - 180000,
    confidence: 0.95,
    metadata: { sectionType: 'diagnosis' },
  },
  {
    id: 'msg-assistant-3',
    type: 'assistant',
    content:
      'Treatment plan: 1) Administer IV antihypertensive medication 2) Continuous cardiac monitoring 3) Schedule follow-up in 48 hours 4) Patient education on lifestyle modifications',
    timestamp: Date.now() - 120000,
    confidence: 0.88,
    metadata: { sectionType: 'treatment' },
  },
]

// 🧪 TEST WRAPPER COMPONENT
const TestWrapper: React.FC<{ store: any; children: React.ReactNode }> = ({ store, children }) => (
  <Provider store={store}>
    <div className="min-h-screen bg-slate-900 text-white p-4">{children}</div>
  </Provider>
)

describe('Medical Components Integration Tests', () => {
  // 🏥 SOAP DISPLAY INTEGRATION
  describe('SOAPDisplay Integration', () => {
    it('should render empty state when no medical data exists', async () => {
      const store = createTestStore()

      render(
        <TestWrapper store={store}>
          <SOAPDisplay />
        </TestWrapper>
      )

      expect(screen.getByText(/no hay análisis soap/i)).toBeInTheDocument()
    })

    it('should render SOAP sections when medical messages exist', async () => {
      const messages = createMedicalMessageSet()
      const store = createTestStore({
        medicalChat: {
          cores: {
            dashboard: {
              messages,
              isLoading: false,
              lastActivity: Date.now(),
              sessionId: 'test-session-integration',
            },
            assistant: {
              messages: [],
              isLoading: false,
              lastActivity: Date.now(),
              sessionId: 'test-session-integration',
            },
            inference: {
              messages: [],
              isLoading: false,
              lastActivity: Date.now(),
              sessionId: 'test-session-integration',
            },
          },
          sharedState: {
            currentSession: {
              id: 'test-session-integration',
              startedAt: Date.now() - 600000,
            },
            isLoading: false,
            error: undefined,
          },
        },
      })

      render(
        <TestWrapper store={store}>
          <SOAPDisplay />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/subjetivo/i)).toBeInTheDocument()
        expect(screen.getByText(/objetivo/i)).toBeInTheDocument()
        expect(screen.getByText(/evaluación/i)).toBeInTheDocument()
        expect(screen.getByText(/plan/i)).toBeInTheDocument()
      })

      // Check for content from messages
      expect(screen.getByText(/headaches and nausea/i)).toBeInTheDocument()
      expect(screen.getByText(/hypertensive/i)).toBeInTheDocument()
    })

    it('should display confidence levels correctly', async () => {
      const messages = createMedicalMessageSet()
      const store = createTestStore({
        medicalChat: {
          cores: {
            dashboard: {
              messages,
              isLoading: false,
              lastActivity: Date.now(),
              sessionId: 'test-session',
            },
            assistant: {
              messages: [],
              isLoading: false,
              lastActivity: Date.now(),
              sessionId: 'test-session',
            },
            inference: {
              messages: [],
              isLoading: false,
              lastActivity: Date.now(),
              sessionId: 'test-session',
            },
          },
          sharedState: {
            currentSession: { id: 'test-session', startedAt: Date.now() },
            isLoading: false,
            error: undefined,
          },
        },
      })

      render(
        <TestWrapper store={store}>
          <SOAPDisplay />
        </TestWrapper>
      )

      await waitFor(() => {
        // Should show average confidence around 91-92%
        const confidenceElements = screen.getAllByText(/9[0-9]%/)
        expect(confidenceElements.length).toBeGreaterThan(0)
      })
    })
  })

  // 📊 REAL TIME METRICS INTEGRATION
  describe('RealTimeMetrics Integration', () => {
    it('should show loading state initially', async () => {
      const store = createTestStore({
        medicalChat: {
          cores: {
            dashboard: {
              messages: [],
              isLoading: true,
              lastActivity: Date.now(),
              sessionId: 'test-session',
            },
            assistant: {
              messages: [],
              isLoading: false,
              lastActivity: Date.now(),
              sessionId: 'test-session',
            },
            inference: {
              messages: [],
              isLoading: false,
              lastActivity: Date.now(),
              sessionId: 'test-session',
            },
          },
          sharedState: {
            currentSession: { id: 'test-session', startedAt: Date.now() },
            isLoading: false,
            error: undefined,
          },
        },
      })

      render(
        <TestWrapper store={store}>
          <RealTimeMetrics />
        </TestWrapper>
      )

      expect(screen.getByText(/análisis en progreso/i)).toBeInTheDocument()
    })

    it('should display system metrics when data is available', async () => {
      const messages = createMedicalMessageSet()
      const store = createTestStore({
        medicalChat: {
          cores: {
            dashboard: {
              messages,
              isLoading: false,
              lastActivity: Date.now(),
              sessionId: 'test-session',
            },
            assistant: {
              messages: [],
              isLoading: false,
              lastActivity: Date.now(),
              sessionId: 'test-session',
            },
            inference: {
              messages: [],
              isLoading: false,
              lastActivity: Date.now(),
              sessionId: 'test-session',
            },
          },
          sharedState: {
            currentSession: { id: 'test-session', startedAt: Date.now() },
            isLoading: false,
            error: undefined,
          },
        },
      })

      render(
        <TestWrapper store={store}>
          <RealTimeMetrics />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/confianza diagnóstica/i)).toBeInTheDocument()
        expect(screen.getByText(/progreso iterativo/i)).toBeInTheDocument()
        expect(screen.getByText(/consenso médico/i)).toBeInTheDocument()
      })
    })

    it('should show error state when error exists', async () => {
      const store = createTestStore({
        medicalChat: {
          cores: {
            dashboard: {
              messages: [],
              isLoading: false,
              lastActivity: Date.now(),
              sessionId: 'test-session',
            },
            assistant: {
              messages: [],
              isLoading: false,
              lastActivity: Date.now(),
              sessionId: 'test-session',
            },
            inference: {
              messages: [],
              isLoading: false,
              lastActivity: Date.now(),
              sessionId: 'test-session',
            },
          },
          sharedState: {
            currentSession: { id: 'test-session', startedAt: Date.now() },
            isLoading: false,
            error: 'Sistema médico no disponible',
          },
        },
      })

      render(
        <TestWrapper store={store}>
          <RealTimeMetrics />
        </TestWrapper>
      )

      expect(screen.getByText(/error en métricas/i)).toBeInTheDocument()
      expect(screen.getByText(/sistema médico no disponible/i)).toBeInTheDocument()
    })
  })

  // 🔄 ITERATIVE DIAGNOSTIC PROGRESS INTEGRATION
  describe('IterativeDiagnosticProgress Integration', () => {
    it('should not render when no diagnostic progress exists', async () => {
      const store = createTestStore()

      const { container } = render(
        <TestWrapper store={store}>
          <IterativeDiagnosticProgress />
        </TestWrapper>
      )

      // Component should return null and not render anything
      expect(container.firstChild).toBeNull()
    })

    it('should display diagnostic cycles when progress exists', async () => {
      const messages = createMedicalMessageSet()
      const store = createTestStore({
        medicalChat: {
          cores: {
            dashboard: {
              messages,
              isLoading: false,
              lastActivity: Date.now(),
              sessionId: 'test-session',
            },
            assistant: {
              messages: [],
              isLoading: false,
              lastActivity: Date.now(),
              sessionId: 'test-session',
            },
            inference: {
              messages: [],
              isLoading: false,
              lastActivity: Date.now(),
              sessionId: 'test-session',
            },
          },
          sharedState: {
            currentSession: { id: 'test-session', startedAt: Date.now() },
            isLoading: false,
            error: undefined,
          },
        },
      })

      render(
        <TestWrapper store={store}>
          <IterativeDiagnosticProgress />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/diagnóstico iterativo/i)).toBeInTheDocument()
        expect(screen.getByText(/confianza global/i)).toBeInTheDocument()
      })
    })
  })

  // 📅 FOLLOW UP TRACKER INTEGRATION
  describe('FollowUpTracker Integration', () => {
    it('should show empty state when no reminders exist', async () => {
      const store = createTestStore()

      render(
        <TestWrapper store={store}>
          <FollowUpTracker />
        </TestWrapper>
      )

      expect(screen.getByText(/seguimiento y recordatorios/i)).toBeInTheDocument()
      expect(screen.getByText(/no hay recordatorios pendientes/i)).toBeInTheDocument()
    })

    it('should display reminders when treatment messages exist', async () => {
      const messages = createMedicalMessageSet()
      const store = createTestStore({
        medicalChat: {
          cores: {
            dashboard: {
              messages,
              isLoading: false,
              lastActivity: Date.now(),
              sessionId: 'test-session',
            },
            assistant: {
              messages: [],
              isLoading: false,
              lastActivity: Date.now(),
              sessionId: 'test-session',
            },
            inference: {
              messages: [],
              isLoading: false,
              lastActivity: Date.now(),
              sessionId: 'test-session',
            },
          },
          sharedState: {
            currentSession: { id: 'test-session', startedAt: Date.now() },
            isLoading: false,
            error: undefined,
          },
        },
      })

      render(
        <TestWrapper store={store}>
          <FollowUpTracker />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/seguimiento y recordatorios/i)).toBeInTheDocument()
        // Should have extracted reminders from treatment messages
        const tabButtons = screen.getAllByRole('button')
        const pendingTab = tabButtons.find(btn => btn.textContent?.includes('Pendientes'))
        expect(pendingTab).toBeInTheDocument()
      })
    })

    it('should allow adding new reminders', async () => {
      const store = createTestStore()

      render(
        <TestWrapper store={store}>
          <FollowUpTracker />
        </TestWrapper>
      )

      // Click add button
      const addButton = screen.getByText(/agregar/i)
      fireEvent.click(addButton)

      await waitFor(() => {
        expect(screen.getByText(/nuevo recordatorio/i)).toBeInTheDocument()
      })
    })
  })

  // 📝 MEDICAL NOTES INTEGRATION
  describe('MedicalNotes Integration', () => {
    it('should show empty state when no notes exist', async () => {
      const store = createTestStore()

      render(
        <TestWrapper store={store}>
          <MedicalNotes />
        </TestWrapper>
      )

      expect(screen.getByText(/notas médicas/i)).toBeInTheDocument()
      expect(screen.getByText(/no hay notas médicas/i)).toBeInTheDocument()
    })

    it('should convert medical messages to physician notes', async () => {
      const messages = createMedicalMessageSet()
      const store = createTestStore({
        medicalChat: {
          cores: {
            dashboard: {
              messages,
              isLoading: false,
              lastActivity: Date.now(),
              sessionId: 'test-session',
            },
            assistant: {
              messages: [],
              isLoading: false,
              lastActivity: Date.now(),
              sessionId: 'test-session',
            },
            inference: {
              messages: [],
              isLoading: false,
              lastActivity: Date.now(),
              sessionId: 'test-session',
            },
          },
          sharedState: {
            currentSession: { id: 'test-session', startedAt: Date.now() },
            isLoading: false,
            error: undefined,
          },
        },
      })

      render(
        <TestWrapper store={store}>
          <MedicalNotes />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/notas médicas/i)).toBeInTheDocument()
        // Should show notes generated from assistant messages
        const noteCards = screen.getAllByText(/sistema multinúcleo ia/i)
        expect(noteCards.length).toBeGreaterThan(0)
      })
    })

    it('should filter notes by category', async () => {
      const messages = createMedicalMessageSet()
      const store = createTestStore({
        medicalChat: {
          cores: {
            dashboard: {
              messages,
              isLoading: false,
              lastActivity: Date.now(),
              sessionId: 'test-session',
            },
            assistant: {
              messages: [],
              isLoading: false,
              lastActivity: Date.now(),
              sessionId: 'test-session',
            },
            inference: {
              messages: [],
              isLoading: false,
              lastActivity: Date.now(),
              sessionId: 'test-session',
            },
          },
          sharedState: {
            currentSession: { id: 'test-session', startedAt: Date.now() },
            isLoading: false,
            error: undefined,
          },
        },
      })

      render(
        <TestWrapper store={store}>
          <MedicalNotes />
        </TestWrapper>
      )

      await waitFor(() => {
        // Find and click clinical notes filter
        const clinicalTab = screen.getByText(/clínicas/i)
        fireEvent.click(clinicalTab)

        // Should filter to show only clinical notes
        expect(screen.getAllByText(/clinical|clínicas/i).length).toBeGreaterThan(0)
      })
    })
  })

  // 🚨 ALERT SYSTEM INTEGRATION
  describe('AlertSystem Integration', () => {
    it('should display alerts when they are triggered', async () => {
      const store = createTestStore()

      render(
        <TestWrapper store={store}>
          <AlertSystem maxVisible={3} autoHide={false} />
        </TestWrapper>
      )

      // Initially no alerts should be visible
      expect(screen.queryByText(/performance/i)).not.toBeInTheDocument()

      // Simulate alert creation through monitor
      const { medicalSystemMonitor } = require('../../src/monitoring/MedicalSystemMonitor')

      // Create a test alert
      medicalSystemMonitor.emit('alert', {
        id: 'test-alert-1',
        type: 'warning',
        category: 'performance',
        message: 'Sistema ejecutándose con alta latencia',
        timestamp: Date.now(),
        severity: 'medium',
        resolved: false,
      })

      await waitFor(() => {
        expect(screen.getByText(/performance/i)).toBeInTheDocument()
        expect(screen.getByText(/alta latencia/i)).toBeInTheDocument()
      })
    })
  })

  // 📊 SYSTEM HEALTH DASHBOARD INTEGRATION
  describe('SystemHealthDashboard Integration', () => {
    it('should display loading state initially', async () => {
      const store = createTestStore()

      render(
        <TestWrapper store={store}>
          <SystemHealthDashboard />
        </TestWrapper>
      )

      expect(screen.getByText(/cargando métricas/i)).toBeInTheDocument()
    })

    it('should show system health metrics when available', async () => {
      const store = createTestStore()

      // Start the monitor to generate metrics
      const { medicalSystemMonitor } = require('../../src/monitoring/MedicalSystemMonitor')
      medicalSystemMonitor.start()

      render(
        <TestWrapper store={store}>
          <SystemHealthDashboard />
        </TestWrapper>
      )

      await waitFor(
        () => {
          expect(screen.getByText(/sistema médico multinúcleo/i)).toBeInTheDocument()
          expect(screen.getByText(/uso cpu/i)).toBeInTheDocument()
          expect(screen.getByText(/memoria/i)).toBeInTheDocument()
        },
        { timeout: 10000 }
      )

      // Cleanup
      medicalSystemMonitor.stop()
    })

    it('should allow expanding and contracting the dashboard', async () => {
      const store = createTestStore()

      render(
        <TestWrapper store={store}>
          <SystemHealthDashboard />
        </TestWrapper>
      )

      await waitFor(() => {
        const expandButton = screen.getByText(/expandir/i)
        fireEvent.click(expandButton)

        expect(screen.getByText(/contraer/i)).toBeInTheDocument()
      })
    })
  })

  // 🔗 COMPONENT INTEGRATION FLOW
  describe('Full Medical Component Integration Flow', () => {
    it('should handle complete medical workflow', async () => {
      const messages = createMedicalMessageSet()
      const store = createTestStore({
        medicalChat: {
          cores: {
            dashboard: {
              messages,
              isLoading: false,
              lastActivity: Date.now(),
              sessionId: 'test-session',
            },
            assistant: {
              messages: [],
              isLoading: false,
              lastActivity: Date.now(),
              sessionId: 'test-session',
            },
            inference: {
              messages: [],
              isLoading: false,
              lastActivity: Date.now(),
              sessionId: 'test-session',
            },
          },
          sharedState: {
            currentSession: { id: 'test-session-complete', startedAt: Date.now() },
            isLoading: false,
            error: undefined,
          },
        },
      })

      render(
        <TestWrapper store={store}>
          <div className="space-y-6">
            <SOAPDisplay />
            <RealTimeMetrics />
            <IterativeDiagnosticProgress />
            <FollowUpTracker />
            <MedicalNotes />
          </div>
        </TestWrapper>
      )

      // Verify all components render with medical data
      await waitFor(
        () => {
          // SOAP Display should show sections
          expect(screen.getByText(/subjetivo/i)).toBeInTheDocument()

          // Real Time Metrics should show confidence
          expect(screen.getByText(/confianza diagnóstica/i)).toBeInTheDocument()

          // Iterative Progress should show progress
          expect(screen.getByText(/diagnóstico iterativo/i)).toBeInTheDocument()

          // Follow Up should show reminders interface
          expect(screen.getByText(/seguimiento y recordatorios/i)).toBeInTheDocument()

          // Medical Notes should show generated notes
          expect(screen.getByText(/notas médicas/i)).toBeInTheDocument()
        },
        { timeout: 10000 }
      )

      // Test that components are using real data (not mocks)
      expect(screen.getByText(/headaches/i)).toBeInTheDocument()
      expect(screen.getByText(/hypertensive/i)).toBeInTheDocument()
    })
  })
})
