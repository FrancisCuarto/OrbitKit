import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../security/jwt.js';
import { AppError } from './errorHandler.js';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function requireAdmin(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.auth_token) {
    token = req.cookies.auth_token;
  }

  if (!token) {
    return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
  }

  const payload = verifyToken(token);
  if (!payload || payload.role !== 'admin') {
    return next(new AppError('Forbidden: Insufficient privileges', 403, 'FORBIDDEN'));
  }

  req.user = payload;
  next();
}
