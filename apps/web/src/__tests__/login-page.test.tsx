import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import LoginPage from "@/app/(auth)/login/page";
import { useAuthStore } from "@/stores/auth-store";

// Mock Next.js navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

// Mock the API client
vi.mock("@/lib/api-client", () => ({
  apiClient: {
    postPublic: vi.fn(),
  },
  ApiClientError: class ApiClientError extends Error {
    code: string;
    status: number;
    constructor(code: string, message: string, status: number) {
      super(message);
      this.code = code;
      this.status = status;
    }
  },
}));

import { apiClient, ApiClientError } from "@/lib/api-client";

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      accessToken: null,
      user: null,
      isAuthenticated: false,
    });
  });

  it("renders email and password fields with visible labels", () => {
    render(<LoginPage />);

    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("has a register link", () => {
    render(<LoginPage />);
    const registerLink = screen.getByRole("link", { name: /register/i });
    expect(registerLink).toHaveAttribute("href", "/register");
  });

  it("shows validation error for empty submission", async () => {
    render(<LoginPage />);

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it("shows validation error for invalid email format", async () => {
    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "not-an-email" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it("shows error message for invalid credentials", async () => {
    const { ApiClientError: MockApiError } = await import("@/lib/api-client");
    vi.mocked(apiClient.postPublic).mockRejectedValue(
      new MockApiError("INVALID_CREDENTIALS", "Invalid email or password", 401)
    );

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "WrongPassword1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("calls setAuth and redirects to dashboard on successful login", async () => {
    const mockResponse = {
      user: {
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        role: "admin",
        tenantId: "tenant-456",
      },
      accessToken: "access.token",
    };

    vi.mocked(apiClient.postPublic).mockResolvedValue(mockResponse);

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Password1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().user?.email).toBe("test@example.com");
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("inputs have aria-describedby linking to error messages", async () => {
    render(<LoginPage />);

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      const emailInput = screen.getByLabelText("Email address");
      expect(emailInput).toHaveAttribute("aria-invalid", "true");
      expect(emailInput).toHaveAttribute("aria-describedby", "email-error");
    });
  });
});
