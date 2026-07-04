# syntax=docker/dockerfile:1

FROM node:24-alpine AS base
RUN apk add --no-cache openssl && npm install -g pnpm@11
WORKDIR /app

# ── Build ────────────────────────────────────────────────────────────────────
FROM base AS build
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile --filter @fluxo/api
COPY apps/api apps/api
RUN pnpm --filter @fluxo/api build \
  && pnpm --filter @fluxo/api deploy --legacy --prod /prod/api
# Regenerate the Prisma client inside the isolated production bundle.
WORKDIR /prod/api
RUN ./node_modules/.bin/prisma generate

# ── Runtime ──────────────────────────────────────────────────────────────────
FROM node:24-alpine AS runner
RUN apk add --no-cache openssl
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 api
COPY --from=build --chown=api:nodejs /prod/api ./
USER api
EXPOSE 3001
CMD ["node", "dist/main"]
