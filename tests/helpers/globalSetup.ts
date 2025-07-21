/**
 * Configuration globale exécutée une seule fois au démarrage de la suite de tests
 * Ce fichier prépare l'environnement de test global
 */

import { waitForDatabase } from './database'

export default async function globalSetup() {
  console.log('🚀 Initialisation de l\'environnement de test global...')

  try {
    // Vérifier que nous sommes en mode test
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('NODE_ENV doit être défini sur "test"')
    }

    // Attendre que la base de données soit disponible
    console.log('⏳ Attente de la disponibilité de la base de données...')
    await waitForDatabase(30, 1000) // 30 secondes max, vérification chaque seconde

    console.log('✅ Environnement de test initialisé avec succès')

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error)
    process.exit(1)
  }
}