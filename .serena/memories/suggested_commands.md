# Essential Development Commands

## Development

- `pnpm dev` - Start development server (auto-restarts on changes)
- `pnpm devsafe` - Clean development start (removes .next cache first)
- `pnpm build` - Production build with optimized memory settings
- `pnpm start` - Start production server

## Code Quality

- `pnpm lint` - Run ESLint checks
- `pnpm type-check` - Run TypeScript type checking
- `pnpm format` - Check code formatting with Prettier
- `pnpm format:fix` - Fix code formatting with Prettier

## Testing

- `pnpm test` - Run all tests (unit + integration)
- `pnpm test:unit` - Run unit tests only (Vitest)
- `pnpm test:int` - Run integration tests only (Vitest)
- `pnpm test:e2e` - Run end-to-end tests (Playwright)
- `pnpm test:coverage` - Run tests with coverage reports
- `pnpm test:setup` - Start test database (Docker)
- `pnpm test:teardown` - Stop test database

## Payload CMS

- `pnpm generate:types` - Generate TypeScript types from Payload collections
- `pnpm generate:importmap` - Generate import map for Payload admin
- `pnpm payload` - Access Payload CLI commands

## Database

- `docker-compose up` - Start PostgreSQL database for development

## Git/System Commands (Linux)

- `git status` - Check git status
- `git add .` - Stage all changes
- `git commit -m "message"` - Commit changes
- `ls -la` - List files with details
- `find . -name "pattern"` - Find files by pattern
- `grep -r "pattern" .` - Search text in files
