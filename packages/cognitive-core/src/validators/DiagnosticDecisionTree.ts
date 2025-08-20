// 💀 DIAGNOSTIC DECISION TREE BRUTAL - Creado por Bernard Orozco
// NO MÁS MEDICINA DEFENSIVA DE JUGUETE

export interface StudyRule {
  trigger: string[]          // Síntomas/hallazgos que lo activan
  study: string             // Estudio específico requerido
  urgency: 'stat' | 'urgent' | 'routine'
  justification: string     // Por qué es obligatorio
  consequences: string      // Qué pasa si no se hace
}

export interface DiagnosticStudies {
  mandatory: StudyRule[]    // SIEMPRE se hacen
  conditional: StudyRule[]  // Solo si otros criterios
  followup: StudyRule[]     // Para seguimiento
}

/**
 * 💀 DECISION TREE SIN COMPASIÓN
 * 
 * Reglas FIJAS que no cambian según el clima:
 * - ESTERTORES = RX TÓRAX (SIEMPRE)
 * - FIEBRE + TOS = HEMOGRAMA + PCR (SIEMPRE)  
 * - DOLOR TORÁCICO = ECG (SIEMPRE)
 * 
 * Sin excepciones. Sin "contexto". Sin ChatGPT decidiendo.
 */
export class DiagnosticDecisionTree {
  
  // 🚨 REGLAS OBLIGATORIAS - MEDICINA DEFENSIVA REAL
  private readonly MANDATORY_STUDIES: StudyRule[] = [
    {
      trigger: ['estertores', 'crepitantes', 'roncus', 'sibilancias'],
      study: 'Radiografía de tórax PA y lateral',
      urgency: 'urgent',
      justification: 'Confirmar/descartar neumonía, derrame, neumotórax',
      consequences: 'Diagnóstico erróneo, tratamiento inadecuado, complicaciones'
    },
    {
      trigger: ['fiebre', 'hipertermia', '> 38'],
      study: 'Hemograma completo + PCR + VSG',
      urgency: 'urgent', 
      justification: 'Evaluar proceso inflamatorio/infeccioso',
      consequences: 'No detectar sepsis, leucemia, proceso inflamatorio'
    },
    {
      trigger: ['dolor torácico', 'dolor pecho', 'opresión torácica'],
      study: 'ECG 12 derivaciones',
      urgency: 'stat',
      justification: 'Descartar síndrome coronario agudo',
      consequences: 'Muerte súbita por IAM no diagnosticado'
    },
    {
      trigger: ['cefalea', 'dolor cabeza', 'jaqueca'],
      study: 'Presión arterial + fondo de ojo',
      urgency: 'urgent',
      justification: 'Descartar hipertensión intracraneal',
      consequences: 'Hemorragia cerebral no detectada'
    },
    {
      trigger: ['dolor abdominal', 'dolor estómago'],
      study: 'Hemograma + amilasa + lipasa',
      urgency: 'urgent',
      justification: 'Descartar apendicitis, pancreatitis',
      consequences: 'Perforación intestinal, peritonitis'
    }
  ]

  // 🟡 REGLAS CONDICIONALES - DEPENDEN DE EDAD/CONTEXTO
  private readonly CONDITIONAL_STUDIES: StudyRule[] = [
    {
      trigger: ['niño', 'pediátrico', '< 18 años'],
      study: 'Saturación de oxígeno',
      urgency: 'stat',
      justification: 'Niños compensan hasta descompensarse súbitamente',
      consequences: 'Hipoxia no detectada, paro cardiorespiratorio'
    },
    {
      trigger: ['> 65 años', 'adulto mayor', 'geriátrico'],
      study: 'Glucemia + creatinina + electrolitos',
      urgency: 'urgent',
      justification: 'Mayor riesgo comorbilidades, polifarmacia',
      consequences: 'Deshidratación, insuficiencia renal aguda'
    }
  ]

  // 📅 REGLAS DE SEGUIMIENTO
  private readonly FOLLOWUP_STUDIES: StudyRule[] = [
    {
      trigger: ['antibiótico prescrito'],
      study: 'Control en 48-72 horas',
      urgency: 'routine',
      justification: 'Evaluar respuesta al tratamiento',
      consequences: 'Resistencia antibiótica, complicaciones'
    }
  ]

