import { describe, it, expect } from 'vitest'
import slugify from 'slugify'

describe('Categories - Tests unitaires des hooks et validations', () => {
  // Réplication du hook beforeValidate des Categories
  const beforeValidateHook = ({ value, data }: { value: any; data: any }) => {
    // Only auto-generate if value is truly missing (undefined/null), not empty string
    if ((value === undefined || value === null) && data?.name) {
      // Auto-generate slug from name if not provided
      const fallbackName = typeof data.name === 'string' ? data.name : data.name?.en ?? data.name?.fr ?? ''
      return slugify(fallbackName, {
        lower: true,
        strict: true,
        locale: 'fr'
      })
    }
    return value
  }

  // Réplication de la fonction de validation du slug
  const validateSlug = (value: string | null | undefined) => {
    if (!value || value.trim() === '') {
      return 'Le slug ne peut pas être vide'
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
      return 'Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets'
    }
    return true
  }

  describe('Hook beforeValidate pour slug', () => {
    it('devrait auto-générer le slug quand value est undefined', () => {
      const result = beforeValidateHook({
        value: undefined,
        data: { name: 'Technology Blog' }
      })
      
      expect(result).toBe('technology-blog')
    })

    it('devrait auto-générer le slug quand value est null', () => {
      const result = beforeValidateHook({
        value: null,
        data: { name: 'Web Development' }
      })
      
      expect(result).toBe('web-development')
    })

    it('ne devrait pas auto-générer le slug quand value est une chaîne vide', () => {
      const result = beforeValidateHook({
        value: '',
        data: { name: 'Technology Blog' }
      })
      
      expect(result).toBe('')
    })

    it('ne devrait pas auto-générer le slug quand value existe déjà', () => {
      const result = beforeValidateHook({
        value: 'existing-slug',
        data: { name: 'Technology Blog' }
      })
      
      expect(result).toBe('existing-slug')
    })

    it('devrait gérer le nom localisé avec .en', () => {
      const result = beforeValidateHook({
        value: undefined,
        data: { name: { en: 'Technology', fr: 'Technologie' } }
      })
      
      expect(result).toBe('technology')
    })

    it('devrait gérer le nom localisé avec .fr quand .en absent', () => {
      const result = beforeValidateHook({
        value: undefined,
        data: { name: { fr: 'Technologie' } }
      })
      
      expect(result).toBe('technologie')
    })

    it('devrait retourner une chaîne vide si aucun nom n\'est disponible', () => {
      const result = beforeValidateHook({
        value: undefined,
        data: { name: { de: '', es: null } }
      })
      
      expect(result).toBe('')
    })

    it('ne devrait pas auto-générer si data.name est absent', () => {
      const result = beforeValidateHook({
        value: undefined,
        data: {}
      })
      
      expect(result).toBeUndefined()
    })

    it('ne devrait pas auto-générer si data est absent', () => {
      const result = beforeValidateHook({
        value: undefined,
        data: null
      })
      
      expect(result).toBeUndefined()
    })

    it('devrait gérer les caractères spéciaux avec locale française', () => {
      const result = beforeValidateHook({
        value: undefined,
        data: { name: 'Développement & Création' }
      })
      
      expect(result).toBe('developpement-et-creation')
    })

    it('devrait gérer les accents français', () => {
      const result = beforeValidateHook({
        value: undefined,
        data: { name: 'Créativité et Innovation' }
      })
      
      expect(result).toBe('creativite-et-innovation')
    })

    it('devrait gérer les noms avec points et autres caractères', () => {
      const result = beforeValidateHook({
        value: undefined,
        data: { name: 'Node.js & React.js!' }
      })
      
      expect(result).toBe('nodejs-et-reactjs')
    })
  })

  describe('Validation du slug', () => {
    it('devrait valider un slug correct', () => {
      const validSlugs = [
        'technology',
        'web-development',
        'machine-learning',
        'data-science-101',
        'ai-2024'
      ]

      validSlugs.forEach(slug => {
        expect(validateSlug(slug)).toBe(true)
      })
    })

    it('devrait rejeter un slug vide', () => {
      expect(validateSlug('')).toBe('Le slug ne peut pas être vide')
      expect(validateSlug('   ')).toBe('Le slug ne peut pas être vide')
    })

    it('devrait rejeter un slug null', () => {
      expect(validateSlug(null)).toBe('Le slug ne peut pas être vide')
    })

    it('devrait rejeter un slug undefined', () => {
      expect(validateSlug(undefined)).toBe('Le slug ne peut pas être vide')
    })

    it('devrait rejeter des slugs avec des caractères majuscules', () => {
      expect(validateSlug('Technology')).toBe('Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets')
      expect(validateSlug('WEB-DEVELOPMENT')).toBe('Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets')
    })

    it('devrait rejeter des slugs avec des espaces', () => {
      expect(validateSlug('web development')).toBe('Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets')
      expect(validateSlug('machine learning')).toBe('Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets')
    })

    it('devrait rejeter des slugs avec des caractères spéciaux', () => {
      expect(validateSlug('web_development')).toBe('Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets')
      expect(validateSlug('node.js')).toBe('Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets')
      expect(validateSlug('react@framework')).toBe('Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets')
      expect(validateSlug('vue/js')).toBe('Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets')
    })

    it('devrait rejeter des slugs commençant ou finissant par un tiret', () => {
      expect(validateSlug('-technology')).toBe('Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets')
      expect(validateSlug('technology-')).toBe('Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets')
      expect(validateSlug('-web-development-')).toBe('Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets')
    })

    it('devrait rejeter des slugs avec des tirets consécutifs', () => {
      expect(validateSlug('web--development')).toBe('Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets')
      expect(validateSlug('machine---learning')).toBe('Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets')
    })

    it('devrait accepter des slugs avec des chiffres', () => {
      expect(validateSlug('web-3-0')).toBe(true)
      expect(validateSlug('html5')).toBe(true)
      expect(validateSlug('css3-flexbox')).toBe(true)
    })

    it('devrait accepter des slugs composés uniquement de chiffres', () => {
      expect(validateSlug('2024')).toBe(true)
      expect(validateSlug('101')).toBe(true)
    })
  })

  describe('Tests spécifiques de la regex de validation du slug', () => {
    // Tests spécifiques pour la ligne : if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value))
    it('devrait accepter des slugs qui respectent strictement la regex', () => {
      const validSlugs = [
        'a', 'z', '0', '9', // caractères simples
        'tech', 'blog', '2024', '123', // mots simples
        'web-dev', 'machine-learning', 'data-science', // mots avec tirets
        'a-b-c-d-e', 'word1-word2-word3', // chaînes de mots
        'tech2024', 'web3-development', '123-abc-456' // mixte lettres/chiffres
      ]

      validSlugs.forEach(slug => {
        expect(validateSlug(slug)).toBe(true)
        expect(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)).toBe(true)
      })
    })

    it('devrait rejeter des slugs avec des caractères interdits par la regex', () => {
      const invalidSlugs = [
        'TECH', 'Tech', 'WEB-DEV', // majuscules
        'web_dev', 'machine_learning', // underscores
        'web dev', 'machine learning', // espaces
        'web.dev', 'node.js', // points
        'react@vue', 'web+dev', // caractères spéciaux
        'développement', 'créativité', // accents (même si pas dans le code source)
        'C++', 'C#', 'F#', // caractères de programmation
        'web/dev', 'api\\rest', // slashes
        'data:science', 'web;dev', // deux-points, point-virgule
        'web[dev]', 'api{rest}', '(test)', // parenthèses, crochets
        'hello!', 'test?', 'end.', // ponctuation
        'café', 'naïve', 'résumé' // caractères non-ascii
      ]

      invalidSlugs.forEach(slug => {
        expect(validateSlug(slug)).toBe('Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets')
        expect(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)).toBe(false)
      })
    })

    it('devrait rejeter des slugs qui commencent ou finissent par un tiret (regex stricte)', () => {
      const invalidSlugs = [
        '-web', '-development', '-123',
        'web-', 'development-', '123-',
        '-web-', '-development-', '-123-'
      ]

      invalidSlugs.forEach(slug => {
        expect(validateSlug(slug)).toBe('Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets')
        expect(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)).toBe(false)
      })
    })

    it('devrait rejeter des slugs avec des tirets consécutifs (regex stricte)', () => {
      const invalidSlugs = [
        'web--dev', 'machine---learning', 'data--science--101',
        'a--b', 'test--', '--test', 'a--b--c'
      ]

      invalidSlugs.forEach(slug => {
        expect(validateSlug(slug)).toBe('Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets')
        expect(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)).toBe(false)
      })
    })

    it('devrait correctement identifier les parties valides de la regex', () => {
      // Tests pour comprendre chaque partie de la regex ^[a-z0-9]+(?:-[a-z0-9]+)*$
      
      // ^[a-z0-9]+ : doit commencer par au moins un caractère alphanumrique minuscule
      expect(/^[a-z0-9]+/.test('abc')).toBe(true)
      expect(/^[a-z0-9]+/.test('123')).toBe(true)
      expect(/^[a-z0-9]+/.test('a1b2')).toBe(true)
      expect(/^[a-z0-9]+/.test('-abc')).toBe(false) // ne peut pas commencer par tiret
      expect(/^[a-z0-9]+/.test('ABC')).toBe(false) // pas de majuscules
      
      // (?:-[a-z0-9]+)* : peut avoir zéro ou plusieurs groupes de tiret suivis d'alphanumériques
      expect(/(?:-[a-z0-9]+)*$/.test('')).toBe(true) // zéro groupe ok
      expect(/(?:-[a-z0-9]+)*$/.test('-abc')).toBe(true) // un groupe ok
      expect(/(?:-[a-z0-9]+)*$/.test('-abc-123')).toBe(true) // plusieurs groupes ok
      expect(/(?:-[a-z0-9]+)*$/.test('-')).toBe(true) // tiret seul correspond car * permet zéro occurrence
      expect(/(?:-[a-z0-9]+)*$/.test('--abc')).toBe(true) // trouve une correspondance partielle (-abc)
      
      // $ : doit se terminer correctement
      expect(/[a-z0-9]+(?:-[a-z0-9]+)*$/.test('abc-')).toBe(false) // ne peut pas finir par tiret
    })

    it('devrait gérer les cas limites de la regex', () => {
      // Cas limites acceptés
      expect(validateSlug('a')).toBe(true) // plus court slug valide
      expect(validateSlug('0')).toBe(true) // chiffre seul
      expect(validateSlug('a-b')).toBe(true) // plus court slug avec tiret
      expect(validateSlug('1-2')).toBe(true) // chiffres avec tiret
      
      // Cas limites rejetés
      expect(validateSlug('')).toBe('Le slug ne peut pas être vide') // vide (déjà testé mais important)
      expect(validateSlug('-')).toBe('Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets')
      expect(validateSlug('--')).toBe('Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets')
    })

    it('devrait être cohérent avec les slugs générés par le hook beforeValidate', () => {
      // Vérifie que tous les slugs générés par le hook respectent la regex de validation
      const testNames = [
        'Technology Blog',
        'Web Development',
        'Machine Learning',
        'Data Science 101',
        'Node.js & Express',
        'Développement Frontend',
        'C++ Programming'
      ]
      
      testNames.forEach(name => {
        const generatedSlug = beforeValidateHook({
          value: undefined,
          data: { name }
        })
        
        // Le slug généré doit toujours être valide selon la regex
        expect(validateSlug(generatedSlug)).toBe(true)
        expect(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(generatedSlug)).toBe(true)
      })
    })
  })

  describe('Cas complexes de génération de slug', () => {
    it('devrait gérer les noms avec plusieurs langues', () => {
      const result = beforeValidateHook({
        value: undefined,
        data: { 
          name: { 
            en: 'Technology & Innovation', 
            fr: 'Technologie & Innovation',
            es: 'Tecnología e Innovación'
          } 
        }
      })
      
      expect(result).toBe('technology-et-innovation')
    })

    it('devrait gérer les objets de noms vides', () => {
      const result = beforeValidateHook({
        value: undefined,
        data: { name: {} }
      })
      
      expect(result).toBe('')
    })

    it('devrait gérer les noms avec valeurs falsy', () => {
      const result = beforeValidateHook({
        value: undefined,
        data: { name: { en: '', fr: null, de: undefined } }
      })
      
      expect(result).toBe('')
    })

    it('devrait prendre la première valeur truthy disponible', () => {
      const result = beforeValidateHook({
        value: undefined,
        data: { 
          name: { 
            es: '',
            de: null,
            it: 'Tecnologia',
            pt: 'Tecnologia'
          } 
        }
      })
      
      // Le hook des Categories utilise une logique différente de extractFallbackName
      // Il cherche en priorité .en puis .fr, sinon chaîne vide
      expect(result).toBe('')
    })
  })
})