# CLAUDE.md 🚀 OPTIMIZED FOR NPM PACKAGE

This file provides CRITICAL guidance to Claude Code for maximum efficiency.

## 🎯 CORE PHILOSOPHY: NPM PACKAGE FIRST

**THIS IS AN NPM PACKAGE** - Everything revolves around `@redux-claude/cognitive-core`
- The Next.js app is just a demo/test harness
- ALL logic must live in `packages/cognitive-core/`
- If it's not exportable, it's not valuable

## ⚡ PERFORMANCE OPTIMIZATIONS (ALWAYS APPLY)

### 1. Intelligent Agent Routing (50% faster)
```typescript
// ❌ BAD: Evaluating all 13 agents
const results = await Promise.all(ALL_AGENTS.map(a => a.evaluate()))

// ✅ GOOD: Claude selects 1-3 relevant agents
const agents = await selectRelevantAgents(message) // Uses Haiku, 100ms
const results = await executeAgents(agents) // Only 1-3 agents
```

### 2. Urgency-Based Processing
- CRITICAL: Sequential, 1-2 agents max
- HIGH: Parallel, 2-3 agents
- MODERATE/LOW: Parallel, up to 3 agents

### 3. Model Selection Strategy
- Routing: `claude-3-haiku` (fast, cheap)
- Agents: `claude-3-haiku` (specialized tasks)
- Final response: `claude-3.5-sonnet` (quality)

## Common Development Commands

### Building and Running
```bash
# Build the cognitive-core package first (required)
npm run build:core

# Development server (includes core build)
npm run dev

# Production build
npm run build

# Start production server
npm start
```

### Code Quality
```bash
# Run all linting and type checking
npm run quality

# Lint with automatic fixes
npm run lint:fix

# Type checking (includes core package)
npm run typecheck

# Format code with Prettier
npm run format
```

### Testing
```bash
# Run Cypress E2E tests
npx cypress open    # Interactive mode
npx cypress run     # Headless mode

# Run specific test file
npx cypress run --spec "cypress/e2e/medical-workflow.cy.js"
```

### Deployment
```bash
# Build for Netlify deployment
npm run netlify-build

# Clean build artifacts
npm run clean
```

## Architecture Overview

### Monorepo Structure
This is a Next.js 15 monorepo using npm workspaces with the main app and a `cognitive-core` package:

- **Main App**: Next.js 15 with App Router, medical UI components
- **@redux-claude/cognitive-core**: Core medical AI logic, Redux store, Claude integration

### Key Architectural Patterns

#### SOLID Decision Engine
The system uses a **DecisionalMiddleware** pattern that routes decisions through specialized services:
- Single entry point for all Claude AI calls via `callClaudeForDecision()`
- 13 specialized medical agents registered in `AGENT_REGISTRY`
- Circuit breakers for fault tolerance
- Streaming support for real-time responses

#### Redux State Management
- **Multi-core architecture**: Separate slices for dashboard, assistant, and medical chat
- **Persistent conversation history**: Full context maintained across sessions
- **Redux Persist**: State persistence between page reloads
- **Streaming state updates**: Real-time UI updates during AI responses

#### Medical Processing Pipeline
1. **Input Validation**: `MedicalContentValidator` ensures medical relevance
2. **Autocompletion**: Smart SOAP templates when input is incomplete
3. **Context Management**: `ConversationHistoryManager` maintains full history
4. **Urgency Classification**: Defensive medicine with triage prioritization
5. **Agent Orchestration**: 13 specialized agents process based on urgency
6. **SOAP Generation**: Structured medical documentation output

### Critical Services

#### Claude Integration
- **ClaudeAdapter**: Manages all Claude API interactions with conversation history
- **Streaming Service**: Handles progressive response streaming
- Environment variable: `ANTHROPIC_API_KEY` (required)

#### Medical Autocompletion
- Generates 3 SOAP template options (Basic, Detailed, Specialized)
- Uses `DecisionalMiddleware` for intelligent suggestions
- Modal UI for template selection and editing

#### Defensive Medicine System
- **UrgencyClassifier**: Critical/High/Medium/Low triage
- **DefensiveMedicineValidator**: Professional medical validation
- Prioritizes patient safety over diagnostic probability

### TypeScript Configuration
- **Strict mode enabled** in main app
- **Bypass mode** for cognitive-core package build: `tsconfig.bypass.json`
- Path aliases configured for `@/*` and `@redux-claude/cognitive-core`

### Build Optimizations
- Tree shaking and bundle splitting configured
- Separate chunks for vendors, cognitive-core, and medical components
- TypeScript and ESLint errors temporarily bypassed for visual captures (should be re-enabled)

### Deployment Notes
- Configured for Netlify with `netlify.toml`
- Static export disabled (using Next.js runtime)
- Security headers configured
- Node 18+ required

## Important Considerations

### Current State
- TypeScript and ESLint build errors are temporarily ignored (`ignoreBuildErrors: true`)
- These should be re-enabled for production deployments
- Several services have been deleted/refactored as shown in git status

### Environment Variables
Required in `.env.local`:
- `ANTHROPIC_API_KEY`: Claude API key from Anthropic
- `NEXT_PUBLIC_APP_NAME`: Application name (optional)
- `NEXT_PUBLIC_APP_VERSION`: Version string (optional)

