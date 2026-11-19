import type { FieldHook, RichTextField } from 'payload'

import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { APIError } from 'payload'

// GetRanked's Payload connector can only emit a Markdown or HTML *string*, but
// `content` is a Lexical richText field — a string fails validation with the
// misleading "This field is required." Convert Markdown on the way in.
//
// Set Content format = Markdown in the GetRanked connection settings. HTML is
// deliberately rejected rather than supported: convertHTMLToLexical needs a
// JSDOM instance, and pulling a full DOM implementation into the Next server
// to parse strings a dropdown can avoid producing is not worth it.
//
// This hook is a no-op the moment their connector learns to send Lexical, and a
// no-op for the admin panel, because it only fires on a string.

// Block-level closing tags. Markdown legitimately contains inline HTML, so only
// these count as "this is an HTML document, not Markdown".
const LOOKS_LIKE_HTML = /<\/(p|div|h[1-6]|ul|ol|li|article|section|table)>/i

// The editor's picture placeholder is `![media:<id>]()`, but its pattern also
// matches any empty-link image whose alt has a colon (`![Figure 1: chart]()`),
// and as a picture that fails the whole create. Only media:<digits> is a
// placeholder. In any other match the colons are swapped for a private-use
// character the pattern cannot see, then put back, so the line stays the
// exact text it was. (The pattern is not anchored: escaping the `!` does not
// stop it.)
const PLACEHOLDER_LIKE = /!\[([^\]:]+):([^\]]+)\]\(\)/g
const STAND_IN = '\uE000'
const hideNonPictureColons = (markdown: string) =>
  markdown.replace(PLACEHOLDER_LIKE, (match, relationTo: string, id: string) =>
    relationTo === 'media' && /^\d+$/.test(id) ? match : match.replaceAll(':', STAND_IN),
  )
const restoreColons = <T>(state: T): T =>
  JSON.parse(JSON.stringify(state).replaceAll(STAND_IN, ':')) as T

export const ingestMarkdownContent: FieldHook = ({ field, value }) => {
  if (typeof value !== 'string') return value

  const markdown = value.trim()
  if (!markdown) return value

  if (LOOKS_LIKE_HTML.test(markdown)) {
    throw new APIError(
      'content arrived as HTML. Set Content format to "Markdown" in the GetRanked connection settings.',
      400,
    )
  }

  // fromField, NOT editorConfigFactory.default — `default` resolves to the
  // config-level `defaultLexical` (five features, no headings), which would
  // silently drop every heading and list. fromField uses this field's own
  // editor, which includes headings, lists, links and blockquotes.
  return restoreColons(
    convertMarkdownToLexical({
      editorConfig: editorConfigFactory.fromField({ field: field as RichTextField }),
      markdown: hideNonPictureColons(markdown),
    }),
  )
}
