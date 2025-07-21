# Guide Complet : Tests d'Intégration pour Payload CMS avec PostgreSQL, Docker et GitHub Actions

Ce guide consolide les meilleures pratiques et techniques de 2025 pour construire un pipeline de tests d'intégration complet, performant et automatisé. Il couvre l'architecture de l'environnement, la gestion du cycle de vie de la base de données, la rédaction de tests efficaces et l'automatisation avec CI/CD.

## Introduction : L'Importance d'un Pipeline de Tests Robuste

Les tests d'intégration sont un pilier essentiel pour garantir la qualité, la stabilité et la maintenabilité des applications modernes. En validant les interactions entre les différents composants—en particulier l'application et sa base de données—dans un environnement contrôlé, on peut détecter les régressions au plus tôt, sécuriser les déploiements et augmenter la confiance des développeurs.

Cette architecture repose sur une pile technologique moderne et performante :

* **Payload CMS (3.x)** : Un CMS headless flexible basé sur Drizzle ORM.
* **PostgreSQL (16+)** : Une base de données relationnelle puissante et extensible.
* **Docker & Docker Compose** : Pour créer des environnements de test isolés et reproductibles.
* **Vitest** : Un framework de test nouvelle génération, offrant des performances 2 à 5 fois supérieures à Jest.
* **GitHub Actions** : Pour une intégration et une automatisation continues (CI/CD).

## Partie 1 : Architecturer l'Environnement de Test avec Docker

La base d'un pipeline fiable est un environnement de test isolé et reproductible. Docker et Docker Compose sont les outils fondamentaux pour y parvenir.

### 1.1. Le Dockerfile Multi-Étapes Optimisé

Un Dockerfile multi-étapes est crucial pour créer des images légères et sécurisées, en séparant les dépendances de construction de celles d'exécution.

**Résoudre le conflit de connexion à la base de données au moment de la construction**
Un problème courant est que la commande `next build` de Payload peut tenter de se connecter à la base de données, ce qui échoue dans l'environnement de construction isolé de Docker. La solution est de configurer Next.js pour générer une sortie `standalone`, qui découple la construction de la nécessité d'une connexion à la base de données.

```dockerfile
# Dockerfile
# Étape 1: Base - Utilise une image Node.js légère
FROM node:18-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Étape 2: Dépendances - Installe les dépendances et met en cache la couche
FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Étape 3: Builder - Construit l'application
FROM base AS test
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# La commande 'build' s'exécute sans BDD grâce à la configuration 'standalone' dans next.config.js
# RUN pnpm run build

# Stage de test final
ENV NODE_ENV=test
ENV DATABASE_URI=postgresql://test_user:test_pass@postgres:5432/test_db
CMD ["pnpm", "test"]
```

*Cette configuration, inspirée des meilleures pratiques, utilise des builds multi-stages pour créer des images jusqu'à 5 fois plus petites.*

### 1.2. Composer l'Écosystème avec `docker-compose.yml`

Le fichier `docker-compose.yml` orchestre les services de l'application et de la base de données. Un point essentiel est que la communication entre conteneurs se fait via le nom du service ; la variable `DATABASE_URI` doit donc utiliser `postgres` (le nom du service) comme hôte, et non `localhost`.

### 1.3. La Synchronisation des Services : Le Rôle Crucial du `healthcheck`

Un simple `depends_on` ne suffit pas. Il faut s'assurer que PostgreSQL est non seulement démarré, mais pleinement initialisé avant que Payload ne tente de s'y connecter. La solution robuste combine `healthcheck` et `depends_on` avec la condition `service_healthy`.

Voici un `docker-compose.test.yml` complet et annoté :

```yaml
# docker-compose.test.yml
version: '3.8'

services:
  # Service applicatif de test (si nécessaire pour des tests e2e)
  # Pour les tests d'intégration purs, le runner de test s'exécutera sur la machine hôte ou en CI
  # et se connectera directement au service postgres-test ci-dessous.

  postgres-test:
    image: postgres:16-alpine
    container_name: payload-test-postgres
    ports:
      - "5433:5432"  # Port externe différent pour éviter les conflits
    environment:
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_password
      POSTGRES_DB: test_payloadcms
    volumes:
      - postgres_test_data:/var/lib/postgresql/data
      - ./docker/postgres-init.sql:/docker-entrypoint-initdb.d/01-init.sql:ro
    # Healthcheck : CRUCIAL pour garantir que la BDD est prête
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U test_user -d test_payloadcms"]
      interval: 5s
      timeout: 5s
      retries: 10
      start_period: 15s # Donne du temps à Postgres pour démarrer
    networks:
      - test-network

volumes:
  postgres_test_data:
    driver: local

networks:
  test-network:
    driver: bridge
```

