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
      role: 'user',
      content: 'Hola, Doctor Claude. Tengo algunos síntomas que me preocupan: dolor de cabeza persistente, mareos ocasionales y sensibilidad a la luz desde hace 3 días. ¿Qué podría ser?'
    },
    {
      role: 'assistant',
      content: 'Hola, entiendo tu preocupación. Los síntomas que describes - dolor de cabeza persistente, mareos y fotofobia (sensibilidad a la luz) - pueden tener varias causas.\n\n**Posibles causas incluyen:**\n• **Migraña** - muy común, especialmente con la sensibilidad a la luz\n• **Tensión o estrés** - puede causar cefaleas tensionales\n• **Deshidratación** - a menudo subestimada\n• **Problemas de sueño** - falta de descanso adecuado\n\n**Te recomiendo:**\n✅ Mantente bien hidratado\n✅ Descansa en un lugar oscuro y silencioso\n✅ Evita pantallas por períodos prolongados\n✅ Si persiste más de 48h o empeora, consulta un médico presencial\n\n**⚠️ Busca atención inmediata si tienes:**\n• Fiebre alta\n• Rigidez en el cuello\n• Vómitos persistentes\n• Cambios en la visión\n\n¿Has tenido algún cambio reciente en tu rutina, estrés o alimentación?'
    },
    {
      role: 'user',
      content: 'Ahora que lo mencionas, sí he estado muy estresado en el trabajo esta semana, durmiendo poco y tomando mucho café. No he bebido suficiente agua tampoco.'
    },
    {
      role: 'assistant',
      content: 'Eso explica mucho! 🎯 Tienes una combinación perfecta de factores desencadenantes:\n\n**Análisis de tu situación:**\n• **Estrés laboral** → tensión muscular → dolor de cabeza\n• **Falta de sueño** → sensibilidad aumentada → mareos\n• **Exceso de cafeína** → deshidratación → amplifica síntomas\n• **Poca hidratación** → reduce volumen sanguíneo → mareos\n\n**Plan de acción inmediato:**\n1. **Hidratación**: 2-3 vasos de agua ahora, luego 1 vaso cada hora\n2. **Reducir cafeína**: máximo 1-2 tazas al día\n3. **Descanso**: siesta de 20-30 min si es posible\n4. **Relajación**: respiración profunda 5 minutos\n\n**Esta noche:**\n• Acuéstate temprano (antes de las 10pm)\n• Evita pantallas 1 hora antes de dormir\n• Habitación fresca y oscura\n\n**Deberías sentir mejora en 24-48 horas.** Si no mejoras o empeoras, consulta un médico.\n\n¿Puedes implementar estos cambios hoy?'
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