  /**
   * 🎯 EVALUACIÓN BRUTAL: Dame síntomas, te doy estudios OBLIGATORIOS
   */
  getRequiredStudies(
    symptoms: string[],
    physicalFindings: string[],
    patientAge?: number,
    context?: string
  ): DiagnosticStudies {
    
    const allFindings = [...symptoms, ...physicalFindings].map(f => f.toLowerCase())
    const patientContext = context?.toLowerCase() || ''
    
    console.log('🔍 Evaluando hallazgos:', allFindings)

    const mandatory: StudyRule[] = []
    const conditional: StudyRule[] = []
    const followup: StudyRule[] = []

    // ✅ EVALUAR REGLAS OBLIGATORIAS
    this.MANDATORY_STUDIES.forEach(rule => {
      const isTriggered = rule.trigger.some(trigger => 
        allFindings.some(finding => finding.includes(trigger))
      )
      
      if (isTriggered) {
        mandatory.push(rule)
        console.log(`🚨 ESTUDIO OBLIGATORIO: ${rule.study} - ${rule.justification}`)
      }
    })

    // 🟡 EVALUAR REGLAS CONDICIONALES
    this.CONDITIONAL_STUDIES.forEach(rule => {
      const ageTriggered = patientAge && this.evaluateAgeCondition(rule.trigger, patientAge)
      const contextTriggered = rule.trigger.some(trigger => 
        patientContext.includes(trigger) || allFindings.some(f => f.includes(trigger))
      )
      
      if (ageTriggered || contextTriggered) {
        conditional.push(rule)
        console.log(`🟡 ESTUDIO CONDICIONAL: ${rule.study}`)
      }
    })

    // 📅 EVALUAR SEGUIMIENTO
    if (patientContext.includes('tratamiento') || patientContext.includes('antibiótico')) {
      followup.push(...this.FOLLOWUP_STUDIES)
    }

    return { mandatory, conditional, followup }
  }

  /**
   * 🧮 EVALUACIÓN DE EDAD
   */
  private evaluateAgeCondition(triggers: string[], age: number): boolean {
    return triggers.some(trigger => {
      if (trigger.includes('< 18') || trigger.includes('pediátrico')) {
        return age < 18
      }
      if (trigger.includes('> 65') || trigger.includes('geriátrico')) {
        return age > 65
      }
      return false
    })
  }

  /**
   * 🎯 FORMATO BRUTAL PARA SOAP - SIN AMBIGÜEDADES
   */
  formatStudiesForSOAP(studies: DiagnosticStudies): string {
    let soapText = "## 🔬 ESTUDIOS DIAGNÓSTICOS\n\n"
    
    if (studies.mandatory.length > 0) {
      soapText += "**📋 OBLIGATORIOS (Medicina Defensiva):**\n"
      studies.mandatory.forEach(study => {
        soapText += `- **${study.study}** [${study.urgency.toUpperCase()}]\n`
        soapText += `  💡 *${study.justification}*\n`
        soapText += `  ⚠️ *Riesgo si no se hace: ${study.consequences}*\n\n`
      })
    }

    if (studies.conditional.length > 0) {
      soapText += "**🟡 CONDICIONALES:**\n"
      studies.conditional.forEach(study => {
        soapText += `- ${study.study} (${study.justification})\n`
      })
      soapText += '\n'
    }

    if (studies.followup.length > 0) {
      soapText += "**📅 SEGUIMIENTO:**\n"
      studies.followup.forEach(study => {
        soapText += `- ${study.study} (${study.justification})\n`
      })
    }

    return soapText
  }

  /**
   * 💀 VALIDACIÓN BRUTAL - ¿HAY ESTUDIOS FALTANTES?
   */
  validateStudyCompleteness(
    proposedStudies: string[], 
    requiredStudies: DiagnosticStudies
  ): { valid: boolean, missing: StudyRule[], warnings: string[] } {
    
    const missing: StudyRule[] = []
    const warnings: string[] = []
    
    const proposedLower = proposedStudies.map(s => s.toLowerCase())
    
    // Verificar estudios obligatorios
    requiredStudies.mandatory.forEach(rule => {
      const isIncluded = proposedLower.some(proposed => 
        proposed.includes(rule.study.toLowerCase()) || 
        this.isEquivalentStudy(proposed, rule.study)
      )
      
      if (!isIncluded) {
        missing.push(rule)
        warnings.push(`🚨 CRÍTICO: Falta ${rule.study} - ${rule.consequences}`)
      }
    })

    return {
      valid: missing.length === 0,
      missing,
      warnings
    }
  }

  /**
   * 🔄 EQUIVALENCIAS DE ESTUDIOS
   */
  private isEquivalentStudy(proposed: string, required: string): boolean {
    const equivalences: Record<string, string[]> = {
      'radiografía de tórax': ['rx tórax', 'placa torácica', 'rayos x tórax'],
      'ecg 12 derivaciones': ['electrocardiograma', 'ecg', 'ekg'],
      'hemograma completo': ['hemograma', 'csc', 'biometría hemática']
    }
    
    const requiredLower = required.toLowerCase()
    return equivalences[requiredLower]?.some(equiv => proposed.includes(equiv)) || false
  }
}