# Tests d'Intégration - Guide d'Utilisation

Ce guide explique comment utiliser l'environnement de tests d'intégration mis en place pour ce projet Payload CMS.

## 🏗️ Architecture des Tests

L'environnement de test est basé sur :

- **PostgreSQL 16** dans un conteneur Docker isolé
- **Vitest** comme framework de test (plus rapide que Jest)
- **Helpers personnalisés** pour la gestion de Payload et de la base de données
- **Configuration optimisée** pour des tests rapides et fiables

## 🚀 Démarrage Rapide

### 1. Installation des dépendances

```bash
pnpm install
```

### 2. Démarrer l'environnement de test

```bash
# Démarre PostgreSQL en arrière-plan
pnpm test:setup
```

### 3. Exécuter les tests

```bash
# Tests d'intégration uniquement
pnpm test:int

# Tests en mode watch (développement)
pnpm test:int:watch

# Tests avec couverture de code
pnpm test:int:coverage

# Tous les tests (intégration + E2E)
pnpm test
```

### 4. Arrêter l'environnement

```bash
# Arrête et nettoie PostgreSQL
pnpm test:teardown
```

## 📁 Structure des Tests

```
tests/
├── helpers/           # Utilitaires partagés
│   ├── database.ts    # Gestion de la base de données
│   ├── payload.ts     # Instance Payload pour les tests
│   ├── setup.ts       # Configuration par fichier de test
│   └── globalSetup.ts # Configuration globale
├── int/              # Tests d'intégration
│   ├── collections/  # Tests des collections Payload
│   └── api/          # Tests des API
└── e2e/              # Tests end-to-end (Playwright)
```

## 🔧 Configuration

### Variables d'Environnement

Les tests utilisent le fichier `.env.test` :

```env
NODE_ENV=test
DATABASE_URI_TEST=postgresql://test_user:test_password@localhost:5433/test_payloadcms
PAYLOAD_SECRET=your-test-secret-key
```

### Base de Données de Test

- **Port** : 5433 (pour éviter les conflits avec l'instance de développement)
- **Utilisateur** : `test_user`
- **Mot de passe** : `test_password`
- **Base** : `test_payloadcms`

## 📝 Écriture de Tests

### Structure de Base

```typescript
import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { getPayloadClient } from '@/tests/helpers/payload'
import { truncateAllTables } from '@/tests/helpers/database'

describe('Ma Collection', () => {
  let payload: any

  beforeAll(async () => {
    payload = await getPayloadClient()
  })

  afterEach(async () => {
    // Nettoie les données entre chaque test
    await truncateAllTables()
  })

  it('devrait créer un document', async () => {
    const result = await payload.create({
      collection: 'ma-collection',
      data: {
        /* données de test */
      },
    })

    expect(result.id).toBeDefined()
  })
})
```

### Helpers Disponibles

#### Payload (`tests/helpers/payload.ts`)

- `getPayloadClient()` : Instance Payload en mode local
- `closePayload()` : Ferme la connexion
- `resetPayloadInstance()` : Force une nouvelle connexion

#### Base de Données (`tests/helpers/database.ts`)

- `truncateAllTables()` : Vide toutes les tables (rapide)
- `resetDatabase()` : Reset complet (lent, pour cas extrêmes)
- `beginTransaction()` / `rollbackTransaction()` : Gestion des transactions
- `executeQuery()` : Exécution de requêtes SQL brutes

## 🎯 Stratégies de Nettoyage

### Entre Chaque Test (Recommandé)

```typescript
afterEach(async () => {
  await truncateAllTables() // Rapide (~50ms)
})
```

### Avec Transactions (Plus Rapide)

```typescript
let dbClient: PoolClient

beforeEach(async () => {
  dbClient = await beginTransaction()
})

afterEach(async () => {
  await rollbackTransaction(dbClient)
})
```

### Reset Complet (Cas Extrêmes)

```typescript
beforeAll(async () => {
  await resetDatabase() // Très lent, uniquement si nécessaire
})
```

## 🏃‍♂️ Optimisations de Performance

### PostgreSQL

- Configuration optimisée pour les tests (voir `docker/postgres-test.conf`)
- Extensions pré-installées (`uuid-ossp`, `citext`, `pg_trgm`)
- Pool de connexions adapté aux tests

### Vitest

- Parallélisation activée
- Timeout adapté aux opérations d'intégration (30s)
- Couverture de code avec V8

### Docker

- Healthcheck pour attendre que PostgreSQL soit prêt
- Volumes persistants pour éviter la réinitialisation
- Configuration réseau isolée

## 🚨 Résolution de Problèmes

### La base de données n'est pas prête

```bash
# Vérifier que le conteneur PostgreSQL est démarré
docker ps | grep payload-test-postgres

# Vérifier les logs
docker logs payload-test-postgres

# Redémarrer l'environnement
pnpm test:teardown && pnpm test:setup
```

### Erreurs de connexion

- Vérifier que le port 5433 n'est pas utilisé
- S'assurer que `DATABASE_URI_TEST` est correct
- Attendre que le healthcheck soit vert

### Tests lents

- Utiliser `truncateAllTables()` au lieu de `resetDatabase()`
- Éviter les opérations I/O inutiles dans les tests
- Vérifier la configuration PostgreSQL

### Conflits de données

- S'assurer que `afterEach` nettoie correctement
- Utiliser des données de test uniques (UUID, timestamps)
- Éviter les tests dépendants entre eux

## 🔄 Intégration Continue (CI)

Pour GitHub Actions, voir le workflow dans `.github/workflows/test-integration.yml`.

Le script `pnpm test:ci` est optimisé pour l'environnement CI avec :

- Rapport verbeux
- Couverture de code
- Variables d'environnement adaptées

## 📊 Métriques et Couverture

- **Seuils de couverture** : 70% (branches, fonctions, lignes)
- **Timeout par test** : 30 secondes
- **Rapports** : Texte, JSON, HTML
- **Exclusions** : Types générés, migrations, configuration

## 💡 Bonnes Pratiques

1. **Isolation** : Chaque test doit être indépendant
2. **Nettoyage** : Toujours nettoyer après chaque test
3. **Données** : Utiliser des factories pour créer des données cohérentes
4. **Assertions** : Tester le comportement, pas l'implémentation
5. **Performance** : Préférer les opérations rapides (TRUNCATE vs DELETE)
6. **Nommage** : Noms descriptifs pour les tests et les données

## 🔗 Ressources

- [Documentation Vitest](https://vitest.dev/)
- [Payload CMS Local API](https://payloadcms.com/docs/local-api/overview)
- [PostgreSQL Extensions](https://www.postgresql.org/docs/current/contrib.html)
- [Docker Compose](https://docs.docker.com/compose/)
