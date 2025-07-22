import { describe, it, expect } from 'vitest'
import slugify from 'slugify'

describe('Slugify Helpers - Tests unitaires des utilitaires de slugification', () => {
  // Configuration française utilisée dans les collections
  const FRENCH_SLUGIFY_CONFIG = {
    lower: true,
    strict: true,
    locale: 'fr'
  }

  describe('Configuration slugify française', () => {
    it('devrait convertir les caractères français avec la locale fr', () => {
      expect(slugify('Créativité & Innovation', FRENCH_SLUGIFY_CONFIG))
        .toBe('creativite-et-innovation')
    })

    it('devrait gérer les accents français', () => {
      const testCases = [
        { input: 'Développement', expected: 'developpement' },
        { input: 'Sécurité', expected: 'securite' },
        { input: 'Intégration', expected: 'integration' },
        { input: 'Qualité', expected: 'qualite' },
        { input: 'Références', expected: 'references' }
      ]

      testCases.forEach(({ input, expected }) => {
        expect(slugify(input, FRENCH_SLUGIFY_CONFIG)).toBe(expected)
      })
    })

    it('devrait gérer les caractères spéciaux français', () => {
      const testCases = [
        { input: 'Web & Mobile', expected: 'web-et-mobile' },
        { input: 'Frontend & Backend', expected: 'frontend-et-backend' },
        { input: 'React & Vue.js', expected: 'react-et-vuejs' },
        { input: 'Node.js & Express', expected: 'nodejs-et-express' }
      ]

      testCases.forEach(({ input, expected }) => {
        expect(slugify(input, FRENCH_SLUGIFY_CONFIG)).toBe(expected)
      })
    })

    it('devrait supprimer les caractères spéciaux avec strict: true', () => {
      const testCases = [
        { input: 'C++ Programming', expected: 'c-programming' },
        { input: 'Data Science (ML)', expected: 'data-science-ml' },
        { input: 'API REST/GraphQL', expected: 'api-restgraphql' },
        { input: 'Docker & CI/CD', expected: 'docker-et-cicd' }
      ]

      testCases.forEach(({ input, expected }) => {
        expect(slugify(input, FRENCH_SLUGIFY_CONFIG)).toBe(expected)
      })
    })

    it('devrait gérer les espaces multiples', () => {
      expect(slugify('Machine   Learning   AI', FRENCH_SLUGIFY_CONFIG))
        .toBe('machine-learning-ai')
      expect(slugify('  Cloud  Computing  ', FRENCH_SLUGIFY_CONFIG))
        .toBe('cloud-computing')
    })

    it('devrait gérer les chaînes vides et les espaces', () => {
      expect(slugify('', FRENCH_SLUGIFY_CONFIG)).toBe('')
      expect(slugify('   ', FRENCH_SLUGIFY_CONFIG)).toBe('')
      expect(slugify('\t\n', FRENCH_SLUGIFY_CONFIG)).toBe('')
    })
  })

  describe('Cas d\'usage réels des collections', () => {
    it('devrait reproduire le comportement pour les noms de catégories', () => {
      const categoryNames = [
        'Technologie & Innovation',
        'Développement Web',
        'Intelligence Artificielle',
        'Sécurité Informatique',
        'DevOps & CI/CD'
      ]

      const expectedSlugs = [
        'technologie-et-innovation',
        'developpement-web',
        'intelligence-artificielle',
        'securite-informatique',
        'devops-et-cicd'
      ]

      categoryNames.forEach((name, index) => {
        expect(slugify(name, FRENCH_SLUGIFY_CONFIG)).toBe(expectedSlugs[index])
      })
    })

    it('devrait reproduire le comportement pour les noms de tags', () => {
      const tagNames = [
        'JavaScript ES6+',
        'React Hooks',
        'Node.js API',
        'TypeScript & Types',
        'CSS-in-JS'
      ]

      const expectedSlugs = [
        'javascript-es6',
        'react-hooks',
        'nodejs-api',
        'typescript-et-types',
        'css-in-js'
      ]

      tagNames.forEach((name, index) => {
        expect(slugify(name, FRENCH_SLUGIFY_CONFIG)).toBe(expectedSlugs[index])
      })
    })
  })

  describe('Comparaison avec d\'autres locales', () => {
    it('devrait différer du comportement avec locale anglaise', () => {
      const englishConfig = { lower: true, strict: true, locale: 'en' }
      const text = 'Frontend & Backend'

      expect(slugify(text, FRENCH_SLUGIFY_CONFIG)).toBe('frontend-et-backend')
      expect(slugify(text, englishConfig)).toBe('frontend-and-backend')
    })

    it('devrait différer du comportement sans locale', () => {
      const defaultConfig = { lower: true, strict: true }
      const text = 'API & Services'

      expect(slugify(text, FRENCH_SLUGIFY_CONFIG)).toBe('api-et-services')
      expect(slugify(text, defaultConfig)).toBe('api-and-services')
    })
  })

  describe('Gestion des caractères unicode', () => {
    it('devrait gérer les caractères européens', () => {
      const testCases = [
        { input: 'Español & Português', expected: 'espanol-et-portugues' },
        { input: 'Deutsch & Français', expected: 'deutsch-et-francais' },
        { input: 'Italiano & English', expected: 'italiano-et-english' }
      ]

      testCases.forEach(({ input, expected }) => {
        expect(slugify(input, FRENCH_SLUGIFY_CONFIG)).toBe(expected)
      })
    })

    it('devrait gérer les caractères avec cédille et tréma', () => {
      expect(slugify('Français & Naïve', FRENCH_SLUGIFY_CONFIG))
        .toBe('francais-et-naive')
    })
  })

  describe('Limites et cas extrêmes', () => {
    it('devrait gérer les très longues chaînes', () => {
      const longString = 'A'.repeat(200) + ' & ' + 'B'.repeat(200)
      const result = slugify(longString, FRENCH_SLUGIFY_CONFIG)
      
      expect(result).toContain('et')
      // Le résultat peut être plus long à cause de la transformation 'et'
      expect(result.length).toBeGreaterThan(100) // Test plus réaliste
    })

    it('devrait gérer les caractères de contrôle et invisibles', () => {
      const textWithControls = 'Test\u0000\u0001\u0002 & Control\u0003\u0004'
      expect(slugify(textWithControls, FRENCH_SLUGIFY_CONFIG))
        .toBe('test-et-control')
    })

    it('devrait gérer les emojis et symboles', () => {
      expect(slugify('JavaScript 🚀 & React ⚛️', FRENCH_SLUGIFY_CONFIG))
        .toBe('javascript-et-react')
    })

    it('devrait gérer les chiffres et symboles mathématiques', () => {
      expect(slugify('Math.PI & Number.MAX_VALUE', FRENCH_SLUGIFY_CONFIG))
        .toBe('mathpi-et-numbermaxvalue')
    })
  })
})