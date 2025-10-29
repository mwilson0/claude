# Data Model: Product Roadmap Creation Tool

**Date**: 2025-10-28
**Branch**: 001-product-roadmap-tool
**Purpose**: Define database schema, entities, relationships, and validation rules

---

## Overview

This document defines the data model for the Product Roadmap Creation Tool, extracted from the feature specification requirements. The model supports multi-user access, role-based permissions, write-locking for collaborative editing, and metadata linking for future dashboard integration.

---

## Entity-Relationship Diagram

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│    User     │────────<│  Permission  │>────────│   Roadmap   │
└─────────────┘         └──────────────┘         └─────────────┘
                                                         │
                                                         │ 1:N
                                                         │
┌─────────────┐                                   ┌─────────────┐
│  WriteLock  │────────────────────────────────────│   Product   │
└─────────────┘         1:1 (nullable)             └─────────────┘
       │                                                   │
       │ N:1                                               │ 1:N
       │                                                   │
┌─────────────┐                                   ┌──────────────────┐
│    User     │                                   │  DashboardLink   │
└─────────────┘                                   └──────────────────┘
                                                          │ N:1
                                                          │
                                                   ┌─────────────┐
                                                   │   Product   │
                                                   └─────────────┘

┌─────────────┐
│    Phase    │─────────────────>│ Roadmap │
└─────────────┘        N:1       └─────────────┘
```

---

## Entities

### 1. User

Represents an authenticated user with access to roadmaps.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| `name` | VARCHAR(255) | NOT NULL | User display name |
| `passwordHash` | VARCHAR(255) | NOT NULL | Hashed password (bcrypt) |
| `role` | ENUM | NOT NULL, DEFAULT 'viewer' | Global user role |
| `createdAt` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Account creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Enums**:
- `role`: `'viewer' | 'editor' | 'admin'`

**Indexes**:
- Primary: `id`
- Unique: `email`

**Validation Rules**:
- `email` must be valid email format
- `passwordHash` minimum length 8 characters (before hashing)
- `name` minimum length 2 characters

**Notes**:
- In development, users stored in mock database
- In production, may be synced from external auth system
- Global `role` can be overridden by per-roadmap `Permission` entries

---

### 2. Roadmap

Represents an independent roadmap instance with configuration.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `name` | VARCHAR(255) | NOT NULL | Roadmap display name |
| `description` | TEXT | NULLABLE | Optional description |
| `xAxisMode` | ENUM | NOT NULL, DEFAULT 'time' | X-axis display mode |
| `yAxisType` | ENUM | NOT NULL, DEFAULT 'category' | Y-axis grouping type |
| `yAxisValues` | JSONB | NOT NULL, DEFAULT '[]' | Array of Y-axis category/investment/type values |
| `ownerId` | UUID | FOREIGN KEY → User.id, NOT NULL | Roadmap creator/owner |
| `createdAt` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Enums**:
- `xAxisMode`: `'time' | 'phase'`
- `yAxisType`: `'category' | 'investment' | 'productType'`

**JSONB Structure** (`yAxisValues`):
```typescript
type YAxisValues = string[];  // e.g., ["Hardware", "Software", "Services"]
```

**Indexes**:
- Primary: `id`
- Foreign key: `ownerId` → `User.id`
- Index on `ownerId` for querying user's roadmaps

**Validation Rules**:
- `name` minimum length 3 characters, maximum 255
- `yAxisValues` must be non-empty array (at least 1 value)
- `yAxisValues` maximum 15 values (per spec assumptions)
- Each value in `yAxisValues` must be unique within array

**Cascade Behavior**:
- On delete `ownerId` (User): SET NULL or RESTRICT (discuss with team)
- On delete Roadmap: CASCADE to Products, Permissions, WriteLocks

---

### 3. Product

Represents a physical product displayed on the roadmap.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `codename` | VARCHAR(100) | NOT NULL | Short product identifier |
| `partNumber` | VARCHAR(100) | UNIQUE, NOT NULL | Unique part number |
| `description` | TEXT | NOT NULL | Product description |
| `sampleDate` | DATE | NOT NULL | When samples are available |
| `releaseDate` | DATE | NOT NULL | When product launches |
| `roadmapId` | UUID | FOREIGN KEY → Roadmap.id, NOT NULL | Parent roadmap |
| `xPosition` | VARCHAR(50) | NOT NULL | Time value or phase name |
| `yPosition` | VARCHAR(100) | NOT NULL | Category/investment/type value |
| `metadataLinks` | JSONB | NULLABLE, DEFAULT '[]' | Links to related dashboards |
| `createdAt` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**JSONB Structure** (`metadataLinks`):
```typescript
type MetadataLink = {
  dashboardId: string;      // Target dashboard identifier
  dashboardType: string;    // e.g., "sales", "inventory", "engineering"
  label: string;            // Display label for navigation
  contextParams?: Record<string, string>;  // Optional filter params
};

