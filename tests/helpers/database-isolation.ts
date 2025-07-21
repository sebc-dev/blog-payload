/**
 * Helper d'isolation des tests d'intégration par transactions PostgreSQL
 * Utilise pg-transactional-tests pour l'isolation automatique
 */

import { testTransaction } from 'pg-transactional-tests'
import { beforeAll, beforeEach, afterEach, afterAll } from 'vitest'

/**
 * Active l'isolation transactionnelle pour les tests
 * Chaque test s'exécute dans sa propre transaction avec rollback automatique
 */
export const useTestDatabase = () => {
  beforeAll(testTransaction.start)
  beforeEach(testTransaction.start)
  afterEach(testTransaction.rollback)
  afterAll(testTransaction.close)
}

/**
 * Génère des données uniques pour éviter les conflits de contraintes
 * Utilise le worker ID, timestamp et random pour garantir l'unicité
 */
export const createUniqueTestData = () => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(7)
  const workerId = process.env.VITEST_WORKER_ID ?? '1'
  
  return {
    email: `test_${workerId}_${timestamp}_${random}@example.com`,
    slug: `content-${workerId}-${timestamp}-${random}`,
    username: `user_${workerId}_${timestamp}`,
    name: `Test Item ${workerId}_${timestamp}`,
    title: `Test Title ${workerId}_${timestamp}`
  }
}

/**
 * Alternative performante au truncateAllTables pour le nettoyage
 * Utilise DELETE avec CASCADE (plus rapide que TRUNCATE)
 */
export const cleanDatabase = async (payload: any) => {
  const collections = payload.config.collections
  
  // DELETE est plus rapide que TRUNCATE sur PostgreSQL moderne
  for (const collection of collections) {
    try {
      await payload.delete({
        collection: collection.slug,
        where: {} // Supprime tout
      })
    } catch (error) {
      // Ignore les erreurs si la collection est vide
      console.debug(`Nettoyage de ${collection.slug}:`, error)
    }
  }
}