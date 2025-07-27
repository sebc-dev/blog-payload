# sebc.dev Fullstack Architecture Document

## Introduction

Ce document décrit l'architecture complète du projet `sebc.dev`, incluant les systèmes backend, l'implémentation frontend et leur intégration. Il sert de source unique de vérité pour le développement, garantissant la cohérence à travers toute la pile technologique. Cette approche unifiée fusionne ce qui serait traditionnellement des documents d'architecture backend et frontend séparés, rationalisant ainsi le processus de développement pour une application fullstack moderne où ces préoccupations sont de plus en plus étroitement liées.

### Starter Template ou Projet Existant

L'analyse des documents de planification, notamment le PRD, indique que le projet sera initialisé en utilisant le template officiel **"blank" de Payload 3** pour une intégration avec NextJS. Ce choix est stratégique car il fournit une base de projet propre avec une intégration "headless" déjà configurée, tout en laissant une liberté totale pour la personnalisation du frontend.

Le projet intégrera également **TailwindCSS 4** et la bibliothèque de composants **Shadcn/UI** dès le départ, comme spécifié dans les exigences initiales du projet.

### Journal des Modifications

| Date       | Version | Description                   | Auteur               |
| :--------- | :------ | :---------------------------- | :------------------- |
| 27/07/2025 | 1.0     | Création initiale du document | Winston (Architecte) |

## Architecture de Haut Niveau

Cette section établit les fondations de l'architecture de `sebc.dev`, en définissant la structure globale, la plateforme, l'organisation du code et les patrons de conception qui guideront le développement.

### Résumé Technique

L'architecture de `sebc.dev` est conçue comme un système **full-stack unifié** basé sur NextJS 15, intégrant le CMS headless Payload 3 directement en son sein. Cette approche "headless intégrée" permet au frontend Next.js de consommer les données du backend Payload via une API locale pour une performance maximale. Le tout sera conteneurisé avec Docker et déployé sur un VPS OVH. Cette pile technologique a été choisie pour atteindre les objectifs de performance (scores Lighthouse \> 90), de qualité et de maîtrise des coûts, tout en offrant une expérience de développement moderne et efficace.

### Plateforme et Choix d'Infrastructure

Le choix de la plateforme est déjà défini dans le brief du projet et est non négociable.

- **Plateforme :** Serveur Privé Virtuel (VPS) chez OVH.
- **Spécifications :** 2 vCores, 8Go RAM, 80Go disque, OS Debian.
- **Services Clés :** Docker pour la conteneurisation, PostgreSQL pour la base de données.
- **Raisonnement :** Ce choix privilégie le contrôle total, la maîtrise du budget (en utilisant des solutions open-source et auto-hébergées) et évite la dépendance à un fournisseur cloud spécifique ("vendor lock-in"). La configuration matérielle est largement suffisante pour un blog technique, même avec une audience croissante.

### Structure du Dépôt (Repository)

Comme requis dans le PRD, la structure du projet sera un **Monorepo**.

- **Raisonnement :** L'intégration native et profonde de Payload 3 au sein d'un projet NextJS 15 rend le monorepo l'approche la plus logique et efficace. Elle simplifie la gestion des dépendances, le partage de types (TypeScript) entre le backend et le frontend, et unifie le processus de build et de déploiement. Des outils comme `npm/pnpm/yarn workspaces` seront utilisés pour gérer les différents paquets au sein du monorepo.

### Diagramme d'Architecture de Haut Niveau

Ce diagramme illustre les principaux composants du système et leurs interactions.

```mermaid
graph TD
    subgraph "Navigateur Web"
        U_V[Visiteur]
        U_A[Auteur/Admin]
    end

    subgraph "VPS OVH (Docker)"
        subgraph "Conteneur Next.js / Payload"
            NXF[("Frontend Next.js (React Server Components)")]
            PBA[("Backend API Payload")]
            ADM[("Admin UI Payload")]
        end
        DB[(PostgreSQL)]
    end

    U_V -- HTTPS --> NXF
    U_A -- HTTPS --> ADM

    NXF -- Appel API local --> PBA
    ADM -- Appel API local --> PBA
    PBA <--> DB

    style U_V fill:#E3F2FD
    style U_A fill:#E8F5E9
    style NXF fill:#B3E5FC
    style ADM fill:#C8E6C9
    style PBA fill:#FFCDD2
    style DB fill:#F5F5F5
```

### Patrons Architecturaux et de Conception

- **CMS Headless Intégré :** Le patron principal est celui d'un CMS "headless" où Payload gère le contenu, mais il est directement intégré dans l'application Next.js qui sert de "tête" (le front-end). Cela garantit des performances optimales en évitant les appels réseau externes pour récupérer le contenu.
- **Architecture Orientée Composants (Frontend) :** Le frontend sera construit en utilisant des composants React (RSC - React Server Components), favorisant la réutilisabilité et la maintenabilité.
- **Repository Pattern (Backend) :** Payload CMS abstrait l'accès aux données via sa propre API, qui suit un modèle de conception similaire au "Repository Pattern", découplant la logique métier de la source de données.

## Tech Stack

Cette section est la source de vérité **définitive** pour toutes les technologies et versions qui seront utilisées dans le projet `sebc.dev`. Tous les développements, qu'ils soient effectués par des agents IA ou par des humains, devront se conformer rigoureusement à ces choix. Les sélections ci-dessous sont basées sur les exigences explicites du PRD et du brief de projet.

### Tableau de la Pile Technologique

