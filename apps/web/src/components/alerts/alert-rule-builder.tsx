"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { AlertConditionType, AlertRule } from "@/types/alert-rule";
import { ALERT_CONDITION_OPTIONS, conditionTypeLabel } from "@/types/alert-rule";
import type { AlertRuleDraft } from "@/stores/alert-rules-store";
import { useAlertRulesStore } from "@/stores/alert-rules-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const inputSelectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

function defaultDraft(): AlertRuleDraft {
  return {
    name: "",
    enabled: true,
    conditionType: "price_drop_percent",
    threshold: 5,
    productScope: "all",
    productLabel: "",
    cooldownHours: 24,
  };
}

function ruleToDraft(rule: AlertRule): AlertRuleDraft {
  const { id: _id, createdAt: _c, ...draft } = rule;
  return draft;
}

function validateDraft(draft: AlertRuleDraft): string | null {
  const name = draft.name.trim();
  if (!name) return "Name is required.";
  if (draft.threshold <= 0 || Number.isNaN(draft.threshold)) {
    return "Threshold must be a positive number.";
  }
  if (
    Number.isNaN(draft.cooldownHours) ||
    draft.cooldownHours < 0
  ) {
    return "Cooldown must be zero or a positive whole number.";
  }
  if (
    draft.productScope === "specific" &&
    !draft.productLabel.trim()
  ) {
    return "Product name is required when scope is a specific product.";
  }
  return null;
}

