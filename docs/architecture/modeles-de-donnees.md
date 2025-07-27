# Modèles de Données

## Authors (Collection `users` de Payload)

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

## Media (Collection `media`)

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

## Categories (Collection `categories`)

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

## Tags (Collection `tags`)

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

## Articles (Collection `posts`)

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

## Pages (Collection `pages`)

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
