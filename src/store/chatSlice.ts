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
      content: '--- \n🗓️ **Hoy, 8:05 PM**\n\n🧑‍🦱 **Paciente:** Hola, doctor. Tengo algunos síntomas que me preocupan: un dolor de cabeza persistente, mareos ocasionales y mucha sensibilidad a la luz desde hace 3 días. ¿Qué podría ser?\n\n---\n🗓️ **Hoy, 8:07 PM**\n\n👨‍⚕️ **Doctor:** Hola, entiendo su preocupación. Por lo que me describe —ese dolor de cabeza, los mareos y la fotofobia (sensibilidad a la luz)—, puede haber varias causas.\n\n**Las más comunes suelen ser:**\n• **Migraña** 🤯\n• **Tensión o estrés** 😫\n• **Deshidratación** 💧\n• **Falta de sueño** 😴\n\n**Mi recomendación inicial es la siguiente:**\n✅ Manténgase bien hidratado.\n✅ Descanse en un lugar oscuro y silencioso.\n✅ Evite las pantallas por un tiempo.\n✅ Si no mejora en 48 horas o sus síntomas empeoran, acuda a una consulta presencial.\n\n**⚠️ Por favor, busque atención médica de inmediato si presenta:**\n• Fiebre alta\n• Rigidez en el cuello\n• Vómitos constantes\n• Cambios en la visión\n\n¿Ha notado algún cambio reciente en su rutina, nivel de estrés o alimentación?\n\n---\n🗓️ **Hoy, 8:10 PM**\n\n🧑‍🦱 **Paciente:** Ahora que lo menciona, sí he estado muy estresado en el trabajo esta semana. He dormido poco y he tomado mucho café. Tampoco he bebido mucha agua.\n\n---\n🗓️ **Hoy, 8:12 PM**\n\n👨‍⚕️ **Doctor:** Eso lo explica todo. 🎯 La combinación de todos esos factores puede ser la causa de sus síntomas.\n\n**Veamos los detonantes:**\n• **Estrés laboral** 💼 → provoca tensión muscular y dolor de cabeza.\n• **Falta de sueño** 🌙 → aumenta su sensibilidad a los síntomas.\n• **Exceso de cafeína** ☕ → deshidrata y amplifica los síntomas.\n• **Poca hidratación** 📉 → reduce el volumen sanguíneo, causando mareos.\n\n**Aquí tiene un plan de acción inmediato:**\n1. **Hidratación** 💧: Beba 2-3 vasos de agua ahora mismo y luego uno cada hora.\n2. **Reducir cafeína** 🚫: No tome más de 1-2 tazas al día.\n3. **Descanso** 🛋️: Si puede, tome una siesta de 20-30 minutos.\n4. **Relajación** 🧘: Haga ejercicios de respiración profunda por 5 minutos.\n\n**Para esta noche:**\n• Acuéstese temprano (antes de las 10 PM).\n• Evite pantallas al menos una hora antes de dormir.\n• Mantenga su habitación fresca y oscura.\n\nDebería empezar a sentirse mejor en 24-48 horas. Si no nota una mejoría o se siente peor, por favor, agende una cita.\n\n¿Cree que puede hacer estos cambios hoy?'
    },
    {
      "role": "user",
      "content": "--- \n🗓️ **Hoy, 3:15 PM**\n\n🧑‍🦱 **Adolescente:** Hola, consejera. Necesito hablar con alguien, pero no sé por dónde empezar. Me acabo de enterar de que estoy embarazada y tengo mucho miedo. Mis padres no lo saben y no sé qué hacer.\n\n---\n🗓️ **Hoy, 3:20 PM**\n\n👩‍💼 **Consejera:** Hola, gracias por la confianza. Entiendo perfectamente tu situación. Es un momento difícil y es normal sentirte asustada y confundida. Quiero que sepas que estoy aquí para escucharte y ayudarte a explorar tus opciones, sin juzgarte.\n\n**Las opciones que tienes, en general, son:**\n• **Continuar con el embarazo** y criar al bebé.\n• **Considerar la adopción** como una alternativa.\n• **Explorar la interrupción legal del embarazo**, si es una opción viable en tu localidad.\n\n**Mi recomendación inicial es la siguiente:**\n✅ Respira profundo. No tienes que tomar una decisión de inmediato.\n✅ Busca un espacio seguro para hablar. Puede ser conmigo, un familiar de confianza, o un amigo.\n✅ Infórmate sobre tus derechos y las opciones médicas.\n✅ Si te sientes abrumada, busca apoyo emocional. Hay muchas organizaciones que pueden ayudarte.\n\n**⚠️ Es importante que no te aísles. Hablar sobre esto te ayudará a procesar tus sentimientos y a tomar la mejor decisión para ti.**\n\n¿Has pensado en quién más podría apoyarte en este momento?\n\n---\n🗓️ **Hoy, 3:25 PM**\n\n🧑‍🦱 **Adolescente:** Mi mejor amiga sabe. Ella me está ayudando a investigar. Pero me siento muy sola y tengo miedo de la reacción de mis padres. Siento que los decepcioné.\n\n---\n🗓️ **Hoy, 3:30 PM**\n\n👩‍💼 **Consejera:** Es completamente normal sentir eso. 🎯 La reacción de tus padres es una de las mayores preocupaciones en estos casos, y el sentimiento de decepción es muy común.\n\n**Analicemos la situación:**\n• **Miedo a los padres** 💔 → Es un obstáculo para buscar apoyo familiar.\n• **Aislamiento** 😔 → Puede llevar a tomar decisiones sin toda la información.\n• **Sentimiento de decepción** 😥 → Afecta tu autoestima y tu capacidad de manejar la situación con calma.\n\n**Aquí tienes un plan de acción para los próximos días:**\n1. **Primer paso** 🤝: Podemos hablar en otra sesión sobre cómo y cuándo abordar el tema con tus padres, si así lo decides.\n2. **Infórmate** 📖: Juntas, podemos buscar información sobre clínicas, apoyo psicológico y opciones legales que existen para ti.\n3. **Red de apoyo** 🤗: Además de tu amiga, identifica a otro adulto de confianza que pueda acompañarte.\n4. **Cuidado personal** 🧘‍♀️: Asegúrate de comer y dormir bien. Cuidar de ti misma es lo más importante ahora.\n\nRecuerda, no estás sola en esto. El proceso de tomar una decisión es personal, y lo haremos a tu ritmo.\n\n¿Qué te parece si empezamos por agendar una siguiente cita para hablar más a fondo sobre cómo abordar la conversación con tus padres?"
    },
    {
      role: 'assistant',
      content: 'Hola?'
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