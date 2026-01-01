import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';

/**
 * Basic authentication middleware for Swagger documentation
 * Uses credentials from environment variables
 */
export const swaggerBasicAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Skip auth if credentials not configured (development mode)
  if (!config.swagger.username || !config.swagger.password) {
    next();
    return;
  }

  // Get credentials from Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Swagger Documentation"');
    res.status(401).json({
      success: false,
      message: 'Authentication required for API documentation',
      status_code: 401,
    });
    return;
  }

  // Decode base64 credentials
  const base64Credentials = authHeader.substring(6); // Remove 'Basic ' prefix
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');

  // Validate credentials
  if (
    username === config.swagger.username &&
    password === config.swagger.password
  ) {
    next();
  } else {
    res.setHeader('WWW-Authenticate', 'Basic realm="Swagger Documentation"');
    res.status(401).json({
      success: false,
      message: 'Invalid credentials',
      status_code: 401,
    });
  }
};
