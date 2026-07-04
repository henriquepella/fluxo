# @fluxo/api

NestJS backend for Fluxo, structured with **Clean Architecture**:

```
src/
├── domain/          # Entities, value objects, business rules (framework-free)
├── application/     # Use cases + repository interfaces (ports)
├── infrastructure/  # Adapters: Prisma, config, logging, external services
│   ├── config/      # Environment validation (fail-fast at boot)
│   ├── database/    # PrismaService / PrismaModule
│   └── logger/      # Structured logging (pino) with request-id correlation
├── presentation/    # HTTP layer: controllers, filters, guards, interceptors
│   ├── filters/     # GlobalExceptionFilter (domain → HTTP translation)
│   └── health/      # Liveness/readiness probes (Terminus)
├── shared/          # Cross-cutting primitives (DomainException…)
├── app.module.ts
├── app.setup.ts     # HTTP pipeline shared by main.ts and e2e tests
├── app.swagger.ts
└── main.ts
```

The dependency rule points inwards: `presentation → application → domain`,
and `infrastructure` implements interfaces defined by the inner layers.

## Running

```bash
pnpm dev          # watch mode (http://localhost:3001/docs for Swagger)
pnpm test         # unit tests
pnpm test:e2e     # e2e tests (supertest)
pnpm lint         # eslint (type-checked rules, zero warnings)
```

Copy `.env.example` to `.env` first. See the root README for the full setup.