*Le `healthcheck` vérifie périodiquement la disponibilité de la base de données, éliminant les conditions de concurrence et les échecs de connexion au démarrage.*

### 1.4. Scripts d'Initialisation PostgreSQL

Pour préparer la base de données de test, on peut utiliser des scripts d'initialisation qui s'exécutent au premier démarrage du conteneur.

```sql
-- docker/postgres-init.sql
-- Créer une base de données "template" propre pour une isolation rapide des tests
CREATE DATABASE payload_test_clean TEMPLATE template0;

-- Créer des rôles
CREATE ROLE payload_admin WITH LOGIN PASSWORD 'payload_admin_pass' SUPERUSER;

-- Configurer les extensions nécessaires pour PayloadCMS dans les deux bases
\c payload_test;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";      -- Pour les emails insensibles à la casse
CREATE EXTENSION IF NOT EXISTS "pg_trgm";     -- Pour la recherche full-text

\c payload_test_clean;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

*Ces scripts garantissent que toutes les extensions requises par Payload sont disponibles dès le départ.*

## Partie 2 : Configuration de Payload et du Framework de Test

### 2.1. Vitest : Le Framework de Test Nouvelle Génération

Pour les nouveaux projets TypeScript, **Vitest est le choix recommandé**. Il offre des performances 2 à 5 fois supérieures à Jest grâce à son architecture basée sur les modules ES et son intégration native avec Vite/esbuild. Sa compatibilité API avec Jest permet une migration facile.

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    pool: 'threads',
    fileParallelism: true, // Parallélisation pour des tests plus rapides
    environment: 'node',
    setupFiles: ['./src/tests/setup.ts'], // Fichier exécuté avant chaque test
    globalSetup: ['./src/tests/globalSetup.ts'], // Fichier exécuté une fois au démarrage
    testTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  }
})
```

### 2.2. Configuration de Payload CMS pour les Tests

Le fichier de configuration de Payload doit être adapté à l'environnement de test pour optimiser les performances et isoler la configuration.

```typescript
// payload.config.ts
import { buildConfig } from 'payload/config'
import { postgresAdapter } from '@payloadcms/db-postgres'
import path from 'path'

const isTestEnv = process.env.NODE_ENV === 'test'

export default buildConfig({
  admin: {
    disable: isTestEnv, // Désactiver l'interface admin en mode test
  },
  collections: [
    // ... vos collections
  ],
  db: postgresAdapter({
    pool: {
      connectionString: isTestEnv
        ? process.env.DATABASE_URI_TEST
        : process.env.DATABASE_URI,
      // Pool de connexions optimisé pour les tests
      max: isTestEnv ? 5 : 20,
      min: isTestEnv ? 1 : 2,
    },
    // Désactiver la synchronisation automatique du schéma en test
    push: false,
  }),
  // ... autres configurations
})
```

### 2.3. Helpers d'Initialisation et de Connexion

Pour interagir avec Payload dans les tests, il faut initialiser une instance locale, sans démarrer de serveur HTTP.

```typescript
// tests/helpers/payload.ts
import payload from 'payload'
import path from 'path'
import { Pool } from 'pg'

let payloadInstance: any = null
let dbPool: Pool | null = null

// Initialise Payload en mode local (sans serveur HTTP)
export const getPayloadClient = async () => {
  if (payloadInstance) {
    return payloadInstance
  }
  payloadInstance = await payload.init({
    secret: process.env.PAYLOAD_SECRET!,
    config: path.resolve(__dirname, '../../payload.config.ts'),
    local: true, // Mode crucial pour les tests
    loggerOptions: { level: 'error' } // Réduit le bruit dans les logs de test
  })
  return payloadInstance
}

// Fournit un pool de connexions direct à la BDD pour le nettoyage ou des opérations bas niveau
export const getDbPool = (): Pool => {
  if (!dbPool) {
    dbPool = new Pool({
      connectionString: process.env.DATABASE_URI_TEST,
    })
  }
  return dbPool
}
```

