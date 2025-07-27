# Standards de Codage (Coding Standards)

Cette section définit un ensemble de règles et de conventions de codage **obligatoires**. Elles ont pour but d'assurer la maintenabilité, la lisibilité et la qualité du code sur le long terme. Ces standards seront appliqués rigoureusement, que le code soit écrit par un humain ou par un agent IA, et serviront de base pour la configuration de nos outils d'analyse de code.

## Principes Directeurs

Au-delà des règles spécifiques, le développement sur ce projet doit être guidé par la philosophie suivante :

- **DRY (Don't Repeat Yourself)** : Évitez la duplication de code. Toute logique métier ou composant réutilisable doit être abstrait dans des fonctions, des hooks ou des composants partagés.
- **KISS (Keep It Simple, Stupid)** : Privilégiez toujours la solution la plus simple qui répond au besoin. Évitez la sur-ingénierie et la complexité non nécessaire.
- **Esprit de "Object Calisthenics"** : Bien que l'ensemble des 9 règles de l'Object Calisthenics soit traditionnellement orienté objet, nous en adoptons l'esprit :
  - **Petites entités :** Les fonctions et les composants React doivent être courts et avoir une seule responsabilité. Si un composant dépasse une certaine taille ou gère trop d'états, il doit être décomposé.
  - **Pas d'indentation excessive :** Un niveau d'indentation élevé dans une fonction est souvent le signe d'une complexité cyclomatique trop grande. Le code doit être refactorisé en fonctions plus petites.

## Standards de Base

- **Analyse de Code (Linting) :** Nous utiliserons **ESLint** pour identifier les problèmes potentiels dans le code TypeScript et React.
- **Formatage du Code :** **Prettier** sera utilisé pour formater automatiquement le code de manière cohérente. Un "pre-commit hook" (via Husky) sera configuré pour formater le code avant chaque commit, garantissant que tout le code versionné respecte les mêmes règles.
- **Organisation des Tests :** Comme défini dans la stratégie de test, les fichiers de test seront colocalisés avec leurs fichiers sources correspondants (ex: `Button.test.tsx` à côté de `Button.tsx`).

## Conventions de Nommage

| Élément                       | Convention       | Exemple                  |
| :---------------------------- | :--------------- | :----------------------- |
| **Composants / Fichiers TSX** | `PascalCase.tsx` | `ArticleCard.tsx`        |
| **Fonctions / Variables**     | `camelCase`      | `fetchPublishedArticles` |
| **Types / Interfaces**        | `PascalCase`     | `interface Post`         |
| **Hooks React**               | `useCamelCase`   | `useArticleData`         |

## Règles Critiques

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
