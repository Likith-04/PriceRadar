import { BaseRetailerAdapter } from "./base.js";
import { RETAILER_CONFIGS, RETAILER_IDS } from "../constants.js";

/**
 * Amazon India Retailer Adapter
 */
export class AmazonAdapter extends BaseRetailerAdapter {
  constructor() {
    super(RETAILER_CONFIGS[RETAILER_IDS.AMAZON]);
  }

  /**
   * Normalizes Amazon URLs to canonical /dp/<ASIN> structure.
   * 
   * @param {URL} parsed 
   * @returns {string} Canonical Amazon URL
   */
  normalizeUrl(parsed) {
    const asinMatch = parsed.pathname.match(
      /\/(?:dp|gp\/product|gp\/aw\/d|exec\/obidos\/ASIN)\/([A-Z0-9]{10})/i
    );

    if (asinMatch && asinMatch[1]) {
      const asin = asinMatch[1].toUpperCase();
      parsed.pathname = `/dp/${asin}`;
      parsed.search = "";
      return parsed.toString();
    }

    return parsed.toString();
  }

  getExtractionOptions() {
    return {
      prompt:
        "Extract the product title/name as 'productName', the current selling price in INR as a clean numeric value (without currency symbol or commas) as 'currentPrice', currency code as 'currencyCode' (default 'INR'), primary product image URL as 'productImageUrl', and whether the product is currently in stock as 'availability' (boolean).",
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

export const amazonAdapter = new AmazonAdapter();
