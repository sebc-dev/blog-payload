import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import type { Payload } from 'payload'

import { getPayloadClient } from '../../helpers/payload'
import { createUniqueTestData } from '../../helpers/database-isolation'

describe('Collection Categories - Tests d\'intégration avec isolation', () => {
  let payload: Payload

  beforeAll(async () => {
    payload = await getPayloadClient()
  })

  afterEach(async () => {
    // Nettoyage léger - seulement supprimer les données du test actuel si nécessaire
    // L'utilisation de données uniques évite la plupart des conflits
  })

  describe('Création de catégories', () => {
    it('devrait créer une catégorie avec des données valides', async () => {
      const unique = createUniqueTestData()
      const categoryData = {
        name: `Technology ${unique.name}`,
        slug: `technology-${unique.slug}`,
        description: 'Technology related posts',
      }

      const result = await payload.create({
        collection: 'categories',
        data: categoryData,
      })

      expect(result.id).toBeDefined()
      expect(result.name).toBe(categoryData.name)
      expect(result.slug).toBe(categoryData.slug)
      expect(result.description).toBe(categoryData.description)
      expect(result.createdAt).toBeDefined()
      expect(result.updatedAt).toBeDefined()
    })

    it('devrait auto-générer le slug depuis le nom si absent', async () => {
      const unique = createUniqueTestData()
      const categoryData = {
        name: `Web Development ${unique.name}`,
      }

      const result = await payload.create({
        collection: 'categories',
        // @ts-expect-error - We are testing slug auto-generation
        data: categoryData,
      })

      // Le slug généré doit correspondre au nom normalisé
      expect(result.slug).toMatch(/web-development/)
    })

    it('devrait normaliser le slug (caractères spéciaux et espaces)', async () => {
      const unique = createUniqueTestData()
      const categoryData = {
        name: `Machine Learning & AI! ${unique.name}`,
      }

      const result = await payload.create({
        collection: 'categories',
        // @ts-expect-error - We are testing slug auto-generation
        data: categoryData,
      })

      // Avec locale: 'fr', le & devient 'et' et les caractères spéciaux sont supprimés
      expect(result.slug).toMatch(/machine-learning-et-ai/)
      expect(result.slug).not.toMatch(/[&!]/)
    })

    it('ne devrait pas créer une catégorie sans nom', async () => {
      await expect(
        payload.create({
          collection: 'categories',
          // @ts-expect-error - We are testing a case where the name is missing
          data: {
            slug: 'no-name-slug',
          },
        }),
      ).rejects.toThrow()
    })

    it('ne devrait pas créer une catégorie avec un slug vide', async () => {
      const unique = createUniqueTestData()
      const categoryData = {
        name: `Test Category ${unique.name}`,
        slug: '',
      }

      await expect(
        payload.create({
          collection: 'categories',
          data: categoryData,
        }),
      ).rejects.toThrow()
    })

    it('ne devrait pas créer deux catégories avec le même slug', async () => {
      const unique = createUniqueTestData()
      const sharedSlug = `tech-${unique.slug}`
      const categoryData = {
        name: `Technology ${unique.name}`,
        slug: sharedSlug,
      }

      await payload.create({
        collection: 'categories',
        data: categoryData,
      })

      await expect(
        payload.create({
          collection: 'categories',
          data: {
            name: `Tech News ${unique.name}`,
            slug: sharedSlug,
          },
        }),
      ).rejects.toThrow()
    })
  })

  describe('Recherche de catégories', () => {
    it('devrait trouver une catégorie par slug', async () => {
      const unique = createUniqueTestData()
      const categoryData = {
        name: `Technology ${unique.name}`,
        slug: `technology-${unique.slug}`,
        description: 'Tech posts',
      }

      await payload.create({
        collection: 'categories',
        data: categoryData,
      })

      const result = await payload.find({
        collection: 'categories',
        where: {
          slug: {
            equals: categoryData.slug,
          },
        },
      })

      expect(result.docs).toHaveLength(1)
      expect(result.docs[0].slug).toBe(categoryData.slug)
      expect(result.docs[0].name).toBe(categoryData.name)
    })

    it('devrait trouver des catégories par nom', async () => {
      const unique = createUniqueTestData()
      const searchTerm = `Tech${unique.slug}`

      await payload.create({
        collection: 'categories',
        data: {
          name: `${searchTerm}nology`,
          slug: `technology-${unique.slug}`,
        },
      })
      await payload.create({
        collection: 'categories',
        data: {
          name: `Fin${searchTerm}`,
          slug: `fintech-${unique.slug}`,
        },
      })

      const result = await payload.find({
        collection: 'categories',
        where: {
          name: {
            contains: searchTerm,
          },
        },
      })

      expect(result.docs.length).toBeGreaterThanOrEqual(2)
    })

    it('devrait trier les résultats par nom', async () => {
      const unique = createUniqueTestData()
      const names = [
        `Zebra ${unique.name}`,
        `Apple ${unique.name}`,
        `Microsoft ${unique.name}`,
      ]

      for (const name of names) {
        await payload.create({
          collection: 'categories',
          // @ts-expect-error - We are testing slug auto-generation
          data: { name },
        })
      }

      const result = await payload.find({
        collection: 'categories',
        sort: 'name',
        where: {
          name: {
            contains: unique.name,
          },
        },
      })

      expect(result.docs).toHaveLength(3)
      expect(result.docs[0].name).toBe(`Apple ${unique.name}`)
      expect(result.docs[1].name).toBe(`Microsoft ${unique.name}`)
      expect(result.docs[2].name).toBe(`Zebra ${unique.name}`)
    })
  })

  describe('Mise à jour de catégories', () => {
    it('devrait mettre à jour une catégorie existante', async () => {
      const unique = createUniqueTestData()
      const categoryData = {
        name: `Old Technology ${unique.name}`,
        slug: `old-tech-${unique.slug}`,
      }

      const created = await payload.create({
        collection: 'categories',
        data: categoryData,
      })

      const updatedName = `New Technology ${unique.name}`
      const updated = await payload.update({
        collection: 'categories',
        id: created.id,
        data: {
          name: updatedName,
          description: 'Updated description',
        },
      })

      expect(updated.name).toBe(updatedName)
      expect(updated.description).toBe('Updated description')
      expect(updated.slug).toBe(categoryData.slug) // Le slug ne doit pas changer
      expect(updated.updatedAt).not.toBe(created.updatedAt)
    })

    it('ne devrait pas permettre de mettre à jour avec un slug déjà utilisé', async () => {
      const unique = createUniqueTestData()

      const category1 = await payload.create({
        collection: 'categories',
        data: {
          name: `Category 1 ${unique.name}`,
          slug: `category-1-${unique.slug}`,
        },
      })

      const category2 = await payload.create({
        collection: 'categories',
        data: {
          name: `Category 2 ${unique.name}`,
          slug: `category-2-${unique.slug}`,
        },
      })

      await expect(
        payload.update({
          collection: 'categories',
          id: category2.id,
          data: {
            slug: category1.slug,
          },
        }),
      ).rejects.toThrow()
    })
  })

  describe('Suppression de catégories', () => {
    it('devrait supprimer une catégorie existante', async () => {
      const unique = createUniqueTestData()
      const categoryData = {
        name: `To Delete ${unique.name}`,
        slug: `to-delete-${unique.slug}`,
      }

      const created = await payload.create({
        collection: 'categories',
        data: categoryData,
      })

      await payload.delete({
        collection: 'categories',
        id: created.id,
      })

      const result = await payload.find({
        collection: 'categories',
        where: {
          id: {
            equals: created.id,
          },
        },
      })

      expect(result.docs).toHaveLength(0)
    })

    it('devrait lever une erreur lors de la suppression d-une catégorie inexistante', async () => {
      await expect(
        payload.delete({
          collection: 'categories',
          id: 999999,
        }),
      ).rejects.toThrow()
    })
  })

  describe('Validation des données', () => {
    it('devrait accepter une catégorie avec seulement un nom', async () => {
      const unique = createUniqueTestData()
      const categoryData = {
        name: `Minimal Category ${unique.name}`,
      }

      const result = await payload.create({
        collection: 'categories',
        // @ts-expect-error - We are testing slug auto-generation
        data: categoryData,
      })

      expect(result.name).toBe(categoryData.name)
      expect(result.slug).toBeDefined()
      expect(result.description).toBeNull()
    })

    it('devrait accepter une description vide ou nulle', async () => {
      const unique = createUniqueTestData()
      const withNullDescription = await payload.create({
        collection: 'categories',
        data: {
          name: `No Description ${unique.name}`,
          slug: `no-description-${unique.slug}`,
          description: null,
        },
      })
      expect(withNullDescription.description).toBeNull()
    })
  })
}) 