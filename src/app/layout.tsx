import type { Metadata, Viewport } from 'next'
import { Instrument_Serif, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import { ServiceWorkerRegister } from '@/components/sw-register'
import './globals.css'

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-instrument',
  display: 'swap',
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#E8A230',
}

export const metadata: Metadata = {
  title: 'SomarHelp — LinkedIn Content Automation',
  description: 'Automatización de contenido LinkedIn para B2B, potenciada por IA',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SomarHelp',
  },
  icons: {
    icon: [
      { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="es"
      className={`${instrumentSerif.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-bg">
        {/* Ambient glow spheres */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="glow-amber w-[600px] h-[600px] -top-[200px] -right-[200px] absolute" />
          <div className="glow-blue w-[500px] h-[500px] top-[40%] -left-[150px] absolute" />
          <div className="glow-amber w-[400px] h-[400px] bottom-[10%] right-[20%] absolute opacity-50" />
        </div>
        <div className="relative z-10 pb-16 lg:pb-0">
          {children}
        </div>
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
