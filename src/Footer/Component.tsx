import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import type { Footer } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import { SITE } from '@/utilities/site'

// Light footer with a hairline rule, matching digital-horizon.io's .footer —
// the template's black bar read as a different site. The theme switcher is gone
// with it: the site is light-only.
export async function Footer() {
  const footer: Footer = await getCachedGlobal('footer', 1)()

  const navItems = footer?.navItems || []

  return (
    <footer className="pt-14 pb-10">
      <div className="container">
        <div className="flex flex-wrap items-start justify-between gap-10">
          <div className="flex flex-col gap-4">
            <Link className="flex items-center" href="/">
              <Logo />
            </Link>
            <p className="max-w-[280px] text-sm leading-relaxed text-muted-foreground">
              {SITE.description}
            </p>
          </div>

          <nav className="flex flex-col gap-3 text-sm">
            {navItems.map(({ link }, i) => {
              return (
                <CMSLink
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  key={i}
                  {...link}
                />
              )
            })}
          </nav>
        </div>

        <div className="mt-14 flex flex-wrap justify-between gap-4 border-t border-border pt-6 text-xs font-medium text-muted-foreground">
          <span>
            © {new Date().getFullYear()} {SITE.name}
          </span>
          <a
            className="transition-colors hover:text-foreground"
            href="https://2ahealthylife.com"
            rel="noreferrer"
          >
            2ahealthylife.com
          </a>
        </div>
      </div>
    </footer>
  )
}
