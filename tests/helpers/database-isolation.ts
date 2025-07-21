/**
 * Helper d'isolation des tests d'intégration pour Payload CMS
 * 
 * ⚠️  IMPORTANT: N'utilise PAS d'isolation transactionnelle complexe
 * L'isolation transactionnelle (pg-transactional-tests) cause des timeouts
 * avec Payload CMS car elle interfère avec l'initialisation du schéma.
 * 
 * 📋 Stratégie d'isolation recommandée:
 * 1. Utiliser des données uniques par test avec createUniqueTestData()
 * 2. Pattern simple : beforeAll(getPayloadClient) + afterEach(cleanup léger)
 * 3. Éviter les données partagées entre tests
 * 
 * Voir: docs/rapports/Tests-Integration-Isolation-Solution.md
 */

/**
 * ❌ DEPRECATED - Ne pas utiliser
 * Cause des timeouts avec Payload CMS
 * @deprecated Utiliser des données uniques à la place
 */
export const useTestDatabase = () => {
  console.warn('⚠️  useTestDatabase est deprecated - utiliser createUniqueTestData() à la place')
  // Fonction vide pour éviter les erreurs, mais décourage l'usage
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