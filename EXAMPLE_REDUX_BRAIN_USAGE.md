# 🧠 Redux Brain - NPM Package Usage Example

## Installation

```bash
npm install @redux-claude/cognitive-core
```

## Simple Chat Component (Any Next.js App)

```tsx
// app/components/MedicalChat.tsx
'use client'

import { useReduxBrain } from '@redux-claude/cognitive-core'

export default function MedicalChat() {
  const {
    sendMessage,
    messages,
    isLoading,
    getSOAPProgress,
    getUrgencyLevel
  } = useReduxBrain()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const input = e.target.message.value
    sendMessage(input)
    e.target.reset()
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`mb-4 p-4 rounded ${
            msg.role === 'user' ? 'bg-blue-900' : 'bg-gray-800'
          }`}>
            <div className="text-white">{msg.content}</div>

            {/* Show SOAP if complete */}
            {msg.soapProgress === 100 && msg.soapState && (
              <div className="mt-2 p-2 bg-gray-700 rounded text-sm">
                <div><b>S:</b> {msg.soapState.subjetivo}</div>
                <div><b>O:</b> {msg.soapState.objetivo}</div>
                <div><b>A:</b> {msg.soapState.analisis}</div>
                <div><b>P:</b> {msg.soapState.plan}</div>
              </div>
            )}

            {/* Show urgency badge */}
            {msg.urgencyLevel && (
              <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${
                msg.urgencyLevel === 'CRITICAL' ? 'bg-red-600' :
                msg.urgencyLevel === 'HIGH' ? 'bg-orange-600' :
                msg.urgencyLevel === 'MODERATE' ? 'bg-yellow-600' :
                'bg-green-600'
              }`}>
                {msg.urgencyLevel}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <input
          name="message"
          type="text"
          placeholder="Describe your symptoms..."
          disabled={isLoading}
          className="w-full px-4 py-2 bg-gray-800 text-white rounded"
        />
      </form>
    </div>
  )
}
```

## API Route (Minimal)

```typescript
// app/api/redux-brain/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { processReduxBrainMessage } from '@redux-claude/cognitive-core'

export async function POST(req: NextRequest) {
  const { sessionId, message } = await req.json()

  const result = await processReduxBrainMessage(
    sessionId,
    message,
    process.env.ANTHROPIC_API_KEY
  )

  return NextResponse.json(result)
}
```

## Environment Variables

```env
# .env.local
ANTHROPIC_API_KEY=your-api-key-here
```

## Advanced Usage

```tsx
// Custom error handling
const { sendMessage, messages } = useReduxBrain({
  apiEndpoint: '/api/custom-endpoint',
  sessionId: 'custom-session-123',
  onError: (error) => {
    console.error('Custom error handler:', error)
    // Show toast, modal, etc.
  }
})

// Access full response data
const { lastResponse } = useReduxBrain()
console.log('Redux actions:', lastResponse?.reduxFlow?.totalActions)
console.log('SOAP progress:', lastResponse?.sessionData?.soapProgress)
console.log('Urgency:', lastResponse?.urgencyAssessment?.level)
```

## Features Included

✅ **Complete Medical AI System**
- DefensiveMedicineValidator for critical symptoms
- SOAP note generation
- Urgency detection (CRITICAL/HIGH/MODERATE/LOW)
- Pediatric protocols
- Redux action tracking

✅ **Simple Integration**
- One hook: `useReduxBrain()`
- One API call: `processReduxBrainMessage()`
- TypeScript support
- React 18+ compatible

✅ **Production Ready**
- Session management
- Error handling
- Loading states
- Message history
- SOAP progress tracking

## Package Size

```
@redux-claude/cognitive-core: ~250KB (minified + gzipped)
```

## Live Example

```bash
# Clone example app
git clone https://github.com/your-org/redux-brain-example
cd redux-brain-example
npm install
npm run dev
```

## Support

- GitHub: https://github.com/BernardUriza/redux-claude
- NPM: https://www.npmjs.com/package/@redux-claude/cognitive-core
- Issues: https://github.com/BernardUriza/redux-claude/issues

---

*Redux Brain - Medical AI consultation system as an NPM package*