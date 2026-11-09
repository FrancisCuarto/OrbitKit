import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import { helmetMiddleware, corsMiddleware, generalRateLimiter } from './middleware/security.js';
import { errorHandler } from './middleware/errorHandler.js';
import resourceRoutes from './routes/resourceRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

export function createApp(): Express {
  const app = express();

  // Security headers & CORS
  app.use(helmetMiddleware);
  app.use(corsMiddleware);

  // Body parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());

  // Global rate limiter
  app.use(generalRateLimiter);

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  // REST API Endpoints
  app.use('/api/resources', resourceRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);

  // Central error handling middleware
  app.use(errorHandler);

  return app;
}
