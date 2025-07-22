# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`blog-payload` is a bilingual (French/English) technical blog built with Next.js 15, Payload CMS 3.48, and PostgreSQL. The project serves as a practical demonstration of AI-assisted development, UX principles, and software engineering best practices, targeted at developers and tech professionals.

This is a unified full-stack application where Payload CMS is integrated natively into Next.js, following modern monorepo patterns rather than traditional headless CMS separation.

## Development Commands

### Essential Development Commands

- `pnpm dev` - Start development server (auto-restarts on changes)
- `pnpm devsafe` - Clean development start (removes .next cache first)
- `pnpm build` - Production build with optimized memory settings
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint checks
- `pnpm generate:types` - Generate TypeScript types from Payload collections
- `pnpm generate:importmap` - Generate import map for Payload admin

### Testing Commands

- `pnpm test` - Run all tests (integration + e2e)
- `pnpm test:int` - Run integration tests only (Vitest)
- `pnpm test:e2e` - Run end-to-end tests (Playwright)

**⚠️ Testing Important Notes**:

- Integration tests use simple data isolation with `createUniqueTestData()`
- **DO NOT** use transactional isolation (`useTestDatabase()`) - causes Payload timeouts
- See `docs/rapports/Tests-Integration-Isolation-Solution.md` for details
- Use template: `tests/templates/collection-test.template.ts.example` for new collection tests

### Database & Payload Commands

- `pnpm payload` - Access Payload CLI commands
- `docker-compose up` - Start PostgreSQL database for development

## Architecture & Key Concepts

### Unified Application Structure

This project uses a **unified monorepo approach** where Next.js and Payload CMS run as a single application:

- **Frontend**: Next.js 15 with App Router and React 19 Server Components
- **Backend**: Payload CMS 3.48 with PostgreSQL adapter
- **Styling**: Tailwind CSS (note: no tailwind.config.js - configuration is in CSS)
- **Database**: PostgreSQL via `@payloadcms/db-postgres`

### Route Groups Strategy

The `src/app` directory uses route groups for clear separation:

- `(payload)/` - Payload CMS admin interface and API routes
- `(web)/` - Public website pages and layouts
- `api/` - Global API routes (e.g., revalidation endpoints)

### Data Access Pattern

**Critical**: Use the unified data access pattern for optimal performance:

1. **Server Components** can access Payload data directly via local API calls
2. Create data access functions in `src/lib/payload-api.ts`
3. Use `payload.find()` and other local Payload methods instead of HTTP API calls
4. This eliminates network latency and provides full TypeScript safety

Example pattern:

```typescript
// src/lib/payload-api.ts
import { getPayload } from 'payload'
import config from '@payload-config'

export const getPublishedPosts = async () => {
  const payload = await getPayload({ config })
  return payload.find({
    collection: 'posts',
    where: { _status: { equals: 'published' } },
  })
}

// src/app/(web)/page.tsx
import { getPublishedPosts } from '@/lib/payload-api'

export default async function HomePage() {
  const posts = await getPublishedPosts()
  // ...
}
```

### Collections & Content Model

Current collections (in `src/collections/`):

- **Users**: Authentication-enabled collection for admin access
- **Media**: File uploads with alt text support
- **Categories**: Blog post categories with localized names, auto-generated slugs, and descriptions
- **Tags**: Content tags with localized names, auto-generated slugs, descriptions, and color styling

The project is designed to expand with additional collections for blog posts that will reference these categories and tags.

## Configuration Files

### Critical Configuration Patterns

1. **next.config.mjs**: Must use `.mjs` extension for ESM compatibility with Payload 3
2. **src/payload.config.ts**: Main Payload configuration - defines collections, database adapter, and plugins
3. **src/styles/globals.css**: Contains Tailwind configuration (no separate config file needed)
4. **tsconfig.json**: Includes essential path aliases, especially `@payload-config`

### Environment Variables

Required environment variables (see `.env.example`):

- `DATABASE_URI` - PostgreSQL connection string
- `PAYLOAD_SECRET` - Secret key for Payload encryption/auth
- `NEXT_PUBLIC_SERVER_URL` - Public URL for the application

## Development Workflow

### Starting Development

1. Ensure PostgreSQL is running (via Docker or local install)
2. Copy `.env.example` to `.env` and configure variables
3. Run `pnpm install` to install dependencies
4. Run `pnpm dev` to start development server
5. Access admin at `http://localhost:3000/admin`
6. Access public site at `http://localhost:3000`

### Making Changes

**For Payload Collections**:

- Modify files in `src/collections/`
- Run `pnpm generate:types` to update TypeScript types
- Types are automatically generated in `src/payload-types.ts`

**For Frontend Components**:

- Follow the component organization pattern in `src/components/`
- Use Server Components by default for better performance
- Access Payload data via `src/lib/payload-api.ts` functions

**For Styling**:

- Tailwind configuration goes in `src/styles/globals.css` using `@theme` blocks
- No separate `tailwind.config.js` file needed (Tailwind CSS 4 pattern)

### Testing Strategy

- **Integration tests**: Located in `tests/int/` using Vitest with jsdom
- **E2E tests**: Located in `tests/e2e/` using Playwright
- Tests automatically use the development server for E2E testing

## Important Technical Notes

### ESM Requirements

- Payload 3 requires ES modules - ensure `"type": "module"` in package.json
- Use `.mjs` extension for config files or ensure proper module setup

### TypeScript Integration

- Payload auto-generates types from collections
- Use the `@payload-config` alias for importing Payload configuration
- Maintain strict TypeScript checking for better code quality

### Performance Considerations

- Leverage Server Components for data fetching
- Use Payload's local API instead of HTTP calls for internal data access
- Implement proper caching strategies with Next.js revalidation

### Content Management

- Admin interface is available at `/admin` route
- Content creators use Payload's admin UI for all content management
- Real-time revalidation can be implemented via Payload hooks

This architecture enables a powerful, type-safe, and performant full-stack application that serves as both a content management system and a high-performance website.
