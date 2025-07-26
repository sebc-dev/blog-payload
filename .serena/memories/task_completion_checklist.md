# Task Completion Checklist

## Before Committing Changes

### Code Quality Checks

1. **Type checking**: `pnpm type-check` - Ensure no TypeScript errors
2. **Linting**: `pnpm lint` - Fix any ESLint warnings/errors
3. **Formatting**: `pnpm format` or `pnpm format:fix` - Ensure consistent code style

### Testing

1. **Unit tests**: `pnpm test:unit` - Verify unit tests pass
2. **Integration tests**: `pnpm test:int` - Verify integration tests pass
3. **Build test**: `pnpm build` - Ensure production build succeeds

### Payload-Specific Tasks

1. **Type generation**: `pnpm generate:types` - Update TypeScript types if collections changed
2. **Import map**: `pnpm generate:importmap` - Update import map if admin changes made

### Development Best Practices

- Use Server Components by default for better performance
- Access Payload data via local API calls (not HTTP requests)
- Follow the unified data access pattern in `src/lib/payload-api.ts`
- Maintain bilingual support (French/English) where applicable

### Critical Notes

- **NEVER commit** unless explicitly asked by the user
- **Testing isolation**: Use `createUniqueTestData()` for integration tests, NOT transactional isolation
- **Memory limits**: Production builds use `--max-old-space-size=8000` for optimization
