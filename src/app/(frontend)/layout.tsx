import type { Metadata } from 'next'

import { cn } from 'src/utilities/cn'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { Providers } from '@/providers'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'

import './globals.css'
// Ported verbatim from the marketing site; must load after globals.css so its
// nav rules win over Tailwind's utilities where the two overlap.
import './nav.css'
import { getServerSideURL } from '@/utilities/getURL'

// The same two families 2ahealthylife.com loads, so the blog reads as one
// site: Cormorant Garamond for headings, DM Sans for everything else.
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-cormorant',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  return (
    <html className={cn(cormorant.variable, dmSans.variable)} lang="en" suppressHydrationWarning>
      <head>
        <link href="/brand/favicon-dark.png" rel="icon" type="image/png" />
        {/* The reveal animation starts from opacity 0, so without JavaScript
            there would be nothing to un-hide it. Cheaper and more reliable
            than a blocking script, and it degrades to "just show everything". */}
        <noscript>
          <style>{`.fade-in { opacity: 1 !important; transform: none !important; }`}</style>
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
