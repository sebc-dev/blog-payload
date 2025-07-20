# sebc.dev - Product Requirements Document (PRD)

## 1. Buts et Contexte

### 1.1 Buts du Produit

* **Lancement du MVP** : Mettre en ligne la V1 fonctionnelle du blog bilingue (`sebc.dev`) pour début septembre 2025.
* **Contenu Initial** : Le blog doit être lancé avec une base solide de 9 articles de haute qualité (3 par pilier) pour démontrer immédiatement sa valeur et son étendue.
* **Qualité Exemplaire** : Le site lui-même doit incarner les principes qu'il promeut, en visant des scores de performance (Lighthouse > 90) et d'accessibilité (> 95) élevés.

### 1.2 Contexte

Le projet `sebc.dev` a été conçu pour répondre à un manque identifié sur le marché du contenu technique : l'absence de ressources pratiques qui démontrent la synergie entre l'IA, l'UX, et les bonnes pratiques d'ingénierie logicielle. Plutôt que de traiter ces sujets de manière isolée, ce blog servira de "démonstration vivante" de leur intégration réussie. Il se différenciera par son authenticité (retours d'expérience concrets) et une garantie de qualité et de cohérence assurée par un auteur unique.

### 1.3 Journal des Modifications

| Date | Version | Description | Auteur |
| :--- | :--- | :--- | :--- |
| 20/07/2025 | 1.0 | Création initiale du PRD. | John (PM) |

## 2. Exigences

### 2.1 Exigences Fonctionnelles (FR)

* **FR1** : L'administrateur (vous) doit pouvoir créer, prévisualiser, éditer et publier des articles de blog dans les deux langues (français et anglais).
* **FR2** : L'administrateur doit pouvoir créer des catégories et des tags, et les assigner librement aux articles.
* **FR3** : Le système doit permettre d'associer un article en français à sa version anglaise correspondante au sein d'une même entrée de contenu.
* **FR4** : Les visiteurs du site doivent pouvoir lire les articles publiés sur une interface publique, claire et lisible.
* **FR5** : Les visiteurs doivent pouvoir naviguer et découvrir les articles par le biais de listes chronologiques, de pages de catégories et de pages de tags.
* **FR6** : Les visiteurs doivent disposer d'une page de recherche pour trouver des articles en fonction de mots-clés.

### 2.2 Exigences Non Fonctionnelles (NFR)

* **NFR1 (Performance)** : Le site public doit viser un score Lighthouse supérieur à 90, en particulier sur les Core Web Vitals.
* **NFR2 (Accessibilité)** : Le site public doit viser un score d'accessibilité supérieur à 95 pour être utilisable par le plus grand nombre.
* **NFR3 (Responsive Design)** : Le site doit être entièrement responsive et offrir une expérience utilisateur de haute qualité sur les appareils mobiles et les ordinateurs de bureau.
* **NFR4 (Stack Technologique)** : Le projet doit être impérativement développé avec la stack technique définie : NextJS 15, React 19, Payload 3, PostgreSQL, et être déployable via Docker sur un VPS OVH.
* **NFR5 (Sécurité)** : L'application doit respecter les bonnes pratiques de sécurité web standard (HTTPS par défaut, protection contre les vulnérabilités communes comme XSS et CSRF).
* **NFR6 (Extensibilité)** : L'architecture doit être conçue pour faciliter l'ajout ultérieur des fonctionnalités prévues en phase Post-V1 (commentaires, inscriptions, newsletter) sans nécessiter une refonte majeure.

## 3. Objectifs de Conception de l'Interface Utilisateur

### 3.1 Vision Globale de l'UX

L'expérience utilisateur doit être épurée, professionnelle et entièrement axée sur la **lisibilité** et la **crédibilité**. Le design doit refléter la qualité et le sérieux du contenu technique, en offrant une navigation simple et intuitive qui encourage la découverte. L'interface d'administration doit être fonctionnelle, rapide et efficace pour ne pas freiner le processus de création de contenu.

### 3.2 Identité Visuelle (Branding)

* **Personnalité** : Moderne et accessible.
* **Palette de Couleurs** : Une palette double (thème clair / thème sombre) a été définie. Les couleurs principales sont un **bleu cyan vibrant (primary)** et un **vert canard (secondary)**.
* **Typographie** : La police **Inter** sera utilisée pour les titres et le corps du texte. La police **Jetbrains Mono** sera utilisée pour les extraits de code.
* **Logo** : Pour le MVP, un logo textuel "sebc.dev" stylisé avec un dégradé utilisant les couleurs primaires et secondaires sera utilisé.

## 4. Hypothèses Techniques

### 4.1 Structure du Dépôt (Repository)

Compte tenu de l'intégration native de Payload 3 dans NextJS, un **Monorepo** est la structure logique et requise pour ce projet.

### 4.2 Architecture de Services

L'architecture est **unifiée**. Payload CMS s'exécute directement au sein de l'environnement NextJS. Cela permet d'utiliser l'API locale de Payload pour des performances maximales et simplifie le déploiement en une seule entité.

## 5. Epics

### Epic 1 : Moteur de Contenu et Administration de Base

**Objectif :** Construire le squelette fonctionnel de l'application. À la fin, le projet sera initialisé, la base de données connectée, et un administrateur pourra créer un article complet (avec catégories, tags, image) qui sera visible sur le site public.

#### Stories :
* **1.1 : Initialisation du Projet et Configuration de l'Environnement** (Setup Next.js/Payload avec template "blank", TailwindCSS 4, Shadcn/UI, Docker pour PostgreSQL).
* **1.2 : Création des Collections de Taxonomie et Média** (Création des collections `categories`, `tags`, `media`).
* **1.3 : Création de la Collection "Articles"** (Création de la collection `posts` avec tous ses champs et relations).
* **1.4 : Gestion Complète d'un Article dans l'Admin** (Workflow de création/sauvegarde d'un article).
* **1.5 : Affichage d'un Article Complet sur le Site Public** (Route dynamique `[slug]` affichant toutes les données de l'article).
* **1.6 : Liste des Articles sur la Page d'Accueil** (Affichage d'une liste riche des articles publiés).

