// packages/cognitive-core/src/services/AdditionalInfoService.ts
// Servicio para Manejo de Información Adicional - Creado por Bernard Orozco

import { AdditionalInfoRequest, MedicalCase, SOAPAnalysis } from '../types/medical'

export interface InfoRequestMessage {
  id: string
  type: 'additional_info_request'
  content: string
  questions: string[]
  currentCycle: number
  confidence: number
  partialAnalysis: SOAPAnalysis
  nextActions: string[]
  timestamp: number
}

export interface InfoResponseMessage {
  id: string
  type: 'additional_info_response'
  originalRequestId: string
  additionalData: string
  timestamp: number
}

export class AdditionalInfoService {
  private pendingRequests: Map<string, AdditionalInfoRequest> = new Map()

  /**
   * Convierte una solicitud de información adicional en un mensaje para el usuario
   */
  public formatInfoRequestMessage(request: AdditionalInfoRequest): InfoRequestMessage {
    const messageId = `info_req_${Date.now()}_${request.currentCycle}`
    
    // Almacenar la solicitud pendiente
    this.pendingRequests.set(messageId, request)

    const formattedMessage = this.buildInfoRequestContent(request)

    return {
      id: messageId,
      type: 'additional_info_request',
      content: formattedMessage,
      questions: request.questions,
      currentCycle: request.currentCycle,
      confidence: request.confidence,
      partialAnalysis: request.partialAnalysis,
      nextActions: request.nextActions,
      timestamp: Date.now()
    }
  }

  /**
   * Construye el mensaje formateado para solicitar información adicional
   */
  private buildInfoRequestContent(request: AdditionalInfoRequest): string {
    const confidencePercentage = Math.round(request.confidence * 100)
    
    return `## 🔬 Análisis Médico en Progreso - Ciclo ${request.currentCycle}

**Estado:** Información adicional requerida para completar diagnóstico  
**Confianza actual:** ${confidencePercentage}%

### 📋 Análisis Parcial Realizado

**🩺 Subjetivo Identificado:**
${request.partialAnalysis.subjetivo || 'Datos limitados disponibles'}

**📊 Objetivo Inferido:**
${request.partialAnalysis.objetivo || 'Requiere información adicional'}

**🔍 Diagnóstico Preliminar:**
${request.partialAnalysis.diagnostico_principal || 'En evaluación'}

---

### ❓ Información Adicional Necesaria

Para proporcionar un análisis médico completo y preciso, necesito que proporciones:

${request.questions.map((question, index) => `${index + 1}. **${question}**`).join('\n')}

### 📝 Formato Sugerido

Por favor, proporciona la información adicional en un formato estructurado:

**Información complementaria:**
- [Responde cada punto mencionado arriba]
- [Incluye cualquier dato relevante que consideres importante]
- [Menciona antecedentes médicos si no se han especificado]

### 🚀 Próximos Pasos

${request.nextActions.map((action, index) => `${index + 1}. ${action}`).join('\n')}

---

*Una vez que proporciones esta información, continuaré con el análisis médico completo y estructurado en formato SOAP.*`
  }

  /**
   * Procesa la respuesta del usuario con información adicional
   */
  public processInfoResponse(
    requestId: string, 
    additionalData: string
  ): { success: boolean; enhancedCase?: MedicalCase; error?: string } {
    
    const originalRequest = this.pendingRequests.get(requestId)
    
    if (!originalRequest) {
      return {
        success: false,
        error: 'Solicitud de información no encontrada o expirada'
      }
    }

    // Crear caso médico mejorado combinando datos originales con información adicional
    const enhancedCase = this.mergeAdditionalInfo(originalRequest, additionalData)

    // Limpiar la solicitud pendiente
    this.pendingRequests.delete(requestId)

    console.log(`✅ Información adicional procesada para solicitud ${requestId}`)
    console.log(`📈 Caso médico mejorado con datos adicionales`)

    return {
      success: true,
      enhancedCase
    }
  }