type MetadataLinks = MetadataLink[];
```

**Indexes**:
- Primary: `id`
- Unique: `partNumber`
- Foreign key: `roadmapId` → `Roadmap.id`
- Composite index on `(roadmapId, xPosition, yPosition)` for spatial queries
- Index on `roadmapId` for filtering products by roadmap

**Validation Rules**:
- `codename` minimum length 2 characters, maximum 100
- `partNumber` minimum length 3 characters, maximum 100, must be unique globally
- `description` minimum length 10 characters
- `sampleDate` must be <= `releaseDate` (critical validation - FR-011)
- `xPosition` must match valid time value or phase name from parent roadmap
- `yPosition` must be one of values in parent `Roadmap.yAxisValues`
- `sampleDate` and `releaseDate` must be valid dates

**Cascade Behavior**:
- On delete Roadmap: CASCADE delete Products

**State Transitions**:
- Products can be moved (drag-drop): updates `xPosition` and/or `yPosition`
- Date changes may automatically update position if in time mode

---

### 4. Permission

Represents user access permissions for specific roadmaps.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `userId` | UUID | FOREIGN KEY → User.id, NOT NULL | User receiving permission |
| `roadmapId` | UUID | FOREIGN KEY → Roadmap.id, NOT NULL | Roadmap being accessed |
| `permissionLevel` | ENUM | NOT NULL | Access level granted |
| `createdAt` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Permission grant timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Enums**:
- `permissionLevel`: `'viewer' | 'editor' | 'admin'`

**Unique Constraint**:
- `UNIQUE(userId, roadmapId)` - Each user can have only one permission level per roadmap

**Indexes**:
- Primary: `id`
- Foreign keys: `userId` → `User.id`, `roadmapId` → `Roadmap.id`
- Composite unique index on `(userId, roadmapId)`
- Index on `roadmapId` for listing permissions for a roadmap

**Permission Hierarchy**:
- `viewer`: Read-only access (view products, cannot edit)
- `editor`: Read/write access (view, edit, add, delete products; requires write-lock for edits)
- `admin`: Full access (all editor permissions + manage permissions, delete roadmap)

**Validation Rules**:
- Cannot grant permission higher than requester's own permission
- Roadmap owner automatically has `admin` permission (implicit, may not need row)

**Cascade Behavior**:
- On delete User: CASCADE delete Permissions
- On delete Roadmap: CASCADE delete Permissions

---

### 5. WriteLock

Represents exclusive write access to a roadmap for collaborative editing.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `roadmapId` | UUID | FOREIGN KEY → Roadmap.id, UNIQUE, NOT NULL | Locked roadmap |
| `userId` | UUID | FOREIGN KEY → User.id, NOT NULL | Lock holder |
| `acquiredAt` | TIMESTAMP | NOT NULL | When lock was acquired |
| `lastHeartbeat` | TIMESTAMP | NOT NULL | Last heartbeat signal |
| `expiresAt` | TIMESTAMP | NOT NULL | Automatic expiry time |

**Unique Constraint**:
- `UNIQUE(roadmapId)` - Only one lock per roadmap at a time

**Indexes**:
- Primary: `id`
- Unique: `roadmapId`
- Foreign keys: `roadmapId` → `Roadmap.id`, `userId` → `User.id`
- Index on `lastHeartbeat` for stale lock detection

**Validation Rules**:
- `lastHeartbeat` must be >= `acquiredAt`
- `expiresAt` must be > `acquiredAt`
- Lock is considered stale if `(NOW() - lastHeartbeat) > 3 minutes` (per spec FR-027)
- Lock automatically expires if `NOW() > expiresAt`

**State Transitions**:
- **Acquire**: User requests lock → check if valid lock exists → if not, grant lock with `acquiredAt = NOW()`, `expiresAt = NOW() + 5 minutes`
- **Heartbeat**: Lock holder sends heartbeat → update `lastHeartbeat = NOW()`, `expiresAt = NOW() + 5 minutes`
- **Release**: Lock holder releases lock → delete WriteLock row
- **Stale Detection**: Background job or middleware detects stale locks (no heartbeat for 3 minutes) → delete WriteLock row

**Cascade Behavior**:
- On delete Roadmap: CASCADE delete WriteLock
- On delete User: CASCADE delete WriteLock

**Business Logic**:
- First-wins race condition: Database transaction ensures atomic lock acquisition (FR-026)
- User must have `editor` or `admin` permission to acquire lock
- Viewers cannot acquire locks

---

### 6. Phase

Represents named phases for phase-based X-axis mode.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `roadmapId` | UUID | FOREIGN KEY → Roadmap.id, NOT NULL | Parent roadmap |
| `name` | VARCHAR(100) | NOT NULL | Phase display name |
| `order` | INT | NOT NULL | Sequence order (0-indexed) |
| `color` | VARCHAR(7) | NULLABLE | Optional hex color code |
| `createdAt` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Unique Constraint**:
- `UNIQUE(roadmapId, name)` - Phase names unique within roadmap
- `UNIQUE(roadmapId, order)` - Phase order unique within roadmap

**Indexes**:
- Primary: `id`
- Foreign key: `roadmapId` → `Roadmap.id`
- Composite unique indexes on `(roadmapId, name)` and `(roadmapId, order)`

**Validation Rules**:
- `name` minimum length 2 characters, maximum 100
- `order` must be >= 0
- `color` must be valid hex format `#RRGGBB` if provided
- Maximum 10 phases per roadmap (reasonable UI limit)

