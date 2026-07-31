'use client'
import { cn } from '@/utilities/cn'
import { getDocPath } from '@/utilities/collectionPrefixMap'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { Fragment } from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'

export type CardPostData = Pick<Post, 'slug' | 'categories' | 'meta' | 'title'>

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo?: 'posts'
  showCategories?: boolean
  title?: string
  /** Option C's featured card: art beside the copy instead of above it. */
  wide?: boolean
}> = (props) => {
  const { card, link } = useClickableCard({})
  const { className, doc, relationTo, showCategories, title: titleFromProps, wide } = props

  const { slug, categories, meta, title } = doc || {}
  const { description, image: metaImage } = meta || {}

  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
  const href = getDocPath(relationTo, slug)

  return (
    <article
      className={cn(
        // The site's card recipe: off-white fill, hairline ink border, 26px
        // radius, soft shadow that lifts on hover with the house easing.
        // `dh-card` adds Option C's gradient rule across the top edge.
        'dh-card group relative flex flex-col overflow-hidden rounded-[26px] border border-[rgba(26,26,26,0.08)] bg-card',
        'shadow-[0_12px_32px_rgba(26,26,26,0.06)] transition-[transform,box-shadow] duration-[350ms]',
        'ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5',
        'hover:shadow-[0_24px_60px_rgba(26,26,26,0.10)] hover:cursor-pointer',
        // Side-by-side only once there is room for it — below 900px the
        // featured card is just a card.
        wide && 'min-[900px]:flex-row',
        className,
      )}
      ref={card.ref}
    >
      {/* `relative` + <Media fill> so the art fills whatever height the card
          ends up at. Sizing it by CSS height instead would have to reach
          through Media's wrapper and ImageMedia's <picture> to get to the img. */}
      <div
        className={cn(
          'relative w-full aspect-[16/10] overflow-hidden',
          wide && 'min-[900px]:aspect-auto min-[900px]:w-[44%] min-[900px]:flex-none',
        )}
      >
        {!metaImage && (
          <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(135deg,#f3f3f3,#eef3f8)]">
            <span className="dh-meta">2ahealthylife</span>
          </div>
        )}
        {metaImage && typeof metaImage !== 'string' && (
          <Media
            fill
            imgClassName="object-cover"
            resource={metaImage}
            size={wide ? '66vw' : '33vw'}
          />
        )}
      </div>
      {/* The featured card is as tall as the row, so its copy is centred
          rather than stranded at the top of a half-empty panel. */}
      <div className={cn('flex flex-1 flex-col p-7', wide && 'min-[900px]:justify-center')}>
        {showCategories && hasCategories && (
          <div className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[color:var(--blue-ink)]">
            {showCategories && hasCategories && (
              <div>
                {categories?.map((category, index) => {
                  if (typeof category === 'object') {
                    const { title: titleFromCategory } = category

                    const categoryTitle = titleFromCategory || 'Untitled category'

                    const isLast = index === categories.length - 1

                    return (
                      <Fragment key={index}>
                        {categoryTitle}
                        {!isLast && <Fragment>, &nbsp;</Fragment>}
                      </Fragment>
                    )
                  }

                  return null
                })}
              </div>
            )}
          </div>
        )}
        {titleToUse && (
          <h3 className="text-[26px] font-medium leading-[1.2] tracking-[-0.02em]">
            <Link href={href} ref={link.ref}>
              {titleToUse}
            </Link>
          </h3>
        )}
        {description && (
          <p className="mt-3 text-[15px] leading-[1.65] text-muted-foreground">
            {sanitizedDescription}
          </p>
        )}
      </div>
    </article>
  )
}
