import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ResponseUtil } from '../shared/response.util';

type ValidationTarget = 'body' | 'params' | 'query';

/**
 * Generic Zod validation middleware.
 * Validates request data against a Zod schema.
 */
export const validate = (schema: ZodSchema, target: ValidationTarget = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = req[target];
      const validated = schema.parse(data);
      req[target] = validated; // Replace with validated data
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        const errorMessage = `Validation failed: ${errors.map(e => `${e.field}: ${e.message}`).join(', ')}`;
        ResponseUtil.badRequest(res, errorMessage);
        return;
      }
      next(error);
    }
  };
};

/**
 * Validate request body
 */
export const validateBody = (schema: ZodSchema) => validate(schema, 'body');

/**
 * Validate request params
 */
export const validateParams = (schema: ZodSchema) => validate(schema, 'params');

/**
 * Validate request query
 */
export const validateQuery = (schema: ZodSchema) => validate(schema, 'query');
