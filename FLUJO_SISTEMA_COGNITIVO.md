# Flujo del Sistema Cognitivo Médico AI - Bernard Orozco

## 📋 Descripción General

Este sistema es una plataforma de IA médica cognitiva que procesa conversaciones entre doctores y pacientes para proporcionar análisis médico avanzado, diagnósticos diferenciales, clasificación de urgencia y planes de tratamiento mediante un sistema multi-agente orquestado.

## 🔄 Flujo Principal: Entrada del Doctor

```mermaid
flowchart TB
    Start([Doctor ingresa conversación]) --> Input[Input en CognitiveDashboard]
    Input --> Hook[useCognitiveChat Hook]
    Hook --> AddUserMsg[Agregar mensaje usuario al chat]
    AddUserMsg --> Process[processCognitively AsyncThunk]
    
    Process --> CO[CognitiveOrchestrator]
    CO --> UpdateMem[Actualizar Memoria Contextual]
    UpdateMem --> Pipeline[Análisis de Pipeline Adaptativo]
    Pipeline --> Agents[Selección de Agentes Óptimos]
    
    Agents --> Execute{Tipo de Ejecución}
    Execute -->|Pipeline Custom| CustomPipe[Pipeline Personalizado]
    Execute -->|Estándar| MultiAgent[MultiAgentOrchestrator]
    
    CustomPipe --> Results[Decisiones de Agentes]
    MultiAgent --> Results
    
    Results --> Learning[Aprendizaje por Refuerzo]
    Learning --> Consensus[Sistema de Consenso]
    Consensus --> Meta[Actualizar Metacognición]
    Meta --> Insights[Generar Insights]
    
    Insights --> Response[Generar Respuesta Coherente]
    Response --> Display[Mostrar en Dashboard]
    
    style Start fill:#e1f5fe
    style CO fill:#fff3e0
    style Display fill:#c8e6c9
```

## 🧠 Sistema de Memoria Contextual

```mermaid
flowchart LR
    subgraph Memoria[Sistema de Memoria Contextual]
        STM[Memoria a Corto Plazo]
        WM[Memoria de Trabajo]
        EM[Memoria Episódica]
        SI[Insights Semánticos]
        
        STM -->|Contexto Actual| WM
        WM -->|Hipótesis Activas| EM
        EM -->|Patrones| SI
    end
    
    Input([Entrada Doctor]) --> STM
    SI --> Decision([Decisiones Informadas])
    
    style Memoria fill:#f3e5f5
```

## 🤖 Arquitectura Multi-Agente

```mermaid
flowchart TB
    subgraph Orquestador[MultiAgentOrchestrator]
        direction TB
        CB[Circuit Breaker Check]
        CB --> Phase1[Fase 1: Agentes Críticos]
        Phase1 --> Phase2[Fase 2: Análisis Primario]
        Phase2 --> Phase3[Fase 3: Agentes Secundarios]
    end
    
    subgraph Agentes[Agentes Especializados]
        Triage[🚨 Triage<br/>Prioridad: 1]
        Diagnostic[🔍 Diagnóstico<br/>Prioridad: 1]
        Validation[✅ Validación<br/>Prioridad: 3]
        Treatment[💊 Tratamiento<br/>Prioridad: 4]
        Documentation[📝 Documentación<br/>Prioridad: 5]
    end
    
    Phase1 --> Triage
    Phase2 --> Diagnostic
    Phase2 --> Validation
    Phase3 --> Treatment
    Phase3 --> Documentation
    
    Triage --> Results[Resultados JSON]
    Diagnostic --> Results
    Validation --> Results
    Treatment --> Results
    Documentation --> Results
    
    style Orquestador fill:#e8f5e9
    style Agentes fill:#fff9c4
```

## 🎯 Sistema de Consenso y Votación

```mermaid
flowchart LR
    subgraph Consenso[Sistema de Consenso]
        Voting[Votación Multi-Agente]
        Debate[Debates Activos]
        Resolution[Resolución de Conflictos]
        Final[Decisión Final]
        
        Voting -->|Desacuerdo| Debate
        Voting -->|Acuerdo| Final
        Debate --> Resolution
        Resolution --> Final
    end
    
    Decisions([Decisiones de Agentes]) --> Voting
    Final --> Output([Consenso Médico])
    
    style Consenso fill:#e1f5fe
```

## 📊 Pipeline Adaptativo

```mermaid
flowchart TB
    subgraph Pipeline[Pipeline Adaptativo]
        Context[Análisis de Contexto]
        Context --> Type{Tipo de Contexto}
        
        Type -->|Emergencia| Emergency[Pipeline de Emergencia]
        Type -->|Diagnóstico| Diagnostic[Pipeline Diagnóstico]
        Type -->|Tratamiento| Treatment[Pipeline Tratamiento]
        Type -->|Rutina| Routine[Pipeline Rutina]
        
        Emergency --> Config1[Triage → Diagnostic → Treatment]
        Diagnostic --> Config2[Diagnostic → Validation → Documentation]
        Treatment --> Config3[Treatment → Validation → Documentation]
        Routine --> Config4[Documentation → Validation]
    end
    
    Input([Entrada]) --> Context
    Config1 --> Execution([Ejecución])
    Config2 --> Execution
    Config3 --> Execution
    Config4 --> Execution
    
    style Pipeline fill:#fff3e0
```

## 🔄 Ciclo de Aprendizaje por Refuerzo

