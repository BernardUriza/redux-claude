// Debug endpoint para verificar configuración
import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.CLAUDE_API_KEY

  return NextResponse.json({
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey?.length || 0,
    apiKeyStart: apiKey ? apiKey.substring(0, 10) + '...' : 'NOT SET',
    nodeEnv: process.env.NODE_ENV,
    tlsReject: process.env.NODE_TLS_REJECT_UNAUTHORIZED,
  })
}
