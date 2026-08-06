# Implementation Plan - MikroORM Data Layer & Migration System

Integrate **MikroORM** as the official Data Access Layer (DAL) for the application, featuring built-in **Identity Map L1 caching**, **MongoDB driver (L2 database)** connection to Firestore/Mongo, and **MikroORM Migrations**:

1. **MikroORM Architecture & L1/L2 Caching**:
   - **Identity Map (L1 Cache)**: MikroORM's `UnitOfWork` and `Identity Map` keep active entity instances in memory for `<1ms` lookup speed.
   - **MongoDB Driver (L2 Storage)**: Uses `@mikro-orm/mongodb` connecting to `DB_URL` (Cloud Firestore MongoDB wire endpoint).
   - **MikroORM Migrations (`@mikro-orm/migrations`)**: Automated schema and index migration engine replacing custom migration runners.

2. **Entity Models (`src/entities/`)**:
   - `AuthorEntity.ts`: `@Entity()`, `@PrimaryKey()`, `@Property({ type: 'json' })` for integrations & contactMethods.
   - `PortfolioItemEntity.ts`: `@Entity()`, `@PrimaryKey()`, `@Property()`.
   - `TeamEntity.ts`: `@Entity()`, `@PrimaryKey()`, `@Property({ type: 'json' })` for members.
   - `ReferralTokenEntity.ts`: `@Entity()`, `@PrimaryKey()`, `@Property()`.
   - `PortfolioMemoryEntity.ts` & `ComparisonMatrixEntity.ts`: For agent 2-tier memory & cross-entity comparison matrix caching.

---

## 1. MikroORM Data Architecture

```mermaid
flowchart TD
    ExpressApp["Express API & Agent Engine"] -->|RequestContext.create| MikroORM["MikroORM Data Layer\n(mikro-orm.config.ts)"]
    
    MikroORM -->|L1 Cache Hit (<1ms)| IdentityMap["Identity Map / UnitOfWork\n(In-Memory Entity Registry)"]
    
    MikroORM -->|L2 Database Read/Write| MongoDriver["@mikro-orm/mongodb Driver"]
    
    MongoDriver -->|DB_URL Connection| CloudStore[("Cloud Firestore / Mongo Endpoint\n(authors, portfolio_items, teams, migrations)")]
    
    MikroORM -->|npm run db:migrate| MigratorEngine["MikroORM Migrator\n(src/migrations/*)"]
```

---

## Proposed Changes

### Dependencies & Configuration

#### [MODIFY] [package.json](file:///Users/ssemenov/Documents/antigravity/portfolist.node.srv/package.json)
- Add `@mikro-orm/core`, `@mikro-orm/mongodb`, `@mikro-orm/migrations`, `@mikro-orm/reflection`.
- Add scripts: `db:migrate`, `db:migrate:create`, `db:migrate:status`.

#### [NEW] [mikro-orm.config.ts](file:///Users/ssemenov/Documents/antigravity/portfolist.node.srv/mikro-orm.config.ts)
- MikroORM configuration file setting up `MongoDriver`, `clientUrl: process.env.DB_URL`, `dbName: 'portfolist'`, and migration path `src/migrations`.

---

### Entity Models

#### [NEW] [src/entities/AuthorEntity.ts](file:///Users/ssemenov/Documents/antigravity/portfolist.node.srv/src/entities/AuthorEntity.ts)
- MikroORM Entity definition for Author.

#### [NEW] [src/entities/PortfolioItemEntity.ts](file:///Users/ssemenov/Documents/antigravity/portfolist.node.srv/src/entities/PortfolioItemEntity.ts)
- MikroORM Entity definition for Portfolio Item.

#### [NEW] [src/entities/TeamEntity.ts](file:///Users/ssemenov/Documents/antigravity/portfolist.node.srv/src/entities/TeamEntity.ts)
- MikroORM Entity definition for Team.

#### [NEW] [src/entities/ReferralTokenEntity.ts](file:///Users/ssemenov/Documents/antigravity/portfolist.node.srv/src/entities/ReferralTokenEntity.ts)
- MikroORM Entity definition for Referral Token.

#### [NEW] [src/entities/PortfolioMemoryEntity.ts](file:///Users/ssemenov/Documents/antigravity/portfolist.node.srv/src/entities/PortfolioMemoryEntity.ts)
- MikroORM Entity definition for Agent Portfolio Memory.

#### [NEW] [src/entities/ComparisonMatrixEntity.ts](file:///Users/ssemenov/Documents/antigravity/portfolist.node.srv/src/entities/ComparisonMatrixEntity.ts)
- MikroORM Entity definition for Cross-Entity Comparison Matrix.

---

### Database Services & Migrations

#### [NEW] [src/services/mikroDb.ts](file:///Users/ssemenov/Documents/antigravity/portfolist.node.srv/src/services/mikroDb.ts)
- Initializes MikroORM ORM instance, exports `getOrm()`, `getForkedEm()`, and seed population wrapper.

#### [MODIFY] [src/db/migrate.ts](file:///Users/ssemenov/Documents/antigravity/portfolist.node.srv/src/db/migrate.ts)
- Refactors migration runner to delegate to `orm.getMigrator().up()` and `orm.getMigrator().getExecutedMigrations()`.

#### [NEW] [src/migrations/Migration20260806120000_InitialSchema.ts](file:///Users/ssemenov/Documents/antigravity/portfolist.node.srv/src/migrations/Migration20260806120000_InitialSchema.ts)
- Initial MikroORM migration class establishing collection indexes.

#### [MODIFY] [server.ts](file:///Users/ssemenov/Documents/antigravity/portfolist.node.srv/server.ts)
- Register `RequestContext.create(orm.em, ...)` middleware.
- Connect API routes to MikroORM Entity Manager repositories.

---

## Verification Plan

### Automated Verification
1. **MikroORM Migrations Test**:
   - Run `npm run db:migrate:status` -> Verify MikroORM migrator detects migration files.
   - Run `npm run db:migrate` -> Verify migration execution.
2. **Type Check & Build**:
   - Run `npx tsc --noEmit` and `npm run build`.
3. **Automated Unit Tests**:
   - Run `npm run test` -> Verify Agent Engine and Entity Memory test suites pass with MikroORM DAL.
