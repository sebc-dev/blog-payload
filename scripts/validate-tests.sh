#!/bin/bash
# Validation TDD pour blog-payload
# Projet Next.js + Payload CMS avec Vitest et Playwright

echo "🧪 Validating TDD cycle for blog-payload..."

# Configuration spécifique au projet blog-payload
PROJECT_NAME="blog-payload"
TEST_CMD="pnpm test"
UNIT_TEST_CMD="pnpm run test:unit"
INT_TEST_CMD="pnpm run test:int"
COVERAGE_CMD="pnpm run test:coverage"
TYPE_CHECK_CMD="pnpm run type-check"
LINT_CMD="pnpm run lint"

echo "🔧 Blog-payload test suite configuration:"
echo "  📦 Package manager: pnpm"
echo "  🧪 Test framework: Vitest"
echo "  🎭 E2E framework: Playwright"
echo "  📊 Coverage: @vitest/coverage-v8"

# Validation étape par étape
echo ""
echo "🔍 Step 1: Type checking..."
if eval "$TYPE_CHECK_CMD" 2>/dev/null; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ TypeScript errors detected"
    echo "🔄 Please fix type errors before continuing"
    echo "Run: $TYPE_CHECK_CMD"
    exit 1
fi

echo ""
echo "🔍 Step 2: Linting..."
if eval "$LINT_CMD" 2>/dev/null; then
    echo "✅ Code linting passed"
else
    echo "❌ Linting errors detected"
    echo "🔄 Please fix linting errors before continuing"
    echo "Run: $LINT_CMD"
    exit 1
fi

echo ""
echo "🔍 Step 3: Unit tests..."
if eval "$UNIT_TEST_CMD" 2>/dev/null; then
    echo "✅ Unit tests passing"
else
    echo "❌ Unit tests failing"
    echo "🔄 Please fix failing unit tests"
    echo "Run: $UNIT_TEST_CMD"
    exit 1
fi

echo ""
echo "🔍 Step 4: Integration tests..."
if eval "$INT_TEST_CMD" 2>/dev/null; then
    echo "✅ Integration tests passing"
else
    echo "❌ Integration tests failing"
    echo "🔄 Please fix failing integration tests"
    echo "Run: $INT_TEST_CMD"
    exit 1
fi

echo ""
echo "🔍 Step 5: Coverage analysis..."
if eval "$COVERAGE_CMD" 2>/dev/null; then
    echo "✅ Coverage analysis complete"
else
    echo "⚠️  Coverage analysis failed (non-blocking)"
fi

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

exit 0