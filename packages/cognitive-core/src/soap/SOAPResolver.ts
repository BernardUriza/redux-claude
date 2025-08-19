// 🧠 SOAP Resolver - Orquestación de Agentes Multi-Máscara para SOAP
// Creado por Bernard Orozco - Actualizado Fase 1 con NOM-004-SSA3-2012

import { BaseAgent } from '../agents/BaseAgent'
import { callClaudeForDecision } from '../services/decisionalMiddleware'
import { SOAPProcessor } from './SOAPProcessor'
import type { SOAPAnalysis } from '../types/medical'
import { SOAPPrompts } from './SOAPPrompts'
import type { 
  DiagnosticDecision, 
  ValidationDecision, 
  TreatmentDecision, 
  TriageDecision,
  DocumentationDecision 
} from '../types/agents'

export interface SOAPSection {
  subjetivo: string
  objetivo: string
  analisis: string
  plan: string
}

export interface SOAPResult {
  soap: SOAPSection
  soapFormal: SOAPAnalysis // Nueva estructura formal NOM-004
  confidence: number
  agentDecisions: AgentPersonalityResult[]
  metadata: {
    processingTime: number
    agentsUsed: string[]
    consensusLevel: number
    warningFlags: string[]
    version: 'v2.0-NOM-004' // Indicador de nueva versión
    normativaCompliant: boolean
  }
}

export interface AgentPersonalityResult {
  agentName: string
  personality: AgentPersonality
  decision: any
  confidence: number
  reasoning: string
  sectionContribution: keyof SOAPSection
}

// 🎭 PERSONALIDADES DE AGENTES MÉDICOS ESPECÍFICAS
export enum AgentPersonality {
  EMERGENCY_PHYSICIAN = 'emergency_physician',    // Medicina defensiva, prioriza gravedad
  INTERNAL_MEDICINE = 'internal_medicine',        // Analítico, sistemático, diferencial amplio
  FAMILY_MEDICINE = 'family_medicine',            // Holístico, preventivo, biopsicosocial
  SPECIALIST_CONSULTANT = 'specialist_consultant', // Experto profundo, evidencia específica
  CLINICAL_VALIDATOR = 'clinical_validator'       // Auditor clínico, valida coherencia
}

/**
 * 🧠 Resolver SOAP con Agentes Multi-Máscara
 * 
 * Cada sección SOAP es resuelta por agentes con personalidades específicas:
 * - SUBJETIVO: Family Medicine (escucha holística)
 * - OBJETIVO: Internal Medicine (sistematización)
 * - ANÁLISIS: Emergency + Specialist (medicina defensiva + expertise)
 * - PLAN: Internal + Validator (integración + validación)
 */
export class SOAPResolver {
  private agentPersonalities: Map<AgentPersonality, AgentPersonalityConfig>
  private soapProcessor: SOAPProcessor

  constructor() {
    this.agentPersonalities = this.initializeAgentPersonalities()
    this.soapProcessor = new SOAPProcessor()
  }

