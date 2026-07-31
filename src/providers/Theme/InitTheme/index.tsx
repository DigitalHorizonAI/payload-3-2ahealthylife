import Script from 'next/script'
import React from 'react'

import { defaultTheme } from '../ThemeSelector/types'

// Runs before paint purely to lift the `html { opacity: 0 }` guard in
// globals.css. The blog is light-only to match digital-horizon.io, so there is
// nothing to detect — keep in sync with the provider in ../index.tsx.
export const InitTheme: React.FC = () => {
  return (
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document
    <Script
      dangerouslySetInnerHTML={{
        __html: `
  (function () {
    document.documentElement.setAttribute('data-theme', '${defaultTheme}')
  })();
  `,
      }}
      id="theme-script"
      strategy="beforeInteractive"
    />
  )
}
