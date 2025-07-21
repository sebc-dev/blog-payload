/**
 * Gestionnaire de tests Payload CMS avec isolation transactionnelle
 * Provides isolated Payload instances for integration tests
 */

import type { Payload } from 'payload'
import { getPayload } from 'payload'
import config from '@payload-config'
import { beforeAll, afterAll } from 'vitest'
// import { config } from 'dotenv'

export class PayloadTestManager {
  private static readonly instances = new Map<string, Payload>()
  
  /**
   * Obtient une instance Payload isolée pour les tests
   * @param testId Identifiant unique du test
   * @returns Instance Payload configurée pour les tests
   */
  static async getIsolatedInstance(testId?: string): Promise<Payload> {
    const id = testId ?? 'default'
    
    if (!this.instances.has(id)) {
      try {
        const instance = await getPayload({
          config: {
            ...config,
            // Optimisations pour les tests
            admin: {
              ...config.admin,
              disable: true // Désactive l'interface admin en test
            },
          },
          secret: process.env.PAYLOAD_SECRET ?? 'your-test-secret-key-here-make-it-long-and-secure',
          local: true
        })
        
        this.instances.set(id, instance)
      } catch (error) {
        console.error(`Erreur lors de l'initialisation de Payload pour ${id}:`, error)
        throw error
      }
    }
    
    return this.instances.get(id)!
  }
  
  /**
   * Nettoie toutes les instances Payload
   */
  static async cleanup() {
    for (const [id, instance] of this.instances.entries()) {
      try {
        if (instance.db && typeof instance.db.destroy === 'function') {
          await instance.db.destroy()
        }
      } catch (error) {
        console.warn(`Erreur lors du nettoyage de l'instance ${id}:`, error)
      }
    }
    this.instances.clear()
  }
  
  /**
   * Supprime une instance spécifique
   */
  static async cleanupInstance(testId: string) {
    const instance = this.instances.get(testId)
    if (instance) {
      try {
        if (instance.db && typeof instance.db.destroy === 'function') {
          await instance.db.destroy()
        }
      } catch (error) {
        console.warn(`Erreur lors du nettoyage de l'instance ${testId}:`, error)
      }
      this.instances.delete(testId)
    }
  }
}

/**
 * Configuration des tests Payload avec isolation
 * Hook setup pour les tests d'intégration
 */
export const setupPayloadTest = (testId?: string) => {
  let payloadInstance: Payload
  
  beforeAll(async () => {
    payloadInstance = await PayloadTestManager.getIsolatedInstance(testId)
  }, 30000) // Timeout de 30 secondes pour l'initialisation
  
  afterAll(async () => {
    if (testId) {
      await PayloadTestManager.cleanupInstance(testId)
    }
  }, 10000) // Timeout de 10 secondes pour le nettoyage
  
  return {
    getPayload: () => {
      if (!payloadInstance) {
        throw new Error('Payload instance not initialized. Make sure setupPayloadTest is called in beforeAll.')
      }
      return payloadInstance
    }
  }
}