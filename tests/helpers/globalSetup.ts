/**
 * Configuration globale exécutée une seule fois au démarrage de la suite de tests
 * Ce fichier prépare l'environnement de test global
 */

import { config } from 'dotenv'
import { waitForDatabase } from './database'

// Charger les variables d'environnement de test
config({ path: '.env.test' })

export default async function globalSetup() {
  console.log("🚀 Initialisation de l'environnement de test global...")

  try {
    // Vérifier que nous sommes en mode test
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('NODE_ENV doit être défini sur "test"')
    }

    // Vérification rapide de la base de données
    await waitForDatabase(10, 500) // 10 tentatives, 500ms entre chaque
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation:", error)
    process.exit(1)
  }
}
