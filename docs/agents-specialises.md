# Agents Spécialisés pour Blog-Payload

Ce document présente les agents spécialisés recommandés pour optimiser les workflows de développement du projet blog-payload.

## Vue d'ensemble

Le projet blog-payload étant un blog technique bilingue construit avec Next.js 15, Payload CMS 3.48 et PostgreSQL, ces agents sont conçus pour couvrir les spécificités de cette stack unique et les contraintes du projet (bilinguisme, architecture unifiée, performance).

---

## 🎯 Agents Essentiels

### 1. 🔄 `payload-collection-expert`

**Description**: Expert Payload CMS pour collections, hooks, et migrations. Utiliser PROACTIVEMENT pour toute modification de collections, relations, ou schémas de données.

**Spécialisations**:

- Configuration des collections Posts, Categories, Tags, Media, Users
- Gestion des hooks (beforeChange, afterChange, beforeRead)
- Relations complexes et localisation French/English
- Migrations de base de données et génération de types TypeScript
- Optimisation des requêtes et des relations

**Outils recommandés**: `Read`, `Edit`, `Bash`, `Grep`, `mcp__serena__*`

---

### 2. 🌐 `i18n-localization-specialist`

**Description**: Spécialiste bilingue French/English avec fallbacks intelligents. Utiliser pour tout contenu multilingue et gestion des locales.

**Spécialisations**:

- Implémentation de `LocalizedText` et `LocalizedName`
- Gestion des fallbacks et extraction de texte (`extractFallbackText`)
- Configuration Next.js i18n et structures bilingues
- Validation de cohérence linguistique
- Patterns de localisation Payload CMS

**Outils recommandés**: `Read`, `Edit`, `Grep`, `mcp__serena__find_symbol`

---

### 3. ⚡ `nextjs-payload-architect`

**Description**: Architecte full-stack Next.js 15 + Payload CMS 3.48. DOIT ÊTRE UTILISÉ pour l'architecture unifiée, routes et performance.

**Spécialisations**:

- Route groups `(payload)/`, `(web)/`, `api/`
- Server Components et local Payload API calls (pas de HTTP)
- Configuration ESM et intégration PostgreSQL
- Optimisation des performances et patterns unifiés
- Architecture monorepo et configuration build

**Outils recommandés**: `Read`, `Edit`, `Bash`, `Glob`, `mcp__serena__*`

---

### 4. 🧪 `testing-strategy-engineer`

**Description**: Expert en stratégie de tests multi-niveaux. Utiliser PROACTIVEMENT après modifications pour Vitest, Playwright et isolation de données.

**Spécialisations**:

- Tests unitaires (`tests/unit/`), intégration (`tests/int/`) et E2E (`tests/e2e/`)
- `createUniqueTestData()` pour isolation sans transactions
- Configuration Vitest multiples et helpers de test
- Validation des workflows complets
- Patterns de test Payload CMS spécifiques

**Outils recommandés**: `Read`, `Edit`, `Bash`, `Write`, `Glob`

---

## 🎨 Agents de Conception et UX

### 5. 🎨 `ui-content-designer`

**Description**: Designer UI/UX spécialisé Shadcn/UI + TailwindCSS 4 pour blog technique. Utiliser pour composants et expérience utilisateur.

**Spécialisations**:

- Composants Shadcn/UI avec Radix primitives
- Configuration TailwindCSS 4 dans CSS files (pas de config séparée)
- Design system cohérent and responsive
- UX optimisée pour contenu technique bilingue
- Intégration Lucide React pour les icônes

**Outils recommandés**: `Read`, `Edit`, `Write`, `mcp__shadcn-ui__*`

---

### 6. 📝 `blog-content-manager`

**Description**: Gestionnaire de contenu technique bilingue avec SEO et reading time. Utiliser pour articles, métadonnées et taxonomies.

**Spécialisations**:

- Gestion des posts avec `calculateReadingTime`
- SEO metadata et structured data
- Taxonomies (Categories/Tags) avec styling et couleurs
- Workflow éditorial et publication
- Rich text et media integration

**Outils recommandés**: `Read`, `Edit`, `mcp__serena__find_symbol`

