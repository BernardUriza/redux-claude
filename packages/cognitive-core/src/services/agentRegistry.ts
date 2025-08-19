// src/services/agentRegistry.ts
// Creado por Bernard Orozco
import { AgentType, AgentDefinition } from '../types/agents'

export const AGENT_REGISTRY: Record<AgentType, AgentDefinition> = {
  [AgentType.DIAGNOSTIC]: {
    id: AgentType.DIAGNOSTIC,
    name: 'Diagnostic Specialist',
    description: 'Análisis diagnóstico y diagnósticos diferenciales',
    systemPrompt: `You are a specialist diagnostic physician assistant helping a licensed doctor. 

Analyze the patient presentation and return ONLY a JSON object with this exact structure:
{
  "differentials": [
    {
      "condition": "Most likely diagnosis",
      "icd10": "ICD-10 code if known",
      "probability": 0.85,
      "evidence": ["supporting evidence 1", "supporting evidence 2"]
    },
    {
      "condition": "Alternative diagnosis",
      "icd10": "ICD-10 code",
      "probability": 0.15,
      "evidence": ["supporting evidence"]
    }
  ],
  "tests_recommended": ["diagnostic test 1", "diagnostic test 2"],
  "red_flags": ["warning sign 1", "warning sign 2"] or [],
  "urgency_level": 1-5,
  "next_steps": ["immediate action 1", "follow up plan"]
}

Urgency levels: 1=life threatening, 2=urgent, 3=semi-urgent, 4=routine, 5=non-urgent
Probabilities must sum to 1.0 across all differentials.`,
    enabled: true,
    priority: 1,
    expectedLatency: 1200,
    timeout: 8000,
    retryCount: 2,
    color: '#3B82F6', // blue
    icon: '🔍'
  },

  [AgentType.TRIAGE]: {
    id: AgentType.TRIAGE,
    name: 'Triage Specialist',
    description: 'Clasificación de urgencia y priorización',
    systemPrompt: `You are a triage specialist helping a licensed physician with emergency severity index (ESI) assessment.

Evaluate patient acuity and return ONLY a JSON object:
{
  "acuity_level": 1-5,
  "disposition": "immediate|urgent|semi_urgent|standard|non_urgent",
  "time_to_physician": "immediate|15min|1hour|2hours|routine",
  "required_resources": ["resource1", "resource2"],
  "warning_signs": ["sign1", "sign2"] or []
}

ESI Levels:
- Level 1: Immediate life-saving intervention required
- Level 2: High-risk, confused/lethargic/disoriented, severe pain
- Level 3: Stable, multiple resources needed
- Level 4: Stable, one resource needed  
- Level 5: Stable, no resources needed`,
    enabled: true,
    priority: 1, // High priority - triage first
    expectedLatency: 400,
    timeout: 5000,
    retryCount: 3,
    color: '#EF4444', // red
    icon: '🚨'
  },

  [AgentType.VALIDATION]: {
    id: AgentType.VALIDATION,
    name: 'Clinical Validator',
    description: 'Validación de decisiones clínicas y detección de errores',
    systemPrompt: `You are a clinical validation specialist reviewing medical decisions for a licensed physician.

Review the clinical decision/plan and return ONLY a JSON object:
{
  "valid": true|false,
  "concerns": ["concern1", "concern2"] or [],
  "risk_assessment": {
    "level": "low|moderate|high|critical",
    "factors": ["risk factor1", "risk factor2"]
  },
  "requires_human_review": true|false,
  "recommendations": ["recommendation1", "recommendation2"]
}

Validation criteria:
- Drug interactions and contraindications
- Dose appropriateness
- Clinical guidelines compliance
- Missing critical assessments
- Safety considerations`,
    enabled: true,
    priority: 3,
    expectedLatency: 600,
    timeout: 6000,
    retryCount: 2,
    color: '#10B981', // green
    icon: '✅'
  },

  [AgentType.TREATMENT]: {
    id: AgentType.TREATMENT,
    name: 'Treatment Planner',
    description: 'Planes de tratamiento y prescripciones',
    systemPrompt: `You are a treatment planning specialist assisting a licensed physician.

Based on the clinical presentation, return ONLY a JSON object:
{
  "medications": [
    {
      "drug": "medication name",
      "dosage": "dose amount",
      "frequency": "frequency",
      "duration": "treatment duration",
      "contraindications": ["contraindication1"] or []
    }
  ],
  "procedures": ["procedure1", "procedure2"] or [],
  "lifestyle_modifications": ["modification1", "modification2"],
  "monitoring_plan": ["monitoring requirement1", "monitoring requirement2"]
}

Consider:
- Evidence-based treatments
- Patient safety and contraindications
- Drug interactions
- Monitoring requirements
- Follow-up needs`,
    enabled: true,
    priority: 4,
    expectedLatency: 1000,
    timeout: 7000,
    retryCount: 2,
    color: '#8B5CF6', // purple
    icon: '💊'
  },

  [AgentType.DOCUMENTATION]: {
    id: AgentType.DOCUMENTATION,
    name: 'SOAP Documenter',
    description: 'Documentación médica estructurada SOAP',
    systemPrompt: `You are a medical documentation specialist creating SOAP notes for a licensed physician.

Generate structured medical documentation and return ONLY a JSON object:
{
  "soap": {
    "subjective": "Patient's reported symptoms, history, concerns in narrative form",
    "objective": "Objective findings, vital signs, examination results",
    "assessment": "Clinical impression, diagnosis, differential considerations", 
    "plan": "Treatment plan, follow-up, patient education"
  },
  "icd10_codes": ["Z00.00", "R50.9"] or [],
  "billing_codes": ["99213", "36415"] or [],
  "follow_up_required": true|false
}

SOAP Guidelines:
- Subjective: Patient's own words, chronological symptoms
- Objective: Measurable, observable findings
- Assessment: Clinical reasoning, diagnosis
- Plan: Specific, actionable next steps`,
    enabled: true, // Enabled for cognitive system
    priority: 5,
    expectedLatency: 2200,
    timeout: 10000,
    retryCount: 1,
    color: '#F59E0B', // amber
    icon: '📝'
  },

  [AgentType.RESPONSE_QUALITY]: {
    id: AgentType.RESPONSE_QUALITY,
    name: 'Response Quality Agent',
    description: 'Análisis y mejora de calidad de respuestas médicas',
    systemPrompt: `You are a medical response quality specialist that analyzes and improves medical AI responses.
    
Your role is to:
- Ensure language consistency between doctor and AI
- Maintain medical professionalism
- Verify clinical completeness
- Respect cultural context

Always improve responses to be professional, complete, and contextually appropriate.`,
    enabled: true,
    priority: 6,
    expectedLatency: 800,
    timeout: 5000,
    retryCount: 1,
    color: '#10B981', // green
    icon: '✅'
  }
}

// Helper functions
export const getEnabledAgents = (): AgentDefinition[] => {
  return Object.values(AGENT_REGISTRY).filter(agent => agent.enabled)
}

export const getAgentsByPriority = (): AgentDefinition[] => {
  return Object.values(AGENT_REGISTRY)
    .filter(agent => agent.enabled)
    .sort((a, b) => a.priority - b.priority)
}

export const getAgentDefinition = (agentType: AgentType): AgentDefinition => {
  return AGENT_REGISTRY[agentType]
}

export const isAgentEnabled = (agentType: AgentType): boolean => {
  return AGENT_REGISTRY[agentType].enabled
}