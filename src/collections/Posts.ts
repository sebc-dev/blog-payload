import type { CollectionConfig } from 'payload'
import slugify from 'slugify'
import { FixedToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'

interface LocalizedText {
  en?: string
  fr?: string

  [key: string]: string | undefined
}

/**
 * Extract fallback text from localized fields
 */
function extractFallbackText(textData: unknown): string {
  if (typeof textData === 'string') {
    return textData
  } else if (typeof textData === 'object' && textData !== null) {
    const obj = textData as LocalizedText
    if (obj.en && obj.en.trim() !== '') {
      return obj.en
    }
    if (obj.fr && obj.fr.trim() !== '') {
      return obj.fr
    }
    return Object.values(obj).find((v) => v && v.trim() !== '') ?? ''
  }
  return ''
}

/**
 * Calculate reading time from rich text content
 * Based on average reading speed of 200 words per minute
 */
function calculateReadingTime(content: unknown): number {
  if (!content) return 0

  // Convert rich text content to plain text for word counting
  let plainText = ''

  if (typeof content === 'string') {
    plainText = content
  } else if (typeof content === 'object') {
    // For Lexical editor content, we need to extract text from the JSON structure
    plainText = JSON.stringify(content)
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[^\w\s]/g, ' ') // Replace special characters with spaces
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim()
  }

  const wordCount = plainText.split(/\s+/).filter((word) => word.length > 0).length

  // Si pas de mots, retourner 0
  if (wordCount === 0) return 0

  return Math.ceil(wordCount / 200)
}

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', '_status'],
  },
  versions: {
    drafts: true,
  },
  labels: {
    singular: {
      en: 'Post',
      fr: 'Article',
    },
    plural: {
      en: 'Posts',
      fr: 'Articles',
    },
  },
  indexes: [
    {
      fields: ['slug'],
      unique: true,
    },
    {
      fields: ['category'],
    },
    {
      fields: ['publishedAt'],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-generate slug if empty
        if (!data.slug && data.title) {
          const fallbackTitle = extractFallbackText(data.title)
          if (fallbackTitle) {
            data.slug = slugify(fallbackTitle, {
              lower: true,
              strict: true,
              locale: 'fr', // Using French locale for slug generation
            })
          }
        }

        // Calculate reading time automatically
        if (data.content !== undefined) {
          data.readingTime = calculateReadingTime(data.content)
        }

        // Auto-set publishedAt if status is published and no date is set
        if (data._status === 'published' && !data.publishedAt) {
          data.publishedAt = new Date()
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: "Titre de l'article",
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'URL personnalisée par langue (auto-générée depuis le titre si vide)',
      },
      validate: (value: string | null | undefined) => {
        if (!value || value.trim() === '') {
          return 'Le slug ne peut pas être vide'
        }
        if (!/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(value)) {
          return 'Le slug doit contenir uniquement des lettres minuscules, chiffres, tirets et underscores'
        }
        return true
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      localized: true,
      admin: {
        description: "Résumé de l'article pour les listings et le SEO",
      },
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature()],
      }),
      required: true,
      localized: true,
      admin: {
        description: "Contenu principal de l'article",
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: "Image principale de l'article",
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      admin: {
        description: "Catégorie de l'article",
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      admin: {
        description: "Tags associés à l'article",
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        description: 'Date de publication (auto-remplie si statut publié)',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'readingTime',
      type: 'number',
      admin: {
        description: 'Temps de lecture estimé en minutes (calculé automatiquement)',
        readOnly: true,
      },
    },
    {
      name: 'meta',
      type: 'group',
      label: {
        en: 'SEO Meta',
        fr: 'Métadonnées SEO',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
          admin: {
            description: 'Titre SEO personnalisé (optionnel)',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          admin: {
            description: 'Description SEO (optionnel)',
          },
        },
        {
          name: 'keywords',
          type: 'text',
          localized: true,
          admin: {
            description: 'Mots-clés SEO séparés par des virgules (optionnel)',
          },
        },
      ],
    },
  ],
}
