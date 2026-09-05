import { normalizeUrl } from "./url-normalizer.js";

/**
 * Validates and normalizes target price inputs.
 * Accepts numbers, strings, or null/empty values (to clear target).
 */
export function validateTargetPrice(input) {
  if (input === null || input === undefined || input === "") {
    return { valid: true, value: null };
  }

  const num = typeof input === "number" ? input : parseFloat(String(input).trim());

  if (isNaN(num) || !isFinite(num)) {
    return { valid: false, error: "Target price must be a valid number." };
  }

  if (num <= 0) {
    return { valid: false, error: "Target price must be greater than zero." };
  }

  if (num > 10_000_000) {
    return { valid: false, error: "Target price cannot exceed 10,000,000." };
  }

  // Check decimal precision: allow up to 2 decimal places
  const rounded = Math.round(num * 100) / 100;

  return { valid: true, value: rounded };
}

/**
 * Validates product URL.
 */
export function validateProductUrl(input) {
  if (!input || typeof input !== "string" || !input.trim()) {
    return { valid: false, error: "Product URL is required." };
  }

  try {
    const normalized = normalizeUrl(input);
    return { valid: true, value: normalized };
  } catch (err) {
    return { valid: false, error: err.message || "Invalid product URL." };
  }
}
