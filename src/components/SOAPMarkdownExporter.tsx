// src/components/SOAPMarkdownExporter.tsx
// SOAP Markdown Generator - Pure Component
// EXTRACTED from SOAPDisplay monolith - Bernard Orozco

'use client'

import ReactMarkdown from 'react-markdown'
import type { CompleteSOAP } from '../hooks/useSOAPData'
import type { SubjectiveData, ObjectiveData, AnalysisData, PlanData } from './SOAPSectionRenderer'

interface SOAPMarkdownExporterProps {
  soap: CompleteSOAP
  confidence?: number
  lastUpdated?: Date | number
}

/**
 * Pure function for generating markdown content
 * SINGLE RESPONSIBILITY: Markdown generation
 * Zero side effects, pure transformation
 */
const generateMarkdownContent = (
  soap: CompleteSOAP,
  confidence: number = 0,
  lastUpdated: Date | number = Date.now()
): string => {
  let markdown = `# Análisis SOAP Completo\n\n`
  markdown += `**Confianza:** ${Math.round(confidence * 100)}%\n`
  markdown += `**Actualizado:** ${new Date(lastUpdated).toLocaleString('es-ES')}\n\n`

  // Sección Subjetivo
  if (soap.subjetivo) {
    const subjective = soap.subjetivo as SubjectiveData
    markdown += `## 🗣️ SUBJETIVO\n\n`

    if (subjective.chiefComplaint) {
      markdown += `**Motivo de Consulta:**\n${subjective.chiefComplaint}\n\n`
    }

    if (subjective.presentIllness) {
      markdown += `**Enfermedad Actual:**\n${subjective.presentIllness}\n\n`
    }

    if (subjective.medicalHistory?.length > 0) {
      markdown += `**Antecedentes Médicos:**\n`
      subjective.medicalHistory.forEach((item: string) => {
        markdown += `- ${item}\n`
      })
      markdown += `\n`
    }

    if (subjective.familyHistory?.length > 0) {
      markdown += `**Antecedentes Familiares:**\n`
      subjective.familyHistory.forEach((item: string) => {
        markdown += `- ${item}\n`
      })
      markdown += `\n`
    }
  }

  // Sección Objetivo
  if (soap.objetivo) {
    const objective = soap.objetivo as ObjectiveData
    markdown += `## 🔍 OBJETIVO\n\n`

    if (objective.vitalSigns && Object.keys(objective.vitalSigns).length > 0) {
      markdown += `**Signos Vitales:**\n`
      Object.entries(objective.vitalSigns).forEach(([key, value]: [string, string | number]) => {
        if (value) {
          markdown += `- **${key.replace(/([A-Z])/g, ' $1')}:** ${value}\n`
        }
      })
      markdown += `\n`
    }

    if (objective.physicalExam && Object.keys(objective.physicalExam).length > 0) {
      markdown += `**Examen Físico:**\n`
      Object.entries(objective.physicalExam).forEach(([system, findings]: [string, string]) => {
        if (findings) {
          markdown += `- **${system.replace(/([A-Z])/g, ' $1')}:** ${findings}\n`
        }
      })
      markdown += `\n`
    }

    if (objective.labResults?.length > 0) {
      markdown += `**Resultados de Laboratorio:**\n`
      objective.labResults.forEach((result: string) => {
        markdown += `- ${result}\n`
      })
      markdown += `\n`
    }
  }

  // Sección Análisis
  if (soap.analisis) {
    const analysis = soap.analisis as AnalysisData
    markdown += `## 🧠 ANÁLISIS\n\n`

    if (analysis.primaryDx) {
      markdown += `**Diagnóstico Principal:**\n${analysis.primaryDx}\n`
      markdown += `*Confianza: ${Math.round(analysis.confidence * 100)}%*\n\n`
    }

    if (analysis.differentialDx?.length > 0) {
      markdown += `**Diagnósticos Diferenciales:**\n`
      analysis.differentialDx.forEach((diagnosis: string, index: number) => {
        markdown += `${index + 1}. **${diagnosis}**\n`
      })
      markdown += `\n`
    }

    if (analysis.reasoning) {
      markdown += `**Razonamiento Clínico:**\n${analysis.reasoning}\n\n`
    }
  }

  // Sección Plan
  if (soap.plan) {
    const plan = soap.plan as PlanData
    markdown += `## 📋 PLAN\n\n`

    if (plan.immediateActions?.length > 0) {
      markdown += `**Manejo Inmediato:**\n`
      plan.immediateActions.forEach((item: string) => {
        markdown += `- ${item}\n`
      })
      markdown += `\n`
    }

    if (plan.medications?.length > 0) {
      markdown += `**Medicamentos:**\n`
      plan.medications.forEach((med: string) => {
        markdown += `- ${med}\n`
      })
      markdown += `\n`
    }

    if (plan.followUp?.length > 0) {
      markdown += `**Seguimiento:**\n`
      plan.followUp.forEach((instruction: string) => {
        markdown += `- ${instruction}\n`
      })
      markdown += `\n`
    }

    if (plan.patientEducation?.length > 0) {
      markdown += `**Educación al Paciente:**\n`
      plan.patientEducation.forEach((education: string) => {
        markdown += `- ${education}\n`
      })
      markdown += `\n`
    }
  }

  return markdown
}

/**
 * SOAPMarkdownExporter Component
 * SINGLE RESPONSIBILITY: Render markdown view of SOAP data
 * Pure component with zero business logic
 */
export const SOAPMarkdownExporter = ({
  soap,
  confidence = 0,
  lastUpdated,
}: SOAPMarkdownExporterProps) => {
  const markdownContent = generateMarkdownContent(soap, confidence, lastUpdated)

  return (
    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-600/40 p-6">
      <div className="prose prose-invert prose-slate max-w-none">
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1 className="text-3xl font-bold text-white mb-6 border-b border-slate-600 pb-3">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-2xl font-bold text-slate-200 mb-4 mt-8 flex items-center gap-2">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-xl font-semibold text-slate-300 mb-3 mt-6">{children}</h3>
            ),
            p: ({ children }) => <p className="text-slate-300 mb-4 leading-relaxed">{children}</p>,
            ul: ({ children }) => <ul className="text-slate-300 mb-4 ml-4">{children}</ul>,
            li: ({ children }) => (
              <li className="mb-2 flex items-start gap-2">
                <span className="text-blue-400 mt-2 text-xs">•</span>
                <span className="flex-1">{children}</span>
              </li>
            ),
            strong: ({ children }) => (
              <strong className="text-white font-semibold">{children}</strong>
            ),
            em: ({ children }) => <em className="text-slate-400 italic">{children}</em>,
            code: ({ children }) => (
              <code className="bg-slate-800 text-slate-200 px-2 py-1 rounded text-sm">
                {children}
              </code>
            ),
          }}
        >
          {markdownContent}
        </ReactMarkdown>
      </div>
    </div>
  )
}

// Export the pure generation function for external use
export { generateMarkdownContent }
