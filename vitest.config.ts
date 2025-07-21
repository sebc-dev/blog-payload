import { defineConfig } from 'vitest/config'
import path from 'node:path'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    pool: 'threads',
    fileParallelism: true, // Parallélisation pour des tests plus rapides
    environment: 'node',
    setupFiles: ['./tests/helpers/setup.ts'], // Fichier exécuté avant chaque test
    globalSetup: ['./tests/helpers/globalSetup.ts'], // Fichier exécuté une fois au démarrage
    testTimeout: 30000, // 30 secondes pour les tests d'intégration
    hookTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'coverage/**',
        'dist/**',
        'packages/*/test{,s}/**',
        '**/*.d.ts',
        'cypress/**',
        'test{,s}/**',
        'test{,-*}.{js,cjs,mjs,ts,tsx,jsx}',
        '**/*{.,-}test.{js,cjs,mjs,ts,tsx,jsx}',
        '**/*{.,-}spec.{js,cjs,mjs,ts,tsx,jsx}',
        '**/__tests__/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
        '**/.{eslint,mocha,prettier}rc.{js,cjs,yml}',
        'src/payload-types.ts', // Types générés automatiquement
        'src/migrations/**', // Migrations générées
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
    // Configuration spécifique pour les tests d'intégration
    include: ['tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['tests/e2e/**'], // Exclure les tests E2E de Vitest
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/tests': path.resolve(__dirname, './tests'),
      '@payload-config': path.resolve(__dirname, './src/payload.config.ts'),
    },
  },
})