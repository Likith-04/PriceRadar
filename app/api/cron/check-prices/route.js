import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { enqueueBatchProductChecks } from "@/lib/queue/price-check.queue";

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: "Server configuration error: Supabase service credentials missing" },
        { status: 500 }
      );
    }

    // Use service role to query all tracked products
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, user_id, url, status");

    if (productsError) throw productsError;

    if (!products || products.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No products found to check",
        totalQueued: 0,
      });
    }

    console.log(`[Cron] Enqueueing background price checks for ${products.length} products...`);

    // Asynchronously enqueue BullMQ jobs in batch with deduplication keys
    const queuedJobs = await enqueueBatchProductChecks(products, "scheduled_cron");

    return NextResponse.json({
      success: true,
      message: `Successfully enqueued ${queuedJobs.length} price check jobs for background worker execution`,
      totalQueued: queuedJobs.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Price check cron endpoint is active. Use POST with Bearer authorization to enqueue jobs.",
  });
}
