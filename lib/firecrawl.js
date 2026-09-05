import FirecrawlApp from "@mendable/firecrawl-js";
import { getRetailerAdapter } from "./retailers/index.js";

let firecrawlInstance = null;

function getFirecrawlApp() {
  if (!firecrawlInstance) {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      console.warn("[Firecrawl Warning]: FIRECRAWL_API_KEY is not configured.");
    }
    firecrawlInstance = new FirecrawlApp({
      apiKey: apiKey || "fc-dummy-key",
    });
  }
  return firecrawlInstance;
}

/**
 * Scrapes product information from a URL using retailer-optimized Firecrawl extraction.
 * Returns a common normalized product structure.
 * 
 * @param {string} url 
 * @param {{ retailer?: string }} [options]
 * @returns {Promise<{
 *   retailer: string,
 *   productName: string,
 *   currentPrice: number,
 *   currencyCode: string,
 *   productImageUrl: string | null,
 *   availability: boolean,
 *   url: string
 * }>}
 */
export async function scrapeProduct(url, options = {}) {
  const adapter = getRetailerAdapter(options.retailer || url);

  const extractionOptions = adapter
    ? adapter.getExtractionOptions()
    : {
        prompt:
          "Extract the product name as 'productName', current price as a number as 'currentPrice', currency code as 'currencyCode' (default 'INR'), product image URL as 'productImageUrl' if available, and availability boolean as 'availability'",
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

  try {
    const firecrawl = getFirecrawlApp();
    const result = await firecrawl.scrapeUrl(url, {
      formats: ["extract"],
      extract: extractionOptions,
    });

    // Firecrawl returns data in result.extract
    const extractedData = result?.extract;

    if (!extractedData || !extractedData.productName) {
      throw new Error("No data extracted from URL");
    }

    if (adapter && typeof adapter.normalizeExtractedData === "function") {
      return adapter.normalizeExtractedData(extractedData, url);
    }

    // Fallback normalization
    const priceNum =
      typeof extractedData.currentPrice === "number"
        ? extractedData.currentPrice
        : parseFloat(String(extractedData.currentPrice || "").replace(/[^0-9.]/g, ""));

    return {
      retailer: options.retailer || "unknown",
      productName: extractedData.productName,
      currentPrice: priceNum,
      currencyCode: extractedData.currencyCode || "INR",
      productImageUrl: extractedData.productImageUrl || null,
      availability: extractedData.availability !== false,
      url,
    };
  } catch (error) {
    console.error("Firecrawl scrape error:", error.message || error);
    throw new Error(`Failed to scrape product: ${error.message || error}`);
  }
}