**Default Phases** (suggested):
```json
[
  { "name": "Concept", "order": 0 },
  { "name": "Development", "order": 1 },
  { "name": "Testing", "order": 2 },
  { "name": "Launch", "order": 3 },
  { "name": "Production", "order": 4 }
]
```

**Cascade Behavior**:
- On delete Roadmap: CASCADE delete Phases

**Business Logic**:
- When `Roadmap.xAxisMode = 'phase'`, Product.xPosition references Phase.name
- Phases are only relevant when `xAxisMode = 'phase'`
- Can add/remove/reorder phases (updates Product.xPosition if needed)

---

### 7. DashboardLink (Future - Minimal Initial Implementation)

Represents metadata link from Product to external dashboard.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `productId` | UUID | FOREIGN KEY → Product.id, NOT NULL | Source product |
| `dashboardType` | VARCHAR(100) | NOT NULL | Type of target dashboard |
| `dashboardId` | VARCHAR(255) | NOT NULL | External dashboard identifier |
| `label` | VARCHAR(100) | NOT NULL | Display label for navigation |
| `contextParams` | JSONB | NULLABLE | Optional filter/context params |
| `createdAt` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Indexes**:
- Primary: `id`
- Foreign key: `productId` → `Product.id`
- Index on `productId` for querying links for a product

**Validation Rules**:
- `dashboardType` must be from allowed list (e.g., "sales", "inventory", "engineering")
- `label` minimum length 3 characters

**Cascade Behavior**:
- On delete Product: CASCADE delete DashboardLinks

**Notes**:
- Phase 1: Minimal implementation (just store links, no navigation)
- Phase 2+: Implement actual cross-dashboard navigation with context preservation

---

## Relationships Summary

