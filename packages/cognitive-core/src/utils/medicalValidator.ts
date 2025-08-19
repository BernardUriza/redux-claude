// Validador de Contenido Médico - Creado por Bernard Orozco

export interface MedicalValidationResult {
  isValid: boolean
  confidence: number
  rejectionReason?: string
  suggestedFormat?: string
}

export class MedicalContentValidator {
  
  // Términos médicos y clínicos clave
  private readonly medicalTerms = [
    // Síntomas generales
    'dolor', 'fiebre', 'náuseas', 'vómitos', 'diarrea', 'estreñimiento', 'cefalea', 'mareo',
    'fatiga', 'astenia', 'anorexia', 'pérdida', 'peso', 'sudoración', 'escalofríos',
    
    // Términos clínicos
    'paciente', 'síntomas', 'diagnóstico', 'tratamiento', 'medicamento', 'dosis',
    'antecedentes', 'historia', 'clínica', 'examen', 'físico', 'laboratorios',
    
    // Especialidades médicas
    'cardiología', 'neurología', 'psiquiatría', 'dermatología', 'gastroenterología',
    'medicina', 'pediatría', 'ginecología', 'urología', 'oftalmología',
    
    // Términos anatómicos
    'corazón', 'pulmón', 'hígado', 'riñón', 'cerebro', 'estómago', 'intestino',
    'piel', 'hueso', 'músculo', 'sangre', 'presión', 'arterial',
    
    // Psicológicos/Psiquiátricos
    'depresión', 'ansiedad', 'estrés', 'insomnio', 'trastorno', 'estado', 'ánimo',
    'psicológico', 'emocional', 'mental', 'comportamiento', 'conducta',
    
    // Temporales médicos
    'años', 'meses', 'días', 'horas', 'crónico', 'agudo', 'recurrente', 'episodio',
    
    // Exámenes y procedimientos
    'rayos', 'tomografía', 'resonancia', 'ecografía', 'biopsia', 'análisis',
    'hemograma', 'glucosa', 'colesterol', 'presión', 'temperatura'
  ]

  // Patrones de casos clínicos válidos
  private readonly medicalPatterns = [
    /paciente\s+(masculino|femenino|de|con|presenta)/i,
    /años?\s+(presenta|refiere|acude|consulta)/i,
    /historia\s+de/i,
    /antecedentes?\s+(de|médicos?|familiares?)/i,
    /síntomas?\s+(de|como|incluyen?)/i,
    /dolor\s+(en|de|abdominal|torácico|cefálico)/i,
    /presenta?\s+(cuadro|sintomatología|clínica)/i,
    /diagnóstico\s+(de|diferencial|principal)/i,
    /tratamiento\s+(con|de|farmacológico)/i,
    /examen\s+físico/i,
    /signos?\s+vitales?/i,
    /laboratorios?\s+(muestran?|revelan?|reportan?)/i
  ]

  // Patrones que NO son médicos
  private readonly nonMedicalPatterns = [
    /hola|hello|buenos?\s+días?|buenas?\s+tardes?/i,
    /cómo\s+estás?|how\s+are\s+you/i,
    /qué\s+tal|what\'?s\s+up/i,
    /programación|código|software|javascript|python/i,
    /matemáticas?|cálculo|algebra|geometría/i,
    /recetas?\s+de\s+cocina|ingredientes?|comida/i,
    /deportes?|fútbol|básquet|tenis/i,
    /clima|tiempo|lluvia|sol/i,
    /política|gobierno|elecciones?/i,
    /entretenimiento|música|películas?|series?/i,
    /viajes?|turismo|vacaciones?/i,
    /tecnología\s+(no\s+médica)|gadgets?|teléfonos?/i
  ]

