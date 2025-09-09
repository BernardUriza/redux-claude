// packages/cognitive-core/src/engine/IterativeDiagnosticEngine.ts
// Motor de Diagnóstico Iterativo - Creado por Bernard Orozco
import { ClaudeAdapter } from '../decision-engine/providers/claude'
import { SOAPAnalysis, DiagnosticCycle, MedicalCase, AdditionalInfoRequest } from '../types/medical'
import { validateMedicalInput } from '../utils/aiMedicalValidator'
import { multiAgentOrchestrator } from '../services/multi-agent-orchestrator'
import { AgentType } from '../types/agents'
import { callClaudeForDecision } from '../services/decisional-middleware'

interface DiagnosticEngineConfig {
  maxCycles: number
  confidenceThreshold: number
  qualityThreshold: number
}

export class IterativeDiagnosticEngine {
  private cycles: DiagnosticCycle[] = []
  private claudeAdapter: ClaudeAdapter
  // AI validator replaced the regex-based MedicalQualityValidator
  private config: DiagnosticEngineConfig

  constructor(claudeAdapter?: ClaudeAdapter, config?: Partial<DiagnosticEngineConfig>) {
    this.claudeAdapter = claudeAdapter || new ClaudeAdapter()
    // AI validator will be used when needed
    this.config = {
      maxCycles: 3,
      confidenceThreshold: 0.85,
      qualityThreshold: 0.8,
      ...config,
    }
  }

  async processWithValidation(
    medicalCase: MedicalCase,
    onProgressUpdate?: (cycle: DiagnosticCycle) => void
  ): Promise<SOAPAnalysis | AdditionalInfoRequest> {
    this.cycles = []
    let currentCycle = 1
    let globalConfidence = 0
    let caseData = { ...medicalCase }

    console.log('🔬 INICIANDO PROCESO ITERATIVO DE DIAGNÓSTICO')

    while (
      globalConfidence < this.config.confidenceThreshold &&
      currentCycle <= this.config.maxCycles
    ) {
      const cycleId = `cycle_${currentCycle}_${Date.now()}`

      console.log(`\n🔄 CICLO ${currentCycle}/${this.config.maxCycles}`)

      const cycle = await this.runDiagnosticCycle(caseData, currentCycle, cycleId)
      this.cycles.push(cycle)

      // Emit progress update
      if (onProgressUpdate) {
        onProgressUpdate(cycle)
      }

      // Verificar si necesita más datos
      const needsMoreData = this.needsMoreData(cycle.analysis)
      if (needsMoreData) {
        console.log('❓ DATOS INSUFICIENTES - Solicitando información adicional')
        return this.createAdditionalInfoRequest(cycle.analysis, currentCycle)
      }

      // Calcular confianza del ciclo
      const cycleConfidence = this.calculateCycleConfidence(cycle)
      globalConfidence = this.calculateGlobalConfidence(this.cycles)

      console.log(`📊 Confianza del ciclo ${currentCycle}: ${Math.round(cycleConfidence * 100)}%`)
      console.log(`📊 Confianza global: ${Math.round(globalConfidence * 100)}%`)

      // Validar calidad del análisis
      const qualityScore = this.evaluateAnalysisQuality(cycle.analysis)
      if (qualityScore < this.config.qualityThreshold && currentCycle < this.config.maxCycles) {
        console.log(
          `⚠️ Calidad insuficiente (${Math.round(qualityScore * 100)}%) - Refinando análisis`
        )
        caseData = this.enhanceCaseWithInsights(caseData, cycle)
      }

      currentCycle++
    }

    console.log(`\n✅ DIAGNÓSTICO COMPLETADO después de ${this.cycles.length} ciclos`)
    console.log(`📊 Confianza final: ${Math.round(globalConfidence * 100)}%`)

    return await this.finalizeSOAPAnalysis(this.cycles)
  }

