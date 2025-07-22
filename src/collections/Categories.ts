import type { CollectionConfig } from 'payload'
import slugify from 'slugify'

// Extract default locale from configuration to avoid circular dependency
const DEFAULT_LOCALE = 'fr' // Using French locale for slug generation to handle special characters correctly

export const Categories: CollectionConfig = {
  slug: 'categories',
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
      localized: true, // Le nom de la catégorie est traduisible
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      admin: {
        description: 'URL-friendly identifier for the category',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            // Only auto-generate if value is truly missing (undefined/null), not empty string
            if ((value === undefined || value === null) && data?.name) {
              // Auto-generate slug from name if not provided
              const fallbackName = typeof data.name === 'string' ? data.name : data.name?.en ?? data.name?.fr ?? ''
              return slugify(fallbackName, {
                lower: true,
                strict: true,
                locale: DEFAULT_LOCALE
              })
            }
            return value
          },
        ],
      },
      validate: (value: string | null | undefined) => {

        if (!value || value.trim() === '') {
          return 'Le slug ne peut pas être vide'
        }
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
          return 'Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets'
        }
        return true
      },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true, // La description est aussi traduisible
      admin: {
        description: 'Optional description for the category',
      },
    },
  ],
}