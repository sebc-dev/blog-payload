import { describe, it, expect } from 'vitest'
import { checkDatabaseConnection } from '../helpers/database'
import { getPayloadClient } from '../helpers/payload'

describe('Test Environment Setup', () => {
  it('should connect to test database', async () => {
    const isConnected = await checkDatabaseConnection()
    expect(isConnected).toBe(true)
  })

  it('should initialize Payload client', async () => {
    const payload = await getPayloadClient()
    expect(payload).toBeDefined()
    expect(payload.db).toBeDefined()
  })

  it('should have correct environment variables', () => {
    expect(process.env.NODE_ENV).toBe('test')
    const dbUri = process.env.DATABASE_URI_TEST || process.env.DATABASE_URI
    // Vérifie qu'on a bien une URI de test (local ou CI)
    expect(dbUri).toSatisfy(
      (uri: string) => uri.includes('test_payloadcms') || uri.includes('blog_payload_test'),
    )
  })
})