  private async runDiagnosticCycle(
    caseData: MedicalCase,
    cycleNumber: number,
    cycleId: string
  ): Promise<DiagnosticCycle> {
    const startTime = Date.now()

    // Crear prompt específico para este ciclo
    const cyclePrompt = this.buildCyclePrompt(caseData, cycleNumber, this.cycles)

    // Crear prompt simple para agentes especializados (solo el caso, sin SOAP)
    const agentPrompt = this.buildAgentPrompt(caseData, cycleNumber)

    console.log(`📝 Ejecutando agentes especializados (Ciclo ${cycleNumber})...`)

    // NUEVA ARQUITECTURA: Agentes especializados PRIMERO, luego SOAP integrado
    let pharmacologyDetails,
      pediatricDetails,
      hospitalizationDetails,
      familyEducationDetails,
      objectiveValidation,
      defensiveDifferentials
    let response: any

    try {
      // PASO 1: Ejecutar agentes especializados PRIMERO
      console.log('🚀 PASO 1: Ejecutando agentes especializados...')
      const agentResults = await Promise.all([
        // Agente de farmacología clínica
        multiAgentOrchestrator
          .executeSingleAgent(AgentType.CLINICAL_PHARMACOLOGY, agentPrompt)
          .catch(error => {
            console.error('❌ Error en CLINICAL_PHARMACOLOGY:', error?.message || error)
            return null
          }),
        // Agente especialista pediátrico
        multiAgentOrchestrator
          .executeSingleAgent(AgentType.PEDIATRIC_SPECIALIST, agentPrompt)
          .catch(error => {
            console.error('❌ Error en PEDIATRIC_SPECIALIST:', error?.message || error)
            return null
          }),
        // Agente criterios hospitalización
        multiAgentOrchestrator
          .executeSingleAgent(AgentType.HOSPITALIZATION_CRITERIA, agentPrompt)
          .catch(error => {
            console.error('❌ Error en HOSPITALIZATION_CRITERIA:', error?.message || error)
            return null
          }),
        // Agente educación familiar
        multiAgentOrchestrator
          .executeSingleAgent(AgentType.FAMILY_EDUCATION, agentPrompt)
          .catch(error => {
            console.error('❌ Error en FAMILY_EDUCATION:', error?.message || error)
            return null
          }),
        // Agente de validación objetiva
        multiAgentOrchestrator
          .executeSingleAgent(AgentType.OBJECTIVE_VALIDATION, agentPrompt)
          .catch(error => {
            console.error('❌ Error en OBJECTIVE_VALIDATION:', error?.message || error)
            return null
          }),
        // Agente de medicina defensiva
        multiAgentOrchestrator
          .executeSingleAgent(AgentType.DEFENSIVE_DIFFERENTIAL, agentPrompt)
          .catch(error => {
            console.error('❌ Error en DEFENSIVE_DIFFERENTIAL:', error?.message || error)
            return null
          }),
      ])

      console.log('✅ Agentes especializados completados')

      // Destructurar resultados de agentes
      pharmacologyDetails = agentResults[0]
      pediatricDetails = agentResults[1]
      hospitalizationDetails = agentResults[2]
      familyEducationDetails = agentResults[3]
      objectiveValidation = agentResults[4]
      defensiveDifferentials = agentResults[5]

      console.log('🔍 Agentes completados:', {
        pharmacology: !!pharmacologyDetails,
        pediatric: !!pediatricDetails,
        hospitalization: !!hospitalizationDetails,
        familyEducation: !!familyEducationDetails,
        objectiveValidation: !!objectiveValidation,
        defensiveDifferential: !!defensiveDifferentials,
      })

      // PASO 2: Construir SOAP basado en resultados de agentes especializados
      console.log('🚀 PASO 2: Construyendo SOAP integrado basado en agentes...')
      const integratedPrompt = this.buildIntegratedSOAPPrompt(cycleNumber, cyclePrompt, {
        pharmacology: pharmacologyDetails,
        pediatric: pediatricDetails,
        hospitalization: hospitalizationDetails,
        familyEducation: familyEducationDetails,
        objectiveValidation: objectiveValidation,
        defensiveDifferential: defensiveDifferentials,
      })

      response = await this.claudeAdapter.makeRequest(
        integratedPrompt.systemPrompt,
        integratedPrompt.userPrompt
      )
    } catch (error) {
      console.error('❌ ERROR CRÍTICO en nueva arquitectura:', error)

      // Fallback - método antiguo
      console.log('🔄 Fallback: Usando método antiguo...')
      response = await this.claudeAdapter.makeRequest(
        this.buildSystemPrompt(cycleNumber),
        cyclePrompt
      )
    }

    // Verificar si hay error en la respuesta
    if (!response.success) {
      const errorMessage = response.error || 'Error desconocido'
      console.error('❌ Error en Claude API:', errorMessage)

      // Retornar análisis de error informativo
      return {
        id: cycleId,
        cycleNumber,
        timestamp: startTime,
        latency: Date.now() - startTime,
        caseData,
        analysis: {
          subjetivo: '## ⚠️ Error en Análisis Médico',
          objetivo: `**Error detectado:** ${errorMessage}\n\n**Contenido de respuesta:** ${response.content || 'Sin contenido'}`,
          diagnostico_principal: 'Error en procesamiento médico',
          diagnosticos_diferenciales: [`Error: ${errorMessage}`],
          plan_tratamiento: 'Revisar configuración del sistema y reintentificar análisis.',
          confianza_global: 0,
          datos_adicionales_necesarios: [],
        },
        confidence: 0,
        qualityScore: 0,
        insights: [`Error del sistema: ${errorMessage}`],
        nextSteps: [
          'Verificar conectividad',
          'Revisar logs del sistema',
          'Contactar soporte técnico',
        ],
      }
    }

    const endTime = Date.now()
    const latency = endTime - startTime

    // Parsear respuesta SOAP principal (ya integrada con datos de agentes)
    const analysis = this.parseClaudeResponse(response.content)

    console.log('✅ SOAP integrado generado correctamente por Claude (sin patches)')

    // Agregar metadata de agentes consultados
    analysis.validacion_agentes = {
      farmacologia_clinica: Boolean(pharmacologyDetails?.success && pharmacologyDetails?.decision),
      pediatria_especializada: Boolean(pediatricDetails?.success && pediatricDetails?.decision),
      criterios_hospitalizacion: Boolean(
        hospitalizationDetails?.success && hospitalizationDetails?.decision
      ),
      educacion_familiar: Boolean(
        familyEducationDetails?.success && familyEducationDetails?.decision
      ),
      validacion_objetiva: Boolean(objectiveValidation?.success && objectiveValidation?.decision),
      medicina_defensiva: Boolean(
        defensiveDifferentials?.success && defensiveDifferentials?.decision
      ),
      metodo: 'nueva_arquitectura_integrada',
    }

    return {
      id: cycleId,
      cycleNumber,
      timestamp: startTime,
      latency,
      caseData,
      analysis,
      confidence: this.calculateAnalysisConfidence(analysis),
      qualityScore: this.evaluateAnalysisQuality(analysis),
      insights: this.extractInsights(analysis),
      nextSteps: this.determineNextSteps(analysis, cycleNumber),
    }
  }

