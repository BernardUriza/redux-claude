// src/hooks/useMessageContent.ts
// Message Content Processing Hook - Extracted from EnhancedMedicalMessage

'use client'

import { useState, useEffect } from 'react'
import type { MedicalMessage } from '@redux-claude/cognitive-core'
import { PERFORMANCE } from '../constants/magicNumbers'

interface _MessageContentState {
  clientTimeString: string
  copied: boolean
  isSOAPAnalysis: boolean
  isRejection: boolean
}

export const useMessageContent = (message: MedicalMessage) => {
  const [copied, setCopied] = useState(false)
  const [clientTimeString, setClientTimeString] = useState('')

  // Fix hydration mismatch by formatting timestamp only on client
  useEffect(() => {
    setClientTimeString(
      new Date(message.timestamp).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    )
  }, [message.timestamp])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), PERFORMANCE.ANIMATION_DELAY)
    } catch (err) {
      console.error('Error copiando al portapapeles:', err)
    }
  }

  const isSOAPAnalysis =
    message.content.includes('EXPEDIENTE CLÍNICO') || message.content.includes('### S - SUBJETIVO')

  const isRejection = message.content.includes('⚠️ Consulta No Válida')

  return {
    clientTimeString,
    copied,
    copyToClipboard,
    isSOAPAnalysis,
    isRejection,
  }
}
