# Custom Hooks Documentation - Redux Brain Medical AI

> **Version**: 1.0.1 | **Last Updated**: 2025-01-16 | **Auto-generated**

## Table of Contents

1. [Overview](#overview)
2. [Hook Catalog](#hook-catalog)
3. [Barrel Exports](#barrel-exports)
4. [Usage Examples](#usage-examples)
5. [Testing Hooks](#testing-hooks)
6. [Best Practices](#best-practices)

---

## Overview

The Redux Brain Medical AI application uses 11 custom hooks to manage state, side effects, and business logic. All hooks follow React 19 standards and are exported through a central barrel file for clean imports.

### Hook Statistics

- **Total Custom Hooks**: 11
- **State Management Hooks**: 4
- **Effect Hooks**: 3
- **Data Orchestration Hooks**: 4
- **File Naming Convention**: kebab-case (migrated)

---

## Hook Catalog

### 1. useSOAPData

**Location**: `src/hooks/use-soap-data.ts`

Manages SOAP (Subjective, Objective, Analysis, Plan) medical documentation data.

```typescript
interface SOAPDataState {
  soapAnalysis: SOAPAnalysis | null
  isLoading: boolean
  error: string | null
}

interface SOAPDataActions {
  handleSectionEdit: (section: SOAPEditSection, data: any) => void
  resetSOAP: () => void
  exportSOAP: () => Promise<string>
}

export function useSOAPData(): SOAPDataState & SOAPDataActions

// Usage
const {
  soapAnalysis,
  isLoading,
  handleSectionEdit,
  resetSOAP,
  exportSOAP
} = useSOAPData()
```

**Features**:
- Redux integration for SOAP state
- Section-based editing
- Export to markdown/JSON
- Validation hooks

---

### 2. useMobileInteractions

**Location**: `src/hooks/use-mobile-interactions.ts`

Handles mobile-specific interactions and gestures.

```typescript
interface MobileInteractions {
  isMobile: boolean
  touchSupported: boolean
  orientation: 'portrait' | 'landscape'
  viewport: {
    width: number
    height: number
  }
  gestures: {
    onSwipeLeft?: () => void
    onSwipeRight?: () => void
    onPinch?: (scale: number) => void
  }
}

export function useMobileInteractions(): MobileInteractions

// Usage
const { isMobile, orientation, gestures } = useMobileInteractions()

if (isMobile) {
  gestures.onSwipeLeft = () => navigateNext()
}
```

**Features**:
- Device detection
- Orientation tracking
- Touch gesture support
- Viewport monitoring

---

### 3. useUrgencyData

**Location**: `src/hooks/use-urgency-data.ts`

Manages medical urgency classification and alerts.

```typescript
interface UrgencyData {
  currentLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | null
  history: UrgencyRecord[]
  protocols: string[]
  alerts: UrgencyAlert[]
}

export function useUrgencyData(patientId?: string): {
  urgencyData: UrgencyData
  updateUrgency: (level: string, reason: string) => void
  clearAlerts: () => void
  activateProtocol: (protocol: string) => void
}

// Usage
const { urgencyData, updateUrgency, activateProtocol } = useUrgencyData()

if (urgencyData.currentLevel === 'CRITICAL') {
  activateProtocol('EMERGENCY_RESPONSE')
}
```

**Features**:
- Real-time urgency tracking
- Protocol activation
- Alert management
- Historical tracking

---

### 4. useDashboardEffects

**Location**: `src/hooks/use-dashboard-effects.ts`

Orchestrates dashboard-wide side effects and subscriptions.

```typescript
export function useDashboardEffects(config?: DashboardConfig): void

// Usage
useDashboardEffects({
  autoRefresh: true,
  refreshInterval: 5000,
  subscriptions: ['metrics', 'agents', 'alerts']
})
```

**Side Effects Managed**:
- WebSocket connections
- Polling intervals
- Event subscriptions
- Cleanup on unmount

---

### 5. useDashboardHandlers

**Location**: `src/hooks/use-dashboard-handlers.ts`

Provides event handlers for dashboard interactions.

```typescript
interface DashboardHandlers {
  handleTabChange: (tab: string) => void
  handleRefresh: () => Promise<void>
  handleExport: (format: 'pdf' | 'csv' | 'json') => void
  handleFilterChange: (filters: FilterOptions) => void
  handleAgentToggle: (agentId: string) => void
}

export function useDashboardHandlers(): DashboardHandlers

// Usage
const {
  handleTabChange,
  handleRefresh,
  handleExport
} = useDashboardHandlers()
```

---

### 6. useCognitiveMetrics

**Location**: `src/hooks/use-cognitive-metrics.ts`

Tracks and calculates cognitive system metrics.

```typescript
interface CognitiveMetrics {
  agentPerformance: Map<string, AgentMetrics>
  systemLoad: number
  responseTime: number
  successRate: number
  tokenUsage: {
    input: number
    output: number
    total: number
  }
}

export function useCognitiveMetrics(): {
  metrics: CognitiveMetrics
  recordMetric: (metric: Metric) => void
  resetMetrics: () => void
  getAgentMetrics: (agentId: string) => AgentMetrics
}

// Usage
const { metrics, recordMetric } = useCognitiveMetrics()

recordMetric({
  type: 'response_time',
  value: 1234,
  agentId: 'diagnostic'
})
```

**Metrics Tracked**:
- Response times per agent
- Success/failure rates
- Token consumption
- System load average

---

### 7. useMessageContent

**Location**: `src/hooks/use-message-content.ts`

Manages message content formatting and processing.

```typescript
interface MessageContent {
  raw: string
  formatted: string
  metadata: MessageMetadata
  sections: MessageSection[]
}

export function useMessageContent(message: string): {
  content: MessageContent
  updateContent: (newContent: string) => void
  addSection: (section: MessageSection) => void
  format: (type: 'markdown' | 'html' | 'plain') => string
}

// Usage
const { content, format } = useMessageContent(rawMessage)
const htmlContent = format('html')
```

---

### 8. useAlertManager

**Location**: `src/hooks/use-alert-manager.ts`

Centralized alert and notification management.

```typescript
interface Alert {
  id: string
  type: 'error' | 'warning' | 'info' | 'success'
  message: string
  timestamp: Date
  actions?: AlertAction[]
}

export function useAlertManager(): {
  alerts: Alert[]
  addAlert: (alert: Partial<Alert>) => void
  removeAlert: (id: string) => void
  clearAlerts: () => void
  getAlertsByType: (type: Alert['type']) => Alert[]
}

// Usage
const { alerts, addAlert, removeAlert } = useAlertManager()

addAlert({
  type: 'warning',
  message: 'High urgency detected'
})
```

**Features**:
- Auto-dismiss timers
- Priority queuing
- Action buttons
- Persistence options

---

### 9. useDashboardState

**Location**: `src/hooks/use-dashboard-state.ts`

Manages dashboard UI state and preferences.

```typescript
interface DashboardState {
  activeTab: string
  filters: FilterOptions
  viewMode: 'grid' | 'list' | 'compact'
  sidebarCollapsed: boolean
  preferences: UserPreferences
}

export function useDashboardState(): {
  state: DashboardState
  updateState: (updates: Partial<DashboardState>) => void
  resetState: () => void
  savePreferences: () => void
}

// Usage
const { state, updateState } = useDashboardState()

updateState({
  activeTab: 'metrics',
  viewMode: 'grid'
})
```

---

### 10. useMedicalAssistant

**Location**: `src/hooks/use-medical-assistant.ts`

Main hook for medical assistant functionality.

```typescript
interface MedicalAssistantState {
  session: MedicalSession
  messages: Message[]
  isProcessing: boolean
  currentSOAP: SOAPNote | null
  urgencyLevel: string | null
}

export function useMedicalAssistant(sessionId?: string): {
  state: MedicalAssistantState
  sendMessage: (message: string) => Promise<void>
  clearSession: () => void
  exportSession: () => SessionExport
  updateSOAP: (soap: Partial<SOAPNote>) => void
}

// Usage
const {
  state,
  sendMessage,
  clearSession
} = useMedicalAssistant('session-123')

await sendMessage('Patient has chest pain')
```

**Integrations**:
- Redux store
- Claude API
- SOAP processor
- Urgency detector

---

### 11. useMedicalDataOrchestrator

**Location**: `src/hooks/use-medical-data-orchestrator.ts`

Orchestrates complex medical data workflows.

```typescript
interface OrchestratorConfig {
  agents: string[]
  parallel?: boolean
  timeout?: number
}

export function useMedicalDataOrchestrator(config: OrchestratorConfig): {
  orchestrate: (input: string) => Promise<OrchestratorResult>
  status: 'idle' | 'processing' | 'complete' | 'error'
  progress: number
  results: Map<string, AgentResult>
  cancel: () => void
}

// Usage
const {
  orchestrate,
  status,
  progress,
  results
} = useMedicalDataOrchestrator({
  agents: ['diagnostic', 'triage', 'treatment'],
  parallel: true
})

const result = await orchestrate('Complex medical case')
```

**Features**:
- Multi-agent orchestration
- Parallel/sequential processing
- Progress tracking
- Result aggregation

---

## Barrel Exports

### Main Export File

**Location**: `src/hooks/index.ts`

```typescript
// Barrel exports for all hooks - Clean Architecture pattern
export { useSOAPData } from './use-soap-data'
export type {
  SOAPDataState,
  SOAPDataActions,
  SOAPEditSection,
  CompleteSOAP
} from './use-soap-data'

export { useMobileInteractions } from './use-mobile-interactions'
export { useUrgencyData } from './use-urgency-data'
export { useDashboardEffects } from './use-dashboard-effects'
export { useDashboardHandlers } from './use-dashboard-handlers'
export { useCognitiveMetrics } from './use-cognitive-metrics'
export { useMessageContent } from './use-message-content'
export { useAlertManager } from './use-alert-manager'
export { useDashboardState } from './use-dashboard-state'
export { useMedicalAssistant } from './use-medical-assistant'
export { useMedicalDataOrchestrator } from './use-medical-data-orchestrator'
```

### Import Pattern

```typescript
// Clean import from barrel export
import {
  useSOAPData,
  useMedicalAssistant,
  useCognitiveMetrics,
  useAlertManager
} from '@/hooks'

// Instead of multiple imports
import { useSOAPData } from '@/hooks/use-soap-data'
import { useMedicalAssistant } from '@/hooks/use-medical-assistant'
// etc...
```

---

## Usage Examples

### Complete Medical Consultation Flow

```typescript
import {
  useMedicalAssistant,
  useSOAPData,
  useUrgencyData,
  useCognitiveMetrics
} from '@/hooks'

function MedicalConsultation() {
  // Initialize hooks
  const { state, sendMessage } = useMedicalAssistant()
  const { soapAnalysis, handleSectionEdit } = useSOAPData()
  const { urgencyData, updateUrgency } = useUrgencyData()
  const { metrics, recordMetric } = useCognitiveMetrics()

  // Handle message submission
  const handleSubmit = async (message: string) => {
    const startTime = Date.now()

    await sendMessage(message)

    // Record metrics
    recordMetric({
      type: 'response_time',
      value: Date.now() - startTime
    })

    // Check urgency
    if (state.urgencyLevel === 'CRITICAL') {
      updateUrgency('CRITICAL', 'Auto-detected from symptoms')
    }
  }

  // Render UI
  return (
    <div>
      {/* Medical chat interface */}
      {/* SOAP display */}
      {/* Urgency indicators */}
      {/* Metrics dashboard */}
    </div>
  )
}
```

### Dashboard with Multiple Hooks

```typescript
function MedicalDashboard() {
  const { state, updateState } = useDashboardState()
  const { handleTabChange, handleRefresh } = useDashboardHandlers()
  const { metrics } = useCognitiveMetrics()
  const { alerts, clearAlerts } = useAlertManager()

  // Setup dashboard effects
  useDashboardEffects({
    autoRefresh: true,
    refreshInterval: 5000
  })

  return (
    <Dashboard
      activeTab={state.activeTab}
      onTabChange={handleTabChange}
      metrics={metrics}
      alerts={alerts}
      onRefresh={handleRefresh}
      onClearAlerts={clearAlerts}
    />
  )
}
```

---

## Testing Hooks

### Unit Testing Pattern

```typescript
import { renderHook, act } from '@testing-library/react'
import { useSOAPData } from '@/hooks'

describe('useSOAPData', () => {
  it('should initialize with null SOAP analysis', () => {
    const { result } = renderHook(() => useSOAPData())
    expect(result.current.soapAnalysis).toBeNull()
  })

  it('should handle section edit', () => {
    const { result } = renderHook(() => useSOAPData())

    act(() => {
      result.current.handleSectionEdit('subjetivo', {
        content: 'Patient symptoms'
      })
    })

    expect(result.current.soapAnalysis?.subjetivo).toBeDefined()
  })
})
```

### Integration Testing

```typescript
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { store } from '@/store'
import { useMedicalAssistant } from '@/hooks'

const wrapper = ({ children }) => (
  <Provider store={store}>{children}</Provider>
)

test('medical assistant integrates with Redux', async () => {
  const { result } = renderHook(
    () => useMedicalAssistant(),
    { wrapper }
  )

  await act(async () => {
    await result.current.sendMessage('Test message')
  })

  expect(result.current.state.messages).toHaveLength(1)
})
```

---

## Best Practices

### 1. Hook Naming Convention

```typescript
// ✅ Good: Descriptive use-prefix
export function useSOAPData() { }
export function useMedicalAssistant() { }

// ❌ Bad: No prefix or unclear naming
export function soapData() { }
export function getData() { }
```

### 2. Return Value Pattern

```typescript
// ✅ Good: Return object with clear categories
export function useCustomHook() {
  return {
    // State
    data,
    loading,
    error,

    // Actions
    fetchData,
    updateData,
    resetData
  }
}

// ❌ Bad: Array return (unclear ordering)
export function useCustomHook() {
  return [data, loading, fetchData, updateData]
}
```

### 3. Dependency Management

```typescript
// ✅ Good: Explicit dependencies
export function useCustomHook(userId: string) {
  useEffect(() => {
    fetchUserData(userId)
  }, [userId]) // Clear dependency
}

// ❌ Bad: Missing dependencies
export function useCustomHook(userId: string) {
  useEffect(() => {
    fetchUserData(userId)
  }, []) // Missing userId dependency
}
```

### 4. Error Handling

```typescript
// ✅ Good: Comprehensive error handling
export function useDataFetch() {
  const [error, setError] = useState<Error | null>(null)

  const fetchData = async () => {
    try {
      setError(null)
      const data = await api.fetch()
      return data
    } catch (err) {
      setError(err as Error)
      console.error('Fetch failed:', err)
    }
  }

  return { error, fetchData }
}
```

### 5. Performance Optimization

```typescript
// ✅ Good: Memoized values and callbacks
export function useExpensiveCalculation(data: Data[]) {
  const processedData = useMemo(
    () => expensiveProcess(data),
    [data]
  )

  const handleAction = useCallback(
    (item: Data) => {
      // Action logic
    },
    [dependency]
  )

  return { processedData, handleAction }
}
```

---

## Migration Status

### File Naming Migration (Completed)

All hook files have been migrated to kebab-case:

| Old Name | New Name | Status |
|----------|----------|--------|
| `useSOAPData.ts` | `use-soap-data.ts` | ✅ |
| `useMobileInteractions.ts` | `use-mobile-interactions.ts` | ✅ |
| `useUrgencyData.ts` | `use-urgency-data.ts` | ✅ |
| `useDashboardEffects.ts` | `use-dashboard-effects.ts` | ✅ |
| `useDashboardHandlers.ts` | `use-dashboard-handlers.ts` | ✅ |
| `useCognitiveMetrics.ts` | `use-cognitive-metrics.ts` | ✅ |
| `useMessageContent.ts` | `use-message-content.ts` | ✅ |
| `useAlertManager.ts` | `use-alert-manager.ts` | ✅ |
| `useDashboardState.ts` | `use-dashboard-state.ts` | ✅ |
| `useMedicalAssistant.ts` | `use-medical-assistant.ts` | ✅ |
| `useMedicalDataOrchestrator.ts` | `use-medical-data-orchestrator.ts` | ✅ |

---

**Generated**: 2025-01-16
**Total Hooks**: 11
**Barrel Export**: Complete
**Maintained by**: Bernard Orozco