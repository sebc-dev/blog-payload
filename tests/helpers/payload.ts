import { getPayload, Payload } from 'payload'
import payloadConfig from '@payload-config'

let payloadInstance: Payload | null = null

/**
 * Initialise et retourne une instance Payload en mode local (sans serveur HTTP)
 * Utilise un singleton pour éviter les reconnexions multiples
 */
export const getPayloadClient = async (): Promise<Payload> => {
  if (payloadInstance) {
    return payloadInstance
  }

  try {
    const config = await payloadConfig
    payloadInstance = await getPayload({
      config,
    })

    return payloadInstance
  } catch (error) {
    console.error("Erreur lors de l'initialisation de Payload:", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      configAvailable: !!payloadConfig,
    })
    throw error
  }
}

/**
 * Ferme proprement la connexion Payload
 */
export const closePayload = async (): Promise<void> => {
  if (payloadInstance?.db?.destroy && typeof payloadInstance.db.destroy === 'function') {
    await payloadInstance.db.destroy()
  }
  payloadInstance = null
}

/**
 * Reset l'instance Payload (force une nouvelle connexion)
 */
export const resetPayloadInstance = (): void => {
  payloadInstance = null
}
