/**
 * Configuration exécutée avant chaque fichier de test
 * Ce fichier configure l'environnement global pour tous les tests
 */

import { beforeAll, afterAll } from 'vitest'
import { waitForDatabase, closeDbPool } from './database'
import { closePayload } from './payload'

// Configuration globale pour tous les tests
beforeAll(async () => {
  // Vérifications critiques seulement (plus rapide)
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Les tests ne peuvent être exécutés qu\'en mode NODE_ENV=test')
  }

  if (!process.env.DATABASE_URI_TEST && !process.env.DATABASE_URI) {
    throw new Error('DATABASE_URI_TEST ou DATABASE_URI doit être configuré pour les tests')
  }

  // Vérification rapide de connexion (timeout réduit)
  await waitForDatabase(5, 500) // 5 tentatives, 500ms entre chaque
}, 8000) // Timeout de setup réduit à 8s

// Nettoyage global après tous les tests
afterAll(async () => {
  try {
    await closePayload()
    await closeDbPool()
  } catch (error) {
    // Log simplifié pour éviter la verbosité
    console.warn('Avertissement nettoyage:', error.message)
  }
}, 5000) // Timeout de nettoyage réduit