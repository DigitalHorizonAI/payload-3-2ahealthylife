'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { BrandLogo } from './BrandLogo'
import { CTA_URL, MOBILE_LINKS, NAV_BAR, NAV_DROPDOWNS, SITE } from '@/site'

/**
 * The marketing site's nav, ported from
 * website-digital-horizon/src/sections/Nav.tsx. Same markup, same class names,
 * same CSS (see nav.css) — so the two bars are identical rather than similar.
 *
 * It renders the marketing bar's default state: links, dropdowns and the CTA
 * all visible, with only the frosted `scrolled` background reacting to scroll.
 * The marketing site also has a `past-hero` state that collapses the bar to
 * logo + MENU once you scroll past its hero; the blog has no hero and does not
 * use it, so it has no side drawer either.
 *
 * Two deliberate differences from the port:
 *
 * - The CTA is "Shop Now", a plain absolute link to the main site's shop —
 *   this site sells products, the template's original booked calls.
 * - The dropdown labels are <button>s, not <span>s, so they toggle on click
 *   and Enter as well as opening on hover. The marketing site's are hover-only
 *   <span>s, which leaves everything behind them — Search, Case studies,
 *   Integrations, Security, Careers, Contact — unreachable without a mouse.
 *   That is a defect there too, but it lives in another repo.
 */
export const HeaderClient: React.FC = () => {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState<string | null>(null)
  const [panelVisible, setPanelVisible] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
    setMenu(null)
  }, [pathname])

  useEffect(() => {
    if (!menu) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menu])

  const closeMenu = () => setMenu(null)

  const openMenu = (key: string) => {
    setMenu(key)
    setPanelVisible(true)
  }

  return (
    <header
      className={`nav ${scrolled ? 'scrolled' : ''} ${open ? 'open' : ''} ${panelVisible ? 'drop-open' : ''}`}
      onMouseLeave={closeMenu}
      // A dropdown opened by keyboard has to close when the caret leaves the
      // bar entirely, or it hangs open over the article behind it.
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) closeMenu()
      }}
    >
      <div className="nav-bar">
        <a href={SITE} aria-label="2ahealthylife home" style={{ display: 'inline-flex' }}>
          <BrandLogo height={24} />
        </a>
        <nav className="nav-links">
          {NAV_BAR.map((l) => (
            <a key={l.label} href={l.href}>
              {l.label}
            </a>
          ))}
          {Object.keys(NAV_DROPDOWNS).map((key) => (
            <span key={key} className="nav-drop" onMouseEnter={() => openMenu(key)}>
              <button
                type="button"
                className={`nav-drop-label ${menu === key ? 'active' : ''}`}
                aria-expanded={menu === key}
                onClick={() => (menu === key ? closeMenu() : openMenu(key))}
              >
                {key} <span className="nav-caret">▾</span>
              </button>
            </span>
          ))}
        </nav>
        <a
          className="btn btn-primary btn-sm nav-cta"
          href={CTA_URL}
        >
          Shop Now
        </a>
        <button
          className={`nav-burger ${open ? 'open' : ''}`}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span />
          <span />
        </button>
      </div>
      <AnimatePresence onExitComplete={() => setPanelVisible(false)}>
        {menu && (
          <motion.div
            className="nav-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="nav-panel-inner sheet-bg">
              {(NAV_DROPDOWNS[menu] ?? []).map((it) =>
                // Blog-internal destinations stay client-side; the marketing
                // ones are another origin and have to be a full load.
                it.href.startsWith('/') ? (
                  <Link key={it.label} href={it.href} onClick={closeMenu}>
                    {it.label}
                    {it.note && <em>{it.note}</em>}
                  </Link>
                ) : (
                  <a key={it.label} href={it.href} onClick={closeMenu}>
                    {it.label}
                    {it.note && <em>{it.note}</em>}
                  </a>
                ),
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {open && (
          <motion.nav
            className="nav-mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="nav-mobile-inner">
              {MOBILE_LINKS.map((l) => (
                <a key={l.label} href={l.href} onClick={() => setOpen(false)}>
                  {l.label}
                </a>
              ))}
              <a
                className="btn btn-primary"
                href={CTA_URL}
                onClick={() => setOpen(false)}
              >
                Shop Now
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
