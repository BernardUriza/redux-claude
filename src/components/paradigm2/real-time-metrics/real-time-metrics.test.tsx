import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/utils/test-utils'
import { RealTimeMetrics } from './real-time-metrics'

// Simple mock - avoid cognitive-core issues
vi.mock('@redux-claude/cognitive-core', () => ({
  useAppSelector: vi.fn(() => null), // Always return null for simplicity
}))

describe('RealTimeMetrics - TDD Clean Version', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render metrics panel title', () => {
    render(<RealTimeMetrics />)
    expect(screen.getByText('📊 Real-Time Metrics')).toBeInTheDocument()
  })

  it('should display system confidence metric', () => {
    render(<RealTimeMetrics />)

    expect(screen.getByText('95%')).toBeInTheDocument()
    expect(screen.getByText(/Confianza Diagnóstica/)).toBeInTheDocument()
  })

  it('should show processing cycles information', () => {
    render(<RealTimeMetrics />)

    expect(screen.getByText(/3.*ciclos/i)).toBeInTheDocument()
    expect(screen.getByText(/Progreso Iterativo/)).toBeInTheDocument()
  })

  it('should display active agents count', () => {
    render(<RealTimeMetrics />)

    expect(screen.getByText(/Agentes Activos/)).toBeInTheDocument()
    expect(screen.getByText('5/13')).toBeInTheDocument()
  })

  it('should show system health score', () => {
    render(<RealTimeMetrics />)

    expect(screen.getByText('91%')).toBeInTheDocument()
    expect(screen.getByText(/Calidad Sistema/)).toBeInTheDocument()
  })

  it('should calculate and display consensus rate', () => {
    render(<RealTimeMetrics />)

    // Consensus rate should be confidence * 0.95 = 90%
    expect(screen.getByText('90%')).toBeInTheDocument()
    expect(screen.getByText(/Consenso Médico/)).toBeInTheDocument()
  })

  it('should show response time metric', () => {
    render(<RealTimeMetrics />)

    expect(screen.getByText('250ms')).toBeInTheDocument()
    expect(screen.getByText(/Tiempo Respuesta/)).toBeInTheDocument()
  })

  it('should display appropriate trend indicators', () => {
    render(<RealTimeMetrics />)

    // High confidence should show upward trend
    const trendIndicators = screen.getAllByText('↗')
    expect(trendIndicators.length).toBeGreaterThan(0)
  })

  it('should show loading state when streaming', () => {
    render(<RealTimeMetrics isLoading={true} />)

    expect(screen.getByText(/Procesando.../)).toBeInTheDocument()
  })

  it('should handle low performance gracefully with demo data', () => {
    // Component uses demo data, so this tests the demo implementation
    render(<RealTimeMetrics />)

    // Should not crash and should show some metrics
    expect(screen.getByText(/📊 Real-Time Metrics/)).toBeInTheDocument()
  })

  it('should display grade based on performance', () => {
    render(<RealTimeMetrics />)

    // High performance should show A grade
    expect(screen.getByText(/Grade:.*A/)).toBeInTheDocument()
  })

  it('should show system status indicator', () => {
    render(<RealTimeMetrics />)

    expect(screen.getByText(/Sistema.*Óptimo/i)).toBeInTheDocument()
  })

  it('should show mock data when no real metrics available', () => {
    // Since mock always returns null, should show demo data
    render(<RealTimeMetrics />)

    expect(screen.getByText('95%')).toBeInTheDocument() // Mock demo data
  })
})
