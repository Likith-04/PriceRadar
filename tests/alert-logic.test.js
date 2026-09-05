import { describe, it, expect } from "vitest";
import { evaluateTargetCrossing } from "../lib/alert-logic";

describe("Target Alert Logic State Machine", () => {
  it("should not alert if no target price is set", () => {
    const result = evaluateTargetCrossing({
      oldPrice: 100,
      newPrice: 80,
      targetPrice: null,
      lastAlertedPrice: null,
    });
    expect(result.shouldAlert).toBe(false);
    expect(result.newLastAlertedPrice).toBe(null);
  });

  it("should not alert if price remains above target", () => {
    const result = evaluateTargetCrossing({
      oldPrice: 120,
      newPrice: 105,
      targetPrice: 100,
      lastAlertedPrice: null,
    });
    expect(result.shouldAlert).toBe(false);
    expect(result.newLastAlertedPrice).toBe(null);
  });

  it("should trigger alert on initial target crossing (price drops to or below target)", () => {
    const result = evaluateTargetCrossing({
      oldPrice: 110,
      newPrice: 95,
      targetPrice: 100,
      lastAlertedPrice: null,
    });
    expect(result.shouldAlert).toBe(true);
    expect(result.newLastAlertedPrice).toBe(95);
    expect(result.reason).toBe("target_crossed");
  });

  it("should trigger alert if exact target price is matched", () => {
    const result = evaluateTargetCrossing({
      oldPrice: 110,
      newPrice: 100,
      targetPrice: 100,
      lastAlertedPrice: null,
    });
    expect(result.shouldAlert).toBe(true);
    expect(result.newLastAlertedPrice).toBe(100);
  });

  it("should suppress duplicate alerts on subsequent checks while price remains at or below target", () => {
    // Check 1: Price is 95, target is 100 -> Alerted, state saved as 95
    // Check 2: Next day, price is still 95
    const check2 = evaluateTargetCrossing({
      oldPrice: 95,
      newPrice: 95,
      targetPrice: 100,
      lastAlertedPrice: 95,
    });
    expect(check2.shouldAlert).toBe(false);
    expect(check2.newLastAlertedPrice).toBe(95);
    expect(check2.reason).toBe("already_alerted_for_target");

    // Check 3: Next day, price shifts slightly to 98 (still below target 100)
    const check3 = evaluateTargetCrossing({
      oldPrice: 95,
      newPrice: 98,
      targetPrice: 100,
      lastAlertedPrice: 95,
    });
    expect(check3.shouldAlert).toBe(false);
  });

  it("should reset/re-arm alert state when price rises back above target", () => {
    // Price rises to 105 (above target 100)
    const riseCheck = evaluateTargetCrossing({
      oldPrice: 95,
      newPrice: 105,
      targetPrice: 100,
      lastAlertedPrice: 95,
    });
    expect(riseCheck.shouldAlert).toBe(false);
    expect(riseCheck.newLastAlertedPrice).toBe(null); // Re-armed!
  });

  it("should trigger a new alert when price drops below target a second time after rising above it", () => {
    // After re-arming (lastAlertedPrice is null), price drops to 90
    const reCross = evaluateTargetCrossing({
      oldPrice: 105,
      newPrice: 90,
      targetPrice: 100,
      lastAlertedPrice: null,
    });
    expect(reCross.shouldAlert).toBe(true);
    expect(reCross.newLastAlertedPrice).toBe(90);
    expect(reCross.reason).toBe("target_crossed");
  });
});
