// 🧠 SIMPLE REDUX BRAIN API - Just calls the cognitive-core service
// This is how any Next.js app can use the Redux Brain

import { NextRequest, NextResponse } from 'next/server'
import { processReduxBrainMessage } from '@redux-claude/cognitive-core'

export async function POST(req: NextRequest) {
  try {
    const { sessionId, message } = await req.json()

    // Call the service from cognitive-core
    const result = await processReduxBrainMessage(sessionId, message, process.env.ANTHROPIC_API_KEY)

    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ Redux Brain API Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    service: '🧠 Redux Brain API (Simple)',
    description:
      'This API just calls the processReduxBrainMessage from @redux-claude/cognitive-core',
    usage: {
      install: 'npm install @redux-claude/cognitive-core',
      import: "import { processReduxBrainMessage } from '@redux-claude/cognitive-core'",
      hook: "import { useReduxBrain } from '@redux-claude/cognitive-core'",
      endpoint: 'POST /api/redux-brain',
      payload: {
        sessionId: 'unique-session-id',
        message: 'your medical query',
      },
    },
  })
}
