import { RETAILER_IDS, RETAILER_CONFIGS } from "./constants.js";

/**
 * Detects the retailer identifier from a URL string or hostname.
 * 
 * @param {string} rawInput 
 * @returns {string | null} Retailer ID ('amazon' | 'flipkart' | 'reliance_digital' | 'croma') or null if unsupported.
 */
export function detectRetailer(rawInput) {
  if (!rawInput || typeof rawInput !== "string") {
    return null;
  }

  const trimmed = rawInput.trim();
  if (!trimmed) {
    return null;
  }

  let hostname = "";

  try {
    const candidate = trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;
    
    const parsed = new URL(candidate);
    hostname = parsed.hostname.toLowerCase();
    if (hostname.endsWith(".")) {
      hostname = hostname.slice(0, -1);
    }
  } catch {
    return null;
  }

  if (!hostname) {
    return null;
  }

  // 1. Amazon India / Amazon
  if (
    /(^|\.)amazon\.(in|com)$/i.test(hostname) ||
    /(^|\.)amzn\.(in|to)$/i.test(hostname)
  ) {
    return RETAILER_IDS.AMAZON;
  }

  // 2. Flipkart
  if (
    /(^|\.)flipkart\.com$/i.test(hostname) ||
    /(^|\.)fkrt\.it$/i.test(hostname)
  ) {
    return RETAILER_IDS.FLIPKART;
  }

  // 3. Reliance Digital
  if (/(^|\.)reliancedigital\.in$/i.test(hostname)) {
    return RETAILER_IDS.RELIANCE_DIGITAL;
  }

  // 4. Croma
  if (/(^|\.)croma\.com$/i.test(hostname)) {
    return RETAILER_IDS.CROMA;
  }

  return null;
}

/**
 * Gets retailer configuration by ID or URL.
 */
export function getRetailerConfig(idOrUrl) {
  if (!idOrUrl) return null;
  const id = RETAILER_CONFIGS[idOrUrl] ? idOrUrl : detectRetailer(idOrUrl);
  return id ? RETAILER_CONFIGS[id] || null : null;
}

/**
 * Checks whether a given URL or hostname belongs to a supported retailer.
 */
export function isSupportedRetailer(rawInput) {
  return detectRetailer(rawInput) !== null;
}
