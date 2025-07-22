import { describe, it, expect } from 'vitest'

describe('Tags - Tests unitaires de validation', () => {
  describe('Validation des couleurs hexadécimales', () => {
    // Fonction utilitaire pour tester la validation d'une couleur hexadécimale
    const isValidHexColor = (color: string): boolean => {
      const hexColorRegex = /^#([A-Fa-f0-9]{6})$/
      return hexColorRegex.test(color)
    }

    it('devrait valider les couleurs hexadécimales correctes', () => {
      const validColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFFFF', '#000000', '#3B82F6']

      validColors.forEach((color) => {
        expect(isValidHexColor(color)).toBe(true)
      })
    })

    it('devrait rejeter les couleurs hexadécimales incorrectes', () => {
      const invalidColors = ['#FFF', '#GGGGGG', 'red', 'rgb(255,0,0)', '#12345G', 'FF0000', '#', '']

      invalidColors.forEach((color) => {
        expect(isValidHexColor(color)).toBe(false)
      })
    })

    it('devrait rejeter les valeurs null ou undefined', () => {
      expect(isValidHexColor(null as any)).toBe(false)
      expect(isValidHexColor(undefined as any)).toBe(false)
    })
  })

  describe('Normalisation des slugs', () => {
    // Fonction utilitaire pour normaliser un slug
    const normalizeSlug = (text: string): string => {
      return text
        .toLowerCase()
        .replace(/[&]/g, 'et') // Remplace & par 'et' (locale française)
        .replace(/[^a-z0-9\s-]/g, '') // Supprime les caractères spéciaux
        .replace(/\s+/g, '-') // Remplace les espaces par des tirets
        .replace(/-+/g, '-') // Supprime les tirets multiples
        .replace(/^-+|-+$/g, '') // Supprime les tirets en début/fin
        .trim()
    }

    it('devrait normaliser un texte simple', () => {
      expect(normalizeSlug('JavaScript')).toBe('javascript')
      expect(normalizeSlug('React Hooks')).toBe('react-hooks')
    })

    it('devrait remplacer & par "et"', () => {
      expect(normalizeSlug('Node.js & Express')).toBe('nodejs-et-express')
      expect(normalizeSlug('HTML & CSS & JS')).toBe('html-et-css-et-js')
    })

    it('devrait supprimer les caractères spéciaux', () => {
      expect(normalizeSlug('Node.js!')).toBe('nodejs')
      expect(normalizeSlug('C++ Programming')).toBe('c-programming')
      expect(normalizeSlug('@angular/core')).toBe('angularcore')
    })

    it('devrait gérer les espaces multiples', () => {
      expect(normalizeSlug('React   Native   App')).toBe('react-native-app')
      expect(normalizeSlug('  Machine Learning  ')).toBe('machine-learning')
    })

    it('devrait gérer les tirets multiples', () => {
      expect(normalizeSlug('Front--End---Development')).toBe('front-end-development')
    })
  })

  describe('Fallback du nom localisé', () => {
    // Fonction utilitaire pour le fallback de nom
    const getNameFallback = (name: any): string => {
      if (typeof name === 'string') {
        return name
      }

      if (typeof name === 'object' && name !== null) {
        // Priorité : en > fr > première valeur disponible > string vide
        if (name.en) return name.en
        if (name.fr) return name.fr

        const values = Object.values(name)
        if (values.length > 0 && values[0]) {
          return values[0] as string
        }
      }

      return ''
    }

    it('devrait retourner la string directement', () => {
      expect(getNameFallback('JavaScript')).toBe('JavaScript')
      expect(getNameFallback('React Hooks')).toBe('React Hooks')
    })

    it('devrait retourner .en si présent', () => {
      const nameObject = { en: 'English Name', fr: 'Nom Français' }
      expect(getNameFallback(nameObject)).toBe('English Name')
    })

    it('devrait retourner .fr si .en absent', () => {
      const nameObject = { fr: 'Nom Français' }
      expect(getNameFallback(nameObject)).toBe('Nom Français')
    })

    it('devrait retourner la première valeur si .en et .fr absents', () => {
      const nameObject1 = { de: 'Deutsch Name', es: 'Nombre Español' }
      const result1 = getNameFallback(nameObject1)
      expect(['Deutsch Name', 'Nombre Español']).toContain(result1)

      const nameObject2 = { it: 'Nome Italiano' }
      expect(getNameFallback(nameObject2)).toBe('Nome Italiano')
    })

    it('devrait retourner une string vide pour objet vide', () => {
      expect(getNameFallback({})).toBe('')
    })

    it('devrait retourner une string vide pour null/undefined', () => {
      expect(getNameFallback(null)).toBe('')
      expect(getNameFallback(undefined)).toBe('')
    })

    it("devrait ignorer les valeurs falsy dans l'objet", () => {
      const nameObject = { en: '', fr: 'Nom Français', de: null }
      expect(getNameFallback(nameObject)).toBe('Nom Français')
    })
  })

  describe('Validation des données de tag', () => {
    interface TagData {
      name: string | object
      slug?: string
      description?: string
      color?: string
    }

    // Fonction de validation complète
    const validateTagData = (data: TagData): { valid: boolean; errors: string[] } => {
      const errors: string[] = []

      // Validation du nom
      if (!data.name) {
        errors.push('Le nom est requis')
      } else if (typeof data.name === 'string' && data.name.trim().length === 0) {
        errors.push('Le nom ne peut pas être vide')
      }

      // Validation du slug s'il est fourni
      if (data.slug !== undefined) {
        if (typeof data.slug !== 'string' || data.slug.length === 0) {
          errors.push('Le slug ne peut pas être vide')
        } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
          errors.push(
            'Le slug doit contenir uniquement des lettres minuscules, des chiffres et des tirets',
          )
        }
      }

      // Validation de la couleur si elle est fournie
      if (data.color !== undefined && data.color !== null) {
        const hexColorRegex = /^#([A-Fa-f0-9]{6})$/
        if (!hexColorRegex.test(data.color)) {
          errors.push('La couleur doit être au format hexadécimal #RRGGBB')
        }
      }

      return {
        valid: errors.length === 0,
        errors,
      }
    }

    it('devrait valider un tag correct', () => {
      const tagData = {
        name: 'JavaScript',
        slug: 'javascript',
        description: 'Langage de programmation',
        color: '#F7DF1E',
      }

      const result = validateTagData(tagData)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('devrait valider un tag minimal', () => {
      const tagData = {
        name: 'React',
      }

      const result = validateTagData(tagData)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('devrait rejeter un tag sans nom', () => {
      const tagData = {
        name: '' as any,
        slug: 'test',
      }

      const result = validateTagData(tagData)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Le nom est requis')
    })

    it('devrait rejeter un slug vide', () => {
      const tagData = {
        name: 'Test',
        slug: '',
      }

      const result = validateTagData(tagData)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Le slug ne peut pas être vide')
    })

    it('devrait rejeter une couleur invalide', () => {
      const tagData = {
        name: 'Test',
        color: 'invalid-color',
      }

      const result = validateTagData(tagData)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('La couleur doit être au format hexadécimal #RRGGBB')
    })

    it('devrait accumuler plusieurs erreurs', () => {
      const tagData = {
        name: '',
        slug: '',
        color: 'red',
      }

      const result = validateTagData(tagData)
      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(3)
    })
  })
})
