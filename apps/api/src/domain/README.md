# Domain Layer

The heart of the system: entities, value objects, domain events and business
rules. This layer has **zero dependencies** on NestJS, Prisma or any other
framework — it is pure TypeScript and can be tested in isolation.

Populated from the database/domain module onwards (Workspace, Account,
Transaction, Category, Budget, Goal…).
