// src/components/NewSessionButton.tsx
// New session button component - extracted from MedicalChat.tsx
'use client'

// Removed unused styles import

interface NewSessionButtonProps {
  messagesCount: number
  isMobile: boolean
  onNewSession: () => void
  triggerHaptic?: (intensity: 'light' | 'medium' | 'heavy') => void
}

export const NewSessionButton: React.FC<NewSessionButtonProps> = ({
  messagesCount,
  isMobile,
  onNewSession,
  triggerHaptic,
}) => {
  if (messagesCount <= 1) return null

  return (
    <div className="border-t border-slate-700/50 px-8 py-4 bg-gradient-to-r from-slate-800/30 to-slate-900/40 backdrop-blur-md">
      <button
        onClick={() => {
          triggerHaptic?.('light')
          onNewSession()
        }}
        className={`text-sm text-slate-400 hover:text-slate-100 flex items-center gap-3 transition-all duration-300 group hover:bg-slate-700/30 px-4 py-2 rounded-xl border border-transparent hover:border-slate-600/30 ${isMobile ? 'touch-feedback touch-target' : ''}`}
      >
        <div className="w-5 h-5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-all duration-300">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <span className="font-medium">Nueva consulta médica</span>
      </button>
    </div>
  )
}