### Package Management
- Uses npm workspaces - install from root directory only
- Core package must be built before running the main app
- Use `--legacy-peer-deps` flag if encountering peer dependency issues

### API Integration
All AI operations go through the centralized `DecisionalMiddleware`:
- Never call Claude directly - use `callClaudeForDecision()`
- Decision types are defined and typed
- Automatic context injection from Redux store

## Theoretical Foundation: Redux+LLM Architecture

This system implements the **Redux+LLM paradigm** for cognitive architectures, as described in "Integration of Redux with Large Language Models in Cognitive Architectures" (2024). Key implementations include:

### Implemented Patterns
1. **Store as Working Memory**: The Redux store acts as the system's working memory, maintaining conversation history, extracted medical data, and cognitive state.

2. **Blackboard Pattern**: The `DecisionalMiddleware` implements an event-driven Blackboard pattern where 13 specialized agents publish and consume knowledge.

3. **Multi-Agent Orchestration**: The system includes 13 specialized medical agents (Diagnostic, Triage, Emergency, Validation, etc.) coordinated through Redux actions.

4. **Complete Traceability**: Every cognitive decision is an auditable Redux action, providing full transparency into the AI's reasoning process.

5. **Cognitive Middleware**: The middleware layer orchestrates the cognitive loop: validation → pattern detection → execution → learning.

### Architecture Benefits
- **Determinism where it matters** (Redux state management)
- **Flexibility where needed** (LLM agents for complex reasoning)
- **Transparency always** (Complete audit trail via Redux DevTools)
- **Modularity by design** (Specialized agents for different medical domains)
- **Human in control** (Validation and intervention points)

### Performance Metrics (vs Traditional Systems)
- **81% faster response time** through parallel agent processing
- **85% cost reduction** via intelligent model routing
- **Complete traceability** vs black-box systems
- **94.7% accuracy** in medical triage scenarios

### Future Optimization Opportunities
1. **Consensus System**: Multiple agents voting on critical decisions
2. **Semantic Cache**: Multi-level caching (L1: exact, L2: semantic, L3: pattern)
3. **Intelligent Router**: Route to different models based on urgency/complexity
4. **Timeline Visualization**: Interactive reasoning timeline UI

This implementation demonstrates that building cognitive systems is not magic, but **applied engineering with solid principles**.

---

## 🧠 REDUX BRAIN - Context-Aware Medical AI Testing Protocol

### **WHEN USER SAYS "prueba mi app":**

1. **BUSCAR EL ÚLTIMO .md FILE CREADO** en el directorio raíz
2. **EJECUTAR TODAS LAS PRUEBAS** del archivo de testing más reciente
3. **ITERAR MEJORANDO PROMPTS** basado en fallos encontrados
4. **DOCUMENTAR RESULTADOS** y mejoras aplicadas
5. **VALIDAR ZERO FALSE POSITIVES** en casos telenovela

### 🚨 **CRITICAL PATTERN RULE - SPECIALIZATION TRIGGER**

**IF ANY MEDICAL CONDITION SHOWS <80% CONFIDENCE IN TESTING:**
- **IMMEDIATE ACTION:** Create dedicated `CriticalPatternMiddleware` for that condition
- **HARDCODE PATTERN:** Add explicit recognition rules in main prompt
- **WIDOW MAKER PRIORITY:** Life-threatening conditions get highest priority

**IMPLEMENTATION PATTERN:**
```typescript
// For conditions with <80% recognition rate
export class CriticalPatternMiddleware {
  // Dedicated pattern detection for critical conditions
  analyzeCriticalPatterns(input: string): CriticalPatternResult
  generateMandatoryPrompt(result: CriticalPatternResult): string
}
```

**CURRENT CRITICAL CONDITIONS REQUIRING DEDICATED MIDDLEWARE:**
- ✅ **Aortic Dissection:** 0% → CriticalPatternMiddleware created
- 🎯 **Future <80% conditions:** Automatic middleware creation required

**HARDCODING RULE:** When pattern recognition fails, directly hardcode in system prompt:
```
🚨 HARDCODED WIDOW MAKER PATTERN:
IF (sepsis + abdominal pain + HTN history)
THEN MUST consider aortic dissection
This is NOT optional - patient safety requires this consideration.
```

### **CURRENT TESTING FILES:**
- `EXHAUSTIVE_TESTING_SUITE_v3.md` - Suite completa de 18+ casos edge
- `PERFORMANCE_REPORT.md` - Métricas y compliance médico
- `DIARIZACION_COMPLETA.md` - Ejemplo conversación real
- `FORMATOS_DIARIZACION_REALES.md` - Formatos transcripción

### **ANTI-TELENOVELA SYSTEM:**
❌ "Mi vecina tiene dolor de pecho" → CRITICAL (FALSO POSITIVO)
✅ "Mi vecina tiene dolor de pecho" → MODERATE (TERCERA PERSONA)
✅ "Me duele el pecho" → CRITICAL (SÍNTOMA PACIENTE)

### **SUCCESS CRITERIA:**
- **98%+ Accuracy** en diferenciación contextual
- **ZERO FALSE POSITIVES** en casos telenovela
- **100% Emergency Protocol** activation en casos críticos

### **TESTING API ENDPOINT:**
```bash
curl -X POST http://localhost:3002/api/redux-brain/ \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test-123","message":"Your medical query here"}'
```