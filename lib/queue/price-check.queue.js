import { Queue } from "bullmq";
import { getRedisConnectionOptions } from "./connection.js";

export const PRICE_CHECK_QUEUE_NAME = "price-checks";

let priceCheckQueue = null;

export function getPriceCheckQueue() {
  if (!priceCheckQueue) {
    const connection = getRedisConnectionOptions();
    priceCheckQueue = new Queue(PRICE_CHECK_QUEUE_NAME, {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000, // 5s, 10s, 20s
        },
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
      },
    });

    priceCheckQueue.on("error", (err) => {
      console.error(`[BullMQ Queue Error (${PRICE_CHECK_QUEUE_NAME})]:`, err.message);
    });
  }

  return priceCheckQueue;
}

/**
 * Enqueue a single product price check job
 */
export async function enqueueProductCheck({
  productId,
  userId,
  reason = "manual",
  isInitial = false,
}) {
  const queue = getPriceCheckQueue();
  const timestamp = Date.now();
  const jobId = isInitial
    ? `initial-${productId}-${timestamp}`
    : `manual-${productId}-${timestamp}`;

  const job = await queue.add(
    "check-product",
    {
      productId,
      userId,
      reason,
      isInitial,
      enqueuedAt: new Date().toISOString(),
    },
    {
      jobId,
    }
  );

  return job;
}

/**
 * Enqueue a batch of product checks (e.g. for scheduled cron checks)
 * Uses job deduplication per hour bucket to prevent duplicate processing if cron fires twice.
 */
export async function enqueueBatchProductChecks(products, reason = "cron") {
  const queue = getPriceCheckQueue();
  const hourBucket = new Date().toISOString().slice(0, 13); // e.g. "2026-09-05T08"

  const jobs = products.map((product) => {
    const productId = typeof product === "string" ? product : product.id;
    const userId = typeof product === "object" ? product.user_id : undefined;

    return {
      name: "check-product",
      data: {
        productId,
        userId,
        reason,
        isInitial: false,
        enqueuedAt: new Date().toISOString(),
      },
      opts: {
        jobId: `cron-${productId}-${hourBucket}`,
      },
    };
  });

  return await queue.addBulk(jobs);
}
