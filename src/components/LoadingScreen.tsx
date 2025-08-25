// 🎭 Loading Screen Component - Medical Theme
// Animación de carga elegante para Redux Claude Medical

'use client'

import { useEffect, useState } from 'react'

interface LoadingScreenProps {
  onLoadingComplete?: () => void
  duration?: number
}

export const LoadingScreen = ({ onLoadingComplete, duration = 3000 }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const loadingSteps = [
    { label: 'Inicializando Sistema Médico...', icon: '🏥', progress: 20 },
    { label: 'Activando Motor Cognitivo...', icon: '🧠', progress: 40 },
    { label: 'Cargando Validadores SOAP...', icon: '📋', progress: 60 },
    { label: 'Configurando Medicina Defensiva...', icon: '🛡️', progress: 80 },
    { label: 'Sistema Listo', icon: '✅', progress: 100 },
  ]

  useEffect(() => {
    const totalSteps = loadingSteps.length
    const stepDuration = duration / totalSteps

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        const nextStep = prev + 1
        if (nextStep < totalSteps) {
          setProgress(loadingSteps[nextStep].progress)
          return nextStep
        } else {
          // Completar carga
          setProgress(100)
          clearInterval(interval)

          // Fade out después de completar
          setTimeout(() => {
            setIsVisible(false)
            setTimeout(() => {
              onLoadingComplete?.()
            }, 500) // Esperar que termine el fade out
          }, 500)

          return prev
        }
      })
    }, stepDuration)

    // Iniciar con el primer paso
    setProgress(loadingSteps[0].progress)

    return () => clearInterval(interval)
  }, [duration, onLoadingComplete])

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-50 bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 flex items-center justify-center transition-opacity duration-500 loading-safe-area ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Medical Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 border border-cyan-500/20 rounded-full animate-pulse" />
        <div
          className="absolute top-40 right-32 w-24 h-24 border border-blue-500/20 rounded-full animate-pulse"
          style={{ animationDelay: '0.5s' }}
        />
        <div
          className="absolute bottom-32 left-40 w-20 h-20 border border-teal-500/20 rounded-full animate-pulse"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute bottom-20 right-20 w-28 h-28 border border-purple-500/20 rounded-full animate-pulse"
          style={{ animationDelay: '1.5s' }}
        />
      </div>

      <div className="relative z-10 max-w-md w-full mx-auto px-4 sm:px-8 loading-screen-mobile">
        {/* Main Logo/Icon */}
        <div className="text-center mb-6 sm:mb-8 animate-fade-in-up">
          <div className="w-20 h-20 sm:w-24 sm:h-24 loading-logo-mobile mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-600/25 animate-medical-pulse">
            <span className="text-3xl sm:text-4xl">🧠</span>
          </div>

          <h1 className="text-2xl sm:text-3xl loading-title-mobile font-bold text-white mb-2 animate-slide-in-left">
            Redux Claude Medical
          </h1>

          <p
            className="text-slate-400 text-sm animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            Sistema Cognitivo Médico 2025
          </p>
        </div>

        {/* Loading Progress */}
        <div className="mb-6 sm:mb-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          {/* Progress Bar Container */}
          <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
            {/* Progress Bar */}
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-700 ease-out shadow-lg shadow-cyan-500/30 animate-progress-glow"
              style={{ width: `${progress}%` }}
            />

            {/* Progress Glow Effect */}
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full blur-sm opacity-60 transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Progress Percentage */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Progreso</span>
            <span className="text-cyan-400 font-semibold">{progress}%</span>
          </div>
        </div>

        {/* Current Loading Step */}
        <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-slate-600/40 shadow-xl">
            {/* Step Icon */}
            <div className="text-3xl sm:text-4xl mb-3 animate-float">
              {loadingSteps[currentStep]?.icon}
            </div>

            {/* Step Label */}
            <p className="text-slate-200 font-medium mb-2 text-sm sm:text-base">
              {loadingSteps[currentStep]?.label}
            </p>

            {/* Loading Dots Animation */}
            <div className="flex justify-center space-x-1">
              <div
                className="w-2 h-2 bg-cyan-400 rounded-full animate-loading-dots"
                style={{ animationDelay: '0ms' }}
              />
              <div
                className="w-2 h-2 bg-cyan-400 rounded-full animate-loading-dots"
                style={{ animationDelay: '0.2s' }}
              />
              <div
                className="w-2 h-2 bg-cyan-400 rounded-full animate-loading-dots"
                style={{ animationDelay: '0.4s' }}
              />
            </div>
          </div>
        </div>

        {/* Medical Features Preview */}
        <div className="mt-8 grid grid-cols-2 gap-4 text-center">
          <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-600/30">
            <div className="text-lg mb-1">🛡️</div>
            <div className="text-xs text-slate-400">Medicina Defensiva</div>
          </div>

          <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-600/30">
            <div className="text-lg mb-1">📋</div>
            <div className="text-xs text-slate-400">Análisis SOAP</div>
          </div>

          <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-600/30">
            <div className="text-lg mb-1">⚡</div>
            <div className="text-xs text-slate-400">Streaming Real-time</div>
          </div>

          <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-600/30">
            <div className="text-lg mb-1">🤖</div>
            <div className="text-xs text-slate-400">IA Cognitiva</div>
          </div>
        </div>

        {/* Creator Credit */}
        <div className="mt-8 text-center text-xs text-slate-500">
          <p>Creado por Bernard Orozco</p>
          <p className="mt-1">Powered by Claude AI</p>
        </div>
      </div>

      {/* Additional CSS for enhanced animations */}
      <style jsx>{`
        @keyframes medical-pulse {
          0%,
          100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }

        .animate-medical-pulse {
          animation: medical-pulse 2s ease-in-out infinite;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