| Relationship | Cardinality | Description |
|--------------|-------------|-------------|
| User → Roadmap (owner) | 1:N | User owns multiple roadmaps |
| User ↔ Roadmap (permission) | N:M | Users have permissions for roadmaps (via Permission) |
| Roadmap → Product | 1:N | Roadmap contains multiple products |
| Roadmap → Phase | 1:N | Roadmap defines multiple phases (if phase mode) |
| Roadmap → WriteLock | 1:1 | Roadmap has at most one active write lock |
| User → WriteLock | 1:N | User can hold multiple locks (different roadmaps) |
| Product → DashboardLink | 1:N | Product links to multiple external dashboards |

---

## Data Integrity Constraints

### Application-Level Validation

**Before Creating Product**:
1. Verify `sampleDate <= releaseDate` (FR-011)
2. Verify `yPosition` exists in parent `Roadmap.yAxisValues`
3. Verify `xPosition` is valid:
   - If `xAxisMode = 'time'`: valid date or time period
   - If `xAxisMode = 'phase'`: matches existing Phase.name

**Before Updating Product Position** (drag-drop):
1. Verify write lock held by requester
2. Validate new `xPosition` and `yPosition` as above
3. If dates changed, verify `sampleDate <= releaseDate`

**Before Acquiring WriteLock**:
1. Verify user has `editor` or `admin` permission
2. Check for existing valid lock (not stale, not expired)
3. Use database transaction for atomic acquisition (first-wins)

**Before Granting Permission**:
1. Verify requester has `admin` permission on roadmap
2. Verify target user exists

### Database Constraints

**Foreign Key Constraints**:
- All foreign keys have `ON DELETE CASCADE` except where noted
- Ensures referential integrity

**Unique Constraints**:
- `User.email`: Prevent duplicate accounts
- `Product.partNumber`: Ensure globally unique part numbers
- `Permission(userId, roadmapId)`: One permission per user per roadmap
- `WriteLock.roadmapId`: One lock per roadmap
- `Phase(roadmapId, name)`: Unique phase names within roadmap
- `Phase(roadmapId, order)`: Unique phase order within roadmap

**Check Constraints** (database-level):
```sql
-- Product: sampleDate must be <= releaseDate
ALTER TABLE "Product" ADD CONSTRAINT "Product_date_order"
  CHECK ("sampleDate" <= "releaseDate");

-- Phase: order must be >= 0
ALTER TABLE "Phase" ADD CONSTRAINT "Phase_order_positive"
  CHECK ("order" >= 0);

-- WriteLock: lastHeartbeat >= acquiredAt
ALTER TABLE "WriteLock" ADD CONSTRAINT "WriteLock_heartbeat_order"
  CHECK ("lastHeartbeat" >= "acquiredAt");
```

---

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum UserRole {
  viewer
  editor
  admin
}

enum PermissionLevel {
  viewer
  editor
  admin
}

enum XAxisMode {
  time
  phase
}

enum YAxisType {
  category
  investment
  productType
}

model User {
  id           String       @id @default(uuid())
  email        String       @unique
  name         String
  passwordHash String
  role         UserRole     @default(viewer)
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  ownedRoadmaps Roadmap[]
  permissions   Permission[]
  writeLocks    WriteLock[]

  @@index([email])
}

model Roadmap {
  id           String      @id @default(uuid())
  name         String
  description  String?
  xAxisMode    XAxisMode   @default(time)
  yAxisType    YAxisType   @default(category)
  yAxisValues  Json        @default("[]")
  ownerId      String
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  owner       User         @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  products    Product[]
  phases      Phase[]
  permissions Permission[]
  writeLock   WriteLock?

  @@index([ownerId])
}

model Product {
  id            String   @id @default(uuid())
  codename      String
  partNumber    String   @unique
  description   String
  sampleDate    DateTime @db.Date
  releaseDate   DateTime @db.Date
  roadmapId     String
  xPosition     String
  yPosition     String
  metadataLinks Json     @default("[]")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  roadmap        Roadmap         @relation(fields: [roadmapId], references: [id], onDelete: Cascade)
  dashboardLinks DashboardLink[]

  @@index([roadmapId])
  @@index([roadmapId, xPosition, yPosition])
}

