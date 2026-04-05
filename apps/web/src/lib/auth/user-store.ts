import fs from "fs";
import path from "path";
import type { Role } from "./constants";

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: Role;
}

const dataDir = path.join(process.cwd(), ".data");
const usersFile = path.join(dataDir, "users.json");

function ensureStorage() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, "[]", "utf-8");
  }
}

export function loadUsers(): StoredUser[] {
  ensureStorage();
  try {
    const raw = fs.readFileSync(usersFile, "utf-8");
    return JSON.parse(raw) as StoredUser[];
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]) {
  ensureStorage();
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), "utf-8");
}

export function findUserByEmail(email: string): StoredUser | undefined {
  const lower = email.toLowerCase();
  return loadUsers().find((u) => u.email.toLowerCase() === lower);
}

export function createUser(input: {
  email: string;
  name: string;
  passwordHash: string;
  role?: Role;
}): StoredUser | null {
  const users = loadUsers();
  if (users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    return null;
  }
  const user: StoredUser = {
    id: crypto.randomUUID(),
    email: input.email.trim(),
    name: input.name.trim(),
    passwordHash: input.passwordHash,
    role: input.role ?? "user",
  };
  users.push(user);
  saveUsers(users);
  return user;
}
