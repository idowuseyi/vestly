import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../shared/types';
import { ResponseUtil } from '../shared/response.util';

/**
 * Role-based access control middleware.
 * Restricts access to routes based on user roles.
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ResponseUtil.unauthorized(res, 'Authentication required');
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      ResponseUtil.forbidden(
        res,
        `Access denied. Required roles: ${allowedRoles.join(', ')}`
      );
      return;
    }

    next();
  };
};

/**
 * Tenant-only access
 */
export const requireTenant = requireRole('tenant');

/**
 * Landlord or Admin access
 */
export const requireLandlordOrAdmin = requireRole('landlord', 'admin');

/**
 * Admin-only access
 */
export const requireAdmin = requireRole('admin');
