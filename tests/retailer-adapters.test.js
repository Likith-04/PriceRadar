import { describe, it, expect } from "vitest";
import {
  amazonAdapter,
  flipkartAdapter,
  relianceDigitalAdapter,
  cromaAdapter,
  getRetailerAdapter,
  RETAILER_IDS,
} from "../lib/retailers";

describe("Retailer Adapters Contract & Extraction Normalization", () => {
  describe("Adapter Registry", () => {
    it("should retrieve adapters by ID or URL", () => {
      expect(getRetailerAdapter("amazon")).toBe(amazonAdapter);
      expect(getRetailerAdapter("flipkart")).toBe(flipkartAdapter);
      expect(getRetailerAdapter("reliance_digital")).toBe(relianceDigitalAdapter);
      expect(getRetailerAdapter("croma")).toBe(cromaAdapter);
      expect(getRetailerAdapter("https://www.flipkart.com/p/123")).toBe(flipkartAdapter);
      expect(getRetailerAdapter("https://unknown-store.com/item")).toBeNull();
    });
  });

  describe("AmazonAdapter", () => {
    it("should provide valid extraction options", () => {
      const opts = amazonAdapter.getExtractionOptions();
      expect(opts.prompt).toContain("productName");
      expect(opts.prompt).toContain("currentPrice");
      expect(opts.schema.required).toEqual(["productName", "currentPrice"]);
    });

    it("should normalize raw extracted Amazon data", () => {
      const raw = {
        productName: "Sony WH-1000XM5",
        currentPrice: 24990,
        currencyCode: "INR",
        productImageUrl: "https://m.media-amazon.com/images/I/123.jpg",
        availability: true,
      };

      const normalized = amazonAdapter.normalizeExtractedData(
        raw,
        "https://www.amazon.in/dp/B08N5WRWNW"
      );

      expect(normalized.retailer).toBe(RETAILER_IDS.AMAZON);
      expect(normalized.productName).toBe("Sony WH-1000XM5");
      expect(normalized.currentPrice).toBe(24990);
      expect(normalized.currencyCode).toBe("INR");
      expect(normalized.productImageUrl).toBe("https://m.media-amazon.com/images/I/123.jpg");
      expect(normalized.availability).toBe(true);
    });
  });

  describe("FlipkartAdapter", () => {
    it("should normalize raw extracted Flipkart data and handle string prices", () => {
      const raw = {
        productName: "Apple iPhone 16 (Black, 128 GB)",
        currentPrice: "₹69,999",
        currencyCode: "INR",
        productImageUrl: "https://rukminim2.flixcart.com/image/123.jpg",
        availability: true,
      };

      const normalized = flipkartAdapter.normalizeExtractedData(
        raw,
        "https://www.flipkart.com/p/itm123"
      );

      expect(normalized.retailer).toBe(RETAILER_IDS.FLIPKART);
      expect(normalized.productName).toBe("Apple iPhone 16 (Black, 128 GB)");
      expect(normalized.currentPrice).toBe(69999);
      expect(normalized.currencyCode).toBe("INR");
    });
  });

  describe("RelianceDigitalAdapter", () => {
    it("should normalize raw extracted Reliance Digital data", () => {
      const raw = {
        productName: "Samsung Galaxy S24 Ultra",
        currentPrice: 129999.0,
        productImageUrl: "https://www.reliancedigital.in/medias/123.jpg",
        availability: true,
      };

      const normalized = relianceDigitalAdapter.normalizeExtractedData(
        raw,
        "https://www.reliancedigital.in/p/494422941"
      );

      expect(normalized.retailer).toBe(RETAILER_IDS.RELIANCE_DIGITAL);
      expect(normalized.currentPrice).toBe(129999);
      expect(normalized.currencyCode).toBe("INR");
    });
  });

  describe("CromaAdapter", () => {
    it("should normalize raw extracted Croma data", () => {
      const raw = {
        productName: "Apple MacBook Air M3 16GB",
        currentPrice: 114900,
        productImageUrl: "https://media.croma.com/image/123.jpg",
        availability: true,
      };

      const normalized = cromaAdapter.normalizeExtractedData(
        raw,
        "https://www.croma.com/p/308529"
      );

      expect(normalized.retailer).toBe(RETAILER_IDS.CROMA);
      expect(normalized.currentPrice).toBe(114900);
      expect(normalized.currencyCode).toBe("INR");
    });

    it("should throw error if product name is missing or price is invalid", () => {
      expect(() =>
        cromaAdapter.normalizeExtractedData(
          { currentPrice: 100 },
          "https://croma.com/p/1"
        )
      ).toThrow("Could not extract product name");

      expect(() =>
        cromaAdapter.normalizeExtractedData(
          { productName: "Item", currentPrice: "invalid" },
          "https://croma.com/p/1"
        )
      ).toThrow("Could not extract a valid price");
    });
  });
});
