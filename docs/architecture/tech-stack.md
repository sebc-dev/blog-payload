# Tech Stack

Cette section est la source de vérité **définitive** pour toutes les technologies et versions qui seront utilisées dans le projet `sebc.dev`. Tous les développements, qu'ils soient effectués par des agents IA ou par des humains, devront se conformer rigoureusement à ces choix. Les sélections ci-dessous sont basées sur les exigences explicites du PRD et du brief de projet.

## Tableau de la Pile Technologique

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
