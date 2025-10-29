# Tasks: Product Roadmap Creation Tool

**Input**: Design documents from `/specs/001-product-roadmap-tool/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Tests**: Tests are NOT explicitly requested in the specification, so test tasks are excluded. Focus on implementation tasks only.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Based on plan.md, this is a Next.js 14+ App Router web application with the following structure:
- Frontend: `app/` (Next.js App Router pages and components)
- Components: `components/` (shared UI components)
- Backend: `app/api/` (API routes)
- Library code: `lib/` (utilities, hooks, stores, database)
- Database: `prisma/` (Prisma schema and migrations)
- Tests: `tests/` (unit, integration, e2e)
- Documentation: `docs/` (architecture documentation)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Initialize Next.js 14+ project with TypeScript and App Router in roadmap_project/
- [ ] T002 [P] Install core dependencies: React 18+, TypeScript 5+, Tailwind CSS, shadcn/ui
- [ ] T003 [P] Install state management: React Query (TanStack Query), Zustand
- [ ] T004 [P] Install drag-and-drop: @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
- [ ] T005 [P] Install database: Prisma, PostgreSQL client, bcryptjs for password hashing
- [ ] T006 [P] Install auth utilities: jose (JWT for Edge compatibility)
- [ ] T007 Configure Tailwind CSS with custom theme in tailwind.config.ts
- [ ] T008 [P] Setup ESLint and Prettier configuration in .eslintrc.json and .prettierrc
- [ ] T009 [P] Initialize shadcn/ui and add base components (button, card, input, dialog, dropdown-menu) in components/ui/
- [ ] T010 Create environment variable template .env.example with DATABASE_URL, DIRECT_URL, AUTH_MODE, JWT_SECRET, NODE_ENV, NEXT_PUBLIC_API_URL
- [ ] T011 Create .gitignore to exclude .env, node_modules, .next, prisma/migrations (except initial)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Foundation

- [ ] T012 Create Prisma schema with all entities in prisma/schema.prisma: User, Roadmap, Product, Permission, WriteLock, Phase, DashboardLink
- [ ] T013 Add enums to Prisma schema: UserRole, PermissionLevel, XAxisMode, YAxisType
- [ ] T014 Add indexes and constraints per data-model.md: unique constraints, foreign keys, check constraints for date validation
- [ ] T015 Generate initial Prisma migration with `npx prisma migrate dev --name init`
- [ ] T016 Generate Prisma Client with `npx prisma generate`
- [ ] T017 Create Prisma client singleton in lib/db/prisma.ts with proper Next.js hot reload handling

### Authentication Foundation

- [ ] T018 [P] Create mock user database in lib/auth/mock-users.ts with admin, editor, viewer users
- [ ] T019 [P] Create JWT utilities in lib/auth/jwt.ts: signToken, verifyToken using jose library
- [ ] T020 [P] Create permission check utilities in lib/auth/check-permission.ts: checkPermission function with role hierarchy
- [ ] T021 Create authentication middleware in middleware.ts for route protection, token verification, and user context injection
- [ ] T022 [P] Create POST /api/auth/login route in app/api/auth/login/route.ts with mock user validation
- [ ] T023 [P] Create POST /api/auth/logout route in app/api/auth/logout/route.ts to clear auth cookie
- [ ] T024 [P] Create GET /api/auth/me route in app/api/auth/me/route.ts to return current user

### Shared Types and Utilities

- [ ] T025 [P] Copy contracts/types.ts to lib/types/api.ts for shared TypeScript types
- [ ] T026 [P] Create date validation utilities in lib/utils/date-validator.ts: validateDateOrder, toISODateString, parseISODate
- [ ] T027 [P] Create API response utilities in lib/utils/api-response.ts: success and error response helpers
- [ ] T028 [P] Create validation utilities in lib/utils/validation.ts using contracts/types.ts ValidationRules

### Database Seed Data

- [ ] T029 Create seed script in prisma/seed.ts with: admin user, sample roadmap with phases, 10 sample products, permissions
- [ ] T030 Configure package.json to run seed script: add "prisma" section with "seed" command
- [ ] T031 Run seed script with `npx prisma db seed` to populate development data

### API Error Handling

- [ ] T032 Create global error handler in lib/utils/error-handler.ts for API routes
- [ ] T033 Create custom error classes in lib/utils/custom-errors.ts: ValidationError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError

### React Query Setup

- [ ] T034 Create React Query provider in lib/providers/query-provider.tsx with configuration
- [ ] T035 Add QueryClientProvider to root layout in app/layout.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Product Roadmap (Priority: P1) 🎯 MVP

**Goal**: Users can view products on a two-dimensional chart with configurable axes

**Independent Test**: Load the application, select axis preferences (time/phase on x-axis, category/investment/type on y-axis), and verify that products are displayed with all required information (codename, part number, description, sample date, release date)

### API Implementation for User Story 1

- [ ] T036 [P] [US1] Create GET /api/roadmaps route in app/api/roadmaps/route.ts to list accessible roadmaps with pagination
- [ ] T037 [P] [US1] Create GET /api/roadmaps/[id] route in app/api/roadmaps/[id]/route.ts to fetch roadmap with products and phases
- [ ] T038 [P] [US1] Create GET /api/roadmaps/[id]/products route in app/api/roadmaps/[roadmapId]/products/route.ts to list products for roadmap
- [ ] T039 [P] [US1] Create GET /api/products/[id] route in app/api/products/[productId]/route.ts to fetch product details

### Data Fetching Hooks for User Story 1

- [ ] T040 [P] [US1] Create useRoadmapList hook in lib/hooks/useRoadmapData.ts with React Query for roadmap listing
- [ ] T041 [P] [US1] Create useRoadmapDetails hook in lib/hooks/useRoadmapData.ts with polling (3s interval) for real-time updates
- [ ] T042 [P] [US1] Create useProducts hook in lib/hooks/useRoadmapData.ts to fetch products for roadmap

### UI Components for User Story 1 - Roadmap Canvas

- [ ] T043 [P] [US1] Create RoadmapCanvas component in components/roadmap/RoadmapCanvas.tsx with CSS Grid layout
- [ ] T044 [US1] Implement time-based x-axis rendering in RoadmapCanvas.tsx using grid-cols dynamic calculation
- [ ] T045 [US1] Implement phase-based x-axis rendering in RoadmapCanvas.tsx with dynamic column count
- [ ] T046 [US1] Implement y-axis rendering in RoadmapCanvas.tsx with yAxisValues from roadmap config
- [ ] T047 [US1] Create grid cells as drop zones in RoadmapCanvas.tsx with data attributes for position

### UI Components for User Story 1 - Product Display

- [ ] T048 [P] [US1] Create ProductCard component in components/roadmap/ProductCard.tsx to display codename, part number, description, dates
- [ ] T049 [US1] Add hover state to ProductCard.tsx to show full product details
- [ ] T050 [US1] Position ProductCard components in grid cells based on xPosition and yPosition

### UI Components for User Story 1 - Axis Configuration

- [ ] T051 [P] [US1] Create AxisSelector component in components/roadmap/AxisSelector.tsx for x-axis mode toggle (time/phase)
- [ ] T052 [US1] Create y-axis type selector in AxisSelector.tsx (category/investment/productType)
- [ ] T053 [US1] Connect AxisSelector to roadmap config state with Zustand store in lib/stores/roadmapStore.ts
- [ ] T054 [US1] Implement roadmap re-rendering when axis configuration changes

### Pages for User Story 1

- [ ] T055 [US1] Create roadmap list page in app/(dashboard)/roadmaps/page.tsx with roadmap cards
- [ ] T056 [US1] Create roadmap detail page in app/(dashboard)/roadmaps/[roadmapId]/page.tsx with RoadmapCanvas
- [ ] T057 [P] [US1] Create dashboard layout in app/(dashboard)/layout.tsx with header and navigation
- [ ] T058 [P] [US1] Create Header component in components/layout/Header.tsx with app title and user info

### Styling and Layout

- [ ] T059 [P] [US1] Style ProductCard component with Tailwind CSS: borders, padding, shadows, hover effects
- [ ] T060 [US1] Style RoadmapCanvas grid with Tailwind CSS: grid borders, cell spacing, axis labels
- [ ] T061 [US1] Implement responsive layout for 1280x720 minimum resolution with horizontal scroll for many time slots

### Product Overlap Handling

- [ ] T062 [US1] Implement auto-arrange logic in RoadmapCanvas.tsx to stack products in same grid cell
- [ ] T063 [US1] Add z-index management for overlapping products using CSS flexbox stack layout

**Checkpoint**: User Story 1 complete - Users can view roadmaps with all products displayed correctly

---

## Phase 4: User Story 5 - User Authentication and Access Control (Priority: P2)

**Goal**: Users log in with credentials and gain access to roadmaps based on permissions (viewer/editor/admin)

**Independent Test**: Log in with valid credentials, verify access to authorized roadmaps, attempt to edit as a viewer (should be blocked), edit as an editor (should succeed with write-lock)

**Note**: This is implemented second (despite being US5) because authentication/authorization are foundational for multi-user features

### Login Page

- [ ] T064 [P] [US5] Create login page in app/(auth)/login/page.tsx with email/password form
- [ ] T065 [P] [US5] Create auth layout in app/(auth)/layout.tsx for public auth pages
- [ ] T066 [US5] Implement login form validation in login/page.tsx with client-side checks
- [ ] T067 [US5] Connect login form to POST /api/auth/login endpoint with error handling

### Authentication State Management

- [ ] T068 [P] [US5] Create auth Zustand store in lib/stores/authStore.ts with user state and login/logout actions
- [ ] T069 [US5] Create useAuth hook in lib/hooks/useAuth.ts to access auth store and current user
- [ ] T070 [US5] Implement auto-redirect to login page when unauthenticated using middleware

### Permission-Based UI

- [ ] T071 [P] [US5] Create usePermission hook in lib/hooks/usePermission.ts to check user permission level for roadmap
- [ ] T072 [US5] Add permission checks to roadmap detail page: hide edit controls for viewers
- [ ] T073 [US5] Show read-only banner for viewers in app/(dashboard)/roadmaps/[roadmapId]/page.tsx
- [ ] T074 [US5] Display current user role and permissions in Header component

### Write-Lock Status Display

- [ ] T075 [P] [US5] Create GET /api/roadmaps/[id]/lock route in app/api/roadmaps/[roadmapId]/lock/route.ts to check lock status
- [ ] T076 [P] [US5] Create useWriteLockStatus hook in lib/hooks/useWriteLock.ts with 2-second polling
- [ ] T077 [US5] Display lock status banner in roadmap detail page showing who holds the lock
- [ ] T078 [US5] Show "Request Edit Access" button for editors when roadmap is unlocked

### Permission Management UI (Admin)

- [ ] T079 [P] [US5] Create GET /api/roadmaps/[id]/permissions route in app/api/roadmaps/[roadmapId]/permissions/route.ts to list permissions
- [ ] T080 [P] [US5] Create POST /api/roadmaps/[id]/permissions route to grant permission (admin only)
- [ ] T081 [P] [US5] Create DELETE /api/permissions/[id] route in app/api/permissions/[permissionId]/route.ts to revoke permission
- [ ] T082 [US5] Create PermissionManager component in components/roadmap/PermissionManager.tsx for admins
- [ ] T083 [US5] Add PermissionManager to roadmap detail page (admin only)

**Checkpoint**: User Story 5 complete - Authentication and role-based access control working

---

## Phase 5: User Story 2 - Reorganize Products via Drag-and-Drop (Priority: P2)

**Goal**: Users can drag product elements to new positions on the roadmap to update timelines and categories

**Independent Test**: Display a roadmap with multiple products, drag a product from one position to another (changing time/phase and/or category), verify position is updated and persisted

**Dependencies**: Requires US1 (view roadmap) and US5 (write-lock for editing)

### API Implementation for User Story 2

- [ ] T084 [P] [US2] Create PATCH /api/products/[id]/position route in app/api/products/[productId]/position/route.ts to update position with write-lock check
- [ ] T085 [US2] Add validation to position endpoint: verify xPosition and yPosition are valid for parent roadmap

### Write-Lock Management

- [ ] T086 [P] [US2] Create POST /api/roadmaps/[id]/lock route in app/api/roadmaps/[roadmapId]/lock/route.ts to acquire lock with first-wins atomic transaction
- [ ] T087 [P] [US2] Create DELETE /api/roadmaps/[id]/lock route to release lock (lock holder only)
- [ ] T088 [P] [US2] Create PUT /api/roadmaps/[id]/lock/heartbeat route to send heartbeat and extend lock expiry
- [ ] T089 [US2] Implement stale lock detection in lock routes: check lastHeartbeat timestamp (3 minutes threshold)

### Write-Lock Client Hooks

- [ ] T090 [P] [US2] Create useAcquireLock mutation in lib/hooks/useWriteLock.ts to request write-lock
- [ ] T091 [P] [US2] Create useReleaseLock mutation in lib/hooks/useWriteLock.ts to release lock
- [ ] T092 [US2] Create useHeartbeat hook in lib/hooks/useWriteLock.ts with 30-second interval heartbeat sender
- [ ] T093 [US2] Implement lock expiry countdown in useWriteLock.ts with 60-second grace dialog

### Lock Expiry Dialog

- [ ] T094 [US2] Create LockExpiryDialog component in components/roadmap/LockExpiryDialog.tsx with 3 options: Save, Discard, Extend
- [ ] T095 [US2] Implement 60-second countdown timer in LockExpiryDialog.tsx
- [ ] T096 [US2] Handle timeout action: discard changes and release lock automatically

### Drag-and-Drop Implementation

- [ ] T097 [P] [US2] Create DragDropProvider component in components/roadmap/DragDropProvider.tsx wrapping DndContext from dnd-kit
- [ ] T098 [US2] Configure grid snapping modifier in DragDropProvider.tsx using createSnapModifier
- [ ] T099 [US2] Make ProductCard draggable in ProductCard.tsx using useDraggable hook from dnd-kit
- [ ] T100 [US2] Make grid cells droppable in RoadmapCanvas.tsx using useDroppable hook from dnd-kit
- [ ] T101 [US2] Implement onDragEnd handler in DragDropProvider.tsx to calculate new position from drop zone

### Optimistic Updates

- [ ] T102 [US2] Create useUpdateProductPosition mutation in lib/hooks/useProducts.ts with React Query optimistic update
- [ ] T103 [US2] Implement optimistic UI update in useUpdateProductPosition: immediately update product position in cache
- [ ] T104 [US2] Implement rollback on error in useUpdateProductPosition: revert cache to previous state
- [ ] T105 [US2] Add visual feedback during drag: transform translate3d, z-index elevation, drop zone highlighting

### Network Resilience

- [ ] T106 [P] [US2] Implement offline detection in lib/hooks/useNetworkStatus.ts using navigator.onLine
- [ ] T107 [US2] Buffer drag-and-drop changes locally when offline in useUpdateProductPosition
- [ ] T108 [US2] Implement 60-second reconnection attempt with automatic sync in useNetworkStatus
- [ ] T109 [US2] Show user prompt if reconnection fails: "Save offline or discard?"

### Edit Mode UI

- [ ] T110 [US2] Add "Enter Edit Mode" button to roadmap detail page (editors only)
- [ ] T111 [US2] Connect edit button to useAcquireLock mutation with conflict handling
- [ ] T112 [US2] Show edit mode banner when lock is held by current user
- [ ] T113 [US2] Add "Exit Edit Mode" button that releases lock and stops heartbeat
- [ ] T114 [US2] Disable drag-and-drop when not in edit mode (viewer or editor without lock)

**Checkpoint**: User Story 2 complete - Drag-and-drop repositioning with write-lock working

---

## Phase 6: User Story 3 - Add New Products to Roadmap (Priority: P3)

**Goal**: Users can create new product entries with all required information and place them on the roadmap

**Independent Test**: Click "Add Product" action, enter product details (codename, part number, description, sample date, release date), select initial position, verify new product appears on roadmap

**Dependencies**: Requires US1 (view roadmap) and US5 (write-lock for editing)

### API Implementation for User Story 3

- [ ] T115 [P] [US3] Create POST /api/products route in app/api/products/route.ts to create new product with write-lock check
- [ ] T116 [US3] Add validation to product creation: required fields, sampleDate <= releaseDate, unique partNumber
- [ ] T117 [US3] Validate xPosition and yPosition match parent roadmap configuration

### Product Creation Form

- [ ] T118 [P] [US3] Create AddProductDialog component in components/roadmap/AddProductDialog.tsx with shadcn/ui Dialog
- [ ] T119 [US3] Create form fields in AddProductDialog: codename, partNumber, description (textarea), sampleDate, releaseDate
- [ ] T120 [US3] Add position selectors in AddProductDialog: xPosition dropdown, yPosition dropdown based on roadmap config
- [ ] T121 [US3] Implement client-side validation in AddProductDialog: required fields, date order, length constraints
- [ ] T122 [US3] Show validation errors inline in AddProductDialog with clear error messages

### Product Creation Hook

- [ ] T123 [US3] Create useCreateProduct mutation in lib/hooks/useProducts.ts with React Query
- [ ] T124 [US3] Implement optimistic update in useCreateProduct: add product to cache immediately
- [ ] T125 [US3] Handle creation errors in useCreateProduct: show error toast, rollback cache

### UI Integration

- [ ] T126 [US3] Add "Add Product" button to roadmap detail page (editors with lock only)
- [ ] T127 [US3] Connect "Add Product" button to AddProductDialog open trigger
- [ ] T128 [US3] Show success toast when product is created successfully
- [ ] T129 [US3] Automatically position new product in correct grid cell after creation

**Checkpoint**: User Story 3 complete - Users can add new products to roadmap

---

## Phase 7: User Story 4 - Edit Product Information (Priority: P3)

**Goal**: Users can update product details such as dates, descriptions, or part numbers

**Independent Test**: Select an existing product, modify one or more fields (codename, part number, description, dates), save changes, verify updated information is displayed and persisted

**Dependencies**: Requires US1 (view roadmap) and US5 (write-lock for editing)

### API Implementation for User Story 4

- [ ] T130 [P] [US4] Create PUT /api/products/[id] route in app/api/products/[productId]/route.ts to update product with write-lock check
- [ ] T131 [US4] Add validation to product update: sampleDate <= releaseDate, unique partNumber (if changed)
- [ ] T132 [US4] Recalculate position if dates changed and roadmap is in time mode

### Product Editing Form

- [ ] T133 [P] [US4] Create EditProductDialog component in components/roadmap/EditProductDialog.tsx with pre-filled form fields
- [ ] T134 [US4] Populate form fields in EditProductDialog with current product data
- [ ] T135 [US4] Allow editing all fields: codename, partNumber, description, sampleDate, releaseDate, xPosition, yPosition
- [ ] T136 [US4] Implement client-side validation in EditProductDialog same as AddProductDialog

### Product Update Hook

- [ ] T137 [US4] Create useUpdateProduct mutation in lib/hooks/useProducts.ts with React Query
- [ ] T138 [US4] Implement optimistic update in useUpdateProduct: update product in cache immediately
- [ ] T139 [US4] Handle update errors in useUpdateProduct: show error toast, rollback cache

### UI Integration

- [ ] T140 [US4] Add edit action to ProductCard: double-click or context menu "Edit"
- [ ] T141 [US4] Connect edit action to EditProductDialog open trigger (editors with lock only)
- [ ] T142 [US4] Update ProductCard display immediately after successful edit
- [ ] T143 [US4] Handle position change: if dates changed, move product to new grid cell

### Product Deletion

- [ ] T144 [P] [US4] Create DELETE /api/products/[id] route in app/api/products/[productId]/route.ts with write-lock check
- [ ] T145 [P] [US4] Create useDeleteProduct mutation in lib/hooks/useProducts.ts
- [ ] T146 [US4] Add "Delete Product" button to EditProductDialog with confirmation dialog
- [ ] T147 [US4] Remove product from cache immediately after deletion

**Checkpoint**: User Story 4 complete - Users can edit and delete product information

---

## Phase 8: User Story 6 - Manage Multiple Roadmaps (Priority: P3)

**Goal**: Users can switch between multiple roadmaps and admins can create new roadmaps and manage permissions

**Independent Test**: Create multiple roadmaps with different names, assign different products to each, switch between them, verify correct products are displayed for each roadmap

**Dependencies**: Requires US1 (view roadmap) and US5 (permissions)

### API Implementation for User Story 6

- [ ] T148 [P] [US6] Create POST /api/roadmaps route in app/api/roadmaps/route.ts to create new roadmap (admin only)
- [ ] T149 [P] [US6] Create PUT /api/roadmaps/[id] route in app/api/roadmaps/[id]/route.ts to update roadmap config (admin/editor)
- [ ] T150 [P] [US6] Create DELETE /api/roadmaps/[id] route to delete roadmap (admin only)
- [ ] T151 [US6] Validate roadmap creation: name length, yAxisValues (1-15 items), unique values

### Roadmap Creation Form

- [ ] T152 [P] [US6] Create CreateRoadmapDialog component in components/roadmap/CreateRoadmapDialog.tsx
- [ ] T153 [US6] Add form fields in CreateRoadmapDialog: name, description (optional), xAxisMode, yAxisType, yAxisValues array
- [ ] T154 [US6] Implement dynamic yAxisValues input in CreateRoadmapDialog: add/remove values, reorder
- [ ] T155 [US6] Validate yAxisValues: min 1, max 15, no duplicates

### Roadmap Mutations

- [ ] T156 [P] [US6] Create useCreateRoadmap mutation in lib/hooks/useRoadmapData.ts
- [ ] T157 [P] [US6] Create useUpdateRoadmap mutation in lib/hooks/useRoadmapData.ts
- [ ] T158 [P] [US6] Create useDeleteRoadmap mutation in lib/hooks/useRoadmapData.ts

### Roadmap List Page Enhancements

- [ ] T159 [US6] Add "Create Roadmap" button to roadmap list page (admins only)
- [ ] T160 [US6] Connect "Create Roadmap" button to CreateRoadmapDialog
- [ ] T161 [US6] Display roadmap cards with name, description, product count, last updated
- [ ] T162 [US6] Add roadmap actions to cards: Edit Config (admin), Delete (admin), View

### Roadmap Switcher

- [ ] T163 [P] [US6] Create RoadmapSwitcher dropdown component in components/layout/RoadmapSwitcher.tsx
- [ ] T164 [US6] Add RoadmapSwitcher to Header component with current roadmap name
- [ ] T165 [US6] Populate RoadmapSwitcher with user's accessible roadmaps from useRoadmapList
- [ ] T166 [US6] Handle roadmap selection in RoadmapSwitcher: navigate to selected roadmap detail page

### Phase Management (Phase-based X-Axis)

- [ ] T167 [P] [US6] Create API routes for phases: GET, POST, PUT, DELETE /api/roadmaps/[id]/phases in app/api/roadmaps/[roadmapId]/phases/
- [ ] T168 [P] [US6] Create PhaseManager component in components/roadmap/PhaseManager.tsx for adding/editing/reordering phases
- [ ] T169 [US6] Add PhaseManager to roadmap config dialog (admin only)
- [ ] T170 [US6] Update RoadmapCanvas to use phases when xAxisMode is "phase"

**Checkpoint**: User Story 6 complete - Multiple roadmap management working

---

## Phase 9: User Story 7 - Navigate to Related Dashboards (Priority: P4)

**Goal**: Users can click on products to see related dashboard links and navigate to associated dashboards

**Independent Test**: Click on a product element, view available related dashboard links, select a dashboard, verify navigation to target dashboard with appropriate context

**Dependencies**: Requires US1 (view roadmap)

**Note**: Dashboard hierarchy is still under definition, so this is minimal implementation for metadata storage

### API Implementation for User Story 7

- [ ] T171 [P] [US7] Create GET /api/products/[id]/links route in app/api/products/[productId]/links/route.ts to fetch dashboard links
- [ ] T172 [P] [US7] Create POST /api/products/[id]/links route to add dashboard link (admin/editor)
- [ ] T173 [P] [US7] Create DELETE /api/products/[id]/links/[linkId] route to remove dashboard link

### Dashboard Link Management

- [ ] T174 [P] [US7] Create DashboardLinkManager component in components/roadmap/DashboardLinkManager.tsx
- [ ] T175 [US7] Add DashboardLinkManager to EditProductDialog (admin/editor)
- [ ] T176 [US7] Implement add link form in DashboardLinkManager: dashboardType, dashboardId, label, contextParams
- [ ] T177 [US7] Display existing links in DashboardLinkManager with remove button

### Product Click Menu

- [ ] T178 [P] [US7] Create ProductMenu component in components/roadmap/ProductMenu.tsx with shadcn/ui DropdownMenu
- [ ] T179 [US7] Add ProductMenu trigger to ProductCard: click or right-click opens menu
- [ ] T180 [US7] Display "Related Dashboards" section in ProductMenu if product has links
- [ ] T181 [US7] Display "View Details" and "Edit" (if editor) options in ProductMenu

### Navigation Implementation

- [ ] T182 [US7] Implement dashboard navigation in ProductMenu: construct URL with dashboardId and contextParams
- [ ] T183 [US7] Open dashboard in new tab or same tab based on user preference (Ctrl+click for new tab)
- [ ] T184 [US7] Show "No related dashboards" message if product has no links

**Checkpoint**: User Story 7 complete - Dashboard navigation metadata in place

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

### Documentation

- [ ] T185 [P] Create ARCHITECTURE.md in docs/ documenting Next.js structure, API design, state management
- [ ] T186 [P] Create DATABASE_SCHEMA.md in docs/ with ERD diagram and table descriptions
- [ ] T187 [P] Create API_DESIGN.md in docs/ documenting all API endpoints with examples
- [ ] T188 [P] Create AUTHENTICATION.md in docs/ explaining mock auth and production swap strategy
- [ ] T189 [P] Create DASHBOARDS.md in docs/ explaining dashboard linking architecture (placeholder)
- [ ] T190 [P] Update README.md with project overview, tech stack, and quick start instructions
- [ ] T191 Verify quickstart.md instructions work: test setup from clean environment

### Code Quality

- [ ] T192 [P] Add JSDoc comments to all public APIs in lib/
- [ ] T193 [P] Add prop-types documentation (TypeScript interfaces) to all components
- [ ] T194 Run ESLint and fix all warnings in project
- [ ] T195 Run Prettier to format all code consistently
- [ ] T196 Review and refactor: extract common patterns, remove code duplication

### Performance Optimization

- [ ] T197 [P] Add React.memo() to ProductCard component with custom comparison function
- [ ] T198 [P] Add React.memo() to grid cell components in RoadmapCanvas
- [ ] T199 Implement useMemo for product position calculations in RoadmapCanvas
- [ ] T200 Optimize re-renders: use useCallback for event handlers in drag-and-drop
- [ ] T201 Test performance with 200 products: measure render time, drag feedback latency

### Accessibility

- [ ] T202 [P] Add ARIA labels to all interactive components (buttons, dropdowns, dialogs)
- [ ] T203 [P] Implement keyboard navigation for ProductCard: Tab order, Enter to open menu
- [ ] T204 [P] Add keyboard shortcuts for drag-and-drop using dnd-kit KeyboardSensor
- [ ] T205 Test with screen reader (NVDA or VoiceOver): verify all elements are accessible

### Error Handling

- [ ] T206 [P] Add error boundaries in app layout to catch React errors
- [ ] T207 [P] Create user-friendly error pages: 404.tsx, 500.tsx, error.tsx
- [ ] T208 Implement global error logging: log errors to console in dev, to service in production
- [ ] T209 Add user-friendly error messages to all API error responses

### Security Hardening

- [ ] T210 [P] Sanitize all user inputs before storage: XSS prevention in descriptions
- [ ] T211 [P] Validate all JSONB structures (yAxisValues, metadataLinks) before saving
- [ ] T212 [P] Ensure passwordHash is never returned in API responses: exclude in Prisma selects
- [ ] T213 Add rate limiting to login endpoint to prevent brute force attacks
- [ ] T214 Add CSRF protection to all mutation endpoints (built into Next.js, verify configuration)

### Production Readiness

- [ ] T215 [P] Configure production environment variables in .env.production template
- [ ] T216 [P] Setup database connection pooler configuration: PgBouncer or Prisma Accelerate
- [ ] T217 [P] Configure CORS for production API if separate frontend domain
- [ ] T218 Test production build with `npm run build` and `npm run start`
- [ ] T219 Verify all environment variables are documented in .env.example

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup**: No dependencies - can start immediately
- **Phase 2: Foundational**: Depends on Phase 1 completion - BLOCKS all user stories
- **Phase 3: User Story 1 (P1)**: Depends on Phase 2 completion - No dependencies on other stories
- **Phase 4: User Story 5 (P2)**: Depends on Phase 2 completion - No dependencies on other stories (implemented early because auth is foundational)
- **Phase 5: User Story 2 (P2)**: Depends on Phase 2, Phase 3 (US1 for UI), Phase 4 (US5 for write-lock) - Can start after US1 and US5
- **Phase 6: User Story 3 (P3)**: Depends on Phase 2, Phase 3 (US1 for UI), Phase 4 (US5 for write-lock) - Can start after US1 and US5
- **Phase 7: User Story 4 (P3)**: Depends on Phase 2, Phase 3 (US1 for UI), Phase 4 (US5 for write-lock) - Can start after US1 and US5
- **Phase 8: User Story 6 (P3)**: Depends on Phase 2, Phase 3 (US1 for UI), Phase 4 (US5 for permissions) - Can start after US1 and US5
- **Phase 9: User Story 7 (P4)**: Depends on Phase 2, Phase 3 (US1 for UI) - Can start after US1, minimal implementation
- **Phase 10: Polish**: Depends on all desired user stories being complete

### User Story Dependencies

```
Foundation (Phase 2) ← BLOCKS ALL STORIES
    ↓
    ├─→ US1: View Roadmap (Phase 3) ← MVP Foundation
    │
    └─→ US5: Auth & Access Control (Phase 4) ← Parallel with US1
         ↓
         ├─→ US2: Drag-and-Drop (Phase 5) ← Requires US1 + US5
         ├─→ US3: Add Products (Phase 6) ← Requires US1 + US5
         ├─→ US4: Edit Products (Phase 7) ← Requires US1 + US5
         └─→ US6: Multiple Roadmaps (Phase 8) ← Requires US1 + US5

