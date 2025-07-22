# **Analyse et Optimisation d'une Stratégie de Déploiement pour Next.js 15 et Payload CMS 3 sur VPS**

## **Section 1: Analyse Stratégique de l'Architecture de Déploiement Proposée**

Cette section initiale a pour but de valider les choix fondamentaux de la stratégie proposée, tout en posant les bases pour les améliorations significatives et orientées production qui seront détaillées dans ce rapport. L'objectif est de transformer une approche conceptuellement solide en un système robuste, sécurisé et hautement disponible.

### **1.1. Évaluation de Haut Niveau : Une Fondation Solide**

La stratégie de déploiement soumise repose sur la conteneurisation avec Docker et l'automatisation via un pipeline CI/CD utilisant GitHub Actions. Ce choix constitue une base moderne et conforme aux standards de l'industrie pour le déploiement d'applications web.1 L'utilisation de Docker garantit la cohérence des environnements entre le développement et la production, un principe fondamental pour éliminer les erreurs de type "ça marche sur ma machine".1 Parallèlement, GitHub Actions permet d'automatiser le cycle de vie du déploiement, de la construction de l'image à sa mise en production, ce qui favorise la vélocité et la fiabilité des mises à jour.3  
Cependant, bien que conceptuellement juste, la stratégie proposée manque de détails cruciaux pour une mise en production sereine. Elle omet des aspects critiques tels que la gestion de l'état (base de données, fichiers persistants), la sécurité des secrets d'exécution, et surtout, un mécanisme de déploiement qui n'entraîne pas d'interruption de service.  
Ce rapport s'articulera donc autour de trois piliers d'amélioration fondamentaux pour faire évoluer cette stratégie vers un standard de production :

1. **Déploiement et Disponibilité :** Évoluer d'un mécanisme de mise à jour entraînant une interruption de service vers un modèle de déploiement "zéro downtime" (sans interruption).
2. **État et Persistance :** Architecturer une solution complète pour l'intégrité des données en intégrant les composants manquants : une base de données dédiée et un stockage de fichiers persistant.
3. **Sécurité et Résilience :** Renforcer l'ensemble du flux de travail, de la construction sécurisée de l'image Docker et de la gestion des secrets à la planification de la reprise après sinistre.

### **1.2. L'Architecture Monolithique : Implications pour le Déploiement**

Depuis sa version 3, Payload CMS est conçu pour s'intégrer profondément au sein d'une application Next.js. Cette fusion crée une base de code monolithique unique et puissante, où le back-end (CMS) et le front-end coexistent dans le même projet.4 La commande  
create-payload-app met en place cette structure par défaut, simplifiant considérablement le processus de développement initial.7  
Cette architecture monolithique est un atout majeur pour la vitesse de développement, car elle élimine la complexité liée à la gestion de deux projets distincts. Cependant, elle induit un couplage fort que la stratégie de déploiement doit impérativement prendre en compte. La commande pnpm run build n'est plus une simple compilation d'actifs front-end ; elle devient un processus de construction "full-stack" qui englobe les étapes de construction propres à Payload.

#### **La Dépendance Cachée à la Base de Données lors de la Compilation**

Une analyse plus approfondie révèle une dépendance critique, souvent négligée, que la stratégie initiale ignore complètement : le processus de construction de l'application peut nécessiter un accès à la base de données.  
La chaîne de causalité est la suivante :

1. L'application est un monolithe Next.js/Payload, où Payload est configuré directement dans le code Next.js.6
2. Le script build dans package.json exécute la commande next build.
3. next build déclenche les hooks de construction de Payload, car ce dernier est intégré en tant que plugin ou via un "higher-order component" dans la configuration de Next.js.
4. La fonctionnalité de Payload est intrinsèquement liée au schéma de la base de données. Par exemple, pour générer automatiquement les types TypeScript à partir des collections ou pour pré-rendre des pages statiques (SSG) qui récupèrent des données du CMS au moment de la construction, Payload doit pouvoir se connecter à une base de données pour lire la structure des collections.8

Cette interdépendance signifie que l'étape de construction (build), exécutée dans l'environnement isolé et éphémère d'un runner GitHub Actions, est susceptible d'échouer si elle ne parvient pas à établir une connexion à une instance de base de données pour résoudre la configuration de Payload. Le pipeline CI/CD n'est donc pas indépendant de la couche de données, contrairement à ce que la stratégie initiale laisse supposer. Il est impératif d'architecturer une solution pour cette dépendance, qui sera traitée en détail dans la section consacrée au pipeline CI/CD.

## **Section 2: Conception d'une Image Docker de Qualité Production**

La création d'une image Docker optimisée est la première étape vers un déploiement fiable et performant. Cette section fournit une déconstruction complète des meilleures pratiques pour construire une image minimale, sécurisée et efficace, spécifiquement adaptée à l'application monolithique Next.js 15 et Payload 3\.

### **2.1. La Compilation Multi-étapes : Pierre Angulaire de l'Optimisation Docker**

La pratique standard et la plus efficace pour créer des images de production légères est la compilation multi-étapes ("multi-stage build").2 Ce modèle consiste à utiliser plusieurs instructions  
FROM dans un même Dockerfile. Chaque instruction FROM initie une nouvelle étape de construction qui peut être utilisée comme base pour les étapes suivantes.  
L'avantage principal est la séparation nette entre l'environnement de construction (builder) et l'environnement d'exécution final (runner). L'étape builder contient toutes les dépendances de développement, les compilateurs, et les outils nécessaires pour assembler l'application (par exemple, le SDK Node.js complet, pnpm, etc.). L'étape runner, quant à elle, ne contient que les artéfacts compilés et les dépendances de production strictement nécessaires pour exécuter l'application.  
Cette séparation a un impact drastique sur la taille de l'image finale. Une image non optimisée, qui embarque l'ensemble de l'environnement de développement, peut facilement dépasser 1 Go. En comparaison, une image optimisée grâce à la compilation multi-étapes et à la fonctionnalité standalone de Next.js pèse généralement autour de 200-250 Mo.13 Une image plus petite se traduit par des temps de déploiement plus rapides, des coûts de stockage réduits dans le registre de conteneurs, et une surface d'attaque de sécurité considérablement diminuée.

### **2.2. Déconstruction du Dockerfile Optimisé pour Next.js 15 & Payload 3**

Voici une construction détaillée, étape par étape, d'un Dockerfile de production, avec des annotations expliquant la justification de chaque directive.

#### **Étape 1: base \- L'Image de Référence**

Dockerfile

\# Étape 1: Définir une image de base commune, légère et sécurisée  
FROM node:22-alpine AS base

- **Instruction :** FROM node:22-alpine AS base
- **Justification :** L'utilisation d'une image de base officielle et récente est primordiale. node:22-alpine est un excellent choix pour plusieurs raisons 2 :
  - **Version Spécifique (22) :** Le fait de "pinner" une version LTS (Long-Term Support) spécifique plutôt que d'utiliser latest garantit la reproductibilité des constructions. Cela évite que des mises à jour majeures et potentiellement cassantes de Node.js ne soient introduites à l'insu du développeur.
  - **Variante alpine :** Les images basées sur Alpine Linux sont extrêmement légères. Elles contiennent un ensemble minimal de paquets, ce qui réduit la taille de l'image et, par conséquent, sa surface d'attaque.

#### **Étape 2: deps \- Mise en Cache Efficace des Dépendances**

Dockerfile

\# Étape 2: Installer les dépendances dans une couche dédiée pour la mise en cache  
FROM base AS deps  
WORKDIR /app

\# Alpine Linux peut nécessiter ce paquet pour la compatibilité avec certains binaires Node.js  
RUN apk add \--no-cache libc6-compat

\# Copier uniquement les fichiers de manifeste pour tirer parti du cache de Docker  
COPY package.json pnpm-lock.yaml\*./

\# Installer les dépendances en utilisant pnpm  
RUN corepack enable pnpm && pnpm i \--frozen-lockfile

- **Instruction :** COPY package.json pnpm-lock.yaml\*./ puis RUN... pnpm i...
- **Justification :** Cette séquence est une optimisation fondamentale. En copiant uniquement les fichiers de manifeste (package.json, pnpm-lock.yaml) avant d'exécuter l'installation, on tire parti du système de cache par couches de Docker.11 La couche contenant les  
  node_modules ne sera reconstruite que si le contenu de ces fichiers de manifeste change. Pour toutes les autres modifications de code, cette étape sera instantanément récupérée du cache, accélérant considérablement les constructions ultérieures.
- **Commandes Spécifiques :**
  - RUN apk add \--no-cache libc6-compat: Ce paquet est souvent nécessaire pour assurer la compatibilité des binaires Node.js précompilés sur le système Alpine Linux minimaliste.11
  - RUN corepack enable pnpm && pnpm i \--frozen-lockfile: C'est la commande canonique pour installer des dépendances avec pnpm dans un environnement CI/CD. corepack est l'outil moderne pour gérer les versions de gestionnaires de paquets, et \--frozen-lockfile garantit que seules les versions exactes spécifiées dans pnpm-lock.yaml sont installées, assurant des installations déterministes.11

#### **Étape 3: builder \- Compilation de l'Application**

Dockerfile

\# Étape 3: Construire l'application avec les dépendances installées  
FROM base AS builder  
WORKDIR /app  
COPY \--from=deps /app/node_modules./node_modules  
COPY..

\# Passer l'URI de la base de données de construction via les arguments de build  
ARG DATABASE_URI  
ENV DATABASE_URI=$DATABASE_URI

\# Activer la sortie autonome de Next.js  
ENV NEXT_PRIVATE_STANDALONE=true

\# Exécuter le script de construction  
RUN pnpm run build