| Catégorie                  | Technologie     | Version  | Rôle                                       | Raisonnement                                                                                                          |
| :------------------------- | :-------------- | :------- | :----------------------------------------- | :-------------------------------------------------------------------------------------------------------------------- |
| **Langage (Fullstack)**    | TypeScript      | `~5.x`   | Langage principal pour le front et le back | Cohérence du code, partage des types et sécurité accrue à travers toute l'application.                                |
| **Framework Frontend**     | Next.js         | `~15.x`  | Framework de l'application React           | Choix imposé par le PRD pour ses performances, son SEO et son écosystème.                                             |
| **Framework Backend**      | Payload         | `~3.x`   | CMS Headless intégré                       | Choix imposé par le PRD, pour sa flexibilité et son intégration native avec Next.js.                                  |
| **Bibliothèque UI**        | React           | `~19.x`  | Construction de l'interface utilisateur    | Choix imposé par le PRD ; utilisation des React Server Components.                                                    |
| **Composants UI**          | Shadcn/UI       | `latest` | Bibliothèque de composants de base         | Sélectionnée pour son approche non-opinionée, son accessibilité et sa personnalisation via Tailwind.                  |
| **CSS Framework**          | TailwindCSS     | `~4.x`   | Style des composants                       | Choix imposé par le PRD pour un développement rapide et un design system cohérent.                                    |
| **API**                    | REST & GraphQL  | `N/A`    | Communication Frontend-Backend             | Payload expose nativement les deux types d'API, offrant une flexibilité future.                                       |
| **Base de Données**        | PostgreSQL      | `~16.x`  | Stockage des données persistantes          | Choix imposé par le PRD pour sa robustesse et ses fonctionnalités avancées.                                           |
| **Déploiement**            | Docker          | `latest` | Conteneurisation de l'application          | Choix imposé par le PRD pour un déploiement cohérent et portable sur le VPS.                                          |
| **Tests (Fullstack)**      | **Vitest**      | `latest` | Tests unitaires et d'intégration           | Framework de test moderne, rapide, avec une excellente prise en charge de TypeScript et de l'écosystème Vite/Next.js. |
| **Gestion de Formulaires** | React Hook Form | `latest` | Gestion des formulaires dans React         | Standard de l'industrie pour la performance et la simplicité d'intégration.                                           |
| **Icônes**                 | Lucide Icons    | `latest` | Bibliothèque d'icônes                      | Léger, cohérent et s'intègre parfaitement avec React.                                                                 |

_Note sur les versions : Les numéros de version indiqués (`~x.x`) sont basés sur les exigences du PRD. Pour les autres dépendances, les versions stables les plus récentes au moment du démarrage du projet seront utilisées._
Parfait, continuons.

Nous allons maintenant définir les modèles de données (ou "Collections" dans le jargon de Payload CMS). C'est le schéma conceptuel de toutes les entités de contenu qui seront gérées par le CMS. Ces modèles sont directement dérivés des exigences fonctionnelles du PRD.

## Modèles de Données

### Authors (Collection `users` de Payload)

- **Rôle :** Représente les auteurs des articles du blog. Payload intègre une collection `users` par défaut que nous utiliserons à cette fin.
- **Attributs Clés :**
  - `name`: `string` - Le nom d'affichage de l'auteur.
  - `email`: `string` - L'email de connexion (unique).
  - `password`: `string` - Géré de manière sécurisée par Payload.
- **Interface TypeScript :**
  ```typescript
  interface Author {
    id: string
    name: string
    email: string
  }
  ```
- **Relations :** Un `Auteur` peut avoir plusieurs `Articles`.

### Media (Collection `media`)

- **Rôle :** Stocke tous les médias téléversés, principalement les images pour les articles.
- **Attributs Clés :**
  - `url`: `string` - L'URL publique du fichier.
  - `filename`: `string` - Le nom du fichier.
  - `alt`: `string` (localisé) - Le texte alternatif pour l'accessibilité, traduisible en FR/EN.
- **Interface TypeScript :**
  ```typescript
  interface Media {
    id: string
    url: string
    alt: string // Le texte "alt" sera localisé
  }
  ```
- **Relations :** Un `Média` peut être utilisé comme image de couverture pour plusieurs `Articles`.

### Categories (Collection `categories`)

- **Rôle :** Permet de regrouper les articles par grands thèmes.
- **Attributs Clés :**
  - `name`: `string` - Le nom de la catégorie (ex: "Ingénierie Logicielle").
  - `slug`: `string` - L'identifiant unique pour l'URL (ex: "ingenierie-logicielle").
- **Interface TypeScript :**
  ```typescript
  interface Category {
    id: string
    name: string
    slug: string
  }
  ```
- **Relations :** Relation plusieurs-à-plusieurs (`ManyToMany`) avec les `Articles`.

### Tags (Collection `tags`)

- **Rôle :** Permet d'étiqueter les articles avec des mots-clés spécifiques pour une navigation plus fine.
- **Attributs Clés :**
  - `name`: `string` - Le nom du tag (ex: "React 19").
  - `slug`: `string` - L'identifiant unique pour l'URL (ex: "react-19").
- **Interface TypeScript :**
  ```typescript
  interface Tag {
    id: string
    name: string
    slug: string
  }
  ```
- **Relations :** Relation plusieurs-à-plusieurs (`ManyToMany`) avec les `Articles`.

### Articles (Collection `posts`)

- **Rôle :** Le cœur du blog. Ce modèle est conçu pour être entièrement bilingue comme l'exige le PRD.
- **Attributs Clés :**
  - `title`: `string` (localisé) - Le titre de l'article en FR et EN.
  - `slug`: `string` - L'identifiant unique pour l'URL, partagé entre les langues.
  - `content`: `RichText` (localisé) - Le corps de l'article, avec un éditeur riche, en FR et EN.
  - `excerpt`: `string` (localisé) - Un court résumé de l'article en FR et EN.
  - `heroImage`: `relationship` - Une référence à une entrée de la collection `Media`.
  - `author`: `relationship` - Une référence à un `Auteur` de la collection `users`.
  - `status`: `select` (`draft` | `published`) - Le statut de publication de l'article.
  - `publishedDate`: `date` - La date de publication.
  - `categories`: `relationship` - Des références à des entrées de la collection `Categories`.
  - `tags`: `relationship` - Des références à des entrées de la collection `Tags`.
- **Interface TypeScript :**
  ```typescript
  interface Post {
    id: string
    title: string // Localisé
    slug: string
    content: any[] // Le type exact dépend de l'éditeur RichText
    excerpt: string
    heroImage: Media
    author: Author
    status: 'draft' | 'published'
    publishedDate: string
    categories: Category[]
    tags: Tag[]
  }
  ```
- **Relations :** Appartient à un `Auteur` ; peut avoir plusieurs `Catégories` et `Tags`.

### Pages (Collection `pages`)

- **Rôle :** Gérer le contenu des pages statiques comme "À Propos" et "Contact" de manière bilingue.
- **Attributs Clés :**
  - `title`: `string` (localisé) - Le titre de la page en FR et EN.
  - `slug`: `string` - L'identifiant unique de la page pour l'URL.
  - `content`: `RichText` (localisé) - Le contenu de la page en FR et EN.
- **Interface TypeScript :**
  ```typescript
  interface Page {
    id: string
    title: string
    slug: string
    content: any[]
  }
  ```
- **Relations :** Aucune relation directe avec d'autres modèles.
  Bien. Nous allons maintenant décomposer le système en ses principaux composants logiques. Cette vue d'ensemble nous aidera à comprendre les responsabilités et les interactions au sein de l'application.

