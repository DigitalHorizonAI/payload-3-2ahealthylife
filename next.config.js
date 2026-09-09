import { withPayload } from '@payloadcms/next/withPayload'
import path from 'path'

import redirects from './redirects.js'

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL /* 'https://example.com' */].map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', ''),
        }
      }),
    ],
  },
  sassOptions: {
    includePaths: [path.join(process.cwd(), 'node_modules')],
  },
  reactStrictMode: true,
  redirects,
  /**
   * Media responses carry no Cache-Control at all, so every article image is
   * re-fetched from Railway on every view and Lighthouse scores the LCP image
   * at cacheLifetimeMs: 0. MEASURED 9 Sep 2026:
   *
   *   curl -I https://2ahealthylife.com/api/media/file/<hero>.webp
   *     -> 200, no Cache-Control, Cache-Status: "Netlify Edge"; fwd=miss
   *   curl -I https://2ahealthylife.com/assets/index-XMQcnWqa.js   (control)
   *     -> 200, Cache-Control: public,max-age=31536000,immutable, ... stored
   *
   * ⛔ The front-ends already TRY to fix this and cannot. Both
   * seo-2ahealthylife/netlify.toml:86-89 and heelgezondeten/netlify.toml:195-197
   * declare exactly this header for /api/media/*, and it is inert: Netlify's
   * [[headers]] do not apply to a proxied 200-rewrite, only to files Netlify
   * serves itself. The control request above is the proof — same site, same
   * config, header present on the direct asset and absent on the proxy. The
   * header can only come from this origin.
   *
   * withPayload awaits and spreads this function's result before appending its
   * own rules (@payloadcms/next withPayload.js:91-93), so it is not dropped.
   *
   * ⚠ `immutable` is a real commitment: an image REPLACED at the same filename
   * would be served stale for a year. Payload suffixes on filename collision,
   * so this is the same bet the two front-ends already made deliberately — but
   * it is a bet. Re-uploading under a new name is the safe edit.
   */
  headers: async () => [
    {
      source: '/api/media/file/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
  ],
  /**
   * Static generation runs one worker per CPU, and every worker opens its own
   * Postgres pool. On a build machine reporting 17 CPUs that is 17 pools
   * competing with the running site for connections, and the build dies with
   * "sorry, too many clients already" partway through the article pages.
   * Capping the workers bounds the connection count; with hundreds of pages
   * the build is bound by the database anyway, not by CPU.
   */
  experimental: {
    cpus: 2,
  },
}

export default withPayload(nextConfig)
