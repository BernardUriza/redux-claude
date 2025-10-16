# Legacy Documentation Index

This directory contains historical documentation, migration guides, and deprecated implementation details that are preserved for reference but are no longer actively maintained.

## Status: ARCHIVED

The documents in this directory are kept for historical reference and context. For current documentation, please refer to the main documentation directories.

## Migration Guides

### SOAP System Migration

- **[PLAN_MIGRACION_SOAP.md](./PLAN_MIGRACION_SOAP.md)**
  - Original SOAP system migration plan
  - Historical context for current SOAP implementation
  - Lessons learned and design decisions

- **[MIGRATION_PROPOSAL.md](./MIGRATION_PROPOSAL.md)**
  - General system migration proposals
  - Architecture evolution planning
  - Deprecated migration strategies

### Interface & Type Migrations

- **[interfaces-migration.md](./interfaces-migration.md)**
  - Historical interface definitions
  - Type system evolution
  - Breaking changes documentation

- **[selectors-design.md](./selectors-design.md)**
  - Original Redux selector designs
  - State management patterns (pre-refactor)
  - Selector optimization history

### Test Extraction History

- **[test-extraction.md](./test-extraction.md)**
  - Original test extraction approaches
  - Testing strategy evolution
  - Deprecated test patterns

## Deployment History

- **[DEPLOYMENT.md](./DEPLOYMENT.md)**
  - Legacy deployment procedures
  - Historical hosting configurations
  - Deprecated deployment scripts

**Note**: For current deployment information, see the main `netlify.toml` and Netlify documentation.

## Code Examples (Deprecated)

- **[example-usage.tsx](./example-usage.tsx)**
  - Legacy React component examples
  - Deprecated API usage patterns
  - Historical implementation approaches

**Note**: For current examples, see `../examples/` directory.

## Design Documents

### State Management Audit

- **[estado-multinucleo-audit.md](./estado-multinucleo-audit.md)**
  - Multi-core state management analysis
  - Historical performance audits
  - Architecture decision records

### Gateway PoC

- **[Prompt para Claude Code - Gateway Decisional PoC.md](./Prompt para Claude Code - Gateway Decisional PoC.md)**
  - Original proof-of-concept for decisional gateway
  - Early design explorations
  - Conceptual foundations for current `DecisionalMiddleware`

## Why These Documents Are Preserved

1. **Historical Context**: Understanding the evolution of the system
2. **Design Decisions**: Rationale behind current architecture choices
3. **Learning Reference**: Patterns that worked and didn't work
4. **Refactoring Evidence**: Documentation of technical debt elimination

## Migration Path to Current System

If you're referencing these legacy documents, here's where to find the modern equivalents:

| Legacy Document | Current Equivalent |
|----------------|-------------------|
| `DEPLOYMENT.md` | `netlify.toml` + Netlify dashboard |
| `example-usage.tsx` | `../examples/EXAMPLE_REDUX_BRAIN_USAGE.md` |
| `interfaces-migration.md` | `packages/cognitive-core/src/types/` |
| `selectors-design.md` | `src/lib/store/selectors/` |
| `test-extraction.md` | `../testing/EXHAUSTIVE_TESTING_SUITE_v3.md` |

## Refactoring Timeline

1. **Phase 1**: Initial Redux implementation (legacy patterns)
2. **Phase 2**: Clean Architecture migration (2024)
3. **Phase 3**: Performance optimization with intelligent routing (2025)
4. **Current**: NPM package + optimized multi-agent system

For details on the refactoring journey, see `../architecture/CLEAN_ARCHITECTURE_REFACTOR.md`.

## Warning

**DO NOT USE** code examples from this directory in new implementations. They represent outdated patterns and may not work with the current system architecture.

For current best practices, always refer to:
- `../examples/` for usage patterns
- `../architecture/` for system design
- Root `ARCHITECTURE.md` for high-level overview
- Root `CLAUDE.md` for project guidelines

---

**Status**: ARCHIVED - Historical Reference Only
**Last Active**: Pre-October 2025 refactoring
**Maintainer**: Archive only - no active maintenance