## Composants

Basé sur l'architecture unifiée choisie (Next.js + Payload), le système peut être divisé en plusieurs composants logiques distincts, chacun ayant un rôle clair.

### Frontend App (Next.js)

- **Responsabilité :** Afficher l'intégralité du site public. Cela inclut le rendu de la page d'accueil, des pages d'articles, des pages de listage (par catégorie/tag), des pages statiques ("À Propos", "Contact") et de la page de recherche. Ce composant est responsable de l'expérience utilisateur du lecteur.
- **Interfaces Clés :**
  - Expose des pages web aux navigateurs des visiteurs via le protocole HTTPS.
  - Consomme l'API de Payload en interne (côté serveur via les React Server Components) pour récupérer le contenu.
- **Dépendances :** Dépend entièrement du `Backend API (Payload)` pour tout le contenu.
- **Technologies :** Next.js 15, React 19, TailwindCSS 4, Shadcn/UI.

### Backend API (Payload CMS)

- **Responsabilité :** Servir de moteur de contenu pour l'ensemble du projet. Il gère la logique métier, la validation des données, l'authentification des administrateurs et la communication avec la base de données. Il est le cœur fonctionnel du CMS.
- **Interfaces Clés :**
  - Expose une API locale (REST et GraphQL) qui est consommée par le `Frontend App` et l'`Admin UI`.
  - Se connecte à la base de données PostgreSQL pour la persistance des données.
- **Dépendances :** Dépend du `Database (PostgreSQL)`.
- **Technologies :** Payload 3, TypeScript.

### Admin UI (Payload CMS)

- **Responsabilité :** Fournir l'interface d'administration web pour l'auteur. C'est ici que tout le contenu (articles, pages, catégories, tags, médias) sera créé, édité, traduit et publié.
- **Interfaces Clés :**
  - Une application web sécurisée, généralement accessible via une route dédiée (ex: `/admin`).
  - Communique exclusivement avec le `Backend API (Payload)`.
- **Dépendances :** Dépend entièrement du `Backend API (Payload)`.
- **Technologies :** React (intégré nativement dans Payload).

### Search Service (Plugin Payload)

- **Responsabilité :** Gérer l'indexation du contenu des articles et fournir une fonctionnalité de recherche performante, comme requis dans le périmètre du MVP.
- **Interfaces Clés :**
  - Expose un endpoint d'API de recherche (ex: `/api/search`) que le `Frontend App` interrogera.
  - S'intègre au cycle de vie du `Backend API (Payload)` pour indexer le contenu lors des sauvegardes.
- **Dépendances :** Dépend du `Backend API (Payload)` pour accéder au contenu à indexer.
- **Technologies :** Le plugin de recherche officiel `payload-search-plugin`, qui utilisera la base de données PostgreSQL pour l'indexation afin de minimiser les dépendances externes.

### Database (PostgreSQL)

- **Responsabilité :** Assurer la persistance de toutes les données de l'application : articles, pages, utilisateurs (auteurs), taxonomies, et métadonnées des médias.
- **Interfaces Clés :** Accepte les connexions SQL provenant exclusivement du `Backend API (Payload)`.
- **Dépendances :** Aucune, c'est la couche de persistance fondamentale.
- **Technologies :** PostgreSQL 16.x.

### Diagrammes des Composants

Ce diagramme C4-style illustre comment ces composants logiques interagissent au sein du système.

```mermaid
graph TD
    subgraph "Utilisateurs"
        Visitor[Visiteur]
        Admin[Auteur]
    end

    subgraph "Système sebc.dev (Monorepo sur VPS OVH)"
        Frontend[Frontend App]
        AdminUI[Admin UI]
        Search[Search Service]
        API[Backend API]
        Database[(PostgreSQL)]
    end

    Visitor -- "Consulte le blog" --> Frontend
    Admin -- "Gère le contenu" --> AdminUI

    Frontend -- "Récupère les données" --> API
    AdminUI -- "Enregistre les données" --> API
    Frontend -- "Interroge" --> Search

    Search -- "Indexe le contenu" --> API
    API -- "Lit/Écrit" --> Database
```

Bien. Passons à la modélisation des flux de travail principaux de l'application.

## Flux de Travail Principaux (Core Workflows)

Cette section utilise des diagrammes de séquence pour illustrer les interactions entre les composants du système lors des parcours utilisateurs critiques identifiés dans les spécifications. Ces diagrammes clarifient comment les données circulent et comment les responsabilités sont réparties.

### 1\. Lecture d'un article (Parcours Lecteur)

Ce flux décrit comment un visiteur navigue depuis la page d'accueil jusqu'à la lecture d'un article spécifique. Il met en évidence l'utilisation des Server-Side Rendering (SSR) ou Static Site Generation (SSG) de Next.js pour des performances optimales.

```mermaid
sequenceDiagram
    participant V as Visiteur
    participant FE as Frontend App (Next.js)
    participant API as Backend API (Payload)
    participant DB as Database (PostgreSQL)

    V->>FE: 1. Requête GET / (Page d'accueil)
    activate FE
    FE->>API: 2. Récupère la liste des derniers articles
    activate API
    API->>DB: 3. Interroge les articles publiés
    activate DB
    DB-->>API: 4. Retourne la liste
    deactivate DB
    API-->>FE: 5. Retourne les données des articles
    deactivate API
    FE-->>V: 6. Rend la page d'accueil avec la liste
    deactivate FE

    V->>FE: 7. Clique sur un article (Requête GET /articles/mon-slug)
    activate FE
    FE->>API: 8. Récupère le contenu de l'article par slug
    activate API
    API->>DB: 9. Interroge l'article spécifique
    activate DB
    DB-->>API: 10. Retourne le contenu
    deactivate DB
    API-->>FE: 11. Retourne les données de l'article
    deactivate API
    FE-->>V: 12. Rend la page de l'article
    deactivate FE
```

### 2\. Recherche d'un article (Parcours Lecteur)

Ce flux montre comment un visiteur utilise la fonctionnalité de recherche. L'interaction se fait côté client pour une expérience réactive, interrogeant un endpoint d'API dédié qui utilise le service de recherche.

```mermaid
sequenceDiagram
    participant V as Visiteur
    participant FE as Frontend App (Next.js)
    participant Search as Search Service
    participant API as Backend API (Payload)

    V->>FE: 1. Saisit un terme et lance la recherche
    activate FE
    FE->>Search: 2. Appel API client (fetch /api/search?q=...)
    activate Search
    Search->>API: 3. Exécute la requête de recherche sur le contenu indexé
    activate API
    API-->>Search: 4. Retourne les résultats correspondants
    deactivate API
    Search-->>FE: 5. Retourne les résultats
    deactivate Search
    FE-->>V: 6. Met à jour l'UI avec les résultats de recherche
    deactivate FE
```

