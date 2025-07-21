import type { CollectionConfig } from 'payload'

export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    useAsTitle: 'name',
  },
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
            if (!value && data?.name) {
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