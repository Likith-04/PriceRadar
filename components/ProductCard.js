"use client";

import { useState } from "react";
import { deleteProduct, setTargetPrice, removeTargetPrice, retryProductScrape } from "@/app/actions";
import PriceChart from "./PriceChart";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ExternalLink,
  Trash2,
  ChevronDown,
  ChevronUp,
  Target,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Store,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getRetailerConfig, detectRetailer } from "@/lib/retailers";

export default function ProductCard({ product }) {
  const [showChart, setShowChart] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [targetInput, setTargetInput] = useState(
    product.target_price !== null && product.target_price !== undefined
      ? String(product.target_price)
      : ""
  );
  const [savingTarget, setSavingTarget] = useState(false);
  const router = useRouter();

  // Retailer metadata
  const retailerId = product.retailer || detectRetailer(product.url);
  const retailerConfig = getRetailerConfig(retailerId);

  // Extract store domain safely for fallback
  let domain = "Store";
  try {
    const parsed = new URL(product.url);
    domain = parsed.hostname.replace(/^www\./i, "");
  } catch {
    domain = "Store";
  }

  const handleDelete = async () => {
    if (!confirm("Remove this product from your price radar?")) return;

    setDeleting(true);
    const res = await deleteProduct(product.id);
    if (res?.error) {
      toast.error(res.error);
      setDeleting(false);
    } else {
      toast.success("Product removed from watchlist.");
      router.refresh();
    }
  };

  const handleRetry = async () => {
    setRetrying(true);
    const res = await retryProductScrape(product.id);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Price check re-queued!");
      router.refresh();
    }
    setRetrying(false);
  };

  const handleSaveTarget = async (e) => {
    e.preventDefault();
    setSavingTarget(true);

    const res = await setTargetPrice(product.id, targetInput);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.message);
      setShowTargetModal(false);
      router.refresh();
    }
    setSavingTarget(false);
  };

  const handleRemoveTarget = async () => {
    setSavingTarget(true);
    const res = await removeTargetPrice(product.id);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Target price removed.");
      setTargetInput("");
      setShowTargetModal(false);
      router.refresh();
    }
    setSavingTarget(false);
  };

  const isPending = product.status === "PENDING";
  const isProcessing = product.status === "PROCESSING";
  const isFailed = product.status === "FAILED";
  const isActive = product.status === "ACTIVE" || (!isPending && !isProcessing && !isFailed);

  const currentPrice = Number(product.current_price) || 0;
  const hasTarget = product.target_price !== null && product.target_price !== undefined;
  const targetPrice = hasTarget ? Number(product.target_price) : null;
  const isTargetMet = hasTarget && currentPrice > 0 && currentPrice <= targetPrice;
  const diffToTarget = hasTarget && currentPrice > 0 ? currentPrice - targetPrice : null;
  const currencyCode = product.currency || retailerConfig?.defaultCurrency || "INR";

  // Format currency
  const formatAmount = (num) => {
    if (num === null || num === undefined || isNaN(num)) return "0.00";
    try {
      return new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(num);
    } catch {
      return Number(num).toFixed(2);
    }
  };

  const currencySymbol = currencyCode === "INR" ? "₹" : currencyCode === "USD" ? "$" : `${currencyCode} `;

  // Format last checked relative time
  const lastCheckedDate = product.updated_at ? new Date(product.updated_at) : new Date(product.created_at);
  const formattedDate = lastCheckedDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      <Card className="group relative flex flex-col overflow-hidden rounded-2xl border-border/70 bg-card/85 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex gap-4">
            {/* Product Image Thumbnail */}
            {product.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image_url}
                alt={product.name}
                className="h-24 w-24 shrink-0 rounded-xl border border-border/70 bg-background/50 object-contain p-1"
              />
            ) : (
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/40 text-muted-foreground">
                {isPending || isProcessing ? (
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                ) : (
                  <Store className="h-6 w-6 opacity-40" />
                )}
              </div>
            )}

            {/* Product Metadata & Price */}
            <div className="flex-1 min-w-0">
              {/* Store & Status Row */}
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1.5">
                {retailerConfig ? (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold transition-colors ${retailerConfig.badgeColor.bg} ${retailerConfig.badgeColor.text} ${retailerConfig.badgeColor.border}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${retailerConfig.badgeColor.dot}`} />
                    {retailerConfig.name}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    <Store className="h-3 w-3" />
                    {domain}
                  </span>
                )}

                {isPending && (
                  <Badge variant="outline" className="gap-1 border-amber-500/40 bg-amber-500/10 text-[10px] text-amber-600 dark:text-amber-400">
                    <Loader2 className="h-2.5 w-2.5 animate-spin" />
                    In Queue
                  </Badge>
                )}

                {isProcessing && (
                  <Badge variant="outline" className="gap-1 border-sky-500/40 bg-sky-500/10 text-[10px] text-sky-600 dark:text-sky-400">
                    <Loader2 className="h-2.5 w-2.5 animate-spin" />
                    Checking Price
                  </Badge>
                )}

                {isActive && (
                  <Badge variant="secondary" className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-700 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Monitoring
                  </Badge>
                )}

                {isFailed && (
                  <Badge variant="destructive" className="gap-1 text-[10px]">
                    <AlertCircle className="h-2.5 w-2.5" />
                    Failed
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h3 className="line-clamp-2 text-sm font-semibold text-foreground leading-snug">
                {product.name || "Fetching product details..."}
              </h3>

              {/* Price Row */}
              <div className="mt-2 flex flex-wrap items-baseline gap-2">
                {isPending && currentPrice === 0 ? (
                  <span className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    Extracting price...
                  </span>
                ) : (
                  <span className="text-2xl font-bold tracking-tight text-primary">
                    {currencySymbol}{formatAmount(currentPrice)}
                  </span>
                )}

                {isTargetMet && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/90 px-2 py-0.5 text-[10px] font-semibold text-white">
                    <CheckCircle2 className="h-3 w-3" />
                    Target Reached
                  </span>
                )}
              </div>

              {/* Target Price Row */}
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                {hasTarget ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground font-medium text-[11px]">
                      Target: <strong className="text-foreground">{currencySymbol}{formatAmount(targetPrice)}</strong>
                    </span>
                    {diffToTarget > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        ({currencySymbol}{formatAmount(diffToTarget)} above goal)
                      </span>
                    )}
                    <button
                      onClick={() => setShowTargetModal(true)}
                      className="text-[11px] font-semibold text-primary hover:underline ml-1"
                    >
                      Edit
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowTargetModal(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                  >
                    <Target className="h-3 w-3" />
                    Set target price
                  </button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 flex-1 flex flex-col justify-end">
          {isFailed && (
            <div className="mb-3 rounded-xl border border-destructive/25 bg-destructive/10 p-2.5 text-xs text-destructive flex items-center justify-between gap-2">
              <span className="line-clamp-1">{product.error_message || "Could not scrape page."}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                disabled={retrying}
                className="h-7 shrink-0 text-xs gap-1 border-destructive/30"
              >
                <RefreshCw className={`h-3 w-3 ${retrying ? "animate-spin" : ""}`} />
                Retry
              </Button>
            </div>
          )}

          {/* Card Footer Actions */}
          <div className="mt-2 flex items-center justify-between border-t border-border/50 pt-2.5 text-xs">
            <div className="flex items-center gap-1 text-muted-foreground text-[11px]">
              <Clock className="h-3 w-3" />
              <span>{formattedDate}</span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChart(!showChart)}
                className="h-7 px-2.5 text-xs gap-1 text-foreground/80 hover:text-foreground"
              >
                {showChart ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" />
                    Hide Chart
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" />
                    History
                  </>
                )}
              </Button>

              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-7 items-center justify-center rounded-lg px-2.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                title="Open product on store"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                title="Delete product"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Collapsible Interactive Price Chart */}
          {showChart && (
            <div className="mt-3 border-t border-border/70 pt-3">
              <PriceChart productId={product.id} currentPrice={currentPrice} currency={currencyCode} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Target Price Configuration Modal */}
      <Dialog open={showTargetModal} onOpenChange={setShowTargetModal}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <form onSubmit={handleSaveTarget}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Set Alert Threshold ({retailerConfig?.name || "Store"})
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                We will monitor this item continuously and dispatch an instant email alert via Resend when the price drops to or below your target.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-2">
              <label className="text-xs font-semibold text-foreground block">
                Target Alert Price in {currencySymbol} ({currencyCode})
              </label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                placeholder="e.g. 64999.00"
                required
                className="h-11 rounded-xl text-base"
                autoFocus
              />
              {currentPrice > 0 && (
                <p className="text-xs text-muted-foreground">
                  Current price: <strong>{currencySymbol}{formatAmount(currentPrice)}</strong>
                </p>
              )}
            </div>

            <DialogFooter className="flex gap-2 sm:justify-between pt-2">
              {hasTarget ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRemoveTarget}
                  disabled={savingTarget}
                  className="rounded-xl text-xs text-destructive hover:bg-destructive/10"
                >
                  Remove Target
                </Button>
              ) : <div />}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowTargetModal(false)}
                  disabled={savingTarget}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={savingTarget}
                  className="rounded-xl text-xs font-semibold"
                >
                  {savingTarget ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Target"
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
