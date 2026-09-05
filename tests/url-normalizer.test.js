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

  it("should normalize Amazon product URLs and strip ASIN tracking queries", () => {
    const raw1 = "https://www.amazon.com/dp/B08N5WRWNW?ref_=ast_sto_dp&th=1&psc=1";
    expect(normalizeUrl(raw1)).toBe("https://www.amazon.com/dp/B08N5WRWNW");

    const raw2 = "https://www.amazon.in/gp/product/B08N5WRWNW/ref=as_li_ss_tl?ie=UTF8&linkCode=ll1";
    expect(normalizeUrl(raw2)).toBe("https://www.amazon.in/dp/B08N5WRWNW");
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
    const raw = "zara.com/us/en/jacket-p12345.html?utm_source=ig";
    expect(normalizeUrl(raw)).toBe("https://zara.com/us/en/jacket-p12345.html");
  });
});
