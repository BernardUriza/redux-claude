// src/store/chatSlice.ts
// Creado por Bernard Orozco
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ChatState {
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
  isLoading: boolean
  error: string | null
}

const initialState: ChatState = {
  messages: [
    {
      role: 'assistant',
      content: `## 🏥 Sistema Cognitivo Médico AI - Listo para Análisis

¡Bienvenido, doctor! Soy su asistente de IA médica avanzada con capacidades cognitivas multi-agente.

### 🎯 **Cómo funciono:**
- **Análisis Diagnóstico**: Evaluaciones diferenciales basadas en evidencia
- **Clasificación de Urgencia**: Triage ESI automatizado  
- **Validación Clínica**: Revisión de seguridad y calidad
- **Planes de Tratamiento**: Recomendaciones terapéuticas
- **Documentación SOAP**: Notas médicas estructuradas

### 💬 **Para comenzar:**
Describa el caso clínico completo: síntomas, antecedentes, examen físico, y cualquier información relevante del paciente.

**Ejemplo**: *"Paciente femenina de 32 años presenta cefalea pulsátil de 2 días de duración, asociada a náuseas y fotofobia. Sin fiebre. Antecedente de migrañas ocasionales..."*

🚀 **Estoy listo para procesar su consulta médica con análisis cognitivo avanzado.**`
    }
  ],
  isLoading: false,
  error: null
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addUserMessage: (state, action: PayloadAction<string>) => {
      state.messages.push({
        role: 'user',
        content: action.payload
      })
      state.isLoading = true
      state.error = null
    },
    addAssistantMessage: (state, action: PayloadAction<string>) => {
      state.messages.push({
        role: 'assistant',
        content: action.payload
      })
      state.isLoading = false
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.isLoading = false
    },
    clearChat: (state) => {
      state.messages = []
      state.error = null
    }
  }
})

export const { addUserMessage, addAssistantMessage, setError, clearChat } = chatSlice.actions
export default chatSlice.reducer