  /**
   * 🎯 Proceso SOAP completo con múltiples agentes + Estructura Formal NOM-004
   */
  async resolveSOAP(clinicalInput: string): Promise<SOAPResult> {
    const startTime = Date.now()
    const agentDecisions: AgentPersonalityResult[] = []
    let warningFlags: string[] = []

    console.log('🧠 Iniciando resolución SOAP multi-agente NOM-004-SSA3-2012...')

    try {
      // 🏥 FASE 1: Procesamiento SOAP Formal (NOM-004-SSA3-2012)
      console.log('📋 Generando estructura SOAP formal...')
      const soapFormalAnalysis = await this.soapProcessor.processCase(clinicalInput)
      console.log(`✅ SOAP formal completado: ${soapFormalAnalysis.metadata?.calidad?.cumplimientoNormativo || 0}% normativo`)

      // 🎭 FASE 2: Procesamiento Multi-Agente (Enriquecimiento)
      // 📋 SECCIÓN S - SUBJETIVO (Family Medicine)
      console.log('👨‍⚕️ Procesando SUBJETIVO con Family Medicine...')
      const subjetivoResult = await this.resolveSubjetivo(clinicalInput)
      agentDecisions.push(subjetivoResult)

      // 🔬 SECCIÓN O - OBJETIVO (Internal Medicine) 
      console.log('🔬 Procesando OBJETIVO con Internal Medicine...')
      const objetivoResult = await this.resolveObjetivo(clinicalInput, subjetivoResult)
      agentDecisions.push(objetivoResult)

      // ⚡ SECCIÓN A - ANÁLISIS (Emergency + Specialist Consensus)
      console.log('⚡ Procesando ANÁLISIS con Emergency + Specialist...')
      const analisisResults = await this.resolveAnalisis(clinicalInput, subjetivoResult, objetivoResult)
      agentDecisions.push(...analisisResults)

      // 📝 SECCIÓN P - PLAN (Internal + Validator)
      console.log('📝 Procesando PLAN con Internal + Validator...')
      const planResults = await this.resolvePlan(clinicalInput, agentDecisions)
      agentDecisions.push(...planResults)

      // 🔄 Síntesis final
      const soapSynthesis = this.synthesizeSOAPSections(agentDecisions)
      const consensusLevel = this.calculateConsensusLevel(agentDecisions)
      
      // ⚠️ Detectar flags de advertencia
      warningFlags = this.detectWarningFlags(agentDecisions)

      const result: SOAPResult = {
        soap: soapSynthesis,
        soapFormal: soapFormalAnalysis, // Estructura NOM-004 completa
        confidence: this.calculateOverallConfidence(agentDecisions),
        agentDecisions,
        metadata: {
          processingTime: Date.now() - startTime,
          agentsUsed: agentDecisions.map(d => d.agentName),
          consensusLevel,
          warningFlags,
          version: 'v2.0-NOM-004',
          normativaCompliant: (soapFormalAnalysis.metadata?.calidad?.cumplimientoNormativo || 0) >= 90
        }
      }

      console.log('✅ SOAP resuelto exitosamente:', result.metadata)
      return result

    } catch (error) {
      console.error('❌ Error en resolución SOAP:', error)
      throw new Error(`SOAP Resolution failed: ${error}`)
    }
  }

  /**
   * 📋 S - SUBJETIVO: Lo que dice el paciente (Family Medicine)
   */
  private async resolveSubjetivo(input: string): Promise<AgentPersonalityResult> {
    const personality = this.agentPersonalities.get(AgentPersonality.FAMILY_MEDICINE)!
    
    const decision = await callClaudeForDecision(
      'diagnosis',
      input,
      'claude',
      undefined,
      undefined,
      { 
        agentPersonality: AgentPersonality.FAMILY_MEDICINE,
        soapSection: 'subjetivo',
        systemPrompt: personality.systemPrompt
      }
    )

    return {
      agentName: 'Family Medicine Physician',
      personality: AgentPersonality.FAMILY_MEDICINE,
      decision: decision.decision,
      confidence: decision.confidence,
      reasoning: 'Análisis holístico del relato del paciente con enfoque biopsicosocial',
      sectionContribution: 'subjetivo'
    }
  }

  /**
   * 🔬 O - OBJETIVO: Hallazgos verificables (Internal Medicine)
   */
  private async resolveObjetivo(input: string, subjetivoResult: AgentPersonalityResult): Promise<AgentPersonalityResult> {
    const personality = this.agentPersonalities.get(AgentPersonality.INTERNAL_MEDICINE)!
    
    const decision = await callClaudeForDecision(
      'validation',
      input,
      'claude',
      undefined,
      [subjetivoResult.decision],
      { 
        agentPersonality: AgentPersonality.INTERNAL_MEDICINE,
        soapSection: 'objetivo',
        systemPrompt: personality.systemPrompt,
        previousSection: subjetivoResult
      }
    )

    return {
      agentName: 'Internal Medicine Specialist',
      personality: AgentPersonality.INTERNAL_MEDICINE,
      decision: decision.decision,
      confidence: decision.confidence,
      reasoning: 'Sistematización de hallazgos físicos y datos objetivos correlacionados',
      sectionContribution: 'objetivo'
    }
  }

