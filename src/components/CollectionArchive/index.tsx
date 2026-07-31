import { cn } from 'src/utilities/cn'
import React from 'react'

import { Card, CardPostData } from '@/components/Card'
import { Reveal } from '@/components/Motion/Reveal'

export type Props = {
  posts: CardPostData[]
  /**
   * Option C's index: the newest post runs double-width across the top. Only
   * page 1 passes this.
   */
  featured?: boolean
}

export const CollectionArchive: React.FC<Props> = (props) => {
  const { posts, featured } = props

  // The only real constraint: a double-width card must never be the sole card
  // in the grid, or it reads as a broken row rather than a feature.
  const hasFeatured = Boolean(featured) && posts.length >= 2

  return (
    <div className={cn('container')}>
      {/* auto-fill rather than a fixed column count, so the grid reflows on
          its own instead of leaving most of a row empty on narrow screens. */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] gap-[30px]">
        {posts?.map((result, index) => {
          if (typeof result === 'object' && result !== null) {
            const isWide = hasFeatured && index === 0

            return (
              <Reveal
                className={cn('flex', isWide && 'min-[900px]:col-span-2')}
                delay={index}
                key={index}
              >
                <Card
                  className="h-full w-full"
                  doc={result}
                  relationTo="posts"
                  showCategories
                  wide={isWide}
                />
              </Reveal>
            )
          }

          return null
        })}
      </div>
    </div>
  )
}