- **Instruction :** COPY \--from=deps...
- **Justification :** Au lieu de réinstaller les dépendances, on les copie directement depuis l'étape deps. C'est le cœur de la compilation multi-étapes.
- **Instruction :** ARG DATABASE_URI et ENV DATABASE_URI=$DATABASE_URI
- **Justification :** C'est ici que l'on résout la "dépendance cachée" identifiée dans la section 1\. ARG déclare une variable de construction qui peut être passée via la commande docker build. ENV rend cette variable disponible en tant que variable d'environnement pour le processus pnpm run build. Cela permet au pipeline CI/CD de fournir une chaîne de connexion à la base de données nécessaire à la construction de Payload.
- **Instruction :** ENV NEXT_PRIVATE_STANDALONE=true
- **Justification :** Cette variable d'environnement est une méthode alternative pour activer la sortie standalone de Next.js, qui est cruciale. Il est recommandé de configurer output: 'standalone' directement dans next.config.js.11 Cette option instruit Next.js de créer un dossier  
  .next/standalone contenant une version minimale de l'application avec uniquement le code et les dépendances node_modules nécessaires à son exécution.

#### **Étape 4: runner \- L'Image Finale, Sécurisée et Minimale**

Dockerfile

\# Étape 4: Créer l'image de production finale à partir des artéfacts de construction  
FROM base AS runner  
WORKDIR /app

ENV NODE_ENV=production  
\# Désactiver la télémétrie de Next.js en production  
ENV NEXT_TELEMETRY_DISABLED=1

\# Créer un utilisateur et un groupe système non-root pour exécuter l'application  
RUN addgroup \--system \--gid 1001 nodejs  
RUN adduser \--system \--uid 1001 nextjs

\# Copier les actifs publics  
COPY \--from=builder /app/public./public

\# Copier la sortie autonome et les fichiers statiques  
COPY \--from=builder \--chown=nextjs:nodejs /app/.next/standalone./  
COPY \--from=builder \--chown=nextjs:nodejs /app/.next/static./.next/static

\# Définir l'utilisateur non-root  
USER nextjs

EXPOSE 3000

ENV PORT 3000  
\# S'assurer que le serveur écoute sur toutes les interfaces réseau  
ENV HOSTNAME="0.0.0.0"

\# Définir la commande pour démarrer le serveur Next.js autonome  
CMD \["node", "server.js"\]

- **Instructions adduser/addgroup et USER :** L'exécution de l'application en tant qu'utilisateur non-privilégié (nextjs dans ce cas) est une mesure de sécurité fondamentale.2 Si un attaquant parvenait à exploiter une vulnérabilité dans l'application, ses actions seraient confinées aux permissions limitées de cet utilisateur, réduisant considérablement le risque pour le système hôte.
- **Instructions COPY \--from=builder \--chown=nextjs:nodejs... :** Seuls les artéfacts strictement nécessaires sont copiés depuis l'étape builder : le dossier public, la sortie standalone, et les fichiers static.11 L'option  
  \--chown garantit que ces fichiers appartiennent au nouvel utilisateur nextjs, ce qui est une bonne pratique de sécurité.
- **La Subtilité des Permissions d'Exécution :** Une simple copie des fichiers ne suffit pas. Le fichier server.js généré dans le répertoire .next/standalone doit avoir les permissions d'exécution pour que la commande CMD puisse le lancer.13 Bien que non explicitement ajouté ici pour des raisons de simplicité, dans des scénarios de production très stricts, une commande  
  RUN chmod pourrait être nécessaire après la copie et avant l'instruction USER nextjs. Par exemple : RUN chmod 755.next/standalone/server.js. Cependant, les configurations modernes de COPY \--chown et les images de base gèrent souvent cela correctement. Il est néanmoins crucial de connaître ce point en cas de dépannage d'erreurs de type "permission denied".
- **Instruction CMD \["node", "server.js"\] :** C'est la commande finale qui démarre le serveur Node.js autonome créé par Next.js.13

### **2.3. Le Fichier .dockerignore : Une Optimisation Critique**

Un fichier .dockerignore à la racine du projet est aussi important que le Dockerfile lui-même. Il fonctionne de manière analogue à un .gitignore, en spécifiant les fichiers et dossiers à exclure du "contexte de construction" envoyé au démon Docker.

\# Fichier.dockerignore

\# Dépendances et cache  
node_modules  
.next  
.pnpm-store

\# Fichiers de configuration locaux et secrets  
.env\*  
\!/.env.example

\# Fichiers Docker et de configuration CI  
Dockerfile  
.dockerignore  
.github

\# Fichiers Git  
.git  
.gitignore

\# Logs et autres  
npm-debug.log\*  
yarn-debug.log\*  
yarn-error.log\*

- **Justification :** L'utilisation d'un .dockerignore a deux avantages majeurs 2 :
  1. **Sécurité :** Il empêche les fichiers sensibles, comme les .env contenant des secrets locaux ou les clés SSH dans le dossier .git, d'être accidentellement copiés dans une couche de l'image Docker, où ils pourraient être extraits et compromis.
  2. **Performance :** En excluant les dossiers volumineux et inutiles comme node_modules et .git, la quantité de données transférées au démon Docker est drastiquement réduite. Cela accélère la commande docker build, en particulier lors de la première construction ou lorsque le cache n'est pas utilisé.

## **Section 3: Modernisation du Pipeline CI/CD avec GitHub Actions**

La stratégie CI/CD proposée est conceptuellement correcte mais peut être significativement améliorée en adoptant des actions plus modernes, sécurisées et spécialisées. Cette section détaille la refonte du fichier .github/workflows/deploy.yml pour le rendre robuste, efficace et aligné sur les meilleures pratiques actuelles.

### **3.1. Adoption d'Actions Actuelles et Sécurisées**

La maintenance et la sécurité des dépendances s'appliquent également aux actions utilisées dans les workflows GitHub.

- **actions/checkout :** L'utilisation de actions/checkout@v4 est correcte et correspond à la dernière version majeure disponible, ce qui est une bonne pratique.18
- **appleboy/ssh-action :** La stratégie initiale spécifie appleboy/ssh-action@v1.0.3. Il est fortement recommandé de "pinner" les actions à une version majeure (par exemple, @v1) plutôt qu'à une version de patch spécifique.19 Cela permet de bénéficier automatiquement des mises à jour de sécurité et des corrections de bugs non cassantes publiées par le mainteneur, sans avoir à modifier manuellement le workflow. Les journaux de publication de cette action montrent une maintenance active, ce qui renforce la confiance en son utilisation.21 La version sera donc mise à jour vers  
  appleboy/ssh-action@v1.

De plus, les étapes conceptuelles de "construction et poussée de l'image Docker" seront remplacées par la suite d'actions officielles et spécialisées de Docker, qui est la norme de l'industrie :

- docker/login-action : Pour une authentification sécurisée aux registres de conteneurs.
- docker/setup-buildx-action : Pour configurer le moteur de construction BuildKit, qui offre des performances améliorées et des fonctionnalités avancées comme la construction multi-plateformes.
- docker/build-push-action : Pour construire et pousser l'image de manière optimisée, en tirant parti du cache.

L'adoption de ces actions officielles garantit une meilleure intégration, une performance accrue et une plus grande fiabilité par rapport à des scripts personnalisés.22

### **3.2. Implémentation du Job build_and_push**

Ce job sera responsable de la création de l'image Docker et de sa publication sur le GitHub Container Registry (GHCR).

