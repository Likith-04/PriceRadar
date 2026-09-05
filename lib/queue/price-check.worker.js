import { Worker, UnrecoverableError } from "bullmq";
import { createClient } from "@supabase/supabase-js";
import { getRedisConnectionOptions } from "./connection.js";
import { PRICE_CHECK_QUEUE_NAME } from "./price-check.queue.js";
import { scrapeProduct } from "../firecrawl.js";
import { sendPriceDropAlert } from "../email.js";
import { evaluateTargetCrossing } from "../alert-logic.js";
import { detectRetailer } from "../retailers/index.js";

/**
 * Creates and initializes the BullMQ Price Check Worker
 */
export function createPriceCheckWorker() {
  const connection = getRedisConnectionOptions();

  const concurrency = parseInt(process.env.WORKER_CONCURRENCY || "5", 10);
  const maxLimit = parseInt(process.env.FIRECRAWL_RATE_LIMIT_MAX || "10", 10);
  const durationMs = parseInt(process.env.FIRECRAWL_RATE_LIMIT_DURATION_MS || "1000", 10);

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn(
      "[Worker Warning]: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set. Worker requires Service Role credentials to update products."
    );
  }

  const supabase =
    supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;

  const worker = new Worker(
    PRICE_CHECK_QUEUE_NAME,
    async (job) => {
      const { productId, reason, isInitial } = job.data;
      console.log(`[Job ${job.id}] Started processing product: ${productId} (Reason: ${reason || "unknown"})`);

      if (!supabase) {
        throw new Error(
          "Worker cannot process job: Supabase credentials (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY) are missing."
        );
      }

      // 1. Fetch authoritative product record from Supabase
      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .maybeSingle();

      if (fetchError) {
        console.error(`[Job ${job.id}] Database fetch error:`, fetchError.message);
        throw fetchError; // Retryable
      }

      // 2. Safe deletion handling: If product was deleted by user while in queue, exit cleanly
      if (!product) {
        console.log(`[Job ${job.id}] Product ${productId} was deleted or does not exist. Skipping.`);
        return { status: "skipped", reason: "product_deleted" };
      }

      // 3. Update status to PROCESSING
      await supabase
        .from("products")
        .update({
          status: "PROCESSING",
          updated_at: new Date().toISOString(),
        })
        .eq("id", productId);

      // 4. Scrape current product data via Firecrawl (using retailer adapter)
      const retailer = product.retailer || detectRetailer(product.url) || "amazon";
      let productData;
      try {
        console.log(`[Job ${job.id}] Scraping URL for product ${productId} (Retailer: ${retailer})...`);
        productData = await scrapeProduct(product.url, { retailer });
      } catch (err) {
        console.error(`[Job ${job.id}] Firecrawl scrape error:`, err.message);

        const isUnrecoverable =
          err.message.includes("No data extracted") ||
          err.message.includes("Invalid URL") ||
          err.message.includes("404");

        // If this is unrecoverable or on the final attempt, update database status to FAILED
        const isLastAttempt = (job.attemptsMade + 1) >= (job.opts?.attempts || 3);
        if (isUnrecoverable || isLastAttempt) {
          await supabase
            .from("products")
            .update({
              status: "FAILED",
              error_message: err.message || "Failed to extract product information",
              updated_at: new Date().toISOString(),
            })
            .eq("id", productId);
        }

        if (isUnrecoverable) {
          throw new UnrecoverableError(`Permanent extraction failure: ${err.message}`);
        }

        throw err; // Allow BullMQ exponential retry for temporary errors
      }

      if (!productData || !productData.currentPrice) {
        const errorMsg = "Could not extract current price from product page.";
        await supabase
          .from("products")
          .update({
            status: "FAILED",
            error_message: errorMsg,
            updated_at: new Date().toISOString(),
          })
          .eq("id", productId);

        throw new UnrecoverableError(errorMsg);
      }

      const newPrice = parseFloat(productData.currentPrice);
      const oldPrice = product.current_price !== null && product.current_price !== undefined
        ? parseFloat(product.current_price)
        : null;
      const currency = productData.currencyCode || product.currency || "USD";
      const name = productData.productName || product.name || "Tracked Product";
      const imageUrl = productData.productImageUrl || product.image_url;

      console.log(`[Job ${job.id}] Product ${productId}: Extracted price = ${currency} ${newPrice} (Previous = ${oldPrice})`);

      // 5. Write timestamped snapshot to price_history (supports continuous charts & analytics)
      const { error: historyError } = await supabase.from("price_history").insert({
        product_id: product.id,
        price: newPrice,
        currency: currency,
        checked_at: new Date().toISOString(),
      });

      if (historyError) {
        console.warn(`[Job ${job.id}] Warning: Failed to insert price_history:`, historyError.message);
      }

      // 6. Update products table with extracted details and status ACTIVE
      const { error: updateError } = await supabase
        .from("products")
        .update({
          retailer,
          name,
          current_price: newPrice,
          currency,
          image_url: imageUrl,
          status: "ACTIVE",
          error_message: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", product.id);

      if (updateError) {
        console.error(`[Job ${job.id}] Failed to update product:`, updateError.message);
        throw updateError;
      }

      // 7. Evaluate Target-Price Alert State Machine
      const { shouldAlert, newLastAlertedPrice, reason: alertReason } = evaluateTargetCrossing({
        oldPrice,
        newPrice,
        targetPrice: product.target_price,
        lastAlertedPrice: product.last_alerted_price,
      });

      console.log(`[Job ${job.id}] Alert evaluation: shouldAlert=${shouldAlert}, reason=${alertReason}`);

      // Update last_alerted_price / last_alerted_at on product if state changed
      if (newLastAlertedPrice !== product.last_alerted_price) {
        await supabase
          .from("products")
          .update({
            last_alerted_price: newLastAlertedPrice,
            last_alerted_at: shouldAlert ? new Date().toISOString() : product.last_alerted_at,
          })
          .eq("id", product.id);
      }

      // 8. Dispatch Email Alert if threshold was crossed
      if (shouldAlert) {
        try {
          const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
            product.user_id
          );

          if (!userError && userData?.user?.email) {
            console.log(`[Job ${job.id}] Sending target-price drop alert to ${userData.user.email}...`);
            const alertProductPayload = {
              ...product,
              name,
              image_url: imageUrl,
              currency,
              target_price: product.target_price,
            };

            const emailResult = await sendPriceDropAlert(
              userData.user.email,
              alertProductPayload,
              oldPrice !== null ? oldPrice : newPrice,
              newPrice
            );

            if (emailResult.success) {
              console.log(`[Job ${job.id}] Alert email sent successfully.`);
              // Log to price_alerts audit table
              await supabase.from("price_alerts").insert({
                product_id: product.id,
                user_id: product.user_id,
                old_price: oldPrice,
                new_price: newPrice,
                target_price: product.target_price,
                sent_at: new Date().toISOString(),
                status: "SENT",
              });
            } else {
              console.error(`[Job ${job.id}] Email send error:`, emailResult.error);
            }
          }
        } catch (emailErr) {
          console.error(`[Job ${job.id}] Error sending alert email:`, emailErr.message);
        }
      }

      return {
        success: true,
        productId,
        oldPrice,
        newPrice,
        status: "ACTIVE",
        shouldAlert,
      };
    },
    {
      connection,
      concurrency,
      limiter: {
        max: maxLimit,
        duration: durationMs,
      },
    }
  );

  worker.on("completed", (job) => {
    console.log(`[Worker] Job ${job.id} completed successfully.`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed with error:`, err.message);
  });

  worker.on("error", (err) => {
    console.error("[Worker Error]:", err.message);
  });

  return worker;
}
