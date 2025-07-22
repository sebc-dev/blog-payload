# sebc.dev - Blog Technique Bilingue

Un blog technique bilingue (français/anglais) construit avec Next.js 15, Payload CMS 3, et PostgreSQL. Positionné à l'intersection de l'IA, de l'UX, et des bonnes pratiques d'ingénierie logicielle.

## 🚀 Vision & Objectifs

**sebc.dev** vise à combler un manque de ressources pratiques démontrant la synergie entre trois piliers essentiels :

- **Intelligence Artificielle** : Amplificateur de productivité
- **Expérience Utilisateur (UX)** : Principes fondamentaux de conception
- **Ingénierie Logicielle** : Bonnes pratiques et méthodologies

Le projet sert lui-même de "démonstration vivante" de ces principes, chaque publication étant un cas d'étude concret.

## 🎯 Audiences Cibles

- **Développeurs professionnels** cherchant à intégrer efficacement l'IA dans leurs workflows
- **Ingénieurs logiciels** souhaitant améliorer la qualité de leurs applications
- **Tech leaders** intéressés par l'intersection entre technique et expérience utilisateur

## 🏗️ Stack Technique

### Technologies Principales

- **Frontend** : Next.js 15, React 19 (Server Components)
- **CMS** : Payload 3.48
- **Base de données** : PostgreSQL
- **Styling** : Tailwind CSS 4
- **Composants UI** : Shadcn/UI
- **Typographie** : Inter (texte), JetBrains Mono (code)
- **Iconographie** : Lucide Icons

### Architecture

- **Monorepo unifié** : Payload CMS intégré nativement dans Next.js
- **Déploiement** : Docker sur VPS OVH (Debian, 2vCore, 8Go RAM)
- **Performance** : Server Components pour l'optimisation et API locale de Payload

## 📁 Structure du Projet

```
src/
├── app/
│   ├── (payload)/    # Interface d'administration Payload
│   ├── (web)/        # Site public
│   └── api/          # Routes API globales
├── collections/      # Collections Payload (Users, Media, Categories, Tags)
├── lib/             # Utilitaires et helpers
├── components/      # Composants React réutilisables
└── styles/          # Styles globaux Tailwind
```

## 🚦 Commandes de Développement

### Développement

```bash
pnpm dev        # Démarre le serveur de développement
pnpm devsafe    # Démarre proprement (supprime le cache .next)
pnpm build      # Build de production optimisé
pnpm start      # Lance le serveur de production
```

### Tests & Qualité

```bash
pnpm test       # Lance tous les tests (intégration + e2e)
pnpm test:int   # Tests d'intégration (Vitest)
pnpm test:e2e   # Tests end-to-end (Playwright)
pnpm lint       # Vérification ESLint
```

### Outils Payload

```bash
pnpm generate:types    # Génère les types TypeScript depuis les collections
pnpm generate:importmap # Génère la carte d'imports pour l'admin Payload
pnpm payload           # Accès aux commandes CLI de Payload
```

## 🔧 Installation & Configuration

1. **Prérequis**
   - Node.js 18+
   - PostgreSQL (via Docker ou installation locale)
   - pnpm

2. **Installation**

   ```bash
   git clone <repository>
   cd blog-payload
   pnpm install
   ```

3. **Configuration**

   ```bash
   cp .env.example .env
   # Configurer DATABASE_URI, PAYLOAD_SECRET, etc.
   ```

4. **Base de données**

   ```bash
   docker-compose up -d  # Démarre PostgreSQL
   ```

5. **Démarrage**
   ```bash
   pnpm dev
   ```

## 🎨 Identité Visuelle

### Palette de Couleurs

- **Thème Clair** : `light-blue` avec bleu cyan vibrant (primary)
- **Thème Sombre** : `dark-teal-neutral` avec vert canard (secondary)

### Typographie

- **Titres & Corps** : Inter
- **Code** : JetBrains Mono

## 🌍 Fonctionnalités Bilingues

- **Support natif** français/anglais
- **Gestion centralisée** des contenus bilingues dans Payload
- **SEO optimisé** avec balises `hreflang`
- **URLs propres** sans préfixe `/en/` pour la langue par défaut

## 📊 Objectifs de Performance

- **Lighthouse Score** : > 90 (toutes catégories)
- **Accessibilité** : > 95 (WCAG 2.1 AA)
- **Core Web Vitals** :
  - FCP < 1.8s
  - INP < 200ms
  - CLS ~ 0

## 🧪 Tests & Qualité

### Tests d'Intégration

- Framework : **Vitest** avec jsdom
- Isolation : `createUniqueTestData()` (évite les timeouts Payload)
- Template : `tests/templates/collection-test.template.ts.example`

### Tests E2E

- Framework : **Playwright**
- Couverture : Parcours utilisateur complets

## 🚀 MVP - Fonctionnalités Essentielles

### Version 1.0 (Septembre 2025)

- ✅ Blog bilingue fonctionnel
- ✅ Système de taxonomie (catégories, tags)
- ✅ Page de recherche intégrée
- ✅ Interface d'administration complète
- ✅ Affichage public optimisé
- ✅ Architecture technique opérationnelle

### Hors Périmètre MVP

- Système de commentaires
- Inscription des utilisateurs
- Newsletter intégrée
- Analytics/suivi d'audience

## 🔮 Roadmap Post-MVP

### Phase 2 : Communauté

- Système de commentaires
- Inscription utilisateurs
- Newsletter intégrée
- Wiki "Dev Resources"

### Vision Long Terme

- Consolidation comme ressource de référence
- Analytics auto-hébergés
- Extension YouTube potentielle

## 📈 Métriques de Succès

- **Qualité technique** : Scores Lighthouse > 90
- **Fiabilité** : Uptime > 99.9%
- **Productivité** : Rythme de publication soutenu
- **Engagement** : Croissance audience et temps de lecture

## 🤝 Contribution

Ce projet est maintenu par un auteur unique pour garantir la cohérence et la qualité éditoriale. Les suggestions et retours sont les bienvenus via les issues.

## 📄 Licence

[À définir selon les préférences du projet]

---

**sebc.dev** - Où l'IA rencontre l'UX et l'ingénierie logicielle moderne.
