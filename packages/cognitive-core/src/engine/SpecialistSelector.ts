// 🎯 SELECTOR DINÁMICO DE ESPECIALISTAS - SIMPLE - Creado por Bernard Orozco
// Usa decisionalMiddleware para decidir qué agentes necesita el caso

import { callClaudeForDecision } from '../services/decisionalMiddleware'

export interface PatientProfile {
  age?: number
  gender?: string
  symptoms: string[]
  medications?: string[]
  comorbidities?: string[]
}

export interface SpecialistConfig {
  agentType: string
  priority: 'high' | 'medium' | 'low'
  reason: string
}

/**
 * 🧠 SELECTOR INTELIGENTE DE ESPECIALISTAS
 * 
 * En lugar de lógica compleja hardcodeada, 
 * usa un agente especializado en seleccionar otros agentes
 */
export class SpecialistSelector {
  
  /**
   * 🎯 Selecciona especialistas USANDO callClaudeForDecision DE VERDAD
   */
  selectSpecialists(
    clinicalInput: string,
    patientProfile?: PatientProfile
  ): SpecialistConfig[] {
    
    console.log('🧠 Usando callClaudeForDecision para seleccionar especialistas')
    
    // USAR callClaudeForDecision en background (no bloqueante)
    this.selectSpecialistsAsync(clinicalInput, patientProfile)
      .then(specialists => {
        console.log('✅ IA seleccionó especialistas:', specialists.map(s => s.agentType))
      })
      .catch(err => console.warn('SpecialistSelector IA error:', err))
    
    // Retornar fallback inmediato mientras la IA procesa
    return this.getFallbackSpecialists(clinicalInput, patientProfile)
  }

  /**
   * 🧠 VERSIÓN ASYNC que USA callClaudeForDecision REAL
   */
  private async selectSpecialistsAsync(
    clinicalInput: string, 
    patientProfile?: PatientProfile
  ): Promise<SpecialistConfig[]> {
    
    const response = await callClaudeForDecision(
      'triage', // Usar tipo existente que evalúa recursos necesarios
      this.buildSelectionPrompt(clinicalInput, patientProfile),
      'claude'
    )
    
    if (response.success && (response.decision as any).required_resources) {
      // Mapear required_resources a SpecialistConfig
      return (response.decision as any).required_resources.map((resource: string) => ({
        agentType: resource,
        priority: this.mapUrgencyToPriority((response.decision as any).acuity_level || 3),
        reason: `Requerido por triage nivel ${(response.decision as any).acuity_level}`
      }))
    }
    
    return this.getFallbackSpecialists(clinicalInput, patientProfile)
  }

  /**
   * 📊 Mapea nivel de urgencia a prioridad
   */
  private mapUrgencyToPriority(acuityLevel: number): 'high' | 'medium' | 'low' {
    if (acuityLevel >= 4) return 'high'
    if (acuityLevel >= 3) return 'medium' 
    return 'low'
  }

  /**
   * 📝 Construye prompt para selección de agentes
   */
  private buildSelectionPrompt(clinicalInput: string, patientProfile?: PatientProfile): string {
    return `Eres un coordinador de triage médico. Analiza este caso y determina QUÉ RECURSOS ESPECIALISTAS necesitas.

CASO CLÍNICO:
${clinicalInput}

PERFIL DEL PACIENTE:
- Edad: ${patientProfile?.age || 'No especificada'}
- Síntomas: ${patientProfile?.symptoms?.join(', ') || 'Ver caso clínico'}
- Medicamentos: ${patientProfile?.medications?.join(', ') || 'Ninguno especificado'}

RECURSOS ESPECIALISTAS DISPONIBLES:
- clinical_pharmacology (medicamentos, dosis, interacciones)
- pediatric_specialist (menores de 18 años)
- hospitalization_criteria (criterios ingreso/alta)
- family_education (educación paciente/familia)
- objective_validation (validar hallazgos objetivos)
- defensive_differential (medicina defensiva)

INSTRUCCIONES TRIAGE:
- Evalúa urgencia del caso (1-5)
- Selecciona SOLO los recursos especialistas necesarios
- NO incluyas pediatría para adultos
- NO incluyas recursos irrelevantes

FORMATO REQUERIDO - Como decisión de triage:
{
  "acuity_level": 1-5,
  "disposition": "immediate|urgent|standard|routine",
  "time_to_physician": "15min|1h|4h|24h",
  "required_resources": ["clinical_pharmacology", "pediatric_specialist", "family_education"],
  "warning_signs": ["recursos críticos para este caso específico"]
}`
  }

