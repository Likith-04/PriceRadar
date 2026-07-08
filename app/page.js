import { createClient } from "@/utils/supabase/server";
import { getProducts } from "./actions";
import AddProductForm from "@/components/AddProductForm";
import ProductCard from "@/components/ProductCard";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Clock3,
  Link2,
  Shield,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import AuthButton from "@/components/AuthButton";
import ThemeToggle from "@/components/theme-toggle";
import Image from "next/image";

const TRACKING_CHIPS = [
  "Automated daily checks",
  "Email alerts on price drops",
  "Price history when the number changes",
];

const WATCHLIST_PREVIEW = [
  {
    name: "Noise-cancelling headphones",
    note: "Target range is getting close",
    price: "$279",
    delta: "-$20",
    status: "Drop detected",
    tone: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  {
    name: "27-inch 4K monitor",
    note: "Still stable after the last check",
    price: "$349",
    delta: "No change",
    status: "Watching",
    tone: "text-sky-600 dark:text-sky-400",
    dot: "bg-sky-500",
  },
  {
    name: "Espresso machine",
    note: "History says this one drops often",
    price: "$519",
    delta: "-$11",
    status: "Worth tracking",
    tone: "text-primary",
    dot: "bg-primary",
  },
];

const FEATURES = [
  {
    icon: Link2,
    eyebrow: "Paste once",
    title: "Add the product link and stop checking it manually.",
    description:
      "Drop in a product URL and PriceRadar keeps revisiting the page, refreshing the latest price, name, and image for your watchlist.",
    detail: "One URL in, a clean tracked product out.",
  },
  {
    icon: BarChart3,
    eyebrow: "See the curve",
    title: "Spot the pattern behind the price, not just the latest number.",
    description:
      "Every meaningful price change becomes history, so you can tell the difference between a real drop and a forgettable fluctuation.",
    detail: "Great for catching fake urgency and better buying windows.",
  },
  {
    icon: Bell,
    eyebrow: "Get the nudge",
    title: "Know when the price actually moves in your favor.",
    description:
      "When a tracked item drops, PriceRadar can send the alert so you hear about the change without living in your bookmarks.",
    detail: "Email alerts only matter when they arrive with context.",
  },
  {
    icon: Shield,
    eyebrow: "Built for store pages",
    title: "Works better on the kind of product pages that are usually annoying.",
    description:
      "Dynamic storefronts, changing product images, and modern ecommerce layouts are handled in the background so the watchlist stays useful.",
    detail: "Less babysitting, more signal.",
  },
];

const PREVIEW_BARS = [42, 70, 54, 82, 58, 76, 50];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const products = user ? await getProducts() : [];

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-8rem] top-16 h-72 w-72 rounded-full bg-primary/14 blur-3xl" />
        <div className="absolute right-[-10rem] top-0 h-96 w-96 rounded-full bg-chart-2/16 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-1/3 h-80 w-80 rounded-full bg-chart-3/12 blur-3xl" />
        <div
          className="absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(circle at center, black 28%, transparent 78%)",
          }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Image
              src="/PriceRadarbnbg.png"
              alt="PriceRadar Logo"
              width={572}
              height={193}
              className="h-10 w-auto dark:hidden"
              priority
            />
            <Image
              src="/PriceRadarwnbg.png"
              alt="PriceRadar Logo"
              width={572}
              height={193}
              className="hidden h-10 w-auto dark:block"
              priority
            />
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AuthButton user={user} />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-4 pb-20 pt-14 sm:pt-20">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-4 py-2 text-sm font-medium text-foreground shadow-sm backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              Smarter price tracking for people who hate fake discounts
            </div>

            <h1 className="mt-6 text-5xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Track the price.
              <br />
              Catch the dip.
              <br />
              Buy when it finally makes sense.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              PriceRadar checks product pages automatically, stores each
              meaningful price move, and tells you when a tracked item drops so
              you can stop refreshing the same tab over and over.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {TRACKING_CHIPS.map((chip) => (
                <span
                  key={chip}
                  className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/75 px-4 py-2 text-sm text-muted-foreground shadow-sm backdrop-blur-sm"
                >
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  {chip}
                </span>
              ))}
            </div>

            <div className="mt-10">
              <AddProductForm user={user} />
            </div>
          </div>

          <div className="relative lg:pl-6">
            <div className="absolute -inset-5 rounded-[2rem] bg-primary/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/82 p-6 shadow-xl backdrop-blur-xl">
              <div className="absolute right-6 top-6 h-24 w-24 rounded-full bg-chart-2/12 blur-2xl" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                    Watchlist preview
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-foreground">
                    Your buying radar, organized.
                  </h2>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                    See what moved, what stayed quiet, and which tracked item is
                    finally becoming worth opening.
                  </p>
                </div>

                <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-foreground">
                  <Clock3 className="h-3.5 w-3.5 text-primary" />
                  Daily checks
                </span>
              </div>

              <div className="relative mt-6 space-y-3">
                {WATCHLIST_PREVIEW.map((item) => (
                  <div
                    key={item.name}
                    className="group rounded-2xl border border-border/70 bg-background/75 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${item.dot}`} />
                          <p className="font-medium text-foreground">
                            {item.name}
                          </p>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.note}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-base font-semibold text-foreground">
                          {item.price}
                        </p>
                        <p className={`text-sm font-medium ${item.tone}`}>
                          {item.delta}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-2 text-muted-foreground">
                        <Link2 className="h-3.5 w-3.5" />
                        Latest snapshot saved
                      </span>
                      <span className={`font-medium ${item.tone}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative mt-6 rounded-[1.5rem] border border-border/70 bg-background/72 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                      Price movement
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-foreground">
                      Follow the pattern, not just today&apos;s number.
                    </h3>
                  </div>
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-6 flex items-end gap-2">
                  {PREVIEW_BARS.map((bar, index) => (
                    <div
                      key={index}
                      className="flex-1 rounded-t-full bg-linear-to-t from-primary to-chart-2/70 transition-transform duration-300 hover:scale-y-105"
                      style={{ height: `${bar}%`, minHeight: "38px" }}
                    />
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Every change builds your history.</span>
                  <span className="inline-flex items-center gap-1 text-foreground">
                    Open the full chart
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      {user && products.length > 0 && (
        <section className="relative z-10 mx-auto max-w-7xl px-4 pb-24">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                Your watchlist
              </p>
              <h3 className="mt-2 text-3xl font-semibold text-foreground">
                Active price signals
              </h3>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                These tracked products update from their source pages and build
                a cleaner history each time the price changes.
              </p>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-card/80 px-4 py-2 text-sm text-muted-foreground shadow-sm backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-primary" />
              {products.length}{" "}
              {products.length === 1 ? "active product" : "active products"}
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2 items-start">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {user && products.length === 0 && (
        <section className="relative z-10 px-4 pb-24">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-border/70 bg-card/78 p-8 shadow-sm backdrop-blur-sm sm:p-10">
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <TrendingDown className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-2xl font-semibold text-foreground sm:text-3xl">
                  Your watchlist is ready for its first signal.
                </h3>
                <p className="mt-3 text-base leading-7 text-muted-foreground">
                  Paste any product URL above and PriceRadar will save the
                  latest price now, then keep logging future changes and alert
                  you when the number drops.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-border/70 bg-background/75 p-5 text-sm text-muted-foreground shadow-sm">
                <p className="font-medium text-foreground">What happens next</p>
                <p className="mt-3">1. Add a product link.</p>
                <p className="mt-2">2. We save the current price snapshot.</p>
                <p className="mt-2">3. Future drops turn into alerts.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="relative z-10 px-4 pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Why it feels better
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              A cleaner way to stay close to the next real price drop.
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              PriceRadar is built around the part that matters: helping you know
              whether a deal is real, recent, and worth acting on without
              building your own spreadsheet or refresh routine.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {FEATURES.map(({ icon: Icon, eyebrow, title, description, detail }, index) => (
              <article
                key={title}
                className="group relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-card/78 p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-linear-to-br from-primary/6 via-transparent to-chart-2/8 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative flex h-full flex-col">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                        0{index + 1} · {eyebrow}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-primary/10 p-3 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <h3 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">
                    {title}
                  </h3>
                  <p className="mt-3 text-base leading-7 text-muted-foreground">
                    {description}
                  </p>

                  <div className="mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-background/78 px-4 py-2 text-sm text-foreground shadow-sm">
                    {detail}
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
