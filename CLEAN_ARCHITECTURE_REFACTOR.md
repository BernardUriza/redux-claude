# 🏗️ Clean Architecture Refactoring Plan for Redux Brain

## Current Structure Issues ❌
```
src/
├── app/           # Mixed routes, components, styles
├── components/    # All components together
├── constants/     # OK
├── hooks/        # OK
├── lib/          # OK
├── monitoring/   # Should be in infrastructure
├── styles/       # Global styles OK
├── test/         # Tests mixed with source
├── types/        # OK
└── utils/        # OK
```

## Proposed Clean Architecture ✅

```
src/
├── app/                    # 🎯 ONLY ROUTES (Next.js App Router)
│   ├── (auth)/            # Route groups
│   │   ├── login/
│   │   └── register/
│   ├── (medical)/         # Medical routes
│   │   ├── chat/
│   │   └── soap/
│   ├── api/               # API routes
│   │   └── redux-brain/
│   ├── layout.tsx
│   └── page.tsx
│
├── core/                  # 🧠 BUSINESS LOGIC (Domain)
│   ├── entities/         # Business entities
│   │   ├── Patient.ts
│   │   ├── SOAPNote.ts
│   │   └── MedicalSession.ts
│   ├── use-cases/        # Business rules
│   │   ├── processMessage.ts
│   │   ├── generateSOAP.ts
│   │   └── detectUrgency.ts
│   └── interfaces/       # Contracts
│       ├── repositories/
│       └── services/
│
├── infrastructure/       # 🔌 EXTERNAL SERVICES
│   ├── api/             # API clients
│   │   └── anthropic.ts
│   ├── database/        # If needed
│   ├── monitoring/      # Sentry, Analytics
│   └── cache/           # Redis, etc
│
├── presentation/        # 🎨 UI LAYER
│   ├── components/      # Reusable components
│   │   ├── ui/         # Base UI (buttons, cards)
│   │   ├── forms/      # Form components
│   │   └── layouts/    # Layout components
│   ├── features/        # Feature-specific components
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── MessageList.tsx
│   │   │   └── SOAPDisplay.tsx
│   │   └── medical/
│   │       ├── UrgencyBadge.tsx
│   │       └── PatientInfo.tsx
│   └── hooks/          # Custom hooks
│       └── useReduxBrain.ts
│
├── lib/                # 🛠️ SHARED UTILITIES
│   ├── utils/         # Helper functions
│   ├── constants/     # App constants
│   └── types/         # TypeScript types
│
└── styles/            # 🎨 GLOBAL STYLES
    └── globals.css
```

## Migration Steps

### Step 1: Create Core Layer
```bash
mkdir -p src/core/{entities,use-cases,interfaces}
```

Move business logic from API routes to use-cases:
- `processReduxBrainMessage` → `core/use-cases/processMessage.ts`
- SOAP logic → `core/use-cases/generateSOAP.ts`
- Urgency detection → `core/use-cases/detectUrgency.ts`

### Step 2: Create Presentation Layer
```bash
mkdir -p src/presentation/{components,features,hooks}
mkdir -p src/presentation/components/{ui,forms,layouts}
mkdir -p src/presentation/features/{chat,medical}
```

Move components:
- `components/paradigm2/ChatInterface` → `presentation/features/chat/`
- Generic components → `presentation/components/ui/`

### Step 3: Create Infrastructure Layer
```bash
mkdir -p src/infrastructure/{api,monitoring,cache}
```

Move external services:
- Claude API calls → `infrastructure/api/anthropic.ts`
- Monitoring → `infrastructure/monitoring/`

### Step 4: Clean App Directory
Keep ONLY routes in `app/`:
```
app/
├── (medical)/
│   └── chat/
│       └── page.tsx  # import from presentation layer
├── api/
│   └── redux-brain/
│       └── route.ts  # import from core layer
├── layout.tsx
└── page.tsx
```

## Example Refactored Files

### `src/core/use-cases/processMessage.ts`
```typescript
// Pure business logic, no framework dependencies
export class ProcessMessageUseCase {
  constructor(
    private validator: DefensiveMedicineValidator,
    private soapProcessor: SOAPProcessor
  ) {}

  async execute(sessionId: string, message: string): Promise<MedicalResponse> {
    // Business logic here
    const urgency = this.validator.detectUrgency(message)
    const soap = await this.soapProcessor.process(message)
    return { urgency, soap }
  }
}
```

### `src/app/api/redux-brain/route.ts`
```typescript
// Thin controller, just handles HTTP
import { ProcessMessageUseCase } from '@/core/use-cases/processMessage'

export async function POST(req: NextRequest) {
  const { sessionId, message } = await req.json()

  const useCase = new ProcessMessageUseCase(
    new DefensiveMedicineValidator(),
    new SOAPProcessor()
  )

  const result = await useCase.execute(sessionId, message)
  return NextResponse.json(result)
}
```

### `src/presentation/features/chat/ChatInterface.tsx`
```typescript
// UI component, uses hook from cognitive-core
'use client'
import { useReduxBrain } from '@redux-claude/cognitive-core'

export function ChatInterface() {
  const { sendMessage, messages } = useReduxBrain()
  // UI logic only
}
```

## Benefits of This Structure

### 1. **Clear Separation of Concerns**
- Business logic in `core/` (testable, framework-agnostic)
- UI in `presentation/` (React components)
- External services in `infrastructure/`
- Routes in `app/` (clean, minimal)

### 2. **Scalability**
- Easy to add new features (create new folder in features/)
- Can swap infrastructure (change API provider)
- Business logic independent of UI

### 3. **Testability**
- Core logic can be unit tested without UI/API
- Use cases are pure functions
- Mocking is straightforward

### 4. **Developer Experience**
- Clear where to put new code
- Easy to find existing code
- Follows industry standards

### 5. **Framework Independence**
- Core logic doesn't depend on Next.js
- Could move to another framework
- Business rules preserved

## Implementation Priority

1. **High Priority** (Do First)
   - Move business logic to `core/use-cases`
   - Clean up `app/` directory
   - Organize components in `presentation/features`

2. **Medium Priority**
   - Create infrastructure layer
   - Move API clients
   - Set up dependency injection

3. **Low Priority**
   - Refactor tests structure
   - Add more documentation
   - Set up barrel exports

## NPM Package Impact

Your `@redux-claude/cognitive-core` package already follows this pattern:
- Services (business logic)
- Hooks (presentation)
- Types (core entities)

The refactored Next.js app would just be a thin layer that uses the package!

---

*This refactoring follows Clean Architecture principles by Uncle Bob, adapted for modern Next.js 15 applications*