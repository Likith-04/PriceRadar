import { describe, it, expect } from "vitest";
import { validateTargetPrice, validateProductUrl } from "../lib/validation";
import { RETAILER_IDS, SUPPORTED_RETAILERS_SUMMARY } from "../lib/retailers";

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

describe("Product URL & Retailer Validation", () => {
  it("should reject empty or whitespace URLs", () => {
    expect(validateProductUrl("").valid).toBe(false);
    expect(validateProductUrl("   ").valid).toBe(false);
    expect(validateProductUrl(null).valid).toBe(false);
  });

  it("should accept and detect Amazon India URLs", () => {
    const res = validateProductUrl("https://amazon.in/dp/B08N5WRWNW?ref=xyz&utm_source=test");
    expect(res.valid).toBe(true);
    expect(res.retailer).toBe(RETAILER_IDS.AMAZON);
    expect(res.value).toBe("https://amazon.in/dp/B08N5WRWNW");
  });

  it("should accept and detect Flipkart URLs", () => {
    const res = validateProductUrl(
      "https://www.flipkart.com/apple-iphone-16-black-128-gb/p/itm12345?pid=MOB12345&lid=123"
    );
    expect(res.valid).toBe(true);
    expect(res.retailer).toBe(RETAILER_IDS.FLIPKART);
    expect(res.value).toBe(
      "https://www.flipkart.com/apple-iphone-16-black-128-gb/p/itm12345?pid=MOB12345"
    );
  });

  it("should accept and detect Reliance Digital URLs", () => {
    const res = validateProductUrl(
      "https://www.reliancedigital.in/apple-iphone-16-128-gb-black/p/494422941?gclid=123"
    );
    expect(res.valid).toBe(true);
    expect(res.retailer).toBe(RETAILER_IDS.RELIANCE_DIGITAL);
    expect(res.value).toBe(
      "https://www.reliancedigital.in/apple-iphone-16-128-gb-black/p/494422941"
    );
  });

  it("should accept and detect Croma URLs", () => {
    const res = validateProductUrl(
      "https://www.croma.com/apple-iphone-16-128gb-black-/p/308529?utm_source=croma"
    );
    expect(res.valid).toBe(true);
    expect(res.retailer).toBe(RETAILER_IDS.CROMA);
    expect(res.value).toBe(
      "https://www.croma.com/apple-iphone-16-128gb-black-/p/308529"
    );
  });

  it("should reject unsupported retailers with clear guidance", () => {
    const res = validateProductUrl("https://www.myntra.com/shoes/nike/12345");
    expect(res.valid).toBe(false);
    expect(res.error).toContain("This retailer isn't supported yet");
    expect(res.error).toContain(SUPPORTED_RETAILERS_SUMMARY);
  });
});