  private buildIntegratedSOAPPrompt(
    cycleNumber: number,
    originalInput: string,
    agentResults: {
      pharmacology?: any
      pediatric?: any
      hospitalization?: any
      familyEducation?: any
      objectiveValidation?: any
      defensiveDifferential?: any
    }
  ): { systemPrompt: string; userPrompt: string } {
    // 🧠 USAR DECISIONAL MIDDLEWARE para generar contexto y estudios
    // TODO: Hacer async completo cuando se implemente correctamente
    const contextualInfo = this.buildBasicContext(agentResults)
    const dynamicStudies = '🔬 MEDICINA DEFENSIVA - ESTUDIOS: Via DiagnosticDecisionTree integrado'

    // Llamada async en background (no bloqueante)
    this.generateContextUsingAI(originalInput, agentResults)
      .then(context => {
        console.log('🧠 Contexto IA generado:', context.substring(0, 100) + '...')
      })
      .catch(err => console.warn('Context AI error:', err))

    console.log('🎯 Usando decisionalMiddleware REAL para toda la lógica')

    const systemPrompt = `Eres un médico especialista creando un análisis SOAP basado en las recomendaciones de especialistas médicos.

${contextualInfo}

INSTRUCCIONES CRÍTICAS:
- USA EXACTAMENTE la medicación especificada por farmacología (dosis, frecuencia, duración)
- NO cambies ni genericices las prescripciones específicas
- NO uses "antibióticos de primera línea" - usa la prescripción EXACTA
- NO incluyas antitusivos (contraindicados en neumonía pediátrica)
- USA las consideraciones pediátricas específicas
- USA la disposición recomendada por el especialista

${dynamicStudies}

FORMATO REQUERIDO - SOAP:
- S (Subjetivo): Síntomas reportados
- O (Objetivo): Hallazgos del examen físico  
- A (Análisis): Diagnóstico principal y diferenciales
- P (Plan): USAR las prescripciones EXACTAS de los especialistas`

    return {
      systemPrompt,
      userPrompt: originalInput,
    }
  }

  private buildSystemPrompt(cycleNumber: number): string {
    const basePrompt = `Eres un médico especialista realizando un análisis clínico iterativo.
    
CICLO DE ANÁLISIS: ${cycleNumber}
OBJETIVO: Análisis médico progresivo siguiendo metodología SOAP

INSTRUCCIONES CRÍTICAS:
- Si es el primer ciclo, haz análisis inicial completo
- Si es ciclo posterior, refina y mejora el análisis previo
- SIEMPRE responde en formato SOAP estructurado
- Indica nivel de confianza en cada sección
- Si faltan datos críticos, especifícalo claramente`

    if (cycleNumber === 1) {
      return (
        basePrompt +
        `

ANÁLISIS INICIAL - Evalúa con la información disponible:
- Identifica patrones clínicos principales
- Lista diagnósticos diferenciales por probabilidad Y gravedad
- Indica qué datos adicionales serían críticos`
      )
    }

    return (
      basePrompt +
      `

ANÁLISIS REFINADO - Mejora el análisis previo:
- Incorpora insights del ciclo anterior
- Ajusta diagnósticos diferenciales
- Aumenta especificidad del plan terapéutico`
    )
  }

  private buildAgentPrompt(caseData: MedicalCase, cycleNumber: number): string {
    return `## CASO CLÍNICO PARA ANÁLISIS ESPECIALIZADO

**Datos del Paciente:**
${caseData.presentation}

**Historia Clínica Disponible:**
${caseData.history || 'Información limitada disponible'}

**Contexto:** ${caseData.context || 'Consulta médica general'}

Analiza este caso desde tu especialidad médica y proporciona tu evaluación específica.`
  }

