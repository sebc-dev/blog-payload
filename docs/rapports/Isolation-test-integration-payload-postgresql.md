# Solutions pour l'isolation des tests d'intégration Payload CMS avec PostgreSQL

L'isolation parfaite des tests d'intégration avec Payload CMS nécessite une approche multicouche combinant transactions PostgreSQL, configuration Vitest optimisée et patterns éprouvés. Voici les solutions immédiatement implémentables pour éliminer vos race conditions et permettre le parallélisme.

## La solution recommandée : isolation par transactions PostgreSQL

La bibliothèque **pg-transactional-tests** offre la meilleure approche en patchant automatiquement le driver PostgreSQL pour wrapper chaque test dans une transaction avec rollback automatique. Cette solution est directement compatible avec Drizzle ORM utilisé par Payload.

### Installation et configuration de base

```bash
npm install --save-dev pg-transactional-tests
```

```typescript
// test-helpers/database-isolation.ts
import { testTransaction } from 'pg-transactional-tests';

export const useTestDatabase = () => {
  beforeAll(testTransaction.start)
  beforeEach(testTransaction.start)
  afterEach(testTransaction.rollback)
  afterAll(testTransaction.close)
}
```

### Intégration avec Payload CMS

```typescript
// test-helpers/payload-test-setup.ts
import payload from 'payload';
import { useTestDatabase } from './database-isolation';

export const setupPayloadTest = () => {
  useTestDatabase(); // Active l'isolation transactionnelle
  
  let payloadInstance: typeof payload;
  
  beforeAll(async () => {
    await payload.init({
      secret: process.env.PAYLOAD_SECRET_TEST,
      local: true,
      onInit: false, // Désactive les hooks d'initialisation
    });
    payloadInstance = payload;
  });
  
  return { payload: payloadInstance };
};

// Utilisation dans vos tests
describe('User Integration Tests', () => {
  const { payload } = setupPayloadTest();
  
  it('should create user without affecting other tests', async () => {
    const user = await payload.create({
      collection: 'users',
      data: {
        email: 'test@example.com',
        password: 'password123'
      }
    });
    
    expect(user.email).toBe('test@example.com');
    // Rollback automatique après le test
  });
});
```

## Configuration Vitest optimale pour éviter les race conditions

La configuration Vitest est cruciale pour l'isolation. Les race conditions proviennent principalement de la parallélisation par défaut des fichiers de test.

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Configuration essentielle pour tests d'intégration
    fileParallelism: false,      // Désactive la parallélisation des fichiers
    pool: 'forks',               // Utilise des processus isolés
    poolOptions: {
      forks: {
        singleFork: true,        // Un seul processus pour éviter les conflits
        isolate: true            // Isolation complète entre tests
      }
    },
    
    // Gestion séquentielle des hooks
    sequence: {
      concurrent: false,         // Tests séquentiels dans chaque fichier
      hooks: 'stack',           // beforeAll/afterAll en pile LIFO
      setupFiles: 'list'        // Setup files en ordre défini
    },
    
    // Timeouts adaptés aux opérations DB
    testTimeout: 30000,
    hookTimeout: 30000,
    
    // Setup global
    globalSetup: './tests/global-setup.ts',
    setupFiles: ['./tests/setup.ts'],
    
    environment: 'node'
  }
})
```

### Configuration séparée pour tests unitaires vs intégration

```typescript
// vitest.integration.config.ts
import { defineConfig, mergeConfig } from 'vitest/config'
import baseConfig from './vitest.config'

export default mergeConfig(baseConfig, defineConfig({
  test: {
    name: 'integration',
    fileParallelism: false,
    include: ['**/*.integration.{test,spec}.{js,ts}'],
    // Force la sérialisation pour les tests d'intégration
    maxConcurrency: 1
  }
}))
```

## Alternatives performantes à truncateAllTables()

Le `truncateAllTables()` est une source majeure de race conditions. Voici des alternatives plus sûres et performantes.

### 1. DELETE avec CASCADE (4x plus rapide)

```typescript
// test-helpers/database-cleanup.ts
export async function cleanDatabase(payload: Payload) {
  const collections = payload.config.collections;
  
  // DELETE est plus rapide que TRUNCATE sur PostgreSQL moderne
  for (const collection of collections) {
    await payload.delete({
      collection: collection.slug,
      where: {} // Supprime tout
    });
  }
}
```

### 2. Pattern de transactions avec savepoints

```typescript
// test-helpers/transaction-isolation.ts
export class PayloadTestIsolation {
  private client: PoolClient | null = null;
  private savepointCounter = 0;

  async setup(payload: Payload) {
    this.client = await payload.db.pool.connect();
    await this.client.query('BEGIN');
  }

  async startTest(): Promise<string> {
    if (!this.client) throw new Error('Client not initialized');
    
    this.savepointCounter++;
    const savepointName = `test_savepoint_${this.savepointCounter}`;
    
    await this.client.query(`SAVEPOINT "${savepointName}"`);
    return savepointName;
  }

  async rollbackTest(savepointName: string) {
    if (!this.client) return;
    
    await this.client.query(`ROLLBACK TO SAVEPOINT "${savepointName}"`);
  }

