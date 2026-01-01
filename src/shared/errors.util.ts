/**
 * Custom HTTP Error class for proper error handling
 */
export class HttpError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request
 */
export class BadRequestError extends HttpError {
  constructor(message: string = 'Bad Request') {
    super(message, 400);
    this.name = 'BadRequestError';
  }
}

/**
 * 401 Unauthorized
 */
export class UnauthorizedError extends HttpError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

/**
 * 403 Forbidden
 */
export class ForbiddenError extends HttpError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

/**
 * 404 Not Found
 */
export class NotFoundError extends HttpError {
  constructor(message: string = 'Not Found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * 409 Conflict
 */
export class ConflictError extends HttpError {
  constructor(message: string = 'Conflict') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}
