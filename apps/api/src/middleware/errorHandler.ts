import { Request, Response, NextFunction } from 'express';
import { ApiErrorResponse } from '@devdock/shared-types';
import { config } from '../security/config.js';

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = 'statusCode' in err ? err.statusCode : 500;
  const code = 'code' in err ? err.code : 'INTERNAL_SERVER_ERROR';

  const response: ApiErrorResponse = {
    success: false,
    error: {
      message: config.NODE_ENV === 'production' && statusCode === 500
        ? 'Internal Server Error'
        : err.message,
      code,
      details: 'details' in err ? err.details : undefined
    },
    timestamp: new Date().toISOString()
  };

  if (config.NODE_ENV !== 'production' && statusCode === 500) {
    console.error('[API Error Trace]:', err);
  }

  res.status(statusCode).json(response);
}
