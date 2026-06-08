import './globals.css'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import ReferralCapture from '../components/ReferralCapture'

export const metadata: Metadata = {
  title: 'Inversión Real con Jorge y Guille - Aprende a Invertir en Bolsa',
  description: 'Cursos profesionales de inversión en bolsa y mercado de valores. Aprende estrategias reales de trading con Jorge y Guille.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <Suspense fallback={null}>
          <ReferralCapture />
        </Suspense>
        {children}
      </body>
    </html>
  )
}
