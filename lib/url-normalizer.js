import { getRetailerAdapter } from "./retailers/index.js";

/**
 * Utility to normalize e-commerce and product URLs.
 * Strips tracking/marketing parameters, session IDs, and applies retailer-specific canonicalization.
 */

const TRACKING_PARAMS_PREFIXES = ["utm_", "pf_rd_", "pd_rd_"];
const TRACKING_PARAMS_EXACT = new Set([
  "gclid",
  "fbclid",
  "dclid",
  "msclkid",
  "zanpid",
  "igshid",
  "mc_cid",
  "mc_eid",
  "ref",
  "ref_",
  "_encoding",
  "psc",
  "smid",
  "spla",
  "crid",
  "keywords",
  "qid",
  "sprefix",
  "sr",
  "th",
  "source",
  "campaign",
  "affiliate",
]);

export function normalizeUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") {
    throw new Error("Invalid URL input");
  }

  let trimmed = rawUrl.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    trimmed = `https://${trimmed}`;
  }

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error("Malformed product URL");
  }

  // Force HTTPS if HTTP
  if (parsed.protocol === "http:") {
    parsed.protocol = "https:";
  }

  parsed.hostname = parsed.hostname.toLowerCase();
  // Remove trailing dot on hostname if present
  if (parsed.hostname.endsWith(".")) {
    parsed.hostname = parsed.hostname.slice(0, -1);
  }

  // Remove hash/fragment
  parsed.hash = "";

  // 1. Check if a retailer adapter exists for custom URL normalization
  const adapter = getRetailerAdapter(parsed.hostname);
  if (adapter && typeof adapter.normalizeUrl === "function") {
    const retailerNormalized = adapter.normalizeUrl(parsed);
    try {
      parsed = new URL(retailerNormalized);
    } catch {
      // Use as is
    }
  }

  // 2. Universal tracking parameter cleanup
  const params = new URLSearchParams(parsed.search);
  const keysToDelete = [];

  for (const key of params.keys()) {
    const lowerKey = key.toLowerCase();
    if (
      TRACKING_PARAMS_EXACT.has(lowerKey) ||
      TRACKING_PARAMS_PREFIXES.some((prefix) => lowerKey.startsWith(prefix))
    ) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach((key) => params.delete(key));

  parsed.search = params.toString() ? `?${params.toString()}` : "";

  // Remove trailing slash from pathname if length > 1
  if (parsed.pathname.length > 1 && parsed.pathname.endsWith("/")) {
    parsed.pathname = parsed.pathname.slice(0, -1);
  }

  return parsed.toString();
}
