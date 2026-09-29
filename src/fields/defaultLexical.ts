import { Config } from 'payload'
import {
  BoldFeature,
  ItalicFeature,
  LinkFeature,
  ParagraphFeature,
  lexicalEditor,
  UnderlineFeature,
} from '@payloadcms/richtext-lexical'
import { text } from 'payload/shared'

// A link url must keep its scheme. Editing a link in the admin once turned
// `https://nplink.net/…` into `https.nplink.net/…` before saving (cause not
// found); refuse that shape instead of publishing a broken href.
const LINK_URL = /^(https?:\/\/\S|mailto:|tel:|\/|#)/

export const defaultLexical: Config['editor'] = lexicalEditor({
  features: () => {
    return [
      ParagraphFeature(),
      UnderlineFeature(),
      BoldFeature(),
      ItalicFeature(),
      LinkFeature({
        enabledCollections: ['pages', 'posts'],
        fields: ({ defaultFields }) => {
          const defaultFieldsWithoutUrl = defaultFields.filter((field) => {
            if ('name' in field && field.name === 'url') return false
            return true
          })

          return [
            ...defaultFieldsWithoutUrl,
            {
              name: 'url',
              type: 'text',
              admin: {
                condition: ({ linkType }) => linkType !== 'internal',
              },
              label: ({ t }) => t('fields:enterURL'),
              required: true,
              validate: (value, args) => {
                const url = value?.trim()
                if (url && !LINK_URL.test(url)) {
                  return 'This link is missing https:// — paste the full address again.'
                }
                return text(value, args)
              },
            },
          ]
        },
      }),
    ]
  },
})
