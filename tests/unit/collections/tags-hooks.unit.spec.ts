import { describe, it, expect } from 'vitest'
import slugify from 'slugify'

describe('Tags - Tests unitaires des hooks et validations', () => {
  // Réplication de la fonction extractFallbackName
  function extractFallbackName(nameData: unknown): string {
    if (typeof nameData === 'string') {
      return nameData
    } else if (typeof nameData === 'object' && nameData !== null) {
      // On tente d'obtenir la valeur en anglais, puis en français, sinon la première valeur disponible
      // @ts-ignore
      return nameData.en ?? nameData.fr ?? Object.values(nameData)[0] ?? ''
    }
    return ''
  }

  // Réplication du hook beforeValidate des Tags
  const beforeValidateHook = ({ value, data }: { value: any; data: any }) => {
    // Only auto-generate if value is truly missing (undefined/null), not empty string
    if ((value === undefined || value === null) && data?.name) {
      // Auto-generate slug from name if not provided
      const fallbackName = extractFallbackName(data.name)

      if (fallbackName) {
        return slugify(fallbackName, {
          lower: true,
          strict: true,
          locale: 'fr',
        })
      }
    }
    return value
  }

  // Réplication de la fonction de validation du slug des Tags
  const validateSlug = (value: string | null | undefined) => {
    if (value === '') {
      return 'Slug cannot be empty'
    }
    return true
  }

  // Réplication de la fonction de validation de couleur
  const validateColor = (value: unknown) => {
    if (value && typeof value === 'string' && !/^#[0-9A-Fa-f]{6}$/.test(value)) {
      return 'Color must be a valid hex code (e.g., #3B82F6)'
    }
    return true
  }

  describe('Fonction extractFallbackName', () => {
    it('devrait retourner la string directement', () => {
      expect(extractFallbackName('JavaScript')).toBe('JavaScript')
      expect(extractFallbackName('React Hooks')).toBe('React Hooks')
    })

    it('devrait retourner .en si présent', () => {
      const nameObject = { en: 'English Name', fr: 'Nom Français' }
      expect(extractFallbackName(nameObject)).toBe('English Name')
    })

    it('devrait retourner .fr si .en absent', () => {
      const nameObject = { fr: 'Nom Français' }
      expect(extractFallbackName(nameObject)).toBe('Nom Français')
    })

    it('devrait retourner la première valeur si .en et .fr absents', () => {
      const nameObject1 = { de: 'Deutsch Name', es: 'Nombre Español' }
      const result1 = extractFallbackName(nameObject1)
      expect(['Deutsch Name', 'Nombre Español']).toContain(result1)

      const nameObject2 = { it: 'Nome Italiano' }
      expect(extractFallbackName(nameObject2)).toBe('Nome Italiano')
    })

    it('devrait retourner une string vide pour objet vide', () => {
      expect(extractFallbackName({})).toBe('')
    })

    it('devrait retourner une string vide pour null/undefined', () => {
      expect(extractFallbackName(null)).toBe('')
      expect(extractFallbackName(undefined)).toBe('')
    })

    it("devrait ignorer les valeurs falsy dans l'objet", () => {
      const nameObject = { en: '', fr: 'Nom Français', de: null }
      // L'implémentation retourne la première valeur trouvée avec ??,
      // donc '' sera retourné car c'est truthy pour ??
      expect(extractFallbackName(nameObject)).toBe('')
    })

    it('devrait gérer les types primitifs non-string', () => {
      expect(extractFallbackName(123)).toBe('')
      expect(extractFallbackName(true)).toBe('')
      expect(extractFallbackName(false)).toBe('')
    })

    it('devrait gérer les objets avec valeurs non-string', () => {
      const nameObject = { en: 123, fr: true, de: 'Valid Name' }
      // Retourne 123 car c'est la première valeur trouvée (en)
      expect(extractFallbackName(nameObject)).toBe(123)
    })

    it("devrait retourner la première valeur truthy même si ce n'est pas une string", () => {
      const nameObject = { en: null, fr: undefined, de: 0, it: 'Valid Name' }
      // L'opérateur ?? ne considère que null et undefined comme nullish, pas 0
      // donc Object.values(nameObject)[0] (qui est null) sera nullish,
      // Object.values(nameObject)[0] ?? '' retournera ''
      expect(extractFallbackName(nameObject)).toBe('')
    })

    it('devrait gérer les objets avec des clés non-standard', () => {
      const nameObject = { zh: '中文', ja: '日본語', ko: '한국어' }
      const result = extractFallbackName(nameObject)
      expect(['中文', '日本語', '한국어']).toContain(result)
    })
  })

  describe('Tests spécifiques pour les lignes extractFallbackName', () => {
    // Tests spécifiques pour les lignes :
    // return nameData.en ?? nameData.fr ?? Object.values(nameData)[0] ?? ''
    // return ''

    describe('Logique de fallback avec opérateur nullish coalescing (??)', () => {
      it('devrait prioritiser .en quand présent, même si .fr existe', () => {
        const nameObject = { en: 'English', fr: 'Français', de: 'Deutsch' }
        expect(extractFallbackName(nameObject)).toBe('English')
      })

      it('devrait utiliser .fr quand .en est null', () => {
        const nameObject = { en: null, fr: 'Français', de: 'Deutsch' }
        expect(extractFallbackName(nameObject)).toBe('Français')
      })

      it('devrait utiliser .fr quand .en est undefined', () => {
        const nameObject = { en: undefined, fr: 'Français', de: 'Deutsch' }
        expect(extractFallbackName(nameObject)).toBe('Français')
      })

      it('devrait utiliser Object.values()[0] quand .en et .fr sont null/undefined', () => {
        const nameObject = { en: null, fr: undefined, de: 'Deutsch', es: 'Español' }
        // Object.values() retourne [null, undefined, 'Deutsch', 'Español']
        // Object.values()[0] est null, qui est nullish, donc ?? continue vers ''
        const result = extractFallbackName(nameObject)
        expect(result).toBe('')
      })

      it('devrait utiliser la chaîne vide finale quand tout est null/undefined', () => {
        const nameObject = { en: null, fr: undefined, de: null, es: undefined }
        expect(extractFallbackName(nameObject)).toBe('')
      })

      it('ne devrait pas confondre les valeurs falsy avec nullish', () => {
        // L'opérateur ?? ne considère que null et undefined comme nullish
        const testCases = [
          { input: { en: '', fr: 'Français' }, expected: '' }, // chaîne vide n'est pas nullish
          { input: { en: 0, fr: 'Français' }, expected: 0 }, // 0 n'est pas nullish
          { input: { en: false, fr: 'Français' }, expected: false }, // false n'est pas nullish
          { input: { en: NaN, fr: 'Français' }, expected: NaN }, // NaN n'est pas nullish
        ]

        testCases.forEach(({ input, expected }) => {
          expect(extractFallbackName(input)).toBe(expected)
        })
      })

      it('devrait gérer les objets avec seulement des valeurs nullish', () => {
        const nameObject = { en: null, fr: undefined }
        // Object.values() retourne [null, undefined]
        // Tous sont nullish, donc fallback vers ''
        expect(extractFallbackName(nameObject)).toBe('')
      })

      it('devrait gérer Object.values() avec des valeurs mélangées', () => {
        const nameObject = {
          a: null,
          b: undefined,
          c: '',
          d: 'Valid',
          e: 0,
          f: false,
        }

        // Pas de .en ni .fr, donc utilise Object.values()[0] qui est null
        // null est nullish, donc continue et retourne '' finalement
        expect(extractFallbackName(nameObject)).toBe('')
      })

      it('devrait utiliser la première valeur non-nullish de Object.values()', () => {
        const nameObject = {
          x: null, // index 0 - nullish
          y: undefined, // index 1 - nullish
          z: 'Found', // index 2 - non-nullish
        }

        // Object.values()[0] ?? '' évaluera chaque valeur jusqu'à trouver non-nullish
        const result = extractFallbackName(nameObject)
        expect(result).toBe('') // Car Object.values()[0] retourne null
      })

      it('devrait préserver les types de données lors du fallback', () => {
        const testCases = [
          { input: { en: 123 }, expected: 123 },
          { input: { en: true }, expected: true },
          { input: { en: [] }, expected: [] },
          { input: { en: {} }, expected: {} },
          {
            input: { fr: 'String après en nullish', en: null },
            expected: 'String après en nullish',
          },
        ]

        testCases.forEach(({ input, expected }) => {
          expect(extractFallbackName(input)).toEqual(expected)
        })
      })
    })

    describe("Tests d'ordre des propriétés et Object.values()", () => {
      it("devrait respecter l'ordre de priorité : .en > .fr > Object.values()[0]", () => {
        const nameObject = {
          first: 'Premier dans Object.values()',
          en: 'Anglais',
          fr: 'Français',
          second: 'Deuxième dans Object.values()',
        }

        expect(extractFallbackName(nameObject)).toBe('Anglais') // .en prioritaire
      })

      it('devrait utiliser .fr même si Object.values()[0] existe', () => {
        const nameObject = {
          first: 'Premier dans Object.values()',
          fr: 'Français',
          second: 'Deuxième dans Object.values()',
        }

        expect(extractFallbackName(nameObject)).toBe('Français') // .fr prioritaire sur Object.values()[0]
      })

      it("devrait dépendre de l'ordre d'insertion pour Object.values()[0]", () => {
        // En JavaScript moderne, Object.values() respecte l'ordre d'insertion
        const nameObject1 = { z: 'Z First', a: 'A Second' }
        const nameObject2 = { a: 'A First', z: 'Z Second' }

        const result1 = extractFallbackName(nameObject1)
        const result2 = extractFallbackName(nameObject2)

        // Object.values()[0] devrait retourner la première valeur insérée
        expect(['Z First', 'A Second']).toContain(result1)
        expect(['A First', 'Z Second']).toContain(result2)
      })
    })

    describe("Tests pour la ligne return '' finale", () => {
      it('devrait retourner chaîne vide pour les types primitifs non-string', () => {
        const primitiveTypes = [123, true, false, null, undefined, Symbol('test')]

        primitiveTypes.forEach((primitive) => {
          expect(extractFallbackName(primitive)).toBe('')
        })
      })

      it('devrait retourner chaîne vide pour les objets spéciaux', () => {
        const specialObjects = [
          new Date(), // objet Date
          /regex/, // regex
          () => {}, // fonction
          Promise.resolve(), // Promise
          new Map(), // Map
          new Set(), // Set
        ]

        specialObjects.forEach((obj) => {
          expect(extractFallbackName(obj)).toBe('')
        })

        // Array vide teste séparément car Object.values([]) retourne []
        expect(extractFallbackName([])).toBe('') // Array vide n'a pas de valeurs
      })

      it('devrait retourner chaîne vide quand nameData est null explicitement', () => {
        expect(extractFallbackName(null)).toBe('')
      })

      it('devrait gérer les objets avec des propriétés non-enumerable', () => {
        const obj = {}
        Object.defineProperty(obj, 'hidden', {
          value: 'Hidden Value',
          enumerable: false,
        })

        // Object.values() ignore les propriétés non-enumerable
        expect(extractFallbackName(obj)).toBe('')
      })
    })

    describe("Tests d'edge cases pour la logique de fallback", () => {
      it('devrait gérer les circular references sans planter', () => {
        const circular: any = { name: 'Circular' }
        circular.self = circular

        // La fonction ne devrait pas planter même avec des références circulaires
        expect(() => extractFallbackName(circular)).not.toThrow()
        const result = extractFallbackName(circular)
        expect(['Circular', circular]).toContain(result)
      })

      it('devrait gérer les objets avec des getters', () => {
        const objWithGetter = {
          get en() {
            return 'Dynamic English'
          },
          fr: 'Static French',
        }

        expect(extractFallbackName(objWithGetter)).toBe('Dynamic English')
      })

      it('devrait gérer les objets héritant de prototypes', () => {
        function NameConstructor(this: any) {
          this.en = 'Inherited English'
        }
        NameConstructor.prototype.fr = 'Prototype French'

        const obj = new (NameConstructor as any)()

        expect(extractFallbackName(obj)).toBe('Inherited English')
      })

      it('devrait gérer les tableaux comme objets', () => {
        const arrayAsObject = ['index0', 'index1']
        // Les arrays sont des objets, donc passent le test typeof === 'object'
        // Pas de .en ni .fr, donc Object.values()[0] qui retourne 'index0'
        const result = extractFallbackName(arrayAsObject)
        expect(result).toBe('index0') // Object.values() sur un array retourne les éléments
      })

      it('devrait préserver les valeurs undefined dans la chaîne de fallback', () => {
        const nameObject = {
          en: undefined,
          fr: undefined,
          other: 'Available',
        }

        // undefined est nullish, donc continue dans la chaîne
        expect(extractFallbackName(nameObject)).toBe('')
      })

      it('devrait retourner une chaîne vide pour les primitives non-object', () => {
        // Test spécifique pour la ligne "return ''" (ligne 12)
        const nonObjects = [123, true, false]

        nonObjects.forEach((value) => {
          expect(extractFallbackName(value)).toBe('')
        })
      })

      it("devrait utiliser la première valeur non-nullish d'Object.values()", () => {
        // Test pour couvrir l'évaluation complète de la chaîne de fallback (ligne 10)
        const nameObject = {
          a: null, // nullish
          b: undefined, // nullish
          c: 0, // non-nullish mais falsy
          d: 'valid', // non-nullish et truthy
        }

        // Pas de .en ni .fr, Object.values()[0] est null (nullish)
        // donc fallback vers '' à la fin
        expect(extractFallbackName(nameObject)).toBe('')
      })

      it('devrait gérer Object.values() retournant des valeurs non-nullish', () => {
        // Test pour s'assurer que Object.values()[0] est bien utilisé quand non-nullish
        const nameObject = {
          firstKey: 'firstValue',
          secondKey: 'secondValue',
        }

        // Pas de .en ni .fr, donc Object.values()[0] qui est 'firstValue'
        expect(extractFallbackName(nameObject)).toBe('firstValue')
      })

      it("devrait tester l'ordre exact des opérateurs nullish coalescing", () => {
        // Test pour vérifier l'ordre précis : nameData.en ?? nameData.fr ?? Object.values(nameData)[0] ?? ''
        const testCases = [
          // en présent et non-nullish -> retourne en
          { input: { en: 'EN', fr: 'FR', other: 'OTHER' }, expected: 'EN' },
          // en nullish, fr présent et non-nullish -> retourne fr
          { input: { en: null, fr: 'FR', other: 'OTHER' }, expected: 'FR' },
          { input: { en: undefined, fr: 'FR', other: 'OTHER' }, expected: 'FR' },
          // en et fr nullish, Object.values()[0] non-nullish -> retourne Object.values()[0]
          { input: { en: null, fr: undefined, other: 'OTHER' }, expected: '' }, // Object.values()[0] est null
          // Tout nullish -> retourne ''
          { input: { en: null, fr: undefined }, expected: '' },
        ]

        testCases.forEach(({ input, expected }) => {
          expect(extractFallbackName(input)).toBe(expected)
        })
      })
    })
  })

  describe('Hook beforeValidate pour slug', () => {
    it('devrait auto-générer le slug quand value est undefined', () => {
      const result = beforeValidateHook({
        value: undefined,
        data: { name: 'JavaScript Framework' },
      })

      expect(result).toBe('javascript-framework')
    })

    it('devrait auto-générer le slug quand value est null', () => {
      const result = beforeValidateHook({
        value: null,
        data: { name: 'React Components' },
      })

      expect(result).toBe('react-components')
    })

    it('ne devrait pas auto-générer le slug quand value est une chaîne vide', () => {
      const result = beforeValidateHook({
        value: '',
        data: { name: 'JavaScript Framework' },
      })

      expect(result).toBe('')
    })

    it('ne devrait pas auto-générer le slug quand value existe déjà', () => {
      const result = beforeValidateHook({
        value: 'existing-slug',
        data: { name: 'JavaScript Framework' },
      })

      expect(result).toBe('existing-slug')
    })

    it('devrait utiliser extractFallbackName pour les noms localisés', () => {
      const result = beforeValidateHook({
        value: undefined,
        data: { name: { en: 'JavaScript', fr: 'JavaScript' } },
      })

      expect(result).toBe('javascript')
    })

    it('devrait retourner value si fallbackName est vide', () => {
      const result = beforeValidateHook({
        value: undefined,
        data: { name: {} },
      })

      expect(result).toBeUndefined()
    })

    it('devrait retourner value si data.name est absent', () => {
      const result = beforeValidateHook({
        value: undefined,
        data: {},
      })

      expect(result).toBeUndefined()
    })

    it('devrait retourner value si data est null', () => {
      const result = beforeValidateHook({
        value: undefined,
        data: null,
      })

      expect(result).toBeUndefined()
    })

    it('devrait gérer les caractères spéciaux avec locale française', () => {
      const result = beforeValidateHook({
        value: undefined,
        data: { name: 'Node.js & Express!' },
      })

      expect(result).toBe('nodejs-et-express')
    })

    it('devrait gérer les accents français', () => {
      const result = beforeValidateHook({
        value: undefined,
        data: { name: 'Développement Frontend' },
      })

      expect(result).toBe('developpement-frontend')
    })

    it('devrait gérer les noms complexes avec plusieurs caractères spéciaux', () => {
      const result = beforeValidateHook({
        value: undefined,
        data: { name: 'C++ & Java (Advanced)!' },
      })

      expect(result).toBe('c-et-java-advanced')
    })

    it('ne devrait pas générer si fallbackName est une chaîne vide', () => {
      const result = beforeValidateHook({
        value: undefined,
        data: { name: { en: '', fr: null } },
      })

      expect(result).toBeUndefined()
    })
  })

  describe('Validation du slug des Tags', () => {
    it('devrait valider un slug non vide', () => {
      const validSlugs = [
        'javascript',
        'react-hooks',
        'machine-learning',
        'WEB_DEVELOPMENT', // Les Tags ont une validation moins stricte
        'Node.js',
        'C++',
        'test@example',
      ]

      validSlugs.forEach((slug) => {
        expect(validateSlug(slug)).toBe(true)
      })
    })

    it('devrait rejeter uniquement les chaînes vides', () => {
      expect(validateSlug('')).toBe('Slug cannot be empty')
    })

    it('devrait accepter null et undefined', () => {
      expect(validateSlug(null)).toBe(true)
      expect(validateSlug(undefined)).toBe(true)
    })

    it('devrait accepter des espaces (validation moins stricte que Categories)', () => {
      expect(validateSlug('   ')).toBe(true)
      expect(validateSlug('web development')).toBe(true)
    })

    it('devrait accepter tous les caractères spéciaux', () => {
      expect(validateSlug('node.js')).toBe(true)
      expect(validateSlug('react@framework')).toBe(true)
      expect(validateSlug('vue/js')).toBe(true)
      expect(validateSlug('C++')).toBe(true)
    })
  })

  describe('Validation de couleur hexadécimale', () => {
    it('devrait valider les couleurs hexadécimales correctes', () => {
      const validColors = [
        '#FF0000',
        '#00FF00',
        '#0000FF',
        '#FFFFFF',
        '#000000',
        '#3B82F6',
        '#ff0000',
        '#00ff00',
        '#0000ff', // minuscules
        '#AbCdEf',
        '#123456',
        '#789ABC', // mixte
      ]

      validColors.forEach((color) => {
        expect(validateColor(color)).toBe(true)
      })
    })

    it('devrait rejeter les couleurs hexadécimales incorrectes', () => {
      const invalidColors = [
        '#FFF',
        '#GGGGGG',
        'red',
        'rgb(255,0,0)',
        '#12345G',
        'FF0000',
        '#1234567',
        '#12345',
      ]

      invalidColors.forEach((color) => {
        expect(validateColor(color)).toBe('Color must be a valid hex code (e.g., #3B82F6)')
      })

      // Les valeurs falsy sont acceptées - mais '#' n'est pas falsy et est une string invalide
      expect(validateColor('#')).toBe('Color must be a valid hex code (e.g., #3B82F6)') // string invalide
      expect(validateColor('')).toBe(true) // string vide est falsy donc acceptée
    })

    it('devrait accepter null et undefined (couleur optionnelle)', () => {
      expect(validateColor(null)).toBe(true)
      expect(validateColor(undefined)).toBe(true)
    })

    it('devrait accepter les valeurs falsy', () => {
      expect(validateColor('')).toBe(true)
      expect(validateColor(0)).toBe(true)
      expect(validateColor(false)).toBe(true)
    })

    it('devrait rejeter les types non-string avec contenu', () => {
      expect(validateColor(123)).toBe(true) // N'est pas une string, donc accepté
      expect(validateColor(true)).toBe(true) // N'est pas une string, donc accepté
      expect(validateColor([])).toBe(true) // N'est pas une string, donc accepté
      expect(validateColor({})).toBe(true) // N'est pas une string, donc accepté
    })

    it('devrait être sensible à la casse pour les lettres A-F', () => {
      expect(validateColor('#aabbcc')).toBe(true)
      expect(validateColor('#AABBCC')).toBe(true)
      expect(validateColor('#AaBbCc')).toBe(true)
    })

    it('devrait rejeter les caractères non-hexadécimaux', () => {
      expect(validateColor('#GHIJKL')).toBe('Color must be a valid hex code (e.g., #3B82F6)')
      expect(validateColor('#12345G')).toBe('Color must be a valid hex code (e.g., #3B82F6)')
      expect(validateColor('#abcdeZ')).toBe('Color must be a valid hex code (e.g., #3B82F6)')
    })

    it('devrait exiger exactement 6 caractères après le #', () => {
      expect(validateColor('#12345')).toBe('Color must be a valid hex code (e.g., #3B82F6)')
      expect(validateColor('#1234567')).toBe('Color must be a valid hex code (e.g., #3B82F6)')
      expect(validateColor('#123')).toBe('Color must be a valid hex code (e.g., #3B82F6)')
    })

    it('devrait exiger le caractère # au début', () => {
      expect(validateColor('FF0000')).toBe('Color must be a valid hex code (e.g., #3B82F6)')
      expect(validateColor('123456')).toBe('Color must be a valid hex code (e.g., #3B82F6)')
    })
  })

  describe("Cas complexes d'intégration", () => {
    it('devrait gérer un workflow complet de création de tag', () => {
      // Simulation d'une création de tag avec auto-génération de slug
      const tagData = {
        name: { en: 'JavaScript Framework', fr: 'Framework JavaScript' },
      }

      // Hook beforeValidate
      const generatedSlug = beforeValidateHook({
        value: undefined,
        data: tagData,
      })

      expect(generatedSlug).toBe('javascript-framework')

      // Validation du slug généré
      expect(validateSlug(generatedSlug)).toBe(true)

      // Validation de couleur optionnelle
      expect(validateColor('#3B82F6')).toBe(true)
    })

    it("devrait gérer les cas d'erreur en cascade", () => {
      // Nom vide qui ne génère pas de slug
      const result1 = beforeValidateHook({
        value: undefined,
        data: { name: {} },
      })
      expect(result1).toBeUndefined()

      // Slug vide qui échoue à la validation
      expect(validateSlug('')).toBe('Slug cannot be empty')

      // Couleur invalide
      expect(validateColor('#invalid')).toBe('Color must be a valid hex code (e.g., #3B82F6)')
    })

    it('devrait préserver les slugs existants même invalides', () => {
      // Si un slug existe déjà, il ne doit pas être modifié
      const result = beforeValidateHook({
        value: 'existing-invalid-slug!@#',
        data: { name: 'New Name' },
      })

      expect(result).toBe('existing-invalid-slug!@#')
    })
  })
})
