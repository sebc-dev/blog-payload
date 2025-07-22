import { describe, it, expect } from 'vitest'

describe('Users - Tests unitaires de validation', () => {
  describe('Validation des emails', () => {
    // Fonction utilitaire pour valider un email
    const isValidEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    }

    it('devrait valider les emails corrects', () => {
      const validEmails = [
        'user@example.com',
        'test.user@domain.co.uk',
        'admin+tag@company.org',
        'user123@test-domain.com',
        'first.last@subdomain.example.com'
      ]

      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true)
      })
    })

    it('devrait rejeter les emails incorrects', () => {
      const invalidEmails = [
        'email-invalide',
        '@example.com',
        'user@',
        'user@domain',
        'user.domain.com',
        'user @example.com',
        'user@ex ample.com',
        '',
        'user@@example.com'
      ]

      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(false)
      })
    })
  })

  describe('Validation des mots de passe', () => {
    // Fonction utilitaire pour valider un mot de passe
    const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
      const errors: string[] = []

      if (!password) {
        errors.push('Le mot de passe est requis')
        return { valid: false, errors }
      }

      if (password.length < 8) {
        errors.push('Le mot de passe doit contenir au moins 8 caractères')
      }

      if (!/[A-Z]/.test(password)) {
        errors.push('Le mot de passe doit contenir au moins une majuscule')
      }

      if (!/[a-z]/.test(password)) {
        errors.push('Le mot de passe doit contenir au moins une minuscule')
      }

      if (!/[0-9]/.test(password)) {
        errors.push('Le mot de passe doit contenir au moins un chiffre')
      }

      return {
        valid: errors.length === 0,
        errors
      }
    }

    it('devrait valider un mot de passe fort', () => {
      const strongPasswords = [
        'MyStrongPass123',
        'SecurePassword2024!',
        'Abcd1234',
        'TestPassword99'
      ]

      strongPasswords.forEach(password => {
        const result = validatePassword(password)
        expect(result.valid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })
    })

    it('devrait rejeter un mot de passe trop court', () => {
      const result = validatePassword('Abc123')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Le mot de passe doit contenir au moins 8 caractères')
    })

    it('devrait rejeter un mot de passe sans majuscule', () => {
      const result = validatePassword('password123')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Le mot de passe doit contenir au moins une majuscule')
    })

    it('devrait rejeter un mot de passe sans minuscule', () => {
      const result = validatePassword('PASSWORD123')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Le mot de passe doit contenir au moins une minuscule')
    })

    it('devrait rejeter un mot de passe sans chiffre', () => {
      const result = validatePassword('MyPassword')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Le mot de passe doit contenir au moins un chiffre')
    })

    it('devrait rejeter un mot de passe vide', () => {
      const result = validatePassword('')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Le mot de passe est requis')
    })

    it('devrait accumuler plusieurs erreurs', () => {
      const result = validatePassword('weak')
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
    })
  })

  describe('Validation des données utilisateur', () => {
    interface UserData {
      email: string
      password: string
      confirmPassword?: string
    }

    // Fonction de validation complète
    const validateUserData = (data: UserData): { valid: boolean; errors: string[] } => {
      const errors: string[] = []

      // Validation de l'email
      if (!data.email) {
        errors.push('L\'email est requis')
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(data.email)) {
          errors.push('L\'email n\'est pas valide')
        }
      }

      // Validation du mot de passe
      if (!data.password) {
        errors.push('Le mot de passe est requis')
      } else if (data.password.length < 6) { // Règle simplifiée pour les tests
        errors.push('Le mot de passe doit contenir au moins 6 caractères')
      }

      // Validation de la confirmation du mot de passe
      if (data.confirmPassword !== undefined) {
        if (data.password !== data.confirmPassword) {
          errors.push('Les mots de passe ne correspondent pas')
        }
      }

      return {
        valid: errors.length === 0,
        errors
      }
    }

    it('devrait valider des données utilisateur correctes', () => {
      const userData = {
        email: 'user@example.com',
        password: 'password123'
      }

      const result = validateUserData(userData)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('devrait valider avec confirmation de mot de passe', () => {
      const userData = {
        email: 'user@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      }

      const result = validateUserData(userData)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('devrait rejeter un email invalide', () => {
      const userData = {
        email: 'email-invalide',
        password: 'password123'
      }

      const result = validateUserData(userData)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('L\'email n\'est pas valide')
    })

    it('devrait rejeter un mot de passe trop court', () => {
      const userData = {
        email: 'user@example.com',
        password: '123'
      }

      const result = validateUserData(userData)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Le mot de passe doit contenir au moins 6 caractères')
    })

    it('devrait rejeter des mots de passe qui ne correspondent pas', () => {
      const userData = {
        email: 'user@example.com',
        password: 'password123',
        confirmPassword: 'password456'
      }

      const result = validateUserData(userData)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Les mots de passe ne correspondent pas')
    })

    it('devrait rejeter des données vides', () => {
      const userData = {
        email: '',
        password: ''
      }

      const result = validateUserData(userData)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('L\'email est requis')
      expect(result.errors).toContain('Le mot de passe est requis')
    })

    it('devrait accumuler plusieurs erreurs', () => {
      const userData = {
        email: 'invalid-email',
        password: '123',
        confirmPassword: '456'
      }

      const result = validateUserData(userData)
      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(3)
    })
  })

  describe('Normalisation des données utilisateur', () => {
    // Fonction pour normaliser les données utilisateur
    const normalizeUserData = (data: { email: string; password: string }) => {
      return {
        email: data.email.toLowerCase().trim(),
        password: data.password // Le mot de passe ne doit pas être modifié
      }
    }

    it('devrait normaliser l\'email en minuscules', () => {
      const userData = {
        email: 'USER@EXAMPLE.COM',
        password: 'password123'
      }

      const normalized = normalizeUserData(userData)
      expect(normalized.email).toBe('user@example.com')
      expect(normalized.password).toBe('password123')
    })

    it('devrait supprimer les espaces de l\'email', () => {
      const userData = {
        email: '  user@example.com  ',
        password: 'password123'
      }

      const normalized = normalizeUserData(userData)
      expect(normalized.email).toBe('user@example.com')
    })

    it('ne devrait pas modifier le mot de passe', () => {
      const userData = {
        email: 'user@example.com',
        password: '  MyPassword123  '
      }

      const normalized = normalizeUserData(userData)
      expect(normalized.password).toBe('  MyPassword123  ')
    })
  })
})