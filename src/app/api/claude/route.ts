import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// Configure Node.js to accept self-signed certificates (for corporate networks)
if (typeof process !== 'undefined' && process.env.NODE_TLS_REJECT_UNAUTHORIZED !== '0') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.CLAUDE_API_KEY
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Claude API key not configured on server' },
        { status: 500 }
      )
    }

    const body = await req.json()
    const { systemPrompt, userPrompt, stream = false } = body

    const anthropic = new Anthropic({
      apiKey: apiKey,
    })

    if (stream) {
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const messageStream = await anthropic.messages.create({
              model: 'claude-3-haiku-20240307',
              max_tokens: 1000,
              temperature: 0.3,
              system: systemPrompt,
              messages: [{ role: 'user', content: userPrompt }],
              stream: true
            })

            for await (const chunk of messageStream) {
              if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`))
              }
            }
            
            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
            controller.close()
          } catch (error) {
            controller.error(error)
          }
        }
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    } else {
      const response = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        temperature: 0.3,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })

      const content = response.content[0]
      if (content.type !== 'text') {
        return NextResponse.json(
          { error: 'Unexpected response format' },
          { status: 500 }
        )
      }

      return NextResponse.json({ content: content.text, success: true })
    }
  } catch (error) {
    console.error('Claude API error:', error)
    
    // More detailed error handling
    let errorMessage = 'Unknown error'
    let errorDetails = ''
    
    if (error instanceof Error) {
      errorMessage = error.message
      errorDetails = error.stack || ''
      
      // Specific handling for common errors
      if (error.message.includes('self-signed certificate')) {
        errorMessage = 'SSL Certificate error - Corporate network detected'
        errorDetails = 'Try setting NODE_TLS_REJECT_UNAUTHORIZED=0 in environment'
      } else if (error.message.includes('Connection error')) {
        errorMessage = 'Network connection failed'
        errorDetails = 'Check internet connection and proxy settings'
      } else if (error.message.includes('API key')) {
        errorMessage = 'Invalid or missing API key'
        errorDetails = 'Verify CLAUDE_API_KEY environment variable'
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}