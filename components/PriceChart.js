"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { getPriceHistory } from "@/app/actions";
import { Loader2, TrendingDown, TrendingUp, Target, BarChart2 } from "lucide-react";

export default function PriceChart({ productId, targetPrice, currentPrice }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const history = await getPriceHistory(productId);

      const chartData = history.map((item) => ({
        date: new Date(item.checked_at).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        price: parseFloat(item.price),
        rawTime: new Date(item.checked_at).getTime(),
      }));

      setData(chartData);
      setLoading(false);
    }

    loadData();
  }, [productId]);

  if (loading) {
    return (
      <div className="flex w-full items-center justify-center py-8 text-xs text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
        Loading price history...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full rounded-xl border border-border/60 bg-background/50 p-6 text-center text-xs text-muted-foreground">
        <BarChart2 className="mx-auto mb-2 h-5 w-5 opacity-40" />
        No price history recorded yet. The background worker logs snapshots on every scheduled check.
      </div>
    );
  }

  const prices = data.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const targetNum =
    targetPrice !== null && targetPrice !== undefined
      ? parseFloat(targetPrice)
      : null;

  return (
    <div className="w-full space-y-3">
      {/* Quick Statistics Bar */}
      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-background/80 px-2.5 py-1">
          <span className="text-muted-foreground">Low:</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            ${minPrice.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-background/80 px-2.5 py-1">
          <span className="text-muted-foreground">High:</span>
          <span className="font-semibold text-foreground">${maxPrice.toFixed(2)}</span>
        </div>

        {targetNum && (
          <div className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-emerald-700 dark:text-emerald-400">
            <Target className="h-3 w-3" />
            <span>Target: <strong>${targetNum.toFixed(2)}</strong></span>
          </div>
        )}

        <span className="ml-auto text-[10px] text-muted-foreground">
          {data.length} snapshot{data.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Chart Canvas */}
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 10, left: -24, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" opacity={0.4} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              stroke="var(--border)"
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              stroke="var(--border)"
              tickLine={false}
              domain={["dataMin - 5", "dataMax + 5"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                color: "var(--popover-foreground)",
                fontSize: "12px",
                padding: "8px 12px",
                boxShadow: "0 8px 16px -4px rgba(0,0,0,0.1)",
              }}
              formatter={(value) => [`$${Number(value).toFixed(2)}`, "Price"]}
            />
            {targetNum && (
              <ReferenceLine
                y={targetNum}
                stroke="#10b981"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `Target ($${targetNum})`,
                  fill: "#10b981",
                  fontSize: 10,
                  position: "insideTopRight",
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey="price"
              stroke="var(--primary)"
              strokeWidth={2}
              dot={{ fill: "var(--primary)", r: 3 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
