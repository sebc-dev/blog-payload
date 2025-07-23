# Production Dockerfile avec distroless pour éliminer les vulnérabilités système
# Utilise une approche multi-stage pour optimiser la taille et la sécurité

# Stage 1: Dependency Installation
FROM node:22-bookworm-slim AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 2: Application Builder  
FROM node:22-bookworm-slim AS builder
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build

# Stage 3: Distroless Runtime (élimine les vulnérabilités système)
FROM gcr.io/distroless/nodejs22-debian12:nonroot AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy uniquement les artefacts essentiels
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["server.js"]

# Note: Utilisez l'endpoint /health exposé par l'application pour les healthchecks
# Note: Déjà non-root par défaut avec distroless