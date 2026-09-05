"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { validateProductUrl, validateTargetPrice } from "@/lib/validation";
import { enqueueProductCheck } from "@/lib/queue/price-check.queue";

export async function addProduct(formData) {
  const rawUrl = formData.get("url");
  const rawTarget = formData.get("target_price");

  const urlValidation = validateProductUrl(rawUrl);
  if (!urlValidation.valid) {
    return { error: urlValidation.error };
  }

  const targetValidation = validateTargetPrice(rawTarget);
  if (!targetValidation.valid) {
    return { error: targetValidation.error };
  }

  const normalizedUrl = urlValidation.value;
  const targetPrice = targetValidation.value;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Not authenticated. Please sign in to track products." };
    }

    // Check if product already exists for this user
    const { data: existingProduct } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", user.id)
      .eq("url", normalizedUrl)
      .maybeSingle();

    let product = existingProduct;
    let isUpdate = !!existingProduct;

    const retailer = urlValidation.retailer || "amazon";

    if (isUpdate) {
      // If product exists, update target_price if provided, set status to PENDING
      const updatePayload = {
        retailer,
        status: "PENDING",
        error_message: null,
        updated_at: new Date().toISOString(),
      };

      if (targetPrice !== null) {
        updatePayload.target_price = targetPrice;
        updatePayload.last_alerted_price = null; // Re-arm alert
      }

      const { data: updatedProduct, error: updateError } = await supabase
        .from("products")
        .update(updatePayload)
        .eq("id", existingProduct.id)
        .select()
        .single();

      if (updateError) throw updateError;
      product = updatedProduct;
    } else {
      // Create new pending product record
      const { data: newProduct, error: insertError } = await supabase
        .from("products")
        .insert({
          user_id: user.id,
          url: normalizedUrl,
          retailer,
          name: "Fetching product details...",
          current_price: 0,
          currency: "INR",
          target_price: targetPrice,
          status: "PENDING",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) throw insertError;
      product = newProduct;
    }

    // Asynchronously queue background scraping job
    try {
      await enqueueProductCheck({
        productId: product.id,
        userId: user.id,
        isInitial: !isUpdate,
        reason: isUpdate ? "manual_refresh" : "initial_scrape",
      });
    } catch (queueErr) {
      console.error("[Queue Error]: Failed to enqueue background job:", queueErr.message);
      // Even if Redis is temporarily unreachable, product is saved in Postgres
    }

    revalidatePath("/");
    return {
      success: true,
      product,
      message: isUpdate
        ? "Product tracking refreshed! Fetching latest price in the background..."
        : "Product added! Extracting price and details in the background...",
    };
  } catch (error) {
    console.error("Add product error:", error);
    return { error: error.message || "Failed to add product" };
  }
}

export async function retryProductScrape(productId) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };

    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !product) {
      return { error: "Product not found or access denied" };
    }

    await supabase
      .from("products")
      .update({
        status: "PENDING",
        error_message: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId);

    await enqueueProductCheck({
      productId,
      userId: user.id,
      isInitial: false,
      reason: "manual_retry",
    });

    revalidatePath("/");
    return { success: true, message: "Price check re-queued!" };
  } catch (error) {
    return { error: error.message || "Failed to retry price check" };
  }
}

export async function setTargetPrice(productId, rawTargetPrice) {
  const validation = validateTargetPrice(rawTargetPrice);
  if (!validation.valid) {
    return { error: validation.error };
  }

  const targetPrice = validation.value;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };

    const { data: product, error } = await supabase
      .from("products")
      .update({
        target_price: targetPrice,
        last_alerted_price: null, // Reset alerted state to arm new target
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/");
    return {
      success: true,
      product,
      message: targetPrice
        ? `Target price set to ${product.currency || "USD"} ${targetPrice.toFixed(2)}`
        : "Target price removed.",
    };
  } catch (error) {
    return { error: error.message || "Failed to update target price" };
  }
}

export async function removeTargetPrice(productId) {
  return await setTargetPrice(productId, null);
}

export async function deleteProduct(productId) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId)
      .eq("user_id", user.id);

    if (error) throw error;

    revalidatePath("/");
    return { success: true, message: "Product removed from watchlist." };
  } catch (error) {
    return { error: error.message };
  }
}

export async function getProducts() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Get products error:", error);
    return [];
  }
}

export async function getPriceHistory(productId) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("price_history")
      .select("*")
      .eq("product_id", productId)
      .order("checked_at", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Get price history error:", error);
    return [];
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/");
  redirect("/");
}