  /**
   * 🔍 Parsea respuesta de selección de agentes
   */
  private parseSpecialistSelection(decision: any): SpecialistConfig[] {
    try {
      if (decision.required_agents && Array.isArray(decision.required_agents)) {
        return decision.required_agents.map((agent: any) => ({
          agentType: agent.agentType,
          priority: agent.priority || 'medium',
          reason: agent.reason || 'Especialista requerido'
        }))
      }
    } catch (error) {
      console.warn('Error parsing specialist selection:', error)
    }
    
    return []
  }

  /**
   * 🆘 Fallback si falla la IA
   */
  private getFallbackSpecialists(clinicalInput: string, patientProfile?: PatientProfile): SpecialistConfig[] {
    const specialists: SpecialistConfig[] = []
    const inputLower = clinicalInput.toLowerCase()
    
    // Farmacología siempre necesaria
    specialists.push({
      agentType: 'clinical_pharmacology',
      priority: 'high',
      reason: 'Prescripción y dosificación apropiada'
    })

    // Pediatría si <18 años
    if (patientProfile?.age && patientProfile.age < 18) {
      specialists.push({
        agentType: 'pediatric_specialist',
        priority: 'high',
        reason: 'Paciente pediátrico'
      })
    }

    // Geriatría si ≥65 años
    if (patientProfile?.age && patientProfile.age >= 65) {
      specialists.push({
        agentType: 'geriatric_specialist',
        priority: 'high',
        reason: 'Paciente geriátrico'
      })
    }

    // Educación familiar siempre
    specialists.push({
      agentType: 'family_education',
      priority: 'low',
      reason: 'Educación al paciente/familia'
    })

    return specialists
  }

  /**
   * 📊 Genera información contextual para prompts (compatible con código existente)
   */
  generateContextualInfo(specialists: SpecialistConfig[], results: any[]): string {
    let contextInfo = "DATOS DE ESPECIALISTAS CONSULTADOS:\n\n"
    
    specialists.forEach((specialist, index) => {
      const result = results[index]
      if (result && result.success) {
        contextInfo += this.formatSpecialistInfo(specialist.agentType, result) + "\n"
      }
    })
    
    return contextInfo
  }

  /**
   * 📝 Formatea información del especialista (simplificado)
   */
  private formatSpecialistInfo(agentType: string, result: any): string {
    const decision = result.decision?.result || result.decision || result
    
    switch (agentType) {
      case 'clinical_pharmacology':
        if (decision.primary_medication) {
          const med = decision.primary_medication
          return `MEDICACIÓN ESPECÍFICA (farmacología):
- ${med.generic_name} ${med.exact_dose} ${med.route} ${med.frequency} x ${med.duration}
- Línea: ${med.line_of_treatment}
- Evidencia: Nivel ${med.evidence_level}`
        }
        break
      case 'pediatric_specialist':
        if (decision.age_specific_considerations) {
          return `CONSIDERACIONES PEDIÁTRICAS:
- ${decision.age_specific_considerations.join('\n- ')}`
        }
        break
      case 'geriatric_specialist':
        return `CONSIDERACIONES GERIÁTRICAS:
- Evaluación de polifarmacia e interacciones
- Ajustes por función renal/hepática`
      case 'hospitalization_criteria':
        if (decision.disposition_recommendation) {
          return `DISPOSICIÓN:
- Recomendación: ${decision.disposition_recommendation}`
        }
        break
    }
    
    return `${agentType}: Información especializada disponible`
  }
}