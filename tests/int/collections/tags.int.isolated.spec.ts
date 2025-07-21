import { describe, it, expect, beforeAll } from 'vitest'
import type { Payload } from 'payload'
import { setupPayloadTest } from '../../helpers/payload-test-manager'
import { useTestDatabase, createUniqueTestData } from '../../helpers/database-isolation'

describe('Collection Tags - Tests d\'intégration avec isolation', () => {
  // Active l'isolation transactionnelle
  useTestDatabase()
  
  // Configuration du test Payload avec isolation
  const { getPayload } = setupPayloadTest('tags-test')
  let payload: Payload

  beforeAll(() => {
    payload = getPayload()
  })

  describe('Création de tags', () => {
    it('devrait créer un tag avec des données valides', async () => {
      const unique = createUniqueTestData()
      const tagData = {
        name: `JavaScript ${unique.name}`,
        slug: `javascript-${unique.slug}`,
        description: 'JavaScript programming language',
        color: '#F7DF1E'
      }

      const result = await payload.create({
        collection: 'tags',
        data: tagData
      })

      expect(result.id).toBeDefined()
      expect(result.name).toBe(tagData.name)
      expect(result.slug).toBe(tagData.slug)
      expect(result.description).toBe(tagData.description)
      expect(result.color).toBe(tagData.color)
      expect(result.createdAt).toBeDefined()
      expect(result.updatedAt).toBeDefined()
    })

    it('devrait auto-générer le slug depuis le nom si absent', async () => {
      const unique = createUniqueTestData()
      const tagData = {
        name: `React Hooks ${unique.name}`
        // Pas de slug défini pour déclencher l'auto-génération
      }

      const result = await payload.create({
        collection: 'tags',
        // @ts-expect-error Testing auto-generation without slug
        data: tagData
      })

      expect(result.slug).toMatch(/react-hooks/)
    })

    it('devrait normaliser le slug (caractères spéciaux et espaces)', async () => {
      const unique = createUniqueTestData()
      const tagData = {
        name: `Node.js & Express! ${unique.name}`
        // Pas de slug défini pour déclencher l'auto-génération
      }

      const result = await payload.create({
        collection: 'tags',
        // @ts-expect-error Testing auto-generation without slug
        data: tagData
      })

      expect(result.slug).toMatch(/node-js-express/)
    })

    it('ne devrait pas créer un tag sans nom', async () => {
      const tagData = {
        description: 'A tag without name'
      }

      await expect(
        payload.create({
          collection: 'tags',
          // @ts-expect-error Testing invalid data
          data: tagData
        })
      ).rejects.toThrow()
    })

    it('ne devrait pas créer un tag avec un slug vide', async () => {
      const unique = createUniqueTestData()
      const tagData = {
        name: `Test Tag ${unique.name}`,
        slug: '' // Explicitement vide - doit être rejeté par validation
      }

      await expect(
        payload.create({
          collection: 'tags',
          data: tagData
        })
      ).rejects.toThrow()
    })

    it('ne devrait pas créer deux tags avec le même slug', async () => {
      const unique = createUniqueTestData()
      const tagData = {
        name: `JavaScript ${unique.name}`,
        slug: `js-${unique.slug}`
      }

      await payload.create({
        collection: 'tags',
        data: tagData
      })

      await expect(
        payload.create({
          collection: 'tags',
          data: {
            name: `JS Framework ${unique.name}`,
            slug: `js-${unique.slug}` // Même slug
          }
        })
      ).rejects.toThrow()
    })
  })

  describe('Validation des couleurs', () => {
    it('devrait accepter une couleur hexadécimale valide', async () => {
      const validColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFFFF', '#000000', '#3B82F6']
      const unique = createUniqueTestData()

      for (const color of validColors) {
        const tagData = {
          name: `Tag ${color} ${unique.name}`,
          slug: `tag-${color.slice(1).toLowerCase()}-${unique.slug}`,
          color
        }

        const result = await payload.create({
          collection: 'tags',
          data: tagData
        })

        expect(result.color).toBe(color)
      }
    })

    it('ne devrait pas accepter une couleur hexadécimale invalide', async () => {
      const invalidColors = ['#FFF', '#GGGGGG', 'red', 'rgb(255,0,0)', '#12345G', 'FF0000']
      const unique = createUniqueTestData()

      for (const color of invalidColors) {
        const tagData = {
          name: `Test Tag ${unique.name}`,
          slug: `test-tag-${Math.random()}-${unique.slug}`,
          color
        }

        await expect(
          payload.create({
            collection: 'tags',
            data: tagData
          })
        ).rejects.toThrow()
      }
    })

    it('devrait accepter un tag sans couleur', async () => {
      const unique = createUniqueTestData()
      const tagData = {
        name: `No Color Tag ${unique.name}`,
        slug: `no-color-tag-${unique.slug}`
      }

      const result = await payload.create({
        collection: 'tags',
        data: tagData
      })

      expect(result.color).toBeNull()
    })
  })

  describe('Recherche de tags', () => {
    it('devrait trouver un tag par slug', async () => {
      const unique = createUniqueTestData()
      const tagData = {
        name: `JavaScript ${unique.name}`,
        slug: `javascript-${unique.slug}`,
        color: '#F7DF1E',
        description: 'JS programming'
      }

      // Créer le tag
      await payload.create({
        collection: 'tags',
        data: tagData
      })

      // Le rechercher
      const result = await payload.find({
        collection: 'tags',
        where: {
          slug: {
            equals: tagData.slug
          }
        }
      })

      expect(result.docs).toHaveLength(1)
      expect(result.docs[0].slug).toBe(tagData.slug)
      expect(result.docs[0].name).toBe(tagData.name)
      expect(result.docs[0].color).toBe(tagData.color)
    })

    it('devrait trouver des tags par nom', async () => {
      const unique = createUniqueTestData()
      const searchTerm = `Script${unique.slug}`

      // Créer des tags
      await payload.create({
        collection: 'tags',
        data: {
          name: `Java${searchTerm}`,
          slug: `javascript-${unique.slug}`,
          color: '#F7DF1E',
          description: 'JS programming'
        }
      })

      await payload.create({
        collection: 'tags',
        data: {
          name: `Type${searchTerm}`,
          slug: `typescript-${unique.slug}`,
          color: '#3178C6'
        }
      })

      const result = await payload.find({
        collection: 'tags',
        where: {
          name: {
            contains: searchTerm
          }
        }
      })

      expect(result.docs.length).toBeGreaterThanOrEqual(2)
    })

    it('devrait trouver des tags par couleur', async () => {
      const unique = createUniqueTestData()
      const testColor = '#61DAFB'
      
      const tagData = {
        name: `React ${unique.name}`,
        slug: `react-${unique.slug}`,
        color: testColor,
        description: 'React framework'
      }

      await payload.create({
        collection: 'tags',
        data: tagData
      })

      const result = await payload.find({
        collection: 'tags',
        where: {
          color: {
            equals: testColor
          }
        }
      })

      expect(result.docs).toHaveLength(1)
      expect(result.docs[0].name).toBe(`React ${unique.name}`)
    })
  })

  describe('Mise à jour de tags', () => {
    it('devrait mettre à jour un tag existant', async () => {
      const unique = createUniqueTestData()
      const tagData = {
        name: `Old JavaScript ${unique.name}`,
        slug: `old-js-${unique.slug}`,
        color: '#000000'
      }

      const created = await payload.create({
        collection: 'tags',
        data: tagData
      })

      const updated = await payload.update({
        collection: 'tags',
        id: created.id,
        data: {
          name: `Modern JavaScript ${unique.name}`,
          color: '#F7DF1E',
          description: 'Updated description'
        }
      })

      expect(updated.name).toBe(`Modern JavaScript ${unique.name}`)
      expect(updated.color).toBe('#F7DF1E')
      expect(updated.description).toBe('Updated description')
      expect(updated.slug).toBe(`old-js-${unique.slug}`) // Le slug ne change pas
      expect(updated.updatedAt).not.toBe(created.updatedAt)
    })

    it('ne devrait pas permettre de mettre à jour avec un slug déjà utilisé', async () => {
      const unique = createUniqueTestData()
      
      const tag1 = await payload.create({
        collection: 'tags',
        data: {
          name: `Tag 1 ${unique.name}`,
          slug: `tag-1-${unique.slug}`
        }
      })

      const tag2 = await payload.create({
        collection: 'tags',
        data: {
          name: `Tag 2 ${unique.name}`,
          slug: `tag-2-${unique.slug}`
        }
      })

      await expect(
        payload.update({
          collection: 'tags',
          id: tag2.id,
          data: {
            slug: tag1.slug
          }
        })
      ).rejects.toThrow()
    })
  })

  describe('Suppression de tags', () => {
    it('devrait supprimer un tag existant', async () => {
      const unique = createUniqueTestData()
      const tagData = {
        name: `To Delete ${unique.name}`,
        slug: `to-delete-${unique.slug}`
      }

      const created = await payload.create({
        collection: 'tags',
        data: tagData
      })

      await payload.delete({
        collection: 'tags',
        id: created.id
      })

      const result = await payload.find({
        collection: 'tags',
        where: {
          id: {
            equals: created.id
          }
        }
      })

      expect(result.docs).toHaveLength(0)
    })
  })

  describe('Validation des données', () => {
    it('devrait accepter un tag avec nom et slug uniquement', async () => {
      const unique = createUniqueTestData()
      const tagData = {
        name: `Minimal Tag ${unique.name}`,
        slug: `minimal-tag-${unique.slug}`
      }

      const result = await payload.create({
        collection: 'tags',
        data: tagData
      })

      expect(result.name).toBe(`Minimal Tag ${unique.name}`)
      expect(result.slug).toBe(`minimal-tag-${unique.slug}`)
      expect(result.description).toBeNull()
      expect(result.color).toBeNull()
    })
  })
})