  /**
   * Valida si el texto ingresado corresponde a un caso clínico o consulta médica
   */
  public validateMedicalContent(text: string): MedicalValidationResult {
    const cleanText = text.toLowerCase().trim()
    
    if (cleanText.length < 10) {
      return {
        isValid: false,
        confidence: 0.9,
        rejectionReason: 'input_too_short',
        suggestedFormat: 'Proporciona más detalles del caso clínico'
      }
    }

    // Verificar patrones explícitamente no médicos
    const nonMedicalMatches = this.nonMedicalPatterns.filter(pattern => pattern.test(cleanText))
    if (nonMedicalMatches.length > 0) {
      return {
        isValid: false,
        confidence: 0.95,
        rejectionReason: 'non_medical_content',
        suggestedFormat: 'Este sistema está diseñado exclusivamente para análisis de casos clínicos'
      }
    }

    // Verificar patrones médicos estructurados
    const medicalPatternMatches = this.medicalPatterns.filter(pattern => pattern.test(cleanText))
    const medicalTermMatches = this.medicalTerms.filter(term => cleanText.includes(term))

    // Calcular puntuación
    let score = 0
    
    // Peso alto para patrones médicos estructurados
    score += medicalPatternMatches.length * 25
    
    // Peso medio para términos médicos
    score += medicalTermMatches.length * 5
    
    // Bonificación por estructura de caso clínico
    if (this.hasClinicStructure(cleanText)) {
      score += 30
    }

    // Penalización por falta de contexto médico
    if (!this.hasAgeGenderContext(cleanText)) {
      score -= 15
    }

    const confidence = Math.min(score / 100, 0.98)

    if (confidence < 0.4) {
      return {
        isValid: false,
        confidence: 1 - confidence,
        rejectionReason: 'insufficient_medical_context',
        suggestedFormat: 'Incluye: edad, género, síntomas principales, duración, antecedentes relevantes'
      }
    }

    return {
      isValid: true,
      confidence
    }
  }

  /**
   * Verifica si el texto tiene estructura de caso clínico
   */
  private hasClinicStructure(text: string): boolean {
    const structureIndicators = [
      /(años?|edad)/i,
      /(presenta|refiere|acude|consulta)/i,
      /(síntomas?|dolor|molestias?)/i,
      /(desde|hace|durante)/i,
      /(antecedentes?|historia)/i
    ]

    return structureIndicators.filter(pattern => pattern.test(text)).length >= 3
  }

  /**
   * Verifica si incluye contexto de edad y género
   */
  private hasAgeGenderContext(text: string): boolean {
    const agePattern = /\d+\s*años?/i
    const genderPattern = /(masculino|femenino|hombre|mujer|varón|paciente\s+(de|con))/i
    
    return agePattern.test(text) || genderPattern.test(text)
  }

  /**
   * Genera mensaje de rechazo apropiado
   */
  public generateRejectionMessage(result: MedicalValidationResult): string {
    const baseMessage = "## ⚠️ Consulta No Válida\n\n"
    
    switch (result.rejectionReason) {
      case 'input_too_short':
        return baseMessage + `**Información insuficiente**

Por favor, proporciona un caso clínico más detallado que incluya:

📋 **Formato recomendado:**
- **Paciente:** Edad, género
- **Motivo de consulta:** Síntoma principal
- **Historia actual:** Duración, características, evolución
- **Antecedentes:** Médicos, familiares, medicamentos
- **Examen físico:** Hallazgos relevantes (si disponible)

**Ejemplo:** *"Paciente masculino de 45 años presenta dolor torácico opresivo de 2 horas de evolución, irradiado a brazo izquierdo. Antecedente de hipertensión arterial..."*`

      case 'non_medical_content':
        return baseMessage + `**Fuera del dominio médico**

Este sistema está especializado exclusivamente en:
- 🏥 **Análisis de casos clínicos**
- 💊 **Consultas médicas y diagnósticos**
- 🧠 **Evaluaciones psicológicas y psiquiátricas**

No puedo ayudar con temas fuera del ámbito médico-psicológico.

Por favor, reformula tu consulta como un caso clínico específico.`

      case 'insufficient_medical_context':
        return baseMessage + `**Requiere más contexto médico**

Para realizar un análisis clínico apropiado, necesito información específica del paciente.

📝 **Incluye en tu consulta:**
1. **Datos demográficos:** Edad, género
2. **Síntomas principales:** Qué presenta el paciente
3. **Cronología:** Cuándo comenzó, evolución
4. **Antecedentes:** Médicos relevantes
5. **Contexto:** Circunstancias asociadas

**Reformula tu consulta con estos elementos para obtener un análisis médico completo.**`

      default:
        return baseMessage + `**Consulta no reconocida como caso clínico**

${result.suggestedFormat}

Por favor, estructura tu consulta como un caso médico específico.`
    }
  }
}