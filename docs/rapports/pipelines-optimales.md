# Pipelines DevOps optimaux pour Next.js 15 + Payload CMS 3.48 + PostgreSQL

Les pipelines CI/CD modernes exigent une orchestration sophistiquée entre tests, sécurité et déploiement pour maintenir des cycles de développement rapides sans compromettre la qualité. Cette architecture DevOps intègre GitHub Actions comme plateforme centrale, avec une emphase sur la sécurité maximale et l'optimisation des performances pour votre stack Next.js 15 + Payload CMS 3.48.

## Workflow de développement avec analyse continue

L'approche recommandée combine l'analyse temps réel via le plugin SonarQube dans l'IDE avec des vérifications automatisées dans le pipeline CI/CD. Cette stratégie offre :

- **Feedback immédiat** pendant le développement via SonarQube IDE
- **Validation pre-commit** ultra-rapide (< 30 secondes)
- **Sécurité multicouche** dans le pipeline CI/CD
- **Revue de code IA** avec CodeRabbit sur les Pull Requests

## Configuration des pre-commit hooks avec optimisation < 30 secondes

La contrainte de 30 secondes pour les pre-commit hooks nécessite une architecture minutieusement optimisée. L'approche recommandée combine **lint-staged** avec **husky v9** pour exécuter uniquement les vérifications sur les fichiers modifiés, réduisant drastiquement le temps d'exécution.

### Workflow de développement local optimisé

L'utilisation du plugin SonarQube dans l'IDE complète idéalement les hooks pre-commit pour un workflow de développement efficace :

**1. Analyse temps réel (IDE)** :

- SonarQube détecte les code smells, bugs et vulnérabilités pendant l'écriture
- Configuration `.vscode/settings.json` pour VS Code :

```json
{
  "sonarlint.connectedMode.project": {
    "projectKey": "nextjs-payload-app"
  },
  "sonarlint.rules": {
    "typescript:S1854": "on",
    "typescript:S3776": "warning",
    "Web:BoldAndItalicTagsCheck": "off"
  }
}
```

**2. Pre-commit (< 30s)** :

- Formatage et linting rapide sur fichiers modifiés uniquement
- Détection de secrets pour éviter les fuites

**3. CI/CD (GitHub Actions)** :

- Tests complets et analyses de sécurité approfondies
- Validation finale avant merge

Cette approche en trois couches garantit un équilibre optimal entre productivité et qualité du code.

```json
{
  "lint-staged": {
    "**/*.{ts,tsx}": ["eslint --fix --max-warnings=0 --cache", "prettier --write --cache"],
    "**/*.{js,json,css,md,yml}": ["prettier --write --cache"]
  }
}
```

Pour respecter la limite de 30 secondes, implémentez ces stratégies d'optimisation :

**Parallélisation des tâches** : Utilisez `--parallel` dans lint-staged pour exécuter les linters simultanément sur différents types de fichiers. Cette approche peut réduire le temps d'exécution de 40-60%.

**Cache ESLint persistant** : Configurez `.eslintcache` avec une stratégie de cache intelligente qui persiste entre les commits. Le cache ESLint peut accélérer les vérifications de 70% sur les fichiers non modifiés.

**TypeScript incremental** : Pour la vérification des types, utilisez `tsc-files` au lieu de `tsc` complet. Cette bibliothèque vérifie uniquement les fichiers staged et leurs dépendances directes, évitant une compilation complète du projet.

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Exécution optimisée avec timeout
timeout 30s npx lint-staged --concurrent 4 || {
  echo "⚠️  Pre-commit hooks exceeded 30s timeout"
  exit 1
}
```

### Comparaison husky vs lint-staged vs lefthook

**Husky** reste le standard de facto pour sa simplicité d'intégration et sa compatibilité universelle. Version 9 apporte des améliorations de performance significatives avec un système de cache interne.

**Lefthook** offre des performances supérieures (15-20% plus rapide) grâce à son architecture en Go, mais nécessite une configuration plus complexe pour les projets TypeScript.

**Lint-staged** n'est pas un gestionnaire de hooks mais un orchestrateur de tâches. Il est indispensable quel que soit votre choix de gestionnaire de hooks pour optimiser l'exécution.

## Pipeline GitHub Actions multi-étapes avec parallélisation

L'architecture du pipeline exploite la stratégie matrix de GitHub Actions pour maximiser la parallélisation tout en maintenant une structure logique claire.

### Structure optimale du workflow

```yaml
name: Next.js Payload CMS CI/CD Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    types: [opened, synchronize, reopened]

