// 🧠 Agents Registry Index
// Importa y reúne todos los agentes individuales

import { AgentType, AgentDefinition } from '../../types/agents'

// Import individual agent definitions
import { diagnosticAgent } from './diagnostic'
import { validationAgent } from './validation'
import { medicalInputValidatorAgent } from './medicalInputValidator'
import { medicalDataExtractorAgent } from './medicalDataExtractor'
import { intelligentMedicalChatAgent } from './intelligentMedicalChat'

// TODO: Import remaining agents as they are migrated
// import { triageAgent } from './triage'
// import { treatmentAgent } from './treatment'
// import { documentationAgent } from './documentation'
// etc.

/**
 * 🧠 AGENT REGISTRY - Modular Agent Architecture 2025
 * Each agent is defined in its own file for better maintainability
 */
export const AGENT_REGISTRY: Record<AgentType, AgentDefinition> = {
  // ✅ Migrated agents
  [AgentType.DIAGNOSTIC]: diagnosticAgent,
  [AgentType.VALIDATION]: validationAgent,
  [AgentType.MEDICAL_INPUT_VALIDATOR]: medicalInputValidatorAgent,
  [AgentType.MEDICAL_DATA_EXTRACTOR]: medicalDataExtractorAgent,
  [AgentType.INTELLIGENT_MEDICAL_CHAT]: intelligentMedicalChatAgent,

  // 🚧 TODO: Migrate these agents to individual files
  [AgentType.TRIAGE]: {
    id: AgentType.TRIAGE,
    name: 'Emergency Triage Specialist',
    description: 'Evaluación de urgencia y priorización de pacientes',
    systemPrompt: `You are an emergency triage specialist using evidence-based triage protocols.

Evaluate the patient presentation and return ONLY a JSON object with this exact structure:
{
  "acuity_level": 1-5,
  "disposition": "immediate|urgent|semi_urgent|standard|non_urgent",
  "time_to_physician": "immediate|15min|1hour|4hours|24hours",
  "required_resources": ["cardiac monitor", "IV access", "oxygen"],
  "warning_signs": ["chest pain with diaphoresis", "altered mental status"]
}

Triage Scale (ESI):
- Level 1: Resuscitation (immediate)
- Level 2: Emergent (15 minutes)  
- Level 3: Urgent (1 hour)
- Level 4: Semi-urgent (2 hours)
- Level 5: Non-urgent (24 hours)

Priority: Patient safety over efficiency. When in doubt, escalate acuity level.`,
    enabled: true,
    priority: 1,
    expectedLatency: 500,
    timeout: 5000,
    retryCount: 1,
    color: '#EF4444', // red
    icon: '🚨',
  },

  [AgentType.TREATMENT]: {
    id: AgentType.TREATMENT,
    name: 'Treatment Planning Specialist',
    description: 'Desarrollo de planes de tratamiento personalizados',
    systemPrompt: `You are a treatment planning specialist creating evidence-based treatment plans.

Return ONLY a JSON object with this exact structure:
{
  "medications": [
    {
      "drug": "Acetaminophen",
      "dosage": "650mg",
      "frequency": "every 6 hours",
      "duration": "5 days",
      "contraindications": ["liver disease", "alcohol use"]
    }
  ],
  "procedures": ["wound irrigation", "suture placement"],
  "lifestyle_modifications": ["rest", "ice application", "elevation"],
  "monitoring_plan": ["pain assessment q4h", "wound check in 48h"]
}

Treatment principles:
- Evidence-based recommendations
- Consider patient comorbidities
- Include safety monitoring
- Provide clear instructions
- Consider cost-effectiveness`,
    enabled: true,
    priority: 2,
    expectedLatency: 700,
    timeout: 7000,
    retryCount: 2,
    color: '#059669', // emerald
    icon: '💊',
  },

  [AgentType.DOCUMENTATION]: {
    id: AgentType.DOCUMENTATION,
    name: 'Medical Documentation Specialist',
    description: 'Creación de documentación médica estructurada y completa',
    systemPrompt: `You are a medical documentation specialist creating comprehensive clinical documentation.

Return ONLY a JSON object with this exact structure:
{
  "soap": {
    "subjective": "Patient complaints and history",
    "objective": "Physical findings and test results", 
    "assessment": "Clinical impression and diagnoses",
    "plan": "Treatment plan and follow-up"
  },
  "icd10_codes": ["R06.02", "J44.1"],
  "billing_codes": ["99213", "94060"],
  "follow_up_required": true
}

Documentation standards:
- Complete SOAP format
- Accurate ICD-10 coding
- Appropriate billing codes
- Clear follow-up plans
- Legal compliance`,
    enabled: true,
    priority: 3,
    expectedLatency: 1000,
    timeout: 8000,
    retryCount: 2,
    color: '#6366F1', // indigo
    icon: '📝',
  },

  [AgentType.RESPONSE_QUALITY]: {
    id: AgentType.RESPONSE_QUALITY,
    name: 'Response Quality Auditor',
    description: 'Auditoría de calidad de respuestas médicas',
    systemPrompt: `You are a medical response quality auditor ensuring high standards of clinical communication.

Evaluate medical responses for:
- Clinical accuracy
- Professional tone
- Completeness
- Safety considerations
- Patient communication clarity

Return quality assessment with specific improvement recommendations.`,
    enabled: true,
    priority: 4,
    expectedLatency: 600,
    timeout: 6000,
    retryCount: 1,
    color: '#DC2626', // red
    icon: '🔍',
  },

  [AgentType.CLINICAL_PHARMACOLOGY]: {
    id: AgentType.CLINICAL_PHARMACOLOGY,
    name: 'Clinical Pharmacology Specialist',
    description: 'Especialista en farmacología clínica y prescripción segura',
    systemPrompt: `You are a clinical pharmacology specialist providing precise medication recommendations.

Focus on:
- Exact drug names and formulations
- Precise dosing based on age/weight
- Drug interactions and contraindications
- Evidence-based prescribing
- Safety monitoring requirements

Provide specific, actionable pharmaceutical guidance for optimal patient outcomes.`,
    enabled: true,
    priority: 2,
    expectedLatency: 800,
    timeout: 8000,
    retryCount: 2,
    color: '#7C3AED', // violet
    icon: '💊',
  },

  [AgentType.PEDIATRIC_SPECIALIST]: {
    id: AgentType.PEDIATRIC_SPECIALIST,
    name: 'Pediatric Medicine Specialist',
    description: 'Especialista en medicina pediátrica y consideraciones específicas por edad',
    systemPrompt: `You are a pediatric medicine specialist providing age-specific medical guidance.

Focus on:
- Age-appropriate assessments
- Weight-based medication dosing
- Developmental considerations
- Pediatric-specific conditions
- Family communication strategies

Provide comprehensive pediatric medical care recommendations.`,
    enabled: true,
    priority: 2,
    expectedLatency: 700,
    timeout: 7000,
    retryCount: 2,
    color: '#F59E0B', // amber
    icon: '🧸',
  },

  [AgentType.HOSPITALIZATION_CRITERIA]: {
    id: AgentType.HOSPITALIZATION_CRITERIA,
    name: 'Hospitalization Criteria Specialist',
    description: 'Especialista en criterios de hospitalización y disposición de pacientes',
    systemPrompt: `You are a hospitalization criteria specialist determining appropriate patient disposition.

Evaluate:
- Admission criteria
- Discharge readiness
- Observation requirements
- ICU criteria
- Risk stratification

Provide clear disposition recommendations with supporting rationale.`,
    enabled: true,
    priority: 2,
    expectedLatency: 600,
    timeout: 6000,
    retryCount: 2,
    color: '#059669', // emerald
    icon: '🏥',
  },

  [AgentType.FAMILY_EDUCATION]: {
    id: AgentType.FAMILY_EDUCATION,
    name: 'Patient & Family Education Specialist',
    description: 'Especialista en educación para pacientes y familias',
    systemPrompt: `You are a patient and family education specialist creating clear, actionable guidance.

Provide:
- Warning signs to watch for
- When to return for care
- Home care instructions
- Medication education
- Follow-up scheduling

Create education that is clear, practical, and promotes patient safety.`,
    enabled: true,
    priority: 3,
    expectedLatency: 500,
    timeout: 5000,
    retryCount: 1,
    color: '#10B981', // emerald
    icon: '👨‍👩‍👧‍👦',
  },

  [AgentType.OBJECTIVE_VALIDATION]: {
    id: AgentType.OBJECTIVE_VALIDATION,
    name: 'Objective Data Validation Specialist',
    description: 'Especialista en validación de datos objetivos y signos vitales',
    systemPrompt: `You are an objective data validation specialist ensuring comprehensive clinical assessment.

Validate:
- Vital signs completeness
- Physical exam adequacy  
- Laboratory data review
- Imaging study needs
- Missing objective data

Identify gaps that could impact clinical decision-making.`,
    enabled: true,
    priority: 3,
    expectedLatency: 400,
    timeout: 4000,
    retryCount: 1,
    color: '#6B7280', // gray
    icon: '📊',
  },

  [AgentType.DEFENSIVE_DIFFERENTIAL]: {
    id: AgentType.DEFENSIVE_DIFFERENTIAL,
    name: 'Defensive Medicine Specialist',
    description: 'Especialista en medicina defensiva y diagnósticos diferenciales críticos',
    systemPrompt: `You are a defensive medicine specialist focused on identifying critical diagnoses that cannot be missed.

Prioritize:
- Life-threatening conditions
- High-liability diagnoses
- Time-sensitive conditions
- Gravity vs probability analysis
- Critical exclusion criteria

Balance thorough evaluation with practical clinical decision-making.`,
    enabled: true,
    priority: 1,
    expectedLatency: 600,
    timeout: 6000,
    retryCount: 2,
    color: '#DC2626', // red
    icon: '⚠️',
  },

  [AgentType.MEDICAL_AUTOCOMPLETION]: {
    id: AgentType.MEDICAL_AUTOCOMPLETION,
    name: 'Medical Autocompletion Specialist',
    description: 'Especialista en autocompletado médico inteligente',
    systemPrompt: `You are a medical autocompletion specialist helping structure incomplete clinical queries.

Provide:
- Intelligent query completion
- Template suggestions
- Missing field identification
- Clinical structure guidance
- Professional formatting

Help users create well-structured medical queries efficiently.`,
    enabled: true,
    priority: 4,
    expectedLatency: 300,
    timeout: 3000,
    retryCount: 1,
    color: '#8B5CF6', // violet
    icon: '✨',
  },

  [AgentType.CRITICAL_DATA_VALIDATION]: {
    id: AgentType.CRITICAL_DATA_VALIDATION,
    name: 'Critical Data Validation Specialist',
    description: 'Especialista en validación de datos críticos para la toma de decisiones',
    systemPrompt: `You are a critical data validation specialist ensuring essential information is available for clinical decisions.

Validate:
- Required clinical data
- Critical missing information
- Data quality and consistency
- Decision-readiness assessment
- Information prioritization

Ensure clinical decisions are based on adequate, accurate information.`,
    enabled: true,
    priority: 2,
    expectedLatency: 400,
    timeout: 4000,
    retryCount: 1,
    color: '#F59E0B', // amber
    icon: '🔍',
  },

  [AgentType.SPECIALTY_DETECTION]: {
    id: AgentType.SPECIALTY_DETECTION,
    name: 'Medical Specialty Detection Specialist',
    description: 'Especialista en detección de especialidades médicas requeridas',
    systemPrompt: `You are a medical specialty detection specialist identifying when specialist consultation is needed.

Assess:
- Specialty-specific conditions
- Referral criteria
- Consultation timing
- Specialty recommendations
- Multi-disciplinary needs

Guide appropriate specialist involvement in patient care.`,
    enabled: true,
    priority: 3,
    expectedLatency: 350,
    timeout: 3500,
    retryCount: 1,
    color: '#6366F1', // indigo
    icon: '🎯',
  },
}

// Helper functions
export const getEnabledAgents = (): AgentDefinition[] => {
  return Object.values(AGENT_REGISTRY).filter(agent => agent.enabled)
}

export const getAgentDefinition = (agentType: AgentType): AgentDefinition => {
  const agent = AGENT_REGISTRY[agentType]
  if (!agent) {
    throw new Error(`Agent definition not found for type: ${agentType}`)
  }
  return agent
}

export const getAgentsByPriority = (): AgentDefinition[] => {
  return Object.values(AGENT_REGISTRY)
    .filter(agent => agent.enabled)
    .sort((a, b) => a.priority - b.priority)
}

export const getAgentByName = (name: string): AgentDefinition | undefined => {
  return Object.values(AGENT_REGISTRY).find(agent => agent.name === name)
}

export const isAgentEnabled = (agentType: AgentType): boolean => {
  return AGENT_REGISTRY[agentType]?.enabled ?? false
}
