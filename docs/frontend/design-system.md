Voici le document mis à jour sans les citations :

# Lignes Directrices du Design System shadcn/ui avec Tailwind v4

Ce document définit les principes de conception et les directives de mise en œuvre pour les applications utilisant shadcn/ui avec Tailwind v4. Ces directives garantissent la cohérence, l'accessibilité et les meilleures pratiques tout au long du processus de développement de l'interface utilisateur.

## Principes de Conception Fondamentaux

### 1\. Système de Typographie : 4 Tailles, 2 Graisses

- **4 Tailles de Police Uniquement**:
  - Taille 1 : Titres principaux
  - Taille 2 : Sous-titres/Contenu important
  - Taille 3 : Texte principal (corps)
  - Taille 4 : Petit texte/étiquettes
- **2 Graisses de Police Uniquement**:
  - Semibold : Pour les titres et l'emphase
  - Regular : Pour le corps du texte et le contenu général
- **Hiérarchie Cohérente**: Maintenir une hiérarchie visuelle claire avec des options limitées.

### 2\. Grille de 8pt

- **Toutes les valeurs d'espacement doivent être divisibles par 8 ou 4**.
- **Exemples**:
  - Au lieu de 25px de padding → Utiliser 24px (divisible par 8).
  - Au lieu de 11px de marge → Utiliser 12px (divisible par 4).
- **Rythme Cohérent**: Crée une harmonie visuelle dans toute l'interface.

### 3\. Règle de Couleur 60/30/10

- **60%** : Couleur neutre (blanc/gris clair).
- **30%** : Couleur complémentaire (gris foncé/noir).
- **10%** : Couleur principale de la marque/d'accentuation (ex: rouge, bleu).
- **Équilibre des Couleurs**: Prévient le stress visuel tout en maintenant la hiérarchie.

### 4\. Structure Visuelle Épurée

- **Groupement Logique**: Les éléments liés doivent être visuellement connectés.
- **Espacement Délibéré**: L'espacement entre les éléments doit suivre le système de grille.
- **Alignement**: Les éléments doivent être correctement alignés dans leurs conteneurs.
- **La Simplicité Avant l'Éclat**: Se concentrer d'abord sur la clarté et la fonction.

## Fondations

### Intégration de Tailwind v4 : Une Révolution "CSS-First"

- **Philosophie "CSS-First"** : Le passage à Tailwind v4 est une refonte stratégique. L'abandon de `tailwind.config.js` au profit d'une configuration native au CSS via la directive `@theme` est un changement architectural majeur et philosophique.
- **Source de Vérité Unique** : Cette approche centralise toutes les préoccupations stylistiques et les "design tokens" (couleurs, espacements, etc.) dans le fichier CSS principal, qui devient une source de vérité unique et cohérente pour le système. Le fichier CSS n'est plus un simple fichier statique mais un document de configuration "vivant", contenant à la fois la _définition_ des tokens et l'_application_ des styles.
- **Performances et Simplicité** : Le nouveau moteur de compilation "Oxide" offre des builds complets jusqu'à 5 fois plus rapides et des builds incrémentiels plus de 100 fois plus rapides. L'élimination du fichier de configuration JS simplifie la structure du projet et améliore l'expérience développeur.
- **Pile Technique Moderne** : Le framework exploite des fonctionnalités CSS de pointe comme les "cascade layers", `@property` et `color-mix()`.

### Nouvelle Structure CSS et Système de Tokens avec `@theme`

- **Définition des Tokens** : La directive `@theme` est le centre névralgique pour architecturer le système de tokens. Les tokens sont définis en utilisant des espaces de noms (ex: `--color-*`, `--font-*`, `--space-*`) qui les lient à des utilitaires spécifiques.

