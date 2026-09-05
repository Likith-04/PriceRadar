import { BaseRetailerAdapter } from "./base.js";
import { RETAILER_CONFIGS, RETAILER_IDS } from "../constants.js";

const CROMA_STRIP_PARAMS = new Set([
  "gclid",
  "source",
  "campaign",
  "ref",
  "channel",
]);

/**
 * Croma Retailer Adapter
 */
export class CromaAdapter extends BaseRetailerAdapter {
  constructor() {
    super(RETAILER_CONFIGS[RETAILER_IDS.CROMA]);
  }

  /**
   * Normalizes Croma URLs.
   * 
   * @param {URL} parsed 
   * @returns {string} Clean Croma URL
   */
  normalizeUrl(parsed) {
    const params = new URLSearchParams(parsed.search);
    const toDelete = [];

    for (const key of params.keys()) {
      const lower = key.toLowerCase();
      if (CROMA_STRIP_PARAMS.has(lower) || lower.startsWith("utm_")) {
        toDelete.push(key);
      }
    }
    toDelete.forEach((k) => params.delete(k));

    parsed.search = params.toString() ? `?${params.toString()}` : "";
    return parsed.toString();
  }

  getExtractionOptions() {
    return {
      prompt:
        "Extract the product title as 'productName', the current final selling price in INR as a clean numeric value (without currency symbol or commas) as 'currentPrice', currency code as 'currencyCode' (default 'INR'), primary product image URL as 'productImageUrl', and availability as 'availability' (boolean: true if available, false if out of stock).",
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

export const cromaAdapter = new CromaAdapter();
