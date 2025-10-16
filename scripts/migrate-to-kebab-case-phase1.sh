#!/bin/bash
# Migration script: Phase 1 - Priority files to kebab-case
# Run this from the project root

set -e

echo "🔄 Phase 1: Migrating priority files to kebab-case..."
echo ""

# Backup first
echo "📦 Creating backup..."
git stash push -m "Backup before kebab-case migration"

# Components
echo "📝 Renaming components..."

# RealTimeMetrics (2 locations)
git mv src/components/RealTimeMetrics.tsx src/components/real-time-metrics.tsx
git mv src/components/paradigm2/RealTimeMetrics/RealTimeMetrics.tsx src/components/paradigm2/RealTimeMetrics/real-time-metrics.tsx
git mv src/components/paradigm2/RealTimeMetrics/RealTimeMetrics.test.tsx src/components/paradigm2/RealTimeMetrics/real-time-metrics.test.tsx
git mv src/components/paradigm2/RealTimeMetrics src/components/paradigm2/real-time-metrics

# PerformanceMonitor
git mv src/components/paradigm2/PerformanceMonitor/PerformanceMonitor.tsx src/components/paradigm2/PerformanceMonitor/performance-monitor.tsx
git mv src/components/paradigm2/PerformanceMonitor/PerformanceMonitor.test.tsx src/components/paradigm2/PerformanceMonitor/performance-monitor.test.tsx
git mv src/components/paradigm2/PerformanceMonitor src/components/paradigm2/performance-monitor

# ChatInterface (2 locations)
git mv src/components/paradigm2/ChatInterface/ChatInterface.tsx src/components/paradigm2/ChatInterface/chat-interface.tsx
git mv src/components/paradigm2/ChatInterface/ChatInterface.test.tsx src/components/paradigm2/ChatInterface/chat-interface.test.tsx
git mv src/components/paradigm2/ChatInterface/ChatInterface.simple.test.tsx src/components/paradigm2/ChatInterface/chat-interface.simple.test.tsx
git mv src/components/paradigm2/ChatInterface src/components/paradigm2/chat-interface

git mv src/presentation/features/chat/ChatInterface.tsx src/presentation/features/chat/chat-interface.tsx

# Hooks
echo "🪝 Renaming hooks..."
git mv src/hooks/useSOAPData.ts src/hooks/use-soap-data.ts
git mv src/hooks/useMobileInteractions.ts src/hooks/use-mobile-interactions.ts
git mv src/hooks/useUrgencyData.ts src/hooks/use-urgency-data.ts
git mv src/hooks/useDashboardEffects.ts src/hooks/use-dashboard-effects.ts
git mv src/hooks/useDashboardHandlers.ts src/hooks/use-dashboard-handlers.ts
git mv src/hooks/useCognitiveMetrics.ts src/hooks/use-cognitive-metrics.ts
git mv src/hooks/useMessageContent.ts src/hooks/use-message-content.ts
git mv src/hooks/useAlertManager.ts src/hooks/use-alert-manager.ts
git mv src/hooks/useDashboardState.ts src/hooks/use-dashboard-state.ts
git mv src/hooks/useMedicalAssistant.ts src/hooks/use-medical-assistant.ts
git mv src/hooks/useMedicalDataOrchestrator.ts src/hooks/use-medical-data-orchestrator.ts

echo "✅ Files renamed successfully!"
echo ""
echo "⚠️  IMPORTANT: You now need to update all imports in the codebase."
echo "   Run the companion update-imports script next."