*Le mode `local: true` est essentiel pour utiliser l'API de Payload directement dans le processus de test.*

## Partie 3 : Gérer le Cycle de Vie de la Base de Données

La gestion rigoureuse de l'état de la base de données est la clé de tests fiables et déterministes. Le principe fondamental est **l'isolation des tests** : chaque test doit être atomique et indépendant.

### 3.1. Préparation Initiale : Migrations et Seeding

Avant de lancer les tests, la base de données doit avoir le schéma correct. La commande `pnpm run payload migrate` applique toutes les migrations nécessaires.

Pour des tests réalistes, il est recommandé de peupler la base avec des données de test via un script de "seeding" programmatique, qui utilise l'API locale de Payload (`payload.create`) pour insérer des données cohérentes.

### 3.2. Stratégies de Nettoyage entre les Tests

Le choix de la stratégie de nettoyage est un compromis entre vitesse et rigueur.

| Stratégie | Fonctionnement | Avantages | Inconvénients | Idéal Pour |
| :--- | :--- | :--- | :--- | :--- |
| **Isolation par Schémas / Template Databases** | Chaque test crée son propre schéma ou une nouvelle BDD à partir d'un template. | **Performance extrême (20ms/test)**. Isolation parfaite. | Nécessite une configuration PostgreSQL plus avancée. | Suites de tests volumineuses où la vitesse est critique. **Meilleure pratique 2025**. |
| **Réinitialisation Transactionnelle** | Chaque test est enveloppé dans une transaction (`BEGIN`/`ROLLBACK`). | **Quasi-instantané**. Isolation parfaite. Élégant. | Ne fonctionne pas pour les tests qui doivent valider des `COMMIT`. | Le nettoyage entre **chaque test individuel**. Une excellente pratique générale. |
| **Troncature des Tables (`TRUNCATE`)** | Vide les données des tables (`TRUNCATE ... RESTART IDENTITY CASCADE`). | Plus rapide qu'une réinitialisation complète. Assez simple. | Peut être lent avec beaucoup de tables. Moins rapide que les transactions. | Nettoyer entre des suites de tests, ou si les transactions ne sont pas possibles. |
| **Réinitialisation Complète (`migrate:fresh`)** | Supprime toutes les tables et ré-exécute les migrations. | Propreté absolue. | **Extrêmement lent**. | Uniquement pour l'étape de configuration initiale d'un pipeline CI. |

### 3.3. Optimisations de Performance PostgreSQL (Pour les Tests Uniquement)

Pour accélérer considérablement les tests, on peut utiliser des paramètres PostgreSQL agressifs. **Ces paramètres ne doivent JAMAIS être utilisés en production car ils sacrifient la durabilité des données pour la vitesse.**

```ini
# postgresql.conf pour les tests
fsync = off
synchronous_commit = off
full_page_writes = off
```

*Ces réglages peuvent apporter des gains de performance de 50-60% sur la durée totale des tests.*

## Partie 4 : Rédiger des Tests d'Intégration Efficaces

### 4.1. Structure des Tests

Utilisez les hooks de Vitest (`beforeAll`, `afterAll`, `beforeEach`, `afterEach`) pour gérer le cycle de vie de l'instance Payload et de la base de données.

```typescript
// tests/collections/posts.integration.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import { getPayloadClient } from '../helpers/payload'
import { resetDatabase } from '../helpers/database-cleanup' // Votre helper de nettoyage

describe('Posts Collection', () => {
  let payload: any;

  beforeAll(async () => {
    payload = await getPayloadClient();
  });

  // Nettoyage avant chaque test
  beforeEach(async () => {
    await resetDatabase(); // Ou démarrez une transaction
  });

  afterAll(async () => {
    // Fermez les connexions
  });

  // ... vos tests ici
});
```

### 4.2. Exemples de Tests Concrets

#### Test CRUD de Base

```typescript
it('devrait créer un nouveau post', async () => {
  const post = await payload.create({
    collection: 'posts',
    data: { title: 'Titre de test', slug: 'titre-de-test' },
  });
  expect(post.id).toBeDefined();
  expect(post.title).toBe('Titre de test');
});
```

