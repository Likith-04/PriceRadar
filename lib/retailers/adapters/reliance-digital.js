import { BaseRetailerAdapter } from "./base.js";
import { RETAILER_CONFIGS, RETAILER_IDS } from "../constants.js";

const RELIANCE_STRIP_PARAMS = new Set([
  "gclid",
  "source",
  "campaign",
  "affiliate",
  "internal_source",
]);

/**
 * Reliance Digital Retailer Adapter
 */
export class RelianceDigitalAdapter extends BaseRetailerAdapter {
  constructor() {
    super(RETAILER_CONFIGS[RETAILER_IDS.RELIANCE_DIGITAL]);
  }

  /**
   * Normalizes Reliance Digital URLs.
   * 
   * @param {URL} parsed 
   * @returns {string} Clean Reliance Digital URL
   */
  normalizeUrl(parsed) {
    const params = new URLSearchParams(parsed.search);
    const toDelete = [];

    for (const key of params.keys()) {
      const lower = key.toLowerCase();
      if (RELIANCE_STRIP_PARAMS.has(lower) || lower.startsWith("utm_")) {
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
        "Extract the product title/name as 'productName', the current offer/deal price in INR as a clean numeric value (exclude strike-through MRP) as 'currentPrice', currency code as 'currencyCode' (default 'INR'), primary product image URL as 'productImageUrl', and availability as 'availability' (boolean: true if in stock, false if sold out).",
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

export const relianceDigitalAdapter = new RelianceDigitalAdapter();