  /**
   * ⚡ A - ANÁLISIS: Diagnóstico diferencial (Emergency + Specialist)
   */
  private async resolveAnalisis(
    input: string, 
    subjetivoResult: AgentPersonalityResult,
    objetivoResult: AgentPersonalityResult
  ): Promise<AgentPersonalityResult[]> {
    
    const previousDecisions = [subjetivoResult.decision, objetivoResult.decision]
    
    // 🚨 Emergency Physician: Medicina defensiva, prioriza gravedad
    const emergencyPersonality = this.agentPersonalities.get(AgentPersonality.EMERGENCY_PHYSICIAN)!
    const emergencyDecision = await callClaudeForDecision(
      'triage',
      input,
      'claude',
      undefined,
      previousDecisions,
      { 
        agentPersonality: AgentPersonality.EMERGENCY_PHYSICIAN,
        soapSection: 'analisis',
        systemPrompt: emergencyPersonality.systemPrompt,
        focus: 'gravity_priority'
      }
    )

    // 🎯 Specialist: Expertise profundo, diagnóstico específico
    const specialistPersonality = this.agentPersonalities.get(AgentPersonality.SPECIALIST_CONSULTANT)!
    const specialistDecision = await callClaudeForDecision(
      'diagnosis',
      input,
      'claude',
      undefined,
      previousDecisions,
      { 
        agentPersonality: AgentPersonality.SPECIALIST_CONSULTANT,
        soapSection: 'analisis',
        systemPrompt: specialistPersonality.systemPrompt,
        focus: 'differential_expertise'
      }
    )

    return [
      {
        agentName: 'Emergency Physician',
        personality: AgentPersonality.EMERGENCY_PHYSICIAN,
        decision: emergencyDecision.decision,
        confidence: emergencyDecision.confidence,
        reasoning: 'Medicina defensiva: priorización por gravedad y urgencia',
        sectionContribution: 'analisis'
      },
      {
        agentName: 'Specialist Consultant',
        personality: AgentPersonality.SPECIALIST_CONSULTANT,
        decision: specialistDecision.decision,
        confidence: specialistDecision.confidence,
        reasoning: 'Expertise especializado: diagnóstico diferencial profundo',
        sectionContribution: 'analisis'
      }
    ]
  }

  /**
   * 📝 P - PLAN: Tratamiento integrado (Internal + Validator)
   */
  private async resolvePlan(
    input: string,
    allPreviousDecisions: AgentPersonalityResult[]
  ): Promise<AgentPersonalityResult[]> {
    
    const previousDecisions = allPreviousDecisions.map(d => d.decision)
    
    // 🎯 Internal Medicine: Plan de tratamiento integrado
    const internalPersonality = this.agentPersonalities.get(AgentPersonality.INTERNAL_MEDICINE)!
    const treatmentDecision = await callClaudeForDecision(
      'treatment',
      input,
      'claude',
      undefined,
      previousDecisions,
      { 
        agentPersonality: AgentPersonality.INTERNAL_MEDICINE,
        soapSection: 'plan',
        systemPrompt: internalPersonality.systemPrompt,
        focus: 'comprehensive_treatment'
      }
    )

    // ✅ Clinical Validator: Validación de coherencia y seguridad
    const validatorPersonality = this.agentPersonalities.get(AgentPersonality.CLINICAL_VALIDATOR)!
    const validationDecision = await callClaudeForDecision(
      'validation',
      JSON.stringify({ originalInput: input, treatmentPlan: treatmentDecision.decision }),
      'claude',
      undefined,
      previousDecisions,
      { 
        agentPersonality: AgentPersonality.CLINICAL_VALIDATOR,
        soapSection: 'plan',
        systemPrompt: validatorPersonality.systemPrompt,
        focus: 'safety_validation'
      }
    )

    return [
      {
        agentName: 'Internal Medicine Coordinator',
        personality: AgentPersonality.INTERNAL_MEDICINE,
        decision: treatmentDecision.decision,
        confidence: treatmentDecision.confidence,
        reasoning: 'Coordinación de plan terapéutico integral basado en análisis previo',
        sectionContribution: 'plan'
      },
      {
        agentName: 'Clinical Safety Validator',
        personality: AgentPersonality.CLINICAL_VALIDATOR,
        decision: validationDecision.decision,
        confidence: validationDecision.confidence,
        reasoning: 'Validación de seguridad clínica y coherencia del plan integral',
        sectionContribution: 'plan'
      }
    ]
  }

