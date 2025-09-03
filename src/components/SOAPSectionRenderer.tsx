// src/components/SOAPSectionRenderer.tsx
// SOAP Section Renderer - Clean Architecture Component
// EXTRACTED from SOAPDisplay monolith - Bernard Orozco

'use client'

import { useState } from 'react'

// SOAP Section Data Interfaces - Clean Types
export interface SubjectiveData {
  chiefComplaint: string
  presentIllness: string
  medicalHistory: string[]
  familyHistory: string[]
}

export interface ObjectiveData {
  vitalSigns: Record<string, string | number>
  physicalExam: Record<string, string>
  labResults: string[]
}

export interface AnalysisData {
  differentialDx: string[]
  primaryDx: string
  confidence: number
  reasoning: string
}

export interface PlanData {
  immediateActions: string[]
  medications: string[]
  followUp: string[]
  patientEducation: string[]
}

export type SOAPSectionData = SubjectiveData | ObjectiveData | AnalysisData | PlanData

export interface SOAPSectionProps {
  section: 'S' | 'O' | 'A' | 'P'
  title: string
  data: SOAPSectionData | null
  editable?: boolean
  onEdit?: (data: SOAPSectionData) => void
}

// Pure utility functions
const getSectionIcon = (section: string): string => {
  const iconMap = {
    S: '🗣️',
    O: '🔍',
    A: '🧠',
    P: '📋',
  } as const
  return iconMap[section as keyof typeof iconMap] || '📄'
}

const getSectionColor = (section: string): string => {
  const colorMap = {
    S: 'from-blue-500 to-cyan-500',
    O: 'from-emerald-500 to-teal-500',
    A: 'from-purple-500 to-indigo-500',
    P: 'from-orange-500 to-yellow-500',
  } as const
  return colorMap[section as keyof typeof colorMap] || 'from-gray-500 to-slate-500'
}

// Content Renderers
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
        <div className="text-white font-medium text-lg">
          {data.primaryDx || 'Análisis médico en progreso'}
        </div>
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
    {data.immediateActions && data.immediateActions.length > 0 && (
      <div>
        <h4 className="text-slate-200 font-semibold mb-2">Manejo Inmediato</h4>
        <div className="space-y-2">
          {data.immediateActions.map((action: string, index: number) => (
            <div key={index} className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-slate-200 font-medium">{action}</div>
            </div>
          ))}
        </div>
      </div>
    )}

    {data.medications && data.medications.length > 0 && (
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

    {data.followUp && data.followUp.length > 0 && (
      <div>
        <h4 className="text-slate-200 font-semibold mb-2">Seguimiento</h4>
        <div className="space-y-2">
          {data.followUp.map((instruction: string, index: number) => (
            <div key={index} className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-slate-200 font-medium">{instruction}</div>
            </div>
          ))}
        </div>
      </div>
    )}

    {data.patientEducation && data.patientEducation.length > 0 && (
      <div>
        <h4 className="text-slate-200 font-semibold mb-2">Educación al Paciente</h4>
        <div className="space-y-2">
          {data.patientEducation.map((education: string, index: number) => (
            <div key={index} className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-slate-200 font-medium">{education}</div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
)

// Main SOAPSection component - SINGLE RESPONSIBILITY
export const SOAPSection = ({
  section,
  title,
  data,
  editable = false,
  onEdit,
}: SOAPSectionProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')

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

  const handleSave = () => {
    if (onEdit && editContent.trim()) {
      // Simple text-based update - production would need proper parsing
      onEdit(editContent as unknown as SOAPSectionData)
    }
    setIsEditing(false)
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
              {isEditing ? 'Cancelar' : 'Editar'}
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
                onClick={handleSave}
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
