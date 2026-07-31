import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
  /**
   * Which background the logo sits on. The wordmark is text, so this is just
   * a color flip: `onDark` forces white for surfaces that stay dark in both
   * themes (the footer).
   */
  variant?: 'auto' | 'onDark'
}

export const Logo = (props: Props) => {
  const { className, variant } = props

  return (
    <span
      className={clsx(
        'text-2xl font-semibold tracking-[0.08em]',
        variant === 'onDark' && 'text-white',
        className,
      )}
    >
      2AHEALTHYLIFE
    </span>
  )
}
