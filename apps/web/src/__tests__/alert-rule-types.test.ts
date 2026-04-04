import { describe, it, expect } from "vitest";
import { conditionTypeLabel } from "@/types/alert-rule";

describe("alert-rule types", () => {
  it("conditionTypeLabel returns a friendly label", () => {
    expect(conditionTypeLabel("price_drop_percent")).toContain("Price drops");
  });
});
