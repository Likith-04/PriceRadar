/**
 * Evaluates target-price crossing state transitions to ensure reliable,
 * deduplicated alerting.
 *
 * State Rules:
 * 1. If targetPrice is null/undefined -> No target alert.
 * 2. If newPrice > targetPrice -> Disarmed. Reset lastAlertedPrice to null.
 * 3. If newPrice <= targetPrice:
 *    - If previously disarmed (lastAlertedPrice == null) OR oldPrice was above target -> Trigger ALERT, set lastAlertedPrice = newPrice.
 *    - If previously alerted (lastAlertedPrice != null) and newPrice >= lastAlertedPrice -> DO NOT alert (suppress duplicate).
 *    - If newPrice < lastAlertedPrice (dropped even further below target) -> Optionally alert or keep suppressed (by default, trigger on new significant dip or treat initial crossing as the primary signal).
 */
export function evaluateTargetCrossing({
  oldPrice,
  newPrice,
  targetPrice,
  lastAlertedPrice,
}) {
  if (targetPrice === null || targetPrice === undefined) {
    return {
      shouldAlert: false,
      newLastAlertedPrice: null,
      reason: "no_target_set",
    };
  }

  const target = Number(targetPrice);
  const current = Number(newPrice);
  const previous = oldPrice !== null && oldPrice !== undefined ? Number(oldPrice) : null;
  const lastAlerted =
    lastAlertedPrice !== null && lastAlertedPrice !== undefined
      ? Number(lastAlertedPrice)
      : null;

  // Case 1: Price is currently above target
  if (current > target) {
    return {
      shouldAlert: false,
      newLastAlertedPrice: null, // Reset/re-arm the alert
      reason: "price_above_target",
    };
  }

  // Case 2: Price is at or below target
  // Check if this is a fresh crossing
  const isFreshCrossing = lastAlerted === null || (previous !== null && previous > target);

  if (isFreshCrossing) {
    return {
      shouldAlert: true,
      newLastAlertedPrice: current,
      reason: "target_crossed",
    };
  }

  // Case 3: Already alerted previously while below target
  // Prevent duplicate alerts on every cron check while price stays at or below target
  return {
    shouldAlert: false,
    newLastAlertedPrice: lastAlerted,
    reason: "already_alerted_for_target",
  };
}
