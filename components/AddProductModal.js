"use client";

import { useState, useMemo } from "react";
import { addProduct } from "@/app/actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Link2,
  Target,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  detectRetailer,
  getRetailerConfig,
  SUPPORTED_RETAILERS_SUMMARY,
} from "@/lib/retailers";

export default function AddProductModal({ isOpen, onClose, onProductAdded }) {
  const [url, setUrl] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
      // In-progress typing
    }
    return null;
  }, [url]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("url", url.trim());
    if (targetPrice.trim()) {
      formData.append("target_price", targetPrice.trim());
    }

    const result = await addProduct(formData);

    if (result?.error) {
      toast.error(result.error);
    } else {
      const retailerName = result.product?.retailer
        ? getRetailerConfig(result.product.retailer)?.name || result.product.retailer
        : "Product";
      toast.success(
        result?.message || `${retailerName} product queued! Extracting in background.`
      );
      setUrl("");
      setTargetPrice("");
      onClose();
      if (onProductAdded) onProductAdded();
      router.refresh();
    }

    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg rounded-2xl border-border/70 p-6">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
              <Sparkles className="h-5 w-5 text-primary" />
              Track a New Product
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Paste a link from Amazon India, Flipkart, Reliance Digital, or Croma. PriceRadar queues a background job to extract prices and monitor continuously.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Product URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5 text-primary" />
                Store Product URL
              </label>
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.amazon.in/dp/... or flipkart.com/..."
                required
                className="h-11 rounded-xl text-sm"
                disabled={loading}
                autoFocus
              />

              {/* Retailer Real-Time Status */}
              {detectedRetailerInfo && (
                <div className="pt-1">
                  {detectedRetailerInfo.isSupported ? (
                    <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>
                        <strong>{detectedRetailerInfo.config?.name}</strong> detected
                      </span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-700 dark:text-amber-300">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>
                        <strong>{detectedRetailerInfo.hostname}</strong> is unsupported. Supported: {SUPPORTED_RETAILERS_SUMMARY}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <p className="text-[11px] text-muted-foreground">
                Supported: Amazon India, Flipkart, Reliance Digital, and Croma.
              </p>
            </div>

            {/* Target Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Target Alert Price in INR (Optional)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="e.g. 49999.00"
                className="h-11 rounded-xl text-sm"
                disabled={loading}
              />
              <p className="text-[11px] text-muted-foreground">
                We will email you via Resend as soon as the price drops to or below this threshold.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !url.trim()}
              className="rounded-xl px-5 text-xs font-semibold shadow-md shadow-primary/20"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Queueing Job...
                </>
              ) : (
                "Start Monitoring"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
