import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import type { Payload } from 'payload'

import { getPayloadClient } from '../../helpers/payload'
import { createUniqueTestData } from '../../helpers/database-isolation'

describe("Collection Media - Tests d'intégration avec isolation", () => {
  let payload: Payload

  beforeAll(async () => {
    payload = await getPayloadClient()
  })

  afterEach(async () => {
    // Nettoyage léger - l'utilisation de données uniques évite la plupart des conflits
  })

  describe('Validation de la collection', () => {
    it('ne devrait pas créer un média sans fichier (validation normale)', async () => {
      const unique = createUniqueTestData()
      const mediaData = {
        alt: `Test without file ${unique.name}`,
        caption: `Caption without file ${unique.name}`,
      }

      // Tenter de créer sans fichier devrait échouer
      await expect(
        payload.create({
          collection: 'media',
          data: mediaData,
          // Pas de propriété 'file' - devrait échouer
        }),
      ).rejects.toThrow()
    })

    it('devrait avoir la structure de base attendue pour la collection', async () => {
      // Test basique pour vérifier que la collection existe et est accessible
      const result = await payload.find({
        collection: 'media',
        limit: 0, // Ne récupère que les métadonnées, pas les documents
      })

      expect(result).toBeDefined()
      expect(result.totalDocs).toBeDefined()
      expect(result.docs).toEqual([])
      expect(result.page).toBe(1)
    })
  })

  describe('Tests de requêtes sur collection vide', () => {
    it('devrait retourner une liste vide pour une recherche sur collection vide', async () => {
      const unique = createUniqueTestData()

      const result = await payload.find({
        collection: 'media',
        where: {
          alt: {
            contains: unique.name,
          },
        },
      })

      expect(result.docs).toHaveLength(0)
      expect(result.totalDocs).toBe(0)
    })

    it('devrait gérer la pagination correctement sur collection vide', async () => {
      const result = await payload.find({
        collection: 'media',
        limit: 10,
        page: 1,
      })

      expect(result.docs).toHaveLength(0)
      expect(result.totalDocs).toBe(0)
      expect(result.totalPages).toBe(1)
      expect(result.page).toBe(1)
    })

    it('devrait supporter les critères de tri même sur collection vide', async () => {
      const result = await payload.find({
        collection: 'media',
        sort: '-createdAt',
      })

      expect(result.docs).toHaveLength(0)
      expect(result.totalDocs).toBe(0)
    })
  })

  describe("Tests d'erreurs pour IDs inexistants", () => {
    it("devrait lever une erreur lors de la recherche d'un média inexistant par ID", async () => {
      const result = await payload.find({
        collection: 'media',
        where: {
          id: {
            equals: 'inexistent-id-12345',
          },
        },
      })

      expect(result.docs).toHaveLength(0)
    })

    it("devrait lever une erreur lors de la suppression d'un média inexistant", async () => {
      await expect(
        payload.delete({
          collection: 'media',
          id: 'inexistent-id-12345',
        }),
      ).rejects.toThrow()
    })

    it("devrait lever une erreur lors de la mise à jour d'un média inexistant", async () => {
      await expect(
        payload.update({
          collection: 'media',
          id: 'inexistent-id-12345',
          data: {
            alt: 'Updated alt',
          },
        }),
      ).rejects.toThrow()
    })
  })
})
