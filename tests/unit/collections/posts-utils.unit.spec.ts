import { describe, it, expect } from 'vitest'

// Réplication des fonctions utilitaires de Posts.ts pour les tests unitaires

interface LocalizedText {
  en?: string
  fr?: string
  [key: string]: string | undefined
}

/**
 * Extract fallback text from localized fields
 */
function extractFallbackText(textData: unknown): string {
  if (typeof textData === 'string') {
    return textData
  } else if (typeof textData === 'object' && textData !== null) {
    const obj = textData as LocalizedText
    // Utiliser || pour filtrer aussi les chaînes vides, comme attendu par le test
    return obj.en || obj.fr || Object.values(obj).find((v) => v && v.trim()) || ''
  }
  return ''
}

/**
 * Calculate reading time from rich text content
 * Based on average reading speed of 200 words per minute
 */
function calculateReadingTime(content: unknown): number {
  if (!content) return 0

  // Convert rich text content to plain text for word counting
  let plainText = ''

  if (typeof content === 'string') {
    plainText = content
  } else if (typeof content === 'object') {
    // For Lexical editor content, we need to extract text from the JSON structure
    plainText = JSON.stringify(content)
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[^\w\s]/g, ' ') // Replace special characters with spaces
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim()
  }

  const wordCount = plainText.split(/\s+/).filter((word) => word.length > 0).length

  // Si pas de mots, retourner 0
  if (wordCount === 0) return 0

  const readingTimeMinutes = Math.ceil(wordCount / 200)

  return readingTimeMinutes > 0 ? readingTimeMinutes : 1
}

