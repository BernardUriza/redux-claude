// src/app/layout.tsx
// Creado por Bernard Orozco
import { Providers } from './providers'
import './globals.css'

export const metadata = {
  title: 'Chat con Claude - Bernard Orozco',
  description: 'Una aplicación de chat con Claude usando Redux',
}

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