function formatThreshold(rule: AlertRule): string {
  if (rule.conditionType === "price_below") {
    return `$${rule.threshold.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  }
  return `${rule.threshold}%`;
}

export function AlertRuleBuilder() {
  const rules = useAlertRulesStore((s) => s.rules);
  const addRule = useAlertRulesStore((s) => s.addRule);
  const updateRule = useAlertRulesStore((s) => s.updateRule);
  const removeRule = useAlertRulesStore((s) => s.removeRule);
  const toggleRule = useAlertRulesStore((s) => s.toggleRule);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AlertRuleDraft>(defaultDraft);
  const [formError, setFormError] = useState<string | null>(null);

  const sortedRules = useMemo(
    () => [...rules].sort((a, b) => a.name.localeCompare(b.name)),
    [rules],
  );

  useEffect(() => {
    if (!dialogOpen) {
      setFormError(null);
    }
  }, [dialogOpen]);

  function openCreate() {
    setEditingId(null);
    setDraft(defaultDraft());
    setFormError(null);
    setDialogOpen(true);
  }

  function openEdit(rule: AlertRule) {
    setEditingId(rule.id);
    setDraft(ruleToDraft(rule));
    setFormError(null);
    setDialogOpen(true);
  }

  function submitForm() {
    const err = validateDraft(draft);
    if (err) {
      setFormError(err);
      return;
    }
    const normalized: AlertRuleDraft = {
      ...draft,
      name: draft.name.trim(),
      productLabel:
        draft.productScope === "all" ? "" : draft.productLabel.trim(),
    };
    if (editingId) {
      updateRule(editingId, normalized);
    } else {
      addRule(normalized);
    }
    setDialogOpen(false);
  }

  function confirmRemove(rule: AlertRule) {
    const ok =
      typeof window === "undefined" ||
      window.confirm(
        `Delete alert rule "${rule.name}"? This cannot be undone.`,
      );
    if (ok) removeRule(rule.id);
  }

  const conditionHint =
    ALERT_CONDITION_OPTIONS.find((o) => o.value === draft.conditionType)
      ?.thresholdHint ?? "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alert rules</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Define when you want to be notified about price movements. Rules are
            stored in this browser until backend delivery is wired.
          </p>
        </div>
        <Button type="button" onClick={openCreate} className="shrink-0">
          <Plus className="size-4" aria-hidden />
          New rule
        </Button>
      </div>

      {sortedRules.length === 0 ? (
        <div
          className="rounded-lg border border-dashed p-8 text-center text-muted-foreground"
          data-testid="alert-rules-empty"
        >
          No alert rules yet. Create one to get notified when prices change.
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Condition</TableHead>
                <TableHead className="hidden md:table-cell">Scope</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[140px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">
                    <div>{rule.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground sm:hidden">
                      {conditionTypeLabel(rule.conditionType)} ·{" "}
                      {formatThreshold(rule)}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div>{conditionTypeLabel(rule.conditionType)}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatThreshold(rule)}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {rule.productScope === "all"
                      ? "All products"
                      : rule.productLabel || "Specific product"}
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant={rule.enabled ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => toggleRule(rule.id)}
                      aria-pressed={rule.enabled}
                      aria-label={
                        rule.enabled ? `Pause ${rule.name}` : `Enable ${rule.name}`
                      }
                    >
                      {rule.enabled ? "On" : "Off"}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(rule)}
                        aria-label={`Edit ${rule.name}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => confirmRemove(rule)}
                        aria-label={`Delete ${rule.name}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit alert rule" : "New alert rule"}
            </DialogTitle>
            <DialogDescription>
              Notifications will respect the cooldown window to avoid spam.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {formError ? (
              <p className="text-sm text-destructive" role="alert">
                {formError}
              </p>
            ) : null}

            <div className="grid gap-2">
              <label htmlFor="rule-name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="rule-name"
                value={draft.name}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, name: e.target.value }))
                }
                placeholder="e.g. USB hub — major price drop"
                autoComplete="off"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="rule-condition" className="text-sm font-medium">
                Condition
              </label>
              <select
                id="rule-condition"
                className={inputSelectClass}
                value={draft.conditionType}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    conditionType: e.target.value as AlertConditionType,
                  }))
                }
              >
                {ALERT_CONDITION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">{conditionHint}</p>
            </div>

            <div className="grid gap-2">
              <label htmlFor="rule-threshold" className="text-sm font-medium">
                Threshold
              </label>
              <Input
                id="rule-threshold"
                type="number"
                min={0.01}
                step="any"
                value={Number.isNaN(draft.threshold) ? "" : draft.threshold}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    threshold: parseFloat(e.target.value),
                  }))
                }
              />
            </div>

            <fieldset className="grid gap-2">
              <legend className="text-sm font-medium">Product scope</legend>
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="product-scope"
                    checked={draft.productScope === "all"}
                    onChange={() =>
                      setDraft((d) => ({
                        ...d,
                        productScope: "all",
                        productLabel: "",
                      }))
                    }
                    className="h-4 w-4 accent-primary"
                  />
                  All products
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="product-scope"
                    checked={draft.productScope === "specific"}
                    onChange={() =>
                      setDraft((d) => ({ ...d, productScope: "specific" }))
                    }
                    className="h-4 w-4 accent-primary"
                  />
                  Specific product
                </label>
              </div>
            </fieldset>

            {draft.productScope === "specific" ? (
              <div className="grid gap-2">
                <label htmlFor="rule-product" className="text-sm font-medium">
                  Product name
                </label>
                <Input
                  id="rule-product"
                  value={draft.productLabel}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, productLabel: e.target.value }))
                  }
                  placeholder="Match label from your catalog"
                  autoComplete="off"
                />
              </div>
            ) : null}

            <div className="grid gap-2">
              <label htmlFor="rule-cooldown" className="text-sm font-medium">
                Cooldown (hours)
              </label>
              <Input
                id="rule-cooldown"
                type="number"
                min={0}
                step={1}
                value={
                  Number.isNaN(draft.cooldownHours) ? "" : draft.cooldownHours
                }
                onChange={(e) => {
                  const raw = e.target.value;
                  setDraft((d) => ({
                    ...d,
                    cooldownHours:
                      raw === ""
                        ? NaN
                        : Math.max(0, parseInt(raw, 10) || 0),
                  }));
                }}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="rule-enabled"
                type="checkbox"
                checked={draft.enabled}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, enabled: e.target.checked }))
                }
                className="h-4 w-4 accent-primary"
              />
              <label htmlFor="rule-enabled" className="text-sm font-medium">
                Enabled
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={submitForm}>
              {editingId ? "Save changes" : "Create rule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
