#!/bin/bash
set -eo pipefail

# Validation TDD optimisée pour blog-payload
# Projet Next.js + Payload CMS avec Vitest et Playwright
# Basé sur les recommandations d'optimisation pour l'IA

echo "🧪 Validating TDD cycle for blog-payload..."

# --- Configuration et Valeurs par Défaut ---
PROJECT_NAME="blog-payload"
TEST_TYPE="all"
TEST_FILTER=""
FOR_AI=false
REPORTER_CMD=""
OUTPUT_CMD=""
VITEST_ARGS=()
JSON_OUTPUT_FILE="test-results.json"

# Commands basées sur le gestionnaire de paquets détecté
TEST_CMD=""
UNIT_TEST_CMD=""
INT_TEST_CMD=""
COVERAGE_CMD=""
TYPE_CHECK_CMD=""
LINT_CMD=""

# --- Vérification des Dépendances ---
if ! command -v jq &> /dev/null; then
  echo "❌ Erreur : 'jq' n'est pas installé. C'est requis pour l'analyse des logs." >&2
  echo "   Installez-le avec: sudo apt install jq (Ubuntu/Debian) ou brew install jq (macOS)" >&2
  exit 1
fi

# --- Détection et Configuration du Gestionnaire de Paquets ---
PACKAGE_MANAGER=""
CMD_PREFIX=""
ARGS_SEPARATOR=""

if [ -f "pnpm-lock.yaml" ]; then
  PACKAGE_MANAGER="pnpm"
  if ! command -v pnpm &> /dev/null; then
    echo "❌ Erreur : 'pnpm' détecté (pnpm-lock.yaml) mais non installé." >&2
    exit 1
  fi
  CMD_PREFIX="pnpm"
  ARGS_SEPARATOR="--"
  TEST_CMD="pnpm test"
  UNIT_TEST_CMD="pnpm run test:unit"
  INT_TEST_CMD="pnpm run test:int"
  COVERAGE_CMD="pnpm run test:coverage"
  TYPE_CHECK_CMD="pnpm run type-check"
  LINT_CMD="pnpm run lint"
elif [ -f "yarn.lock" ]; then
  PACKAGE_MANAGER="yarn"
  if ! command -v yarn &> /dev/null; then
    echo "❌ Erreur : 'yarn' détecté (yarn.lock) mais non installé." >&2
    exit 1
  fi
  CMD_PREFIX="yarn"
  ARGS_SEPARATOR=""
  TEST_CMD="yarn test"
  UNIT_TEST_CMD="yarn test:unit"
  INT_TEST_CMD="yarn test:int"
  COVERAGE_CMD="yarn test:coverage"
  TYPE_CHECK_CMD="yarn type-check"
  LINT_CMD="yarn lint"
else
  PACKAGE_MANAGER="npm"
  if ! command -v npm &> /dev/null; then
    echo "❌ Erreur : 'npm' non installé." >&2
    exit 1
  fi
  CMD_PREFIX="npm run"
  ARGS_SEPARATOR="--"
  TEST_CMD="npm run test"
  UNIT_TEST_CMD="npm run test:unit"
  INT_TEST_CMD="npm run test:int"
  COVERAGE_CMD="npm run test:coverage"
  TYPE_CHECK_CMD="npm run type-check"
  LINT_CMD="npm run lint"
fi

echo "🔧 Blog-payload test suite configuration:"
echo "  📦 Package manager: $PACKAGE_MANAGER"
echo "  🧪 Test framework: Vitest"
echo "  🎭 E2E framework: Playwright"
echo "  📊 Coverage: @vitest/coverage-v8"

# --- Fonction d'Aide ---
usage() {
  echo "Usage: $0 [-t <unit|integration|all>] [-f <pattern>] [-a] [-h]"
  echo "  -t: Type de test à lancer (défaut: all)"
  echo "  -f: Filtre sur le nom du test (pattern regex)"
  echo "  -a: Activer le mode IA (sortie JSON concise pour analyse)"
  echo "  -h: Afficher cette aide"
  exit 1
}

# --- Analyse des Arguments avec getopts ---
while getopts ":t:f:ah" opt; do
  case ${opt} in
    t) TEST_TYPE=$OPTARG ;;
    f) TEST_FILTER=$OPTARG ;;
    a) FOR_AI=true ;;
    h) usage ;;
    \?) echo "Option invalide: -$OPTARG" >&2; usage ;;
    :) echo "L'option -$OPTARG requiert un argument." >&2; usage ;;
  esac