env:
  PNPM_VERSION: 9.x
  NODE_VERSION: 20.x
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ vars.TURBO_TEAM }}

jobs:
  # Job 1: Analyse statique rapide
  static-analysis:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Cache pnpm store
        uses: actions/cache@v4
        with:
          path: ~/.pnpm-store
          key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Parallel linting
        run: |
          pnpm exec turbo run lint type-check \
            --cache-dir=.turbo \
            --concurrency=100%

  # Job 2: Tests parallélisés
  test:
    runs-on: ubuntu-latest
    needs: static-analysis
    strategy:
      matrix:
        test-suite: [unit, integration]
        shard: [1, 2, 3, 4]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4

      - name: Run ${{ matrix.test-suite }} tests (shard ${{ matrix.shard }}/4)
        run: |
          pnpm test:${{ matrix.test-suite }} \
            --shard=${{ matrix.shard }}/4 \
            --coverage

  # Job 3: Tests E2E avec Playwright
  e2e:
    runs-on: ubuntu-latest
    needs: static-analysis
    strategy:
      matrix:
        shardIndex: [1, 2, 3, 4, 5]
        shardTotal: [5]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4

      - name: Install Playwright
        run: pnpm exec playwright install --with-deps

      - name: Run E2E tests
        run: |
          pnpm exec playwright test \
            --shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }} \
            --reporter=blob

      - name: Upload test results
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-${{ matrix.shardIndex }}
          path: playwright-report/
          retention-days: 30

  # Job 4: Sécurité
  security-scan:
    runs-on: ubuntu-latest
    needs: static-analysis
    permissions:
      contents: read
      security-events: write
    steps:
      - uses: actions/checkout@v4

      - name: Run security scans in parallel
        run: |
          # Scans exécutés en parallèle
          snyk test --all-projects &
          semgrep --config=auto --sarif > semgrep.sarif &
          trivy fs --format sarif -o trivy.sarif . &
          wait

      - name: Upload SARIF results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: '*.sarif'
```

### Optimisations de parallélisation

**Matrix strategy avancée** : Utilisez des matrices dynamiques basées sur le nombre de tests détectés pour optimiser la distribution des shards.

**Artifacts sharing** : Implémentez un système de partage d'artifacts entre jobs pour éviter les rebuilds redondants.

**Conditional jobs** : Utilisez `if: github.event_name == 'push'` pour exécuter certains jobs uniquement sur les branches principales.

## Intégration complète des outils de sécurité

L'architecture de sécurité adopte une approche defense-in-depth avec plusieurs couches de protection complémentaires.

### Configuration Snyk pour SCA et containers

```yaml
- name: Snyk Security Scan
  uses: snyk/actions/node@master
  continue-on-error: true
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
  with:
    args: |
      --all-projects
      --detection-depth=6
      --severity-threshold=high
      --sarif-file-output=snyk.sarif
```

Snyk offre une intégration native avec pnpm workspaces, essentielle pour les monorepos. La configuration `--detection-depth=6` garantit la détection des vulnérabilités dans les dépendances transitives profondes.

### Semgrep pour SAST avec règles TypeScript/Next.js

```yaml
- name: Semgrep SAST
  uses: returntocorp/semgrep-action@v1
  with:
    config: |
      - p/typescript
      - p/react
      - p/nextjs
      - p/security-audit
      - p/secrets
```

Créez des règles custom pour détecter les patterns spécifiques à Next.js 15 :

```yaml
rules:
  - id: nextjs-unsafe-dynamic-route
    patterns:
      - pattern: export async function $METHOD(request, { params })
      - pattern-not-inside: |
          if (!params.$VAR) { return ... }
    message: 'Validate dynamic route parameters'
    severity: WARNING
```

### Configuration Trivy pour container scanning

```yaml
- name: Build and scan Docker image
  run: |
    docker build -t ${{ env.IMAGE_NAME }}:${{ github.sha }} .

    trivy image \
      --severity HIGH,CRITICAL \
      --ignore-unfixed \
      --format sarif \
      --output trivy-container.sarif \
      ${{ env.IMAGE_NAME }}:${{ github.sha }}
```

### Gitleaks pour secrets detection

```yaml
- name: Gitleaks secret scan
  uses: gitleaks/gitleaks-action@v2
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  with:
    config-path: .gitleaks.toml