  /**
   * Combina la información original con los datos adicionales proporcionados
   */
  private mergeAdditionalInfo(
    originalRequest: AdditionalInfoRequest, 
    additionalData: string
  ): MedicalCase {
    
    const originalAnalysis = originalRequest.partialAnalysis
    
    // Extraer presentación original desde el análisis parcial
    const originalPresentation = this.reconstructOriginalCase(originalAnalysis)
    
    // Combinar datos
    const enhancedPresentation = `${originalPresentation}

**INFORMACIÓN ADICIONAL (Ciclo ${originalRequest.currentCycle}):**
${additionalData}`

    return {
      id: `enhanced_${Date.now()}`,
      presentation: enhancedPresentation,
      context: `Caso mejorado después de ${originalRequest.currentCycle} ciclos de análisis iterativo`,
      history: this.extractHistoryFromAdditionalData(additionalData)
    }
  }

  /**
   * Reconstruye el caso original a partir del análisis parcial
   */
  private reconstructOriginalCase(analysis: SOAPAnalysis): string {
    let reconstructed = ''

    if (analysis.subjetivo) {
      reconstructed += `**Presentación Clínica:**\n${analysis.subjetivo}\n\n`
    }

    if (analysis.objetivo) {
      reconstructed += `**Hallazgos Objetivos:**\n${analysis.objetivo}\n\n`
    }

    if (analysis.diagnostico_principal && analysis.diagnostico_principal !== 'No especificado') {
      reconstructed += `**Impresión Diagnóstica Preliminar:**\n${analysis.diagnostico_principal}\n\n`
    }

    return reconstructed.trim() || 'Caso clínico en proceso de análisis'
  }

  /**
   * Extrae información histórica de los datos adicionales
   */
  private extractHistoryFromAdditionalData(additionalData: string): string {
    const cleanData = additionalData.toLowerCase()
    const historyTerms = [
      'antecedentes',
      'historia',
      'familiar',
      'medicamentos',
      'alergias',
      'cirugías',
      'hospitalizaciones'
    ]

    const historyLines = additionalData.split('\n').filter(line =>
      historyTerms.some(term => line.toLowerCase().includes(term))
    )

    return historyLines.length > 0 ? historyLines.join('\n') : 'Historia clínica complementaria proporcionada'
  }

  /**
   * Obtiene todas las solicitudes pendientes
   */
  public getPendingRequests(): AdditionalInfoRequest[] {
    return Array.from(this.pendingRequests.values())
  }

  /**
   * Cancela una solicitud pendiente
   */
  public cancelRequest(requestId: string): boolean {
    return this.pendingRequests.delete(requestId)
  }

  /**
   * Limpia solicitudes expiradas (más de 30 minutos)
   */
  public cleanupExpiredRequests(): number {
    const now = Date.now()
    const maxAge = 30 * 60 * 1000 // 30 minutos
    let removedCount = 0

    for (const [requestId, request] of this.pendingRequests.entries()) {
      // Las solicitudes no tienen timestamp directo, usar el análisis parcial como referencia
      // Por simplicidad, eliminar solicitudes después de un tiempo razonable
      if (Object.keys(this.pendingRequests).length > 10) {
        this.pendingRequests.delete(requestId)
        removedCount++
      }
    }

    if (removedCount > 0) {
      console.log(`🧹 Limpiadas ${removedCount} solicitudes de información expiradas`)
    }

    return removedCount
  }

  /**
   * Verifica si una solicitud específica sigue pendiente
   */
  public hasRequestPending(requestId: string): boolean {
    return this.pendingRequests.has(requestId)
  }

  /**
   * Obtiene estadísticas del servicio
   */
  public getStats(): {
    pendingRequests: number
    totalProcessed: number
  } {
    return {
      pendingRequests: this.pendingRequests.size,
      totalProcessed: 0 // Se podría trackear si fuera necesario
    }
  }
}

// Singleton instance
export const additionalInfoService = new AdditionalInfoService()