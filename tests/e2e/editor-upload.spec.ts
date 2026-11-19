import type { APIRequestContext, Page } from '@playwright/test'

import { expect, test } from '@playwright/test'
import pg from 'pg'

import { adminAuthHeader } from './admin'
import { databaseURL } from './env'
import live from './fixtures/post-543.json' with { type: 'json' }

/**
 * Articles with in-text pictures must open, and save, in the admin editor.
 *
 * The app publishes articles as Lexical JSON with `upload` nodes holding a bare
 * numeric media id. Without an upload node type in the Posts editor, the
 * Content tab of such an article showed "Minified Lexical error #17" instead of
 * the text, so the body could not be read or edited at all.
 *
 * The seed is the stored body of a published article (fixtures/post-543.json,
 * 65 top-level nodes, 3 pictures). Its media ids are remapped, in order, to
 * media this spec uploads; nothing else in it changes.
 */

// 1x1 PNG.
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
)

type Node = { type?: string; value?: unknown; relationTo?: string; children?: Node[] }
type Content = { root: { children: Node[] } }

const uploadNodes = (content: Content): Node[] => {
  const found: Node[] = []
  const walk = (nodes: Node[] = []) => {
    for (const node of nodes) {
      if (node.type === 'upload') found.push(node)
      walk(node.children)
    }
  }
  walk(content.root.children)
  return found
}

/** The fixture with its picture and meta image ids replaced by `ids`, in order. */
const articleBody = (ids: number[], slug: string, valueOf = (id: number, _i: number): unknown => id) => {
  const body = structuredClone(live) as typeof live & { content: Content; meta: { image: unknown } }
  uploadNodes(body.content).forEach((node, i) => {
    node.value = valueOf(ids[i]!, i)
  })
  body.meta.image = ids[3]
  body.slug = slug
  return body
}

const query = async <T>(sql: string, params: unknown[]): Promise<T[]> => {
  const client = new pg.Client({ connectionString: databaseURL })
  await client.connect()
  try {
    return (await client.query(sql, params)).rows as T[]
  } finally {
    await client.end()
  }
}

/** The stored body of the post row and of its newest version row, straight from Postgres. */
const storedContent = async (id: number) => {
  const [post] = await query<{ content: Content }>('select content from posts where id = $1', [id])
  const [version] = await query<{ content: Content }>(
    'select version_content as content from _posts_v where parent_id = $1 order by id desc limit 1',
    [id],
  )
  return { post: post!.content, version: version!.content }
}

/** Key paths whose value differs between two JSON values. */
const changedPaths = (a: unknown, b: unknown, at = ''): string[] => {
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)])
    return [...keys].flatMap((k) =>
      changedPaths((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k], `${at}/${k}`),
    )
  }
  return JSON.stringify(a) === JSON.stringify(b) ? [] : [at || '/']
}

let adminAuth: string
const mediaIds: number[] = []
const postIds: number[] = []

test.beforeAll(async ({ request }) => {
  adminAuth = await adminAuthHeader(request)
  for (let i = 0; i < 4; i++) {
    const res = await request.post('/api/media', {
      headers: { Authorization: adminAuth },
      multipart: {
        file: { name: `editor-upload-e2e-${i}.png`, mimeType: 'image/png', buffer: PNG },
        _payload: JSON.stringify({ alt: `picture ${i}` }),
      },
    })
    expect(res.ok(), await res.text()).toBe(true)
    mediaIds.push((await res.json()).doc.id)
  }
})

test.afterAll(async ({ request }) => {
  const headers = { Authorization: adminAuth }
  for (const id of postIds) await request.delete(`/api/posts/${id}`, { headers })
  for (const id of mediaIds) await request.delete(`/api/media/${id}`, { headers })
})

const create = async (request: APIRequestContext, data: unknown, auth = adminAuth) => {
  const res = await request.post('/api/posts', { headers: { Authorization: auth }, data })
  if (res.ok()) postIds.push((await res.json()).doc.id)
  return res
}

const seed = async (request: APIRequestContext, slug: string) => {
  const res = await create(request, articleBody(mediaIds, slug))
  expect(res.status(), await res.text()).toBe(201)
  return (await res.json()).doc as { id: number; slug: string }
}

