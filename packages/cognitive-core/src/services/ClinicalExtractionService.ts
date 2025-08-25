// 🔍 CLEAN ARCHITECTURE - Servicio de Extracción Clínica
// Usa decisionalMiddleware para extraer datos en lugar de regex hardcodeados

import { callClaudeForDecision } from './decisionalMiddleware'

export interface ClinicalData {
  patientAge?: number
  symptoms: string[]
  physicalFindings: string[]
  medications: string[]
  vitalSigns: Record<string, string>
  riskFactors: string[]
}

/**
 * 🧠 SERVICIO que extrae datos clínicos usando IA en lugar de regex
 */
export class ClinicalExtractionService {
  /**
   * 🔍 Extrae TODOS los datos clínicos usando decisionalMiddleware
   */
  async extractClinicalData(clinicalText: string): Promise<ClinicalData> {
    try {
      const response = await callClaudeForDecision(
        'validation', // Usar tipo existente que valida y estructura datos
        this.buildExtractionPrompt(clinicalText),
        'claude'
      )

      if (response.success) {
        return this.parseClinicalData(response.decision)
      }
    } catch (error) {
      console.warn('ClinicalExtractionService fallback:', error)
    }

    // Fallback con extracción básica
    return this.getFallbackExtraction(clinicalText)
  }

  /**
   * 📝 Construye prompt para extracción inteligente de datos
   */
  private buildExtractionPrompt(clinicalText: string): string {
    return `Eres un médico experto en análisis de casos clínicos. Extrae y estructura TODOS los datos clínicos relevantes.

TEXTO CLÍNICO:
${clinicalText}

INSTRUCCIONES:
- Extrae edad, síntomas, hallazgos físicos, medicamentos, signos vitales
- Identifica factores de riesgo y comorbilidades
- Si no hay datos específicos, marca como "no especificado"
- Sé preciso pero completo

FORMATO REQUERIDO - Devuelve como validación:
{
  "valid": true,
  "concerns": ["datos clínicos estructurados"],
  "risk_assessment": {
    "level": "low|moderate|high|critical",
    "factors": ["edad", "síntomas principales", "medicamentos de riesgo"]
  },
  "requires_human_review": false,
  "recommendations": [
    "edad: [número o 'no especificada']",
    "síntomas: [lista separada por comas]", 
    "hallazgos_físicos: [estertores, soplos, etc]",
    "medicamentos: [lista de medicamentos actuales]",
    "signos_vitales: [PA, FC, FR, Temp, SatO2 si disponibles]"
  ]
}`
  }

  /**
   * 🔍 Parsea respuesta de IA a datos estructurados
   */
  private parseClinicalData(decision: any): ClinicalData {
    const data: ClinicalData = {
      symptoms: [],
      physicalFindings: [],
      medications: [],
      vitalSigns: {},
      riskFactors: [],
    }

    if (decision.recommendations && Array.isArray(decision.recommendations)) {
      decision.recommendations.forEach((rec: string) => {
        if (rec.startsWith('edad:')) {
          const ageMatch = rec.match(/\\d+/)
          data.patientAge = ageMatch ? parseInt(ageMatch[0]) : undefined
        }

        if (rec.startsWith('síntomas:')) {
          data.symptoms = this.parseList(rec)
        }

        if (rec.startsWith('hallazgos_físicos:')) {
          data.physicalFindings = this.parseList(rec)
        }

        if (rec.startsWith('medicamentos:')) {
          data.medications = this.parseList(rec)
        }

        if (rec.startsWith('signos_vitales:')) {
          data.vitalSigns = this.parseVitalSigns(rec)
        }
      })
    }

    // Factores de riesgo del risk_assessment
    if (decision.risk_assessment?.factors) {
      data.riskFactors = decision.risk_assessment.factors
    }

    return data
  }

  /**
   * 📋 Parsea listas de la respuesta
   */
  private parseList(text: string): string[] {
    const colonIndex = text.indexOf(':')
    if (colonIndex === -1) return []

    const listText = text.substring(colonIndex + 1).trim()
    if (listText === 'no especificado' || listText === '') return []

    return listText
      .split(',')
      .map(item => item.trim())
      .filter(item => item)
  }

  /**
   * 💓 Parsea signos vitales
   */
  private parseVitalSigns(text: string): Record<string, string> {
    const vitals: Record<string, string> = {}
    const colonIndex = text.indexOf(':')
    if (colonIndex === -1) return vitals

    const vitalsText = text.substring(colonIndex + 1).trim()

    // Parsear patrones comunes: PA: 120/80, FC: 80, etc.
    const patterns = [
      /PA:\\s*([\\d/]+)/i,
      /FC:\\s*(\\d+)/i,
      /FR:\\s*(\\d+)/i,
      /Temp:\\s*([\\d.]+)/i,
      /SatO2:\\s*(\\d+%?)/i,
    ]

    const keys = [
      'presion_arterial',
      'frecuencia_cardiaca',
      'frecuencia_respiratoria',
      'temperatura',
      'saturacion_oxigeno',
    ]

    patterns.forEach((pattern, index) => {
      const match = vitalsText.match(pattern)
      if (match) {
        vitals[keys[index]] = match[1]
      }
    })

    return vitals
  }

  /**
   * 🆘 Extracción básica si falla la IA
   */
  private getFallbackExtraction(clinicalText: string): ClinicalData {
    const textLower = clinicalText.toLowerCase()

    return {
      patientAge: this.extractAge(textLower),
      symptoms: this.extractSymptoms(textLower),
      physicalFindings: this.extractPhysicalFindings(textLower),
      medications: this.extractMedications(textLower),
      vitalSigns: {},
      riskFactors: [],
    }
  }

  // Métodos fallback simplificados
  private extractAge(text: string): number | undefined {
    const match = text.match(/(\\d+)\\s*años?/i)
    return match ? parseInt(match[1]) : undefined
  }

  private extractSymptoms(text: string): string[] {
    const symptoms = ['fiebre', 'tos', 'disnea', 'dolor', 'náusea', 'vómito']
    return symptoms.filter(symptom => text.includes(symptom))
  }

  private extractPhysicalFindings(text: string): string[] {
    const findings = ['estertores', 'crepitantes', 'roncus', 'sibilancias', 'soplo', 'edema']
    return findings.filter(finding => text.includes(finding))
  }

  private extractMedications(text: string): string[] {
    const meds = ['warfarina', 'digoxina', 'enalapril', 'metformina', 'aspirina']
    return meds.filter(med => text.includes(med))
  }
}

// Singleton
export const clinicalExtractionService = new ClinicalExtractionService()
