// src/components/medical-assistant/MedicalAssistantFooter.tsx
// Medical Assistant Footer Component - Extracted from MedicalAssistant.tsx

'use client'

interface PatientData {
  age?: number
  gender?: string
  primarySymptom?: string
}

interface MedicalAssistantFooterProps {
  canGeneratePrompt: boolean
  patientData: PatientData
  missingFields: string[]
}

export const MedicalAssistantFooter = ({
  canGeneratePrompt,
  missingFields,
}: MedicalAssistantFooterProps) => {
  return (
    <div className="medical-footer px-8 py-4 overflow-hidden">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3 text-sm medical-text">
          <div className="medical-icon p-1.5">
            <span className="text-sm">💡</span>
          </div>
          <span className="font-medium">Sistema de diagnóstico inteligente en tiempo real</span>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div
            data-autoclose-indicator
            className="text-cyan-400 font-medium transition-all duration-300"
          >
            {canGeneratePrompt ? (
              <span className="text-green-400">
                ✅ Datos suficientes recopilados - Listo para generar SOAP
              </span>
            ) : (
              <span>🚀 Recopilando datos - Falta: {missingFields.join(', ')}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