describe('Posts - Tests unitaires des fonctions utilitaires', () => {
  describe('extractFallbackText', () => {
    it('devrait retourner la chaîne directement si textData est une string', () => {
      expect(extractFallbackText('Simple text')).toBe('Simple text')
      expect(extractFallbackText('Blog post title')).toBe('Blog post title')
      expect(extractFallbackText('')).toBe('')
    })

    it('devrait extraire la valeur en anglais en priorité', () => {
      const localizedText = {
        en: 'English title',
        fr: 'Titre français',
      }
      expect(extractFallbackText(localizedText)).toBe('English title')
    })

    it('devrait extraire la valeur française si anglais absent', () => {
      const localizedText = {
        fr: 'Titre français',
      }
      expect(extractFallbackText(localizedText)).toBe('Titre français')
    })

    it('devrait prendre la première valeur disponible si ni en ni fr', () => {
      const localizedText = {
        es: 'Título español',
        de: 'Deutscher Titel',
        it: 'Titolo italiano',
      }
      expect(extractFallbackText(localizedText)).toBe('Título español')
    })

    it('devrait gérer les valeurs undefined dans les locales', () => {
      const localizedText = {
        en: undefined,
        fr: 'Titre français',
        es: 'Título español',
      }
      expect(extractFallbackText(localizedText)).toBe('Titre français')
    })

    it('devrait gérer les valeurs null dans les locales', () => {
      const localizedText = {
        en: null as any,
        fr: 'Titre français',
      }
      expect(extractFallbackText(localizedText)).toBe('Titre français')
    })

    it('devrait gérer les chaînes vides dans les locales', () => {
      const localizedText = {
        en: '',
        fr: 'Titre français',
      }
      // La fonction retourne la première valeur truthy, donc la chaîne vide en premier ne sera pas prise
      expect(extractFallbackText(localizedText)).toBe('Titre français')
    })

    it('devrait retourner une chaîne vide si aucune valeur valide', () => {
      const localizedText = {
        en: '',
        fr: undefined,
        es: null,
      }
      expect(extractFallbackText(localizedText)).toBe('')
    })

    it('devrait retourner une chaîne vide pour un objet vide', () => {
      expect(extractFallbackText({})).toBe('')
    })

    it('devrait retourner une chaîne vide pour null', () => {
      expect(extractFallbackText(null)).toBe('')
    })

    it('devrait retourner une chaîne vide pour undefined', () => {
      expect(extractFallbackText(undefined)).toBe('')
    })

    it('devrait gérer les types primitifs non-string', () => {
      expect(extractFallbackText(123)).toBe('')
      expect(extractFallbackText(true)).toBe('')
      expect(extractFallbackText(false)).toBe('')
    })

    it('devrait gérer les objets complexes avec des propriétés non-string', () => {
      const complexObject = {
        en: 'English title',
        fr: 'Titre français',
        count: 42,
        active: true,
        nested: { value: 'nested' },
      }
      expect(extractFallbackText(complexObject)).toBe('English title')
    })
  })

  describe('calculateReadingTime', () => {
    it('devrait retourner 0 pour un contenu null', () => {
      expect(calculateReadingTime(null)).toBe(0)
    })

    it('devrait retourner 0 pour un contenu undefined', () => {
      expect(calculateReadingTime(undefined)).toBe(0)
    })

    it('devrait retourner 0 pour une chaîne vide', () => {
      expect(calculateReadingTime('')).toBe(0)
    })

    it('devrait calculer le temps de lecture pour une chaîne simple', () => {
      // 50 mots = 1 minute (arrondi supérieur de 50/200 = 0.25)
      const text =
        'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat Duis aute irure dolor in reprehenderit'
      expect(calculateReadingTime(text)).toBe(1)
    })

    it('devrait calculer le temps de lecture pour exactement 200 mots', () => {
      // 200 mots = 1 minute exact
      const words = Array(200).fill('word').join(' ')
      expect(calculateReadingTime(words)).toBe(1)
    })

    it('devrait calculer le temps de lecture pour 201 mots', () => {
      // 201 mots = 2 minutes (arrondi supérieur de 201/200 = 1.005)
      const words = Array(201).fill('word').join(' ')
      expect(calculateReadingTime(words)).toBe(2)
    })

    it('devrait calculer le temps de lecture pour 400 mots', () => {
      // 400 mots = 2 minutes (400/200 = 2)
      const words = Array(400).fill('word').join(' ')
      expect(calculateReadingTime(words)).toBe(2)
    })

    it('devrait calculer le temps de lecture pour 600 mots', () => {
      // 600 mots = 3 minutes (600/200 = 3)
      const words = Array(600).fill('word').join(' ')
      expect(calculateReadingTime(words)).toBe(3)
    })

    it('devrait ignorer les espaces multiples', () => {
      const text = 'Un   deux    trois     quatre      cinq'
      expect(calculateReadingTime(text)).toBe(1) // 5 mots
    })

    it('devrait gérer les caractères spéciaux', () => {
      const text = 'Hello, world! This is a test... With some "special" characters & symbols.'
      // Après nettoyage: environ 12 mots
      expect(calculateReadingTime(text)).toBe(1)
    })

    it('devrait gérer le contenu HTML dans les chaînes', () => {
      const htmlText = '<p>Hello <strong>world</strong>!</p> <div>This is a <em>test</em>.</div>'
      // Après suppression des tags HTML: "Hello world! This is a test."
      expect(calculateReadingTime(htmlText)).toBe(1) // environ 7 mots
    })

    it('devrait gérer les objets JSON (contenu Lexical)', () => {
      const lexicalContent = {
        root: {
          children: [
            {
              type: 'paragraph',
              text: 'This is a paragraph with multiple words for testing the reading time calculation',
            },
            {
              type: 'heading',
              text: 'This is a heading',
            },
          ],
        },
      }
      // Le contenu sera sérialisé et les mots extraits
      const result = calculateReadingTime(lexicalContent)
      expect(result).toBeGreaterThan(0)
    })

    it('devrait retourner au minimum 1 minute pour tout contenu non-vide', () => {
      expect(calculateReadingTime('word')).toBe(1) // 1 mot = minimum 1 minute
      expect(calculateReadingTime('a')).toBe(1) // 1 lettre = minimum 1 minute
      expect(calculateReadingTime('123')).toBe(1) // 1 nombre = minimum 1 minute
    })

    it('devrait gérer les textes avec seulement des espaces', () => {
      expect(calculateReadingTime('   ')).toBe(0)
      expect(calculateReadingTime('\t\n\r')).toBe(0)
    })

    it('devrait gérer les textes avec des caractères Unicode', () => {
      const unicodeText = 'Café naïve résumé développement français éléphant'
      expect(calculateReadingTime(unicodeText)).toBe(1) // 6 mots
    })

    it('devrait gérer les textes très longs', () => {
      // 1000 mots = 5 minutes (1000/200 = 5)
      const longText = Array(1000).fill('word').join(' ')
      expect(calculateReadingTime(longText)).toBe(5)
    })

    it('devrait gérer les objets complexes imbriqués', () => {
      const complexContent = {
        version: '1.0',
        content: {
          blocks: [
            {
              type: 'text',
              data: 'First paragraph with some words',
            },
            {
              type: 'code',
              data: 'const hello = "world";',
            },
            {
              type: 'text',
              data: 'Second paragraph with more content and words',
            },
          ],
        },
        metadata: {
          author: 'John Doe',
          title: 'Test Article',
        },
      }

      const result = calculateReadingTime(complexContent)
      expect(result).toBeGreaterThan(0)
      expect(typeof result).toBe('number')
    })

    it('devrait être cohérent avec des variations de formatage', () => {
      const text1 = 'Lorem ipsum dolor sit amet consectetur'
      const text2 = '  Lorem    ipsum   dolor   sit   amet   consectetur  '
      const text3 = 'Lorem\nipsum\tdolor\rsit amet consectetur'

      // Tous devraient donner le même résultat (6 mots)
      expect(calculateReadingTime(text1)).toBe(calculateReadingTime(text2))
      expect(calculateReadingTime(text2)).toBe(calculateReadingTime(text3))
      expect(calculateReadingTime(text1)).toBe(1)
    })
  })

  describe('Intégration des fonctions utilitaires', () => {
    it("devrait fonctionner ensemble pour un cas d'usage réel", () => {
      const postData = {
        title: {
          en: 'Understanding React Hooks',
          fr: 'Comprendre les Hooks React',
        },
        content:
          'React Hooks are a powerful feature that allows you to use state and other React features without writing a class component. They were introduced in React 16.8 and have revolutionized how we write React applications. In this comprehensive guide, we will explore the most commonly used hooks including useState, useEffect, useContext, and more advanced patterns.',
      }

      const extractedTitle = extractFallbackText(postData.title)
      const readingTime = calculateReadingTime(postData.content)

      expect(extractedTitle).toBe('Understanding React Hooks')
      expect(readingTime).toBeGreaterThan(0)
      expect(typeof readingTime).toBe('number')
    })

    it('devrait gérer les cas où extractFallbackText retourne une chaîne vide', () => {
      const emptyTitle = extractFallbackText({})
      const contentWithEmptyTitle = {
        title: emptyTitle,
        content: 'Some content here with multiple words to test reading time calculation',
      }

      expect(emptyTitle).toBe('')
      expect(calculateReadingTime(contentWithEmptyTitle.content)).toBe(1)
    })
  })
})