/** Opens the post in the admin and returns the editor once its text has rendered. */
const openEditor = async (page: Page, baseURL: string, id: number) => {
  await page
    .context()
    .addCookies([{ name: 'payload-token', value: adminAuth.replace('JWT ', ''), url: baseURL }])
  await page.goto(`/admin/collections/posts/${id}`)
  await page.waitForLoadState('networkidle')
  // Checked before the editor is looked up, so a red run names the fault.
  await expect(page.getByText(/Lexical error/)).toHaveCount(0)
  const editor = page.locator('[data-lexical-editor="true"]').first()
  await expect(editor).toBeVisible()
  return editor
}

// The editor's card around each picture node.
const CARD = '.LexicalEditorTheme__upload'

// First paragraph of the article, used to prove its text is on screen.
const FIRST_WORDS = 'Are you tired of tossing and turning'
// A one-line heading after the first picture: Enter at its end opens an empty paragraph.
const HEADING = "Why a Good Night's Sleep Feels More Elusive Than Ever"

test('the admin editor shows an article with in-text pictures', async ({ page, request, baseURL }, testInfo) => {
  const { id } = await seed(request, 'editor-upload-e2e-open')

  const writes: string[] = []
  page.on('request', (r) => {
    if (r.method() !== 'GET') writes.push(`${r.method()} ${r.url()}`)
  })

  const editor = await openEditor(page, baseURL!, id)
  await expect(editor.getByText(FIRST_WORDS).first()).toBeVisible()
  await expect(editor.locator(CARD)).toHaveCount(3)
  await expect(editor.locator(`${CARD} img`)).toHaveCount(3)

  // Untouched, the open page writes nothing.
  writes.length = 0
  await page.waitForTimeout(5000)
  expect(writes).toEqual([])

  await page.screenshot({ path: testInfo.outputPath('content-tab.png'), fullPage: true })
  const { post } = await storedContent(id)
  expect(uploadNodes(post).map((n) => n.value)).toEqual(mediaIds.slice(0, 3))
})

test('one typed character and one Publish keep every picture', async ({ page, request, baseURL }) => {
  const { id } = await seed(request, 'editor-upload-e2e-edit')
  const before = await storedContent(id)

  const editor = await openEditor(page, baseURL!, id)
  await editor.getByText(FIRST_WORDS).first().click()
  await page.keyboard.press('End')
  await page.keyboard.type('Z')

  const publish = page.getByRole('button', { name: 'Publish changes' })
  await expect(publish).toBeEnabled()
  const saved = page.waitForResponse(
    (r) => r.request().method() === 'PATCH' && /\/api\/posts\/\d+\?(?!.*autosave=true)/.test(r.url()),
  )
  await publish.click()
  expect((await saved).ok()).toBe(true)

  const after = await storedContent(id)
  for (const [where, content] of Object.entries(after)) {
    const nodes = uploadNodes(content)
    expect(nodes.map((n) => n.value), where).toEqual(mediaIds.slice(0, 3))
    expect(nodes.every((n) => n.relationTo === 'media'), where).toBe(true)
  }
  console.log(`[editor-upload] keys changed by the edit: ${JSON.stringify(changedPaths(before.post, after.post))}`)
  expect(JSON.stringify(after.post)).toContain('Z')
})

test('a picture inserted through the editor is stored as a media id', async ({ page, request, baseURL }) => {
  const { id } = await seed(request, 'editor-upload-e2e-insert')

  const editor = await openEditor(page, baseURL!, id)
  await editor.getByText(HEADING).first().click()
  await page.keyboard.press('End')
  await page.keyboard.press('Enter')
  await page.keyboard.type('/upload')
  await page.locator('#slash-menu-popup__item-upload').click()

  const drawer = page.locator('.drawer__content').last()
  // Files outlive a database reset, so the name may carry a -N suffix.
  await drawer.getByText(/^editor-upload-e2e-3(-\d+)?\.png$/).first().click()
  await expect(editor.locator(CARD)).toHaveCount(4)

  const saved = page.waitForResponse(
    (r) => r.request().method() === 'PATCH' && /\/api\/posts\/\d+\?(?!.*autosave=true)/.test(r.url()),
  )
  await page.getByRole('button', { name: 'Publish changes' }).click()
  expect((await saved).ok()).toBe(true)

  const { post, version } = await storedContent(id)
  for (const content of [post, version]) {
    expect(uploadNodes(content).map((n) => n.value)).toEqual([
      mediaIds[0],
      mediaIds[3],
      mediaIds[1],
      mediaIds[2],
    ])
  }
})

