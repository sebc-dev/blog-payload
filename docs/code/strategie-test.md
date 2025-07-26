# Guide de Tests - Next.js 15 + PayloadCMS

## Stack Technologique

- **Next.js 15** + **TypeScript**
- **PayloadCMS 3.48**
- **TailwindCSS** + **Shadcn/UI**
- **Vitest** (tests unitaires/intégration)
- **Playwright** (tests E2E)

---

## Types de Tests Recommandés

### 🧪 Tests Unitaires (Vitest)

- **Components React** isolés
- **Fonctions utilitaires** et helpers
- **Hooks personnalisés**
- **Logique métier** pure
- **Validations** et transformations de données

### 🔗 Tests d'Intégration (Vitest)

- **Interactions** entre components
- **API routes** Next.js
- **Intégrations PayloadCMS** (collections, hooks)
- **Flux complets** de données

### 🎭 Tests End-to-End (Playwright)

- **Parcours utilisateur** critiques
- **Authentification** complète
- **Workflows PayloadCMS** admin
- **Fonctionnalités cross-browser**

---

## Objectifs de Couverture

| Type de Code              | Couverture Cible |
| ------------------------- | ---------------- |
| **Code critique**         | 90-95%           |
| **Components UI**         | 70-80%           |
| **Fonctions utilitaires** | 95%              |
| **API routes**            | 85-90%           |

---

## Bonnes Pratiques

### ✅ À Tester Prioritairement

#### **Logique Métier**

- Validations de données
- Calculs et transformations
- Algorithmes business

#### **API Routes**

- Tous les endpoints
- Cas d'erreur et edge cases
- Authentification/autorisation

#### **Hooks PayloadCMS**

- `beforeChange`, `afterChange`
- `validate`, `access`
- Custom field types

#### **Components Critiques**

- Formulaires et validation
- Navigation et routing
- Authentification UI

#### **Fonctions Utilitaires**

- Formatters et parsers
- Validators
- Helper functions

### ❌ À Ne Pas Sur-Tester

#### **Styling TailwindCSS**

- Tests visuels uniquement si critiques
- Préférer les tests fonctionnels

#### **Components Shadcn/UI**

- Déjà testés upstream
- Tester uniquement les customisations

#### **Configuration Next.js**

- Testée par le framework
- Focus sur la logique applicative

#### **Types TypeScript**

- Validation à la compilation
- Pas besoin de tests runtime

## Tips et Bonnes Pratiques

### 🎯 Stratégie de Test

1. **Test Pyramid** : Plus de tests unitaires, moins de tests E2E
2. **Test des comportements**, pas de l'implémentation
3. **Noms descriptifs** pour les tests
4. **Arrange, Act, Assert** pattern
5. **Mock intelligent** : mocker les dépendances externes

### 🚀 Performance

1. **Parallélisation** des tests unitaires
2. **Tests E2E** en mode headless par défaut
3. **Cache** des node_modules en CI
4. **Tests focalisés** pendant le développement

### 🔒 Sécurité

1. **Ne jamais** commiter de vraies credentials
2. **Variables d'environnement** pour les tests
3. **Données de test** isolées
4. **Cleanup** après chaque test

### 📊 Monitoring

1. **Coverage reports** en HTML
2. **Trends** de coverage dans le temps
3. **Tests flaky** identification
4. **Performance** des tests tracking
