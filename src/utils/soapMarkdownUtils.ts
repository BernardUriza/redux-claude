// src/utils/soapMarkdownUtils.ts
// SOAP Markdown Utility Functions - Extracted from SOAPMarkdownExporter

import type { CompleteSOAP } from '../hooks'
import type {
  SubjectiveData,
  ObjectiveData,
  AnalysisData,
  PlanData,
} from '../components/SOAPSectionRenderer'

// Utility functions to reduce complexity

export const formatKey = (key: string): string => key.replace(/([A-Z])/g, ' $1')

export const renderListItems = (items: string[]): string => {
  return items.map(item => `- ${item}\n`).join('')
}

export const renderObjectEntries = (obj: Record<string, string | number>): string => {
  return Object.entries(obj)
    .filter(([, value]) => value)
    .map(([key, value]) => `- **${formatKey(key)}:** ${value}\n`)
    .join('')
}

export const generateSubjectiveSection = (subjective: SubjectiveData): string => {
  let markdown = `## 🗣️ SUBJETIVO\n\n`

  if (subjective.chiefComplaint) {
    markdown += `**Motivo de Consulta:**\n${subjective.chiefComplaint}\n\n`
  }

  if (subjective.presentIllness) {
    markdown += `**Enfermedad Actual:**\n${subjective.presentIllness}\n\n`
  }

  if (subjective.medicalHistory?.length > 0) {
    markdown += `**Antecedentes Médicos:**\n`
    markdown += renderListItems(subjective.medicalHistory)
    markdown += `\n`
  }

  if (subjective.familyHistory?.length > 0) {
    markdown += `**Antecedentes Familiares:**\n`
    markdown += renderListItems(subjective.familyHistory)
    markdown += `\n`
  }

  return markdown
}

export const generateObjectiveSection = (objective: ObjectiveData): string => {
  let markdown = `## 🔍 OBJETIVO\n\n`

  if (objective.vitalSigns && Object.keys(objective.vitalSigns).length > 0) {
    markdown += `**Signos Vitales:**\n`
    markdown += renderObjectEntries(objective.vitalSigns)
    markdown += `\n`
  }

  if (objective.physicalExam && Object.keys(objective.physicalExam).length > 0) {
    markdown += `**Examen Físico:**\n`
    markdown += renderObjectEntries(objective.physicalExam)
    markdown += `\n`
  }

  if (objective.labResults?.length > 0) {
    markdown += `**Resultados de Laboratorio:**\n`
    markdown += renderListItems(objective.labResults)
    markdown += `\n`
  }

  return markdown
}

export const generateAnalysisSection = (analysis: AnalysisData): string => {
  let markdown = `## 🧠 ANÁLISIS\n\n`

  if (analysis.primaryDx) {
    markdown += `**Diagnóstico Principal:**\n${analysis.primaryDx}\n`
    markdown += `*Confianza: ${Math.round(analysis.confidence * 100)}%*\n\n`
  }

  if (analysis.differentialDx?.length > 0) {
    markdown += `**Diagnósticos Diferenciales:**\n`
    analysis.differentialDx.forEach((diagnosis, index) => {
      markdown += `${index + 1}. **${diagnosis}**\n`
    })
    markdown += `\n`
  }

  if (analysis.reasoning) {
    markdown += `**Razonamiento Clínico:**\n${analysis.reasoning}\n\n`
  }

  return markdown
}

export const generatePlanSection = (plan: PlanData): string => {
  let markdown = `## 📋 PLAN\n\n`

  if (plan.immediateActions?.length > 0) {
    markdown += `**Manejo Inmediato:**\n`
    markdown += renderListItems(plan.immediateActions)
    markdown += `\n`
  }

  if (plan.medications?.length > 0) {
    markdown += `**Medicamentos:**\n`
    markdown += renderListItems(plan.medications)
    markdown += `\n`
  }

  if (plan.followUp?.length > 0) {
    markdown += `**Seguimiento:**\n`
    markdown += renderListItems(plan.followUp)
    markdown += `\n`
  }

  if (plan.patientEducation?.length > 0) {
    markdown += `**Educación al Paciente:**\n`
    markdown += renderListItems(plan.patientEducation)
    markdown += `\n`
  }

  return markdown
}

export const generateMarkdownContent = (
  soap: CompleteSOAP,
  confidence = 0,
  lastUpdated: Date | number = Date.now()
): string => {
  let markdown = `# Análisis SOAP Completo\n\n`
  markdown += `**Confianza:** ${Math.round(confidence * 100)}%\n`
  markdown += `**Actualizado:** ${new Date(lastUpdated).toLocaleString('es-ES')}\n\n`

  if (soap.subjetivo) {
    markdown += generateSubjectiveSection(soap.subjetivo as SubjectiveData)
  }

  if (soap.objetivo) {
    markdown += generateObjectiveSection(soap.objetivo as ObjectiveData)
  }

  if (soap.analisis) {
    markdown += generateAnalysisSection(soap.analisis as AnalysisData)
  }

  if (soap.plan) {
    markdown += generatePlanSection(soap.plan as PlanData)
  }

  return markdown
}
