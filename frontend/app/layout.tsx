import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { HeartCursor } from '@/components/heart-cursor'
import { createClient } from '@/lib/supabase/server'

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
  let siteName = "Portfolio"
  let siteLogoUrl = "/logo.png"

  try {
    const supabase = await createClient()
    const { data: settings } = await supabase.from("site_settings").select("site_name, hero_text, site_logo_url").single()
    if (settings) {
      if (settings.site_name) {
        siteName = settings.site_name
      } else if (settings.hero_text) {
        const parsed = JSON.parse(settings.hero_text)
        if (parsed.site_title) siteName = parsed.site_title
      }
      if (settings.site_logo_url) {
        siteLogoUrl = settings.site_logo_url
      }
    }
  } catch (e) {
    // ignore
  }

  return (
    <html lang="ko">
      <body className="font-sans antialiased">
        <HeartCursor />
        <Header siteName={siteName} logoUrl={siteLogoUrl} />
        <main>
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}