- **Authentification au Registre :** Pour pousser une image vers GHCR, l'authentification est gérée de manière transparente et sécurisée par docker/login-action. La configuration optimale utilise le token temporaire généré pour chaque exécution de workflow, éliminant ainsi le besoin de créer et de gérer un Personal Access Token (PAT) manuel.22
  - registry: ghcr.io
  - username: ${{ github.actor }} (l'utilisateur qui a déclenché le workflow)
  - password: ${{ secrets.GITHUB\_TOKEN }} (le token d'accès temporaire du workflow)
- **Étiquetage ("Tagging") de l'Image :** Une stratégie de "tagging" robuste est essentielle pour la gestion des versions et les rollbacks. L'action docker/build-push-action sera configurée pour appliquer deux étiquettes à chaque image construite sur la branche principale 24 :
  1. Une étiquette latest : C'est une étiquette mobile qui pointe toujours vers la dernière version déployée avec succès. Le script de déploiement sur le VPS utilisera cette étiquette pour sa simplicité.
  2. Une étiquette basée sur le SHA du commit Git : Par exemple, ghcr.io/votre-user/votre-app:${{ github.sha }}. Cette étiquette est immuable et permet d'identifier précisément la version du code correspondant à une image donnée. C'est crucial pour les audits, le débogage et les rollbacks vers une version spécifique.
- **Résolution de la Dépendance à la Base de Données de Construction :** Comme identifié précédemment, l'étape build nécessite une base de données. Cette dépendance sera satisfaite en passant une variable de construction à Docker via docker/build-push-action.
  - build-args: | DATABASE_URI=${{ secrets.BUILD\_DATABASE\_URI }}
  - Cette ligne instruit l'action de passer le contenu du secret GitHub BUILD_DATABASE_URI en tant qu'argument de construction au Dockerfile. Le Dockerfile (décrit dans la section 2\) utilisera cet argument pour définir la variable d'environnement DATABASE_URI pendant la construction.
  - Il est conseillé à l'utilisateur de créer un nouveau secret de dépôt nommé BUILD_DATABASE_URI. Pour le MVP, cela peut être une chaîne de connexion vers une base de données cloud gratuite (comme Neon, Supabase, ou une instance Railway) qui servira uniquement à cette étape de construction. Cela résout de manière explicite et sécurisée la dépendance cachée.

### **3.3. Le Job deploy : Connexion Sécurisée au VPS**

Ce job dépend du succès de build_and_push et est responsable du déclenchement du déploiement sur le serveur de production.

- **Action et Authentification :** Le job utilisera appleboy/ssh-action@v1 avec les secrets GitHub existants pour la connexion SSH : VPS_HOST, VPS_USER, et VPS_SSH_KEY.27
- **Découplage de la Logique de Déploiement :** La modification la plus importante par rapport à la stratégie initiale réside dans le contenu du paramètre script. Au lieu d'inclure une série de commandes docker-compose complexes directement dans le fichier YAML du workflow, le script se contentera d'exécuter un script shell distant qui sera préalablement placé sur le VPS.
  - script: | cd /home/deployer/app &&./deploy.sh ${{ github.sha }}
  - Cette approche présente plusieurs avantages :
    1. **Modularité :** La logique de déploiement (le script deploy.sh) est découplée du pipeline CI/CD. Elle vit avec l'infrastructure et peut être testée et modifiée indépendamment du workflow GitHub.
    2. **Lisibilité et Maintenance :** Le fichier de workflow reste simple et centré sur l'orchestration, tandis que la complexité du déploiement est encapsulée dans un script dédié.
    3. **Sécurité :** Moins de logique complexe est exposée dans les logs de GitHub Actions.
  - Notez que le SHA du commit est passé en argument au script deploy.sh, lui permettant de savoir quelle version spécifique de l'image il doit potentiellement utiliser, bien que la stratégie principale s'appuiera sur le tag latest.

### **3.4. Tableau Récapitulatif des Secrets GitHub Actions Requis**

Pour garantir une configuration sans erreur, voici un tableau clair et exploitable des secrets qui doivent être configurés dans les paramètres du dépôt GitHub (Settings \> Secrets and variables \> Actions).

| Nom du Secret      | Objectif                                                                                                    | Exemple de Valeur                       |
| :----------------- | :---------------------------------------------------------------------------------------------------------- | :-------------------------------------- |
| VPS_HOST           | Adresse IP publique du serveur VPS OVH.                                                                     | 203.0.113.54                            |
| VPS_USER           | Nom de l'utilisateur non-root sur le VPS, dédié au déploiement.                                             | deployer                                |
| VPS_SSH_KEY        | Clé SSH privée (sans phrase secrète) de l'utilisateur deployer.                                             | \-----BEGIN OPENSSH PRIVATE KEY-----... |
| BUILD_DATABASE_URI | Chaîne de connexion à la base de données utilisée _uniquement_ pendant la phase de construction de l'image. | postgres://user:pass@host:port/db       |

## **Section 4: Éradication des Interruptions de Service : Le Modèle de Déploiement "Zéro Downtime"**

Cette section aborde la faille la plus critique de la stratégie de déploiement initiale et propose une solution complète et prête pour la production, garantissant une disponibilité continue de l'application pendant les mises à jour.

### **4.1. La Faille Critique de docker-compose up \--force-recreate**

La commande docker-compose up \-d \--force-recreate, bien que pratique en environnement de développement, est un anti-modèle absolu pour la production. Son fonctionnement intrinsèque garantit une période d'interruption de service.30 Le drapeau  
\--force-recreate instruit Docker Compose d'arrêter et de supprimer le conteneur existant _avant_ de créer et de démarrer le nouveau conteneur avec la nouvelle image.  
Le cycle de vie de cette commande est le suivant :

1. Docker Compose détecte qu'il doit recréer le service.
2. Il envoie un signal SIGTERM au conteneur en cours d'exécution.
3. Le conteneur est arrêté et supprimé. **Le service est maintenant indisponible.**
4. Docker Compose télécharge la nouvelle image depuis le registre (si elle n'est pas déjà présente localement).
5. Un nouveau conteneur est créé à partir de la nouvelle image.
6. Le nouveau conteneur est démarré. **Le service redevient disponible.**

La durée de l'interruption (étape 3 à 6\) dépend de plusieurs facteurs : le temps de téléchargement de l'image, le temps de démarrage de l'application, et la charge du serveur. Même si cette durée n'est que de quelques secondes, elle est inacceptable pour une application professionnelle où les utilisateurs peuvent être activement engagés. Chaque déploiement se traduit par une fenêtre d'erreurs 502 (Bad Gateway) pour les utilisateurs.

### **4.2. Le Modèle de Déploiement "Blue-Green" : Une Exploration Architecturale**

La solution pour éliminer cette interruption est le modèle de déploiement "Blue-Green".32 Ce modèle est une stratégie de publication de logiciels qui réduit les risques et les temps d'arrêt en exécutant deux environnements de production identiques, appelés "Blue" et "Green".  
Le déroulement d'un déploiement Blue-Green est le suivant :

1. **État Initial :** L'environnement "Blue" est en production et traite tout le trafic des utilisateurs. Il exécute la version actuelle de l'application.
2. **Déploiement de la Nouvelle Version :** La nouvelle version de l'application est déployée dans l'environnement "Green", qui est inactif et isolé du trafic public.
3. **Tests et Validation :** L'environnement "Green" est testé de manière exhaustive (tests automatisés, vérifications manuelles) pour s'assurer que la nouvelle version est stable et fonctionnelle, sans impacter les utilisateurs.
4. **Basculement du Trafic :** Une fois que "Green" est validé, le routeur (ou reverse proxy) est reconfiguré pour rediriger instantanément tout le trafic entrant de "Blue" vers "Green". Ce basculement est atomique et transparent pour les utilisateurs. "Green" devient le nouvel environnement de production.
5. **Mise en Retrait :** L'environnement "Blue" est maintenant inactif mais reste disponible. Il peut servir de solution de repli immédiate en cas de problème majeur avec la version "Green" (il suffit de rebasculer le routeur).
6. **Désactivation :** Une fois que la confiance dans la version "Green" est établie, l'environnement "Blue" peut être désactivé ou mis à jour pour devenir le prochain environnement "Green" lors du déploiement suivant.

Ce modèle garantit qu'il n'y a aucune interruption de service car le basculement du trafic est instantané et ne se produit que lorsqu'une nouvelle version entièrement fonctionnelle et saine est prête.

### **4.3. Traefik avec les Étiquettes Docker : La Solution Élégante**

Pour mettre en œuvre le modèle Blue-Green sur un seul VPS avec Docker Compose, Traefik est l'outil de choix. Traefik est un reverse proxy moderne et un "edge router" conçu pour les microservices et les conteneurs. Sa caractéristique la plus puissante dans ce contexte est sa capacité à se configurer dynamiquement en écoutant les événements du socket Docker.34  
Au lieu de modifier manuellement des fichiers de configuration Nginx et de recharger le service, on attache des "étiquettes" (labels) directement aux services dans le fichier docker-compose.yml. Traefik détecte automatiquement ces étiquettes lorsqu'un conteneur démarre ou s'arrête, et met à jour sa configuration de routage en temps réel, sans interruption.  
Pour notre déploiement Blue-Green, nous allons définir deux services quasi-identiques dans notre docker-compose.yml, par exemple app-blue et app-green. Le script de déploiement contrôlera lequel est actif en manipulant les conteneurs, et Traefik s'occupera du routage du trafic de manière transparente.

### **4.4. Le Script de Déploiement "Zéro Downtime" (deploy.sh)**

Ce script sera le cerveau de notre déploiement Blue-Green. Placé sur le VPS (par exemple dans /home/deployer/app/deploy.sh), il sera exécuté par le pipeline GitHub Actions. Voici sa logique détaillée, avec le script complet fourni dans la section 8\.

1. **Détermination des Rôles :** Le script commence par identifier quel service est actuellement "Blue" (en cours d'exécution) et quel service sera "Green" (la nouvelle version). Il peut le faire en inspectant les conteneurs en cours d'exécution.
2. **Téléchargement de la Nouvelle Image :** Il exécute docker-compose pull app-green (en supposant que app-green est le service à mettre à jour). Cela télécharge la nouvelle image taguée latest depuis GHCR.
3. **Démarrage de l'Environnement "Green" :** Le script démarre le conteneur "Green" avec docker-compose up \-d app-green. À ce stade, "Green" est en cours d'exécution mais ne reçoit aucun trafic de production.
4. **Attente de l'État "Healthy" :** C'est une étape cruciale. Le script entre dans une boucle qui interroge périodiquement l'état de santé du conteneur "Green" (docker inspect). Cette vérification dépend d'une directive HEALTHCHECK définie dans le Dockerfile de l'application.36 Le script ne continue que lorsque le conteneur "Green" est déclaré "healthy", ce qui signifie que l'application a démarré et est prête à recevoir du trafic.
5. **Basculement du Trafic par Traefik :** Les étiquettes Traefik sur le service app-green sont configurées pour lui donner la priorité. Une fois que le conteneur est "healthy", Traefik le détecte et commence à lui acheminer le trafic de manière transparente.
6. **Mise en Retrait de "Blue" :** Après une période de grâce (par exemple, 30 secondes) pour permettre aux requêtes en cours sur "Blue" de se terminer, le script arrête l'ancien conteneur "Blue" avec docker-compose stop app-blue.
7. **Nettoyage :** Enfin, le script supprime le conteneur "Blue" arrêté (docker-compose rm \-f app-blue) et peut éventuellement nettoyer les anciennes images Docker non utilisées pour libérer de l'espace disque.

### **4.5. Tableau Comparatif des Stratégies de Déploiement**

Pour illustrer de manière tangible la supériorité de l'approche Blue-Green, le tableau suivant compare les deux méthodes.

| Étape du Processus                 | Méthode Actuelle (--force-recreate)       | Méthode Recommandée (Blue-Green avec Traefik)                             | Disponibilité du Service                 |
| :--------------------------------- | :---------------------------------------- | :------------------------------------------------------------------------ | :--------------------------------------- |
| 1\. Démarrage du déploiement       | Le trafic arrive sur le conteneur v1.     | Le trafic arrive sur le conteneur "Blue" (v1).                            | **UP**                                   |
| 2\. Arrêt de l'ancien conteneur    | docker-compose arrête le conteneur v1.    | Le conteneur "Blue" (v1) continue de fonctionner.                         | **DOWN** (actuel) vs **UP** (recommandé) |
| 3\. Démarrage du nouveau conteneur | docker-compose démarre le conteneur v2.   | Le conteneur "Green" (v2) démarre en parallèle.                           | **DOWN** (actuel) vs **UP** (recommandé) |
| 4\. Basculement du trafic          | Le trafic arrive sur v2 une fois démarré. | Traefik bascule le trafic vers "Green" (v2) une fois qu'il est "healthy". | **UP**                                   |
| 5\. Fin du déploiement             | Le déploiement est terminé.               | Le conteneur "Blue" (v1) est arrêté et supprimé.                          | **UP**                                   |
| **Résultat Final**                 | **Interruption de service garantie.**     | **Aucune interruption de service.**                                       |                                          |

Ce tableau met en évidence que la méthode Blue-Green maintient la disponibilité du service (UP) à chaque étape du processus, éliminant ainsi complètement les temps d'arrêt.

## **Section 5: Architecture pour la Persistance de l'État : Base de Données, Migrations et Stockage de Fichiers**

La stratégie de déploiement initiale omet entièrement la gestion de l'état persistant, un aspect fondamental de toute application dynamique. Les conteneurs Docker sont par nature éphémères ; sans une configuration adéquate, toutes les données générées par les utilisateurs—qu'il s'agisse d'entrées de base de données ou de fichiers téléversés—seraient perdues à chaque redéploiement. Cette section détaille l'architecture nécessaire pour garantir la persistance et l'intégrité des données.

### **5.1. Intégration d'une Base de Données PostgreSQL**

Payload CMS nécessite une base de données pour fonctionner. PostgreSQL est une option robuste, performante et entièrement prise en charge.4 Pour un déploiement sur un seul VPS, la méthode la plus simple et la plus efficace consiste à gérer la base de données en tant qu'autre service dans le même fichier  
docker-compose.yml.  
Un service postgres sera ajouté, en utilisant l'image Docker officielle postgres:16-alpine. La configuration de ce service doit inclure trois éléments essentiels 1 :

1. **Variables d'Environnement :** Des variables comme POSTGRES_USER, POSTGRES_PASSWORD, et POSTGRES_DB doivent être définies pour initialiser la base de données et configurer l'accès. Ces secrets seront gérés de manière sécurisée, comme détaillé dans la Section 6\.
2. **Volume Nommé pour les Données :** C'est l'élément le plus critique. Une directive volumes doit être utilisée pour mapper le répertoire de données interne du conteneur PostgreSQL (/var/lib/postgresql/data) à un volume nommé géré par Docker (par exemple, pg_data). La ligne volumes: \- pg_data:/var/lib/postgresql/data garantit que les fichiers de la base de données sont stockés sur le système de fichiers de l'hôte, en dehors du cycle de vie du conteneur. Ainsi, même si le conteneur PostgreSQL est arrêté, supprimé ou mis à jour, les données persistent et sont rattachées au nouveau conteneur au redémarrage.40
3. **Healthcheck :** Un healthcheck sera ajouté au service PostgreSQL pour permettre aux autres services (comme l'application Next.js/Payload) de savoir quand la base de données est prête à accepter des connexions. La commande pg_isready est parfaitement adaptée à cet usage.37

### **5.2. Un Flux de Travail de Migration de Base de Données Prêt pour la Production**

À mesure que l'application évolue, le schéma de la base de données (la structure des collections, des champs, etc.) changera inévitablement. La gestion de ces changements de manière contrôlée et versionnée est le rôle des migrations. Payload fournit une interface de ligne de commande (CLI) puissante pour gérer ce processus : payload migrate.9  
L'exécution des migrations est une étape critique qui doit être intégrée avec précision dans le processus de déploiement zéro downtime. Un mauvais séquencement peut entraîner des erreurs, une corruption des données ou une interruption de service.

#### **Le Séquencement Correct des Migrations dans un Déploiement Blue-Green**

La question fondamentale est : à quel moment exact faut-il exécuter la commande de migration?

- **Pas avant le démarrage du nouveau conteneur :** Si la migration est exécutée alors que seul l'ancien code ("Blue") est en cours d'exécution, le code ne connaît pas encore les changements de schéma à venir, et la migration pourrait échouer ou être incorrecte.
- **Pas après le basculement du trafic :** Si le trafic est basculé vers le nouveau code ("Green") avant que la base de données ne soit migrée, les utilisateurs interagiront avec un code qui s'attend à un nouveau schéma de base de données, alors que la base de données est toujours dans l'ancien état. Cela provoquera inévitablement des erreurs.

La séquence correcte, qui garantit la cohérence et la disponibilité, est la suivante :

1. Le script de déploiement démarre le nouveau conteneur "Green" avec le nouveau code de l'application. Le conteneur "Blue" (ancien code) continue de traiter le trafic de production contre la base de données dans son état actuel.
2. Le conteneur "Green" est en cours d'exécution, mais son healthcheck échoue initialement car l'application ne peut pas démarrer complètement ou fonctionner correctement avec l'ancien schéma de base de données.
3. Le script de déploiement exécute la commande de migration _à l'intérieur du conteneur "Green"_. La commande docker exec \<id_conteneur_green\> pnpm payload migrate est utilisée à cet effet.
4. Cette commande met à jour le schéma de la base de données partagée pour qu'il corresponde à ce que le nouveau code attend. Les migrations de Payload s'exécutent dans des transactions, ce qui garantit qu'elles réussissent complètement ou sont annulées en toute sécurité en cas d'erreur.43
5. Une fois la migration réussie, l'application dans le conteneur "Green" peut s'initialiser correctement. Lors de la prochaine vérification, son healthcheck passera à l'état "healthy".
6. Ce n'est qu'après avoir reçu le signal "healthy" que Traefik commencera à acheminer le trafic vers le conteneur "Green".

Cet ordre précis est non négociable pour des déploiements sûrs et sans interruption qui impliquent des modifications du schéma de la base de données. L'étape docker exec... migrate sera donc explicitement ajoutée au script deploy.sh (décrit dans la Section 4), juste avant la boucle de vérification de l'état de santé.

### **5.3. Assurer la Persistance des Fichiers Téléversés**

Tout comme les données de la base de données, les fichiers téléversés par les utilisateurs via le CMS (images, documents, etc.) constituent un état persistant.9 Par défaut, ces fichiers seraient écrits dans le système de fichiers du conteneur de l'application et seraient perdus lors du redéploiement.  
La solution est identique à celle utilisée pour la base de données : l'utilisation d'un volume nommé Docker.

1. Un nouveau volume nommé, par exemple payload_media, sera déclaré dans la section volumes de premier niveau du fichier docker-compose.yml.
2. Dans la définition du service de l'application (app-blue et app-green), ce volume sera monté au chemin où Payload est configuré pour stocker les médias. Par exemple : volumes: \- payload_media:/app/media.17

Avec cette configuration, tous les fichiers téléversés sont écrits sur le système de fichiers de l'hôte via le volume payload_media. Les conteneurs "Blue" et "Green" peuvent lire et écrire dans ce même emplacement partagé, et les fichiers persistent indéfiniment, quel que soit le cycle de vie des conteneurs.

## **Section 6: Une Approche Renforcée de la Gestion des Secrets**

La gestion des informations sensibles (secrets) est un pilier de la sécurité des applications. La stratégie doit couvrir non seulement les secrets utilisés pendant la phase de CI/CD (comme vu dans la Section 3), mais aussi, et surtout, les secrets nécessaires à l'exécution de l'application en production.

### **6.1. Les Dangers d'une Gestion Insécurisée des Secrets en Production**

Stocker des secrets directement en tant que variables d'environnement dans le fichier docker-compose.yml ou les passer via la ligne de commande est une pratique courante mais risquée. Les variables d'environnement peuvent être exposées de plusieurs manières 44 :

- **Fuites dans les Logs :** De nombreuses bibliothèques et frameworks peuvent, en cas d'erreur, vider l'ensemble des variables d'environnement dans les journaux, exposant ainsi des clés d'API, des mots de passe de base de données, etc.
- **Inspection des Processus :** Sur le serveur hôte, un utilisateur (ou un attaquant) ayant un accès suffisant peut inspecter les processus en cours d'exécution et leurs variables d'environnement. La commande docker inspect sur un conteneur peut également révéler les variables d'environnement avec lesquelles il a été démarré.
- **Partage avec des Processus Enfants :** Les processus enfants lancés par l'application héritent par défaut des variables d'environnement du processus parent, ce qui augmente la surface d'exposition.

Pour un système de production, une approche plus sécurisée est nécessaire pour minimiser ces risques.

### **6.2. Stratégie Recommandée : Le Fichier .env Géré sur l'Hôte**

Pour une configuration sur un seul VPS, où la complexité de solutions comme Docker Swarm Secrets ou HashiCorp Vault n'est pas justifiée, la méthode la plus pragmatique et sécurisée consiste à utiliser un fichier .env sur le serveur hôte, protégé par des permissions de système de fichiers strictes.1  
Cette approche offre un bon compromis entre sécurité et simplicité de gestion. Voici le guide de mise en œuvre étape par étape :

1. **Création du Fichier :** Sur le VPS, dans le répertoire du projet (par exemple, /home/deployer/app), créer un fichier nommé .env.
2. **Peuplement des Secrets :** Remplir ce fichier avec toutes les variables d'environnement nécessaires à l'exécution en production. Chaque ligne doit suivre le format CLE=VALEUR.
3. **Sécurisation des Permissions :** C'est l'étape la plus importante. Les permissions du fichier .env doivent être restreintes pour que seul l'utilisateur de déploiement puisse le lire.
   - sudo chown deployer:deployer /home/deployer/app/.env : Assigne la propriété du fichier à l'utilisateur et au groupe deployer.
   - sudo chmod 600 /home/deployer/app/.env : Définit les permissions de manière à ce que seul le propriétaire (deployer) ait les droits de lecture et d'écriture. Aucun autre utilisateur sur le système ne peut accéder à son contenu.
4. **Référencement dans Docker Compose :** Dans le fichier docker-compose.yml, au lieu de définir les variables d'environnement directement, on utilise la directive env_file pour indiquer à Docker Compose de charger les variables depuis ce fichier sécurisé.  
   YAML  
   services:  
    app-blue:  
    \#... autres configurations  
    env_file:  
    \-./.env  
    postgres:  
    \#... autres configurations  
    env_file:  
    \-./.env

Docker Compose lira le fichier .env et injectera les variables dans les conteneurs respectifs au moment de leur démarrage. Les secrets ne sont jamais stockés dans le code source, dans l'image Docker, ou dans le fichier docker-compose.yml lui-même.

### **6.3. Tableau des Variables d'Environnement de Production**

Pour fournir une source de vérité unique et garantir une configuration correcte du fichier .env en production, le tableau suivant détaille toutes les variables nécessaires.

| Nom de la Variable     | Service(s) concerné(s)        | Objectif                                                                                                                                 | Exemple                                       |
| :--------------------- | :---------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------- |
| NODE_ENV               | app-blue, app-green           | Définit l'environnement d'exécution à production pour optimiser les performances de Next.js.                                             | production                                    |
| DATABASE_URI           | app-blue, app-green           | Chaîne de connexion complète que Payload utilise pour se connecter à la base de données PostgreSQL.                                      | postgres://user:password@postgres:5432/dbname |
| PAYLOAD_SECRET         | app-blue, app-green           | Clé secrète cryptographique utilisée par Payload pour signer les jetons d'authentification (JWT). Doit être une longue chaîne aléatoire. | une_chaine_aleatoire_tres_longue_et_securisee |
| NEXT_PUBLIC_SERVER_URL | app-blue, app-green           | L'URL publique de l'application, utilisée par Payload et Next.js pour générer des liens absolus.                                         | https://votre-domaine.com                     |
| POSTGRES_USER          | postgres                      | Nom d'utilisateur pour la base de données PostgreSQL.                                                                                    | payload_user                                  |
| POSTGRES_PASSWORD      | postgres                      | Mot de passe pour l'utilisateur de la base de données PostgreSQL.                                                                        | un_mot_de_passe_tres_robuste                  |
| POSTGRES_DB            | postgres                      | Nom de la base de données à créer.                                                                                                       | payload_db                                    |
| TZ                     | postgres, app-blue, app-green | Spécifie le fuseau horaire pour tous les conteneurs afin d'assurer la cohérence des horodatages.                                         | Europe/Paris                                  |

Ce tableau sert de checklist pour la configuration de l'environnement de production, réduisant les risques d'oubli ou de mauvaise configuration d'une variable critique.

## **Section 7: Assurer la Continuité des Activités : Sauvegarde, Récupération et Surveillance**

Le déploiement d'une application n'est que la première étape. Pour la transformer en un service fiable et gérable, il est indispensable de mettre en place des pratiques opérationnelles robustes. Cette section introduit des stratégies cruciales pour la sauvegarde des données, la planification de la reprise après sinistre, et la surveillance de l'état de santé de l'application.

### **7.1. Stratégie de Sauvegarde et de Récupération Automatisée**

Une stratégie de sauvegarde solide est la meilleure assurance contre la perte de données, qu'elle soit due à une défaillance matérielle, une erreur humaine, ou une attaque malveillante. Pour notre architecture, deux types de données persistantes doivent être sauvegardés : la base de données et les fichiers téléversés.

- **Sauvegarde de la Base de Données PostgreSQL :** La méthode standard pour sauvegarder une base de données PostgreSQL, même lorsqu'elle est conteneurisée, consiste à utiliser l'utilitaire pg_dump. La commande peut être exécutée depuis l'hôte via docker exec.40 Le script de sauvegarde (  
  backup_db.sh) effectuera les actions suivantes :
  1. Définir un nom de fichier de sauvegarde unique, incluant un horodatage (par exemple, db_backup_2025-10-26_14-30-00.sql.gz).
  2. Exécuter docker exec \<id_conteneur_postgres\> pg_dump avec les options appropriées pour créer un dump complet de la base de données.
  3. Compresser la sortie à la volée avec gzip pour économiser de l'espace.
  4. Stocker la sauvegarde dans un répertoire dédié sur le serveur hôte.
- **Sauvegarde des Fichiers Téléversés :** Le volume Docker contenant les médias (payload_media) doit également être sauvegardé. Le script backup_files.sh s'en chargera :
  1. Identifier le chemin du volume sur le système de fichiers de l'hôte (généralement dans /var/lib/docker/volumes/).
  2. Créer une archive tar compressée de l'ensemble du contenu de ce répertoire.49
  3. Stocker cette archive aux côtés des sauvegardes de la base de données.
- **Externalisation des Sauvegardes :** Conserver les sauvegardes uniquement sur le même VPS que l'application est une pratique risquée. En cas de défaillance complète du serveur, les sauvegardes seraient également perdues. Il est donc impératif d'externaliser les sauvegardes vers un stockage distant et sécurisé.
  - Les scripts de sauvegarde incluront une étape finale pour téléverser les archives créées vers un fournisseur de stockage objet (comme OVH Public Cloud Storage, Amazon S3, Backblaze B2, etc.).
  - L'outil rclone est parfaitement adapté à cette tâche. Il peut être configuré pour se connecter à des dizaines de fournisseurs de cloud et synchroniser des fichiers de manière fiable.40
- **Automatisation avec cron :** Pour garantir que les sauvegardes sont effectuées régulièrement sans intervention manuelle, les scripts backup_db.sh et backup_files.sh seront automatisés à l'aide de cron, l'ordonnanceur de tâches standard sous Linux. Une tâche cron peut être configurée pour exécuter les scripts quotidiennement, par exemple pendant les heures creuses.

### **7.2. Recommandation Avancée : Une Pile de Surveillance Légère**

Comprendre comment l'application se comporte en production est essentiel pour anticiper les problèmes, optimiser les performances et diagnostiquer les pannes. Pour un seul VPS, il est possible de déployer une pile de surveillance légère et puissante en utilisant Docker Compose.  
La pile de surveillance recommandée se compose de trois outils open-source de premier plan 51 :

- **Prometheus :** Un système de surveillance et d'alerte qui collecte des métriques à partir de cibles configurées à des intervalles de temps spécifiés. Il stocke ces métriques dans une base de données de séries temporelles.
- **Grafana :** Une plateforme d'analyse et de visualisation qui permet de créer des tableaux de bord interactifs à partir de diverses sources de données, y compris Prometheus.
- **cAdvisor (Container Advisor) :** Un outil développé par Google qui expose automatiquement des métriques détaillées sur les ressources utilisées par tous les conteneurs en cours d'exécution sur un hôte (utilisation du CPU, de la mémoire, du réseau, des E/S disque, etc.).

Cette pile peut être ajoutée en tant que services supplémentaires dans le fichier docker-compose.yml.

- Le service cadvisor exposera les métriques des conteneurs.
- Le service prometheus sera configuré (via un fichier prometheus.yml) pour "scraper" (collecter) les métriques de cadvisor.
- Le service grafana sera configuré pour utiliser prometheus comme source de données.

Une fois en place, il est possible d'importer des tableaux de bord Grafana pré-construits (comme le populaire dashboard ID 893\) pour obtenir instantanément une vue d'ensemble de la santé du VPS et de chaque conteneur.51 Cette configuration offre une visibilité inestimable sur les performances de l'application Next.js/Payload et de la base de données PostgreSQL, permettant de détecter les fuites de mémoire, les pics de CPU ou d'autres anomalies avant qu'ils n'impactent les utilisateurs.

## **Section 8: L'Architecture de Production Consolidée**

Cette section finale rassemble tous les éléments discutés précédemment en une série d'artéfacts de code complets et prêts à l'emploi. Elle sert de guide d'implémentation pratique pour mettre en place l'architecture de déploiement recommandée.

### **8.1. Le Dockerfile Complet et Recommandé**

Ce Dockerfile met en œuvre la compilation multi-étapes pour créer une image de production minimale, sécurisée et performante.

Dockerfile

\# Fichier: Dockerfile

\# \--- Étape 1: Base \---  
\# Utiliser une image Node.js LTS sur Alpine pour la légèreté et la sécurité.  
FROM node:22-alpine AS base

\# \--- Étape 2: Dépendances \---  
\# Installer les dépendances dans une couche séparée pour optimiser le cache Docker.  
FROM base AS deps  
WORKDIR /app

\# Installer libc6-compat, une dépendance courante pour les binaires Node.js sur Alpine.  
RUN apk add \--no-cache libc6-compat

\# Copier uniquement les fichiers de manifeste pour bénéficier du cache.  
COPY package.json pnpm-lock.yaml\*./

\# Installer les dépendances avec pnpm en utilisant un lockfile gelé pour la reproductibilité.  
RUN corepack enable pnpm && pnpm i \--frozen-lockfile

\# \--- Étape 3: Constructeur \---  
\# Construire l'application en utilisant les dépendances pré-installées.  
FROM base AS builder  
WORKDIR /app

\# Copier les dépendances de l'étape précédente.  
COPY \--from=deps /app/node_modules./node_modules  
\# Copier le reste du code source de l'application.  
COPY..

\# Déclarer l'argument de build pour l'URI de la base de données.  
ARG DATABASE_URI  
\# Rendre l'argument disponible comme variable d'environnement pour le processus de build.  
ENV DATABASE_URI=$DATABASE_URI

\# Activer la sortie autonome de Next.js pour une image de production minimale.  
\# Assurez-vous que \`output: 'standalone'\` est également dans votre next.config.js.  
ENV NEXT_PRIVATE_STANDALONE=true

\# Exécuter la commande de construction.  
RUN pnpm run build

\# \--- Étape 4: Exécuteur \---  
\# Créer l'image de production finale, légère et sécurisée.  
FROM base AS runner  
WORKDIR /app

\# Définir l'environnement sur "production".  
ENV NODE_ENV=production  
\# Désactiver la télémétrie de Next.js.  
ENV NEXT_TELEMETRY_DISABLED=1

\# Créer un groupe et un utilisateur système non-root pour exécuter l'application.  
RUN addgroup \--system \--gid 1001 nodejs  
RUN adduser \--system \--uid 1001 nextjs

\# Copier les actifs publics depuis l'étape de construction.  
COPY \--from=builder /app/public./public

\# Copier les artéfacts de construction autonomes et statiques, en assignant la propriété à l'utilisateur non-root.  
COPY \--from=builder \--chown=nextjs:nodejs /app/.next/standalone./  
COPY \--from=builder \--chown=nextjs:nodejs /app/.next/static./.next/static

\# Définir l'utilisateur non-root pour l'exécution du conteneur.  
USER nextjs

\# Exposer le port sur lequel l'application s'exécute.  
EXPOSE 3000

\# Définir le port et le nom d'hôte pour que le serveur Next.js écoute correctement.  
ENV PORT=3000  
ENV HOSTNAME="0.0.0.0"

\# Définir la commande pour démarrer le serveur Next.js autonome.  
CMD \["node", "server.js"\]

### **8.2. Le Fichier .dockerignore Complet et Recommandé**

Ce fichier est essentiel pour accélérer les constructions et éviter les fuites de secrets.

\# Fichier:.dockerignore

\# Dépendances et cache local  
node_modules  
.next  
.pnpm-store

\# Fichiers de configuration et secrets locaux  
.env\*  
\!/.env.example

\# Fichiers de configuration de l'IDE et du système  
.vscode  
.idea  
\*.swp  
.DS_Store

\# Fichiers Docker et de configuration CI/CD  
Dockerfile  
.dockerignore  
.github  
docker-compose.yml

\# Fichiers Git  
.git  
.gitignore

\# Logs de débogage  
npm-debug.log\*  
yarn-debug.log\*  
yarn-error.log\*  
pnpm-debug.log\*

\# Fichiers de test  
\*.test.js  
\*.spec.js

### **8.3. Le Fichier docker-compose.yml Complet et Recommandé**

Ce fichier orchestre tous les services nécessaires en production : Traefik, deux instances de l'application pour le déploiement Blue-Green, et la base de données PostgreSQL.

YAML

\# Fichier: docker-compose.yml

version: '3.8'

services:  
 traefik:  
 image: traefik:v3.0  
 container_name: traefik  
 command:  
 \- "--api.insecure=true"  
 \- "--providers.docker=true"  
 \- "--providers.docker.exposedbydefault=false"  
 \- "--entrypoints.web.address=:80"  
 ports:  
 \- "80:80"  
 \- "8080:8080" \# Pour le tableau de bord de Traefik  
 volumes:  
 \- "/var/run/docker.sock:/var/run/docker.sock:ro"  
 restart: unless-stopped

app-blue:  
 image: ghcr.io/VOTRE_USER/VOTRE_APP:latest  
 container_name: app-blue  
 restart: unless-stopped  
 env_file:  
 \-./.env  
 volumes:  
 \- payload_media:/app/media  
 depends_on:  
 postgres:  
 condition: service_healthy  
 labels:  
 \- "traefik.enable=true"  
 \- "traefik.http.routers.app.rule=Host(\`votre-domaine.com\`)"  
 \- "traefik.http.routers.app.entrypoints=web"  
 \- "traefik.http.services.app.loadbalancer.server.port=3000"  
 healthcheck:  
 test:  
 interval: 30s  
 timeout: 10s  
 retries: 3  
 start_period: 30s

app-green:  
 image: ghcr.io/VOTRE_USER/VOTRE_APP:latest  
 container_name: app-green  
 restart: unless-stopped  
 env_file:  
 \-./.env  
 volumes:  
 \- payload_media:/app/media  
 depends_on:  
 postgres:  
 condition: service_healthy  
 labels:  
 \- "traefik.enable=true"  
 \- "traefik.http.routers.app-green.rule=Host(\`votre-domaine.com\`)"  
 \- "traefik.http.routers.app-green.entrypoints=web"  
 \- "traefik.http.routers.app-green.priority=10" \# Priorité plus élevée pour prendre le trafic  
 \- "traefik.http.services.app-green.loadbalancer.server.port=3000"  
 healthcheck:  
 test:  
 interval: 30s  
 timeout: 10s  
 retries: 3  
 start_period: 30s

postgres:  
 image: postgres:16-alpine  
 container_name: postgres_db  
 restart: unless-stopped  
 env_file:  
 \-./.env  
 volumes:  
 \- pg_data:/var/lib/postgresql/data  
 healthcheck:  
 test:  
 interval: 10s  
 timeout: 5s  
 retries: 5

volumes:  
 pg_data:  
 payload_media:

### **8.4. Le Workflow GitHub Actions Complet (.github/workflows/deploy.yml)**

Ce workflow automatise la construction, le test et le déploiement de l'application.

YAML

\# Fichier:.github/workflows/deploy.yml

name: Déploiement en Production

on:  
 push:  
 branches: \[ main \]

jobs:  
 build_and_push:  
 name: Construire et Pousser l'Image Docker  
 runs-on: ubuntu-latest  
 permissions:  
 contents: read  
 packages: write

    steps:
      \- name: Checkout du code
        uses: actions/checkout@v4

      \- name: Mise en place de pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      \- name: Mise en place de Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      \- name: Installer les dépendances
        run: pnpm install \--frozen-lockfile

      \- name: Lancer les tests (linters, unit tests, etc.)
        run: pnpm test \# Assurez-vous que ce script existe dans votre package.json

      \- name: Connexion au GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB\_TOKEN }}

      \- name: Mettre en place Docker Buildx
        uses: docker/setup-buildx-action@v3

      \- name: Construire et pousser l'image Docker
        uses: docker/build-push-action@v6
        with:
          context:.
          push: true
          tags: |
            ghcr.io/${{ github.repository\_owner }}/VOTRE\_APP:latest
            ghcr.io/${{ github.repository\_owner }}/VOTRE\_APP:${{ github.sha }}
          build-args: |
            DATABASE\_URI=${{ secrets.BUILD\_DATABASE\_URI }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

deploy:  
 name: Déployer sur le VPS  
 needs: build_and_push  
 runs-on: ubuntu-latest  
 steps:  
 \- name: Déployer sur le VPS via SSH  
 uses: appleboy/ssh-action@v1  
 with:  
 host: ${{ secrets.VPS\_HOST }}  
 username: ${{ secrets.VPS\_USER }}  
 key: ${{ secrets.VPS\_SSH\_KEY }}  
 script: |  
 cd /home/deployer/app  
 ./deploy.sh

### **8.5. Le Script de Déploiement "Zéro Downtime" Complet (deploy.sh)**

Ce script, placé sur le VPS, orchestre le déploiement Blue-Green.

Bash

\#\!/bin/bash

\# Fichier: deploy.sh  
\# Arrêter le script en cas d'erreur  
set \-e

\# \--- Configuration \---  
COMPOSE_FILE="docker-compose.yml"  
PROJECT_DIR=$(pwd)  
APP_IMAGE="ghcr.io/VOTRE_USER/VOTRE_APP:latest"

\# \--- Logique de déploiement \---  
echo "Démarrage du déploiement zéro downtime..."

\# 1\. Identifier les conteneurs Blue/Green  
cd "$PROJECT\_DIR"  
RUNNING\_CONTAINER=$(docker-compose \-f "$COMPOSE_FILE" ps \-q | xargs \-r docker inspect \--format '{{.Name}}' | grep \-E 'app-blue|app-green' | sed 's/^\\///')

if; then  
 CURRENT_APP="app-blue"  
 NEXT_APP="app-green"  
else  
 CURRENT_APP="app-green"  
 NEXT_APP="app-blue"  
fi

echo "Actif: $CURRENT_APP. Déploiement sur: $NEXT_APP."

\# 2\. Télécharger la dernière image  
echo "Téléchargement de la dernière image: $APP\_IMAGE"  
docker-compose \-f "$COMPOSE_FILE" pull "$NEXT_APP"

\# 3\. Démarrer le nouveau conteneur (Green)  
echo "Démarrage du conteneur $NEXT\_APP..."  
docker-compose \-f "$COMPOSE_FILE" up \-d "$NEXT_APP"

\# 4\. Exécuter les migrations de base de données DANS le nouveau conteneur  
echo "Attente de 10s avant d'exécuter les migrations..."  
sleep 10  
echo "Exécution des migrations de base de données sur $NEXT\_APP..."  
docker exec "$NEXT_APP" pnpm payload migrate

\# 5\. Attendre que le nouveau conteneur soit 'healthy'  
echo "Attente de l'état 'healthy' pour $NEXT\_APP..."  
while; do  
    echo \-n "."  
    sleep 5  
done  
echo ""  
echo "$NEXT_APP est maintenant 'healthy'."

\# 6\. Arrêter l'ancien conteneur (Blue)  
echo "Arrêt de l'ancien conteneur $CURRENT\_APP..."  
docker-compose \-f "$COMPOSE_FILE" stop "$CURRENT\_APP"  
docker-compose \-f "$COMPOSE_FILE" rm \-f "$CURRENT_APP"

echo "Déploiement terminé avec succès. $NEXT_APP est maintenant en production."

\# 7\. Nettoyage des anciennes images Docker non utilisées  
echo "Nettoyage des anciennes images..."  
docker image prune \-f

exit 0

### **8.6. Les Scripts de Sauvegarde Complets (backup_db.sh, backup_files.sh)**

Ces scripts doivent être placés sur le VPS (par exemple dans /home/deployer/backups) et rendus exécutables.

#### **backup_db.sh**

Bash

\#\!/bin/bash  
set \-e  
BACKUP_DIR="/home/deployer/backups/postgres"  
RCLONE_REMOTE="s3-ovh" \# Nom du remote rclone configuré  
REMOTE_DIR="my-app-backups/postgres"  
TIMESTAMP=$(date \+"%Y-%m-%d\_%H-%M-%S")  
BACKUP\_FILE="db\_backup\_$TIMESTAMP.sql.gz"  
CONTAINER_NAME="postgres_db"  
DB_USER=$(grep POSTGRES\_USER /home/deployer/app/.env | cut \-d '=' \-f2)  
DB\_NAME=$(grep POSTGRES_DB /home/deployer/app/.env | cut \-d '=' \-f2)

mkdir \-p "$BACKUP\_DIR"  
echo "Création de la sauvegarde de la base de données..."  
docker exec "$CONTAINER_NAME" pg_dump \-U "$DB\_USER" \-d "$DB_NAME" | gzip \> "$BACKUP\_DIR/$BACKUP_FILE"  
echo "Sauvegarde créée: $BACKUP\_DIR/$BACKUP_FILE"

echo "Téléversement vers le stockage distant..."  
rclone copy "$BACKUP\_DIR/$BACKUP_FILE" "$RCLONE\_REMOTE:$REMOTE_DIR"  
echo "Téléversement terminé."

echo "Nettoyage des sauvegardes locales de plus de 7 jours..."  
find "$BACKUP_DIR" \-type f \-name "\*.gz" \-mtime \+7 \-delete  
echo "Nettoyage terminé."

#### **backup_files.sh**

Bash

\#\!/bin/bash  
set \-e  
BACKUP_DIR="/home/deployer/backups/media"  
RCLONE_REMOTE="s3-ovh"  
REMOTE_DIR="my-app-backups/media"  
TIMESTAMP=$(date \+"%Y-%m-%d\_%H-%M-%S")  
BACKUP\_FILE="media\_backup\_$TIMESTAMP.tar.gz"  
SOURCE_DIR=$(docker volume inspect \--format '{{.Mountpoint }}' app_payload_media) \# 'app' est le nom du projet

mkdir \-p "$BACKUP\_DIR"  
echo "Création de la sauvegarde des fichiers médias..."  
tar \-czf "$BACKUP_DIR/$BACKUP\_FILE" \-C "$SOURCE_DIR".  
echo "Sauvegarde créée: $BACKUP\_DIR/$BACKUP_FILE"

echo "Téléversement vers le stockage distant..."  
rclone copy "$BACKUP\_DIR/$BACKUP_FILE" "$RCLONE\_REMOTE:$REMOTE_DIR"  
echo "Téléversement terminé."

echo "Nettoyage des sauvegardes locales de plus de 7 jours..."  
find "$BACKUP_DIR" \-type f \-name "\*.gz" \-mtime \+7 \-delete  
echo "Nettoyage terminé."

### **8.7. Checklist d'Implémentation Finale**

1. **Sur le VPS :**
   - Créer un utilisateur de déploiement non-root (ex: deployer).
   - Installer Docker et Docker Compose.
   - Générer une paire de clés SSH pour l'utilisateur deployer.
   - Créer la structure de répertoires : /home/deployer/app et /home/deployer/backups.
   - Créer et sécuriser le fichier /home/deployer/app/.env avec toutes les variables de production.
   - Placer les fichiers docker-compose.yml et deploy.sh dans /home/deployer/app.
   - Rendre deploy.sh exécutable (chmod \+x deploy.sh).
   - Installer et configurer rclone pour le stockage distant.
   - Placer et rendre exécutables les scripts de sauvegarde.
   - Configurer les tâches cron pour les sauvegardes.
2. **Sur le Dépôt GitHub :**
   - Ajouter le Dockerfile et le .dockerignore à la racine du projet.
   - S'assurer que next.config.js contient output: 'standalone'.
   - Créer le fichier de workflow .github/workflows/deploy.yml.
   - Configurer les secrets GitHub Actions : VPS_HOST, VPS_USER, VPS_SSH_KEY, BUILD_DATABASE_URI.
3. **Premier Déploiement :**
   - Manuellement, sur le VPS, lancer le service postgres et app-blue une première fois avec docker-compose up \-d postgres app-blue.
   - Exécuter les migrations manuellement une fois : docker exec app-blue pnpm payload migrate.
   - Pousser le code sur la branche main pour déclencher le premier déploiement automatisé zéro downtime.

#### **Sources des citations**

1. Running Payload CMS v3 in Docker Containers \- OneClick IT Consultancy, consulté le juillet 20, 2025, [https://www.oneclickitsolution.com/centerofexcellence/cms/run-payload-cms-3-in-docker](https://www.oneclickitsolution.com/centerofexcellence/cms/run-payload-cms-3-in-docker)
2. NextJs App Deployment with Docker: Complete Guide for 2025, consulté le juillet 20, 2025, [https://codeparrot.ai/blogs/deploy-nextjs-app-with-docker-complete-guide-for-2025](https://codeparrot.ai/blogs/deploy-nextjs-app-with-docker-complete-guide-for-2025)
3. CI/CD with Github, Docker & a VPS. | by Omasuaku \- Medium, consulté le juillet 20, 2025, [https://omasuaku.medium.com/ci-cd-with-github-docker-a-vps-687a00e552af](https://omasuaku.medium.com/ci-cd-with-github-docker-a-vps-687a00e552af)
4. How to deploy Payload CMS to Netlify, consulté le juillet 20, 2025, [https://developers.netlify.com/guides/deploy-payload-cms-3-to-netlify/](https://developers.netlify.com/guides/deploy-payload-cms-3-to-netlify/)
5. Learn advanced Next.js with Payload: Rendering CMS data in React \- Part 2 \- YouTube, consulté le juillet 20, 2025, [https://www.youtube.com/watch?v=Uyq0W6vc8Ds](https://www.youtube.com/watch?v=Uyq0W6vc8Ds)
6. Move Payload to Next.js · payloadcms payload · Discussion \#4202 \- GitHub, consulté le juillet 20, 2025, [https://github.com/payloadcms/payload/discussions/4202](https://github.com/payloadcms/payload/discussions/4202)
7. Setting Up a Next.js Front-End with Payload CMS \- YouTube, consulté le juillet 20, 2025, [https://www.youtube.com/watch?v=lvLbb5O3ljs](https://www.youtube.com/watch?v=lvLbb5O3ljs)
8. Production build with docker compose and postgres : r/PayloadCMS \- Reddit, consulté le juillet 20, 2025, [https://www.reddit.com/r/PayloadCMS/comments/1iuwwby/production_build_with_docker_compose_and_postgres/](https://www.reddit.com/r/PayloadCMS/comments/1iuwwby/production_build_with_docker_compose_and_postgres/)
9. What is Payload? | Documentation, consulté le juillet 20, 2025, [https://payloadcms.com/docs/getting-started/what-is-payload](https://payloadcms.com/docs/getting-started/what-is-payload)
10. Need Help for a Dockerfile for NextJS \- Reddit, consulté le juillet 20, 2025, [https://www.reddit.com/r/nextjs/comments/1jxlm8d/need_help_for_a_dockerfile_for_nextjs/](https://www.reddit.com/r/nextjs/comments/1jxlm8d/need_help_for_a_dockerfile_for_nextjs/)
11. Production Deployment | Documentation \- Payload CMS, consulté le juillet 20, 2025, [https://payloadcms.com/docs/production/deployment](https://payloadcms.com/docs/production/deployment)
12. How To Dockerize Nextjs?. Let's start by the basics of what… | by Lior Amsalem | Medium, consulté le juillet 20, 2025, [https://medium.com/@lior_amsalem/how-to-dockerize-nextjs-65da7cb7ed5d](https://medium.com/@lior_amsalem/how-to-dockerize-nextjs-65da7cb7ed5d)
13. Dockerizing Next.js 15 application with pnpm for production | by ..., consulté le juillet 20, 2025, [https://medium.com/@she11fish/dockerizing-next-js-15-application-with-pnpm-for-production-39c841ce8323](https://medium.com/@she11fish/dockerizing-next-js-15-application-with-pnpm-for-production-39c841ce8323)
14. What is the best way to use NextJS with docker? · vercel next.js · Discussion \#16995, consulté le juillet 20, 2025, [https://github.com/vercel/next.js/discussions/16995](https://github.com/vercel/next.js/discussions/16995)
15. How to properly configure deployment files for a nextjs 15, nextauth v5 on vps using docker?, consulté le juillet 20, 2025, [https://stackoverflow.com/questions/79707186/how-to-properly-configure-deployment-files-for-a-nextjs-15-nextauth-v5-on-vps-u](https://stackoverflow.com/questions/79707186/how-to-properly-configure-deployment-files-for-a-nextjs-15-nextauth-v5-on-vps-u)
16. kristiyan-velkov/nextjs-prod-dockerfile: This repository offers a guide and examples to optimize Docker for deploying Next.js applications in production. It covers best practices for creating efficient, secure, and lightweight Docker images with multi-stage builds, standalone mode, and selective dependency management to enable faster builds and \- GitHub, consulté le juillet 20, 2025, [https://github.com/kristiyan-velkov/nextjs-prod-dockerfile](https://github.com/kristiyan-velkov/nextjs-prod-dockerfile)
17. Deploying Payload CMS to Fly.io \- DEV Community, consulté le juillet 20, 2025, [https://dev.to/candidosales/deploying-payloadcms-to-flyio-23d3](https://dev.to/candidosales/deploying-payloadcms-to-flyio-23d3)
18. actions/checkout: Action for checking out a repo \- GitHub, consulté le juillet 20, 2025, [https://github.com/actions/checkout](https://github.com/actions/checkout)
19. How to use the checkout action in GitHub Actions \- Graphite, consulté le juillet 20, 2025, [https://graphite.dev/guides/github-actions-checkout](https://graphite.dev/guides/github-actions-checkout)
20. How to mass-update Github actions versions across 30 repositories with minimal effort?, consulté le juillet 20, 2025, [https://www.reddit.com/r/github/comments/1aelt0s/how_to_massupdate_github_actions_versions_across/](https://www.reddit.com/r/github/comments/1aelt0s/how_to_massupdate_github_actions_versions_across/)
21. Releases · appleboy/ssh-action \- GitHub, consulté le juillet 20, 2025, [https://github.com/appleboy/ssh-action/releases](https://github.com/appleboy/ssh-action/releases)
22. Publishing Docker images \- GitHub Docs, consulté le juillet 20, 2025, [https://docs.github.com/en/actions/how-tos/use-cases-and-examples/publishing-packages/publishing-docker-images](https://docs.github.com/en/actions/how-tos/use-cases-and-examples/publishing-packages/publishing-docker-images)
23. GitHub Action to build and push Docker images with Buildx, consulté le juillet 20, 2025, [https://github.com/docker/build-push-action](https://github.com/docker/build-push-action)
24. GitHub Actions: Building Docker Images and Pushing to a Container Registry | Shipyard, consulté le juillet 20, 2025, [https://shipyard.build/blog/gha-recipes-build-and-push-container-registry/](https://shipyard.build/blog/gha-recipes-build-and-push-container-registry/)
25. Working with the Container registry \- GitHub Docs, consulté le juillet 20, 2025, [https://docs.github.com/packages/working-with-a-github-packages-registry/working-with-the-container-registry](https://docs.github.com/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
26. Docker Build & Push Action \- GitHub Marketplace, consulté le juillet 20, 2025, [https://github.com/marketplace/actions/docker-build-push-action](https://github.com/marketplace/actions/docker-build-push-action)
27. Actions · GitHub Marketplace \- SSH Remote Commands, consulté le juillet 20, 2025, [https://github.com/marketplace/actions/ssh-remote-commands](https://github.com/marketplace/actions/ssh-remote-commands)
28. appleboy/ssh-action: GitHub Actions for executing remote ssh commands., consulté le juillet 20, 2025, [https://github.com/appleboy/ssh-action](https://github.com/appleboy/ssh-action)
29. Using GitHub Repository Secrets in GitHub Actions \- Stack Overflow, consulté le juillet 20, 2025, [https://stackoverflow.com/questions/79671691/using-github-repository-secrets-in-github-actions](https://stackoverflow.com/questions/79671691/using-github-repository-secrets-in-github-actions)
30. docker compose up \- Docker Docs, consulté le juillet 20, 2025, [https://docs.docker.com/reference/cli/docker/compose/up/](https://docs.docker.com/reference/cli/docker/compose/up/)
31. How do you update containers/images with docker-compose? \- Reddit, consulté le juillet 20, 2025, [https://www.reddit.com/r/docker/comments/skl2bn/how_do_you_update_containersimages_with/](https://www.reddit.com/r/docker/comments/skl2bn/how_do_you_update_containersimages_with/)
32. Simple Blue/Green Deployments with Traefik and Docker \- Occasionally Frustrated, consulté le juillet 20, 2025, [https://frustrated.blog/2021/03/16/traefik_blue_green.html](https://frustrated.blog/2021/03/16/traefik_blue_green.html)
33. Deploy Docker Compose applications with zero downtime using GitHub Actions \- jmh, consulté le juillet 20, 2025, [https://jmh.me/blog/zero-downtime-docker-compose-deploy](https://jmh.me/blog/zero-downtime-docker-compose-deploy)
34. I've built an international blog with PayloadCMS 3 (beta) for backend (GraphQL API) and Next.js 15 (canary) for frontend. It was amazing experience. Ask me anything about it. \- Reddit, consulté le juillet 20, 2025, [https://www.reddit.com/r/PayloadCMS/comments/1g7llty/ive_built_an_international_blog_with_payloadcms_3/](https://www.reddit.com/r/PayloadCMS/comments/1g7llty/ive_built_an_international_blog_with_payloadcms_3/)
35. maxcountryman/aquamarine: A demo of zero-downtime ... \- GitHub, consulté le juillet 20, 2025, [https://github.com/maxcountryman/aquamarine](https://github.com/maxcountryman/aquamarine)
36. Zero-downtime deployments with Docker Swarm: What's the proper way? \- Traefik v2, consulté le juillet 20, 2025, [https://community.traefik.io/t/zero-downtime-deployments-with-docker-swarm-whats-the-proper-way/10965](https://community.traefik.io/t/zero-downtime-deployments-with-docker-swarm-whats-the-proper-way/10965)
37. Production build with docker compose and postgres : r/nextjs \- Reddit, consulté le juillet 20, 2025, [https://www.reddit.com/r/nextjs/comments/1iuzvur/production_build_with_docker_compose_and_postgres/](https://www.reddit.com/r/nextjs/comments/1iuzvur/production_build_with_docker_compose_and_postgres/)
38. Postgres | Documentation \- Payload CMS, consulté le juillet 20, 2025, [https://payloadcms.com/docs/database/postgres](https://payloadcms.com/docs/database/postgres)
39. How to Deploy PostgreSQL with Docker and Docker Compose \- DEV Community, consulté le juillet 20, 2025, [https://dev.to/geoff89/how-to-deploy-postgresql-with-docker-and-docker-compose-3lj3](https://dev.to/geoff89/how-to-deploy-postgresql-with-docker-and-docker-compose-3lj3)
40. How a Backup and Restore Plan Became My Key to Sleep Like a Baby \- Medium, consulté le juillet 20, 2025, [https://medium.com/@heidarbozorg/postgresql-backup-and-restore-strategy-abaa0ccb8d93](https://medium.com/@heidarbozorg/postgresql-backup-and-restore-strategy-abaa0ccb8d93)
41. Dockerize & Backup A Postgres Database \- DEV Community, consulté le juillet 20, 2025, [https://dev.to/mattcale/dockerize-backup-a-postgres-database-2b1l](https://dev.to/mattcale/dockerize-backup-a-postgres-database-2b1l)
42. Migrations | Documentation \- Payload CMS, consulté le juillet 20, 2025, [https://payloadcms.com/docs/database/migrations](https://payloadcms.com/docs/database/migrations)
43. Production Migration Strategy Questions : r/PayloadCMS \- Reddit, consulté le juillet 20, 2025, [https://www.reddit.com/r/PayloadCMS/comments/1l8814b/production_migration_strategy_questions/](https://www.reddit.com/r/PayloadCMS/comments/1l8814b/production_migration_strategy_questions/)
44. Do not use secrets in environment variables and here's how to do it better, consulté le juillet 20, 2025, [https://www.nodejs-security.com/blog/do-not-use-secrets-in-environment-variables-and-here-is-how-to-do-it-better](https://www.nodejs-security.com/blog/do-not-use-secrets-in-environment-variables-and-here-is-how-to-do-it-better)
45. Secrets: write-up best practices, do's and don'ts, roadmap · Issue \#13490 \- GitHub, consulté le juillet 20, 2025, [https://github.com/moby/moby/issues/13490](https://github.com/moby/moby/issues/13490)
46. Understanding security implications of secrets vs. env vars in Docker Compose, consulté le juillet 20, 2025, [https://forums.docker.com/t/understanding-security-implications-of-secrets-vs-env-vars-in-docker-compose/145903](https://forums.docker.com/t/understanding-security-implications-of-secrets-vs-env-vars-in-docker-compose/145903)
47. Managing secrets in Docker Compose and GitHub Actions deployments \- jmh, consulté le juillet 20, 2025, [https://jmh.me/blog/secrets-management-docker-compose-deployment](https://jmh.me/blog/secrets-management-docker-compose-deployment)
48. Docker Postgres Backup/Restore Guide (with examples) \- SimpleBackups, consulté le juillet 20, 2025, [https://simplebackups.com/blog/docker-postgres-backup-restore-guide-with-examples](https://simplebackups.com/blog/docker-postgres-backup-restore-guide-with-examples)
49. Best backup strategy for multiple VMs (apps \+ PostgreSQL DBs)? Exploring Kopia, pgBackRest, and better options : r/selfhosted \- Reddit, consulté le juillet 20, 2025, [https://www.reddit.com/r/selfhosted/comments/1lgxqbg/best_backup_strategy_for_multiple_vms_apps/](https://www.reddit.com/r/selfhosted/comments/1lgxqbg/best_backup_strategy_for_multiple_vms_apps/)
50. Easy Postgres backups \- Erik Minkel, consulté le juillet 20, 2025, [https://www.erikminkel.com/2024/06/24/easy-postgres-backups/](https://www.erikminkel.com/2024/06/24/easy-postgres-backups/)
51. Docker Container Monitoring with Prometheus & Grafana \- Mobisoft Infotech, consulté le juillet 20, 2025, [https://mobisoftinfotech.com/resources/blog/docker-container-monitoring-prometheus-grafana](https://mobisoftinfotech.com/resources/blog/docker-container-monitoring-prometheus-grafana)
52. Docker Monitoring with Prometheus: A Step-by-Step Guide \- Last9, consulté le juillet 20, 2025, [https://last9.io/blog/docker-monitoring-with-prometheus-a-step-by-step-guide/](https://last9.io/blog/docker-monitoring-with-prometheus-a-step-by-step-guide/)
53. Docker Monitoring \- Prometheus and Grafana Setup Guide \- SigNoz, consulté le juillet 20, 2025, [https://signoz.io/guides/how-to-monitor-docker-containers-with-prometheus-and-grafana/](https://signoz.io/guides/how-to-monitor-docker-containers-with-prometheus-and-grafana/)
