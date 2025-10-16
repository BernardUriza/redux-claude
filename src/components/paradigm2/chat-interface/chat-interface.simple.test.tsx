import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChatInterface } from './chat-interface'

// Simple mock - just mock what we need
vi.mock('@redux-claude/cognitive-core', () => ({
  useMedicalChat: () => ({
    messages: [],
    isLoading: false,
    sendMedicalQuery: vi.fn(),
  }),
}))

describe('ChatInterface - Basic Rendering', () => {
  it('should render the medical chat header', () => {
    render(<ChatInterface />)
    expect(screen.getByText('💬 Medical Chat')).toBeInTheDocument()
  })

  it('should render empty state when no messages', () => {
    render(<ChatInterface />)
    expect(screen.getByText('Start a medical conversation...')).toBeInTheDocument()
    expect(screen.getByText('🧠')).toBeInTheDocument()
  })

  it('should render input and button', () => {
    render(<ChatInterface />)

    const input = screen.getByPlaceholderText('Describe symptoms or medical case...')
    const button = screen.getByRole('button', { name: /send/i })

    expect(input).toBeInTheDocument()
    expect(button).toBeInTheDocument()
  })

  it('should disable button when input is empty', () => {
    render(<ChatInterface />)

    const button = screen.getByRole('button', { name: /send/i })
    expect(button).toBeDisabled()
  })

  it('should enable button when input has content', () => {
    render(<ChatInterface />)

    const input = screen.getByPlaceholderText('Describe symptoms or medical case...')
    const button = screen.getByRole('button', { name: /send/i })

    fireEvent.change(input, { target: { value: 'fever symptoms' } })
    expect(button).toBeEnabled()
  })
})
