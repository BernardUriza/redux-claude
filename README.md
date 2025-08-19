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
    subgraph "🏥 Frontend Medical UI"
        A[CognitiveDashboard] --> B[MedicalMessage Component]
        B --> C[Streaming Display]
        C --> D[Copy to Clipboard]
    end
    
    subgraph "🧠 Cognitive Core Engine"
        E[useMedicalChat Hook] --> F[MedicalValidator]
        F --> G[Redux Store]
        G --> H[ClaudeAdapter]
    end
    
    subgraph "🛡️ Validation Layer"
        I[Input Analysis] --> J{Medical Content?}
        J -->|Yes| K[Process Medical Case]
        J -->|No| L[Educational Rejection]
    end
    
    subgraph "⚡ Claude Streaming"
        M[SystemPrompt] --> N[Claude SDK]
        N --> O[Real-time Chunks]
        O --> P[Progressive Display]
    end
    
    A --> E
    E --> I
    K --> M
    O --> G
    H --> N
    
    style A fill:#1e293b,stroke:#3b82f6,color:#fff
    style E fill:#0f172a,stroke:#06b6d4,color:#fff
    style F fill:#dc2626,stroke:#ef4444,color:#fff
    style N fill:#059669,stroke:#10b981,color:#fff
```

---

## 🔄 Flujo de Validación Médica Inteligente

```mermaid
flowchart TD
    A[👨‍⚕️ Doctor Input] --> B{📝 Length > 10 chars?}
    B -->|No| C[❌ Too Short]
    B -->|Yes| D{🚫 Non-Medical Pattern?}
    
    D -->|Yes| E[❌ Reject: Programming/Entertainment/etc]
    D -->|No| F{🏥 Medical Terms Found?}
    
    F -->|No| G[❌ Insufficient Medical Context]
    F -->|Yes| H{👤 Age/Gender Context?}
    
    H -->|No| I{📋 Clinical Structure?}
    H -->|Yes| J[✅ Valid Medical Case]
    
    I -->|No| K[⚠️ Needs More Context]
    I -->|Yes| J
    
    C --> L[📚 Educational Response]
    E --> M[🔄 Redirect to Medical Focus]
    G --> N[📝 Format Guidance]
    K --> O[👥 Demographic Request]
    J --> P[🚀 Process with Claude AI]
    
    L --> Q[💡 Show Example Format]
    M --> R[🎯 Medical Domain Only]
    N --> S[📋 Clinical Structure Guide]
    O --> T[🏥 Complete Case Template]
    P --> U[⚡ Real-time Streaming Response]
    
    style A fill:#3b82f6,stroke:#1e40af,color:#fff
    style J fill:#059669,stroke:#047857,color:#fff
    style P fill:#7c3aed,stroke:#5b21b6,color:#fff
    style U fill:#f59e0b,stroke:#d97706,color:#fff
```

---

## ⚡ Streaming Architecture en Tiempo Real

```mermaid
sequenceDiagram
    participant D as 👨‍⚕️ Doctor
    participant UI as 🖥️ Frontend
    participant V as 🛡️ Validator
    participant R as 📚 Redux Store
    participant C as 🤖 Claude SDK
    participant S as 📺 Streaming Display
    
    D->>UI: Submit Medical Case
    UI->>V: Validate Content
    
    alt Invalid Medical Content
        V->>R: Store Rejection Message
        R->>S: Display Educational Guide
    else Valid Medical Case
        V->>R: Create Empty Assistant Message
        R->>UI: Show Streaming Indicator
        
        UI->>C: Send to Claude SDK
        Note over C: Processing Medical Analysis
        
        loop Real-time Streaming
            C->>R: Stream Chunk
            R->>S: Update Message Content
            S->>D: Progressive Display
        end
        
        C->>R: Complete Streaming
        R->>S: Final Medical Analysis
        S->>D: Show Copy Button
    end
    
    Note over D,S: 🏥 Complete Medical Evaluation with Copy-to-Clipboard
```

---

## 🏗️ Arquitectura Monorepo Modular

```mermaid
graph LR
    subgraph "📦 Root Workspace"
        A[package.json] --> B[next.config.js]
        B --> C[tsconfig.json]
    end
    
    subgraph "🧠 packages/cognitive-core"
        D[DecisionEngine] --> E[ClaudeAdapter]
        E --> F[MedicalValidator]
        F --> G[Redux Store]
        G --> H[useMedicalChat Hook]
    end
    
    subgraph "🎨 src/components"
        I[CognitiveDashboard] --> J[MedicalMessage]
        J --> K[Dark Mode Theme]
    end
    
    subgraph "🔧 Core Features"
        L[Real-time Streaming] --> M[Medical Validation]
        M --> N[Copy to Clipboard]
        N --> O[Professional UI/UX]
    end
    
    subgraph "🚀 Output"
        P[Medical Analysis] --> Q[Diagnostic Reports]
        Q --> R[Treatment Plans]
        R --> S[Copy-Ready Format]
    end
    
    A --> D
    D --> I
    I --> L
    L --> P
    
    style D fill:#0f172a,stroke:#06b6d4,color:#fff
    style I fill:#1e293b,stroke:#3b82f6,color:#fff
    style L fill:#7c3aed,stroke:#5b21b6,color:#fff
    style P fill:#059669,stroke:#047857,color:#fff
```

---

## 🎯 Características Revolucionarias

### ⚡ **Streaming en Tiempo Real**
- Respuestas médicas generándose palabra por palabra
- Claude SDK integrado con streaming nativo
- Actualizaciones progresivas en Redux
- Experiencia médica inmersiva

### 🛡️ **Validación Médica Inteligente**
- 150+ términos médicos especializados
- Detección automática de consultas no médicas
- Mensajes educativos para redirección
- Mantiene foco profesional exclusivo

### 📋 **UX Médica Profesional**
- Botón copiar diagnósticos al portapapeles
- Dark mode médico corporativo 2025
- Componentes modulares y reutilizables
- Indicadores de streaming en tiempo real

### 🏗️ **Arquitectura Escalable**
- Monorepo con workspaces de Next.js 15
- Principios SOLID aplicados rigurosamente
- TypeScript con tipos médicos específicos
- Redux Toolkit para estado predictible

---

## 🚀 Tecnologías de Vanguardia

- **Next.js 15** - Framework React de última generación
- **Claude SDK** - IA médica con streaming nativo
- **Redux Toolkit** - Gestión de estado profesional
- **TypeScript** - Tipado fuerte para seguridad médica
- **Tailwind CSS** - Diseño médico responsivo
- **React Markdown** - Renderizado de diagnósticos
- **Monorepo Architecture** - Modularidad empresarial

---

## 🏥 Casos de Uso Médico

✅ **Análisis de Casos Clínicos Complejos**  
✅ **Diagnósticos Diferenciales en Tiempo Real**  
✅ **Planes Terapéuticos Estructurados**  
✅ **Evaluaciones Psicológicas y Psiquiátricas**  
✅ **Documentación SOAP Automatizada**  
✅ **Educación Médica Interactiva**

---

## 🎭 Por Bernard Orozco

*"Acelerar el desarrollo médico 15-20x vs estimaciones tradicionales usando Claude Code y arquitectura moderna."*

**Sistema médico que redefine la interacción entre IA y medicina profesional.**

---

*🤖 Sistema optimizado para médicos latinoamericanos con streaming progresivo y validación inteligente*