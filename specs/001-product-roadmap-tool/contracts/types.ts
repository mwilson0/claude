/**
 * API Type Definitions for Product Roadmap Creation Tool
 *
 * Generated from OpenAPI specification
 * These types are shared between frontend and backend
 */

// ============================================================================
// Enums
// ============================================================================

export enum UserRole {
  Viewer = 'viewer',
  Editor = 'editor',
  Admin = 'admin',
}

export enum PermissionLevel {
  Viewer = 'viewer',
  Editor = 'editor',
  Admin = 'admin',
}

export enum XAxisMode {
  Time = 'time',
  Phase = 'phase',
}

export enum YAxisType {
  Category = 'category',
  Investment = 'investment',
  ProductType = 'productType',
}

// ============================================================================
// Domain Models
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string; // ISO 8601 date-time
  updatedAt: string; // ISO 8601 date-time
}

export interface Roadmap {
  id: string;
  name: string;
  description: string | null;
  xAxisMode: XAxisMode;
  yAxisType: YAxisType;
  yAxisValues: string[]; // Array of category/investment/type values
  ownerId: string;
  createdAt: string; // ISO 8601 date-time
  updatedAt: string; // ISO 8601 date-time
}

export interface RoadmapWithDetails extends Roadmap {
  products: Product[];
  phases: Phase[];
  writeLock: WriteLock | null;
}

export interface Product {
  id: string;
  codename: string;
  partNumber: string;
  description: string;
  sampleDate: string; // ISO 8601 date (YYYY-MM-DD)
  releaseDate: string; // ISO 8601 date (YYYY-MM-DD)
  roadmapId: string;
  xPosition: string; // Time value or phase name
  yPosition: string; // Category/investment/type value
  metadataLinks: MetadataLink[];
  createdAt: string; // ISO 8601 date-time
  updatedAt: string; // ISO 8601 date-time
}

export interface ProductWithLinks extends Product {
  dashboardLinks: DashboardLink[];
}

export interface MetadataLink {
  dashboardId: string;
  dashboardType: string;
  label: string;
  contextParams?: Record<string, string>;
}

export interface DashboardLink {
  id: string;
  productId: string;
  dashboardType: string;
  dashboardId: string;
  label: string;
  contextParams: Record<string, string> | null;
  createdAt: string; // ISO 8601 date-time
}

export interface WriteLock {
  id: string;
  roadmapId: string;
  userId: string;
  userName: string;
  acquiredAt: string; // ISO 8601 date-time
  lastHeartbeat: string; // ISO 8601 date-time
  expiresAt: string; // ISO 8601 date-time
  expiresIn: number; // Milliseconds until expiry
}

export interface Permission {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  roadmapId: string;
  permissionLevel: PermissionLevel;
  createdAt: string; // ISO 8601 date-time
  updatedAt: string; // ISO 8601 date-time
}

export interface Phase {
  id: string;
  roadmapId: string;
  name: string;
  order: number;
  color: string | null; // Hex color code #RRGGBB
  createdAt: string; // ISO 8601 date-time
}

// ============================================================================
// Request Types
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
}

export interface CreateRoadmapRequest {
  name: string; // min 3, max 255 chars
  description?: string | null;
  xAxisMode?: XAxisMode;
  yAxisType?: YAxisType;
  yAxisValues: string[]; // min 1, max 15 values
}

export interface UpdateRoadmapRequest {
  name?: string; // min 3, max 255 chars
  description?: string | null;
  xAxisMode?: XAxisMode;
  yAxisType?: YAxisType;
  yAxisValues?: string[]; // min 1, max 15 values
}

export interface CreateProductRequest {
  codename: string; // min 2, max 100 chars
  partNumber: string; // min 3, max 100 chars
  description: string; // min 10 chars
  sampleDate: string; // ISO 8601 date (YYYY-MM-DD)
  releaseDate: string; // ISO 8601 date (YYYY-MM-DD)
  roadmapId: string;
  xPosition: string;
  yPosition: string;
  metadataLinks?: MetadataLink[];
}

export interface UpdateProductRequest {
  codename?: string; // min 2, max 100 chars
  partNumber?: string; // min 3, max 100 chars
  description?: string; // min 10 chars
  sampleDate?: string; // ISO 8601 date (YYYY-MM-DD)
  releaseDate?: string; // ISO 8601 date (YYYY-MM-DD)
  xPosition?: string;
  yPosition?: string;
  metadataLinks?: MetadataLink[];
}

