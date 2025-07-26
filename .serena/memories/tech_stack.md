# Tech Stack

## Core Technologies

- **Next.js 15** with App Router and React 19 Server Components
- **Payload CMS 3.48** with PostgreSQL adapter
- **PostgreSQL** database via `@payloadcms/db-postgres`
- **TypeScript 5.7.3** with strict checking
- **ESM modules** (package.json has `"type": "module"`)

## Styling & UI

- **Tailwind CSS 4** (configuration in CSS files, not separate config)
- **Shadcn/UI components** with Radix UI primitives
- **Lucide React** for icons
- **PostCSS** for CSS processing

## Development Tools

- **pnpm** as package manager (versions 9-10)
- **ESLint** with Next.js and TypeScript rules
- **Prettier** for code formatting
- **Husky** for git hooks
- **lint-staged** for pre-commit formatting

## Testing

- **Vitest** for unit and integration tests
- **Playwright** for end-to-end tests
- **@testing-library/react** for component testing
- **jsdom** environment for browser simulation

## Database & Deployment

- **Docker** with docker-compose for development
- **PostgreSQL** with connection pooling
- **Sharp** for image optimization
