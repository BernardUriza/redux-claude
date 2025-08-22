// 🤖 Servicio de Autocompletado Médico Inteligente
// Creado por Bernard Orozco

import { ClaudeAdapter } from '../decision-engine/providers/claude'

export interface AutocompletionSuggestion {
  id: string
  title: string
  description: string
  template: string
  confidence: number
  category: 'basic' | 'detailed' | 'specialized'
}

export interface AutocompletionRequest {
  partialInput: string
  medicalSpecialty?: string
  patientContext?: {
    age?: number
    gender?: string
    previousSymptoms?: string[]
  }
}

export interface AutocompletionResult {
  success: boolean
  suggestions: AutocompletionSuggestion[]
  enhancedTemplate: string
  error?: string
}

export class MedicalAutocompletionService {
  private claudeAdapter: ClaudeAdapter

  constructor() {
    this.claudeAdapter = new ClaudeAdapter()
  }

  async generateCompletionSuggestions(request: AutocompletionRequest): Promise<AutocompletionResult> {
    try {
      const completionPrompt = this.buildCompletionPrompt(request)
      
      const response = await this.claudeAdapter.makeRequest(
        'Eres un asistente médico especializado en estructurar consultas clínicas según estándares profesionales.',
        completionPrompt
      )

      if (!response.success) {
        return {
          success: false,
          suggestions: [],
          enhancedTemplate: '',
          error: response.error || 'Error generando autocompletado'
        }
      }

      return this.parseCompletionResponse(response.content, request.partialInput)
    } catch (error) {
      console.error('Error en autocompletado médico:', error)
      return {
        success: false,
        suggestions: [],
        enhancedTemplate: '',
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  private buildCompletionPrompt(request: AutocompletionRequest): string {
    return `Como asistente médico especializado, ayuda a completar esta consulta médica con información clínica relevante.

**ENTRADA DEL MÉDICO:**
"${request.partialInput}"

**CONTEXTO ADICIONAL:**
- Especialidad: ${request.medicalSpecialty || 'Medicina General'}
- Edad paciente: ${request.patientContext?.age || 'No especificada'}
- Género: ${request.patientContext?.gender || 'No especificado'}
- Síntomas previos: ${request.patientContext?.previousSymptoms?.join(', ') || 'Ninguno registrado'}

**TAREA:**
Genera exactamente 3 opciones de autocompletado médico estructurado, cada una con diferente nivel de detalle.

**FORMATO DE RESPUESTA (JSON):**
\`\`\`json
{
  "suggestions": [
    {
      "id": "basic",
      "title": "Consulta Básica",
      "description": "Estructura mínima requerida",
      "template": "Paciente [género] de [edad] años presenta [síntoma principal] desde hace [tiempo]. [Características del síntoma]. Antecedentes: [antecedentes]. Medicamentos: [medicamentos actuales].",
      "confidence": 0.85,
      "category": "basic"
    },
    {
      "id": "detailed", 
      "title": "Consulta Detallada",
      "description": "Incluye exploración física inferida",
      "template": "Paciente [género] de [edad] años consulta por [motivo principal] de [tiempo de evolución]. SUBJETIVO: [síntomas detallados], [factores agravantes/atenuantes]. OBJETIVO: Signos vitales [TA/FC/FR/T°], exploración [hallazgos físicos]. Antecedentes: [antecedentes relevantes]. Medicación actual: [fármacos].",
      "confidence": 0.90,
      "category": "detailed"
    },
    {
      "id": "specialized",
      "title": "Consulta Especializada", 
      "description": "Formato completo SOAP con diferenciales",
      "template": "CASO CLÍNICO: Paciente [género], [edad] años, [ocupación], consulta por [síntoma principal] de [tiempo de evolución]. SUBJETIVO: [historia clínica detallada], [revisión por sistemas]. OBJETIVO: [signos vitales], [exploración física sistemática]. ANÁLISIS: Diagnóstico diferencial incluye [dx1], [dx2], [dx3]. PLAN: [estudios complementarios], [tratamiento inicial], [seguimiento].",
      "confidence": 0.95,
      "category": "specialized"
    }
  ],
  "enhancedTemplate": "Paciente [género] de [edad] años presenta [síntoma principal específico basado en entrada] desde hace [tiempo]. [Inferencias clínicas relevantes]. Requiere evaluación de [sistemas relacionados]. Antecedentes: [antecedentes sugeridos]. Plan: [estudios iniciales recomendados]."
}
\`\`\`

**INSTRUCCIONES ESPECÍFICAS:**
1. Usa corchetes [ ] para campos editables
2. Infiere información médica relevante del texto parcial
3. Mantén terminología médica profesional
4. Progresión de complejidad: básico → detallado → especializado
5. Confidence basado en completitud de la información original
6. NO inventar datos específicos del paciente

**ESPECIALIDADES COMUNES:**
- Cólicos → Gastroenterología, Ginecología
- Cefalea → Neurología, Medicina Interna  
- Dolor torácico → Cardiología, Medicina Emergencia
- Lesiones cutáneas → Dermatología

Responde SOLO con el JSON válido, sin texto adicional.`
  }

  private parseCompletionResponse(response: string, originalInput: string): AutocompletionResult {
    try {
      // Extraer JSON de la respuesta
      const jsonMatch = response.match(/```json\n?(.*?)\n?```/s)
      if (!jsonMatch) {
        throw new Error('Formato de respuesta inválido')
      }

      const parsed = JSON.parse(jsonMatch[1])
      
      // Validar estructura
      if (!parsed.suggestions || !Array.isArray(parsed.suggestions) || parsed.suggestions.length !== 3) {
        throw new Error('Estructura de sugerencias inválida')
      }

      return {
        success: true,
        suggestions: parsed.suggestions.map((suggestion: any, index: number) => ({
          id: suggestion.id || `suggestion_${index}`,
          title: suggestion.title || `Opción ${index + 1}`,
          description: suggestion.description || '',
          template: suggestion.template || '',
          confidence: suggestion.confidence || 0.5,
          category: suggestion.category || 'basic'
        })),
        enhancedTemplate: parsed.enhancedTemplate || '',
        error: undefined
      }
    } catch (error) {
      console.error('Error parseando respuesta de autocompletado:', error)
      
      // Fallback con templates predefinidos
      return this.getFallbackSuggestions(originalInput)
    }
  }

  private getFallbackSuggestions(originalInput: string): AutocompletionResult {
    const fallbackSuggestions: AutocompletionSuggestion[] = [
      {
        id: 'basic_fallback',
        title: 'Consulta Básica',
        description: 'Estructura mínima requerida',
        template: `Paciente [género] de [edad] años presenta ${this.extractMainSymptom(originalInput)} desde hace [tiempo]. [Características del síntoma]. Antecedentes: [antecedentes relevantes]. Medicamentos actuales: [medicamentos].`,
        confidence: 0.7,
        category: 'basic'
      },
      {
        id: 'detailed_fallback',
        title: 'Consulta Detallada', 
        description: 'Con exploración física',
        template: `Paciente [género] de [edad] años consulta por ${this.extractMainSymptom(originalInput)} de [tiempo de evolución]. SUBJETIVO: [descripción detallada del síntoma], [factores asociados]. OBJETIVO: Signos vitales [TA/FC/FR/T°], [hallazgos en exploración]. Antecedentes: [antecedentes]. Medicación: [fármacos actuales].`,
        confidence: 0.75,
        category: 'detailed'
      },
      {
        id: 'specialized_fallback',
        title: 'Consulta Especializada',
        description: 'Formato SOAP completo',
        template: `CASO CLÍNICO: Paciente [género], [edad] años, presenta ${this.extractMainSymptom(originalInput)} de [tiempo de evolución]. SUBJETIVO: [historia detallada]. OBJETIVO: [signos vitales y exploración]. ANÁLISIS: [diagnósticos diferenciales]. PLAN: [estudios y tratamiento].`,
        confidence: 0.8,
        category: 'specialized'
      }
    ]

    return {
      success: true,
      suggestions: fallbackSuggestions,
      enhancedTemplate: fallbackSuggestions[1].template,
      error: undefined
    }
  }

  private extractMainSymptom(input: string): string {
    const lowerInput = input.toLowerCase()
    
    // Buscar síntomas comunes
    const commonSymptoms = [
      { pattern: /colico|dolor abdominal/i, symptom: 'cólicos abdominales' },
      { pattern: /cefalea|dolor de cabeza/i, symptom: 'cefalea' },
      { pattern: /dolor toracico|dolor pecho/i, symptom: 'dolor torácico' },
      { pattern: /fiebre|temperatura/i, symptom: 'síndrome febril' },
      { pattern: /tos|expectoracion/i, symptom: 'síntomas respiratorios' },
      { pattern: /diarrea|evacuaciones/i, symptom: 'síntomas gastrointestinales' }
    ]

    for (const symptom of commonSymptoms) {
      if (symptom.pattern.test(input)) {
        return symptom.symptom
      }
    }

    // Extraer primera frase como síntoma
    const words = input.split(' ').slice(0, 3).join(' ')
    return `[${words}...]`
  }
}