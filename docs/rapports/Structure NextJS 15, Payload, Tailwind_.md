

# **Structure de Projet Moderne pour Next.js 15, Payload 3.48 et Tailwind CSS 4**

Ce rapport fournit une architecture de projet exhaustive et des directives techniques pour la construction d'une application unifiée utilisant Next.js 15, Payload CMS 3.48 et Tailwind CSS 4\. La structure proposée est conçue pour la maintenabilité, l'évolutivité et la performance, en tirant pleinement parti des synergies entre ces technologies de pointe.

## **Le Squelette de Projet Unifié Moderne : Un Blueprint de Haut Niveau**

L'avènement de l'intégration native de Payload 3 dans Next.js et la refonte de la configuration de Tailwind CSS 4 imposent une nouvelle vision de l'organisation des projets. Le modèle suivant représente la norme actuelle, optimisée pour la clarté et l'efficacité du développement.

### **1.1 La Structure de Projet Recommandée**

Voici l'arborescence de fichiers et de dossiers qui sert de fondation à une application robuste et moderne. Elle constitue une évolution directe de la structure initialement proposée, mise à jour pour refléter les meilleures pratiques actuelles.

sebc.dev/  
├──.vscode/                     \# Paramètres spécifiques à l'éditeur pour la cohérence de l'équipe  
├── public/                      \# Fichiers statiques (images, polices, favicons)  
├── src/                         \# Le code source de l'application  
│   ├── app/                     \# Next.js App Router : Routes et interface utilisateur  
│   │   ├── (payload)/           \# Groupe de routes pour l'administration et l'API de Payload CMS  
│   │   ├── (web)/               \# Groupe de routes pour le site web public  
│   │   │   ├── articles/  
│   │   │   │   └── \[slug\]/  
│   │   │   │       └── page.tsx \# Page dynamique pour un article unique  
│   │   │   ├── layout.tsx       \# Layout spécifique au site web public  
│   │   │   └── page.tsx         \# Page d'accueil  
│   │   └── api/                 \# Routes API globales (ex: revalidation)  
│   │       └── revalidate/  
│   │           └── route.ts     \# Endpoint pour la revalidation à la demande (On-demand revalidation)  
│   ├── components/              \# Composants React partagés  
│   │   ├── ui/                  \# Éléments d'UI atomiques et réutilisables (ex: Shadcn/UI)  
│   │   ├── layout/              \# Composants structurels (Header, Footer, Sidebar)  
│   │   └── features/            \# Composants composites spécifiques à un domaine métier  
│   ├── lib/                     \# Librairies, clients de services externes et accès aux données  
│   │   ├── payload-api.ts       \# Fonctions encapsulant l'API locale de Payload  
│   │   ├── auth.ts              \# Aides et logique d'authentification  
│   │   └── stripe.ts            \# Exemple : Initialisation du client Stripe  
│   ├── payload/                 \# Configuration de Payload CMS  
│   │   ├── collections/         \# Définitions des collections (Users, Posts, etc.)  
│   │   ├── globals/             \# Configuration globale (données du Header, Footer)  
│   │   ├── hooks/               \# Hooks spécifiques à Payload (ex: beforeChange)  
│   │   └── fields/              \# Définitions de champs personnalisés réutilisables  
│   ├── styles/                  \# Styles globaux et configuration de Tailwind 4  
│   │   └── globals.css          \# Fichier CSS principal avec les imports Tailwind et la configuration @theme  
│   └── utils/                   \# Fonctions utilitaires pures et sans état  
│       ├── formatting.ts        \# Formatage de dates, devises, etc.  
│       └── index.ts             \# Agrégation des utilitaires  
├──.env.example                 \# Modèle pour les variables d'environnement  
├──.eslintrc.json               \# Configuration d'ESLint  
├──.gitignore                   \# Fichier d'ignorance de Git  
├── docker-compose.yml           \# Configuration Docker pour la base de données de développement (ex: PostgreSQL)  
├── next.config.mjs              \# Configuration de Next.js (format ESM requis)  
├── package.json                 \# Dépendances et scripts du projet  
├── pnpm-lock.yaml               \# Fichier de verrouillage des dépendances  
├── tsconfig.json                \# Configuration de TypeScript  
└── README.md                    \# Documentation du projet

