En te basant sur # Rapport des Collections - Blog bilingue Payload CMS

## Configuration multilingue français/anglais

---

## Configuration globale

### Localisation Payload

- **Langues supportées** : Anglais (`en`) et Français (`fr`)
- **Langue par défaut** : Anglais (`en`)
- **Fallback** : Français → Anglais si traduction manquante
- **Interface admin** : Multilingue (anglais/français)

---

## Collection Posts (Articles de blog)

### Objectif

Articles de blog techniques sur la programmation

### Configuration

- **Slug** : `posts`
- **Admin** : `useAsTitle: 'title'`
- **Versioning** : Activé avec brouillons
- **Labels** :
  - Singulier : Post (EN) / Article (FR)
  - Pluriel : Posts (EN) / Articles (FR)

### Champs

| Champ              | Type                      | Localisé | Requis | Description                        |
| ------------------ | ------------------------- | -------- | ------ | ---------------------------------- |
| `title`            | text                      | ✅       | ✅     | Titre de l'article                 |
| `slug`             | text                      | ✅       | ✅     | URL personnalisée par langue       |
| `excerpt`          | textarea                  | ✅       | ✅     | Résumé pour listings et SEO        |
| `content`          | richText                  | ✅       | ✅     | Contenu principal (Lexical Editor) |
| `featuredImage`    | upload → media            | ❌       | ❌     | Image principale                   |
| `category`         | relationship → categories | ❌       | ✅     | Catégorie unique                   |
| `tags`             | relationship → tags       | ❌       | ❌     | Tags multiples (hasMany)           |
| `publishedAt`      | date                      | ❌       | ❌     | Date de publication                |
| `readingTime`      | number                    | ❌       | ❌     | Temps de lecture (auto-calculé)    |
| `meta.title`       | text                      | ✅       | ❌     | Titre SEO personnalisé             |
| `meta.description` | textarea                  | ✅       | ❌     | Description SEO                    |
| `meta.keywords`    | text                      | ✅       | ❌     | Mots-clés SEO                      |

### Hooks et automatisations

- **beforeChange** : Auto-génération slug si vide (kebab-case du titre)
- **beforeChange** : Calcul automatique temps de lecture (200 mots/minute)
- **beforeChange** : Auto-publication avec timestamp si pas de date définie

---

## Collection Categories (Catégories)

### Objectif

Organisation thématique des articles techniques

### Configuration

- **Slug** : `categories`
- **Admin** : `useAsTitle: 'name'`
- **Labels** :
  - Singulier : Category (EN) / Catégorie (FR)
  - Pluriel : Categories (EN) / Catégories (FR)

### Champs

