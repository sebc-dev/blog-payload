import { describe, it, expect, vi, beforeEach } from 'vitest'
import slugify from 'slugify'
import { extractFallbackText, calculateReadingTime } from '@/collections/Posts'

// Réplication du hook beforeChange de Posts.ts
const beforeChangeHook = ({ data }: { data: any }) => {
  // Auto-generate slug if empty
  if (!data.slug && data.title) {
    const fallbackTitle = extractFallbackText(data.title)
    if (fallbackTitle) {
      data.slug = slugify(fallbackTitle, {
        lower: true,
        strict: true,
        locale: 'fr',
      })
    }
  }

  // Calculate reading time automatically
  if (data.content !== undefined) {
    data.readingTime = calculateReadingTime(data.content)
  }

  // Auto-set publishedAt if status is published and no date is set
  if (data._status === 'published' && !data.publishedAt) {
    data.publishedAt = new Date()
  }

  return data
}

// Réplication de la validation du slug
const validateSlug = (value: string | null | undefined) => {
  if (!value || value.trim() === '') {
    return 'Le slug ne peut pas être vide'
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    return 'Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets'
  }
  return true
}

describe('Posts - Tests unitaires des hooks et validations', () => {
  describe('Hook beforeChange - Auto-génération du slug', () => {
    it('devrait auto-générer le slug depuis un titre string', () => {
      const data = {
        title: 'Understanding React Hooks',
        content: 'Some content...',
      }

      const result = beforeChangeHook({ data })

      expect(result.slug).toBe('understanding-react-hooks')
    })

    it('devrait auto-générer le slug depuis un titre localisé (anglais)', () => {
      const data = {
        title: {
          en: 'Advanced TypeScript Patterns',
          fr: 'Modèles TypeScript Avancés',
        },
        content: 'Some content...',
      }

      const result = beforeChangeHook({ data })

      expect(result.slug).toBe('advanced-typescript-patterns')
    })

    it('devrait auto-générer le slug depuis un titre localisé (français)', () => {
      const data = {
        title: {
          fr: 'Développement avec Vue.js',
        },
        content: 'Some content...',
      }

      const result = beforeChangeHook({ data })

      expect(result.slug).toBe('developpement-avec-vuejs')
    })

    it('ne devrait pas modifier un slug existant', () => {
      const data = {
        title: 'Understanding React Hooks',
        slug: 'existing-custom-slug',
        content: 'Some content...',
      }

      const result = beforeChangeHook({ data })

      expect(result.slug).toBe('existing-custom-slug')
    })

    it('ne devrait pas générer de slug si pas de titre', () => {
      const data = {
        content: 'Some content...',
      }

      const result = beforeChangeHook({ data })

      expect(result.slug).toBeUndefined()
    })

    it('devrait gérer les titres avec caractères spéciaux français', () => {
      const data = {
        title: 'Créer une API REST avec Node.js & Express',
        content: 'Some content...',
      }

      const result = beforeChangeHook({ data })

      expect(result.slug).toBe('creer-une-api-rest-avec-nodejs-et-express')
    })

    it('devrait gérer les titres vides', () => {
      const data = {
        title: '',
        content: 'Some content...',
      }

      const result = beforeChangeHook({ data })

      expect(result.slug).toBeUndefined()
    })

    it('devrait gérer les titres localisés vides', () => {
      const data = {
        title: { en: '', fr: '' },
        content: 'Some content...',
      }

      const result = beforeChangeHook({ data })

      expect(result.slug).toBeUndefined()
    })
  })

  describe('Hook beforeChange - Calcul du temps de lecture', () => {
    it('devrait calculer le temps de lecture depuis le contenu string', () => {
      const content =
        'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit'
      const data = {
        title: 'Test Article',
        content,
      }

      const result = beforeChangeHook({ data })

      expect(result.readingTime).toBe(1) // ~50 mots = 1 minute
      expect(typeof result.readingTime).toBe('number')
    })

    it('devrait calculer le temps de lecture depuis le contenu JSON (Lexical)', () => {
      const lexicalContent = {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'This is a comprehensive guide about React development and modern JavaScript frameworks.',
                },
              ],
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'We will cover hooks, state management, performance optimization, and best practices.',
                },
              ],
            },
          ],
        },
      }

      const data = {
        title: 'React Guide',
        content: lexicalContent,
      }

      const result = beforeChangeHook({ data })

      expect(result.readingTime).toBeGreaterThan(0)
      expect(typeof result.readingTime).toBe('number')
    })

    it('ne devrait pas calculer le temps de lecture si pas de contenu', () => {
      const data = {
        title: 'Test Article',
      }

      const result = beforeChangeHook({ data })

      expect(result.readingTime).toBeUndefined()
    })

    it('devrait retourner 0 pour un contenu vide', () => {
      const data = {
        title: 'Test Article',
        content: '',
      }

      const result = beforeChangeHook({ data })

      expect(result.readingTime).toBe(0)
    })

    it('devrait calculer correctement pour différentes longueurs de contenu', () => {
      const testCases = [
        { words: 50, expectedMinutes: 1 },
        { words: 200, expectedMinutes: 1 },
        { words: 201, expectedMinutes: 2 },
        { words: 400, expectedMinutes: 2 },
        { words: 600, expectedMinutes: 3 },
      ]

      testCases.forEach(({ words, expectedMinutes }) => {
        const content = Array(words).fill('word').join(' ')
        const data = {
          title: 'Test Article',
          content,
        }

        const result = beforeChangeHook({ data })

        expect(result.readingTime).toBe(expectedMinutes)
      })
    })
  })

  describe('Hook beforeChange - Auto-publication', () => {
    beforeEach(() => {
      // Mock Date pour des tests prévisibles
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-01-15T10:30:00Z'))
    })

    it('devrait auto-remplir publishedAt si statut published et pas de date', () => {
      const data = {
        title: 'Test Article',
        content: 'Some content...',
        _status: 'published',
      }

      const result = beforeChangeHook({ data })

      expect(result.publishedAt).toEqual(new Date('2024-01-15T10:30:00.000Z'))
    })

    it('ne devrait pas modifier publishedAt si déjà défini', () => {
      const existingDate = '2024-01-10T08:00:00Z'
      const data = {
        title: 'Test Article',
        content: 'Some content...',
        _status: 'published',
        publishedAt: existingDate,
      }

      const result = beforeChangeHook({ data })

      expect(result.publishedAt).toBe(existingDate)
    })

    it('ne devrait pas auto-remplir publishedAt si statut draft', () => {
      const data = {
        title: 'Test Article',
        content: 'Some content...',
        _status: 'draft',
      }

      const result = beforeChangeHook({ data })

      expect(result.publishedAt).toBeUndefined()
    })

    it('ne devrait pas auto-remplir publishedAt si pas de statut', () => {
      const data = {
        title: 'Test Article',
        content: 'Some content...',
      }

      const result = beforeChangeHook({ data })

      expect(result.publishedAt).toBeUndefined()
    })

    it('devrait gérer les différents statuts', () => {
      const statuses = ['draft', 'published', 'archived']

      statuses.forEach((status) => {
        const data = {
          title: 'Test Article',
          content: 'Some content...',
          _status: status,
        }

        const result = beforeChangeHook({ data })

        if (status === 'published') {
          expect(result.publishedAt).toEqual(new Date('2024-01-15T10:30:00.000Z'))
        } else {
          expect(result.publishedAt).toBeUndefined()
        }
      })
    })
  })

  describe('Hook beforeChange - Traitement combiné', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-01-15T10:30:00Z'))
    })

    it('devrait traiter tous les champs automatiques ensemble', () => {
      const data = {
        title: 'Advanced React Patterns & Best Practices',
        content:
          'This comprehensive guide covers advanced React patterns including render props, higher-order components, compound components, and custom hooks. We will explore how to build reusable and maintainable React applications using these powerful patterns. The content includes practical examples and real-world use cases that demonstrate the effectiveness of each pattern in different scenarios.',
        _status: 'published',
      }

      const result = beforeChangeHook({ data })

      // Vérification du slug auto-généré
      expect(result.slug).toBe('advanced-react-patterns-et-best-practices')

      // Vérification du temps de lecture calculé (~70 mots = 1 minute)
      expect(result.readingTime).toBe(1)

      // Vérification de la date de publication auto-générée
      expect(result.publishedAt).toEqual(new Date('2024-01-15T10:30:00.000Z'))

      // Vérification que les données originales sont préservées
      expect(result.title).toBe('Advanced React Patterns & Best Practices')
      expect(result.content).toBe(data.content)
      expect(result._status).toBe('published')
    })

    it('devrait respecter les valeurs existantes quand définies', () => {
      const existingDate = '2024-01-10T08:00:00Z'
      const data = {
        title: 'Test Article',
        slug: 'custom-slug',
        content: 'Short content.',
        readingTime: 5, // Cette valeur devrait être écrasée par le calcul automatique
        _status: 'published',
        publishedAt: existingDate,
      }

      const result = beforeChangeHook({ data })

      // Le slug existant est préservé
      expect(result.slug).toBe('custom-slug')

      // Le temps de lecture est recalculé automatiquement
      expect(result.readingTime).toBe(1) // Recalculé depuis "Short content."

      // La date existante est préservée
      expect(result.publishedAt).toBe(existingDate)
    })

    it('devrait gérer les données incomplètes', () => {
      const data = {
        title: 'Test Article',
        // Pas de content, pas de statut
      }

      const result = beforeChangeHook({ data })

      expect(result.slug).toBe('test-article')
      expect(result.readingTime).toBeUndefined()
      expect(result.publishedAt).toBeUndefined()
    })
  })

  describe('Validation du slug', () => {
    it('devrait valider les slugs corrects', () => {
      const validSlugs = [
        'simple-title',
        'understanding-react-hooks',
        'advanced-typescript-patterns',
        'api-rest-nodejs',
        'vue3-composition-api',
        'web-development-2024',
        'machine-learning-101',
      ]

      validSlugs.forEach((slug) => {
        expect(validateSlug(slug)).toBe(true)
      })
    })

    it('devrait rejeter les slugs invalides', () => {
      const invalidSlugs = [
        '',
        '   ',
        'Title With Spaces',
        'title_with_underscores',
        'title.with.dots',
        'Title-With-Capitals',
        '-starting-with-dash',
        'ending-with-dash-',
        'double--dash',
        'special@characters',
        'french-accénts',
        'title/with/slashes',
      ]

      invalidSlugs.forEach((slug) => {
        const result = validateSlug(slug)
        expect(result).not.toBe(true)
        expect(typeof result).toBe('string')
      })
    })

    it("devrait retourner le bon message d'erreur pour slug vide", () => {
      expect(validateSlug('')).toBe('Le slug ne peut pas être vide')
      expect(validateSlug('   ')).toBe('Le slug ne peut pas être vide')
      expect(validateSlug(null)).toBe('Le slug ne peut pas être vide')
      expect(validateSlug(undefined)).toBe('Le slug ne peut pas être vide')
    })

    it("devrait retourner le bon message d'erreur pour format invalide", () => {
      const expectedMessage =
        'Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets'

      expect(validateSlug('Invalid Slug')).toBe(expectedMessage)
      expect(validateSlug('invalid_slug')).toBe(expectedMessage)
      expect(validateSlug('INVALID-SLUG')).toBe(expectedMessage)
    })

    it('devrait être cohérent avec les slugs générés automatiquement', () => {
      const testTitles = [
        'Understanding React Hooks',
        'Advanced TypeScript Patterns',
        'Créer une API REST',
        'Vue.js & Composition API',
        'Machine Learning 101',
      ]

      testTitles.forEach((title) => {
        const data = { title, content: 'test' }
        const result = beforeChangeHook({ data })

        // Le slug généré doit toujours être valide
        expect(validateSlug(result.slug)).toBe(true)
      })
    })
  })

  describe("Tests d'intégration des hooks", () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-01-15T10:30:00Z'))
    })

    it("devrait simuler un scénario de création d'article complet", () => {
      const rawPostData = {
        title: {
          en: 'Building Scalable React Applications',
          fr: 'Construire des Applications React Évolutives',
        },
        excerpt: {
          en: 'Learn how to build large-scale React applications that can grow with your team and requirements.',
          fr: 'Apprenez à construire des applications React à grande échelle qui peuvent évoluer avec votre équipe et vos besoins.',
        },
        content: {
          en: 'Building scalable React applications requires careful planning and architecture decisions. In this comprehensive guide, we will explore various patterns, tools, and techniques that help create maintainable and performant React applications. We will cover component architecture, state management, code splitting, testing strategies, and deployment considerations. The goal is to provide you with a complete roadmap for building React applications that can scale from small prototypes to enterprise-level systems.',
          fr: 'Construire des applications React évolutives nécessite une planification minutieuse et des décisions architecturales. Dans ce guide complet, nous explorerons divers modèles, outils et techniques qui aident à créer des applications React maintenables et performantes.',
        },
        category: 'frontend-development',
        tags: ['react', 'architecture', 'scalability'],
        _status: 'published',
      }

      const result = beforeChangeHook({ data: rawPostData })

      // Slug auto-généré depuis le titre anglais
      expect(result.slug).toBe('building-scalable-react-applications')

      // Temps de lecture calculé depuis le contenu (en anglais car c'est le premier)
      expect(result.readingTime).toBe(1)
      expect(typeof result.readingTime).toBe('number')

      // Date de publication auto-générée
      expect(result.publishedAt).toEqual(new Date('2024-01-15T10:30:00.000Z'))

      // Autres données préservées
      expect(result.title).toEqual(rawPostData.title)
      expect(result.excerpt).toEqual(rawPostData.excerpt)
      expect(result.content).toEqual(rawPostData.content)
      expect(result.category).toBe('frontend-development')
      expect(result.tags).toEqual(['react', 'architecture', 'scalability'])
      expect(result._status).toBe('published')
    })

    it('devrait simuler un scénario de sauvegarde de brouillon', () => {
      const draftData = {
        title: 'Introduction to GraphQL',
        content: 'GraphQL is a query language and runtime for APIs...',
        _status: 'draft',
      }

      const result = beforeChangeHook({ data: draftData })

      expect(result.slug).toBe('introduction-to-graphql')
      expect(result.readingTime).toBe(1)
      expect(result.publishedAt).toBeUndefined() // Pas de date pour un brouillon
      expect(result._status).toBe('draft')
    })

    it("devrait simuler une mise à jour d'article existant", () => {
      const existingPostUpdate = {
        title: 'Updated: Introduction to GraphQL',
        slug: 'intro-graphql', // Slug personnalisé existant
        content:
          'Updated content with more detailed explanations about GraphQL, its benefits, and how to implement it in modern web applications...',
        readingTime: 3, // Cette valeur sera écrasée
        publishedAt: '2024-01-10T08:00:00Z', // Date existante
        _status: 'published',
      }

      const result = beforeChangeHook({ data: existingPostUpdate })

      // Le slug existant est préservé
      expect(result.slug).toBe('intro-graphql')

      // Le temps de lecture est recalculé
      expect(result.readingTime).toBe(1) // Recalculé depuis le nouveau contenu

      // La date existante est préservée
      expect(result.publishedAt).toBe('2024-01-10T08:00:00Z')
    })
  })
})
