# Decision Engine Architecture Refactoring

## Overview

This document outlines the refactoring of the decisional middleware architecture to separate concerns properly and create a domain-agnostic decision engine.

## New Architecture

### Core Components

1. **Core Decision Engine** (`/src/engines/core/DecisionEngine.ts`)
   - Completely domain-agnostic
   - Handles API calls and generic decision flow
   - Manages retries, fallbacks, and provider switching
   - Supports caching and metrics

2. **Decision Strategies** (`/src/engines/strategies/`)
   - Domain-specific logic (medical, legal, financial, etc.)
   - Encapsulates prompts, validation, and confidence calculation
   - Pluggable architecture for easy extension

3. **Provider Adapters** (`/src/engines/providers/`)
   - API-specific implementations (Claude, OpenAI, Local)
   - Abstracted API calls with error handling
   - Health monitoring and usage tracking

### File Structure

```
src/
├── engines/
│   ├── core/
│   │   ├── DecisionEngine.ts              # Core domain-agnostic engine
│   │   ├── interfaces/
│   │   │   ├── IDecisionStrategy.ts       # Strategy interface
│   │   │   ├── IProviderAdapter.ts        # Provider interface
│   │   │   └── IDecisionTypes.ts          # Base decision types
│   │   └── types/
│   │       ├── CoreDecisionTypes.ts       # Generic decision structures
│   │       └── EngineTypes.ts             # Engine-specific types
│   ├── strategies/
│   │   ├── medical/
│   │   │   ├── MedicalDecisionStrategy.ts # Medical domain strategy
│   │   │   ├── MedicalPrompts.ts          # Medical prompts
│   │   │   ├── MedicalValidation.ts       # Medical validation
│   │   │   └── MedicalTypes.ts            # Medical decision types
│   │   ├── legal/                         # Future legal domain
│   │   └── financial/                     # Future financial domain
│   └── providers/
│       ├── ClaudeAdapter.ts               # Claude API adapter
│       ├── OpenAIAdapter.ts               # OpenAI API adapter
│       └── LocalAdapter.ts                # Local/mock adapter
└── services/
    ├── DecisionEngineService.ts           # Service layer
    └── decisionalMiddleware.ts            # Backward compatibility wrapper
```

## Migration Path

### Phase 1: Backward Compatibility (COMPLETED)

- ✅ Original API remains unchanged
- ✅ Existing code continues to work without modifications
- ✅ New architecture runs underneath
- ✅ Medical domain logic extracted to strategy

### Phase 2: Gradual Migration (RECOMMENDED)

#### Option A: Use New API Directly

```typescript
import { decisionEngineService } from '@/services/DecisionEngineService'

// New API usage
const response = await decisionEngineService.makeDecision(
  'medical',      // domain
  'diagnosis',    // decision type
  userInput,      // input
  {
    provider: 'claude',
    context: additionalContext,
    signal: abortSignal
  }
)
```

#### Option B: Use Migration Helper

```typescript
import { makeDecisionWithNewEngine } from '@/services/decisionalMiddleware'

// Migration helper
const response = await makeDecisionWithNewEngine(
  'medical',
  'diagnosis',
  userInput,
  { provider: 'claude', context: additionalContext }
)
```

#### Option C: Keep Original API (No Changes Required)

```typescript
import { callClaudeForDecision } from '@/services/decisionalMiddleware'

// Original API - still works
const response = await callClaudeForDecision(
  'diagnosis',
  userInput,
  'claude',
  signal,
  previousDecisions,
  context
)
```

### Phase 3: New Domains (FUTURE)

Adding new domains is now trivial:

```typescript
// 1. Create domain types
// src/engines/strategies/legal/LegalTypes.ts

// 2. Create domain strategy  
// src/engines/strategies/legal/LegalDecisionStrategy.ts

// 3. Register strategy
decisionEngineService.registerStrategy('legal', legalStrategy)

// 4. Use immediately
const response = await decisionEngineService.makeDecision(
  'legal',
  'contract_review',
  contractText
)
```

## Benefits

### 1. Separation of Concerns
- **Core Engine**: Generic decision logic
- **Strategies**: Domain-specific knowledge
- **Adapters**: Provider-specific implementations

### 2. Extensibility
- Easy to add new domains (legal, financial, etc.)
- Easy to add new providers (Gemini, Azure OpenAI, etc.)
- Pluggable architecture

