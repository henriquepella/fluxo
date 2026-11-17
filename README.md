<div align="center">

# 💸 Fluxo

**Personal finance app — a study project where I practice production-grade habits (tests, CI, clean architecture).**

[![CI](https://github.com/henriquepella/fluxo/actions/workflows/ci.yml/badge.svg)](../../actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](#)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-FE5196?logo=conventionalcommits&logoColor=white)](https://www.conventionalcommits.org)

Track accounts, transactions, budgets and goals with a beautiful dashboard,
real-time updates and smart insights.

</div>

---

> 🚧 **Status: under active development.** Built module by module — see the
> [roadmap](#-roadmap). Screenshots and GIFs will be added as the UI lands.

## ✨ Highlights

- **Clean Architecture + DDD** — framework-free domain layer, use cases as
  first-class citizens, repository pattern with dependency inversion.
- **Type-safe end to end** — TypeScript `strict` everywhere, zero `any`,
  type-checked lint rules.
- **Production concerns from day one** — structured logging with request
  correlation, fail-fast environment validation, liveness/readiness probes,
  global exception filter that never leaks internals, security headers.
- **Quality gates** — CI runs formatting, lint, typecheck, unit tests, e2e
  tests and builds on every push; Husky + commitlint enforce Conventional
  Commits locally.

## 🧱 Tech Stack

| Layer        | Technologies                                                                            |
| ------------ | --------------------------------------------------------------------------------------- |
| **Frontend** | Next.js 16 · React 19 · TypeScript · TailwindCSS · shadcn/ui · TanStack Query · Zustand |
| **Backend**  | NestJS 11 · Prisma · PostgreSQL · Redis · Passport (JWT + OAuth) · Swagger              |
| **Infra**    | Docker · Docker Compose · GitHub Actions · Turborepo · pnpm workspaces                  |
| **Quality**  | ESLint (type-checked) · Prettier · Husky · lint-staged · commitlint · Jest · Supertest  |

## 🏛 Architecture

Monorepo with two applications:

```
fluxo/
├── apps/
│   ├── api/                  # NestJS — Clean Architecture
│   │   ├── src/
│   │   │   ├── domain/          # Entities, value objects, business rules
│   │   │   ├── application/     # Use cases + ports (repository interfaces)
│   │   │   ├── infrastructure/  # Prisma, config, logging (adapters)
│   │   │   ├── presentation/    # Controllers, filters, guards, pipes
│   │   │   └── shared/          # Cross-cutting primitives
│   │   └── prisma/              # Schema, migrations, seeds
│   └── web/                  # Next.js App Router
├── docker-compose.yml        # PostgreSQL + Redis (+ full stack via profile)
└── .github/workflows/        # CI pipeline
```

The dependency rule points inwards — `presentation → application → domain` —
and `infrastructure` implements the interfaces the inner layers define.
Domain exceptions are translated to HTTP responses at the boundary by a
global exception filter, so business rules stay framework-agnostic.

## 🚀 Getting Started

**Prerequisites:** Node.js ≥ 22, pnpm ≥ 11, Docker (for PostgreSQL/Redis).

```bash
# 1. Install dependencies
pnpm install

# 2. Environment
cp apps/api/.env.example apps/api/.env

# 3. Infrastructure (PostgreSQL + Redis)
docker compose up -d postgres redis

# 4. Run everything in dev mode
pnpm dev
```

| App            | URL                                        |
| -------------- | ------------------------------------------ |
| Web            | http://localhost:3000                      |
| API            | http://localhost:3001/api                  |
| Swagger        | http://localhost:3001/docs                 |
| Health (live)  | http://localhost:3001/api/health/liveness  |
| Health (ready) | http://localhost:3001/api/health/readiness |

### Full stack with Docker

```bash
docker compose --profile app up --build
```

### Useful scripts

```bash
pnpm dev          # all apps in watch mode (Turborepo)
pnpm build        # build all apps
pnpm lint         # lint all apps (zero warnings policy)
pnpm typecheck    # TypeScript across the monorepo
pnpm test         # unit tests
pnpm test:e2e     # end-to-end tests
pnpm format       # Prettier write
```

## 🔐 Environment Variables

See [`apps/api/.env.example`](apps/api/.env.example):

| Variable       | Description                  | Default                  |
| -------------- | ---------------------------- | ------------------------ |
| `NODE_ENV`     | Runtime environment          | `development`            |
| `PORT`         | API port                     | `3001`                   |
| `DATABASE_URL` | PostgreSQL connection string | matches docker-compose   |
| `REDIS_URL`    | Redis connection string      | `redis://localhost:6379` |
| `CORS_ORIGIN`  | Allowed frontend origin      | `http://localhost:3000`  |

Environment is validated at boot with `class-validator` — the API refuses to
start with an invalid configuration.

## 🗺 Roadmap

- [x] **Module 1 — Foundation**: monorepo, tooling, Clean Architecture
      scaffold, structured logging, health probes, Docker, CI
- [ ] **Module 2 — Database & domain**: Prisma schema (multi-tenant by
      design), migrations, seeds, core value objects (Money)
- [ ] **Module 3 — Authentication**: JWT + refresh rotation, Google/GitHub
      OAuth, e-mail confirmation, password recovery, session control
- [ ] **Module 4 — Core features**: accounts, categories, transactions
      (installments, recurrence), filters, pagination
- [ ] **Module 5 — Dashboard**: charts, cash flow, animated cards, real-time
      updates (WebSocket)
- [ ] **Module 6 — Budgets, goals & notifications**
- [ ] **Module 7 — Import/export** (CSV, Excel, PDF), global search
- [ ] **Module 8 — Extras**: audit log, PWA, command palette, smart insights,
      RBAC, invites, public API

## 🤝 Contributing

Commits follow [Conventional Commits](https://www.conventionalcommits.org)
(enforced by commitlint). Run `pnpm lint && pnpm test` before opening a PR.

## 📄 License

[MIT](LICENSE) © Henrique Pella
