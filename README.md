# 🏥 Redux Claude - Plataforma Médica AI Enterprise

[![Deploy Status](https://api.netlify.com/api/v1/badges/your-site-id/deploy-status)](https://app.netlify.com/sites/your-site-name/deploys)

_Arquitectura SOLID por Bernard Orozco_

## 🚀 Demo en Vivo

🌐 **[Ver Demo](https://redux-claude-medical.netlify.app)** - Sistema médico con
contexto persistente

## 📖 Descripción

Redux Claude es una **plataforma médica enterprise-grade** que combina
**arquitectura SOLID**, **contexto persistente** y **13 agentes especializados**
para crear el sistema médico AI más avanzado de 2025.

### ✨ Características Enterprise

- 🧠 **Contexto médico persistente** - Historial completo entre consultas
- 🤖 **Autocompletado médico inteligente** - Templates SOAP estructurados
- 🛡️ **Medicina defensiva integrada** - Priorización por gravedad
- 🏗️ **Arquitectura SOLID escalable** - 13 agentes especializados
- ⚡ **Streaming en tiempo real** - Respuestas progresivas con Claude AI
- 📱 **Interface médica profesional** - Diseño responsive enterprise
- 🔧 **Circuit breakers y métricas** - Monitoreo en tiempo real

## 🚀 Inicio Rápido

### 📋 Prerrequisitos

- Node.js 18+
- npm o yarn
- Claude API Key (Anthropic)

### ⚡ Instalación

```bash
# Clonar el repositorio
git clone https://github.com/BernardUriza/redux-claude.git
cd redux-claude

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Edita .env.local con tu ANTHROPIC_API_KEY
```

### 🔑 Variables de Entorno

```bash
# .env.local
ANTHROPIC_API_KEY=your_claude_api_key_here
NEXT_PUBLIC_APP_NAME="Redux Claude Medical"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

### 🏃‍♂️ Ejecutar en Desarrollo

```bash
# Construir el core package
npm run build:core

# Iniciar servidor de desarrollo
npm run dev
```

Visita [http://localhost:3000](http://localhost:3000) para ver la aplicación.

### 🏗️ Build para Producción

```bash
# Build completo
npm run build

# Iniciar servidor de producción
npm start
```

## 🌐 Despliegue en Netlify

### Método 1: Desde GitHub (Recomendado)

1. **Conecta tu repositorio:**
   - Ve a [Netlify](https://netlify.com)
   - Haz clic en "New site from Git"
   - Conecta tu repositorio de GitHub

2. **Configuración de Build:**

   ```
   Build command: npm run build
   Publish directory: .next
   ```

3. **Variables de Entorno:**
   - `ANTHROPIC_API_KEY`: Tu Claude API key
   - `NEXT_PUBLIC_APP_NAME`: "Redux Claude Medical"

### Método 2: Deploy Manual

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Build y deploy
npm run build
netlify deploy --prod --dir=.next
```

### 🔧 Configuración Netlify

El proyecto incluye configuración automática para Netlify con soporte para:

- ✅ Next.js 15 con App Router
- ✅ Monorepo con workspaces
- ✅ Variables de entorno
- ✅ Redirects para SPA
- ✅ Headers de seguridad

---

## 📊 Arquitectura SOLID Enterprise

```mermaid
graph TB
    subgraph "🖥️ Presentation Layer"
        A[CognitiveDashboard] --> B[MedicalAutocompletion]
        A --> C[CognitiveAgentsPanel]
        A --> D[SOAPDisplay]
        A --> E[RealTimeMetrics]
        B --> F[AutocompletionTemplates]
        C --> G[13 Specialized Agents]
    end

    subgraph "🧠 Business Logic (SOLID)"
        H[useMedicalChat] --> I[MedicalAutocompletionService]
        H --> J[DecisionalMiddleware]
        I --> J
        J --> K[AgentRegistry - 13 Agents]
        J --> L[CircuitBreakers]
        K --> M[ClaudeAdapter with Context]
    end

    subgraph "📊 State Management"
        N[Redux Store] --> O[Medical Context History]
        N --> P[Agent Status & Metrics]
        N --> Q[Streaming State]
        O --> M
        H --> N
    end

    subgraph "🔄 Context & Streaming"
        M --> R[Claude API with History]
        R --> S[Conversation Context]
        R --> T[Progressive Streaming]
        S --> O
        T --> Q
    end

    A --> H
    H --> N
    N --> M
    M --> R

    style A fill:#1e293b,stroke:#3b82f6,color:#fff
    style J fill:#7c3aed,stroke:#5b21b6,color:#fff
    style N fill:#059669,stroke:#10b981,color:#fff
    style R fill:#dc2626,stroke:#b91c1c,color:#fff
```

---

## 🛡️ Flujo de Medicina Defensiva + Autocompletado

```mermaid
flowchart TD
    A[👨‍⚕️ Input Médico] --> B[MedicalContentValidator]
    B --> C{Contenido Médico Válido?}

    C -->|No| D[Autocompletado Inteligente]
    D --> E[🤖 MedicalAutocompletionService]
    E --> F[DecisionalMiddleware]
    F --> G[3 Templates SOAP]
    G --> H[Usuario Selecciona Template]
    H --> A

    C -->|Sí| I[Context History Manager]
    I --> J[Redux Store + Conversation]
    J --> K[UrgencyClassifier]
    K --> L{Nivel de Urgencia}

    L -->|Crítico| M[🚨 PROTOCOLO EMERGENCIA]
    L -->|Alto| N[⚠️ REFERENCIA URGENTE]
    L -->|Medio| O[📋 EVALUACIÓN PRIORITARIA]
    L -->|Bajo| P[📅 SEGUIMIENTO RUTINARIO]

    M --> Q[13 Agentes Especializados]
    N --> Q
    O --> Q
    P --> Q

    Q --> R[DecisionalMiddleware SOLID]
    R --> S[ClaudeAdapter + Context]
    S --> T[🤖 Claude AI + History]
    T --> U[Streaming Response]
    U --> V[⚡ Real-time SOAP]

    V --> W[Context Update]
    W --> J
    V --> X[UI Components]

    style A fill:#3b82f6,stroke:#1e40af,color:#fff
    style E fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style M fill:#dc2626,stroke:#b91c1c,color:#fff
    style Q fill:#059669,stroke:#047857,color:#fff
    style T fill:#f59e0b,stroke:#d97706,color:#fff
```

---

## ⚡ Flujo SOLID + Contexto Persistente

```mermaid
sequenceDiagram
    participant U as 👨‍⚕️ Usuario
    participant CD as 🖥️ CognitiveDashboard
    participant AS as 🤖 AutocompletionService
    participant DM as 🏗️ DecisionalMiddleware
    participant CH as 🧠 ContextHistoryManager
    participant RS as 📚 Redux Store
    participant CA as ⚕️ ClaudeAdapter
    participant API as 🔥 Claude API

    U->>CD: Input médico incompleto
    CD->>AS: generateCompletionSuggestions()
    AS->>DM: callClaudeForDecision('medical_autocompletion')
    DM->>CH: getConversationHistory()
    CH->>RS: messages.slice(-10)
    RS-->>CH: conversationHistory[]
    CH-->>DM: history context
    DM->>CA: makeRequest(prompt + history)
    CA->>API: messages: [...history, newInput]
    API-->>CA: 3 SOAP templates
    CA-->>DM: structured response
    DM-->>AS: MedicalAutocompletionDecision
    AS-->>CD: suggestions[]
    CD->>U: Modal con 3 opciones

    U->>CD: Selecciona template + datos
    CD->>CH: sendMedicalQuery(completedInput)
    CH->>RS: updateConversationHistory()
    CH->>DM: processWithContext()
    DM->>CA: requestWithFullHistory()
    CA->>API: complete conversation context

    loop Streaming Contextual
        API-->>CA: chunk with context awareness
        CA-->>RS: updateStreamingState()
        RS-->>CD: progressive display
        CD-->>U: real-time SOAP response
    end

    Note over U,CD: 🧠 Contexto médico preservado entre consultas
```

---

## 🏗️ Arquitectura SOLID Enterprise

```mermaid
graph TB
    subgraph "📂 Monorepo Workspace"
        A[package.json<br/>Workspace + Scripts] --> B[next.config.js<br/>Static Export]
        A --> C[netlify.toml<br/>Production Deploy]
        A --> D[tsconfig.json<br/>Strict TypeScript]
    end

    subgraph "🧠 Cognitive Core (SOLID)"
        E[📋 AgentRegistry<br/>13 Specialists] --> F[🔧 DecisionalMiddleware<br/>SOLID Pattern]
        F --> G[🤖 MedicalAutocompletionService<br/>Refactored]
        F --> H[⚕️ ClaudeAdapter<br/>Context Manager]
        H --> I[📚 Redux Store<br/>State + History]
        I --> J[🔗 useMedicalChat<br/>Context Hook]

        K[🛡️ Circuit Breakers] --> L[📊 Agent Metrics]
        K --> M[⚡ Streaming Service]
        M --> N[🔄 Real-time Context]
    end

    subgraph "🎨 Enterprise UI"
        O[CognitiveDashboard] --> P[MedicalAutocompletion<br/>Template Modal]
        O --> Q[CognitiveAgentsPanel<br/>13 Agents Status]
        O --> R[SOAPDisplay<br/>Structured Output]
        O --> S[RealTimeMetrics<br/>System Monitor]
        P --> T[3 SOAP Templates<br/>Editable Fields]
    end

    subgraph "🌐 Production Ready"
        U[Static Build] --> V[Netlify Edge]
        V --> W[Global CDN]
        W --> X[Security Headers]
    end

    A --> E
    E --> O
    O --> U

    style E fill:#7c3aed,stroke:#5b21b6,color:#fff
    style F fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style O fill:#1e293b,stroke:#3b82f6,color:#fff
    style U fill:#059669,stroke:#047857,color:#fff
```

---

## 🎯 Características Enterprise

### 🧠 **Contexto Médico Persistente (NUEVO)**

- **ConversationHistoryManager**: Mantiene contexto completo entre consultas
- **ClaudeAdapter + Context**: Envía historial completo a Claude API
- **Redux Store Integration**: Fuente única de verdad para conversaciones
- **convertReduxMessagesToClaudeFormat**: Transformación automática de contexto

### 🤖 **Autocompletado Médico Inteligente (NUEVO)**

- **MedicalAutocompletionService**: Refactorizado con patrón SOLID
- **DecisionalMiddleware Integration**: Reutiliza arquitectura existente
- **3 Templates SOAP**: Básico, Detallado y Especializado automáticos
- **Detección de Especialidades**: Inferencia inteligente de contexto médico

### 🏗️ **Arquitectura SOLID Enterprise**

- **13 Agentes Especializados**: Registry unificado con circuit breakers
- **Single Responsibility**: Cada servicio tiene una función específica
- **Dependency Inversion**: Interfaces abstractas sobre implementaciones
- **Open/Closed**: Sistema extensible sin modificar código base

### 🛡️ **Sistema de Medicina Defensiva Avanzado**

- **UrgencyClassifier**: Priorización por gravedad médica real
- **DefensiveMedicineValidator**: Validación profesional automática
- **Circuit Breakers**: Protección contra fallos de agentes
- **Fallback Systems**: Templates y respuestas de emergencia

### 📊 **Monitoreo y Métricas en Tiempo Real**

- **AgentMetrics**: Métricas individuales por especialista
- **RealTimeMetrics**: Dashboard con estado del sistema
- **Performance Tracking**: Latencia y confianza por agente
- **Health Monitoring**: Estado global de 13 agentes especializados

---

## 🚀 Stack Tecnológico

### 🏗️ **Framework & Build**

- **Next.js 15** con App Router y Static Export
- **TypeScript 5.9** con tipos médicos específicos
- **Monorepo Workspaces** para arquitectura modular
- **Netlify** deployment con headers de seguridad

### 🧠 **AI & Cognitive**

- **@anthropic-ai/sdk** - Claude AI con streaming nativo
- **Custom Decision Engine** - Motor de decisiones médicas
- **Defensive Medicine System** - Medicina defensiva integrada
- **SOAP Processing Engine** - Análisis SOAP automático

### 📊 **State Management**

- **Redux Toolkit** con middleware médico personalizado
- **React-Redux** para conectores de componentes
- **Streaming State Updates** - Actualizaciones en tiempo real
- **Medical Chat Slice** - Estado específico para medicina

### 🎨 **UI/UX Framework**

- **Tailwind CSS v4** con Lightning CSS
- **React Markdown** para renderizado de diagnósticos
- **Corporate Medical Theme** - Diseño médico profesional 2025
- **Responsive Mobile-First** - Optimizado para dispositivos médicos

### 🔧 **Development Tools**

- **Workspace Configuration** - npm workspaces
- **TypeScript Build Pipeline** - Transpilación automática
- **ESLint + Prettier** - Calidad de código médico
- **Hot Reload Development** - Desarrollo iterativo rápido

---

## 🏥 Casos de Uso Implementados

### 🛡️ **Medicina Defensiva**

✅ **Clasificación Automática de Urgencias** - Sistema de triage inteligente  
✅ **Protocolos de Emergencia** - Activación automática para casos críticos  
✅ **Diagnósticos por Gravedad** - Priorización defensiva sobre probabilidad  
✅ **Alertas Visuales Médicas** - Indicadores críticos/altos/medios/bajos

### 📋 **Análisis SOAP Estructurado**

✅ **SOAP Automático** - Procesamiento completo de casos médicos  
✅ **Documentación Médica** - Generación automática de notas clínicas  
✅ **Seguimiento de Pacientes** - Recordatorios y notas con trazabilidad  
✅ **Copy-to-Clipboard** - Exportación directa de diagnósticos

### 🧠 **Motor Cognitivo Avanzado**

✅ **Diagnósticos Iterativos** - Procesamiento en múltiples ciclos  
✅ **Análisis en Tiempo Real** - Streaming progresivo de respuestas  
✅ **Orquestación de Agentes** - Panel de agentes cognitivos coordinados  
✅ **Validación Médica Inteligente** - Filtros profesionales automáticos

### 📱 **Interface Médica Corporativa**

✅ **Dashboard Responsivo** - Multi-pestaña optimizado para medicina  
✅ **Métricas en Tiempo Real** - Monitoreo del sistema cognitivo  
✅ **Dark Mode Médico** - Tema profesional corporativo 2025  
✅ **Mobile-First Design** - Optimizado para dispositivos médicos

---

## 🎭 Por Bernard Orozco

_"Acelerar el desarrollo médico 15-20x vs estimaciones tradicionales usando
Claude Code y arquitectura moderna."_

**Sistema médico que redefine la interacción entre IA y medicina profesional.**

---

_🤖 Sistema optimizado para médicos latinoamericanos con streaming progresivo y
validación inteligente_
