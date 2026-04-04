import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { AlertRuleBuilder } from "@/components/alerts/alert-rule-builder";
import { useAlertRulesStore } from "@/stores/alert-rules-store";

describe("AlertRuleBuilder", () => {
  beforeEach(() => {
    localStorage.removeItem("price-tracker-alert-rules");
    useAlertRulesStore.setState({ rules: [] });
    vi.stubGlobal("confirm", vi.fn(() => true));
  });

  it("shows empty state when there are no rules", () => {
    render(<AlertRuleBuilder />);
    expect(screen.getByTestId("alert-rules-empty")).toBeInTheDocument();
  });

  it("creates a rule from the dialog", async () => {
    const user = userEvent.setup();
    render(<AlertRuleBuilder />);

    await user.click(screen.getByRole("button", { name: /new rule/i }));

    const dialog = screen.getByRole("dialog");
    await user.type(within(dialog).getByLabelText(/name/i), "SKU drop alert");

    await user.click(within(dialog).getByRole("button", { name: /create rule/i }));

    expect(screen.getByText("SKU drop alert")).toBeInTheDocument();
    expect(screen.queryByTestId("alert-rules-empty")).not.toBeInTheDocument();
  });

  it("toggles rule enabled state", async () => {
    useAlertRulesStore.getState().addRule({
      name: "On/off",
      enabled: true,
      conditionType: "price_below",
      threshold: 20,
      productScope: "all",
      productLabel: "",
      cooldownHours: 1,
    });

    const user = userEvent.setup();
    render(<AlertRuleBuilder />);

    const toggle = screen.getByRole("button", { name: /pause on\/off/i });
    await user.click(toggle);
    expect(useAlertRulesStore.getState().rules[0].enabled).toBe(false);
  });
});
