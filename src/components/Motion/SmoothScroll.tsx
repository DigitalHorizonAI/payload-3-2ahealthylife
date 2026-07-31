'use client'
import Lenis from 'lenis'
import React, { useEffect } from 'react'

/**
 * The same smooth scrolling digital-horizon.io runs — Lenis at its only
 * setting, lerp 0.1.
 *
 * Lenis rather than a hand-rolled wheel listener: it leaves touch, keyboard
 * and anchor jumps alone, where hijacking `wheel` with preventDefault breaks
 * trackpad momentum and find-in-page.
 */
export const SmoothScroll: React.FC = () => {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({ lerp: 0.1 })
    let raf = 0

    const tick = (time: number) => {
      lenis.raf(time)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
    }
  }, [])

  return null
}
