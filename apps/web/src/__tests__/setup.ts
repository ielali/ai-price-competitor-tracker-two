import '@testing-library/jest-dom/vitest';

process.env.AUTH_SECRET =
  process.env.AUTH_SECRET ?? 'test-auth-secret-at-least-32-characters-long';