### 3\. Publication d'un nouvel article (Parcours Auteur)

Ce flux décrit le processus de création et de publication de contenu par l'auteur via l'interface d'administration sécurisée de Payload.

```mermaid
sequenceDiagram
    participant A as Auteur
    participant ADM as Admin UI (Payload)
    participant API as Backend API (Payload)
    participant DB as Database (PostgreSQL)
    participant Search as Search Service

    A->>ADM: 1. Se connecte à /admin
    activate ADM
    ADM->>API: 2. Valide les identifiants
    activate API
    API<->>DB: 3. Vérifie l'utilisateur
    API-->>ADM: 4. Ouvre une session sécurisée
    deactivate API
    ADM-->>A: 5. Affiche le tableau de bord
    deactivate ADM

    A->>ADM: 6. Crée un nouvel article et sauvegarde
    activate ADM
    ADM->>API: 7. Requête POST /api/posts avec le contenu
    activate API
    API->>DB: 8. Valide et insère les données de l'article
    activate DB
    DB-->>API: 9. Confirme l'enregistrement
    deactivate DB
    API-->>Search: 10. Déclenche l'indexation du nouvel article (async)
    API-->>ADM: 11. Confirme la création
    deactivate API
    ADM-->>A: 12. Affiche un message de succès
    deactivate ADM
```

## Spécification de l'API (REST & GraphQL)

Pour ce projet, nous adoptons une approche pragmatique et efficace en matière de spécification d'API.

Étant donné que nous utilisons Payload CMS comme backend, nous n'allons pas créer manuellement un document de spécification OpenAPI statique. À la place, nous allons nous appuyer sur les **API REST et GraphQL générées automatiquement par Payload**.

### Raisonnement Architectural

1.  **Source de Vérité Unique :** Les modèles de données ("Collections") que nous avons définis précédemment deviennent la source de vérité unique. Toute modification d'un champ ou d'un modèle est **instantanément et automatiquement reflétée** dans les deux API (REST et GraphQL).
2.  **Maintenance Zéro :** Cette approche élimine le risque d'avoir une documentation d'API désynchronisée par rapport à l'implémentation réelle. La documentation est générée à partir du code lui-même.
3.  **Flexibilité Maximale :** Comme spécifié dans notre pile technologique, nous disposons à la fois d'une API REST complète et d'une API GraphQL, sans effort de développement supplémentaire. Le frontend pourra utiliser l'une ou l'autre en fonction du cas d'usage (par exemple, GraphQL pour des requêtes de données complexes et REST pour des actions simples).

### Endpoints Principaux (Générés par Payload)

Basé sur nos modèles de données, Payload générera automatiquement des endpoints REST pour chaque collection, incluant les opérations CRUD complètes (Create, Read, Update, Delete), le filtrage, le tri et la pagination. Les principaux endpoints seront :

- `/api/users` (pour les auteurs)
- `/api/media`
- `/api/categories`
- `/api/tags`
- `/api/posts`
- `/api/pages`

### Documentation Interactive

Payload intègre également une interface **Swagger UI** qui fournit une documentation interactive et testable pour l'API REST. Elle sera disponible directement depuis l'application en cours d'exécution (généralement à l'adresse `/api/docs`), permettant d'explorer tous les endpoints, leurs paramètres et les schémas de données en temps réel.
Absolument. Passons à la structure de la base de données.

## Schéma de la Base de Données

Le schéma de la base de données pour PostgreSQL sera directement **généré et géré par Payload CMS** en fonction des configurations des "Collections" que nous avons définies dans la section "Modèles de Données". Il n'est donc pas nécessaire de maintenir manuellement un script SQL de création.

Cependant, à des fins de clarté et pour visualiser la structure finale, voici une représentation en SQL DDL (Data Definition Language) de ce que Payload va générer.

**NOTE :** Ce script est une illustration. La structure exacte, notamment la gestion de la localisation (bilinguisme), sera gérée de manière optimisée par Payload (souvent via des tables de jointure ou des colonnes JSONB).

```sql
-- ATTENTION : Ce schéma est une représentation gérée automatiquement par Payload CMS.
-- Ne pas appliquer manuellement.

-- Collection pour les utilisateurs (Auteurs)
CREATE TABLE "users" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR,
    "email" VARCHAR UNIQUE NOT NULL,
    "hashed_password" VARCHAR,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Collection pour les médias
CREATE TABLE "media" (
    "id" SERIAL PRIMARY KEY,
    -- Payload gère la localisation de manière flexible
    "alt" JSONB, -- Ex: { "fr": "Texte FR", "en": "Texte EN" }
    "url" VARCHAR,
    "filename" VARCHAR,
    "mime_type" VARCHAR,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Collection pour les catégories
CREATE TABLE "categories" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR UNIQUE NOT NULL
);

-- Collection pour les tags
CREATE TABLE "tags" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR UNIQUE NOT NULL
);

-- Collection pour les articles
CREATE TABLE "posts" (
    "id" SERIAL PRIMARY KEY,
    "slug" VARCHAR UNIQUE NOT NULL,
    "status" VARCHAR CHECK(status IN ('draft', 'published')),
    "published_date" TIMESTAMPTZ,
    "author_id" INTEGER REFERENCES "users"("id") ON DELETE SET NULL,
    "hero_image_id" INTEGER REFERENCES "media"("id") ON DELETE SET NULL,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Table générée par Payload pour le contenu localisé des articles
CREATE TABLE "posts_locales" (
    "id" SERIAL PRIMARY KEY,
    "post_id" INTEGER REFERENCES "posts"("id") ON DELETE CASCADE,
    "locale" VARCHAR, -- 'fr' or 'en'
    "title" VARCHAR,
    "content" JSONB, -- Le contenu RichText est stocké en JSON
    "excerpt" TEXT
);

-- Table de jointure pour la relation plusieurs-à-plusieurs Posts <-> Categories
CREATE TABLE "posts_categories" (
    "post_id" INTEGER REFERENCES "posts"("id") ON DELETE CASCADE,
    "category_id" INTEGER REFERENCES "categories"("id") ON DELETE CASCADE,
    PRIMARY KEY ("post_id", "category_id")
);

-- Table de jointure pour la relation plusieurs-à-plusieurs Posts <-> Tags
CREATE TABLE "posts_tags" (
    "post_id" INTEGER REFERENCES "posts"("id") ON DELETE CASCADE,
    "tag_id" INTEGER REFERENCES "tags"("id") ON DELETE CASCADE,
    PRIMARY KEY ("post_id", "tag_id")
);

-- Indexes pour la performance des requêtes
CREATE INDEX "posts_slug_idx" ON "posts" ("slug");
CREATE INDEX "posts_published_date_idx" ON "posts" ("published_date" DESC);
```

