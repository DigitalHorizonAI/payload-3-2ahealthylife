// In-text pictures in the article API's contentHtml: Lexical `upload` nodes, which
// Payload leaves as bare media ids at any depth.
// Run: node --test tests/in-text-images.test.mjs
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { convertLexicalToHTMLAsync } from '@payloadcms/richtext-lexical/html-async'

// A namespace import, so a missing export fails its own tests instead of the whole file.
import * as I from '../src/lib/inTextImages.ts'

const SITE = 'https://site.example.test'

const media = (id, extra = {}) => ({
  id,
  url: `/api/media/file/p${id}.webp`,
  alt: `Picture ${id}`,
  mimeType: 'image/webp',
  width: 1408,
  height: 768,
  sizes: {
    thumbnail: { url: `/api/media/file/p${id}-300x164.webp`, width: 300 },
    square: { url: `/api/media/file/p${id}-500x500.webp`, width: 500 },
    small: { url: `/api/media/file/p${id}-600x327.webp`, width: 600 },
    medium: { url: `/api/media/file/p${id}-900x491.webp`, width: 900 },
    large: { url: `/api/media/file/p${id}-1400x764.webp`, width: 1400 },
    xlarge: { url: null, width: null },
  },
  ...extra,
})
const text = (t) => ({ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: t, version: 1 })
const para = (t) => ({ type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', children: [text(t)] })
const upload = (value) => ({ type: 'upload', version: 3, format: '', relationTo: 'media', value, fields: null })
const body = (...children) => ({
  root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children },
})
const between = (picture) => body(para('one'), upload(picture), para('two'))

// The real converter pipeline, with the endpoint's upload converter added.
const render = (content, docs, site = SITE) =>
  convertLexicalToHTMLAsync({
    converters: ({ defaultConverters }) => ({
      ...defaultConverters,
      upload: I.uploadConverter(docs, site),
    }),
    data: content,
  })
const imgs = (html) => html.match(/<img [^>]*>/g) ?? []
const withoutPictures = async () => render(body(para('one'), para('two')), [])

test('a bare id renders as a picture at its place between the paragraphs', async () => {
  const html = await render(between(916), [media(916)])
  const f = `${SITE}/api/media/file/p916`
  const pic =
    `<figure><img src="${f}.webp" srcset="${f}-600x327.webp 600w, ${f}-900x491.webp 900w, ` +
    `${f}-1400x764.webp 1400w, ${f}.webp 1408w" sizes="(max-width: 672px) 100vw, 672px" ` +
    'alt="Picture 916" width="1408" height="768" loading="lazy" decoding="async" /></figure>'
  assert.ok(html.includes(pic), html)
  assert.ok(html.indexOf('one') < html.indexOf('<figure>'), 'after the first paragraph')
  assert.ok(html.indexOf('</figure>') < html.indexOf('two'), 'before the second paragraph')
  assert.doesNotMatch(html, /500x500|300x164/, 'cropped and tiny variants stay out of srcset')
})

test('a populated media doc renders without being looked up', async () => {
  const html = await render(between(media(7)), [])
  assert.match(html, /<img src="https:\/\/site\.example\.test\/api\/media\/file\/p7\.webp"/)
})

test('deleted media (no doc for the id) renders nothing', async () => {
  assert.equal(await render(between(999), [media(916)]), await withoutPictures())
})

test('media without alt gets an empty alt', async () => {
  assert.match(await render(between(1), [media(1, { alt: null })]), / alt="" /)
})

test('alt text is escaped', async () => {
  const html = await render(between(1), [media(1, { alt: 'A "big" <b> & co' })])
  assert.match(html, / alt="A &quot;big&quot; &lt;b&gt; &amp; co" /)
})

test('a non-image upload, or one with no mimeType, renders nothing', async () => {
  const pdf = media(2, { mimeType: 'application/pdf', url: '/api/media/file/a.pdf', sizes: {} })
  assert.equal(await render(between(2), [pdf]), await withoutPictures())
  assert.equal(await render(between(3), [media(3, { mimeType: null })]), await withoutPictures())
})

test('only https or the site itself may serve the picture', async () => {
  for (const url of ['javascript:alert(1)', 'http://elsewhere.test/a.webp', 'data:image/png;base64,AAAA']) {
    assert.equal(await render(between(3), [media(3, { url, sizes: {} })]), await withoutPictures(), url)
  }
  const https = await render(between(4), [media(4, { url: 'https://files.example.test/a.webp', sizes: {} })])
  assert.deepEqual(imgs(https), [
    '<img src="https://files.example.test/a.webp" alt="Picture 4" width="1408" height="768" loading="lazy" decoding="async" />',
  ])
  // http on the site's own origin is fine (a local build).
  const local = await render(between(5), [media(5, { sizes: {} })], 'http://127.0.0.1:3000')
  assert.match(local, /<img src="http:\/\/127\.0\.0\.1:3000\/api\/media\/file\/p5\.webp"/)
})

test('a variant on a foreign http host is left out of srcset, not the picture', async () => {
  const doc = media(6)
  doc.sizes.medium = { url: 'http://elsewhere.test/m.webp', width: 900 }
  const html = await render(between(6), [doc])
  assert.doesNotMatch(html, /elsewhere/)
  assert.match(html, / 600w, \S+ 1400w, /)
})

test('uploadIds lists each unpopulated picture once, at any nesting', () => {
  const content = body(
    upload(916),
    para('x'),
    upload(media(9)),
    upload(916),
    { type: 'list', children: [{ type: 'listitem', children: [upload('917')] }] },
  )
  assert.deepEqual(I.uploadIds(content), [916, '917'])
  assert.deepEqual(I.uploadIds(null), [])
  assert.deepEqual(I.uploadIds(body(para('x'))), [])
})

test('readInTextImages makes one read for all ids and none for an article without pictures', async () => {
  const calls = []
  const find = async (ids) => (calls.push(ids), ids.map((id) => media(id)))
  const log = { error: () => assert.fail('no error expected') }
  assert.deepEqual(await I.readInTextImages([], find, log), [])
  const docs = await I.readInTextImages([916, 917, 918], find, log)
  assert.deepEqual(calls, [[916, 917, 918]])
  assert.equal(docs.length, 3)
})

test('a failed media read is logged and the article renders without those pictures', async () => {
  const errors = []
  const docs = await I.readInTextImages(
    [916],
    async () => {
      throw new Error('connection refused')
    },
    { error: (obj, msg) => errors.push([obj, msg]) },
  )
  assert.deepEqual(docs, [])
  assert.equal(errors.length, 1)
  assert.match(errors[0][0].err.message, /connection refused/)
  assert.equal(await render(between(916), docs), await withoutPictures())
})
