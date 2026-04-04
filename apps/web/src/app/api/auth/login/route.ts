import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/auth/validation';
import { ensureDemoUserSeeded, findUserByEmail, toAuthPayload } from '@/lib/auth/user-store';
import { verifyPassword } from '@/lib/auth/password';
import { authRateLimit, jsonWithAuthCookies } from '@/lib/auth/route-helpers';

export async function POST(request: NextRequest) {
  const limited = authRateLimit(request);
  if (limited) {
    return limited;
  }

  await ensureDemoUserSeeded();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return NextResponse.json(
      { error: 'Validation failed', fields: fieldErrors },
      { status: 400 },
    );
  }

  const user = findUserByEmail(parsed.data.email);
  const valid =
    user !== undefined && (await verifyPassword(parsed.data.password, user.passwordHash));

  if (!valid) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const payload = toAuthPayload(user);
  return jsonWithAuthCookies(
    { ok: true, user: { id: user.id, email: user.email, name: user.name } },
    payload,
  );
}