```

Configuration `.gitleaks.toml` optimisée pour Next.js :

```toml
[allowlist]
paths = [
  ".next/",
  "node_modules/",
  "pnpm-lock.yaml"
]

[[rules]]
id = "nextauth-secret"
description = "NextAuth secret key"
regex = '''NEXTAUTH_SECRET=["']?([^"'\s]+)["']?'''
tags = ["key", "nextauth"]
```

## Intégration locale avec SonarQube IDE et CodeRabbit

L'utilisation de SonarQube comme plugin IDE offre un feedback immédiat pendant le développement, complétant parfaitement les vérifications du pipeline CI/CD.

### Configuration locale SonarQube pour Next.js

Pour optimiser l'analyse locale avec le plugin SonarQube dans votre IDE, créez un fichier `sonar-project.properties` à la racine du projet :

```properties
# Configuration locale pour le plugin IDE
sonar.projectKey=nextjs-payload-app
sonar.projectName=Next.js Payload CMS Application

# Sources
sonar.sources=src/,app/
sonar.exclusions=**/*.test.ts,**/*.spec.ts,**/node_modules/**,.next/**,out/**

# Tests
sonar.tests=tests/,src/**/*.test.ts,app/**/*.test.tsx
sonar.test.inclusions=**/*.test.ts,**/*.test.tsx,**/*.spec.ts

# Next.js specific
sonar.javascript.file.suffixes=.js,.jsx,.ts,.tsx
sonar.typescript.tsconfigPath=tsconfig.json
```

### Intégration CodeRabbit sans SonarCloud

CodeRabbit s'intègre directement avec GitHub pour analyser les Pull Requests sans nécessiter SonarCloud :

```yaml
- name: CodeRabbit AI Review
  uses: coderabbit/ai-pr-review@v1
  with:
    openai_api_key: ${{ secrets.OPENAI_API_KEY }}
    review_level: 'thorough'
    include_paths: 'src/,app/'
    exclude_paths: '.next/,node_modules/'
```

Cette configuration permet à CodeRabbit d'analyser directement le code source et de fournir des suggestions contextuelles basées sur l'IA, complémentant l'analyse locale SonarQube.

## Optimisation des caches multicouches

L'optimisation des caches est cruciale pour maintenir des temps de build rapides dans un environnement CI/CD.

### Cache pnpm avec déduplication

```yaml
- name: Setup pnpm cache
  uses: actions/cache@v4
  with:
    path: |
      ~/.pnpm-store
      .pnpm
    key: pnpm-${{ runner.os }}-${{ hashFiles('pnpm-lock.yaml') }}
    restore-keys: |
      pnpm-${{ runner.os }}-
```

Configuration pnpm optimale dans `.npmrc` :

```
store-dir=~/.pnpm-store
package-import-method=clone-or-copy
symlink=true
prefer-workspace-packages=true
```

### Cache Next.js avec invalidation intelligente

```yaml
- name: Next.js cache
  uses: actions/cache@v4
  with:
    path: |
      ${{ github.workspace }}/.next/cache
      ${{ github.workspace }}/.next/static
    key: nextjs-${{ runner.os }}-${{ hashFiles('**/package-lock.json', '**/yarn.lock', '**/pnpm-lock.yaml') }}-${{ hashFiles('**.[jt]s', '**.[jt]sx') }}
    restore-keys: |
      nextjs-${{ runner.os }}-${{ hashFiles('**/package-lock.json', '**/yarn.lock', '**/pnpm-lock.yaml') }}-
```

### Docker layer caching avec BuildKit

```yaml
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v3
  with:
    driver-opts: |
      image=moby/buildkit:v0.13.0
      network=host

- name: Build with cache
  uses: docker/build-push-action@v5
  with:
    context: .
    cache-from: type=gha
    cache-to: type=gha,mode=max
    build-args: |
      BUILDKIT_INLINE_CACHE=1
```

## Stratégies de test multiniveaux

L'architecture de test adopte une approche pyramidale avec une forte base de tests unitaires, complétée par des tests d'intégration et E2E stratégiques.

### Configuration Vitest pour tests unitaires et d'intégration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      exclude: ['node_modules', '.next', 'test', '**/*.d.ts', '**/*.config.*', '**/mockData'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        isolate: true,
      },
    },
  },
})
```