  private buildCyclePrompt(
    caseData: MedicalCase,
    cycleNumber: number,
    previousCycles: DiagnosticCycle[]
  ): string {
    let prompt = `
## CASO CLÍNICO - CICLO ${cycleNumber}

**Datos del Paciente:**
${caseData.presentation}

**Historia Clínica Disponible:**
${caseData.history || 'Información limitada disponible'}

**Contexto:** ${caseData.context || 'Consulta médica general'}
`

    // Agregar insights de ciclos previos
    if (previousCycles.length > 0) {
      prompt += `\n## ANÁLISIS PREVIO - CICLO ${cycleNumber - 1}\n`
      const lastCycle = previousCycles[previousCycles.length - 1]
      prompt += `**Diagnóstico previo:** ${lastCycle.analysis?.diagnostico_principal || 'En proceso'}\n`
      prompt += `**Confianza previa:** ${Math.round((lastCycle.confidence || 0) * 100)}%\n`

      if (lastCycle.insights && lastCycle.insights.length > 0) {
        prompt += `**Insights identificados:**\n${lastCycle.insights.join('\n- ')}\n`
      }
    }

    prompt += `\n## SOLICITUD DE ANÁLISIS SOAP

Responde EXCLUSIVAMENTE en este formato:

## S - SUBJETIVO
[Síntomas reportados por el paciente]
**Confianza:** [0-100]%

## O - OBJETIVO
[Signos vitales completos incluyendo SatO2 en casos respiratorios, temperatura, FR, FC]
[Hallazgos físicos específicos del examen físico dirigido]
**Confianza:** [0-100]%

## A - ANÁLISIS
**Diagnóstico Principal:** [Diagnóstico más probable]
**Diagnósticos Diferenciales:**
IMPORTANTE: NO incluyas el diagnóstico principal en esta lista
1. [ALTA GRAVEDAD - descartar urgente] - Probabilidad: X%
2. [SEGUNDA OPCIÓN más probable] - Probabilidad: X%  
3. [TERCERA consideración] - Probabilidad: X%
**Confianza global:** [0-100]%

## P - PLAN
**Inmediato:** [Tratamiento ahora]
**Seguimiento:** [Cuándo revisar - específico]
**Derivación:** [Cuándo referir especialista]
**Estudios:** [MEDICINA DEFENSIVA OBLIGATORIA - Para estertores/crepitantes: Rx tórax PA SIEMPRE. Para fiebre: Hemograma+PCR SIEMPRE. NUNCA digas "no requiere estudios" si hay síntomas respiratorios]
**Educación Padres:** [Signos de alarma específicos - cuándo regresar urgente, importancia completar tratamiento]
**Confianza:** [0-100]%

## DATOS ADICIONALES NECESARIOS
[Lista específica de información que mejoraría el diagnóstico]
`

    return prompt
  }

  private parseClaudeResponse(response: string): SOAPAnalysis {
    console.log('🔍 Respuesta de Claude recibida:', response.substring(0, 500) + '...')

    // Parser más flexible para diferentes formatos de respuesta
    const sections = {
      subjetivo:
        this.extractSection(response, 'S - SUBJETIVO', 'O - OBJETIVO') ||
        this.extractSection(response, 'SUBJETIVO', 'OBJETIVO') ||
        this.extractSection(response, '**S**', '**O**') ||
        this.extractSectionFallback(response, 'subjetivo'),
      objetivo:
        this.extractSection(response, 'O - OBJETIVO', 'A - ANÁLISIS') ||
        this.extractSection(response, 'OBJETIVO', 'ANÁLISIS') ||
        this.extractSection(response, '**O**', '**A**') ||
        this.extractSectionFallback(response, 'objetivo'),
      analisis:
        this.extractSection(response, 'A - ANÁLISIS', 'P - PLAN') ||
        this.extractSection(response, 'ANÁLISIS', 'PLAN') ||
        this.extractSection(response, '**A**', '**P**') ||
        this.extractSectionFallback(response, 'análisis'),
      plan:
        this.extractSection(response, 'P - PLAN', 'DATOS ADICIONALES') ||
        this.extractSection(response, 'PLAN', '') ||
        this.extractSection(response, '**P**', '') ||
        this.extractSectionFallback(response, 'plan'),
    }

    console.log('📝 Secciones extraídas:', {
      subjetivo: sections.subjetivo?.substring(0, 100) + '...',
      objetivo: sections.objetivo?.substring(0, 100) + '...',
      analisis: sections.analisis?.substring(0, 100) + '...',
      plan: sections.plan?.substring(0, 100) + '...',
    })

    // Extraer diagnóstico principal
    const diagnostico_principal =
      this.extractDiagnosticoPrincipal(sections.analisis) ||
      this.extractDiagnosticoPrincipal(response)
    const diagnosticos_diferenciales =
      this.extractDiagnosticosDiferenciales(sections.analisis) ||
      this.extractDiagnosticosDiferenciales(response)

    // Si no se pudo parsear nada, mostrar la respuesta completa para debug
    const hasValidSections =
      sections.subjetivo || sections.objetivo || sections.analisis || sections.plan

    if (!hasValidSections) {
      console.warn('⚠️ No se pudieron extraer secciones SOAP. Respuesta completa:', response)
      return {
        subjetivo:
          '## ⚠️ Error de Parsing\n\nNo se pudieron extraer las secciones SOAP de la respuesta.',
        objetivo: `**Respuesta completa de Claude:**\n\n${response}`,
        diagnostico_principal: 'Error en parsing de respuesta',
        diagnosticos_diferenciales: ['Revisar formato de respuesta de Claude'],
        plan_tratamiento: 'Verificar prompt y configuración del sistema.',
        confianza_global: 0,
        datos_adicionales_necesarios: ['Revisar logs del sistema'],
      }
    }

    return {
      subjetivo:
        sections.subjetivo || 'Información subjetiva del paciente disponible en caso clínico.',
      objetivo: sections.objetivo || 'Hallazgos objetivos a documentar durante exploración física.',
      diagnostico_principal:
        diagnostico_principal || 'Diagnóstico por determinar tras evaluación completa',
      diagnosticos_diferenciales:
        diagnosticos_diferenciales?.length > 0
          ? diagnosticos_diferenciales
          : ['Diagnósticos diferenciales por evaluar'],
      plan_tratamiento:
        sections.plan || 'Plan de tratamiento por establecer según diagnóstico definitivo.',
      confianza_global:
        this.extractConfianza(sections.analisis) || this.extractConfianza(response) || 0.5,
      datos_adicionales_necesarios: this.extractDatosAdicionales(response),
    }
  }

