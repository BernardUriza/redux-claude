# Examples Documentation Index

This directory contains real-world examples, usage patterns, and practical implementations of the Redux Brain Medical AI system.

## Usage Examples

### Complete Implementation Example

- **[EXAMPLE_REDUX_BRAIN_USAGE.md](./EXAMPLE_REDUX_BRAIN_USAGE.md)**
  - Complete integration guide
  - API usage patterns
  - Redux store setup
  - Hook implementations
  - Component examples

## Transcription Format Examples

### Medical Conversation Diarization

- **[DIARIZACION_COMPLETA.md](./DIARIZACION_COMPLETA.md)**
  - Complete medical conversation example
  - Speaker identification patterns
  - Timestamp handling
  - Turn-taking analysis
  - Clinical context extraction

- **[FORMATOS_DIARIZACION_REALES.md](./FORMATOS_DIARIZACION_REALES.md)**
  - Real-world transcription formats
  - Multiple transcription service examples (Otter, Cue, WhatsApp)
  - Format normalization strategies
  - Parser implementation guidance

## Common Integration Patterns

### Basic API Integration

```typescript
// Simple Redux Brain API call
const response = await fetch('http://localhost:3100/api/redux-brain/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: 'unique-session-id',
    message: 'Patient complaint or medical query'
  })
});

const result = await response.json();
```

### Using with Redux Store

```typescript
import { useAppDispatch, useAppSelector } from '@/hooks/use-redux';
import { processPatientMessage } from '@redux-claude/cognitive-core';

function MedicalChatComponent() {
  const dispatch = useAppDispatch();
  const conversation = useAppSelector(state => state.conversation);

  const handleMessage = async (message: string) => {
    await dispatch(processPatientMessage({
      sessionId: conversation.sessionId,
      message
    }));
  };

  return (/* Your UI */);
}
```

### Custom Hook Pattern

```typescript
import { useMedicalChat } from '@/hooks/use-medical-chat';

function PatientInterface() {
  const {
    messages,
    sendMessage,
    isProcessing,
    currentSOAP
  } = useMedicalChat();

  return (
    <div>
      {messages.map(msg => <Message key={msg.id} {...msg} />)}
      <ChatInput onSend={sendMessage} disabled={isProcessing} />
      {currentSOAP && <SOAPNote data={currentSOAP} />}
    </div>
  );
}
```

## Transcription Service Integration

### Supported Formats

The system can process various transcription formats:

1. **Otter.ai Format**
   - JSON with speaker labels
   - Timestamp information
   - Confidence scores

2. **Cue Format**
   - Structured speaker turns
   - Medical terminology optimization
   - Time-coded segments

3. **WhatsApp Voice Transcription**
   - Simple text format
   - Speaker identification via metadata
   - Timestamp parsing

### Format Normalization

All transcription formats are normalized to:

```typescript
interface NormalizedTranscription {
  speakers: Speaker[];
  turns: ConversationTurn[];
  metadata: {
    duration: number;
    service: string;
    confidence?: number;
  };
}
```

## Advanced Usage Scenarios

### 1. Multi-Patient Session Management

Handle multiple concurrent patient conversations:

```typescript
const sessionManager = new SessionManager();

// Patient A
sessionManager.createSession('patient-a', {
  patientId: '12345',
  urgency: 'high'
});

// Patient B
sessionManager.createSession('patient-b', {
  patientId: '67890',
  urgency: 'moderate'
});
```

### 2. SOAP Note Autocomplete

Generate intelligent SOAP note suggestions:

```typescript
import { generateSOAPTemplates } from '@redux-claude/cognitive-core';

const templates = await generateSOAPTemplates({
  conversationHistory: messages,
  currentContext: extractedData
});

// Returns 3 template options:
// - Basic Template
// - Detailed Template
// - Specialized Template
```

### 3. Defensive Medicine Validation

Validate medical decisions for patient safety:

```typescript
import { DefensiveMedicineValidator } from '@redux-claude/cognitive-core';

const validator = new DefensiveMedicineValidator();
const validation = await validator.validate({
  symptoms: extractedSymptoms,
  diagnosis: proposedDiagnosis,
  patientHistory: medicalHistory
});

if (validation.requiresEscalation) {
  // Trigger emergency protocol
}
```

### 4. Custom Agent Creation

Extend the system with custom medical agents:

```typescript
import { BaseMedicalAgent } from '@redux-claude/cognitive-core';

class CardiologyAgent extends BaseMedicalAgent {
  async evaluate(context: MedicalContext): Promise<AgentDecision> {
    // Specialized cardiology logic
    return {
      confidence: 0.92,
      recommendations: ['ECG', 'Troponin levels'],
      urgency: 'high'
    };
  }
}
```

## Testing Examples

### Unit Testing Redux Brain Integration

```typescript
import { renderHook } from '@testing-library/react';
import { useMedicalChat } from '@/hooks/use-medical-chat';

describe('Medical Chat Hook', () => {
  it('processes critical symptoms with high urgency', async () => {
    const { result } = renderHook(() => useMedicalChat());

    await result.current.sendMessage('chest pain radiating to left arm');

    expect(result.current.urgencyLevel).toBe('critical');
    expect(result.current.emergencyProtocolActive).toBe(true);
  });
});
```

### Integration Testing

```bash
# Use provided test scripts
cd scripts/testing/
./test-api.sh "Patient has severe chest pain"
./test-integration.sh
```

## Related Documentation

- **Architecture**: See `../architecture/` for system design details
- **Testing**: See `../testing/` for validation approaches
- **API Reference**: See root `/documentation/API_DOCUMENTATION.md`
- **Hooks Reference**: See root `/documentation/HOOKS_DOCUMENTATION.md`

## Fixture Files

Test fixtures are located in `/tests/fixtures/`:

- `test_cue_transcription.json` - Cue format example
- `test_otter_format.json` - Otter.ai format example
- `test_whatsapp_voice.json` - WhatsApp transcription example

---

**Last Updated**: October 2025
**Maintainer**: Redux Brain Medical AI Team