D'accord, continuons.

La prochaine étape est de définir la structure concrète des fichiers et des dossiers du projet. Une organisation claire est essentielle pour la maintenabilité et pour que les agents IA puissent intervenir efficacement.

---

## Structure Unifiée du Projet (Monorepo)

Conformément à notre décision d'utiliser un **Monorepo**, et en tenant compte de l'intégration native de Payload 3 avec Next.js 15, nous adopterons une structure de projet unifiée. Plutôt que de séparer le "frontend" et le "backend" dans des dossiers `apps` distincts, nous allons intégrer Payload directement au sein de l'application Next.js, comme le préconise le starter template "blank" que nous avons choisi.

Cette approche favorise une cohésion maximale, un partage de code simplifié et une expérience de développement plus fluide.

Voici l'arborescence de fichiers cible pour `sebc.dev` :

```plaintext
sebc.dev/
├── .docker/                    # Configuration Docker (docker-compose.yml pour PostgreSQL)
├── public/                     # Fichiers statiques pour Next.js (images, polices, favicon)
├── src/                        # Cœur du code source de l'application
│   ├── app/                    # Next.js App Router : toutes les routes du frontend public
│   │   ├── (pages)/            # Groupe de routes pour les pages publiques du blog
│   │   │   ├── articles/[slug]/page.tsx # Page de détail d'un article
│   │   │   ├── categories/[slug]/page.tsx # Page de liste pour une catégorie
│   │   │   ├── tags/[slug]/page.tsx     # Page de liste pour un tag
│   │   │   ├── layout.tsx      # Layout principal du site (incluant Header, Footer)
│   │   │   └── page.tsx        # Page d'accueil
│   │   ├── admin/              # Route réservée pour l'interface d'admin de Payload
│   │   └── api/                # API routes de Next.js (pour des besoins spécifiques, ex: recherche)
│   ├── collections/            # Définition des Collections Payload CMS (le "backend")
│   │   ├── Articles.ts         # Collection 'posts'
│   │   ├── Categories.ts       # Collection 'categories'
│   │   ├── Media.ts            # Collection 'media'
│   │   ├── Pages.ts            # Collection 'pages'
│   │   ├── Tags.ts             # Collection 'tags'
│   │   └── Users.ts            # Collection 'users' (auteurs)
│   ├── components/             # Composants React partagés (générés via Shadcn/UI)
│   │   ├── ui/                 # Composants de base (Button, Card, etc.)
│   │   └── icons.tsx           # Export des icônes Lucide
│   ├── lib/                    # Utilitaires, hooks et logique partagés
│   │   ├── payload-utils.ts    # Fonctions pour interagir avec l'API Payload
│   │   └── i18n/               # Configuration de l'internationalisation
│   ├── payload.config.ts       # Fichier de configuration central de Payload CMS
│   └── server.ts               # Point d'entrée du serveur Express pour Payload
├── .env.example                # Template pour les variables d'environnement
├── .gitignore                  # Fichiers et dossiers à ignorer par Git
├── next.config.mjs             # Configuration de Next.js
├── package.json                # Dépendances et scripts du projet (npm, pnpm ou yarn)
├── postcss.config.js           # Configuration de PostCSS (utilisé par Tailwind)
├── tailwind.config.ts          # Configuration de TailwindCSS
└── tsconfig.json               # Configuration de TypeScript
```

Parfait, nous continuons.

La prochaine étape consiste à définir comment l'application sera construite, livrée et hébergée en production.

## Architecture de Déploiement

Cette section détaille la stratégie de déploiement, le pipeline d'intégration et de déploiement continus (CI/CD) et la gestion des environnements, en s'appuyant sur les choix technologiques de conteneurisation avec Docker sur un VPS OVH.

### Stratégie de Déploiement

La stratégie est basée sur la création d'un artefact unique et portable : une image Docker.

1.  **Build Unifié :** Le processus de build (`next build`) compilera l'application Next.js (frontend) et le backend Payload en une seule sortie optimisée pour la production.
2.  **Image Docker :** Un `Dockerfile` sera créé à la racine du projet pour encapsuler cette application Node.js dans une image Docker légère et sécurisée.
3.  **Orchestration :** Un fichier `docker-compose.yml` orchestrera le lancement de deux services sur le VPS :
    - **Le conteneur de l'application `sebc.dev`**.
    - **Le conteneur de la base de données `PostgreSQL`**.
4.  **Reverse Proxy :** Un reverse proxy (par exemple, Nginx Proxy Manager ou Caddy, également dans un conteneur Docker) sera placé en amont de l'application. Il sera responsable de :
    - La terminaison SSL/TLS (gestion du HTTPS).
    - La mise en cache des ressources statiques.
    - La redirection du trafic vers le conteneur de l'application.

Cette approche garantit un environnement de production isolé, reproductible et facile à gérer.

### Pipeline CI/CD

Nous utiliserons **GitHub Actions** pour automatiser le processus de déploiement. Le pipeline sera déclenché lors d'un push sur la branche `main`.

```mermaid
graph TD
    A[Push sur la branche `main`] --> B{Déclenchement du Workflow GitHub Actions};
    B --> C[1. Installation & Lint];
    C --> D[2. Lancement des Tests (Vitest)];
    D --> E{Tests Réussis ?};
    E -- Non --> F[Échec];
    E -- Oui --> G[3. Build de l'image Docker];
    G --> H[4. Push vers un Container Registry (ex: Docker Hub)];
    H --> I[5. Déploiement sur le VPS];

    subgraph "Étape 5 : Déploiement sur le VPS OVH"
        I1[Connexion SSH sécurisée]
        I2[Pull de la nouvelle image Docker]
        I3[Redémarrage du service via `docker-compose up -d`]
    end

    I --> I1 --> I2 --> I3 --> J[Déploiement Terminé];

    style F fill:#FFCDD2
    style J fill:#C8E6C9
```

### Environnements

Pour le MVP, nous maintiendrons une configuration simple avec deux environnements distincts.

