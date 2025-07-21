import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  upload: {
    staticDir: 'media',
    imageSizes: [
      {
        name: 'card',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'tablet',
        width: 768,
        height: 1024,
        position: 'centre',
      },
      {
        name: 'desktop',
        width: 1024,
        height: undefined,
        position: 'centre',
      },
      {
        name: 'thumbnail',
        width: 100,
        height: 100,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true, // Le texte alternatif est traduisible
      admin: {
        description: 'Alternative text for accessibility and SEO',
      },
    },
    {
      name: 'caption',
      type: 'text',
      localized: true, // La légende est aussi traduisible
      admin: {
        description: 'Optional caption for the image',
      },
    },
  ],
}
