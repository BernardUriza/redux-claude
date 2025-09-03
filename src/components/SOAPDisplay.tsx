// src/components/SOAPDisplay.tsx
// Componente SOAP Display especializado - FASE 4 - Creado por Bernard Orozco

'use client'

import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import ReactMarkdown from 'react-markdown'
import type { RootState } from '@redux-claude/cognitive-core'
import {
  selectCurrentSOAPAnalysis,
  updateSOAPSection,
  type SOAPAnalysis,
} from '@redux-claude/cognitive-core/src/store/selectors'

// SOAP Section Data Interfaces - No more any types!
interface SubjectiveData {
  chiefComplaint: string
  presentIllness: string
  medicalHistory: string[]
  familyHistory: string[]
}

interface ObjectiveData {
  vitalSigns: Record<string, string | number>
  physicalExam: Record<string, string>
  labResults: string[]
}

interface AnalysisData {
  differentialDx: string[]
  primaryDx: string
  confidence: number
  reasoning: string
}

interface PlanData {
  immediateActions: string[]
  medications: string[]
  followUp: string[]
  patientEducation: string[]
}

type SOAPSectionData = SubjectiveData | ObjectiveData | AnalysisData | PlanData

// Complete SOAP structure interface
interface CompleteSOAP {
  subjetivo?: SubjectiveData | null
  objetivo?: ObjectiveData | null
  analisis?: AnalysisData | null
  plan?: PlanData | null
}

type SOAPEditSection = 'subjetivo' | 'objetivo' | 'analisis' | 'plan'

interface SOAPSectionProps {
  section: 'S' | 'O' | 'A' | 'P'
  title: string
  data: SOAPSectionData | null
  editable?: boolean
  onEdit?: (data: SOAPSectionData) => void
}

const SOAPSection = ({ section, title, data, editable = false, onEdit }: SOAPSectionProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'S':
        return '🗣️'
      case 'O':
        return '🔍'
      case 'A':
        return '🧠'
      case 'P':
        return '📋'
      default:
        return '📄'
    }
  }

  const getSectionColor = (section: string) => {
    switch (section) {
      case 'S':
        return 'from-blue-500 to-cyan-500'
      case 'O':
        return 'from-emerald-500 to-teal-500'
      case 'A':
        return 'from-purple-500 to-indigo-500'
      case 'P':
        return 'from-orange-500 to-yellow-500'
      default:
        return 'from-gray-500 to-slate-500'
    }
  }

  const renderSectionContent = () => {
    if (!data) return <p className="text-slate-400">No disponible</p>

    switch (section) {
      case 'S':
        return <SubjectiveContent data={data as SubjectiveData} />
      case 'O':
        return <ObjectiveContent data={data as ObjectiveData} />
      case 'A':
        return <AnalysisContent data={data as AnalysisData} />
      case 'P':
        return <PlanContent data={data as PlanData} />
      default:
        return <p className="text-slate-300">{String(data)}</p>
    }
  }

  return (
    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-600/40 overflow-hidden">
      {/* Section Header */}
      <div
        className={`bg-gradient-to-r ${getSectionColor(section)} p-4 border-b border-slate-600/30`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getSectionIcon(section)}</span>
            <div>
              <h3 className="text-white font-bold text-lg">
                {section} - {title}
              </h3>
              <p className="text-white/80 text-sm">Sección SOAP estructurada</p>
            </div>
          </div>
          {editable && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium transition-colors"
            >
              {isEditing ? 'Guardar' : 'Editar'}
            </button>
          )}
        </div>
      </div>

      {/* Section Content */}
      <div className="p-6">
        {isEditing ? (
          <div className="space-y-4">
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              className="w-full h-32 bg-slate-800 border border-slate-600 rounded-lg p-4 text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Editar contenido de sección ${section}...`}
            />
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  // Convert editContent to proper structure based on section
                  if (onEdit) {
                    // Simple text-based update - would need proper parsing in production
                    onEdit(editContent as unknown as SOAPSectionData)
                  }
                  setIsEditing(false)
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Guardar
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          renderSectionContent()
        )}
      </div>
    </div>
  )
}

