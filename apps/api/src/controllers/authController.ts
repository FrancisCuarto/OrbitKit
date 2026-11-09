import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/User.js';
import { hashPassword, verifyPassword } from '../security/argon.js';
import { generateToken } from '../security/jwt.js';
import { AppError } from '../middleware/errorHandler.js';
import { config } from '../security/config.js';

export class AuthController {
  public static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password || password.length < 8) {
        throw new AppError('Email and password (min 8 chars) required', 400, 'INVALID_INPUT');
      }

      const existing = await UserModel.findOne({ email });
      if (existing) {
        throw new AppError('Account already exists', 409, 'ACCOUNT_EXISTS');
      }

      const passwordHash = await hashPassword(password);
      const user = await UserModel.create({
        email,
        passwordHash,
        role: 'admin'
      });

      const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role
      });

      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600000 // 1 hour
      });

      res.status(201).json({
        success: true,
        data: {
          email: user.email,
          role: user.role,
          token
        },
        message: 'Account created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new AppError('Email and password required', 400, 'INVALID_CREDENTIALS');
      }

      const user = await UserModel.findOne({ email });
      if (!user) {
        throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
      }

      const isValid = await verifyPassword(user.passwordHash, password);
      if (!isValid) {
        throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
      }

      user.last_login = new Date();
      await user.save();

      const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role
      });

      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600000
      });

      res.json({
        success: true,
        data: {
          email: user.email,
          role: user.role,
          token
        },
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  public static async logout(_req: Request, res: Response): Promise<void> {
    res.clearCookie('auth_token');
    res.json({
      success: true,
      message: 'Logged out successfully',
      timestamp: new Date().toISOString()
    });
  }
}
