# Stratégie de Test

Notre approche des tests visera à garantir la qualité à plusieurs niveaux, de la plus petite unité de code aux parcours utilisateurs complets. Nous utiliserons une combinaison d'outils modernes pour couvrir l'ensemble du spectre.

- **Tests Unitaires & d'Intégration :** Nous utiliserons **Vitest**, comme convenu, pour sa rapidité et son intégration parfaite avec l'écosystème TypeScript/Next.js.
- **Tests End-to-End (E2E) :** Pour simuler et valider les parcours utilisateurs complets dans un vrai navigateur, nous utiliserons **Playwright**. C'est un outil moderne et puissant qui complètera Vitest.

## Pyramide des Tests

Notre stratégie suivra le modèle de la pyramide des tests pour un retour sur investissement optimal : une large base de tests rapides et peu coûteux, et un sommet étroit de tests plus lents et complets.

```text
      / \
     / ▲ \    <-- Tests End-to-End (Peu nombreux, lents, valident les flux critiques) - Playwright
    /_____\
   / ▲ ▲ ▲ \  <-- Tests d'Intégration (Interactions entre composants/services) - Vitest
  /_________\
 / ▲ ▲ ▲ ▲ ▲ \ <-- Tests Unitaires (Nombreux, rapides, isolent chaque fonction/composant) - Vitest
/_____________\
```

## Organisation des Tests

Pour une meilleure maintenabilité, les tests seront **colocalisés** avec le code source qu'ils valident.

- **Tests Unitaires & d'Intégration (Vitest) :** Un fichier de test sera placé à côté du fichier qu'il teste. Par exemple, `src/components/ui/Button.tsx` aura son fichier de test `src/components/ui/Button.test.tsx`.
- **Tests End-to-End (Playwright) :** Les tests E2E seront placés dans un dossier dédié à la racine du projet, par exemple `e2e/`. Chaque fichier de test correspondra à un parcours utilisateur critique (ex: `e2e/publishing.spec.ts`).

## Exemples de Tests Conceptuels

### Test Unitaire de Composant Frontend (Vitest)

```typescript
// Fichier : src/components/ArticleCard.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ArticleCard from './ArticleCard';

describe('ArticleCard', () => {
  it('devrait afficher le titre et l\'extrait de l\'article', () => {
    const mockArticle = { title: 'Mon Titre', excerpt: 'Mon extrait...' };
    render(<ArticleCard article={mockArticle} />);

    expect(screen.getByRole('heading', { name: /mon titre/i })).toBeInTheDocument();
    expect(screen.getByText(/mon extrait.../i)).toBeInTheDocument();
  });
});
```

### Test d'un Hook Backend (Vitest)

```typescript
// Fichier : src/collections/Articles.hooks.test.ts
import { describe, it, expect } from 'vitest'
import { generateSlug } from './Articles.hooks'

describe('Article Hooks', () => {
  it("devrait générer un slug correct à partir d'un titre", () => {
    const title = 'Mon Super Article !'
    const slug = generateSlug({ data: { title } })
    expect(slug).toBe('mon-super-article')
  })
})
```

### Test End-to-End (Playwright)

```typescript
// Fichier : e2e/reading.spec.ts
import { test, expect } from '@playwright/test'

test("le visiteur peut lire un article depuis la page d'accueil", async ({ page }) => {
  await page.goto('/')

  // Cliquer sur le premier lien d'article
  await page.locator('a.article-link').first().click()

  // Vérifier que le titre de l'article est présent dans la nouvelle page
  await expect(page.locator('h1.article-title')).toBeVisible()
  await expect(page).not.toHaveURL('/')
})
```

Bien, nous enchaînons avec les aspects critiques de la sécurité et de la performance.

---
