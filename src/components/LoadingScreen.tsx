// 🎭 Loading Screen Component - Medical Theme
// Animación de carga elegante para Redux Claude Medical

'use client'

import styles from '../styles/components/LoadingScreen.module.css'

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
  }, [duration, onLoadingComplete, loadingSteps])

  if (!isVisible) return null

  return (
    <div
      className={`${styles.loadingScreen} ${isVisible ? styles.visible : styles.hidden} ${styles.safeArea}`}
    >
      {/* Medical Background Pattern */}
      <div className={styles.backgroundPattern}>
        <div className={`${styles.backgroundCircle} ${styles.circle1}`} />
        <div
          className={`${styles.backgroundCircle} ${styles.circle2}`}
          style={{ animationDelay: '0.5s' }}
        />
        <div
          className={`${styles.backgroundCircle} ${styles.circle3}`}
          style={{ animationDelay: '1s' }}
        />
        <div
          className={`${styles.backgroundCircle} ${styles.circle4}`}
          style={{ animationDelay: '1.5s' }}
        />
      </div>

      <div className={`${styles.container} ${styles.mobile}`}>
        {/* Main Logo/Icon */}
        <div className={styles.logoSection}>
          <div className={`${styles.logo} ${styles.mobile}`}>
            <span className={styles.logoIcon}>🧠</span>
          </div>

          <h1 className={`${styles.title} ${styles.mobile}`}>Redux Claude Medical</h1>

          <p className={styles.subtitle} style={{ animationDelay: '0.2s' }}>
            Sistema Cognitivo Médico 2025
          </p>
        </div>

        {/* Loading Progress */}
        <div className={styles.progressSection} style={{ animationDelay: '0.4s' }}>
          {/* Progress Bar Container */}
          <div className={styles.progressBarContainer}>
            {/* Progress Bar */}
            <div className={styles.progressBar} style={{ width: `${progress}%` }} />

            {/* Progress Glow Effect */}
            <div className={styles.progressGlow} style={{ width: `${progress}%` }} />
          </div>

          {/* Progress Percentage */}
          <div className={styles.progressInfo}>
            <span className={styles.progressLabel}>Progreso</span>
            <span className={styles.progressValue}>{progress}%</span>
          </div>
        </div>

        {/* Current Loading Step */}
        <div className={styles.currentStep} style={{ animationDelay: '0.6s' }}>
          <div className={styles.stepContainer}>
            {/* Step Icon */}
            <div className={styles.stepIcon}>{loadingSteps[currentStep]?.icon}</div>

            {/* Step Label */}
            <p className={styles.stepLabel}>{loadingSteps[currentStep]?.label}</p>

            {/* Loading Dots Animation */}
            <div className={styles.loadingDots}>
              <div className={styles.loadingDot} style={{ animationDelay: '0ms' }} />
              <div className={styles.loadingDot} style={{ animationDelay: '0.2s' }} />
              <div className={styles.loadingDot} style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        </div>

        {/* Medical Features Preview */}
        <div className={styles.featuresPreview}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🛡️</div>
            <div className={styles.featureLabel}>Medicina Defensiva</div>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📋</div>
            <div className={styles.featureLabel}>Análisis SOAP</div>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>⚡</div>
            <div className={styles.featureLabel}>Streaming Real-time</div>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🤖</div>
            <div className={styles.featureLabel}>IA Cognitiva</div>
          </div>
        </div>

        {/* Creator Credit */}
        <div className={styles.creatorCredit}>
          <p>Creado por Bernard Orozco</p>
          <p>Powered by Claude AI</p>
        </div>
      </div>
    </div>
  )
}
