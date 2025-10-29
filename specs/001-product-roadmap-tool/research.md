# Research Report: Product Roadmap Creation Tool

**Date**: 2025-10-28
**Branch**: 001-product-roadmap-tool
**Purpose**: Resolve technical unknowns and establish implementation approaches for Phase 1 design

---

## R1: Drag-and-Drop Implementation Strategy

### Decision: Use dnd-kit (@dnd-kit/core + @dnd-kit/sortable)

### Rationale

For a product roadmap visualization tool with 100-200 draggable elements requiring grid snapping and 2D chart positioning, **dnd-kit** is the optimal choice because:

1. **Performance at Scale**: Built specifically for performance with smooth animations. 100-200 elements is well within its optimal range when using proper React optimization techniques (memoization, avoiding unnecessary re-renders).

2. **Grid Snapping Built-In**: Native support for grid snapping via `createSnapModifier` - exactly what is needed for a chart-based interface with discrete grid positions.

3. **2D Flexibility**: Unlike react-beautiful-dnd (list-only), dnd-kit supports grids, 2D games, and complex layouts - perfect for time/phase × category charts.

4. **Modern Architecture**:
   - Built with React hooks (`useDraggable`, `useDroppable`)
   - Zero dependencies
   - Modular design (~18.9 KB minified + gzipped for core)
   - Active maintenance with 4.9M+ weekly downloads

5. **Accessibility First**: Built-in keyboard navigation, screen reader support, and ARIA attributes by default - critical for enterprise products.

6. **Touch Support**: Native touch sensor with activation constraints to distinguish scrolling from dragging - future-proofs mobile roadmap.

### Alternatives Considered

**Pragmatic Drag and Drop (Atlassian)**
- Pros: Smallest bundle size (~4.7 KB core), best performance metrics, powers Trello/Jira
- Cons: Still relatively new (2024 release), less mature documentation, higher learning curve
- Why Not: While technically superior in bundle size, the immature ecosystem makes it risky for time-sensitive project

**react-dnd**
- Pros: Very flexible and powerful, 2.4M+ weekly downloads
- Cons: Steeper learning curve, complex Redux-based API, performance issues with 500+ drop targets
- Why Not: The complexity isn't justified for this roadmap use case

**@hello-pangea/dnd (react-beautiful-dnd fork)**
- Pros: Simple API, great for list reordering
- Cons: **Specifically built for lists, not 2D grids**, largest bundle (~84.8 KB), performance degrades with 200+ items
- Why Not: Fundamentally designed for list reordering, not 2D chart positioning

### Implementation Notes

**Grid Snapping Setup**:
```javascript
import { DndContext, createSnapModifier } from '@dnd-kit/core';

const GRID_SIZE = 40; // pixels
const snapToGridModifier = createSnapModifier(GRID_SIZE);

<DndContext modifiers={[snapToGridModifier]}>
  {/* Draggable products */}
</DndContext>
```

**React Query Integration Pattern**:
- Maintain local state alongside React Query cache
- Update both on drag end to avoid flicker
- Use optimistic updates with rollback capability
- Cancel outgoing queries during mutation

**Performance Optimization**:
- Use `React.memo()` with custom comparison function
- Use `transform: translate3d()` instead of changing `top`/`left` (no repaint)
- Implement virtualization if list grows beyond 300 items

**Accessibility**:
- KeyboardSensor with custom coordinate getter for grid-based movement
- Focus management and tab order
- Screen reader announcements for drag operations

**Key Gotchas**:
- Must set `touch-action: none` on draggable elements
- Use activation constraints (8px distance) to avoid accidental drags
- Account for scroll offsets in collision detection

