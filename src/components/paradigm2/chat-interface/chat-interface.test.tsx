import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils'
import { ChatInterface } from './chat-interface'

// Mock the entire cognitive-core module
const mockSendMedicalQuery = vi.fn()

vi.mock('@redux-claude/cognitive-core', () => ({
  useMedicalChat: vi.fn(() => ({
    messages: [],
    isLoading: false,
    sendMedicalQuery: mockSendMedicalQuery,
  })),
  useAppDispatch: vi.fn(),
  useAppSelector: vi.fn(),
}))

describe('ChatInterface', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  it('should render empty state message when no messages', () => {
    render(<ChatInterface />)

    expect(screen.getByText('Start a medical conversation...')).toBeInTheDocument()
    expect(screen.getByText('🧠')).toBeInTheDocument()
  })

  it('should render input field and send button', () => {
    render(<ChatInterface />)

    const input = screen.getByPlaceholderText('Describe symptoms or medical case...')
    const button = screen.getByRole('button', { name: /send/i })

    expect(input).toBeInTheDocument()
    expect(button).toBeInTheDocument()
  })

  it('should disable send button when input is empty', () => {
    render(<ChatInterface />)

    const button = screen.getByRole('button', { name: /send/i })
    expect(button).toBeDisabled()
  })

  it('should enable send button when input has text', async () => {
    render(<ChatInterface />)

    const input = screen.getByPlaceholderText('Describe symptoms or medical case...')
    const button = screen.getByRole('button', { name: /send/i })

    fireEvent.change(input, { target: { value: 'Patient has fever' } })

    expect(button).toBeEnabled()
  })

  it('should show loading state when processing', () => {
    vi.mocked(require('@redux-claude/cognitive-core').useMedicalChat).mockReturnValue({
      messages: [],
      isLoading: true,
      sendMedicalQuery: mockSendMedicalQuery,
    })

    render(<ChatInterface />)

    expect(screen.getByText('Processing medical query...')).toBeInTheDocument()
    expect(screen.getByText('🤔')).toBeInTheDocument()
  })

  it('should render messages when available', () => {
    const mockMessages = [
      { type: 'user', content: 'Patient has fever' },
      { type: 'assistant', content: 'I need more information about the fever.' },
    ]

    vi.mocked(require('@redux-claude/cognitive-core').useMedicalChat).mockReturnValue({
      messages: mockMessages,
      isLoading: false,
      sendMedicalQuery: mockSendMedicalQuery,
    })

    render(<ChatInterface />)

    expect(screen.getByText('Patient has fever')).toBeInTheDocument()
    expect(screen.getByText('I need more information about the fever.')).toBeInTheDocument()
    expect(screen.getByText('YOU')).toBeInTheDocument()
    expect(screen.getByText('COGNITIVE AI')).toBeInTheDocument()
  })

  it('should call sendMedicalQuery when form is submitted', async () => {
    vi.mocked(require('@redux-claude/cognitive-core').useMedicalChat).mockReturnValue({
      messages: [],
      isLoading: false,
      sendMedicalQuery: mockSendMedicalQuery,
    })

    render(<ChatInterface />)

    const input = screen.getByPlaceholderText('Describe symptoms or medical case...')
    const form = input.closest('form')!

    fireEvent.change(input, { target: { value: 'Patient has fever' } })
    fireEvent.submit(form)

    await waitFor(() => {
      expect(mockSendMedicalQuery).toHaveBeenCalledWith('Patient has fever')
    })
  })

  it('should clear input after successful submission', async () => {
    mockSendMedicalQuery.mockResolvedValue(undefined)

    vi.mocked(require('@redux-claude/cognitive-core').useMedicalChat).mockReturnValue({
      messages: [],
      isLoading: false,
      sendMedicalQuery: mockSendMedicalQuery,
    })

    render(<ChatInterface />)

    const input = screen.getByPlaceholderText('Describe symptoms or medical case...')
    const form = input.closest('form')!

    fireEvent.change(input, { target: { value: 'Patient has fever' } })
    expect((input as HTMLInputElement).value).toBe('Patient has fever')

    fireEvent.submit(form)

    await waitFor(() => {
      expect((input as HTMLInputElement).value).toBe('')
    })
  })
})
