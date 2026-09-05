# PriceRadar - Asynchronous Smart Product Price & Target Alert Tracker

PriceRadar is an asynchronous, high-reliability price tracking system built with **Next.js 16**, **Redis**, **BullMQ**, **Firecrawl AI Extraction**, **Supabase PostgreSQL**, and **Resend**.

---

## 🏗️ Architecture Overview

PriceRadar is designed around a decoupled, asynchronous queue architecture:

```
                BROWSER (User Actions)
                   │
                   ▼
             NEXT.JS APP (Server Actions & API Routes)
                   │
      ┌────────────┴─────────────┐
      │                          │
      ▼                          ▼
  Supabase                  Redis / BullMQ
  PostgreSQL                (Queue: 'price-checks')
  (Products, History,            │
   Alerts, Auth RLS)             │
      │                          │
      │                     Price Check Jobs
      │                     { productId, reason }
      │                          │
      │                          ▼
      │                 BACKGROUND WORKER
      │                 (Concurrency: 5, Rate-Limited)
      │                          │
      │                    ┌─────┴────────┐
      │                    ▼              ▼
      │               Firecrawl        Resend
      │               (Scraping)     (Alert Emails)
      │                    │
      └────────────────────┘
                   │
                   ▼
          Price History Snapshots
                   │
                   ▼
       Target-Crossing Alert Logic
```

### Core Architecture Principles
1. **PostgreSQL is the single source of truth**: Authoritative product, history, and alert states reside in PostgreSQL. Redis and BullMQ serve as execution infrastructure.
2. **Asynchronous Scraping**: Expensive Firecrawl scraping is decoupled from user-facing requests. When adding a product, the app creates a `PENDING` record and returns in milliseconds while the BullMQ worker executes scraping in the background.
3. **Non-Blocking Scheduled Monitoring**: The `/api/cron/check-prices` endpoint enqueues batch jobs in BullMQ and finishes in <100ms, eliminating serverless function timeouts.
4. **Target-Crossing State Machine**: Alerts trigger only when `newPrice <= target_price` on fresh crossings. Duplicate emails are suppressed while price remains at or below target, and automatically re-armed when the price rises back above target.
5. **Continuous Price Snapshots**: The worker logs periodic snapshots to `price_history` on every scheduled check, allowing Recharts to render smooth historical trends even when prices remain stable.
6. **URL Normalization**: Strips marketing & tracking parameters (`utm_*`, `ref`, `fbclid`, etc.) and canonicalizes store URLs (e.g. Amazon ASIN paths).

---

## 🛠️ Tech Stack

- **Next.js 16 (App Router)** - React 19 web frontend and Server Actions
- **Redis (Upstash / Local Redis)** - Distributed queue storage & rate limiter
- **BullMQ** - Job queue with exponential backoff, rate limiting, and concurrency control
- **Firecrawl API** - Anti-bot bypassing, headless JS rendering, and AI structured data extraction
- **Supabase** - Managed PostgreSQL, Google OAuth Auth (PKCE), and Row Level Security (RLS)
- **Resend** - Transactional HTML email alerts
- **Recharts** - Interactive price trend charting with target price reference lines
- **Tailwind CSS v4 & Lucide React** - UI design with dark/light mode support
- **Vitest** - Unit and integration testing

---

## 📋 Prerequisites

