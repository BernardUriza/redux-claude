import { useState } from 'react'
import { useMedicalChat } from '@redux-claude/cognitive-core/hooks/useMedicalChatEvolved'

// Simple markdown parser for medical messages
const parseMarkdown = (text: string) => {
  const lines = text.split('\n')
  const elements: JSX.Element[] = []
  let key = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Skip empty lines
    if (!line.trim()) {
      elements.push(<div key={key++} className="h-2" />)
      continue
    }

    // Bold sections (**text**)
    if (line.includes('**')) {
      const parts = line.split('**')
      const rendered = parts.map((part, idx) => {
        if (idx % 2 === 1) {
          return <strong key={idx} className="font-bold text-white">{part}</strong>
        }
        return <span key={idx}>{part}</span>
      })
      elements.push(<p key={key++} className="mb-1">{rendered}</p>)
      continue
    }

    // Bullets (• or - at start)
    if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
      const content = line.trim().substring(1).trim()
      elements.push(
        <div key={key++} className="flex gap-2 ml-2 mb-1">
          <span className="text-cyan-400">•</span>
          <span className="flex-1">{content}</span>
        </div>
      )
      continue
    }

    // Regular paragraph
    elements.push(<p key={key++} className="mb-1">{line}</p>)
  }

  return elements
}

export const ChatInterface = () => {
  const [input, setInput] = useState('')
  const { messages, isLoading, sendMedicalQuery } = useMedicalChat()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      await sendMedicalQuery(input)
      setInput('')
    }
  }

  return (
    <section className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <h2 className="text-xl font-semibold mb-4 text-green-400">💬 Medical Chat</h2>

      {/* Messages Container */}
      <div className="h-96 overflow-y-auto mb-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-gray-500 text-center mt-16">
            <div className="text-4xl mb-2">🧠</div>
            <p>Start a medical conversation...</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg transition-all ${
                msg.type === 'user'
                  ? 'bg-blue-900/30 ml-6 border-l-2 border-blue-400'
                  : 'bg-gray-800 mr-6 border-l-2 border-green-400'
              }`}
            >
              <div className="text-xs text-gray-400 mb-2 font-mono">
                {msg.type === 'user' ? 'YOU' : 'COGNITIVE AI'}
              </div>
              <div className="text-sm leading-relaxed">
                {parseMarkdown(msg.content)}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="bg-gray-800 p-4 rounded-lg border-l-2 border-yellow-400">
            <div className="flex items-center space-x-3">
              <div className="animate-pulse text-yellow-400">🤔</div>
              <div>Processing medical query...</div>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Describe symptoms or medical case..."
          className="flex-1 bg-gray-800 rounded-lg px-4 py-3 text-sm border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
        >
          {isLoading ? '...' : 'Send'}
        </button>
      </form>
    </section>
  )
}
