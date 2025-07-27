/c# Validate Tests

## Usage

/validate-tests [type] [filter]

**Parameters:**

- `type` (optional): Type de test (unit, integration, all) - défaut: all
- `filter` (optional): Pattern pour filtrer les tests par nom

## Context

- Test type: $type (defaults to "all")
- Filter pattern: $filter (optional)
- Script: scripts/validate-tests.sh
- AI mode: Enabled automatically for structured output

## Your Role

Execute le script de validation des tests `scripts/validate-tests.sh` avec les paramètres appropriés et analyse les résultats.

## Process

### 1. Exécuter le script

Lancer le script avec le mode IA activé:

```bash
./scripts/validate-tests.sh -a -t ${type:-all} ${filter:+-f "$filter"}
```

Le script effectue automatiquement:

- Détection du gestionnaire de paquets (pnpm/yarn/npm)
- Type checking TypeScript
- Linting du code
- Exécution des tests
- Analyse de couverture

### 2. Analyser les résultats

Si des tests échouent:

- Utiliser `scripts/parse-failures.jq` pour analyser le JSON de sortie
- Identifier les types d'erreurs (TypeScript, lint, tests)
- Fournir les messages d'erreur formatés

Si tout réussit:

- Afficher le résumé des commandes disponibles
- Montrer les statistiques de couverture

## Examples

```bash
# Tous les tests
/validate-tests

# Tests unitaires seulement
/validate-tests unit

# Tests d'intégration avec filtre
/validate-tests integration "auth"
```
