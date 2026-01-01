import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AuthenticatedRequest, UserContext, UserRole } from '../shared/types';
import { ResponseUtil } from '../shared/response.util';

interface JWTPayload {
  userId: string;
  orgId: string;
  role: UserRole;
}

/**
 * Authentication middleware that supports both JWT and stub modes.
 * 
 * JWT Mode: Verifies JWT token from Authorization header
 * Stub Mode: Reads identity from x-user-id, x-org-id, x-role headers (for development/testing)
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let user: UserContext;

    if (config.auth.mode === 'stub') {
      // Stub mode: Read from headers (for development/testing)
      const userId = req.headers['x-user-id'] as string;
      const orgId = req.headers['x-org-id'] as string;
      const role = req.headers['x-role'] as UserRole;

      if (!userId || !orgId || !role) {
        ResponseUtil.unauthorized(res, 'Missing stub authentication headers');
        return;
      }

      if (!['tenant', 'landlord', 'admin'].includes(role)) {
        ResponseUtil.unauthorized(res, 'Invalid role in stub headers');
        return;
      }

      user = { userId, orgId, role };
    } else {
      // JWT mode: Verify token from Authorization header
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        ResponseUtil.unauthorized(res, 'No token provided');
        return;
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      try {
        const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
        user = {
          userId: decoded.userId,
          orgId: decoded.orgId,
          role: decoded.role,
        };
      } catch (jwtError) {
        if (jwtError instanceof jwt.TokenExpiredError) {
          ResponseUtil.unauthorized(res, 'Token expired');
          return;
        }
        if (jwtError instanceof jwt.JsonWebTokenError) {
          ResponseUtil.unauthorized(res, 'Invalid token');
          return;
        }
        throw jwtError;
      }
    }

    // Attach user context to request
    (req as AuthenticatedRequest).user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware - doesn't fail if no auth provided
 */
export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader && config.auth.mode !== 'stub') {
      next();
      return;
    }

    // If auth is provided, validate it
    await authenticate(req, res, next);
  } catch (error) {
    next(error);
  }
};