### 3. Maintainability
- Clear boundaries between components
- Type-safe interfaces
- Single responsibility principle

### 4. Backward Compatibility
- Existing code works without changes
- Gradual migration possible
- No breaking changes

### 5. Enhanced Features
- Automatic retries with exponential backoff
- Provider fallback chains
- Health monitoring
- Usage metrics
- Caching support
- Enhanced error handling

## Configuration

### Engine Configuration

```typescript
const config = {
  defaultProvider: 'claude',
  fallbackProviders: ['openai', 'local'],
  enableValidation: true,
  enableFallback: true,
  enableRetry: true,
  maxRetries: 2,
  timeout: 30000,
  confidenceThreshold: 0.6,
  enableCaching: false
}
```

### Provider Configuration

```typescript
// Claude Adapter
const claudeConfig = {
  apiKey: 'your-api-key',
  model: 'claude-3-haiku-20240307',
  maxTokens: 1000,
  temperature: 0.3
}

// OpenAI Adapter  
const openAIConfig = {
  apiKey: 'your-api-key',
  model: 'gpt-3.5-turbo',
  maxTokens: 1000,
  temperature: 0.3
}
```

## Testing

### Unit Tests
- Strategy validation logic
- Provider adapter responses
- Core engine decision flow

### Integration Tests
- End-to-end decision making
- Provider fallback scenarios
- Error handling

### Backward Compatibility Tests
- Original API still works
- Response format unchanged
- Performance comparable

## Monitoring

### Metrics Available
- Request counts by domain/provider
- Average latency and confidence
- Error rates by type
- Provider health status

### Health Checks
- Provider availability
- Response quality validation
- Performance monitoring

## Future Enhancements

### Planned Features
1. **Legal Domain Strategy** - Contract review, compliance checking
2. **Financial Domain Strategy** - Investment analysis, risk assessment
3. **Technical Domain Strategy** - Code review, architecture decisions
4. **Business Domain Strategy** - Market analysis, strategic decisions

### Provider Additions
1. **Google Gemini Adapter**
2. **Azure OpenAI Adapter**
3. **Custom Model Adapters**

### Advanced Features
1. **Decision Explanation** - Why specific decisions were made
2. **Confidence Calibration** - Improve confidence scoring
3. **A/B Testing** - Compare different strategies/providers
4. **Decision Auditing** - Track decision history and outcomes

## API Reference

### Core Types

```typescript
interface CoreDecisionRequest {
  id: string
  domain: DecisionDomain
  decisionType: string
  input: string
  provider?: ProviderType
  context?: Record<string, unknown>
  signal?: AbortSignal
}

interface CoreDecisionResponse {
  decision: CoreDecision
  confidence: number
  latency: number
  provider: ProviderType
  success: boolean
  error?: string
}
```

### Strategy Interface

```typescript
interface IDecisionStrategy<TDecision extends BaseDecision> {
  readonly domain: string
  readonly supportedDecisionTypes: string[]
  
  buildSystemPrompt(decisionType: string, request: BaseDecisionRequest): string
  buildJsonFormatRequirements(decisionType: string): string
  validateDecisionStructure(decision: any, decisionType: string): ValidationResult
  calculateConfidence(decision: TDecision, decisionType: string, request: BaseDecisionRequest): ConfidenceMetrics
  createFallbackDecision(decisionType: string, request: BaseDecisionRequest): TDecision
}
```

### Provider Interface

```typescript
interface IProviderAdapter {
  readonly name: string
  readonly isAvailable: boolean
  readonly config: ProviderConfig
  
  makeDecisionRequest(systemPrompt: string, userPrompt: string, request: BaseDecisionRequest): Promise<ProviderResponse>
  healthCheck(): Promise<boolean>
  getProviderMetadata(): ProviderMetadata
}
```

## Support

For questions or issues with the migration:

1. Check existing tests in `/src/engines/` for examples
2. Review strategy implementations in `/src/engines/strategies/medical/`
3. Consult the backward compatibility wrapper in `/src/services/decisionalMiddleware.ts`
4. Test with the local adapter for development

## Conclusion

This refactoring provides a solid foundation for scaling the decision engine to multiple domains while maintaining full backward compatibility. The architecture is designed for easy extension and maintenance, with clear separation of concerns and type safety throughout.