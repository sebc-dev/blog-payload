# Project Structure

## Root Directory

- `src/` - Main source code
- `tests/` - Test files (unit, integration, e2e, templates)
- `docs/` - Documentation and reports
- `public/` - Static assets
- `docker/` - Docker configuration files
- Configuration files: `next.config.mjs`, `tsconfig.json`, `eslint.config.mjs`, etc.

## Source Code Structure (`src/`)

### `src/app/` - Next.js App Router

- `(payload)/` - Payload CMS admin interface routes
- `(web)/` - Public website pages and layouts
- `api/` - Global API routes (e.g., revalidation endpoints)

### `src/collections/` - Payload Collections

- `Users.ts` - Admin user authentication
- `Media.ts` - File uploads with alt text
- `Categories.ts` - Blog categories with localization
- `Tags.ts` - Content tags with styling
- `Posts.ts` - Main blog content

### Other Key Directories

- `src/lib/` - Utility functions and Payload API helpers
- `src/components/` - Reusable React components
- `src/migrations/` - Database migrations
- `src/payload-types.ts` - Auto-generated TypeScript types

## Test Structure (`tests/`)

- `tests/unit/` - Unit tests with Vitest
- `tests/int/` - Integration tests with Payload
- `tests/e2e/` - End-to-end tests with Playwright
- `tests/helpers/` - Test utilities and helpers
- `tests/templates/` - Template files for new tests

## Configuration Files

- `payload.config.ts` - Main Payload configuration
- `next.config.mjs` - Next.js configuration (ESM)
- `vitest.*.config.ts` - Multiple Vitest configurations for different test types
- `playwright.config.ts` - Playwright E2E test configuration
