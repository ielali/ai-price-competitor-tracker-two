import { describe, it, expect, beforeEach } from "vitest";
import { useAlertRulesStore } from "@/stores/alert-rules-store";

const draft = {
  name: "Test rule",
  enabled: true,
  conditionType: "price_drop_percent" as const,
  threshold: 10,
  productScope: "all" as const,
  productLabel: "",
  cooldownHours: 12,
};

describe("useAlertRulesStore", () => {
  beforeEach(() => {
    localStorage.removeItem("price-tracker-alert-rules");
    useAlertRulesStore.setState({ rules: [] });
  });

  it("starts with no rules after reset", () => {
    expect(useAlertRulesStore.getState().rules).toEqual([]);
  });

  it("addRule appends a rule with id and createdAt", () => {
    const created = useAlertRulesStore.getState().addRule(draft);
    expect(created.id).toBeTruthy();
    expect(created.createdAt).toMatch(/^\d{4}-/);
    expect(useAlertRulesStore.getState().rules).toHaveLength(1);
    expect(useAlertRulesStore.getState().rules[0].name).toBe("Test rule");
  });

  it("updateRule patches fields", () => {
    const { id } = useAlertRulesStore.getState().addRule(draft);
    useAlertRulesStore.getState().updateRule(id, { ...draft, name: "Renamed" });
    expect(useAlertRulesStore.getState().rules[0].name).toBe("Renamed");
  });

  it("removeRule drops by id", () => {
    const { id } = useAlertRulesStore.getState().addRule(draft);
    useAlertRulesStore.getState().removeRule(id);
    expect(useAlertRulesStore.getState().rules).toEqual([]);
  });

  it("toggleRule flips enabled", () => {
    const { id } = useAlertRulesStore.getState().addRule(draft);
    expect(useAlertRulesStore.getState().rules[0].enabled).toBe(true);
    useAlertRulesStore.getState().toggleRule(id);
    expect(useAlertRulesStore.getState().rules[0].enabled).toBe(false);
  });
});
