import { describe, it, expect, beforeAll, afterEach, beforeEach } from 'vitest'
import type { Payload } from 'payload'
import { getPayloadClient } from '../../helpers/payload'
import { truncateAllTables } from '../../helpers/database'

describe('Collection Categories - Tests d\'intégration', () => {
  let payload: Payload

  beforeAll(async () => {
    payload = await getPayloadClient()
  })

  afterEach(async () => {
    await truncateAllTables()
  })

  describe('Création de catégories', () => {
    it('devrait créer une catégorie avec des données valides', async () => {
      // Note: En attente de la configuration complète de la localisation
      // Les champs sont définis comme localisés dans la collection mais les types générés ne le reflètent pas encore
      const categoryData = {
        name: 'Technology',
        slug: 'technology',
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
      const categoryData = {
        name: 'Web Development'
        // Pas de slug défini pour déclencher l'auto-génération
      }

      const result = await payload.create({
        collection: 'categories',
        // @ts-expect-error Testing auto-generation without slug
        data: categoryData
      })

      expect(result.slug).toBe('web-development')
    })

    it('devrait normaliser le slug (caractères spéciaux et espaces)', async () => {
      const categoryData = {
        name: 'Machine Learning & AI!'
        // Pas de slug défini pour déclencher l'auto-génération
      }

      const result = await payload.create({
        collection: 'categories',
        // @ts-expect-error Testing auto-generation without slug
        data: categoryData
      })

      expect(result.slug).toBe('machine-learning-ai')
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
      const categoryData = {
        name: 'Test Category',
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
      const categoryData = {
        name: 'Technology',
        slug: 'tech'
      }

      await payload.create({
        collection: 'categories',
        data: categoryData
      })

      await expect(
        payload.create({
          collection: 'categories',
          data: {
            name: 'Tech News',
            slug: 'tech'
          }
        })
      ).rejects.toThrow()
    })
  })

  describe('Recherche de catégories', () => {
    beforeEach(async () => {
      // Créer quelques catégories de test
      const categories = [
        {
          name: 'Technology',
          slug: 'technology',
          description: 'Tech posts'
        },
        {
          name: 'Design',
          slug: 'design',
          description: 'Design posts'
        },
        {
          name: 'Programming',
          slug: 'programming'
        }
      ]

      for (const category of categories) {
        await payload.create({
          collection: 'categories',
          data: category
        })
      }
    })

    it('devrait trouver une catégorie par slug', async () => {
      const result = await payload.find({
        collection: 'categories',
        where: {
          slug: {
            equals: 'technology'
          }
        }
      })

      expect(result.docs).toHaveLength(1)
      expect(result.docs[0].slug).toBe('technology')
      expect(result.docs[0].name).toBe('Technology')
    })

    it('devrait trouver des catégories par nom', async () => {
      const result = await payload.find({
        collection: 'categories',
        where: {
          name: {
            contains: 'Tech'
          }
        }
      })

      expect(result.docs).toHaveLength(1)
      expect(result.docs[0].name).toBe('Technology')
    })

    it('devrait retourner toutes les catégories triées par nom', async () => {
      const result = await payload.find({
        collection: 'categories',
        sort: 'name'
      })

      expect(result.docs).toHaveLength(3)
      expect(result.docs[0].name).toBe('Design')
      expect(result.docs[1].name).toBe('Programming')
      expect(result.docs[2].name).toBe('Technology')
    })

    it('devrait paginer les résultats correctement', async () => {
      const result = await payload.find({
        collection: 'categories',
        limit: 2,
        page: 1,
        sort: 'name'
      })

      expect(result.docs).toHaveLength(2)
      expect(result.totalDocs).toBe(3)
      expect(result.totalPages).toBe(2)
      expect(result.page).toBe(1)
    })
  })

  describe('Mise à jour de catégories', () => {
    it('devrait mettre à jour une catégorie existante', async () => {
      const categoryData = {
        name: 'Old Technology',
        slug: 'old-tech'
      }

      const created = await payload.create({
        collection: 'categories',
        data: categoryData
      })

      const updated = await payload.update({
        collection: 'categories',
        id: created.id,
        data: {
          name: 'New Technology',
          description: 'Updated description'
        }
      })

      expect(updated.name).toBe('New Technology')
      expect(updated.description).toBe('Updated description')
      expect(updated.slug).toBe('old-tech') // Le slug ne change pas
      expect(updated.updatedAt).not.toBe(created.updatedAt)
    })

    it('devrait permettre de mettre à jour le slug', async () => {
      const categoryData = {
        name: 'Technology',
        slug: 'old-slug'
      }

      const created = await payload.create({
        collection: 'categories',
        data: categoryData
      })

      const updated = await payload.update({
        collection: 'categories',
        id: created.id,
        data: {
          slug: 'new-slug'
        }
      })

      expect(updated.slug).toBe('new-slug')
    })

    it('ne devrait pas permettre de mettre à jour avec un slug déjà utilisé', async () => {
      const category1 = await payload.create({
        collection: 'categories',
        data: {
          name: 'Category 1',
          slug: 'category-1'
        }
      })

      const category2 = await payload.create({
        collection: 'categories',
        data: {
          name: 'Category 2',
          slug: 'category-2'
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
      const categoryData = {
        name: 'To Delete',
        slug: 'to-delete'
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
      const categoryData = {
        name: 'Minimal Category',
        slug: 'minimal-category'
      }

      const result = await payload.create({
        collection: 'categories',
        data: categoryData
      })

      expect(result.name).toBe('Minimal Category')
      expect(result.slug).toBe('minimal-category')
      expect(result.description).toBeNull()
    })

    it('devrait accepter une description vide', async () => {
      const categoryData = {
        name: 'No Description',
        slug: 'no-description'
      }

      const result = await payload.create({
        collection: 'categories',
        data: categoryData
      })

      expect(result.name).toBe('No Description')
      expect(result.description).toBeNull()
    })
  })
})