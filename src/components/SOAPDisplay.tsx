// src/components/SOAPDisplay.tsx
// Componente SOAP Display especializado - FASE 4 - Creado por Bernard Orozco

'use client'

import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import ReactMarkdown from 'react-markdown'
import type { RootState } from '@redux-claude/cognitive-core'
import { updateSOAPSection, addPhysicianNote, updateUrgencyLevel } from '@redux-claude/cognitive-core'
import type { SOAPStructure, SubjectiveData, ObjectiveFindings, DifferentialDiagnosis, TreatmentPlan } from '@redux-claude/cognitive-core'

interface SOAPSectionProps {
  section: 'S' | 'O' | 'A' | 'P'
  title: string
  data: any
  editable?: boolean
  onEdit?: (data: any) => void
}

const SOAPSection = ({ section, title, data, editable = false, onEdit }: SOAPSectionProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'S': return '🗣️'
      case 'O': return '🔍'
      case 'A': return '🧠'
      case 'P': return '📋'
      default: return '📄'
    }
  }

  const getSectionColor = (section: string) => {
    switch (section) {
      case 'S': return 'from-blue-500 to-cyan-500'
      case 'O': return 'from-emerald-500 to-teal-500'
      case 'A': return 'from-purple-500 to-indigo-500'
      case 'P': return 'from-orange-500 to-yellow-500'
      default: return 'from-gray-500 to-slate-500'
    }
  }

  const renderSectionContent = () => {
    if (!data) return <p className="text-slate-400">No disponible</p>

    switch (section) {
      case 'S':
        return <SubjectiveContent data={data as SubjectiveData} />
      case 'O':
        return <ObjectiveContent data={data as ObjectiveFindings} />
      case 'A':
        return <AnalysisContent data={data as DifferentialDiagnosis} />
      case 'P':
        return <PlanContent data={data as TreatmentPlan} />
      default:
        return <p className="text-slate-300">{String(data)}</p>
    }
  }

  return (
    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-600/40 overflow-hidden">
      {/* Section Header */}
      <div className={`bg-gradient-to-r ${getSectionColor(section)} p-4 border-b border-slate-600/30`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getSectionIcon(section)}</span>
            <div>
              <h3 className="text-white font-bold text-lg">{section} - {title}</h3>
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
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-32 bg-slate-800 border border-slate-600 rounded-lg p-4 text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Editar contenido de sección ${section}...`}
            />
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  onEdit?.(editContent)
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
          {data.medicalHistory.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    )}

    {data.familyHistory.length > 0 && (
      <div>
        <h4 className="text-slate-200 font-semibold mb-2">Antecedentes Familiares</h4>
        <ul className="list-disc list-inside text-slate-300 space-y-1">
          {data.familyHistory.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    )}
  </div>
)

const ObjectiveContent = ({ data }: { data: ObjectiveFindings }) => (
  <div className="space-y-4">
    {Object.keys(data.vitalSigns).length > 0 && (
      <div>
        <h4 className="text-slate-200 font-semibold mb-2">Signos Vitales</h4>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(data.vitalSigns).map(([key, value]) => 
            value && (
              <div key={key} className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-slate-400 text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
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
          {Object.entries(data.physicalExam).map(([system, findings]) => 
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

const AnalysisContent = ({ data }: { data: DifferentialDiagnosis }) => (
  <div className="space-y-4">
    <div>
      <h4 className="text-slate-200 font-semibold mb-2">Diagnóstico Principal</h4>
      <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-lg p-4 border border-purple-700/20">
        <div className="text-white font-medium text-lg">{data.primaryDiagnosis}</div>
        <div className="text-purple-300 text-sm mt-1">Confianza: {Math.round(data.confidence * 100)}%</div>
      </div>
    </div>

    {data.differentials.length > 0 && (
      <div>
        <h4 className="text-slate-200 font-semibold mb-2">Diagnósticos Diferenciales</h4>
        <div className="space-y-2">
          {data.differentials.map((diff, index) => (
            <div key={index} className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="text-slate-200 font-medium">{diff.diagnosis}</div>
                <div className="text-sm space-x-2">
                  <span className="text-blue-400">P: {Math.round(diff.probability * 100)}%</span>
                  <span className="text-orange-400">G: {diff.gravityScore}/10</span>
                </div>
              </div>
              <div className="text-slate-400 text-sm">{diff.reasoning}</div>
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

const PlanContent = ({ data }: { data: TreatmentPlan }) => (
  <div className="space-y-4">
    {data.immediate.length > 0 && (
      <div>
        <h4 className="text-slate-200 font-semibold mb-2">Manejo Inmediato</h4>
        <ul className="list-disc list-inside text-slate-300 space-y-1">
          {data.immediate.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    )}

    {data.medications.length > 0 && (
      <div>
        <h4 className="text-slate-200 font-semibold mb-2">Medicamentos</h4>
        <div className="space-y-2">
          {data.medications.map((med, index) => (
            <div key={index} className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-slate-200 font-medium">{med.name}</div>
              <div className="text-slate-400 text-sm">
                {med.dose} - {med.frequency} por {med.duration}
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {data.followUp && (
      <div>
        <h4 className="text-slate-200 font-semibold mb-2">Seguimiento</h4>
        <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-700/20">
          <div className="text-blue-300 font-medium mb-2">{data.followUp.timeframe}</div>
          <ul className="list-disc list-inside text-blue-200 text-sm space-y-1">
            {data.followUp.instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ul>
        </div>
      </div>
    )}
  </div>
)

// Componente principal SOAPDisplay
export const SOAPDisplay = () => {
  const dispatch = useDispatch()
  const { currentCase } = useSelector((state: RootState) => state.medicalChat)
  const [viewMode, setViewMode] = useState<'structured' | 'markdown'>('structured')

  // 🔬 DEBUG: Log current case to see what's actually in the store
  console.log('🔬 SOAPDisplay DEBUG - currentCase:', currentCase)
  console.log('🔬 SOAPDisplay DEBUG - currentCase.soap:', currentCase.soap)

  const handleSectionEdit = (section: 'subjetivo' | 'objetivo' | 'analisis' | 'plan', data: any) => {
    dispatch(updateSOAPSection({ section, data }))
  }

  // Función para generar contenido markdown del SOAP
  const generateMarkdownContent = (soap: any) => {
    let markdown = `# Análisis SOAP Completo\n\n`
    markdown += `**Confianza:** ${Math.round(soap.confidence * 100)}%\n`
    markdown += `**Urgencia:** ${currentCase.urgencyLevel.toUpperCase()}\n`
    markdown += `**Actualizado:** ${new Date(currentCase.lastUpdated).toLocaleString('es-ES')}\n\n`
    
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
        Object.entries(soap.objetivo.vitalSigns).forEach(([key, value]) => {
          if (value) {
            markdown += `- **${key.replace(/([A-Z])/g, ' $1')}:** ${value}\n`
          }
        })
        markdown += `\n`
      }
      if (soap.objetivo.physicalExam && Object.keys(soap.objetivo.physicalExam).length > 0) {
        markdown += `**Examen Físico:**\n`
        Object.entries(soap.objetivo.physicalExam).forEach(([system, findings]) => {
          if (findings) {
            markdown += `- **${system.replace(/([A-Z])/g, ' $1')}:** ${findings}\n`
          }
        })
        markdown += `\n`
      }
    }
    
    // Sección Análisis
    if (soap.analisis) {
      markdown += `## 🧠 ANÁLISIS\n\n`
      if (soap.analisis.primaryDiagnosis) {
        markdown += `**Diagnóstico Principal:**\n${soap.analisis.primaryDiagnosis}\n`
        markdown += `*Confianza: ${Math.round(soap.analisis.confidence * 100)}%*\n\n`
      }
      if (soap.analisis.differentials?.length > 0) {
        markdown += `**Diagnósticos Diferenciales:**\n`
        soap.analisis.differentials.forEach((diff: any, index: number) => {
          markdown += `${index + 1}. **${diff.diagnosis}** (P: ${Math.round(diff.probability * 100)}%, G: ${diff.gravityScore}/10)\n`
          markdown += `   ${diff.reasoning}\n\n`
        })
      }
      if (soap.analisis.reasoning) {
        markdown += `**Razonamiento Clínico:**\n${soap.analisis.reasoning}\n\n`
      }
    }
    
    // Sección Plan
    if (soap.plan) {
      markdown += `## 📋 PLAN\n\n`
      if (soap.plan.immediate?.length > 0) {
        markdown += `**Manejo Inmediato:**\n`
        soap.plan.immediate.forEach((item: string) => {
          markdown += `- ${item}\n`
        })
        markdown += `\n`
      }
      if (soap.plan.medications?.length > 0) {
        markdown += `**Medicamentos:**\n`
        soap.plan.medications.forEach((med: any) => {
          markdown += `- **${med.name}**: ${med.dose} - ${med.frequency} por ${med.duration}\n`
        })
        markdown += `\n`
      }
      if (soap.plan.followUp) {
        markdown += `**Seguimiento:** ${soap.plan.followUp.timeframe}\n`
        if (soap.plan.followUp.instructions?.length > 0) {
          soap.plan.followUp.instructions.forEach((instruction: string) => {
            markdown += `- ${instruction}\n`
          })
        }
        markdown += `\n`
      }
    }
    
    return markdown
  }

  if (!currentCase.soap) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📋</span>
        </div>
        <h3 className="text-slate-200 font-semibold mb-2">No hay análisis SOAP disponible</h3>
        <p className="text-slate-400 text-sm">Realiza una consulta médica para ver el análisis estructurado</p>
      </div>
    )
  }

  const soap = currentCase.soap

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
              Confianza: <span className="text-green-400 font-semibold">{Math.round(soap.confidence * 100)}%</span>
            </div>
            <div className="text-sm text-slate-300">
              Urgencia: <span className={`font-semibold ${
                currentCase.urgencyLevel === 'critical' ? 'text-red-400' :
                currentCase.urgencyLevel === 'high' ? 'text-orange-400' :
                currentCase.urgencyLevel === 'medium' ? 'text-yellow-400' : 'text-green-400'
              }`}>
                {currentCase.urgencyLevel.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        <div className="text-sm text-slate-400">
          Actualizado: {new Date(currentCase.lastUpdated).toLocaleString('es-ES')}
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
            onEdit={(data) => handleSectionEdit('subjetivo', data)}
          />

          <SOAPSection
            section="O"
            title="OBJETIVO"
            data={soap.objetivo}
            editable={true}
            onEdit={(data) => handleSectionEdit('objetivo', data)}
          />

          <SOAPSection
            section="A"
            title="ANÁLISIS"
            data={soap.analisis}
            editable={true}
            onEdit={(data) => handleSectionEdit('analisis', data)}
          />

          <SOAPSection
            section="P"
            title="PLAN"
            data={soap.plan}
            editable={true}
            onEdit={(data) => handleSectionEdit('plan', data)}
          />
        </>
      ) : (
        /* Vista Markdown */
        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-600/40 p-6">
          <div className="prose prose-invert prose-slate max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-3xl font-bold text-white mb-6 border-b border-slate-600 pb-3">{children}</h1>,
                h2: ({ children }) => <h2 className="text-2xl font-bold text-slate-200 mb-4 mt-8 flex items-center gap-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-xl font-semibold text-slate-300 mb-3 mt-6">{children}</h3>,
                p: ({ children }) => <p className="text-slate-300 mb-4 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="text-slate-300 mb-4 ml-4">{children}</ul>,
                li: ({ children }) => <li className="mb-2 flex items-start gap-2"><span className="text-blue-400 mt-2 text-xs">•</span><span className="flex-1">{children}</span></li>,
                strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                em: ({ children }) => <em className="text-slate-400 italic">{children}</em>,
                code: ({ children }) => <code className="bg-slate-800 text-slate-200 px-2 py-1 rounded text-sm">{children}</code>,
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