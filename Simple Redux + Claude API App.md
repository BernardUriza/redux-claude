# 🤖 Simple Redux + Claude API App

## 📦 Proyecto Mínimo: Chat con Claude usando Redux

### 1. Setup Inicial (2 minutos)
```bash
# Crear proyecto
npx create-next-app@latest claude-redux --typescript --tailwind --app
cd claude-redux

# Instalar dependencias mínimas
npm install @reduxjs/toolkit react-redux @anthropic-ai/sdk
```

### 2. Estructura Simple (Solo 5 archivos)
```
/src
  /store
    store.ts          # Store de Redux
    chatSlice.ts      # Un solo slice
  /hooks
    useClaudeChat.ts  # Un hook custom
  /app
    page.tsx          # UI simple
    providers.tsx     # Provider de Redux
```

---

## 📝 Implementación Paso a Paso

### Paso 1: Store Redux (store.ts)
```typescript
// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit'
import chatReducer from './chatSlice'

export const store = configureStore({
  reducer: {
    chat: chatReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

### Paso 2: Slice Simple (chatSlice.ts)
```typescript
// src/store/chatSlice.ts
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
  messages: [],
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
```

### Paso 3: Hook Custom (useClaudeChat.ts)
```typescript
// src/hooks/useClaudeChat.ts
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/store/store'
import { addUserMessage, addAssistantMessage, setError } from '@/store/chatSlice'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_CLAUDE_API_KEY!,
  // IMPORTANTE: En producción, usar route handler para no exponer API key
  dangerouslyAllowBrowser: true 
})

export const useClaudeChat = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { messages, isLoading, error } = useSelector((state: RootState) => state.chat)

  const sendMessage = async (message: string) => {
    // 1. Agregar mensaje del usuario al store
    dispatch(addUserMessage(message))

    try {
      // 2. Llamar a Claude API
      const response = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307', // Modelo más económico
        max_tokens: 1024,
        messages: [
          ...messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          { role: 'user', content: message }
        ]
      })

      // 3. Agregar respuesta al store
      const assistantMessage = response.content[0].type === 'text' 
        ? response.content[0].text 
        : 'No se pudo procesar la respuesta'
      
      dispatch(addAssistantMessage(assistantMessage))
    } catch (error) {
      dispatch(setError('Error al conectar con Claude'))
      console.error(error)
    }
  }

  return {
    messages,
    isLoading,
    error,
    sendMessage
  }
}
```

### Paso 4: Provider Redux (providers.tsx)
```typescript
// src/app/providers.tsx
'use client'

import { Provider } from 'react-redux'
import { store } from '@/store/store'

export function Providers({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>
}
```

### Paso 5: UI Simple (page.tsx)
```typescript
// src/app/page.tsx
'use client'

import { useState } from 'react'
import { useClaudeChat } from '@/hooks/useClaudeChat'

export default function Home() {
  const [input, setInput] = useState('')
  const { messages, isLoading, error, sendMessage } = useClaudeChat()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      sendMessage(input)
      setInput('')
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chat con Claude</h1>
      
      {/* Mensajes */}
      <div className="border rounded-lg p-4 h-96 overflow-y-auto mb-4 bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-gray-500">Escribe algo para comenzar...</p>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`mb-3 ${msg.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block p-3 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white border'
              }`}>
                {msg.content}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="text-gray-500">Claude está pensando...</div>
        )}
        {error && (
          <div className="text-red-500">{error}</div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu mensaje..."
          className="flex-1 p-2 border rounded-lg"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
        >
          Enviar
        </button>
      </form>
    </div>
  )
}
```

### Paso 6: Layout con Provider
```typescript
// src/app/layout.tsx
import { Providers } from './providers'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

---

## 🔧 Configuración

### 1. Variables de Entorno
```bash
# .env.local
NEXT_PUBLIC_CLAUDE_API_KEY=sk-ant-api03-...
```

### 2. Para Mayor Seguridad (Route Handler)
```typescript
// src/app/api/claude/route.ts
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY! // Sin NEXT_PUBLIC
})

export async function POST(req: Request) {
  const { messages } = await req.json()
  
  const response = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 1024,
    messages
  })
  
  return NextResponse.json(response)
}
```

Y modificar el hook para usar el endpoint:
```typescript
// En useClaudeChat.ts
const response = await fetch('/api/claude', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages: [...] })
})
```

---

## 🚀 Para Ejecutar

```bash
# 1. Instalar dependencias
npm install

# 2. Agregar tu API key en .env.local
echo "NEXT_PUBLIC_CLAUDE_API_KEY=tu-api-key" > .env.local

# 3. Ejecutar
npm run dev

# 4. Abrir http://localhost:3000
```

---

## ✅ Qué Tienes Ahora

1. **Redux configurado** con un store simple
2. **Un slice** que maneja el estado del chat
3. **Un hook custom** que encapsula la lógica
4. **Conexión directa** a Claude API
5. **UI básica** funcional

## 🎯 Siguientes Mejoras Posibles

1. **Persistencia**: Guardar chats en localStorage
2. **Historial**: Múltiples conversaciones
3. **Streaming**: Respuestas en tiempo real
4. **Markdown**: Renderizar respuestas con formato
5. **System Prompt**: Personalizar comportamiento de Claude

¿Empezamos con esta versión simple?