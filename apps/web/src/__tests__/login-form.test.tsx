import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginForm } from '@/app/(auth)/login/login-form';

const mockGet = vi.fn();
const signInMock = vi.fn();

vi.mock('next-auth/react', () => ({
  signIn: (...args: unknown[]) => signInMock(...args),
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => mockGet(key),
  }),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    mockGet.mockImplementation((key: string) =>
      key === 'callbackUrl' ? null : null
    );
    signInMock.mockReset();
  });

  it('defaults callback to / when param missing', async () => {
    signInMock.mockResolvedValue({ error: null, url: 'http://localhost/' });
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'a@b.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'x' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith(
        'credentials',
        expect.objectContaining({ callbackUrl: '/' })
      );
    });
  });

  it('uses safe relative callbackUrl only', async () => {
    mockGet.mockImplementation((key: string) =>
      key === 'callbackUrl' ? '//evil.test/steal' : null
    );
    signInMock.mockResolvedValue({ error: null, url: 'http://localhost/' });
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'a@b.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'x' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith(
        'credentials',
        expect.objectContaining({ callbackUrl: '/' })
      );
    });
  });

  it('shows error when signIn returns error', async () => {
    signInMock.mockResolvedValue({ error: 'CredentialsSignin', url: null });
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'a@b.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'bad' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Invalid email or password.'
    );
  });
});
