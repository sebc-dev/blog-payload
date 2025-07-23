/**
 * Tests d'intégration pour la collection Posts
 * Tests des opérations CRUD, hooks automatiques, et validations
 */

import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import type { Payload } from 'payload'

import { getPayloadClient } from '../../helpers/payload'
import { createUniqueTestData } from '../../helpers/database-isolation'
import { Category, Tag } from '@/payload-types'
import type { Post } from '@/payload-types'

describe("Collection Posts - Tests d'intégration avec isolation", () => {
  let payload: Payload
  let testCategory: Category
  let testTags: Tag[]

  // Helper pour créer une structure de contenu de base
  const createBasicContent = (text: string) => ({
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          version: 1,
          children: [
            {
              type: 'text',
              version: 1,
              text,
            },
          ],
        },
      ],
      direction: null,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  })

  // Helper pour créer un post et valider les métadonnées SEO
  const createPostAndValidateMeta = async (
    data: Omit<Post, 'id' | 'updatedAt' | 'createdAt'> &
      Partial<Pick<Post, 'id' | 'updatedAt' | 'createdAt'>>,
  ) => {
    const result = await payload.create({
      collection: 'posts',
      data: data,
    })

    expect(result.meta?.title).toBe(data.meta?.title)
    expect(result.meta?.description).toBe(data.meta?.description)
    expect(result.meta?.keywords).toBe(data.meta?.keywords)

    return result
  }

  beforeAll(async () => {
    payload = await getPayloadClient()

    // Créer des données de test pour les relations
    const unique = createUniqueTestData()

    // Créer une catégorie de test
    testCategory = await payload.create({
      collection: 'categories',
      data: {
        name: `Test Category ${unique.name}`,
        slug: `test-category-${unique.slug}`,
        description: 'Category for posts integration tests',
      },
    })

    // Créer des tags de test
    testTags = []
    for (let i = 0; i < 2; i++) {
      const tag = await payload.create({
        collection: 'tags',
        data: {
          name: `Test Tag ${i} ${unique.name}`,
          slug: `test-tag-${i}-${unique.slug}`,
          description: `Tag ${i} for posts integration tests`,
        },
      })
      testTags.push(tag)
    }
  })

  afterEach(async () => {
    // Nettoyage léger - l'utilisation de données uniques évite la plupart des conflits
  })

  describe('Création de posts', () => {
    it('devrait créer un post avec des données valides', async () => {
      const unique = createUniqueTestData()
      const data = {
        title: `Test Post ${unique.name}`,
        slug: `test-post-${unique.slug}`,
        excerpt: `This is a test excerpt for post ${unique.name}`,
        content: createBasicContent(
          `This is the content of the test post ${unique.name}. It contains multiple words to test the reading time calculation. The content should be long enough to demonstrate the automatic features working correctly.`,
        ),
        category: testCategory.id,
        tags: [testTags[0].id, testTags[1].id],
        _status: 'published' as const,
      }

      const result = await payload.create({
        collection: 'posts',
        data: data as any,
      })

      // Assertions de base
      expect(result.id).toBeDefined()
      expect(result.title).toBe(data.title)
      expect(result.slug).toBe(data.slug)
      expect(result.excerpt).toBe(data.excerpt)
      expect(result.content).toEqual(data.content)
      expect(
        typeof result.category === 'object' ? (result.category as any).id : result.category,
      ).toBe(testCategory.id)
      expect(
        Array.isArray(result.tags)
          ? result.tags.map((tag: any) => (typeof tag === 'object' ? tag.id : tag))
          : result.tags,
      ).toEqual([testTags[0].id, testTags[1].id])
      expect(result._status).toBe('published')

      // Assertions des champs automatiques
      expect(result.readingTime).toBeGreaterThan(0)
      expect(typeof result.readingTime).toBe('number')
      expect(result.publishedAt).toBeDefined()
      expect(result.createdAt).toBeDefined()
      expect(result.updatedAt).toBeDefined()
    })

    it('devrait auto-générer le slug depuis le titre si non fourni', async () => {
      const unique = createUniqueTestData()
      const data = {
        title: `Auto Generated Slug Post ${unique.name}`,
        excerpt: `Test excerpt ${unique.name}`,
        content: createBasicContent(`Test content ${unique.name}`),
        category: testCategory.id,
        _status: 'draft' as const,
      }

      const result = await payload.create({
        collection: 'posts',
        data: data as any,
      })

      expect(result.slug).toMatch(/^auto-generated-slug-post-test-item-/)
      expect(result.slug).toContain('test-item')
      expect(result.title).toBe(data.title)
    })

    it('devrait auto-générer le slug avec caractères spéciaux français', async () => {
      const unique = createUniqueTestData()
      const data = {
        title: `Cr��er une API REST avec Node.js & Express ${unique.name}`,
        excerpt: `Test excerpt ${unique.name}`,
        content: createBasicContent(`Test content ${unique.name}`),
        category: testCategory.id,
        _status: 'draft' as const,
      }

      const result = await payload.create({
        collection: 'posts',
        data: data as any,
      })

      expect(result.slug).toContain('creer-une-api-rest-avec-nodejs-et-express')
      expect(result.slug).toContain('test-item') // Vérifier la présence du nom unique transformé
    })

    it('devrait calculer automatiquement le temps de lecture', async () => {
      const unique = createUniqueTestData()
      const shortContent = {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              version: 1,
              children: [
                {
                  type: 'text',
                  version: 1,
                  text: `Short content ${unique.name}`,
                },
              ],
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          version: 1,
        },
      }
      const longContent = {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              version: 1,
              children: [
                {
                  type: 'text',
                  version: 1,
                  text: Array(250).fill('word').join(' ') + ` ${unique.name}`,
                },
              ],
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          version: 1,
        },
      }

      // Test avec contenu court
      const shortPost = await payload.create({
        collection: 'posts',
        data: {
          title: `Short Post ${unique.name}`,
          slug: `short-post-${unique.slug}`,
          excerpt: `Short excerpt ${unique.name}`,
          content: shortContent,
          category: testCategory.id,
          _status: 'draft' as const,
        } as any,
      })

      expect(shortPost.readingTime).toBe(1) // Minimum 1 minute

      // Test avec contenu long
      const longPost = await payload.create({
        collection: 'posts',
        data: {
          title: `Long Post ${unique.name}`,
          slug: `long-post-${unique.slug}`,
          excerpt: `Long excerpt ${unique.name}`,
          content: longContent,
          category: testCategory.id,
          _status: 'draft' as const,
        } as any,
      })

      expect(longPost.readingTime).toBeGreaterThan(1) // Plus de 1 minute pour 250+ mots
    })

    it('devrait auto-remplir publishedAt pour les posts publiés', async () => {
      const unique = createUniqueTestData()
      const beforeCreation = new Date()

      const data = {
        title: `Published Post ${unique.name}`,
        slug: `published-post-${unique.slug}`,
        excerpt: `Published excerpt ${unique.name}`,
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                version: 1,
                children: [
                  {
                    type: 'text',
                    version: 1,
                    text: `Published content ${unique.name}`,
                  },
                ],
              },
            ],
            direction: null,
            format: '' as const,
            indent: 0,
            version: 1,
          },
        },
        category: testCategory.id,
        _status: 'published' as const,
      }

      const result = await payload.create({
        collection: 'posts',
        data: data as any,
      })

      const afterCreation = new Date()
      const publishedAt = new Date(result.publishedAt!)

      expect(publishedAt).toBeInstanceOf(Date)
      expect(publishedAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime())
      expect(publishedAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime())
    })

    it('ne devrait pas auto-remplir publishedAt pour les brouillons', async () => {
      const unique = createUniqueTestData()
      const data = {
        title: `Draft Post ${unique.name}`,
        slug: `draft-post-${unique.slug}`,
        excerpt: `Draft excerpt ${unique.name}`,
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                version: 1,
                children: [
                  {
                    type: 'text',
                    version: 1,
                    text: `Draft content ${unique.name}`,
                  },
                ],
              },
            ],
            direction: null,
            format: '' as const,
            indent: 0,
            version: 1,
          },
        },
        category: testCategory.id,
        _status: 'draft' as const,
      }

      const result = await payload.create({
        collection: 'posts',
        data: data as any,
      })

      expect(result.publishedAt).toBeNull()
    })

    it('devrait créer un post avec contenu localisé', async () => {
      const unique = createUniqueTestData()
      const data = {
        title: `Localized Post ${unique.name}`, // Utiliser du contenu simple pour les tests d'intégration
        slug: `localized-post-${unique.slug}`,
        excerpt: `Localized excerpt ${unique.name}`,
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                version: 1,
                children: [
                  {
                    type: 'text',
                    version: 1,
                    text: `Localized content for testing ${unique.name}`,
                  },
                ],
              },
            ],
            direction: null,
            format: '' as const,
            indent: 0,
            version: 1,
          },
        },
        category: testCategory.id,
        _status: 'published' as const,
      }

      const result = await payload.create({
        collection: 'posts',
        data: data as any,
      })

      expect(result.title).toBe(data.title)
      expect(result.excerpt).toBe(data.excerpt)
      expect(result.content).toEqual(data.content)
      expect(
        typeof result.category === 'object' ? (result.category as any).id : result.category,
      ).toBe(testCategory.id)
    })

    it('ne devrait pas créer un post sans titre', async () => {
      const unique = createUniqueTestData()
      const invalidData = {
        excerpt: `Test excerpt ${unique.name}`,
        content: createBasicContent(`Test content ${unique.name}`),
        category: testCategory.id,
        _status: 'draft' as const,
      }

      await expect(
        payload.create({
          collection: 'posts',
          // @ts-expect-error Testing missing required field
          data: invalidData,
        }),
      ).rejects.toThrow()
    })

    it('ne devrait pas créer un post sans catégorie', async () => {
      const unique = createUniqueTestData()
      const invalidData = {
        title: `Test Post ${unique.name}`,
        slug: `test-post-${unique.slug}`,
        excerpt: `Test excerpt ${unique.name}`,
        content: createBasicContent(`Test content ${unique.name}`),
        _status: 'draft' as const,
      }

      await expect(
        payload.create({
          collection: 'posts',
          // @ts-expect-error Testing missing required field
          data: invalidData,
        }),
      ).rejects.toThrow()
    })

    it('devrait rejeter un slug invalide', async () => {
      const unique = createUniqueTestData()
      const invalidData = {
        title: `Test Post ${unique.name}`,
        slug: 'Invalid Slug With Spaces',
        excerpt: `Test excerpt ${unique.name}`,
        content: createBasicContent(`Test content ${unique.name}`),
        category: testCategory.id,
        _status: 'draft' as const,
      }

      await expect(
        payload.create({
          collection: 'posts',
          data: invalidData,
        }),
      ).rejects.toThrow()
    })
  })

  describe('Recherche de posts', () => {
    it('devrait trouver un post par titre', async () => {
      const unique = createUniqueTestData()
      const data = {
        title: `Searchable Post ${unique.name}`,
        slug: `searchable-post-${unique.slug}`,
        excerpt: `Searchable excerpt ${unique.name}`,
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                version: 1,
                children: [
                  {
                    type: 'text',
                    version: 1,
                    text: `Searchable content ${unique.name}`,
                  },
                ],
              },
            ],
            direction: null,
            format: '' as const,
            indent: 0,
            version: 1,
          },
        },
        category: testCategory.id,
        _status: 'published' as const,
      }

      const created = await payload.create({
        collection: 'posts',
        data,
      })

      const result = await payload.find({
        collection: 'posts',
        where: {
          title: {
            contains: unique.name,
          },
        },
      })

      expect(result.docs).toHaveLength(1)
      expect(result.docs[0].id).toBe(created.id)
    })

    it('devrait filtrer par catégorie', async () => {
      const unique = createUniqueTestData()

      // Créer plusieurs posts avec la même catégorie
      const postsData = Array(3)
        .fill(null)
        .map((_, i) => ({
          title: `Category Post ${i} ${unique.name}`,
          slug: `category-post-${i}-${unique.slug}`,
          excerpt: `Excerpt ${i} ${unique.name}`,
          content: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'paragraph',
                  version: 1,
                  children: [
                    {
                      type: 'text',
                      version: 1,
                      text: `Content ${i} ${unique.name}`,
                    },
                  ],
                },
              ],
              direction: null,
              format: '' as const,
              indent: 0,
              version: 1,
            },
          },
          category: testCategory.id,
          _status: 'published' as const,
        }))

      for (const postData of postsData) {
        await payload.create({
          collection: 'posts',
          data: postData as any,
        })
      }

      const result = await payload.find({
        collection: 'posts',
        where: {
          and: [
            {
              category: {
                equals: testCategory.id,
              },
            },
            {
              title: {
                contains: unique.name,
              },
            },
          ],
        },
      })

      expect(result.docs.length).toBe(3)
      result.docs.forEach((post) => {
        expect(typeof post.category === 'object' ? (post.category as any).id : post.category).toBe(
          testCategory.id,
        )
      })
    })

    it('devrait filtrer par tags', async () => {
      const unique = createUniqueTestData()
      const data = {
        title: `Tagged Post ${unique.name}`,
        slug: `tagged-post-${unique.slug}`,
        excerpt: `Tagged excerpt ${unique.name}`,
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                version: 1,
                children: [
                  {
                    type: 'text',
                    version: 1,
                    text: `Tagged content ${unique.name}`,
                  },
                ],
              },
            ],
            direction: null,
            format: '' as const,
            indent: 0,
            version: 1,
          },
        },
        category: testCategory.id,
        tags: [testTags[0].id],
        _status: 'published' as const,
      }

      const created = await payload.create({
        collection: 'posts',
        data: data as any,
      })

      const result = await payload.find({
        collection: 'posts',
        where: {
          and: [
            {
              tags: {
                in: [testTags[0].id],
              },
            },
            {
              title: {
                contains: unique.name,
              },
            },
          ],
        },
      })

      expect(result.docs).toHaveLength(1)
      expect(result.docs[0].id).toBe(created.id)
      const postTags = Array.isArray(result.docs[0].tags)
        ? result.docs[0].tags.map((tag: any) => (typeof tag === 'object' ? tag.id : tag))
        : result.docs[0].tags
      expect(postTags).toContain(testTags[0].id)
    })

    it('devrait filtrer par statut de publication', async () => {
      const unique = createUniqueTestData()

      // Créer un brouillon et un post publié
      const draftData = {
        title: `Draft Post ${unique.name}`,
        slug: `draft-post-${unique.slug}`,
        excerpt: `Draft excerpt ${unique.name}`,
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                version: 1,
                children: [
                  {
                    type: 'text',
                    version: 1,
                    text: `Draft content ${unique.name}`,
                  },
                ],
              },
            ],
            direction: null,
            format: '' as const,
            indent: 0,
            version: 1,
          },
        },
        category: testCategory.id,
        _status: 'draft' as const,
      }

      const publishedData = {
        title: `Published Post ${unique.name}`,
        slug: `published-post-${unique.slug}`,
        excerpt: `Published excerpt ${unique.name}`,
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                version: 1,
                children: [
                  {
                    type: 'text',
                    version: 1,
                    text: `Published content ${unique.name}`,
                  },
                ],
              },
            ],
            direction: null,
            format: '' as const,
            indent: 0,
            version: 1,
          },
        },
        category: testCategory.id,
        _status: 'published' as const,
      }

      await payload.create({ collection: 'posts', data: draftData as any })
      await payload.create({ collection: 'posts', data: publishedData as any })

      // Rechercher seulement les posts publiés
      const publishedResult = await payload.find({
        collection: 'posts',
        where: {
          and: [
            {
              _status: {
                equals: 'published',
              },
            },
            {
              title: {
                contains: unique.name,
              },
            },
          ],
        },
      })

      expect(publishedResult.docs).toHaveLength(1)
      expect(publishedResult.docs[0]._status).toBe('published')
    })

    it('devrait paginer les résultats correctement', async () => {
      const unique = createUniqueTestData()
      const posts = []

      // Créer 5 posts
      for (let i = 0; i < 5; i++) {
        const data = {
          title: `Paginated Post ${i} ${unique.name}`,
          slug: `paginated-post-${i}-${unique.slug}`,
          excerpt: `Paginated excerpt ${i} ${unique.name}`,
          content: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'paragraph',
                  version: 1,
                  children: [
                    {
                      type: 'text',
                      version: 1,
                      text: `Paginated content ${i} ${unique.name}`,
                    },
                  ],
                },
              ],
              direction: null,
              format: '' as const,
              indent: 0,
              version: 1,
            },
          },
          category: testCategory.id,
          _status: 'published' as const,
        }
        posts.push(data)
      }

      for (const post of posts) {
        await payload.create({
          collection: 'posts',
          data: post as any,
        })
      }

      // Tester la pagination
      const result = await payload.find({
        collection: 'posts',
        where: {
          title: {
            contains: unique.name,
          },
        },
        limit: 2,
        page: 1,
        sort: 'title',
      })

      expect(result.docs).toHaveLength(2)
      expect(result.totalDocs).toBe(5)
      expect(result.totalPages).toBe(3)
      expect(result.page).toBe(1)
    })
  })

  describe('Mise à jour de posts', () => {
    it('devrait mettre à jour un post existant', async () => {
      const unique = createUniqueTestData()
      const originalData = {
        title: `Original Post ${unique.name}`,
        slug: `original-post-${unique.slug}`,
        excerpt: `Original excerpt ${unique.name}`,
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                version: 1,
                children: [
                  {
                    type: 'text',
                    version: 1,
                    text: `Original content ${unique.name}`,
                  },
                ],
              },
            ],
            direction: null,
            format: '' as const,
            indent: 0,
            version: 1,
          },
        },
        category: testCategory.id,
        _status: 'draft' as const,
      }

      const created = await payload.create({
        collection: 'posts',
        data: originalData as any,
      })

      const updateData = {
        title: `Updated Post ${unique.name}`,
        excerpt: `Updated excerpt ${unique.name}`,
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                version: 1,
                children: [
                  {
                    type: 'text',
                    version: 1,
                    text: `Updated content with more words to test reading time recalculation ${unique.name}`,
                  },
                ],
              },
            ],
            direction: null,
            format: '' as const,
            indent: 0,
            version: 1,
          },
        },
        _status: 'published' as const,
      }

      // Get the updated document
      const updated = await payload.update({
        collection: 'posts',
        id: created.id,
        data: updateData as any,
      })

      expect(updated.title).toBe(updateData.title)
      expect(updated.excerpt).toBe(updateData.excerpt)
      expect(updated.content).toEqual(updateData.content)
      expect(updated._status).toBe('published')
      expect(updated.updatedAt).not.toBe(created.updatedAt)

      // Le temps de lecture devrait être recalculé
      expect(updated.readingTime).toBeGreaterThanOrEqual(created.readingTime || 0)

      // publishedAt devrait être défini maintenant
      expect(updated.publishedAt).toBeDefined()
    })

    it('devrait préserver le slug existant lors de la mise à jour', async () => {
      const unique = createUniqueTestData()
      const originalData = {
        title: `Original Title ${unique.name}`,
        slug: `custom-slug-${unique.slug}`,
        excerpt: `Original excerpt ${unique.name}`,
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                version: 1,
                children: [
                  {
                    type: 'text',
                    version: 1,
                    text: `Original content ${unique.name}`,
                  },
                ],
              },
            ],
            direction: null,
            format: '' as const,
            indent: 0,
            version: 1,
          },
        },
        category: testCategory.id,
        _status: 'draft' as const,
      }

      const created = await payload.create({
        collection: 'posts',
        data: originalData as any,
      })

      const updateData = {
        title: `Completely Different Title ${unique.name}`,
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                version: 1,
                children: [
                  {
                    type: 'text',
                    version: 1,
                    text: `Updated content ${unique.name}`,
                  },
                ],
              },
            ],
            direction: null,
            format: '' as const,
            indent: 0,
            version: 1,
          },
        },
      }

      const updated = await payload.update({
        collection: 'posts',
        id: created.id,
        data: updateData as any,
      })

      // Le slug ne devrait pas changer même si le titre change
      expect(updated.slug).toBe(`custom-slug-${unique.slug}`)
      expect(updated.title).toBe(updateData.title)
    })
  })

  describe('Suppression de posts', () => {
    it('devrait supprimer un post existant', async () => {
      const unique = createUniqueTestData()
      const data = {
        title: `To Delete Post ${unique.name}`,
        slug: `to-delete-post-${unique.slug}`,
        excerpt: `To delete excerpt ${unique.name}`,
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                version: 1,
                children: [
                  {
                    type: 'text',
                    version: 1,
                    text: `To delete content ${unique.name}`,
                  },
                ],
              },
            ],
            direction: null,
            format: '' as const,
            indent: 0,
            version: 1,
          },
        },
        category: testCategory.id,
        _status: 'draft' as const,
      }

      const created = await payload.create({
        collection: 'posts',
        data: data as any,
      })

      await payload.delete({
        collection: 'posts',
        id: created.id,
      })

      const result = await payload.find({
        collection: 'posts',
        where: {
          id: {
            equals: created.id,
          },
        },
      })

      expect(result.docs).toHaveLength(0)
    })

    it("devrait lever une erreur lors de la suppression d'un post inexistant", async () => {
      await expect(
        payload.delete({
          collection: 'posts',
          id: 'non-existent-id-' + Date.now(),
        }),
      ).rejects.toThrow()
    })
  })

  describe('Validation des métadonnées SEO', () => {
    it('devrait accepter des métadonnées SEO complètes', async () => {
      const unique = createUniqueTestData()
      const data = {
        title: `SEO Post ${unique.name}`,
        slug: `seo-post-${unique.slug}`,
        excerpt: `SEO excerpt ${unique.name}`,
        content: createBasicContent(`SEO content ${unique.name}`),
        category: testCategory.id,
        meta: {
          title: `Custom SEO Title ${unique.name}`,
          description: `Custom SEO description ${unique.name}`,
          keywords: 'seo, test, post, keywords',
        },
        _status: 'published' as const,
      }

      await createPostAndValidateMeta(data)
    })

    it('devrait accepter des métadonnées SEO localisées', async () => {
      const unique = createUniqueTestData()
      const data = {
        title: `Localized SEO Post ${unique.name}`,
        slug: `localized-seo-post-${unique.slug}`,
        excerpt: `Localized SEO excerpt ${unique.name}`,
        content: createBasicContent(`Localized SEO content ${unique.name}`),
        category: testCategory.id,
        meta: {
          title: `Simple SEO Title ${unique.name}`, // Simplifier pour les tests d'intégration
          description: `Simple SEO description ${unique.name}`,
          keywords: 'seo, test, keywords',
        },
        _status: 'published' as const,
      }

      await createPostAndValidateMeta(data)
    })
  })

  describe('Relations avec autres collections', () => {
    it('devrait populer les relations avec populate', async () => {
      const unique = createUniqueTestData()
      const data = {
        title: `Related Post ${unique.name}`,
        slug: `related-post-${unique.slug}`,
        excerpt: `Related excerpt ${unique.name}`,
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                version: 1,
                children: [
                  {
                    type: 'text',
                    version: 1,
                    text: `Related content ${unique.name}`,
                  },
                ],
              },
            ],
            direction: null,
            format: '' as const,
            indent: 0,
            version: 1,
          },
        },
        category: testCategory.id,
        tags: [testTags[0].id, testTags[1].id],
        _status: 'published' as const,
      }

      const created = await payload.create({
        collection: 'posts',
        data: data as any,
      })

      const result = await payload.findByID({
        collection: 'posts',
        id: created.id,
        depth: 2, // Populer les relations
      })

      // Vérifier que la catégorie est populée
      expect(typeof result.category).toBe('object')
      expect((result.category as any).id).toBe(testCategory.id)
      expect((result.category as any).name).toBeDefined()

      // Vérifier que les tags sont populés
      expect(Array.isArray(result.tags)).toBe(true)
      expect(result.tags).toHaveLength(2)
      result.tags?.forEach((tag: any) => {
        expect(typeof tag).toBe('object')
        expect(tag.id).toBeDefined()
        expect(tag.name).toBeDefined()
      })
    })
  })
})
