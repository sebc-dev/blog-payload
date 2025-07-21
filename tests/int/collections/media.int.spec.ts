import { describe, it, expect, beforeAll, afterEach, beforeEach } from 'vitest'
import type { Payload } from 'payload'
import { getPayloadClient } from '../../helpers/payload'
import { truncateAllTables } from '../../helpers/database'

describe('Collection Media - Tests d\'intégration', () => {
  let payload: Payload

  beforeAll(async () => {
    payload = await getPayloadClient()
  })

  afterEach(async () => {
    await truncateAllTables()
  })

  describe('Création de média', () => {
    it('devrait créer un média avec des données valides', async () => {
      // Note: En attente de la configuration complète de la localisation
      // Les champs sont définis comme localisés dans la collection mais les types générés ne le reflètent pas encore
      const mediaData = {
        alt: 'Test image',
        caption: 'A test image for integration tests'
      }

      const result = await payload.create({
        collection: 'media',
        data: mediaData
      })

      expect(result.id).toBeDefined()
      expect(result.alt).toBe(mediaData.alt)
      expect(result.caption).toBe(mediaData.caption)
      expect(result.createdAt).toBeDefined()
      expect(result.updatedAt).toBeDefined()
    })

    it('devrait créer un média avec seulement le texte alt', async () => {
      const mediaData = {
        alt: 'Alt text only'
      }

      const result = await payload.create({
        collection: 'media',
        data: mediaData
      })

      expect(result.alt).toBe(mediaData.alt)
      expect(result.caption).toBeNull()
    })

    it('ne devrait pas créer un média sans texte alternatif', async () => {
      const mediaData = {
        caption: 'Caption without alt text'
      }

      await expect(
        payload.create({
          collection: 'media',
          // @ts-expect-error Testing invalid data
          data: mediaData
        })
      ).rejects.toThrow()
    })

    it('ne devrait pas créer un média avec un texte alt vide', async () => {
      const mediaData = {
        alt: '',
        caption: 'Caption with empty alt'
      }

      await expect(
        payload.create({
          collection: 'media',
          data: mediaData
        })
      ).rejects.toThrow()
    })
  })

  describe('Recherche de médias', () => {
    beforeEach(async () => {
      // Créer quelques médias de test
      const medias = [
        {
          alt: 'JavaScript logo',
          caption: 'Official JS logo'
        },
        {
          alt: 'React components',
          caption: 'React component architecture'
        },
        {
          alt: 'TypeScript code'
        }
      ]

      for (const media of medias) {
        await payload.create({
          collection: 'media',
          data: media
        })
      }
    })

    it('devrait trouver des médias par texte alternatif', async () => {
      const result = await payload.find({
        collection: 'media',
        where: {
          alt: {
            contains: 'JavaScript'
          }
        }
      })

      expect(result.docs).toHaveLength(1)
      expect(result.docs[0].alt).toBe('JavaScript logo')
    })

    it('devrait trouver des médias par légende', async () => {
      const result = await payload.find({
        collection: 'media',
        where: {
          caption: {
            contains: 'architecture'
          }
        }
      })

      expect(result.docs).toHaveLength(1)
      expect(result.docs[0].caption).toBe('React component architecture')
    })

    it('devrait retourner tous les médias triés par date de création', async () => {
      const result = await payload.find({
        collection: 'media',
        sort: '-createdAt'
      })

      expect(result.docs).toHaveLength(3)
      // Le plus récent en premier (TypeScript code)
      expect(result.docs[0].alt).toBe('TypeScript code')
    })

    it('devrait filtrer les médias qui ont une légende', async () => {
      const result = await payload.find({
        collection: 'media',
        where: {
          caption: {
            not_equals: null
          }
        }
      })

      expect(result.docs).toHaveLength(2)
      expect(result.docs.every(doc => doc.caption)).toBe(true)
    })

    it('devrait paginer les résultats correctement', async () => {
      const result = await payload.find({
        collection: 'media',
        limit: 2,
        page: 1,
        sort: 'alt'
      })

      expect(result.docs).toHaveLength(2)
      expect(result.totalDocs).toBe(3)
      expect(result.totalPages).toBe(2)
      expect(result.page).toBe(1)
    })
  })

  describe('Mise à jour de médias', () => {
    it('devrait mettre à jour un média existant', async () => {
      const mediaData = {
        alt: 'Old alt text',
        caption: 'Old caption'
      }

      const created = await payload.create({
        collection: 'media',
        data: mediaData
      })

      const updated = await payload.update({
        collection: 'media',
        id: created.id,
        data: {
          alt: 'New alt text',
          caption: 'New caption'
        }
      })

      expect(updated.alt).toBe('New alt text')
      expect(updated.caption).toBe('New caption')
      expect(updated.updatedAt).not.toBe(created.updatedAt)
    })

    it('devrait permettre de mettre à jour seulement le texte alt', async () => {
      const mediaData = {
        alt: 'Original alt',
        caption: 'Original caption'
      }

      const created = await payload.create({
        collection: 'media',
        data: mediaData
      })

      const updated = await payload.update({
        collection: 'media',
        id: created.id,
        data: {
          alt: 'Updated alt text'
        }
      })

      expect(updated.alt).toBe('Updated alt text')
      expect(updated.caption).toBe('Original caption')
    })

    it('devrait permettre de supprimer la légende', async () => {
      const mediaData = {
        alt: 'Alt text',
        caption: 'Caption to remove'
      }

      const created = await payload.create({
        collection: 'media',
        data: mediaData
      })

      const updated = await payload.update({
        collection: 'media',
        id: created.id,
        data: {
          caption: null
        }
      })

      expect(updated.alt).toBe('Alt text')
      expect(updated.caption).toBeNull()
    })

    it('ne devrait pas permettre de supprimer le texte alt', async () => {
      const mediaData = {
        alt: 'Required alt text'
      }

      const created = await payload.create({
        collection: 'media',
        data: mediaData
      })

      await expect(
        payload.update({
          collection: 'media',
          id: created.id,
          data: {
            // @ts-expect-error Testing invalid data
            alt: null
          }
        })
      ).rejects.toThrow()
    })

    it('ne devrait pas permettre de mettre à jour avec un texte alt vide', async () => {
      const mediaData = {
        alt: 'Original alt text'
      }

      const created = await payload.create({
        collection: 'media',
        data: mediaData
      })

      await expect(
        payload.update({
          collection: 'media',
          id: created.id,
          data: {
            alt: ''
          }
        })
      ).rejects.toThrow()
    })
  })

  describe('Suppression de médias', () => {
    it('devrait supprimer un média existant', async () => {
      const mediaData = {
        alt: 'To delete'
      }

      const created = await payload.create({
        collection: 'media',
        data: mediaData
      })

      await payload.delete({
        collection: 'media',
        id: created.id
      })

      const result = await payload.find({
        collection: 'media',
        where: {
          id: {
            equals: created.id
          }
        }
      })

      expect(result.docs).toHaveLength(0)
    })

    it('devrait lever une erreur lors de la suppression d\'un média inexistant', async () => {
      await expect(
        payload.delete({
          collection: 'media',
          id: 999999
        })
      ).rejects.toThrow()
    })
  })

  describe('Accès et permissions', () => {
    it('devrait permettre la lecture publique des médias', async () => {
      const mediaData = {
        alt: 'Public media'
      }

      const created = await payload.create({
        collection: 'media',
        data: mediaData
      })

      // Simuler un accès sans utilisateur authentifié
      const result = await payload.find({
        collection: 'media',
        where: {
          id: {
            equals: created.id
          }
        }
      })

      expect(result.docs).toHaveLength(1)
      expect(result.docs[0].alt).toBe('Public media')
    })
  })

  describe('Validation des données', () => {
    it('devrait accepter un média avec seulement le texte alt', async () => {
      const mediaData = {
        alt: 'Minimal media'
      }

      const result = await payload.create({
        collection: 'media',
        data: mediaData
      })

      expect(result.alt).toBe('Minimal media')
      expect(result.caption).toBeNull()
    })

    it('devrait accepter une légende optionnelle', async () => {
      const mediaData = {
        alt: 'Alt text',
        caption: 'Optional caption'
      }

      const result = await payload.create({
        collection: 'media',
        data: mediaData
      })

      expect(result.alt).toBe('Alt text')
      expect(result.caption).toBe('Optional caption')
    })
  })

  describe('Configuration des tailles d\'images', () => {
    it('devrait avoir la configuration des tailles d\'images définie', async () => {
      // Vérifier que la collection a la bonne configuration
      const collections = payload.config.collections
      const mediaCollection = collections?.find(col => col.slug === 'media')

      expect(mediaCollection).toBeDefined()
      expect(mediaCollection?.upload).toBeDefined()
      expect(mediaCollection?.upload?.imageSizes).toHaveLength(3)

      const imageSizes = mediaCollection?.upload?.imageSizes
      expect(imageSizes?.[0].name).toBe('thumbnail')
      expect(imageSizes?.[0].width).toBe(400)
      expect(imageSizes?.[0].height).toBe(300)

      expect(imageSizes?.[1].name).toBe('card')
      expect(imageSizes?.[1].width).toBe(768)
      expect(imageSizes?.[1].height).toBe(1024)

      expect(imageSizes?.[2].name).toBe('tablet')
      expect(imageSizes?.[2].width).toBe(1024)
      expect(imageSizes?.[2].height).toBeUndefined()
    })
  })
})