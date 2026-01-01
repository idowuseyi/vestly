import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from './types';

export class ResponseUtil {
  static success<T>(res: Response, data: T, message = 'Success'): void {
    const response: ApiResponse<T> = {
      success: true,
      message,
      status_code: 200,
      data,
    };
    res.status(200).json(response);
  }

  static created<T>(res: Response, data: T, message = 'Resource created'): void {
    const response: ApiResponse<T> = {
      success: true,
      message,
      status_code: 201,
      data,
    };
    res.status(201).json(response);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message = 'Success'
  ): void {
    const response: PaginatedResponse<T[]> = {
      success: true,
      message,
      status_code: 200,
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
    res.status(200).json(response);
  }

  static error(res: Response, message: string, statusCode = 500): void {
    res.status(statusCode).json({
      success: false,
      message,
      status_code: statusCode,
    });
  }

  static badRequest(res: Response, message: string): void {
    res.status(400).json({
      success: false,
      message,
      status_code: 400,
    });
  }

  static unauthorized(res: Response, message = 'Unauthorized'): void {
    res.status(401).json({
      success: false,
      message,
      status_code: 401,
    });
  }

  static forbidden(res: Response, message = 'Forbidden'): void {
    res.status(403).json({
      success: false,
      message,
      status_code: 403,
    });
  }

  static notFound(res: Response, message = 'Resource not found'): void {
    res.status(404).json({
      success: false,
      message,
      status_code: 404,
    });
  }
}
