import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import type { Payload } from 'payload'
import { getPayloadClient } from '../../helpers/payload'
import { truncateAllTables } from '../../helpers/database'

describe('Collection Users - Tests d\'intégration', () => {
  let payload: Payload

  beforeAll(async () => {
    payload = await getPayloadClient()
  })

  afterEach(async () => {
    await truncateAllTables()
  })

  describe('Création d\'utilisateurs', () => {
    it('devrait créer un utilisateur avec des données valides', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      }

      const result = await payload.create({
        collection: 'users',
        data: userData
      })

      expect(result.id).toBeDefined()
      expect(result.email).toBe(userData.email)
      expect(result.password).toBeUndefined() // Le mot de passe ne doit pas être retourné
      expect(result.createdAt).toBeDefined()
      expect(result.updatedAt).toBeDefined()
    })

    it('ne devrait pas créer un utilisateur avec un email invalide', async () => {
      const userData = {
        email: 'email-invalide',
        password: 'password123'
      }

      await expect(
        payload.create({
          collection: 'users',
          data: userData
        })
      ).rejects.toThrow()
    })

    it('ne devrait pas créer un utilisateur sans mot de passe', async () => {
      const userData = {
        email: 'test@example.com'
      }

      await expect(
        payload.create({
          collection: 'users',
          data: userData
        })
      ).rejects.toThrow()
    })

    it('ne devrait pas créer deux utilisateurs avec le même email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      }

      // Créer le premier utilisateur
      await payload.create({
        collection: 'users',
        data: userData
      })

      // Tenter de créer un second utilisateur avec le même email
      await expect(
        payload.create({
          collection: 'users',
          data: userData
        })
      ).rejects.toThrow()
    })
  })

  describe('Recherche d\'utilisateurs', () => {
    it('devrait trouver un utilisateur par email', async () => {
      const userData = {
        email: 'search@example.com',
        password: 'password123'
      }

      await payload.create({
        collection: 'users',
        data: userData
      })

      const result = await payload.find({
        collection: 'users',
        where: {
          email: {
            equals: userData.email
          }
        }
      })

      expect(result.docs).toHaveLength(1)
      expect(result.docs[0].email).toBe(userData.email)
    })

    it('devrait retourner une liste vide pour un email inexistant', async () => {
      const result = await payload.find({
        collection: 'users',
        where: {
          email: {
            equals: 'inexistant@example.com'
          }
        }
      })

      expect(result.docs).toHaveLength(0)
    })

    it('devrait paginer les résultats correctement', async () => {
      // Créer plusieurs utilisateurs
      const users = Array.from({ length: 5 }, (_, i) => ({
        email: `user${i}@example.com`,
        password: 'password123'
      }))

      for (const user of users) {
        await payload.create({
          collection: 'users',
          data: user
        })
      }

      const result = await payload.find({
        collection: 'users',
        limit: 2,
        page: 1
      })

      expect(result.docs).toHaveLength(2)
      expect(result.totalDocs).toBe(5)
      expect(result.totalPages).toBe(3)
      expect(result.page).toBe(1)
    })
  })

  describe('Mise à jour d\'utilisateurs', () => {
    it('devrait mettre à jour un utilisateur existant', async () => {
      const userData = {
        email: 'update@example.com',
        password: 'password123'
      }

      const created = await payload.create({
        collection: 'users',
        data: userData
      })

      const updated = await payload.update({
        collection: 'users',
        id: created.id,
        data: {
          email: 'updated@example.com'
        }
      })

      expect(updated.email).toBe('updated@example.com')
      expect(updated.updatedAt).not.toBe(created.updatedAt)
    })

    it('ne devrait pas permettre de mettre à jour avec un email déjà utilisé', async () => {
      const user1 = await payload.create({
        collection: 'users',
        data: {
          email: 'user1@example.com',
          password: 'password123'
        }
      })

      const user2 = await payload.create({
        collection: 'users',
        data: {
          email: 'user2@example.com',
          password: 'password123'
        }
      })

      await expect(
        payload.update({
          collection: 'users',
          id: user2.id,
          data: {
            email: user1.email
          }
        })
      ).rejects.toThrow()
    })
  })

  describe('Suppression d\'utilisateurs', () => {
    it('devrait supprimer un utilisateur existant', async () => {
      const userData = {
        email: 'delete@example.com',
        password: 'password123'
      }

      const created = await payload.create({
        collection: 'users',
        data: userData
      })

      await payload.delete({
        collection: 'users',
        id: created.id
      })

      const result = await payload.find({
        collection: 'users',
        where: {
          id: {
            equals: created.id
          }
        }
      })

      expect(result.docs).toHaveLength(0)
    })

    it('devrait lever une erreur lors de la suppression d\'un utilisateur inexistant', async () => {
      await expect(
        payload.delete({
          collection: 'users',
          id: '999999'
        })
      ).rejects.toThrow()
    })
  })

  describe('Authentification', () => {
    it('devrait permettre la connexion avec des identifiants corrects', async () => {
      const userData = {
        email: 'auth@example.com',
        password: 'password123'
      }

      await payload.create({
        collection: 'users',
        data: userData
      })

      const result = await payload.login({
        collection: 'users',
        data: {
          email: userData.email,
          password: userData.password
        }
      })

      expect(result.user).toBeDefined()
      expect(result.user.email).toBe(userData.email)
      expect(result.token).toBeDefined()
    })

    it('devrait refuser la connexion avec un mot de passe incorrect', async () => {
      const userData = {
        email: 'auth@example.com',
        password: 'password123'
      }

      await payload.create({
        collection: 'users',
        data: userData
      })

      await expect(
        payload.login({
          collection: 'users',
          data: {
            email: userData.email,
            password: 'wrong-password'
          }
        })
      ).rejects.toThrow()
    })

    it('devrait refuser la connexion avec un email inexistant', async () => {
      await expect(
        payload.login({
          collection: 'users',
          data: {
            email: 'inexistant@example.com',
            password: 'password123'
          }
        })
      ).rejects.toThrow()
    })
  })
})