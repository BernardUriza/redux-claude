// src/app/providers.tsx
// Creado por Bernard Orozco
'use client'

import { Provider } from 'react-redux'
import { store } from '@/store/store'

export function Providers({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>
}