model Permission {
  id              String          @id @default(uuid())
  userId          String
  roadmapId       String
  permissionLevel PermissionLevel
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  roadmap Roadmap @relation(fields: [roadmapId], references: [id], onDelete: Cascade)

  @@unique([userId, roadmapId])
  @@index([roadmapId])
}

model WriteLock {
  id            String   @id @default(uuid())
  roadmapId     String   @unique
  userId        String
  acquiredAt    DateTime @default(now())
  lastHeartbeat DateTime @default(now())
  expiresAt     DateTime

  roadmap Roadmap @relation(fields: [roadmapId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([lastHeartbeat])
}

model Phase {
  id        String   @id @default(uuid())
  roadmapId String
  name      String
  order     Int
  color     String?
  createdAt DateTime @default(now())

  roadmap Roadmap @relation(fields: [roadmapId], references: [id], onDelete: Cascade)

  @@unique([roadmapId, name])
  @@unique([roadmapId, order])
  @@index([roadmapId])
}

model DashboardLink {
  id            String   @id @default(uuid())
  productId     String
  dashboardType String
  dashboardId   String
  label         String
  contextParams Json?
  createdAt     DateTime @default(now())

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId])
}
```

---

## Migration Strategy

### Initial Migration

1. Create all tables with relationships
2. Add indexes for performance
3. Seed default data:
   - Create admin user
   - Create sample roadmap
   - Add sample products

### Future Migrations

- Add columns incrementally (use `@default` for non-nullable fields)
- Use separate migration files for schema vs. data changes
- Test migrations on staging before production
- Document breaking changes in migration comments

---

## Performance Considerations

### Indexes Strategy

**Query Patterns**:
1. List roadmaps for user → Index on `Roadmap.ownerId`, `Permission.userId`
2. Get products for roadmap → Index on `Product.roadmapId`
3. Spatial queries (products in grid cell) → Composite index on `(roadmapId, xPosition, yPosition)`
4. Check write lock status → Unique index on `WriteLock.roadmapId`, index on `lastHeartbeat`
5. User lookup by email → Unique index on `User.email`

**Index Sizes** (estimated for 100 roadmaps, 10,000 products):
- `Product(roadmapId, xPosition, yPosition)`: ~1 MB
- All foreign key indexes: ~2 MB total
- Overall index overhead: ~5-10 MB (negligible)

### Query Optimization

**Avoid N+1 Queries**:
- Use Prisma `include` to eagerly load related data:
  ```typescript
  const roadmap = await prisma.roadmap.findUnique({
    where: { id: roadmapId },
    include: { products: true, phases: true, writeLock: true },
  });
  ```

**Pagination for Large Lists**:
- Products list: paginate at 100 items per page
- Use cursor-based pagination for infinite scroll

**Connection Pooling**:
- Follow R6 research recommendations (Prisma singleton + external pooler)

---

## Security Considerations

### Row-Level Security (Future Enhancement)

Consider PostgreSQL Row-Level Security (RLS) policies:
```sql
-- Example: Users can only see roadmaps they have permission for
CREATE POLICY roadmap_access ON "Roadmap"
  USING (
    "ownerId" = current_setting('app.user_id')::uuid OR
    EXISTS (
      SELECT 1 FROM "Permission"
      WHERE "roadmapId" = "Roadmap"."id"
        AND "userId" = current_setting('app.user_id')::uuid
    )
  );
```

### Data Sanitization

- Sanitize all user inputs before storage (prevent XSS in descriptions)
- Validate JSON structures for `yAxisValues`, `metadataLinks`, `contextParams`
- Use parameterized queries (Prisma handles this automatically)

### Sensitive Data

- `User.passwordHash`: Never return in API responses, exclude in Prisma queries:
  ```typescript
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true },
  });
  ```

---

## Next Steps

1. Generate Prisma migration: `npx prisma migrate dev --name init`
2. Generate TypeScript types: `npx prisma generate`
3. Create seed script for development data
4. Implement API routes using this data model
5. Add validation middleware for critical constraints

---

**Data Model Complete**: Ready for API contract generation (Phase 1 next step).
