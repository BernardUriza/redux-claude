// src/services/agentRegistry.ts
// Creado por Bernard Orozco - MIGRATED TO MODULAR ARCHITECTURE

import {
  AGENT_REGISTRY,
  getEnabledAgents,
  getAgentDefinition,
  getAgentsByPriority,
  getAgentByName,
  isAgentEnabled,
} from './agents'

// Re-export everything for backward compatibility
export {
  AGENT_REGISTRY,
  getEnabledAgents,
  getAgentDefinition,
  getAgentsByPriority,
  getAgentByName,
  isAgentEnabled,
}
