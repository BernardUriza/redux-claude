'use client'

import { useSelector } from 'react-redux'
import { selectSystemMetrics } from '../../packages/cognitive-core/src/store/selectors/medicalSelectors'
import IntelligentMedicalChat from '../presentation/features/chat/IntelligentMedicalChat'
import { MedicalAssistantHeader } from './medical-assistant/MedicalAssistantHeader'
import { MedicalAssistantFooter } from './medical-assistant/MedicalAssistantFooter'
import { useMedicalAssistant } from '../hooks/use-medical-assistant'

interface MedicalAssistantProps {
  partialInput: string
  onSelectTemplate: (template: string) => void
  isVisible: boolean
  onClose: () => void
  className?: string
  showMetrics?: boolean
}

const MedicalAssistant = ({
  partialInput,
  onSelectTemplate,
  isVisible,
  onClose,
}: MedicalAssistantProps) => {
  const messageCount = 0
  const currentSession = { id: 'mock-session', startedAt: Date.now() }

  const systemMetrics = useSelector(selectSystemMetrics)
  const { patientData, readyForSOAP, canGeneratePrompt, handleGeneratePrompt, getMissingFields } =
    useMedicalAssistant()

  const onGeneratePrompt = () => handleGeneratePrompt(onSelectTemplate)

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-[65vw] h-[95vh] medical-card overflow-hidden flex flex-col backdrop-blur-sm">
        <MedicalAssistantHeader
          systemMetrics={systemMetrics}
          messageCount={messageCount}
          currentSession={currentSession}
          patientData={patientData}
          readyForSOAP={readyForSOAP}
          canGeneratePrompt={canGeneratePrompt}
          onGeneratePrompt={onGeneratePrompt}
          onClose={onClose}
        />

        <div className="flex-1 overflow-hidden">
          <IntelligentMedicalChat
            className="h-full"
            showMetrics={true}
            partialInput={partialInput}
            coreType="assistant"
            onInitialResponse={(response: string) => {
              console.log('🎯 Respuesta inicial generada:', response)
            }}
          />
        </div>

        <MedicalAssistantFooter
          canGeneratePrompt={canGeneratePrompt}
          patientData={patientData}
          missingFields={getMissingFields()}
        />
      </div>
    </div>
  )
}

export default MedicalAssistant
