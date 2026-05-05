# SubTrack — Subscription Reselling Management SaaS

A full-stack Next.js SaaS for managing, tracking, and operating a subscription reselling business.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend + Backend | Next.js 15 (App Router) |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth.js v5 |
| Email | Resend + React Email |
| UI | Tailwind CSS + Radix UI |
| Data Fetching | TanStack Query |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Hosting | Vercel |

---

## Features

- **Client Management** — Store and manage customer info, view full history per client
- **Subscription Tracking** — Track purchase date, duration, expiry, service type with auto-calculation
- **One-Click Renewal** — Renew subscriptions with smart date extension (extends from current expiry if still active)
- **Smart Alerts** — Automated email notifications at 3 days, 1 day, and day-of expiry via Vercel Cron
- **Dashboard** — KPI cards, revenue charts, category breakdown, expiring-soon queue
- **Payment Tracking** — Paid/Due/Partial status, bKash/Nagad/Cash/Bank method support
- **Service Catalog** — Organized by AI / Streaming / Editing / Productivity categories
- **Audit History** — Every renewal, cancellation tracked with timestamps
- **Multi-tenant Ready** — Full Organization isolation from day one

---

## Quick Start

### 1. Clone and install

```bash
git clone <your-repo>
cd subtrack
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in:
- `DATABASE_URL` — your PostgreSQL connection string
- `NEXTAUTH_SECRET` — generate with: `openssl rand -base64 32`
- `RESEND_API_KEY` — from resend.com
- `EMAIL_FROM` — your verified sender email

### 3. Set up the database

```bash
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to database
npm run db:seed        # Seed with demo data
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Demo credentials:** `admin@example.com` / `admin123`

---

## Project Structure

```
subtrack/
├── app/
│   ├── (auth)/login/           # Login page
│   ├── (dashboard)/            # Protected dashboard layout
│   │   ├── dashboard/          # KPI + charts
│   │   ├── clients/            # Client list + detail
│   │   ├── subscriptions/      # Sub list + detail
│   │   ├── renewals/           # Expiry queue
│   │   ├── payments/           # Payment ledger
│   │   └── settings/           # Service catalog + org
│   └── api/                    # Route handlers
│       ├── auth/               # NextAuth
│       ├── clients/            # CRUD
│       ├── subscriptions/      # CRUD + renew
│       ├── payments/           # CRUD + mark-paid
│       ├── services/           # Catalog CRUD
│       ├── analytics/          # Stats, revenue, categories
│       └── cron/check-expiry/  # Daily alert job
├── components/
│   ├── dashboard/              # KPI, charts, tables
│   ├── clients/                # ClientFormModal
│   ├── subscriptions/          # SubscriptionFormModal, RenewModal
│   ├── shared/                 # Sidebar, Topbar
│   └── ui/                     # Toaster
├── services/                   # Business logic
│   ├── subscription.service.ts
│   ├── analytics.service.ts
│   ├── notification.service.ts
│   └── payment.service.ts
├── emails/                     # React Email templates
│   ├── ExpiryAlert.tsx
│   └── RenewalConfirm.tsx
├── lib/
│   ├── prisma.ts               # DB client singleton
│   ├── auth.ts                 # NextAuth config
│   ├── utils.ts                # Helpers
│   └── resend.ts               # Email sender
├── types/index.ts              # TypeScript types
├── prisma/
│   ├── schema.prisma           # DB schema
│   └── seed.ts                 # Demo data
└── vercel.json                 # Cron config
```

---

## Database Schema (subtrack_db)

Key tables:
- `organizations` — Multi-tenant isolation
- `users` — Admins with roles (ADMIN/MANAGER/VIEWER)
- `clients` — Your customers
- `services` — Service catalog (ChatGPT, Netflix, etc.)
- `subscriptions` — Core entity with lifecycle states
- `subscription_history` — Full audit log
- `payments` — Revenue ledger
- `alert_logs` — Dedup email sends

---

## Deployment on Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set env vars in Vercel dashboard or:
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add RESEND_API_KEY
```

The `vercel.json` cron runs `/api/cron/check-expiry` daily at 8am UTC.
Secure it by setting `CRON_SECRET` in your env vars.

---

## Roadmap (Next Steps)

- [ ] Stripe billing to charge resellers (SaaS model)
- [ ] Multi-org switcher UI
- [ ] WhatsApp alerts via Twilio
- [ ] CSV import/export
- [ ] Mobile app (React Native)
- [ ] Client self-service portal
- [ ] Bulk renewal actions
- [ ] Role-based access (Manager, Viewer)

---

## License

MIT — build your business on it.
