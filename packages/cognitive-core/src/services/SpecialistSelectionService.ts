// 🎯 CLEAN ARCHITECTURE - Servicio de Selección de Especialistas
// Usa decisionalMiddleware REAL en lugar de lógica hardcodeada

import { callClaudeForDecision } from './decisionalMiddleware'

export interface SpecialistRecommendation {
  agentType: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  reason: string
  confidence: number
}

/**
 * 🧠 SERVICIO LIMPIO que usa decisionalMiddleware para TODO
 */
export class SpecialistSelectionService {
  
  /**
   * 🎯 Determina qué especialistas se necesitan usando IA
   */
  async selectRequiredSpecialists(clinicalCase: string): Promise<SpecialistRecommendation[]> {
    try {
      const response = await callClaudeForDecision(
        'triage', // Usar tipo existente que evalúa urgencia y recursos
        this.buildSpecialistSelectionPrompt(clinicalCase),
        'claude'
      )
      
      if (response.success) {
        return this.parseSpecialistRecommendations(response.decision)
      }
    } catch (error) {
      console.warn('SpecialistSelectionService fallback:', error)
    }
    
    // Fallback mínimo
    return this.getMinimalSpecialists()
  }

  /**
   * 📝 Construye prompt para selección inteligente de especialistas
   */
  private buildSpecialistSelectionPrompt(clinicalCase: string): string {
    return `Eres un coordinador médico experto. Analiza este caso y determina QUÉ ESPECIALISTAS necesitas consultar.

CASO CLÍNICO:
${clinicalCase}

ESPECIALISTAS DISPONIBLES:
- clinical_pharmacology (medicamentos, dosis, interacciones)
- pediatric_specialist (menores de 18 años)
- hospitalization_criteria (criterios ingreso/alta)
- family_education (educación paciente/familia)
- objective_validation (validar hallazgos objetivos)
- defensive_differential (medicina defensiva)

INSTRUCCIONES:
- Selecciona SOLO los especialistas necesarios para este caso específico
- NO consultes pediatría para adultos
- NO consultes geriatría para jóvenes
- Prioriza por urgencia y relevancia clínica

FORMATO REQUERIDO - Devuelve como si fuera decisión de triage:
{
  "acuity_level": 1-5,
  "disposition": "immediate|urgent|standard",
  "time_to_physician": "15min|1h|4h",
  "required_resources": ["clinical_pharmacology", "pediatric_specialist", "family_education"],
  "warning_signs": ["especialistas críticos para este caso"]
}`
  }

  /**
   * 🔍 Parsea respuesta de IA a especialistas recomendados
   */
  private parseSpecialistRecommendations(decision: any): SpecialistRecommendation[] {
    const specialists: SpecialistRecommendation[] = []
    
    if (decision.required_resources && Array.isArray(decision.required_resources)) {
      decision.required_resources.forEach((resource: string) => {
        if (this.isValidSpecialist(resource)) {
          specialists.push({
            agentType: resource,
            priority: this.mapUrgencyToPriority(decision.acuity_level || 3),
            reason: `Requerido por triage nivel ${decision.acuity_level}`,
            confidence: 0.85
          })
        }
      })
    }
    
    return specialists
  }

  /**
   * 🔒 Valida que el especialista existe
   */
  private isValidSpecialist(agentType: string): boolean {
    const validSpecialists = [
      'clinical_pharmacology',
      'pediatric_specialist', 
      'hospitalization_criteria',
      'family_education',
      'objective_validation',
      'defensive_differential'
    ]
    
    return validSpecialists.includes(agentType)
  }

  /**
   * 📊 Mapea nivel de urgencia a prioridad
   */
  private mapUrgencyToPriority(acuityLevel: number): 'critical' | 'high' | 'medium' | 'low' {
    if (acuityLevel >= 4) return 'critical'
    if (acuityLevel >= 3) return 'high'
    if (acuityLevel >= 2) return 'medium'
    return 'low'
  }

  /**
   * 🆘 Especialistas mínimos si falla la IA
   */
  private getMinimalSpecialists(): SpecialistRecommendation[] {
    return [
      {
        agentType: 'clinical_pharmacology',
        priority: 'high',
        reason: 'Farmacología siempre necesaria',
        confidence: 0.9
      },
      {
        agentType: 'family_education',
        priority: 'medium',
        reason: 'Educación siempre recomendada',
        confidence: 0.8
      }
    ]
  }
}

// Singleton para reutilizar
export const specialistSelectionService = new SpecialistSelectionService()