import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Sidebar } from '@/components/layout/sidebar';

vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: { email: 'signed-in@test.dev', name: null, image: null },
      expires: '1',
    },
    status: 'authenticated' as const,
  }),
  signOut: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({
    children,
    render,
  }: {
    children: React.ReactNode;
    render?: React.ReactElement;
  }) => {
    if (render) {
      const el = render as React.ReactElement<Record<string, unknown>>;
      const Comp = el.type as React.ElementType;
      return <Comp {...el.props}>{children}</Comp>;
    }
    return <>{children}</>;
  },
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <div role="tooltip">{children}</div>
  ),
  TooltipProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock('@/stores/sidebar-store', () => ({
  useSidebarStore: () => ({
    collapsed: false,
    toggle: vi.fn(),
  }),
}));

describe('Sidebar with session', () => {
  it('shows user email in footer when sidebar is expanded', () => {
    render(<Sidebar />);
    expect(screen.getByText('signed-in@test.dev')).toBeInTheDocument();
  });
});
