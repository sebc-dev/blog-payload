# Stage 1: Dependency Installation
# Optimisation : Layer caching pour 'pnpm install' uniquement si lockfile change
FROM node:22-bookworm-slim AS deps
WORKDIR /app
# Sécurité : Mise à jour des packages système pour corriger les vulnérabilités
RUN apt-get update && apt-get upgrade -y && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 2: Application Builder
FROM node:22-bookworm-slim AS builder
WORKDIR /app
# Sécurité : Mise à jour des packages système pour corriger les vulnérabilités
RUN apt-get update && apt-get upgrade -y && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build

# Stage 3: Production Runner
# AMÉLIORATION : Ajout HEALTHCHECK pour monitoring container
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Sécurité : Mise à jour complète des packages système et installation de curl
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y curl && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean

# Copy uniquement les artefacts essentiels du stage 'builder'
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Sécurité : Utilisateur non-root
USER node
EXPOSE 3000

# NOUVEAU : Healthcheck pour orchestrateurs de containers
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl --fail http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
