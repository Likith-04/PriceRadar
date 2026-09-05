"use client";

import { useState, useMemo } from "react";
import { addProduct } from "@/app/actions";
import AuthModal from "./AuthModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  Link2,
  Loader2,
  Target,
  CheckCircle2,
  AlertTriangle,
  Store,
} from "lucide-react";
import { toast } from "sonner";
import {
  detectRetailer,
  getRetailerConfig,
  SUPPORTED_RETAILERS_SUMMARY,
} from "@/lib/retailers";

export default function AddProductForm({ user }) {
  const [url, setUrl] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [showTargetInput, setShowTargetInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Real-time retailer detection
  const detectedRetailerInfo = useMemo(() => {
    if (!url.trim()) return null;
    const retailerId = detectRetailer(url);
    if (retailerId) {
      return {
        isSupported: true,
        config: getRetailerConfig(retailerId),
      };
    }
    // Check if it has a valid domain structure but unsupported retailer
    try {
      const candidate = url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`;
      const parsed = new URL(candidate);
      if (parsed.hostname && parsed.hostname.includes(".")) {
        return {
          isSupported: false,
          hostname: parsed.hostname.replace(/^www\./i, ""),
        };
      }
    } catch {
      // Typing in progress
    }
    return null;
  }, [url]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("url", url);
    if (targetPrice) {
      formData.append("target_price", targetPrice);
    }

    const result = await addProduct(formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      const retailerName = result.product?.retailer
        ? getRetailerConfig(result.product.retailer)?.name || result.product.retailer
        : "Product";
      toast.success(
        result.message || `${retailerName} product queued for tracking!`
      );
      setUrl("");
      setTargetPrice("");
      setShowTargetInput(false);
    }

    setLoading(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full max-w-3xl">
        <div className="rounded-[1.5rem] border border-border/70 bg-card/80 p-3 shadow-lg backdrop-blur-xl">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Link2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste an Amazon, Flipkart, Reliance Digital, or Croma link"
                className="h-14 rounded-xl border-0 bg-background/80 pl-11 text-base shadow-none ring-1 ring-border/70"
                required
                disabled={loading}
              />
            </div>

            {showTargetInput && (
              <div className="relative w-full sm:w-44">
                <Target className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="Target (₹)"
                  className="h-14 rounded-xl border-0 bg-background/80 pl-11 text-base shadow-none ring-1 ring-border/70"
                  disabled={loading}
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="h-14 rounded-xl px-6 shadow-lg shadow-primary/15 sm:px-8"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Queueing
                </>
              ) : (
                <>
                  Start Tracking
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {/* Real-time Retailer Detection Pill */}
          {detectedRetailerInfo && (
            <div className="mt-2.5 px-2">
              {detectedRetailerInfo.isSupported ? (
                <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 animate-in fade-in slide-in-from-top-1 duration-200">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    <strong>{detectedRetailerInfo.config?.name}</strong> detected
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-700 dark:text-amber-300 animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>
                    <strong>{detectedRetailerInfo.hostname}</strong> is not supported yet. Supported: {SUPPORTED_RETAILERS_SUMMARY}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="mt-2 flex items-center justify-between px-2 text-xs text-muted-foreground">
            <button
              type="button"
              onClick={() => setShowTargetInput(!showTargetInput)}
              className="flex items-center gap-1.5 font-medium text-primary hover:underline"
            >
              <Target className="h-3.5 w-3.5" />
              {showTargetInput ? "Hide target price" : "+ Add optional target alert price"}
            </button>

            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-muted-foreground/80">
              <Store className="h-3 w-3" />
              Supports: {SUPPORTED_RETAILERS_SUMMARY}
            </span>
          </div>
        </div>

        <p className="mt-3 px-1 text-sm leading-6 text-muted-foreground">
          {user
            ? "We'll queue the product for background extraction across Indian retailers and continuously track price changes."
            : "Sign in with Google to save your multi-retailer watchlist and receive instant email drop alerts."}
        </p>
      </form>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
