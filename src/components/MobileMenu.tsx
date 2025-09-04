// src/components/MobileMenu.tsx
// Mobile menu overlay - extracted from DashboardLayout.tsx
'use client'

import styles from '../styles/components/CognitiveDashboard.module.css'

interface MobileMenuProps {
  showMobileMenu: boolean
  setShowMobileMenu: (show: boolean) => void
  cognitiveMetrics?: {
    systemConfidence: number
    activeDebates: number
  } | null
  onMobileMenuAction: (action: string) => void
  triggerHaptic?: (intensity: 'light' | 'medium' | 'heavy') => void
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  showMobileMenu,
  setShowMobileMenu,
  cognitiveMetrics,
  onMobileMenuAction,
  triggerHaptic,
}) => {
  if (!showMobileMenu) return null

  return (
    <div 
      className={styles.mobileMenuOverlay} 
      onClick={() => setShowMobileMenu(false)}
      onKeyDown={(e) => e.key === 'Escape' && setShowMobileMenu(false)}
      role="button"
      tabIndex={0}
    >
      <div
        className={`${styles.mobileMenu} ${showMobileMenu ? styles.open : ''}`}
        onClick={e => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="menu"
        tabIndex={0}
      >
        {/* Mobile Menu Header */}
        <div className="p-4 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <span className="text-white text-sm font-bold">🏥</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">Medical AI</h1>
                <p className="text-xs text-slate-400">Cognitive Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setShowMobileMenu(false)}
              className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors duration-200 text-slate-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Content */}
        <nav className="flex-1 p-4" role="navigation" aria-label="Mobile menu">
          <div className="space-y-3" role="menu">
            {['treatment', 'diagnostics', 'analytics'].map(action => {
              const handleAction = () => {
                triggerHaptic?.('light')
                setShowMobileMenu(false)
                onMobileMenuAction(action)
              }

              const handleKeyDown = (e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleAction()
                }
              }

              return (
                <button
                  key={action}
                  className="w-full flex items-center space-x-3 px-3 py-3 text-slate-300 hover:bg-slate-800/50 rounded-xl transition-all duration-200 hover:text-white touch-feedback touch-target"
                  onClick={handleAction}
                  onKeyDown={handleKeyDown}
                  role="menuitem"
                  tabIndex={0}
                >
                  <span className="text-lg">
                    {action === 'treatment' ? '💊' : action === 'diagnostics' ? '🔍' : '📊'}
                  </span>
                  <span className="text-sm font-medium">
                    {action === 'treatment'
                      ? 'Treatment Plans'
                      : action === 'diagnostics'
                        ? 'Diagnostics'
                        : 'Analytics'}
                  </span>
                </button>
              )
            })}
          </div>

          {/* System Status in Mobile */}
          <div className="mt-6 bg-gradient-to-br from-slate-800/60 to-slate-900/80 backdrop-blur-xl rounded-xl p-4 border border-slate-600/30">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-sm text-slate-300 font-medium">System Online</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Confidence:</span>
                <span className="text-emerald-400 font-medium">
                  {cognitiveMetrics?.systemConfidence || 0}%
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Agents:</span>
                <span className="text-blue-400 font-medium">5/5 active</span>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </div>
  )
}