- **Configuration Recommandée pour shadcn/ui** :
  1.  **Définir les variables de base** : Les valeurs de couleur HSL de shadcn/ui DOIVENT être encapsulées dans la fonction `hsl()` dans les sélecteurs `:root` et `.dark` (ex: `--background: hsl(0 0% 100%);`). C'est une étape cruciale pour assurer la compatibilité avec les outils de développement des navigateurs et les sélecteurs de couleurs des éditeurs.
  2.  **Mapper avec `@theme inline`** : Utilisez `@theme inline` pour mapper les variables de base aux variables de thème de Tailwind (ex: `--color-background: var(--background);`). Cela rend les variables plus accessibles et simplifie leur utilisation.

  <!-- end list -->

  ```css
  /* globals.css */
  @import 'tailwindcss';
  @import 'tw-animate-css'; /* Remplacement de tailwindcss-animate */

  :root {
    --background: hsl(0 0% 100%);
    --foreground: hsl(0 0% 3.9%);
    --radius: 0.5rem;
    /* ... autres variables HSL ... */
  }

  .dark {
    --background: hsl(0 0% 3.9%);
    --foreground: hsl(0 0% 98%);
    /* ... autres variables HSL pour le mode sombre ... */
  }

  @theme inline {
    /* Mappage des couleurs */
    --color-background: var(--background);
    --color-foreground: var(--foreground);

    /* Mappage des rayons de bordure */
    --radius-lg: var(--radius);
    --radius-md: calc(var(--radius) - 2px);
    --radius-sm: calc(var(--radius) - 4px);

    /* Mappage des animations */
    --animate-accordion-down: accordion-down 0.2s ease-out;
    --animate-accordion-up: accordion-up 0.2s ease-out;

    @keyframes accordion-down {
      from {
        height: 0;
      }
      to {
        height: var(--radix-accordion-content-height);
      }
    }
    @keyframes accordion-up {
      from {
        height: var(--radix-accordion-content-height);
      }
      to {
        height: 0;
      }
    }
  }
  ```

- **Guide de Migration v3 vers v4** : Le tableau suivant sert de "couche de traduction" pour migrer de l'ancienne configuration JS à la nouvelle syntaxe de variables CSS.

| Clé de Configuration v3 (objet `theme`) | Espace de Noms `@theme` v4 | Exemple d'Implémentation v4 dans `globals.css`                                                       |
| :-------------------------------------- | :------------------------- | :--------------------------------------------------------------------------------------------------- |
| `theme.colors`                          | `--color-*`                | `@theme { --color-brand-500: oklch(0.6 0.2 260); }`                                                  |
| `theme.spacing`                         | `--space-*`                | `@theme { --space-128: 32rem; }`                                                                     |
| `theme.fontFamily`                      | `--font-*`                 | `@theme { --font-display: "Satoshi", sans-serif; }`                                                  |
| `theme.fontSize`                        | `--font-size-*`            | `@theme { --font-size-7xl: '5rem'; }`                                                                |
| `theme.borderRadius`                    | `--radius-*`               | `@theme { --radius-2xl: 1.5rem; }`                                                                   |
| `theme.boxShadow`                       | `--shadow-*`               | `@theme { --shadow-inner: inset 0 2px 4px 0 oklch(0% 0 0 / 0.05); }`                                 |
| `theme.screens`                         | `--breakpoint-*`           | `@theme { --breakpoint-2xl: 1536px; }`                                                               |
| `theme.animation`                       | `--animate-*`              | `@theme { --animate-spin: spin 1s linear infinite; }`                                                |
| `theme.keyframes`                       | `@keyframes`               | `@theme { @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } }` |

## Architecture et Personnalisation des Composants

### Philosophie de shadcn/ui : La Propriété du Code

- **Pas une bibliothèque de composants** : shadcn/ui rompt avec les bibliothèques traditionnelles (comme Material UI) en ne s'installant pas comme un paquet npm opaque. Au lieu de cela, il fournit le code source brut et non compilé de chaque composant directement dans votre projet via une CLI.
- **Contrôle Total et Personnalisation** : Cette approche "Open Code" vous donne un contrôle absolu pour modifier n'importe quel aspect d'un composant, une exigence essentielle pour un design system sur mesure.
- **Le Compromis Architectural** : Cette philosophie est la cause de son plus grand défi : la gestion des mises à jour. En devenant propriétaire du code, l'équipe devient également responsable de sa maintenance. C'est un compromis délibéré : une personnalisation infinie en échange de la charge de la maintenance.

### Cadre Décisionnel pour la Personnalisation

