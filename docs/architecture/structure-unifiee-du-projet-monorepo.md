# Structure Unifiée du Projet (Monorepo)

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
