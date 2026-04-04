import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/lib/auth/validation';
import { createStoredUser, toAuthPayload } from '@/lib/auth/user-store';
import { authRateLimit, jsonWithAuthCookies } from '@/lib/auth/route-helpers';

export async function POST(request: NextRequest) {
  const limited = authRateLimit(request);
  if (limited) {
    return limited;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return NextResponse.json(
      { error: 'Validation failed', fields: fieldErrors },
      { status: 400 },
    );
  }

  const { name, email, password } = parsed.data;

  try {
    const user = await createStoredUser({ name, email, password });
    const payload = toAuthPayload(user);
    return jsonWithAuthCookies({ ok: true, user: { id: user.id, email: user.email, name: user.name } }, payload, {
      status: 201,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Registration failed';
    if (message === 'Email already registered') {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