  async cleanup() {
    if (!this.client) return;
    
    await this.client.query('ROLLBACK');
    this.client.release();
    this.client = null;
  }
}
```

### 3. Solution haute performance avec pg-mem

Pour des tests ultra-rapides, **pg-mem** offre une base PostgreSQL complète en mémoire :

```typescript
// test-helpers/in-memory-db.ts
import { newDb } from 'pg-mem';

export function createInMemoryPayload() {
  const db = newDb();
  const { Pool } = db.adapters.createPg();
  
  return {
    pool: new Pool(),
    restore: () => db.backup().restore() // O(1) restauration instantanée
  };
}
```

## Pattern complet d'isolation recommandé

Voici l'implémentation complète combinant toutes les meilleures pratiques :

```typescript
// tests/setup/payload-test-manager.ts
import { Payload } from 'payload';
import { testTransaction } from 'pg-transactional-tests';
import { postgresAdapter } from '@payloadcms/db-postgres';

export class PayloadTestManager {
  private static instances = new Map<string, Payload>();
  
  static async getIsolatedInstance(testId: string): Promise<Payload> {
    if (!this.instances.has(testId)) {
      const instance = await payload.init({
        secret: process.env.PAYLOAD_SECRET_TEST,
        db: postgresAdapter({
          pool: {
            connectionString: process.env.TEST_DATABASE_URL,
          },
          transactionOptions: {
            isolationLevel: 'repeatable read'
          }
        }),
        // Désactive les features non nécessaires en test
        admin: { disable: true },
        graphQL: { disable: true },
        local: true
      });
      
      this.instances.set(testId, instance);
    }
    
    return this.instances.get(testId)!;
  }
  
  static async cleanup() {
    for (const instance of this.instances.values()) {
      await instance.db.destroy();
    }
    this.instances.clear();
  }
}

// tests/integration/example.integration.test.ts
import { describe, it, expect } from 'vitest';
import { PayloadTestManager } from '../setup/payload-test-manager';
import { useTestDatabase } from '../setup/database-isolation';

describe('Payload Integration Tests', () => {
  useTestDatabase(); // Active l'isolation transactionnelle
  
  let payload: Payload;
  
  beforeAll(async () => {
    payload = await PayloadTestManager.getIsolatedInstance('test-suite-1');
  });
  
  afterAll(async () => {
    await PayloadTestManager.cleanup();
  });
  
  it('creates user in isolated transaction', async () => {
    const user = await payload.create({
      collection: 'users',
      data: {
        email: `test-${Date.now()}@example.com`,
        password: 'secure123'
      }
    });
    
    expect(user.id).toBeDefined();
    // Automatiquement rollback après le test
  });
  
  it('parallel test without conflicts', async () => {
    // Ce test s'exécute dans sa propre transaction
    const users = await payload.find({
      collection: 'users'
    });
    
    expect(users.docs).toHaveLength(0); // Aucune donnée du test précédent
  });
});
```

## Gestion des contraintes d'unicité en parallèle

Pour éviter les collisions sur les contraintes uniques, utilisez des patterns de nommage dynamiques :

```typescript
// test-helpers/unique-data.ts
export const createUniqueTestData = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const workerId = process.env.VITEST_WORKER_ID || '1';
  
  return {
    email: `test_${workerId}_${timestamp}_${random}@example.com`,
    slug: `content-${workerId}-${timestamp}-${random}`,
    username: `user_${workerId}_${timestamp}`
  };
};
```

## Configuration du pool de connexions PostgreSQL

Pour éviter l'épuisement des connexions en tests parallèles :

```typescript
// payload.config.test.ts
export default buildConfig({
  db: postgresAdapter({
    pool: {
      connectionString: process.env.TEST_DATABASE_URL,
      max: 1,              // Une connexion par test
      min: 0,              // Pas de connexions persistantes
      idleTimeoutMillis: 1000,
      connectionTimeoutMillis: 5000
    }
  })
});
```

## Scripts package.json optimisés

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run --config vitest.unit.config.ts",
    "test:integration": "vitest run --config vitest.integration.config.ts",
    "test:integration:watch": "vitest --config vitest.integration.config.ts",
    "test:ci": "vitest run --reporter=junit --reporter=default"
  }
}
```

## Analyse des performances des différentes approches

D'après les benchmarks collectés, voici l'impact des différentes solutions :

**Isolation par transactions** : Réduction de 60-80% du temps d'exécution comparé à truncate, avec isolation parfaite et support du parallélisme.

**pg-mem (in-memory)** : Performance ultime pour tests unitaires, mais compatibilité PostgreSQL partielle limitant son usage pour certaines features Payload.

**IntegreSQL** : Solution industrielle avec pools de bases préconfigurées, 11ms en moyenne par test, idéale pour CI/CD à grande échelle.

**Sérialisation complète** : Simple mais 3-5x plus lent, à réserver aux cas critiques uniquement.

## Conclusion et recommandations

Pour résoudre immédiatement vos problèmes d'isolation, implémentez **pg-transactional-tests** avec la configuration Vitest fournie. Cette approche élimine les race conditions tout en conservant d'excellentes performances. Pour des besoins plus complexes ou à grande échelle, considérez IntegreSQL ou pg-mem selon vos contraintes spécifiques.