| Champ         | Type     | Localisé | Requis | Description                        |
| ------------- | -------- | -------- | ------ | ---------------------------------- |
| `name`        | text     | ✅       | ✅     | Nom de la catégorie                |
| `slug`        | text     | ✅       | ✅     | URL de la catégorie                |
| `description` | textarea | ✅       | ❌     | Description de la catégorie        |
| `color`       | text     | ❌       | ❌     | Code couleur hexadécimal (#FF6B6B) |

### Hooks et automatisations

- **beforeChange** : Auto-génération slug si vide (kebab-case du nom)

### Exemples de catégories

- **Anglais** : Frontend Development, Backend Development, DevOps, Databases
- **Français** : Développement Frontend, Développement Backend, DevOps, Bases de données

---

## Collection Tags (Étiquettes)

### Objectif

Étiquetage granulaire des articles

### Configuration

- **Slug** : `tags`
- **Admin** : `useAsTitle: 'name'`
- **Labels** :
  - Singulier : Tag (EN) / Tag (FR)
  - Pluriel : Tags (EN) / Tags (FR)

### Champs

| Champ  | Type | Localisé | Requis | Description |
| ------ | ---- | -------- | ------ | ----------- |
| `name` | text | ✅       | ✅     | Nom du tag  |
| `slug` | text | ✅       | ✅     | URL du tag  |

### Hooks et automatisations

- **beforeChange** : Auto-génération slug si vide (kebab-case du nom)

### Exemples de tags

- **Techniques** : React, Vue.js, TypeScript, Python, Docker, Kubernetes, MongoDB
- **Traductions** : React/React, TypeScript/TypeScript, Docker/Docker (identiques)

---

## Collection Pages (Pages statiques)

### Objectif

Pages statiques du site (À propos, Contact)

### Configuration

- **Slug** : `pages`
- **Admin** : `useAsTitle: 'title'`
- **Labels** :
  - Singulier : Page (EN) / Page (FR)
  - Pluriel : Pages (EN) / Pages (FR)

### Champs

| Champ              | Type     | Localisé | Requis | Description            |
| ------------------ | -------- | -------- | ------ | ---------------------- |
| `title`            | text     | ✅       | ✅     | Titre de la page       |
| `slug`             | text     | ✅       | ✅     | URL de la page         |
| `content`          | richText | ✅       | ✅     | Contenu de la page     |
| `meta.title`       | text     | ✅       | ❌     | Titre SEO personnalisé |
| `meta.description` | textarea | ✅       | ❌     | Description SEO        |

### Pages prévues

- **about** / **a-propos** : Page À propos
- **contact** / **contact** : Page Contact

---

## Collection Media (Médias)

### Objectif

Gestion des images avec optimisation multilingue

### Configuration

- **Slug** : `media`
- **Upload** :
  - URL statique : `/media`
  - Dossier : `media`
- **Tailles d'images** :
  - `thumbnail` : 400x300px, WebP, qualité 80%
  - `feature` : 1200x630px, WebP, qualité 90% (optimisé Open Graph)

### Champs

| Champ     | Type     | Localisé | Requis | Description                         |
| --------- | -------- | -------- | ------ | ----------------------------------- |
| `alt`     | text     | ✅       | ✅     | Texte alternatif pour accessibilité |
| `caption` | textarea | ✅       | ❌     | Légende de l'image                  |

---

## Global siteSettings (Paramètres du site)

### Objectif

Paramètres globaux et transversaux du site

### Configuration

- **Slug** : `siteSettings`
- **Labels** :
  - Singulier : Site Settings (EN) / Paramètres du site (FR)

### Champs

| Section        | Champ                         | Type     | Localisé | Requis | Description                        |
| -------------- | ----------------------------- | -------- | -------- | ------ | ---------------------------------- |
| **Site**       | `siteName`                    | text     | ✅       | ✅     | Nom du site                        |
| **Site**       | `siteDescription`             | textarea | ✅       | ❌     | Description générale               |
| **Navigation** | `navigation`                  | array    | -        | ❌     | Menu de navigation                 |
| **Navigation** | `navigation.label`            | text     | ✅       | ✅     | Libellé du lien                    |
| **Navigation** | `navigation.url`              | text     | ✅       | ✅     | URL du lien                        |
| **Footer**     | `footer.copyrightText`        | text     | ✅       | ❌     | Texte de copyright                 |
| **Footer**     | `footer.socialLinks`          | array    | -        | ❌     | Liens réseaux sociaux              |
| **Footer**     | `footer.socialLinks.platform` | text     | ❌       | ✅     | Plateforme (GitHub, Twitter, etc.) |
| **Footer**     | `footer.socialLinks.url`      | text     | ❌       | ✅     | URL du profil                      |

---

## Relations entre collections

### Posts → Categories

- **Type** : Relationship (un-à-un)
- **Champ** : `category` dans Posts
- **Cible** : Collection `categories`
- **Requis** : Oui

### Posts → Tags

- **Type** : Relationship (un-à-plusieurs)
- **Champ** : `tags` dans Posts
- **Cible** : Collection `tags`
- **hasMany** : true
- **Requis** : Non

### Posts → Media

- **Type** : Upload relationship
- **Champ** : `featuredImage` dans Posts
- **Cible** : Collection `media`
- **Requis** : Non

---

## Stratégie des slugs localisés

### Principe

Chaque collection avec des slugs a des URLs différentes par langue pour une meilleure lisibilité et SEO.

### Exemples concrets

**Article de blog** :

- EN : `understanding-react-hooks`
- FR : `comprendre-les-hooks-react`

**Catégorie** :

- EN : `frontend-development`
- FR : `developpement-frontend`

**Page statique** :

- EN : `about`
- FR : `a-propos`

### Gestion des collisions

- Validation d'unicité par langue dans les hooks `beforeChange`
- Ajout automatique de suffixes numériques si doublon (-2, -3, etc.)

---

## Fonctionnalités automatiques

### Calcul du temps de lecture

- **Formule** : Nombre de mots ÷ 200 mots/minute
- **Source** : Contenu richText sérialisé
- **Stockage** : Champ `readingTime` en minutes

### Auto-génération des slugs

- **Source** : Champ `title` ou `name` selon la collection
- **Transformation** : kebab-case (minuscules, tirets)
- **Déclencheur** : Si slug vide lors de la sauvegarde

### Timestamps automatiques

- **Publication** : `publishedAt` auto-rempli si statut "published" et champ vide
- **Modification** : `updatedAt` automatique (natif Payload)

---

## Validation des données

### Slugs uniques

- Contrôle d'unicité par langue et par collection
- Gestion automatique des conflits

### Contenu requis

- Vérification des champs obligatoires par langue
- Messages d'erreur localisés

### Format des données

- Validation format couleur hexadécimal pour categories.color
- Validation URLs pour les liens de navigation et sociaux