| Environnement     | URL Frontend            | URL Backend             | Objectif                                                             |
| :---------------- | :---------------------- | :---------------------- | :------------------------------------------------------------------- |
| **Développement** | `http://localhost:3000` | `http://localhost:3000` | Développement et tests en local, géré via `docker-compose`.          |
| **Production**    | `https://sebc.dev`      | `https://sebc.dev`      | Environnement live accessible aux visiteurs, hébergé sur le VPS OVH. |

Un environnement de "staging" (ou pré-production) n'est pas inclus dans le périmètre du MVP pour des raisons de simplicité, mais l'architecture basée sur Docker permettrait d'en ajouter un facilement à l'avenir.
Parfait, avançons.

La stratégie de test est une pierre angulaire de la qualité du projet. Définissons comment nous allons nous assurer que `sebc.dev` est robuste et fiable.

## Stratégie de Test

Notre approche des tests visera à garantir la qualité à plusieurs niveaux, de la plus petite unité de code aux parcours utilisateurs complets. Nous utiliserons une combinaison d'outils modernes pour couvrir l'ensemble du spectre.

- **Tests Unitaires & d'Intégration :** Nous utiliserons **Vitest**, comme convenu, pour sa rapidité et son intégration parfaite avec l'écosystème TypeScript/Next.js.
- **Tests End-to-End (E2E) :** Pour simuler et valider les parcours utilisateurs complets dans un vrai navigateur, nous utiliserons **Playwright**. C'est un outil moderne et puissant qui complètera Vitest.

### Pyramide des Tests

Notre stratégie suivra le modèle de la pyramide des tests pour un retour sur investissement optimal : une large base de tests rapides et peu coûteux, et un sommet étroit de tests plus lents et complets.

```text
      / \
     / ▲ \    <-- Tests End-to-End (Peu nombreux, lents, valident les flux critiques) - Playwright
    /_____\
   / ▲ ▲ ▲ \  <-- Tests d'Intégration (Interactions entre composants/services) - Vitest
  /_________\
 / ▲ ▲ ▲ ▲ ▲ \ <-- Tests Unitaires (Nombreux, rapides, isolent chaque fonction/composant) - Vitest
/_____________\
```

### Organisation des Tests

Pour une meilleure maintenabilité, les tests seront **colocalisés** avec le code source qu'ils valident.

- **Tests Unitaires & d'Intégration (Vitest) :** Un fichier de test sera placé à côté du fichier qu'il teste. Par exemple, `src/components/ui/Button.tsx` aura son fichier de test `src/components/ui/Button.test.tsx`.
- **Tests End-to-End (Playwright) :** Les tests E2E seront placés dans un dossier dédié à la racine du projet, par exemple `e2e/`. Chaque fichier de test correspondra à un parcours utilisateur critique (ex: `e2e/publishing.spec.ts`).

### Exemples de Tests Conceptuels

#### Test Unitaire de Composant Frontend (Vitest)

```typescript
// Fichier : src/components/ArticleCard.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ArticleCard from './ArticleCard';

describe('ArticleCard', () => {
  it('devrait afficher le titre et l\'extrait de l\'article', () => {
    const mockArticle = { title: 'Mon Titre', excerpt: 'Mon extrait...' };
    render(<ArticleCard article={mockArticle} />);

    expect(screen.getByRole('heading', { name: /mon titre/i })).toBeInTheDocument();
    expect(screen.getByText(/mon extrait.../i)).toBeInTheDocument();
  });
});
```

#### Test d'un Hook Backend (Vitest)

```typescript
// Fichier : src/collections/Articles.hooks.test.ts
import { describe, it, expect } from 'vitest'
import { generateSlug } from './Articles.hooks'

describe('Article Hooks', () => {
  it("devrait générer un slug correct à partir d'un titre", () => {
    const title = 'Mon Super Article !'
    const slug = generateSlug({ data: { title } })
    expect(slug).toBe('mon-super-article')
  })
})
```

#### Test End-to-End (Playwright)

```typescript
// Fichier : e2e/reading.spec.ts
import { test, expect } from '@playwright/test'

test("le visiteur peut lire un article depuis la page d'accueil", async ({ page }) => {
  await page.goto('/')

  // Cliquer sur le premier lien d'article
  await page.locator('a.article-link').first().click()

  // Vérifier que le titre de l'article est présent dans la nouvelle page
  await expect(page.locator('h1.article-title')).toBeVisible()
  await expect(page).not.toHaveURL('/')
})
```

Bien, nous enchaînons avec les aspects critiques de la sécurité et de la performance.

---

## Sécurité et Performance

Cette section définit les stratégies et les exigences pour garantir que `sebc.dev` soit non seulement rapide et agréable à utiliser, mais aussi sécurisé contre les menaces courantes.

### Exigences de Sécurité

La sécurité sera intégrée à plusieurs niveaux, conformément aux bonnes pratiques standards.

