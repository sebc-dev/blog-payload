import { Pool, QueryResult } from 'pg'

let dbPool: Pool | null = null

/**
 * Obtient une instance du pool de connexions PostgreSQL
 */
export const getDbPool = (): Pool => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Les helpers de base de données ne peuvent être utilisés qu\'en environnement de test')
  }
  dbPool ??= new Pool({
    connectionString: process.env.DATABASE_URI_TEST ?? process.env.DATABASE_URI,
    max: 5,                       // Réduit le nombre de connexions (moins de surcharge)
    idleTimeoutMillis: 10000,     // Timeout idle réduit
    connectionTimeoutMillis: 1000, // Timeout connexion plus rapide
  })
  return dbPool
}

/**
 * Ferme le pool de connexions
 */
export const closeDbPool = async (): Promise<void> => {
  if (dbPool) {
    await dbPool.end()
    dbPool = null
  }
}

/**
 * Exécute une requête SQL brute
 */
export const executeQuery = async (
  query: string,
  params?: (string | number | boolean | null)[]
): Promise<QueryResult> => {
  const pool = getDbPool()
  const client = await pool.connect()
  try {
    return client.query(query, params)
  } finally {
    client.release()
  }
}

/**
 * Vérifie que la base de données est accessible
 */
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await executeQuery('SELECT 1')
    return true
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error)
    return false
  }
}

/**
 * Attend que la base de données soit prête
 * Utile dans les environnements Docker
 */
export const waitForDatabase = async (maxRetries = 30, delayMs = 1000): Promise<void> => {
  for (let i = 0; i < maxRetries; i++) {
    const isConnected = await checkDatabaseConnection()
    if (isConnected) {
      return
    }
    
    console.log(`Tentative de connexion ${i + 1}/${maxRetries}...`)
    await new Promise(resolve => setTimeout(resolve, delayMs))
  }
  
  throw new Error(`Impossible de se connecter à la base de données après ${maxRetries} tentatives`)
}