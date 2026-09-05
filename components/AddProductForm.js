"use client";

import { useState } from "react";
import { addProduct } from "@/app/actions";
import AuthModal from "./AuthModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Link2, Loader2, Target } from "lucide-react";
import { toast } from "sonner";

export default function AddProductForm({ user }) {
  const [url, setUrl] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [showTargetInput, setShowTargetInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

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
      toast.success(result.message || "Product queued for tracking!");
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
                placeholder="Paste a product URL to start your watchlist"
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
                  placeholder="Target Price"
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

          <div className="mt-2 flex items-center justify-between px-2 text-xs text-muted-foreground">
            <button
              type="button"
              onClick={() => setShowTargetInput(!showTargetInput)}
              className="flex items-center gap-1.5 font-medium text-primary hover:underline"
            >
              <Target className="h-3.5 w-3.5" />
              {showTargetInput ? "Hide target price" : "+ Add optional target alert price"}
            </button>
          </div>
        </div>

        <p className="mt-3 px-1 text-sm leading-6 text-muted-foreground">
          {user
            ? "We'll queue the product for extraction and continuously record price history snapshots."
            : "Sign in with Google after pasting a link to save your watchlist and receive email drop alerts."}
        </p>
      </form>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
