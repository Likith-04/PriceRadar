import { describe, it, expect } from "vitest";
import {
  detectRetailer,
  isSupportedRetailer,
  getRetailerConfig,
  RETAILER_IDS,
} from "../lib/retailers";

describe("Multi-Retailer Detection", () => {
  describe("Amazon India Detection", () => {
    it("should detect standard amazon.in URLs", () => {
      expect(detectRetailer("https://www.amazon.in/dp/B08N5WRWNW")).toBe(
        RETAILER_IDS.AMAZON
      );
      expect(detectRetailer("https://amazon.in/gp/product/B08N5WRWNW")).toBe(
        RETAILER_IDS.AMAZON
      );
    });

    it("should detect mobile and shortener Amazon domains", () => {
      expect(detectRetailer("https://m.amazon.in/dp/B08N5WRWNW")).toBe(
        RETAILER_IDS.AMAZON
      );
      expect(detectRetailer("https://amzn.in/d/12345")).toBe(
        RETAILER_IDS.AMAZON
      );
      expect(detectRetailer("https://amzn.to/3xyz")).toBe(
        RETAILER_IDS.AMAZON
      );
    });
  });

  describe("Flipkart Detection", () => {
    it("should detect standard flipkart.com URLs", () => {
      expect(
        detectRetailer(
          "https://www.flipkart.com/apple-iphone-16-black-128-gb/p/itm12345?pid=MOB12345"
        )
      ).toBe(RETAILER_IDS.FLIPKART);
      expect(detectRetailer("https://flipkart.com/p/itm12345")).toBe(
        RETAILER_IDS.FLIPKART
      );
    });

    it("should detect deep link and short Flipkart domains", () => {
      expect(detectRetailer("https://dl.flipkart.com/s/xyz123")).toBe(
        RETAILER_IDS.FLIPKART
      );
      expect(detectRetailer("https://fkrt.it/p/123")).toBe(
        RETAILER_IDS.FLIPKART
      );
    });
  });

  describe("Reliance Digital Detection", () => {
    it("should detect reliancedigital.in URLs", () => {
      expect(
        detectRetailer(
          "https://www.reliancedigital.in/apple-iphone-16-128-gb-black/p/494422941"
        )
      ).toBe(RETAILER_IDS.RELIANCE_DIGITAL);
      expect(
        detectRetailer("https://reliancedigital.in/p/494422941")
      ).toBe(RETAILER_IDS.RELIANCE_DIGITAL);
    });
  });

  describe("Croma Detection", () => {
    it("should detect croma.com URLs", () => {
      expect(
        detectRetailer(
          "https://www.croma.com/apple-iphone-16-128gb-black-/p/308529"
        )
      ).toBe(RETAILER_IDS.CROMA);
      expect(detectRetailer("https://croma.com/p/308529")).toBe(
        RETAILER_IDS.CROMA
      );
    });
  });

  describe("Unsupported and Invalid URLs", () => {
    it("should return null for unsupported retailers", () => {
      expect(detectRetailer("https://www.myntra.com/shoes/nike/123")).toBeNull();
      expect(detectRetailer("https://www.ajio.com/clothing/p/456")).toBeNull();
      expect(detectRetailer("https://www.ebay.com/itm/123456")).toBeNull();
      expect(detectRetailer("https://www.tatacliq.com/p-mp0000")).toBeNull();
    });

    it("should return null for empty, null, or malformed inputs", () => {
      expect(detectRetailer("")).toBeNull();
      expect(detectRetailer(null)).toBeNull();
      expect(detectRetailer(undefined)).toBeNull();
      expect(detectRetailer("not-a-url")).toBeNull();
    });

    it("should correctly report isSupportedRetailer", () => {
      expect(isSupportedRetailer("https://amazon.in/dp/B08N5WRWNW")).toBe(true);
      expect(isSupportedRetailer("https://flipkart.com/p/123")).toBe(true);
      expect(isSupportedRetailer("https://reliancedigital.in/p/123")).toBe(true);
      expect(isSupportedRetailer("https://croma.com/p/123")).toBe(true);
      expect(isSupportedRetailer("https://myntra.com/item")).toBe(false);
    });

    it("should return retailer config for valid IDs", () => {
      const config = getRetailerConfig(RETAILER_IDS.FLIPKART);
      expect(config).not.toBeNull();
      expect(config.name).toBe("Flipkart");
      expect(config.defaultCurrency).toBe("INR");
    });
  });
});
