import type { CollectionConfig } from 'payload'

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
          ({ value, data, originalDoc }) => {
            // Only auto-generate if value is truly missing (undefined/null), not empty string
            if ((value === undefined || value === null) && data?.name) {
              // Auto-generate slug from name if not provided
              const fallbackName = typeof data.name === 'string' ? data.name : data.name?.en ?? data.name?.fr ?? ''
              return fallbackName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
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
        description: 'Optional description for the category',
      },
    },
  ],
}