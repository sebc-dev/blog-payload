/**
 * Configuration Vitest optimisée pour les tests d'intégration avec isolation
 * Basée sur les recommandations pour éviter les race conditions
 */

import { defineConfig, mergeConfig } from 'vitest/config'
import baseConfig from './vitest.config'

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      name: 'integration',

      // Configuration optimisée pour les performances
      fileParallelism: false, // Keep sequential to avoid DB conflicts
      pool: 'forks', // Processus isolés pour isolation
      poolOptions: {
        forks: {
          singleFork: false, // Permet plusieurs workers (améliore performances)
          isolate: true, // Garde isolation entre tests
          maxForks: 2, // Limite à 2 forks pour éviter surcharge DB
        },
      },

      // Timeouts réalistes (les longs timeouts masquent les vrais problèmes)
      testTimeout: 10000, // 10s max par test (suffisant si bien configuré)
      hookTimeout: 15000, // 15s pour setup/teardown

      // Setup spécifique aux tests d'intégration
      globalSetup: ['./tests/helpers/globalSetup.ts'],
      setupFiles: ['./tests/helpers/setup.ts'],

      // Inclusion spécifique des tests d'intégration
      include: ['tests/int/**/*.{test,spec}.{js,ts}'],
      exclude: ['tests/e2e/**', 'tests/unit/**', 'node_modules/**'],

      // Concurrence limitée mais pas bloquante
      maxConcurrency: 2, // Permet 2 tests simultanés max

      // Configuration de debug optimisée
      reporters: ['default'], // Reporter standard (plus rapide que verbose)
      logHeapUsage: false, // Désactive pour améliorer performances

      // Environnement spécifique
      environment: 'node',

      // Retry sur échec (utile pour les tests d'intégration)
      retry: 1,
    },
  }),
)