### Epic 2 : Enrichissement et Découverte du Contenu

**Objectif :** Rendre le contenu du blog facilement explorable en créant des pages de listes pour chaque catégorie et tag, et en implémentant une page de recherche performante.

#### Stories :
* **2.1 : Création des Pages de Catégories** (Route `categories/[slug]` listant les articles d'une catégorie).
* **2.2 : Création des Pages de Tags** (Route `tags/[slug]` listant les articles d'un tag).
* **2.3 : Intégration du Plugin de Recherche Backend** (Installation et configuration du plugin de recherche Payload).
* **2.4 : Création de la Page de Recherche Frontend** (Page `/search` avec champ de saisie et affichage des résultats).

### Epic 3 : Expérience Bilingue et Préparation au Lancement

**Objectif :** Livrer une expérience bilingue transparente et s'assurer que le site est techniquement optimisé (SEO, performance, accessibilité) et prêt pour la production.

#### Stories :
* **3.1 : Navigation et Routing Bilingue** (Sélecteur de langue, structure d'URL sans `/en/` pour la langue par défaut).
* **3.2 : Workflow d'Édition Bilingue dans l'Admin** (Interface d'édition avec onglets de langue).
* **3.3 : Optimisation SEO Bilingue** (Plugin SEO, balises `hreflang`, `meta` localisées).
* **3.4 : Création des Pages Statiques Bilingues** (Pages "À Propos" et "Contact").
* **3.5 : Finalisation et Audit pré-lancement** (Audit Lighthouse, favicon, finalisation de la configuration de production).