#### Test des Contrôles d'Accès (ACL)

La fonctionnalité la plus puissante des tests d'intégration est de valider les règles de sécurité. On peut simuler des requêtes authentifiées en passant un objet `req` avec une propriété `user`.

```typescript
it('devrait empêcher un utilisateur non-admin de supprimer un post', async () => {
  // 1. Créer un post et un utilisateur de test
  const post = await payload.create({ collection: 'posts', data: { title: 'Post protégé' } });
  const nonAdminUser = await payload.create({
    collection: 'users',
    data: { email: 'user@test.com', password: 'password', role: 'user' },
  });

  // 2. Simuler la requête de l'utilisateur
  const mockRequest = { user: nonAdminUser };

  // 3. Tenter l'opération et s'attendre à une erreur "Forbidden"
  await expect(payload.delete({
    collection: 'posts',
    id: post.id,
    req: mockRequest, // Passer la requête simulée
  })).rejects.toThrow('Forbidden');
});
```

#### Test des Fonctionnalités Spécifiques à PostgreSQL

Validez que les extensions PostgreSQL sont bien utilisées.

```typescript
it('devrait gérer les emails insensibles à la casse avec citext', async () => {
  await payload.create({
    collection: 'users',
    data: { email: 'Test@Example.com', password: 'password123' }
  });

  // Tenter de créer un utilisateur avec le même email en casse différente
  await expect(
    payload.create({
      collection: 'users',
      data: { email: 'test@example.com', password: 'password123' }
    })
  ).rejects.toThrow(); // Doit échouer à cause de la contrainte d'unicité de citext
});
```

## Partie 5 : Automatisation Complète avec GitHub Actions

### 5.1. Conception du Workflow CI/CD

Le workflow doit se déclencher à chaque `push` et `pull_request` sur les branches principales pour garantir une validation continue.

### 5.2. Utilisation des "Service Containers"

GitHub Actions peut lancer un conteneur PostgreSQL en parallèle du job de test. C'est l'équivalent CI de notre `docker-compose.yml`, et il est **essentiel** d'y inclure un `healthcheck`.

### 5.3. Workflow Complet Annoté

Ce workflow combine les meilleures pratiques : utilisation d'un service container, mise en cache, parallélisation matricielle et gestion des secrets.

```yaml
# .github/workflows/test-integration.yml
name: Integration Tests with PostgreSQL

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  integration-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x] # Tester sur plusieurs versions de Node
        postgres-version: [15, 16] # Tester sur plusieurs versions de Postgres

    services:
      # Démarre un conteneur PostgreSQL pour la durée du job
      postgres:
        image: postgres:${{ matrix.postgres-version }}
        env:
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: ${{ secrets.POSTGRES_PASSWORD_CI }}
          POSTGRES_DB: payload_test
        ports:
          - 5432:5432
        # Healthcheck CRUCIAL pour attendre que la BDD soit prête
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - name: Checkout repository
      uses: actions/checkout@v4

    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'pnpm'

    - name: Install dependencies
      run: pnpm install --frozen-lockfile

    - name: Run integration tests
      env:
        # La BDD est accessible sur localhost car le port est mappé sur le runner
        DATABASE_URI_TEST: postgresql://test_user:${{ secrets.POSTGRES_PASSWORD_CI }}@localhost:5432/payload_test
        PAYLOAD_SECRET: ${{ secrets.PAYLOAD_SECRET_CI }}
        NODE_ENV: test
      # Encapsuler la logique de test dans un script npm simplifie le workflow
      run: pnpm run test:ci

    - name: Upload coverage reports
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: coverage-report-${{ matrix.node-version }}-${{ matrix.postgres-version }}
        path: coverage/
```

*L'utilisation de `matrix` permet de tester robustement contre différentes versions de Node.js et PostgreSQL.*

## Conclusion

L'établissement d'une stratégie de tests d'intégration complète est un investissement fondamental qui porte ses fruits en termes de qualité, de stabilité et de vélocité de développement. En combinant l'isolation de Docker, la puissance de PostgreSQL, la rapidité de Vitest et l'automatisation de GitHub Actions, les équipes peuvent construire un filet de sécurité robuste qui valide chaque changement de code, réduisant drastiquement les régressions et permettant de déployer en toute confiance.