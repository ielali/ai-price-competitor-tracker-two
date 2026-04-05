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

const searchParamsString = vi.fn(() => '');

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh }),
  useSearchParams: () => new URLSearchParams(searchParamsString()),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    signIn.mockReset();
    push.mockReset();
    refresh.mockReset();
    searchParamsString.mockReturnValue('');
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

  it('uses relative callbackUrl from query when safe', async () => {
    const user = userEvent.setup();
    searchParamsString.mockReturnValue('callbackUrl=%2Fproducts');
    signIn.mockResolvedValue({ ok: true, error: null });

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'demo@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'demo-password');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(signIn).toHaveBeenCalledWith(
      'credentials',
      expect.objectContaining({ callbackUrl: '/products' }),
    );
    expect(push).toHaveBeenCalledWith('/products');
  });

  it('ignores external callbackUrl values', async () => {
    const user = userEvent.setup();
    searchParamsString.mockReturnValue('callbackUrl=https%3A%2F%2Fevil.example');
    signIn.mockResolvedValue({ ok: true, error: null });

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'demo@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'demo-password');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(signIn).toHaveBeenCalledWith(
      'credentials',
      expect.objectContaining({ callbackUrl: '/' }),
    );
    expect(push).toHaveBeenCalledWith('/');
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
