// packages/cognitive-core/src/engine/IterativeDiagnosticEngine.ts
// Motor de Diagnóstico Iterativo - Creado por Bernard Orozco
import { ClaudeAdapter } from '../decision-engine/providers/claude'
import { SOAPAnalysis, DiagnosticCycle, MedicalCase, AdditionalInfoRequest } from '../types/medical'
import { MedicalQualityValidator } from '../utils/medicalValidator'
import { multiAgentOrchestrator } from '../services/multiAgentOrchestrator'
import { AgentType } from '../types/agents'

interface DiagnosticEngineConfig {
  maxCycles: number
  confidenceThreshold: number
  qualityThreshold: number
}

export class IterativeDiagnosticEngine {
  private cycles: DiagnosticCycle[] = []
  private claudeAdapter: ClaudeAdapter
  private validator: MedicalQualityValidator
  private config: DiagnosticEngineConfig

  constructor(claudeAdapter?: ClaudeAdapter, config?: Partial<DiagnosticEngineConfig>) {
    this.claudeAdapter = claudeAdapter || new ClaudeAdapter()
    this.validator = new MedicalQualityValidator()
    this.config = {
      maxCycles: 3,
      confidenceThreshold: 0.85,
      qualityThreshold: 0.8,
      ...config
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

    while (globalConfidence < this.config.confidenceThreshold && currentCycle <= this.config.maxCycles) {
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
        console.log(`⚠️ Calidad insuficiente (${Math.round(qualityScore * 100)}%) - Refinando análisis`)
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

    console.log(`📝 Ejecutando agentes especializados (Ciclo ${cycleNumber})...`)

    // Ejecutar agentes especializados en paralelo para mayor especificidad
    const [primaryResponse, pharmacologyDetails, pediatricDetails, hospitalizationDetails, familyEducationDetails, objectiveValidation, defensiveDifferentials] = await Promise.all([
      // Análisis SOAP principal
      this.claudeAdapter.makeRequest(
        this.buildSystemPrompt(cycleNumber),
        cyclePrompt
      ),
      // Agente de farmacología clínica
      multiAgentOrchestrator.executeSingleAgent(AgentType.CLINICAL_PHARMACOLOGY, cyclePrompt).catch(() => null),
      // Agente especialista pediátrico
      multiAgentOrchestrator.executeSingleAgent(AgentType.PEDIATRIC_SPECIALIST, cyclePrompt).catch(() => null),
      // Agente criterios hospitalización
      multiAgentOrchestrator.executeSingleAgent(AgentType.HOSPITALIZATION_CRITERIA, cyclePrompt).catch(() => null),
      // Agente educación familiar
      multiAgentOrchestrator.executeSingleAgent(AgentType.FAMILY_EDUCATION, cyclePrompt).catch(() => null),
      // Agente de validación objetiva
      multiAgentOrchestrator.executeSingleAgent(AgentType.OBJECTIVE_VALIDATION, cyclePrompt).catch(() => null),
      // Agente de medicina defensiva
      multiAgentOrchestrator.executeSingleAgent(AgentType.DEFENSIVE_DIFFERENTIAL, cyclePrompt).catch(() => null)
    ])

    const response = primaryResponse

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
          datos_adicionales_necesarios: []
        },
        confidence: 0,
        qualityScore: 0,
        insights: [`Error del sistema: ${errorMessage}`],
        nextSteps: ['Verificar conectividad', 'Revisar logs del sistema', 'Contactar soporte técnico']
      }
    }

    const endTime = Date.now()
    const latency = endTime - startTime

    // Parsear respuesta SOAP principal
    const baseAnalysis = this.parseClaudeResponse(response.content)
    
