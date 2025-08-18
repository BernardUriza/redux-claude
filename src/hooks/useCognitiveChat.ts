// src/hooks/useCognitiveChat.ts
// Chat Cognitivo Integrado - Bernard Orozco

import { useDispatch, useSelector } from 'react-redux'
import { useCallback } from 'react'
import { RootState, AppDispatch } from '@/store/store'
import { addUserMessage, addAssistantMessage, setError } from '@/store/chatSlice'
import { processCognitively } from '@/store/cognitiveSlice'
import { cognitiveOrchestrator } from '@/services/cognitiveOrchestrator'
import type { MedicalDecision, Differential, Medication } from '@/types/cognitive'
import type { DecisionResult, DiagnosticDecision, TriageDecision, ValidationDecision, TreatmentDecision } from '@/types/agents'

export const useCognitiveChat = () => {
  const dispatch = useDispatch<AppDispatch>()
  
  const chatState = useSelector((state: RootState) => state.chat)
  const cognitiveState = useSelector((state: RootState) => state.cognitive)
  
  // Procesar mensaje con cognición completa
  const sendMessage = useCallback(async (message: string) => {
    try {
      // 1. Agregar mensaje del usuario inmediatamente
      dispatch(addUserMessage(message))
      
      // 2. Procesar con sistema cognitivo completo
      const cognitiveResult = await dispatch(processCognitively(message)).unwrap()
      
      // 3. Generar respuesta coherente basada en cognición
      const response = generateCognitiveResponse(cognitiveResult)
      
      // 4. Agregar respuesta del asistente
      dispatch(addAssistantMessage(response))
      
      return cognitiveResult
      
    } catch (error) {
      dispatch(setError('Error en procesamiento cognitivo'))
      console.error('Cognitive chat error:', error)
      throw error
    }
  }, [dispatch])
  
  return {
    // Estado del chat
    messages: chatState.messages,
    isLoading: chatState.isLoading || cognitiveState.isProcessing,
    error: chatState.error || cognitiveState.error,
    
    // Resultado cognitivo
    lastCognitiveResult: cognitiveState.lastDecisions,
    lastConsensus: cognitiveState.lastConsensus,
    lastInsights: cognitiveState.lastInsights,
    
    // Métricas cognitivas
    systemConfidence: cognitiveState.systemConfidence,
    overallHealth: cognitiveState.overallHealth,
    
    // Acciones
    sendMessage
  }
}

interface CognitiveResult {
  decisions: DecisionResult[]
  consensus: { reached: boolean; confidence: number } | null
  memory: { context: string; symptoms?: string[]; hypotheses?: unknown[] } | null
  insights: { pattern?: string; recommendation?: string; confidence?: number } | null
}

