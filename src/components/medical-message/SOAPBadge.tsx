// src/components/medical-message/SOAPBadge.tsx
// SOAP Section Badge - Extracted from EnhancedMedicalMessage

'use client'

interface SOAPBadgeProps {
  section: string
}

const getSectionConfig = (section: string) => {
  switch (section.toUpperCase()) {
    case 'S':
      return { color: 'from-blue-500 to-cyan-500', label: 'SUBJETIVO', icon: '🗣️' }
    case 'O':
      return { color: 'from-emerald-500 to-teal-500', label: 'OBJETIVO', icon: '🔍' }
    case 'A':
      return { color: 'from-purple-500 to-indigo-500', label: 'ANÁLISIS', icon: '🧠' }
    case 'P':
      return { color: 'from-orange-500 to-yellow-500', label: 'PLAN', icon: '📋' }
    default:
      return { color: 'from-slate-500 to-gray-500', label: section, icon: '📄' }
  }
}

export const SOAPBadge = ({ section }: SOAPBadgeProps) => {
  const config = getSectionConfig(section)

  return (
    <div
      className={`inline-flex items-center space-x-2 bg-gradient-to-r ${config.color} bg-opacity-20 px-3 py-1 rounded-full border border-opacity-30 mb-2`}
    >
      <span className="text-sm">{config.icon}</span>
      <span className="text-xs font-semibold text-white">{config.label}</span>
    </div>
  )
}