// Componentes específicos para cada sección SOAP
const SubjectiveContent = ({ data }: { data: SubjectiveData }) => (
  <div className="space-y-4">
    <div>
      <h4 className="text-slate-200 font-semibold mb-2">Motivo de Consulta</h4>
      <p className="text-slate-300 leading-relaxed">{data.chiefComplaint}</p>
    </div>

    <div>
      <h4 className="text-slate-200 font-semibold mb-2">Enfermedad Actual</h4>
      <p className="text-slate-300 leading-relaxed">{data.presentIllness}</p>
    </div>

    {data.medicalHistory.length > 0 && (
      <div>
        <h4 className="text-slate-200 font-semibold mb-2">Antecedentes Médicos</h4>
        <ul className="list-disc list-inside text-slate-300 space-y-1">
          {data.medicalHistory.map((item: string, index: number) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    )}

    {data.familyHistory.length > 0 && (
      <div>
        <h4 className="text-slate-200 font-semibold mb-2">Antecedentes Familiares</h4>
        <ul className="list-disc list-inside text-slate-300 space-y-1">
          {data.familyHistory.map((item: string, index: number) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    )}
  </div>
)

const ObjectiveContent = ({ data }: { data: ObjectiveData }) => (
  <div className="space-y-4">
    {Object.keys(data.vitalSigns).length > 0 && (
      <div>
        <h4 className="text-slate-200 font-semibold mb-2">Signos Vitales</h4>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(data.vitalSigns).map(
            ([key, value]: [string, string | number]) =>
              value && (
                <div key={key} className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-slate-400 text-sm capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </div>
                  <div className="text-slate-200 font-medium">{value}</div>
                </div>
              )
          )}
        </div>
      </div>
    )}

    {Object.keys(data.physicalExam).length > 0 && (
      <div>
        <h4 className="text-slate-200 font-semibold mb-2">Examen Físico</h4>
        <div className="space-y-3">
          {Object.entries(data.physicalExam).map(
            ([system, findings]: [string, string]) =>
              findings && (
                <div key={system} className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-slate-400 text-sm font-medium capitalize mb-1">
                    {system.replace(/([A-Z])/g, ' $1')}
                  </div>
                  <div className="text-slate-300">{findings}</div>
                </div>
              )
          )}
        </div>
      </div>
    )}
  </div>
)

const AnalysisContent = ({ data }: { data: AnalysisData }) => (
  <div className="space-y-4">
    <div>
      <h4 className="text-slate-200 font-semibold mb-2">Diagnóstico Principal</h4>
      <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-lg p-4 border border-purple-700/20">
        <div className="text-white font-medium text-lg">{'Análisis médico en progreso'}</div>
        <div className="text-purple-300 text-sm mt-1">
          Confianza: {Math.round(data.confidence * 100)}%
        </div>
      </div>
    </div>

    {data.differentialDx && data.differentialDx.length > 0 && (
      <div>
        <h4 className="text-slate-200 font-semibold mb-2">Diagnósticos Diferenciales</h4>
        <div className="space-y-2">
          {data.differentialDx.map((diagnosis: string, index: number) => (
            <div key={index} className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-slate-200 font-medium">{diagnosis}</div>
            </div>
          ))}
        </div>
      </div>
    )}

    {data.reasoning && (
      <div>
        <h4 className="text-slate-200 font-semibold mb-2">Razonamiento Clínico</h4>
        <p className="text-slate-300 leading-relaxed">{data.reasoning}</p>
      </div>
    )}
  </div>
)

const PlanContent = ({ data }: { data: PlanData }) => (
  <div className="space-y-4">
    {data.medications.length > 0 && (
      <div>
        <h4 className="text-slate-200 font-semibold mb-2">Medicamentos</h4>
        <div className="space-y-2">
          {data.medications.map((medication: string, index: number) => (
            <div key={index} className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-slate-200 font-medium">{medication}</div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
)

// Componente principal SOAPDisplay
export const SOAPDisplay = () => {
  const dispatch = useDispatch()
  // ⚡ ESTADO REAL MULTINÚCLEO - Mock Data ELIMINADO
  const soapAnalysis = useSelector((state: RootState) => selectCurrentSOAPAnalysis(state))
  const isLoading = useSelector((state: RootState) => state.medicalChat.cores.dashboard.isLoading)
  const error = useSelector((state: RootState) => state.medicalChat.sharedState.error)
  const [viewMode, setViewMode] = useState<'structured' | 'markdown'>('structured')

  // 🔬 DEBUG: Log real SOAP analysis from multinucleus state
  console.log('🔬 SOAPDisplay DEBUG - Real Analysis:', soapAnalysis)
  console.log('🔬 SOAPDisplay DEBUG - Loading:', isLoading)
  console.log('🔬 SOAPDisplay DEBUG - Error:', error)

  const handleSectionEdit = (section: SOAPEditSection, data: SOAPSectionData) => {
    // Mapear nombres españoles a ingleses para el slice
    const sectionMap = {
      subjetivo: 'subjective' as const,
      objetivo: 'objective' as const,
      analisis: 'assessment' as const,
      plan: 'plan' as const,
    }

    const englishSection = sectionMap[section]
    dispatch(
      updateSOAPSection({
        section: englishSection,
        content: JSON.stringify(data),
        confidence: 0.8,
      })
    )
  }

  // Función para generar contenido markdown del SOAP
  const generateMarkdownContent = (soap: CompleteSOAP) => {
    let markdown = `# Análisis SOAP Completo\n\n`
    markdown += `**Confianza:** ${Math.round((soapAnalysis?.confidence || 0) * 100)}%\n`
    markdown += `**Actualizado:** ${new Date(soapAnalysis?.lastUpdated || Date.now()).toLocaleString('es-ES')}\n\n`

    // Sección Subjetivo
    if (soap.subjetivo) {
      markdown += `## 🗣️ SUBJETIVO\n\n`
      if (soap.subjetivo.chiefComplaint) {
        markdown += `**Motivo de Consulta:**\n${soap.subjetivo.chiefComplaint}\n\n`
      }
      if (soap.subjetivo.presentIllness) {
        markdown += `**Enfermedad Actual:**\n${soap.subjetivo.presentIllness}\n\n`
      }
      if (soap.subjetivo.medicalHistory?.length > 0) {
        markdown += `**Antecedentes Médicos:**\n`
        soap.subjetivo.medicalHistory.forEach((item: string) => {
          markdown += `- ${item}\n`
        })
        markdown += `\n`
      }
      if (soap.subjetivo.familyHistory?.length > 0) {
        markdown += `**Antecedentes Familiares:**\n`
        soap.subjetivo.familyHistory.forEach((item: string) => {
          markdown += `- ${item}\n`
        })
        markdown += `\n`
      }
    }

    // Sección Objetivo
    if (soap.objetivo) {
      markdown += `## 🔍 OBJETIVO\n\n`
      if (soap.objetivo.vitalSigns && Object.keys(soap.objetivo.vitalSigns).length > 0) {
        markdown += `**Signos Vitales:**\n`
        Object.entries(soap.objetivo.vitalSigns).forEach(
          ([key, value]: [string, string | number]) => {
            if (value) {
              markdown += `- **${key.replace(/([A-Z])/g, ' $1')}:** ${value}\n`
            }
          }
        )
        markdown += `\n`
      }
      if (soap.objetivo.physicalExam && Object.keys(soap.objetivo.physicalExam).length > 0) {
        markdown += `**Examen Físico:**\n`
        Object.entries(soap.objetivo.physicalExam).forEach(
          ([system, findings]: [string, string]) => {
            if (findings) {
              markdown += `- **${system.replace(/([A-Z])/g, ' $1')}:** ${findings}\n`
            }
          }
        )
        markdown += `\n`
      }
    }

    // Sección Análisis
    if (soap.analisis) {
      markdown += `## 🧠 ANÁLISIS\n\n`
      if (soap.analisis.primaryDx) {
        markdown += `**Diagnóstico Principal:**\n${soap.analisis.primaryDx}\n`
        markdown += `*Confianza: ${Math.round(soap.analisis.confidence * 100)}%*\n\n`
      }
      if (soap.analisis.differentialDx?.length > 0) {
        markdown += `**Diagnósticos Diferenciales:**\n`
        soap.analisis.differentialDx.forEach((diagnosis: string, index: number) => {
          markdown += `${index + 1}. **${diagnosis}**\n`
        })
      }
      if (soap.analisis.reasoning) {
        markdown += `**Razonamiento Clínico:**\n${soap.analisis.reasoning}\n\n`
      }
    }

    // Sección Plan
    if (soap.plan) {
      markdown += `## 📋 PLAN\n\n`
      if (soap.plan.immediateActions?.length > 0) {
        markdown += `**Manejo Inmediato:**\n`
        soap.plan.immediateActions.forEach((item: string) => {
          markdown += `- ${item}\n`
        })
        markdown += `\n`
      }
      if (soap.plan.medications?.length > 0) {
        markdown += `**Medicamentos:**\n`
        soap.plan.medications.forEach((med: string) => {
          markdown += `- ${med}\n`
        })
        markdown += `\n`
      }
      if (soap.plan.followUp?.length > 0) {
        markdown += `**Seguimiento:**\n`
        soap.plan.followUp.forEach((instruction: string) => {
          markdown += `- ${instruction}\n`
        })
        markdown += `\n`
      }
    }

    return markdown
  }

  // Estados de loading y error reales
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-700 to-purple-800 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-2xl">🧠</span>
        </div>
        <h3 className="text-slate-200 font-semibold mb-2">Extrayendo análisis SOAP...</h3>
        <p className="text-slate-400 text-sm">Procesando conversación médica con IA multinúcleo</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gradient-to-br from-red-700 to-red-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">❌</span>
        </div>
        <h3 className="text-red-400 font-semibold mb-2">Error al cargar análisis SOAP</h3>
        <p className="text-slate-400 text-sm">{error}</p>
      </div>
    )
  }

  if (!soapAnalysis) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📋</span>
        </div>
        <h3 className="text-slate-200 font-semibold mb-2">No hay análisis SOAP disponible</h3>
        <p className="text-slate-400 text-sm">
          Realiza una consulta médica para ver el análisis estructurado
        </p>
      </div>
    )
  }

  // Usar datos reales del selector multinúcleo
  const soap = {
    subjetivo: soapAnalysis.subjective
      ? {
          chiefComplaint: soapAnalysis.subjective.split('\n')[0],
          presentIllness: soapAnalysis.subjective,
          medicalHistory: [],
          familyHistory: [],
        }
      : null,
    objetivo: soapAnalysis.objective
      ? {
          vitalSigns: {},
          physicalExam: { general: soapAnalysis.objective },
          labResults: [],
        }
      : null,
    analisis: soapAnalysis.assessment
      ? {
          primaryDx: soapAnalysis.assessment,
          confidence: soapAnalysis.confidence,
          differentialDx: [],
          reasoning: soapAnalysis.assessment,
        }
      : null,
    plan: soapAnalysis.plan
      ? {
          immediateActions: soapAnalysis.plan.split('\n').filter(line => line.trim()),
          medications: [],
          followUp: [],
          patientEducation: [],
        }
      : null,
  }

  return (
    <div className="space-y-6">
      {/* Header con información del caso y toggle de vista */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-600/40">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Análisis SOAP Completo</h2>
          <div className="flex items-center space-x-4">
            {/* Toggle de vista */}
            <div className="flex items-center space-x-2 bg-slate-800/50 rounded-lg p-1">
              <button
                onClick={() => setViewMode('structured')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                  viewMode === 'structured'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                📋 Estructurado
              </button>
              <button
                onClick={() => setViewMode('markdown')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                  viewMode === 'markdown'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                📝 Markdown
              </button>
            </div>
            <div className="text-sm text-slate-300">
              Confianza:{' '}
              <span
                className={`font-semibold ${
                  (soapAnalysis.confidence || 0) > 0.8
                    ? 'text-green-400'
                    : (soapAnalysis.confidence || 0) > 0.6
                      ? 'text-yellow-400'
                      : 'text-red-400'
                }`}
              >
                {Math.round((soapAnalysis.confidence || 0) * 100)}%
              </span>
            </div>
            <div className="text-sm text-slate-300">
              Completitud:{' '}
              <span
                className={`font-semibold ${
                  soapAnalysis.completionPercentage > 80
                    ? 'text-green-400'
                    : soapAnalysis.completionPercentage > 50
                      ? 'text-yellow-400'
                      : 'text-red-400'
                }`}
              >
                {Math.round(soapAnalysis.completionPercentage)}%
              </span>
            </div>
          </div>
        </div>
        <div className="text-sm text-slate-400">
          Actualizado: {new Date(soapAnalysis.lastUpdated).toLocaleString('es-ES')} | Sesión:{' '}
          {soapAnalysis.sessionId} | Mensajes procesados: {soapAnalysis.totalMessages}
        </div>
      </div>

      {/* Contenido condicional según el modo de vista */}
      {viewMode === 'structured' ? (
        <>
          {/* Secciones SOAP estructuradas */}
          <SOAPSection
            section="S"
            title="SUBJETIVO"
            data={soap.subjetivo}
            editable={true}
            onEdit={data => handleSectionEdit('subjetivo', data)}
          />

          <SOAPSection
            section="O"
            title="OBJETIVO"
            data={soap.objetivo}
            editable={true}
            onEdit={data => handleSectionEdit('objetivo', data)}
          />

          <SOAPSection
            section="A"
            title="ANÁLISIS"
            data={soap.analisis}
            editable={true}
            onEdit={data => handleSectionEdit('analisis', data)}
          />

          <SOAPSection
            section="P"
            title="PLAN"
            data={soap.plan}
            editable={true}
            onEdit={data => handleSectionEdit('plan', data)}
          />
        </>
      ) : (
        /* Vista Markdown */
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
                p: ({ children }) => (
                  <p className="text-slate-300 mb-4 leading-relaxed">{children}</p>
                ),
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
              {generateMarkdownContent(soap)}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}
