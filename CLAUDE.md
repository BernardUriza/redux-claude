# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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