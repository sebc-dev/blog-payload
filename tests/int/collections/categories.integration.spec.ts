/**
 * Tests d'intégration pour la collection Categories
 * Utilise l'isolation par nommage unique pour éviter les conflits
 */

import { describe, it, expect, beforeAll, afterEach } from 'vitest'
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

  /**
   * Helper pour générer des données uniques et éviter les conflits
   * entre tests parallèles ou séquentiels
   */
  const createUniqueData = () => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(7)
    const workerId = process.env.VITEST_WORKER_ID || '1'
    return {
      id: `${workerId}_${timestamp}_${random}`,
      name: (base: string) => `${base} ${workerId}_${timestamp}_${random}`,
      slug: (base: string) => `${base}-${workerId}-${timestamp}-${random}`
    }
  }

  describe('Création de catégories', () => {
    it('devrait créer une catégorie avec des données valides', async () => {
      const unique = createUniqueData()
      const categoryData = {
        name: unique.name('Technology'),
        slug: unique.slug('technology'),
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
      const unique = createUniqueData()
      const categoryData = {
        name: unique.name('Web Development')
        // Pas de slug défini pour déclencher l'auto-génération
      }

      const result = await payload.create({
        collection: 'categories',
        // @ts-expect-error Testing auto-generation without slug
        data: categoryData
      })

      expect(result.slug).toMatch(/web-development/)
      expect(result.name).toBe(categoryData.name)
    })

    it('devrait normaliser le slug avec caractères spéciaux', async () => {
      const unique = createUniqueData()
      const categoryData = {
        name: unique.name('Machine Learning & AI!')
        // Auto-génération du slug avec normalisation
      }

      const result = await payload.create({
        collection: 'categories',
        // @ts-expect-error Testing auto-generation without slug
        data: categoryData
      })

      expect(result.slug).toMatch(/machine-learning-ai/)
      expect(result.slug).not.toMatch(/[&!]/) // Pas de caractères spéciaux
    })

    it('ne devrait pas créer une catégorie sans nom requis', async () => {
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

    it('ne devrait pas accepter un slug vide explicite', async () => {
      const unique = createUniqueData()
      const categoryData = {
        name: unique.name('Test Category'),
        slug: '' // Explicitement vide - doit être rejeté
      }

      await expect(
        payload.create({
          collection: 'categories',
          data: categoryData
        })
      ).rejects.toThrow('Slug cannot be empty')
    })

    it('ne devrait pas créer deux catégories avec le même slug', async () => {
      const unique = createUniqueData()
      const sharedSlug = unique.slug('duplicate-test')
      
      // Première catégorie
      await payload.create({
        collection: 'categories',
        data: {
          name: unique.name('First Category'),
          slug: sharedSlug
        }
      })

      // Tentative de création d'une deuxième avec le même slug
      await expect(
        payload.create({
          collection: 'categories',
          data: {
            name: unique.name('Second Category'),
            slug: sharedSlug // Même slug = doit échouer
          }
        })
      ).rejects.toThrow() // Contrainte d'unicité
    })
  })

  describe('Recherche et filtrage', () => {
    it('devrait trouver une catégorie par slug exact', async () => {
      const unique = createUniqueData()
      const categoryData = {
        name: unique.name('Searchable Category'),
        slug: unique.slug('searchable-category'),
        description: 'Category for search testing'
      }

      // Créer la catégorie
      await payload.create({
        collection: 'categories',
        data: categoryData
      })

      // Rechercher par slug
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
      expect(result.docs[0].description).toBe(categoryData.description)
    })

    it('devrait trouver des catégories par recherche textuelle', async () => {
      const unique = createUniqueData()
      const searchTerm = `SearchTest${unique.id}`
      
      // Créer plusieurs catégories avec le terme de recherche
      const categoriesData = [
        {
          name: `${searchTerm} Technology`,
          slug: unique.slug('tech-search'),
          description: 'Tech category'
        },
        {
          name: `Advanced ${searchTerm}`,
          slug: unique.slug('advanced-search'),
          description: 'Advanced category'
        },
        {
          name: unique.name('Other Category'), // Sans le terme de recherche
          slug: unique.slug('other'),
          description: 'Should not be found'
        }
      ]

      // Créer toutes les catégories
      for (const categoryData of categoriesData) {
        await payload.create({
          collection: 'categories',
          data: categoryData
        })
      }

      // Rechercher par nom contenant le terme
      const result = await payload.find({
        collection: 'categories',
        where: {
          name: {
            contains: searchTerm
          }
        }
      })

      expect(result.docs).toHaveLength(2) // Seulement celles avec le terme
      expect(result.docs.every(doc => doc.name.includes(searchTerm))).toBe(true)
    })

    it('devrait trier les résultats par nom', async () => {
      const unique = createUniqueData()
      
      // Créer des catégories dans un ordre non alphabétique
      const categoriesData = [
        {
          name: `Z ${unique.name('Zebra')}`,
          slug: unique.slug('zebra'),
        },
        {
          name: `A ${unique.name('Apple')}`,
          slug: unique.slug('apple'),
        },
        {
          name: `M ${unique.name('Middle')}`,
          slug: unique.slug('middle'),
        }
      ]

      for (const categoryData of categoriesData) {
        await payload.create({
          collection: 'categories',
          data: categoryData
        })
      }

      // Rechercher avec tri par nom
      const result = await payload.find({
        collection: 'categories',
        where: {
          name: {
            contains: unique.id // Filtrer nos données de test
          }
        },
        sort: 'name'
      })

      expect(result.docs).toHaveLength(3)
      expect(result.docs[0].name).toMatch(/^A/) // Apple en premier
      expect(result.docs[1].name).toMatch(/^M/) // Middle au milieu
      expect(result.docs[2].name).toMatch(/^Z/) // Zebra en dernier
    })

    it('devrait paginer correctement les résultats', async () => {
      const unique = createUniqueData()
      
      // Créer 5 catégories de test
      const categoriesData = Array.from({ length: 5 }, (_, index) => ({
        name: unique.name(`Category ${index + 1}`),
        slug: unique.slug(`category-${index + 1}`)
      }))

      for (const categoryData of categoriesData) {
        await payload.create({
          collection: 'categories',
          data: categoryData
        })
      }

      // Première page (2 éléments)
      const page1 = await payload.find({
        collection: 'categories',
        where: {
          name: {
            contains: unique.id
          }
        },
        limit: 2,
        page: 1,
        sort: 'name'
      })

      expect(page1.docs).toHaveLength(2)
      expect(page1.totalDocs).toBe(5)
      expect(page1.totalPages).toBe(3)
      expect(page1.page).toBe(1)
      expect(page1.hasNextPage).toBe(true)
      expect(page1.hasPrevPage).toBe(false)

      // Deuxième page
      const page2 = await payload.find({
        collection: 'categories',
        where: {
          name: {
            contains: unique.id
          }
        },
        limit: 2,
        page: 2,
        sort: 'name'
      })

      expect(page2.docs).toHaveLength(2)
      expect(page2.page).toBe(2)
      expect(page2.hasNextPage).toBe(true)
      expect(page2.hasPrevPage).toBe(true)
    })
  })

  describe('Mise à jour de catégories', () => {
    it('devrait mettre à jour une catégorie existante', async () => {
      const unique = createUniqueData()
      const originalData = {
        name: unique.name('Original Category'),
        slug: unique.slug('original'),
        description: 'Original description'
      }

      // Créer la catégorie
      const created = await payload.create({
        collection: 'categories',
        data: originalData
      })

      // Mettre à jour
      const updatedData = {
        name: unique.name('Updated Category'),
        description: 'Updated description'
      }

      const updated = await payload.update({
        collection: 'categories',
        id: created.id,
        data: updatedData
      })

      expect(updated.name).toBe(updatedData.name)
      expect(updated.description).toBe(updatedData.description)
      expect(updated.slug).toBe(originalData.slug) // Slug ne change pas
      expect(updated.updatedAt).not.toBe(created.updatedAt)
      expect(updated.createdAt).toBe(created.createdAt)
    })

    it('devrait permettre de mettre à jour le slug', async () => {
      const unique = createUniqueData()
      const categoryData = {
        name: unique.name('Category'),
        slug: unique.slug('old-slug')
      }

      const created = await payload.create({
        collection: 'categories',
        data: categoryData
      })

      const newSlug = unique.slug('new-slug')
      const updated = await payload.update({
        collection: 'categories',
        id: created.id,
        data: {
          slug: newSlug
        }
      })

      expect(updated.slug).toBe(newSlug)
    })

    it('ne devrait pas permettre de mettre à jour avec un slug déjà utilisé', async () => {
      const unique = createUniqueData()
      
      // Créer deux catégories
      const category1 = await payload.create({
        collection: 'categories',
        data: {
          name: unique.name('Category 1'),
          slug: unique.slug('category-1')
        }
      })

      const category2 = await payload.create({
        collection: 'categories',
        data: {
          name: unique.name('Category 2'),
          slug: unique.slug('category-2')
        }
      })

      // Tenter de mettre à jour category2 avec le slug de category1
      await expect(
        payload.update({
          collection: 'categories',
          id: category2.id,
          data: {
            slug: category1.slug // Conflit d'unicité
          }
        })
      ).rejects.toThrow()
    })
  })

  describe('Suppression de catégories', () => {
    it('devrait supprimer une catégorie existante', async () => {
      const unique = createUniqueData()
      const categoryData = {
        name: unique.name('Category to Delete'),
        slug: unique.slug('to-delete')
      }

      // Créer la catégorie
      const created = await payload.create({
        collection: 'categories',
        data: categoryData
      })

      // Supprimer
      await payload.delete({
        collection: 'categories',
        id: created.id
      })

      // Vérifier la suppression
      const searchResult = await payload.find({
        collection: 'categories',
        where: {
          id: {
            equals: created.id
          }
        }
      })

      expect(searchResult.docs).toHaveLength(0)
    })

    it('devrait lever une erreur pour une suppression d\'ID inexistant', async () => {
      await expect(
        payload.delete({
          collection: 'categories',
          id: 999999 // ID inexistant
        })
      ).rejects.toThrow()
    })
  })

  describe('Validation des données', () => {
    it('devrait accepter une catégorie minimaliste (nom + slug auto-généré)', async () => {
      const unique = createUniqueData()
      const minimalData = {
        name: unique.name('Minimal Category')
        // Pas de slug (auto-généré), pas de description (optionnelle)
      }

      const result = await payload.create({
        collection: 'categories',
        // @ts-expect-error Testing minimal data
        data: minimalData
      })

      expect(result.name).toBe(minimalData.name)
      expect(result.slug).toMatch(/minimal-category/)
      expect(result.description).toBeNull()
    })

    it('devrait accepter une catégorie avec description nulle ou vide', async () => {
      const unique = createUniqueData()
      const categoryData = {
        name: unique.name('Category Without Description'),
        slug: unique.slug('no-description'),
        description: null
      }

      const result = await payload.create({
        collection: 'categories',
        data: categoryData
      })

      expect(result.name).toBe(categoryData.name)
      expect(result.slug).toBe(categoryData.slug)
      expect(result.description).toBeNull()
    })

    it('devrait valider les champs requis', async () => {
      // Test avec des données complètement vides
      await expect(
        payload.create({
          collection: 'categories',
          data: {}
        })
      ).rejects.toThrow() // Le champ 'name' est requis
    })
  })
})