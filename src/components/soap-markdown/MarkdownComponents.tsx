// src/components/soap-markdown/MarkdownComponents.tsx
// Reusable Markdown Components - Extracted from SOAPMarkdownExporter

import { Components } from 'react-markdown'

export const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-3xl font-bold text-white mb-6 border-b border-slate-600 pb-3">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-2xl font-bold text-slate-200 mb-4 mt-8 flex items-center gap-2">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl font-semibold text-slate-300 mb-3 mt-6">{children}</h3>
  ),
  p: ({ children }) => <p className="text-slate-300 mb-4 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="text-slate-300 mb-4 ml-4">{children}</ul>,
  li: ({ children }) => (
    <li className="mb-2 flex items-start gap-2">
      <span className="text-blue-400 mt-2 text-xs">•</span>
      <span className="flex-1">{children}</span>
    </li>
  ),
  strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
  em: ({ children }) => <em className="text-slate-400 italic">{children}</em>,
  code: ({ children }) => (
    <code className="bg-slate-800 text-slate-200 px-2 py-1 rounded text-sm">{children}</code>
  ),
}
