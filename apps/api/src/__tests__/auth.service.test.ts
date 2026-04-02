import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the DB client before importing the service
vi.mock('../db/client', () => ({
  db: {
    query: {
      users: {
        findFirst: vi.fn(),
      },
      refreshTokens: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(),
    delete: vi.fn(),
    transaction: vi.fn(),
  },
}));

vi.mock('../db/schema', () => ({
  tenants: {},
  users: {},
  refreshTokens: {},
}));

// Mock bcrypt
vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('$2b$12$hashedpassword'),
    compare: vi.fn(),
  },
  hash: vi.fn().mockResolvedValue('$2b$12$hashedpassword'),
  compare: vi.fn(),
}));

// Mock jose JWT functions
vi.mock('jose', () => ({
  SignJWT: vi.fn().mockImplementation(() => ({
    setProtectedHeader: vi.fn().mockReturnThis(),
    setIssuedAt: vi.fn().mockReturnThis(),
    setExpirationTime: vi.fn().mockReturnThis(),
    sign: vi.fn().mockResolvedValue('mock.jwt.token'),
  })),
  jwtVerify: vi.fn(),
}));

import bcrypt from 'bcrypt';
import { jwtVerify } from 'jose';
import { db } from '../db/client';
import { tenants, users, refreshTokens } from '../db/schema';
import { AppError } from '../utils/errors';

// Set required env vars
process.env.JWT_SECRET = 'test-secret-key-for-testing-only-must-be-long';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing-only-must-be-long';

describe('auth.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('throws EMAIL_TAKEN if email already exists', async () => {
      const { register } = await import('../services/auth.service');
      vi.mocked(db.query.users.findFirst).mockResolvedValue({
        id: 'existing-user-id',
        email: 'test@example.com',
      } as never);

      await expect(
        register({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password1',
          confirmPassword: 'Password1',
        })
      ).rejects.toThrow(AppError);

      await expect(
        register({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password1',
          confirmPassword: 'Password1',
        })
      ).rejects.toMatchObject({ code: 'EMAIL_TAKEN' });
    });

    it('creates tenant and user in transaction and returns AuthResponse', async () => {
      const { register } = await import('../services/auth.service');
      vi.mocked(db.query.users.findFirst).mockResolvedValue(undefined);

      const mockTenant = { id: 'tenant-123', name: "Test User's Organization" };
      const mockUser = {
        id: 'user-456',
        tenantId: 'tenant-123',
        email: 'new@example.com',
        name: 'Test User',
        role: 'admin',
        passwordHash: '$2b$12$hashedpassword',
        createdAt: new Date(),
      };

      vi.mocked(db.transaction).mockImplementation(async (fn) => {
        const tx = {
          insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
              returning: vi
                .fn()
                .mockResolvedValueOnce([mockTenant])
                .mockResolvedValueOnce([mockUser]),
            }),
          }),
        };
        return fn(tx as never);
      });

      const result = await register({
        name: 'Test User',
        email: 'new@example.com',
        password: 'Password1',
        confirmPassword: 'Password1',
      });

      expect(result).toMatchObject({
        user: {
          id: 'user-456',
          email: 'new@example.com',
          name: 'Test User',
          role: 'admin',
          tenantId: 'tenant-123',
        },
        accessToken: 'mock.jwt.token',
      });
    });

    it('hashes password with bcrypt cost factor >= 12', async () => {
      const { register } = await import('../services/auth.service');
      vi.mocked(db.query.users.findFirst).mockResolvedValue(undefined);
      vi.mocked(db.transaction).mockImplementation(async (fn) => {
        const tx = {
          insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
              returning: vi
                .fn()
                .mockResolvedValueOnce([{ id: 't1', name: "U's Organization" }])
                .mockResolvedValueOnce([
                  {
                    id: 'u1',
                    tenantId: 't1',
                    email: 'u@e.com',
                    name: 'U',
                    role: 'admin',
                    passwordHash: '$2b$12$hash',
                    createdAt: new Date(),
                  },
                ]),
            }),
          }),
        };
        return fn(tx as never);
      });

      await register({
        name: 'U',
        email: 'u@e.com',
        password: 'Password1',
        confirmPassword: 'Password1',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('Password1', 12);
    });
  });

  describe('login', () => {
    const mockUser = {
      id: 'user-789',
      tenantId: 'tenant-456',
      email: 'user@example.com',
      name: 'Test User',
      role: 'admin',
      passwordHash: '$2b$12$hashedpassword',
      createdAt: new Date(),
    };

    it('throws INVALID_CREDENTIALS for unknown email', async () => {
      const { login } = await import('../services/auth.service');
      vi.mocked(db.query.users.findFirst).mockResolvedValue(undefined);

      await expect(
        login({ email: 'unknown@example.com', password: 'Password1' })
      ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
    });

    it('throws INVALID_CREDENTIALS for wrong password', async () => {
      const { login } = await import('../services/auth.service');
      vi.mocked(db.query.users.findFirst).mockResolvedValue(mockUser as never);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        login({ email: 'user@example.com', password: 'WrongPassword1' })
      ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
    });

    it('returns AuthResponse with refresh token on valid credentials', async () => {
      const { login } = await import('../services/auth.service');
      vi.mocked(db.query.users.findFirst).mockResolvedValue(mockUser as never);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      } as never);

      const result = await login({
        email: 'user@example.com',
        password: 'Password1',
      });

      expect(result).toMatchObject({
        user: {
          id: 'user-789',
          email: 'user@example.com',
          name: 'Test User',
          role: 'admin',
          tenantId: 'tenant-456',
        },
        accessToken: 'mock.jwt.token',
        refreshToken: 'mock.jwt.token',
      });
    });
  });

  describe('refreshAccessToken', () => {
    it('throws TOKEN_INVALID for a bad token', async () => {
      const { refreshAccessToken } = await import('../services/auth.service');
      vi.mocked(jwtVerify).mockRejectedValue(new Error('invalid token'));

      await expect(refreshAccessToken('bad-token')).rejects.toMatchObject({
        code: 'TOKEN_INVALID',
      });
    });

    it('throws TOKEN_INVALID when token not found in DB', async () => {
      const { refreshAccessToken } = await import('../services/auth.service');
      vi.mocked(jwtVerify).mockResolvedValue({
        payload: { userId: 'user-123' },
      } as never);
      vi.mocked(db.query.refreshTokens.findFirst).mockResolvedValue(undefined);

      await expect(refreshAccessToken('valid.jwt.token')).rejects.toMatchObject({
        code: 'TOKEN_INVALID',
      });
    });
  });

  describe('logout', () => {
    it('deletes the refresh token from the DB', async () => {
      const { logout } = await import('../services/auth.service');
      vi.mocked(db.delete).mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      } as never);

      await logout('some.refresh.token');

      expect(db.delete).toHaveBeenCalledWith(refreshTokens);
    });
  });
});