US7: Dashboard Links (Phase 9) ← Requires US1 only (minimal implementation)
```

### Within Each User Story

- API routes can run in parallel (marked [P])
- Hooks can run in parallel (marked [P])
- UI components can run in parallel (marked [P])
- Integration tasks depend on components being ready (not marked [P])
- Tests (if included) must be written and FAIL before implementation

### Parallel Opportunities

**Phase 1 (Setup)**: T002-T009 can all run in parallel (different config files)

**Phase 2 (Foundational)**:
- Database: T012-T017 are sequential (schema → migration → client)
- Auth: T018-T024 can run in parallel after T021 middleware is ready
- Utilities: T025-T033 can all run in parallel (different utility files)
- React Query: T034-T035 can run in parallel with utilities

**Phase 3 (US1)**:
- API routes: T036-T039 can all run in parallel
- Hooks: T040-T042 can all run in parallel
- Components: T043, T048, T051 can start in parallel, then integrate

**Phase 4 (US5)**:
- Login page: T064-T065 can run in parallel
- State: T068-T069 can run in parallel
- Permission UI: T071-T072 can run in parallel after T071 hook is ready
- Lock status: T075-T076 can run in parallel
- Admin API: T079-T081 can all run in parallel

**Phase 5 (US2)**:
- API routes: T084-T088 can run in parallel
- Lock hooks: T090-T091 can run in parallel
- Drag-drop: T097-T099 can run in parallel
- Network: T106 can run in parallel with other tasks

**User Story Parallelization**:
- After Phase 2, Phase 3 (US1) and Phase 4 (US5) can run in parallel by different developers
- After US1 and US5 complete, Phase 5-8 (US2, US3, US4, US6) can run in parallel by different team members
- US7 can run in parallel with any user story after US1

---

## Parallel Example: Foundation Phase

```bash
# Launch database setup:
Task: "Create Prisma schema with all entities in prisma/schema.prisma"

