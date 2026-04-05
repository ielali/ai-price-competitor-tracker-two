import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LoginForm } from "@/components/auth/login-form";

vi.mock("react-dom", async (importOriginal) => {
  const mod = await importOriginal<typeof import("react-dom")>();
  return {
    ...mod,
    useFormState: vi.fn((_action: unknown, initial: unknown) => [initial, vi.fn()]),
    useFormStatus: () => ({ pending: false }),
  };
});

describe("LoginForm", () => {
  it("renders email and password fields and submit", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in$/i }),
    ).toBeInTheDocument();
  });
});
