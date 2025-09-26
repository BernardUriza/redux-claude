// Redirect to main Redux Brain API
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  // Redirect to the main endpoint
  const body = await req.json()
  return NextResponse.redirect(new URL('/api/redux-brain/', req.url), {
    status: 308, // Permanent redirect preserving method
    headers: {
      'X-Redirect-Reason': 'Consolidated to redux-brain endpoint'
    }
  })
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: 'This endpoint has been consolidated. Please use /api/redux-brain/ instead.',
    redirect: '/api/redux-brain/',
    status: 'deprecated'
  }, { status: 301 })
}