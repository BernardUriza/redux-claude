import { useMedicalChat } from '@redux-claude/cognitive-core/dist/hooks/useMedicalChatEvolved'

export const ChatDebug = () => {
  const { messages } = useMedicalChat()

  return (
    <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-xs">
      <h3 className="text-yellow-400 mb-2">🔍 DEBUG: Redux Messages State</h3>
      {messages.map((msg, idx) => (
        <div key={idx} className="mb-3 border-b border-gray-800 pb-2">
          <div className="text-blue-400">Message {idx + 1} ({msg.type}):</div>
          <div className="text-white">
            Type of content: {typeof msg.content}
          </div>
          <div className="text-gray-300">
            Content value: {JSON.stringify(msg.content, null, 2)}
          </div>
          <div className="text-purple-400">
            Raw msg object: {JSON.stringify(msg, null, 2)}
          </div>
        </div>
      ))}
      {messages.length === 0 && (
        <div className="text-gray-500">No messages in state</div>
      )}
    </div>
  )
}