La question de savoir s'il faut **modifier directement** les fichiers des composants ou créer des **composants d'encapsulation (wrappers)** est cruciale. Le tableau suivant fournit un cadre heuristique pour guider ce choix.

| Scénario / Objectif                                     | Approche Recommandée     | Justification                                                                                                          | Impact sur la Maintenance à Long Terme                                                                                        |
| :------------------------------------------------------ | :----------------------- | :--------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| Changer les styles par défaut (couleurs, padding)       | **Modification Directe** | Rapide, simple et aligné avec la philosophie de `cva`. Les changements sont contenus dans la définition des variantes. | **Moyen** : Nécessite une fusion manuelle lors des mises à jour.                                                              |
| Ajouter une nouvelle variante stylistique simple        | **Modification Directe** | Cohérent avec le modèle de `cva`. La variante s'intègre naturellement à l'API existante.                               | **Moyen** : Similaire au changement des styles, la mise à jour nécessite une attention manuelle.                              |
| Ajouter une nouvelle fonctionnalité ou un état complexe | **Composant Wrapper**    | Sépare la nouvelle logique de la logique de base, préservant l'intégrité de l'original.                                | **Faible** : Le composant de base peut être mis à jour sans conflit. Seule l'API du wrapper doit être ajustée si nécessaire.  |
| Intégrer une logique tierce (ex: `react-hook-form`)     | **Composant Wrapper**    | Évite de polluer le composant de présentation pur. Maintient une séparation claire des préoccupations.                 | **Faible** : L'isolation protège contre les conflits de mise à jour.                                                          |
| Modifier radicalement la structure HTML (DOM)           | **Modification Directe** | Créer un wrapper pour des changements structurels profonds serait plus complexe que de modifier directement le JSX.    | **Élevé** : Les mises à jour seront très difficiles. À n'envisager que si le composant est considéré comme "forké".           |
| Assurer une mise à jour facile et sans friction         | **Composant Wrapper**    | Priorise la maintenabilité en isolant les personnalisations. C'est la stratégie la plus sûre.                          | **Très Faible** : Le processus de mise à jour est simplifié car les modifications sont contenues dans des fichiers distincts. |

## Installation, Mise à Niveau et Maintenance

### Parcours d'Intégration

- **Pour les nouveaux projets** : L'initialisation doit se faire avec la version "canary" de la CLI pour une compatibilité maximale : `npx shadcn@canary init`.
- **Pour la mise à niveau d'un projet existant** : La transition de Tailwind v3/React 18 vers Tailwind v4/React 19 n'est pas une simple mise à jour, mais un **projet de refactoring en plusieurs étapes**. Cela nécessite un temps de développement significatif et ne doit pas être confié à un développeur junior. Les étapes clés sont :
  1.  **Exécuter le codemod de Tailwind** : `npx @tailwindcss/upgrade@next`.
  2.  **Migration manuelle des variables CSS** : Appliquer la structure `hsl()` et `@theme inline` comme décrit ci-dessus.
  3.  **Mise à jour des dépendances clés** : Mettre à jour `@radix-ui/*`, `tailwind-merge`, `clsx`, etc..
  4.  **Refactoring de `forwardRef`** : Supprimer `React.forwardRef` de chaque composant pour la compatibilité avec React 19 et ajouter l'attribut `data-slot`.
  5.  **Migration des animations** : Remplacer le plugin `tailwindcss-animate` par une importation de `tw-animate-css`.

### Stratégie de Mise à Jour des Composants

La CLI de shadcn/ui ne disposant pas d'un outil de fusion intelligent, la stratégie de mise à jour officielle doit être un **flux de travail basé sur Git**.
Le flux de travail recommandé est le suivant :

1.  **Isoler** : Traiter le répertoire `components/ui` comme un dossier "fournisseur".
2.  **Créer une branche** : Avant toute mise à jour, créer une branche dédiée (ex: `feat/update-shadcn-components`).
3.  **Mettre à jour** : Sur cette branche, écraser les composants avec leurs dernières versions via la CLI et commiter ces changements "purs".
4.  **Comparer et Fusionner (Diff & Merge)** : Utiliser les outils de comparaison de Git pour visualiser les différences et fusionner manuellement les correctifs en amont dans vos composants personnalisés sur la branche principale.

