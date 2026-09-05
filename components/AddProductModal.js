"use client";

import { useState } from "react";
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
import { Link2, Target, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AddProductModal({ isOpen, onClose, onProductAdded }) {
  const [url, setUrl] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
      toast.success(
        result?.message || "Product queued! Extracting details in background."
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
              Paste any store link. PriceRadar queues a background job to extract current prices, image, and start continuous monitoring.
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
                placeholder="https://www.amazon.com/dp/B08N5WRWNW..."
                required
                className="h-11 rounded-xl text-sm"
                disabled={loading}
                autoFocus
              />
              <p className="text-[11px] text-muted-foreground">
                Supports Amazon, Walmart, Zara, Target, BestBuy, and modern e-commerce stores.
              </p>
            </div>

            {/* Target Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Target Alert Price (Optional)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="e.g. 199.99"
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
