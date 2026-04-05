import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/auth/login-form';

const signIn = vi.fn();
const push = vi.fn();
const refresh = vi.fn();

vi.mock('next-auth/react', () => ({
  signIn: (...args: unknown[]) => signIn(...args),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh }),
  useSearchParams: () => new URLSearchParams(),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    signIn.mockReset();
    push.mockReset();
    refresh.mockReset();
  });

  it('shows error when signIn fails', async () => {
    const user = userEvent.setup();
    signIn.mockResolvedValue({ error: 'CredentialsSignin' });

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'demo@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'demo-password');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it('redirects when signIn succeeds', async () => {
    const user = userEvent.setup();
    signIn.mockResolvedValue({ ok: true, error: null });

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'demo@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'demo-password');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByRole('button', { name: /sign in/i })).toBeEnabled();
    expect(signIn).toHaveBeenCalledWith(
      'credentials',
      expect.objectContaining({
        email: 'demo@example.com',
        password: 'demo-password',
        redirect: false,
      }),
    );
    expect(push).toHaveBeenCalledWith('/');
    expect(refresh).toHaveBeenCalled();
  });
});
