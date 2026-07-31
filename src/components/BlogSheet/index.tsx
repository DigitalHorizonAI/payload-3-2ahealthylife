import { cn } from '@/utilities/cn'
import React from 'react'

/**
 * The dotted panel from digital-horizon.io: drifting halftone dots, a roaming
 * blue-dot scanner and three blurred blobs behind whatever is passed in.
 *
 * Used by the blog listing hero and the article hero, so the panel is defined
 * once. All the motion lives in globals.css — this is a server component.
 */
export const BlogSheet: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => (
  <section className={cn('dh-sheet', className)}>
    <div aria-hidden="true" className="dh-blobs">
      <div className="dh-blob dh-blob-a" />
      <div className="dh-blob dh-blob-b" />
      <div className="dh-blob dh-blob-c" />
    </div>
    <div className="dh-sheet-inner">{children}</div>
  </section>
)
