# Application Layer

Use cases that orchestrate the domain: each use case is a single class with
one `execute` method, depending only on domain entities and **repository
interfaces** (ports). Infrastructure provides the implementations (adapters),
wired via NestJS dependency injection.

Populated from the first feature module onwards (auth, accounts,
transactions…).
