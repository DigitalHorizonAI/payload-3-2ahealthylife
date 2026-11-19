/**
 * In-text pictures: Lexical `upload` nodes in an article body.
 *
 * The Posts editor registers no UploadFeature, so Payload never populates
 * these nodes: the value stays a bare media id at any depth, and the stock
 * `upload` converter renders nothing for a bare id. The endpoint reads every
 * picture of an article in one media query and renders them with this.
 *
 * No `@/` imports, so `node --test` can load it directly.
 */

/** The media fields a picture needs (a subset of the Media collection). */
export type MediaDoc = {
  id: number | string
  url?: string | null
  alt?: string | null
  mimeType?: string | null
  width?: number | null
  height?: number | null
  sizes?: Record<string, { url?: string | null; width?: number | null } | null | undefined> | null
}

type Node = { type?: string; value?: unknown; children?: Node[] }

/**
 * The media id an `upload` node points at. An object value is reduced to its
 * id: the doc itself is always taken from the media read, never from the
 * content JSON, whose fields go into HTML attributes.
 */
const idOf = (value: unknown): number | string | undefined => {
  const id = value && typeof value === 'object' ? (value as { id?: unknown }).id : value
  return typeof id === 'number' || typeof id === 'string' ? id : undefined
}

/** Unique media ids of every `upload` node, at any nesting. */
export const uploadIds = (content: unknown): (number | string)[] => {
  const ids = new Set<number | string>()
  const walk = (nodes: Node[] | undefined) => {
    for (const node of nodes ?? []) {
      const id = node.type === 'upload' ? idOf(node.value) : undefined
      if (id !== undefined) ids.add(id)
      walk(node.children)
    }
  }
  walk((content as { root?: Node } | null | undefined)?.root?.children)
  return [...ids]
}

/**
 * The one media read for an article. A failed read is logged and the article
 * is served without those pictures: the consumers are a live site and edge
 * functions, where a 500 would take the whole article down.
 */
export const readInTextImages = async (
  ids: (number | string)[],
  find: (ids: (number | string)[]) => Promise<MediaDoc[]>,
  log: { error: (obj: unknown, msg?: string) => void },
): Promise<MediaDoc[]> => {
  if (!ids.length) return []
  try {
    return await find(ids)
  } catch (err) {
    log.error({ err, ids }, 'articles: in-text picture read failed, serving the article without them')
    return []
  }
}

// Variants with the original's aspect ratio; thumbnail is too small to be
// worth listing and square is cropped.
const SRCSET_SIZES = ['small', 'medium', 'large', 'xlarge']

/** The site's article column is max-w-2xl (672px). */
const IMG_SIZES = '(max-width: 672px) 100vw, 672px'

/** A positive whole pixel count, or undefined: nothing else reaches an attribute. */
const px = (n: unknown): number | undefined => {
  const v = Number(n)
  return Number.isFinite(v) && v > 0 ? Math.round(v) : undefined
}

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * The `upload` converter over media docs read up front. Renders nothing for
 * deleted media, a non-image upload, or a URL that is neither https nor the
 * site's own origin (http on a local build). URLs are built on the public
 * site URL, which proxies /api/media: the site's own image filter replaces
 * any other host.
 */
export const uploadConverter = (docs: MediaDoc[], siteURL: string) => {
  const byId = new Map(docs.map((d) => [String(d.id), d]))
  const own = new URL(siteURL).origin
  const safe = (url: string | null | undefined): string | null => {
    if (!url) return null
    try {
      const u = new URL(url, siteURL)
      return u.protocol === 'https:' || u.origin === own ? u.toString() : null
    } catch {
      return null
    }
  }

  return async ({ node }: { node: { value?: unknown } }): Promise<string> => {
    const id = idOf(node.value)
    const doc = id === undefined ? undefined : byId.get(String(id))
    if (!doc || typeof doc.mimeType !== 'string' || !doc.mimeType.startsWith('image/')) return ''
    const url = safe(doc.url)
    if (!url) return ''

    const candidates = [
      ...SRCSET_SIZES.map((name) => doc.sizes?.[name]).map((s) => ({ url: safe(s?.url), width: px(s?.width) })),
      { url, width: px(doc.width) },
    ].filter((c): c is { url: string; width: number } => !!c.url && !!c.width)
    const width = px(doc.width)
    const height = px(doc.height)

    const attrs = [`src="${escape(url)}"`]
    if (candidates.length > 1) {
      attrs.push(
        `srcset="${escape(candidates.map((c) => `${c.url} ${c.width}w`).join(', '))}"`,
        `sizes="${IMG_SIZES}"`,
      )
    }
    attrs.push(`alt="${escape(doc.alt ?? '')}"`)
    if (width && height) attrs.push(`width="${width}"`, `height="${height}"`)
    attrs.push('loading="lazy"', 'decoding="async"')
    return `<figure><img ${attrs.join(' ')} /></figure>`
  }
}
