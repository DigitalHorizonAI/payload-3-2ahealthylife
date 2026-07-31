import type { Metadata } from 'next/types'
import { SITE } from '@/utilities/site'
import { getPublicSiteURL } from '@/utilities/getURL'

import { BlogSheet } from '@/components/BlogSheet'
import { CollectionArchive } from '@/components/CollectionArchive'
import { Reveal } from '@/components/Motion/Reveal'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
    },
  })

  return (
    <div className="pb-28 pt-10 md:pt-14">
      <PageClient />
      <div className="container mb-14">
        <BlogSheet>
          <Reveal as="p" className="dh-kicker">
            Insights
          </Reveal>
          <Reveal as="h1" className="dh-display mt-5 text-[clamp(44px,6.6vw,88px)]" delay={1}>
            The <strong>2ahealthylife</strong> blog
          </Reveal>
          <Reveal as="p" className="dh-lead mt-6" delay={2}>
            Notes on AI automation, voice agents and the systems we build for growing businesses.
          </Reveal>
          <Reveal className="dh-pill mt-8" delay={3}>
            <span className="dh-pulse-dot" />
            Writing from live client work
          </Reveal>
        </BlogSheet>
      </div>

      <div className="container mb-8">
        <PageRange
          collection="posts"
          currentPage={posts.page}
          limit={12}
          totalDocs={posts.totalDocs}
        />
      </div>

      <CollectionArchive featured posts={posts.docs} />

      <div className="container">
        {posts.totalPages > 1 && posts.page && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `${SITE.name} Blog`,
    // The listing had no description at all — search results fell back to
    // whatever Google scraped off the page.
    description: SITE.description,
    // Articles already emit a canonical; the listing did not, so the CMS host
    // and the public host looked like two copies of the same page to Google.
    alternates: {
      canonical: `${getPublicSiteURL()}/blog`,
    },
  }
}