- **HTTPS par Défaut :** Tout le trafic sera servi via HTTPS. Le reverse proxy (Nginx ou Caddy) sera configuré pour gérer la redirection automatique et le renouvellement des certificats SSL/TLS (via Let's Encrypt).
- **Sécurité du CMS :** Nous nous appuierons sur les mécanismes de sécurité robustes intégrés à Payload CMS, qui incluent :
  - Le hachage sécurisé des mots de passe.
  - Une authentification basée sur les cookies HTTP-Only.
  - Une protection intégrée contre les attaques CSRF pour l'interface d'administration.
- **Content Security Policy (CSP) :** Une politique de sécurité de contenu stricte sera mise en place via les en-têtes HTTP pour limiter les sources de scripts, styles et autres ressources, réduisant ainsi drastiquement le risque d'attaques XSS.
- **Dépendances à Jour :** Des outils comme `npm audit` et GitHub Dependabot seront utilisés pour scanner régulièrement les dépendances du projet et nous alerter des vulnérabilités connues.
- **Sécurité Serveur :** Le VPS sera configuré avec des règles de pare-feu strictes (`ufw`), n'exposant que les ports nécessaires (80/443), et sera maintenu à jour régulièrement.

### Optimisation de la Performance

L'objectif est d'atteindre et de maintenir un **score Lighthouse supérieur à 90** pour le site public. Pour y parvenir, nous utiliserons les stratégies suivantes :

- **Rendu Côté Serveur et Statique :** Nous tirerons pleinement parti des capacités de Next.js :
  - **Static Site Generation (SSG) :** Les articles de blog, pages de catégories et pages statiques seront pré-rendus en HTML au moment du build pour un service quasi-instantané.
  - **Incremental Static Regeneration (ISR) :** Le contenu sera automatiquement regénéré périodiquement ou à la demande après une publication pour garantir que le site reste à jour sans sacrifier la performance.
- **Optimisation des Images :** Le composant `next/image` sera utilisé systématiquement. Il se chargera automatiquement de :
  - Redimensionner les images.
  - Les convertir en formats modernes et plus légers (comme WebP).
  - Implémenter le "lazy loading" (chargement différé).
- **Code et Ressources :** Next.js gère nativement le "code splitting" (découpage du code par page), la minification du JavaScript et du CSS.
- **Mise en Cache :** Le reverse proxy sera configuré pour mettre en cache de manière agressive les ressources statiques (CSS, JS, images, polices) afin de minimiser les temps de chargement pour les visiteurs récurrents.
  Bien, passons à la définition du flux de travail pour le développement.

## Flux de Travail de Développement (Development Workflow)

Cette section décrit comment l'environnement de développement local sera configuré et utilisé pour construire `sebc.dev`. L'objectif est d'avoir un processus simple, rapide et cohérent.

### Configuration du Développement Local

Pour travailler sur le projet, voici les étapes et les outils nécessaires.

#### Prérequis

Avant de commencer, les outils suivants doivent être installés sur la machine de développement :

- **Node.js** (Version LTS recommandée, ex: `v20.x`)
- **pnpm** (Gestionnaire de paquets rapide et efficace pour les monorepos)
- **Docker** et **Docker Compose** (Pour gérer la base de données PostgreSQL)

#### Installation Initiale

Voici les commandes pour mettre en place le projet pour la première fois :

```bash
# 1. Cloner le dépôt
git clone <url-du-repo>/sebc.dev.git
cd sebc.dev

# 2. Installer les dépendances
pnpm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# ... puis éditer le fichier .env avec les valeurs nécessaires

# 4. Démarrer la base de données en arrière-plan
docker-compose up -d
```

#### Commandes de Développement

Les scripts suivants seront disponibles dans le `package.json` pour faciliter le développement :

- `pnpm dev`: Lance le serveur de développement Next.js/Payload avec rechargement à chaud (hot-reloading).
- `pnpm build`: Construit l'application pour la production.
- `pnpm start`: Démarre l'application à partir du build de production.
- `pnpm test`: Lance la suite de tests unitaires et d'intégration (Vitest).
- `pnpm test:e2e`: Lance la suite de tests end-to-end (Playwright).
- `pnpm lint`: Analyse le code pour les erreurs de style et de qualité.

### Configuration de l'Environnement

Le fichier `.env` à la racine du projet contiendra toutes les variables d'environnement nécessaires. Il n'est pas versionné dans Git pour des raisons de sécurité.

**Variables d'Environnement Requises (`.env.example`)**

```bash
# URL de connexion à la base de données PostgreSQL gérée par Docker
DATABASE_URI="postgres://user:password@localhost:5432/sebc_dev_db"

# Clé secrète utilisée par Payload pour le chiffrement et l'authentification
PAYLOAD_SECRET="votre-cle-secrete-complexe-a-generer"

# URL publique du serveur, utilisée par le frontend
NEXT_PUBLIC_SERVER_URL="http://localhost:3000"
```

Parfait. Passons maintenant à l'établissement des règles qui garantiront la qualité et la cohérence du code.

## Standards de Codage (Coding Standards)

Cette section définit un ensemble de règles et de conventions de codage **obligatoires**. Elles ont pour but d'assurer la maintenabilité, la lisibilité et la qualité du code sur le long terme. Ces standards seront appliqués rigoureusement, que le code soit écrit par un humain ou par un agent IA, et serviront de base pour la configuration de nos outils d'analyse de code.

### Principes Directeurs

Au-delà des règles spécifiques, le développement sur ce projet doit être guidé par la philosophie suivante :

- **DRY (Don't Repeat Yourself)** : Évitez la duplication de code. Toute logique métier ou composant réutilisable doit être abstrait dans des fonctions, des hooks ou des composants partagés.
- **KISS (Keep It Simple, Stupid)** : Privilégiez toujours la solution la plus simple qui répond au besoin. Évitez la sur-ingénierie et la complexité non nécessaire.
- **Esprit de "Object Calisthenics"** : Bien que l'ensemble des 9 règles de l'Object Calisthenics soit traditionnellement orienté objet, nous en adoptons l'esprit :
  - **Petites entités :** Les fonctions et les composants React doivent être courts et avoir une seule responsabilité. Si un composant dépasse une certaine taille ou gère trop d'états, il doit être décomposé.
  - **Pas d'indentation excessive :** Un niveau d'indentation élevé dans une fonction est souvent le signe d'une complexité cyclomatique trop grande. Le code doit être refactorisé en fonctions plus petites.

### Standards de Base

- **Analyse de Code (Linting) :** Nous utiliserons **ESLint** pour identifier les problèmes potentiels dans le code TypeScript et React.
- **Formatage du Code :** **Prettier** sera utilisé pour formater automatiquement le code de manière cohérente. Un "pre-commit hook" (via Husky) sera configuré pour formater le code avant chaque commit, garantissant que tout le code versionné respecte les mêmes règles.
- **Organisation des Tests :** Comme défini dans la stratégie de test, les fichiers de test seront colocalisés avec leurs fichiers sources correspondants (ex: `Button.test.tsx` à côté de `Button.tsx`).

### Conventions de Nommage

| Élément                       | Convention       | Exemple                  |
| :---------------------------- | :--------------- | :----------------------- |
| **Composants / Fichiers TSX** | `PascalCase.tsx` | `ArticleCard.tsx`        |
| **Fonctions / Variables**     | `camelCase`      | `fetchPublishedArticles` |
| **Types / Interfaces**        | `PascalCase`     | `interface Post`         |
| **Hooks React**               | `useCamelCase`   | `useArticleData`         |

### Règles Critiques

Ces règles sont fondamentales pour la stabilité et la qualité de l'application.

1.  **Typage Stricte (No `any`) :** L'utilisation du type `any` est proscrite. Toutes les données, en particulier les réponses d'API et les props de composants, doivent avoir des types ou des interfaces explicites.
2.  **Variables d'Environnement :** Ne jamais accéder à `process.env` directement dans les composants frontend. Les variables d'environnement exposées au client doivent être préfixées par `NEXT_PUBLIC_` et centralisées dans un module de configuration.
3.  **Accès aux Données :** Toutes les interactions du frontend avec l'API de Payload doivent passer par les fonctions utilitaires dédiées dans `src/lib/payload-utils.ts`. Aucun appel `fetch` brut ne doit se trouver dans les composants.
4.  **Style via TailwindCSS :** Le style doit être implémenté en utilisant exclusivement les classes utilitaires de TailwindCSS. L'utilisation de fichiers CSS externes ou de styles en ligne (`style="..."`) est à éviter pour garantir la cohérence du design system.
5.  **Accessibilité (a11y) :**
    - Toutes les images (`next/image`) doivent obligatoirement posséder une prop `alt` descriptive.
    - Tous les éléments interactifs (boutons, liens) doivent utiliser les balises HTML sémantiques appropriées et avoir un état de focus (`:focus-visible`) clairement visible.

Ok, continuons.

La gestion des erreurs est un aspect essentiel d'une application robuste. Définissons une stratégie claire et unifiée pour `sebc.dev`.

## Stratégie de Gestion des Erreurs (Error Handling)

Cette stratégie vise à intercepter les erreurs de manière prévisible, à fournir des retours clairs aux utilisateurs et à donner aux administrateurs les informations nécessaires pour le débogage.

### Flux de Gestion d'une Erreur

Ce diagramme illustre le parcours d'une erreur, depuis sa source jusqu'à sa présentation à l'utilisateur.

```mermaid
graph TD
    subgraph "Backend (Payload/Node.js)"
        B1[Base de Données]
        B2[Logique Métier]
    end
    subgraph "Frontend (Next.js)"
        F1[Composant React (Client)]
        F2[Route API / Server Action]
        F3[Page (error.tsx)]
    end
    subgraph "Observabilité"
        LOG[Service de Logging]
    end

    B1 -- Erreur DB --> B2
    B2 -- Erreur Inattendue --> LOG
    B2 -- Erreur Attendue --> F2
    F1 -- Appel API --> F2
    F2 -- Réponse d'Erreur JSON --> F1
    F1 -- Affiche Erreur --> User[Utilisateur]
    F2 -- Erreur Serveur --> F3
    F3 -- Affiche Page d'Erreur --> User
```

### Format de Réponse d'Erreur API

Toutes les erreurs générées par nos endpoints d'API (y compris ceux de Payload) suivront un format JSON standardisé pour que le frontend puisse les interpréter de manière fiable.

```typescript
interface ApiErrorResponse {
  errors: {
    message: string // Message destiné à l'utilisateur ou au développeur
    field?: string // Champ du formulaire concerné (pour les erreurs de validation)
  }[]
}
```

### Gestion des Erreurs Backend

- **Centralisation :** Nous utiliserons les "hooks" de Payload, notamment le hook `afterError`, pour intercepter toutes les erreurs qui se produisent au niveau du backend.
- **Logging :** Toute erreur inattendue (erreur 500) sera enregistrée de manière structurée (avec un logger comme `pino`). Le log contiendra la pile d'exécution (stack trace), l'URL de la requête, et un identifiant de corrélation, mais **jamais** d'informations sensibles (mots de passe, clés API).
- **Erreurs Attendues vs Inattendues :**
  - **Attendues :** Les erreurs de validation ou de permissions (4xx) renverront le format `ApiErrorResponse` ci-dessus.
  - **Inattendues :** Les erreurs serveur (5xx) seront loguées et renverront un message générique à l'utilisateur pour ne pas exposer de détails d'implémentation.

### Gestion des Erreurs Frontend

Nous utiliserons les mécanismes intégrés de Next.js App Router pour une expérience utilisateur résiliente.

- **Pages d'Erreur Personnalisées :**
  - Un fichier `src/app/error.tsx` global sera créé pour afficher une page d'erreur conviviale en cas de problème inattendu, offrant un moyen de recharger la page.
  - Un fichier `src/app/not-found.tsx` affichera une page 404 personnalisée et utile.
- **Gestion des Appels API :**
  - Les fonctions dans `src/lib/payload-utils.ts` encapsuleront les appels `fetch`. Elles seront responsables de la gestion des `try/catch`, de l'interprétation des réponses d'erreur JSON et de la transmission d'une erreur structurée ou d'une valeur `null` aux composants.
- **Retour Utilisateur :**
  _ Les erreurs de formulaire seront affichées directement sous les champs concernés.
  _ Les erreurs globales (ex: problème de réseau) seront affichées via une notification non bloquante (un "Toast").
  Ok, il est temps de définir comment nous allons garder un œil sur la santé et le comportement de notre application une fois en production.

## Monitoring et Observabilité

Pour le MVP, nous mettrons en place une stratégie de monitoring simple, efficace et alignée avec les contraintes budgétaires du projet (auto-hébergée et open-source). L'objectif est d'assurer la disponibilité et la performance du site, conformément aux KPIs définis.

### Pile de Monitoring (Monitoring Stack)

- **Monitoring de Disponibilité (Uptime) :** Nous déploierons **Uptime Kuma** dans un conteneur Docker sur le même VPS. Cet outil simple et léger vérifiera à intervalles réguliers que le site `sebc.dev` est en ligne et répond correctement. Il enverra des alertes en cas d'indisponibilité, nous permettant ainsi de suivre l'objectif de **99.9% de disponibilité**.
- **Suivi des Erreurs :** Pour le MVP, le suivi des erreurs se basera sur les **logs structurés** (format JSON) générés par l'application et écrits dans des fichiers sur le serveur. Une rotation des logs sera mise en place pour gérer l'espace disque. L'analyse se fera manuellement en cas de problème. L'intégration d'un outil centralisé comme Sentry est une amélioration possible post-MVP.
- **Monitoring de Performance :** La performance sera suivie via des **audits Lighthouse réguliers** (manuels ou automatisés via des scripts) pour s'assurer que le score reste supérieur à 90 et que les Core Web Vitals sont bons.
- **Analyse d'Audience (Analytics) :** Conformément au brief, l'implémentation d'une solution d'analytics auto-hébergée (comme Plausible ou Umami) est explicitement **hors du périmètre du MVP** et sera considérée dans une phase ultérieure.

### Métriques Clés à Suivre

#### Métriques Backend & Serveur

- **Disponibilité (Uptime) :** Pourcentage de temps où le site est accessible (Cible : > 99.9%).
- **Santé du Serveur :** Utilisation du CPU et de la RAM sur le VPS.
- **Taux d'Erreur :** Nombre d'erreurs 5xx dans les logs de l'application.

#### Métriques Frontend

- **Core Web Vitals (LCP, INP, CLS) :** Mesurés via les audits Lighthouse.
- **Score de Performance Lighthouse :** Score global (Cible : > 90).
