// src/components/medical-message/MessageAvatar.tsx
// Message Avatar Component - Extracted from EnhancedMedicalMessage

'use client'

interface MessageAvatarProps {
  isAssistant: boolean
  isSOAPAnalysis: boolean
  isRejection: boolean
}

export const MessageAvatar = ({ isAssistant, isSOAPAnalysis, isRejection }: MessageAvatarProps) => {
  if (isAssistant) {
    return (
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 ${
          isSOAPAnalysis
            ? 'bg-gradient-to-br from-purple-600 to-indigo-600'
            : isRejection
              ? 'bg-gradient-to-br from-red-600 to-pink-600'
              : 'bg-gradient-to-br from-blue-600 to-cyan-600'
        }`}
      >
        <span className="text-lg">{isSOAPAnalysis ? '🏥' : isRejection ? '⚠️' : '🤖'}</span>
      </div>
    )
  }

  return (
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg">
      <span className="text-lg">👨‍⚕️</span>
    </div>
  )
}