  /**
   * 🔗 Sintetizar secciones SOAP desde decisiones de agentes
   */
  private synthesizeSOAPSections(agentDecisions: AgentPersonalityResult[]): SOAPSection {
    const subjetivoAgents = agentDecisions.filter(d => d.sectionContribution === 'subjetivo')
    const objetivoAgents = agentDecisions.filter(d => d.sectionContribution === 'objetivo')
    const analisisAgents = agentDecisions.filter(d => d.sectionContribution === 'analisis')
    const planAgents = agentDecisions.filter(d => d.sectionContribution === 'plan')

    return {
      subjetivo: this.synthesizeSubjetivo(subjetivoAgents),
      objetivo: this.synthesizeObjetivo(objetivoAgents),
      analisis: this.synthesizeAnalisis(analisisAgents),
      plan: this.synthesizePlan(planAgents)
    }
  }

  /**
   * 🎭 Configuración de personalidades de agentes
   */
  private initializeAgentPersonalities(): Map<AgentPersonality, AgentPersonalityConfig> {
    const personalities = new Map<AgentPersonality, AgentPersonalityConfig>()

    personalities.set(AgentPersonality.FAMILY_MEDICINE, {
      name: 'Family Medicine Physician',
      systemPrompt: SOAPPrompts.getPersonalityPrompt('family_medicine', 'S'),
      specialty: 'Medicina Familiar',
      focus: 'holistic_patient_narrative'
    })

    personalities.set(AgentPersonality.INTERNAL_MEDICINE, {
      name: 'Internal Medicine Specialist',
      systemPrompt: SOAPPrompts.getPersonalityPrompt('internal_medicine', 'O'),
      specialty: 'Medicina Interna',
      focus: 'systematic_correlation'
    })

    personalities.set(AgentPersonality.EMERGENCY_PHYSICIAN, {
      name: 'Emergency Physician',
      systemPrompt: SOAPPrompts.getPersonalityPrompt('emergency_physician', 'A'),
      specialty: 'Medicina de Urgencias',
      focus: 'gravity_over_probability'
    })

    personalities.set(AgentPersonality.SPECIALIST_CONSULTANT, {
      name: 'Specialist Consultant',
      systemPrompt: SOAPPrompts.getPersonalityPrompt('specialist_consultant', 'A'),
      specialty: 'Consultoría Especializada',
      focus: 'expert_differential'
    })

    personalities.set(AgentPersonality.CLINICAL_VALIDATOR, {
      name: 'Clinical Safety Validator',
      systemPrompt: SOAPPrompts.getPersonalityPrompt('clinical_validator', 'P'),
      specialty: 'Validación Clínica',
      focus: 'safety_quality_assurance'
    })

    return personalities
  }

  // Métodos auxiliares de síntesis
  private synthesizeSubjetivo(agents: AgentPersonalityResult[]): string {
    const familyAgent = agents.find(a => a.personality === AgentPersonality.FAMILY_MEDICINE)
    if (!familyAgent) return "Paciente refiere síntomas que requieren evaluación médica."
    
    const decision = familyAgent.decision as DiagnosticDecision
    return `**Motivo de consulta:** ${decision.differentials?.[0]?.condition || 'Síntomas reportados'}\n\n` +
           `**Historia actual:** ${decision.differentials?.map(d => d.evidence?.join(', ')).join('; ') || 'Según relato del paciente'}\n\n` +
           `**Contexto:** ${familyAgent.reasoning}`
  }

  private synthesizeObjetivo(agents: AgentPersonalityResult[]): string {
    const internalAgent = agents.find(a => a.personality === AgentPersonality.INTERNAL_MEDICINE)
    if (!internalAgent) return "Pendiente exploración física completa."
    
    const decision = internalAgent.decision as ValidationDecision
    return `**Signos vitales:** Pendientes de medición\n\n` +
           `**Exploración física:** ${decision.recommendations?.join(', ') || 'Exploración dirigida pendiente'}\n\n` +
           `**Hallazgos relevantes:** ${decision.concerns?.join(', ') || 'A determinar por exploración'}`
  }

