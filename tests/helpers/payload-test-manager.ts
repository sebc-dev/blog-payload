/**
 * Gestionnaire de tests Payload CMS avec isolation transactionnelle
 * Provides isolated Payload instances for integration tests
 */

import type { Payload } from 'payload'
import { getPayload } from 'payload'
import config from '@payload-config'

const instances = new Map<string, Payload>()

/**
 * Obtient une instance Payload isolée pour les tests
 * @param testId Identifiant unique du test
 * @returns Instance Payload configurée pour les tests
 */
export async function getIsolatedInstance(testId?: string): Promise<Payload> {
  const id = testId ?? 'default'

  if (!instances.has(id)) {
    try {
      const instance = await getPayload({
        config,
      })
      instances.set(id, instance)
    } catch (error) {
      console.error(`Erreur lors de l'initialisation de Payload pour ${id}:`, error)
      throw error
    }
  }

  const instance = instances.get(id)
  if (!instance) {
    throw new Error(`Instance Payload non trouvée pour ${id}`)
  }
  return instance
}

/**
 * Supprime une instance spécifique
 */
export async function cleanupInstance(testId: string) {
  const instance = instances.get(testId)
  if (instance) {
    try {
      if (instance.db && typeof instance.db.destroy === 'function') {
        await instance.db.destroy()
      }
    } catch (error) {
      console.warn(`Erreur lors du nettoyage de l'instance ${testId}:`, error)
    }
    instances.delete(testId)
  }
}
