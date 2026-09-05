/**
 * PriceRadar Standalone Background Worker Process
 * Run with: npm run worker or node worker.js
 */

import "dotenv/config";
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { createPriceCheckWorker } from "./lib/queue/price-check.worker.js";

console.log("==========================================");
console.log("🚀 Starting PriceRadar BullMQ Worker...");
console.log(`Concurrency: ${process.env.WORKER_CONCURRENCY || "5"}`);
console.log(
  `Rate Limit: ${process.env.FIRECRAWL_RATE_LIMIT_MAX || "10"} reqs / ${
    process.env.FIRECRAWL_RATE_LIMIT_DURATION_MS || "1000"
  }ms`
);
console.log("==========================================");

const worker = createPriceCheckWorker();

async function shutdown(signal) {
  console.log(`\n[Worker] Received ${signal}. Gracefully closing worker...`);
  try {
    await worker.close();
    console.log("[Worker] Closed successfully. Exiting process.");
    process.exit(0);
  } catch (err) {
    console.error("[Worker] Error during shutdown:", err);
    process.exit(1);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