### Playwright pour tests E2E avec sharding

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['html'],
    ['blob', { outputFile: 'playwright-report/report.zip' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
    },
  ],
})
```

### Tests de performance avec Lighthouse CI

```yaml
- name: Lighthouse CI
  uses: treosh/lighthouse-ci-action@v11
  with:
    urls: |
      http://localhost:3000
      http://localhost:3000/api/health
    uploadArtifacts: true
    temporaryPublicStorage: true
    configPath: ./lighthouserc.js
```

## Implémentation des métriques DORA et monitoring

Les métriques DORA fournissent des insights cruciaux sur la performance de votre pipeline DevOps.

### Calcul automatisé des métriques

```yaml
- name: Calculate DORA metrics
  uses: DeveloperMetrics/deployment-frequency@main
  with:
    workflows: 'CI/CD Pipeline'
    pat-token: ${{ secrets.GITHUB_TOKEN }}

- name: Track deployment
  run: |
    curl -X POST ${{ secrets.DORA_WEBHOOK_URL }} \
      -H "Content-Type: application/json" \
      -d '{
        "deployment_id": "${{ github.sha }}",
        "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
        "environment": "production",
        "status": "success",
        "lead_time_seconds": ${{ steps.calculate-lead-time.outputs.seconds }}
      }'
```

### Dashboard de monitoring avec Grafana

Configuration des métriques Prometheus pour le monitoring :

```yaml
# prometheus-rules.yml
groups:
  - name: deployment_metrics
    interval: 30s
    rules:
      - record: deployment_frequency_daily
        expr: rate(deployments_total[24h])

      - record: lead_time_for_changes
        expr: histogram_quantile(0.95, deployment_lead_time_seconds)

      - record: mttr_minutes
        expr: rate(incident_recovery_time_seconds[7d]) / 60

      - record: change_failure_rate
        expr: rate(failed_deployments_total[7d]) / rate(deployments_total[7d])
```

### Alerting basé sur les seuils DORA

```yaml
- alert: HighChangeFailureRate
  expr: change_failure_rate > 0.15
  for: 1h
  labels:
    severity: warning
  annotations:
    summary: 'Change failure rate exceeds 15%'
    description: 'Current rate: {{ $value | humanizePercentage }}'

- alert: SlowDeploymentFrequency
  expr: deployment_frequency_daily < 0.5
  for: 2d
  labels:
    severity: info
  annotations:
    summary: 'Deployment frequency below target'
```

## Gestion sécurisée des secrets et variables

La sécurité des secrets nécessite une approche multicouche avec rotation automatique et audit complet.

### Architecture de gestion des secrets

```yaml
- name: Setup secrets with Vault
  uses: hashicorp/vault-action@v2
  with:
    url: ${{ secrets.VAULT_URL }}
    method: token
    token: ${{ secrets.VAULT_TOKEN }}
    secrets: |
      secret/data/nextjs/prod database_url | DATABASE_URL ;
      secret/data/nextjs/prod nextauth_secret | NEXTAUTH_SECRET ;
      secret/data/payload/prod secret | PAYLOAD_SECRET
```

### Rotation automatique avec GitHub Actions

```yaml
name: Rotate Secrets
on:
  schedule:
    - cron: '0 0 1 * *' # Monthly
  workflow_dispatch:

jobs:
  rotate:
    runs-on: ubuntu-latest
    steps:
      - name: Generate new secrets
        run: |
          NEW_SECRET=$(openssl rand -base64 32)
          echo "::add-mask::$NEW_SECRET"
          echo "new_secret=$NEW_SECRET" >> $GITHUB_OUTPUT

      - name: Update Vault
        run: |
          vault kv put secret/nextjs/prod \
            nextauth_secret="${{ steps.generate.outputs.new_secret }}" \
            rotated_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

      - name: Trigger deployment
        uses: actions/github-script@v7
        with:
          script: |
            await github.rest.actions.createWorkflowDispatch({
              owner: context.repo.owner,
              repo: context.repo.repo,
              workflow_id: 'deploy.yml',
              ref: 'main'
            })
```

### Variables d'environnement par stage

```typescript
// env.config.ts
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']),
  DATABASE_URL: z.string().url(),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  PAYLOAD_SECRET: z.string().min(32),
  PAYLOAD_EMAIL_FROM: z.string().email(),
  S3_BUCKET: z.string(),
  REDIS_URL: z.string().url().optional(),
})

