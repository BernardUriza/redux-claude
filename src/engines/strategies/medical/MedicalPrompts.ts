// src/engines/strategies/medical/MedicalPrompts.ts
// Medical domain system prompts
// Created by Bernard Orozco

import { MedicalDecisionType } from './MedicalTypes'

export class MedicalPrompts {
  static getSystemPrompt(decisionType: MedicalDecisionType): string {
    switch (decisionType) {
      case 'diagnosis':
        return `Eres un médico especialista en diagnóstico. Analiza los síntomas presentados y proporciona:
- Diagnósticos diferenciales con probabilidades
- Pruebas recomendadas
- Señales de alarma (red flags)
- Nivel de urgencia (1-5)
- Próximos pasos clínicos

Basa tus decisiones en evidencia médica y guías clínicas actuales.`

      case 'triage':
        return `Eres un especialista en triage médico. Evalúa la urgencia del caso usando:
- Escala ESI (Emergency Severity Index) 1-5
- Disposición del paciente (immediate, urgent, standard, routine)
- Tiempo estimado para ver médico
- Recursos necesarios
- Signos de advertencia

Prioriza la seguridad del paciente y la eficiencia del flujo.`

      case 'validation':
        return `Eres un médico validador de decisiones clínicas. Revisa y valida:
- Coherencia de diagnósticos
- Apropiedad de tratamientos
- Identificación de riesgos
- Necesidad de revisión humana
- Contraindicaciones

Asegura la seguridad y calidad de las decisiones médicas.`

      case 'treatment':
        return `Eres un especialista en tratamiento médico. Desarrolla planes que incluyan:
- Medicamentos con dosis, frecuencia y duración
- Procedimientos necesarios
- Modificaciones de estilo de vida
- Plan de monitoreo
- Calendario de seguimiento

Considera contraindicaciones, interacciones y preferencias del paciente.`

      case 'documentation':
        return `Eres un especialista en documentación médica. Crea documentación completa:
- Nota SOAP estructurada
- Códigos ICD-10 apropiados
- Códigos de facturación
- Requisitos de seguimiento
- Calidad de documentación

Asegura precisión, completitud y cumplimiento regulatorio.`

      default:
        return 'Eres un asistente médico especializado. Proporciona respuestas precisas y profesionales.'
    }
  }

  static getJsonFormatRequirements(decisionType: MedicalDecisionType): string {
    switch (decisionType) {
      case 'diagnosis':
        return `\n\nRETURN ONLY JSON with this exact structure:
{
  "differentials": [{"condition": "string", "icd10": "string", "probability": 0.0-1.0, "evidence": ["string"]}],
  "tests_recommended": ["string"],
  "red_flags": ["string"],
  "urgency_level": 1-5,
  "next_steps": ["string"]
}`

      case 'triage':
        return `\n\nRETURN ONLY JSON with this exact structure:
{
  "acuity_level": 1-5,
  "disposition": "immediate|urgent|semi_urgent|standard|non_urgent",
  "time_to_physician": "string",
  "required_resources": ["string"],
  "warning_signs": ["string"]
}`

      case 'validation':
        return `\n\nRETURN ONLY JSON with this exact structure:
{
  "valid": true|false,
  "concerns": ["string"],
  "risk_assessment": {"level": "low|moderate|high|critical", "factors": ["string"]},
  "requires_human_review": true|false,
  "recommendations": ["string"]
}`

      case 'treatment':
        return `\n\nRETURN ONLY JSON with this exact structure:
{
  "medications": [{"drug": "string", "dosage": "string", "frequency": "string", "duration": "string", "contraindications": ["string"]}],
  "procedures": ["string"],
  "lifestyle_modifications": ["string"],
  "monitoring_plan": ["string"]
}`

      case 'documentation':
        return `\n\nRETURN ONLY JSON with this exact structure:
{
  "soap": {
    "subjective": "string",
    "objective": "string", 
    "assessment": "string",
    "plan": "string"
  },
  "icd10_codes": ["string"],
  "billing_codes": ["string"],
  "follow_up_required": true|false
}`

      default:
        return '\n\nRETURN ONLY valid JSON format.'
    }
  }

  static getContextualPromptAdditions(
    decisionType: MedicalDecisionType,
    previousDecisions?: any[],
    context?: Record<string, unknown>
  ): string {
    let additions = ''

    // Add previous decisions context
    if (previousDecisions && previousDecisions.length > 0) {
      additions += `\n\n## DECISIONES PREVIAS:\n`
      previousDecisions.forEach((decision, idx) => {
        additions += `${idx + 1}. ${JSON.stringify(decision, null, 2)}\n`
      })
    }

    // Add medical context
    if (context && Object.keys(context).length > 0) {
      additions += `\n\n## CONTEXTO MÉDICO ADICIONAL:\n`
      
      if (context.activeSymptoms) {
        additions += `\nSíntomas activos: ${JSON.stringify(context.activeSymptoms)}`
      }
      
      if (context.activeHypotheses) {
        additions += `\nHipótesis activas: ${JSON.stringify(context.activeHypotheses)}`
      }
      
      if (context.relevantInsights) {
        additions += `\nInsights relevantes: ${JSON.stringify(context.relevantInsights)}`
      }
      
      if (context.recentInputs) {
        additions += `\nEntradas recientes: ${JSON.stringify(context.recentInputs)}`
      }
      
      // Add any other context
      const otherContext = { ...context }
      delete otherContext.activeSymptoms
      delete otherContext.activeHypotheses
      delete otherContext.relevantInsights
      delete otherContext.recentInputs
      
      if (Object.keys(otherContext).length > 0) {
        additions += `\nContexto adicional: ${JSON.stringify(otherContext, null, 2)}`
      }
    }

    return additions
  }
}