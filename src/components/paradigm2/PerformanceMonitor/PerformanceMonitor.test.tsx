import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils/test-utils'
import { PerformanceMonitor } from './PerformanceMonitor'

// Mock performance APIs
const mockPerformance = {
  now: vi.fn(),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByName: vi.fn(),
  getEntriesByType: vi.fn(),
  memory: {
    usedJSHeapSize: 1024 * 1024 * 10, // 10MB
    totalJSHeapSize: 1024 * 1024 * 20, // 20MB
    jsHeapSizeLimit: 1024 * 1024 * 100, // 100MB
  },
}

// Mock bundle analyzer (unused but kept for future reference)
const _mockBundleStats = {
  original: { size: 1024 * 512, modules: 1217 }, // 512KB, 1217 modules
  optimized: { size: 1024 * 256, modules: 156 }, // 256KB, 156 modules
}

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock global performance
    Object.defineProperty(global, 'performance', {
      value: mockPerformance,
      writable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render performance metrics title', () => {
    render(<PerformanceMonitor />)
    expect(screen.getByText('⚡ Performance Monitor')).toBeInTheDocument()
  })

  it('should display bundle size comparison', async () => {
    mockPerformance.getEntriesByType.mockReturnValue([
      { name: 'bundle-original', transferSize: 1024 * 512 },
      { name: 'bundle-optimized', transferSize: 1024 * 256 },
    ])

    render(<PerformanceMonitor />)

    await waitFor(() => {
      expect(screen.getByText(/Bundle Size/)).toBeInTheDocument()
    })
  })

  it('should show memory usage metrics', () => {
    render(<PerformanceMonitor />)

    expect(screen.getByText(/Memory Usage/)).toBeInTheDocument()
    expect(screen.getByText(/10\.0 MB/)).toBeInTheDocument() // Used heap
  })

  it('should calculate performance improvement percentage', () => {
    render(<PerformanceMonitor showComparison={true} />)

    // Should show 50% improvement (512KB -> 256KB)
    expect(screen.getByText(/50%.*faster/i)).toBeInTheDocument()
  })

  it('should display render time metrics', async () => {
    mockPerformance.now
      .mockReturnValueOnce(100) // Start time
      .mockReturnValueOnce(150) // End time

    render(<PerformanceMonitor trackRenderTime={true} />)

    await waitFor(() => {
      expect(screen.getByText(/Render Time/)).toBeInTheDocument()
      expect(screen.getByText(/50ms/)).toBeInTheDocument()
    })
  })

  it('should show module count comparison', () => {
    render(<PerformanceMonitor showModuleCount={true} />)

    expect(screen.getByText(/Modules/)).toBeInTheDocument()
    expect(screen.getByText(/1,217.*→.*156/)).toBeInTheDocument()
  })

  it('should display performance grade', () => {
    render(<PerformanceMonitor />)

    // Grade based on metrics: A+ for optimized, C- for original
    expect(screen.getByText(/Grade:/)).toBeInTheDocument()
  })

  it('should handle missing performance API gracefully', () => {
    // Remove performance API
    Object.defineProperty(global, 'performance', {
      value: undefined,
      writable: true,
    })

    render(<PerformanceMonitor />)

    expect(screen.getByText(/Performance data unavailable/)).toBeInTheDocument()
  })

  it('should update metrics in real-time', async () => {
    vi.useFakeTimers()

    render(<PerformanceMonitor updateInterval={100} />)

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText(/10\.0 MB/)).toBeInTheDocument()
    })

    // Update memory usage
    mockPerformance.memory.usedJSHeapSize = 1024 * 1024 * 15 // 15MB

    // Advance timer
    vi.advanceTimersByTime(100)

    // Wait for update
    await waitFor(
      () => {
        expect(screen.getByText(/15\.0 MB/)).toBeInTheDocument()
      },
      { timeout: 1000 }
    )

    vi.useRealTimers()
  }, 10000)

  it('should show performance recommendations', () => {
    render(<PerformanceMonitor showRecommendations={true} />)

    expect(screen.getByText(/Recommendations/)).toBeInTheDocument()
    expect(screen.getByText(/87% module reduction achieved/)).toBeInTheDocument()
  })
})