export const env = envSchema.parse(process.env)
```

## Build et scan Docker optimisés

L'optimisation Docker est cruciale pour réduire les temps de déploiement et améliorer la sécurité.

### Dockerfile multi-stage optimisé

```dockerfile
# syntax=docker/dockerfile:1.4
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@latest --activate

# Dependencies stage
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile --prefer-offline

# Builder stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN --mount=type=cache,target=/root/.pnpm-store \
    --mount=type=cache,target=/app/.next/cache \
    pnpm run build

# Production stage
FROM gcr.io/distroless/nodejs20-debian12 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nonroot
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["server.js"]
```

### Scan de sécurité multi-outils

```yaml
- name: Container security scan
  run: |
    # Scan avec Trivy
    trivy image --severity HIGH,CRITICAL \
      --ignore-unfixed \
      --exit-code 1 \
      $IMAGE_NAME:${{ github.sha }}

    # Scan avec Snyk
    snyk container test $IMAGE_NAME:${{ github.sha }} \
      --severity-threshold=high \
      --file=Dockerfile

    # Scan de conformité avec Docker Bench
    docker run --rm --net host --pid host \
      --cap-add audit_control \
      -v /var/lib:/var/lib:ro \
      -v /var/run/docker.sock:/var/run/docker.sock:ro \
      docker/docker-bench-security
```

### Optimisation de la taille d'image

Techniques avancées pour réduire la taille finale :

1. **Distroless images** : Utilisation de `gcr.io/distroless/nodejs20` réduit l'image de ~50%
2. **Multi-stage avec cache mounts** : Réutilisation des caches entre builds
3. **Standalone build Next.js** : Configuration `output: 'standalone'` réduit drastiquement les dépendances
4. **Layer optimization** : Ordonnancement optimal des COPY pour maximiser la réutilisation

## Exemples de configurations complètes

### Configuration complète GitHub Actions

```yaml
name: Production CI/CD Pipeline
on:
  push:
    branches: [main]
  pull_request:
    types: [opened, synchronize, reopened]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # Analyse de code et tests
  quality-gates:
    runs-on: ubuntu-latest
    outputs:
      should-deploy: ${{ steps.decision.outputs.deploy }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Quality checks
        id: checks
        run: |
          # Linting, tests, sécurité
          pnpm install --frozen-lockfile
          pnpm exec turbo run lint test build --cache-dir=.turbo

      - name: Coverage report
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella

      - name: Quality gate decision
        id: decision
        run: |
          # Vérification basée sur les métriques de test et coverage
          COVERAGE=$(cat coverage/coverage-summary.json | jq -r '.total.lines.pct')
          TESTS_PASSED=$(cat test-results/junit.xml | grep -c 'failures="0"' || true)

          if (( $(echo "$COVERAGE >= 80" | bc -l) )) && [[ "$TESTS_PASSED" -gt 0 ]]; then
            echo "deploy=true" >> $GITHUB_OUTPUT
            echo "✅ Quality gates passed: Coverage $COVERAGE%, All tests passed"
          else
            echo "deploy=false" >> $GITHUB_OUTPUT
            echo "❌ Quality gates failed: Coverage $COVERAGE% (minimum 80%)"
          fi

  # Build et déploiement
  deploy:
    needs: quality-gates
    if: needs.quality-gates.outputs.should-deploy == 'true'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
      id-token: write
    steps:
      - uses: actions/checkout@v4

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
          provenance: true
          sbom: true

      - name: Deploy to production
        run: |
          # Déploiement avec vérification de santé
          kubectl set image deployment/nextjs-app \
            app=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}

          kubectl rollout status deployment/nextjs-app --timeout=300s

      - name: Update DORA metrics
        run: |
          # Enregistrement des métriques de déploiement
          ./scripts/record-deployment.sh \
            --sha="${{ github.sha }}" \
            --environment="production" \
            --status="success"
```

### Configuration monorepo avec Turborepo

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"],
      "env": ["NODE_ENV", "NEXT_PUBLIC_*"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"],
      "cache": false
    },
    "lint": {
      "outputs": [],
      "cache": true
    },
    "type-check": {
      "outputs": [],
      "cache": true
    },
    "test:e2e": {
      "dependsOn": ["build"],
      "cache": false
    }
  }
}
```

Cette architecture DevOps complète garantit des déploiements rapides, sécurisés et fiables pour votre application Next.js 15 + Payload CMS. L'accent mis sur la parallélisation, la sécurité en profondeur et l'observabilité via les métriques DORA assure une amélioration continue de vos processus de livraison logicielle.
