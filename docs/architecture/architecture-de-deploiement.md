# Architecture de Déploiement

Cette section détaille la stratégie de déploiement, le pipeline d'intégration et de déploiement continus (CI/CD) et la gestion des environnements, en s'appuyant sur les choix technologiques de conteneurisation avec Docker sur un VPS OVH.

## Stratégie de Déploiement

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

## Pipeline CI/CD

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

## Environnements

Pour le MVP, nous maintiendrons une configuration simple avec deux environnements distincts.

| Environnement     | URL Frontend            | URL Backend             | Objectif                                                             |
| :---------------- | :---------------------- | :---------------------- | :------------------------------------------------------------------- |
| **Développement** | `http://localhost:3000` | `http://localhost:3000` | Développement et tests en local, géré via `docker-compose`.          |
| **Production**    | `https://sebc.dev`      | `https://sebc.dev`      | Environnement live accessible aux visiteurs, hébergé sur le VPS OVH. |

Un environnement de "staging" (ou pré-production) n'est pas inclus dans le périmètre du MVP pour des raisons de simplicité, mais l'architecture basée sur Docker permettrait d'en ajouter un facilement à l'avenir.
Parfait, avançons.

La stratégie de test est une pierre angulaire de la qualité du projet. Définissons comment nous allons nous assurer que `sebc.dev` est robuste et fiable.
