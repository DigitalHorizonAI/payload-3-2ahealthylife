'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import React from 'react'

/**
 * The main site's wordmark. 2ahealthylife renders its logo as text
 * (see seo-2ahealthylife/src/components/Layout.tsx), so this does too —
 * no image asset needed. The scroll-progress bar underneath is kept from
 * the ported header.
 */
export function BrandLogo({ height = 24 }: { height?: number }) {
  const { scrollYProgress } = useScroll()
  const progress = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    <span className="brand-logo">
      <span
        style={{
          fontSize: height * 0.75,
          lineHeight: `${height}px`,
          fontWeight: 600,
          letterSpacing: '0.08em',
        }}
      >
        2AHEALTHYLIFE
      </span>
      <span className="brand-logo-track" aria-hidden="true">
        <motion.span className="brand-logo-fill" style={{ width: progress }} />
      </span>
    </span>
  )
}
