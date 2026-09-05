"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "./ProductCard";
import AddProductModal from "./AddProductModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Package,
  Activity,
  Clock,
  Target,
  AlertCircle,
  Sparkles,
  TrendingDown,
  RefreshCw,
} from "lucide-react";

export default function DashboardClient({ products, user }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const router = useRouter();

  // Calculate real metrics from PostgreSQL dataset
  const totalCount = products.length;
  const activeCount = products.filter(
    (p) => p.status === "ACTIVE" || (!p.status && p.current_price > 0)
  ).length;
  const waitingCount = products.filter(
    (p) => p.status === "PENDING" || p.status === "PROCESSING"
  ).length;
  const targetMetCount = products.filter(
    (p) =>
      p.target_price !== null &&
      p.target_price !== undefined &&
      Number(p.current_price) > 0 &&
      Number(p.current_price) <= Number(p.target_price)
  ).length;
  const failedCount = products.filter((p) => p.status === "FAILED").length;

  // Auto-polling for asynchronous background queue jobs
  useEffect(() => {
    if (waitingCount === 0) return;

    const interval = setInterval(() => {
      router.refresh();
    }, 3500);

    return () => clearInterval(interval);
  }, [waitingCount, router]);

  // Filter products based on search query and active tab
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      (product.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.url || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "active") {
      return product.status === "ACTIVE" || (!product.status && product.current_price > 0);
    }
    if (activeTab === "waiting") {
      return product.status === "PENDING" || product.status === "PROCESSING";
    }
    if (activeTab === "target_met") {
      return (
        product.target_price !== null &&
        Number(product.current_price) > 0 &&
        Number(product.current_price) <= Number(product.target_price)
      );
    }
    if (activeTab === "failed") {
      return product.status === "FAILED";
    }

    return true;
  });

  return (
    <div className="space-y-8">
      {/* Dashboard Top Header & CTA */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Your Price Radar
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Continuous background price monitoring, target threshold alerts, and history tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            size="lg"
            className="rounded-xl px-5 shadow-lg shadow-primary/20 text-xs font-semibold gap-2"
          >
            <Plus className="h-4 w-4" />
            Track New Product
          </Button>
        </div>
      </div>

      {/* Real Summary Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {/* Total Tracked */}
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`rounded-2xl border p-4 text-left transition-all duration-200 ${
            activeTab === "all"
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border/70 bg-card/80 hover:border-border"
          }`}
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Total Tracked</span>
            <Package className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-3 text-2xl font-bold text-foreground sm:text-3xl">{totalCount}</p>
          <span className="text-[11px] text-muted-foreground">Items in your watchlist</span>
        </button>

        {/* Monitoring / Active */}
        <button
          type="button"
          onClick={() => setActiveTab("active")}
          className={`rounded-2xl border p-4 text-left transition-all duration-200 ${
            activeTab === "active"
              ? "border-emerald-500 bg-emerald-500/5 shadow-sm"
              : "border-border/70 bg-card/80 hover:border-border"
          }`}
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Monitoring</span>
            <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-600 dark:text-emerald-400 sm:text-3xl">
            {activeCount}
          </p>
          <span className="text-[11px] text-muted-foreground">Active background checks</span>
        </button>

        {/* Waiting in Queue */}
        <button
          type="button"
          onClick={() => setActiveTab("waiting")}
          className={`rounded-2xl border p-4 text-left transition-all duration-200 ${
            activeTab === "waiting"
              ? "border-amber-500 bg-amber-500/5 shadow-sm"
              : "border-border/70 bg-card/80 hover:border-border"
          }`}
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">In Queue</span>
            <Clock className={`h-4 w-4 text-amber-500 ${waitingCount > 0 ? "animate-spin" : ""}`} />
          </div>
          <p className="mt-3 text-2xl font-bold text-amber-500 sm:text-3xl">{waitingCount}</p>
          <span className="text-[11px] text-muted-foreground">
            {waitingCount > 0 ? "Worker extracting..." : "Queue clear"}
          </span>
        </button>

        {/* Target Reached */}
        <button
          type="button"
          onClick={() => setActiveTab("target_met")}
          className={`rounded-2xl border p-4 text-left transition-all duration-200 ${
            activeTab === "target_met"
              ? "border-emerald-600 bg-emerald-600/5 shadow-sm"
              : "border-border/70 bg-card/80 hover:border-border"
          }`}
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Target Reached</span>
            <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-600 dark:text-emerald-400 sm:text-3xl">
            {targetMetCount}
          </p>
          <span className="text-[11px] text-muted-foreground">Ready to purchase</span>
        </button>
      </div>

      {/* Search and Tab Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-4">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: "All Products", count: totalCount },
            { id: "active", label: "Monitoring", count: activeCount },
            { id: "waiting", label: "In Queue", count: waitingCount },
            { id: "target_met", label: "Target Met", count: targetMetCount },
            { id: "failed", label: "Failed", count: failedCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                  : "bg-card/70 text-muted-foreground hover:bg-accent hover:text-foreground border border-border/60"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  activeTab === tab.id
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products or stores..."
            className="h-9 rounded-xl pl-9 text-xs border-border/70 bg-card/80"
          />
        </div>
      </div>

      {/* Product Grid or Empty State */}
      {filteredProducts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 items-start">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        /* Polished Empty States */
        <div className="rounded-3xl border border-dashed border-border/80 bg-card/50 p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
            <TrendingDown className="h-7 w-7" />
          </div>

          <h3 className="text-xl font-semibold text-foreground">
            {totalCount === 0
              ? "Your Price Radar is ready for its first product"
              : "No products match this filter"}
          </h3>

          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            {totalCount === 0
              ? "Paste any product link from Amazon, Walmart, Zara, or other stores to begin automatic price tracking."
              : "Try switching tabs or adjusting your search query."}
          </p>

          <div className="mt-6 flex justify-center">
            <Button
              onClick={() => setIsAddModalOpen(true)}
              size="lg"
              className="rounded-xl px-6 font-semibold shadow-md shadow-primary/20 gap-2"
            >
              <Plus className="h-4 w-4" />
              Track a Product Now
            </Button>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProductAdded={() => router.refresh()}
      />
    </div>
  );
}
