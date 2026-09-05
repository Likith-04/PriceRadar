import { BaseRetailerAdapter } from "./base.js";
import { RETAILER_CONFIGS, RETAILER_IDS } from "../constants.js";

const FLIPKART_STRIP_PARAMS = new Set([
  "lid",
  "marketplace",
  "q",
  "qh",
  "otracker",
  "otracker1",
  "fm",
  "iid",
  "ppn",
  "ppt",
  "srno",
  "store",
  "spotlighttagid",
  "affid",
  "affextparam1",
  "affextparam2",
  "cmpid",
  "param",
]);

/**
 * Flipkart Retailer Adapter
 */
export class FlipkartAdapter extends BaseRetailerAdapter {
  constructor() {
    super(RETAILER_CONFIGS[RETAILER_IDS.FLIPKART]);
  }

  /**
   * Normalizes Flipkart URLs by preserving product identifier and removing noise queries.
   * 
   * @param {URL} parsed 
   * @returns {string} Clean Flipkart URL
   */
  normalizeUrl(parsed) {
    // Preserve pid if present in query params
    const params = new URLSearchParams(parsed.search);
    const pid = params.get("pid");

    // Clear noisy parameters
    const toDelete = [];
    for (const key of params.keys()) {
      const lower = key.toLowerCase();
      if (FLIPKART_STRIP_PARAMS.has(lower) || lower.startsWith("utm_")) {
        toDelete.push(key);
      }
    }
    toDelete.forEach((k) => params.delete(k));

    // If pid was extracted and no other useful parameters exist, retain pid
    if (pid && !params.has("pid")) {
      params.set("pid", pid);
    }

    parsed.search = params.toString() ? `?${params.toString()}` : "";
    return parsed.toString();
  }

  getExtractionOptions() {
    return {
      prompt:
        "Extract the product title as 'productName', the final discounted selling price in INR as a clean numeric value (exclude original MRP if discounted) as 'currentPrice', currency code as 'currencyCode' (default 'INR'), primary product image URL as 'productImageUrl', and availability as 'availability' (boolean, false if out of stock or currently unavailable).",
      schema: {
        type: "object",
        properties: {
          productName: { type: "string" },
          currentPrice: { type: "number" },
          currencyCode: { type: "string" },
          productImageUrl: { type: "string" },
          availability: { type: "boolean" },
        },
        required: ["productName", "currentPrice"],
      },
    };
  }
}

export const flipkartAdapter = new FlipkartAdapter();
