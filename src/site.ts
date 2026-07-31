/**
 * The main site's navigation, mirrored so the two bars match.
 *
 * Same pattern as the site this app was ported from: one file of plain data,
 * mirroring the main site's Layout.tsx nav. Re-syncing is a diff of this file.
 *
 * Links to the main site are ABSOLUTE. The blog is reachable both at
 * 2ahealthylife.com/blog (proxied) and at cms.2ahealthylife.com directly,
 * and a root-relative "/about" would 404 on the second one. Blog-internal
 * links stay relative so they work on either host.
 */
export type NavLink = {
  label: string
  href: string
  note?: string
}

/**
 * The public site origin. Not the CMS's own URL: the blog answers on both
 * 2ahealthylife.com/blog (proxied) and cms.2ahealthylife.com, and only the
 * first one has a home page to link back to.
 */
export const SITE = 'https://2ahealthylife.com'

export const LINKS = {
  shopAll: { label: 'Shop All', href: `${SITE}/supplements` },
  bestsellers: { label: 'Bestsellers', href: `${SITE}/supplements?filter=bestseller` },
  writers: { label: 'Writers', href: `${SITE}/writers` },
  about: { label: 'Our Story', href: `${SITE}/about` },
  faq: { label: 'FAQ', href: `${SITE}/faq` },
  contact: { label: 'Contact', href: `${SITE}/contact` },

  blog: { label: 'Blog', href: '/blog' },

  /**
   * Blog-only. The main site's bar has no search, so this is the one
   * intentional difference between the two navs.
   */
  search: { label: 'Search articles', href: '/search' },
} satisfies Record<string, NavLink>

/**
 * The announcement bar above the header, mirroring the main site's. If the
 * offer changes there, re-sync this copy — it lives only here.
 */
export const ANNOUNCEMENT = {
  text: 'Free shipping on all orders over €50 —',
  linkLabel: 'Shop Now',
  href: `${SITE}/supplements`,
}

/** The 3-column header: links left and right of the centered wordmark. */
export const NAV_LEFT: NavLink[] = [LINKS.shopAll, LINKS.bestsellers]
export const NAV_RIGHT: NavLink[] = [LINKS.blog, LINKS.writers, LINKS.about]

export const MOBILE_LINKS: NavLink[] = [
  LINKS.shopAll,
  LINKS.bestsellers,
  LINKS.blog,
  LINKS.search,
  LINKS.writers,
  LINKS.about,
]

/**
 * Footer columns, mirroring the main site's Layout.tsx footer. The main site
 * lists its product categories under Shop from its catalog data; the blog
 * links the two shop entry points instead of duplicating the catalog.
 */
export const FOOTER_BLURB =
  'Thoughtfully formulated supplements for those who believe wellness is a daily practice, not a trend.'

export const FOOTER_SHOP: NavLink[] = [
  { label: 'All Supplements', href: `${SITE}/supplements` },
  LINKS.bestsellers,
]

export const FOOTER_COMPANY: NavLink[] = [
  { label: 'Journal', href: '/blog' },
  LINKS.about,
  LINKS.faq,
  LINKS.contact,
  { label: 'Shipping & Returns', href: `${SITE}/shipping-returns` },
  { label: 'Privacy Policy', href: `${SITE}/privacy-policy` },
  { label: 'Terms of Service', href: `${SITE}/terms-of-service` },
]

export const FOOTER_EMAIL = 'hello@2ahealthylife.com'

export const BUSINESS_DETAILS = [
  '2ahealthylife is a webstore of Spring Digital Commerce',
  '2810 North Church Street',
  'Wilmington, DE 19802',
  'EIN: 35-2886201',
]
