// Agente de Calidad Médica con Streaming Real - Creado por Bernard Orozco

import { BaseAgent, SimpleDecisionRequest } from './BaseAgent'
import { ClaudeAdapter } from '../decision-engine/providers/claude'

// SOLID: Single Responsibility - Una responsabilidad por interfaz
interface QualityMetrics {
  overall_score: number
  language_consistency: number
  medical_professionalism: number
  clinical_completeness: number
}

interface MedicalQualityDecision {
  should_improve: boolean
  metrics: QualityMetrics
  improved_response?: string
  confidence: number
  reasoning: string
}

// SOLID: Interface Segregation - Interfaces específicas
interface QualityValidator {
  validateLanguage(text: string): number
  validateProfessionalism(text: string): number
  validateCompleteness(text: string): number
}

interface ResponseImprover {
  improveResponse(original: string, context: string): Promise<string>
}

// SOLID: Single Responsibility - Validador específico
class MedicalQualityValidator implements QualityValidator {
  validateLanguage(text: string): number {
    const spanishTerms = /\b(paciente|diagnóstico|tratamiento|síntomas)\b/gi
    const englishTerms = /\b(patient|diagnosis|treatment|symptoms)\b/gi
    
    const hasSpanish = spanishTerms.test(text)
    const hasEnglish = englishTerms.test(text)
    
    // Penalizar mezcla de idiomas
    return hasSpanish && hasEnglish ? 30 : 85
  }

  validateProfessionalism(text: string): number {
    const emojiCount = (text.match(/[\u2600-\u27BF]|[\uD800-\uDBFF][\uDC00-\uDFFF]/g) || []).length
    const hasSystemMeta = /procesamiento cognitivo|confianza del sistema/i.test(text)
    
    let score = 90
    if (emojiCount > 0) score -= emojiCount * 20
    if (hasSystemMeta) score -= 30
    
    return Math.max(0, score)
  }

  validateCompleteness(text: string): number {
    const clinicalElements = [
      /diagnóstico|diagnosis/i,
      /tratamiento|treatment/i,
      /seguimiento|follow.?up/i
    ]
    
    const presentElements = clinicalElements.filter(regex => regex.test(text)).length
    return (presentElements / clinicalElements.length) * 100
  }
}

// SOLID: Single Responsibility - Mejorador específico
class ClaudeResponseImprover implements ResponseImprover {
  constructor(private claudeAdapter: ClaudeAdapter) {}

  async improveResponse(original: string, context: string): Promise<string> {
    const systemPrompt = `Eres un especialista médico. Mejora esta respuesta eliminando:
- Emojis y lenguaje informal
- Metadatos del sistema
- Mezcla de idiomas
Mantén solo contenido clínico profesional.`

    const userPrompt = `Contexto del paciente: ${context}
Respuesta original: ${original}

Proporciona una respuesta médica profesional mejorada:`

    const result = await this.claudeAdapter.makeRequest(systemPrompt, userPrompt)
    return result.success ? result.content : original
  }
}

// SOLID: Open/Closed - Extensible sin modificación
export class ResponseQualityAgent extends BaseAgent<MedicalQualityDecision> {
  private validator: QualityValidator
  private improver: ResponseImprover

  constructor(claudeAdapter?: ClaudeAdapter) {
    super('response_quality', 'ResponseQualityAgent v3.0 - Real Claude Integration')
    
    // SOLID: Dependency Injection
    this.validator = new MedicalQualityValidator()
    this.improver = new ClaudeResponseImprover(claudeAdapter || new ClaudeAdapter())
  }

  async makeDecision(request: SimpleDecisionRequest) {
    try {
      const context = request.context?.user_input || ''
      const response = request.context?.current_response || ''

      // DRY: Métricas unificadas
      const metrics = this.calculateMetrics(response)
      const needsImprovement = this.shouldImprove(metrics)

      let improvedResponse: string | undefined
      if (needsImprovement) {
        improvedResponse = await this.improver.improveResponse(response, context)
      }

      const decision: MedicalQualityDecision = {
        should_improve: needsImprovement,
        metrics,
        improved_response: improvedResponse,
        confidence: metrics.overall_score / 100,
        reasoning: this.generateReasoning(metrics)
      }

      return this.createSuccessResponse(
        decision,
        decision.confidence,
        request.timestamp,
        decision.reasoning
      )

    } catch (error) {
      return this.createErrorResponse(
        `Quality agent error: ${error}`,
        request.timestamp
      )
    }
  }

  // DRY: Método unificado para métricas
  private calculateMetrics(text: string): QualityMetrics {
    const language = this.validator.validateLanguage(text)
    const professionalism = this.validator.validateProfessionalism(text)
    const completeness = this.validator.validateCompleteness(text)
    
    return {
      language_consistency: language,
      medical_professionalism: professionalism,
      clinical_completeness: completeness,
      overall_score: (language + professionalism + completeness) / 3
    }
  }

  // SOLID: Single Responsibility - Una decisión clara
  private shouldImprove(metrics: QualityMetrics): boolean {
    return metrics.overall_score < 70 || 
           metrics.language_consistency < 60 || 
           metrics.medical_professionalism < 60
  }

  // DRY: Generación uniforme de reasoning
  private generateReasoning(metrics: QualityMetrics): string {
    if (metrics.overall_score >= 70) {
      return `Calidad apropiada (${Math.round(metrics.overall_score)}%)`
    }

    const issues = []
    if (metrics.language_consistency < 60) issues.push('inconsistencia idioma')
    if (metrics.medical_professionalism < 60) issues.push('falta profesionalismo')
    if (metrics.clinical_completeness < 60) issues.push('información incompleta')

    return `Requiere mejora (${Math.round(metrics.overall_score)}%): ${issues.join(', ')}`
  }
}