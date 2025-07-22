import type { CollectionConfig } from 'payload'
import slugify from 'slugify'

interface LocalizedName {
  en?: string
  fr?: string
  [key: string]: string | undefined
}

function extractFallbackName(nameData: unknown): string {
  if (typeof nameData === 'string') {
    return nameData
  } else if (typeof nameData === 'object' && nameData !== null) {
    const obj = nameData as LocalizedName
    return obj.en ?? obj.fr ?? Object.values(obj)[0] ?? ''
  }
  return ''
}

export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    useAsTitle: 'name',
  },
  indexes: [
    {
      fields: ['slug'],
      unique: true,
    },
  ],
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true, // Le nom du tag est traduisible
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      admin: {
        description: 'URL-friendly identifier for the tag',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            // Only auto-generate if value is truly missing (undefined/null), not empty string
            if ((value === undefined || value === null) && data?.name) {
              // Auto-generate slug from name if not provided
              const fallbackName = extractFallbackName(data.name)

              if (fallbackName) {
                return slugify(fallbackName, {
                  lower: true,
                  strict: true,
                  locale: 'fr',
                })
              }
            }
            return value
          },
        ],
      },
      validate: (value: string | null | undefined) => {
        if (value === '') {
          return 'Slug cannot be empty'
        }
        return true
      },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true, // La description est aussi traduisible
      admin: {
        description: 'Optional description for the tag',
      },
    },
    {
      name: 'color',
      type: 'text',
      admin: {
        description: 'Hex color code for tag styling (e.g., #3B82F6)',
      },
      validate: (value: unknown) => {
        if (value && typeof value === 'string' && !/^#[0-9A-Fa-f]{6}$/.test(value)) {
          return 'Color must be a valid hex code (e.g., #3B82F6)'
        }
        return true
      },
    },
  ],
}
