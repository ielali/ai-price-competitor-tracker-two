import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AlertRule } from "@/types/alert-rule";

export type AlertRuleDraft = Omit<AlertRule, "id" | "createdAt">;

function createRuleId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `rule-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

interface AlertRulesState {
  rules: AlertRule[];
  addRule: (draft: AlertRuleDraft) => AlertRule;
  updateRule: (id: string, draft: AlertRuleDraft) => void;
  removeRule: (id: string) => void;
  toggleRule: (id: string) => void;
}

export const useAlertRulesStore = create<AlertRulesState>()(
  persist(
    (set) => ({
      rules: [],
      addRule: (draft) => {
        const rule: AlertRule = {
          ...draft,
          id: createRuleId(),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ rules: [...s.rules, rule] }));
        return rule;
      },
      updateRule: (id, draft) =>
        set((s) => ({
          rules: s.rules.map((r) =>
            r.id === id ? { ...r, ...draft } : r,
          ),
        })),
      removeRule: (id) =>
        set((s) => ({ rules: s.rules.filter((r) => r.id !== id) })),
      toggleRule: (id) =>
        set((s) => ({
          rules: s.rules.map((r) =>
            r.id === id ? { ...r, enabled: !r.enabled } : r,
          ),
        })),
    }),
    {
      name: "price-tracker-alert-rules",
      partialize: (state) => ({ rules: state.rules }),
    },
  ),
);
