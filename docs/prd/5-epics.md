# 5. Epics

## Epic 1 : Moteur de Contenu et Administration de Base

**Objectif :** Construire le squelette fonctionnel de l'application. À la fin, le projet sera initialisé, la base de données connectée, et un administrateur pourra créer un article complet (avec catégories, tags, image) qui sera visible sur le site public.

### Stories :

- **1.1 : Initialisation du Projet et Configuration de l'Environnement** (Setup Next.js/Payload avec template "blank", TailwindCSS 4, Shadcn/UI, Docker pour PostgreSQL).
- **1.2 : Création des Collections de Taxonomie et Média** (Création des collections `categories`, `tags`, `media`).
- **1.3 : Création de la Collection "Articles"** (Création de la collection `posts` avec tous ses champs et relations).
- **1.4 : Gestion Complète d'un Article dans l'Admin** (Workflow de création/sauvegarde d'un article).
- **1.5 : Affichage d'un Article Complet sur le Site Public** (Route dynamique `[slug]` affichant toutes les données de l'article).
- **1.6 : Liste des Articles sur la Page d'Accueil** (Affichage d'une liste riche des articles publiés).

## Epic 2 : Enrichissement et Découverte du Contenu

**Objectif :** Rendre le contenu du blog facilement explorable en créant des pages de listes pour chaque catégorie et tag, et en implémentant une page de recherche performante.

### Stories :

- **2.1 : Création des Pages de Catégories** (Route `categories/[slug]` listant les articles d'une catégorie).
- **2.2 : Création des Pages de Tags** (Route `tags/[slug]` listant les articles d'un tag).
- **2.3 : Intégration du Plugin de Recherche Backend** (Installation et configuration du plugin de recherche Payload).
- **2.4 : Création de la Page de Recherche Frontend** (Page `/search` avec champ de saisie et affichage des résultats).

## Epic 3 : Expérience Bilingue et Préparation au Lancement

**Objectif :** Livrer une expérience bilingue transparente et s'assurer que le site est techniquement optimisé (SEO, performance, accessibilité) et prêt pour la production.

### Stories :

- **3.1 : Navigation et Routing Bilingue** (Sélecteur de langue, structure d'URL sans `/en/` pour la langue par défaut).
- **3.2 : Workflow d'Édition Bilingue dans l'Admin** (Interface d'édition avec onglets de langue).
- **3.3 : Optimisation SEO Bilingue** (Plugin SEO, balises `hreflang`, `meta` localisées).
- **3.4 : Création des Pages Statiques Bilingues** (Pages "À Propos" et "Contact").
- **3.5 : Finalisation et Audit pré-lancement** (Audit Lighthouse, favicon, finalisation de la configuration de production).
