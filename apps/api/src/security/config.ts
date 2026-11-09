import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('4000').transform((v) => parseInt(v, 10)),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/devdock'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  JWT_SECRET: z.string().default('devdock-default-dev-secret-minimum-32-chars-long!'),
  JWT_EXPIRES_IN: z.string().default('1h'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform((v) => parseInt(v, 10)),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform((v) => parseInt(v, 10))
});

export const config = envSchema.parse(process.env);