done
shift $((OPTIND -1))

# --- Configuration des Arguments Vitest ---
if [ "$FOR_AI" = true ]; then
  REPORTER_CMD="--reporter=json"
  OUTPUT_CMD="--outputFile=$JSON_OUTPUT_FILE"
fi

if [ -n "$TEST_FILTER" ]; then
  VITEST_ARGS+=("--testNamePattern" "$TEST_FILTER")
fi

# Configuration du parallélisme et des globs de fichiers selon le type de test
if [ "$TEST_TYPE" = "integration" ]; then
  VITEST_ARGS+=("--no-file-parallelism")
  TEST_FILES_GLOB="**/*.integration.test.ts"
elif [ "$TEST_TYPE" = "unit" ]; then
  TEST_FILES_GLOB="**/*.unit.test.ts"
else
  TEST_FILES_GLOB="**/*.test.ts"
fi

# --- Fonctions d'Exécution ---
run_step() {
  local step_name="$1"
  local command="$2"
  local success_msg="$3"
  local error_msg="$4"
  
  echo ""
  echo "🔍 $step_name..."
  if eval "$command" 2>/dev/null; then
    echo "✅ $success_msg"
    return 0
  else
    echo "❌ $error_msg"
    echo "🔄 Run: $command"
    return 1
  fi
}

run_tests_with_reporting() {
  local test_cmd="$1"
  local test_name="$2"
  
  echo ""
  echo "🔍 Running $test_name..."
  
  # Construction de la commande finale avec gestion des arguments
  local full_cmd=""
  if [ "$TEST_TYPE" = "unit" ]; then
    full_cmd="$UNIT_TEST_CMD"
  elif [ "$TEST_TYPE" = "integration" ]; then
    full_cmd="$INT_TEST_CMD"
  else
    full_cmd="$TEST_CMD"
  fi
  
  # Ajout des arguments Vitest si en mode AI
  if [ "$FOR_AI" = true ]; then
    if [ "$PACKAGE_MANAGER" = "yarn" ]; then
      full_cmd="$full_cmd $REPORTER_CMD $OUTPUT_CMD ${VITEST_ARGS[*]}"
    else
      full_cmd="$full_cmd $ARGS_SEPARATOR $REPORTER_CMD $OUTPUT_CMD ${VITEST_ARGS[*]}"
    fi
  else
    if [ "$PACKAGE_MANAGER" = "yarn" ]; then
      full_cmd="$full_cmd ${VITEST_ARGS[*]}"
    else
      full_cmd="$full_cmd $ARGS_SEPARATOR ${VITEST_ARGS[*]}"
    fi
  fi
  
  # Exécution avec capture du code de sortie
  local output
  output=$(eval "$full_cmd" 2>&1)
  local exit_code=$?
  
  echo "$output"
  return $exit_code
}

# --- Validation étape par étape ---
echo ""
echo "🚀 Starting TDD validation cycle..."

# Étape 1: Type checking
if ! run_step "Step 1: Type checking" "$TYPE_CHECK_CMD" "TypeScript compilation successful" "TypeScript errors detected"; then
  exit 1
fi

# Étape
# 2: Linting
if ! run_step "Step 2: Linting" "$LINT_CMD" "Code linting passed" "Linting errors detected"; then
  exit 1
fi

