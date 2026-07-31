import type { Metadata } from 'next'

import { cn } from 'src/utilities/cn'
import { Space_Mono, Urbanist } from 'next/font/google'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { CursorGlow } from '@/components/Motion/CursorGlow'
import { SmoothScroll } from '@/components/Motion/SmoothScroll'
import { Providers } from '@/providers'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'

import 'lenis/dist/lenis.css'
import './globals.css'
// Ported verbatim from the marketing site; must load after globals.css so its
// nav rules win over Tailwind's utilities where the two overlap.
import './nav.css'
import { getServerSideURL } from '@/utilities/getURL'

// The same two families digital-horizon.io loads, so the blog reads as one site:
// Urbanist for everything, Space Mono for eyebrows and labels.
const urbanist = Urbanist({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
  display: 'swap',
})

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  return (
    <html className={cn(urbanist.variable, spaceMono.variable)} lang="en" suppressHydrationWarning>
      <head>
        <link href="/brand/favicon-dark.png" rel="icon" type="image/png" />
        {/* The reveal animation starts from opacity 0, so without JavaScript
            there would be nothing to un-hide it. Cheaper and more reliable
            than a blocking script, and it degrades to "just show everything". */}
        <noscript>
          <style>{`.dh-reveal { opacity: 1 !important; transform: none !important; }`}</style>
        </noscript>
      </head>
      <body>
        <Providers>
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />
          <LivePreviewListener />

          {/* Option C's motion layer. Both no-op under prefers-reduced-motion,
              and the page reads fine without them. Reveals are per-element —
              see components/Motion/Reveal. */}
          <CursorGlow />
          <SmoothScroll />

          <Header />
          {/* The bar is position:fixed, so content has to clear it. */}
          <div className="dh-nav-offset">{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
  },
}
