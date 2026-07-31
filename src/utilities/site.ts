/**
 * Site identity, in one place.
 *
 * The template hardcoded its name across page titles, Open Graph defaults and
 * the SEO plugin, so renaming meant editing every one of them. Anything that
 * needs the site's name or description reads it from here instead.
 */
export const SITE = {
  name: '2ahealthylife',
  description: '2ahealthylife — evidence-based supplement guides and healthy living.',
  /**
   * Path to the default social sharing image, relative to the public origin.
   * Resolves to the main site's own default OG image (its hero), so shared
   * blog links carry the same art as the rest of 2ahealthylife.com.
   */
  defaultOGImage: '/hero-editorial.webp',
} as const