### **1.2 Justification de l'Approche Unifiée "Monorepo"**

Avec l'intégration native de Payload 3 dans l'écosystème Next.js, la distinction traditionnelle entre "frontend" et "backend" s'estompe au profit d'une application full-stack unique et cohésive.1 Cette architecture n'est pas simplement une question d'organisation de fichiers ; c'est une déclaration architecturale qui embrasse l'identité de "framework full-stack" de ces deux technologies. Les avantages de cette approche sont fondamentaux :

* **Partage des Types :** Un seul fichier tsconfig.json permet à l'interface utilisateur (composants Next.js) et à la logique métier (collections Payload) de partager de manière transparente les mêmes types TypeScript. Payload génère automatiquement ces types à partir de vos collections, éliminant ainsi les incohérences et les erreurs de typage entre les différentes couches de l'application.4  
* **Développement et Déploiement Simplifiés :** Une base de code unique, un seul processus de build et une seule cible de déploiement. Cette unification réduit considérablement la complexité opérationnelle, les frais de gestion de plusieurs dépôts et les pipelines de déploiement distincts.2  
* **Accès Direct à la Base de Données :** La caractéristique la plus puissante de cette architecture est la capacité des Server Components de Next.js à interroger directement la base de données via l'API locale de Payload. Cela contourne complètement la nécessité de passer par des appels API basés sur HTTP pour la récupération de données internes, ce qui se traduit par des performances accrues et une simplification du code.2 Cette approche transforme la manière dont les données sont récupérées et gérées au sein de l'application.

### **1.3 Le Répertoire src : Une Meilleure Pratique Incontournable**

L'utilisation d'un répertoire src à la racine du projet est devenue la norme pour les applications Next.js modernes. Bien qu'optionnelle, elle est fortement recommandée car elle instaure une séparation nette et logique entre le code source de l'application et les nombreux fichiers de configuration qui résident à la racine (next.config.mjs, tsconfig.json, etc.).6 Cette organisation empêche la racine du projet de devenir encombrée, améliore la navigabilité et clarifie l'intention de chaque partie du projet.

## **Le Cœur de l'Application : Déconstruction du Répertoire src**

Le répertoire src contient l'ensemble de la logique, de l'interface et de la configuration de l'application. Chaque sous-répertoire a un rôle précis, contribuant à une architecture modulaire et maintenable.

### **2.1 Le Next.js App Router (src/app) : La Coexistence de Deux Mondes**

Le répertoire app est le centre névralgique du routage dans Next.js. La stratégie d'organisation repose sur l'utilisation de groupes de routes (Route Groups) pour gérer les différentes facettes de l'application.

* **Stratégie des Groupes de Routes :** L'utilisation de dossiers entourés de parenthèses, comme (payload) et (web), est une fonctionnalité clé de l'App Router. Ces parenthèses indiquent à Next.js que le nom du dossier ne doit pas faire partie de l'URL finale. Cela permet de créer deux contextes de routage complètement distincts, chacun avec son propre layout.tsx racine, au sein du même répertoire app.6  
* **Le Groupe (payload) :** Ce groupe est exclusivement réservé aux besoins de Payload CMS. Il contiendra les fichiers nécessaires pour rendre l'interface d'administration et exposer les API REST et GraphQL de Payload. Ces fichiers sont généralement copiés à partir d'un modèle Payload officiel lors de l'installation et ne sont pas destinés à être modifiés. Ils agissent comme un point d'entrée pour que Payload s'intègre dans le processus de rendu de Next.js.9  
* **Le Groupe (web) :** C'est ici que réside l'intégralité du site web public. Il possède son propre layout.tsx pour les éléments partagés comme l'en-tête et le pied de page, et son page.tsx pour la page d'accueil. Toutes les routes publiques, y compris les routes dynamiques comme /articles/\[slug\], seront définies dans ce groupe.6  
* **Routes API (api/) :** Ce répertoire est destiné aux routes API globales qui ne sont pas directement liées à une page spécifique. Un cas d'usage parfait est la création d'un webhook pour la revalidation à la demande (On-Demand Revalidation). Ce webhook, situé à /api/revalidate/route.ts, peut être appelé par un hook Payload pour purger le cache de Next.js après une modification de contenu.4

