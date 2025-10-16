// src/app/layout.tsx
// Creado por Bernard Orozco
import { Providers } from './providers'
import './globals.css'

export const metadata = {
  title: 'Redux Brain Medical AI',
  description: 'AI-powered medical assistant with SOAP notes and urgency detection',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover',
  themeColor: '#111827',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Medical AI',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
