// lighthouserc.js - Stratégie budget plutôt que scores absolus
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'pnpm start',
      startServerReadyPattern: 'ready on',
      url: ['http://localhost:3000', 'http://localhost:3000/admin'],
      numberOfRuns: 3,
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        // AMÉLIORATION : Budgets spécifiques au lieu de scores globaux
        'categories:performance': ['warn', { minScore: 0.8 }], // Warn au lieu d'error pour les sites avec CMS
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        // Budgets métriques spécifiques (plus stable)
        'first-contentful-paint': ['error', { maxNumericValue: 3000 }], // Plus généreux pour un CMS
        interactive: ['error', { maxNumericValue: 5000 }], // Plus généreux pour un CMS
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
