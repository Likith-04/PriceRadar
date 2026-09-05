import { describe, it, expect } from "vitest";
import { validateTargetPrice, validateProductUrl } from "../lib/validation";

describe("Target Price Validation", () => {
  it("should allow null/empty to clear target price", () => {
    expect(validateTargetPrice(null)).toEqual({ valid: true, value: null });
    expect(validateTargetPrice(undefined)).toEqual({ valid: true, value: null });
    expect(validateTargetPrice("")).toEqual({ valid: true, value: null });
  });

  it("should validate and round valid positive numbers", () => {
    expect(validateTargetPrice(99.99)).toEqual({ valid: true, value: 99.99 });
    expect(validateTargetPrice("150.50")).toEqual({ valid: true, value: 150.5 });
    expect(validateTargetPrice("49.999")).toEqual({ valid: true, value: 50 });
    expect(validateTargetPrice(100)).toEqual({ valid: true, value: 100 });
  });

  it("should reject zero and negative values", () => {
    expect(validateTargetPrice(0).valid).toBe(false);
    expect(validateTargetPrice(-10).valid).toBe(false);
    expect(validateTargetPrice("-5.99").valid).toBe(false);
  });

  it("should reject invalid non-numeric inputs", () => {
    expect(validateTargetPrice("invalid").valid).toBe(false);
    expect(validateTargetPrice(NaN).valid).toBe(false);
    expect(validateTargetPrice(Infinity).valid).toBe(false);
  });

  it("should reject values exceeding 10,000,000", () => {
    expect(validateTargetPrice(10000001).valid).toBe(false);
    expect(validateTargetPrice(10000000).valid).toBe(true);
  });
});

describe("Product URL Validation", () => {
  it("should reject empty or whitespace URLs", () => {
    expect(validateProductUrl("").valid).toBe(false);
    expect(validateProductUrl("   ").valid).toBe(false);
    expect(validateProductUrl(null).valid).toBe(false);
  });

  it("should accept and normalize valid URLs", () => {
    const res = validateProductUrl("https://amazon.com/dp/B08N5WRWNW?ref=xyz&utm_source=test");
    expect(res.valid).toBe(true);
    expect(res.value).toBe("https://amazon.com/dp/B08N5WRWNW");
  });
});
