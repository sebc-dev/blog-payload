/**
 * Configuration exécutée avant chaque fichier de test
 * Ce fichier configure l'environnement global pour tous les tests
 */

import { beforeAll, afterAll } from 'vitest'
import { waitForDatabase, closeDbPool } from './database'
import { closePayload } from './payload'

// Configuration globale pour tous les tests
beforeAll(async () => {
  // Vérifier que nous sommes bien en environnement de test
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Les tests ne peuvent être exécutés qu\'en mode NODE_ENV=test')
  }

  // Vérifier que l'URI de test est configurée
  if (!process.env.DATABASE_URI_TEST && !process.env.DATABASE_URI) {
    throw new Error('DATABASE_URI_TEST ou DATABASE_URI doit être configuré pour les tests')
  }

  // Attendre que la base de données soit prête
  console.log('🔄 Vérification de la connexion à la base de données de test...')
  await waitForDatabase()
  console.log('✅ Base de données de test prête')
})

// Nettoyage global après tous les tests
afterAll(async () => {
  console.log('🧹 Nettoyage des ressources de test...')
  
  try {
    await closePayload()
    await closeDbPool()
    console.log('✅ Ressources fermées proprement')
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error)
  }
})