import { describe, expect, it } from "vitest"

import { isValidEmail } from "@/lib/validate-email"

describe("isValidEmail", () => {
  it("accepts common valid addresses", () => {
    expect(isValidEmail("user@example.com")).toBe(true)
    expect(isValidEmail("a+b@sub.domain.co")).toBe(true)
  })

  it("rejects invalid patterns", () => {
    expect(isValidEmail("")).toBe(false)
    expect(isValidEmail("nope")).toBe(false)
    expect(isValidEmail("@nodomain.com")).toBe(false)
    expect(isValidEmail("space @x.com")).toBe(false)
  })

  it("trims before validating", () => {
    expect(isValidEmail("  u@x.com  ")).toBe(true)
  })
})