# Étape 3: Tests
case "$TEST_TYPE" in
  "unit")
    if ! run_tests_with_reporting "$UNIT_TEST_CMD" "unit tests"; then
      exit_code=$?
      if [ "$FOR_AI" = true ] && [ -f "$JSON_OUTPUT_FILE" ]; then
        echo "-------------------------------------------"
        echo "Des tests unitaires ont échoué. Code de sortie: $exit_code"
        echo "-------------------------------------------"
        echo "Génération du rapport d'erreurs pour l'IA..."
        # Utilisation du filtre jq pour générer un rapport concis
        if [ -f "scripts/parse-failures.jq" ]; then
          jq -r -f scripts/parse-failures.jq "$JSON_OUTPUT_FILE"
        else
          echo "⚠️  Filtre jq non trouvé (scripts/parse-failures.jq), affichage du JSON brut:"
          jq '.testResults[] | select(.status == "failed") | .assertionResults[] | select(.status == "failed")' "$JSON_OUTPUT_FILE"
        fi
        rm "$JSON_OUTPUT_FILE"
      fi
      exit $exit_code
    fi
    ;;
  "integration")
    if ! run_tests_with_reporting "$INT_TEST_CMD" "integration tests"; then
      exit_code=$?
      if [ "$FOR_AI" = true ] && [ -f "$JSON_OUTPUT_FILE" ]; then
        echo "-------------------------------------------"
        echo "Des tests d'intégration ont échoué. Code de sortie: $exit_code"
        echo "-------------------------------------------"
        echo "Génération du rapport d'erreurs pour l'IA..."
        # Utilisation du filtre jq pour générer un rapport concis
        if [ -f "scripts/parse-failures.jq" ]; then
          jq -r -f scripts/parse-failures.jq "$JSON_OUTPUT_FILE"
        else
          echo "⚠️  Filtre jq non trouvé (scripts/parse-failures.jq), affichage du JSON brut:"
          jq '.testResults[] | select(.status == "failed") | .assertionResults[] | select(.status == "failed")' "$JSON_OUTPUT_FILE"
        fi
        rm "$JSON_OUTPUT_FILE"
      fi
      exit $exit_code
    fi
    ;;
  *)
    # Tests unitaires d'abord
    if ! run_tests_with_reporting "$UNIT_TEST_CMD" "unit tests"; then
      exit_code=$?
      if [ "$FOR_AI" = true ] && [ -f "$JSON_OUTPUT_FILE" ]; then
        echo "-------------------------------------------"
        echo "Des tests unitaires ont échoué. Code de sortie: $exit_code"
        echo "-------------------------------------------"
        echo "Génération du rapport d'erreurs pour l'IA..."
        # Utilisation du filtre jq pour générer un rapport concis
        if [ -f "scripts/parse-failures.jq" ]; then
          jq -r -f scripts/parse-failures.jq "$JSON_OUTPUT_FILE"
        else
          echo "⚠️  Filtre jq non trouvé (scripts/parse-failures.jq), affichage du JSON brut:"
          jq '.testResults[] | select(.status == "failed") | .assertionResults[] | select(.status == "failed")' "$JSON_OUTPUT_FILE"
        fi
        rm "$JSON_OUTPUT_FILE"
      fi
      exit $exit_code
    fi
    
    # Puis tests d'intégration
    if ! run_tests_with_reporting "$INT_TEST_CMD" "integration tests"; then
      exit_code=$?
      if [ "$FOR_AI" = true ] && [ -f "$JSON_OUTPUT_FILE" ]; then
        echo "-------------------------------------------"
        echo "Des tests d'intégration ont échoué. Code de sortie: $exit_code"
        echo "-------------------------------------------"
        echo "Génération du rapport d'erreurs pour l'IA..."
        # Utilisation du filtre jq pour générer un rapport concis
        if [ -f "scripts/parse-failures.jq" ]; then
          jq -r -f scripts/parse-failures.jq "$JSON_OUTPUT_FILE"
        else
          echo "⚠️  Filtre jq non trouvé (scripts/parse-failures.jq), affichage du JSON brut:"
          jq '.testResults[] | select(.status == "failed") | .assertionResults[] | select(.status == "failed")' "$JSON_OUTPUT_FILE"
        fi
        rm "$JSON_OUTPUT_FILE"
      fi
      exit $exit_code
    fi
    ;;
esac

# Étape 4: Coverage (optionnel, non-bloquant)
echo ""
echo "🔍 Step 4: Coverage analysis..."
if eval "$COVERAGE_CMD" 2>/dev/null; then
  echo "✅ Coverage analysis complete"
else
  echo "⚠️  Coverage analysis failed (non-blocking)"
fi

# --- Succès ---
echo ""
echo "🎉 TDD cycle validation complete!"
echo "✅ All tests passing - ready for deployment"
echo ""
echo "Available commands:"
echo "  Unit tests: $UNIT_TEST_CMD"
echo "  Integration tests: $INT_TEST_CMD"
echo "  Full test suite: $TEST_CMD"
echo "  Coverage: $COVERAGE_CMD"
echo "  Type check: $TYPE_CHECK_CMD"
echo "  Lint: $LINT_CMD"

# Nettoyage des fichiers temporaires
if [ "$FOR_AI" = true ] && [ -f "$JSON_OUTPUT_FILE" ]; then
  rm "$JSON_OUTPUT_FILE"
fi

exit 0