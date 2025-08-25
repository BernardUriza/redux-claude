// 📱 Mobile Interactions Hook - Enhanced UX
// Sistema de interacciones móviles optimizado para iPhone y Android

import { useCallback, useEffect, useRef, useState } from 'react'

export interface TouchGesture {
  type:
    | 'tap'
    | 'double-tap'
    | 'long-press'
    | 'swipe-left'
    | 'swipe-right'
    | 'swipe-up'
    | 'swipe-down'
  startX: number
  startY: number
  endX: number
  endY: number
  duration: number
  element?: HTMLElement
}

export interface MobileInteractionState {
  isTouch: boolean
  isMobile: boolean
  isIOS: boolean
  isAndroid: boolean
  supportsHaptic: boolean
  screenSize: 'small' | 'medium' | 'large'
}

export const useMobileInteractions = () => {
  const [state, setState] = useState<MobileInteractionState>({
    isTouch: false,
    isMobile: false,
    isIOS: false,
    isAndroid: false,
    supportsHaptic: false,
    screenSize: 'medium',
  })

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Detectar capacidades del dispositivo
  useEffect(() => {
    const userAgent = navigator.userAgent
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    const isMobile = /Mobi|Android/i.test(userAgent)
    const isIOS = /iPad|iPhone|iPod/.test(userAgent)
    const isAndroid = /Android/.test(userAgent)
    const supportsHaptic = 'vibrate' in navigator || 'hapticFeedback' in (navigator as any)

    const getScreenSize = (): 'small' | 'medium' | 'large' => {
      const width = window.innerWidth
      if (width < 375) return 'small' // iPhone SE, etc
      if (width < 768) return 'medium' // iPhone 12/13/14, etc
      return 'large' // iPad, Android tablets
    }

    setState({
      isTouch,
      isMobile,
      isIOS,
      isAndroid,
      supportsHaptic,
      screenSize: getScreenSize(),
    })

    const handleResize = () => {
      setState(prev => ({ ...prev, screenSize: getScreenSize() }))
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Haptic feedback simulation
  const triggerHaptic = useCallback(
    (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') => {
      if (!state.supportsHaptic) return

      const patterns = {
        light: [10],
        medium: [20],
        heavy: [50],
        success: [10, 50, 10],
        warning: [50, 50],
        error: [100, 50, 100],
      }

      if (navigator.vibrate) {
        navigator.vibrate(patterns[type])
      }
    },
    [state.supportsHaptic]
  )

  // Mejorar feedback visual en touch
  const addTouchFeedback = useCallback(
    (element: HTMLElement, feedback: 'ripple' | 'bounce' | 'scale' = 'ripple') => {
      if (!element) return

      const handleTouchStart = (e: TouchEvent) => {
        triggerHaptic('light')

        element.style.transform = feedback === 'scale' ? 'scale(0.98)' : ''
        element.style.transition = 'transform 0.1s ease'

        if (feedback === 'ripple') {
          const ripple = document.createElement('div')
          const rect = element.getBoundingClientRect()
          const touch = e.touches[0]
          const x = touch.clientX - rect.left
          const y = touch.clientY - rect.top

          ripple.style.cssText = `
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transform: scale(0);
          animation: ripple-animation 0.3s ease;
          left: ${x - 10}px;
          top: ${y - 10}px;
          width: 20px;
          height: 20px;
          pointer-events: none;
        `

          element.style.position = 'relative'
          element.style.overflow = 'hidden'
          element.appendChild(ripple)

          setTimeout(() => ripple.remove(), 300)
        }
      }

      const handleTouchEnd = () => {
        element.style.transform = ''
      }

      element.addEventListener('touchstart', handleTouchStart, { passive: true })
      element.addEventListener('touchend', handleTouchEnd, { passive: true })
      element.addEventListener('touchcancel', handleTouchEnd, { passive: true })

      return () => {
        element.removeEventListener('touchstart', handleTouchStart)
        element.removeEventListener('touchend', handleTouchEnd)
        element.removeEventListener('touchcancel', handleTouchEnd)
      }
    },
    [triggerHaptic]
  )

  // Detector de gestos mejorado
  const setupGestureDetection = useCallback(
    (
      element: HTMLElement,
      onGesture: (gesture: TouchGesture) => void,
      options: {
        enableSwipe?: boolean
        enableLongPress?: boolean
        enableDoubleTap?: boolean
        swipeThreshold?: number
        longPressDelay?: number
      } = {}
    ) => {
      const {
        enableSwipe = true,
        enableLongPress = true,
        enableDoubleTap = true,
        swipeThreshold = 50,
        longPressDelay = 500,
      } = options

      let lastTapTime = 0
      let tapCount = 0

      const handleTouchStart = (e: TouchEvent) => {
        const touch = e.touches[0]
        touchStartRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now(),
        }

        if (enableLongPress) {
          longPressTimerRef.current = setTimeout(() => {
            if (touchStartRef.current) {
              triggerHaptic('medium')
              onGesture({
                type: 'long-press',
                startX: touchStartRef.current.x,
                startY: touchStartRef.current.y,
                endX: touchStartRef.current.x,
                endY: touchStartRef.current.y,
                duration: Date.now() - touchStartRef.current.time,
                element,
              })
            }
          }, longPressDelay)
        }
      }

      const handleTouchEnd = (e: TouchEvent) => {
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current)
          longPressTimerRef.current = null
        }

        if (!touchStartRef.current) return

        const touch = e.changedTouches[0]
        const endTime = Date.now()
        const duration = endTime - touchStartRef.current.time
        const deltaX = touch.clientX - touchStartRef.current.x
        const deltaY = touch.clientY - touchStartRef.current.y
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

        // Detectar swipes
        if (enableSwipe && distance > swipeThreshold && duration < 300) {
          triggerHaptic('light')
          let swipeType: 'swipe-left' | 'swipe-right' | 'swipe-up' | 'swipe-down'

          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            swipeType = deltaX > 0 ? 'swipe-right' : 'swipe-left'
          } else {
            swipeType = deltaY > 0 ? 'swipe-down' : 'swipe-up'
          }

          onGesture({
            type: swipeType,
            startX: touchStartRef.current.x,
            startY: touchStartRef.current.y,
            endX: touch.clientX,
            endY: touch.clientY,
            duration,
            element,
          })
          touchStartRef.current = null
          return
        }

        // Detectar taps y double taps
        if (distance < 10 && duration < 300) {
          const currentTime = Date.now()

          if (enableDoubleTap && currentTime - lastTapTime < 300) {
            tapCount++
            if (tapCount === 2) {
              triggerHaptic('medium')
              onGesture({
                type: 'double-tap',
                startX: touchStartRef.current.x,
                startY: touchStartRef.current.y,
                endX: touch.clientX,
                endY: touch.clientY,
                duration,
                element,
              })
              tapCount = 0
              touchStartRef.current = null
              return
            }
          } else {
            tapCount = 1
          }

          lastTapTime = currentTime

          // Esperar un poco para ver si hay double tap
          setTimeout(
            () => {
              if (tapCount === 1) {
                triggerHaptic('light')
                onGesture({
                  type: 'tap',
                  startX: touchStartRef.current?.x || touch.clientX,
                  startY: touchStartRef.current?.y || touch.clientY,
                  endX: touch.clientX,
                  endY: touch.clientY,
                  duration,
                  element,
                })
                tapCount = 0
              }
            },
            enableDoubleTap ? 250 : 0
          )
        }

        touchStartRef.current = null
      }

      const handleTouchCancel = () => {
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current)
          longPressTimerRef.current = null
        }
        touchStartRef.current = null
      }

      element.addEventListener('touchstart', handleTouchStart, { passive: true })
      element.addEventListener('touchend', handleTouchEnd, { passive: true })
      element.addEventListener('touchcancel', handleTouchCancel, { passive: true })

      return () => {
        element.removeEventListener('touchstart', handleTouchStart)
        element.removeEventListener('touchend', handleTouchEnd)
        element.removeEventListener('touchcancel', handleTouchCancel)
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current)
        }
      }
    },
    [triggerHaptic]
  )

  // Safe area utilities para iPhone con notch
  const getSafeAreaInsets = useCallback(() => {
    if (typeof window === 'undefined') return { top: 0, bottom: 0, left: 0, right: 0 }

    const style = getComputedStyle(document.documentElement)
    return {
      top: parseInt(style.getPropertyValue('--sat') || '0'),
      bottom: parseInt(style.getPropertyValue('--sab') || '0'),
      left: parseInt(style.getPropertyValue('--sal') || '0'),
      right: parseInt(style.getPropertyValue('--sar') || '0'),
    }
  }, [])

  // Optimización de scroll en móvil
  const setupMobileScroll = useCallback((element: HTMLElement) => {
    ;(element.style as any).WebkitOverflowScrolling = 'touch'
    element.style.overscrollBehavior = 'contain'
    return () => {
      ;(element.style as any).WebkitOverflowScrolling = ''
      element.style.overscrollBehavior = ''
    }
  }, [])

  return {
    state,
    triggerHaptic,
    addTouchFeedback,
    setupGestureDetection,
    getSafeAreaInsets,
    setupMobileScroll,
  }
}
