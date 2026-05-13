import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { HeartCursor } from '@/components/heart-cursor'
import { getSiteConfig } from '@/lib/site-data'

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:3000').replace(/\/$/, '')

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Illustrator Portfolio',
  description: 'A lovely portfolio showcasing webtoons, illustrations, and creative works',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { siteName, logoUrl } = getSiteConfig()

  return (
    <html lang="ko">
      <body className="font-sans antialiased">
        <HeartCursor />
        <Header siteName={siteName} logoUrl={logoUrl || undefined} />
        <main>
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}
