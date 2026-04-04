export const ROLES = ['admin', 'member'] as const;
export type Role = (typeof ROLES)[number];

export type AuthTokenPayload = {
  sub: string;
  email: string;
  name: string;
  roles: Role[];
};
