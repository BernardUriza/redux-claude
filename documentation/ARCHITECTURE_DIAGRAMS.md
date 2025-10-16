# Architecture Diagrams - Redux Brain Medical AI

> **Version**: 1.0.1 | **Last Updated**: 2025-01-16 | **Auto-generated**

## Table of Contents

1. [System Overview](#system-overview)
2. [Redux+LLM Architecture](#reduxllm-architecture)
3. [Data Flow](#data-flow)
4. [Agent Orchestration](#agent-orchestration)
5. [SOAP Processing Pipeline](#soap-processing-pipeline)
6. [Urgency Detection Flow](#urgency-detection-flow)
7. [Clean Architecture Layers](#clean-architecture-layers)
8. [Deployment Architecture](#deployment-architecture)

---

## System Overview

### High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        UI[React UI]
        Mobile[Mobile PWA]
    end

    subgraph "Application Layer"
        Next[Next.js 15]
        API[API Routes]
        WS[WebSocket]
    end

    subgraph "Business Logic"
        Redux[Redux Store]
        Middleware[DecisionalMiddleware]
        Agents[13 Medical Agents]
        SOAP[SOAP Processor]
    end

    subgraph "AI Layer"
        Claude[Claude API]
        Haiku[Claude Haiku]
        Sonnet[Claude Sonnet]
    end

    UI --> Next
    Mobile --> Next
    Next --> API
    API --> Redux
    Redux --> Middleware
    Middleware --> Agents
    Agents --> SOAP
    Middleware --> Claude
    Claude --> Haiku
    Claude --> Sonnet

    style UI fill:#1e293b,stroke:#3b82f6,color:#fff
    style Redux fill:#7c3aed,stroke:#5b21b6,color:#fff
    style Claude fill:#dc2626,stroke:#b91c1c,color:#fff
    style Middleware fill:#059669,stroke:#047857,color:#fff
```

---

## Redux+LLM Architecture

### Cognitive Architecture Pattern

```mermaid
flowchart TB
    subgraph "Redux Layer (Deterministic)"
        Store[Redux Store]
        Actions[Actions]
        Reducers[Reducers]
        Selectors[Selectors]

        Store --> Actions
        Actions --> Reducers
        Reducers --> Store
        Store --> Selectors
    end

    subgraph "Middleware Layer (Orchestration)"
        DM[DecisionalMiddleware]
        CM[CriticalPatternMiddleware]
        UM[UrgencyMiddleware]
        VM[ValidationMiddleware]

        DM --> CM
        DM --> UM
        DM --> VM
    end

    subgraph "LLM Layer (Intelligence)"
        Router[Agent Router - Haiku]
        Processor[Agent Processor - Sonnet]

        Router --> |"Select 1-3 agents"| Processor
    end

    subgraph "Agents (Specialized)"
        A1[DiagnosticAgent]
        A2[TriageAgent]
        A3[EmergencyAgent]
        A4[ValidationAgent]
        More[+9 More Agents]

        Processor --> A1
        Processor --> A2
        Processor --> A3
        Processor --> A4
        Processor --> More
    end

    Store --> DM
    DM --> Router
    A1 --> Store
    A2 --> Store
    A3 --> Store
    A4 --> Store
    More --> Store

    style Store fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style DM fill:#059669,stroke:#047857,color:#fff
    style Router fill:#f59e0b,stroke:#d97706,color:#fff
    style Processor fill:#dc2626,stroke:#b91c1c,color:#fff
```

### Redux Action Flow

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant Redux
    participant Middleware
    participant LLM
    participant Agents

    User->>UI: Medical Query
    UI->>Redux: Dispatch(MESSAGE_RECEIVED)
    Redux->>Redux: Update State
    Redux->>Middleware: Process Query
    Middleware->>LLM: Route to Agents
    LLM->>LLM: Select Relevant Agents
    LLM->>Agents: Execute 1-3 Agents
    Agents->>Redux: Dispatch Results
    Redux->>Redux: Update SOAP State
    Redux->>UI: Render Response
    UI->>User: Display Results
```

---

## Data Flow

### Complete Request Lifecycle

```mermaid
flowchart LR
    subgraph "Input Processing"
        Input[User Input]
        Sanitize[Sanitize]
        Validate[Validate]
        Extract[Extract Entities]
    end

    subgraph "Context Building"
        History[Get History]
        Patient[Patient Info]
        Context[Build Context]
    end

    subgraph "AI Processing"
        Urgency[Detect Urgency]
        Route[Route Agents]
        Process[Process Query]
        SOAP[Generate SOAP]
    end

    subgraph "Response Generation"
        Format[Format Response]
        Stream[Stream Output]
        Store[Store Results]
    end

    Input --> Sanitize
    Sanitize --> Validate
    Validate --> Extract
    Extract --> History
    History --> Patient
    Patient --> Context
    Context --> Urgency
    Urgency --> Route
    Route --> Process
    Process --> SOAP
    SOAP --> Format
    Format --> Stream
    Stream --> Store

    style Input fill:#3b82f6,stroke:#1e40af,color:#fff
    style Context fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style Process fill:#059669,stroke:#047857,color:#fff
    style Stream fill:#f59e0b,stroke:#d97706,color:#fff
```

---

## Agent Orchestration

### 13 Medical Agents System

```mermaid
graph TD
    subgraph "Routing Layer"
        Router[Intelligent Router<br/>Claude Haiku]
    end

    subgraph "Critical Agents"
        Emergency[EmergencyAgent]
        Triage[TriageAgent]
        Validation[ValidationAgent]
    end

    subgraph "Diagnostic Agents"
        Diagnostic[DiagnosticAgent]
        Pediatric[PediatricAgent]
        Surgical[SurgicalAgent]
    end

    subgraph "Treatment Agents"
        Treatment[TreatmentAgent]
        Mental[MentalHealthAgent]
        Nutrition[NutritionAgent]
    end

    subgraph "Support Agents"
        FollowUp[FollowUpAgent]
        Education[EducationAgent]
        Preventive[PreventiveAgent]
        Rehab[RehabilitationAgent]
    end

    Router --> |"CRITICAL"| Emergency
    Router --> |"CRITICAL"| Triage
    Router --> |"ALL"| Validation

    Router --> |"DIAGNOSTIC"| Diagnostic
    Router --> |"AGE < 18"| Pediatric
    Router --> |"SURGICAL"| Surgical

    Router --> |"TREATMENT"| Treatment
    Router --> |"MENTAL"| Mental
    Router --> |"NUTRITION"| Nutrition

    Router --> |"FOLLOW-UP"| FollowUp
    Router --> |"EDUCATION"| Education
    Router --> |"PREVENTIVE"| Preventive
    Router --> |"REHAB"| Rehab

    style Router fill:#f59e0b,stroke:#d97706,color:#fff
    style Emergency fill:#dc2626,stroke:#b91c1c,color:#fff
    style Triage fill:#dc2626,stroke:#b91c1c,color:#fff
    style Validation fill:#059669,stroke:#047857,color:#fff
```

### Agent Selection Strategy

```mermaid
flowchart TD
    Start[Medical Query]
    Analyze[Analyze Context]

    Urgency{Urgency Level?}
    Critical[Select 1-2 Agents<br/>Sequential]
    High[Select 2-3 Agents<br/>Priority Order]
    Normal[Select 2-3 Agents<br/>Parallel]

    Execute[Execute Agents]
    Consensus[Build Consensus]
    Result[Return Result]

    Start --> Analyze
    Analyze --> Urgency

    Urgency -->|CRITICAL| Critical
    Urgency -->|HIGH| High
    Urgency -->|MODERATE/LOW| Normal

    Critical --> Execute
    High --> Execute
    Normal --> Execute

    Execute --> Consensus
    Consensus --> Result

    style Start fill:#3b82f6,stroke:#1e40af,color:#fff
    style Critical fill:#dc2626,stroke:#b91c1c,color:#fff
    style High fill:#f59e0b,stroke:#d97706,color:#fff
    style Normal fill:#059669,stroke:#047857,color:#fff
```

---

## SOAP Processing Pipeline

### SOAP Generation Flow

```mermaid
flowchart TB
    subgraph "Input Analysis"
        Message[Patient Message]
        Extract[Extract Medical Data]
        Classify[Classify Information]
    end

    subgraph "SOAP Sections"
        S[Subjective<br/>Patient's Story]
        O[Objective<br/>Clinical Data]
        A[Analysis<br/>Diagnosis]
        P[Plan<br/>Treatment]
    end

    subgraph "Processing"
        SOAPProc[SOAP Processor]
        Validate[Validate Sections]
        Complete[Check Completeness]
    end

    subgraph "Output"
        Store[Store in Redux]
        Export[Export Options]
        Display[Display UI]
    end

    Message --> Extract
    Extract --> Classify
    Classify --> SOAPProc

    SOAPProc --> S
    SOAPProc --> O
    SOAPProc --> A
    SOAPProc --> P

    S --> Validate
    O --> Validate
    A --> Validate
    P --> Validate

    Validate --> Complete
    Complete --> Store
    Store --> Export
    Store --> Display

    style Message fill:#3b82f6,stroke:#1e40af,color:#fff
    style SOAPProc fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style Store fill:#059669,stroke:#047857,color:#fff
```

### SOAP Progress Tracking

```mermaid
pie title "SOAP Completion Progress"
    "Subjective (25%)" : 25
    "Objective (25%)" : 25
    "Analysis (25%)" : 25
    "Plan (25%)" : 25
```

---

## Urgency Detection Flow

### Multi-Layer Urgency System

```mermaid
flowchart TD
    Input[Patient Input]

    subgraph "Layer 1: Critical Patterns"
        CP[CriticalPatternMiddleware]
        WM[Widow Maker Detection]
    end

    subgraph "Layer 2: Defensive Medicine"
        DM[DefensiveMedicineValidator]
        Gravity[Gravity Score]
    end

    subgraph "Layer 3: LLM Context"
        Context[Build Context]
        LLM[Claude Analysis]
        AntiTV[Anti-Telenovela Filter]
    end

    Priority{Priority Decision}
    Critical[CRITICAL Protocol]
    High[HIGH Protocol]
    Moderate[MODERATE Protocol]
    Low[LOW Protocol]

    Input --> CP
    CP --> WM
    WM --> DM
    DM --> Gravity
    Gravity --> Context
    Context --> LLM
    LLM --> AntiTV
    AntiTV --> Priority

    Priority -->|Override: Critical Pattern| Critical
    Priority -->|Override: Defensive Medicine| High
    Priority -->|LLM Assessment| Moderate
    Priority -->|Context: Third Party| Low

    style CP fill:#dc2626,stroke:#b91c1c,color:#fff
    style DM fill:#f59e0b,stroke:#d97706,color:#fff
    style LLM fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style Critical fill:#dc2626,stroke:#b91c1c,color:#fff
```

### Anti-Telenovela System

```mermaid
flowchart LR
    Input[User Input]

    Analyze{Who is Patient?}
    Direct[Direct Patient<br/>"Me duele"]
    Parent[Parent with Child<br/>"Mi hijo tiene"]
    Third[Third Party<br/>"Mi vecina dice"]
    Question[Medical Question<br/>"¿Qué opina de?"]

    Temporal{Temporal Context}
    Current[Current Symptoms<br/>"ahora", "tengo"]
    Past[Past Symptoms<br/>"ayer", "tuve"]

    Level[Urgency Level]

    Input --> Analyze

    Analyze -->|First Person| Direct
    Analyze -->|Present Child| Parent
    Analyze -->|Absent Person| Third
    Analyze -->|General Query| Question

    Direct --> Temporal
    Parent --> Temporal
    Third --> |LOW| Level
    Question --> |MODERATE| Level

    Temporal -->|Present| Current
    Temporal -->|Past| Past

    Current --> |Assess Normally| Level
    Past --> |Context Only| Level

    style Input fill:#3b82f6,stroke:#1e40af,color:#fff
    style Direct fill:#059669,stroke:#047857,color:#fff
    style Third fill:#f59e0b,stroke:#d97706,color:#fff
```

---

## Clean Architecture Layers

### Layer Dependencies

```mermaid
graph BT
    subgraph "Infrastructure"
        DB[(Database)]
        API[External APIs]
        File[File System]
    end

    subgraph "Domain (NPM Package)"
        Entities[Entities]
        UseCases[Use Cases]
        DomainServices[Domain Services]
    end

    subgraph "Application"
        AppServices[App Services]
        DTOs[DTOs]
        Mappers[Mappers]
    end

    subgraph "Presentation"
        Components[React Components]
        Hooks[Custom Hooks]
        Pages[Next.js Pages]
    end

    DB --> Entities
    API --> DomainServices
    File --> DomainServices

    Entities --> UseCases
    UseCases --> DomainServices
    DomainServices --> AppServices

    AppServices --> DTOs
    DTOs --> Mappers
    Mappers --> Hooks

    Hooks --> Components
    Components --> Pages

    style Entities fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style UseCases fill:#059669,stroke:#047857,color:#fff
    style Components fill:#3b82f6,stroke:#1e40af,color:#fff
```

### Package Structure

```mermaid
graph TD
    subgraph "redux-brain-medical-ai (NPM)"
        Core[Core Package]
        Agents[/agents]
        Middleware[/middleware]
        Processors[/processors]
        Store[/store]
        Services[/services]
        Types[/types]
        Utils[/utils]
        Validators[/validators]
    end

    subgraph "Main Application"
        App[Next.js App]
        AppAPI[/api]
        AppComponents[/components]
        AppHooks[/hooks]
        AppLib[/lib]
    end

    Core --> Agents
    Core --> Middleware
    Core --> Processors
    Core --> Store
    Core --> Services
    Core --> Types
    Core --> Utils
    Core --> Validators

    App --> Core
    App --> AppAPI
    App --> AppComponents
    App --> AppHooks
    App --> AppLib

    style Core fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style App fill:#3b82f6,stroke:#1e40af,color:#fff
```

---

## Deployment Architecture

### Production Infrastructure

```mermaid
graph TB
    subgraph "CDN Layer"
        CF[Cloudflare/Netlify CDN]
    end

    subgraph "Application Layer"
        LB[Load Balancer]
        N1[Next.js Instance 1]
        N2[Next.js Instance 2]
        N3[Next.js Instance 3]
    end

    subgraph "API Layer"
        APIGateway[API Gateway]
        RateLimit[Rate Limiter]
        Auth[Auth Service]
    end

    subgraph "Services"
        Redis[(Redis Cache)]
        PG[(PostgreSQL)]
        S3[S3 Storage]
    end

    subgraph "External"
        Claude[Claude API]
        Monitoring[Monitoring]
    end

    CF --> LB
    LB --> N1
    LB --> N2
    LB --> N3

    N1 --> APIGateway
    N2 --> APIGateway
    N3 --> APIGateway

    APIGateway --> RateLimit
    RateLimit --> Auth

    Auth --> Redis
    Auth --> PG
    Auth --> S3

    N1 --> Claude
    N2 --> Claude
    N3 --> Claude

    N1 --> Monitoring
    N2 --> Monitoring
    N3 --> Monitoring

    style CF fill:#f59e0b,stroke:#d97706,color:#fff
    style APIGateway fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style Claude fill:#dc2626,stroke:#b91c1c,color:#fff
    style Redis fill:#059669,stroke:#047857,color:#fff
```

### CI/CD Pipeline

```mermaid
flowchart LR
    subgraph "Development"
        Dev[Local Dev]
        Test[Run Tests]
        Build[Build Package]
    end

    subgraph "CI Pipeline"
        GitHub[GitHub Push]
        Actions[GitHub Actions]
        Checks[Quality Checks]
    end

    subgraph "CD Pipeline"
        NPM[NPM Publish]
        Netlify[Netlify Deploy]
        Notify[Notifications]
    end

    subgraph "Production"
        CDN[CDN]
        Prod[Production]
        Monitor[Monitoring]
    end

    Dev --> Test
    Test --> Build
    Build --> GitHub

    GitHub --> Actions
    Actions --> Checks

    Checks -->|Package| NPM
    Checks -->|App| Netlify

    NPM --> Notify
    Netlify --> Notify

    Netlify --> CDN
    CDN --> Prod
    Prod --> Monitor

    style Dev fill:#3b82f6,stroke:#1e40af,color:#fff
    style Actions fill:#059669,stroke:#047857,color:#fff
    style Netlify fill:#f59e0b,stroke:#d97706,color:#fff
    style Prod fill:#dc2626,stroke:#b91c1c,color:#fff
```

---

## Performance Optimization Flow

### Request Optimization Strategy

```mermaid
flowchart TD
    Request[Incoming Request]

    Cache{Cache Hit?}
    L1[L1: Exact Match<br/>Redis]
    L2[L2: Semantic<br/>Vector DB]
    L3[L3: Pattern<br/>Memory]

    Process[Process Request]
    Route{Route Strategy}

    Haiku[Haiku<br/>Fast Router<br/>100ms]
    Sonnet[Sonnet<br/>Quality<br/>500ms]

    Store[Store Result]
    Response[Return Response]

    Request --> Cache
    Cache -->|Yes| L1
    Cache -->|No| Process

    L1 -->|Hit| Response
    L1 -->|Miss| L2
    L2 -->|Hit| Response
    L2 -->|Miss| L3
    L3 -->|Hit| Response
    L3 -->|Miss| Process

    Process --> Route
    Route -->|Routing| Haiku
    Route -->|Processing| Sonnet

    Haiku --> Store
    Sonnet --> Store
    Store --> Response

    style Request fill:#3b82f6,stroke:#1e40af,color:#fff
    style L1 fill:#059669,stroke:#047857,color:#fff
    style Haiku fill:#f59e0b,stroke:#d97706,color:#fff
    style Sonnet fill:#dc2626,stroke:#b91c1c,color:#fff
```

---

**Generated**: 2025-01-16
**Diagrams**: 12
**Format**: Mermaid
**Maintained by**: Bernard Orozco