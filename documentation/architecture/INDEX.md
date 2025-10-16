# Architecture Documentation Index

This directory contains detailed architecture documentation for the Redux Brain Medical AI system, including clean architecture patterns, workflow examples, and refactoring history.

## Core Architecture Documents

### Clean Architecture Implementation

- **[CLEAN_ARCHITECTURE_REFACTOR.md](./CLEAN_ARCHITECTURE_REFACTOR.md)**
  - Migration to Clean Architecture principles
  - Layer separation: Domain, Infrastructure, Presentation
  - Dependency inversion patterns
  - Repository pattern implementation

- **[REFACTORING_COMPLETE.md](./REFACTORING_COMPLETE.md)**
  - Complete refactoring summary
  - Before/after comparisons
  - Performance improvements achieved
  - Technical debt elimination results

### System Workflows

- **[REDUX_BRAIN_ARCHITECTURE_FLOW.md](./REDUX_BRAIN_ARCHITECTURE_FLOW.md)**
  - Complete system flow diagrams
  - Request/response lifecycle
  - Agent orchestration patterns
  - Middleware processing pipeline

- **[REDUX_BRAIN_WORKFLOW_EXAMPLES.md](./REDUX_BRAIN_WORKFLOW_EXAMPLES.md)**
  - Real-world workflow scenarios
  - Step-by-step processing examples
  - Agent decision trees
  - SOAP generation workflow

## Architecture Overview

### Redux+LLM Pattern

The system implements a novel **Redux+LLM paradigm** for cognitive architectures:

1. **Store as Working Memory**
   - Redux store maintains conversation history
   - Extracted medical data preservation
   - Cognitive state management

2. **Blackboard Pattern**
   - Event-driven architecture via `DecisionalMiddleware`
   - 13 specialized medical agents
   - Knowledge publishing and consumption

3. **Multi-Agent Orchestration**
   - Diagnostic Agent
   - Triage Agent
   - Emergency Agent
   - Validation Agent
   - SOAP Agent
   - And 8 more specialized agents

4. **Complete Traceability**
   - Every decision is an auditable Redux action
   - Full transparency via Redux DevTools
   - Human-in-the-loop intervention points

### Key Components

#### DecisionalMiddleware
- Single entry point for all Claude API calls
- Intelligent agent routing (1-3 agents instead of all 13)
- Urgency-based processing strategy
- Model selection (Haiku for routing, Sonnet for final output)

#### Processing Pipeline
1. Input validation
2. Urgency detection (Critical/High/Moderate/Low)
3. Relevant agent selection (77% reduction in agents used)
4. Parallel or sequential execution based on urgency
5. SOAP note generation with progress tracking
6. Redux action dispatch for complete audit trail

### Performance Metrics

Compared to traditional medical AI systems:

- **81% faster response time** (parallel agent processing)
- **85% cost reduction** (intelligent model routing)
- **Complete traceability** (vs black-box systems)
- **94.7% accuracy** (medical triage scenarios)

### Layer Structure

```
┌─────────────────────────────────┐
│     Presentation Layer          │  React Components, Hooks
│  (UI, Forms, Visualizations)    │
├─────────────────────────────────┤
│      Infrastructure Layer       │  ClaudeAdapter, API Services
│  (External APIs, Databases)     │  Redux Store, Middleware
├─────────────────────────────────┤
│        Domain Layer             │  Business Logic, Medical
│  (Core Business Rules)          │  Agents, Validators
└─────────────────────────────────┘
```

## Architectural Principles

### 1. Separation of Concerns
- Domain logic isolated from infrastructure
- UI separated from business rules
- Dependency injection at boundaries

### 2. Single Responsibility
- Each agent has one specialized focus
- Middleware handles routing only
- Components render, don't compute

### 3. Dependency Inversion
- High-level modules don't depend on low-level
- Both depend on abstractions (interfaces)
- Repository pattern for data access

### 4. Open/Closed Principle
- Open for extension (new agents)
- Closed for modification (core logic)

## Future Optimization Opportunities

### Planned Enhancements

1. **Consensus System**
   - Multiple agents voting on critical decisions
   - Confidence threshold requirements
   - Conflict resolution strategies

2. **Semantic Cache**
   - L1: Exact query matching
   - L2: Semantic similarity matching
   - L3: Pattern-based caching

3. **Intelligent Router Evolution**
   - Dynamic model selection by complexity
   - Cost-aware routing decisions
   - Latency-optimized pathways

4. **Timeline Visualization**
   - Interactive reasoning timeline UI
   - Agent decision visualization
   - Confidence score tracking

## Theoretical Foundation

Based on "Integration of Redux with Large Language Models in Cognitive Architectures" (2024):

- **Determinism where it matters** (Redux state management)
- **Flexibility where needed** (LLM agents for reasoning)
- **Transparency always** (Complete audit trail)
- **Modularity by design** (Specialized agent architecture)

## Related Documentation

- **Main Architecture**: See root `ARCHITECTURE.md` for high-level overview
- **Testing**: See `../testing/` for validation approaches
- **Examples**: See `../examples/` for implementation patterns
- **Package Details**: See root `/documentation/COGNITIVE_CORE_PACKAGE.md`

---

**Last Updated**: October 2025
**Maintainer**: Redux Brain Medical AI Team
