import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';
import { ResponseUtil } from '../shared/response.util';

/**
 * Global error handling middleware.
 * Catches all errors and returns standardized error responses.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  // Custom HTTP errors
  if ('statusCode' in err && typeof (err as any).statusCode === 'number') {
    ResponseUtil.error(res, err.message, (err as any).statusCode);
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    ResponseUtil.badRequest(res, err.message);
    return;
  }

  if (err.name === 'CastError') {
    ResponseUtil.badRequest(res, 'Invalid ID format');
    return;
  }

  // Mongoose duplicate key error
  if ((err as any).code === 11000) {
    ResponseUtil.error(res, 'Duplicate entry', 400);
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    ResponseUtil.unauthorized(res, 'Invalid token');
    return;
  }

  if (err.name === 'TokenExpiredError') {
    ResponseUtil.unauthorized(res, 'Token expired');
    return;
  }

  // Default error
  const message = config.isDevelopment ? err.message : 'Internal server error';
  ResponseUtil.error(res, message, 500);
};

/**
 * 404 handler for unmatched routes
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  ResponseUtil.notFound(res, `Route not found: ${req.method} ${req.path}`);
};