### **2.2 Une Architecture de Composants Évolutive (src/components)**

Une organisation rigoureuse des composants est essentielle pour éviter le chaos à mesure que l'application grandit. L'adoption d'un modèle à trois niveaux est une pratique éprouvée qui favorise la réutilisabilité et la clarté.6

* **ui/ :** Ce répertoire contient des composants atomiques, hautement réutilisables, et souvent "headless" ou peu stylisés. C'est l'endroit idéal pour les éléments de base d'un système de design, comme ceux fournis par des bibliothèques telles que Shadcn/UI 10, Radix UI, ou des composants personnalisés comme  
  Button.tsx, Card.tsx, et Input.tsx.  
* **layout/ :** Ici se trouvent les composants structurels plus larges qui définissent le squelette des pages. Des exemples typiques incluent Header.tsx, Footer.tsx, et Sidebar.tsx. Ces composants assemblent souvent des éléments des répertoires ui/ et features/ pour former la mise en page globale.6  
* **features/ :** Ce répertoire abrite des composants composites qui sont directement liés à des fonctionnalités ou des domaines métier spécifiques. Ils sont souvent une composition de plusieurs composants ui et layout. Des exemples incluent ArticleCard.tsx (qui pourrait utiliser des composants Card et Button de ui/), ProductGrid.tsx, ou AuthForm.tsx. Cette organisation par fonctionnalité empêche le répertoire principal components de devenir un "trou noir" contenant des centaines de fichiers sans lien apparent.6

Une alternative à cette structure est la co-localisation des composants. Cette approche consiste à placer les composants spécifiques à une route dans un dossier \_components à l'intérieur de cette même route (par exemple, src/app/(web)/dashboard/\_components/). Le préfixe \_ empêche le dossier d'être traité comme un segment d'URL.12 Cette méthode est excellente pour l'encapsulation et la localité du code, mais elle peut conduire à la duplication de composants si elle n'est pas gérée avec discipline. Elle est recommandée pour les composants qui sont  
*exclusivement* utilisés par une route et ses enfants.

### **2.3 Intégration Native de Payload CMS (src/payload)**

Ce répertoire est le centre de commande pour toute la configuration de Payload. Le fait de le centraliser dans src/payload/ le maintient bien organisé et distinct du code de l'interface Next.js.

* **collections/ :** Il est recommandé de définir chaque collection dans son propre fichier (par exemple, Posts.ts, Users.ts, Pages.ts). Cette approche modulaire, par opposition à un unique fichier monolithique, améliore considérablement la lisibilité et la maintenabilité du code à mesure que le nombre de collections augmente.14  
* **globals/ :** Ce dossier est destiné à la définition des "Globals" de Payload, qui sont des contenus uniques à l'échelle du site et qui n'appartiennent pas à une collection. Des exemples typiques sont les données de navigation pour le Header.ts ou les informations de contact pour le Footer.ts.16  
* **hooks/ :** Un emplacement dédié pour les hooks personnalisés de Payload. Ces fonctions s'exécutent à des moments clés du cycle de vie des données (par exemple, beforeChange, afterDelete). Un cas d'usage essentiel est la création d'un hook qui déclenche la revalidation du cache de Next.js après la mise à jour d'un article.17  
* **fields/ (Recommandation) :** Pour les projets de grande envergure, la création de ce répertoire est une excellente pratique. Il permet de définir des configurations de champs personnalisés et complexes qui peuvent être réutilisées dans plusieurs collections. Par exemple, un champ richText avec des options spécifiques peut être défini une seule fois ici et importé partout où il est nécessaire, garantissant la cohérence.

### **2.4 Organisation du Code (src/lib, src/utils, src/styles)**

La distinction entre les différents types de modules de support est cruciale pour une base de code saine.

