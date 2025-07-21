import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import type { Payload } from 'payload'
import { getPayloadClient } from '../../helpers/payload'
import { truncateAllTables } from '../../helpers/database'

describe('Collection Tags - Tests d\'intégration isolation simple', () => {
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
    it('devrait créer un tag avec des données valides', async () => {
      const unique = createUnique()
      const tagData = {
        name: `JavaScript ${unique}`,
        slug: `javascript-${unique}`,
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
    })

    it('devrait auto-générer le slug depuis le nom si absent', async () => {
      const unique = createUnique()
      const tagData = {
        name: `React Hooks ${unique}`
      }

      const result = await payload.create({
        collection: 'tags',
        // @ts-expect-error Testing auto-generation without slug
        data: tagData
      })

      expect(result.slug).toMatch(/react-hooks/)
    })

    it('ne devrait pas créer un tag avec un slug vide', async () => {
      const unique = createUnique()
      const tagData = {
        name: `Test Tag ${unique}`,
        slug: ''
      }

      await expect(
        payload.create({
          collection: 'tags',
          data: tagData
        })
      ).rejects.toThrow()
    })

    it('ne devrait pas créer deux tags avec le même slug', async () => {
      const unique = createUnique()
      const tagData = {
        name: `JavaScript ${unique}`,
        slug: `js-${unique}`
      }

      await payload.create({
        collection: 'tags',
        data: tagData
      })

      await expect(
        payload.create({
          collection: 'tags',
          data: {
            name: `JS Framework ${unique}`,
            slug: `js-${unique}`
          }
        })
      ).rejects.toThrow()
    })

    it('devrait accepter une couleur hexadécimale valide', async () => {
      const unique = createUnique()
      const tagData = {
        name: `Red Tag ${unique}`,
        slug: `red-tag-${unique}`,
        color: '#FF0000'
      }

      const result = await payload.create({
        collection: 'tags',
        data: tagData
      })

      expect(result.color).toBe('#FF0000')
    })

    it('ne devrait pas accepter une couleur hexadécimale invalide', async () => {
      const unique = createUnique()
      const tagData = {
        name: `Invalid Color Tag ${unique}`,
        slug: `invalid-color-${unique}`,
        color: '#GGGGGG'
      }

      await expect(
        payload.create({
          collection: 'tags',
          data: tagData
        })
      ).rejects.toThrow()
    })

    it('devrait accepter un tag sans couleur', async () => {
      const unique = createUnique()
      const tagData = {
        name: `No Color Tag ${unique}`,
        slug: `no-color-tag-${unique}`
      }

      const result = await payload.create({
        collection: 'tags',
        data: tagData
      })

      expect(result.color).toBeNull()
    })

    it('devrait trouver un tag par slug', async () => {
      const unique = createUnique()
      const tagData = {
        name: `JavaScript ${unique}`,
        slug: `javascript-${unique}`,
        color: '#F7DF1E'
      }

      await payload.create({
        collection: 'tags',
        data: tagData
      })

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

    it('devrait mettre à jour un tag existant', async () => {
      const unique = createUnique()
      const tagData = {
        name: `Old JavaScript ${unique}`,
        slug: `old-js-${unique}`,
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
          name: `Modern JavaScript ${unique}`,
          color: '#F7DF1E',
          description: 'Updated description'
        }
      })

      expect(updated.name).toBe(`Modern JavaScript ${unique}`)
      expect(updated.color).toBe('#F7DF1E')
      expect(updated.description).toBe('Updated description')
      expect(updated.slug).toBe(`old-js-${unique}`) // Le slug ne change pas
    })

    it('devrait supprimer un tag existant', async () => {
      const unique = createUnique()
      const tagData = {
        name: `To Delete ${unique}`,
        slug: `to-delete-${unique}`
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
})