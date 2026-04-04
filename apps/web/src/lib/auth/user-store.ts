import type { Role } from './types';
import { hashPassword } from './password';

export type StoredUser = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  roles: Role[];
};

const byEmail = new Map<string, StoredUser>();
const byId = new Map<string, StoredUser>();

let demoSeedPromise: Promise<void> | null = null;

export async function createStoredUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<StoredUser> {
  const email = input.email.trim().toLowerCase();
  if (byEmail.has(email)) {
    throw new Error('Email already registered');
  }
  const user: StoredUser = {
    id: crypto.randomUUID(),
    email,
    name: input.name.trim(),
    passwordHash: await hashPassword(input.password),
    roles: ['member'],
  };
  byEmail.set(email, user);
  byId.set(user.id, user);
  return user;
}

/**
 * Ensures a demo account exists when DEMO_USER_EMAIL + DEMO_USER_PASSWORD (or legacy AUTH_DEMO_*)
 * are set. Idempotent; safe to call on every login.
 */
export async function ensureDemoUserSeeded(): Promise<void> {
  if (!demoSeedPromise) {
    demoSeedPromise = seedDemoUserOnce();
  }
  await demoSeedPromise;
}

async function seedDemoUserOnce(): Promise<void> {
  const emailRaw =
    process.env.DEMO_USER_EMAIL?.trim() ?? process.env.AUTH_DEMO_USER_EMAIL?.trim();
  const password =
    process.env.DEMO_USER_PASSWORD ?? process.env.AUTH_DEMO_PASSWORD;
  if (!emailRaw || !password) {
    return;
  }
  const email = emailRaw.toLowerCase();
  if (byEmail.has(email)) {
    return;
  }
  const name = process.env.DEMO_USER_NAME?.trim() || 'Demo User';
  try {
    await createStoredUser({ name, email, password });
  } catch {
    /* concurrent seed or duplicate */
  }
}

/** @internal Vitest */
export function __resetUserStoreForTests(): void {
  byEmail.clear();
  byId.clear();
  demoSeedPromise = null;
}

export function findUserByEmail(email: string): StoredUser | undefined {
  return byEmail.get(email.trim().toLowerCase());
}

export function findUserById(id: string): StoredUser | undefined {
  return byId.get(id);
}

export function toAuthPayload(user: StoredUser) {
  return {
    sub: user.id,
    email: user.email,
    name: user.name,
    roles: user.roles,
  };
}