* **lib/ vs. utils/ :** La distinction fonctionnelle entre ces deux répertoires est une convention de longue date qui apporte de la clarté.6  
  * **lib/ :** Ce répertoire est destiné aux modules qui gèrent des effets de bord, interagissent avec des services externes ou contiennent une logique métier complexe. C'est le foyer de payload-api.ts (qui encapsule l'API locale de Payload), auth.ts (qui interagit avec le système d'authentification de Payload), et de tout client d'API tiers (comme Stripe, Algolia, etc.).  
  * **utils/ :** Ce répertoire doit contenir des fonctions d'aide pures, sans état (stateless) et sans effets de bord. Ces fonctions sont facilement testables de manière isolée. Des exemples incluent formatDate(), cn() (pour fusionner les classes Tailwind), ou validateEmail().  
* **styles/ :** Avec Tailwind CSS 4, ce répertoire acquiert une nouvelle importance critique.  
  * Il abrite globals.css, qui devient le point d'entrée unique pour tout le style de l'application. Ce fichier contiendra la directive @import "tailwindcss"; et le nouveau bloc @theme pour toutes les personnalisations du framework, remplaçant de fait le fichier tailwind.config.js.6

Le fichier lib/payload-api.ts est une pièce maîtresse de cette architecture. Il agit comme une "couche de traduction" ou une couche d'accès aux données (Data Access Layer \- DAL) entre l'interface Next.js et la source de données Payload. Plutôt que de disperser des appels bruts à payload.find(...) dans les fichiers page.tsx, ce qui créerait un couplage fort entre la vue et l'implémentation de l'accès aux données, on centralise ces appels dans des fonctions propres et typées. Un composant appellera simplement une fonction comme getPublishedPosts() depuis ce fichier. Cette fonction, à son tour, contiendra la logique payload.find({ collection: 'posts', where: { \_status: { equals: 'published' } } }). Cette abstraction offre un point de contrôle unique pour la logique de récupération des données, ce qui facilite sa gestion, sa mise en cache (avec next/cache) et ses tests.

## **Le Panneau de Contrôle : Configuration à la Racine**

Les fichiers de configuration à la racine du projet orchestrent le comportement de l'ensemble de la stack technologique. Leur configuration correcte est essentielle au bon fonctionnement de l'application.

### **3.1 Configuration de Next.js et Payload (next.config.mjs)**

Ce fichier est le point de départ de la configuration de l'application Next.js et de son intégration avec Payload.

* **ESM est Obligatoire :** Payload 3 étant un projet entièrement basé sur les modules ECMAScript (ESM), le fichier de configuration de Next.js *doit* utiliser l'extension .mjs ou le fichier package.json du projet doit contenir la propriété "type": "module".9 C'est une exigence non négociable pour que l'importation de modules de Payload fonctionne.  
* **L'Encapsuleur withPayload :** L'objet de configuration de Next.js doit être enveloppé par la fonction d'ordre supérieur withPayload, importée depuis @payloadcms/next/withPayload. Ce plugin injecte les configurations Webpack et les routes nécessaires pour que les fonctionnalités backend de Payload (comme ses points d'API et son panneau d'administration) fonctionnent correctement au sein de l'environnement Next.js.9

### **3.2 La Révolution Tailwind CSS 4 : Configuration "CSS-First"**

Tailwind CSS 4 introduit un changement de paradigme majeur dans la manière dont le framework est configuré.

* **La Fin d'une Ère : tailwind.config.js est Obsolète :** Il est crucial de comprendre que le fichier tailwind.config.ts (ou .js) n'est plus utilisé dans Tailwind v4.19 Tenter de l'utiliser n'aura aucun effet.  
* **Le Nouveau Paradigme : @theme dans le CSS :** Toute la configuration réside désormais dans le fichier src/styles/globals.css, à l'intérieur d'un bloc @theme. Cela inclut la définition des couleurs, des polices, des points de rupture, et même des utilitaires personnalisés.18  
* **Exemple Pratique :**  
  CSS  
  /\* src/styles/globals.css \*/  
  @import "tailwindcss";

  @theme {  
    \--color-primary: oklch(0.65 0.2 260);  
    \--font-sans: "Inter", sans-serif;  
    \--breakpoint-xl: 1440px;  
  }

  @layer base {  
    /\* Vos styles de base globaux ici \*/  
    body {  
      @apply bg-background text-foreground;  
    }  
  }

* **Implications :** Ce changement simplifie l'arborescence à la racine du projet mais nécessite une adaptation mentale. Il centralise toutes les préoccupations de style au sein des fichiers CSS. De plus, il exploite les variables CSS natives, ce qui rend les "design tokens" (jetons de conception) facilement accessibles à la fois en CSS et en JavaScript, sans aucune configuration supplémentaire.18

### **3.3 Configuration de TypeScript et de l'Environnement (tsconfig.json, .env.example)**

* **tsconfig.json :** Ce fichier est essentiel pour garantir une expérience de développement fluide. La configuration des alias de chemin (paths) est particulièrement importante pour maintenir des importations propres et lisibles dans un grand projet.  
  * "@/components/\*": \["src/components/\*"\]  
  * "@/lib/\*": \["src/lib/\*"\]  
  * "@payload-config": \["src/payload.config.ts"\] : Cet alias spécifique est souvent requis par les processus internes de Payload pour localiser son fichier de configuration principal.9  
* **.env.example :** Ce fichier sert de modèle pour les variables d'environnement nécessaires au fonctionnement de l'application. Il doit être copié en .env pour le développement local et sert de référence pour les environnements de production.  
  * DATABASE\_URI : La chaîne de connexion à votre base de données (PostgreSQL, MongoDB, etc.).9  
  * PAYLOAD\_SECRET : Une chaîne de caractères longue, aléatoire et secrète, utilisée par Payload pour le chiffrement et l'authentification.9  
  * NEXT\_PUBLIC\_SERVER\_URL : L'URL publique de l'application, souvent nécessaire pour la logique côté client.  
  * PAYLOAD\_ADMIN\_USER\_EMAIL & PAYLOAD\_ADMIN\_USER\_PASSWORD : Permet de pré-remplir le formulaire de connexion ou de créer automatiquement un utilisateur administrateur en développement.22

### **Tableau 1 : Résumé des Fichiers de Configuration Racine**

La compréhension des interactions entre ces fichiers de configuration est fondamentale pour éviter les erreurs de configuration courantes. Ce tableau résume leur rôle et les considérations clés spécifiques à cette stack technologique.

| Fichier | Objectif Principal | Considération Clé pour cette Stack (Next.js 15 \+ Payload 3 \+ TW 4\) |
| :---- | :---- | :---- |
| next.config.mjs | Configure le comportement de Next.js (builds, redirections, etc.). | **Doit** utiliser l'extension .mjs pour la compatibilité ESM avec Payload. **Doit** envelopper l'objet de configuration avec withPayload de @payloadcms/next. |
| src/styles/globals.css | Styles CSS globaux et configuration de Tailwind CSS. | **Remplace tailwind.config.ts**. Contient @import "tailwindcss"; et le bloc @theme pour toutes les personnalisations de Tailwind. |
| tsconfig.json | Configure le compilateur TypeScript. | Crucial pour définir les alias de chemin (@/components, @/lib) pour des importations propres. Requiert l'alias @payload-config pour que Payload fonctionne correctement. |
| src/payload.config.ts | Le fichier de configuration principal pour Payload CMS. | Définit toutes les collections, les globals, les plugins et les adaptateurs de base de données. Importé par Next.js via l'alias @payload-config. |
| .env.example | Modèle pour les variables d'environnement. | Doit inclure PAYLOAD\_SECRET et DATABASE\_URI. D'autres variables pour l'authentification, le stockage de fichiers, etc., seront ajoutées ici. |
| package.json | Gère les dépendances et les scripts du projet. | Assurez-vous que "type": "module" est défini si vous n'utilisez pas .mjs pour les fichiers de configuration. Les scripts (dev, build) orchestreront le build unifié Next.js/Payload. |

## **Justification Architecturale et Concepts Avancés**

Cette structure de fichiers n'est pas arbitraire ; elle est le reflet de modèles architecturaux profonds qui maximisent les avantages de la stack choisie.

### **4.1 La Révolution de la Récupération de Données : Les Server Components rencontrent l'API Locale de Payload**

L'approche traditionnelle d'un CMS headless consiste pour le frontend à récupérer les données via des appels réseau REST ou GraphQL. L'architecture unifiée propose un paradigme radicalement plus performant. Un Server Component de Next.js (comme un page.tsx) peut désormais importer directement des fonctions depuis lib/payload-api.ts. Ces fonctions utilisent l'API locale de Payload, comme payload.find(...), qui exécute une requête directe à la base de données sur le serveur, au sein du même processus que l'application Next.js.2  
Les bénéfices sont multiples :

* **Performance :** L'élimination de la latence réseau d'un aller-retour API se traduit par des temps de réponse du serveur nettement plus rapides.  
* **Simplicité :** Il n'est plus nécessaire de gérer des points d'API, des requêtes fetch, ou la sérialisation/désérialisation des données pour la communication interne.  
* **Sécurité des Types de Bout en Bout :** Les données retournées par l'API locale sont entièrement typées en fonction de la définition de vos collections, offrant une autocomplétion et une sécurité de type parfaites de la base de données jusqu'au composant React.

Cette approche transforme fondamentalement la perception de Payload. Il ne s'agit plus d'un "CMS Headless" externe, mais plutôt d'un "ORM avec un panneau d'administration intégré" pour votre application Next.js. L'interaction principale n'est plus en réseau, mais programmatique et locale, à l'instar de l'utilisation de Prisma ou Drizzle. Le modèle mental pour le développeur doit s'adapter : Payload fait partie intégrante de la couche de données de l'application.

### **4.2 Une Stratégie Robuste de Cache et de Revalidation**

La question se pose : comment les modifications de contenu dans l'admin Payload peuvent-elles mettre à jour les pages du frontend Next.js qui sont générées statiquement ou mises en cache? La solution est une boucle fermée élégante au sein de la même application.

1. **Hooks Payload :** On crée un hook dans src/payload/hooks/ qui s'exécute après une modification (afterChange) sur une collection pertinente, comme Posts.  
2. **Revalidation à la Demande :** Ce hook effectue ensuite une requête fetch vers le propre point d'API de revalidation de l'application Next.js (par exemple, /api/revalidate). Cet endpoint utilise les fonctions revalidateTag ou revalidatePath de Next.js pour purger le cache approprié. Cela garantit que le contenu est toujours à jour sans nécessiter de reconstruction complète du site.4

### **4.3 Flux d'Authentification Unifié**

Le système d'authentification intégré de Payload peut être exploité de manière transparente et sécurisée.22

* **Connexion/Déconnexion :** Le site public peut utiliser les Server Actions de Next.js pour gérer la soumission des formulaires. L'action serveur peut alors appeler directement la fonction locale payload.login() sur le serveur. Ce flux est à la fois sécurisé, car les informations d'identification ne transitent jamais côté client, et efficace, car il évite un appel API supplémentaire.  
* **Routes Protégées :** Le middleware de Next.js peut être utilisé pour protéger des routes dans le groupe (web). Le middleware peut vérifier la présence d'un cookie d'authentification ou d'un JWT valide émis par Payload avant d'autoriser l'accès à la page.

## **Conclusion et Recommandations Actionnables**

L'architecture présentée ici est plus qu'une simple organisation de dossiers ; c'est une approche philosophique pour construire des applications web modernes, performantes et maintenables avec la stack Next.js, Payload et Tailwind CSS.

### **5.1 Résumé des Principes Architecturaux**

* **Unifier, ne pas Séparer :** Adoptez pleinement la nature full-stack et mono-processus de l'intégration Next.js/Payload.  
* **Configurer en Code et en CSS :** Centralisez la logique de Payload en TypeScript (payload.config.ts) et la logique de Tailwind en CSS (@theme), en respectant les nouveaux paradigmes de chaque outil.  
* **Structurer pour l'Évolutivité :** Utilisez un modèle de composants à plusieurs niveaux et une séparation claire entre lib et utils pour maintenir une base de code propre à mesure qu'elle grandit.  
* **Tirer parti de l'API Locale :** Faites de l'accès direct aux données côté serveur le modèle par défaut pour une performance et une sécurité de type maximales.

### **5.2 Recommandations Actionnables**

* **Commencer avec le Modèle Officiel :** Il est fortement recommandé de démarrer un nouveau projet en utilisant le modèle officiel website de Payload : pnpm create-payload-app \-t website. Ce dernier fournit un exemple fonctionnel et prêt pour la production de l'ensemble de cette structure.4 Il est toujours plus facile d'adapter un exemple qui fonctionne que de construire à partir de zéro.  
* **Établir les Conventions Tôt :** Mettez-vous d'accord en équipe sur la structure des composants (features vs. \_components) et les modèles d'accès aux données (lib/payload-api.ts) pour garantir la cohérence tout au long du projet.23  
* **Gérer les Mises à Jour :** Utilisez l'outil @tailwindcss/upgrade pour faciliter la migration de tout style Tailwind v3 existant.24 Portez une attention particulière aux changements de rupture, notamment concernant les couleurs et les valeurs par défaut. Si vous utilisez Shadcn/UI, consultez son guide de mise à jour pour la v4.25 En suivant ces principes, les équipes de développement sont en mesure de construire des applications non seulement fonctionnelles, mais aussi agréables à maintenir et à faire évoluer sur le long terme.

#### **Sources des citations**

1. What is Payload? | Documentation, consulté le juillet 20, 2025, [https://payloadcms.com/docs/getting-started/what-is-payload](https://payloadcms.com/docs/getting-started/what-is-payload)  
2. Simplify development with Payload 3.0 and Next.js integration \- Devstark, consulté le juillet 20, 2025, [https://www.devstark.com/blog/payload-3-and-nextjs/](https://www.devstark.com/blog/payload-3-and-nextjs/)  
3. Payload: The Next.js Headless CMS and App Framework, consulté le juillet 20, 2025, [https://payloadcms.com/](https://payloadcms.com/)  
4. payloadcms/payload: Payload is the open-source, fullstack Next.js framework, giving you instant backend superpowers. Get a full TypeScript backend and admin panel instantly. Use Payload as a headless CMS or for building powerful applications. \- GitHub, consulté le juillet 20, 2025, [https://github.com/payloadcms/payload](https://github.com/payloadcms/payload)  
5. Move Payload to Next.js · payloadcms payload · Discussion \#4202 \- GitHub, consulté le juillet 20, 2025, [https://github.com/payloadcms/payload/discussions/4202](https://github.com/payloadcms/payload/discussions/4202)  
6. The Ultimate Guide to Organizing Your Next.js 15 Project Structure ..., consulté le juillet 20, 2025, [https://www.wisp.blog/blog/the-ultimate-guide-to-organizing-your-nextjs-15-project-structure](https://www.wisp.blog/blog/the-ultimate-guide-to-organizing-your-nextjs-15-project-structure)  
7. Best Practices for Organizing Your Next.js 15 2025 \- DEV Community, consulté le juillet 20, 2025, [https://dev.to/bajrayejoon/best-practices-for-organizing-your-nextjs-15-2025-53ji](https://dev.to/bajrayejoon/best-practices-for-organizing-your-nextjs-15-2025-53ji)  
8. Understanding Next.js Project Structure: A Simple Guide (nextjs v15 rc) \- Medium, consulté le juillet 20, 2025, [https://medium.com/@onejosefina/nextjs-folder-structure-using-app-router-nextjs-v15-rc-05d8ead9e6ab](https://medium.com/@onejosefina/nextjs-folder-structure-using-app-router-nextjs-v15-rc-05d8ead9e6ab)  
9. Installation | Documentation | Payload, consulté le juillet 20, 2025, [https://payloadcms.com/docs/getting-started/installation](https://payloadcms.com/docs/getting-started/installation)  
10. bytefer/awesome-nextjs: A curated list of awesome things related to Next.js. \- GitHub, consulté le juillet 20, 2025, [https://github.com/bytefer/awesome-nextjs](https://github.com/bytefer/awesome-nextjs)  
11. siddharthamaity/nextjs-15-starter-shadcn \- GitHub, consulté le juillet 20, 2025, [https://github.com/siddharthamaity/nextjs-15-starter-shadcn](https://github.com/siddharthamaity/nextjs-15-starter-shadcn)  
12. What the best or better optimised expandable next js 15 project folder structure. \- Reddit, consulté le juillet 20, 2025, [https://www.reddit.com/r/nextjs/comments/1ikodm3/what\_the\_best\_or\_better\_optimised\_expandable\_next/](https://www.reddit.com/r/nextjs/comments/1ikodm3/what_the_best_or_better_optimised_expandable_next/)  
13. What is the best way of organizing the file structure of next 15 project with app router? : r/nextjs \- Reddit, consulté le juillet 20, 2025, [https://www.reddit.com/r/nextjs/comments/1ig4qw8/what\_is\_the\_best\_way\_of\_organizing\_the\_file/](https://www.reddit.com/r/nextjs/comments/1ig4qw8/what_is_the_best_way_of_organizing_the_file/)  
14. Setting Up a Next.js Front-End with Payload CMS \- YouTube, consulté le juillet 20, 2025, [https://www.youtube.com/watch?v=lvLbb5O3ljs](https://www.youtube.com/watch?v=lvLbb5O3ljs)  
15. Mohmdev/payloadcms-website-template: Full-stack Next.js ... \- GitHub, consulté le juillet 20, 2025, [https://github.com/MohmDev/payloadcms-website-template](https://github.com/MohmDev/payloadcms-website-template)  
16. kendevco/payload\_website: Payload 3.0 Website Template \- GitHub, consulté le juillet 20, 2025, [https://github.com/kendevco/payload\_website](https://github.com/kendevco/payload_website)  
17. Plugins | Documentation \- Payload CMS, consulté le juillet 20, 2025, [https://payloadcms.com/docs/plugins/overview](https://payloadcms.com/docs/plugins/overview)  
18. Tailwind CSS v4.0 \- Tailwind CSS, consulté le juillet 20, 2025, [https://tailwindcss.com/blog/tailwindcss-v4](https://tailwindcss.com/blog/tailwindcss-v4)  
19. Tailwind CSS v4 Is Here: All the Updates You Need to Know | by Khushil Shah, consulté le juillet 20, 2025, [https://khushil21.medium.com/tailwind-css-v4-is-here-all-the-updates-you-need-to-know-394645b53755](https://khushil21.medium.com/tailwind-css-v4-is-here-all-the-updates-you-need-to-know-394645b53755)  
20. Tailwind CSS Version 4 New Features: What's New and Exciting?, consulté le juillet 20, 2025, [https://front-end.tips/tailwind-css-version-4-new-features-whats-new-and-exciting/](https://front-end.tips/tailwind-css-version-4-new-features-whats-new-and-exciting/)  
21. What is New in Tailwind CSS 4.0 Update? \- Elightwalk Technology, consulté le juillet 20, 2025, [https://www.elightwalk.com/blog/tailwind-css-v4](https://www.elightwalk.com/blog/tailwind-css-v4)  
22. Authentication Overview | Documentation \- Payload CMS, consulté le juillet 20, 2025, [https://payloadcms.com/docs/authentication/overview](https://payloadcms.com/docs/authentication/overview)  
23. 3 Next.js 15 Project Organization Strategies \- YouTube, consulté le juillet 20, 2025, [https://www.youtube.com/watch?v=rcyl-PoVa8A](https://www.youtube.com/watch?v=rcyl-PoVa8A)  
24. Upgrade guide \- Getting started \- Tailwind CSS, consulté le juillet 20, 2025, [https://tailwindcss.com/docs/upgrade-guide](https://tailwindcss.com/docs/upgrade-guide)  
25. Tailwind v4 and React 19 · Issue \#6585 · shadcn-ui/ui \- GitHub, consulté le juillet 20, 2025, [https://github.com/shadcn-ui/ui/issues/6585](https://github.com/shadcn-ui/ui/issues/6585)