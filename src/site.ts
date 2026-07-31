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

/** Header CTA — the shop, standing in for the template's original booking link. */
export const CTA_URL = `${SITE}/supplements`

export const NAV_BAR: NavLink[] = [
  LINKS.shopAll,
  LINKS.bestsellers,
  LINKS.writers,
  LINKS.about,
]

export const NAV_DROPDOWNS: Record<string, NavLink[]> = {
  Resources: [LINKS.blog, LINKS.search, LINKS.faq, LINKS.contact],
}

export const MOBILE_LINKS: NavLink[] = [
  LINKS.shopAll,
  LINKS.bestsellers,
  LINKS.blog,
  LINKS.search,
  LINKS.writers,
  LINKS.about,
  LINKS.faq,
  LINKS.contact,
]