  private extractSection(text: string, startMarker: string, endMarker: string): string {
    const startIndex = text.indexOf(startMarker)
    const endIndex = endMarker ? text.indexOf(endMarker) : -1

    if (startIndex === -1) return ''

    const start = startIndex + startMarker.length
    const end = endIndex === -1 ? text.length : endIndex

    return text.substring(start, end).trim()
  }

  private extractSectionFallback(text: string, sectionType: string): string {
    // Fallback para extraer secciones cuando los marcadores estándar fallan
    const patterns = {
      subjetivo: [
        /(?:motivo.*consulta|presenta|refiere)[\s\S]*?(?=objetivo|hallazgos|examen|$)/i,
        /(?:historia.*actual|evolución)[\s\S]*?(?=objetivo|hallazgos|examen|$)/i,
      ],
      objetivo: [
        /(?:examen.*físico|hallazgos|signos.*vitales)[\s\S]*?(?=análisis|diagnóstico|impresión|$)/i,
        /(?:exploración|inspección|palpación)[\s\S]*?(?=análisis|diagnóstico|impresión|$)/i,
      ],
      análisis: [
        /(?:diagnóstico|impresión|análisis)[\s\S]*?(?=plan|tratamiento|manejo|$)/i,
        /(?:diferencial|presuntivo)[\s\S]*?(?=plan|tratamiento|manejo|$)/i,
      ],
      plan: [
        /(?:plan|tratamiento|manejo|recomendaciones)[\s\S]*$/i,
        /(?:medicamentos|terapia|seguimiento)[\s\S]*$/i,
      ],
    }

    const sectionPatterns = patterns[sectionType as keyof typeof patterns] || []

    for (const pattern of sectionPatterns) {
      const match = text.match(pattern)
      if (match && match[0].length > 20) {
        return match[0].trim()
      }
    }

    return ''
  }

  private extractDiagnosticoPrincipal(analisisText: string): string {
    const patterns = [
      /\*\*Diagnóstico Principal:\*\*\s*(.+?)(?=\n|\*\*|$)/i,
      /Diagnóstico Principal:?\s*(.+?)(?=\n|Diagnósticos|$)/i,
      /Impresión diagnóstica:?\s*(.+?)(?=\n|Diagnósticos|$)/i,
      /Diagnóstico presuntivo:?\s*(.+?)(?=\n|Diagnósticos|$)/i,
      /Principal:?\s*(.+?)(?=\n|Diferencial|$)/i,
      /(?:dermatitis|eczema|psoriasis|alergia)[\w\s]+/i,
    ]

    for (const pattern of patterns) {
      const match = analisisText.match(pattern)
      if (match && match[1] && match[1].trim().length > 3) {
        return match[1].trim()
      }
    }

    return ''
  }

  private extractDiagnosticosDiferenciales(analisisText: string): string[] {
    const diferenciales: string[] = []
    const lines = analisisText.split('\n')
    let inDiferenciales = false

    for (const line of lines) {
      if (line.includes('Diagnósticos Diferenciales')) {
        inDiferenciales = true
        continue
      }

      if (inDiferenciales && line.match(/^\d+\./)) {
        diferenciales.push(line.trim())
      } else if (inDiferenciales && line.includes('**')) {
        break
      }
    }

    return diferenciales
  }

  private extractConfianza(analisisText: string): number {
    const match = analisisText.match(/\*\*Confianza global:\*\*\s*(\d+)%/i)
    return match ? parseInt(match[1]) / 100 : 0.5
  }

  private extractDatosAdicionales(response: string): string[] {
    const section = this.extractSection(response, 'DATOS ADICIONALES NECESARIOS', '')
    return section.split('\n').filter(line => line.trim().length > 0)
  }

  private needsMoreData(analysis: SOAPAnalysis): boolean {
    // Lógica más permisiva para determinar si necesita más datos
    const hasVeryLowConfidence = (analysis.confianza_global || 0) < 0.4 // Reducido de 0.6 a 0.4
    const hasInsufficientSubjective = (analysis.subjetivo?.length || 0) < 30 // Reducido de 50 a 30
    const hasInsufficientObjective = (analysis.objetivo?.length || 0) < 20 // Reducido de 30 a 20
    const hasCriticalDataNeeds = (analysis.datos_adicionales_necesarios?.length || 0) > 3 // Aumentado de 2 a 3

    // Solo pedir información adicional si realmente es crítico
    return hasVeryLowConfidence && hasInsufficientSubjective && hasInsufficientObjective
  }

