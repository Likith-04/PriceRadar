import { describe, it, expect } from "vitest";

describe("Cron Endpoint Authorization Logic", () => {
  it("should reject requests with missing or invalid Bearer authorization", () => {
    const cronSecret = "valid-secret-12345";

    const isAuthorized = (authHeader) => {
      return Boolean(cronSecret && authHeader === `Bearer ${cronSecret}`);
    };

    expect(isAuthorized(null)).toBe(false);
    expect(isAuthorized("Bearer wrong-secret")).toBe(false);
    expect(isAuthorized("Basic valid-secret-12345")).toBe(false);
    expect(isAuthorized("Bearer valid-secret-12345")).toBe(true);
  });
});
