import { describe, it, expect } from 'vitest'
import type { ImageSize, Field, UploadConfig } from 'payload'
import { Media } from '../../../src/collections/Media.js'

describe('Media - Tests unitaires de configuration', () => {
  describe('Configuration de la collection Media', () => {
    it('devrait avoir la configuration correcte pour une collection upload', () => {
      expect(Media).toBeDefined()
      expect(Media.slug).toBe('media')
      expect(Media.upload).toBeDefined()

      const uploadConfig = Media.upload as UploadConfig
      expect(uploadConfig.staticDir).toBe('media')
      expect(uploadConfig.imageSizes).toHaveLength(4)
    })

    it("devrait avoir les bonnes tailles d'images configurées", () => {
      const uploadConfig = Media.upload as UploadConfig
      const imageSizes = uploadConfig.imageSizes as ImageSize[] | undefined

      // Vérifier card
      expect(imageSizes?.[0]?.name).toBe('card')
      expect(imageSizes?.[0]?.width).toBe(400)
      expect(imageSizes?.[0]?.height).toBe(300)

      // Vérifier tablet
      expect(imageSizes?.[1]?.name).toBe('tablet')
      expect(imageSizes?.[1]?.width).toBe(768)
      expect(imageSizes?.[1]?.height).toBe(1024)

      // Vérifier desktop
      expect(imageSizes?.[2]?.name).toBe('desktop')
      expect(imageSizes?.[2]?.width).toBe(1024)
      expect(imageSizes?.[2]?.height).toBeUndefined()

      // Vérifier thumbnail
      expect(imageSizes?.[3]?.name).toBe('thumbnail')
      expect(imageSizes?.[3]?.width).toBe(100)
      expect(imageSizes?.[3]?.height).toBe(100)
    })

    it('devrait avoir les champs alt et caption configurés', () => {
      const fields = Media.fields as Field[] | undefined

      // Vérifier le champ alt
      const altField = fields?.find((field: Field) => 'name' in field && field.name === 'alt')
      expect(altField).toBeDefined()
      expect(altField?.type).toBe('text')
      expect((altField as any)?.required).toBe(true)
      expect((altField as any)?.localized).toBe(true)

      // Vérifier le champ caption
      const captionField = fields?.find(
        (field: Field) => 'name' in field && field.name === 'caption',
      )
      expect(captionField).toBeDefined()
      expect(captionField?.type).toBe('text')
      expect((captionField as any)?.required).toBeFalsy()
      expect((captionField as any)?.localized).toBe(true)
    })

    it('devrait avoir les permissions de lecture publique', () => {
      expect(Media.access?.read).toBeDefined()
      // La fonction access.read retourne toujours true pour l'accès public
      const readAccess = Media.access?.read
      if (typeof readAccess === 'function') {
        expect(readAccess({} as any)).toBe(true)
      }
    })
  })

  describe("Validation des tailles d'images", () => {
    // Fonction utilitaire pour valider les tailles d'images
    const validateImageSizes = (imageSizes: ImageSize[]) => {
      const errors: string[] = []

      imageSizes.forEach((size, index) => {
        if (!size.name) {
          errors.push(`La taille d'image ${index} doit avoir un nom`)
        }
        if (typeof size.width !== 'number' || size.width <= 0) {
          errors.push(`La largeur de ${size.name || index} doit être un nombre positif`)
        }
        if (size.height !== undefined && size.height <= 0) {
          errors.push(`La hauteur de ${size.name || index} doit être un nombre positif`)
        }
      })

      return {
        valid: errors.length === 0,
        errors,
      }
    }

    it("devrait valider des tailles d'images correctes", () => {
      const validImageSizes: ImageSize[] = [
        { name: 'card', width: 400, height: 300 },
        { name: 'tablet', width: 768, height: 1024 },
        { name: 'desktop', width: 1024 }, // Pas de hauteur - valide
        { name: 'thumbnail', width: 100, height: 100 },
      ]

      const result = validateImageSizes(validImageSizes)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it("devrait rejeter des tailles d'images incorrectes", () => {
      const invalidImageSizes = [
        { width: 400, height: 300 } as ImageSize, // Pas de nom
        { name: 'invalid', width: 0, height: 300 } as ImageSize, // Largeur zéro
        { name: 'invalid2', width: -100, height: 300 } as ImageSize, // Largeur négative
        { name: 'invalid3', width: 400, height: 0 } as ImageSize, // Hauteur zéro
      ]

      const result = validateImageSizes(invalidImageSizes)
      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(4)
    })
  })

  describe('Validation des champs Media', () => {
    interface MediaData {
      alt: string
      caption?: string
    }

    // Fonction de validation des données media
    const validateMediaData = (data: MediaData): { valid: boolean; errors: string[] } => {
      const errors: string[] = []

      // Validation du texte alternatif (requis)
      if (!data.alt) {
        errors.push('Le texte alternatif est requis')
      } else if (data.alt.trim().length === 0) {
        errors.push('Le texte alternatif ne peut pas être vide')
      } else if (data.alt.length > 255) {
        errors.push('Le texte alternatif ne peut pas dépasser 255 caractères')
      }

      // Validation de la légende (optionnelle)
      if (data.caption !== undefined && data.caption !== null) {
        if (data.caption.length > 500) {
          errors.push('La légende ne peut pas dépasser 500 caractères')
        }
      }

      return {
        valid: errors.length === 0,
        errors,
      }
    }

    it('devrait valider des données media correctes', () => {
      const mediaData = {
        alt: "Description de l'image",
        caption: "Légende de l'image",
      }

      const result = validateMediaData(mediaData)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('devrait valider des données media minimales', () => {
      const mediaData = {
        alt: "Description de l'image",
      }

      const result = validateMediaData(mediaData)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('devrait rejeter des données sans alt', () => {
      const mediaData = {
        alt: '' as any,
        caption: 'Légende',
      }

      const result = validateMediaData(mediaData)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Le texte alternatif est requis')
    })

    it('devrait rejeter un alt trop long', () => {
      const mediaData = {
        alt: 'A'.repeat(256), // 256 caractères
        caption: 'Légende',
      }

      const result = validateMediaData(mediaData)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Le texte alternatif ne peut pas dépasser 255 caractères')
    })

    it('devrait rejeter une légende trop longue', () => {
      const mediaData = {
        alt: 'Description valide',
        caption: 'L'.repeat(501), // 501 caractères
      }

      const result = validateMediaData(mediaData)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('La légende ne peut pas dépasser 500 caractères')
    })

    it('devrait accepter une légende nulle', () => {
      const mediaData = {
        alt: 'Description valide',
        caption: null as any,
      }

      const result = validateMediaData(mediaData)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })
})
