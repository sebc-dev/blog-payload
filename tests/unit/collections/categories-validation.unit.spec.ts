import { describe, it, expect } from 'vitest'

describe('Categories - Tests unitaires de validation', () => {
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
      expect(normalizeSlug('Technology')).toBe('technology')
      expect(normalizeSlug('Web Development')).toBe('web-development')
    })

    it('devrait remplacer & par "et"', () => {
      expect(normalizeSlug('Machine Learning & AI')).toBe('machine-learning-et-ai')
      expect(normalizeSlug('Frontend & Backend')).toBe('frontend-et-backend')
    })

    it('devrait supprimer les caractères spéciaux', () => {
      expect(normalizeSlug('Machine Learning & AI!')).toBe('machine-learning-et-ai')
      expect(normalizeSlug('C++ Programming')).toBe('c-programming')
      expect(normalizeSlug('Data Science (Advanced)')).toBe('data-science-advanced')
    })

    it('devrait gérer les espaces multiples', () => {
      expect(normalizeSlug('Artificial   Intelligence')).toBe('artificial-intelligence')
      expect(normalizeSlug('  Cloud Computing  ')).toBe('cloud-computing')
    })

    it('devrait gérer les tirets multiples', () => {
      expect(normalizeSlug('Full--Stack---Development')).toBe('full-stack-development')
    })
  })

  describe('Validation des données de catégorie', () => {
    interface CategoryData {
      name: string
      slug?: string
      description?: string
    }

    // Fonction de validation complète
    const validateCategoryData = (data: CategoryData): { valid: boolean; errors: string[] } => {
      const errors: string[] = []

      // Validation du nom
      if (!data.name) {
        errors.push('Le nom est requis')
      } else if (typeof data.name !== 'string' || data.name.trim().length === 0) {
        errors.push('Le nom ne peut pas être vide')
      }

      // Validation du slug s'il est fourni
      if (data.slug !== undefined) {
        if (typeof data.slug !== 'string' || data.slug.length === 0) {
          errors.push('Le slug ne peut pas être vide')
        } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
          errors.push('Le slug doit contenir uniquement des lettres minuscules, des chiffres et des tirets')
        }
      }

      // Validation de la description (optionnelle)
      if (data.description !== undefined && data.description !== null) {
        if (typeof data.description !== 'string') {
          errors.push('La description doit être une chaîne de caractères')
        }
      }

      return {
        valid: errors.length === 0,
        errors
      }
    }

    it('devrait valider une catégorie correcte', () => {
      const categoryData = {
        name: 'Technology',
        slug: 'technology',
        description: 'Technology related posts'
      }

      const result = validateCategoryData(categoryData)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('devrait valider une catégorie minimale', () => {
      const categoryData = {
        name: 'Web Development'
      }

      const result = validateCategoryData(categoryData)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('devrait valider une catégorie sans description', () => {
      const categoryData = {
        name: 'Programming',
        slug: 'programming'
      }

      const result = validateCategoryData(categoryData)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('devrait rejeter une catégorie sans nom', () => {
      const categoryData = {
        name: '' as any,
        slug: 'test'
      }

      const result = validateCategoryData(categoryData)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Le nom est requis')
    })

    it('devrait rejeter un slug vide', () => {
      const categoryData = {
        name: 'Test Category',
        slug: ''
      }

      const result = validateCategoryData(categoryData)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Le slug ne peut pas être vide')
    })

    it('devrait rejeter un slug avec des caractères invalides', () => {
      const invalidSlugs = ['Test Slug', 'test_slug', 'test-slug!', 'TEST-SLUG', 'test@slug']
      
      invalidSlugs.forEach(slug => {
        const categoryData = {
          name: 'Test Category',
          slug: slug
        }

        const result = validateCategoryData(categoryData)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('Le slug doit contenir uniquement des lettres minuscules, des chiffres et des tirets')
      })
    })

    it('devrait accepter des slugs valides', () => {
      const validSlugs = ['technology', 'web-development', 'machine-learning', 'data-science-101', 'ai-2024']
      
      validSlugs.forEach(slug => {
        const categoryData = {
          name: 'Test Category',
          slug: slug
        }

        const result = validateCategoryData(categoryData)
        expect(result.valid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })
    })

    it('devrait accumuler plusieurs erreurs', () => {
      const categoryData = {
        name: '',
        slug: 'INVALID SLUG!',
        description: 123 as any
      }

      const result = validateCategoryData(categoryData)
      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(3)
    })
  })

  describe('Auto-génération de slug', () => {
    // Fonction d'auto-génération de slug à partir du nom
    const generateSlugFromName = (name: string): string => {
      return name
        .toLowerCase()
        .replace(/[&]/g, 'et')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '') // Supprime les tirets en début/fin
    }

    it('devrait générer un slug à partir d\'un nom simple', () => {
      expect(generateSlugFromName('Technology')).toBe('technology')
      expect(generateSlugFromName('Web Development')).toBe('web-development')
    })

    it('devrait gérer les caractères spéciaux', () => {
      expect(generateSlugFromName('Machine Learning & AI!')).toBe('machine-learning-et-ai')
      expect(generateSlugFromName('Front-End Development')).toBe('front-end-development')
    })

    it('devrait nettoyer les espaces en début et fin', () => {
      expect(generateSlugFromName('  Cloud Computing  ')).toBe('cloud-computing')
      expect(generateSlugFromName('Data Science')).toBe('data-science')
    })

    it('devrait gérer les cas complexes', () => {
      expect(generateSlugFromName('C++ & Java Programming!')).toBe('c-et-java-programming')
      expect(generateSlugFromName('DevOps & CI/CD Pipeline')).toBe('devops-et-cicd-pipeline')
    })

    it('devrait gérer les noms vides', () => {
      expect(generateSlugFromName('')).toBe('')
      expect(generateSlugFromName('   ')).toBe('')
    })
  })
})