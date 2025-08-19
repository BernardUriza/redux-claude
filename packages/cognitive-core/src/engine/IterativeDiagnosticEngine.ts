// packages/cognitive-core/src/engine/IterativeDiagnosticEngine.ts
// Motor de Diagnóstico Iterativo - Creado por Bernard Orozco
import { ClaudeAdapter } from '../decision-engine/providers/claude'
import { SOAPAnalysis, DiagnosticCycle, MedicalCase, AdditionalInfoRequest } from '../types/medical'
import { MedicalQualityValidator } from '../utils/medicalValidator'

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

    return this.finalizeSOAPAnalysis(this.cycles)
  }

  private async runDiagnosticCycle(
    caseData: MedicalCase,
    cycleNumber: number,
    cycleId: string
  ): Promise<DiagnosticCycle> {
    const startTime = Date.now()

    // Crear prompt específico para este ciclo
    const cyclePrompt = this.buildCyclePrompt(caseData, cycleNumber, this.cycles)

    console.log(`📝 Enviando a Claude (Ciclo ${cycleNumber})...`)

    // Hacer llamada a Claude
    const response = await this.claudeAdapter.makeRequest(
      this.buildSystemPrompt(cycleNumber),
      cyclePrompt
    )

    const endTime = Date.now()
    const latency = endTime - startTime

    // Parsear respuesta en estructura SOAP
    const analysis = this.parseClaudeResponse(response.content)

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
    // Parser básico - se puede mejorar con regex más sofisticados
    const sections = {
      subjetivo: this.extractSection(response, 'S - SUBJETIVO', 'O - OBJETIVO'),
      objetivo: this.extractSection(response, 'O - OBJETIVO', 'A - ANÁLISIS'),
      analisis: this.extractSection(response, 'A - ANÁLISIS', 'P - PLAN'),
      plan: this.extractSection(response, 'P - PLAN', 'DATOS ADICIONALES')
    }

    // Extraer diagnóstico principal
    const diagnostico_principal = this.extractDiagnosticoPrincipal(sections.analisis)
    const diagnosticos_diferenciales = this.extractDiagnosticosDiferenciales(sections.analisis)

    return {
      subjetivo: sections.subjetivo,
      objetivo: sections.objetivo,
      diagnostico_principal,
      diagnosticos_diferenciales,
      plan_tratamiento: sections.plan,
      confianza_global: this.extractConfianza(sections.analisis),
      datos_adicionales_necesarios: this.extractDatosAdicionales(response)
    }
  }

  private extractSection(text: string, startMarker: string, endMarker: string): string {
    const startIndex = text.indexOf(startMarker)
    const endIndex = text.indexOf(endMarker)
    
    if (startIndex === -1) return ''
    
    const start = startIndex + startMarker.length
    const end = endIndex === -1 ? text.length : endIndex
    
    return text.substring(start, end).trim()
  }

  private extractDiagnosticoPrincipal(analisisText: string): string {
    const match = analisisText.match(/\*\*Diagnóstico Principal:\*\*\s*(.+?)(?=\n|\*\*|$)/i)
    return match ? match[1].trim() : 'No especificado'
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
    // Lógica para determinar si necesita más datos
    const hasLowConfidence = (analysis.confianza_global || 0) < 0.6
    const hasInsufficientSubjective = analysis.subjetivo.length < 50
    const hasInsufficientObjective = analysis.objetivo.length < 30
    const needsAdditionalData = (analysis.datos_adicionales_necesarios?.length || 0) > 2

    return hasLowConfidence && (hasInsufficientSubjective || hasInsufficientObjective || needsAdditionalData)
  }

  private createAdditionalInfoRequest(analysis: SOAPAnalysis, currentCycle: number): AdditionalInfoRequest {
    return {
      type: 'additional_info_needed',
      currentCycle,
      confidence: analysis.confianza_global || 0,
      questions: analysis.datos_adicionales_necesarios || [],
      partialAnalysis: analysis,
      nextActions: [
        'Proporcionar información adicional solicitada',
        'Confirmar datos demográficos si faltan',
        'Especificar cronología de síntomas',
        'Incluir antecedentes médicos relevantes'
      ]
    }
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

  private finalizeSOAPAnalysis(cycles: DiagnosticCycle[]): SOAPAnalysis {
    const lastCycle = cycles[cycles.length - 1]
    const finalAnalysis = lastCycle.analysis

    // Mejorar el análisis final con datos de todos los ciclos
    return {
      ...finalAnalysis,
      confianza_global: this.calculateGlobalConfidence(cycles),
      ciclos_diagnosticos: cycles.length,
      tiempo_total_analisis: cycles.reduce((sum, cycle) => sum + (cycle.latency || 0), 0),
      evolucion_diagnostica: cycles.map((cycle, index) => ({
        ciclo: index + 1,
        diagnostico: cycle.analysis?.diagnostico_principal || 'En proceso',
        confianza: cycle.confidence || 0
      }))
    }
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
}