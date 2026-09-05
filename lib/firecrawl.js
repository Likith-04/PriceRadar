import FirecrawlApp from "@mendable/firecrawl-js";

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

export async function scrapeProduct(url) {
  try {
    const firecrawl = getFirecrawlApp();
    const result = await firecrawl.scrapeUrl(url, {
      formats: ["extract"],
      extract: {
        prompt:
          "Extract the product name as 'productName', current price as a number as 'currentPrice', currency code (USD, EUR, INR, etc) as 'currencyCode', and product image URL as 'productImageUrl' if available",
        schema: {
          type: "object",
          properties: {
            productName: { type: "string" },
            currentPrice: { type: "number" },
            currencyCode: { type: "string" },
            productImageUrl: { type: "string" },
          },
          required: ["productName", "currentPrice"],
        },
      },
    });

    // Firecrawl returns data in result.extract
    const extractedData = result?.extract;

    if (!extractedData || !extractedData.productName) {
      throw new Error("No data extracted from URL");
    }

    return extractedData;
  } catch (error) {
    console.error("Firecrawl scrape error:", error.message || error);
    throw new Error(`Failed to scrape product: ${error.message || error}`);
  }
}