# While database is being designed, launch auth utilities in parallel:
Task: "Create mock user database in lib/auth/mock-users.ts"
Task: "Create JWT utilities in lib/auth/jwt.ts"
Task: "Create permission check utilities in lib/auth/check-permission.ts"

# And shared utilities in parallel:
Task: "Copy contracts/types.ts to lib/types/api.ts"
Task: "Create date validation utilities in lib/utils/date-validator.ts"
Task: "Create API response utilities in lib/utils/api-response.ts"
```

---

## Implementation Strategy

### MVP First (US1 + US5 Only)

This delivers a working roadmap viewer with authentication:

1. **Phase 1**: Setup (T001-T011) → ~2-3 hours
2. **Phase 2**: Foundational (T012-T035) → ~1-2 days
3. **Phase 3**: User Story 1 - View Roadmap (T036-T063) → ~2-3 days
4. **Phase 4**: User Story 5 - Auth & Access Control (T064-T083) → ~1-2 days

**Total MVP**: ~5-8 days for experienced developer

**MVP Deliverable**: Users can log in, view roadmaps with products displayed on 2D chart, switch axis modes, see their permissions

### Incremental Delivery

1. **MVP** (US1 + US5): View roadmaps with auth → Deploy/Demo
2. **+ US2**: Add drag-and-drop editing → Deploy/Demo (core functionality complete)
3. **+ US3**: Add product creation → Deploy/Demo
4. **+ US4**: Add product editing/deletion → Deploy/Demo (full CRUD complete)
5. **+ US6**: Add multiple roadmap management → Deploy/Demo
6. **+ US7**: Add dashboard linking → Deploy/Demo
7. **Polish**: Documentation, performance, accessibility → Final release

### Parallel Team Strategy

With 3 developers after Foundation is complete:

- **Developer A**: Phase 3 (US1) → Phase 5 (US2) → Phase 9 (US7)
- **Developer B**: Phase 4 (US5) → Phase 6 (US3) → Phase 8 (US6)
- **Developer C**: Phase 7 (US4) → Phase 10 (Polish)

All work in parallel branches, integrate at checkpoints.

---

## Task Summary

**Total Tasks**: 219
**By Phase**:
- Phase 1 (Setup): 11 tasks
- Phase 2 (Foundational): 24 tasks (CRITICAL PATH)
- Phase 3 (US1 - View): 28 tasks
- Phase 4 (US5 - Auth): 20 tasks
- Phase 5 (US2 - Drag-Drop): 31 tasks
- Phase 6 (US3 - Add Products): 15 tasks
- Phase 7 (US4 - Edit Products): 18 tasks
- Phase 8 (US6 - Multiple Roadmaps): 23 tasks
- Phase 9 (US7 - Dashboard Links): 14 tasks
- Phase 10 (Polish): 35 tasks

**Parallel Tasks**: 98 tasks marked [P] (45% can run in parallel)

**MVP Tasks** (US1 + US5): 83 tasks (T001-T083)

**Independent Stories**: Each user story phase is independently testable and deliverable

---

## Notes

- [P] tasks = different files, no dependencies within the phase
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests are NOT included as they were not requested in the specification
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- File paths follow Next.js 14+ App Router conventions from plan.md
