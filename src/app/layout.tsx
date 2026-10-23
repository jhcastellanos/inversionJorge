import './globals.css'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import ReferralCapture from '../components/ReferralCapture'
import { PlatformPreferencesProvider } from '../components/platform/PlatformPreferencesProvider'

export const metadata: Metadata = {
  title: 'Inversión Real con Jorge y Guille - Aprende a Invertir en Bolsa',
  description: 'Cursos profesionales de inversión en bolsa y mercado de valores. Aprende estrategias reales de trading con Jorge y Guille.',
}

const themeBootstrap = `(function(){try{var t=localStorage.getItem('platform-theme')||localStorage.getItem('platform-admin-theme');if(t==='dark')document.documentElement.classList.add('dark');var l=localStorage.getItem('platform-locale');if(l==='en'||l==='es')document.documentElement.lang=l;}catch(e){}})();`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>
        <PlatformPreferencesProvider>
          <Suspense fallback={null}>
            <ReferralCapture />
          </Suspense>
          {children}
        </PlatformPreferencesProvider>
      </body>
    </html>
  )
}
