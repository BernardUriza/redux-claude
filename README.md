# 🏥 Redux Claude - Sistema Médico AI de Nueva Generación

[![Deploy Status](https://api.netlify.com/api/v1/badges/your-site-id/deploy-status)](https://app.netlify.com/sites/your-site-name/deploys)

*Creado por Bernard Orozco*

## 🚀 Demo en Vivo

🌐 **[Ver Demo](https://redux-claude-medical.netlify.app)** - Experiencia médica AI en tiempo real

## 📖 Descripción

Redux Claude es una plataforma médica avanzada que combina **streaming en tiempo real**, **validación inteligente** y **arquitectura modular** para crear la experiencia médica más avanzada de 2025.

### ✨ Características Principales

- 🔄 **Streaming en tiempo real** con Claude AI
- 🛡️ **Validación médica inteligente** (150+ términos especializados)
- 📋 **Interface médica profesional** con dark mode
- 🏗️ **Arquitectura monorepo escalable**
- 📱 **Responsive design** para dispositivos médicos
- 📋 **Copy-to-clipboard** para diagnósticos

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

## 📊 Arquitectura del Sistema Completo

```mermaid
graph TB
    subgraph "🖥️ Frontend Layer"
        A[CognitiveDashboard] --> B[EnhancedMedicalMessage]
        A --> C[CognitiveAgentsPanel]
        A --> D[IterativeDiagnosticProgress]
        A --> E[UrgencyIndicator]
        A --> F[SOAPDisplay]
        A --> G[FollowUpTracker]
        A --> H[MedicalNotes]
        A --> I[RealTimeMetrics]
    end
    
    subgraph "🧠 Cognitive Core Package"
        J[useMedicalChat Hook] --> K[MedicalContentValidator]
        J --> L[DefensiveMedicineValidator]
        J --> M[UrgencyClassifier]
        K --> N[Redux Store]
        L --> N
        M --> N
        N --> O[ClaudeAdapter]
        N --> P[StreamingService]
    end
    
    subgraph "🏗️ Decision Engine"
        Q[DecisionEngineService] --> R[IterativeDiagnosticEngine]
        R --> S[SOAPProcessor]
        R --> T[SOAPResolver]
        S --> U[AdditionalInfoService]
    end
    
    subgraph "⚡ Real-time Processing"
        V[Claude API] --> W[Streaming Chunks]
        W --> X[Progressive Display]
        X --> Y[Copy to Clipboard]
    end
    
    A --> J
    J --> Q
    O --> V
    Q --> O
    W --> N
    
    style A fill:#1e293b,stroke:#3b82f6,color:#fff
    style J fill:#0f172a,stroke:#06b6d4,color:#fff
    style Q fill:#7c3aed,stroke:#5b21b6,color:#fff
    style V fill:#059669,stroke:#10b981,color:#fff
```

---

## 🛡️ Sistema de Medicina Defensiva (FASE 3)

```mermaid
flowchart TD
    A[👨‍⚕️ Input Médico] --> B[MedicalContentValidator]
    B --> C{Contenido Médico Válido?}
    
    C -->|No| D[DefensiveMedicineValidator]
    D --> E[Guía Educativa + Redirección]
    
    C -->|Sí| F[UrgencyClassifier]
    F --> G{Nivel de Urgencia}
    
    G -->|Crítico| H[🚨 PROTOCOLO EMERGENCIA]
    G -->|Alto| I[⚠️ REFERENCIA URGENTE]
    G -->|Medio| J[📋 EVALUACIÓN PRIORITARIA]
    G -->|Bajo| K[📅 SEGUIMIENTO RUTINARIO]
    
    H --> L[IterativeDiagnosticEngine]
    I --> L
    J --> L
    K --> L
    
    L --> M[SOAPProcessor]
    M --> N[SOAPResolver]
    N --> O[DecisionEngineService]
    
    O --> P[ClaudeAdapter]
    P --> Q[🤖 Claude AI Analysis]
    Q --> R[StreamingService]
    R --> S[⚡ Real-time SOAP Response]
    
    S --> T[UrgencyIndicator Display]
    S --> U[SOAPDisplay]
    S --> V[FollowUpTracker]
    S --> W[MedicalNotes]
    
    style A fill:#3b82f6,stroke:#1e40af,color:#fff
    style H fill:#dc2626,stroke:#b91c1c,color:#fff
    style I fill:#f59e0b,stroke:#d97706,color:#fff
    style L fill:#7c3aed,stroke:#5b21b6,color:#fff
    style S fill:#059669,stroke:#047857,color:#fff
```

---

## ⚡ Monorepo + Streaming Architecture

```mermaid
sequenceDiagram
    participant U as 👨‍⚕️ Usuario
    participant CD as 🖥️ CognitiveDashboard
    participant CH as 🧠 useMedicalChat Hook
    participant CC as 📦 Cognitive Core
    participant DE as 🏗️ DecisionEngine
    participant CA as 🤖 ClaudeAdapter
    participant SS as ⚡ StreamingService
    participant RS as 📚 Redux Store
    
    U->>CD: Input médico
    CD->>CH: sendMedicalQuery()
    CH->>CC: MedicalContentValidator
    
    alt Contenido Inválido
        CC->>RS: Store rejection
        RS->>CD: Display educational guide
    else Contenido Válido
        CC->>CC: UrgencyClassifier
        CC->>DE: Process with IterativeDiagnosticEngine
        DE->>CA: Send to Claude API
        
        loop Real-time Streaming
            CA->>SS: Stream chunk
            SS->>RS: Update state
            RS->>CD: Progressive display
            CD->>U: Real-time updates
        end
        
        CA->>DE: Complete analysis
        DE->>CC: SOAPProcessor + SOAPResolver
        CC->>RS: Final SOAP structure
        RS->>CD: Display complete analysis
        CD->>U: Show copy button + urgency indicators
    end
    
    Note over U,CD: 🏥 Sistema completo con medicina defensiva
```

---

## 🏗️ Estructura Monorepo Modular

```mermaid
graph TB
    subgraph "📂 Redux Claude Root"
        A[package.json<br/>Workspace Config] --> B[next.config.js<br/>Export + Netlify]
        A --> C[netlify.toml<br/>Deploy Config]
        A --> D[tsconfig.json<br/>TypeScript]
    end
    
    subgraph "📦 packages/cognitive-core"
        E[🧠 Decision Engine] --> F[🤖 ClaudeAdapter]
        F --> G[🛡️ Validators]
        G --> H[📚 Redux Store]
        H --> I[🔗 Hooks]
        
        J[🏥 SOAP Processing] --> K[📋 SOAPProcessor]
        K --> L[🔍 SOAPResolver]
        
        M[⚡ Streaming] --> N[📡 StreamingService]
        N --> O[🔄 Real-time Updates]
    end
    
    subgraph "🎨 src/components"
        P[CognitiveDashboard] --> Q[EnhancedMedicalMessage]
        P --> R[CognitiveAgentsPanel]
        P --> S[IterativeDiagnosticProgress]
        P --> T[UrgencyIndicator]
        P --> U[SOAPDisplay]
        P --> V[FollowUpTracker]
        P --> W[MedicalNotes]
        P --> X[RealTimeMetrics]
    end
    
    subgraph "🌐 Deployment"
        Y[Static Export] --> Z[Netlify CDN]
        Z --> AA[Global Distribution]
    end
    
    A --> E
    E --> P
    P --> Y
    
    style E fill:#0f172a,stroke:#06b6d4,color:#fff
    style P fill:#1e293b,stroke:#3b82f6,color:#fff
    style Y fill:#059669,stroke:#047857,color:#fff
    style Z fill:#f59e0b,stroke:#d97706,color:#fff
```

---

## 🎯 Características del Sistema

### 🛡️ **Sistema de Medicina Defensiva (FASE 3)**
- **DefensiveMedicineValidator**: Valida contenido médico profesional
- **UrgencyClassifier**: Clasifica urgencia por gravedad sobre probabilidad
- **UrgencyIndicator**: Alertas visuales críticas/altas/medias/bajas
- **ProtocoloEmergencia**: Activación automática para casos críticos

### ⚡ **Motor Iterativo + Orquestador Cognitivo**
- **IterativeDiagnosticEngine**: Procesamiento diagnóstico iterativo
- **DecisionEngineService**: Orquestación de decisiones médicas
- **SOAPProcessor + SOAPResolver**: Análisis SOAP estructurado automático
- **AdditionalInfoService**: Solicitud inteligente de información adicional

### 🧠 **Cognitive Core Package Completo**
- **useMedicalChat Hook**: Gestión completa del chat médico
- **Redux Store Médico**: Estado predictible con tipos médicos específicos
- **ClaudeAdapter**: Integración nativa con Claude AI
- **StreamingService**: Streaming en tiempo real palabra por palabra

### 📱 **Interface Médica Profesional**
- **CognitiveDashboard**: Panel principal multi-pestaña responsive
- **EnhancedMedicalMessage**: Mensajes médicos con copy-to-clipboard
- **IterativeDiagnosticProgress**: Progreso diagnóstico en tiempo real
- **CognitiveAgentsPanel**: Panel de agentes cognitivos activos
- **FollowUpTracker**: Seguimiento de recordatorios médicos
- **MedicalNotes**: Notas médicas con trazabilidad completa

### 🌐 **Deploy Production-Ready**
- **Next.js 15 Static Export**: Optimizado para Netlify
- **Monorepo Workspaces**: Gestión modular de dependencias
- **Headers de Seguridad**: CSP, CORS, XSS protection
- **Environment Variables**: Configuración segura de API keys

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

*"Acelerar el desarrollo médico 15-20x vs estimaciones tradicionales usando Claude Code y arquitectura moderna."*

**Sistema médico que redefine la interacción entre IA y medicina profesional.**

---

*🤖 Sistema optimizado para médicos latinoamericanos con streaming progresivo y validación inteligente*