---

## 🔧 Agents Techniques et Performance

### 7. 🔍 `database-query-optimizer`

**Description**: Expert PostgreSQL et optimisation requêtes Payload. Utiliser pour performance, indexation et requêtes complexes.

**Spécialisations**:

- Optimisation des requêtes Payload local API
- Configuration PostgreSQL et connection pooling
- Analyse des performances et indexation
- Patterns de données efficaces
- Debugging des requêtes lentes

**Outils recommandés**: `Read`, `Bash`, `Edit`, `Grep`

---

### 8. 🚀 `deployment-devops-manager`

**Description**: Expert déploiement Docker + PostgreSQL avec optimisations production. Utiliser pour infrastructure et CI/CD.

**Spécialisations**:

- Configuration Docker/docker-compose
- Optimisations production (`--max-old-space-size=8000`)
- Pipelines CI/CD et monitoring
- Configuration PostgreSQL production
- Gestion des environnements (dev/staging/prod)

**Outils recommandés**: `Read`, `Edit`, `Bash`, `Write`

---

## 🔐 Agents de Sécurité et Debug

### 9. 🔒 `security-audit-specialist`

**Description**: Auditeur sécurité pour authentification, uploads et données sensibles. Utiliser PROACTIVEMENT pour review sécuritaire.

**Spécialisations**:

- Authentification Users collection
- Sécurisation des uploads Media avec validation
- Validation des inputs et conformité OWASP
- Configuration sécurisée Payload/Next.js
- Audit des permissions et roles

**Outils recommandés**: `Read`, `Grep`, `Edit`, `Bash`

---

### 10. 🐛 `payload-debug-detective`

**Description**: Détective spécialisé bugs Payload CMS et intégrations Next.js. Utiliser IMMÉDIATEMENT en cas d'erreur Payload.

**Spécialisations**:

- Debugging collections et hooks Payload
- Résolution problèmes ESM/TypeScript configuration
- Analyse logs Payload et stack traces
- Fix rapides intégration Next.js/Payload
- Résolution conflicts de versions et dépendances

**Outils recommandés**: `Read`, `Bash`, `Edit`, `Grep`, `mcp__serena__*`

---

## 📋 Recommandations d'Usage

### Agents Proactifs (déclenchement automatique)

- `testing-strategy-engineer` après toute modification de code
- `security-audit-specialist` pour review systématique
- `payload-collection-expert` dès qu'on touche aux collections

### Agents Spécialisés (invocation explicite)

- `i18n-localization-specialist` pour contenu multilingue
- `database-query-optimizer` pour problèmes de performance
- `payload-debug-detective` en cas d'erreur Payload

### Agents de Conception (sur demande)

- `ui-content-designer` pour interface et composants
- `blog-content-manager` pour gestion du contenu

### Agents Infrastructure (périodique)

- `deployment-devops-manager` pour déploiements
- `security-audit-specialist` pour audits réguliers

---

## Configuration Technique

### Contraintes Projet

- **Stack**: Next.js 15.3.3 + Payload CMS 3.48.0 + PostgreSQL
- **Bilinguisme**: French/English avec fallbacks
- **Architecture**: Unifiée (monorepo) avec route groups
- **Tests**: Multi-niveaux avec isolation de données
- **Performance**: Server Components + local API calls

### Tools Communs

Tous les agents ont accès aux outils Serena pour l'exploration intelligente du code :

- `mcp__serena__find_symbol` pour recherche de symboles
- `mcp__serena__get_symbols_overview` pour vue d'ensemble
- `mcp__serena__search_for_pattern` pour recherche flexible
- Outils standards : `Read`, `Edit`, `Bash`, `Grep`, `Glob`

---

## Notes d'Implémentation

1. **Prioriser les agents proactifs** pour maintenir la qualité du code
2. **Utiliser l'expertise spécialisée** pour les tâches complexes
3. **Coordonner les agents** pour les workflows multi-étapes
4. **Maintenir la cohérence** avec les patterns existants du projet

Ces agents couvrent l'ensemble des besoins spécifiques du projet blog-payload et s'intègrent parfaitement avec la stack technique unique et les contraintes architecturales.
