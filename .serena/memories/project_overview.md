# Project Overview

**blog-payload** is a bilingual (French/English) technical blog built with Next.js 15, Payload CMS 3.48, and PostgreSQL.

## Purpose

- Technical blog positioned at the intersection of AI, UX, and software engineering best practices
- Serves as a "living demonstration" of these principles
- Target audience: professional developers, software engineers, and tech leaders

## Architecture

- **Unified monorepo approach**: Payload CMS integrated natively into Next.js (not traditional headless CMS)
- **Route groups**: `(payload)/` for admin, `(web)/` for public site, `api/` for global routes
- **Performance**: Uses Server Components and local Payload API calls instead of HTTP requests

## Collections

- Users: Authentication-enabled collection for admin access
- Media: File uploads with alt text support
- Categories: Blog post categories with localized names and auto-generated slugs
- Tags: Content tags with localized names, descriptions, and color styling
- Posts: Main blog content collection

## Key Features

- Bilingual support (French/English) with localization fallback
- Auto-generated TypeScript types from Payload collections
- PostgreSQL database with optimized connection pools for testing