  private synthesizeAnalisis(agents: AgentPersonalityResult[]): string {
    const emergencyAgent = agents.find(a => a.personality === AgentPersonality.EMERGENCY_PHYSICIAN)
    const specialistAgent = agents.find(a => a.personality === AgentPersonality.SPECIALIST_CONSULTANT)
    
    let analisis = "## ANÁLISIS CLÍNICO\n\n"
    
    if (emergencyAgent) {
      const triageDecision = emergencyAgent.decision as TriageDecision
      analisis += `**Triage de gravedad (Medicina defensiva):**\n`
      analisis += `- Nivel de urgencia: ${triageDecision.acuity_level}/5\n`
      analisis += `- Disposición: ${triageDecision.disposition}\n`
      analisis += `- Señales de alarma: ${triageDecision.warning_signs?.join(', ') || 'Ninguna identificada'}\n\n`
    }
    
    if (specialistAgent) {
      const diagDecision = specialistAgent.decision as DiagnosticDecision
      analisis += `**Diagnóstico diferencial especializado:**\n`
      diagDecision.differentials?.forEach((diff, idx) => {
        analisis += `${idx + 1}. **${diff.condition}** (${Math.round(diff.probability * 100)}%)\n`
        analisis += `   - CIE-10: ${diff.icd10}\n`
        analisis += `   - Evidencia: ${diff.evidence?.join(', ')}\n\n`
      })
    }
    
    return analisis
  }

  private synthesizePlan(agents: AgentPersonalityResult[]): string {
    const treatmentAgent = agents.find(a => a.personality === AgentPersonality.INTERNAL_MEDICINE && a.sectionContribution === 'plan')
    const validatorAgent = agents.find(a => a.personality === AgentPersonality.CLINICAL_VALIDATOR)
    
    let plan = "## PLAN TERAPÉUTICO\n\n"
    
    if (treatmentAgent) {
      const treatment = treatmentAgent.decision as TreatmentDecision
      
      if (treatment.medications?.length > 0) {
        plan += `**Tratamiento farmacológico:**\n`
        treatment.medications.forEach(med => {
          plan += `- **${med.drug}**: ${med.dosage}, ${med.frequency}, ${med.duration}\n`
          if (med.contraindications?.length > 0) {
            plan += `  ⚠️ Contraindicaciones: ${med.contraindications.join(', ')}\n`
          }
        })
        plan += '\n'
      }
      
      if (treatment.procedures?.length > 0) {
        plan += `**Procedimientos:**\n`
        treatment.procedures.forEach(proc => plan += `- ${proc}\n`)
        plan += '\n'
      }
      
      if (treatment.monitoring_plan?.length > 0) {
        plan += `**Seguimiento:**\n`
        treatment.monitoring_plan.forEach(monitor => plan += `- ${monitor}\n`)
        plan += '\n'
      }
    }
    
    if (validatorAgent) {
      const validation = validatorAgent.decision as ValidationDecision
      if (!validation.valid || validation.requires_human_review) {
        plan += `**⚠️ VALIDACIÓN CLÍNICA:**\n`
        plan += `- Requiere supervisión médica: ${validation.requires_human_review ? 'SÍ' : 'NO'}\n`
        if (validation.concerns?.length > 0) {
          plan += `- Observaciones: ${validation.concerns.join(', ')}\n`
        }
        plan += `- Nivel de riesgo: ${validation.risk_assessment?.level || 'A evaluar'}\n\n`
      }
    }
    
    return plan
  }

  private calculateConsensusLevel(decisions: AgentPersonalityResult[]): number {
    if (decisions.length === 0) return 0
    return decisions.reduce((acc, d) => acc + d.confidence, 0) / decisions.length
  }

  private calculateOverallConfidence(decisions: AgentPersonalityResult[]): number {
    return this.calculateConsensusLevel(decisions)
  }

  private detectWarningFlags(decisions: AgentPersonalityResult[]): string[] {
    const flags: string[] = []
    
    // Flag si hay baja confianza en algún agente crítico
    const criticalAgents = decisions.filter(d => 
      d.personality === AgentPersonality.EMERGENCY_PHYSICIAN || 
      d.personality === AgentPersonality.CLINICAL_VALIDATOR
    )
    
    criticalAgents.forEach(agent => {
      if (agent.confidence < 0.7) {
        flags.push(`Baja confianza en ${agent.agentName}: ${Math.round(agent.confidence * 100)}%`)
      }
    })
    
    // Flag si validator encuentra problemas
    const validator = decisions.find(d => d.personality === AgentPersonality.CLINICAL_VALIDATOR)
    if (validator) {
      const validation = validator.decision as ValidationDecision
      if (!validation.valid) {
        flags.push('Validador clínico detectó inconsistencias')
      }
      if (validation.requires_human_review) {
        flags.push('Requiere revisión médica humana')
      }
    }
    
    return flags
  }
}

interface AgentPersonalityConfig {
  name: string
  systemPrompt: string
  specialty: string
  focus: string
}