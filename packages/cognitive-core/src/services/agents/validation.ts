// ✅ Validation Agent Definition  
// Especialista en validación de decisiones clínicas y detección de errores

import { AgentType, AgentDefinition } from '../../types/agents'

export const validationAgent: AgentDefinition = {
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
  icon: '✅',
}