// Generar respuesta coherente basada en resultados cognitivos
function generateCognitiveResponse(cognitiveResult: CognitiveResult): string {
  const { decisions, consensus, memory, insights } = cognitiveResult
  
  let response = ""
  
  // 1. Resumen ejecutivo
  if (consensus && consensus.reached) {
    response += `## 🎯 Análisis Cognitivo Completado\n\n`
    response += `**Consenso alcanzado** con ${consensus.confidence}% de confianza.\n\n`
  } else {
    response += `## 🤔 Análisis Cognitivo en Progreso\n\n`
    response += `Múltiples hipótesis bajo evaluación.\n\n`
  }
  
  // 2. Diagnóstico principal (si existe)
  const diagnosticDecision = decisions.find((d: DecisionResult) => d.agentType === 'diagnostic')
  if (diagnosticDecision && diagnosticDecision.success) {
    const diagnosis = diagnosticDecision.decision as DiagnosticDecision
    
    response += `### 🔍 **Evaluación Diagnóstica:**\n`
    
    if (diagnosis.differentials && diagnosis.differentials.length > 0) {
      response += `**Diagnóstico más probable:** ${diagnosis.differentials[0].condition}\n`
      response += `**Probabilidad:** ${Math.round(diagnosis.differentials[0].probability * 100)}%\n\n`
      
      if (diagnosis.differentials.length > 1) {
        response += `**Diagnósticos diferenciales:**\n`
        diagnosis.differentials.slice(1).forEach((diff, idx: number) => {
          response += `${idx + 2}. ${diff.condition} (${Math.round(diff.probability * 100)}%)\n`
        })
        response += `\n`
      }
    }
    
    if (diagnosis.red_flags && diagnosis.red_flags.length > 0) {
      response += `⚠️ **Señales de alarma:** ${diagnosis.red_flags.join(', ')}\n\n`
    }
    
    if (diagnosis.tests_recommended && diagnosis.tests_recommended.length > 0) {
      response += `🧪 **Estudios recomendados:** ${diagnosis.tests_recommended.join(', ')}\n\n`
    }
  }
  
  // 3. Triage (si existe)
  const triageDecision = decisions.find((d: DecisionResult) => d.agentType === 'triage')
  if (triageDecision && triageDecision.success) {
    const triage = triageDecision.decision as TriageDecision
    
    response += `### 🚨 **Clasificación de Urgencia:**\n`
    response += `**Nivel de acuidad:** ${triage.acuity_level}/5\n`
    response += `**Disposición:** ${triage.disposition}\n`
    response += `**Tiempo al médico:** ${triage.time_to_physician}\n\n`
    
    if (triage.warning_signs && triage.warning_signs.length > 0) {
      response += `⚠️ **Signos de advertencia:** ${triage.warning_signs.join(', ')}\n\n`
    }
  }
  
  // 4. Validación (si existe)
  const validationDecision = decisions.find((d: DecisionResult) => d.agentType === 'validation')
  if (validationDecision && validationDecision.success) {
    const validation = validationDecision.decision as ValidationDecision
    
    if (validation.valid) {
      response += `### ✅ **Validación:** Plan aprobado\n`
    } else {
      response += `### ⚠️ **Validación:** Requiere revisión\n`
      if (validation.concerns && validation.concerns.length > 0) {
        response += `**Preocupaciones:** ${validation.concerns.join(', ')}\n`
      }
    }
    
    if (validation.risk_assessment) {
      response += `**Nivel de riesgo:** ${validation.risk_assessment.level}\n\n`
    }
  }
  
  // 5. Tratamiento (si existe)
  const treatmentDecision = decisions.find((d: DecisionResult) => d.agentType === 'treatment')
  if (treatmentDecision && treatmentDecision.success) {
    const treatment = treatmentDecision.decision as TreatmentDecision
    
    response += `### 💊 **Plan de Tratamiento:**\n`
    
    if (treatment.medications && treatment.medications.length > 0) {
      response += `**Medicamentos:**\n`
      treatment.medications.forEach((med, idx: number) => {
        response += `${idx + 1}. **${med.drug}** - ${med.dosage}, ${med.frequency}, ${med.duration}\n`
      })
      response += `\n`
    }
    
    if (treatment.procedures && treatment.procedures.length > 0) {
      response += `**Procedimientos:** ${treatment.procedures.join(', ')}\n\n`
    }
    
    if (treatment.monitoring_plan && treatment.monitoring_plan.length > 0) {
      response += `**Monitoreo:** ${treatment.monitoring_plan.join(', ')}\n\n`
    }
  }
  
  // 6. Insights del sistema cognitivo
  if (insights) {
    response += `### 💡 **Insights del Sistema:**\n`
    
    if (insights.pattern) {
      response += `**Patrón identificado:** ${insights.pattern}\n`
    }
    
    if (insights.recommendation) {
      response += `**Recomendación:** ${insights.recommendation}\n`
    }
    
    if (insights.confidence) {
      response += `**Confianza del sistema:** ${insights.confidence}%\n`
    }
    
    response += `\n`
  }
  
  // 7. Contexto de memoria (si es relevante)
  if (memory && memory.context !== 'routine') {
    response += `### 🧠 **Contexto de Memoria:**\n`
    response += `**Contexto actual:** ${memory.context}\n`
    
    if (memory.symptoms && memory.symptoms.length > 0) {
      response += `**Síntomas activos:** ${memory.symptoms.join(', ')}\n`
    }
    
    if (memory.hypotheses && memory.hypotheses.length > 0) {
      response += `**Hipótesis bajo seguimiento:** ${memory.hypotheses.length}\n`
    }
    
    response += `\n`
  }
  
  // 8. Footer con métricas del sistema
  const successfulAgents = decisions.filter((d: DecisionResult) => d.success).length
  const totalAgents = decisions.length
  
  response += `---\n`
  response += `*Procesamiento cognitivo: ${successfulAgents}/${totalAgents} agentes exitosos*\n`
  
  if (consensus && consensus.reached) {
    response += `*Consenso multi-agente alcanzado*\n`
  }
  
  return response
}