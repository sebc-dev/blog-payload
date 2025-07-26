# Code Style & Conventions

## Prettier Configuration

- Single quotes: `true`
- Trailing commas: `all`
- Print width: `100`
- Semicolons: `false`

## ESLint Rules

- Extends Next.js and TypeScript recommended configs
- TypeScript strict mode enabled
- Warnings for:
  - `@typescript-eslint/ban-ts-comment`
  - `@typescript-eslint/no-empty-object-type`
  - `@typescript-eslint/no-explicit-any`
  - `@typescript-eslint/no-unused-vars` (with ignore patterns for `_` prefix)

## TypeScript Configuration

- Strict mode enabled
- ESNext modules with bundler resolution
- Path aliases: `@/*` for `./src/*`, `@payload-config` for config
- Target: ES2022

## Naming Conventions

- Collections: PascalCase (Users, Media, Categories, Tags, Posts)
- Files: kebab-case for configs, PascalCase for components
- Routes: kebab-case with route groups `(payload)`, `(web)`

## Code Organization

- **Unified data access pattern**: Use local Payload API calls instead of HTTP
- **Server Components first**: Leverage React 19 Server Components for performance
- **Route groups**: Clear separation between admin and public routes
- **Type generation**: Auto-generated types from Payload collections