test('an article whose picture was deleted still opens in the editor', async ({ page, request, baseURL }) => {
  const res = await request.post('/api/media', {
    headers: { Authorization: adminAuth },
    multipart: {
      file: { name: 'editor-upload-e2e-gone.png', mimeType: 'image/png', buffer: PNG },
      _payload: JSON.stringify({ alt: 'gone' }),
    },
  })
  const gone: number = (await res.json()).doc.id
  const created = await create(request, articleBody([gone, ...mediaIds], 'editor-upload-e2e-gone'))
  expect(created.status(), await created.text()).toBe(201)
  const { id } = (await created.json()).doc
  expect((await request.delete(`/api/media/${gone}`, { headers: { Authorization: adminAuth } })).ok()).toBe(true)

  const editor = await openEditor(page, baseURL!, id)
  await expect(editor.getByText(FIRST_WORDS).first()).toBeVisible()
  // Three picture nodes, two of them with a file to show.
  await expect(editor.locator(CARD)).toHaveCount(3)
  await expect(editor.locator(`${CARD} img`)).toHaveCount(2)
})

test.describe('the app create', () => {
  let keyAuth: string

  test.beforeAll(async ({ request }) => {
    const keyValue = crypto.randomUUID()
    const client = await request.post('/api/apiClients', {
      headers: { Authorization: adminAuth },
      data: { name: 'editor upload spec', enableAPIKey: true, apiKey: keyValue },
    })
    expect(client.ok(), 'mint api key').toBe(true)
    keyAuth = `apiClients API-Key ${keyValue}`
  })

  test('is accepted and stored exactly as sent', async ({ request }) => {
    const body = articleBody(mediaIds, 'editor-upload-e2e-app')
    const res = await create(request, body, keyAuth)
    expect(res.status(), await res.text()).toBe(201)
    const { id, slug } = (await res.json()).doc

    const { post, version } = await storedContent(id)
    expect(changedPaths(body.content, post)).toEqual([])
    expect(changedPaths(body.content, version)).toEqual([])

    const article = await request.get(`/api/articles/${slug}`)
    expect(article.status()).toBe(200)
    expect((await article.json()).contentHtml.match(/<img /g)).toHaveLength(3)

    // What the key reads back at the default depth is what it may send back.
    const read = await request.get(`/api/posts/${id}?depth=2`, { headers: { Authorization: keyAuth } })
    const readBack = (await read.json()).content as Content
    expect(uploadNodes(readBack).map((n) => n.value)).toEqual(mediaIds.slice(0, 3))
    const update = await request.patch(`/api/posts/${id}`, {
      headers: { Authorization: keyAuth },
      data: { content: readBack },
    })
    expect(update.status(), await update.text()).toBe(200)
    expect(changedPaths(body.content, (await storedContent(id)).post)).toEqual([])
  })

  test('refuses a picture whose id is not a number', async ({ request }) => {
    const slug = 'editor-upload-e2e-string-id'
    const res = await create(
      request,
      articleBody(mediaIds, slug, (id, i) => (i === 1 ? String(id) : id)),
      keyAuth,
    )
    expect(res.status()).toBe(400)
    expect(await query('select id from posts where slug = $1', [slug])).toHaveLength(0)

    const again = await create(request, articleBody(mediaIds, slug), keyAuth)
    expect(again.status(), await again.text()).toBe(201)
  })

  test('turns a Markdown picture placeholder into a picture', async ({ request }) => {
    const res = await create(
      request,
      {
        title: 'EDITOR UPLOAD E2E markdown',
        slug: 'editor-upload-e2e-markdown',
        _status: 'published',
        content: `## Heading\n\nBefore.\n\n![media:${mediaIds[0]}]()\n\nAfter.\n`,
      },
      keyAuth,
    )
    expect(res.status(), await res.text()).toBe(201)
    const { post } = await storedContent((await res.json()).doc.id)
    expect(uploadNodes(post)).toMatchObject([{ value: mediaIds[0], relationTo: 'media' }])
  })
})