  private createAdditionalInfoRequest(
    analysis: SOAPAnalysis,
    currentCycle: number
  ): AdditionalInfoRequest {
    // Generar preguntas específicas basadas en lo que falta
    const specificQuestions = this.generateSpecificQuestions(analysis)
    const specificActions = this.generateSpecificActions(analysis)

    return {
      type: 'additional_info_needed',
      currentCycle,
      confidence: analysis.confianza_global || 0,
      questions:
        specificQuestions.length > 0
          ? specificQuestions
          : analysis.datos_adicionales_necesarios || [],
      partialAnalysis: analysis,
      nextActions:
        specificActions.length > 0
          ? specificActions
          : [
              'Proporcionar información adicional solicitada',
              'Confirmar datos demográficos si faltan',
              'Especificar cronología de síntomas',
              'Incluir antecedentes médicos relevantes',
            ],
    }
  }

  private generateSpecificQuestions(analysis: SOAPAnalysis): string[] {
    const questions: string[] = []

    // Analizar qué información específica falta
    if (!analysis.subjetivo || analysis.subjetivo.length < 30) {
      questions.push('¿Puede describir con más detalle los síntomas que presenta el paciente?')
      questions.push('¿Cuándo comenzaron exactamente los síntomas y cómo han evolucionado?')
    }

    if (!analysis.objetivo || analysis.objetivo.length < 20) {
      questions.push('¿Qué hallazgos específicos se encontraron en el examen físico?')
      questions.push('¿Cuáles son los signos vitales del paciente?')
    }

    // Preguntas contextuales basadas en el contenido
    const content = `${analysis.subjetivo || ''} ${analysis.objetivo || ''}`.toLowerCase()

    if (content.includes('lesion') || content.includes('dermat')) {
      questions.push(
        '¿Cuáles son las características exactas de las lesiones (tamaño, distribución, textura)?'
      )
      questions.push('¿Hay factores que mejoran o empeoran las lesiones?')
    }

    if (content.includes('dolor')) {
      questions.push('¿Puede caracterizar mejor el dolor (intensidad 1-10, tipo, irradiación)?')
    }

    return questions
  }

  private generateSpecificActions(analysis: SOAPAnalysis): string[] {
    const actions: string[] = []

    if (!analysis.subjetivo || analysis.subjetivo.length < 30) {
      actions.push('Ampliar descripción de síntomas y historia clínica')
    }

    if (!analysis.objetivo || analysis.objetivo.length < 20) {
      actions.push('Proporcionar hallazgos de examen físico y signos vitales')
    }

    if (!analysis.diagnostico_principal || analysis.diagnostico_principal === 'No especificado') {
      actions.push('Incluir cualquier impresión diagnóstica preliminar si existe')
    }

    return actions
  }

  private calculateCycleConfidence(cycle: DiagnosticCycle): number {
    return cycle.confidence || 0.5
  }

  private calculateGlobalConfidence(cycles: DiagnosticCycle[]): number {
    if (cycles.length === 0) return 0

    // La confianza global aumenta con cada ciclo, pero con rendimientos decrecientes
    const latestConfidence = cycles[cycles.length - 1].confidence || 0.5
    const cycleBonus = Math.min(cycles.length * 0.1, 0.3) // Max 30% bonus

    return Math.min(latestConfidence + cycleBonus, 1.0)
  }

  private evaluateAnalysisQuality(analysis: SOAPAnalysis): number {
    let score = 0.5 // Base score

    // Evaluar completitud de secciones
    if (analysis.subjetivo && analysis.subjetivo.length > 30) score += 0.1
    if (analysis.objetivo && analysis.objetivo.length > 30) score += 0.1
    if (analysis.diagnostico_principal && analysis.diagnostico_principal !== 'No especificado')
      score += 0.2
    if (analysis.diagnosticos_diferenciales && analysis.diagnosticos_diferenciales.length >= 2)
      score += 0.15
    if (analysis.plan_tratamiento && analysis.plan_tratamiento.length > 50) score += 0.15

    return Math.min(score, 1.0)
  }

  private calculateAnalysisConfidence(analysis: SOAPAnalysis): number {
    return analysis.confianza_global || 0.5
  }

  private extractInsights(analysis: SOAPAnalysis): string[] {
    const insights: string[] = []

    // Extraer insights basados en el contenido del análisis
    if (analysis.diagnosticos_diferenciales && analysis.diagnosticos_diferenciales.length > 0) {
      insights.push(
        `Identificados ${analysis.diagnosticos_diferenciales.length} diagnósticos diferenciales`
      )
    }

    if (analysis.confianza_global && analysis.confianza_global > 0.8) {
      insights.push('Alta confianza en el análisis diagnóstico')
    }

    if (analysis.datos_adicionales_necesarios && analysis.datos_adicionales_necesarios.length > 0) {
      insights.push(
        `Necesarios ${analysis.datos_adicionales_necesarios.length} datos adicionales para completar diagnóstico`
      )
    }

    return insights
  }

  private determineNextSteps(analysis: SOAPAnalysis, cycleNumber: number): string[] {
    const steps: string[] = []

    if (analysis.confianza_global && analysis.confianza_global < 0.7) {
      steps.push('Refinar análisis diagnóstico')
    }

    if (analysis.datos_adicionales_necesarios && analysis.datos_adicionales_necesarios.length > 0) {
      steps.push('Solicitar información adicional al médico')
    }

    if (cycleNumber >= this.config.maxCycles) {
      steps.push('Finalizar análisis con recomendaciones actuales')
    } else {
      steps.push('Continuar al siguiente ciclo de análisis')
    }

    return steps
  }

