# Project Constitution
**Roadmap Dashboard Application - Multi-User Data Visualization Platform**

---

## Purpose
This constitution establishes the foundational principles, standards, and practices for our evolving dashboard ecosystem. All contributors must adhere to these guidelines to ensure code quality, maintainability, security, and excellent user experience as we grow from a single roadmap dashboard to an interconnected network of data visualization tools.

---

## Table of Contents
1. [Code Quality Standards](#i-code-quality-standards)
2. [Documentation Standards](#ii-documentation-standards)
3. [Testing Standards](#iii-testing-standards)
4. [Lessons Learned Process](#iv-lessons-learned-process)
5. [Performance & Efficiency Standards](#v-performance--efficiency-standards)
6. [User Experience Consistency](#vi-user-experience-consistency)
7. [Technology Stack Constraints](#vii-technology-stack-constraints)
8. [Architectural Principles](#viii-architectural-principles)
9. [Code Review Process](#ix-code-review-process)
10. [Change Management](#x-change-management)

---

## I. Code Quality Standards

### 1.1 Language and Type Safety
- **TypeScript Mandatory**: All code must be written in TypeScript with strict mode enabled
- **No Implicit Any**: Avoid `any` types; use proper interfaces, types, or `unknown` with type guards
- **Type Definitions**: Create explicit interfaces for all data structures, API responses, and component props
- **Null Safety**: Use optional chaining and nullish coalescing; handle undefined/null explicitly

### 1.2 Code Style and Formatting
**Tools (Mandatory):**
- **ESLint**: Configured with React, TypeScript, and Next.js plugins
- **Prettier**: Auto-format on save (integrated with ESLint)

**Naming Conventions:**
- **Components**: PascalCase (e.g., `RoadmapDashboard`, `ProductCard`)
- **Functions/Variables**: camelCase (e.g., `fetchRoadmapData`, `isLoading`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_ATTEMPTS`, `API_BASE_URL`)
- **Files**: 
  - Components: PascalCase matching component name (`ProductCard.tsx`)
  - Utilities: kebab-case (`date-formatter.ts`)
  - Hooks: camelCase with `use` prefix (`useRoadmapData.ts`)

**Code Organization:**
- **File Length**: Maximum 300 lines; refactor into smaller modules if exceeded
- **Function Length**: Maximum 50 lines; extract complex logic into separate functions
- **Single Responsibility**: Each function/component has one clear purpose
- **DRY Principle**: Extract repeated logic (3+ occurrences) into reusable utilities or hooks

### 1.3 React-Specific Standards

**Component Composition Patterns:**
- **Composition over Inheritance**: Use composition and props for component reusability
- **Compound Components**: For related UI elements (e.g., `<Modal>`, `<Modal.Header>`, `<Modal.Body>`)
- **Render Props & Children**: For flexible, reusable component APIs
- **HOCs sparingly**: Prefer hooks and composition over Higher-Order Components

**Component Structure:**
```typescript
// 1. Imports (external, internal, types, styles)
// 2. Type/Interface definitions
// 3. Component definition
// 4. Exported component (default or named)
// 5. Sub-components (if any, not exported)
```

**State Management Approach:**
- **Local State**: `useState` for component-specific state
- **Server State**: React Query (TanStack Query) for data fetching, caching, and synchronization
- **Global State**: 
  - **Context API**: For simple, app-wide state (theme, auth status)
  - **Zustand**: For complex global state requiring fine-grained updates (recommended for dashboard filters, user preferences)
  - **Redux Toolkit**: Only if Zustand becomes insufficient (requires architectural review)

**When to use which:**
- Single component state → `useState`
- Multiple components, same tree → Prop drilling or Context
- Cross-dashboard state → Zustand store
- Server data → React Query
- Forms → React Hook Form (recommended)

### 1.4 Code Review Requirements
All code changes require:
1. **Self-review** by author before requesting review
2. **Manual `/code-review` command** execution (documented in Section IX)
3. **Peer review** from at least one supporting team member
4. **All automated checks passing** (linting, type checking, tests)

**Review Checklist:**
- [ ] Follows established patterns and conventions
- [ ] Tests included and passing (80%+ coverage for new code)
- [ ] Documentation updated (inline comments, README, architecture docs)
- [ ] No security vulnerabilities (checked via `/code-review`)
- [ ] Performance implications considered (no N+1 queries, efficient renders)
- [ ] Accessibility standards met (WCAG 2.1 AA minimum)
- [ ] Lessons learned reviewed (no repeat bugs)
- [ ] Changelog updated

---

## II. Documentation Standards

### 2.1 Inline Code Documentation

**Public API Documentation (Mandatory):**
All exported functions, hooks, and utilities must include JSDoc comments:

```typescript
/**
 * Fetches roadmap data for a specific product from the database
 * 
 * @param productId - Unique identifier for the product
 * @param options - Optional fetch configuration
 * @param options.includeArchived - Include archived roadmap items (default: false)
 * @returns Promise resolving to roadmap data with items and metadata
 * @throws {DatabaseError} If database connection fails
 * @throws {NotFoundError} If product doesn't exist
 * 
 * @example
 * ```typescript
 * const roadmap = await fetchRoadmapData('prod-123', { includeArchived: true });
 * console.log(roadmap.items.length);
 * ```
 */
export async function fetchRoadmapData(
  productId: string,
  options?: FetchRoadmapOptions
): Promise<RoadmapData> {
  // Implementation
}
```

**Component Documentation:**
React components must document props interface with descriptions:

```typescript
/**
 * ProductCard displays summary information for a product with navigation
 * to its roadmap dashboard.
 * 
 * Handles loading states and error boundaries internally.
 */
interface ProductCardProps {
  /** Unique product identifier */
  productId: string;
  /** Display name shown in card header */
  productName: string;
  /** Optional custom click handler (default: navigates to roadmap) */
  onCardClick?: (productId: string) => void;
  /** Show archived status badge if true */
  showArchived?: boolean;
}

export function ProductCard({ productId, productName, onCardClick, showArchived }: ProductCardProps) {
  // Implementation
}
```

**Complex Logic Comments:**
Any non-obvious business logic, algorithms, or workarounds must include inline comments explaining the "why":

```typescript
// Offset by 1 to account for zero-indexed database pagination
// but one-indexed user-facing page numbers
const dbOffset = (page - 1) * pageSize;

// Using debounce to prevent excessive API calls while user types
// 300ms delay balances responsiveness with server load
const debouncedSearch = useMemo(
  () => debounce(handleSearch, 300),
  [handleSearch]
);
```

### 2.2 Architecture Documentation

**Location**: `/docs` directory in repository root

**Required Documents:**

1. **`/docs/ARCHITECTURE.md`** - System architecture overview
   - High-level component diagram
   - Data flow between frontend, backend, and database
   - Module boundaries and responsibilities
   - Future microservices extraction plan

2. **`/docs/DATABASE_SCHEMA.md`** - Database design
   - Entity-relationship diagrams
   - Table schemas with field descriptions
   - Indexes and performance optimizations
   - Migration strategy
   - External database connection patterns

3. **`/docs/API_DESIGN.md`** - API documentation
   - All endpoint definitions (method, path, purpose)
   - Request/response schemas (TypeScript interfaces)
   - Authentication requirements
   - Error response formats
   - Rate limiting and pagination standards

4. **`/docs/AUTHENTICATION.md`** - Auth implementation
   - Mock authentication scheme for development
   - External auth system integration plan
   - Access control model (roles, permissions)
   - Session management

5. **`/docs/DASHBOARDS.md`** - Dashboard registry
   - List of all dashboards (current and planned)
   - Metadata linking strategy
   - Inter-dashboard navigation patterns
   - Shared component library

**Update Requirements:**
- Architecture docs updated BEFORE major changes are implemented
- Database schema updated with every migration
- API docs updated with every endpoint addition/modification

### 2.3 README Standards

**Repository Root `/README.md`:**
- Project overview and purpose
- Setup instructions (prerequisites, installation, environment variables)
- Development workflow (running locally, building, testing)
- Deployment process
- Link to `/docs` for detailed documentation
- Contributing guidelines

**Module READMEs:**
Each major directory (`/components`, `/lib`, `/app/[dashboard]`) should have a README explaining:
- Purpose and scope of the module
- Key files and their responsibilities
- Usage examples
- Dependencies and relationships

### 2.4 API Documentation Format

All API routes (Next.js API routes or future separate backend) must document:

```typescript
/**
 * GET /api/roadmaps/:productId
 * 
 * Retrieves roadmap data for a specific product
 * 
 * Authentication: Required (mock auth in dev, external in prod)
 * Authorization: User must have 'read:roadmaps' permission
 * 
 * Path Parameters:
 *   productId (string): Product identifier
 * 
 * Query Parameters:
 *   includeArchived (boolean, optional): Include archived items (default: false)
 *   startDate (ISO8601 string, optional): Filter items after this date
 *   endDate (ISO8601 string, optional): Filter items before this date
 * 
 * Response 200:
 *   {
 *     roadmap: RoadmapData,
 *     metadata: { totalItems: number, lastUpdated: string }
 *   }
 * 
 * Response 401: Unauthorized (invalid or missing token)
 * Response 403: Forbidden (insufficient permissions)
 * Response 404: Product not found
 * Response 500: Internal server error
 * 
 * Rate Limit: 100 requests per minute per user
 */
```

---

## III. Testing Standards

### 3.1 Testing Philosophy: TDD-Light

**Approach**: Write tests alongside features (not strictly before) with strategic scaling based on scope.

**Core Principle**: Flexibility for rapid development while maintaining quality through intelligent test coverage.

**Why TDD-Light vs. Strict TDD:**

This project uses **TDD-Light** instead of strict Test-Driven Development for the following reasons:

✅ **Advantages of TDD-Light:**
1. **Faster MVP Development**: Solo developer can move quickly without TDD overhead
2. **Architectural Flexibility**: Can experiment with structure before locking in with tests
3. **Learning Curve**: Lower barrier for supporting team members
4. **Pragmatic Balance**: 80% coverage + bug-first testing catches most issues
5. **Resource Efficiency**: Better suited for small teams with limited time

⚠️ **Limitations We Accept:**
1. **Delayed Bug Discovery**: Bugs found after implementation may require rework
2. **Test Quality Variance**: Risk of tests that "pass" vs. tests that "validate behavior"
3. **Design Impact**: May create less testable code than pure TDD would
4. **Coverage Gaps**: "As needed" integration testing can leave interaction bugs
5. **Refactoring Confidence**: Fewer tests = less confidence when refactoring
6. **Technical Debt**: Easier to skip tests under pressure

**Mitigation Strategies:**
- **Non-negotiable bug-first testing**: All bug fixes start with failing tests
- **Code review emphasis**: Supporting team verifies test quality
- **Periodic audits**: Monthly coverage reviews, add missing critical tests
- **Upgrade path**: Move toward stricter TDD as dashboards mature

**When to Shift to Strict TDD:**
- Dashboard reaches production-stable status
- Bug rate exceeds 2 per week
- Onboarding new developers
- Implementing financial or legally critical features
- Refactoring core architectural components

### 3.2 Testing Requirements by Change Type

**For New Features:**
- **Unit Tests**: Required for all business logic, utilities, and custom hooks
- **Component Tests**: Required for new React components with user interactions
- **Integration Tests**: Required when feature spans multiple modules or involves database
- **E2E Tests**: Required only for critical user flows (authentication, core dashboard interactions)

**For Bug Fixes: NON-NEGOTIABLE**
1. **Write a failing test first** that reproduces the bug
2. Fix the bug
3. Verify the test now passes
4. Document in lessons-learned (see Section IV)

**For Refactoring:**
- Ensure existing tests still pass
- Add tests if coverage drops below 80%
- No new features without tests

### 3.3 Test Coverage Standards

**Minimum Requirements:**
- **Overall Code Coverage**: 80% for all new code
- **Critical Paths**: 100% coverage for:
  - Data mutation operations (create, update, delete)
  - External database connections
  - Access control logic
  - Data transformation pipelines
  - Financial or business-critical calculations

**Coverage Monitoring:**
- Run coverage reports before every PR
- Flag any files below 80% coverage
- Track coverage trends over time (should not decrease)

**Tools:**
- Jest for unit and integration testing
- React Testing Library for component testing
- Playwright or Cypress for E2E testing (once needed)

### 3.4 Test Organization

**Structure:**
```
src/
  components/
    ProductCard/
      ProductCard.tsx
      ProductCard.test.tsx
      ProductCard.stories.tsx (optional Storybook)
  lib/
    utils/
      date-formatter.ts
      date-formatter.test.ts
  app/
    api/
      roadmaps/
        route.ts
        route.test.ts
```

**Test File Naming:**
- Unit/Component tests: `[filename].test.ts(x)`
- Integration tests: `[feature].integration.test.ts`
- E2E tests: `[user-flow].e2e.test.ts`

### 3.5 Test Quality Standards

**Good Tests Are:**
- **Independent**: Can run in any order, no shared state
- **Fast**: Unit tests < 100ms, integration tests < 1s
- **Readable**: Clear test names describing behavior
- **Maintainable**: Don't test implementation details, test behavior
- **Reliable**: No flaky tests (deterministic, no random data)

**Test Naming Convention:**
```typescript
describe('ProductCard', () => {
  it('should display product name and ID', () => {
    // Arrange, Act, Assert
  });

  it('should navigate to roadmap when clicked', () => {
    // Test implementation
  });

  it('should show archived badge when showArchived is true', () => {
    // Test implementation
  });
});
```

**AAA Pattern** (Arrange-Act-Assert):
```typescript
it('should fetch roadmap data successfully', async () => {
  // Arrange
  const productId = 'prod-123';
  const mockData = { items: [], metadata: {} };
  mockApiCall.mockResolvedValue(mockData);

  // Act
  const result = await fetchRoadmapData(productId);

  // Assert
  expect(result).toEqual(mockData);
  expect(mockApiCall).toHaveBeenCalledWith(`/api/roadmaps/${productId}`);
});
```

### 3.6 Testing Anti-Patterns to Avoid

❌ **Don't:**
- Test implementation details (internal state, private methods)
- Write tests that test the framework (React, Next.js behavior)
- Use arbitrary timeouts (`setTimeout` in tests)
- Share test data between tests
- Test multiple behaviors in one test
- Skip tests with `.skip()` without a TODO comment

✅ **Do:**
- Test user-facing behavior and API contracts
- Mock external dependencies (databases, APIs)
- Use meaningful test data (not `foo`, `bar`, `test123`)
- Keep tests focused on single behavior
- Use data-testid for component queries only when semantic queries fail

---

## IV. Lessons Learned Process

### 4.1 Purpose
Capture knowledge from bugs to prevent recurrence and build institutional memory.

### 4.2 When to Document

**Mandatory Documentation:**
- All production bugs (post-deployment issues)
- Bugs that required > 2 hours to diagnose
- Bugs caused by misunderstanding requirements or architecture
- Bugs that affected multiple users
- Security vulnerabilities

**Optional Documentation:**
- Minor typos or cosmetic issues
- Expected edge cases that were simply missed
- First-time integration issues with new libraries

### 4.3 Lessons Learned Format

**Location**: `/docs/LESSONS_LEARNED.md`

**Template:**
```markdown
## [YYYY-MM-DD] [Severity] [Short Title]

**Severity**: Critical / High / Medium / Low

**Affected Components**:
- Component/Module 1
- Component/Module 2

**Bug Description**:
[Clear description of what went wrong from user perspective]

**Root Cause**:
[Technical explanation of WHY the bug occurred]

**Reproduction Steps**:
1. Step one to reproduce
2. Step two to reproduce
3. Observed behavior

**Fix Implemented**:
[Description of the solution applied]

**Prevention Strategy**:
[How to avoid this category of bug in the future]
- Architectural change
- New test requirement
- Documentation update
- Code review checklist item

**Related Files**:
- `path/to/fixed/file.ts`
- `path/to/added/test.test.ts`

**Lessons Learned**:
- [Key takeaway 1]
- [Key takeaway 2]

**Tags**: #database #performance #race-condition #next-js

---
```

**Example:**
```markdown
## 2025-10-28 [High] Duplicate roadmap items created on rapid clicks

**Severity**: High

**Affected Components**:
- `app/api/roadmaps/route.ts` (POST handler)
- `components/RoadmapEditor/AddItemButton.tsx`

**Bug Description**:
Users clicking "Add Item" button rapidly (double-click) resulted in duplicate database entries with identical data.

**Root Cause**:
POST endpoint lacked idempotency protection. No debouncing on client-side button. Database had no unique constraint on (productId, title, startDate) combination.

**Reproduction Steps**:
1. Open roadmap editor for any product
2. Rapidly double-click "Add Item" button
3. Observe two identical items created

**Fix Implemented**:
1. Added 500ms debounce to AddItemButton onClick handler
2. Implemented optimistic locking with version field in database
3. Added unique constraint: `UNIQUE(product_id, title, start_date)`
4. Added request deduplication middleware using request IDs

**Prevention Strategy**:
- All mutation operations must include idempotency mechanism
- Client-side buttons with mutation side effects must be debounced
- Database constraints for business rules (not just application validation)
- Code review checklist: "Is this idempotent?"

**Related Files**:
- `app/api/roadmaps/route.ts`
- `components/RoadmapEditor/AddItemButton.tsx`
- `lib/middleware/deduplication.ts`
- `migrations/002_add_unique_constraint.sql`
- `app/api/roadmaps/route.test.ts` (new test added)

**Lessons Learned**:
- Never trust client-side button state alone for mutation prevention
- Database constraints are last line of defense
- Test for race conditions explicitly in integration tests
- Optimistic UI updates need pessimistic backend validation

**Tags**: #database #race-condition #idempotency #user-input

---
```

### 4.4 Lessons Learned Review Process

**During Code Review:**
1. Reviewer must check `/docs/LESSONS_LEARNED.md` for similar issues
2. If new code risks repeating past mistakes, flag in review
3. Reference specific lesson learned entry in review comments

**Monthly Review:**
- Team reviews all lessons learned from the month
- Identify patterns (recurring issue categories)
- Update constitution or code review checklist if needed
- Prioritize preventive refactoring

**Searchability:**
- Use consistent tags (#database, #performance, #security, etc.)
- Include affected file paths
- Use descriptive titles

---

## V. Performance & Efficiency Standards

### 5.1 Performance Metrics & Targets

**Page Load Performance:**
- **First Contentful Paint (FCP)**: < 2 seconds
- **Largest Contentful Paint (LCP)**: < 2.5 seconds
- **Time to Interactive (TTI)**: < 3 seconds
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms

**API Performance:**
- **Database Queries**: < 100ms for typical queries
- **API Response Time**: < 500ms for data retrieval endpoints
- **Mutation Operations**: < 1 second for create/update/delete

**Bundle Size:**
- **Initial JavaScript Bundle**: < 300KB (gzipped)
- **Total Page Weight**: < 2MB (including images, fonts)
- **Code Splitting**: Implemented for dashboard modules

**Real-time Updates** (when implemented):
- **Update Latency**: < 1 second from event to UI update
- **WebSocket Reconnection**: < 3 seconds

**Database Performance:**
- **Connection Pool**: Reuse connections, don't create per-request
- **Query Optimization**: All queries use indexes, no table scans on large tables
- **N+1 Query Prevention**: Use joins or batching, never loop with queries

### 5.2 Performance Monitoring

**Tools:**
- Lighthouse CI in GitHub Actions
- Next.js Analytics (built-in)
- Database query logging in development
- Performance profiling in React DevTools

**Monitoring Requirements:**
- Run Lighthouse before every major release
- Monitor Core Web Vitals in production
- Alert if any metric degrades > 20%

### 5.3 Efficiency Standards

**React Rendering Optimization:**
- Use `React.memo()` for expensive pure components
- Use `useMemo()` for expensive computations
- Use `useCallback()` for stable function references passed to children
- Avoid inline object/array creation in render
- Implement virtual scrolling for lists > 100 items

**Data Fetching Efficiency:**
- Use React Query for automatic caching and deduplication
- Implement pagination (default: 20 items per page)
- Prefetch data on hover for navigation (when appropriate)
- Use SWR pattern for frequently accessed data

**Database Efficiency:**
- **Indexing**: All foreign keys and frequently queried fields indexed
- **Connection Pooling**: Use persistent connection pool (pg-pool)
- **Query Batching**: Batch multiple queries when possible (DataLoader pattern)
- **Caching**: Implement Redis or similar for frequently accessed data
- **Read Replicas**: Use for analytics queries (when scaling)

**External Database Connections:**
- Connection adapters must implement connection pooling
- Timeout all external queries (5 second default)
- Implement circuit breaker pattern for unreliable connections
- Cache external data locally when latency > 500ms

### 5.4 Performance Budget

**Enforcement:**
- Fail builds if bundle size increases > 10% without approval
- Require performance justification for:
  - Adding dependencies > 50KB
  - Introducing synchronous blocking operations
  - Nested loops or recursive algorithms in hot paths

**Budget Review:**
- Quarterly review of bundle size
- Annually review performance targets
- Update budgets as user scale increases

---

## VI. User Experience Consistency

### 6.1 Design System

**Component Library:**
- Use a consistent UI framework (recommendation: shadcn/ui with Radix UI primitives)
- All dashboards share the same component library
- Custom components follow established design patterns

**Design Tokens:**
```typescript
// colors, spacing, typography, shadows, etc.
// Defined once, imported everywhere
```

**Accessibility:**
- WCAG 2.1 AA compliance minimum
- Keyboard navigation for all interactive elements
- Screen reader support (semantic HTML, ARIA labels)
- Sufficient color contrast (4.5:1 for normal text)
- Focus visible indicators

### 6.2 Navigation & Layout

**Dashboard Navigation:**
- Consistent top-level navigation across all dashboards
- Breadcrumbs for deep navigation
- Search functionality in global header
- Dashboard switcher (once multiple dashboards exist)

**Metadata Linking:**
- Visual indicators when data is linked across dashboards
- One-click navigation to related dashboards
- Preserve context when navigating (e.g., selected product)

**Responsive Design:**
- Mobile-first approach
- Breakpoints: 640px (sm), 768px (md), 1024px (lg), 1280px (xl)
- Test on mobile, tablet, desktop

### 6.3 Interaction Patterns

**Loading States:**
- Skeleton screens for content loading
- Spinners for actions (buttons)
- Progress bars for long operations
- Optimistic updates where appropriate

**Error Handling:**
- User-friendly error messages (no stack traces)
- Actionable guidance ("Try again" button)
- Fallback UI for component errors (Error Boundaries)

**Feedback:**
- Toast notifications for success/error (3s timeout)
- Confirmation dialogs for destructive actions
- Inline validation for forms (real-time)

### 6.4 Data Visualization Standards

**Consistency:**
- Use same charting library across dashboards (e.g., Recharts, Chart.js)
- Consistent color palette for data categories
- Standard date formatting (ISO 8601 in API, localized in UI)

**Interactivity:**
- Tooltips on hover for detailed info
- Click to drill down (when applicable)
- Export functionality (CSV, PNG)

---

## VII. Technology Stack Constraints

### 7.1 Approved Technologies

**Core Stack (Non-negotiable):**
- **Frontend Framework**: React 18+ with Next.js 14+ (App Router)
- **Language**: TypeScript 5+ (strict mode)
- **Database**: PostgreSQL 15+
- **Package Manager**: npm or pnpm (document in README)

**State Management:**
- React Query (TanStack Query) for server state
- Zustand for global client state
- Context API for simple shared state

**Styling:**
- Tailwind CSS for utility-first styling
- CSS Modules for complex component styles (when needed)
- shadcn/ui for base components (recommended)

**Testing:**
- Jest for unit and integration tests
- React Testing Library for component tests
- Playwright for E2E tests (when implemented)

**Development Tools:**
- ESLint + Prettier
- TypeScript compiler
- Husky for pre-commit hooks (optional but recommended)

### 7.2 Library Addition Guidelines

**Before Adding a New Dependency:**

1. **Necessity Check**: Can this be achieved with existing dependencies?
2. **Size Check**: Is the package < 50KB? If larger, requires justification
3. **Maintenance Check**: Is the package actively maintained? (commit within 6 months)
4. **Security Check**: Run `npm audit` after adding
5. **License Check**: Ensure compatible license (MIT, Apache 2.0, BSD)
6. **Alternatives**: Document why this package was chosen over alternatives

**Prohibited:**
- Packages with known security vulnerabilities
- Unmaintained packages (no updates in 12+ months)
- Packages that duplicate existing functionality
- Client-side dependencies that should be server-side only

**Approval Process:**
- Additions < 50KB: Document in PR description
- Additions 50-200KB: Justify in PR, team discussion
- Additions > 200KB or core architectural changes: Requires approval from project lead

### 7.3 Database Constraints

**PostgreSQL Usage:**
- Use parameterized queries (prevent SQL injection)
- Use migrations for schema changes (never manual ALTER TABLE in prod)
- Use transactions for multi-step operations
- Use connection pooling (pg-pool)

**External Database Connections:**
- Must implement adapter pattern for flexibility
- Document connection requirements in `/docs/DATABASE_SCHEMA.md`
- Test with mock data before connecting to external sources
- Implement retry logic with exponential backoff

**ORMs / Query Builders:**
- Approved: Prisma (type-safe, migration support)
- Approved: Drizzle ORM (lightweight, TypeScript-first)
- Raw SQL allowed for complex queries with comments

### 7.4 Authentication Constraints

**Development Phase:**
- Mock authentication with hardcoded users/tokens
- Environment variable for enabling/disabling auth in dev

**Production Phase (Future):**
- Must integrate with external authentication system (documented separately)
- JWT tokens for API authentication
- Session management on backend
- Role-based access control (RBAC)

**Security Requirements:**
- No credentials in code or version control
- Environment variables for secrets
- HTTPS only in production
- CSRF protection for mutation operations

---

## VIII. Architectural Principles

### 8.1 Overall Architecture: Modular Monolith

**Current State (Phase 1):**
- Single Next.js application with modular structure
- Each dashboard is an isolated module within the monolith
- Shared core services (auth, database, utilities)
- Clear module boundaries for future extraction

**Future State (Phase 2):**
- Extract mature dashboards into microservices
- API Gateway for unified access
- Shared authentication and user management service
- Event-driven communication between services

**Guiding Principle**: Build for monolith, design for microservices.

### 8.2 Module Structure

**Directory Organization:**
```
/app
  /(dashboards)
    /roadmap              # Roadmap dashboard module
      /components         # Dashboard-specific components
      /lib                # Dashboard-specific utilities
      /api                # Dashboard-specific API routes (if any)
      page.tsx            # Main dashboard page
      layout.tsx          # Dashboard layout
    /[future-dashboard]   # Future dashboard modules
  /api                    # Shared API routes
  /components             # Shared UI components
  /lib                    # Shared utilities and services
/docs                     # Documentation
/prisma                   # Database schema and migrations
/public                   # Static assets
```

**Module Boundaries:**
- Each dashboard has its own directory
- Dashboards do NOT directly import from other dashboards
- Shared code lives in `/app/components` or `/app/lib`
- Cross-dashboard communication through:
  - Shared database (via metadata)
  - Shared API routes
  - URL parameters for navigation

### 8.3 API-First Design

**Internal APIs:**
Even within the monolith, expose functionality through API routes:
- `/api/roadmaps` - Roadmap CRUD operations
- `/api/products` - Product metadata
- `/api/users` - User management (future)

**Benefits:**
- Clear contracts between modules
- Easy to extract into separate services later
- Testable independently
- Enables future frontend alternatives (mobile apps)

**API Standards:**
- RESTful design (resources, HTTP verbs)
- JSON request/response bodies
- Consistent error format
- Versioning strategy (e.g., `/api/v1/roadmaps`)

### 8.4 Database Design Principles

**Schema Design:**
- **Normalization**: Aim for 3NF (third normal form) unless performance dictates denormalization
- **Metadata Linking**: Foreign key relationships between dashboards' entities
- **Soft Deletes**: Use `deleted_at` timestamp instead of hard deletes for audit trail
- **Timestamps**: Every table has `created_at` and `updated_at`

**Multi-Tenancy:**
- Design for multi-user access from the start
- User ID foreign key on all user-created data
- Row-level security policies (RLS) in PostgreSQL

**External Database Integration:**
- Adapter pattern for different database types
- ETL processes for syncing external data locally (if needed)
- Clear separation between local and external tables

**Migration Strategy:**
- All schema changes through migrations (no manual SQL in production)
- Migrations are reversible when possible
- Test migrations on staging before production
- Document breaking changes in migration comments

### 8.5 Separation of Concerns

**Layered Architecture:**
1. **Presentation Layer** (React components)
   - UI rendering and user interactions
   - No business logic or direct database access

2. **Application Layer** (API routes, server actions)
   - Business logic and orchestration
   - Input validation and authorization
   - Calls data layer

3. **Data Layer** (Database queries, external APIs)
   - Database operations (CRUD)
   - External API integrations
   - Data transformation

**Example Flow:**
```
User clicks "Add Roadmap Item"
  ↓
RoadmapEditor component (Presentation)
  ↓
POST /api/roadmaps (Application)
  ↓
createRoadmapItem() function (Data)
  ↓
PostgreSQL INSERT query
```

**Benefits:**
- Easier testing (mock each layer)
- Clear responsibilities
- Easier to refactor

### 8.6 Error Handling Architecture

**Error Hierarchy:**
```typescript
// Base error class
class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

// Specific error types
class ValidationError extends AppError { }
class NotFoundError extends AppError { }
class UnauthorizedError extends AppError { }
class DatabaseError extends AppError { }
```

**Error Handling Strategy:**
- Application code throws specific error types
- Global error handler catches and formats errors
- User-friendly messages in UI
- Detailed logs for debugging (server-side only)

**API Error Response Format:**
```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Product with ID prod-123 not found",
    "statusCode": 404,
    "details": { }
  }
}
```

### 8.7 Security Principles

**Defense in Depth:**
- Input validation on client AND server
- Parameterized queries (SQL injection prevention)
- CSRF tokens for mutations
- Rate limiting on API routes
- Content Security Policy headers

**Access Control:**
- Authenticate first (who are you?)
- Authorize second (what can you do?)
- Check permissions at API layer, not just UI
- Principle of least privilege

**Data Protection:**
- Encrypt sensitive data at rest
- Use HTTPS in production
- No credentials in logs
- Sanitize user input before display (XSS prevention)

### 8.8 Scalability Principles

**Horizontal Scaling:**
- Stateless API routes (no in-memory sessions)
- Use external session store (Redis) if needed
- Database connection pooling

**Caching Strategy:**
- Static assets cached at CDN
- API responses cached when appropriate (React Query)
- Database query results cached for expensive operations
- Cache invalidation on data mutations

**Data Partitioning:**
- Design for potential sharding (e.g., by product ID)
- Avoid cross-partition queries when possible

---

## IX. Code Review Process

### 9.1 Manual `/code-review` Command

**Purpose**: AI-assisted code review analyzing security, performance, constitution adherence, and change summary.

**Command Prompt for Claude:**

```
You are conducting a comprehensive code review. Please analyze the code changes and provide feedback in the following four sections:

## Section 1: Security Review
Analyze for:
- SQL injection vulnerabilities (check for parameterized queries)
- XSS vulnerabilities (check for input sanitization)
- Authentication/authorization bypasses
- Exposed secrets or credentials in code
- Insecure dependencies (check package.json for known vulnerabilities)
- Missing input validation
- Improper error handling that leaks sensitive information
- CSRF protection for mutations

## Section 2: Performance & Efficiency Review
Analyze for:
- Inefficient algorithms or data structures (O(n²) or worse)
- Missing database indexes on foreign keys or frequently queried fields
- N+1 query patterns (loops with database queries)
- Unnecessary re-renders in React (missing memo, useMemo, useCallback)
- Large bundle size additions (dependencies > 50KB)
- Synchronous blocking operations
- Missing pagination on large data sets
- Inefficient external database connections

## Section 3: Constitution Adherence Review
Check compliance with:
- TypeScript strict mode and no 'any' types
- Naming conventions (PascalCase components, camelCase functions, UPPER_SNAKE_CASE constants)
- File length limits (< 300 lines)
- Function length limits (< 50 lines)
- Test coverage (80%+ for new code)
- JSDoc documentation for public APIs
- Code organization (DRY principle, single responsibility)
- Component composition patterns
- State management approach (React Query, Zustand, Context)
- Accessibility standards (WCAG 2.1 AA)
- Lessons learned reviewed (check /docs/LESSONS_LEARNED.md for similar issues)

## Section 4: Change Summary
Provide:
- List of changed files and their purposes
- New features added
- Bug fixes implemented
- Breaking changes (if any)
- Impact assessment (which modules/components affected)
- Required documentation updates
- Required changelog updates
- Suggested test scenarios

---

For each section, provide:
- ✅ Passed checks (brief)
- ⚠️ Warnings (medium priority issues)
- ❌ Critical issues (must fix before merge)
- 💡 Suggestions (optional improvements)

Format output in clear markdown with severity indicators.
```

**When to Use:**
- Before requesting peer review on any PR
- After making significant changes
- When unsure if code meets standards

**How to Execute:**
1. Stage/commit all changes
2. Provide Claude with the changed files or git diff
3. Use the prompt above
4. Review AI-generated feedback
5. Address issues before peer review

### 9.2 Post-Review Actions

**Required Actions:**
1. Address all CRITICAL (❌) security issues before merging
2. Resolve HIGH priority performance issues or document why not
3. Fix all constitution violations or get approval for exception
4. Update changelog based on change summary
5. Add entry to lessons learned if fixing a bug

**Optional Actions:**
- Address MEDIUM/LOW priority suggestions
- Refactor for clarity based on feedback
- Add additional tests if coverage marginal

### 9.3 Peer Review Process

**After `/code-review`:**
1. Create pull request with:
   - Clear title and description
   - Link to related issues/tickets
   - Screenshots/videos for UI changes
   - Test results and coverage report
   - `/code-review` results summary

2. Assign at least one supporting team member as reviewer

3. Reviewer checks:
   - Code logic and correctness
   - Alignment with requirements
   - Test quality and coverage
   - Documentation completeness
   - `/code-review` feedback addressed

4. Address review comments, re-request review

5. Merge after approval and passing CI checks

### 9.4 Review Checklist for Reviewers

**Code Quality:**
- [ ] Follows TypeScript and React best practices
- [ ] Naming is clear and consistent
- [ ] No code smells (long functions, deep nesting)
- [ ] DRY principle followed

**Functionality:**
- [ ] Code does what PR description claims
- [ ] Edge cases handled
- [ ] Error handling implemented
- [ ] User experience is smooth

**Testing:**
- [ ] Tests included for new code
- [ ] Tests are meaningful (not just for coverage)
- [ ] Coverage meets 80% threshold
- [ ] Tests pass locally

**Documentation:**
- [ ] Public APIs documented with JSDoc
- [ ] Complex logic has explanatory comments
- [ ] README or docs updated if needed
- [ ] Architecture docs updated for structural changes

**Security:**
- [ ] No security vulnerabilities introduced
- [ ] User input validated and sanitized
- [ ] No secrets in code

**Performance:**
- [ ] No obvious performance issues
- [ ] Database queries optimized
- [ ] React rendering optimized

**Constitution:**
- [ ] Lessons learned reviewed
- [ ] Changelog updated
- [ ] All standards followed or exceptions documented

---

## X. Change Management

### 10.1 Changelog Maintenance

**Location**: `/CHANGELOG.md`

**Format**: Follow [Keep a Changelog](https://keepachangelog.com/) standard

**Structure:**
```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New features that have been added

### Changed
- Changes to existing functionality

### Deprecated
- Features that will be removed in upcoming releases

### Removed
- Features that have been removed

### Fixed
- Bug fixes

### Security
- Security improvements or vulnerability fixes

## [1.0.0] - 2025-10-28

### Added
- Initial roadmap dashboard implementation
- PostgreSQL database schema
- Basic authentication mock
- ...
```

**Update Frequency:**
- Every PR must update the `[Unreleased]` section
- On release, move `[Unreleased]` items to versioned section

**Entry Format:**
```markdown
### Added
- Add ability to filter roadmap items by date range (#123) @username
- Implement metadata linking between products and roadmaps (#124) @username
```

### 10.2 Version Numbering

**Semantic Versioning (SemVer):**
- **MAJOR**: Breaking changes (incompatible API changes)
- **MINOR**: New features (backward-compatible)
- **PATCH**: Bug fixes (backward-compatible)

**Examples:**
- `1.0.0` → `2.0.0`: Breaking: Changed API response format
- `1.0.0` → `1.1.0`: Added new dashboard module
- `1.0.0` → `1.0.1`: Fixed date formatting bug

### 10.3 Release Process

**Pre-Release:**
1. Review and test all `[Unreleased]` changes
2. Update version in `package.json`
3. Move `[Unreleased]` to versioned section in CHANGELOG
4. Create Git tag: `git tag -a v1.0.0 -m "Version 1.0.0"`
5. Run full test suite
6. Deploy to staging for final testing

**Release:**
1. Deploy to production
2. Monitor for errors (first 24 hours)
3. Announce release to team/users

**Post-Release:**
1. Document any issues in lessons learned
2. Plan next iteration

### 10.4 Breaking Changes Communication

**When Introducing Breaking Changes:**
1. Document in CHANGELOG under `### BREAKING CHANGES` section
2. Provide migration guide in `/docs/MIGRATIONS.md`
3. Include deprecation warnings in code (if possible)
4. Communicate to team in advance

**Example Migration Guide:**
```markdown
# Migration Guide: v1.x to v2.0

## Breaking Changes

### API Response Format Changed

**Before (v1.x):**
```json
{
  "data": { ... },
  "status": "success"
}
```

**After (v2.0):**
```json
{
  "roadmap": { ... },
  "metadata": { ... }
}
```

**Migration Steps:**
1. Update all API clients to expect new response format
2. Replace `response.data` with `response.roadmap`
3. ...
```

---

## XI. Constitution Amendments

### 11.1 Amendment Process

**When to Amend:**
- New patterns emerge that should be standardized
- Technology constraints change
- Team grows and needs more structure
- Lessons learned reveal gaps in constitution

**How to Propose Amendment:**
1. Create issue titled "Constitution Amendment: [Topic]"
2. Describe proposed change and rationale
3. Discuss with team
4. Vote if necessary
5. Update constitution document
6. Announce change to team

### 11.2 Constitution Review Schedule

- **Quarterly Review**: Team reviews constitution for relevance and clarity
- **Annual Overhaul**: Major review after year of lessons learned
- **Ad-hoc**: When major architectural shifts occur

---

## XII. Enforcement and Accountability

### 12.1 Constitution Violations

**Minor Violations** (style, formatting):
- Address in code review
- Fix before merging

**Major Violations** (missing tests, security issues):
- Block PR until resolved
- Discuss with team if intentional exception needed

**Repeated Violations**:
- Additional training or pair programming
- Update constitution if pattern reveals gap

### 12.2 Exceptions Process

**When to Request Exception:**
- Urgent hotfix required (skip full testing in emergency)
- Third-party library conflict (can't meet style guide)
- Experimental feature (temporarily relaxed standards)

**How to Request:**
1. Document reason in PR description
2. Tag exception: `[CONSTITUTION-EXCEPTION]`
3. Get approval from project lead or team consensus
4. Create follow-up task to resolve technical debt

### 12.3 Success Metrics

**Measure Constitution Effectiveness:**
- Bug rate (should decrease over time)
- Code review time (should stabilize/decrease)
- Test coverage (should remain ≥80%)
- Performance metrics (should meet targets)
- Team satisfaction (periodic surveys)

---

## XIII. Conclusion

This constitution is a living document designed to ensure quality, consistency, and maintainability as our dashboard ecosystem grows. All contributors are expected to understand and follow these principles. When in doubt, prioritize:

1. **User experience** over developer convenience
2. **Security** over speed of delivery
3. **Maintainability** over clever code
4. **Documentation** over assumptions
5. **Testing** over "it works on my machine"

**Questions or Clarifications**: Open an issue or discuss with the team.

**Document Version**: 1.0.0  
**Last Updated**: 2025-10-28  
**Next Review**: 2026-01-28