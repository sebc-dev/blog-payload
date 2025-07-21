import { describe, it, expect, beforeAll, afterEach, beforeEach } from 'vitest'
import type { Payload } from 'payload'
import { getPayloadClient } from '../../helpers/payload'
import { truncateAllTables } from '../../helpers/database'

describe('Collection Tags - Tests d\'intégration', () => {
  let payload: Payload

  beforeAll(async () => {
    payload = await getPayloadClient()
  })

  afterEach(async () => {
    await truncateAllTables()
  })

  describe('Création de tags', () => {
    it('devrait créer un tag avec des données valides', async () => {
      // Note: En attente de la configuration complète de la localisation
      // Les champs sont définis comme localisés dans la collection mais les types générés ne le reflètent pas encore
      const tagData = {
        name: 'JavaScript',
        slug: 'javascript',
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
      const tagData = {
        name: 'React Hooks'
        // Pas de slug défini pour déclencher l'auto-génération
      }

      const result = await payload.create({
        collection: 'tags',
        // @ts-expect-error Testing auto-generation without slug
        data: tagData
      })

      expect(result.slug).toBe('react-hooks')
    })

    it('devrait normaliser le slug (caractères spéciaux et espaces)', async () => {
      const tagData = {
        name: 'Node.js & Express!'
        // Pas de slug défini pour déclencher l'auto-génération
      }

      const result = await payload.create({
        collection: 'tags',
        // @ts-expect-error Testing auto-generation without slug
        data: tagData
      })

      expect(result.slug).toBe('node-js-express')
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
      const tagData = {
        name: 'Test Tag',
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
      const tagData = {
        name: 'JavaScript',
        slug: 'js'
      }

      await payload.create({
        collection: 'tags',
        data: tagData
      })

      await expect(
        payload.create({
          collection: 'tags',
          data: {
            name: 'JS Framework',
            slug: 'js'
          }
        })
      ).rejects.toThrow()
    })
  })

  describe('Validation des couleurs', () => {
    it('devrait accepter une couleur hexadécimale valide', async () => {
      const validColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFFFF', '#000000', '#3B82F6']

      for (const color of validColors) {
        const tagData = {
          name: `Tag ${color}`,
          slug: `tag-${color.slice(1).toLowerCase()}`,
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

      for (const color of invalidColors) {
        const tagData = {
          name: 'Test Tag',
          slug: `test-tag-${Math.random()}`,
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
      const tagData = {
        name: 'No Color Tag',
        slug: 'no-color-tag'
      }

      const result = await payload.create({
        collection: 'tags',
        data: tagData
      })

      expect(result.color).toBeNull()
    })
  })

  describe('Recherche de tags', () => {
    beforeEach(async () => {
      // Créer quelques tags de test
      const tags = [
        {
          name: 'JavaScript',
          slug: 'javascript',
          color: '#F7DF1E',
          description: 'JS programming'
        },
        {
          name: 'React',
          slug: 'react',
          color: '#61DAFB',
          description: 'React framework'
        },
        {
          name: 'TypeScript',
          slug: 'typescript',
          color: '#3178C6'
        }
      ]

      for (const tag of tags) {
        await payload.create({
          collection: 'tags',
          data: tag
        })
      }
    })

    it('devrait trouver un tag par slug', async () => {
      const result = await payload.find({
        collection: 'tags',
        where: {
          slug: {
            equals: 'javascript'
          }
        }
      })

      expect(result.docs).toHaveLength(1)
      expect(result.docs[0].slug).toBe('javascript')
      expect(result.docs[0].name).toBe('JavaScript')
      expect(result.docs[0].color).toBe('#F7DF1E')
    })

    it('devrait trouver des tags par nom', async () => {
      const result = await payload.find({
        collection: 'tags',
        where: {
          name: {
            contains: 'Script'
          }
        }
      })

      expect(result.docs).toHaveLength(2) // JavaScript et TypeScript
      const names = result.docs.map(doc => doc.name).sort()
      expect(names).toEqual(['JavaScript', 'TypeScript'])
    })

    it('devrait trouver des tags par couleur', async () => {
      const result = await payload.find({
        collection: 'tags',
        where: {
          color: {
            equals: '#61DAFB'
          }
        }
      })

      expect(result.docs).toHaveLength(1)
      expect(result.docs[0].name).toBe('React')
    })

    it('devrait retourner tous les tags triés par nom', async () => {
      const result = await payload.find({
        collection: 'tags',
        sort: 'name'
      })

      expect(result.docs).toHaveLength(3)
      expect(result.docs[0].name).toBe('JavaScript')
      expect(result.docs[1].name).toBe('React')
      expect(result.docs[2].name).toBe('TypeScript')
    })

    it('devrait filtrer les tags qui ont une couleur définie', async () => {
      const result = await payload.find({
        collection: 'tags',
        where: {
          color: {
            not_equals: null
          }
        }
      })

      expect(result.docs).toHaveLength(3)
      expect(result.docs.every(doc => doc.color)).toBe(true)
    })

    it('devrait paginer les résultats correctement', async () => {
      const result = await payload.find({
        collection: 'tags',
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

  describe('Mise à jour de tags', () => {
    it('devrait mettre à jour un tag existant', async () => {
      const tagData = {
        name: 'Old JavaScript',
        slug: 'old-js',
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
          name: 'Modern JavaScript',
          color: '#F7DF1E',
          description: 'Updated description'
        }
      })

      expect(updated.name).toBe('Modern JavaScript')
      expect(updated.color).toBe('#F7DF1E')
      expect(updated.description).toBe('Updated description')
      expect(updated.slug).toBe('old-js') // Le slug ne change pas
      expect(updated.updatedAt).not.toBe(created.updatedAt)
    })

    it('devrait permettre de mettre à jour la couleur', async () => {
      const tagData = {
        name: 'React',
        slug: 'react',
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
          color: '#61DAFB'
        }
      })

      expect(updated.color).toBe('#61DAFB')
    })

    it('devrait permettre de supprimer la couleur', async () => {
      const tagData = {
        name: 'React',
        slug: 'react',
        color: '#61DAFB'
      }

      const created = await payload.create({
        collection: 'tags',
        data: tagData
      })

      const updated = await payload.update({
        collection: 'tags',
        id: created.id,
        data: {
          color: null
        }
      })

      expect(updated.color).toBeNull()
    })

    it('ne devrait pas permettre de mettre à jour avec une couleur invalide', async () => {
      const tagData = {
        name: 'React',
        slug: 'react'
      }

      const created = await payload.create({
        collection: 'tags',
        data: tagData
      })

      await expect(
        payload.update({
          collection: 'tags',
          id: created.id,
          data: {
            color: 'invalid-color'
          }
        })
      ).rejects.toThrow()
    })

    it('ne devrait pas permettre de mettre à jour avec un slug déjà utilisé', async () => {
      const tag1 = await payload.create({
        collection: 'tags',
        data: {
          name: 'Tag 1',
          slug: 'tag-1'
        }
      })

      const tag2 = await payload.create({
        collection: 'tags',
        data: {
          name: 'Tag 2',
          slug: 'tag-2'
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
      const tagData = {
        name: 'To Delete',
        slug: 'to-delete'
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

    it('devrait lever une erreur lors de la suppression d\'un tag inexistant', async () => {
      await expect(
        payload.delete({
          collection: 'tags',
          id: 999999
        })
      ).rejects.toThrow()
    })
  })

  describe('Validation des données', () => {
    it('devrait accepter un tag avec nom et slug uniquement', async () => {
      const tagData = {
        name: 'Minimal Tag',
        slug: 'minimal-tag'
      }

      const result = await payload.create({
        collection: 'tags',
        data: tagData
      })

      expect(result.name).toBe('Minimal Tag')
      expect(result.slug).toBe('minimal-tag')
      expect(result.description).toBeNull()
      expect(result.color).toBeNull()
    })

    it('devrait accepter un tag sans description ni couleur', async () => {
      const tagData = {
        name: 'Simple Tag',
        slug: 'simple-tag'
      }

      const result = await payload.create({
        collection: 'tags',
        data: tagData
      })

      expect(result.name).toBe('Simple Tag')
      expect(result.description).toBeNull()
      expect(result.color).toBeNull()
    })
  })
})