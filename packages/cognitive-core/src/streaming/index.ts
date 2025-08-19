// Placeholder para streaming - se implementará después - Bernard Orozco

export interface StreamingChunk {
  id: string
  type: string
  content: string
  isComplete: boolean
  timestamp: number
  confidence?: number
}

export class StreamingService {
  constructor(config: any) {}
  
  async *streamMedicalEvaluation(message: string): AsyncGenerator<StreamingChunk> {
    // Placeholder - implementar después
    yield {
      id: 'placeholder',
      type: 'diagnosis',
      content: 'Streaming implementation pending',
      isComplete: true,
      timestamp: Date.now()
    }
  }
}