- **Node.js 18+**
- A **Redis** instance ([Upstash Redis](https://upstash.com) or local `redis-server`)
- A [Supabase](https://supabase.com) account
- A [Firecrawl](https://firecrawl.dev) API key
- A [Resend](https://resend.com) API key
- Google OAuth credentials configured in Supabase

---

## ⚙️ Environment Variables

Create `.env.local` in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Redis (Supports Upstash TLS or local Redis)
REDIS_URL=redis://127.0.0.1:6379
# Alternatively:
# REDIS_HOST=127.0.0.1
# REDIS_PORT=6379
# REDIS_PASSWORD=
# REDIS_TLS=false

# Worker Configuration
WORKER_CONCURRENCY=5
FIRECRAWL_RATE_LIMIT_MAX=10
FIRECRAWL_RATE_LIMIT_DURATION_MS=1000

# Firecrawl API
FIRECRAWL_API_KEY=fc-your-api-key

# Resend Email
RESEND_API_KEY=re_your-api-key
RESEND_FROM_EMAIL=onboarding@resend.dev

# Cron Authentication
CRON_SECRET=your-random-32-byte-hex-secret

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🗄️ Database Setup & Migrations

Execute the SQL files located in `supabase/migrations/` inside your Supabase SQL Editor in numerical order:

1. **`001_schema.sql`**: Creates `products` and `price_history` tables with correct RLS policies for `SELECT`, `INSERT`, `UPDATE`, `DELETE`.
2. **`002_setup_cron.sql`**: Configures `pg_cron` and `pg_net` to call `/api/cron/check-prices`.
3. **`003_upgrade_v2.sql`**: Adds `target_price`, `status`, `error_message`, `last_alerted_price`, `last_alerted_at` columns and the `price_alerts` audit table.

---

### 🐳 Running with Docker (Recommended)

Run the entire full-stack system (Next.js App + Redis + BullMQ Background Worker) with a single command:

```bash
docker compose up --build
```

To run in detached background mode:
```bash
docker compose up -d
```

To view live logs across all containers:
```bash
docker compose logs -f
```

To stop all containers:
```bash
docker compose down
```

---

### 💻 Running Locally without Docker

#### 1. Install Dependencies
```bash
npm install
```

#### 2. Start Local Redis (if not using Upstash)
```bash
redis-server
```

#### 3. Start Background Worker
In a dedicated terminal:
```bash
npm run worker
```

#### 4. Start Next.js Web Application
In another terminal:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Deployment

### Deploy to Vercel

1. **Install Vercel CLI** (optional)

   ```bash
   npm install -g vercel
   ```

2. **Deploy**

   ```bash
   vercel --prod
   ```

   Or connect your GitHub repository to Vercel for automatic deployments.

3. **Add Environment Variables in Vercel**

   Go to your project settings and add all variables from `.env.local`:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` ⚠️
   - `FIRECRAWL_API_KEY`
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
   - `CRON_SECRET`
   - `NEXT_PUBLIC_APP_URL` (set to your Vercel URL)

4. **Update Supabase Cron Function**

   After deployment, update the cron function with your production URL:

   ```sql
   CREATE OR REPLACE FUNCTION trigger_price_check()
   RETURNS void
   LANGUAGE plpgsql
   SECURITY DEFINER
   AS $$
   BEGIN
     PERFORM net.http_post(
       url := 'https://your-actual-vercel-url.vercel.app/api/cron/check-prices',
       headers := jsonb_build_object(
         'Content-Type', 'application/json',
         'Authorization', 'Bearer your_actual_cron_secret'
       )
     );
   END;
   $$;
   ```

5. **Update Google OAuth Redirect URI**

   Add your Vercel domain to Google Cloud Console authorized redirect URIs.

## 🔍 How It Works

### User Flow

1. **User adds product** - Paste any e-commerce URL on the homepage
2. **Firecrawl scrapes** - Instantly extracts product name, price, currency, and image
3. **Data stored** - Product saved to Supabase with Row Level Security
4. **View tracking** - See current price and interactive price history chart

### Automated Price Checking

1. **Supabase pg_cron** - Runs daily at 9 AM UTC
2. **Triggers API endpoint** - Makes secure POST request to `/api/cron/check-prices`
3. **Firecrawl scrapes all products** - Updates prices for all tracked products
4. **Updates database** - Saves new prices and adds to history if changed
5. **Sends email alerts** - Notifies users via Resend when prices drop

### Why Firecrawl?

Firecrawl solves the hard problems of web scraping:

- ✅ **JavaScript Rendering** - Handles dynamic content loaded via JS
- ✅ **Anti-bot Bypass** - Built-in mechanisms to avoid detection
- ✅ **Rotating Proxies** - Prevents IP blocking
- ✅ **AI-Powered Extraction** - Uses prompts to extract structured data
- ✅ **Multi-site Support** - Same code works across different e-commerce platforms
- ✅ **Fast & Reliable** - Built for production use

No need to maintain brittle, site-specific scrapers!

## 📁 Project Structure

```
dealdrop/
├── app/
│   ├── page.js                         # Landing page with product input
│   ├── actions.js                      # Server actions for DB operations
│   ├── auth/
│   │   └── callback/
│   │       └── route.js                # OAuth callback handler
│   └── api/
│       └── cron/
│           └── check-prices/
│               └── route.js            # Cron endpoint for price checks
├── components/
│   ├── ui/                             # shadcn/ui components
│   ├── AddProductForm.js               # Product URL input with auth modal
│   ├── ProductCard.js                  # Product display with chart toggle
│   ├── PriceChart.js                   # Recharts price history
│   └── AuthModal.js                    # Google sign-in modal
├── lib/
│   ├── firecrawl.js                    # Firecrawl API integration
│   ├── email.js                        # Resend email templates
│   └── utils.js                        # Utility functions
├── utils/
│   └── supabase/
│       ├── client.js                   # Browser Supabase client
│       ├── server.js                   # Server Supabase client
│       └── middleware.js               # Session refresh middleware
├── supabase/
│   └── migrations/
│       ├── 001_schema.sql              # Database tables & RLS
│       └── 002_setup_cron.sql          # Cron job setup
├── proxy.ts                            # Next.js 15 proxy (replaces middleware)
└── .env.local                          # Environment variables
```

## 🧪 Testing

### Test with cURL

```bash
curl -X POST https://your-app.vercel.app/api/cron/check-prices \
  -H "Authorization: Bearer your_cron_secret" \
  -H "Content-Type: application/json"
```

### Verify Cron Job

Check if cron is scheduled:

```sql
SELECT * FROM cron.job;
```

View cron run history:

```sql
SELECT * FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 10;
```

## 🎨 Customization

### Change Cron Schedule

Edit the cron expression in `002_setup_cron.sql`:

```sql
-- Daily at 9 AM UTC
'0 9 * * *'

-- Every 6 hours
'0 */6 * * *'

-- Daily at 9 AM and 9 PM
'0 9,21 * * *'

-- Every Monday at 9 AM
'0 9 * * 1'
```

### Email Template

Customize the email template in `lib/email.js` - modify HTML, styling, or content.

### Add More Product Data

Update the Firecrawl prompt in `lib/firecrawl.js` to extract additional fields:

```javascript
prompt: "Extract product name, price, currency, image URL, brand, rating, and availability";
```

## 🐛 Troubleshooting

### Products not found in cron job

- Make sure `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel
- Service role bypasses RLS to access all products

### Firecrawl extraction fails

- Some sites may be difficult to scrape
- Check Firecrawl dashboard for error logs
- Try adjusting the extraction prompt

### Email alerts not sending

- Verify `RESEND_API_KEY` is correct
- Check Resend dashboard for delivery logs
- Ensure sender email is verified (for custom domains)

### Cron job not running

- Check cron job exists: `SELECT * FROM cron.job;`
- Verify the function URL and Authorization header are correct
- Check Supabase logs for errors

---

## 🧪 Testing

Run the automated test suite with Vitest:

```bash
npm run test
```

Tests cover:
- Target price validation (positive numbers, precision, null handling, boundaries)
- URL normalization & tracking parameter removal (Amazon ASIN paths, Walmart, general tracking query stripping)
- Target-crossing alert state machine (initial crossings, duplicate suppression, re-arming on price rises)
- Redis and BullMQ connection options
- Worker snapshot and deletion safety workflows
- Cron authorization verification

---

## 📦 Production Deployment

### 1. Web Application (Vercel)
- Connect repository to Vercel.
- Configure all environment variables in Vercel project settings.
- Ensure `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, `REDIS_URL`, `FIRECRAWL_API_KEY`, and `RESEND_API_KEY` are provided.

### 2. Background Worker (Railway / Render / Fly.io / VPS)
Because Next.js serverless functions are ephemeral and terminate after HTTP responses, the BullMQ worker runs as a dedicated long-running process:
- **Build command**: `npm install`
- **Start command**: `npm run worker`
- **Environment variables**: Same as web application.

### 3. Automated Cron Trigger
- Set up Supabase `pg_cron` (via `supabase/migrations/002_setup_cron.sql`) or use an external scheduler (GitHub Actions / Upstash QStash / Cron-Job.org) to trigger `POST /api/cron/check-prices` with `Authorization: Bearer <CRON_SECRET>`.

---

## 📄 License
MIT License
