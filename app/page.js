import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Clock,
  Cpu,
  Database,
  Layers,
  Link2,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AddProductForm from "@/components/AddProductForm";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {/* Background Ambience & Grid */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-10rem] top-12 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-[-10rem] top-0 h-[28rem] w-[28rem] rounded-full bg-chart-2/12 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-1/3 h-96 w-96 rounded-full bg-chart-3/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(circle at center, black 30%, transparent 80%)",
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 px-4 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            {/* Left Column: Messaging & Action */}
            <div className="max-w-2xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-4 py-1.5 text-xs font-semibold text-foreground shadow-sm backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Asynchronous E-Commerce Price Monitoring
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-6xl leading-[1.1]">
                Never miss the <br />
                <span className="text-primary">right price</span> again.
              </h1>

              <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                PriceRadar continuously watches products across e-commerce storefronts in the background, tracks historical price curves, and dispatches email alerts the moment prices drop or reach your target threshold.
              </p>

              {/* URL Input Form or Direct Dashboard Link */}
              <div className="pt-2">
                <AddProductForm user={user} />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {user ? (
                  <Button asChild size="lg" className="rounded-xl px-6 font-semibold shadow-lg shadow-primary/20 text-xs">
                    <Link href="/dashboard">
                      Open Your Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : null}

                <Button asChild variant="outline" size="lg" className="rounded-xl border-border/70 text-xs font-medium">
                  <Link href="/how-it-works">
                    <Cpu className="mr-2 h-4 w-4 text-primary" />
                    Explore System Architecture
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Column: Interactive Visual Simulation */}
            <div className="relative">
              <div className="rounded-3xl border border-border/70 bg-card/85 p-6 shadow-2xl backdrop-blur-xl space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border/60 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Live Price Signal
                    </span>
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                    Amazon • ASIN B08N5WRWNW
                  </span>
                </div>

                {/* Product Detail Simulation */}
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-foreground">
                    Sony WH-1000XM5 Wireless Noise-Cancelling Headphones
                  </h3>

                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground block">Current Price</span>
                      <span className="text-3xl font-extrabold text-primary">$279.00</span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-muted-foreground block">Target Alert Goal</span>
                      <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">$280.00</span>
                    </div>
                  </div>

                  {/* Target Reached Badge */}
                  <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-400">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <span><strong>Target Condition Met:</strong> Price is $1.00 below your threshold!</span>
                    </div>
                    <span className="font-semibold text-[11px]">Email Alert Dispatched</span>
                  </div>
                </div>

                {/* Trend Chart Mock Preview */}
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>30-Day Snapshot Curve</span>
                    <span className="text-emerald-600 font-medium">-$70.00 (-20.1%)</span>
                  </div>

                  <div className="flex items-end gap-1.5 h-16 pt-2">
                    {[90, 88, 88, 85, 85, 80, 80, 75, 75, 70, 60, 52].map((val, idx) => (
                      <div
                        key={idx}
                        className={`flex-1 rounded-t-md transition-all ${
                          idx === 11
                            ? "bg-primary"
                            : "bg-primary/30"
                        }`}
                        style={{ height: `${val}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Status Bar */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    Last checked 4 mins ago by BullMQ Worker
                  </span>
                  <span className="font-medium text-foreground">Status: Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core 4-Step Value Flow */}
      <section id="features" className="relative z-10 border-t border-border/70 bg-card/40 py-20 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Continuous Intelligence on Every Product
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              PriceRadar replaces manual tab refreshing with an automated, queue-backed monitoring workflow.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "01",
                title: "Track",
                desc: "Paste any store product URL. PriceRadar validates and normalizes the link instantly.",
                icon: Link2,
              },
              {
                step: "02",
                title: "Monitor",
                desc: "Scheduled BullMQ jobs trigger background workers to extract prices without blocking your browser.",
                icon: Clock,
              },
              {
                step: "03",
                title: "Detect",
                desc: "Our state machine evaluates current prices against historical points and your target goal.",
                icon: ShieldCheck,
              },
              {
                step: "04",
                title: "Alert",
                desc: "Receive instant email notifications via Resend the moment your price target is crossed.",
                icon: Bell,
              },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.step}
                  className="group relative rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-primary">{feature.step}</span>
                    <div className="rounded-xl bg-primary/10 p-2.5 text-primary transition-transform group-hover:scale-110">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="mt-4 text-base font-bold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* System Architecture Overview */}
      <section className="relative z-10 py-20 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
                <Cpu className="h-3.5 w-3.5" />
                Production-Grade Architecture
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Built to eliminate timeouts, rate limits, and dropped jobs.
              </h2>

              <p className="text-sm text-muted-foreground leading-relaxed">
                Traditional price trackers scrape synchronously, causing serverless timeouts and IP bans. PriceRadar runs a distributed worker queue backed by Redis and BullMQ, offloading all heavy lifting from the Next.js App Router.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  {
                    title: "PostgreSQL as Single Source of Truth",
                    desc: "All products, history points, and alert states persist reliably in Supabase PostgreSQL under Row Level Security.",
                  },
                  {
                    title: "BullMQ & Redis Queue",
                    desc: "Exponential backoff retries, rate limiting, and batch enqueueing keep background workloads resilient.",
                  },
                  {
                    title: "Dedicated Long-Running Worker",
                    desc: "Executes anti-bot bypass and AI structured data extraction via Firecrawl API in controlled concurrency.",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3 rounded-xl border border-border/60 bg-card/60 p-3.5">
                    <div className="mt-0.5 rounded-lg bg-primary/10 p-1.5 text-primary h-fit">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{item.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Button asChild variant="outline" className="rounded-xl text-xs font-semibold">
                  <Link href="/how-it-works">
                    Read the Full Technical Deep-Dive
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Visual Queue Architecture Stack */}
            <div className="rounded-3xl border border-border/70 bg-card/85 p-6 shadow-xl backdrop-blur-xl space-y-3">
              <div className="border-b border-border/60 pb-3">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  System Architecture Stack
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="rounded-xl border border-border/60 bg-background/80 p-3 flex items-center justify-between">
                  <span className="font-semibold text-foreground">Web Application & API</span>
                  <span className="text-muted-foreground">Next.js 16 (App Router)</span>
                </div>

                <div className="rounded-xl border border-border/60 bg-background/80 p-3 flex items-center justify-between">
                  <span className="font-semibold text-foreground">Primary Database & Auth</span>
                  <span className="text-muted-foreground">Supabase PostgreSQL + RLS</span>
                </div>

                <div className="rounded-xl border border-border/60 bg-background/80 p-3 flex items-center justify-between">
                  <span className="font-semibold text-foreground">Asynchronous Job Queue</span>
                  <span className="text-muted-foreground">BullMQ + Redis</span>
                </div>

                <div className="rounded-xl border border-border/60 bg-background/80 p-3 flex items-center justify-between">
                  <span className="font-semibold text-foreground">Background Worker Service</span>
                  <span className="text-muted-foreground">Node.js Worker (Concurrency: 5)</span>
                </div>

                <div className="rounded-xl border border-border/60 bg-background/80 p-3 flex items-center justify-between">
                  <span className="font-semibold text-foreground">Headless Scraping & AI Extraction</span>
                  <span className="text-muted-foreground">Firecrawl API</span>
                </div>

                <div className="rounded-xl border border-border/60 bg-background/80 p-3 flex items-center justify-between">
                  <span className="font-semibold text-foreground">Transactional Notifications</span>
                  <span className="text-muted-foreground">Resend Email API</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/70 bg-card/30 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} PriceRadar. Built with Next.js, BullMQ, Redis, Firecrawl, Supabase & Resend.
          </p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/how-it-works" className="hover:text-foreground">
              How It Works
            </Link>
            <Link href="/how-it-works#architecture" className="hover:text-foreground">
              Architecture
            </Link>
            {user ? (
              <Link href="/dashboard" className="hover:text-foreground font-semibold text-primary">
                Dashboard
              </Link>
            ) : null}
          </div>
        </div>
      </footer>
    </main>
  );
}
