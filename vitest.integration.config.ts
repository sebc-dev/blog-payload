/**
 * Configuration Vitest optimisée pour les tests d'intégration avec isolation
 * Basée sur les recommandations pour éviter les race conditions
 */

import { defineConfig, mergeConfig } from 'vitest/config'
import baseConfig from './vitest.config'

export default mergeConfig(baseConfig, defineConfig({
  test: {
    name: 'integration',
    
    // Configuration essentielle pour tests d'intégration isolés
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
    
    // Timeouts adaptés aux opérations DB avec transactions
    testTimeout: 30000,
    hookTimeout: 30000,
    
    // Setup spécifique aux tests d'intégration
    globalSetup: ['./tests/helpers/globalSetup.ts'],
    setupFiles: ['./tests/helpers/setup.ts'],
    
    // Inclusion spécifique des tests d'intégration
    include: ['tests/int/**/*.{test,spec}.{js,ts}'],
    exclude: [
      'tests/e2e/**',
      'tests/unit/**',
      'node_modules/**'
    ],
    
    // Force la sérialisation pour éviter les conflits de base de données
    maxConcurrency: 1,
    
    // Configuration pour le debugging
    reporters: ['verbose'],
    logHeapUsage: true,
    
    // Environnement spécifique
    environment: 'node',
    
    // Retry sur échec (utile pour les tests d'intégration)
    retry: 1
  }
}))