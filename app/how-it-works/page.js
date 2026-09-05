import Link from "next/link";
import {
  Cpu,
  Database,
  Layers,
  Zap,
  ShieldCheck,
  RefreshCw,
  Bell,
  Mail,
  Server,
  ArrowRight,
  CheckCircle2,
  Lock,
  GitBranch,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "How It Works & System Architecture — PriceRadar",
  description:
    "Explore PriceRadar's asynchronous architecture: Next.js, Redis, BullMQ, Background Workers, Firecrawl AI extraction, and PostgreSQL.",
};

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <Cpu className="h-3.5 w-3.5" />
            Engineering & System Architecture
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            How PriceRadar Works Under the Hood
          </h1>

          <p className="text-base text-muted-foreground leading-relaxed">
            PriceRadar is built around an asynchronous, multi-service pipeline that separates fast web interactions from heavy headless web extraction and scheduled monitoring.
          </p>
        </div>

        {/* Architecture Flowchart Diagram */}
        <section id="architecture" className="rounded-3xl border border-border/70 bg-card/80 p-6 sm:p-8 shadow-sm backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">Asynchronous Data Flow</h2>
              <p className="text-xs text-muted-foreground">
                How jobs transition from client interaction to PostgreSQL, BullMQ, Workers, and Email.
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Decoupled Pipeline
            </span>
          </div>

          <div className="space-y-4 font-mono text-xs text-muted-foreground bg-muted/30 p-5 rounded-2xl border border-border/50 overflow-x-auto">
            <div className="min-w-[620px] space-y-3 leading-relaxed">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <span className="rounded bg-primary/20 text-primary px-2 py-0.5">1. CLIENT</span>
                <span>User submits URL</span>
                <span className="text-muted-foreground">→ Server Action validates & normalizes URL</span>
              </div>
              <div className="text-muted-foreground pl-6">│</div>
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <span className="rounded bg-sky-500/20 text-sky-600 dark:text-sky-400 px-2 py-0.5">2. POSTGRESQL</span>
                <span>Product record inserted with status = &apos;PENDING&apos;</span>
                <span className="text-muted-foreground">(Immediate &lt;50ms response to UI)</span>
              </div>
              <div className="text-muted-foreground pl-6">│</div>
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <span className="rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 px-2 py-0.5">3. BULLMQ + REDIS</span>
                <span>Job enqueued to &apos;price-checks&apos; with exponential backoff & rate limiter</span>
              </div>
              <div className="text-muted-foreground pl-6">│</div>
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <span className="rounded bg-purple-500/20 text-purple-600 dark:text-purple-400 px-2 py-0.5">4. BACKGROUND WORKER</span>
                <span>Pulls job (concurrency: 5) → calls Firecrawl API with anti-bot bypass</span>
              </div>
              <div className="text-muted-foreground pl-6">│</div>
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <span className="rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5">5. STATE & HISTORY</span>
                <span>Product status → &apos;ACTIVE&apos;, logs timestamped snapshot in price_history</span>
              </div>
              <div className="text-muted-foreground pl-6">│</div>
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <span className="rounded bg-primary/20 text-primary px-2 py-0.5">6. TARGET ALERT</span>
                <span>If newPrice &lt;= targetPrice on fresh crossing → Resend delivers email alert</span>
              </div>
            </div>
          </div>
        </section>

        {/* 12-Step Lifecycle Breakdown */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground">The 12-Step Lifecycle of a Price Check</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Every tracking check follows a strictly defined, idempotent execution path.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                step: "01",
                title: "URL Normalization",
                desc: "Strips marketing tracking parameters (utm_*, ref, fbclid) and standardizes store URLs (e.g. Amazon ASIN paths).",
                icon: GitBranch,
              },
              {
                step: "02",
                title: "Optimistic Persistence",
                desc: "Creates a PENDING record in PostgreSQL under Row Level Security and returns immediately to the browser.",
                icon: Database,
              },
              {
                step: "03",
                title: "BullMQ Job Enqueue",
                desc: "Enqueues a check job in Redis with deterministic deduplication keys and exponential backoff configuration.",
                icon: Layers,
              },
              {
                step: "04",
                title: "Worker Job Pulling",
                desc: "A dedicated long-running worker process consumes queued jobs with controlled concurrency (default 5).",
                icon: Server,
              },
              {
                step: "05",
                title: "Rate Limiting",
                desc: "BullMQ limits dispatch rate (10 reqs/sec) to prevent upstream store bans and API quota exhaustion.",
                icon: Zap,
              },
              {
                step: "06",
                title: "Headless AI Scraping",
                desc: "Firecrawl executes headless Chromium rendering, anti-bot bypass, and structured schema extraction.",
                icon: Terminal,
              },
              {
                step: "07",
                title: "Error Classification",
                desc: "Differentiates retryable network glitches (retried 3x) from unrecoverable 404s (fails fast without retry waste).",
                icon: RefreshCw,
              },
              {
                step: "08",
                title: "Snapshot Recording",
                desc: "Appends timestamped price points to price_history on every scheduled check for continuous chart analytics.",
                icon: CheckCircle2,
              },
              {
                step: "09",
                title: "PostgreSQL State Update",
                desc: "Updates authoritative current_price, currency, title, and status = 'ACTIVE' in PostgreSQL.",
                icon: Database,
              },
              {
                step: "10",
                title: "Target-Crossing Evaluation",
                desc: "Evaluates whether current price crossed below user target. Avoids repeated daily spam if price stays below target.",
                icon: ShieldCheck,
              },
              {
                step: "11",
                title: "Alert Deduplication",
                desc: "Stores last_alerted_price and re-arms automatically when product price rises back above the configured target.",
                icon: Bell,
              },
              {
                step: "12",
                title: "Resend Notification",
                desc: "Dispatches a responsive transactional email with price drop delta, savings calculation, and store CTA.",
                icon: Mail,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="rounded-2xl border border-border/70 bg-card/75 p-5 shadow-sm space-y-3 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-primary">{item.step}</span>
                    <div className="rounded-xl bg-primary/10 p-2 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Why This Architecture Section */}
        <section className="rounded-3xl border border-border/70 bg-card/80 p-8 shadow-sm space-y-8 backdrop-blur-xl">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-foreground">Why Was This Architecture Chosen?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Design trade-offs and engineering decisions that ensure reliability at scale.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 rounded-2xl border border-border/60 bg-background/60 p-5">
              <h3 className="text-sm font-bold text-foreground">Why not scrape directly inside the web request?</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Headless browser rendering takes 5 to 20+ seconds. Blocking the HTTP thread creates poor UX, violates serverless timeouts, and makes the UI feel frozen.
              </p>
            </div>

            <div className="space-y-2 rounded-2xl border border-border/60 bg-background/60 p-5">
              <h3 className="text-sm font-bold text-foreground">Why PostgreSQL instead of storing products in Redis?</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                PostgreSQL is the single source of truth with relational integrity and Row Level Security. Redis and BullMQ serve strictly as disposable execution infrastructure.
              </p>
            </div>

            <div className="space-y-2 rounded-2xl border border-border/60 bg-background/60 p-5">
              <h3 className="text-sm font-bold text-foreground">Why a standalone background worker?</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Next.js serverless functions are ephemeral and terminate immediately. A dedicated worker can maintain persistent queue listeners and scale concurrency independently.
              </p>
            </div>

            <div className="space-y-2 rounded-2xl border border-border/60 bg-background/60 p-5">
              <h3 className="text-sm font-bold text-foreground">How does target alert deduplication work?</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A state machine tracks target crossings. An alert fires once on the drop, suppresses duplicate alerts while the price stays low, and re-arms when the price climbs above target.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/60 pt-6">
            <div>
              <p className="text-xs font-semibold text-foreground">Ready to start monitoring prices?</p>
              <p className="text-xs text-muted-foreground">Add your first product to PriceRadar in seconds.</p>
            </div>

            <Button asChild size="lg" className="rounded-xl px-6 font-semibold shadow-md shadow-primary/20 text-xs">
              <Link href="/dashboard">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
