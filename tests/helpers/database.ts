import { Pool, PoolClient } from 'pg'

let dbPool: Pool | null = null

/**
 * Obtient une instance du pool de connexions PostgreSQL
 */
export const getDbPool = (): Pool => {
  dbPool ??= new Pool({
    connectionString: process.env.DATABASE_URI_TEST ?? process.env.DATABASE_URI,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
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
export const executeQuery = async (query: string, params?: any[]): Promise<any> => {
  const pool = getDbPool()
  const client = await pool.connect()
  try {
    return client.query(query, params)
  } finally {
    client.release()
  }
}

/**
 * Obtient toutes les tables de l'application (exclut les tables système)
 */
export const getApplicationTables = async (): Promise<string[]> => {
  const result = await executeQuery(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name NOT LIKE 'pg_%'
    AND table_name NOT LIKE 'sql_%'
    ORDER BY table_name
  `)
  return result.rows.map((row: any) => row.table_name)
}

/**
 * Truncate toutes les tables de l'application
 * Utilise RESTART IDENTITY CASCADE pour remettre les séquences à zéro
 */
export const truncateAllTables = async (): Promise<void> => {
  const tables = await getApplicationTables()
  
  if (tables.length === 0) {
    return
  }

  const tableList = tables.map(table => `"${table}"`).join(', ')
  await executeQuery(`TRUNCATE ${tableList} RESTART IDENTITY CASCADE`)
}

/**
 * Reset complet de la base de données (drop et recréation des tables)
 * ATTENTION: Cette opération est coûteuse et doit être utilisée avec parcimonie
 */
export const resetDatabase = async (): Promise<void> => {
  await executeQuery('DROP SCHEMA IF EXISTS public CASCADE')
  await executeQuery('CREATE SCHEMA public')
  await executeQuery('GRANT ALL ON SCHEMA public TO public')
}

/**
 * Démarre une transaction et retourne le client
 * Utile pour les tests qui nécessitent un rollback
 */
export const beginTransaction = async (): Promise<PoolClient> => {
  const pool = getDbPool()
  const client = await pool.connect()
  await client.query('BEGIN')
  return client
}

/**
 * Rollback et libère le client de transaction
 */
export const rollbackTransaction = async (client: PoolClient): Promise<void> => {
  try {
    await client.query('ROLLBACK')
  } finally {
    client.release()
  }
}

/**
 * Commit et libère le client de transaction
 */
export const commitTransaction = async (client: PoolClient): Promise<void> => {
  try {
    await client.query('COMMIT')
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