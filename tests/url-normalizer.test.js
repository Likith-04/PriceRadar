import { describe, it, expect } from "vitest";
import { normalizeUrl } from "../lib/url-normalizer";

describe("URL Normalizer", () => {
  it("should strip common tracking parameters", () => {
    const raw = "https://example.com/product/123?utm_source=google&utm_medium=cpc&utm_campaign=summer&fbclid=IwAR123&ref=banner";
    const normalized = normalizeUrl(raw);
    expect(normalized).toBe("https://example.com/product/123");
  });

  it("should preserve necessary non-tracking query parameters", () => {
    const raw = "https://store.example.com/item?id=8842&color=blue&utm_source=newsletter";
    const normalized = normalizeUrl(raw);
    expect(normalized).toBe("https://store.example.com/item?id=8842&color=blue");
  });

  describe("Amazon India Normalization", () => {
    it("should normalize Amazon product URLs and strip ASIN tracking queries", () => {
      const raw1 = "https://www.amazon.in/dp/B08N5WRWNW?ref_=ast_sto_dp&th=1&psc=1";
      expect(normalizeUrl(raw1)).toBe("https://www.amazon.in/dp/B08N5WRWNW");

      const raw2 = "https://www.amazon.in/gp/product/B08N5WRWNW/ref=as_li_ss_tl?ie=UTF8&linkCode=ll1";
      expect(normalizeUrl(raw2)).toBe("https://www.amazon.in/dp/B08N5WRWNW");
    });
  });

  describe("Flipkart Normalization", () => {
    it("should clean Flipkart URLs and preserve pid parameter", () => {
      const raw =
        "https://www.flipkart.com/apple-iphone-16-black-128-gb/p/itm12345?pid=MOB12345&lid=LST123&marketplace=FLIPKART&spotlightTagId=123&utm_source=google";
      expect(normalizeUrl(raw)).toBe(
        "https://www.flipkart.com/apple-iphone-16-black-128-gb/p/itm12345?pid=MOB12345"
      );
    });

    it("should handle Flipkart URLs without query params", () => {
      const raw = "https://www.flipkart.com/apple-iphone-16-black-128-gb/p/itm12345/";
      expect(normalizeUrl(raw)).toBe(
        "https://www.flipkart.com/apple-iphone-16-black-128-gb/p/itm12345"
      );
    });
  });

  describe("Reliance Digital Normalization", () => {
    it("should clean Reliance Digital URLs and remove tracking params", () => {
      const raw =
        "https://www.reliancedigital.in/apple-iphone-16-128-gb-black/p/494422941?gclid=Cj0KCQ...&utm_source=google&utm_campaign=diwali";
      expect(normalizeUrl(raw)).toBe(
        "https://www.reliancedigital.in/apple-iphone-16-128-gb-black/p/494422941"
      );
    });
  });

  describe("Croma Normalization", () => {
    it("should clean Croma URLs and remove tracking queries", () => {
      const raw =
        "https://www.croma.com/apple-iphone-16-128gb-black-/p/308529?utm_source=croma_ads&ref=banner&gclid=123";
      expect(normalizeUrl(raw)).toBe(
        "https://www.croma.com/apple-iphone-16-128gb-black-/p/308529"
      );
    });
  });

  it("should remove hash fragments and trailing slashes", () => {
    const raw = "https://example.com/product/shoes/#reviews";
    expect(normalizeUrl(raw)).toBe("https://example.com/product/shoes");
  });

  it("should ensure HTTPS protocol", () => {
    const raw = "http://example.com/item/42";
    expect(normalizeUrl(raw)).toBe("https://example.com/item/42");
  });

  it("should handle inputs without protocol", () => {
    const raw = "croma.com/product/12345?utm_source=ig";
    expect(normalizeUrl(raw)).toBe("https://croma.com/product/12345");
  });
});
