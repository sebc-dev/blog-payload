# CLAUDE.md

This file provides core context for Claude Code when working with blog-payload.

## Project Overview

`blog-payload` is a bilingual (French/English) technical blog built with Next.js 15.3.3, Payload CMS 3.48.0, and PostgreSQL. Unified full-stack application where Payload CMS is integrated natively into Next.js.

## Critical Architecture Patterns

### Unified Application Structure

- **Frontend**: Next.js 15.3.3 with App Router and React 19.1.0 Server Components
- **Backend**: Payload CMS 3.48.0 with PostgreSQL adapter
- **Database**: PostgreSQL via `@payloadcms/db-postgres`
- **TypeScript**: 5.7.3 with strict checking
- **Package Manager**: pnpm 10.13.1

### Route Groups

- `(payload)/` - Payload CMS admin and API routes
- `(web)/` - Public website pages
- `api/` - Global API routes

### Data Access Pattern

**CRITICAL**: Use local Payload API calls in Server Components, NOT HTTP calls.
Create data access functions in `src/lib/payload-api.ts` using `payload.find()`.

### Key Technical Constraints

- Payload 3 requires ES modules (.mjs configs or "type": "module")
- Integration tests MUST use simple data isolation, NOT transactional
- Tailwind CSS 4 configuration goes in `src/styles/globals.css`

## Active Workflows

@.claude/workflows/dev-workflow.md
@.claude/workflows/testing-strategy.md

## Available Commands

Run `/commands` to see all available custom commands.

## Available Agents

Run `/agents` to see specialized agents for this project.
