import { describe, it, expect, vi } from "vitest";
import { evaluateTargetCrossing } from "../lib/alert-logic";

describe("Worker Target Crossing & Snapshot Workflow", () => {
  it("should determine proper snapshot insert and alert status on price drop", () => {
    const product = {
      id: "prod-123",
      user_id: "user-456",
      current_price: 150.0,
      target_price: 120.0,
      last_alerted_price: null,
      last_alerted_at: null,
    };

    const newScrapedPrice = 115.0;

    const evaluation = evaluateTargetCrossing({
      oldPrice: product.current_price,
      newPrice: newScrapedPrice,
      targetPrice: product.target_price,
      lastAlertedPrice: product.last_alerted_price,
    });

    expect(evaluation.shouldAlert).toBe(true);
    expect(evaluation.newLastAlertedPrice).toBe(115.0);
    expect(evaluation.reason).toBe("target_crossed");
  });

  it("should suppress duplicate alert when price stays below target", () => {
    const product = {
      id: "prod-123",
      user_id: "user-456",
      current_price: 115.0,
      target_price: 120.0,
      last_alerted_price: 115.0,
      last_alerted_at: "2026-09-04T10:00:00Z",
    };

    const newScrapedPrice = 115.0; // Same price

    const evaluation = evaluateTargetCrossing({
      oldPrice: product.current_price,
      newPrice: newScrapedPrice,
      targetPrice: product.target_price,
      lastAlertedPrice: product.last_alerted_price,
    });

    expect(evaluation.shouldAlert).toBe(false);
    expect(evaluation.newLastAlertedPrice).toBe(115.0);
    expect(evaluation.reason).toBe("already_alerted_for_target");
  });

  it("should re-arm alert when price climbs back above target", () => {
    const product = {
      id: "prod-123",
      user_id: "user-456",
      current_price: 115.0,
      target_price: 120.0,
      last_alerted_price: 115.0,
      last_alerted_at: "2026-09-04T10:00:00Z",
    };

    const newScrapedPrice = 125.0; // Price goes up

    const evaluation = evaluateTargetCrossing({
      oldPrice: product.current_price,
      newPrice: newScrapedPrice,
      targetPrice: product.target_price,
      lastAlertedPrice: product.last_alerted_price,
    });

    expect(evaluation.shouldAlert).toBe(false);
    expect(evaluation.newLastAlertedPrice).toBe(null); // Re-armed!
  });
});