### References
- [dnd-kit Documentation](https://docs.dndkit.com)
- [Grid Snapping with Modifiers](https://docs.dndkit.com/api-documentation/modifiers)
- [Building a Kanban Board with dnd-kit](https://blog.logrocket.com/build-kanban-board-dnd-kit-react/)
- [TanStack Query Optimistic Updates Guide](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)

---

## R2: Chart/Grid Visualization Approach

### Decision: Custom CSS Grid Layout with HTML/CSS (No Charting Library)

### Rationale

For the product roadmap 2D chart visualization, a **custom CSS Grid-based approach** is the optimal solution because:

1. **Perfect Fit for Grid Layout**: CSS Grid is designed exactly for this use case - a two-dimensional grid with items positioned in cells. Time/phase on X-axis and categories on Y-axis map directly to CSS Grid rows and columns.

2. **Native Interactivity**: HTML elements are inherently interactive - clicking, dragging, hovering work out-of-box without special handling needed for Canvas/SVG.

3. **Accessibility**: Semantic HTML with proper ARIA labels provides screen reader support automatically. Canvas and SVG require extensive additional work for accessibility.

4. **Performance**: For 100-200 elements, HTML/CSS rendering is more than sufficient. Modern browsers handle thousands of DOM elements efficiently. CSS Grid layout is GPU-accelerated.

5. **Styling Flexibility**: Standard CSS/Tailwind for styling. Product cards can include rich content (text, badges, colors) without SVG limitations.

6. **Integration with dnd-kit**: dnd-kit works seamlessly with HTML elements. Canvas/SVG approaches require custom collision detection.

7. **Responsive Design**: CSS Grid provides built-in responsive capabilities with media queries and `minmax()` functions.

8. **Developer Experience**: Team is already familiar with HTML/CSS/React. No need to learn D3 or Canvas APIs.

### Alternatives Considered

**Recharts (React + D3 + SVG)**
- Pros: Popular (24.8K stars), good for standard charts, responsive
- Cons: Designed for data visualization charts (line, bar, pie), not 2D grids with custom interactive elements. Would require heavy customization.
- Why Not: Overkill for grid layout. We're not visualizing data trends, we're positioning product cards.

**D3.js (Low-level SVG/Canvas control)**
- Pros: Extremely powerful, handles complex visualizations
- Cons: Steep learning curve, requires extensive custom code for grid layout, accessibility is manual, large bundle size when including necessary modules
- Why Not: Too low-level. CSS Grid achieves the same result with 1/10th the code.

**Nivo (D3-based with SVG/Canvas/HTML rendering)**
- Pros: Wide selection of chart components, server-side rendering support
- Cons: Like Recharts, designed for data visualization charts, not custom grid layouts
- Why Not: Not designed for this use case

**Canvas-based Custom Solution**
- Pros: Best performance for 10,000+ elements
- Cons: No accessibility by default, manual event handling, can't use standard HTML/CSS, overkill for 200 elements
- Why Not: Unnecessary complexity. HTML/CSS performs well at this scale.

### Implementation Notes

**Grid Structure**:
```jsx
// Time-based X-axis
<div className="grid grid-cols-[auto_repeat(12,1fr)]"> {/* 12 months */}
  <div className="col-span-1 row-span-full">Y-Axis Labels</div>
  {categories.map(category => (
    <div key={category} className="contents">
      <div>{category}</div>
      {timeSlots.map(time => (
        <div key={`${category}-${time}`}
             className="border min-h-[100px]"
             data-category={category}
             data-time={time}>
          {/* Drop zone for products */}
        </div>
      ))}
    </div>
  ))}
</div>
```

**Phase-based X-axis**:
```jsx
// Dynamic column count based on phases
<div className={`grid grid-cols-[auto_repeat(${phases.length},1fr)]`}>
  {/* Similar structure */}
</div>
```

**Product Card Positioning**:
- Use absolute positioning within grid cells for overlapping products
- Auto-arrange products within same cell using flexbox or stack layout
- Z-index management for dragging (lifted above others)

**Responsive Considerations**:
- Desktop-first (per spec: 1280x720 minimum)
- Horizontal scroll for many time slots (accepted UX pattern for timelines)
- Consider collapse/expand for Y-axis categories on smaller screens

**Performance Optimization**:
- Virtualize grid cells if roadmap grows beyond 20x20 grid (400 cells)
- Use `will-change: transform` on dragging elements
- Memoize product cards to prevent unnecessary re-renders

### References
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [MDN CSS Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout)
- [React Chart Libraries Comparison 2025](https://blog.logrocket.com/best-react-chart-libraries-2025/)
- [Tailwind CSS Grid](https://tailwindcss.com/docs/grid-template-columns)

---

## R3: Real-Time Collaboration & Write-Lock Implementation

### Decision: Polling-Based Lock Management with Heartbeat API

### Rationale

For the write-lock and concurrent editing management, a **polling-based approach with heartbeat endpoint** is the optimal choice because:

1. **Infrastructure Simplicity**: Works with standard Next.js API routes. Vercel (common Next.js host) does NOT support WebSockets natively. No additional infrastructure required for MVP.

2. **Sufficient for Use Case**:
   - Max 2 concurrent viewers per roadmap (per spec SC-009)
   - Write-lock status checks every 2-3 seconds provide acceptable UX
   - Heartbeat every 30-60 seconds is sufficient for stale lock detection

3. **Clear Requirements Met**:
   - Lock timeout: 5 minutes of inactivity → server-side timer
   - Stale lock detection: 2-3 minutes without heartbeat → server-side check
   - First-wins race condition: server processes lock requests sequentially
   - Lock expiry dialog: client-side 60-second countdown before lock release

4. **Proven Pattern**: React Query's `refetchInterval` designed for this pattern with automatic cache management and deduplication.

5. **Upgrade Path**: Can later add WebSocket layer for invalidation messages while keeping same query structure.

### Alternatives Considered

**WebSockets from Day 1**
- Pros: Lowest latency (immediate updates), most "real-time" feel
- Cons: Requires separate hosting infrastructure (cannot use Vercel alone), added complexity (connection management, reconnection, heartbeats), overkill for 2 viewers
- Why Not: Overengineering for current requirements. Save for Phase 2+ when scaling beyond 5-10 concurrent viewers.

**Server-Sent Events (SSE)**
- Pros: Simpler than WebSockets (one-way server→client), works with standard HTTP
- Cons: Vercel timeout limits (10s Hobby, 60s Pro) make SSE unreliable, connection limits per domain (6 in HTTP/1.1), still requires polling for heartbeats (client→server)
- Why Not: No significant advantage over polling for this use case.

**CRDT-Based Collaborative Editing (Yjs, Automerge)**
- Pros: Mathematically proven conflict resolution, no locks needed, supports offline editing
- Cons: Major architecture change, complex to implement, overkill for roadmap use case where only one editor allowed
- Why Not: Requirement explicitly states one editor at a time with write-lock. CRDTs solve a different problem (multiple simultaneous editors).

### Implementation Notes

**Lock Acquisition Flow**:
```typescript
// POST /api/roadmaps/[id]/lock
// 1. Check if lock exists and is valid (heartbeat within 2-3 min)
// 2. If no lock or stale lock, grant to requester
// 3. If active lock held by another user, return 409 Conflict with lock holder info
// 4. Set lock expiry: now + 5 minutes
```

**Heartbeat Mechanism**:
```typescript
// PUT /api/roadmaps/[id]/lock/heartbeat (every 30s from client)
// 1. Verify request from current lock holder
// 2. Update lastHeartbeat timestamp
// 3. Extend lock expiry: now + 5 minutes
// 4. Return remaining time before expiry
```

**Client-Side Lock Management**:
```typescript
// useWriteLock.ts hook
const { data: lock, refetch } = useQuery({
  queryKey: ['writeLock', roadmapId],
  queryFn: () => fetchLockStatus(roadmapId),
  refetchInterval: 2000, // Poll every 2 seconds
});

// Heartbeat sender (only for lock holder)
useEffect(() => {
  if (!isEditor) return;

  const heartbeatInterval = setInterval(async () => {
    await sendHeartbeat(roadmapId);
  }, 30000); // Every 30 seconds

  return () => clearInterval(heartbeatInterval);
}, [isEditor, roadmapId]);
```

**Lock Expiry Dialog**:
```typescript
// When lock expiry approaches (< 60s), show dialog
useEffect(() => {
  if (lock?.expiresIn < 60000 && lock?.expiresIn > 0) {
    showExpiryDialog({
      options: ['Save Changes', 'Discard Changes', 'Extend Session'],
      timeout: 60,
      onTimeout: () => {
        // User didn't respond, discard and release lock
        discardChanges();
        releaseLock();
      },
    });
  }
}, [lock?.expiresIn]);
```

**Race Condition Handling**:
```typescript
// Server-side: Lock acquisition is atomic
// Use database transaction or Redis lock to ensure serialization
await db.transaction(async (tx) => {
  const existingLock = await tx.writeLock.findUnique({
    where: { roadmapId },
  });

  if (existingLock && isLockValid(existingLock)) {
    throw new ConflictError('Lock held by another user');
  }

  // Grant lock atomically
  await tx.writeLock.upsert({
    where: { roadmapId },
    create: { roadmapId, userId, acquiredAt: new Date(), lastHeartbeat: new Date() },
    update: { userId, acquiredAt: new Date(), lastHeartbeat: new Date() },
  });
});
```

**Stale Lock Detection**:
```typescript
// Server-side helper
function isLockValid(lock: WriteLock): boolean {
  const now = Date.now();
  const lastHeartbeat = lock.lastHeartbeat.getTime();
  const staleThreshold = 3 * 60 * 1000; // 3 minutes

  return (now - lastHeartbeat) < staleThreshold;
}

// Background job (optional): Clean up stale locks periodically
setInterval(() => {
  db.writeLock.deleteMany({
    where: {
      lastHeartbeat: {
        lt: new Date(Date.now() - 3 * 60 * 1000),
      },
    },
  });
}, 60000); // Every minute
```

**Network Resilience** (per FR-028):
```typescript
// Client-side buffering during disconnection
const [offlineChanges, setOfflineChanges] = useState([]);
const [isOnline, setIsOnline] = useState(navigator.onLine);

useEffect(() => {
  const handleOnline = () => {
    setIsOnline(true);
    // Attempt to reconnect for 60 seconds
    syncOfflineChanges(offlineChanges);
  };

  const handleOffline = () => {
    setIsOnline(false);
    // Start buffering changes locally
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}, [offlineChanges]);
```

### References
- [Collaborative Editing Implementation](https://dev.to/aleksei_aleinikov/how-to-build-real-time-collaborative-document-editing-in-react-2025-2h6a)
- [WordPress Heartbeat API Discussion](https://make.wordpress.org/core/2025/01/07/reliable-sync-protocol-pr-live-demo-discussion-for-collaborative-editing/)
- [React Query Polling Patterns](https://tanstack.com/query/v5/docs/framework/react/guides/window-focus-refetching)

---

## R4: Multi-User State Synchronization

### Decision: Progressive Enhancement Approach (Polling → WebSocket)

**Start with intelligent polling using React Query, with clear upgrade path to WebSockets when scale demands it.**

### Rationale

1. **Infrastructure Simplicity**:
   - Vercel does not support WebSockets natively
   - No additional infrastructure required beyond standard Next.js API routes
   - Zero deployment complexity for MVP

2. **Sufficient for Use Case**:
   - Max 2 concurrent viewers per roadmap (per spec SC-009)
   - "Near real-time" requirement is 1-2 seconds
   - Polling every 2-3 seconds provides acceptable latency for roadmap updates

3. **React Query Native Support**:
   - Built-in `refetchInterval` designed specifically for this pattern
   - Automatic cache management and deduplication
   - Seamless optimistic updates with rollback

4. **Clear Upgrade Path**:
   - React Query works identically with WebSocket invalidation
   - No query structure changes needed when upgrading
   - Queries remain the source of truth

### When to Upgrade to WebSockets

Upgrade when any of these conditions are met:
- Concurrent viewers exceed 5-10 per roadmap consistently
- Latency requirements drop below 500ms
- Server costs from polling become significant (>$100/month polling overhead)
- Real-time features expand (live cursors, live typing indicators)

### Alternatives Considered

**WebSockets from Day 1**
- Pros: Lowest latency, most "real-time" feel, scales better with many users
- Cons: Requires separate hosting infrastructure, added complexity, overkill for 2 viewers
- Why Not: Overengineering for current requirements

**Server-Sent Events (SSE)**
- Pros: Simpler than WebSockets, works with standard HTTP
- Cons: Vercel timeout limits, connection limits per domain, still requires polling for heartbeats
- Why Not: No significant advantage over polling

**Long Polling**
- Pros: Better latency than short polling, no WebSocket infrastructure
- Cons: More complex, higher server resource usage, serverless environments poorly suited
- Why Not: Unnecessary complexity for modest latency improvement

### Implementation Notes

**Polling Strategy for Viewers**:
```typescript
export function useRoadmapData(roadmapId: string) {
  const isVisible = useDocumentVisibility();

  return useQuery({
    queryKey: ['roadmap', roadmapId],
    queryFn: () => fetchRoadmap(roadmapId),
    refetchInterval: (query) => {
      if (query.state.error) return false;
      return isVisible ? 3000 : false; // Poll every 3s when visible
    },
    refetchOnWindowFocus: true,
    staleTime: 2000,
  });
}
```

**Optimistic Updates for Editor**:
```typescript
export function useUpdateProductPosition(roadmapId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (update) => updateProductPosition(update),
    onMutate: async (update) => {
      await queryClient.cancelQueries({ queryKey: ['roadmap', roadmapId] });
      const previous = queryClient.getQueryData(['roadmap', roadmapId]);

      queryClient.setQueryData(['roadmap', roadmapId], (old) => {
        // Optimistically update cache
      });

      return { previous };
    },
    onError: (err, update, context) => {
      queryClient.setQueryData(['roadmap', roadmapId], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap', roadmapId] });
    },
  });
}
```

**Polling Intervals**: 3-second polling interval
- Meets 1-2 second freshness requirement with 1-poll margin
- Server load: 1200 requests/hour/viewer = 2400 req/hr for 2 viewers (negligible)
- Battery/bandwidth: Pauses automatically when tab is inactive

**Upgrade Path to WebSocket**:
```typescript
// Add WebSocket invalidation (queries remain unchanged)
useEffect(() => {
  const ws = new WebSocket(`wss://api.example.com/roadmaps/${roadmapId}`);

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === 'roadmap_updated') {
      queryClient.invalidateQueries({ queryKey: ['roadmap', roadmapId] });
    }
  };

  return () => ws.close();
}, [roadmapId]);
```

### References
- [TkDodo's Blog - Using WebSockets with React Query](https://tkdodo.eu/blog/using-web-sockets-with-react-query)
- [TanStack Query Polling Example](https://tanstack.com/query/v5/docs/framework/react/examples/auto-refetching)
- [LogRocket - TanStack Query and WebSockets](https://blog.logrocket.com/tanstack-query-websockets-real-time-react-data-fetching/)

---

## R5: Mock Authentication Implementation

### Decision: Next.js Middleware JWT Authentication with Mock User Database

### Rationale

For development-phase authentication that can be easily swapped for external auth in production:

1. **Next.js 14+ App Router Middleware**: Edge-compatible middleware for route protection, runs before requests hit pages/API routes.

2. **JWT Token Structure**: Uses standard JWT claims (sub, iat, exp) plus custom claims (role, permissions) for future compatibility with OAuth/SAML providers.

3. **Mock User Database**: Simple in-memory or file-based user database for development, easily replaced with external auth system.

4. **Zero External Dependencies**: No third-party services required for development. Auth0, Clerk, or custom OAuth can be swapped in later.

5. **Role-Based Access Control (RBAC)**: Supports viewer, editor, admin roles as per specification requirements.

### Alternatives Considered

**NextAuth.js (Auth.js v5)**
- Pros: Popular (27K stars), supports many providers, built for Next.js
- Cons: Adds dependency, configuration complexity, may be overkill for simple mock auth
- Why Not: For mock auth, a custom simple solution is more transparent and easier to swap out

**Clerk**
- Pros: Fully managed, beautiful UI, easy setup
- Cons: Paid service, vendor lock-in, overkill for development mock
- Why Not: Not needed for development phase

**Auth0**
- Pros: Enterprise-grade, supports many protocols
- Cons: External service required even for development, configuration complexity
- Why Not: Specification calls for mock auth in development, external system in production

**Custom Session-Based Auth**
- Pros: Simpler than JWT, no token parsing
- Cons: Harder to scale to external systems (most use tokens), less flexible for future API access
- Why Not: JWT provides better future compatibility

### Implementation Notes

**File Structure**:
```
lib/
├── auth/
│   ├── mock-users.ts          # Mock user database
│   ├── jwt.ts                 # JWT utilities (sign, verify)
│   ├── middleware.ts          # Auth middleware
│   └── session.ts             # Session management utilities
```

**Mock User Database**:
```typescript
// lib/auth/mock-users.ts
export const mockUsers = [
  {
    id: '1',
    email: 'admin@example.com',
    password: await bcrypt.hash('admin123', 10),
    name: 'Admin User',
    role: 'admin',
  },
  {
    id: '2',
    email: 'editor@example.com',
    password: await bcrypt.hash('editor123', 10),
    name: 'Editor User',
    role: 'editor',
  },
  {
    id: '3',
    email: 'viewer@example.com',
    password: await bcrypt.hash('viewer123', 10),
    name: 'Viewer User',
    role: 'viewer',
  },
];
```

**JWT Utilities** (using `jose` for Edge compatibility):
```typescript
// lib/auth/jwt.ts
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function signToken(payload: { sub: string; role: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}
```

**Authentication Middleware**:
```typescript
// middleware.ts (root)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

export async function middleware(request: NextRequest) {
  // Skip auth for public routes
  if (request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.next();
  }

  // Protected routes
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Attach user info to request headers for API routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.sub as string);
  requestHeaders.set('x-user-role', payload.role as string);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
```

**Login API Route**:
```typescript
// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { mockUsers } from '@/lib/auth/mock-users';
import { signToken } from '@/lib/auth/jwt';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  const user = mockUsers.find(u => u.email === email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }

  const token = await signToken({
    sub: user.id,
    role: user.role,
  });

  const response = NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });

  // Set HTTP-only cookie
  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600, // 1 hour
  });

  return response;
}
```

**Role-Based Access Control**:
```typescript
// lib/auth/check-permission.ts
export function checkPermission(userRole: string, requiredRole: 'viewer' | 'editor' | 'admin'): boolean {
  const roleHierarchy = { viewer: 0, editor: 1, admin: 2 };
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

// Usage in API route
export async function PUT(request: Request) {
  const userRole = request.headers.get('x-user-role');

  if (!checkPermission(userRole, 'editor')) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  // Proceed with update
}
```

**Environment Variable for Toggle**:
```env
# .env
AUTH_MODE=mock  # or 'external' for production
JWT_SECRET=your-secret-key-here
```

**Swap Strategy for Production**:
```typescript
// lib/auth/provider.ts
import { mockAuth } from './mock-auth';
import { externalAuth } from './external-auth';

export const auth = process.env.AUTH_MODE === 'mock' ? mockAuth : externalAuth;

// Both implement same interface:
interface AuthProvider {
  signIn(credentials: { email: string; password: string }): Promise<User>;
  signOut(): Promise<void>;
  getUser(token: string): Promise<User | null>;
}
```

### References
- [Implementing JWT Authentication with HTTP-only Cookies in Next.js App Router](https://www.sharanpanthi.com.np/blog/implementing-jwt-authentication-with-http-only-cookies-in-nextjs-app-router)
- [Implementing JWT Middleware in Next.js - Complete Guide](https://leapcell.medium.com/implementing-jwt-middleware-in-next-js-a-complete-guide-to-auth-300d9c7fcae2)
- [Next.js 14 App Router Authentication Middleware](https://medium.com/@dreamworld420/nextjs-authentication-app-router-middleware-1eefeae1d687)
- [GitHub - nextjs-jwt-app-router](https://github.com/clarity-digital/nextjs-jwt-app-router)

---

## R6: PostgreSQL Connection Management

### Decision: Prisma Singleton Pattern + External Connection Pooler (Prisma Accelerate or PgBouncer)

### Rationale

For PostgreSQL connection pooling in Next.js serverless environment:

1. **Serverless Connection Challenge**: Each serverless function creates its own Prisma Client instance with its own connection pool. With default settings, this quickly exhausts database connection limits.

2. **Prisma Singleton Pattern**: Prevents multiple Prisma Client instances during development hot-reloading and ensures efficient connection reuse in production.

3. **External Connection Pooler**: Essential for production serverless deployments to prevent connection exhaustion during traffic spikes.

4. **Conservative Pool Size**: Setting `connection_limit=1` per serverless function is recommended as a starting point, since connection pooling happens at the external pooler level.

### Alternatives Considered

**Prisma Accelerate (Recommended)**
- Pros: Fully managed, zero-configuration, global connection pool with edge caching, auto-scales
- Cons: Additional cost (paid service), adds network hop
- Best For: Teams wanting minimal DevOps overhead

**Self-Managed PgBouncer**
- Pros: Free and open-source, full control, lower latency
- Cons: Requires infrastructure setup and maintenance, must run in Transaction mode for Prisma
- Best For: Teams with existing DevOps infrastructure, cost-sensitive projects

**Managed Postgres with Built-in Pooling (Neon, Supabase, Vercel Postgres)**
- Pros: Connection pooling included out-of-box, optimized for serverless
- Cons: Platform-specific (migration complexity), cold starts (Neon: 100ms-3s)
- Best For: New projects, teams wanting integrated database + pooling solution

**No External Pooler**
- Pros: Simplest initial setup
- Cons: Will exhaust database connections under moderate load, not suitable for production
- Why Not: Only acceptable for development

### Implementation Notes

**Prisma Client Singleton**:
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}
```

**Environment Variables**:
```env
# With Prisma Accelerate
DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"
DIRECT_URL="postgresql://user:pass@host:5432/dbname"  # For migrations

# With PgBouncer or Managed Postgres
DATABASE_URL="postgresql://user:pass@pooler:6543/dbname?connection_limit=1&pool_timeout=20"
DIRECT_URL="postgresql://user:pass@db:5432/dbname"  # For migrations
```

**Connection Pool Settings**:
- `connection_limit=1`: Conservative starting point for serverless
- `pool_timeout=20`: Increased from default 10s for high-concurrency scenarios

**Error Handling with Retry Logic**:
```typescript
// lib/prisma-retry.ts
export async function withRetry<T>(operation: () => Promise<T>): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= 3; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const isRetryable =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        ['P2024', 'P2034', 'P1001', 'P1002'].includes(error.code);

      if (!isRetryable || attempt === 3) throw error;

      await new Promise(resolve => setTimeout(resolve, 100 * 2 ** attempt));
    }
  }

  throw lastError!;
}
```

**Migration Strategy**:
- Connection poolers don't support migrations
- Use `directUrl` in Prisma schema for migrations
- Separate connection strings: pooled for queries, direct for migrations

**Edge Runtime Considerations**:
- Standard Prisma Client does NOT work in Edge Runtime
- Use Prisma Accelerate (works in both Node.js and Edge)
- Or use driver adapters (e.g., Neon) for Edge support

### References
- [Prisma Vercel Deployment Guide](https://www.prisma.io/docs/orm/prisma-client/deployment/serverless/deploy-to-vercel)
- [Connection Management Guide](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [PgBouncer Configuration](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/pgbouncer)
- [Prisma Accelerate Overview](https://www.prisma.io/docs/accelerate/compare)

---

## Summary of Decisions

| Research Area | Decision | Key Rationale |
|---------------|----------|---------------|
| **R1: Drag-and-Drop** | dnd-kit | Performance at scale, 2D grid support, grid snapping built-in, accessibility |
| **R2: Chart Visualization** | Custom CSS Grid | Perfect fit for grid layout, native interactivity, accessibility, no library needed |
| **R3: Write-Lock** | Polling + Heartbeat | Infrastructure simplicity, sufficient for 2 viewers, Vercel-compatible |
| **R4: Multi-User Sync** | React Query Polling | Meets latency requirements, simple setup, clear WebSocket upgrade path |
| **R5: Mock Auth** | Next.js Middleware JWT | Standard JWT for future compatibility, simple mock database, easy to swap |
| **R6: PostgreSQL** | Prisma Singleton + Pooler | Prevents connection exhaustion, serverless-friendly, production-ready |

---

## Next Steps

With all research complete, proceed to **Phase 1: Design & Contracts**:
1. Generate `data-model.md` from entities in feature spec
2. Generate API contracts in `/contracts/` from functional requirements
3. Create `quickstart.md` for developer onboarding
4. Update agent context with technology stack

---

**Research Phase Complete**: All technical unknowns resolved with justified decisions and implementation guidance.
