'use client'
import React, { useEffect } from 'react'

/**
 * The soft blue glow that trails the pointer on digital-horizon.io.
 *
 * The position is lerped rather than set straight from the event, so the glow
 * lags the cursor slightly instead of snapping. The rAF loop cancels itself
 * once the glow has caught up, so an idle page runs no frames at all.
 */
export const CursorGlow: React.FC = () => {
  useEffect(() => {
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !window.matchMedia('(pointer: fine)').matches
    ) {
      return
    }

    const root = document.documentElement
    let x = -600
    let y = -600
    let tx = -600
    let ty = -600
    let raf = 0

    const tick = () => {
      x += (tx - x) * 0.14
      y += (ty - y) * 0.14
      root.style.setProperty('--mx', `${x}px`)
      root.style.setProperty('--my', `${y}px`)
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(tick) : 0
    }

    const onMove = (e: MouseEvent) => {
      tx = e.clientX
      ty = e.clientY
      if (!raf) raf = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove, { passive: true })

    return () => {
      window.removeEventListener('mousemove', onMove)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return <div aria-hidden="true" className="dh-cursor-glow" />
}
