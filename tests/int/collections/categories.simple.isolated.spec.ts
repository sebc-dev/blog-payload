import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import type { Payload } from 'payload'
import { getPayloadClient } from '../../helpers/payload'
import { truncateAllTables } from '../../helpers/database'

describe('Collection Categories - Tests d\'intégration isolation simple', () => {
  let payload: Payload

  beforeAll(async () => {
    payload = await getPayloadClient()
  })

  afterEach(async () => {
    await truncateAllTables()
  })

  // Helper pour générer des données uniques
  const createUnique = () => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(7)
    const workerId = process.env.VITEST_WORKER_ID || '1'
    return `${workerId}_${timestamp}_${random}`
  }

  describe('Tests avec isolation par nommage unique', () => {
    it('devrait créer une catégorie avec des données valides', async () => {
      const unique = createUnique()
      const categoryData = {
        name: `Technology ${unique}`,
        slug: `technology-${unique}`,
        description: 'Technology related posts'
      }

      const result = await payload.create({
        collection: 'categories',
        data: categoryData
      })

      expect(result.id).toBeDefined()
      expect(result.name).toBe(categoryData.name)
      expect(result.slug).toBe(categoryData.slug)
      expect(result.description).toBe(categoryData.description)
      expect(result.createdAt).toBeDefined()
      expect(result.updatedAt).toBeDefined()
    })

    it('devrait auto-générer le slug depuis le nom si absent', async () => {
      const unique = createUnique()
      const categoryData = {
        name: `Web Development ${unique}`
      }

      const result = await payload.create({
        collection: 'categories',
        // @ts-expect-error Testing auto-generation without slug
        data: categoryData
      })

      expect(result.slug).toMatch(/web-development/)
    })

    it('ne devrait pas créer une catégorie avec un slug vide', async () => {
      const unique = createUnique()
      const categoryData = {
        name: `Test Category ${unique}`,
        slug: '' // Explicitement vide - doit être rejeté par validation
      }

      await expect(
        payload.create({
          collection: 'categories',
          data: categoryData
        })
      ).rejects.toThrow()
    })

    it('ne devrait pas créer deux catégories avec le même slug', async () => {
      const unique = createUnique()
      const categoryData = {
        name: `Technology ${unique}`,
        slug: `tech-${unique}`
      }

      await payload.create({
        collection: 'categories',
        data: categoryData
      })

      await expect(
        payload.create({
          collection: 'categories',
          data: {
            name: `Tech News ${unique}`,
            slug: `tech-${unique}` // Même slug
          }
        })
      ).rejects.toThrow()
    })

    it('devrait trouver une catégorie par slug', async () => {
      const unique = createUnique()
      const categoryData = {
        name: `Technology ${unique}`,
        slug: `technology-${unique}`,
        description: 'Tech posts'
      }

      // Créer la catégorie
      await payload.create({
        collection: 'categories',
        data: categoryData
      })

      // La rechercher
      const result = await payload.find({
        collection: 'categories',
        where: {
          slug: {
            equals: categoryData.slug
          }
        }
      })

      expect(result.docs).toHaveLength(1)
      expect(result.docs[0].slug).toBe(categoryData.slug)
      expect(result.docs[0].name).toBe(categoryData.name)
    })

    it('devrait mettre à jour une catégorie existante', async () => {
      const unique = createUnique()
      const categoryData = {
        name: `Old Technology ${unique}`,
        slug: `old-tech-${unique}`
      }

      const created = await payload.create({
        collection: 'categories',
        data: categoryData
      })

      const updated = await payload.update({
        collection: 'categories',
        id: created.id,
        data: {
          name: `New Technology ${unique}`,
          description: 'Updated description'
        }
      })

      expect(updated.name).toBe(`New Technology ${unique}`)
      expect(updated.description).toBe('Updated description')
      expect(updated.slug).toBe(`old-tech-${unique}`) // Le slug ne change pas
      expect(updated.updatedAt).not.toBe(created.updatedAt)
    })

    it('devrait supprimer une catégorie existante', async () => {
      const unique = createUnique()
      const categoryData = {
        name: `To Delete ${unique}`,
        slug: `to-delete-${unique}`
      }

      const created = await payload.create({
        collection: 'categories',
        data: categoryData
      })

      await payload.delete({
        collection: 'categories',
        id: created.id
      })

      const result = await payload.find({
        collection: 'categories',
        where: {
          id: {
            equals: created.id
          }
        }
      })

      expect(result.docs).toHaveLength(0)
    })
  })
})