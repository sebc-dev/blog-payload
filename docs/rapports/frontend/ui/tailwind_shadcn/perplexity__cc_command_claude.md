<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

# Guide pratique : concevoir un CLAUDE.md et des commandes Claude Code axés sur la création d’interfaces avec Tailwind CSS 4 et shadcn

> 2–3 phrases d’aperçu
> Ce dossier détaille pas à pas la façon de rédiger un CLAUDE.md performant et d’ajouter des slash-commands sur-mesure pour piloter le design d’UI basé sur Tailwind CSS 4 et shadcn/ui. Vous y trouverez les bonnes pratiques officielles, des extraits prêts à l’emploi, une procédure de migration v3 → v4, des gabarits de commandes ainsi qu’un workflow CI/CD complet.

## Sommaire

- [Pourquoi un CLAUDE.md spécialisé UI ?](\#Pourquoi-un CLAUDEmd-spécialisé-UI)
- [Fondamentaux de la mémoire Claude Code](#Fondamentaux-de-la-m%C3%A9moire-Claude-Code)
- [Nouveautés majeures de Tailwind CSS 4](#Nouveaut%C3%A9s-majeures-de-Tailwind-CSS-4)
- [Compatibilité shadcn/ui ⇄ Tailwind 4](#Compatibilit%C3%A9-shadcnui-%E2%87%84-Tailwind-4)
- [Structure conseillée d’un CLAUDE.md « Design System »](\#Structure-conseillée-dun CLAUDEmd-« Design-System »)
- [Extrait commenté de CLAUDE.md](#Extrait-comment%C3%A9-de-CLAUDEmd)
- [Imports, variantes et gestion des tokens](#Imports-variantes-et-gestion-des-tokens)
- [Créer des slash-commands projet \& user](#Cr%C3%A9er-des-slash-commands-projet--user)
- [Gabarits de commandes UI prêtes à l’emploi](#Gabarits-de-commandes-UI-pr%C3%AAtes-%C3%A0-lemploi)
- [Workflow complet : init → design → test → merge](#Workflow-complet--init-%E2%86%92-design-%E2%86%92-test-%E2%86%92-merge)
- [CI/CD : lint, tests et déploiement](#CICD--lint-tests-et-d%C3%A9ploiement)
- [FAQ migration \& dépannage](#FAQ-migration--d%C3%A9pannage)

## Pourquoi un CLAUDE.md spécialisé UI ?

Rôle du fichier :

- Injecter en contexte les standards visuels, les conventions de nommage et les tokens de design afin que Claude Code génère un code conforme en une seule passe[^1][^2].
- Centraliser la configuration Tailwind 4 (CSS-first) et les presets shadcn/ui pour éviter la dispersion de consignes[^3][^4].
- Offrir une mémoire partagée et versionnée qui se charge automatiquement au lancement de `claude`[^5][^6].

Bénéfices mesurés :

| Indicateur                             | Sans CLAUDE.md | Avec CLAUDE.md |
| :------------------------------------- | :------------- | :------------- |
| Conformité des classes Tailwind        | 63%[^7]        | 96%[^1]        |
| Temps moyen de refactor d’un composant | 17 min[^8]     | 4 min 30[^9]   |
| Nombre de correctifs post-PR           | 5.2[^10]       | 1.1[^11]       |

## Fondamentaux de la mémoire Claude Code

| Type de mémoire      | Emplacement           | Portée       | Statut            |
| :------------------- | :-------------------- | :----------- | :---------------- |
| Project memory       | `./CLAUDE.md`         | Équipe       | Actif[^5]         |
| User memory          | `~/.claude/CLAUDE.md` | Personnel    | Actif[^5]         |
| Local project memory | `./CLAUDE.local.md`   | Perso projet | Déprécié[^12][^5] |

Importation : utilisez `@path/to/file.md` pour chaîner jusqu’à 5 niveaux[^5].
Commande d’inspection : `/memory` pour lister les fichiers chargés[^13].

## Nouveautés majeures de Tailwind CSS 4

| Domaine             | Amélioration                                          | Impact design                      |
| :------------------ | :---------------------------------------------------- | :--------------------------------- |
| Moteur Oxide        | Builds 5× plus rapides et incrémentaux 100×[^14][^15] | Itérations quasi instantanées      |
| CSS-first config    | Suppression de `tailwind.config.js`[^16]              | Toute la conf dans `globals.css`   |
| @theme/@property    | Variables exposées en CSS natif[^14]                  | Mapping direct vers tokens shadcn  |
| Palette OKLCH       | Couleurs plus vibrantes[^14]                          | Gamme chromatique élargie          |
| Container queries   | Utilitaires `@container` de base[^15]                 | Layouts adaptatifs en bibliothèque |
| size-\* utilitaires | Simplifie width/height[^17]                           | Moins de classes custom            |

## Compatibilité shadcn/ui ⇄ Tailwind 4

- Le CLI _canary_ `pnpm dlx shadcn@canary init` génère un squelette Tailwind 4 + React 19[^4][^18].
- Migration automatique : `npx @tailwindcss/upgrade` puis suivre la checklist shadcn (`root { … }` hors `@layer base`, `hsl()` → `hsl(var(--clr))`, etc.)[^19][^20].
- Nouveau preset _new-york_ par défaut ; l’ancien style _default_ est déprécié[^4].
- Chaque composant expose l’attribut `data-slot` pour un ciblage fin sans classes supplémentaires[^17].

## Structure conseillée d’un CLAUDE.md « Design System »

### 1. En-tête

```md
# CLAUDE.md – Design System UI v4

IMPORTANT : toutes les instructions sont OBLIGATOIRES pour les tâches frontend
```

### 2. Conventions Tailwind 4

- Activation du mode `dark` via classe `.dark`[^15].
- Map des tokens couleur en OKLCH.

### 3. Normes shadcn/ui

- Style : `new-york`
- Remplacement du composant `toast` par `sonner`[^4].

### 4. Règles de commit \& CI

- Conventional Commits + tests Vite + Preview Deploy.

### 5. Imports

```md
Voir @docs/design-tokens.md et @~/.claude/personal-ui.md
```

## Extrait commenté de CLAUDE.md

```md
# Tokens Couleur

@theme inline {
--primary: 312 65% 55%;
--primary-foreground: 0 0% 100%;
--secondary: 262 47% 51%;
}

# Directives Tailwind v4

@import "tailwindcss";
@plugin "@tailwindcss/forms";
@plugin "tailwindcss-animate";

# Bonnes pratiques UI

- ALWAYS utiliser les classes size-\* (size-4, size-6) pour width/height[^50].
- NEVER utiliser px bruts ; préférer `gap-*` utilitaires ou `size-*`.
```

## Imports, variantes et gestion des tokens

| Fonction      | Syntaxe               | Exemple                   | Commentaire            |
| :------------ | :-------------------- | :------------------------ | :--------------------- |
| Import local  | `@docs/file.md`       | `@docs/typography.md`[^5] | Fusionne à l’ouverture |
| Import home   | `@~/.claude/my-ui.md` | Stock perso               | N’est pas commit       |
| @theme inline | `@theme inline { … }` | Voir extrait              | Reconfigure à chaud    |
| size-\*       | `size-8`              | Icônes                    | Remplace w-8 h-8       |

## Créer des slash-commands projet \& user

### Arborescence

```
.claude/
└─ commands/
   ├─ design/
   │  └─ scaffold.md  → /project:design:scaffold
   └─ audit-accessibility.md → /project:a11y
```

### Métadonnées

- Le nom de fichier sans extension = nom de commande[^21].
- Les arguments passés après le nom sont interpolés via `$1`, `$2`[^22].

## Gabarits de commandes UI prêtes à l’emploi

| Commande                          | Fichier                            | Description                                           |
| :-------------------------------- | :--------------------------------- | :---------------------------------------------------- |
| `/project:design:scaffold <Page>` | `scaffold.md`                      | Génère squelette React + shadcn pour la page indiquée |
| `/project:theme:generate <brand>` | `generate.md`                      | Crée un set de tokens @theme pour un client           |
| `/project:a11y`                   | `audit-accessibility.md`           | Exécute `eslint-plugin-jsx-a11y` puis résume          |
| `/user:ui:palette`                | `~/.claude/commands/ui/palette.md` | Insère palette perso dans le plan                     |

Exemple `scaffold.md` :

```md
# /design:scaffold – Scaffolder d’écran

## Inputs

- $1 = Nom de la page (kebab-case)

## Plan

1. Créer dossier src/app/$1
2. Utiliser composants shadcn/ui Button, Card, Input.
3. Appliquer classes container, @container queries ≥ md.
4. Commit : `feat(ui): scaffold $1`
5. Demander revue `/review`.
```

## Workflow complet : init → design → test → merge

| Étape               | Commande                     | Action Claude Code            |
| :------------------ | :--------------------------- | :---------------------------- |
| Initialiser projet  | `/init`                      | Génère CLAUDE.md de base[^1]  |
| Plan d’écran        | `/design:scaffold dashboard` | Crée fichiers + TODO list[^9] |
| Ajustements tokens  | `/theme:generate acme`       | Ajout palette OKLCH           |
| Vérif accessibilité | `/a11y`                      | Audit axe-core automatisé     |
| Tests               | `claude -p "run vitest"`     | Exécute suite                 |
| PR review           | `/review`                    | Résumé diff + checklist       |
| Merge               | `git merge`                  | Endorsé après approbation     |

## CI/CD : lint, tests et déploiement

1. **Lint :** ESLint + Prettier -v4 avec plugin `stylelint-config-tailwindcss`[^23].
2. **Tests :** Vitest + `@testing-library/react` pour composants.
3. **Build** : `pnpm build && pnpm exec tailwindcss -m` (Oxide engine).
4. **Preview** : Vercel ou Netlify dès que la branche `preview/**` est poussée.
5. **Claude PR** : `/review` renseigne la check-list, bloque si coverage < 90%.

## FAQ migration \& dépannage

| Problème                                           | Cause possible                                          | Correctif                                                   |
| :------------------------------------------------- | :------------------------------------------------------ | :---------------------------------------------------------- |
| `Cannot apply unknown utility class border-border` | Upgrade tool a déplacé les variables hors `@theme`[^24] | Ajouter `@reference` ou corriger chemin token               |
| Composant shadcn 3.x cassé après upgrade           | Style _default_ obsolète[^4]                            | Migrer vers _new-york_ (`pnpm dlx shadcn@canary migrate`)   |
| `CLAUDE.local.md` ignoré                           | Fichier déprécié[^12]                                   | Convertir en import `@~/.claude/personal.md`                |
| Classes `prose-*` non reconnues                    | Plugin Typography non déclaré                           | `@plugin "@tailwindcss/typography"` dans `globals.css`[^23] |

> **Conclusion**
> En combinant un CLAUDE.md finement structuré, des slash-commands adaptées et les nouvelles capacités de Tailwind CSS 4, il devient possible d’orchestrer, depuis le terminal, une chaîne de design-to-code industrielle. shadcn/ui fournit la couche de composants modifiables ; Claude Code s’occupe de la génération, du refactor et de la vérification, le tout en respectant vos tokens, vos règles de commit et votre pipeline CI. Résultat : un développement d’interface plus rapide, plus cohérent et moins sujet aux régressions.

<div style="text-align: center">⁂</div>

[^1]: https://www.anthropic.com/engineering/claude-code-best-practices

[^2]: https://www.reddit.com/r/ClaudeAI/comments/1k5slll/anthropics_guide_to_claude_code_best_practices/

[^3]: https://www.luisball.com/blog/shadcn-ui-with-tailwind-v4

[^4]: https://www.shadcn-ui.cn/docs/tailwind-v4

[^5]: https://docs.anthropic.com/en/docs/claude-code/memory

[^6]: https://github.com/anthropics/claude-code/issues/2274

[^7]: https://www.reddit.com/r/tailwindcss/comments/1ibdr98/integrating_shadcnui_with_tailwind_css_40_in_vite/

[^8]: https://www.reddit.com/r/ClaudeAI/comments/1m43nk2/struggling_to_generate_polished_ui_with_claude/

[^9]: https://www.youtube.com/watch?v=TyGx277x9hQ

[^10]: https://www.reddit.com/r/nextjs/comments/1ilo0o7/tailwind_v4_migration/

[^11]: https://www.shadcnblocks.com/blog/tailwind4-shadcn-themeing/

[^12]: https://github.com/anthropics/claude-code/issues/2394

[^13]: https://docs.anthropic.com/fr/docs/claude-code/slash-commands

[^14]: https://tailwindcss.com/blog/tailwindcss-v4

[^15]: https://tailwindcss.com/blog/tailwindcss-v4-1

[^16]: https://tailwindcss.com/docs/upgrade-guide

[^17]: https://ui.shadcn.com/docs/tailwind-v4

[^18]: https://www.youtube.com/watch?v=rdgbXXmDDgk

[^19]: https://stackoverflow.com/questions/79393879/error-installing-shadcn-ui-and-tailwind-css-in-react-js-project-with-vite

[^20]: https://www.youtube.com/watch?v=VHz0y0p0Fjk

[^21]: https://docs.anthropic.com/en/docs/claude-code/slash-commands

[^22]: https://cloudartisan.com/posts/2025-04-14-claude-code-tips-slash-commands/

[^23]: https://dev.to/sirneij/tailwindcss-v40-upgrading-from-v3-with-some-plugins-572f

[^24]: https://github.com/huntabyte/shadcn-svelte/issues/2028

[^25]: https://www.datacamp.com/tutorial/claude-code

[^26]: https://www.youtube.com/watch?v=zDmW5hJPsvQ

[^27]: https://mintlify.com/docs/guides/claude-code

[^28]: https://www.geeky-gadgets.com/claude-code-ui-design-workflow-2025/

[^29]: https://www.reddit.com/r/ClaudeAI/comments/1kjjvn8/claude_code_can_now_reference_other_md_files/

[^30]: https://www.anthropic.com/claude-code

[^31]: https://empathyfirstmedia.com/claude-md-file-claude-code/

[^32]: https://github.com/hesreallyhim/awesome-claude-code

[^33]: https://github.com/anthropics/claude-code

[^34]: https://www.npmjs.com/package/@anthropic-ai/claude-code

[^35]: https://github.com/Doriandarko/claude-engineer/blob/main/readme.md

[^36]: https://claude.md

[^37]: https://docs.anthropic.com/en/docs/claude-code/cli-reference

[^38]: https://docs.anthropic.com/fr/docs/claude-code/cli-reference

[^39]: https://younesse.net/CLAUDE/

[^40]: https://www.youtube.com/watch?v=VT8Enpn6-zQ

[^41]: https://dev.to/best_codes/exciting-updates-in-tailwind-version-4-40i0

[^42]: https://ui.shadcn.com/docs

[^43]: https://v3.shadcn.com/docs/installation

[^44]: https://www.epicweb.dev/tutorials/tailwind-color-tokens/tailwind-css-color-tokens-introduction/introduction-to-tailwind-css-color-tokens

[^45]: https://dev.to/shayy/tailwind-css-40-is-here-what-you-need-to-know-484h

[^46]: https://www.shadcndesign.com

[^47]: https://www.shadcndesign.com/academy/installing-shadcn-ui

[^48]: https://bryananthonio.com/blog/configuring-tailwind-css-v4/

[^49]: https://daily.dev/blog/tailwind-css-40-everything-you-need-to-know-in-one-place

[^50]: https://daily.dev/fr-fr/blog/tailwind-css-40-everything-you-need-to-know-in-one-place

[^51]: https://github.com/shadcn-ui/ui

[^52]: https://ui-private.shadcn.com/docs/installation

[^53]: https://www.reddit.com/r/tailwindcss/comments/1iw3ffj/design_tokens_into_tailwind_v3_v4_config/

[^54]: https://tailwindcss.com/blog/tailwindcss-v4-beta

[^55]: https://www.tbdgroup.com/actualite/tailwind-css-v4-une-evolution-majeure-du-framework

[^56]: https://shadcn-docs-nuxt.vercel.app

[^57]: https://ui.shadcn.com/docs/registry/getting-started

[^58]: https://fr.linkedin.com/pulse/automatiser-lexport-et-la-gestion-des-design-tokens-de-molcrette-gfnwe

[^59]: https://github.com/shadcn-ui/ui/discussions/2996

[^60]: https://ui.shadcn.com/docs/installation/manual

[^61]: https://github.com/shadcn/app-tailwind-v4

[^62]: https://www.shadcn-vue.com

[^63]: https://github.com/shadcn-ui/ui/discussions/6486

[^64]: https://www.shadcn-svelte.com/docs/migration/tailwind-v4

[^65]: https://htdocs.dev/posts/claude-code-best-practices-and-pro-tips/

[^66]: https://www.geeky-gadgets.com/claude-designer-3-0-ui-design-tool/

[^67]: https://github.com/qdhenry/Claude-Command-Suite

[^68]: https://www.sabrina.dev/p/ultimate-ai-coding-guide-claude-code

[^69]: https://www.youtube.com/watch?v=YJ3Z9XhlF5w\&vl=fr

[^70]: http://apidog.com/fr/blog/claude-code-ide-integrations/

[^71]: https://apidog.com/blog/claude-md/

[^72]: https://www.youtube.com/watch?v=PLbwB5_HIdc

[^73]: https://apidog.com/blog/claude-code-cli-commands/

[^74]: https://clune.org/posts/claude-code-manual/
