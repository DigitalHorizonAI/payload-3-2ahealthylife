import { formatDateTime } from 'src/utilities/formatDateTime'
import React from 'react'

import type { Post } from '@/payload-types'

import { BlogSheet } from '@/components/BlogSheet'
import { Media } from '@/components/Media'
import { Reveal } from '@/components/Motion/Reveal'

export const PostHero: React.FC<{
  post: Post
}> = ({ post }) => {
  const { categories, meta: { image: metaImage } = {}, populatedAuthors, publishedAt, title } = post

  // Option C's article header: category, headline and byline all inside the
  // dotted blue sheet — the treatment Bas signed off on ("the title and the
  // writer within the blue background"). The cover image sits below it as a
  // rounded card rather than full-bleed behind the sticky nav.
  return (
    <div className="pt-10 md:pt-14">
      <div className="container">
        <BlogSheet>
          {categories && categories.length > 0 && (
            <Reveal as="p" className="dh-kicker">
              {categories.map((category, index) => {
                if (typeof category === 'object' && category !== null) {
                  const { title: categoryTitle } = category

                  const titleToUse = categoryTitle || 'Untitled category'

                  const isLast = index === categories.length - 1

                  return (
                    <React.Fragment key={index}>
                      {titleToUse}
                      {!isLast && <React.Fragment>, &nbsp;</React.Fragment>}
                    </React.Fragment>
                  )
                }
                return null
              })}
            </Reveal>
          )}

          <Reveal
            as="h1"
            className="dh-display mt-5 max-w-[20ch] text-[clamp(36px,5.2vw,64px)]"
            delay={1}
          >
            {title}
          </Reveal>

          <Reveal
            className="mt-8 flex max-w-[640px] flex-wrap items-baseline gap-x-6 gap-y-2.5 border-t border-[rgba(26,26,26,0.12)] pt-5 text-sm text-[color:var(--ink-soft)]"
            delay={2}
          >
            {populatedAuthors && populatedAuthors.length > 0 && (
              <span>
                {populatedAuthors.map((author, index) => {
                  const { name } = author

                  const isLast = index === populatedAuthors.length - 1
                  const secondToLast = index === populatedAuthors.length - 2

                  return (
                    <React.Fragment key={index}>
                      {index === 0 ? <strong>{name}</strong> : name}
                      {secondToLast && populatedAuthors.length > 2 && (
                        <React.Fragment>, </React.Fragment>
                      )}
                      {secondToLast && populatedAuthors.length === 2 && (
                        <React.Fragment> </React.Fragment>
                      )}
                      {!isLast && populatedAuthors.length > 1 && (
                        <React.Fragment>and </React.Fragment>
                      )}
                    </React.Fragment>
                  )
                })}
              </span>
            )}
            {publishedAt && (
              <time className="dh-meta" dateTime={publishedAt}>
                {formatDateTime(publishedAt)}
              </time>
            )}
          </Reveal>
        </BlogSheet>

        {metaImage && typeof metaImage !== 'string' && (
          <Reveal className="mx-auto mt-12 max-w-[56rem] select-none overflow-hidden rounded-[26px] border border-[rgba(26,26,26,0.08)] shadow-[0_24px_60px_rgba(26,26,26,0.07)]">
            <Media imgClassName="w-full object-cover" resource={metaImage} />
          </Reveal>
        )}
      </div>
    </div>
  )
}
