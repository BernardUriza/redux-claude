// Redirect to main Redux Brain API
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  return NextResponse.json({
    message: 'This endpoint has been consolidated. Please use /api/redux-brain/ instead.',
    redirect: '/api/redux-brain/',
    status: 'deprecated'
  }, { status: 301 })
}

export async function GET() {
  return NextResponse.json({
    message: 'Medical validation is now integrated into /api/redux-brain/',
    redirect: '/api/redux-brain/',
    features: ['validation', 'urgency detection', 'SOAP generation'],
    status: 'deprecated'
  })
}