export interface UpdateProductPositionRequest {
  xPosition: string;
  yPosition: string;
}

export interface GrantPermissionRequest {
  userId: string;
  permissionLevel: PermissionLevel;
}

// ============================================================================
// Response Types
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  metadata?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  data: T[];
  metadata: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    statusCode: number;
    details?: Record<string, any>;
  };
}

// ============================================================================
// Client Helper Types
// ============================================================================

/**
 * Product position on the roadmap grid
 */
export interface ProductPosition {
  productId: string;
  xPosition: string;
  yPosition: string;
}

/**
 * Roadmap configuration for frontend state management
 */
export interface RoadmapConfig {
  id: string;
  xAxisMode: XAxisMode;
  yAxisType: YAxisType;
  yAxisValues: string[];
  phases?: Phase[];
}

/**
 * User's permission status for a roadmap
 */
export interface UserPermissionStatus {
  canView: boolean;
  canEdit: boolean;
  canAdmin: boolean;
  permissionLevel: PermissionLevel | null;
}

/**
 * Write lock status for UI display
 */
export interface WriteLockStatus {
  isLocked: boolean;
  isOwnLock: boolean;
  lockHolder?: {
    userId: string;
    userName: string;
  };
  expiresIn?: number; // Milliseconds
}

// ============================================================================
// Validation Constants
// ============================================================================

export const ValidationRules = {
  User: {
    email: {
      minLength: 5,
      maxLength: 255,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    name: {
      minLength: 2,
      maxLength: 255,
    },
    password: {
      minLength: 8,
      maxLength: 128,
    },
  },
  Roadmap: {
    name: {
      minLength: 3,
      maxLength: 255,
    },
    yAxisValues: {
      minItems: 1,
      maxItems: 15,
    },
  },
  Product: {
    codename: {
      minLength: 2,
      maxLength: 100,
    },
    partNumber: {
      minLength: 3,
      maxLength: 100,
    },
    description: {
      minLength: 10,
      maxLength: 5000,
    },
  },
  Phase: {
    name: {
      minLength: 2,
      maxLength: 100,
    },
    maxPhases: 10,
  },
} as const;

// ============================================================================
// Type Guards
// ============================================================================

export function isApiError(obj: any): obj is ApiError {
  return (
    obj &&
    typeof obj === 'object' &&
    'error' in obj &&
    typeof obj.error === 'object' &&
    'code' in obj.error &&
    'message' in obj.error &&
    'statusCode' in obj.error
  );
}

export function isWriteLock(obj: any): obj is WriteLock {
  return (
    obj &&
    typeof obj === 'object' &&
    'id' in obj &&
    'roadmapId' in obj &&
    'userId' in obj &&
    'acquiredAt' in obj
  );
}

export function hasPermission(
  userPermission: PermissionLevel | null,
  requiredPermission: PermissionLevel
): boolean {
  if (!userPermission) return false;

  const hierarchy: Record<PermissionLevel, number> = {
    [PermissionLevel.Viewer]: 0,
    [PermissionLevel.Editor]: 1,
    [PermissionLevel.Admin]: 2,
  };

  return hierarchy[userPermission] >= hierarchy[requiredPermission];
}

// ============================================================================
// Date/Time Utilities
// ============================================================================

/**
 * Convert Date to ISO 8601 date string (YYYY-MM-DD)
 */
export function toISODateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Convert Date to ISO 8601 date-time string
 */
export function toISODateTime(date: Date): string {
  return date.toISOString();
}

/**
 * Parse ISO 8601 date string to Date
 */
export function parseISODate(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Validate that sampleDate <= releaseDate
 */
export function validateDateOrder(sampleDate: string, releaseDate: string): boolean {
  return new Date(sampleDate) <= new Date(releaseDate);
}

/**
 * Calculate milliseconds until lock expiry
 */
export function calculateExpiresIn(expiresAt: string): number {
  return Math.max(0, new Date(expiresAt).getTime() - Date.now());
}

/**
 * Check if write lock is stale (no heartbeat for 3 minutes)
 */
export function isLockStale(lastHeartbeat: string): boolean {
  const threeMinutes = 3 * 60 * 1000;
  return Date.now() - new Date(lastHeartbeat).getTime() > threeMinutes;
}

/**
 * Check if write lock is expired
 */
export function isLockExpired(expiresAt: string): boolean {
  return Date.now() > new Date(expiresAt).getTime();
}
