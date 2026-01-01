import { Request } from 'express';

/**
 * User role type
 */
export type UserRole = 'tenant' | 'landlord' | 'admin';

/**
 * User context injected by auth middleware
 */
export interface UserContext {
  userId: string;
  orgId: string;
  role: UserRole;
}

/**
 * Extend Express Request to include user context
 * Using declaration merging to add user property globally
 */
declare global {
  namespace Express {
    interface Request {
      user: UserContext;
    }
  }
}

/**
 * Authenticated request type (for explicit typing)
 */
export interface AuthenticatedRequest extends Request {
  user: UserContext;
}

/**
 * Transaction types for the ledger
 */
export enum TransactionType {
  EARN = 'EARN',
  ADJUST = 'ADJUST',
  REDEEM = 'REDEEM',
}

/**
 * Standard API response
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  status_code: number;
  data?: T;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Error response
 */
export interface ErrorResponse extends ApiResponse {
  error?: string;
}