```mermaid
flowchart LR
    subgraph Learning[Sistema de Aprendizaje]
        Performance[Métricas de Rendimiento]
        Rewards[Cálculo de Recompensas]
        Update[Actualizar Prioridades]
        Exploration[Exploración vs Explotación]
        
        Performance --> Rewards
        Rewards --> Update
        Update --> Exploration
        Exploration --> Performance
    end
    
    Results([Resultados de Agentes]) --> Performance
    Exploration --> NextDecision([Próximas Decisiones])
    
    style Learning fill:#f3e5f5
```

## 🧭 Sistema de Metacognición

```mermaid
flowchart TB
    subgraph Metacognition[Sistema Metacognitivo]
        Assessment[Auto-evaluación]
        Confidence[Confianza del Sistema]
        Gaps[Identificar Gaps de Conocimiento]
        Goals[Gestión de Objetivos]
        Calibration[Calibración del Sistema]
        
        Assessment --> Confidence
        Assessment --> Gaps
        Gaps --> Goals
        Confidence -->|Baja| Calibration
        Goals --> Calibration
    end
    
    Timer([Ciclo cada 30s]) --> Assessment
    Calibration --> SystemUpdate([Actualización del Sistema])
    
    style Metacognition fill:#e8f5e9
```

## 📈 Flujo de Respuesta al Doctor

```mermaid
flowchart TB
    subgraph ResponseGen[Generación de Respuesta]
        Analysis[Análisis de Resultados]
        Analysis --> Format{Formato de Respuesta}
        
        Format --> Consensus[Consenso Alcanzado]
        Format --> Diagnosis[Evaluación Diagnóstica]
        Format --> Triage[Clasificación de Urgencia]
        Format --> Treatment[Plan de Tratamiento]
        Format --> Insights[Insights del Sistema]
        
        Consensus --> Markdown[Formateo Markdown]
        Diagnosis --> Markdown
        Triage --> Markdown
        Treatment --> Markdown
        Insights --> Markdown
    end
    
    CognitiveResults([Resultados Cognitivos]) --> Analysis
    Markdown --> ChatMessage([Mensaje en Chat])
    
    style ResponseGen fill:#fff9c4
```

## 🛡️ Sistema de Circuit Breaker

```mermaid
stateDiagram-v2
    [*] --> Closed: Sistema Inicia
    
    Closed --> Open: Fallas > Threshold
    Closed --> Closed: Éxito
    
    Open --> HalfOpen: Timeout de Enfriamiento
    
    HalfOpen --> Closed: Éxito
    HalfOpen --> Open: Falla
    
    Open --> [*]: Agente Deshabilitado
    
    note right of Open
        Agente no disponible
        Espera enfriamiento
    end note
    
    note right of HalfOpen
        Prueba de recuperación
        Un intento permitido
    end note
    
    note right of Closed
        Operación normal
        Monitoreo activo
    end note
```

## 🎨 Interfaz de Usuario (Dashboard)

```mermaid
flowchart TB
    subgraph Dashboard[CognitiveDashboard Component]
        Metrics[Métricas de Salud]
        Status[Panel de Estado]
        Chat[Panel de Chat]
        Results[Panel de Resultados]
        
        Metrics --> Display
        Status --> Display
        Chat --> Display
        Results --> Display
        
        Display[Renderizado React]
    end
    
    Input([Input del Doctor]) --> Chat
    CognitiveOutput([Salida Cognitiva]) --> Results
    SystemHealth([Salud del Sistema]) --> Metrics
    SystemState([Estado del Sistema]) --> Status
    
    style Dashboard fill:#e1f5fe
```

## 📊 Métricas del Sistema

```mermaid
flowchart LR
    subgraph Metrics[Métricas en Tiempo Real]
        Confidence[Confianza Sistema: 0-100%]
        Health[Salud General: 0-100%]
        Consensus[Tasa de Consenso: 0-100%]
        Latency[Latencia Promedio: ms]
        Memory[Carga de Memoria: 0-100%]
        Learning[Progreso Aprendizaje: 0-100%]
    end
    
    System([Sistema Cognitivo]) --> Metrics
    Metrics --> UI([Visualización UI])
    
    style Metrics fill:#c8e6c9
```

## 🔧 Tecnologías Utilizadas

- **Frontend**: React, Next.js, TypeScript
- **Estado**: Redux Toolkit
- **Estilos**: Tailwind CSS
- **IA**: Claude API (Anthropic)
- **Arquitectura**: Multi-Agente con Orquestación Cognitiva
- **Patrones**: Circuit Breaker, Consenso, Aprendizaje por Refuerzo

## 📌 Características Clave

1. **Procesamiento Cognitivo**: Sistema multi-capa con memoria, aprendizaje y metacognición
2. **Agentes Especializados**: 5 agentes médicos con roles específicos
3. **Pipeline Adaptativo**: Se ajusta según el contexto médico
4. **Sistema de Consenso**: Resolución de conflictos entre agentes
5. **Aprendizaje Continuo**: Mejora con cada interacción
6. **Circuit Breaker**: Protección contra fallas de agentes
7. **Memoria Contextual**: Mantiene contexto entre conversaciones
8. **Metacognición**: Auto-evaluación y calibración del sistema

## 🚀 Flujo de Uso Típico

1. **Doctor ingresa conversación** → Describe síntomas del paciente
2. **Sistema analiza contexto** → Determina urgencia y tipo de caso
3. **Agentes se activan** → Según prioridad y disponibilidad
4. **Procesamiento paralelo** → Múltiples análisis simultáneos
5. **Consenso médico** → Integración de todas las perspectivas
6. **Respuesta estructurada** → Diagnóstico, urgencia, tratamiento
7. **Aprendizaje** → Sistema mejora para próximas consultas

---

*Sistema Cognitivo Médico AI v2.0 - Desarrollado por Bernard Orozco*