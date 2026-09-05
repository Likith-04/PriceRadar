/**
 * Base Retailer Adapter
 * Defines the contract and common normalization helpers for all retailer adapters.
 */

export class BaseRetailerAdapter {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.shortName = config.shortName;
    this.defaultCurrency = config.defaultCurrency || "INR";
    this.currencySymbol = config.currencySymbol || "₹";
    this.domain = config.domain;
  }

  /**
   * Normalizes a retailer-specific URL.
   * Override in subclass if retailer requires specialized path/param rules.
   * 
   * @param {URL} parsedUrl - A parsed WHATWG URL object
   * @returns {string} Normalized URL string
   */
  normalizeUrl(parsedUrl) {
    return parsedUrl.toString();
  }

  /**
   * Generates the Firecrawl extraction options for this retailer.
   * 
   * @returns {{ prompt: string, schema: object }}
   */
  getExtractionOptions() {
    return {
      prompt: `Extract the product name as 'productName', current price in ${this.defaultCurrency} as a number as 'currentPrice', currency code as 'currencyCode' (default '${this.defaultCurrency}'), product image URL as 'productImageUrl', and availability as 'availability' (boolean: true if available/in stock, false if out of stock).`,
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

  /**
   * Normalizes raw extracted data from Firecrawl into the standard product structure.
   * 
   * @param {object} rawExtracted 
   * @param {string} sourceUrl 
   * @returns {{
   *   retailer: string,
   *   productName: string,
   *   currentPrice: number,
   *   currencyCode: string,
   *   productImageUrl: string | null,
   *   availability: boolean,
   *   url: string
   * }}
   */
  normalizeExtractedData(rawExtracted, sourceUrl) {
    if (!rawExtracted || typeof rawExtracted !== "object") {
      throw new Error(`No data extracted for ${this.name}`);
    }

    const productName = (rawExtracted.productName || "").trim();
    if (!productName) {
      throw new Error(`Could not extract product name from ${this.name}`);
    }

    const rawPrice = rawExtracted.currentPrice;
    const priceNum = typeof rawPrice === "number" ? rawPrice : parseFloat(String(rawPrice || "").replace(/[^0-9.]/g, ""));

    if (isNaN(priceNum) || priceNum <= 0) {
      throw new Error(`Could not extract a valid price from ${this.name}`);
    }

    const currencyCode = (rawExtracted.currencyCode || this.defaultCurrency).toUpperCase();
    const productImageUrl = rawExtracted.productImageUrl && typeof rawExtracted.productImageUrl === "string" && rawExtracted.productImageUrl.startsWith("http")
      ? rawExtracted.productImageUrl
      : null;

    const availability = rawExtracted.availability !== false;

    return {
      retailer: this.id,
      productName,
      currentPrice: priceNum,
      currencyCode,
      productImageUrl,
      availability,
      url: sourceUrl,
    };
  }
}