  private enhanceCaseWithInsights(caseData: MedicalCase, cycle: DiagnosticCycle): MedicalCase {
    // Agregar insights del ciclo al contexto del caso
    const enhancedContext = `${caseData.context || ''}\n\nInsights del análisis previo:\n${cycle.insights?.join('\n- ') || ''}`

    return {
      ...caseData,
      context: enhancedContext.trim(),
    }
  }

  private async finalizeSOAPAnalysis(cycles: DiagnosticCycle[]): Promise<SOAPAnalysis> {
    const lastCycle = cycles[cycles.length - 1]
    const finalAnalysis = lastCycle.analysis
    const globalConfidence = this.calculateGlobalConfidence(cycles)

    console.log('🧠 ACTIVANDO ORQUESTADOR COGNITIVO PARA ANÁLISIS FINAL')

    // Si tenemos alta confianza, usar el orquestador cognitivo para refinar el análisis
    if (globalConfidence >= 0.8) {
      try {
        // Crear input estructurado para el orquestador
        const structuredInput = this.buildStructuredInputForOrchestrator(cycles, finalAnalysis)

        // Procesar con orquestador cognitivo (agentes especializados)
        // Usar multiAgentOrchestrator para obtener análisis cognitivo mejorado
        const cognitiveAgents = [
          AgentType.CLINICAL_PHARMACOLOGY,
          AgentType.PEDIATRIC_SPECIALIST,
          AgentType.HOSPITALIZATION_CRITERIA,
          AgentType.FAMILY_EDUCATION,
          AgentType.OBJECTIVE_VALIDATION,
          AgentType.DEFENSIVE_DIFFERENTIAL,
        ]
        const cognitiveResults = await multiAgentOrchestrator.executeParallelAgents(
          structuredInput,
          cognitiveAgents
        )

        const cognitiveResult = {
          decisions: cognitiveResults,
          consensus: cognitiveResults.filter(r => r.success).length > cognitiveResults.length / 2,
          memory: { shortTermMemory: { relevantContext: 'Análisis multi-agente completado' } },
        }

        console.log(
          `🎯 Orquestador activó ${cognitiveResult.decisions.length} agentes especializados`
        )
        console.log(`📊 Consenso alcanzado: ${cognitiveResult.consensus ? 'SÍ' : 'NO'}`)

        // Mejorar análisis SOAP con insights cognitivos
        const enhancedAnalysis = this.enhanceSOAPWithCognitiveInsights(
          finalAnalysis,
          cognitiveResult,
          cycles
        )

        return enhancedAnalysis
      } catch (error) {
        console.warn('⚠️ Error en orquestador cognitivo, usando análisis básico:', error)
        // Fallback al análisis básico si falla el orquestador
      }
    }

    // Análisis básico sin orquestador cognitivo
    return {
      ...finalAnalysis,
      confianza_global: globalConfidence,
      ciclos_diagnosticos: cycles.length,
      tiempo_total_analisis: cycles.reduce((sum, cycle) => sum + (cycle.latency || 0), 0),
      evolucion_diagnostica: cycles.map((cycle, index) => ({
        ciclo: index + 1,
        diagnostico: cycle.analysis?.diagnostico_principal || 'En proceso',
        confianza: cycle.confidence || 0,
      })),
    }
  }

  /**
   * Construye input estructurado para el orquestador basado en los ciclos diagnósticos
   */
  private buildStructuredInputForOrchestrator(
    cycles: DiagnosticCycle[],
    analysis: SOAPAnalysis
  ): string {
    const lastCycle = cycles[cycles.length - 1]

    return `CASO CLÍNICO PARA ANÁLISIS MULTI-AGENTE:

INFORMACIÓN CLÍNICA BASE:
${lastCycle.caseData.presentation}

ANÁLISIS ITERATIVO PREVIO:
- Ciclos completados: ${cycles.length}
- Confianza alcanzada: ${Math.round(this.calculateGlobalConfidence(cycles) * 100)}%

SOAP PRELIMINAR:
S: ${analysis.subjetivo}
O: ${analysis.objetivo}  
A: ${analysis.diagnostico_principal}
P: ${analysis.plan_tratamiento}

DIAGNÓSTICOS DIFERENCIALES:
${analysis.diagnosticos_diferenciales?.map((dx: string, i: number) => `${i + 1}. ${dx}`).join('\n') || 'No especificados'}

SOLICITUD: Coordinar agentes especializados según contexto clínico para validación final y refinamiento diagnóstico.`
  }