## Fonctionnalités Avancées et Stylisation Adaptative

### Nouveaux Utilitaires de la v4.1

Tailwind v4.1 transforme le framework d'un outil purement structurel à une plateforme de création graphique.

- **`text-shadow-*`** : Applique des ombres portées au texte, avec personnalisation de la couleur (ex: `text-shadow-sky-300`).
- **`mask-*`** : Utilise des dégradés ou des images pour masquer des parties d'un élément, idéal pour des effets créatifs.
- **`drop-shadow-*` colorées** : Permet de créer des lueurs vibrantes autour des icônes en utilisant les couleurs du thème.
- **`overflow-wrap-*`** : Offre un contrôle précis sur le retour à la ligne du texte pour éviter de casser la mise en page.

### Variantes pour Composants Adaptatifs

Les nouvelles variantes permettent de passer d'un design _responsive_ à un design _proactivement adaptatif_, qui répond à l'environnement et aux capacités de l'utilisateur.

- **`pointer-*` et `any-pointer-*`** : Ciblent le type de dispositif de pointage (`pointer:fine` pour la souris, `pointer:coarse` pour le tactile). C'est une approche supérieure à la détection via la taille de l'écran pour ajuster la taille des zones de clic.
- **`details-content`** : Cible le contenu d'un élément `<details>` ouvert, parfait pour les accordéons.
- **`inverted-colors`** : Cible les modes à contraste élevé du système d'exploitation pour une meilleure accessibilité.
- **`not-*`** : Variante logique pour styliser un élément quand il ne correspond _pas_ à une autre condition (ex: `not-hover:opacity-50`).

## Règles Codifiées du Design System et Checklist

Cette section est l'aboutissement du rapport et fournit un ensemble de règles validées et exploitables.

### Règles de Configuration et de Structuration

- [ ] **Source de Vérité** : La source de vérité unique pour tous les design tokens est le bloc `@theme` dans `src/app/globals.css`. Le fichier `tailwind.config.js` est obsolète et **NE DOIT PAS** être utilisé.
- [ ] **Définition des Tokens de Couleur** : Tous les tokens de couleur **DOIVENT** être définis dans `:root` et `.dark` en utilisant la fonction `hsl()`. Ils **DOIVENT** ensuite être mappés à l'espace de noms `--color-*` dans un bloc `@theme inline`.
- [ ] **Gestion des Dépendances** : Toutes les dépendances de la pile UI (Tailwind, shadcn, Radix, React) **DOIVENT** être figées à des versions spécifiques et validées dans `package.json`. L'utilisation des préfixes `^` ou `~` est **DÉCONSEILLÉE** pour ces paquets, car l'écosystème est encore en phase de stabilisation.

### Règles de Personnalisation et de Maintenance

- [ ] **Personnalisation des Composants** : Pour les changements purement stylistiques, la modification directe de la définition `cva` est **AUTORISÉE**. Pour l'ajout de nouvelles fonctionnalités, d'états complexes ou l'intégration de logique tierce, la création d'un composant **wrapper est REQUISE**.
- [ ] **Mises à Jour des Composants** : Toutes les mises à jour des composants shadcn/ui **DOIVENT** suivre le flux de travail basé sur Git prescrit (créer une branche, mettre à jour, comparer, fusionner). Les mises à jour directes sur la branche principale sont **INTERDITES**.

### Règles de Conception et d'Accessibilité

- [ ] **Utilisation des Nouveautés** : Les nouveaux composants **DEVRAIENT** exploiter les fonctionnalités de Tailwind v4.1 comme `text-shadow` et `overflow-wrap` lorsque cela est pertinent.
- [ ] **Stylisation Adaptative** : Les composants **DOIVENT** être testés pour les variantes `pointer:fine` (souris) et `pointer:coarse` (tactile) pour garantir une expérience utilisateur optimale sur tous les appareils.
- [ ] **Accessibilité** : Les composants **DOIVENT** être conçus pour être accessibles, en utilisant les attributs ARIA appropriés, et en testant la navigation au clavier. Les variantes comme `inverted-colors` doivent être prises en charge lorsque cela est pertinent.
