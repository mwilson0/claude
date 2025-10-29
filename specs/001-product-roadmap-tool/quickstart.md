# Quickstart Guide: Product Roadmap Creation Tool

**Branch**: `001-product-roadmap-tool`
**Last Updated**: 2025-10-28

This guide will help you set up, develop, and run the Product Roadmap Creation Tool on your local machine.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [Development Workflow](#development-workflow)
7. [Testing](#testing)
8. [Project Structure](#project-structure)
9. [Common Tasks](#common-tasks)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Ensure you have the following installed on your system:

- **Node.js**: 18.x or higher ([Download](https://nodejs.org/))
- **pnpm** or **npm**: Latest version
  ```bash
  npm install -g pnpm
  ```
- **PostgreSQL**: 15.x or higher ([Download](https://www.postgresql.org/download/))
- **Git**: For version control

**Recommended Tools**:
- **VS Code** with extensions: ESLint, Prettier, Prisma, Tailwind CSS IntelliSense
- **Postman** or **Thunder Client** for API testing

---

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd roadmap_project
```

### 2. Install Dependencies

```bash
pnpm install
# or
npm install
```

This will install all required packages including:
- Next.js 14+
- React 18+
- Prisma (PostgreSQL ORM)
- React Query (TanStack Query)
- Zustand (state management)
- dnd-kit (drag-and-drop)
- Tailwind CSS
- shadcn/ui components

---

## Environment Configuration

### 1. Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` and fill in the following:

```env
# Database Connection
# Development: Direct connection to local PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/roadmap_dev?connection_limit=1&pool_timeout=20"

# Direct URL for migrations (same as DATABASE_URL in development)
DIRECT_URL="postgresql://username:password@localhost:5432/roadmap_dev"

# Production: Use connection pooler (PgBouncer, Prisma Accelerate, or managed Postgres)
# DATABASE_URL="postgresql://username:password@pooler:6543/roadmap_prod?connection_limit=1&pool_timeout=20"
# DIRECT_URL="postgresql://username:password@db:5432/roadmap_prod"

# Authentication
AUTH_MODE="mock"  # "mock" for development, "external" for production
JWT_SECRET="your-secret-key-here-change-in-production"  # Generate with: openssl rand -base64 32

# Next.js
NODE_ENV="development"  # "development" | "production" | "test"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"

# Optional: Prisma Accelerate (for production)
# DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"

# Optional: Redis (for future caching)
# REDIS_URL="redis://localhost:6379"
```

**Important**: Never commit `.env` to version control. Add it to `.gitignore`.

---

## Database Setup

### 1. Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE roadmap_dev;

# Create user (optional, if not using existing user)
CREATE USER roadmap_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE roadmap_dev TO roadmap_user;

# Exit psql
\q
```

### 2. Run Prisma Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations to create tables
npx prisma migrate dev --name init

# Seed database with sample data (optional)
npx prisma db seed
```

**Verify Database Setup**:
```bash
# Open Prisma Studio to view data
npx prisma studio
```

This opens a web interface at `http://localhost:5555` where you can browse tables and data.

---

## Running the Application

### Development Server

```bash
# Start Next.js development server
pnpm dev
# or
npm run dev
```

The application will be available at:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **API**: [http://localhost:3000/api](http://localhost:3000/api)

**Hot Reloading**: The server automatically reloads when you make changes to source files.

### Production Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

### Docker (Optional - Future)

```bash
# Build and run with Docker Compose
docker-compose up --build
```

---

## Development Workflow

### 1. Branch Strategy

- **Main branch**: `main` (stable, production-ready)
- **Feature branches**: `001-product-roadmap-tool`, `002-feature-name`, etc.

```bash
# Create and switch to feature branch
git checkout -b 001-product-roadmap-tool

# Make changes and commit
git add .
git commit -m "Add roadmap visualization component"

# Push to remote
git push origin 001-product-roadmap-tool
```

### 2. Code Style

Code is automatically formatted on save (if VS Code is configured):

```bash
# Manual formatting
pnpm format

# Lint code
pnpm lint

# Type check
pnpm type-check
```

### 3. Database Migrations

When modifying Prisma schema:

```bash
# Create migration
npx prisma migrate dev --name add_new_field

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Deploy migrations to production
npx prisma migrate deploy
```

---

## Testing

### Run Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test path/to/test.test.ts
```

### Test Types

- **Unit Tests**: `src/**/*.test.ts`
- **Integration Tests**: `tests/integration/**/*.test.ts`
- **E2E Tests** (Future): `tests/e2e/**/*.spec.ts`

### Testing Guidelines

- **Target**: 80% code coverage for new code
- **Bug Fixes**: Write failing test first, then fix (TDD-Light approach)
- **Components**: Test user-facing behavior, not implementation details

---

## Project Structure

```
roadmap_project/
├── app/                          # Next.js 14+ App Router
│   ├── (auth)/                   # Auth routes (login, logout)
│   │   ├── login/
│   │   └── layout.tsx
│   ├── (dashboard)/              # Dashboard routes (authenticated)
│   │   ├── roadmaps/
│   │   │   ├── [roadmapId]/    # Dynamic roadmap page
│   │   │   └── page.tsx         # Roadmap list
│   │   └── layout.tsx           # Dashboard layout
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   ├── roadmaps/
│   │   ├── products/
│   │   └── permissions/
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/                   # Shared UI components
│   ├── ui/                       # shadcn/ui components
│   ├── roadmap/                  # Roadmap-specific components
│   │   ├── RoadmapCanvas.tsx    # Main chart visualization
│   │   ├── ProductCard.tsx      # Draggable product element
│   │   ├── AxisSelector.tsx     # X/Y axis configuration
│   │   └── DragDropProvider.tsx # dnd-kit context
│   └── layout/
│       ├── Header.tsx
│       └── Sidebar.tsx
├── lib/                          # Shared utilities and services
│   ├── db/
│   │   ├── prisma.ts            # Prisma client singleton
│   │   └── queries/             # Reusable query functions
│   ├── auth/
│   │   ├── mock-users.ts        # Development mock auth
│   │   ├── jwt.ts               # JWT utilities
│   │   └── middleware.ts        # Auth middleware
│   ├── hooks/                    # Custom React hooks
│   │   ├── useRoadmapData.ts
│   │   ├── useWriteLock.ts
│   │   └── useDragDrop.ts
│   ├── stores/                   # Zustand stores
│   │   ├── roadmapStore.ts
│   │   └── authStore.ts
│   └── utils/
│       ├── date-formatter.ts
│       └── validation.ts
├── prisma/
│   ├── schema.prisma             # Database schema
│   ├── migrations/               # Migration files
│   └── seed.ts                   # Seed script
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/                         # Architecture documentation
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_DESIGN.md
│   └── LESSONS_LEARNED.md
├── specs/                        # Feature specifications
│   └── 001-product-roadmap-tool/
│       ├── spec.md
│       ├── plan.md
│       ├── research.md
│       ├── data-model.md
│       ├── quickstart.md        # This file
│       └── contracts/
├── public/                       # Static assets
├── .specify/                     # Speckit configuration
├── .env                          # Environment variables (not committed)
├── .env.example                  # Environment template
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── .eslintrc.json
├── .prettierrc
└── README.md
```

---

## Common Tasks

### Add a New Component

```bash
# Create component file
touch components/roadmap/NewComponent.tsx

# Create test file
touch components/roadmap/NewComponent.test.tsx
```

**Component Template**:
```typescript
// components/roadmap/NewComponent.tsx
import React from 'react';

interface NewComponentProps {
  // Props here
}

export function NewComponent({ }: NewComponentProps) {
  return (
    <div>
      {/* Component content */}
    </div>
  );
}
```

### Add a New API Route

```bash
# Create API route file
touch app/api/new-endpoint/route.ts
```

**API Route Template**:
```typescript
// app/api/new-endpoint/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(request: Request) {
  try {
    // Your logic here
    const data = await prisma.model.findMany();

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Something went wrong', statusCode: 500 } },
      { status: 500 }
    );
  }
}
```

### Add a New Custom Hook

```bash
# Create hook file
touch lib/hooks/useCustomHook.ts
```

**Hook Template**:
```typescript
// lib/hooks/useCustomHook.ts
import { useQuery } from '@tanstack/react-query';

export function useCustomHook(param: string) {
  return useQuery({
    queryKey: ['custom', param],
    queryFn: () => fetchData(param),
  });
}
```

### Update Database Schema

1. Edit `prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name describe_change`
3. Update TypeScript types: `npx prisma generate`
4. Update API routes and components to use new schema

### Add a shadcn/ui Component

```bash
# Add specific component (e.g., button)
npx shadcn@latest add button

# Add multiple components
npx shadcn@latest add button input card
```

Components are added to `components/ui/` and can be customized.

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors

**Error**: `P1001: Can't reach database server`

**Solution**:
- Verify PostgreSQL is running: `pg_ctl status` or `brew services list` (macOS)
- Check `DATABASE_URL` in `.env` has correct credentials
- Test connection: `psql -U username -d roadmap_dev`

#### 2. Prisma Client Not Found

**Error**: `Cannot find module '@prisma/client'`

**Solution**:
```bash
npx prisma generate
```

#### 3. Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Find process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 pnpm dev
```

#### 4. TypeScript Errors After Schema Change

**Solution**:
```bash
# Regenerate Prisma Client
npx prisma generate

# Restart TypeScript server in VS Code
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

#### 5. Tests Failing Due to Environment

**Solution**:
```bash
# Set test environment
NODE_ENV=test pnpm test

# Or create .env.test file
```

### Getting Help

- **Documentation**: `/docs` directory
- **Constitution**: `.specify/memory/constitution.md`
- **Spec**: `/specs/001-product-roadmap-tool/spec.md`
- **API Reference**: `/specs/001-product-roadmap-tool/contracts/openapi.yaml`
- **Issues**: Create issue in repository

---

## Next Steps

After completing this quickstart:

1. **Review Architecture**: Read `/docs/ARCHITECTURE.md`
2. **Understand Data Model**: Review `/specs/001-product-roadmap-tool/data-model.md`
3. **API Contracts**: Explore `/specs/001-product-roadmap-tool/contracts/openapi.yaml`
4. **Start Developing**: Check `/specs/001-product-roadmap-tool/tasks.md` for implementation tasks (generated by `/speckit.tasks`)

---

## Mock Users for Development

When `AUTH_MODE=mock`, use these credentials:

| Email | Password | Role |
|-------|----------|------|
| `admin@example.com` | `admin123` | admin |
| `editor@example.com` | `editor123` | editor |
| `viewer@example.com` | `viewer123` | viewer |

---

## Additional Resources

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Query (TanStack Query)](https://tanstack.com/query/latest)
- [dnd-kit Documentation](https://docs.dndkit.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

---

**Happy Coding!** If you have questions, refer to the constitution (`.specify/memory/constitution.md`) or create an issue in the repository.