  /**
   * Mejora el análisis SOAP con insights del orquestador cognitivo
   */
  private enhanceSOAPWithCognitiveInsights(
    baseAnalysis: SOAPAnalysis,
    cognitiveResult: any,
    cycles: DiagnosticCycle[]
  ): SOAPAnalysis {
    // Extraer insights de las decisiones de agentes especializados
    const specialistInsights = cognitiveResult.decisions
      .filter((decision: any) => decision.confidence > 0.7)
      .map((decision: any) => decision.content)
      .join('\n\n')

    // Mejorar cada sección con insights cognitivos
    const enhancedSubjetivo =
      baseAnalysis.subjetivo +
      (specialistInsights ? `\n\n**Insights de Especialistas:**\n${specialistInsights}` : '')

    const enhancedAnalysis = {
      ...baseAnalysis,
      subjetivo: enhancedSubjetivo,
      confianza_global: Math.min(this.calculateGlobalConfidence(cycles) + 0.1, 1.0), // Bonus por orquestador
      ciclos_diagnosticos: cycles.length,
      tiempo_total_analisis: cycles.reduce((sum, cycle) => sum + (cycle.latency || 0), 0),
      evolucion_diagnostica: cycles.map((cycle, index) => ({
        ciclo: index + 1,
        diagnostico: cycle.analysis?.diagnostico_principal || 'En proceso',
        confianza: cycle.confidence || 0,
      })),
      // Agregar metadata del orquestrador
      analisis_cognitivo: {
        agentes_consultados: cognitiveResult.decisions.length,
        consenso_alcanzado: Boolean(cognitiveResult.consensus),
        insights_memoria:
          cognitiveResult.memory?.shortTermMemory?.relevantContext || 'No disponible',
        validacion_especializada: true,
      },
    }

    console.log('✅ Análisis SOAP mejorado con orquestador cognitivo')
    return enhancedAnalysis
  }

  // Métodos públicos para acceso a datos
  public getCycles(): DiagnosticCycle[] {
    return [...this.cycles]
  }

  public getLastCycle(): DiagnosticCycle | null {
    return this.cycles.length > 0 ? this.cycles[this.cycles.length - 1] : null
  }

  public getCurrentConfidence(): number {
    return this.calculateGlobalConfidence(this.cycles)
  }

  /**
   * 🧠 USA DECISIONAL MIDDLEWARE para generar contexto inteligente
   */
  private async generateContextUsingAI(originalInput: string, agentResults: any): Promise<string> {
    try {
      const response = await callClaudeForDecision(
        'documentation',
        `Analiza los resultados de estos agentes médicos y genera un contexto estructurado para SOAP.

CASO ORIGINAL:
${originalInput}

RESULTADOS DE AGENTES:
${JSON.stringify(agentResults, null, 2)}

INSTRUCCIONES:
- Estructura la información de los especialistas consultados
- Destaca medicaciones específicas, consideraciones pediátricas/geriátricas
- Incluye recomendaciones de disposición
- Formato claro para usar en prompt SOAP

Devuelve en formato documentation con soap.assessment que contenga el contexto estructurado.`,
        'claude'
      )

      if (response.success && (response.decision as any).soap?.assessment) {
        return (response.decision as any).soap.assessment
      }
    } catch (error) {
      console.warn('generateContextUsingAI fallback:', error)
    }

    // Fallback simple
    return this.buildBasicContext(agentResults)
  }

  /**
   * 🧠 USA DECISIONAL MIDDLEWARE para generar estudios dinámicos
   */
  private async generateStudiesUsingAI(originalInput: string, agentResults: any): Promise<string> {
    try {
      const response = await callClaudeForDecision(
        'diagnosis',
        `Analiza este caso médico y determina QUÉ ESTUDIOS DIAGNÓSTICOS se requieren según medicina defensiva.

CASO CLÍNICO:
${originalInput}

CONTEXTO DE AGENTES:
${JSON.stringify(agentResults, null, 2)}

INSTRUCCIONES:
- Aplica medicina defensiva (mejor sobrediagnosticar que subdiagnosticar)  
- Considera edad, síntomas, medicamentos del caso
- Incluye estudios obligatorios, urgentes y de seguimiento
- Justifica cada estudio y sus consecuencias si no se hace

En tests_recommended incluye estudios con justificación completa.`,
        'claude'
      )

      if (response.success && (response.decision as any).tests_recommended) {
        return this.formatStudiesFromAI((response.decision as any).tests_recommended)
      }
    } catch (error) {
      console.warn('generateStudiesUsingAI fallback:', error)
    }

    // Fallback
    return '🔬 MEDICINA DEFENSIVA - ESTUDIOS BÁSICOS:\n- Evaluación clínica completa requerida'
  }

  /**
   * 🆘 Contexto básico si falla la IA
   */
  private buildBasicContext(agentResults: any): string {
    let context = 'DATOS DE ESPECIALISTAS CONSULTADOS:\n\n'

    if (agentResults.pharmacology?.success) {
      context += 'MEDICACIÓN: Prescripción especializada disponible\n'
    }

    if (agentResults.pediatric?.success) {
      context += 'PEDIATRÍA: Consideraciones específicas por edad\n'
    }

    if (agentResults.hospitalization?.success) {
      context += 'DISPOSICIÓN: Criterios de manejo definidos\n'
    }

    return context
  }

  /**
   * 📋 Formatea estudios de respuesta IA
   */
  private formatStudiesFromAI(tests: any[]): string {
    let formatted = '🚨 MEDICINA DEFENSIVA - ESTUDIOS REQUERIDOS:\n\n'

    tests.forEach((test, index) => {
      if (typeof test === 'string') {
        formatted += `${index + 1}. ${test}\n`
      } else if (test.name || test.study) {
        formatted += `${index + 1}. ${test.name || test.study}\n`
        if (test.justification) {
          formatted += `   💡 ${test.justification}\n`
        }
      }
    })

    return formatted
  }
}
