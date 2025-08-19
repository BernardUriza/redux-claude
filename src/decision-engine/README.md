# Decision Engine Híbrido

## 🎯 Arquitectura de Separación de Dominios

Este Decision Engine implementa una arquitectura híbrida que separa completamente los dominios de conocimiento del middleware de infraestructura, permitiendo escalabilidad y mantenibilidad.

## 📁 Estructura

```
src/decision-engine/
├── core/
│   ├── DecisionEngine.ts     # Motor principal agnóstico al dominio
│   └── types.ts              # Interfaces y tipos base
├── domains/
│   ├── medical.ts            # ✅ Dominio médico (ACTIVO)
│   ├── psychology.ts         # 🚧 Dominio psicológico (PREPARADO)
│   └── financial.ts          # 🚧 Dominio financiero (PREPARADO)
├── providers/
│   ├── claude.ts             # ✅ Adaptador Claude API
│   └── local.ts              # ✅ Adaptador local/mock
├── DecisionEngineService.ts  # 🎯 Servicio central y API pública
└── README.md                 # Este archivo
```

## 🚀 Uso Actual (Médico)

```typescript
import { decisionEngineService } from '@/decision-engine/DecisionEngineService'

// Diagnóstico médico
const diagnosis = await decisionEngineService.makeMedicalDiagnosis(
  "Paciente presenta fiebre, tos y dolor de cabeza",
  { context: { age: 30, symptoms_duration: "3 days" } }
)

// Triage de urgencia
const triage = await decisionEngineService.makeMedicalTriage(
  "Dolor en el pecho con dificultad para respirar"
)

// Validación de tratamiento
const validation = await decisionEngineService.validateMedicalDecision(
  "Plan de tratamiento con antibióticos para neumonía"
)
```

## 🔄 Compatibilidad Total

El sistema mantiene **100% compatibilidad** con el código existente:

```typescript
// El código existente sigue funcionando sin cambios
import { callClaudeForDecision } from '@/services/decisionalMiddleware'

const result = await callClaudeForDecision(
  'diagnosis',
  input,
  'claude',
  signal,
  previousDecisions,
  context
)
// ✅ Funciona exactamente igual, pero usa la nueva arquitectura por debajo
```

## 🏗️ Beneficios de la Arquitectura

### 1. **Separación de Dominios**
- **Médico**: Diagnóstico, triage, tratamiento, validación, documentación
- **Psicología**: Evaluaciones, planes terapéuticos, crisis (preparado)
- **Financiero**: Análisis de inversión, evaluación de riesgo (preparado)

### 2. **Extensibilidad Simple**
```typescript
// Agregar nuevo dominio es trivial
const legalStrategy = new LegalStrategy()
await decisionEngineService.registerNewDomain('legal', legalStrategy)

// Usar inmediatamente
const contract = await decisionEngineService.makeDecision(
  'legal',
  'contract_review', 
  contractText
)
```

### 3. **Múltiples Providers**
- **Claude**: API principal
- **Local**: Mock para desarrollo/testing
- **Futuro**: OpenAI, Gemini, etc.

### 4. **Fallbacks Inteligentes**
- Si Claude falla → usa provider local
- Si nuevo engine falla → fallback a método legacy
- Siempre mantiene funcionamiento

## 📊 Estructura de Decisiones por Dominio

### 🏥 Médico
- `diagnosis` → `DiagnosticDecision`
- `triage` → `TriageDecision`  
- `validation` → `ValidationDecision`
- `treatment` → `TreatmentDecision`
- `documentation` → `DocumentationDecision`

### 🧠 Psicología (Futuro)
- `assessment` → `PsychologicalAssessment`
- `therapy_plan` → `TherapyPlan`
- `crisis_evaluation` → `CrisisAssessment`

### 💰 Financiero (Futuro)
- `investment_analysis` → `InvestmentAnalysis`
- `risk_assessment` → `RiskAssessment`
- `portfolio_recommendation` → `PortfolioRecommendation`

## 🔧 API del Decision Engine

### Métodos Principales

```typescript
// Genérico (cualquier dominio)
await decisionEngineService.makeDecision(
  domain: Domain,
  decisionType: string,
  input: string,
  options?: {
    provider?: Provider
    context?: Record<string, unknown>
    signal?: AbortSignal
  }
)

// Específicos médicos (convenientes)
await decisionEngineService.makeMedicalDiagnosis(input, options)
await decisionEngineService.makeMedicalTriage(input, options)
await decisionEngineService.validateMedicalDecision(input, options)
await decisionEngineService.createTreatmentPlan(input, options)
await decisionEngineService.generateDocumentation(input, options)
```

### Métodos de Sistema

```typescript
// Salud del sistema
const health = await decisionEngineService.getSystemHealth()
// → { strategies: ['medical'], providers: [{ name: 'claude', available: true }], overallHealth: true }

// Dominios disponibles
const domains = decisionEngineService.getAvailableDomains()
// → ['medical']

// Tipos soportados por dominio
const types = decisionEngineService.getSupportedDecisionTypes('medical')
// → ['diagnosis', 'triage', 'validation', 'treatment', 'documentation']
```

## 🎯 Migración y Roadmap

### ✅ Fase 1: Médico (COMPLETA)
- [x] Arquitectura base híbrida
- [x] Dominio médico completo
- [x] Compatibilidad total con código existente
- [x] Providers Claude y Local
- [x] Fallbacks y error handling

### 🚧 Fase 2: Extensión (PREPARADA)
- [ ] Activar dominio psicológico
- [ ] Activar dominio financiero
- [ ] Agregar provider OpenAI
- [ ] Testing exhaustivo multi-dominio

### 🔮 Fase 3: Futuros Dominios
- [ ] Legal (contratos, compliance)
- [ ] Técnico (code review, arquitectura)
- [ ] Business (estrategia, mercadeo)

## 🧪 Testing y Desarrollo

```typescript
// Health check completo
const healthCheck = await decisionEngineService.runHealthCheck()

// Reset para testing
decisionEngineService.reset()

// Modo desarrollo con mock
const result = await decisionEngineService.makeDecision(
  'medical',
  'diagnosis',
  input,
  { provider: 'local' } // Usa mock local
)
```

## 🎉 Características Clave

1. **🔄 Backward Compatible**: Código existente funciona sin cambios
2. **🏗️ Domain Agnostic**: Core engine no sabe de medicina, psicología, etc.
3. **🔌 Pluggable**: Fácil agregar dominios y providers
4. **🛡️ Resilient**: Múltiples layers de fallback
5. **📊 Observable**: Health checks y métricas incluidas
6. **🚀 Performant**: Lazy loading y optimizaciones incluidas

---

**Desarrollado por Bernard Orozco**  
*Arquitectura híbrida para escalabilidad y mantenibilidad*