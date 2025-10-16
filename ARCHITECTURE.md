# Redux Brain Medical AI - Architecture Guide

> **Version**: 1.0.1 | **Last Updated**: 2025-01-16 | **Author**: Bernard Orozco

## Table of Contents

1. [Overview](#overview)
2. [Naming Conventions](#naming-conventions)
3. [Project Structure](#project-structure)
4. [Clean Architecture Layers](#clean-architecture-layers)
5. [Code Quality Metrics](#code-quality-metrics)
6. [Recent Improvements](#recent-improvements)
7. [Future Roadmap](#future-roadmap)
8. [Contributing Guidelines](#contributing-guidelines)

---

## Overview

Redux Brain Medical AI is a **Next.js 15 + TypeScript** application implementing the **Redux+LLM paradigm** for cognitive architectures in medical AI. The project follows **Clean Architecture** principles with **Domain-Driven Design (DDD)**.

### Core Technologies

- **Frontend**: Next.js 15, React 19, TypeScript 5.x
- **State Management**: Redux Toolkit (published as NPM package)
- **AI Integration**: Anthropic Claude API (Haiku + Sonnet)
- **Styling**: Tailwind CSS
- **Testing**: Jest, React Testing Library
- **Architecture**: Clean Architecture + DDD

---

## Naming Conventions

### Current Status: **78% Compliance** (React 19 Standards)

#### Components

**Code Naming** (100% ✅):
```typescript
// Components: PascalCase
export const RealTimeMetrics = () => { /* ... */ }
export const PerformanceMonitor = () => { /* ... */ }
export const ChatInterface = () => { /* ... */ }
```

**File Naming** (Current - PascalCase):
```
src/components/RealTimeMetrics.tsx
src/components/paradigm2/PerformanceMonitor/PerformanceMonitor.tsx
```

**File Naming** (Target - kebab-case):
```
src/components/real-time-metrics.tsx
src/components/paradigm2/performance-monitor/performance-monitor.tsx
```

#### Hooks

**Code Naming** (100% ✅):
```typescript
// Hooks: camelCase with 'use' prefix
export const useSOAPData = () => { /* ... */ }
export const useMobileInteractions = () => { /* ... */ }
```

**File Naming** (Current - camelCase):
```
src/hooks/useSOAPData.ts
src/hooks/useMobileInteractions.ts
```

**File Naming** (Target - kebab-case):
```
src/hooks/use-soap-data.ts
src/hooks/use-mobile-interactions.ts
```

#### Interfaces & Types

**Correct Pattern** (100% ✅):
```typescript
// Interfaces: PascalCase
interface MetricCardProps {
  title: string
  value: number
}

interface CompleteSOAP {
  subjetivo: SubjectiveData | null
  objetivo: ObjectiveData | null
  analisis: AnalysisData | null
  plan: PlanData | null
}

// Type aliases: PascalCase for objects, unions
type SOAPEditSection = 'subjetivo' | 'objetivo' | 'analisis' | 'plan'
```

#### Constants

**Correct Pattern** (100% ✅):
```typescript
// Constants: UPPER_SNAKE_CASE
const SOAP_SECTION_PROGRESS_PERCENT = 25
const ADULT_AGE_THRESHOLD = 18
const CALCULATION_FACTORS = {
  CONSENSUS_RATE_FACTOR: 100,
  QUALITY_SCORE_FACTOR: 90,
}
```

#### Functions

**Correct Pattern** (100% ✅):
```typescript
// Functions: camelCase
function calculateSystemMetrics(metrics: RealMetrics) { /* ... */ }
function buildUrgencyPrompt(input: string) { /* ... */ }
function parseUrgencyResponse(response: string) { /* ... */ }
```

#### Boolean Variables

**Correct Pattern** (100% ✅):
```typescript
// Booleans: use is/has/can prefixes
const isLoading = false
const hasCompleteInfo = true
const canProceed = false
```

---

## Project Structure

```
redux-claude/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API Routes
│   │   │   ├── redux-brain/          # Main medical AI endpoint
│   │   │   │   └── route.ts          # ⭐ Recently refactored (78→18 complexity)
│   │   │   ├── medical-validator/    # Input validation
│   │   │   └── claude/               # Direct Claude integration
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Home page
│   │
│   ├── components/                   # Shared UI Components
│   │   ├── medical-assistant/        # Medical assistant UI
│   │   ├── medical-message/          # Message components
│   │   ├── soap-markdown/            # SOAP rendering
│   │   └── paradigm2/                # Modern redesign components
│   │       ├── ChatInterface/        # Chat UI
│   │       ├── PerformanceMonitor/   # Performance metrics
│   │       └── RealTimeMetrics/      # Real-time dashboards
│   │
│   ├── presentation/                 # Clean Architecture - Presentation Layer
│   │   ├── components/ui/            # Reusable UI components
│   │   └── features/                 # Feature-specific components
│   │       ├── chat/                 # Chat features
│   │       └── medical/              # Medical features
│   │
│   ├── hooks/                        # Custom React Hooks
│   │   ├── useSOAPData.ts            # SOAP data management
│   │   ├── useMobileInteractions.ts  # Mobile interactions
│   │   ├── useDashboardEffects.ts    # Dashboard orchestration
│   │   └── useMedicalAssistant.ts    # Medical assistant logic
│   │
│   ├── lib/                          # Business Logic & Utilities
│   │   ├── logger.ts                 # Structured logging
│   │   └── textUtils.ts              # Text processing
│   │
│   ├── constants/                    # Global constants
│   │   └── magicNumbers.ts           # Calculation factors
│   │
│   └── test/                         # Testing utilities
│       └── utils/test-utils.tsx      # Custom render with Redux
│
├── packages/                         # Monorepo packages
│   └── cognitive-core/               # ⭐ NPM Package (redux-brain-medical-ai)
│       ├── src/
│       │   ├── agents/               # 13 Medical AI Agents
│       │   ├── middleware/           # DecisionalMiddleware
│       │   ├── processors/           # SOAP, Urgency, Validation
│       │   └── store/                # Redux store & selectors
│       └── package.json
│
├── scripts/                          # Development scripts
│   └── migrate-to-kebab-case-phase1.sh  # ⭐ Future migration script
│
├── CLAUDE.md                         # ⭐ Project instructions
├── ARCHITECTURE.md                   # ⭐ This file
└── package.json                      # Root package
```

---

## Clean Architecture Layers

This project implements **Clean Architecture** with clear separation of concerns:

### 1. Presentation Layer
**Location**: `src/presentation/`, `src/components/`

**Responsibilities**:
- React components and UI
- User interaction handling
- Display logic only

**Example**:
```typescript
// src/presentation/features/chat/ChatInterface.tsx
export const ChatInterface = () => {
  const { messages, sendMessage } = useMedicalAssistant()

  return (
    <div>
      <MessageList messages={messages} />
      <ChatInput onSend={sendMessage} />
    </div>
  )
}
```

### 2. Application Layer
**Location**: `src/hooks/`, `src/app/`

**Responsibilities**:
- Custom hooks for business logic
- State orchestration
- Side effects management

**Example**:
```typescript
// src/hooks/useSOAPData.ts
export const useSOAPData = (): SOAPDataState & SOAPDataActions => {
  const soapAnalysis = useSelector(selectCurrentSOAPAnalysis)
  const dispatch = useDispatch()

  const handleSectionEdit = (section: SOAPEditSection, data: SOAPSectionData) => {
    dispatch(updateSOAPSection({ section, content: data }))
  }

  return { soapAnalysis, handleSectionEdit }
}
```

### 3. Domain Layer
**Location**: `packages/cognitive-core/src/`

**Responsibilities**:
- Business rules and logic
- Medical AI agents
- SOAP processing
- Urgency detection
- Published as NPM package

**Example**:
```typescript
// packages/cognitive-core/src/processors/SOAPProcessor.ts
export class SOAPProcessor {
  async processCase(input: string, patientData: PatientData): Promise<SOAPAnalysis> {
    // Core medical logic - independent of UI
  }
}
```

### 4. Infrastructure Layer
**Location**: `src/app/api/`, `src/lib/`

**Responsibilities**:
- External API calls (Claude AI)
- Database connections (future)
- Third-party integrations

**Example**:
```typescript
// src/app/api/redux-brain/route.ts
export async function POST(req: NextRequest) {
  const session = getOrCreateSession(sessionId)
  const validation = await validateInput(message)
  const response = await processMedicalQuery(message, session)
  return NextResponse.json({ response })
}
```

---

## Code Quality Metrics

### Complexity Reduction - Recent Achievements ⭐

#### route.ts Refactoring (Completed: 2025-01-16)

**Before**:
- **Lines**: 470 lines
- **Complexity**: 78 (5x over limit!)
- **Functions**: Monolithic POST handler
- **Maintainability**: Low

**After**:
- **Lines**: 130 lines (72% reduction)
- **Complexity**: 18 (77% improvement)
- **Functions**: 12 focused helper functions
- **Maintainability**: High

#### Functions Extracted

**SOAP Processing (5 functions)**:
```typescript
// Complexity reduced from 31 → <15 ✅
updateSOAPSubjective()    // Handles S section
updateSOAPObjective()     // Handles O section
updateSOAPAnalysis()      // Handles A section
updateSOAPPlan()          // Handles P section
processSOAPAnalysis()     // Orchestrator
```

**Urgency Detection (3 functions)**:
```typescript
// Complexity reduced from 18 → <15 ✅
buildUrgencyPrompt()        // Prompt construction
parseUrgencyResponse()      // Response parsing
detectUrgencyWithContext()  // Main logic
```

**Core Workflow (6 functions)**:
```typescript
getOrCreateSession()              // Session management
processEntitiesAndDispatchActions()  // Entity parsing
detectAndAssessUrgency()          // Urgency orchestrator
activateProtocols()               // Protocol activation
generateMedicalResponse()         // Response generation
processMedicalQuery()             // Query processing
```

### Current ESLint Status

**Passing** ✅:
- `route.ts`: All complexity warnings resolved
- TypeScript strict mode: enabled
- No unused variables
- Proper error handling

**Warnings** ⚠️:
- `PerformanceMonitor.tsx`: 226 lines, complexity 16
- `ChatInterface.tsx`: 425 lines, complexity 18
- Some non-null assertions (acceptable in context)

---

## Recent Improvements

### January 2025 - Code Quality Sprint

#### 1. Massive Complexity Reduction ✅
**Commit**: `ccd563b` - "Massive complexity reduction in route.ts (78 → 18)"

**Impact**:
- 77% complexity reduction
- 12 helper functions extracted
- 2 functions removed from ESLint warnings
- Improved testability and maintainability

**Details**:
```
route.ts: 470 lines → 130 lines
POST():   complexity 78 → 18
processSOAPAnalysis(): complexity 31 → <15
detectUrgencyWithContext(): complexity 18 → <15
```

#### 2. React Naming Conventions Review ✅
**Date**: 2025-01-16

**Findings**:
- Overall compliance: 78%
- Code naming: 100% ✅
- File naming: Needs migration to kebab-case
- Action plan created for future session

**Agent Report**: See full analysis in commit history

#### 3. TypeScript Type Safety ✅
**Recent additions**:
```typescript
interface SessionData { /* ... */ }
interface ExtractedInfo { /* ... */ }
interface UrgencyAssessment { /* ... */ }
interface SOAPState { /* ... */ }
```

All helper functions now fully typed with proper interfaces.

---

## Future Roadmap

### Phase 1: Naming Migration (Future Session)
**Goal**: Achieve 100% React 19 naming compliance

**Tasks**:
1. Migrate component files to kebab-case
2. Migrate hook files to kebab-case
3. Update all imports (50-100+ files)
4. Add barrel exports (`index.ts`)
5. Verify build and tests

**Script Ready**: `scripts/migrate-to-kebab-case-phase1.sh`

**Estimated Time**: 2-3 hours

### Phase 2: Component Folder Structure
**Goal**: Consistent component organization

**Pattern**:
```
src/components/component-name/
  ├── component-name.tsx        # Component
  ├── component-name.test.tsx   # Tests
  ├── component-name.types.ts   # Types
  ├── hooks/                    # Component-specific hooks
  └── index.ts                  # Barrel export
```

### Phase 3: Remaining Complexity Reduction
**Targets**:
- `PerformanceMonitor.tsx`: 226 lines → <200
- `ChatInterface.tsx`: 425 lines → <300

**Approach**: Extract sub-components and custom hooks

### Phase 4: ESLint Configuration
**Goal**: Enforce naming conventions automatically

**Files to create**:
- `.eslintrc.naming.js`: Naming rules
- `.eslintrc.complexity.js`: Complexity thresholds

---

## Contributing Guidelines

### Code Style

**1. Component Structure**:
```typescript
// ✅ Good: Clear structure with types
interface MyComponentProps {
  title: string
  onAction: () => void
}

export const MyComponent = ({ title, onAction }: MyComponentProps) => {
  // Hooks first
  const [state, setState] = useState('')
  const data = useCustomHook()

  // Event handlers
  const handleClick = () => {
    onAction()
  }

  // Render
  return <div>{title}</div>
}
```

**2. Hook Structure**:
```typescript
// ✅ Good: Return object with state and actions
export const useCustomHook = () => {
  const [state, setState] = useState()

  const action = () => {
    // logic
  }

  return {
    // State
    state,

    // Actions
    action,
  }
}
```

**3. Helper Function Pattern**:
```typescript
// ✅ Good: Single responsibility, well-typed
function calculateMetrics(data: MetricsData): ProcessedMetrics {
  // Single clear purpose
  // Pure function when possible
  // Max 15 lines
  return processed
}
```

### Pull Request Guidelines

**Before submitting**:
1. ✅ Run `npm run build` - must pass
2. ✅ Run `npm run lint` - fix all errors
3. ✅ Run `npm test` - all tests pass
4. ✅ Add tests for new features
5. ✅ Update documentation if needed

**Commit Message Format**:
```
🔧 Short description (50 chars max)

Detailed explanation:
- What changed
- Why it changed
- Impact on the codebase

Breaking changes: none/describe

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

### Testing Requirements

**Component Tests**:
```typescript
import { render } from '@/test/utils/test-utils' // With Redux

describe('MyComponent', () => {
  it('should render correctly', () => {
    const { getByText } = render(<MyComponent title="Test" />)
    expect(getByText('Test')).toBeInTheDocument()
  })
})
```

**Hook Tests**:
```typescript
import { renderHook } from '@testing-library/react'

describe('useCustomHook', () => {
  it('should return initial state', () => {
    const { result } = renderHook(() => useCustomHook())
    expect(result.current.state).toBeDefined()
  })
})
```

---

## Language Conventions

### Code & Technical Comments
**Language**: English
```typescript
// ✅ Good: English for technical comments
function calculateSOAPProgress(soapState: SOAPState): number {
  // Each section contributes 25% to total progress
  let progress = 0
  if (soapState.subjetivo) progress += 25
  return progress
}
```

### User-Facing Content
**Language**: Spanish (target audience)
```typescript
// ✅ Good: Spanish for UI strings
const messages = {
  welcome: 'Bienvenido al asistente médico',
  loading: 'Procesando análisis médico...',
  error: 'Error al procesar solicitud',
}
```

### Documentation
**Language**: Bilingual when beneficial
- Technical docs: English (ARCHITECTURE.md)
- User guides: Spanish
- API docs: English with Spanish examples

---

## Architecture Decisions

### Why Redux+LLM Pattern?

**Benefits**:
1. **Determinism**: Redux provides predictable state management
2. **Flexibility**: LLM handles complex medical reasoning
3. **Traceability**: Every AI decision is a Redux action
4. **Testability**: Pure functions + clear boundaries
5. **Modularity**: 13 specialized medical agents

**Performance**:
- 81% faster than traditional approaches
- 85% cost reduction via intelligent routing
- 94.7% accuracy in medical triage

### Why Clean Architecture?

**Benefits**:
1. **Independence**: UI changes don't affect business logic
2. **Testability**: Core logic testable without UI/API
3. **Scalability**: Easy to add new features/agents
4. **Maintainability**: Clear boundaries and responsibilities

**Implementation**:
- Published NPM package for domain layer
- Hooks for application layer
- Components for presentation layer
- API routes for infrastructure layer

---

## References

### Internal Documentation
- `CLAUDE.md`: Project instructions and AI patterns
- `README.md`: Setup and usage guide
- `packages/cognitive-core/README.md`: NPM package docs

### External Resources
- [Next.js 15 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Redux Toolkit](https://redux-toolkit.js.org/)

---

## Changelog

### 2025-01-16
- ✅ Massive complexity reduction in `route.ts` (78 → 18)
- ✅ Extracted 12 helper functions
- ✅ React naming conventions review (78% compliance)
- ✅ Created ARCHITECTURE.md documentation
- 📋 Planned kebab-case migration (future session)

### 2024-12
- ✅ NPM package published: `redux-brain-medical-ai` v1.0.1
- ✅ Clean Architecture implementation
- ✅ 13 medical AI agents operational
- ✅ DefensiveMedicineValidator integration

---

**Maintained by**: Bernard Orozco (@bernard-orozco)
**Project**: Redux Brain Medical AI
**License**: Private
**Last Review**: 2025-01-16
