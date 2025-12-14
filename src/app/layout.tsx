import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Inversión Real con Jorge - Aprende a Invertir en Bolsa',
  description: 'Cursos profesionales de inversión en bolsa y mercado de valores. Aprende estrategias reales de trading con Jorge.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
