// src/components/SOAPMarkdownExporter.tsx
// Simplified SOAP Markdown Exporter - Refactored by Bernard Orozco

'use client'

import ReactMarkdown from 'react-markdown'
import type { CompleteSOAP } from '../hooks/useSOAPData'
import { generateMarkdownContent } from '../utils/soapMarkdownUtils'
import { markdownComponents } from './soap-markdown/MarkdownComponents'

interface SOAPMarkdownExporterProps {
  soap: CompleteSOAP
  confidence?: number
  lastUpdated?: Date | number
}

export const SOAPMarkdownExporter = ({
  soap,
  confidence = 0,
  lastUpdated,
}: SOAPMarkdownExporterProps) => {
  const markdownContent = generateMarkdownContent(soap, confidence, lastUpdated)

  return (
    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-600/40 p-6">
      <div className="prose prose-invert prose-slate max-w-none">
        <ReactMarkdown components={markdownComponents}>{markdownContent}</ReactMarkdown>
      </div>
    </div>
  )
}

export { generateMarkdownContent }
