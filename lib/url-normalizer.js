/**
 * Utility to normalize e-commerce and product URLs.
 * Strips tracking/marketing parameters, session IDs, and normalizes standard e-commerce paths.
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
  "spLa",
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

  // Normalize Amazon URLs (e.g. amazon.com, amazon.in, amazon.co.uk, etc.)
  const isAmazon = /(^|\.)amazon\.[a-z.]+$/i.test(parsed.hostname);
  if (isAmazon) {
    const asinMatch = parsed.pathname.match(
      /\/(?:dp|gp\/product|gp\/aw\/d|exec\/obidos\/ASIN)\/([A-Z0-9]{10})/i
    );
    if (asinMatch && asinMatch[1]) {
      const asin = asinMatch[1].toUpperCase();
      parsed.pathname = `/dp/${asin}`;
      parsed.search = "";
      return parsed.toString();
    }
  }

  // General parameter cleanup
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
