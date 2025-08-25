// src/app/providers.tsx
// Creado por Bernard Orozco
'use client'

import { Provider } from 'react-redux'
import { store } from '@redux-claude/cognitive-core'

export function Providers({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>
}
