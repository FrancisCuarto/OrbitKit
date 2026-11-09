import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { hashPassword, verifyPassword } from '../security/argon.js';
import { generateToken, verifyToken } from '../security/jwt.js';

describe('DevDock REST API Endpoints & Security', () => {
  const app = createApp();

  it('responds with healthy status on /api/health', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
    expect(typeof response.body.uptime).toBe('number');
  });

  it('includes Helmet security headers', async () => {
    const response = await request(app).get('/api/health');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
  });

  it('hashes and verifies passwords securely using Argon2id', async () => {
    const password = 'SuperSecretDevPassword2026!';
    const hash = await hashPassword(password);

    expect(hash).toContain('$argon2id$');
    const matches = await verifyPassword(hash, password);
    expect(matches).toBe(true);

    const wrongMatches = await verifyPassword(hash, 'wrong_password');
    expect(wrongMatches).toBe(false);
  });

  it('signs and verifies JWT tokens', () => {
    const payload = {
      userId: 'user_123',
      email: 'admin@devdock.io',
      role: 'admin' as const
    };

    const token = generateToken(payload);
    expect(typeof token).toBe('string');

    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.email).toBe('admin@devdock.io');
    expect(decoded?.role).toBe('admin');
  });
});