    // Integrar resultados de agentes especializados
    const analysis = this.integrateSpecializedAgentResults(
      baseAnalysis, 
      pharmacologyDetails,
      pediatricDetails,
      hospitalizationDetails,
      familyEducationDetails,
      objectiveValidation, 
      defensiveDifferentials,
      cyclePrompt
    )

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
      nextSteps: this.determineNextSteps(analysis, cycleNumber)
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
      return basePrompt + `

ANÁLISIS INICIAL - Evalúa con la información disponible:
- Identifica patrones clínicos principales
- Lista diagnósticos diferenciales por probabilidad Y gravedad
- Indica qué datos adicionales serían críticos`
    }

    return basePrompt + `

ANÁLISIS REFINADO - Mejora el análisis previo:
- Incorpora insights del ciclo anterior
- Ajusta diagnósticos diferenciales
- Aumenta especificidad del plan terapéutico`
  }

  private buildCyclePrompt(caseData: MedicalCase, cycleNumber: number, previousCycles: DiagnosticCycle[]): string {
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
[Signos vitales y hallazgos físicos inferidos/disponibles]
**Confianza:** [0-100]%

## A - ANÁLISIS
**Diagnóstico Principal:** [Diagnóstico más probable]
**Diagnósticos Diferenciales:**
1. [ALTA GRAVEDAD - descartar urgente] - Probabilidad: X%
2. [ALTA PROBABILIDAD - común en contexto] - Probabilidad: X%
3. [Otras consideraciones] - Probabilidad: X%
**Confianza global:** [0-100]%

## P - PLAN
**Inmediato:** [Tratamiento ahora]
**Seguimiento:** [Cuándo revisar - específico]
**Derivación:** [Cuándo referir especialista]
**Estudios:** [Qué estudios solicitar - prioridad]
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
      subjetivo: this.extractSection(response, 'S - SUBJETIVO', 'O - OBJETIVO') || 
                 this.extractSection(response, 'SUBJETIVO', 'OBJETIVO') ||
                 this.extractSection(response, '**S**', '**O**') ||
                 this.extractSectionFallback(response, 'subjetivo'),
      objetivo: this.extractSection(response, 'O - OBJETIVO', 'A - ANÁLISIS') ||
                this.extractSection(response, 'OBJETIVO', 'ANÁLISIS') ||
                this.extractSection(response, '**O**', '**A**') ||
                this.extractSectionFallback(response, 'objetivo'),
      analisis: this.extractSection(response, 'A - ANÁLISIS', 'P - PLAN') ||
                this.extractSection(response, 'ANÁLISIS', 'PLAN') ||
                this.extractSection(response, '**A**', '**P**') ||
                this.extractSectionFallback(response, 'análisis'),
      plan: this.extractSection(response, 'P - PLAN', 'DATOS ADICIONALES') ||
            this.extractSection(response, 'PLAN', '') ||
            this.extractSection(response, '**P**', '') ||
            this.extractSectionFallback(response, 'plan')
    }

    console.log('📝 Secciones extraídas:', {
      subjetivo: sections.subjetivo?.substring(0, 100) + '...',
      objetivo: sections.objetivo?.substring(0, 100) + '...',
      analisis: sections.analisis?.substring(0, 100) + '...',
      plan: sections.plan?.substring(0, 100) + '...'
    })

    // Extraer diagnóstico principal
    const diagnostico_principal = this.extractDiagnosticoPrincipal(sections.analisis) ||
                                 this.extractDiagnosticoPrincipal(response)
    const diagnosticos_diferenciales = this.extractDiagnosticosDiferenciales(sections.analisis) ||
                                      this.extractDiagnosticosDiferenciales(response)

    // Si no se pudo parsear nada, mostrar la respuesta completa para debug
    const hasValidSections = sections.subjetivo || sections.objetivo || sections.analisis || sections.plan
    
    if (!hasValidSections) {
      console.warn('⚠️ No se pudieron extraer secciones SOAP. Respuesta completa:', response)
      return {
        subjetivo: '## ⚠️ Error de Parsing\n\nNo se pudieron extraer las secciones SOAP de la respuesta.',
        objetivo: `**Respuesta completa de Claude:**\n\n${response}`,
        diagnostico_principal: 'Error en parsing de respuesta',
        diagnosticos_diferenciales: ['Revisar formato de respuesta de Claude'],
        plan_tratamiento: 'Verificar prompt y configuración del sistema.',
        confianza_global: 0,
        datos_adicionales_necesarios: ['Revisar logs del sistema']
      }
    }

    return {
      subjetivo: sections.subjetivo || 'Información subjetiva del paciente disponible en caso clínico.',
      objetivo: sections.objetivo || 'Hallazgos objetivos a documentar durante exploración física.',
      diagnostico_principal: diagnostico_principal || 'Diagnóstico por determinar tras evaluación completa',
      diagnosticos_diferenciales: diagnosticos_diferenciales?.length > 0 ? diagnosticos_diferenciales : ['Diagnósticos diferenciales por evaluar'],
      plan_tratamiento: sections.plan || 'Plan de tratamiento por establecer según diagnóstico definitivo.',
      confianza_global: this.extractConfianza(sections.analisis) || this.extractConfianza(response) || 0.5,
      datos_adicionales_necesarios: this.extractDatosAdicionales(response)
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
        /(?:historia.*actual|evolución)[\s\S]*?(?=objetivo|hallazgos|examen|$)/i
      ],
      objetivo: [
        /(?:examen.*físico|hallazgos|signos.*vitales)[\s\S]*?(?=análisis|diagnóstico|impresión|$)/i,
        /(?:exploración|inspección|palpación)[\s\S]*?(?=análisis|diagnóstico|impresión|$)/i
      ],
      análisis: [
        /(?:diagnóstico|impresión|análisis)[\s\S]*?(?=plan|tratamiento|manejo|$)/i,
        /(?:diferencial|presuntivo)[\s\S]*?(?=plan|tratamiento|manejo|$)/i
      ],
      plan: [
        /(?:plan|tratamiento|manejo|recomendaciones)[\s\S]*$/i,
        /(?:medicamentos|terapia|seguimiento)[\s\S]*$/i
      ]
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
      /(?:dermatitis|eczema|psoriasis|alergia)[\w\s]+/i
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
    const hasVeryLowConfidence = (analysis.confianza_global || 0) < 0.4  // Reducido de 0.6 a 0.4
    const hasInsufficientSubjective = (analysis.subjetivo?.length || 0) < 30  // Reducido de 50 a 30
    const hasInsufficientObjective = (analysis.objetivo?.length || 0) < 20   // Reducido de 30 a 20
    const hasCriticalDataNeeds = (analysis.datos_adicionales_necesarios?.length || 0) > 3  // Aumentado de 2 a 3

    // Solo pedir información adicional si realmente es crítico
    return hasVeryLowConfidence && hasInsufficientSubjective && hasInsufficientObjective
  }

  private createAdditionalInfoRequest(analysis: SOAPAnalysis, currentCycle: number): AdditionalInfoRequest {
    // Generar preguntas específicas basadas en lo que falta
    const specificQuestions = this.generateSpecificQuestions(analysis)
    const specificActions = this.generateSpecificActions(analysis)

    return {
      type: 'additional_info_needed',
      currentCycle,
      confidence: analysis.confianza_global || 0,
      questions: specificQuestions.length > 0 ? specificQuestions : analysis.datos_adicionales_necesarios || [],
      partialAnalysis: analysis,
      nextActions: specificActions.length > 0 ? specificActions : [
        'Proporcionar información adicional solicitada',
        'Confirmar datos demográficos si faltan',
        'Especificar cronología de síntomas',
        'Incluir antecedentes médicos relevantes'
      ]
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
      questions.push('¿Cuáles son las características exactas de las lesiones (tamaño, distribución, textura)?')
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
    if (analysis.diagnostico_principal && analysis.diagnostico_principal !== 'No especificado') score += 0.2
    if (analysis.diagnosticos_diferenciales && analysis.diagnosticos_diferenciales.length >= 2) score += 0.15
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
      insights.push(`Identificados ${analysis.diagnosticos_diferenciales.length} diagnósticos diferenciales`)
    }
    
    if (analysis.confianza_global && analysis.confianza_global > 0.8) {
      insights.push('Alta confianza en el análisis diagnóstico')
    }
    
    if (analysis.datos_adicionales_necesarios && analysis.datos_adicionales_necesarios.length > 0) {
      insights.push(`Necesarios ${analysis.datos_adicionales_necesarios.length} datos adicionales para completar diagnóstico`)
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
      context: enhancedContext.trim()
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
          AgentType.DEFENSIVE_DIFFERENTIAL
        ]
        const cognitiveResults = await multiAgentOrchestrator.executeParallelAgents(
          structuredInput, 
          cognitiveAgents
        )
        
        const cognitiveResult = {
          decisions: cognitiveResults,
          consensus: cognitiveResults.filter(r => r.success).length > cognitiveResults.length / 2,
          memory: { shortTermMemory: { relevantContext: 'Análisis multi-agente completado' } }
        }
        
        console.log(`🎯 Orquestador activó ${cognitiveResult.decisions.length} agentes especializados`)
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
        confianza: cycle.confidence || 0
      }))
    }
  }

  /**
   * Construye input estructurado para el orquestador basado en los ciclos diagnósticos
   */
  private buildStructuredInputForOrchestrator(cycles: DiagnosticCycle[], analysis: SOAPAnalysis): string {
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
    const enhancedSubjetivo = baseAnalysis.subjetivo + 
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
        confianza: cycle.confidence || 0
      })),
      // Agregar metadata del orquestrador
      analisis_cognitivo: {
        agentes_consultados: cognitiveResult.decisions.length,
        consenso_alcanzado: Boolean(cognitiveResult.consensus),
        insights_memoria: cognitiveResult.memory?.shortTermMemory?.relevantContext || 'No disponible',
        validacion_especializada: true
      }
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
   * Integra resultados de agentes especializados en el análisis SOAP base
   */
  private integrateSpecializedAgentResults(
    baseAnalysis: SOAPAnalysis,
    pharmacologyDetails: any,
    pediatricDetails: any,
    hospitalizationDetails: any,
    familyEducationDetails: any,
    objectiveValidation: any,
    defensiveDifferentials: any,
    originalInput: string
  ): SOAPAnalysis {
    console.log('🔬 Integrando resultados de agentes especializados...')

    let enhancedAnalysis = { ...baseAnalysis }

    // 1. INTEGRAR FARMACOLOGÍA CLÍNICA
    if (pharmacologyDetails?.success && pharmacologyDetails?.decision) {
      const pharmacology = pharmacologyDetails.decision
      let enhancedPlan = baseAnalysis.plan_tratamiento || ''
      
      if (pharmacology.primary_medication) {
        const med = pharmacology.primary_medication
        enhancedPlan += `\n\n### 💊 PRESCRIPCIÓN PRINCIPAL:\n**${med.generic_name}** (${med.brand_names?.join(', ') || 'marcas varias'})\n- Dosis: ${med.exact_dose}\n- Vía: ${med.route}\n- Frecuencia: ${med.frequency}\n- Duración: ${med.duration}\n- Línea: ${med.line_of_treatment}\n- Evidencia: Nivel ${med.evidence_level}`
      }

      if (pharmacology.alternative_medications?.length > 0) {
        const alternatives = pharmacology.alternative_medications
          .map((alt: any) => `**${alt.generic_name}**: ${alt.exact_dose} - ${alt.indication} (${alt.line_of_treatment} línea)`)
          .join('\n- ')
        enhancedPlan += `\n\n### 🔄 MEDICAMENTOS ALTERNATIVOS:\n- ${alternatives}`
      }

      if (pharmacology.contraindications?.length > 0) {
        enhancedPlan += `\n\n### ⚠️ CONTRAINDICACIONES:\n- ${pharmacology.contraindications.join('\n- ')}`
      }

      if (pharmacology.monitoring_parameters?.length > 0) {
        enhancedPlan += `\n\n### 📊 MONITOREO REQUERIDO:\n- ${pharmacology.monitoring_parameters.join('\n- ')}`
      }

      enhancedAnalysis.plan_tratamiento = enhancedPlan
    }

    // 2. INTEGRAR CONSIDERACIONES PEDIÁTRICAS
    if (pediatricDetails?.success && pediatricDetails?.decision) {
      const pediatric = pediatricDetails.decision
      let enhancedObjetivo = baseAnalysis.objetivo || ''
      
      if (pediatric.age_specific_considerations?.length > 0) {
        enhancedObjetivo += `\n\n### 👶 CONSIDERACIONES PEDIÁTRICAS:\n- ${pediatric.age_specific_considerations.join('\n- ')}`
      }

      if (pediatric.pediatric_red_flags?.length > 0) {
        enhancedObjetivo += `\n\n### 🚨 RED FLAGS PEDIÁTRICAS:\n- ${pediatric.pediatric_red_flags.join('\n- ')}`
      }

      if (pediatric.weight_based_calculations?.estimated_weight_kg) {
        enhancedObjetivo += `\n\n### 📏 CÁLCULOS PESO-EDAD:\n- Peso estimado: ${pediatric.weight_based_calculations.estimated_weight_kg} kg\n- Información dosis/kg: ${pediatric.weight_based_calculations.dose_per_kg || 'No especificada'}`
      }

      enhancedAnalysis.objetivo = enhancedObjetivo
    }

    // 3. INTEGRAR CRITERIOS HOSPITALIZACIÓN
    if (hospitalizationDetails?.success && hospitalizationDetails?.decision) {
      const hospitalization = hospitalizationDetails.decision
      let enhancedPlan = enhancedAnalysis.plan_tratamiento || ''
      
      enhancedPlan += `\n\n### 🏥 EVALUACIÓN HOSPITALIZACIÓN:\n**Disposición recomendada:** ${hospitalization.disposition_recommendation}`

      if (hospitalization.admission_criteria?.length > 0) {
        enhancedPlan += `\n\n**Criterios de Ingreso:**\n- ${hospitalization.admission_criteria.join('\n- ')}`
      }

      if (hospitalization.discharge_criteria?.length > 0) {
        enhancedPlan += `\n\n**Criterios de Alta:**\n- ${hospitalization.discharge_criteria.join('\n- ')}`
      }

      if (hospitalization.icu_criteria?.length > 0) {
        enhancedPlan += `\n\n**Criterios UCI:**\n- ${hospitalization.icu_criteria.join('\n- ')}`
      }

      enhancedAnalysis.plan_tratamiento = enhancedPlan
    }

    // 4. INTEGRAR EDUCACIÓN FAMILIAR
    if (familyEducationDetails?.success && familyEducationDetails?.decision) {
      const familyEd = familyEducationDetails.decision
      let enhancedPlan = enhancedAnalysis.plan_tratamiento || ''
      
      if (familyEd.warning_signs?.length > 0) {
        enhancedPlan += `\n\n### ⚠️ SIGNOS DE ALARMA (regresar inmediatamente):\n- ${familyEd.warning_signs.join('\n- ')}`
      }

      if (familyEd.home_care_instructions?.length > 0) {
        enhancedPlan += `\n\n### 🏠 CUIDADOS EN CASA:\n- ${familyEd.home_care_instructions.join('\n- ')}`
      }

      if (familyEd.medication_education?.length > 0) {
        enhancedPlan += `\n\n### 💊 EDUCACIÓN MEDICAMENTOS:\n- ${familyEd.medication_education.join('\n- ')}`
      }

      if (familyEd.follow_up_instructions?.length > 0) {
        enhancedPlan += `\n\n### 📅 SEGUIMIENTO:\n- ${familyEd.follow_up_instructions.join('\n- ')}`
      }

      enhancedAnalysis.plan_tratamiento = enhancedPlan
    }

    // 5. INTEGRAR VALIDACIÓN OBJETIVA
    if (objectiveValidation?.success && objectiveValidation?.decision) {
      const validation = objectiveValidation.decision
      let enhancedObjetivo = baseAnalysis.objetivo || ''
      
      if (validation.missing_critical_data?.length > 0) {
        enhancedObjetivo += `\n\n### ⚠️ DATOS CRÍTICOS FALTANTES:\n- ${validation.missing_critical_data.join('\n- ')}`
      }

      if (validation.recommended_studies?.length > 0) {
        const urgentStudies = validation.recommended_studies
          .filter((study: any) => study.urgency === 'immediate' || study.urgency === '24h')
          .map((study: any) => `${study.study} (${study.urgency}) - ${study.justification}`)
          .join('\n- ')
        
        if (urgentStudies) {
          enhancedObjetivo += `\n\n### 🔬 ESTUDIOS REQUERIDOS:\n- ${urgentStudies}`
        }
      }

      // Ajustar confianza basado en datos faltantes
      if (validation.confidence_impact && validation.confidence_impact > 0.2) {
        enhancedAnalysis.confianza_global = Math.max(
          (enhancedAnalysis.confianza_global || 0.5) - validation.confidence_impact,
          0.3
        )
      }

      enhancedAnalysis.objetivo = enhancedObjetivo
    }

    // 6. INTEGRAR MEDICINA DEFENSIVA 
    if (defensiveDifferentials?.success && defensiveDifferentials?.decision) {
      const defensive = defensiveDifferentials.decision
      
      if (defensive.must_exclude_diagnoses?.length > 0) {
        const mustExclude = defensive.must_exclude_diagnoses
          .filter((dx: any) => dx.gravity_score >= 8)
          .map((dx: any) => `${dx.condition} (Gravedad: ${dx.gravity_score}/10) - ${dx.exclusion_criteria.join(', ')}`)
          .join('\n- ')
        
        if (mustExclude) {
          enhancedAnalysis.diagnosticos_diferenciales = [
            ...(enhancedAnalysis.diagnosticos_diferenciales || []),
            `\n\n### 🛡️ DIAGNÓSTICOS DE EXCLUSIÓN OBLIGATORIA:\n- ${mustExclude}`
          ]
        }
      }

      if (defensive.red_flags_analysis?.critical_signs?.length > 0) {
        let enhancedAnalisis = (baseAnalysis.plan_tratamiento || '') + 
          `\n\n### 🚨 RED FLAGS IDENTIFICADAS:\n- ${defensive.red_flags_analysis.critical_signs.join('\n- ')}`
        enhancedAnalysis.plan_tratamiento = enhancedAnalisis
      }
    }

    // 7. RECALCULAR CONFIANZA GLOBAL DE MANERA CONSISTENTE
    const baseConfidence = enhancedAnalysis.confianza_global || 0.5
    
    // Factores que afectan la confianza
    let confidenceAdjustment = 0
    
    // Bonus por farmacología específica
    if (pharmacologyDetails?.success && pharmacologyDetails?.decision?.primary_medication) {
      confidenceAdjustment += 0.1
    }
    
    // Bonus por consideraciones pediátricas
    if (pediatricDetails?.success && pediatricDetails?.decision?.age_specific_considerations?.length > 0) {
      confidenceAdjustment += 0.05
    }
    
    // Bonus por criterios hospitalización evaluados
    if (hospitalizationDetails?.success && hospitalizationDetails?.decision?.disposition_recommendation) {
      confidenceAdjustment += 0.05
    }
    
    // Bonus por educación familiar completa
    if (familyEducationDetails?.success && familyEducationDetails?.decision?.warning_signs?.length > 0) {
      confidenceAdjustment += 0.05
    }
    
    // Penalización por datos críticos faltantes
    if (objectiveValidation?.success && objectiveValidation?.decision?.missing_critical_data?.length > 0) {
      const criticalMissing = objectiveValidation.decision.missing_critical_data.length
      confidenceAdjustment -= Math.min(criticalMissing * 0.15, 0.4)
    }
    
    // Bonus por medicina defensiva aplicada
    if (defensiveDifferentials?.success && defensiveDifferentials?.decision?.must_exclude_diagnoses?.length > 0) {
      confidenceAdjustment += 0.05
    }
    
    // Calcular confianza final (nunca menor a 30%, nunca mayor a 95%)
    const finalConfidence = Math.max(0.3, Math.min(0.95, baseConfidence + confidenceAdjustment))
    
    enhancedAnalysis.confianza_global = finalConfidence
    
    // Agregar metadata de validación
    enhancedAnalysis.validacion_agentes = {
      farmacologia_clinica: Boolean(pharmacologyDetails?.success && pharmacologyDetails?.decision),
      pediatria_especializada: Boolean(pediatricDetails?.success && pediatricDetails?.decision),
      criterios_hospitalizacion: Boolean(hospitalizationDetails?.success && hospitalizationDetails?.decision),
      educacion_familiar: Boolean(familyEducationDetails?.success && familyEducationDetails?.decision),
      validacion_objetiva: Boolean(objectiveValidation?.success && objectiveValidation?.decision),
      medicina_defensiva: Boolean(defensiveDifferentials?.success && defensiveDifferentials?.decision),
      confianza_ajustada: finalConfidence,
      factores_confianza: {
        base: baseConfidence,
        ajuste: confidenceAdjustment,
        datos_faltantes: objectiveValidation?.success && objectiveValidation?.decision?.missing_critical_data?.length || 0
      }
    }

    console.log(`✅ Análisis enriquecido - Confianza ajustada: ${Math.round(finalConfidence * 100)}% (base: ${Math.round(baseConfidence * 100)}%, ajuste: ${confidenceAdjustment > 0 ? '+' : ''}${Math.round(confidenceAdjustment * 100)}%)`)
    
    return enhancedAnalysis
  }
}