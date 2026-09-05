import { normalizeUrl } from "./url-normalizer.js";
import {
  detectRetailer,
  getRetailerConfig,
  UNSUPPORTED_RETAILER_MESSAGE,
} from "./retailers/index.js";

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
 * Validates product URL and verifies retailer support.
 */
export function validateProductUrl(input) {
  if (!input || typeof input !== "string" || !input.trim()) {
    return { valid: false, error: "Product URL is required." };
  }

  let normalized;
  try {
    normalized = normalizeUrl(input);
  } catch (err) {
    return { valid: false, error: err.message || "Invalid product URL." };
  }

  const retailer = detectRetailer(normalized);
  if (!retailer) {
    return {
      valid: false,
      error: UNSUPPORTED_RETAILER_MESSAGE,
    };
  }

  const config = getRetailerConfig(retailer);

  return {
    valid: true,
    value: normalized,
    retailer,
    retailerConfig: config,
  };
}
