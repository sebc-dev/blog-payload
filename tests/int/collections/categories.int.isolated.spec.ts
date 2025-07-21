import { describe, it, expect, beforeAll } from 'vitest'
import type { Payload } from 'payload'
import { getPayloadClient } from '../../helpers/payload'
import { useTestDatabase, createUniqueTestData } from '../../helpers/database-isolation'

describe('Collection Categories - Tests d\'intégration avec isolation', () => {
  // Active l'isolation transactionnelle
  useTestDatabase()
  
  let payload: Payload

  beforeAll(async () => {
    payload = await getPayloadClient()
  })

  describe('Création de catégories', () => {
    it('devrait créer une catégorie avec des données valides', async () => {
      const unique = createUniqueTestData()
      const categoryData = {
        name: `Technology ${unique.name}`,
        slug: `technology-${unique.slug}`,
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
      const unique = createUniqueTestData()
      const categoryData = {
        name: `Web Development ${unique.name}`
        // Pas de slug défini pour déclencher l'auto-génération
      }

      const result = await payload.create({
        collection: 'categories',
        // @ts-expect-error Testing auto-generation without slug
        data: categoryData
      })

      expect(result.slug).toBe(`web-development-${unique.name.toLowerCase().replace(/\s+/g, '-')}`)
    })

    it('devrait normaliser le slug (caractères spéciaux et espaces)', async () => {
      const unique = createUniqueTestData()
      const categoryData = {
        name: `Machine Learning & AI! ${unique.name}`
        // Pas de slug défini pour déclencher l'auto-génération
      }

      const result = await payload.create({
        collection: 'categories',
        // @ts-expect-error Testing auto-generation without slug
        data: categoryData
      })

      expect(result.slug).toMatch(/machine-learning-ai/)
    })

    it('ne devrait pas créer une catégorie sans nom', async () => {
      const categoryData = {
        description: 'A category without name'
      }

      await expect(
        payload.create({
          collection: 'categories',
          // @ts-expect-error Testing invalid data
          data: categoryData
        })
      ).rejects.toThrow()
    })

    it('ne devrait pas créer une catégorie avec un slug vide', async () => {
      const unique = createUniqueTestData()
      const categoryData = {
        name: `Test Category ${unique.name}`,
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
      const unique = createUniqueTestData()
      const categoryData = {
        name: `Technology ${unique.name}`,
        slug: `tech-${unique.slug}`
      }

      await payload.create({
        collection: 'categories',
        data: categoryData
      })

      await expect(
        payload.create({
          collection: 'categories',
          data: {
            name: `Tech News ${unique.name}`,
            slug: `tech-${unique.slug}` // Même slug
          }
        })
      ).rejects.toThrow()
    })
  })

  describe('Recherche de catégories', () => {
    it('devrait trouver une catégorie par slug', async () => {
      const unique = createUniqueTestData()
      const categoryData = {
        name: `Technology ${unique.name}`,
        slug: `technology-${unique.slug}`,
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

    it('devrait trouver des catégories par nom', async () => {
      const unique = createUniqueTestData()
      const searchTerm = `Tech${unique.slug}`
      
      // Créer des catégories avec le terme de recherche
      await payload.create({
        collection: 'categories',
        data: {
          name: `${searchTerm}nology`,
          slug: `technology-${unique.slug}`,
          description: 'Tech posts'
        }
      })

      await payload.create({
        collection: 'categories',
        data: {
          name: `Fin${searchTerm}`,
          slug: `fintech-${unique.slug}`,
          description: 'Financial tech'
        }
      })

      const result = await payload.find({
        collection: 'categories',
        where: {
          name: {
            contains: searchTerm
          }
        }
      })

      expect(result.docs.length).toBeGreaterThanOrEqual(2)
    })

    it('devrait retourner toutes les catégories triées par nom', async () => {
      const unique = createUniqueTestData()
      
      const categories = [
        {
          name: `Design ${unique.name}`,
          slug: `design-${unique.slug}`,
          description: 'Design posts'
        },
        {
          name: `Programming ${unique.name}`,
          slug: `programming-${unique.slug}`
        },
        {
          name: `Technology ${unique.name}`,
          slug: `technology-${unique.slug}`,
          description: 'Tech posts'
        }
      ]

      // Créer les catégories
      for (const category of categories) {
        await payload.create({
          collection: 'categories',
          data: category
        })
      }

      const result = await payload.find({
        collection: 'categories',
        sort: 'name',
        where: {
          name: {
            contains: unique.name // Filtrer sur nos données de test
          }
        }
      })

      expect(result.docs).toHaveLength(3)
      expect(result.docs[0].name).toBe(`Design ${unique.name}`)
      expect(result.docs[1].name).toBe(`Programming ${unique.name}`)
      expect(result.docs[2].name).toBe(`Technology ${unique.name}`)
    })
  })

  describe('Mise à jour de catégories', () => {
    it('devrait mettre à jour une catégorie existante', async () => {
      const unique = createUniqueTestData()
      const categoryData = {
        name: `Old Technology ${unique.name}`,
        slug: `old-tech-${unique.slug}`
      }

      const created = await payload.create({
        collection: 'categories',
        data: categoryData
      })

      const updated = await payload.update({
        collection: 'categories',
        id: created.id,
        data: {
          name: `New Technology ${unique.name}`,
          description: 'Updated description'
        }
      })

      expect(updated.name).toBe(`New Technology ${unique.name}`)
      expect(updated.description).toBe('Updated description')
      expect(updated.slug).toBe(`old-tech-${unique.slug}`) // Le slug ne change pas
      expect(updated.updatedAt).not.toBe(created.updatedAt)
    })

    it('ne devrait pas permettre de mettre à jour avec un slug déjà utilisé', async () => {
      const unique = createUniqueTestData()
      
      const category1 = await payload.create({
        collection: 'categories',
        data: {
          name: `Category 1 ${unique.name}`,
          slug: `category-1-${unique.slug}`
        }
      })

      const category2 = await payload.create({
        collection: 'categories',
        data: {
          name: `Category 2 ${unique.name}`,
          slug: `category-2-${unique.slug}`
        }
      })

      await expect(
        payload.update({
          collection: 'categories',
          id: category2.id,
          data: {
            slug: category1.slug
          }
        })
      ).rejects.toThrow()
    })
  })

  describe('Suppression de catégories', () => {
    it('devrait supprimer une catégorie existante', async () => {
      const unique = createUniqueTestData()
      const categoryData = {
        name: `To Delete ${unique.name}`,
        slug: `to-delete-${unique.slug}`
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

    it('devrait lever une erreur lors de la suppression d\'une catégorie inexistante', async () => {
      await expect(
        payload.delete({
          collection: 'categories',
          id: 999999
        })
      ).rejects.toThrow()
    })
  })

  describe('Validation des données', () => {
    it('devrait accepter une catégorie avec nom et slug uniquement', async () => {
      const unique = createUniqueTestData()
      const categoryData = {
        name: `Minimal Category ${unique.name}`,
        slug: `minimal-category-${unique.slug}`
      }

      const result = await payload.create({
        collection: 'categories',
        data: categoryData
      })

      expect(result.name).toBe(`Minimal Category ${unique.name}`)
      expect(result.slug).toBe(`minimal-category-${unique.slug}`)
      expect(result.description).toBeNull()
    })

    it('devrait accepter une description vide', async () => {
      const unique = createUniqueTestData()
      const categoryData = {
        name: `No Description ${unique.name}`,
        slug: `no-description-${unique.slug}`
      }

      const result = await payload.create({
        collection: 'categories',
        data: categoryData
      })

      expect(result.name).toBe(`No Description ${unique.name}`)
      expect(result.description).toBeNull()
    })
  })
})